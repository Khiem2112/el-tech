import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';

export type SpecificationDefinition = {
  stable_key: string;
  label: string;
  data_type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'ENUM';
  unit: string | null;
  is_required?: boolean;
  is_filterable: boolean;
  is_comparable?: boolean;
  allowed_values: readonly string[];
};

export type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  model: string;
  description: string | null;
  commonSpec?: Record<string, unknown>;
  media?: unknown;
  category: { name: string; slug: string };
  brand: { name: string; slug?: string };
  variants: readonly { id: number; sku: string; variationLabel: string | null; sellingPrice: string; originalPrice?: string | null; variantSpec: unknown }[];
};
export type ProductDetail = CatalogProduct & { commonSpec: unknown; media: unknown };
export type CatalogCategory = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  specificationSchema?: readonly SpecificationDefinition[];
};
export type CatalogBrand = { id: number; name: string; slug: string; description: string | null };
export type ProductReviewItem = { id: string; authorName?: string | null; rating: number; text: string; createdAt: string };

export type ProductFilterParams = {
  readonly query?: string;
  readonly category?: string;
  readonly brand?: string;
  readonly minPrice?: number | null;
  readonly maxPrice?: number | null;
  readonly sort?: string;
  readonly specs?: Record<string, string>;
};

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiClientService);
  async list(queryOrFilters: string | ProductFilterParams = '', category = ''): Promise<readonly CatalogProduct[]> {
    const filters: ProductFilterParams = typeof queryOrFilters === 'string' ? { query: queryOrFilters, category } : queryOrFilters;
    const parameters = new URLSearchParams();
    if (filters.query) parameters.set('q', filters.query);
    if (filters.category) parameters.set('category', filters.category);
    if (filters.brand) parameters.set('brand', filters.brand);
    if (filters.minPrice !== undefined && filters.minPrice !== null) parameters.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) parameters.set('maxPrice', String(filters.maxPrice));
    if (filters.sort) parameters.set('sort', filters.sort);
    if (filters.specs) {
      for (const [key, val] of Object.entries(filters.specs)) {
        if (val) parameters.set(`specs[${key}]`, val);
      }
    }

    const response = await this.api.get<readonly CatalogProduct[]>(`/products${parameters.size ? `?${parameters}` : ''}`);
    if (!response.success) throw new Error(response.error.messageKey);
    return response.data;
  }
  async detail(categorySlug: string, productSlug: string): Promise<ProductDetail> {
    const response = await this.api.get<ProductDetail>(`/products/${encodeURIComponent(categorySlug)}/${encodeURIComponent(productSlug)}`);
    if (!response.success) throw new Error(response.error.messageKey);
    return response.data;
  }
  async reviews(productSlug: string): Promise<readonly ProductReviewItem[]> {
    const response = await this.api.get<readonly ProductReviewItem[]>(`/products/${encodeURIComponent(productSlug)}/reviews`);
    if (!response.success) throw new Error(response.error.messageKey);
    return response.data;
  }
  async submitReview(data: { productSlug: string; rating: number; text: string; authorName?: string }): Promise<{ id: string }> {
    const response = await this.api.post<{ id: string }>('/reviews', data);
    if (!response.success) throw new Error(response.error.messageKey);
    return response.data;
  }
  async categories(): Promise<readonly CatalogCategory[]> {
    const response = await this.api.get<readonly CatalogCategory[]>('/categories');
    if (!response.success) throw new Error(response.error.messageKey);
    return response.data.filter((c) => c.slug !== 'laptop' && c.slug !== 'dien-thoai');
  }
  async brands(): Promise<readonly CatalogBrand[]> {
    const response = await this.api.get<readonly CatalogBrand[]>('/brands');
    if (!response.success) throw new Error(response.error.messageKey);
    return response.data;
  }
}
