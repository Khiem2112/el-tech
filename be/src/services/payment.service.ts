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
        if (charge.chargeType === 'AMENDMENT') {
          await tx.payment.update({
            where: { id: charge.paymentId },
            data: { totalReceived: { increment: received } },
          });
          if (charge.orderAmendmentId) {
            await tx.orderAmendment.update({
              where: { id: charge.orderAmendmentId },
              data: { status: 'PAID' },
            });
          }
          await tx.orderStatusHistory.create({
            data: {
              orderId: charge.payment.orderId,
              previousStatus: charge.payment.order.status,
              nextStatus: charge.payment.order.status,
              reason: 'AMENDMENT_FEE_PAID',
              actorType: ActorType.PAYMENT_PROVIDER,
              idempotencyKey: `payment:${input.providerTransactionId}`,
            },
          });
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
