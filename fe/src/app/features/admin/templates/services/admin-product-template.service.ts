import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';
import { SpecAttribute } from '../../categories/services/admin-category.service';

export type ProductLifecycle = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'DISCONTINUED';

export type ProductTemplateListItem = {
  id: number;
  name: string;
  slug: string;
  model: string;
  chipsetFamily: string | null;
  description: string | null;
  commonSpec: Record<string, unknown>;
  media: string[];
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  brand: {
    id: number;
    name: string;
    slug: string;
  };
  variantCount: number;
  minSellingPrice: string | null;
  maxSellingPrice: string | null;
  totalOnHand: number;
  totalAvailable: number;
};

export type VariantStockQuant = {
  id: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  onHand: number;
  reserved: number;
  available: number;
};

export type ProductVariantItem = {
  id: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  variantSpec: Record<string, unknown>;
  serialRequired: boolean;
  sellingPrice: string;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  stockQuants: VariantStockQuant[];
};

export type ProductTemplateSmartMetrics = {
  skuCount: number;
  totalOnHand: number;
  totalAvailable: number;
  orderCount: number;
  poCount: number;
  stockMoveCount: number;
};

export type ProductTemplateDetail = {
  id: number;
  name: string;
  slug: string;
  model: string;
  chipsetFamily: string | null;
  description: string | null;
  commonSpec: Record<string, unknown>;
  media: string[];
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    specificationSchema: SpecAttribute[];
    specificationSchemaVersion: number;
  };
  brand: {
    id: number;
    name: string;
    slug: string;
  };
  variants: ProductVariantItem[];
  smartMetrics: ProductTemplateSmartMetrics;
};

export type ProductTemplateListResponse = {
  items: ProductTemplateListItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreateProductTemplatePayload = {
  categoryId: number;
  brandId: number;
  name: string;
  slug: string;
  model: string;
  chipsetFamily?: string | null;
  description?: string | null;
  commonSpec?: Record<string, unknown>;
  media?: string[];
  lifecycleState?: ProductLifecycle;
  isActive?: boolean;
};

export type UpdateProductTemplatePayload = Partial<CreateProductTemplatePayload>;

export type CreateProductVariantPayload = {
  productTemplateId: number;
  sku: string;
  barcode?: string | null;
  variationLabel?: string | null;
  variantSpec?: Record<string, unknown>;
  serialRequired?: boolean;
  sellingPrice: number;
  lifecycleState?: ProductLifecycle;
  isActive?: boolean;
};

export type UpdateProductVariantPayload = Partial<CreateProductVariantPayload>;

export type ProductTemplateFilterParams = {
  search?: string;
  categoryId?: number;
  brandId?: number;
  lifecycleState?: string;
  page?: number;
  limit?: number;
};

@Injectable({ providedIn: 'root' })
export class AdminProductTemplateService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly templateBaseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/product-templates'
      : '/v1/admin/product-templates';

  private readonly variantBaseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/product-variants'
      : '/v1/admin/product-variants';

  readonly templates = signal<ProductTemplateListItem[]>([]);
  readonly currentTemplate = signal<ProductTemplateDetail | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(50);

  readonly searchQuery = signal<string>('');
  readonly categoryFilter = signal<number | null>(null);
  readonly brandFilter = signal<number | null>(null);
  readonly statusFilter = signal<string>('ALL');
  readonly viewMode = signal<'list' | 'kanban'>('list');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadTemplates(params?: ProductTemplateFilterParams): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();

      const targetSearch = params?.search !== undefined ? params.search : this.searchQuery();
      if (targetSearch.trim()) {
        httpParams = httpParams.set('search', targetSearch.trim());
      }

      const targetCat = params?.categoryId !== undefined ? params.categoryId : this.categoryFilter();
      if (targetCat) {
        httpParams = httpParams.set('categoryId', targetCat.toString());
      }

      const targetBrand = params?.brandId !== undefined ? params.brandId : this.brandFilter();
      if (targetBrand) {
        httpParams = httpParams.set('brandId', targetBrand.toString());
      }

      const targetStatus = params?.lifecycleState !== undefined ? params.lifecycleState : this.statusFilter();
      if (targetStatus && targetStatus !== 'ALL') {
        httpParams = httpParams.set('lifecycleState', targetStatus);
      }

      const currentPage = params?.page ?? this.page();
      const currentLimit = params?.limit ?? this.limit();
      httpParams = httpParams.set('page', currentPage.toString());
      httpParams = httpParams.set('limit', currentLimit.toString());

      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<ProductTemplateListResponse>>(this.templateBaseUrl, {
          headers,
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.templates.set(response.data.items);
      this.total.set(response.data.total);
      this.page.set(response.data.page);
      this.limit.set(response.data.limit);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi tai danh sach mau san pham';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getTemplateById(id: number): Promise<ProductTemplateDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<ProductTemplateDetail>>(`${this.templateBaseUrl}/${id}`, {
          headers,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.currentTemplate.set(response.data);
      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi tai chi tiet mau san pham';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async createTemplate(payload: CreateProductTemplatePayload): Promise<ProductTemplateDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.post<ApiResponse<ProductTemplateDetail>>(this.templateBaseUrl, payload, {
          headers,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      await this.loadTemplates();
      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi tao mau san pham moi';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateTemplate(id: number, payload: UpdateProductTemplatePayload): Promise<ProductTemplateDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.put<ApiResponse<ProductTemplateDetail>>(`${this.templateBaseUrl}/${id}`, payload, {
          headers,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.currentTemplate.set(response.data);
      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi cap nhat mau san pham';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async transitionTemplateLifecycle(
    id: number,
    targetState: ProductLifecycle,
    reason?: string,
  ): Promise<ProductTemplateDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.post<ApiResponse<ProductTemplateDetail>>(
          `${this.templateBaseUrl}/${id}/transition`,
          { targetState, reason },
          { headers },
        ),
      );

      if (!response.success) {
        const errorDetails = response.error.details
          ? JSON.stringify(response.error.details)
          : '';
        throw new Error(`${response.error.messageKey} ${errorDetails}`.trim());
      }

      this.currentTemplate.set(response.data);
      await this.loadTemplates();
      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi chuyen trang thai mau san pham';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleTemplateStatus(id: number): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<unknown>>(`${this.templateBaseUrl}/${id}/toggle-status`, {}, {
          headers,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      await this.loadTemplates();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi doi trang thai kich hoat';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteTemplate(id: number): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<unknown>>(`${this.templateBaseUrl}/${id}`, {
          headers,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      await this.loadTemplates();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi xoa mau san pham';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async createVariant(payload: CreateProductVariantPayload): Promise<ProductVariantItem> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.post<ApiResponse<ProductVariantItem>>(this.variantBaseUrl, payload, {
          headers,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      if (this.currentTemplate() && this.currentTemplate()?.id === payload.productTemplateId) {
        await this.getTemplateById(payload.productTemplateId);
      }

      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi tao bien the SKU';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateVariant(id: number, payload: UpdateProductVariantPayload): Promise<ProductVariantItem> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.put<ApiResponse<ProductVariantItem>>(`${this.variantBaseUrl}/${id}`, payload, {
          headers,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const tpl = this.currentTemplate();
      if (tpl) {
        await this.getTemplateById(tpl.id);
      }

      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi cap nhat bien the SKU';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async transitionVariantLifecycle(
    id: number,
    targetState: ProductLifecycle,
    reason?: string,
  ): Promise<ProductVariantItem> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.post<ApiResponse<ProductVariantItem>>(
          `${this.variantBaseUrl}/${id}/transition`,
          { targetState, reason },
          { headers },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const tpl = this.currentTemplate();
      if (tpl) {
        await this.getTemplateById(tpl.id);
      }

      return response.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi chuyen trang thai bien the';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteVariant(id: number): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<unknown>>(`${this.variantBaseUrl}/${id}`, {
          headers,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const tpl = this.currentTemplate();
      if (tpl) {
        await this.getTemplateById(tpl.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi xoa bien the';
      this.error.set(msg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }
}
