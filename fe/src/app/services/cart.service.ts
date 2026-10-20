import { HttpHeaders } from '@angular/common/http';
import { computed, Injectable, inject, signal } from '@angular/core';
import { ApiClientService } from '../core/api/api-client.service';

export type CartItem = {
  readonly id: string;
  readonly skuId: number;
  readonly sku: string;
  readonly name: string;
  readonly media?: unknown;
  readonly quantity: number;
  readonly unitPrice: string;
  readonly lineTotal: string;
  readonly lineType: string;
  readonly pcBuildKey?: string | null;
  readonly pcBuildName?: string | null;
  readonly pcBuildType?: string | null;
};
type CartPayload = { readonly token: string; readonly items: readonly CartItem[]; readonly subtotal: string };

export type PcBuildGroup = {
  readonly key: string;
  readonly buildName: string;
  readonly buildType: string;
  readonly items: readonly CartItem[];
  readonly hardwareItems: readonly CartItem[];
  readonly serviceItems: readonly CartItem[];
  readonly quantity: number;
  readonly totalPrice: string;
  readonly componentCount: number;
};

export type AddBuildInput = {
  readonly buildName: string;
  readonly buildType: 'PREBUILT' | 'CUSTOM';
  readonly sourcePcBundleId?: number;
  readonly items: readonly { readonly skuId: number; readonly quantity: number }[];
  readonly hasAssemblyService?: boolean;
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiClientService);
  private readonly storageKey = 'el-tech.cart-token';
  private readonly token = signal<string | null>(localStorage.getItem(this.storageKey));
  private readonly entries = signal<readonly CartItem[]>([]);
  readonly isDrawerOpen = signal<boolean>(false);
  readonly items = this.entries.asReadonly();
  readonly itemCount = computed<number>(() => this.entries().reduce((total, item) => total + item.quantity, 0));
  readonly subtotal = computed<string>(() => this.entries().reduce((total, item) => total + BigInt(item.lineTotal), 0n).toString());

  readonly pcBuildGroups = computed<readonly PcBuildGroup[]>(() => {
    const map = new Map<string, CartItem[]>();
    for (const item of this.entries()) {
      const groupKey = item.pcBuildKey || (item.pcBuildName ? `name-${item.pcBuildName}` : null);
      if (groupKey) {
        const list = map.get(groupKey) ?? [];
        list.push(item);
        map.set(groupKey, list);
      }
    }

    const groups: PcBuildGroup[] = [];
    for (const [key, items] of map.entries()) {
      const first = items[0];
      const hardwareItems = items.filter((i) => i.lineType !== 'SERVICE');
      const serviceItems = items.filter((i) => i.lineType === 'SERVICE');
      const total = items.reduce((acc, i) => acc + BigInt(i.lineTotal), 0n).toString();
      const quantity = hardwareItems.length > 0 ? hardwareItems[0].quantity : (first?.quantity ?? 1);

      groups.push({
        key,
        buildName: first?.pcBuildName || 'Cấu hình PC Build',
        buildType: first?.pcBuildType || 'CUSTOM',
        items,
        hardwareItems,
        serviceItems,
        quantity,
        totalPrice: total,
        componentCount: hardwareItems.length,
      });
    }
    return groups;
  });

  readonly individualItems = computed<readonly CartItem[]>(() => {
    return this.entries().filter((item) => !item.pcBuildKey && !item.pcBuildName);
  });

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer(): void {
    this.isDrawerOpen.update((state) => !state);
  }

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

  async addBuild(input: AddBuildInput): Promise<void> {
    const response = await this.api.post<CartPayload>('/cart/builds', input, { cartToken: this.token() ?? undefined });
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

  async removePcBuild(buildKey: string): Promise<void> {
    if (buildKey.startsWith('name-')) {
      const targetGroup = this.pcBuildGroups().find((g) => g.key === buildKey);
      if (targetGroup) {
        for (const item of targetGroup.items) {
          await this.remove(item.id);
        }
      }
      return;
    }

    const response = await this.api.delete<CartPayload>(`/cart/builds/${encodeURIComponent(buildKey)}`, {
      cartToken: this.requiredToken(),
    });
    if (!response.success) {
      const targetGroup = this.pcBuildGroups().find((g) => g.key === buildKey);
      if (targetGroup) {
        for (const item of targetGroup.items) {
          await this.remove(item.id);
        }
        return;
      }
      throw new Error(response.error.messageKey);
    }
    this.apply(response.data);
  }

  async setPcBuildQuantity(buildKey: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removePcBuild(buildKey);
      return;
    }

    if (buildKey.startsWith('name-')) {
      const targetGroup = this.pcBuildGroups().find((g) => g.key === buildKey);
      if (targetGroup) {
        for (const item of targetGroup.hardwareItems) {
          await this.setQuantity(item.id, quantity);
        }
      }
      return;
    }

    const response = await this.api.patch<CartPayload>(
      `/cart/builds/${encodeURIComponent(buildKey)}`,
      { quantity },
      { cartToken: this.requiredToken() }
    );
    if (!response.success) {
      const targetGroup = this.pcBuildGroups().find((g) => g.key === buildKey);
      if (targetGroup) {
        for (const item of targetGroup.hardwareItems) {
          await this.setQuantity(item.id, quantity);
        }
        return;
      }
      throw new Error(response.error.messageKey);
    }
    this.apply(response.data);
  }

  cartToken(): string | null { return this.token(); }

  private apply(payload: CartPayload): void { this.token.set(payload.token); localStorage.setItem(this.storageKey, payload.token); this.entries.set(payload.items); }
  private requiredToken(): string { const token = this.token(); if (!token) throw new Error('Cart has not been initialized'); return token; }
  private tokenHeaders(): HttpHeaders | undefined { const token = this.token(); return token ? new HttpHeaders({ 'X-Cart-Token': token }) : undefined; }
}
