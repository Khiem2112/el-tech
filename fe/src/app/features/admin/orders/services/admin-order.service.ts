import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type AdminOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_COD_CONFIRMATION'
  | 'CONFIRMED'
  | 'PREPARING_COMPONENTS'
  | 'ASSEMBLING'
  | 'READY_FOR_PICKUP'
  | 'SHIPPING'
  | 'DELIVERY_FAILED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type AdminFulfillmentMethod = 'PICKUP' | 'DELIVERY';
export type AdminPaymentMethod = 'QR' | 'COD';
export type AdminPaymentState = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export type AdminOrderListItem = {
  id: string;
  code: string;
  submittedAt: string;
  createdAt: string;
  status: AdminOrderStatus;
  holdReason: string | null;
  cancellationReason: string | null;
  fulfillmentMethod: AdminFulfillmentMethod;
  paymentMethod: AdminPaymentMethod;
  grandTotal: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  branch: {
    id: number;
    code: string;
    name: string;
  };
  payment: {
    id: string;
    state: AdminPaymentState;
    method: AdminPaymentMethod;
    totalReceived: string;
    codRemaining: string;
  } | null;
  hasAssembly: boolean;
  lineCount: number;
};

export type AdminOrderListResult = {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
};

export type OrderFilterParams = {
  search?: string;
  tab?: string;
  status?: string | string[];
  branchId?: number | null;
  fulfillmentMethod?: string;
  paymentMethod?: string;
  hasAssembly?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/orders'
      : '/v1/admin/orders';

  readonly orders = signal<AdminOrderListItem[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
  readonly totalPages = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly statusCounts = signal<Record<string, number>>({});

  readonly searchQuery = signal<string>('');
  readonly selectedTab = signal<string>('ALL');
  readonly selectedBranchId = signal<number | null>(null);
  readonly selectedFulfillment = signal<string>('');
  readonly selectedPayment = signal<string>('');
  readonly selectedAssembly = signal<string>('');
  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');
  readonly sortBy = signal<string>('submittedAt');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadOrders(params?: OrderFilterParams): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();

      const search = params?.search !== undefined ? params.search : this.searchQuery();
      if (search && search.trim()) {
        httpParams = httpParams.set('search', search.trim());
      }

      const tab = params?.tab !== undefined ? params.tab : this.selectedTab();
      if (tab && tab !== 'ALL') {
        httpParams = httpParams.set('tab', tab);
      }

      const branchId =
        params?.branchId !== undefined ? params.branchId : this.selectedBranchId();
      if (branchId) {
        httpParams = httpParams.set('branchId', branchId.toString());
      }

      const fulfillment =
        params?.fulfillmentMethod !== undefined
          ? params.fulfillmentMethod
          : this.selectedFulfillment();
      if (fulfillment) {
        httpParams = httpParams.set('fulfillmentMethod', fulfillment);
      }

      const payment =
        params?.paymentMethod !== undefined
          ? params.paymentMethod
          : this.selectedPayment();
      if (payment) {
        httpParams = httpParams.set('paymentMethod', payment);
      }

      const assembly =
        params?.hasAssembly !== undefined
          ? params.hasAssembly
          : this.selectedAssembly();
      if (assembly) {
        httpParams = httpParams.set('hasAssembly', assembly);
      }

      const from = params?.from !== undefined ? params.from : this.dateFrom();
      if (from) {
        httpParams = httpParams.set('from', from);
      }

      const to = params?.to !== undefined ? params.to : this.dateTo();
      if (to) {
        httpParams = httpParams.set('to', to);
      }

      const targetPage = params?.page ?? this.page();
      const targetLimit = params?.limit ?? this.limit();
      httpParams = httpParams.set('page', targetPage.toString());
      httpParams = httpParams.set('limit', targetLimit.toString());

      const targetSortBy = params?.sortBy ?? this.sortBy();
      const targetSortOrder = params?.sortOrder ?? this.sortOrder();
      httpParams = httpParams.set('sortBy', targetSortBy);
      httpParams = httpParams.set('sortOrder', targetSortOrder);

      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminOrderListResult>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const data = response.data;
      this.orders.set(data.items);
      this.total.set(data.total);
      this.page.set(data.page);
      this.limit.set(data.limit);
      this.totalPages.set(data.totalPages);
      this.statusCounts.set(data.statusCounts);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Loi khi tai danh sach don hang';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  setTab(tab: string): void {
    this.selectedTab.set(tab);
    this.page.set(1);
    void this.loadOrders({ tab, page: 1 });
  }

  setSearch(search: string): void {
    this.searchQuery.set(search);
    this.page.set(1);
    void this.loadOrders({ search, page: 1 });
  }

  setBranchFilter(branchId: number | null): void {
    this.selectedBranchId.set(branchId);
    this.page.set(1);
    void this.loadOrders({ branchId, page: 1 });
  }

  setFulfillmentFilter(fulfillment: string): void {
    this.selectedFulfillment.set(fulfillment);
    this.page.set(1);
    void this.loadOrders({ fulfillmentMethod: fulfillment, page: 1 });
  }

  setPaymentFilter(payment: string): void {
    this.selectedPayment.set(payment);
    this.page.set(1);
    void this.loadOrders({ paymentMethod: payment, page: 1 });
  }

  setAssemblyFilter(assembly: string): void {
    this.selectedAssembly.set(assembly);
    this.page.set(1);
    void this.loadOrders({ hasAssembly: assembly, page: 1 });
  }

  setDateRange(from: string, to: string): void {
    this.dateFrom.set(from);
    this.dateTo.set(to);
    this.page.set(1);
    void this.loadOrders({ from, to, page: 1 });
  }

  setPage(page: number): void {
    this.page.set(page);
    void this.loadOrders({ page });
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedTab.set('ALL');
    this.selectedBranchId.set(null);
    this.selectedFulfillment.set('');
    this.selectedPayment.set('');
    this.selectedAssembly.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.page.set(1);
    void this.loadOrders({
      search: '',
      tab: 'ALL',
      branchId: null,
      fulfillmentMethod: '',
      paymentMethod: '',
      hasAssembly: '',
      from: '',
      to: '',
      page: 1,
    });
  }
}
