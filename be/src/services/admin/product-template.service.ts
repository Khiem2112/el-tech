import { Prisma, ProductLifecycle } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreateProductTemplateInput,
  ProductLifecycleState,
  QueryProductTemplateInput,
  UpdateProductTemplateInput,
} from '../../validations/admin/product-template.schema.js';
import { normalizeSpecSchema } from './category.service.js';

export type ProductTemplateVariantSummary = {
  id: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  sellingPrice: string;
  serialRequired: boolean;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
};

export type ProductTemplateListItemDto = {
  id: number;
  name: string;
  slug: string;
  model: string;
  chipsetFamily: string | null;
  description: string | null;
  commonSpec: unknown;
  media: unknown;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  brand: {
    id: number;
    name: string;
    slug: string;
  };
  variantCount: number;
  minSellingPrice: string | null;
  maxSellingPrice: string | null;
  totalOnHand: number;
  totalAvailable: number;
};

export type ProductTemplateListResult = {
  items: ProductTemplateListItemDto[];
  total: number;
  page: number;
  limit: number;
};

export type VariantStockQuantDetail = {
  id: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  onHand: number;
  reserved: number;
  available: number;
};

export type ProductTemplateDetailVariantDto = {
  id: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  variantSpec: unknown;
  serialRequired: boolean;
  sellingPrice: string;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  stockQuants: VariantStockQuantDetail[];
};

export type ProductTemplateSmartButtonStats = {
  skuCount: number;
  totalOnHand: number;
  totalAvailable: number;
  orderCount: number;
  poCount: number;
  stockMoveCount: number;
};

export type ProductTemplateDetailDto = {
  id: number;
  name: string;
  slug: string;
  model: string;
  chipsetFamily: string | null;
  description: string | null;
  commonSpec: unknown;
  media: unknown;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
    slug: string;
    specificationSchema: unknown;
    specificationSchemaVersion: number;
  };
  brand: {
    id: number;
    name: string;
    slug: string;
  };
  variants: ProductTemplateDetailVariantDto[];
  stats: ProductTemplateSmartButtonStats;
};

export type ProductTemplateRecordDto = {
  id: number;
  categoryId: number;
  brandId: number;
  name: string;
  slug: string;
  model: string;
  chipsetFamily: string | null;
  description: string | null;
  commonSpec: unknown;
  media: unknown;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  brand: {
    id: number;
    name: string;
    slug: string;
  };
};

export class AdminProductTemplateService {
  async getTemplates(query: QueryProductTemplateInput): Promise<ProductTemplateListResult> {
    const where: Prisma.ProductTemplateWhereInput = {};

    if (query.categoryId !== undefined) {
      where.categoryId = query.categoryId;
    }

    if (query.brandId !== undefined) {
      where.brandId = query.brandId;
    }

    if (query.lifecycleState !== undefined) {
      where.lifecycleState = query.lifecycleState;
    }

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { model: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.productTemplate.count({ where });

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = limit > 0 ? (page - 1) * limit : 0;
    const take = limit > 0 ? limit : undefined;

    const templates = await prisma.productTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            isActive: true,
            sellingPrice: true,
            stockQuants: {
              select: {
                onHand: true,
                reserved: true,
              },
            },
          },
        },
      },
    });

    const items: ProductTemplateListItemDto[] = templates.map((template) => {
      let minPrice: Prisma.Decimal | null = null;
      let maxPrice: Prisma.Decimal | null = null;
      let totalOnHand = 0;
      let totalAvailable = 0;

      for (const variant of template.variants) {
        if (!minPrice || variant.sellingPrice.lessThan(minPrice)) {
          minPrice = variant.sellingPrice;
        }
        if (!maxPrice || variant.sellingPrice.greaterThan(maxPrice)) {
          maxPrice = variant.sellingPrice;
        }
        for (const quant of variant.stockQuants) {
          totalOnHand += quant.onHand;
          totalAvailable += Math.max(0, quant.onHand - quant.reserved);
        }
      }

      return {
        id: template.id,
        name: template.name,
        slug: template.slug,
        model: template.model,
        chipsetFamily: template.chipsetFamily,
        description: template.description,
        commonSpec: template.commonSpec,
        media: template.media,
        lifecycleState: template.lifecycleState,
        isActive: template.isActive,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        category: template.category,
        brand: template.brand,
        variantCount: template.variants.length,
        minSellingPrice: minPrice ? minPrice.toFixed(0) : null,
        maxSellingPrice: maxPrice ? maxPrice.toFixed(0) : null,
        totalOnHand,
        totalAvailable,
      };
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getTemplateById(id: number): Promise<ProductTemplateDetailDto> {
    const template = await prisma.productTemplate.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            specificationSchema: true,
            specificationSchemaVersion: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          include: {
            stockQuants: {
              include: {
                branch: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!template) {
      throw new DomainError('TEMPLATE_NOT_FOUND', {
        messageKey: 'error.templateNotFound',
        status: 404,
      });
    }

    const skuIds = template.variants.map((v) => v.id);

    let orderCount = 0;
    let poCount = 0;
    let stockMoveCount = 0;

    if (skuIds.length > 0) {
      const [oCount, pCount, sCount] = await Promise.all([
        prisma.orderLine.count({ where: { skuId: { in: skuIds } } }),
        prisma.purchaseOrderLine.count({ where: { skuId: { in: skuIds } } }),
        prisma.stockMoveLine.count({ where: { skuId: { in: skuIds } } }),
      ]);
      orderCount = oCount;
      poCount = pCount;
      stockMoveCount = sCount;
    }

    let overallOnHand = 0;
    let overallAvailable = 0;

    const mappedVariants: ProductTemplateDetailVariantDto[] = template.variants.map((variant) => {
      let variantOnHand = 0;
      let variantReserved = 0;
      let variantAvailable = 0;

      const quants: VariantStockQuantDetail[] = variant.stockQuants.map((quant) => {
        const available = Math.max(0, quant.onHand - quant.reserved);
        variantOnHand += quant.onHand;
        variantReserved += quant.reserved;
        variantAvailable += available;

        return {
          id: quant.id,
          branchId: quant.branchId,
          branchName: quant.branch.name,
          branchCode: quant.branch.code,
          onHand: quant.onHand,
          reserved: quant.reserved,
          available,
        };
      });

      overallOnHand += variantOnHand;
      overallAvailable += variantAvailable;

      return {
        id: variant.id,
        sku: variant.sku,
        barcode: variant.barcode,
        variationLabel: variant.variationLabel,
        variantSpec: variant.variantSpec,
        serialRequired: variant.serialRequired,
        sellingPrice: variant.sellingPrice.toFixed(0),
        lifecycleState: variant.lifecycleState,
        isActive: variant.isActive,
        totalOnHand: variantOnHand,
        totalReserved: variantReserved,
        totalAvailable: variantAvailable,
        stockQuants: quants,
      };
    });

    return {
      id: template.id,
      name: template.name,
      slug: template.slug,
      model: template.model,
      chipsetFamily: template.chipsetFamily,
      description: template.description,
      commonSpec: template.commonSpec,
      media: template.media,
      lifecycleState: template.lifecycleState,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      category: template.category,
      brand: template.brand,
      variants: mappedVariants,
      stats: {
        skuCount: template.variants.length,
        totalOnHand: overallOnHand,
        totalAvailable: overallAvailable,
        orderCount,
        poCount,
        stockMoveCount,
      },
    };
  }

  async createTemplate(input: CreateProductTemplateInput): Promise<ProductTemplateRecordDto> {
    const existingSlug = await prisma.productTemplate.findUnique({
      where: { slug: input.slug },
    });
    if (existingSlug) {
      throw new DomainError('SLUG_ALREADY_EXISTS', {
        messageKey: 'error.slugExists',
        status: 409,
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new DomainError('CATEGORY_NOT_FOUND', {
        messageKey: 'error.categoryNotFound',
        status: 404,
      });
    }

    const brand = await prisma.brand.findUnique({
      where: { id: input.brandId },
    });
    if (!brand) {
      throw new DomainError('BRAND_NOT_FOUND', {
        messageKey: 'error.brandNotFound',
        status: 404,
      });
    }

    const created = await prisma.productTemplate.create({
      data: {
        name: input.name,
        slug: input.slug,
        categoryId: input.categoryId,
        brandId: input.brandId,
        model: input.model,
        chipsetFamily: input.chipsetFamily ?? null,
        description: input.description ?? null,
        commonSpec: (input.commonSpec as Prisma.InputJsonValue) ?? {},
        media: (input.media as Prisma.InputJsonValue) ?? [],
        lifecycleState: input.lifecycleState ?? 'DRAFT',
        isActive: input.isActive ?? true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return created;
  }

  async updateTemplate(
    id: number,
    input: UpdateProductTemplateInput,
  ): Promise<ProductTemplateRecordDto> {
    const existing = await prisma.productTemplate.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new DomainError('TEMPLATE_NOT_FOUND', {
        messageKey: 'error.templateNotFound',
        status: 404,
      });
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await prisma.productTemplate.findUnique({
        where: { slug: input.slug },
      });
      if (slugConflict) {
        throw new DomainError('SLUG_ALREADY_EXISTS', {
          messageKey: 'error.slugExists',
          status: 409,
        });
      }
    }

    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new DomainError('CATEGORY_NOT_FOUND', {
          messageKey: 'error.categoryNotFound',
          status: 404,
        });
      }
    }

    if (input.brandId && input.brandId !== existing.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: input.brandId },
      });
      if (!brand) {
        throw new DomainError('BRAND_NOT_FOUND', {
          messageKey: 'error.brandNotFound',
          status: 404,
        });
      }
    }

    const updated = await prisma.productTemplate.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.brandId !== undefined ? { brandId: input.brandId } : {}),
        ...(input.model !== undefined ? { model: input.model } : {}),
        ...(input.chipsetFamily !== undefined ? { chipsetFamily: input.chipsetFamily } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.commonSpec !== undefined
          ? { commonSpec: input.commonSpec as Prisma.InputJsonValue }
          : {}),
        ...(input.media !== undefined ? { media: input.media as Prisma.InputJsonValue } : {}),
        ...(input.lifecycleState !== undefined ? { lifecycleState: input.lifecycleState } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return updated;
  }

  async transitionLifecycle(
    id: number,
    targetState: ProductLifecycleState,
    _reason?: string,
  ): Promise<ProductTemplateRecordDto> {
    const template = await prisma.productTemplate.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
        },
      },
    });

    if (!template) {
      throw new DomainError('TEMPLATE_NOT_FOUND', {
        messageKey: 'error.templateNotFound',
        status: 404,
      });
    }

    if (targetState === 'ACTIVE') {
      let specSchemaRaw = template.category.specificationSchema;
      if (
        Array.isArray(specSchemaRaw) &&
        specSchemaRaw.length === 0 &&
        template.category.parentId
      ) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: template.category.parentId },
          select: { specificationSchema: true },
        });
        if (
          parentCategory &&
          Array.isArray(parentCategory.specificationSchema) &&
          parentCategory.specificationSchema.length > 0
        ) {
          specSchemaRaw = parentCategory.specificationSchema;
        }
      }

      const specAttrs = normalizeSpecSchema(specSchemaRaw);
      const commonSpec = (
        template.commonSpec && typeof template.commonSpec === 'object'
          ? template.commonSpec
          : {}
      ) as Record<string, unknown>;

      const missingFields: string[] = [];
      for (const attr of specAttrs) {
        if (attr.required && !attr.isDeprecated) {
          const val = commonSpec[attr.key];
          const isEmpty =
            val === undefined ||
            val === null ||
            (typeof val === 'string' && val.trim().length === 0) ||
            (Array.isArray(val) && val.length === 0);
          if (isEmpty) {
            missingFields.push(attr.label || attr.key);
          }
        }
      }

      const activeVariants = template.variants.filter((v) => v.lifecycleState === 'ACTIVE');
      const hasActiveVariant = activeVariants.length > 0;

      if (missingFields.length > 0 || !hasActiveVariant) {
        throw new DomainError('CANNOT_ACTIVATE_TEMPLATE', {
          ruleId: 'CAT-008',
          messageKey: 'error.cannotActivateTemplate',
          status: 400,
          details: {
            missingFields,
            hasActiveVariant,
            message:
              'Mau san pham bat buoc phai co day du thong so ky thuat bat buoc va it nhat 1 bien the SKU o trang thai ACTIVE.',
          },
        });
      }
    }

    const updated = await prisma.productTemplate.update({
      where: { id },
      data: { lifecycleState: targetState },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return updated;
  }

  async toggleTemplateStatus(id: number): Promise<ProductTemplateRecordDto> {
    const existing = await prisma.productTemplate.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new DomainError('TEMPLATE_NOT_FOUND', {
        messageKey: 'error.templateNotFound',
        status: 404,
      });
    }

    const updated = await prisma.productTemplate.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteTemplate(id: number): Promise<{ success: boolean; id: number }> {
    const template = await prisma.productTemplate.findUnique({
      where: { id },
      include: {
        variants: {
          select: {
            id: true,
            sku: true,
            stockQuants: {
              select: { onHand: true },
            },
          },
        },
      },
    });

    if (!template) {
      throw new DomainError('TEMPLATE_NOT_FOUND', {
        messageKey: 'error.templateNotFound',
        status: 404,
      });
    }

    const skuIds = template.variants.map((v) => v.id);
    let hasStock = false;
    for (const variant of template.variants) {
      for (const quant of variant.stockQuants) {
        if (quant.onHand > 0) {
          hasStock = true;
          break;
        }
      }
      if (hasStock) {
        break;
      }
    }

    let hasTransactions = false;
    if (!hasStock && skuIds.length > 0) {
      const [orderLineCount, poLineCount, stockMoveLineCount, ledgerCount] = await Promise.all([
        prisma.orderLine.count({ where: { skuId: { in: skuIds } } }),
        prisma.purchaseOrderLine.count({ where: { skuId: { in: skuIds } } }),
        prisma.stockMoveLine.count({ where: { skuId: { in: skuIds } } }),
        prisma.stockLedgerEntry.count({
          where: { stockQuant: { skuId: { in: skuIds } } },
        }),
      ]);
      if (orderLineCount > 0 || poLineCount > 0 || stockMoveLineCount > 0 || ledgerCount > 0) {
        hasTransactions = true;
      }
    }

    if (hasStock || hasTransactions) {
      throw new DomainError('CANNOT_DELETE_ACTIVE_TRANSACTIONS', {
        ruleId: 'CAT-010',
        messageKey: 'error.cannotDeleteHasTransactions',
        status: 400,
        details: {
          hasStock,
          hasTransactions,
          message:
            'Mau san pham da phat sinh giao dich hoac co ton kho. Vui long chuyen trang thai sang DISCONTINUED.',
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      if (skuIds.length > 0) {
        await tx.stockQuant.deleteMany({ where: { skuId: { in: skuIds } } });
        await tx.serialUnit.deleteMany({ where: { skuId: { in: skuIds } } });
        await tx.cartItem.deleteMany({ where: { skuId: { in: skuIds } } });
        await tx.pcBundleItem.deleteMany({ where: { skuId: { in: skuIds } } });
        await tx.promotionSku.deleteMany({ where: { skuId: { in: skuIds } } });
        await tx.couponSkuRule.deleteMany({ where: { skuId: { in: skuIds } } });
      }
      await tx.review.deleteMany({ where: { productTemplateId: id } });
      await tx.productVariant.deleteMany({ where: { productTemplateId: id } });
      await tx.productTemplate.delete({ where: { id } });
    });

    return { success: true, id };
  }
}

export const adminProductTemplateService = new AdminProductTemplateService();
