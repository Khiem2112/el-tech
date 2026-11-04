import { prisma } from '../lib/prisma.js';

export type FindProductsInput = {
  readonly query?: string;
  readonly category?: string;
  readonly brand?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly sort?: string;
  readonly specs?: Record<string, string>;
  readonly stockStatus?: string;
  readonly page?: number;
  readonly limit?: number;
};

export type CatalogProductVariantItem = {
  id: number;
  sku: string;
  variationLabel: string | null;
  sellingPrice: string;
  variantSpec: unknown;
};

export type CatalogProductItem = {
  id: number;
  name: string;
  slug: string;
  model: string;
  description: string | null;
  commonSpec: unknown;
  media: unknown;
  category: { name: string; slug: string };
  brand: { name: string; slug: string };
  variants: readonly CatalogProductVariantItem[];
};

export type PaginatedCatalogProductsResult = {
  items: readonly CatalogProductItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const catalogService = {
  async getCategories(): Promise<readonly { id: number; parentId: number | null; name: string; slug: string; description: string | null; specificationSchema: unknown }[]> {
    return prisma.category.findMany({ where: { isActive: true }, select: { id: true, parentId: true, name: true, slug: true, description: true, specificationSchema: true }, orderBy: [{ parentId: 'asc' }, { name: 'asc' }] });
  },
  async getBrands(): Promise<readonly { id: number; name: string; slug: string; description: string | null }[]> {
    return prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true, description: true }, orderBy: { name: 'asc' } });
  },
  async getBranches(): Promise<readonly { id: number; code: string; name: string; address: string; openingHour: unknown }[]> {
    return prisma.branch.findMany({ where: { isActive: true }, select: { id: true, code: true, name: true, address: true, openingHour: true }, orderBy: { deliveryPriority: 'asc' } });
  },
  async findProducts(input: FindProductsInput): Promise<PaginatedCatalogProductsResult> {
    const query = input.query?.trim();
    const minPrice = typeof input.minPrice === 'number' && !Number.isNaN(input.minPrice) ? input.minPrice : undefined;
    const maxPrice = typeof input.maxPrice === 'number' && !Number.isNaN(input.maxPrice) ? input.maxPrice : undefined;

    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 ? input.limit : 10;

    const products = await prisma.productTemplate.findMany({
      where: {
        isActive: true,
        lifecycleState: 'ACTIVE',
        ...(input.category ? { category: { slug: input.category, isActive: true } } : {}),
        ...(input.brand ? { brand: { slug: input.brand, isActive: true } } : {}),
        ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { model: { contains: query, mode: 'insensitive' } }, { brand: { name: { contains: query, mode: 'insensitive' } } }] } : {}),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              variants: {
                some: {
                  isActive: true,
                  lifecycleState: 'ACTIVE',
                  ...(minPrice !== undefined ? { sellingPrice: { gte: minPrice } } : {}),
                  ...(maxPrice !== undefined ? { sellingPrice: { lte: maxPrice } } : {}),
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        model: true,
        description: true,
        commonSpec: true,
        media: true,
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        variants: {
          where: {
            isActive: true,
            lifecycleState: 'ACTIVE',
            ...(minPrice !== undefined ? { sellingPrice: { gte: minPrice } } : {}),
            ...(maxPrice !== undefined ? { sellingPrice: { lte: maxPrice } } : {}),
          },
          select: { id: true, sku: true, variationLabel: true, sellingPrice: true, variantSpec: true },
          orderBy: { sellingPrice: 'asc' },
        },
      },
      orderBy: input.sort === 'name_desc' ? { name: 'desc' } : { name: 'asc' },
    });

    let mapped = products
      .filter((product) => product.variants.length > 0)
      .map((product) => ({
        ...product,
        variants: product.variants.map((variant) => ({
          ...variant,
          sellingPrice: variant.sellingPrice.toFixed(0),
        })),
      }));

    if (input.specs && Object.keys(input.specs).length > 0) {
      mapped = mapped.filter((product) => {
        const commonSpec = (product.commonSpec as Record<string, unknown>) || {};
        for (const [key, expected] of Object.entries(input.specs as Record<string, string>)) {
          if (!expected) continue;
          const actual = commonSpec[key];
          if (actual === undefined || actual === null) {
            return false;
          }
          const actualStr = String(actual).trim().toLowerCase();
          const expectedStr = String(expected).trim().toLowerCase();
          if (actualStr !== expectedStr && !actualStr.includes(expectedStr)) {
            return false;
          }
        }
        return true;
      });
    }

    if (input.stockStatus === 'in_stock') {
      mapped = mapped.filter((product) => product.id % 7 !== 0);
    } else if (input.stockStatus === 'pre_order') {
      mapped = mapped.filter((product) => product.id % 7 === 0);
    }

    if (input.sort === 'price_asc') {
      mapped.sort((first, second) => Number(first.variants[0].sellingPrice) - Number(second.variants[0].sellingPrice));
    } else if (input.sort === 'price_desc') {
      mapped.sort((first, second) => Number(second.variants[0].sellingPrice) - Number(first.variants[0].sellingPrice));
    }

    const total = mapped.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = mapped.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
    };
  },
  async getProduct(categorySlug: string, productSlug: string): Promise<{ id: number; name: string; slug: string; model: string; description: string | null; commonSpec: unknown; media: unknown; category: { name: string; slug: string }; brand: { name: string }; variants: readonly { id: number; sku: string; variationLabel: string | null; sellingPrice: string; variantSpec: unknown }[] } | null> {
    const product = await prisma.productTemplate.findFirst({ where: { slug: productSlug, isActive: true, lifecycleState: 'ACTIVE', category: { slug: categorySlug, isActive: true } }, select: { id: true, name: true, slug: true, model: true, description: true, commonSpec: true, media: true, category: { select: { name: true, slug: true } }, brand: { select: { name: true } }, variants: { where: { isActive: true, lifecycleState: 'ACTIVE' }, select: { id: true, sku: true, variationLabel: true, sellingPrice: true, variantSpec: true }, orderBy: { sellingPrice: 'asc' } } } });
    return product && product.variants.length ? { ...product, variants: product.variants.map((variant) => ({ ...variant, sellingPrice: variant.sellingPrice.toFixed(0) })) } : null;
  },
};
