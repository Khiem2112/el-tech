import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../core/api/api-client.service';
import { SwapItem } from '../features/pc-build/component-swap-modal.component';

export type BundleLineItem = {
  readonly skuId: number;
  readonly sku: string;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly unitPrice: string;
  readonly lineTotal: string;
  readonly specs: string;
  readonly socket?: string;
  readonly memoryType?: string;
  readonly tdp?: number;
  readonly wattage?: number;
};

export type BundleResponse = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly build: {
    readonly lines: readonly BundleLineItem[];
    readonly total: string;
  };
};

export type ComponentFilterParams = {
  readonly category?: string;
  readonly q?: string;
  readonly brand?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly specs?: Record<string, string>;
};

@Injectable({ providedIn: 'root' })
export class PcBuildService {
  private readonly api = inject(ApiClientService);

  async getBundles(): Promise<readonly BundleResponse[]> {
    const res = await this.api.get<readonly BundleResponse[]>('/pc-build/bundles');
    if (!res.success) throw new Error(res.error.messageKey);
    return res.data;
  }

  async getBundleById(idOrSlug: string | number): Promise<BundleResponse | null> {
    const bundles = await this.getBundles();
    return bundles.find((b) => String(b.id) === String(idOrSlug) || b.slug === String(idOrSlug)) ?? null;
  }

  async getComponents(categoryOrFilters?: string | ComponentFilterParams): Promise<readonly SwapItem[]> {
    const params: ComponentFilterParams =
      typeof categoryOrFilters === 'string' ? { category: categoryOrFilters } : categoryOrFilters || {};

    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.q) searchParams.set('q', params.q);
    if (params.brand) searchParams.set('brand', params.brand);
    if (params.minPrice !== undefined) searchParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params.specs) {
      for (const [key, val] of Object.entries(params.specs)) {
        if (val) searchParams.set(`specs[${key}]`, val);
      }
    }

    const qs = searchParams.toString();
    const query = qs ? `?${qs}` : '';
    const res = await this.api.get<readonly SwapItem[]>(`/pc-build/components${query}`);
    if (!res.success) throw new Error(res.error.messageKey);
    return res.data;
  }
}
