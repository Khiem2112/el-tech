import { Prisma, ProductLifecycle } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export type VariantStockQuantBranchDto = {
  id: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  branchAddress: string;
  onHand: number;
  reserved: number;
  quarantineDamaged: number;
  available: number;
};

export type VariantCatalogItemDto = {
  id: number;
  productTemplateId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  variantSpec: Record<string, unknown>;
  serialRequired: boolean;
  sellingPrice: string;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  productTemplate: {
    id: number;
    name: string;
    slug: string;
    model: string;
    chipsetFamily: string | null;
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
  totalQuarantineDamaged: number;
  totalAvailable: number;
  stockQuants: VariantStockQuantBranchDto[];
};

export type VariantCatalogListResult = {
  items: VariantCatalogItemDto[];
  total: number;
  page: number;
  limit: number;
};

export type QueryVariantCatalogParams = {
  search?: string;
  barcode?: string;
  sku?: string;
  productTemplateId?: number;
  categoryId?: number;
  brandId?: number;
  lifecycleState?: ProductLifecycle;
  serialRequired?: boolean;
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock' | 'reserved' | 'all';
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'sku' | 'sellingPrice' | 'totalAvailable' | 'totalOnHand' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

function extractVariantImageUrl(variantSpec: unknown, templateMedia: unknown): string | null {
  if (variantSpec && typeof variantSpec === 'object') {
    const spec = variantSpec as Record<string, unknown>;
    if (typeof spec['image'] === 'string' && spec['image'].length > 0) {
      return spec['image'];
    }
    if (typeof spec['imageUrl'] === 'string' && spec['imageUrl'].length > 0) {
      return spec['imageUrl'];
    }
  }

  if (Array.isArray(templateMedia) && templateMedia.length > 0) {
    const firstItem = templateMedia[0];
    if (typeof firstItem === 'string' && firstItem.length > 0) {
      return firstItem;
    }
    if (
      firstItem &&
      typeof firstItem === 'object' &&
      'url' in firstItem &&
      typeof (firstItem as { url: unknown }).url === 'string'
    ) {
      return (firstItem as { url: string }).url;
    }
  }

  return null;
}

export class AdminVariantCatalogService {
  async getVariantCatalog(params: QueryVariantCatalogParams): Promise<VariantCatalogListResult> {
    const where: Prisma.ProductVariantWhereInput = {};

    if (params.productTemplateId !== undefined) {
      where.productTemplateId = params.productTemplateId;
    }

    if (params.categoryId !== undefined || params.brandId !== undefined) {
      where.productTemplate = {
        ...(where.productTemplate as Prisma.ProductTemplateWhereInput),
        ...(params.categoryId !== undefined ? { categoryId: params.categoryId } : {}),
        ...(params.brandId !== undefined ? { brandId: params.brandId } : {}),
      };
    }

    if (params.lifecycleState !== undefined) {
      where.lifecycleState = params.lifecycleState;
    }

    if (typeof params.serialRequired === 'boolean') {
      where.serialRequired = params.serialRequired;
    }

    if (typeof params.isActive === 'boolean') {
      where.isActive = params.isActive;
    }

    const conditions: Prisma.ProductVariantWhereInput[] = [];

    if (params.barcode && params.barcode.trim().length > 0) {
      const barcodeTerm = params.barcode.trim();
      conditions.push({
        barcode: { contains: barcodeTerm, mode: 'insensitive' },
      });
    }

    if (params.sku && params.sku.trim().length > 0) {
      const skuTerm = params.sku.trim();
      conditions.push({
        sku: { contains: skuTerm, mode: 'insensitive' },
      });
    }

    if (params.search && params.search.trim().length > 0) {
      const term = params.search.trim();
      conditions.push({
        OR: [
          { sku: { contains: term, mode: 'insensitive' } },
          { barcode: { contains: term, mode: 'insensitive' } },
          { variationLabel: { contains: term, mode: 'insensitive' } },
          { productTemplate: { name: { contains: term, mode: 'insensitive' } } },
          { productTemplate: { model: { contains: term, mode: 'insensitive' } } },
        ],
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const sortBy = params.sortBy ?? 'updatedAt';
    const sortOrder = params.sortOrder ?? 'desc';

    const orderClause: Prisma.ProductVariantOrderByWithRelationInput = {};
    if (sortBy === 'sku') {
      orderClause.sku = sortOrder;
    } else if (sortBy === 'sellingPrice') {
      orderClause.sellingPrice = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderClause.createdAt = sortOrder;
    } else {
      orderClause.updatedAt = sortOrder;
    }

    const variants = await prisma.productVariant.findMany({
      where,
      orderBy: orderClause,
      include: {
        productTemplate: {
          select: {
            id: true,
            name: true,
            slug: true,
            model: true,
            chipsetFamily: true,
            media: true,
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
          where: {
            branch: {
              isActive: true,
            },
          },
          include: {
            branch: {
              select: {
                id: true,
                code: true,
                name: true,
                address: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    let items: VariantCatalogItemDto[] = variants.map((variant) => {
      let totalOnHand = 0;
      let totalReserved = 0;
      let totalQuarantineDamaged = 0;
      let totalAvailable = 0;

      const quants: VariantStockQuantBranchDto[] = variant.stockQuants.map((quant) => {
        const available = Math.max(0, quant.onHand - quant.reserved - quant.quarantineDamaged);
        totalOnHand += quant.onHand;
        totalReserved += quant.reserved;
        totalQuarantineDamaged += quant.quarantineDamaged;
        totalAvailable += available;

        return {
          id: quant.id,
          branchId: quant.branchId,
          branchName: quant.branch.name,
          branchCode: quant.branch.code,
          branchAddress: quant.branch.address,
          onHand: quant.onHand,
          reserved: quant.reserved,
          quarantineDamaged: quant.quarantineDamaged,
          available,
        };
      });

      const imageUrl = extractVariantImageUrl(
        variant.variantSpec,
        variant.productTemplate.media,
      );

      return {
        id: variant.id,
        productTemplateId: variant.productTemplateId,
        sku: variant.sku,
        barcode: variant.barcode,
        variationLabel: variant.variationLabel,
        variantSpec: (variant.variantSpec as Record<string, unknown>) ?? {},
        serialRequired: variant.serialRequired,
        sellingPrice: variant.sellingPrice.toFixed(0),
        lifecycleState: variant.lifecycleState,
        isActive: variant.isActive,
        imageUrl,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
        productTemplate: {
          id: variant.productTemplate.id,
          name: variant.productTemplate.name,
          slug: variant.productTemplate.slug,
          model: variant.productTemplate.model,
          chipsetFamily: variant.productTemplate.chipsetFamily,
          category: variant.productTemplate.category,
          brand: variant.productTemplate.brand,
        },
        totalOnHand,
        totalReserved,
        totalQuarantineDamaged,
        totalAvailable,
        stockQuants: quants,
      };
    });

    if (params.stockStatus && params.stockStatus !== 'all') {
      if (params.stockStatus === 'in-stock') {
        items = items.filter((item) => item.totalAvailable > 5);
      } else if (params.stockStatus === 'low-stock') {
        items = items.filter((item) => item.totalAvailable >= 1 && item.totalAvailable <= 5);
      } else if (params.stockStatus === 'out-of-stock') {
        items = items.filter((item) => item.totalAvailable === 0);
      } else if (params.stockStatus === 'reserved') {
        items = items.filter((item) => item.totalReserved > 0);
      }
    }

    if (sortBy === 'totalAvailable') {
      items.sort((a, b) =>
        sortOrder === 'asc'
          ? a.totalAvailable - b.totalAvailable
          : b.totalAvailable - a.totalAvailable,
      );
    } else if (sortBy === 'totalOnHand') {
      items.sort((a, b) =>
        sortOrder === 'asc'
          ? a.totalOnHand - b.totalOnHand
          : b.totalOnHand - a.totalOnHand,
      );
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = limit > 0 ? items.slice(startIndex, startIndex + limit) : items;

    return {
      items: paginatedItems,
      total,
      page,
      limit,
    };
  }
}

export const adminVariantCatalogService = new AdminVariantCatalogService();
