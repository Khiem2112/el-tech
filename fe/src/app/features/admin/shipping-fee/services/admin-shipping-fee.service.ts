import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type DeliveryFeeStatus = 'ACTIVE' | 'EXPIRED' | 'UPCOMING';

export type AdminDeliveryFeeConfig = {
  readonly id: string;
  readonly fixedFee: number;
  readonly freeShippingThreshold: number;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly isActive: boolean;
  readonly status: DeliveryFeeStatus;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DeliveryFeeListResponse = {
  readonly active: AdminDeliveryFeeConfig | null;
  readonly history: readonly AdminDeliveryFeeConfig[];
  readonly meta: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
};

export type CreateDeliveryFeePayload = {
  readonly fixedFee: number;
  readonly freeShippingThreshold: number;
  readonly effectiveFrom?: string;
  readonly note?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminShippingFeeService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/delivery-fees'
      : '/v1/admin/delivery-fees';

  readonly activeConfig = signal<AdminDeliveryFeeConfig | null>(null);
  readonly history = signal<readonly AdminDeliveryFeeConfig[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
  readonly totalPages = signal<number>(1);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadDeliveryFees(page = 1, limit = 20): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();
      httpParams = httpParams.set('page', page.toString());
      httpParams = httpParams.set('limit', limit.toString());

      const response = await firstValueFrom(
        this.http.get<ApiResponse<DeliveryFeeListResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.activeConfig.set(response.data.active);
      this.history.set(response.data.history);
      this.total.set(response.data.meta.total);
      this.page.set(response.data.meta.page);
      this.limit.set(response.data.meta.limit);
      this.totalPages.set(response.data.meta.totalPages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định khi tải biểu phí';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createDeliveryFee(payload: CreateDeliveryFeePayload): Promise<AdminDeliveryFeeConfig> {
    this.isSaving.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AdminDeliveryFeeConfig>>(this.baseUrl, payload, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      await this.loadDeliveryFees(1, this.limit());
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi lưu biểu phí vận chuyển';
      this.error.set(message);
      throw err;
    } finally {
      this.isSaving.set(false);
    }
  }
}
