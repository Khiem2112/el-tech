import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type AdminNotificationCustomer = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
};

export type AdminNotificationOrder = {
  readonly id: string;
  readonly code: string;
} | null;

export type AdminNotificationDeliveryAttempt = {
  readonly channel?: string;
  readonly status?: string;
  readonly attemptedAt?: string;
  readonly error?: string | null;
  readonly details?: Record<string, unknown>;
};

export type AdminNotificationStatus = 'SENT' | 'PENDING' | 'FAILED';

export type AdminNotificationItem = {
  readonly id: string;
  readonly customerId: string;
  readonly orderId: string | null;
  readonly deduplicationKey: string;
  readonly eventType: string;
  readonly title: string;
  readonly body: string;
  readonly channels: readonly ('IN_APP' | 'EMAIL' | 'SMS')[];
  readonly payload: Record<string, unknown>;
  readonly deliveryAttempts: readonly AdminNotificationDeliveryAttempt[];
  readonly publishedAt: string | null;
  readonly lastDeliveryAt: string | null;
  readonly lastDeliveryError: string | null;
  readonly readAt: string | null;
  readonly status: AdminNotificationStatus;
  readonly retryCount: number;
  readonly customer: AdminNotificationCustomer;
  readonly order: AdminNotificationOrder;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminNotificationListPayload = {
  readonly items: readonly AdminNotificationItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

export type AdminNotificationFilterParams = {
  readonly page?: number;
  readonly limit?: number;
  readonly channel?: 'IN_APP' | 'EMAIL' | 'SMS' | 'ALL';
  readonly eventType?: string;
  readonly status?: 'ALL' | 'SENT' | 'PENDING' | 'FAILED';
  readonly search?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminNotificationService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/notifications'
      : '/v1/admin/notifications';

  readonly notifications = signal<readonly AdminNotificationItem[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
  readonly totalPages = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly channelFilter = signal<'ALL' | 'IN_APP' | 'EMAIL' | 'SMS'>('ALL');
  readonly eventTypeFilter = signal<string>('ALL');
  readonly statusFilter = signal<'ALL' | 'SENT' | 'PENDING' | 'FAILED'>('ALL');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadNotifications(params?: AdminNotificationFilterParams): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();
      const currentPage = params?.page ?? this.page();
      const currentLimit = params?.limit ?? this.limit();
      const currentSearch = params?.search !== undefined ? params.search : this.searchQuery();
      const currentChannel = params?.channel ?? this.channelFilter();
      const currentEventType = params?.eventType ?? this.eventTypeFilter();
      const currentStatus = params?.status ?? this.statusFilter();

      httpParams = httpParams.set('page', currentPage.toString());
      httpParams = httpParams.set('limit', currentLimit.toString());

      if (currentSearch.trim()) {
        httpParams = httpParams.set('search', currentSearch.trim());
      }
      if (currentChannel !== 'ALL') {
        httpParams = httpParams.set('channel', currentChannel);
      }
      if (currentEventType !== 'ALL' && currentEventType.trim()) {
        httpParams = httpParams.set('eventType', currentEventType.trim());
      }
      if (currentStatus !== 'ALL') {
        httpParams = httpParams.set('status', currentStatus);
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminNotificationListPayload>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (response.success) {
        this.notifications.set(response.data.items);
        this.total.set(response.data.total);
        this.page.set(response.data.page);
        this.limit.set(response.data.limit);
        this.totalPages.set(response.data.totalPages);
      } else {
        this.error.set(response.error.messageKey);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Loi he thong khi tai hop thu thong bao';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getNotificationById(id: string): Promise<AdminNotificationItem> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminNotificationItem>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async retryNotification(id: string): Promise<AdminNotificationItem> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminNotificationItem>>(
        `${this.baseUrl}/${id}/retry`,
        {},
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    const updated = response.data;
    this.notifications.update((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );

    return updated;
  }
}
