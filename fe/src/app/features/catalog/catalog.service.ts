import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';

export type CatalogProduct = { id: number; name: string; slug: string; model: string; description: string | null; category: { name: string; slug: string }; brand: { name: string }; variants: readonly { id: number; sku: string; variationLabel: string | null; sellingPrice: string; variantSpec: unknown }[] };
export type ProductDetail = CatalogProduct & { commonSpec: unknown; media: unknown };

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiClientService);
  async list(query = '', category = ''): Promise<readonly CatalogProduct[]> {
    const parameters = new URLSearchParams(); if (query) parameters.set('q', query); if (category) parameters.set('category', category);
    const response = await this.api.get<readonly CatalogProduct[]>(`/products${parameters.size ? `?${parameters}` : ''}`);
    if (!response.success) throw new Error(response.error.messageKey);
    return response.data;
  }
  async detail(categorySlug: string, productSlug: string): Promise<ProductDetail> {
    const response = await this.api.get<ProductDetail>(`/products/${encodeURIComponent(categorySlug)}/${encodeURIComponent(productSlug)}`);
    if (!response.success) throw new Error(response.error.messageKey);
    return response.data;
  }
}
