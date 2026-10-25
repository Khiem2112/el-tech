import { CouponRedemptionStatus, DiscountType, PaymentMethod, Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreateCouponInput,
  QueryCouponInput,
  QueryRedemptionInput,
  UpdateCouponInput,
} from '../../validations/admin/coupon.schema.js';

export type CouponStatus = 'RUNNING' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE';

export type CouponSkuRuleDto = {
  readonly id: string;
  readonly skuId: number;
  readonly rule: 'INCLUDE' | 'EXCLUDE';
  readonly sku: string;
  readonly variationLabel: string | null;
  readonly productName: string;
};

export type CouponCategoryRuleDto = {
  readonly id: string;
  readonly categoryId: number;
  readonly rule: 'INCLUDE' | 'EXCLUDE';
  readonly name: string;
  readonly slug: string;
};

export type CouponRedemptionStatsDto = {
  readonly totalRedemptions: number;
  readonly consumedCount: number;
  readonly reservedCount: number;
  readonly releasedCount: number;
  readonly usedCount: number;
};

export type CouponDto = {
  readonly id: string;
  readonly branchId: number | null;
  readonly branchName: string | null;
  readonly code: string;
  readonly name: string;
  readonly discountType: DiscountType;
  readonly discountValue: number;
  readonly minimumSubtotal: number;
  readonly maximumDiscount: number | null;
  readonly requiredPaymentMethod: PaymentMethod | null;
  readonly globalQuota: number | null;
  readonly perCustomerQuota: number | null;
  readonly effectiveFrom: string;
  readonly effectiveTo: string;
  readonly isActive: boolean;
  readonly status: CouponStatus;
  readonly skuRules: readonly CouponSkuRuleDto[];
  readonly categoryRules: readonly CouponCategoryRuleDto[];
  readonly stats: CouponRedemptionStatsDto;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CouponListMeta = {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly stats: {
    readonly totalCount: number;
    readonly runningCount: number;
    readonly upcomingCount: number;
    readonly expiredCount: number;
  };
};

export type CouponListResult = {
  readonly items: readonly CouponDto[];
  readonly meta: CouponListMeta;
};

export type CouponRedemptionItemDto = {
  readonly id: string;
  readonly couponId: string;
  readonly customerId: string;
  readonly orderId: string;
  readonly status: CouponRedemptionStatus;
  readonly reservedAt: string;
  readonly consumedAt: string | null;
  readonly releasedAt: string | null;
  readonly createdAt: string;
  readonly customer: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string;
  };
  readonly order: {
    readonly id: string;
    readonly code: string;
    readonly subtotal: number;
    readonly couponDiscount: number;
    readonly grandTotal: number;
    readonly status: string;
    readonly receiverName: string;
    readonly receiverPhone: string;
    readonly receiverEmail: string;
    readonly submittedAt: string;
  };
};

export type CouponRedemptionHistoryResult = {
  readonly coupon: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly globalQuota: number | null;
    readonly perCustomerQuota: number | null;
    readonly discountType: DiscountType;
    readonly discountValue: number;
  };
  readonly summary: CouponRedemptionStatsDto;
  readonly items: readonly CouponRedemptionItemDto[];
  readonly meta: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
};

const couponInclude = {
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  skuRules: {
    include: {
      sku: {
        select: {
          id: true,
          sku: true,
          variationLabel: true,
          productTemplate: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
  categoryRules: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  redemptions: {
    select: {
      status: true,
    },
  },
} satisfies Prisma.CouponInclude;

type CouponWithRelations = Prisma.CouponGetPayload<{
  include: typeof couponInclude;
}>;

function calculateCouponStatus(
  isActive: boolean,
  effectiveFrom: Date,
  effectiveTo: Date,
  now: Date,
): CouponStatus {
  if (!isActive) {
    return 'INACTIVE';
  }
  if (now < effectiveFrom) {
    return 'UPCOMING';
  }
  if (now > effectiveTo) {
    return 'EXPIRED';
  }
  return 'RUNNING';
}

function mapCouponToDto(coupon: CouponWithRelations, now: Date): CouponDto {
  const status = calculateCouponStatus(
    coupon.isActive,
    coupon.effectiveFrom,
    coupon.effectiveTo,
    now,
  );

  const skuRules: CouponSkuRuleDto[] = coupon.skuRules.map((rule) => ({
    id: rule.id,
    skuId: rule.skuId,
    rule: rule.rule,
    sku: rule.sku.sku,
    variationLabel: rule.sku.variationLabel,
    productName: rule.sku.productTemplate.name,
  }));

  const categoryRules: CouponCategoryRuleDto[] = coupon.categoryRules.map((rule) => ({
    id: rule.id,
    categoryId: rule.categoryId,
    rule: rule.rule,
    name: rule.category.name,
    slug: rule.category.slug,
  }));

  const totalRedemptions = coupon.redemptions.length;
  const consumedCount = coupon.redemptions.filter((r) => r.status === 'CONSUMED').length;
  const reservedCount = coupon.redemptions.filter((r) => r.status === 'RESERVED').length;
  const releasedCount = coupon.redemptions.filter((r) => r.status === 'RELEASED').length;
  const usedCount = consumedCount + reservedCount;

  return {
    id: coupon.id,
    branchId: coupon.branchId,
    branchName: coupon.branch?.name ?? null,
    code: coupon.code,
    name: coupon.name,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    minimumSubtotal: Number(coupon.minimumSubtotal),
    maximumDiscount: coupon.maximumDiscount ? Number(coupon.maximumDiscount) : null,
    requiredPaymentMethod: coupon.requiredPaymentMethod,
    globalQuota: coupon.globalQuota,
    perCustomerQuota: coupon.perCustomerQuota,
    effectiveFrom: coupon.effectiveFrom.toISOString(),
    effectiveTo: coupon.effectiveTo.toISOString(),
    isActive: coupon.isActive,
    status,
    skuRules,
    categoryRules,
    stats: {
      totalRedemptions,
      consumedCount,
      reservedCount,
      releasedCount,
      usedCount,
    },
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  };
}

export class AdminCouponService {
  async getCoupons(query: QueryCouponInput): Promise<CouponListResult> {
    const now = new Date();
    const where: Prisma.CouponWhereInput = {};

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status === 'ACTIVE') {
      where.isActive = true;
    } else if (query.status === 'INACTIVE') {
      where.isActive = false;
    } else if (query.status === 'RUNNING') {
      where.isActive = true;
      where.effectiveFrom = { lte: now };
      where.effectiveTo = { gte: now };
    } else if (query.status === 'UPCOMING') {
      where.isActive = true;
      where.effectiveFrom = { gt: now };
    } else if (query.status === 'EXPIRED') {
      where.isActive = true;
      where.effectiveTo = { lt: now };
    }

    if (query.discountType !== 'ALL') {
      where.discountType = query.discountType;
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total, allCoupons] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: couponInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.coupon.count({ where }),
      prisma.coupon.findMany({
        select: {
          isActive: true,
          effectiveFrom: true,
          effectiveTo: true,
        },
      }),
    ]);

    const runningCount = allCoupons.filter(
      (c) => c.isActive && c.effectiveFrom <= now && c.effectiveTo >= now,
    ).length;
    const upcomingCount = allCoupons.filter(
      (c) => c.isActive && c.effectiveFrom > now,
    ).length;
    const expiredCount = allCoupons.filter(
      (c) => c.isActive && c.effectiveTo < now,
    ).length;

    const mappedItems = items.map((coupon) => mapCouponToDto(coupon, now));
    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      items: mappedItems,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        stats: {
          totalCount: allCoupons.length,
          runningCount,
          upcomingCount,
          expiredCount,
        },
      },
    };
  }

  async getCouponById(id: string): Promise<CouponDto> {
    const now = new Date();
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: couponInclude,
    });

    if (!coupon) {
      throw new DomainError('COUPON_NOT_FOUND', {
        ruleId: 'PRO-002',
        messageKey: 'Không tìm thấy mã giảm giá',
        status: 404,
      });
    }

    return mapCouponToDto(coupon, now);
  }

  async createCoupon(input: CreateCouponInput): Promise<CouponDto> {
    const existing = await prisma.coupon.findUnique({
      where: { code: input.code },
    });

    if (existing) {
      throw new DomainError('COUPON_CODE_ALREADY_EXISTS', {
        ruleId: 'PRO-002',
        messageKey: 'Mã giảm giá đã tồn tại trong hệ thống',
        status: 409,
      });
    }

    return await prisma.$transaction(async (tx) => {
      const created = await tx.coupon.create({
        data: {
          code: input.code,
          name: input.name,
          discountType: input.discountType,
          discountValue: new Prisma.Decimal(input.discountValue),
          minimumSubtotal: new Prisma.Decimal(input.minimumSubtotal),
          maximumDiscount:
            input.maximumDiscount !== null && input.maximumDiscount !== undefined
              ? new Prisma.Decimal(input.maximumDiscount)
              : null,
          requiredPaymentMethod: input.requiredPaymentMethod ?? null,
          branchId: input.branchId ?? null,
          globalQuota: input.globalQuota ?? null,
          perCustomerQuota: input.perCustomerQuota ?? null,
          effectiveFrom: input.effectiveFrom,
          effectiveTo: input.effectiveTo,
          isActive: input.isActive ?? true,
          skuRules: {
            create: (input.skuRules ?? []).map((rule) => ({
              skuId: rule.skuId,
              rule: rule.rule,
            })),
          },
          categoryRules: {
            create: (input.categoryRules ?? []).map((rule) => ({
              categoryId: rule.categoryId,
              rule: rule.rule,
            })),
          },
        },
        include: couponInclude,
      });

      return mapCouponToDto(created, new Date());
    });
  }

  async updateCoupon(id: string, input: UpdateCouponInput): Promise<CouponDto> {
    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('COUPON_NOT_FOUND', {
        ruleId: 'PRO-002',
        messageKey: 'Không tìm thấy mã giảm giá',
        status: 404,
      });
    }

    if (input.code && input.code !== existing.code) {
      const duplicate = await prisma.coupon.findUnique({
        where: { code: input.code },
      });

      if (duplicate) {
        throw new DomainError('COUPON_CODE_ALREADY_EXISTS', {
          ruleId: 'PRO-002',
          messageKey: 'Mã giảm giá đã tồn tại trong hệ thống',
          status: 409,
        });
      }
    }

    return await prisma.$transaction(async (tx) => {
      if (input.skuRules !== undefined) {
        await tx.couponSkuRule.deleteMany({
          where: { couponId: id },
        });
        if (input.skuRules.length > 0) {
          await tx.couponSkuRule.createMany({
            data: input.skuRules.map((rule) => ({
              couponId: id,
              skuId: rule.skuId,
              rule: rule.rule,
            })),
          });
        }
      }

      if (input.categoryRules !== undefined) {
        await tx.couponCategoryRule.deleteMany({
          where: { couponId: id },
        });
        if (input.categoryRules.length > 0) {
          await tx.couponCategoryRule.createMany({
            data: input.categoryRules.map((rule) => ({
              couponId: id,
              categoryId: rule.categoryId,
              rule: rule.rule,
            })),
          });
        }
      }

      const updated = await tx.coupon.update({
        where: { id },
        data: {
          code: input.code,
          name: input.name,
          discountType: input.discountType,
          discountValue:
            input.discountValue !== undefined
              ? new Prisma.Decimal(input.discountValue)
              : undefined,
          minimumSubtotal:
            input.minimumSubtotal !== undefined
              ? new Prisma.Decimal(input.minimumSubtotal)
              : undefined,
          maximumDiscount:
            input.maximumDiscount !== undefined
              ? input.maximumDiscount !== null
                ? new Prisma.Decimal(input.maximumDiscount)
                : null
              : undefined,
          requiredPaymentMethod: input.requiredPaymentMethod,
          branchId: input.branchId,
          globalQuota: input.globalQuota,
          perCustomerQuota: input.perCustomerQuota,
          effectiveFrom: input.effectiveFrom,
          effectiveTo: input.effectiveTo,
          isActive: input.isActive,
        },
        include: couponInclude,
      });

      return mapCouponToDto(updated, new Date());
    });
  }

  async toggleCouponStatus(id: string): Promise<CouponDto> {
    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('COUPON_NOT_FOUND', {
        ruleId: 'PRO-002',
        messageKey: 'Không tìm thấy mã giảm giá',
        status: 404,
      });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
      },
      include: couponInclude,
    });

    return mapCouponToDto(updated, new Date());
  }

  async deleteCoupon(id: string): Promise<{ readonly id: string; readonly deleted: boolean }> {
    const existing = await prisma.coupon.findUnique({
      where: { id },
      include: {
        redemptions: {
          select: { id: true },
        },
      },
    });

    if (!existing) {
      throw new DomainError('COUPON_NOT_FOUND', {
        ruleId: 'PRO-002',
        messageKey: 'Không tìm thấy mã giảm giá',
        status: 404,
      });
    }

    if (existing.redemptions.length > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      return { id, deleted: false };
    }

    await prisma.$transaction(async (tx) => {
      await tx.couponSkuRule.deleteMany({
        where: { couponId: id },
      });
      await tx.couponCategoryRule.deleteMany({
        where: { couponId: id },
      });
      await tx.coupon.delete({
        where: { id },
      });
    });

    return { id, deleted: true };
  }

  async getCouponRedemptions(
    couponId: string,
    query: QueryRedemptionInput,
  ): Promise<CouponRedemptionHistoryResult> {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: {
        id: true,
        code: true,
        name: true,
        globalQuota: true,
        perCustomerQuota: true,
        discountType: true,
        discountValue: true,
      },
    });

    if (!coupon) {
      throw new DomainError('COUPON_NOT_FOUND', {
        ruleId: 'PRO-002',
        messageKey: 'Không tìm thấy mã giảm giá',
        status: 404,
      });
    }

    const where: Prisma.CouponRedemptionWhereInput = {
      couponId,
    };

    if (query.status !== 'ALL') {
      where.status = query.status;
    }

    const skip = (query.page - 1) * query.limit;

    const [allRedemptions, redemptions, total] = await Promise.all([
      prisma.couponRedemption.findMany({
        where: { couponId },
        select: { status: true },
      }),
      prisma.couponRedemption.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          order: {
            select: {
              id: true,
              code: true,
              subtotal: true,
              couponDiscount: true,
              grandTotal: true,
              status: true,
              receiverName: true,
              receiverPhone: true,
              receiverEmail: true,
              submittedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.couponRedemption.count({ where }),
    ]);

    const totalRedemptions = allRedemptions.length;
    const consumedCount = allRedemptions.filter((r) => r.status === 'CONSUMED').length;
    const reservedCount = allRedemptions.filter((r) => r.status === 'RESERVED').length;
    const releasedCount = allRedemptions.filter((r) => r.status === 'RELEASED').length;
    const usedCount = consumedCount + reservedCount;

    const items: CouponRedemptionItemDto[] = redemptions.map((redemption) => ({
      id: redemption.id,
      couponId: redemption.couponId,
      customerId: redemption.customerId,
      orderId: redemption.orderId,
      status: redemption.status,
      reservedAt: redemption.reservedAt.toISOString(),
      consumedAt: redemption.consumedAt ? redemption.consumedAt.toISOString() : null,
      releasedAt: redemption.releasedAt ? redemption.releasedAt.toISOString() : null,
      createdAt: redemption.createdAt.toISOString(),
      customer: {
        id: redemption.customer.id,
        name: redemption.customer.name,
        email: redemption.customer.email,
        phone: redemption.customer.phone,
      },
      order: {
        id: redemption.order.id,
        code: redemption.order.code,
        subtotal: Number(redemption.order.subtotal),
        couponDiscount: Number(redemption.order.couponDiscount),
        grandTotal: Number(redemption.order.grandTotal),
        status: redemption.order.status,
        receiverName: redemption.order.receiverName,
        receiverPhone: redemption.order.receiverPhone,
        receiverEmail: redemption.order.receiverEmail,
        submittedAt: redemption.order.submittedAt.toISOString(),
      },
    }));

    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        globalQuota: coupon.globalQuota,
        perCustomerQuota: coupon.perCustomerQuota,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
      },
      summary: {
        totalRedemptions,
        consumedCount,
        reservedCount,
        releasedCount,
        usedCount,
      },
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }
}

export const adminCouponService = new AdminCouponService();
