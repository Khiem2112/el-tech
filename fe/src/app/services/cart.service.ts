import { computed, Injectable, signal } from '@angular/core';
import type { Product } from '../data/product.data';

export type CartItem = { product: Product; quantity: number };

@Injectable()
export class CartService {
  private readonly entries = signal<readonly CartItem[]>([]);
  readonly items = this.entries.asReadonly();
  readonly itemCount = computed<number>(() => this.entries().reduce((total, item) => total + item.quantity, 0));
  readonly subtotal = computed<number>(() => this.entries().reduce((total, item) => total + item.product.price * item.quantity, 0));
  add(product: Product): void { const existing = this.entries().find((item) => item.product.id === product.id); if (existing) { this.setQuantity(product.id, existing.quantity + 1); return; } this.entries.update((items) => [...items, { product, quantity: 1 }]); }
  increment(productId: string): void { const item = this.entries().find((entry) => entry.product.id === productId); if (item) this.setQuantity(productId, item.quantity + 1); }
  decrement(productId: string): void { const item = this.entries().find((entry) => entry.product.id === productId); if (item) this.setQuantity(productId, item.quantity - 1); }
  remove(productId: string): void { this.entries.update((items) => items.filter((item) => item.product.id !== productId)); }
  clear(): void { this.entries.set([]); }
  grandTotal(deliveryFee: number): number { return this.subtotal() + deliveryFee; }
  private setQuantity(productId: string, quantity: number): void { if (quantity < 1) { this.remove(productId); return; } this.entries.update((items) => items.map((item) => item.product.id === productId ? { ...item, quantity } : item)); }
}
