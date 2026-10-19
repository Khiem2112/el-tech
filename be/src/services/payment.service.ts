import { ActorType, Prisma } from '@prisma/client';
import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

type CallbackInput = { readonly providerReference: string; readonly providerTransactionId: string; readonly receivedAmount: string; readonly occurredAt: Date; readonly rawPayload: Prisma.InputJsonValue };

export const paymentService = {
  async processCallback(input: CallbackInput): Promise<{ result: string; orderCode: string }> {
    const duplicate = await prisma.paymentTransaction.findUnique({ where: { providerTransactionId: input.providerTransactionId }, include: { paymentCharge: { include: { payment: { include: { order: true } } } } } });
    if (duplicate) return { result: duplicate.normalizedResult, orderCode: duplicate.paymentCharge.payment.order.code };
    return prisma.$transaction(async (tx) => {
      const charge = await tx.paymentCharge.findFirst({ where: { providerReference: input.providerReference, isActive: true }, include: { payment: { include: { order: true } } } });
      if (!charge) throw new DomainError('PAYMENT_REFERENCE_UNKNOWN', { messageKey: 'error.paymentReferenceUnknown', status: 404 });
      if (charge.status !== 'PENDING') throw new DomainError('PAYMENT_CHARGE_NOT_PENDING', { messageKey: 'error.paymentChargeNotPending', status: 409 });
      const received = new Prisma.Decimal(input.receivedAmount);
      const exact = received.equals(charge.expectedAmount);
      const result = exact ? 'EXACT_MATCH' : received.lessThan(charge.expectedAmount) ? 'UNDERPAID' : 'OVERPAID';
      await tx.paymentTransaction.create({ data: { paymentChargeId: charge.id, providerTransactionId: input.providerTransactionId, receivedAmount: received, normalizedResult: result, occurredAt: input.occurredAt, rawPayload: input.rawPayload } });
      if (exact) {
        await tx.paymentCharge.update({ where: { id: charge.id }, data: { status: 'PAID' } });
        const isDeposit = charge.chargeType === 'CUSTOM_BUILD_DEPOSIT';
        if (isDeposit) {
          await tx.payment.update({
            where: { id: charge.paymentId },
            data: { state: 'PARTIALLY_PAID', depositDisposition: 'HELD', totalReceived: { increment: received } },
          });

          const orderWithLines = await tx.order.findUniqueOrThrow({
            where: { id: charge.payment.orderId },
            include: { lines: { where: { lineType: 'SKU', skuId: { not: null } } } },
          });
          const quantities = new Map<number, number>();
          for (const line of orderWithLines.lines) {
            if (line.skuId) quantities.set(line.skuId, (quantities.get(line.skuId) ?? 0) + line.quantity);
          }
          const stocks = await tx.stockQuant.findMany({
            where: { branchId: orderWithLines.fulfillmentBranchId, skuId: { in: [...quantities.keys()] }, isActive: true },
          });
          const canReserve = [...quantities].every(([skuId, quantity]) => {
            const stock = stocks.find((entry) => entry.skuId === skuId);
            return Boolean(stock && stock.onHand - stock.reserved - stock.quarantineDamaged >= quantity);
          });

          if (canReserve) {
            const move = await tx.stockMove.create({
              data: {
                code: `RES-${orderWithLines.code}`,
                sourceBranchId: orderWithLines.fulfillmentBranchId,
                orderId: orderWithLines.id,
                idempotencyKey: `reserve:${orderWithLines.id}`,
                moveType: 'ORDER_ISSUE',
                status: 'RESERVED',
                reservedAt: new Date(),
              },
            });
            for (const [skuId, quantity] of quantities) {
              const stock = stocks.find((entry) => entry.skuId === skuId)!;
              await tx.stockQuant.updateMany({
                where: { id: stock.id, version: stock.version },
                data: { reserved: { increment: quantity }, version: { increment: 1 } },
              });
              const after = await tx.stockQuant.findUniqueOrThrow({ where: { id: stock.id } });
              const moveLine = await tx.stockMoveLine.create({
                data: { stockMoveId: move.id, skuId, quantity, unitCost: stock.weightedAverageCost },
              });
              await tx.stockLedgerEntry.create({
                data: {
                  stockQuantId: stock.id,
                  stockMoveLineId: moveLine.id,
                  entryType: 'RESERVE',
                  deltaReserved: quantity,
                  onHandAfter: after.onHand,
                  reservedAfter: after.reserved,
                  quarantineAfter: after.quarantineDamaged,
                  actorType: ActorType.PAYMENT_PROVIDER,
                },
              });
            }
            await tx.order.update({ where: { id: orderWithLines.id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
            await tx.orderStatusHistory.create({
              data: {
                orderId: orderWithLines.id,
                previousStatus: charge.payment.order.status,
                nextStatus: 'CONFIRMED',
                reason: 'CUSTOM_BUILD_DEPOSIT_PAID',
                actorType: ActorType.PAYMENT_PROVIDER,
                idempotencyKey: `payment:${input.providerTransactionId}`,
              },
            });
          } else {
            await tx.order.update({ where: { id: orderWithLines.id }, data: { status: 'ON_HOLD', holdReason: 'PAID_BUT_OUT_OF_STOCK' } });
            await tx.orderStatusHistory.create({
              data: {
                orderId: orderWithLines.id,
                previousStatus: charge.payment.order.status,
                nextStatus: 'ON_HOLD',
                reason: 'PAID_BUT_OUT_OF_STOCK',
                actorType: ActorType.PAYMENT_PROVIDER,
                idempotencyKey: `payment:${input.providerTransactionId}`,
              },
            });
          }
        } else {
          await tx.payment.update({ where: { id: charge.paymentId }, data: { state: 'PAID', totalReceived: { increment: received } } });
          await tx.order.update({ where: { id: charge.payment.orderId }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
          await tx.orderStatusHistory.create({ data: { orderId: charge.payment.orderId, previousStatus: charge.payment.order.status, nextStatus: 'CONFIRMED', reason: 'QR_PAYMENT_SUCCEEDED', actorType: ActorType.PAYMENT_PROVIDER, idempotencyKey: `payment:${input.providerTransactionId}` } });
        }
      } else {
        await tx.paymentCharge.update({ where: { id: charge.id }, data: { status: 'REVIEW', reviewDeadlineAt: new Date(Date.now() + 24 * 60 * 60_000) } });
        await tx.payment.update({ where: { id: charge.paymentId }, data: { totalReceived: { increment: received } } });
        await tx.order.update({ where: { id: charge.payment.orderId }, data: { status: 'ON_HOLD', holdReason: 'PAYMENT_REVIEW' } });
        await tx.orderStatusHistory.create({ data: { orderId: charge.payment.orderId, previousStatus: charge.payment.order.status, nextStatus: 'ON_HOLD', reason: 'PAYMENT_REVIEW', actorType: ActorType.PAYMENT_PROVIDER, idempotencyKey: `payment:${input.providerTransactionId}` } });
      }
      return { result, orderCode: charge.payment.order.code };
    });
  },
};
