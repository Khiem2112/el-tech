import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type PromotionDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type PromotionStatus = 'RUNNING' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE';
export type PromotionScopeType = 'SKU' | 'CATEGORY' | 'MIXED';

export type PromotionSku = {
  id: string;
  skuId: number;
  sku: string;
  variationLabel: string | null;
  productName: string;
  sellingPrice: number;
};

export type PromotionCategory = {
  id: string;
  categoryId: number;
  name: string;
  slug: string;
};

export type AdminProductPromotion = {
  id: string;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  isExclusive: boolean;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  status: PromotionStatus;
  scope: PromotionScopeType;
  skuTargets: PromotionSku[];
  categoryTargets: PromotionCategory[];
  createdAt: string;
  updatedAt: string;
};

export type PromotionStats = {
  totalCount: number;
  runningCount: number;
  upcomingCount: number;
  expiredCount: number;
};

export type PromotionListApiResponse = {
  items: AdminProductPromotion[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: PromotionStats;
  };
};

export type CreatePromotionPayload = {
  name: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  isExclusive: boolean;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  scope: 'SKU' | 'CATEGORY';
  skuIds: number[];
  categoryIds: number[];
};

export type UpdatePromotionPayload = Partial<CreatePromotionPayload>;

export type PromotionFilterParams = {
  search?: string;
  discountType?: PromotionDiscountType;
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'UPCOMING' | 'EXPIRED';
  scope?: 'ALL' | 'SKU' | 'CATEGORY';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

@Injectable({ providedIn: 'root' })
export class AdminPromotionService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/promotions'
      : '/v1/admin/promotions';

  readonly promotions = signal<AdminProductPromotion[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly stats = signal<PromotionStats>({
    totalCount: 0,
    runningCount: 0,
    upcomingCount: 0,
    expiredCount: 0,
  });

  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
  readonly totalPages = signal<number>(1);

  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<'ALL' | 'RUNNING' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE'>('ALL');
  readonly scopeFilter = signal<'ALL' | 'SKU' | 'CATEGORY'>('ALL');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadPromotions(params?: PromotionFilterParams): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();

      const search = params?.search !== undefined ? params.search : this.searchQuery();
      if (search.trim()) {
        httpParams = httpParams.set('search', search.trim());
      }

      const status = params?.status !== undefined ? params.status : this.statusFilter();
      if (status && status !== 'ALL') {
        httpParams = httpParams.set('status', status);
      }

      const scope = params?.scope !== undefined ? params.scope : this.scopeFilter();
      if (scope && scope !== 'ALL') {
        httpParams = httpParams.set('scope', scope);
      }

      const targetPage = params?.page ?? this.page();
      httpParams = httpParams.set('page', targetPage.toString());

      const targetLimit = params?.limit ?? this.limit();
      httpParams = httpParams.set('limit', targetLimit.toString());

      const sortBy = params?.sortBy ?? 'createdAt';
      const sortOrder = params?.sortOrder ?? 'desc';
      httpParams = httpParams.set('sortBy', sortBy);
      httpParams = httpParams.set('sortOrder', sortOrder);

      const response = await firstValueFrom(
        this.http.get<ApiResponse<PromotionListApiResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.promotions.set(response.data.items);
      this.total.set(response.data.meta.total);
      this.page.set(response.data.meta.page);
      this.limit.set(response.data.meta.limit);
      this.totalPages.set(response.data.meta.totalPages);
      this.stats.set(response.data.meta.stats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách chương trình khuyến mãi';
      this.error.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getPromotionById(id: string): Promise<AdminProductPromotion> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminProductPromotion>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async createPromotion(payload: CreatePromotionPayload): Promise<AdminProductPromotion> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminProductPromotion>>(this.baseUrl, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadPromotions();
    return response.data;
  }

  async updatePromotion(id: string, payload: UpdatePromotionPayload): Promise<AdminProductPromotion> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AdminProductPromotion>>(`${this.baseUrl}/${id}`, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadPromotions();
    return response.data;
  }

  async toggleStatus(id: string): Promise<AdminProductPromotion> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<AdminProductPromotion>>(
        `${this.baseUrl}/${id}/toggle-status`,
        {},
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    this.promotions.update((list) =>
      list.map((item) => (item.id === id ? response.data : item)),
    );

    return response.data;
  }

  async deletePromotion(id: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.delete<ApiResponse<{ id: string; deleted: boolean }>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadPromotions();
  }
}
