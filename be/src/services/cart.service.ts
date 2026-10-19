import { prisma } from '../lib/prisma.js';
import { DomainError } from '../contracts/domain-error.js';

type CartLineInput = { readonly skuId: number; readonly quantity: number };
type CartView = { readonly token: string; readonly items: readonly { id: string; skuId: number; sku: string; name: string; quantity: number; unitPrice: string; lineTotal: string }[]; readonly subtotal: string };

const cartInclude = {
  items: { where: { isActive: true }, orderBy: { sortOrder: 'asc' as const }, include: { sku: { include: { productTemplate: true } } } },
} as const;

const serialize = (cart: { opaqueToken: string; items: readonly { id: string; skuId: number | null; quantity: number; sku: { sku: string; sellingPrice: { toFixed: (digits: number) => string; mul: (value: number) => { toFixed: (digits: number) => string } }; productTemplate: { name: string } } | null }[] }): CartView => {
  const items = cart.items.flatMap((item) => item.sku && item.skuId ? [{ id: item.id, skuId: item.skuId, sku: item.sku.sku, name: item.sku.productTemplate.name, quantity: item.quantity, unitPrice: item.sku.sellingPrice.toFixed(0), lineTotal: item.sku.sellingPrice.mul(item.quantity).toFixed(0) }] : []);
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
    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, skuId: input.skuId, isActive: true } });
    if (existing) await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: { increment: input.quantity } } });
    else await prisma.cartItem.create({ data: { cartId: cart.id, skuId: input.skuId, quantity: input.quantity } });
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
