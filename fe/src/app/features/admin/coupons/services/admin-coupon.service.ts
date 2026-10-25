import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type CouponStatus = 'RUNNING' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE';
export type CouponPaymentMethod = 'QR' | 'COD';
export type CouponTargetRule = 'INCLUDE' | 'EXCLUDE';
export type CouponRedemptionStatus = 'RESERVED' | 'CONSUMED' | 'RELEASED';

export type CouponSkuRule = {
  id: string;
  skuId: number;
  rule: CouponTargetRule;
  sku: string;
  variationLabel: string | null;
  productName: string;
};

export type CouponCategoryRule = {
  id: string;
  categoryId: number;
  rule: CouponTargetRule;
  name: string;
  slug: string;
};

export type CouponRedemptionStats = {
  totalRedemptions: number;
  consumedCount: number;
  reservedCount: number;
  releasedCount: number;
  usedCount: number;
};

export type AdminCoupon = {
  id: string;
  branchId: number | null;
  branchName: string | null;
  code: string;
  name: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumSubtotal: number;
  maximumDiscount: number | null;
  requiredPaymentMethod: CouponPaymentMethod | null;
  globalQuota: number | null;
  perCustomerQuota: number | null;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  status: CouponStatus;
  skuRules: CouponSkuRule[];
  categoryRules: CouponCategoryRule[];
  stats: CouponRedemptionStats;
  createdAt: string;
  updatedAt: string;
};

export type CouponStats = {
  totalCount: number;
  runningCount: number;
  upcomingCount: number;
  expiredCount: number;
};

export type CouponListApiResponse = {
  items: AdminCoupon[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: CouponStats;
  };
};

export type CouponRedemptionCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type CouponRedemptionOrder = {
  id: string;
  code: string;
  subtotal: number;
  couponDiscount: number;
  grandTotal: number;
  status: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  submittedAt: string;
};

export type CouponRedemptionItem = {
  id: string;
  couponId: string;
  customerId: string;
  orderId: string;
  status: CouponRedemptionStatus;
  reservedAt: string;
  consumedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  customer: CouponRedemptionCustomer;
  order: CouponRedemptionOrder;
};

export type CouponRedemptionHistoryResponse = {
  coupon: {
    id: string;
    code: string;
    name: string;
    globalQuota: number | null;
    perCustomerQuota: number | null;
    discountType: CouponDiscountType;
    discountValue: number;
  };
  summary: CouponRedemptionStats;
  items: CouponRedemptionItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type SkuRuleInput = {
  skuId: number;
  rule: CouponTargetRule;
};

export type CategoryRuleInput = {
  categoryId: number;
  rule: CouponTargetRule;
};

export type CreateCouponPayload = {
  code: string;
  name: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumSubtotal: number;
  maximumDiscount?: number | null;
  requiredPaymentMethod?: CouponPaymentMethod | null;
  branchId?: number | null;
  globalQuota?: number | null;
  perCustomerQuota?: number | null;
  effectiveFrom: string;
  effectiveTo: string;
  isActive?: boolean;
  skuRules?: SkuRuleInput[];
  categoryRules?: CategoryRuleInput[];
};

export type UpdateCouponPayload = Partial<CreateCouponPayload>;

export type CouponFilterParams = {
  search?: string;
  discountType?: CouponDiscountType | 'ALL';
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'UPCOMING' | 'EXPIRED';
  page?: number;
  limit?: number;
};

export type RedemptionFilterParams = {
  status?: 'ALL' | 'RESERVED' | 'CONSUMED' | 'RELEASED';
  page?: number;
  limit?: number;
};

@Injectable({ providedIn: 'root' })
export class AdminCouponService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/coupons'
      : '/v1/admin/coupons';

  readonly coupons = signal<AdminCoupon[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly stats = signal<CouponStats>({
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
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'UPCOMING' | 'EXPIRED'>('ALL');
  readonly discountTypeFilter = signal<'ALL' | 'PERCENTAGE' | 'FIXED_AMOUNT'>('ALL');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadCoupons(params?: CouponFilterParams): Promise<void> {
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

      const discountType =
        params?.discountType !== undefined ? params.discountType : this.discountTypeFilter();
      if (discountType && discountType !== 'ALL') {
        httpParams = httpParams.set('discountType', discountType);
      }

      const targetPage = params?.page ?? this.page();
      httpParams = httpParams.set('page', targetPage.toString());

      const targetLimit = params?.limit ?? this.limit();
      httpParams = httpParams.set('limit', targetLimit.toString());

      const response = await firstValueFrom(
        this.http.get<ApiResponse<CouponListApiResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.coupons.set(response.data.items);
      this.total.set(response.data.meta.total);
      this.page.set(response.data.meta.page);
      this.limit.set(response.data.meta.limit);
      this.totalPages.set(response.data.meta.totalPages);
      this.stats.set(response.data.meta.stats);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Không thể tải danh sách mã giảm giá';
      this.error.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getCouponById(id: string): Promise<AdminCoupon> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminCoupon>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async createCoupon(payload: CreateCouponPayload): Promise<AdminCoupon> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminCoupon>>(this.baseUrl, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadCoupons();
    return response.data;
  }

  async updateCoupon(id: string, payload: UpdateCouponPayload): Promise<AdminCoupon> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AdminCoupon>>(`${this.baseUrl}/${id}`, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadCoupons();
    return response.data;
  }

  async toggleStatus(id: string): Promise<AdminCoupon> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<AdminCoupon>>(
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

    this.coupons.update((list) =>
      list.map((item) => (item.id === id ? response.data : item)),
    );

    return response.data;
  }

  async deleteCoupon(id: string): Promise<{ id: string; deleted: boolean }> {
    const response = await firstValueFrom(
      this.http.delete<ApiResponse<{ id: string; deleted: boolean }>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadCoupons();
    return response.data;
  }

  async loadRedemptions(
    couponId: string,
    params?: RedemptionFilterParams,
  ): Promise<CouponRedemptionHistoryResponse> {
    let httpParams = new HttpParams();

    if (params?.status && params.status !== 'ALL') {
      httpParams = httpParams.set('status', params.status);
    }

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<CouponRedemptionHistoryResponse>>(
        `${this.baseUrl}/${couponId}/redemptions`,
        {
          headers: this.getAuthHeaders(),
          params: httpParams,
        },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }
}
