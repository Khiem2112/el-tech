import { Prisma } from '@prisma/client';
import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';
import { adminDeliveryFeeService } from './admin/delivery-fee.service.js';

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
    productDiscount: string;
    couponDiscount: string;
    discountAmount: string;
    couponCode?: string;
    shippingFee: string;
    grandTotal: string;
  }> {
    const cart = await prisma.cart.findFirst({
      where: { opaqueToken: input.cartToken, isActive: true },
      include: {
        items: {
          where: { isActive: true },
          include: {
            sku: {
              include: {
                productTemplate: true,
              },
            },
          },
        },
      },
    });
    const skuItems = cart?.items.filter((line) => line.lineType === 'SKU') ?? [];
    if (!cart || !cart.items.length || !skuItems.length || skuItems.some((line) => !line.sku)) {
      throw new DomainError('CART_EMPTY', { messageKey: 'error.cartEmpty', status: 409 });
    }
    const quantities = new Map<number, number>();
    for (const item of skuItems) {
      if (item.skuId) quantities.set(item.skuId, (quantities.get(item.skuId) ?? 0) + item.quantity);
    }
    const subtotal = skuItems.reduce((sum, item) => item.sku ? sum.add(item.sku.sellingPrice.mul(item.quantity)) : sum, new Prisma.Decimal(0));
    const branches = await prisma.branch.findMany({ where: { isActive: true, ...(input.fulfillmentMethod === 'DELIVERY' && input.deliveryAreaCode ? { deliveryAreaCodes: { has: input.deliveryAreaCode } } : {}) }, orderBy: { deliveryPriority: 'asc' } });
    const stocks = await prisma.stockQuant.findMany({ where: { isActive: true, skuId: { in: [...quantities.keys()] } } });
    const isAvailable = [...quantities].every(([skuId, quantity]) => { const stock = stocks.find((item) => item.skuId === skuId); return Boolean(stock && stock.onHand - stock.reserved - stock.quarantineDamaged >= quantity); });
    const candidates = branches.map((branch) => ({ id: branch.id, name: branch.name, available: isAvailable }));

    const now = new Date();

    const activePromotions = await prisma.productPromotion.findMany({
      where: {
        isActive: true,
        effectiveFrom: { lte: now },
        effectiveTo: { gte: now },
      },
      include: {
        skuTargets: true,
        categoryTargets: true,
      },
    });

    let totalProductDiscount = new Prisma.Decimal(0);
    for (const item of skuItems) {
      if (!item.sku) continue;
      const skuId = item.skuId;
      const categoryId = item.sku.productTemplate?.categoryId;
      const unitPrice = item.sku.sellingPrice;

      const matchingPromos = activePromotions.filter((promo) => {
        const matchesSku = promo.skuTargets.some((target) => target.skuId === skuId);
        const matchesCategory = categoryId !== undefined ? promo.categoryTargets.some((target) => target.categoryId === categoryId) : false;
        return matchesSku || matchesCategory;
      });

      let bestUnitDiscount = new Prisma.Decimal(0);
      for (const promo of matchingPromos) {
        let promoUnitDiscount = new Prisma.Decimal(0);
        if (promo.discountType === 'PERCENTAGE') {
          promoUnitDiscount = unitPrice
            .mul(promo.discountValue)
            .div(100)
            .toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
        } else {
          promoUnitDiscount = Prisma.Decimal.min(promo.discountValue, unitPrice);
        }
        if (promoUnitDiscount.greaterThan(bestUnitDiscount)) {
          bestUnitDiscount = promoUnitDiscount;
        }
      }

      const lineProductDiscount = bestUnitDiscount.mul(item.quantity);
      totalProductDiscount = totalProductDiscount.add(lineProductDiscount);
    }

    const eligibleSubtotal = Prisma.Decimal.max(new Prisma.Decimal(0), subtotal.sub(totalProductDiscount));

    let couponDiscount = new Prisma.Decimal(0);
    let appliedCouponCode: string | undefined;

    if (input.couponCode && input.couponCode.trim()) {
      const trimmedCode = input.couponCode.trim();
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
        const percentDiscount = eligibleSubtotal.mul(coupon.discountValue).div(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
        couponDiscount = coupon.maximumDiscount !== null
          ? Prisma.Decimal.min(percentDiscount, coupon.maximumDiscount)
          : percentDiscount;
      } else {
        couponDiscount = Prisma.Decimal.min(coupon.discountValue, eligibleSubtotal);
      }

      appliedCouponCode = coupon.code;
    }

    let feeConfig = input.fulfillmentMethod === 'DELIVERY'
      ? await prisma.deliveryFeeConfig.findFirst({
          where: {
            isActive: true,
            effectiveFrom: { lte: now },
            OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
          },
          orderBy: { effectiveFrom: 'desc' },
        })
      : null;

    if (input.fulfillmentMethod === 'DELIVERY' && !feeConfig) {
      feeConfig = await prisma.deliveryFeeConfig.findFirst({
        where: { isActive: true },
        orderBy: { effectiveFrom: 'desc' },
      });
      if (!feeConfig) {
        feeConfig = await adminDeliveryFeeService.ensureDefaultConfig();
      }
    }

    const shippingFee = (input.fulfillmentMethod === 'DELIVERY' && feeConfig && eligibleSubtotal.lessThan(feeConfig.freeShippingThreshold))
      ? feeConfig.fixedFee
      : new Prisma.Decimal(0);

    const grandTotal = Prisma.Decimal.max(new Prisma.Decimal(0), eligibleSubtotal.sub(couponDiscount).add(shippingFee));

    return {
      cartToken: input.cartToken,
      branches: candidates,
      subtotal: toVnd(subtotal),
      productDiscount: toVnd(totalProductDiscount),
      couponDiscount: toVnd(couponDiscount),
      discountAmount: toVnd(couponDiscount),
      couponCode: appliedCouponCode,
      shippingFee: toVnd(shippingFee),
      grandTotal: toVnd(grandTotal),
    };
  },
};
