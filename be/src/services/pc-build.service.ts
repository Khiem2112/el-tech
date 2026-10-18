import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type BuildLineInput = { skuId: number; quantity: number };
type BuildLine = { skuId: number; sku: string; name: string; quantity: number; unitPrice: string; lineTotal: string };
type BuildPreview = { lines: readonly BuildLine[]; total: string };

const serializeLines = (lines: readonly { skuId: number; quantity: number; sku: { sku: string; sellingPrice: Prisma.Decimal; productTemplate: { name: string } } }[]): BuildPreview => {
  const mapped = lines.map((line) => ({ skuId: line.skuId, sku: line.sku.sku, name: line.sku.productTemplate.name, quantity: line.quantity, unitPrice: line.sku.sellingPrice.toFixed(0), lineTotal: line.sku.sellingPrice.mul(line.quantity).toFixed(0) }));
  return { lines: mapped, total: mapped.reduce((sum, line) => sum.add(line.lineTotal), new Prisma.Decimal(0)).toFixed(0) };
};

export const pcBuildService = {
  async listBundles(): Promise<readonly { id: number; name: string; slug: string; description: string | null; build: BuildPreview }[]> {
    const bundles = await prisma.pcBundle.findMany({ where: { isActive: true, lifecycleState: 'ACTIVE' }, include: { items: { where: { isActive: true }, include: { sku: { include: { productTemplate: true } } }, orderBy: { sortOrder: 'asc' } } }, orderBy: { name: 'asc' } });
    return bundles.map((bundle) => ({ id: bundle.id, name: bundle.name, slug: bundle.slug, description: bundle.description, build: serializeLines(bundle.items) }));
  },
  async preview(lines: readonly BuildLineInput[]): Promise<BuildPreview> {
    const normalized = lines.filter((line) => Number.isInteger(line.skuId) && Number.isInteger(line.quantity) && line.quantity > 0);
    const skus = await prisma.productVariant.findMany({ where: { id: { in: normalized.map((line) => line.skuId) }, isActive: true, lifecycleState: 'ACTIVE', productTemplate: { isActive: true, lifecycleState: 'ACTIVE' } }, include: { productTemplate: true } });
    if (skus.length !== normalized.length) throw new Error('SKU_NOT_SELLABLE');
    return serializeLines(normalized.map((line) => ({ ...line, sku: skus.find((sku) => sku.id === line.skuId)! })));
  },
};
