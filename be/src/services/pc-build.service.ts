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
  imageUrl?: string;
  socket?: string;
  memoryType?: string;
  tdp?: number;
  wattage?: number;
};
type BuildPreview = { lines: readonly BuildLine[]; total: string; discountAmount?: string; finalTotal?: string };

export type ComponentItemDto = {
  id: string;
  skuId: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  tdp: number;
  wattage?: number;
  specs: string;
  tag?: string;
  imageUrl?: string;
  socket?: string;
  memoryType?: string;
  lengthMm?: number;
  stockStatus: string;
  commonSpec?: Record<string, unknown>;
};

const mapCategoryToCanonical = (slug: string): string => {
  if (slug === 'tan-nhiet') return 'cooling';
  if (slug === 'man-hinh') return 'monitor';
  if (slug === 'ban-phim') return 'keyboard';
  if (slug === 'chuot-may-tinh') return 'mouse';
  if (slug === 'tai-nghe') return 'headphone';
  return slug;
};

const extractImageUrl = (media: unknown): string | undefined => {
  if (!media) return undefined;
  if (Array.isArray(media) && media.length > 0) {
    const primary = media.find((item) => item && typeof item === 'object' && item.is_primary);
    const chosen = primary || media[0];
    if (typeof chosen === 'string' && chosen.trim()) return chosen.trim();
    if (chosen && typeof chosen === 'object' && 'url' in chosen && typeof chosen.url === 'string') {
      return chosen.url.trim();
    }
  }
  if (typeof media === 'string') {
    const trimmed = media.trim();
    if (trimmed.startsWith('http') || trimmed.startsWith('/')) return trimmed;
    try {
      const parsed = JSON.parse(trimmed);
      return extractImageUrl(parsed);
    } catch {
      return undefined;
    }
  }
  if (typeof media === 'object' && media !== null && 'url' in media && typeof (media as Record<string, unknown>).url === 'string') {
    return (media as Record<string, unknown>).url as string;
  }
  return undefined;
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
        media?: Prisma.JsonValue;
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
      category: mapCategoryToCanonical(line.sku.productTemplate.category.slug),
      quantity: line.quantity,
      unitPrice: line.sku.sellingPrice.toFixed(0),
      lineTotal: line.sku.sellingPrice.mul(line.quantity).toFixed(0),
      specs: extractSpecString(line.sku.productTemplate.commonSpec),
      imageUrl: extractImageUrl(line.sku.productTemplate.media),
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

export type GetComponentsInput = {
  readonly category?: string;
  readonly query?: string;
  readonly brand?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly specs?: Record<string, string>;
};

export const pcBuildService = {
  async listBundles(): Promise<readonly { id: number; name: string; slug: string; description: string | null; discountAmount: string; build: BuildPreview }[]> {
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

    return bundles.map((bundle) => {
      const build = serializeLines(bundle.items);
      const discount = Number(bundle.discountAmount);
      return {
        id: bundle.id,
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description,
        discountAmount: discount.toFixed(0),
        build: {
          ...build,
          discountAmount: discount.toFixed(0),
          finalTotal: Math.max(0, Number(build.total) - discount).toFixed(0),
        },
      };
    });
  },

  async getComponents(input?: string | GetComponentsInput): Promise<readonly ComponentItemDto[]> {
    const params: GetComponentsInput = typeof input === 'string' ? { category: input } : (input || {});
    const categorySlug = params.category;
    const query = params.query?.trim();
    const brand = params.brand?.trim();
    const minPrice = typeof params.minPrice === 'number' && !Number.isNaN(params.minPrice) ? params.minPrice : undefined;
    const maxPrice = typeof params.maxPrice === 'number' && !Number.isNaN(params.maxPrice) ? params.maxPrice : undefined;

    const slugMap: Record<string, string> = {
      cooling: 'tan-nhiet',
      monitor: 'man-hinh',
      keyboard: 'ban-phim',
      mouse: 'chuot-may-tinh',
      headphone: 'tai-nghe',
      headset: 'tai-nghe',
    };
    const resolvedSlug = categorySlug ? slugMap[categorySlug] || categorySlug : undefined;

    const pcBuilderCategorySlugs = [
      'cpu',
      'mainboard',
      'ram',
      'ssd',
      'vga',
      'psu',
      'tan-nhiet',
      'case',
      'man-hinh',
      'ban-phim',
      'chuot-may-tinh',
      'tai-nghe',
    ];

    const variants = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        lifecycleState: 'ACTIVE',
        ...(minPrice !== undefined ? { sellingPrice: { gte: minPrice } } : {}),
        ...(maxPrice !== undefined ? { sellingPrice: { lte: maxPrice } } : {}),
        productTemplate: {
          isActive: true,
          lifecycleState: 'ACTIVE',
          ...(resolvedSlug
            ? { category: { slug: resolvedSlug } }
            : { category: { slug: { in: pcBuilderCategorySlugs } } }),
          ...(brand ? { brand: { slug: brand } } : {}),
          ...(query
            ? {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { model: { contains: query, mode: 'insensitive' } },
                  { brand: { name: { contains: query, mode: 'insensitive' } } },
                ],
              }
            : {}),
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
      take: resolvedSlug ? 100 : 500,
    });

    let result = variants.map((variant): ComponentItemDto => {
      const template = variant.productTemplate;
      const spec = (template.commonSpec as Record<string, unknown>) || {};
      const catSlug = mapCategoryToCanonical(template.category.slug);

      const rawWattage = spec.wattage ?? spec.power_consumption;
      const specWattage = typeof rawWattage === 'number' ? rawWattage
        : (rawWattage && !Number.isNaN(Number(rawWattage))) ? Number(rawWattage)
        : undefined;

      const rawTdp = spec.tdp;
      const specTdp = typeof rawTdp === 'number' ? rawTdp
        : (rawTdp && !Number.isNaN(Number(rawTdp))) ? Number(rawTdp)
        : undefined;

      let tag: string | undefined;
      if (typeof spec.socket === 'string') tag = `Socket ${spec.socket}`;
      else if (typeof spec.form_factor === 'string') tag = spec.form_factor;
      else if (typeof spec.ram_type === 'string') tag = spec.ram_type;
      else if (specWattage !== undefined) tag = `${specWattage}W`;
      else if (specTdp !== undefined) tag = `TDP ${specTdp}W`;

      return {
        id: `sku-${variant.id}`,
        skuId: variant.id,
        name: template.name,
        brand: template.brand?.name || 'EL-TECH',
        category: catSlug,
        price: Number(variant.sellingPrice),
        tdp: catSlug === 'psu' ? (specWattage ?? 650) : (specTdp ?? specWattage ?? 45),
        wattage: specWattage,
        specs: extractSpecString(template.commonSpec),
        tag,
        imageUrl: extractImageUrl(template.media),
        socket: typeof spec.socket === 'string' ? spec.socket : undefined,
        memoryType: typeof spec.ram_type === 'string' ? spec.ram_type : undefined,
        lengthMm: typeof spec.length_mm === 'number' ? spec.length_mm : undefined,
        stockStatus: 'Sẵn hàng tại HN & HCM',
        commonSpec: spec,
      };
    });

    if (params.specs && Object.keys(params.specs).length > 0) {
      result = result.filter((item) => {
        const spec = item.commonSpec || {};
        for (const [key, expected] of Object.entries(params.specs as Record<string, string>)) {
          if (!expected) continue;
          let actual = spec[key];
          if (actual === undefined || actual === null) {
            if (key === 'socket') actual = item.socket;
            else if (key === 'memory_type' || key === 'ram_type') actual = item.memoryType;
            else if (key === 'wattage') actual = item.wattage ?? item.tdp;
          }
          if (actual === undefined || actual === null) return false;
          const actualStr = String(actual).trim().toLowerCase();
          const expectedStr = String(expected).trim().toLowerCase();
          if (actualStr !== expectedStr && !actualStr.includes(expectedStr)) return false;
        }
        return true;
      });
    }

    return result;
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
