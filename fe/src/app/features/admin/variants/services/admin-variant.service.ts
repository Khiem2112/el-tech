import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type ProductLifecycle = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'DISCONTINUED';

export type VariantStockQuantBranch = {
  id: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  branchAddress: string;
  onHand: number;
  reserved: number;
  quarantineDamaged: number;
  available: number;
};

export type AdminVariantCatalogItem = {
  id: number;
  productTemplateId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  variantSpec: Record<string, unknown>;
  serialRequired: boolean;
  sellingPrice: string;
  lifecycleState: ProductLifecycle;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  productTemplate: {
    id: number;
    name: string;
    slug: string;
    model: string;
    chipsetFamily: string | null;
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
  };
  totalOnHand: number;
  totalReserved: number;
  totalQuarantineDamaged: number;
  totalAvailable: number;
  stockQuants: VariantStockQuantBranch[];
};

export type AdminVariantCatalogResponse = {
  items: AdminVariantCatalogItem[];
  total: number;
  page: number;
  limit: number;
};

export type VariantCatalogFilterParams = {
  search?: string;
  barcode?: string;
  sku?: string;
  productTemplateId?: number;
  categoryId?: number | null;
  brandId?: number | null;
  lifecycleState?: string;
  serialRequired?: boolean | null;
  stockStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

@Injectable({ providedIn: 'root' })
export class AdminVariantService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/catalog/variants'
      : '/v1/admin/catalog/variants';

  readonly variants = signal<AdminVariantCatalogItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);

  readonly searchQuery = signal<string>('');
  readonly serialFilter = signal<boolean | null>(null);
  readonly stockStatusFilter = signal<string>('all');
  readonly lifecycleFilter = signal<string>('ALL');
  readonly categoryFilter = signal<number | null>(null);
  readonly brandFilter = signal<number | null>(null);
  readonly sortBy = signal<string>('updatedAt');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadVariants(overrides?: Partial<VariantCatalogFilterParams>): Promise<AdminVariantCatalogResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let params = new HttpParams();

      const searchVal = overrides?.search !== undefined ? overrides.search : this.searchQuery();
      if (searchVal && searchVal.trim().length > 0) {
        params = params.set('search', searchVal.trim());
      }

      const barcodeVal = overrides?.barcode;
      if (barcodeVal && barcodeVal.trim().length > 0) {
        params = params.set('barcode', barcodeVal.trim());
      }

      const skuVal = overrides?.sku;
      if (skuVal && skuVal.trim().length > 0) {
        params = params.set('sku', skuVal.trim());
      }

      const templateIdVal = overrides?.productTemplateId;
      if (templateIdVal !== undefined && templateIdVal !== null) {
        params = params.set('productTemplateId', templateIdVal.toString());
      }

      const catVal = overrides?.categoryId !== undefined ? overrides.categoryId : this.categoryFilter();
      if (catVal !== null && catVal !== undefined) {
        params = params.set('categoryId', catVal.toString());
      }

      const brandVal = overrides?.brandId !== undefined ? overrides.brandId : this.brandFilter();
      if (brandVal !== null && brandVal !== undefined) {
        params = params.set('brandId', brandVal.toString());
      }

      const lifecycleVal = overrides?.lifecycleState !== undefined ? overrides.lifecycleState : this.lifecycleFilter();
      if (lifecycleVal && lifecycleVal !== 'ALL') {
        params = params.set('lifecycleState', lifecycleVal);
      }

      const serialVal = overrides?.serialRequired !== undefined ? overrides.serialRequired : this.serialFilter();
      if (typeof serialVal === 'boolean') {
        params = params.set('serialRequired', serialVal ? 'true' : 'false');
      }

      const stockStatusVal = overrides?.stockStatus !== undefined ? overrides.stockStatus : this.stockStatusFilter();
      if (stockStatusVal && stockStatusVal !== 'all') {
        params = params.set('stockStatus', stockStatusVal);
      }

      const pageVal = overrides?.page ?? this.page();
      params = params.set('page', pageVal.toString());

      const limitVal = overrides?.limit ?? this.limit();
      params = params.set('limit', limitVal.toString());

      const sortByVal = overrides?.sortBy ?? this.sortBy();
      params = params.set('sortBy', sortByVal);

      const sortOrderVal = overrides?.sortOrder ?? this.sortOrder();
      params = params.set('sortOrder', sortOrderVal);

      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminVariantCatalogResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params,
        }),
      );

      if (!response.success) {
        const message = response.error.messageKey || 'Lỗi khi tải danh mục biến thể SKU';
        this.error.set(message);
        throw new Error(message);
      }

      this.variants.set(response.data.items);
      this.total.set(response.data.total);
      this.page.set(response.data.page);
      this.limit.set(response.data.limit);

      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định khi tải dữ liệu';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getVariantByBarcode(barcode: string): Promise<AdminVariantCatalogItem | null> {
    if (!barcode || barcode.trim().length === 0) {
      return null;
    }

    try {
      let params = new HttpParams();
      params = params.set('barcode', barcode.trim());
      params = params.set('limit', '1');

      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminVariantCatalogResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params,
        }),
      );

      if (response.success && response.data.items.length > 0) {
        return response.data.items[0];
      }

      return null;
    } catch {
      return null;
    }
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.serialFilter.set(null);
    this.stockStatusFilter.set('all');
    this.lifecycleFilter.set('ALL');
    this.categoryFilter.set(null);
    this.brandFilter.set(null);
    this.sortBy.set('updatedAt');
    this.sortOrder.set('desc');
    this.page.set(1);
  }
}
