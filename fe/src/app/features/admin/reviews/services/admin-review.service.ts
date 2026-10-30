import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type AdminReviewCustomer = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
};

export type AdminReviewProduct = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
};

export type AdminReviewSku = {
  readonly id: number;
  readonly sku: string;
  readonly variationLabel: string | null;
};

export type AdminReviewOrder = {
  readonly id: string;
  readonly code: string;
};

export type AdminReviewRevisionHistoryItem = {
  readonly action: string;
  readonly reason: string | null;
  readonly changedBy: string;
  readonly changedAt: string;
};

export type AdminReviewItem = {
  readonly id: string;
  readonly customerId?: string | null;
  readonly productTemplateId: number;
  readonly skuId: number;
  readonly orderId?: string | null;
  readonly orderLineId?: string | null;
  readonly authorName?: string | null;
  readonly rating: number;
  readonly text: string;
  readonly isVisible: boolean;
  readonly hiddenReason: string | null;
  readonly revisionHistory: readonly AdminReviewRevisionHistoryItem[];
  readonly customer?: AdminReviewCustomer | null;
  readonly productTemplate: AdminReviewProduct;
  readonly sku: AdminReviewSku;
  readonly order?: AdminReviewOrder | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminReviewListPayload = {
  readonly items: readonly AdminReviewItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

export type AdminReviewFilterParams = {
  readonly page?: number;
  readonly limit?: number;
  readonly rating?: number;
  readonly isVisible?: 'true' | 'false' | 'all';
  readonly search?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminReviewService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/reviews'
      : '/v1/admin/reviews';

  readonly reviews = signal<readonly AdminReviewItem[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
  readonly totalPages = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly ratingFilter = signal<number | null>(null);
  readonly visibilityFilter = signal<'true' | 'false' | 'all'>('all');
  readonly searchQuery = signal<string>('');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadReviews(params?: AdminReviewFilterParams): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();
      const currentPage = params?.page ?? this.page();
      const currentLimit = params?.limit ?? this.limit();
      const currentRating = params?.rating !== undefined ? params.rating : this.ratingFilter();
      const currentVisibility = params?.isVisible ?? this.visibilityFilter();
      const currentSearch = params?.search !== undefined ? params.search : this.searchQuery();

      httpParams = httpParams.set('page', currentPage.toString());
      httpParams = httpParams.set('limit', currentLimit.toString());

      if (currentRating !== null && currentRating !== undefined) {
        httpParams = httpParams.set('rating', currentRating.toString());
      }
      if (currentVisibility !== 'all') {
        httpParams = httpParams.set('isVisible', currentVisibility);
      }
      if (currentSearch.trim()) {
        httpParams = httpParams.set('search', currentSearch.trim());
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminReviewListPayload>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (response.success) {
        this.reviews.set(response.data.items);
        this.total.set(response.data.total);
        this.page.set(response.data.page);
        this.limit.set(response.data.limit);
        this.totalPages.set(response.data.totalPages);
      } else {
        this.error.set(response.error.messageKey);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Loi he thong khi tai danh sach danh gia';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getReviewById(id: string): Promise<AdminReviewItem> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminReviewItem>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async updateVisibility(
    id: string,
    isVisible: boolean,
    hiddenReason?: string,
  ): Promise<AdminReviewItem> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<AdminReviewItem>>(
        `${this.baseUrl}/${id}/visibility`,
        { isVisible, hiddenReason },
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    const updated = response.data;
    this.reviews.update((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );

    return updated;
  }
}
