import { prisma } from '../lib/prisma.js';
import { DomainError } from '../contracts/domain-error.js';

type CartLineInput = { readonly skuId: number; readonly quantity: number };
type CartBuildInput = { readonly buildName: string; readonly buildType: 'PREBUILT' | 'CUSTOM'; readonly sourcePcBundleId?: number; readonly items: readonly { readonly skuId: number; readonly quantity: number }[]; readonly hasAssemblyService?: boolean };
export type CartItemView = { readonly id: string; readonly skuId: number; readonly sku: string; readonly name: string; readonly media?: unknown; readonly quantity: number; readonly unitPrice: string; readonly lineTotal: string; readonly lineType: string; readonly pcBuildKey?: string | null; readonly pcBuildName?: string | null; readonly pcBuildType?: string | null };
type CartView = { readonly token: string; readonly items: readonly CartItemView[]; readonly subtotal: string };

const cartInclude = {
  items: { where: { isActive: true }, orderBy: { sortOrder: 'asc' as const }, include: { sku: { include: { productTemplate: true } } } },
} as const;

const serialize = (cart: { opaqueToken: string; items: readonly { id: string; skuId: number | null; lineType: string; serviceType: string | null; pcBuildKey: string | null; pcBuildName: string | null; pcBuildType: string | null; quantity: number; sku: { sku: string; sellingPrice: { toFixed: (digits: number) => string; mul: (value: number) => { toFixed: (digits: number) => string } }; productTemplate: { name: string; media: unknown } } | null }[] }): CartView => {
  const items = cart.items.flatMap((item) => {
    if (item.lineType === 'SERVICE') {
      return [{
        id: item.id,
        skuId: 0,
        sku: 'SERVICE-ASSEMBLY',
        name: `Dich vu lap rap PC (${item.pcBuildName ?? 'PC'})`,
        media: null,
        quantity: item.quantity,
        unitPrice: '0',
        lineTotal: '0',
        lineType: item.lineType,
        pcBuildKey: item.pcBuildKey,
        pcBuildName: item.pcBuildName,
        pcBuildType: item.pcBuildType,
      }];
    }
    if (item.sku && item.skuId) {
      return [{
        id: item.id,
        skuId: item.skuId,
        sku: item.sku.sku,
        name: item.sku.productTemplate.name,
        media: item.sku.productTemplate.media,
        quantity: item.quantity,
        unitPrice: item.sku.sellingPrice.toFixed(0),
        lineTotal: item.sku.sellingPrice.mul(item.quantity).toFixed(0),
        lineType: item.lineType,
        pcBuildKey: item.pcBuildKey,
        pcBuildName: item.pcBuildName,
        pcBuildType: item.pcBuildType,
      }];
    }
    return [];
  });
  const subtotal = items.reduce((sum, item) => sum + BigInt(item.lineTotal), 0n).toString();
  return { token: cart.opaqueToken, items, subtotal };
};

export const cartService = {
  async read(token?: string): Promise<CartView> {
    const cart = token ? await prisma.cart.findFirst({ where: { opaqueToken: token, isActive: true }, include: cartInclude }) : null;
    if (cart) return serialize(cart);
    const created = await prisma.cart.create({ data: { opaqueToken: crypto.randomUUID() }, include: cartInclude });
    return serialize(created);
  },

  async add(token: string | undefined, input: CartLineInput): Promise<CartView> {
    const cart = await this.readCart(token);
    const sku = await prisma.productVariant.findFirst({ where: { id: input.skuId, isActive: true, lifecycleState: 'ACTIVE', productTemplate: { isActive: true, lifecycleState: 'ACTIVE' } }, select: { id: true } });
    if (!sku) throw new DomainError('SKU_NOT_SELLABLE', { ruleId: 'CAT-012', messageKey: 'error.skuNotSellable', status: 409 });
    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, skuId: input.skuId, isActive: true, pcBuildKey: null } });
    if (existing) await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: { increment: input.quantity } } });
    else await prisma.cartItem.create({ data: { cartId: cart.id, skuId: input.skuId, quantity: input.quantity } });
    return this.read(cart.opaqueToken);
  },

  async addBuild(token: string | undefined, input: CartBuildInput): Promise<CartView> {
    const cart = await this.readCart(token);
    const skuIds = input.items.map((item) => item.skuId);
    const sellableSkus = await prisma.productVariant.findMany({
      where: { id: { in: skuIds }, isActive: true, lifecycleState: 'ACTIVE', productTemplate: { isActive: true, lifecycleState: 'ACTIVE' } },
      select: { id: true },
    });
    if (sellableSkus.length !== skuIds.length) {
      throw new DomainError('SKU_NOT_SELLABLE', { ruleId: 'CAT-012', messageKey: 'error.skuNotSellable', status: 409 });
    }
    const pcBuildKey = crypto.randomUUID();
    let sortOrder = 0;
    for (const item of input.items) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          skuId: item.skuId,
          sourcePcBundleId: input.sourcePcBundleId,
          lineType: 'SKU',
          pcBuildKey,
          pcBuildName: input.buildName,
          pcBuildType: input.buildType,
          quantity: item.quantity,
          sortOrder: sortOrder++,
        },
      });
    }
    if (input.hasAssemblyService) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          lineType: 'SERVICE',
          serviceType: 'ASSEMBLY',
          pcBuildKey,
          pcBuildName: input.buildName,
          pcBuildType: input.buildType,
          quantity: 1,
          sortOrder: sortOrder++,
        },
      });
    }
    return this.read(cart.opaqueToken);
  },

  async changeQuantity(token: string, itemId: string, quantity: number): Promise<CartView> {
    const cart = await this.readCart(token);
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id, isActive: true } });
    if (!item) throw new DomainError('CART_ITEM_NOT_FOUND', { messageKey: 'error.cartItemNotFound', status: 404 });
    if (quantity === 0) await prisma.cartItem.update({ where: { id: item.id }, data: { isActive: false } });
    else await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    return this.read(cart.opaqueToken);
  },

  async remove(token: string, itemId: string): Promise<CartView> {
    return this.changeQuantity(token, itemId, 0);
  },

  async readCart(token?: string): Promise<{ id: string; opaqueToken: string }> {
    if (!token) return prisma.cart.create({ data: { opaqueToken: crypto.randomUUID() }, select: { id: true, opaqueToken: true } });
    const cart = await prisma.cart.findFirst({ where: { opaqueToken: token, isActive: true }, select: { id: true, opaqueToken: true } });
    if (!cart) throw new DomainError('CART_NOT_FOUND', { messageKey: 'error.cartNotFound', status: 404 });
    return cart;
  },
};
