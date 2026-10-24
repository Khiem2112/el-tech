import { Prisma, ProductLifecycle } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreateProductVariantInput,
  ProductLifecycleState,
  QueryProductVariantInput,
  UpdateProductVariantInput,
} from '../../validations/admin/product-template.schema.js';

export type ProductVariantListItemDto = {
  id: number;
  productTemplateId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  variantSpec: unknown;
  serialRequired: boolean;
  sellingPrice: string;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productTemplate: {
    id: number;
    name: string;
    slug: string;
    model: string;
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
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
};

export type ProductVariantListResult = {
  items: ProductVariantListItemDto[];
  total: number;
  page: number;
  limit: number;
};

export type VariantStockQuantBranchDto = {
  id: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  branchAddress: string;
  onHand: number;
  reserved: number;
  available: number;
};

export type ProductVariantDetailDto = {
  id: number;
  productTemplateId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  variantSpec: unknown;
  serialRequired: boolean;
  sellingPrice: string;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productTemplate: {
    id: number;
    name: string;
    slug: string;
    model: string;
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
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  stockQuants: VariantStockQuantBranchDto[];
};

export type ProductVariantRecordDto = {
  id: number;
  productTemplateId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  variantSpec: unknown;
  serialRequired: boolean;
  sellingPrice: string;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productTemplate?: {
    id: number;
    name: string;
    slug: string;
  };
};

export class AdminProductVariantService {
  async getVariants(query: QueryProductVariantInput): Promise<ProductVariantListResult> {
    const where: Prisma.ProductVariantWhereInput = {};

    if (query.productTemplateId !== undefined) {
      where.productTemplateId = query.productTemplateId;
    }

    if (query.categoryId !== undefined || query.brandId !== undefined) {
      where.productTemplate = {
        ...(where.productTemplate as Prisma.ProductTemplateWhereInput),
        ...(query.categoryId !== undefined ? { categoryId: query.categoryId } : {}),
        ...(query.brandId !== undefined ? { brandId: query.brandId } : {}),
      };
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
        { sku: { contains: term, mode: 'insensitive' } },
        { barcode: { contains: term, mode: 'insensitive' } },
        { variationLabel: { contains: term, mode: 'insensitive' } },
        { productTemplate: { name: { contains: term, mode: 'insensitive' } } },
        { productTemplate: { model: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const total = await prisma.productVariant.count({ where });

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = limit > 0 ? (page - 1) * limit : 0;
    const take = limit > 0 ? limit : undefined;

    const variants = await prisma.productVariant.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      include: {
        productTemplate: {
          select: {
            id: true,
            name: true,
            slug: true,
            model: true,
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
        },
        stockQuants: {
          select: {
            onHand: true,
            reserved: true,
          },
        },
      },
    });

    const items: ProductVariantListItemDto[] = variants.map((variant) => {
      let totalOnHand = 0;
      let totalReserved = 0;
      let totalAvailable = 0;

      for (const quant of variant.stockQuants) {
        totalOnHand += quant.onHand;
        totalReserved += quant.reserved;
        totalAvailable += Math.max(0, quant.onHand - quant.reserved);
      }

      return {
        id: variant.id,
        productTemplateId: variant.productTemplateId,
        sku: variant.sku,
        barcode: variant.barcode,
        variationLabel: variant.variationLabel,
        variantSpec: variant.variantSpec,
        serialRequired: variant.serialRequired,
        sellingPrice: variant.sellingPrice.toFixed(0),
        lifecycleState: variant.lifecycleState,
        isActive: variant.isActive,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
        productTemplate: variant.productTemplate,
        totalOnHand,
        totalReserved,
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

  async getVariantById(id: number): Promise<ProductVariantDetailDto> {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        productTemplate: {
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
        },
        stockQuants: {
          include: {
            branch: {
              select: {
                id: true,
                code: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      throw new DomainError('VARIANT_NOT_FOUND', {
        messageKey: 'error.variantNotFound',
        status: 404,
      });
    }

    let totalOnHand = 0;
    let totalReserved = 0;
    let totalAvailable = 0;

    const quants: VariantStockQuantBranchDto[] = variant.stockQuants.map((quant) => {
      const available = Math.max(0, quant.onHand - quant.reserved);
      totalOnHand += quant.onHand;
      totalReserved += quant.reserved;
      totalAvailable += available;

      return {
        id: quant.id,
        branchId: quant.branchId,
        branchName: quant.branch.name,
        branchCode: quant.branch.code,
        branchAddress: quant.branch.address,
        onHand: quant.onHand,
        reserved: quant.reserved,
        available,
      };
    });

    return {
      id: variant.id,
      productTemplateId: variant.productTemplateId,
      sku: variant.sku,
      barcode: variant.barcode,
      variationLabel: variant.variationLabel,
      variantSpec: variant.variantSpec,
      serialRequired: variant.serialRequired,
      sellingPrice: variant.sellingPrice.toFixed(0),
      lifecycleState: variant.lifecycleState,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
      productTemplate: variant.productTemplate,
      totalOnHand,
      totalReserved,
      totalAvailable,
      stockQuants: quants,
    };
  }

  async createVariant(input: CreateProductVariantInput): Promise<ProductVariantRecordDto> {
    const template = await prisma.productTemplate.findUnique({
      where: { id: input.productTemplateId },
    });
    if (!template) {
      throw new DomainError('TEMPLATE_NOT_FOUND', {
        messageKey: 'error.templateNotFound',
        status: 404,
      });
    }

    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: input.sku },
    });
    if (existingSku) {
      throw new DomainError('SKU_ALREADY_EXISTS', {
        messageKey: 'error.skuExists',
        status: 409,
      });
    }

    if (input.barcode) {
      const existingBarcode = await prisma.productVariant.findUnique({
        where: { barcode: input.barcode },
      });
      if (existingBarcode) {
        throw new DomainError('BARCODE_ALREADY_EXISTS', {
          messageKey: 'error.barcodeExists',
          status: 409,
        });
      }
    }

    const sellingPrice = new Prisma.Decimal(input.sellingPrice);

    const created = await prisma.productVariant.create({
      data: {
        productTemplateId: input.productTemplateId,
        sku: input.sku,
        barcode: input.barcode ?? null,
        variationLabel: input.variationLabel ?? null,
        variantSpec: (input.variantSpec as Prisma.InputJsonValue) ?? {},
        serialRequired: input.serialRequired ?? false,
        sellingPrice,
        lifecycleState: input.lifecycleState ?? 'DRAFT',
        isActive: input.isActive ?? true,
      },
      include: {
        productTemplate: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      id: created.id,
      productTemplateId: created.productTemplateId,
      sku: created.sku,
      barcode: created.barcode,
      variationLabel: created.variationLabel,
      variantSpec: created.variantSpec,
      serialRequired: created.serialRequired,
      sellingPrice: created.sellingPrice.toFixed(0),
      lifecycleState: created.lifecycleState,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      productTemplate: created.productTemplate,
    };
  }

  async updateVariant(
    id: number,
    input: UpdateProductVariantInput,
  ): Promise<ProductVariantRecordDto> {
    const existing = await prisma.productVariant.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new DomainError('VARIANT_NOT_FOUND', {
        messageKey: 'error.variantNotFound',
        status: 404,
      });
    }

    if (input.productTemplateId && input.productTemplateId !== existing.productTemplateId) {
      const template = await prisma.productTemplate.findUnique({
        where: { id: input.productTemplateId },
      });
      if (!template) {
        throw new DomainError('TEMPLATE_NOT_FOUND', {
          messageKey: 'error.templateNotFound',
          status: 404,
        });
      }
    }

    if (input.sku && input.sku !== existing.sku) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku: input.sku },
      });
      if (existingSku) {
        throw new DomainError('SKU_ALREADY_EXISTS', {
          messageKey: 'error.skuExists',
          status: 409,
        });
      }
    }

    if (input.barcode !== undefined && input.barcode !== null && input.barcode !== existing.barcode) {
      const existingBarcode = await prisma.productVariant.findUnique({
        where: { barcode: input.barcode },
      });
      if (existingBarcode) {
        throw new DomainError('BARCODE_ALREADY_EXISTS', {
          messageKey: 'error.barcodeExists',
          status: 409,
        });
      }
    }

    const data: Prisma.ProductVariantUpdateInput = {
      ...(input.sku !== undefined ? { sku: input.sku } : {}),
      ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
      ...(input.variationLabel !== undefined ? { variationLabel: input.variationLabel } : {}),
      ...(input.variantSpec !== undefined
        ? { variantSpec: input.variantSpec as Prisma.InputJsonValue }
        : {}),
      ...(input.serialRequired !== undefined ? { serialRequired: input.serialRequired } : {}),
      ...(input.sellingPrice !== undefined
        ? { sellingPrice: new Prisma.Decimal(input.sellingPrice) }
        : {}),
      ...(input.lifecycleState !== undefined ? { lifecycleState: input.lifecycleState } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };

    if (input.productTemplateId !== undefined) {
      data.productTemplate = { connect: { id: input.productTemplateId } };
    }

    const updated = await prisma.productVariant.update({
      where: { id },
      data,
      include: {
        productTemplate: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      productTemplateId: updated.productTemplateId,
      sku: updated.sku,
      barcode: updated.barcode,
      variationLabel: updated.variationLabel,
      variantSpec: updated.variantSpec,
      serialRequired: updated.serialRequired,
      sellingPrice: updated.sellingPrice.toFixed(0),
      lifecycleState: updated.lifecycleState,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      productTemplate: updated.productTemplate,
    };
  }

  async transitionLifecycle(
    id: number,
    targetState: ProductLifecycleState,
    _reason?: string,
  ): Promise<ProductVariantRecordDto> {
    const existing = await prisma.productVariant.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new DomainError('VARIANT_NOT_FOUND', {
        messageKey: 'error.variantNotFound',
        status: 404,
      });
    }

    const updated = await prisma.productVariant.update({
      where: { id },
      data: { lifecycleState: targetState },
      include: {
        productTemplate: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      productTemplateId: updated.productTemplateId,
      sku: updated.sku,
      barcode: updated.barcode,
      variationLabel: updated.variationLabel,
      variantSpec: updated.variantSpec,
      serialRequired: updated.serialRequired,
      sellingPrice: updated.sellingPrice.toFixed(0),
      lifecycleState: updated.lifecycleState,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      productTemplate: updated.productTemplate,
    };
  }

  async deleteVariant(id: number): Promise<{ success: boolean; id: number }> {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        stockQuants: {
          select: { onHand: true },
        },
      },
    });

    if (!variant) {
      throw new DomainError('VARIANT_NOT_FOUND', {
        messageKey: 'error.variantNotFound',
        status: 404,
      });
    }

    let hasStock = false;
    for (const quant of variant.stockQuants) {
      if (quant.onHand > 0) {
        hasStock = true;
        break;
      }
    }

    let hasTransactions = false;
    if (!hasStock) {
      const [orderLineCount, poLineCount, stockMoveLineCount, ledgerCount] = await Promise.all([
        prisma.orderLine.count({ where: { skuId: id } }),
        prisma.purchaseOrderLine.count({ where: { skuId: id } }),
        prisma.stockMoveLine.count({ where: { skuId: id } }),
        prisma.stockLedgerEntry.count({
          where: { stockQuant: { skuId: id } },
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
            'Bien the da phat sinh giao dich hoac co ton kho. Vui long chuyen trang thai sang DISCONTINUED.',
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.stockQuant.deleteMany({ where: { skuId: id } });
      await tx.serialUnit.deleteMany({ where: { skuId: id } });
      await tx.cartItem.deleteMany({ where: { skuId: id } });
      await tx.pcBundleItem.deleteMany({ where: { skuId: id } });
      await tx.promotionSku.deleteMany({ where: { skuId: id } });
      await tx.couponSkuRule.deleteMany({ where: { skuId: id } });
      await tx.review.deleteMany({ where: { skuId: id } });
      await tx.productVariant.delete({ where: { id } });
    });

    return { success: true, id };
  }

  async toggleVariantStatus(id: number): Promise<ProductVariantRecordDto> {
    const existing = await prisma.productVariant.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new DomainError('VARIANT_NOT_FOUND', {
        messageKey: 'error.variantNotFound',
        status: 404,
      });
    }

    const updated = await prisma.productVariant.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: {
        productTemplate: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      productTemplateId: updated.productTemplateId,
      sku: updated.sku,
      barcode: updated.barcode,
      variationLabel: updated.variationLabel,
      variantSpec: updated.variantSpec,
      serialRequired: updated.serialRequired,
      sellingPrice: updated.sellingPrice.toFixed(0),
      lifecycleState: updated.lifecycleState,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      productTemplate: updated.productTemplate,
    };
  }
}

export const adminProductVariantService = new AdminProductVariantService();
