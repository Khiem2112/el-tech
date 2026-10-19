import { HttpHeaders } from '@angular/common/http';
import { computed, Injectable, inject, signal } from '@angular/core';
import { ApiClientService } from '../core/api/api-client.service';

export type CartItem = { readonly id: string; readonly skuId: number; readonly sku: string; readonly name: string; readonly quantity: number; readonly unitPrice: string; readonly lineTotal: string };
type CartPayload = { readonly token: string; readonly items: readonly CartItem[]; readonly subtotal: string };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiClientService);
  private readonly storageKey = 'el-tech.cart-token';
  private readonly token = signal<string | null>(localStorage.getItem(this.storageKey));
  private readonly entries = signal<readonly CartItem[]>([]);
  readonly items = this.entries.asReadonly();
  readonly itemCount = computed<number>(() => this.entries().reduce((total, item) => total + item.quantity, 0));
  readonly subtotal = computed<string>(() => this.entries().reduce((total, item) => total + BigInt(item.lineTotal), 0n).toString());

  async load(): Promise<void> {
    const response = await this.api.get<CartPayload>('/cart', { headers: this.tokenHeaders() });
    if (!response.success) throw new Error(response.error.messageKey);
    this.apply(response.data);
  }

  async add(skuId: number, quantity = 1): Promise<void> {
    const response = await this.api.post<CartPayload>('/cart/lines', { skuId, quantity }, { cartToken: this.token() ?? undefined });
    if (!response.success) throw new Error(response.error.messageKey);
    this.apply(response.data);
  }

  async setQuantity(itemId: string, quantity: number): Promise<void> {
    const response = await this.api.patch<CartPayload>(`/cart/lines/${encodeURIComponent(itemId)}`, { quantity }, { cartToken: this.requiredToken() });
    if (!response.success) throw new Error(response.error.messageKey);
    this.apply(response.data);
  }

  async remove(itemId: string): Promise<void> {
    const response = await this.api.delete<CartPayload>(`/cart/lines/${encodeURIComponent(itemId)}`, { cartToken: this.requiredToken() });
    if (!response.success) throw new Error(response.error.messageKey);
    this.apply(response.data);
  }

  cartToken(): string | null { return this.token(); }

  private apply(payload: CartPayload): void { this.token.set(payload.token); localStorage.setItem(this.storageKey, payload.token); this.entries.set(payload.items); }
  private requiredToken(): string { const token = this.token(); if (!token) throw new Error('Cart has not been initialized'); return token; }
  private tokenHeaders(): HttpHeaders | undefined { const token = this.token(); return token ? new HttpHeaders({ 'X-Cart-Token': token }) : undefined; }
}
