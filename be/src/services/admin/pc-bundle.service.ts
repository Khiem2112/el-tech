import { Prisma, ProductLifecycle } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreatePcBundleInput,
  QueryPcBundleInput,
  UpdatePcBundleInput,
} from '../../validations/admin/pc-bundle.schema.js';

const DISCOUNT_TAG_REGEX = /(?:^|\n)\[(?:GIAM|DISCOUNT):\s*(\d+)\]/i;

export type AdminPcBundleComponentDto = {
  readonly id: string;
  readonly skuId: number;
  readonly sku: string;
  readonly barcode: string | null;
  readonly variationLabel: string | null;
  readonly productName: string;
  readonly productTemplateId: number;
  readonly categoryName: string;
  readonly categorySlug: string;
  readonly quantity: number;
  readonly sortOrder: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
  readonly lifecycleState: ProductLifecycle;
  readonly isActive: boolean;
  readonly media: unknown;
};

export type BranchAvailabilityDto = {
  readonly branchId: number;
  readonly branchName: number | string;
  readonly branchCode: string;
  readonly buildableCount: number;
  readonly bottleneckSku: string | null;
  readonly bottleneckSkuId: number | null;
  readonly bottleneckAvailableStock: number;
  readonly bottleneckRequiredQuantity: number;
};

export type AdminPcBundleDetailDto = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly rawDescription: string | null;
  readonly lifecycleState: ProductLifecycle;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly totalItemsCount: number;
  readonly totalQuantity: number;
  readonly grossTotal: number;
  readonly discountAmount: number;
  readonly finalPrice: number;
  readonly items: readonly AdminPcBundleComponentDto[];
  readonly branchAvailability: readonly BranchAvailabilityDto[];
};

export type AdminPcBundleListItemDto = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly lifecycleState: ProductLifecycle;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly totalItemsCount: number;
  readonly totalQuantity: number;
  readonly grossTotal: number;
  readonly discountAmount: number;
  readonly finalPrice: number;
  readonly primaryImage: string | null;
  readonly branchAvailability: readonly BranchAvailabilityDto[];
};

export type PaginatedPcBundlesResult = {
  readonly items: readonly AdminPcBundleListItemDto[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

type BundleWithRelations = Prisma.PcBundleGetPayload<{
  include: {
    items: {
      include: {
        sku: {
          include: {
            productTemplate: {
              include: {
                category: true;
              };
            };
          };
        };
      };
    };
  };
}>;

function extractDiscountAndCleanDescription(description: string | null): {
  cleanDescription: string | null;
  discount: number;
} {
  if (!description) {
    return { cleanDescription: null, discount: 0 };
  }
  const match = description.match(DISCOUNT_TAG_REGEX);
  if (!match) {
    return { cleanDescription: description, discount: 0 };
  }
  const discount = Number.parseInt(match[1], 10) || 0;
  const cleanDescription = description.replace(DISCOUNT_TAG_REGEX, '').trim() || null;
  return { cleanDescription, discount };
}

function packDescriptionWithDiscount(description: string | null | undefined, discount: number | undefined): string | null {
  const baseDescription = description?.trim() ?? '';
  const parsed = extractDiscountAndCleanDescription(baseDescription);
  const effectiveDescription = parsed.cleanDescription ?? '';
  const effectiveDiscount = discount !== undefined ? Math.max(0, Math.round(discount)) : parsed.discount;

  if (effectiveDiscount > 0) {
    if (effectiveDescription.length > 0) {
      return `${effectiveDescription}\n[DISCOUNT: ${effectiveDiscount}]`;
    }
    return `[DISCOUNT: ${effectiveDiscount}]`;
  }
  return effectiveDescription.length > 0 ? effectiveDescription : null;
}

function computeBranchAvailabilityForBundle(
  bundleItems: readonly { skuId: number; quantity: number; sku: { sku: string } }[],
  branches: readonly {
    id: number;
    name: string;
    code: string;
    stockQuants: readonly {
      skuId: number;
      onHand: number;
      reserved: number;
      quarantineDamaged: number;
    }[];
  }[],
): readonly BranchAvailabilityDto[] {
  return branches.map((branch) => {
    if (bundleItems.length === 0) {
      return {
        branchId: branch.id,
        branchName: branch.name,
        branchCode: branch.code,
        buildableCount: 0,
        bottleneckSku: null,
        bottleneckSkuId: null,
        bottleneckAvailableStock: 0,
        bottleneckRequiredQuantity: 0,
      };
    }

    let minBuildable = Number.POSITIVE_INFINITY;
    let bottleneckSku: string | null = null;
    let bottleneckSkuId: number | null = null;
    let bottleneckAvailableStock = 0;
    let bottleneckRequiredQuantity = 0;

    for (const item of bundleItems) {
      const stock = branch.stockQuants.find((quant) => quant.skuId === item.skuId);
      const available = stock ? Math.max(0, stock.onHand - stock.reserved - stock.quarantineDamaged) : 0;
      const buildable = Math.floor(available / item.quantity);

      if (buildable < minBuildable) {
        minBuildable = buildable;
        bottleneckSku = item.sku.sku;
        bottleneckSkuId = item.skuId;
        bottleneckAvailableStock = available;
        bottleneckRequiredQuantity = item.quantity;
      }
    }

    return {
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      buildableCount: Number.isFinite(minBuildable) ? Math.max(0, minBuildable) : 0,
      bottleneckSku,
      bottleneckSkuId,
      bottleneckAvailableStock,
      bottleneckRequiredQuantity,
    };
  });
}

function formatBundleListItem(
  bundle: BundleWithRelations,
  branches: readonly {
    id: number;
    name: string;
    code: string;
    stockQuants: readonly {
      skuId: number;
      onHand: number;
      reserved: number;
      quarantineDamaged: number;
    }[];
  }[],
): AdminPcBundleListItemDto {
  const { cleanDescription, discount } = extractDiscountAndCleanDescription(bundle.description);

  let grossTotal = 0;
  let totalQuantity = 0;
  let primaryImage: string | null = null;

  for (const item of bundle.items) {
    if (!item.isActive) continue;
    const unitPrice = Number(item.sku.sellingPrice);
    grossTotal += unitPrice * item.quantity;
    totalQuantity += item.quantity;

    if (!primaryImage && item.sku.productTemplate.media) {
      const media = item.sku.productTemplate.media;
      if (Array.isArray(media) && media.length > 0 && typeof media[0] === 'string') {
        primaryImage = media[0];
      } else if (Array.isArray(media) && media.length > 0 && typeof media[0] === 'object' && media[0] && 'url' in media[0]) {
        primaryImage = String((media[0] as { url: unknown }).url);
      }
    }
  }

  const activeItems = bundle.items.filter((item) => item.isActive);
  const branchAvailability = computeBranchAvailabilityForBundle(activeItems, branches);
  const finalPrice = Math.max(0, grossTotal - discount);

  return {
    id: bundle.id,
    name: bundle.name,
    slug: bundle.slug,
    description: cleanDescription,
    lifecycleState: bundle.lifecycleState,
    isActive: bundle.isActive,
    createdAt: bundle.createdAt,
    updatedAt: bundle.updatedAt,
    totalItemsCount: activeItems.length,
    totalQuantity,
    grossTotal,
    discountAmount: discount,
    finalPrice,
    primaryImage,
    branchAvailability,
  };
}

function formatBundleDetail(
  bundle: BundleWithRelations,
  branches: readonly {
    id: number;
    name: string;
    code: string;
    stockQuants: readonly {
      skuId: number;
      onHand: number;
      reserved: number;
      quarantineDamaged: number;
    }[];
  }[],
): AdminPcBundleDetailDto {
  const { cleanDescription, discount } = extractDiscountAndCleanDescription(bundle.description);

  let grossTotal = 0;
  let totalQuantity = 0;

  const items: AdminPcBundleComponentDto[] = bundle.items
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => {
      const unitPrice = Number(item.sku.sellingPrice);
      const lineTotal = unitPrice * item.quantity;
      grossTotal += lineTotal;
      totalQuantity += item.quantity;

      return {
        id: item.id,
        skuId: item.skuId,
        sku: item.sku.sku,
        barcode: item.sku.barcode,
        variationLabel: item.sku.variationLabel,
        productName: item.sku.productTemplate.name,
        productTemplateId: item.sku.productTemplateId,
        categoryName: item.sku.productTemplate.category.name,
        categorySlug: item.sku.productTemplate.category.slug,
        quantity: item.quantity,
        sortOrder: item.sortOrder,
        unitPrice,
        lineTotal,
        lifecycleState: item.sku.lifecycleState,
        isActive: item.sku.isActive,
        media: item.sku.productTemplate.media,
      };
    });

  const branchAvailability = computeBranchAvailabilityForBundle(bundle.items.filter((i) => i.isActive), branches);
  const finalPrice = Math.max(0, grossTotal - discount);

  return {
    id: bundle.id,
    name: bundle.name,
    slug: bundle.slug,
    description: cleanDescription,
    rawDescription: bundle.description,
    lifecycleState: bundle.lifecycleState,
    isActive: bundle.isActive,
    createdAt: bundle.createdAt,
    updatedAt: bundle.updatedAt,
    totalItemsCount: items.length,
    totalQuantity,
    grossTotal,
    discountAmount: discount,
    finalPrice,
    items,
    branchAvailability,
  };
}

export const adminPcBundleService = {
  async getBundles(query: QueryPcBundleInput): Promise<PaginatedPcBundlesResult> {
    const { search, lifecycleState, isActive, page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PcBundleWhereInput = {
      ...(lifecycleState ? { lifecycleState } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [bundles, total, branches] = await Promise.all([
      prisma.pcBundle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            where: { isActive: true },
            include: {
              sku: {
                include: {
                  productTemplate: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      prisma.pcBundle.count({ where }),
      prisma.branch.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          stockQuants: {
            where: { isActive: true },
            select: {
              skuId: true,
              onHand: true,
              reserved: true,
              quarantineDamaged: true,
            },
          },
        },
        orderBy: { deliveryPriority: 'asc' },
      }),
    ]);

    const formattedItems = bundles.map((bundle) => formatBundleListItem(bundle, branches));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getBundleById(id: number): Promise<AdminPcBundleDetailDto> {
    const bundle = await prisma.pcBundle.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          include: {
            sku: {
              include: {
                productTemplate: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!bundle) {
      throw new DomainError('PC_BUNDLE_NOT_FOUND', {
        ruleId: 'PCB-001',
        messageKey: 'error.bundleNotFound',
        status: 404,
      });
    }

    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        stockQuants: {
          where: { isActive: true },
          select: {
            skuId: true,
            onHand: true,
            reserved: true,
            quarantineDamaged: true,
          },
        },
      },
      orderBy: { deliveryPriority: 'asc' },
    });

    return formatBundleDetail(bundle, branches);
  },

  async createBundle(input: CreatePcBundleInput): Promise<AdminPcBundleDetailDto> {
    const existingSlug = await prisma.pcBundle.findUnique({
      where: { slug: input.slug },
    });
    if (existingSlug) {
      throw new DomainError('DUPLICATE_SLUG', {
        ruleId: 'PCB-001',
        messageKey: 'error.duplicateSlug',
        status: 409,
      });
    }

    const requestedSkuIds = input.items.map((item) => item.skuId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: requestedSkuIds } },
      select: {
        id: true,
        sku: true,
        isActive: true,
        lifecycleState: true,
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    for (const item of input.items) {
      const variant = variantMap.get(item.skuId);
      if (!variant) {
        throw new DomainError('SKU_NOT_FOUND', {
          ruleId: 'PCB-001',
          messageKey: 'error.skuNotFound',
          status: 404,
        });
      }
      if (!variant.isActive || variant.lifecycleState !== ProductLifecycle.ACTIVE) {
        throw new DomainError('INVALID_BOM_COMPONENT', {
          ruleId: 'PCB-001',
          messageKey: 'error.bomSkuNotActive',
          status: 400,
        });
      }
    }

    const description = packDescriptionWithDiscount(input.description, input.discount);

    const createdBundle = await prisma.$transaction(async (tx) => {
      const bundle = await tx.pcBundle.create({
        data: {
          name: input.name,
          slug: input.slug,
          description,
          lifecycleState: input.lifecycleState ?? ProductLifecycle.DRAFT,
          isActive: input.isActive ?? true,
        },
      });

      for (let index = 0; index < input.items.length; index++) {
        const item = input.items[index];
        await tx.pcBundleItem.create({
          data: {
            pcBundleId: bundle.id,
            skuId: item.skuId,
            quantity: item.quantity,
            sortOrder: item.sortOrder ?? index + 1,
            isActive: true,
          },
        });
      }

      return bundle;
    });

    return this.getBundleById(createdBundle.id);
  },

  async updateBundle(id: number, input: UpdatePcBundleInput): Promise<AdminPcBundleDetailDto> {
    const existing = await prisma.pcBundle.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new DomainError('PC_BUNDLE_NOT_FOUND', {
        ruleId: 'PCB-001',
        messageKey: 'error.bundleNotFound',
        status: 404,
      });
    }

    if (input.slug && input.slug !== existing.slug) {
      const duplicateSlug = await prisma.pcBundle.findUnique({
        where: { slug: input.slug },
      });
      if (duplicateSlug) {
        throw new DomainError('DUPLICATE_SLUG', {
          ruleId: 'PCB-001',
          messageKey: 'error.duplicateSlug',
          status: 409,
        });
      }
    }

    if (input.items && input.items.length > 0) {
      const requestedSkuIds = input.items.map((item) => item.skuId);
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: requestedSkuIds } },
        select: {
          id: true,
          sku: true,
          isActive: true,
          lifecycleState: true,
        },
      });

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      for (const item of input.items) {
        const variant = variantMap.get(item.skuId);
        if (!variant) {
          throw new DomainError('SKU_NOT_FOUND', {
            ruleId: 'PCB-001',
            messageKey: 'error.skuNotFound',
            status: 404,
          });
        }
        if (!variant.isActive || variant.lifecycleState !== ProductLifecycle.ACTIVE) {
          throw new DomainError('INVALID_BOM_COMPONENT', {
            ruleId: 'PCB-001',
            messageKey: 'error.bomSkuNotActive',
            status: 400,
          });
        }
      }
    }

    let description: string | null | undefined = undefined;
    if (input.description !== undefined || input.discount !== undefined) {
      const baseDesc = input.description !== undefined ? input.description : existing.description;
      description = packDescriptionWithDiscount(baseDesc, input.discount);
    }

    await prisma.$transaction(async (tx) => {
      await tx.pcBundle.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(input.lifecycleState !== undefined ? { lifecycleState: input.lifecycleState } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });

      if (input.items) {
        await tx.pcBundleItem.deleteMany({
          where: { pcBundleId: id },
        });

        for (let index = 0; index < input.items.length; index++) {
          const item = input.items[index];
          await tx.pcBundleItem.create({
            data: {
              pcBundleId: id,
              skuId: item.skuId,
              quantity: item.quantity,
              sortOrder: item.sortOrder ?? index + 1,
              isActive: true,
            },
          });
        }
      }
    });

    return this.getBundleById(id);
  },

  async deleteBundle(id: number): Promise<{ success: boolean }> {
    const existing = await prisma.pcBundle.findUnique({
      where: { id },
      include: {
        cartItems: { take: 1 },
        orderLines: { take: 1 },
      },
    });

    if (!existing) {
      throw new DomainError('PC_BUNDLE_NOT_FOUND', {
        ruleId: 'PCB-001',
        messageKey: 'error.bundleNotFound',
        status: 404,
      });
    }

    if (existing.orderLines.length > 0 || existing.cartItems.length > 0) {
      await prisma.pcBundle.update({
        where: { id },
        data: {
          isActive: false,
          lifecycleState: ProductLifecycle.DISCONTINUED,
        },
      });
      return { success: true };
    }

    await prisma.$transaction(async (tx) => {
      await tx.pcBundleItem.deleteMany({
        where: { pcBundleId: id },
      });
      await tx.pcBundle.delete({
        where: { id },
      });
    });

    return { success: true };
  },

  async getBundleStockAvailability(id: number, branchId?: number): Promise<{
    bundleId: number;
    bundleName: string;
    branches: readonly BranchAvailabilityDto[];
  }> {
    const bundle = await prisma.pcBundle.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          include: {
            sku: {
              select: { sku: true },
            },
          },
        },
      },
    });

    if (!bundle) {
      throw new DomainError('PC_BUNDLE_NOT_FOUND', {
        ruleId: 'PCB-001',
        messageKey: 'error.bundleNotFound',
        status: 404,
      });
    }

    const branches = await prisma.branch.findMany({
      where: {
        isActive: true,
        ...(branchId ? { id: branchId } : {}),
      },
      select: {
        id: true,
        name: true,
        code: true,
        stockQuants: {
          where: { isActive: true },
          select: {
            skuId: true,
            onHand: true,
            reserved: true,
            quarantineDamaged: true,
          },
        },
      },
      orderBy: { deliveryPriority: 'asc' },
    });

    const branchAvailability = computeBranchAvailabilityForBundle(bundle.items, branches);

    return {
      bundleId: bundle.id,
      bundleName: bundle.name,
      branches: branchAvailability,
    };
  },
};
