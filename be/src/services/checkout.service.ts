import { Prisma } from '@prisma/client';
import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

type ContactInput = { readonly contactType: 'EMAIL' | 'PHONE'; readonly identifier: string };
type QuoteInput = { readonly cartToken: string; readonly fulfillmentMethod: 'PICKUP' | 'DELIVERY'; readonly deliveryAreaCode?: string };

const toVnd = (value: Prisma.Decimal): string => value.toFixed(0);

export const checkoutService = {
  async requestOtp(input: ContactInput): Promise<{ verificationId: string; expiresAt: string }> {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const verification = await prisma.verification.create({ data: { identifier: input.identifier.trim().toLowerCase(), value: code, purpose: 'CHECKOUT', contactType: input.contactType, expiresAt: new Date(Date.now() + 5 * 60_000) } });
    // Delivery adapters are intentionally separated from identity state; this fallback keeps local development testable.
    if (process.env.NODE_ENV !== 'production') console.info({ verificationId: verification.id, contactType: input.contactType, otp: code });
    return { verificationId: verification.id, expiresAt: verification.expiresAt.toISOString() };
  },

  async verifyOtp(verificationId: string, code: string): Promise<{ verifiedAt: string }> {
    const verification = await prisma.verification.findFirst({ where: { id: verificationId, purpose: 'CHECKOUT' } });
    if (!verification || verification.consumedAt || verification.expiresAt <= new Date() || verification.value !== code) throw new DomainError('CONTACT_NOT_VERIFIED', { ruleId: 'CUS-002', messageKey: 'error.contactNotVerified', status: 409 });
    const consumedAt = new Date();
    await prisma.verification.update({ where: { id: verification.id }, data: { consumedAt } });
    return { verifiedAt: consumedAt.toISOString() };
  },

  async quote(input: QuoteInput): Promise<{ cartToken: string; branches: readonly { id: number; name: string; available: boolean }[]; subtotal: string; shippingFee: string; grandTotal: string }> {
    const cart = await prisma.cart.findFirst({ where: { opaqueToken: input.cartToken, isActive: true }, include: { items: { where: { isActive: true }, include: { sku: true } } } });
    const skuItems = cart?.items.filter((line) => line.lineType === 'SKU') ?? [];
    if (!cart || !cart.items.length || !skuItems.length || skuItems.some((line) => !line.sku)) {
      throw new DomainError('CART_EMPTY', { messageKey: 'error.cartEmpty', status: 409 });
    }
    const quantities = new Map<number, number>();
    for (const item of skuItems) {
      if (item.skuId) quantities.set(item.skuId, (quantities.get(item.skuId) ?? 0) + item.quantity);
    }
    const subtotal = skuItems.reduce((sum, item) => item.sku ? sum.add(item.sku.sellingPrice.mul(item.quantity)) : sum, new Prisma.Decimal(0));
    const branches = await prisma.branch.findMany({ where: { isActive: true, ...(input.fulfillmentMethod === 'DELIVERY' && input.deliveryAreaCode ? { deliveryAreaCodes: { has: input.deliveryAreaCode } } : {}) }, include: { stockQuants: { where: { isActive: true, skuId: { in: [...quantities.keys()] } } } }, orderBy: { deliveryPriority: 'asc' } });
    const candidates = branches.map((branch) => ({ id: branch.id, name: branch.name, available: [...quantities].every(([skuId, quantity]) => { const stock = branch.stockQuants.find((item) => item.skuId === skuId); return Boolean(stock && stock.onHand - stock.reserved - stock.quarantineDamaged >= quantity); }) }));
    const feeConfig = input.fulfillmentMethod === 'DELIVERY' ? await prisma.deliveryFeeConfig.findFirst({ where: { isActive: true, effectiveFrom: { lte: new Date() }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }] }, orderBy: { effectiveFrom: 'desc' } }) : null;
    const shippingFee = feeConfig && subtotal.lessThan(feeConfig.freeShippingThreshold) ? feeConfig.fixedFee : new Prisma.Decimal(0);
    return { cartToken: input.cartToken, branches: candidates, subtotal: toVnd(subtotal), shippingFee: toVnd(shippingFee), grandTotal: toVnd(subtotal.add(shippingFee)) };
  },
};
