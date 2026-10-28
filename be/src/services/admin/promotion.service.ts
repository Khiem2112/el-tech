import { DiscountType, Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreatePromotionInput,
  QueryPromotionInput,
  UpdatePromotionInput,
} from '../../validations/admin/promotion.schema.js';

export type PromotionStatus = 'RUNNING' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE';
export type PromotionScopeType = 'SKU' | 'CATEGORY' | 'MIXED';

export type PromotionSkuDto = {
  readonly id: string;
  readonly skuId: number;
  readonly sku: string;
  readonly variationLabel: string | null;
  readonly productName: string;
  readonly sellingPrice: number;
};

export type PromotionCategoryDto = {
  readonly id: string;
  readonly categoryId: number;
  readonly name: string;
  readonly slug: string;
};

export type ProductPromotionDto = {
  readonly id: string;
  readonly name: string;
  readonly discountType: DiscountType;
  readonly discountValue: number;
  readonly isExclusive: boolean;
  readonly effectiveFrom: string;
  readonly effectiveTo: string;
  readonly isActive: boolean;
  readonly status: PromotionStatus;
  readonly scope: PromotionScopeType;
  readonly skuTargets: readonly PromotionSkuDto[];
  readonly categoryTargets: readonly PromotionCategoryDto[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PromotionListMeta = {
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

export type PromotionListResult = {
  readonly items: readonly ProductPromotionDto[];
  readonly meta: PromotionListMeta;
};

const promotionInclude = {
  skuTargets: {
    include: {
      sku: {
        select: {
          id: true,
          sku: true,
          variationLabel: true,
          sellingPrice: true,
          productTemplate: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
  categoryTargets: {
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
} satisfies Prisma.ProductPromotionInclude;

type PromotionWithTargets = Prisma.ProductPromotionGetPayload<{
  include: typeof promotionInclude;
}>;

function calculatePromotionStatus(
  isActive: boolean,
  effectiveFrom: Date,
  effectiveTo: Date,
  now: Date,
): PromotionStatus {
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

function resolveScope(skuCount: number, categoryCount: number): PromotionScopeType {
  if (skuCount > 0 && categoryCount === 0) {
    return 'SKU';
  }
  if (categoryCount > 0 && skuCount === 0) {
    return 'CATEGORY';
  }
  return 'MIXED';
}

function mapPromotionToDto(promo: PromotionWithTargets, now: Date): ProductPromotionDto {
  const status = calculatePromotionStatus(
    promo.isActive,
    promo.effectiveFrom,
    promo.effectiveTo,
    now,
  );

  const skuTargets: PromotionSkuDto[] = promo.skuTargets.map((target) => ({
    id: target.id,
    skuId: target.sku.id,
    sku: target.sku.sku,
    variationLabel: target.sku.variationLabel,
    productName: target.sku.productTemplate.name,
    sellingPrice: Number(target.sku.sellingPrice),
  }));

  const categoryTargets: PromotionCategoryDto[] = promo.categoryTargets.map((target) => ({
    id: target.id,
    categoryId: target.category.id,
    name: target.category.name,
    slug: target.category.slug,
  }));

  return {
    id: promo.id,
    name: promo.name,
    discountType: promo.discountType,
    discountValue: Number(promo.discountValue),
    isExclusive: promo.isExclusive,
    effectiveFrom: promo.effectiveFrom.toISOString(),
    effectiveTo: promo.effectiveTo.toISOString(),
    isActive: promo.isActive,
    status,
    scope: resolveScope(skuTargets.length, categoryTargets.length),
    skuTargets,
    categoryTargets,
    createdAt: promo.createdAt.toISOString(),
    updatedAt: promo.updatedAt.toISOString(),
  };
}

export class AdminPromotionService {
  async getPromotions(query: QueryPromotionInput): Promise<PromotionListResult> {
    const now = new Date();
    const where: Prisma.ProductPromotionWhereInput = {};

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.discountType) {
      where.discountType = query.discountType;
    }

    if (query.status === 'RUNNING') {
      where.isActive = true;
      where.effectiveFrom = { lte: now };
      where.effectiveTo = { gte: now };
    } else if (query.status === 'UPCOMING') {
      where.isActive = true;
      where.effectiveFrom = { gt: now };
    } else if (query.status === 'EXPIRED') {
      where.effectiveTo = { lt: now };
    } else if (query.status === 'ACTIVE') {
      where.isActive = true;
    } else if (query.status === 'INACTIVE') {
      where.isActive = false;
    }

    if (query.scope === 'SKU') {
      where.skuTargets = { some: {} };
    } else if (query.scope === 'CATEGORY') {
      where.categoryTargets = { some: {} };
    }

    const orderBy: Prisma.ProductPromotionOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [items, total, totalCount, runningCount, upcomingCount, expiredCount] =
      await Promise.all([
        prisma.productPromotion.findMany({
          where,
          orderBy,
          skip,
          take,
          include: promotionInclude,
        }),
        prisma.productPromotion.count({ where }),
        prisma.productPromotion.count(),
        prisma.productPromotion.count({
          where: {
            isActive: true,
            effectiveFrom: { lte: now },
            effectiveTo: { gte: now },
          },
        }),
        prisma.productPromotion.count({
          where: {
            isActive: true,
            effectiveFrom: { gt: now },
          },
        }),
        prisma.productPromotion.count({
          where: {
            effectiveTo: { lt: now },
          },
        }),
      ]);

    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      items: items.map((item) => mapPromotionToDto(item, now)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        stats: {
          totalCount,
          runningCount,
          upcomingCount,
          expiredCount,
        },
      },
    };
  }

  async getPromotionById(id: string): Promise<ProductPromotionDto> {
    const promo = await prisma.productPromotion.findUnique({
      where: { id },
      include: promotionInclude,
    });

    if (!promo) {
      throw new DomainError('Chương trình khuyến mãi không tồn tại', {
        status: 404,
        messageKey: 'PROMOTION_NOT_FOUND',
        details: { id },
      });
    }

    return mapPromotionToDto(promo, new Date());
  }

  async createPromotion(input: CreatePromotionInput): Promise<ProductPromotionDto> {
    const from = new Date(input.effectiveFrom);
    const to = new Date(input.effectiveTo);

    if (to <= from) {
      throw new DomainError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu', {
        status: 400,
        messageKey: 'INVALID_EFFECTIVE_DATE_RANGE',
        details: { effectiveFrom: input.effectiveFrom, effectiveTo: input.effectiveTo },
      });
    }

    if (input.scope === 'SKU' && input.skuIds.length > 0) {
      const existingVariants = await prisma.productVariant.findMany({
        where: { id: { in: input.skuIds } },
        select: { id: true },
      });

      if (existingVariants.length !== input.skuIds.length) {
        throw new DomainError('Một số biến thể SKU được chọn không tồn tại trong hệ thống', {
          status: 400,
          messageKey: 'SKU_NOT_FOUND',
          details: { requestedIds: input.skuIds },
        });
      }
    }

    if (input.scope === 'CATEGORY' && input.categoryIds.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: { id: { in: input.categoryIds } },
        select: { id: true },
      });

      if (existingCategories.length !== input.categoryIds.length) {
        throw new DomainError('Một số danh mục ngành hàng được chọn không tồn tại', {
          status: 400,
          messageKey: 'CATEGORY_NOT_FOUND',
          details: { requestedIds: input.categoryIds },
        });
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const promotion = await tx.productPromotion.create({
        data: {
          name: input.name,
          discountType: input.discountType,
          discountValue: new Prisma.Decimal(input.discountValue),
          isExclusive: input.isExclusive ?? false,
          effectiveFrom: from,
          effectiveTo: to,
          isActive: input.isActive ?? true,
        },
      });

      if (input.scope === 'SKU' && input.skuIds.length > 0) {
        await tx.promotionSku.createMany({
          data: input.skuIds.map((skuId) => ({
            promotionId: promotion.id,
            skuId,
          })),
        });
      }

      if (input.scope === 'CATEGORY' && input.categoryIds.length > 0) {
        await tx.promotionCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({
            promotionId: promotion.id,
            categoryId,
          })),
        });
      }

      return tx.productPromotion.findUniqueOrThrow({
        where: { id: promotion.id },
        include: promotionInclude,
      });
    });

    return mapPromotionToDto(created, new Date());
  }

  async updatePromotion(id: string, input: UpdatePromotionInput): Promise<ProductPromotionDto> {
    const existing = await prisma.productPromotion.findUnique({
      where: { id },
      include: {
        skuTargets: true,
        categoryTargets: true,
      },
    });

    if (!existing) {
      throw new DomainError('Chương trình khuyến mãi không tồn tại', {
        status: 404,
        messageKey: 'PROMOTION_NOT_FOUND',
        details: { id },
      });
    }

    const nextFrom = input.effectiveFrom ? new Date(input.effectiveFrom) : existing.effectiveFrom;
    const nextTo = input.effectiveTo ? new Date(input.effectiveTo) : existing.effectiveTo;

    if (nextTo <= nextFrom) {
      throw new DomainError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu', {
        status: 400,
        messageKey: 'INVALID_EFFECTIVE_DATE_RANGE',
        details: { effectiveFrom: nextFrom, effectiveTo: nextTo },
      });
    }

    if (input.skuIds && input.skuIds.length > 0) {
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: input.skuIds } },
        select: { id: true },
      });
      if (variants.length !== input.skuIds.length) {
        throw new DomainError('Một số biến thể SKU được chọn không tồn tại trong hệ thống', {
          status: 400,
          messageKey: 'SKU_NOT_FOUND',
          details: { requestedIds: input.skuIds },
        });
      }
    }

    if (input.categoryIds && input.categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: input.categoryIds } },
        select: { id: true },
      });
      if (categories.length !== input.categoryIds.length) {
        throw new DomainError('Một số danh mục ngành hàng được chọn không tồn tại', {
          status: 400,
          messageKey: 'CATEGORY_NOT_FOUND',
          details: { requestedIds: input.categoryIds },
        });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: Prisma.ProductPromotionUpdateInput = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.discountType !== undefined) updateData.discountType = input.discountType;
      if (input.discountValue !== undefined) {
        updateData.discountValue = new Prisma.Decimal(input.discountValue);
      }
      if (input.isExclusive !== undefined) updateData.isExclusive = input.isExclusive;
      if (input.effectiveFrom !== undefined) updateData.effectiveFrom = nextFrom;
      if (input.effectiveTo !== undefined) updateData.effectiveTo = nextTo;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await tx.productPromotion.update({
        where: { id },
        data: updateData,
      });

      if (input.scope === 'SKU' || input.skuIds !== undefined) {
        await tx.promotionCategory.deleteMany({ where: { promotionId: id } });
        await tx.promotionSku.deleteMany({ where: { promotionId: id } });

        const skuList = input.skuIds ?? [];
        if (skuList.length > 0) {
          await tx.promotionSku.createMany({
            data: skuList.map((skuId) => ({
              promotionId: id,
              skuId,
            })),
          });
        }
      } else if (input.scope === 'CATEGORY' || input.categoryIds !== undefined) {
        await tx.promotionSku.deleteMany({ where: { promotionId: id } });
        await tx.promotionCategory.deleteMany({ where: { promotionId: id } });

        const catList = input.categoryIds ?? [];
        if (catList.length > 0) {
          await tx.promotionCategory.createMany({
            data: catList.map((categoryId) => ({
              promotionId: id,
              categoryId,
            })),
          });
        }
      }

      return tx.productPromotion.findUniqueOrThrow({
        where: { id },
        include: promotionInclude,
      });
    });

    return mapPromotionToDto(updated, new Date());
  }

  async togglePromotionStatus(id: string): Promise<ProductPromotionDto> {
    const existing = await prisma.productPromotion.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('Chương trình khuyến mãi không tồn tại', {
        status: 404,
        messageKey: 'PROMOTION_NOT_FOUND',
        details: { id },
      });
    }

    const updated = await prisma.productPromotion.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
      },
      include: promotionInclude,
    });

    return mapPromotionToDto(updated, new Date());
  }

  async deletePromotion(id: string): Promise<{ readonly id: string; readonly deleted: boolean }> {
    const existing = await prisma.productPromotion.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('Chương trình khuyến mãi không tồn tại', {
        status: 404,
        messageKey: 'PROMOTION_NOT_FOUND',
        details: { id },
      });
    }

    await prisma.productPromotion.delete({
      where: { id },
    });

    return { id, deleted: true };
  }
}

export const adminPromotionService = new AdminPromotionService();
