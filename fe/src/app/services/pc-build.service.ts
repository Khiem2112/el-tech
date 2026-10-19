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

@Injectable({ providedIn: 'root' })
export class PcBuildService {
  private readonly api = inject(ApiClientService);

  async getBundles(): Promise<readonly BundleResponse[]> {
    const res = await this.api.get<readonly BundleResponse[]>('/pc-build/bundles');
    if (!res.success) throw new Error(res.error.messageKey);
    return res.data;
  }

  async getComponents(category?: string): Promise<readonly SwapItem[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await this.api.get<readonly SwapItem[]>(`/pc-build/components${query}`);
    if (!res.success) throw new Error(res.error.messageKey);
    return res.data;
  }
}
