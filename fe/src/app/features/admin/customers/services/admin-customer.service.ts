import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type AdminCustomerListItem = {
  readonly id: string;
  readonly userId: string | null;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly emailVerifiedAt: string;
  readonly phoneVerifiedAt: string;
  readonly isRegistered: boolean;
  readonly mergedIntoCustomerId: string | null;
  readonly isActive: boolean;
  readonly orderCount: number;
  readonly totalSpent: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly role: string;
    readonly image: string | null;
  } | null;
};

export type AdminCustomerListPayload = {
  readonly items: readonly AdminCustomerListItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

export type AdminCustomerOrderSummary = {
  readonly id: string;
  readonly code: string;
  readonly status: string;
  readonly fulfillmentMethod: string;
  readonly paymentMethod: string;
  readonly subtotal: number;
  readonly grandTotal: number;
  readonly submittedAt: string;
  readonly completedAt: string | null;
  readonly receiverName: string;
  readonly receiverPhone: string;
  readonly receiverEmail: string;
  readonly branch: {
    readonly id: number;
    readonly code: string;
    readonly name: string;
  };
  readonly lineCount: number;
  readonly summaryDescription: string;
};

export type AdminCustomerCouponRedemption = {
  readonly id: string;
  readonly couponId: string;
  readonly status: string;
  readonly reservedAt: string;
  readonly consumedAt: string | null;
  readonly orderId: string;
  readonly coupon: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly discountType: string;
    readonly discountValue: number;
  };
};

export type AdminCustomerReview = {
  readonly id: string;
  readonly rating: number;
  readonly text: string;
  readonly isVisible: boolean;
  readonly createdAt: string;
  readonly productTemplate: {
    readonly id: number;
    readonly name: string;
  };
  readonly order: {
    readonly id: string;
    readonly code: string;
  };
};

export type AdminCustomerMergedProfile = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly createdAt: string;
  readonly orderCount: number;
};

export type AdminCustomerStats = {
  readonly orderCount: number;
  readonly completedOrderCount: number;
  readonly totalSpent: number;
  readonly couponUsageCount: number;
  readonly reviewCount: number;
  readonly mergedCount: number;
};

export type AdminCustomerDetail = {
  readonly id: string;
  readonly userId: string | null;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly emailVerifiedAt: string;
  readonly phoneVerifiedAt: string;
  readonly isRegistered: boolean;
  readonly mergedIntoCustomerId: string | null;
  readonly mergedInto: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string;
  } | null;
  readonly mergedCustomers: readonly AdminCustomerMergedProfile[];
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly role: string;
    readonly image: string | null;
    readonly createdAt: string;
  } | null;
  readonly stats: AdminCustomerStats;
  readonly orders: readonly AdminCustomerOrderSummary[];
  readonly couponRedemptions: readonly AdminCustomerCouponRedemption[];
  readonly reviews: readonly AdminCustomerReview[];
};

export type AdminCustomerMergeCandidate = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly isRegistered: boolean;
  readonly orderCount: number;
  readonly totalSpent: number;
  readonly matchType: 'PHONE' | 'EMAIL' | 'OTHER';
  readonly createdAt: string;
};

export type AdminCustomerMergePayload = {
  readonly sourceCustomerId: string;
  readonly reason: string;
};

export type AdminCustomerMergeResult = {
  readonly targetCustomerId: string;
  readonly sourceCustomerId: string;
  readonly ordersMoved: number;
  readonly couponsMoved: number;
  readonly reviewsMoved: number;
  readonly notificationsMoved: number;
  readonly reason: string;
  readonly adminId?: string | null;
  readonly mergedAt: string;
};

export type AdminCustomerFilterParams = {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly type?: 'ALL' | 'USER' | 'GUEST';
  readonly status?: 'ALL' | 'ACTIVE' | 'MERGED' | 'INACTIVE';
};

@Injectable({ providedIn: 'root' })
export class AdminCustomerService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/customers'
      : '/v1/admin/customers';

  readonly customers = signal<readonly AdminCustomerListItem[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
  readonly totalPages = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly typeFilter = signal<'ALL' | 'USER' | 'GUEST'>('ALL');
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'MERGED' | 'INACTIVE'>('ALL');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadCustomers(params?: AdminCustomerFilterParams): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();
      const currentPage = params?.page ?? this.page();
      const currentLimit = params?.limit ?? this.limit();
      const currentSearch = params?.search !== undefined ? params.search : this.searchQuery();
      const currentType = params?.type ?? this.typeFilter();
      const currentStatus = params?.status ?? this.statusFilter();

      httpParams = httpParams.set('page', currentPage.toString());
      httpParams = httpParams.set('limit', currentLimit.toString());

      if (currentSearch.trim()) {
        httpParams = httpParams.set('search', currentSearch.trim());
      }
      if (currentType !== 'ALL') {
        httpParams = httpParams.set('type', currentType);
      }
      if (currentStatus !== 'ALL') {
        httpParams = httpParams.set('status', currentStatus);
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminCustomerListPayload>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.customers.set(response.data.items);
      this.total.set(response.data.total);
      this.page.set(response.data.page);
      this.limit.set(response.data.limit);
      this.totalPages.set(response.data.totalPages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Khong the tai danh sach khach hang';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getCustomerById(id: string): Promise<AdminCustomerDetail> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminCustomerDetail>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async getMergeCandidates(
    targetCustomerId: string,
    search?: string,
  ): Promise<readonly AdminCustomerMergeCandidate[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<readonly AdminCustomerMergeCandidate[]>>(
        `${this.baseUrl}/${targetCustomerId}/merge-candidates`,
        {
          headers: this.getAuthHeaders(),
          params,
        },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async mergeCustomer(
    targetCustomerId: string,
    payload: AdminCustomerMergePayload,
  ): Promise<AdminCustomerMergeResult> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminCustomerMergeResult>>(
        `${this.baseUrl}/${targetCustomerId}/merge`,
        payload,
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async updateCustomer(
    id: string,
    payload: { name?: string; phone?: string; email?: string; isActive?: boolean },
  ): Promise<AdminCustomerDetail> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AdminCustomerDetail>>(`${this.baseUrl}/${id}`, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }
}
