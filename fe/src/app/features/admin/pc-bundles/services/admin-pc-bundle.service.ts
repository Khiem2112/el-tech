import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';
import { AdminVariantCatalogItem, AdminVariantCatalogResponse, ProductLifecycle } from '../../variants/services/admin-variant.service';

export type BranchAvailability = {
  readonly branchId: number;
  readonly branchName: string;
  readonly branchCode: string;
  readonly buildableCount: number;
  readonly bottleneckSku: string | null;
  readonly bottleneckSkuId: number | null;
  readonly bottleneckAvailableStock: number;
  readonly bottleneckRequiredQuantity: number;
};

export type AdminPcBundleComponent = {
  readonly id: string;
  readonly skuId: number;
  readonly sku: string;
  readonly barcode: string | null;
  readonly variationLabel: string | null;
  readonly productName: string;
  readonly productTemplateId: number;
  readonly categoryName: string;
  readonly categorySlug: string;
  readonly quantity: number;
  readonly sortOrder: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
  readonly lifecycleState: ProductLifecycle;
  readonly isActive: boolean;
  readonly media: unknown;
};

export type AdminPcBundle = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly rawDescription?: string | null;
  readonly lifecycleState: ProductLifecycle;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly totalItemsCount: number;
  readonly totalQuantity: number;
  readonly grossTotal: number;
  readonly discountAmount: number;
  readonly finalPrice: number;
  readonly primaryImage?: string | null;
  readonly items?: readonly AdminPcBundleComponent[];
  readonly branchAvailability: readonly BranchAvailability[];
};

export type PcBundleListPayload = {
  readonly items: readonly AdminPcBundle[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

export type CreatePcBundlePayload = {
  readonly name: string;
  readonly slug: string;
  readonly description?: string | null;
  readonly lifecycleState?: ProductLifecycle;
  readonly isActive?: boolean;
  readonly discount?: number;
  readonly items: readonly {
    readonly skuId: number;
    readonly quantity: number;
    readonly sortOrder?: number;
  }[];
};

export type UpdatePcBundlePayload = Partial<CreatePcBundlePayload>;

export type PcBundleFilterParams = {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly lifecycleState?: ProductLifecycle | 'ALL';
  readonly isActive?: boolean;
  readonly branchId?: number;
};

@Injectable({ providedIn: 'root' })
export class AdminPcBundleService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/pc-bundles'
      : '/v1/admin/pc-bundles';

  private readonly variantCatalogUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/catalog/variants'
      : '/v1/admin/catalog/variants';

  readonly bundles = signal<readonly AdminPcBundle[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
  readonly totalPages = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly lifecycleFilter = signal<ProductLifecycle | 'ALL'>('ALL');
  readonly selectedBranchId = signal<number | null>(null);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadBundles(params?: PcBundleFilterParams): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();

      const targetPage = params?.page ?? this.page();
      const targetLimit = params?.limit ?? this.limit();
      const targetSearch = params?.search !== undefined ? params.search : this.searchQuery();

      httpParams = httpParams.set('page', targetPage.toString());
      httpParams = httpParams.set('limit', targetLimit.toString());

      if (targetSearch.trim()) {
        httpParams = httpParams.set('search', targetSearch.trim());
      }

      const lifecycle = params?.lifecycleState !== undefined ? params.lifecycleState : this.lifecycleFilter();
      if (lifecycle && lifecycle !== 'ALL') {
        httpParams = httpParams.set('lifecycleState', lifecycle);
      }

      const branch = params?.branchId !== undefined ? params.branchId : this.selectedBranchId();
      if (branch) {
        httpParams = httpParams.set('branchId', branch.toString());
      }

      if (params?.isActive !== undefined) {
        httpParams = httpParams.set('isActive', params.isActive.toString());
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<PcBundleListPayload>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (response.success) {
        this.bundles.set(response.data.items);
        this.total.set(response.data.total);
        this.page.set(response.data.page);
        this.limit.set(response.data.limit);
        this.totalPages.set(response.data.totalPages);
      } else {
        this.error.set(response.error.messageKey);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách bộ máy tính dựng sẵn';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getBundleById(id: number): Promise<AdminPcBundle> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminPcBundle>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async createBundle(payload: CreatePcBundlePayload): Promise<AdminPcBundle> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminPcBundle>>(this.baseUrl, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async updateBundle(id: number, payload: UpdatePcBundlePayload): Promise<AdminPcBundle> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AdminPcBundle>>(`${this.baseUrl}/${id}`, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async deleteBundle(id: number): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.delete<ApiResponse<{ success: boolean }>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data.success;
  }

  async getBundleAvailability(id: number, branchId?: number): Promise<{
    readonly bundleId: number;
    readonly bundleName: string;
    readonly branches: readonly BranchAvailability[];
  }> {
    let httpParams = new HttpParams();
    if (branchId) {
      httpParams = httpParams.set('branchId', branchId.toString());
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<{
        readonly bundleId: number;
        readonly bundleName: string;
        readonly branches: readonly BranchAvailability[];
      }>>(`${this.baseUrl}/${id}/availability`, {
        headers: this.getAuthHeaders(),
        params: httpParams,
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async searchActiveVariants(query?: string, categoryId?: number): Promise<readonly AdminVariantCatalogItem[]> {
    let httpParams = new HttpParams()
      .set('lifecycleState', 'ACTIVE')
      .set('isActive', 'true')
      .set('limit', '50');

    if (query?.trim()) {
      httpParams = httpParams.set('search', query.trim());
    }

    if (categoryId) {
      httpParams = httpParams.set('categoryId', categoryId.toString());
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminVariantCatalogResponse>>(this.variantCatalogUrl, {
        headers: this.getAuthHeaders(),
        params: httpParams,
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data.items;
  }
}
