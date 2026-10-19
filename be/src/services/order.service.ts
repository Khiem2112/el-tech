import { ActorType, PaymentMethod, Prisma } from '@prisma/client';
import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

type SubmitOrderInput = { readonly cartToken: string; readonly emailVerificationId: string; readonly phoneVerificationId: string; readonly receiverName: string; readonly receiverEmail: string; readonly receiverPhone: string; readonly fulfillmentMethod: 'PICKUP' | 'DELIVERY'; readonly branchId: number; readonly paymentMethod: 'QR' | 'COD'; readonly deliveryAddress?: string; readonly idempotencyKey: string };

const asVnd = (value: Prisma.Decimal): string => value.toFixed(0);
const orderCode = (): string => `ELT-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`;

export const orderService = {
  async submit(input: SubmitOrderInput): Promise<{ code: string; status: string; paymentState: string; paymentReference?: string; expectedAmount?: string }> {
    const existing = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { payment: { include: { charges: true } } } });
    if (existing) return { code: existing.code, status: existing.status, paymentState: existing.payment?.state ?? 'UNPAID', paymentReference: existing.payment?.charges[0]?.providerReference, expectedAmount: existing.payment?.charges[0] ? asVnd(existing.payment.charges[0].expectedAmount) : undefined };
    return prisma.$transaction(async (tx) => {
      const [emailVerification, phoneVerification] = await Promise.all([
        tx.verification.findFirst({ where: { id: input.emailVerificationId, purpose: 'CHECKOUT', contactType: 'EMAIL', identifier: input.receiverEmail.trim().toLowerCase(), consumedAt: { not: null } } }),
        tx.verification.findFirst({ where: { id: input.phoneVerificationId, purpose: 'CHECKOUT', contactType: 'PHONE', identifier: input.receiverPhone.trim().toLowerCase(), consumedAt: { not: null } } }),
      ]);
      if (!emailVerification || !phoneVerification) throw new DomainError('CONTACT_NOT_VERIFIED', { ruleId: 'CUS-002', messageKey: 'error.contactNotVerified', status: 409 });
      if (input.fulfillmentMethod === 'DELIVERY' && !input.deliveryAddress) throw new DomainError('DELIVERY_ADDRESS_REQUIRED', { messageKey: 'error.deliveryAddressRequired' });
      const cart = await tx.cart.findFirst({ where: { opaqueToken: input.cartToken, isActive: true }, include: { items: { where: { isActive: true }, include: { sku: { include: { productTemplate: true } } } } } });
      if (!cart || !cart.items.length || cart.items.some((item) => !item.sku)) throw new DomainError('CART_EMPTY', { messageKey: 'error.cartEmpty', status: 409 });
      const branch = await tx.branch.findFirst({ where: { id: input.branchId, isActive: true } });
      if (!branch) throw new DomainError('BRANCH_NOT_AVAILABLE', { messageKey: 'error.branchNotAvailable', status: 409 });
      const quantities = new Map<number, number>();
      for (const item of cart.items) quantities.set(item.skuId!, (quantities.get(item.skuId!) ?? 0) + item.quantity);
      const stocks = await tx.stockQuant.findMany({ where: { branchId: branch.id, skuId: { in: [...quantities.keys()] }, isActive: true } });
      if ([...quantities].some(([skuId, quantity]) => { const stock = stocks.find((entry) => entry.skuId === skuId); return !stock || stock.onHand - stock.reserved - stock.quarantineDamaged < quantity; })) throw new DomainError('INSUFFICIENT_STOCK', { ruleId: 'INV-004', messageKey: 'error.insufficientStock', status: 409 });
      const subtotal = cart.items.reduce((sum, item) => sum.add(item.sku!.sellingPrice.mul(item.quantity)), new Prisma.Decimal(0));
      const feeConfig = input.fulfillmentMethod === 'DELIVERY' ? await tx.deliveryFeeConfig.findFirst({ where: { isActive: true, effectiveFrom: { lte: new Date() }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }] }, orderBy: { effectiveFrom: 'desc' } }) : null;
      const shippingFee = feeConfig && subtotal.lessThan(feeConfig.freeShippingThreshold) ? feeConfig.fixedFee : new Prisma.Decimal(0);
      const grandTotal = subtotal.add(shippingFee);
      const customer = await tx.customer.create({ data: { name: input.receiverName, email: input.receiverEmail.trim().toLowerCase(), phone: input.receiverPhone.trim(), emailVerifiedAt: emailVerification.consumedAt!, phoneVerifiedAt: phoneVerification.consumedAt! } });
      const status = input.paymentMethod === 'QR' ? 'PENDING_PAYMENT' : 'PENDING_COD_CONFIRMATION';
      const order = await tx.order.create({ data: { code: orderCode(), idempotencyKey: input.idempotencyKey, customerId: customer.id, fulfillmentBranchId: branch.id, deliveryFeeConfigId: feeConfig?.id, fulfillmentMethod: input.fulfillmentMethod, paymentMethod: input.paymentMethod, status, subtotal, shippingFee, grandTotal, receiverName: input.receiverName, receiverEmail: customer.email, receiverPhone: customer.phone, receiverEmailVerifiedAt: customer.emailVerifiedAt, receiverPhoneVerifiedAt: customer.phoneVerifiedAt, deliveryAddressSnapshot: input.fulfillmentMethod === 'DELIVERY' ? { address: input.deliveryAddress } : Prisma.DbNull, branchSnapshot: { id: branch.id, name: branch.name, address: branch.address }, pricingSnapshot: { subtotal: asVnd(subtotal), shippingFee: asVnd(shippingFee), grandTotal: asVnd(grandTotal) }, lines: { create: cart.items.map((item, sortOrder) => ({ skuId: item.skuId!, lineType: 'SKU', skuSnapshot: item.sku!.sku, nameSnapshot: item.sku!.productTemplate.name, specSnapshot: item.sku!.variantSpec === null ? Prisma.JsonNull : item.sku!.variantSpec as Prisma.InputJsonValue, quantity: item.quantity, unitPrice: item.sku!.sellingPrice, netAmount: item.sku!.sellingPrice.mul(item.quantity), sortOrder })) } } });
      const payment = await tx.payment.create({ data: { orderId: order.id, method: input.paymentMethod, state: 'UNPAID', codRemaining: input.paymentMethod === 'COD' ? grandTotal : new Prisma.Decimal(0) } });
      let paymentReference: string | undefined;
      if (input.paymentMethod === 'QR') {
        paymentReference = `QR-${order.code}`;
        await tx.paymentCharge.create({ data: { paymentId: payment.id, idempotencyKey: input.idempotencyKey, chargeType: 'INITIAL_ORDER', providerReference: paymentReference, expectedAmount: grandTotal, expiresAt: new Date(Date.now() + 30 * 60_000) } });
        const move = await tx.stockMove.create({ data: { code: `RES-${order.code}`, sourceBranchId: branch.id, orderId: order.id, idempotencyKey: `reserve:${order.id}`, moveType: 'ORDER_ISSUE', status: 'RESERVED', expiresAt: new Date(Date.now() + 30 * 60_000), reservedAt: new Date() } });
        for (const [skuId, quantity] of quantities) {
          const stock = stocks.find((entry) => entry.skuId === skuId)!;
          const updated = await tx.stockQuant.updateMany({ where: { id: stock.id, version: stock.version }, data: { reserved: { increment: quantity }, version: { increment: 1 } } });
          if (updated.count !== 1) throw new DomainError('STOCK_CHANGED', { ruleId: 'INV-006', messageKey: 'error.stockChanged', retryable: true, status: 409 });
          const after = await tx.stockQuant.findUniqueOrThrow({ where: { id: stock.id } });
          const moveLine = await tx.stockMoveLine.create({ data: { stockMoveId: move.id, skuId, quantity, unitCost: stock.weightedAverageCost } });
          await tx.stockLedgerEntry.create({ data: { stockQuantId: stock.id, stockMoveLineId: moveLine.id, entryType: 'RESERVE', deltaReserved: quantity, onHandAfter: after.onHand, reservedAfter: after.reserved, quarantineAfter: after.quarantineDamaged, actorType: ActorType.CUSTOMER } });
        }
      }
      await tx.orderStatusHistory.create({ data: { orderId: order.id, previousStatus: status, nextStatus: status, reason: 'ORDER_SUBMITTED', actorType: ActorType.CUSTOMER, idempotencyKey: `status:${order.id}` } });
      await tx.cart.update({ where: { id: cart.id }, data: { isActive: false } });
      return { code: order.code, status: order.status, paymentState: payment.state, paymentReference, expectedAmount: paymentReference ? asVnd(grandTotal) : undefined };
    });
  },
};
