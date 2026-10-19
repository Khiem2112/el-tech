import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type BuildLineInput = { skuId: number; quantity: number };
type BuildLine = {
  skuId: number;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  specs: string;
  socket?: string;
  memoryType?: string;
  tdp?: number;
  wattage?: number;
};
type BuildPreview = { lines: readonly BuildLine[]; total: string };

export type ComponentItemDto = {
  id: string;
  skuId: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  tdp: number;
  specs: string;
  tag?: string;
  imageUrl?: string;
  socket?: string;
  memoryType?: string;
  lengthMm?: number;
  stockStatus: string;
};

const extractSpecString = (commonSpec: unknown): string => {
  if (!commonSpec || typeof commonSpec !== 'object') return '';
  const entries = Object.entries(commonSpec as Record<string, unknown>);
  return entries
    .slice(0, 4)
    .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${val}`)
    .join(' • ');
};

const serializeLines = (
  lines: readonly {
    skuId: number;
    quantity: number;
    sku: {
      sku: string;
      sellingPrice: Prisma.Decimal;
      productTemplate: {
        name: string;
        commonSpec: Prisma.JsonValue;
        category: { slug: string };
      };
    };
  }[]
): BuildPreview => {
  const mapped: BuildLine[] = lines.map((line) => {
    const spec = (line.sku.productTemplate.commonSpec as Record<string, unknown>) || {};
    return {
      skuId: line.skuId,
      sku: line.sku.sku,
      name: line.sku.productTemplate.name,
      category: line.sku.productTemplate.category.slug === 'tan-nhiet' ? 'cooling' : line.sku.productTemplate.category.slug,
      quantity: line.quantity,
      unitPrice: line.sku.sellingPrice.toFixed(0),
      lineTotal: line.sku.sellingPrice.mul(line.quantity).toFixed(0),
      specs: extractSpecString(line.sku.productTemplate.commonSpec),
      socket: typeof spec.socket === 'string' ? spec.socket : undefined,
      memoryType: typeof spec.ram_type === 'string' ? spec.ram_type : undefined,
      tdp: typeof spec.tdp === 'number' ? spec.tdp : undefined,
      wattage: typeof spec.wattage === 'number' ? spec.wattage : undefined,
    };
  });

  const total = mapped.reduce(
    (sum, line) => sum.add(new Prisma.Decimal(line.lineTotal)),
    new Prisma.Decimal(0)
  ).toFixed(0);

  return { lines: mapped, total };
};

export const pcBuildService = {
  async listBundles(): Promise<readonly { id: number; name: string; slug: string; description: string | null; build: BuildPreview }[]> {
    const bundles = await prisma.pcBundle.findMany({
      where: { isActive: true, lifecycleState: 'ACTIVE' },
      include: {
        items: {
          where: { isActive: true },
          include: {
            sku: {
              include: {
                productTemplate: {
                  include: { category: { select: { slug: true } } },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    return bundles.map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      description: bundle.description,
      build: serializeLines(bundle.items),
    }));
  },

  async getComponents(categorySlug?: string): Promise<readonly ComponentItemDto[]> {
    const slugMap: Record<string, string> = {
      cooling: 'tan-nhiet',
    };
    const resolvedSlug = categorySlug ? slugMap[categorySlug] || categorySlug : undefined;

    const variants = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        lifecycleState: 'ACTIVE',
        productTemplate: {
          isActive: true,
          lifecycleState: 'ACTIVE',
          ...(resolvedSlug ? { category: { slug: resolvedSlug } } : {}),
        },
      },
      include: {
        productTemplate: {
          include: {
            category: { select: { slug: true, name: true } },
            brand: { select: { name: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
      take: 60,
    });

    return variants.map((variant): ComponentItemDto => {
      const template = variant.productTemplate;
      const spec = (template.commonSpec as Record<string, unknown>) || {};
      const catSlug = template.category.slug === 'tan-nhiet' ? 'cooling' : template.category.slug;

      let tag: string | undefined;
      if (typeof spec.socket === 'string') tag = `Socket ${spec.socket}`;
      else if (typeof spec.form_factor === 'string') tag = spec.form_factor;
      else if (typeof spec.ram_type === 'string') tag = spec.ram_type;
      else if (typeof spec.wattage === 'number') tag = `${spec.wattage}W`;
      else if (typeof spec.tdp === 'number') tag = `TDP ${spec.tdp}W`;

      return {
        id: `sku-${variant.id}`,
        skuId: variant.id,
        name: template.name,
        brand: template.brand?.name || 'EL-TECH',
        category: catSlug,
        price: Number(variant.sellingPrice),
        tdp: typeof spec.tdp === 'number' ? spec.tdp : 45,
        specs: extractSpecString(template.commonSpec),
        tag,
        socket: typeof spec.socket === 'string' ? spec.socket : undefined,
        memoryType: typeof spec.ram_type === 'string' ? spec.ram_type : undefined,
        lengthMm: typeof spec.length_mm === 'number' ? spec.length_mm : undefined,
        stockStatus: 'Sẵn hàng tại HN & HCM',
      };
    });
  },

  async preview(lines: readonly BuildLineInput[]): Promise<BuildPreview> {
    const normalized = lines.filter((line) => Number.isInteger(line.skuId) && Number.isInteger(line.quantity) && line.quantity > 0);
    const skus = await prisma.productVariant.findMany({
      where: {
        id: { in: normalized.map((line) => line.skuId) },
        isActive: true,
        lifecycleState: 'ACTIVE',
        productTemplate: { isActive: true, lifecycleState: 'ACTIVE' },
      },
      include: {
        productTemplate: {
          include: { category: { select: { slug: true } } },
        },
      },
    });

    if (skus.length !== normalized.length) throw new Error('SKU_NOT_SELLABLE');
    return serializeLines(normalized.map((line) => ({ ...line, sku: skus.find((sku) => sku.id === line.skuId)! })));
  },
};
