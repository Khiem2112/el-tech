import { prisma } from '../lib/prisma.js';

export const catalogService = {
  async getCategories(): Promise<readonly { id: number; parentId: number | null; name: string; slug: string; description: string | null }[]> {
    return prisma.category.findMany({ where: { isActive: true }, select: { id: true, parentId: true, name: true, slug: true, description: true }, orderBy: [{ parentId: 'asc' }, { name: 'asc' }] });
  },
  async getBranches(): Promise<readonly { id: number; code: string; name: string; address: string; openingHour: unknown }[]> {
    return prisma.branch.findMany({ where: { isActive: true }, select: { id: true, code: true, name: true, address: true, openingHour: true }, orderBy: { deliveryPriority: 'asc' } });
  },
  async findProducts(input: { query?: string; category?: string }): Promise<readonly { id: number; name: string; slug: string; model: string; description: string | null; category: { name: string; slug: string }; brand: { name: string }; variants: readonly { id: number; sku: string; variationLabel: string | null; sellingPrice: string; variantSpec: unknown }[] }[]> {
    const query = input.query?.trim();
    return prisma.productTemplate.findMany({
      where: {
        isActive: true, lifecycleState: 'ACTIVE',
        ...(input.category ? { category: { slug: input.category, isActive: true } } : {}),
        ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { model: { contains: query, mode: 'insensitive' } }, { brand: { name: { contains: query, mode: 'insensitive' } } }] } : {}),
      },
      select: { id: true, name: true, slug: true, model: true, description: true, category: { select: { name: true, slug: true } }, brand: { select: { name: true } }, variants: { where: { isActive: true, lifecycleState: 'ACTIVE' }, select: { id: true, sku: true, variationLabel: true, sellingPrice: true, variantSpec: true }, orderBy: { sellingPrice: 'asc' } } },
      orderBy: { name: 'asc' },
    }).then((products) => products.filter((product) => product.variants.length > 0).map((product) => ({ ...product, variants: product.variants.map((variant) => ({ ...variant, sellingPrice: variant.sellingPrice.toFixed(0) })) })));
  },
  async getProduct(categorySlug: string, productSlug: string): Promise<{ id: number; name: string; slug: string; model: string; description: string | null; commonSpec: unknown; media: unknown; category: { name: string; slug: string }; brand: { name: string }; variants: readonly { id: number; sku: string; variationLabel: string | null; sellingPrice: string; variantSpec: unknown }[] } | null> {
    const product = await prisma.productTemplate.findFirst({ where: { slug: productSlug, isActive: true, lifecycleState: 'ACTIVE', category: { slug: categorySlug, isActive: true } }, select: { id: true, name: true, slug: true, model: true, description: true, commonSpec: true, media: true, category: { select: { name: true, slug: true } }, brand: { select: { name: true } }, variants: { where: { isActive: true, lifecycleState: 'ACTIVE' }, select: { id: true, sku: true, variationLabel: true, sellingPrice: true, variantSpec: true }, orderBy: { sellingPrice: 'asc' } } } });
    return product && product.variants.length ? { ...product, variants: product.variants.map((variant) => ({ ...variant, sellingPrice: variant.sellingPrice.toFixed(0) })) } : null;
  },
};
