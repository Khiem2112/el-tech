import { Prisma } from '@prisma/client';
import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

type ContactInput = { readonly contactType: 'EMAIL' | 'PHONE'; readonly identifier: string };
type QuoteInput = {
  readonly cartToken: string;
  readonly fulfillmentMethod: 'PICKUP' | 'DELIVERY';
  readonly deliveryAreaCode?: string;
  readonly couponCode?: string;
};

const toVnd = (value: Prisma.Decimal): string => value.toFixed(0);

export const checkoutService = {
  async requestOtp(input: ContactInput): Promise<{ verificationId: string; expiresAt: string }> {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const verification = await prisma.verification.create({ data: { identifier: input.identifier.trim().toLowerCase(), value: code, purpose: 'CHECKOUT', contactType: input.contactType, expiresAt: new Date(Date.now() + 5 * 60_000) } });
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

  async quote(input: QuoteInput): Promise<{
    cartToken: string;
    branches: readonly { id: number; name: string; available: boolean }[];
    subtotal: string;
    discountAmount: string;
    couponCode?: string;
    shippingFee: string;
    grandTotal: string;
  }> {
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

    let couponDiscount = new Prisma.Decimal(0);
    let appliedCouponCode: string | undefined;

    if (input.couponCode && input.couponCode.trim()) {
      const trimmedCode = input.couponCode.trim();
      const now = new Date();
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: { equals: trimmedCode, mode: 'insensitive' },
          isActive: true,
        },
        include: {
          redemptions: {
            where: {
              status: { in: ['RESERVED', 'CONSUMED'] },
            },
          },
        },
      });

      if (!coupon) {
        throw new DomainError('COUPON_NOT_FOUND', {
          messageKey: 'error.couponNotFound',
          status: 404,
          details: { message: 'Ma giam gia khong ton tai hoac da bi vo hieu hoa' },
        });
      }

      if (coupon.effectiveFrom > now || coupon.effectiveTo < now) {
        throw new DomainError('COUPON_EXPIRED', {
          messageKey: 'error.couponExpired',
          status: 400,
          details: { message: 'Ma giam gia chua co hieu luc hoac da het han su dung' },
        });
      }

      if (subtotal.lessThan(coupon.minimumSubtotal)) {
        throw new DomainError('COUPON_MINIMUM_SUBTOTAL_NOT_MET', {
          messageKey: 'error.couponMinimumSubtotalNotMet',
          status: 400,
          details: {
            minimumSubtotal: coupon.minimumSubtotal.toFixed(0),
            currentSubtotal: subtotal.toFixed(0),
            message: `Don hang chua dat gia tri toi thieu ${Number(coupon.minimumSubtotal).toLocaleString('vi-VN')} VND`,
          },
        });
      }

      if (coupon.globalQuota !== null && coupon.redemptions.length >= coupon.globalQuota) {
        throw new DomainError('COUPON_QUOTA_EXCEEDED', {
          messageKey: 'error.couponQuotaExceeded',
          status: 400,
          details: { message: 'Ma giam gia da het luot su dung toan he thong' },
        });
      }

      if (coupon.discountType === 'PERCENTAGE') {
        const percentDiscount = subtotal.mul(coupon.discountValue).div(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
        couponDiscount = coupon.maximumDiscount !== null
          ? Prisma.Decimal.min(percentDiscount, coupon.maximumDiscount)
          : percentDiscount;
      } else {
        couponDiscount = Prisma.Decimal.min(coupon.discountValue, subtotal);
      }

      appliedCouponCode = coupon.code;
    }

    const feeConfig = input.fulfillmentMethod === 'DELIVERY' ? await prisma.deliveryFeeConfig.findFirst({ where: { isActive: true, effectiveFrom: { lte: new Date() }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }] }, orderBy: { effectiveFrom: 'desc' } }) : null;
    const shippingFee = feeConfig && subtotal.lessThan(feeConfig.freeShippingThreshold) ? feeConfig.fixedFee : new Prisma.Decimal(0);
    const grandTotal = Prisma.Decimal.max(new Prisma.Decimal(0), subtotal.sub(couponDiscount).add(shippingFee));

    return {
      cartToken: input.cartToken,
      branches: candidates,
      subtotal: toVnd(subtotal),
      discountAmount: toVnd(couponDiscount),
      couponCode: appliedCouponCode,
      shippingFee: toVnd(shippingFee),
      grandTotal: toVnd(grandTotal),
    };
  },
};
