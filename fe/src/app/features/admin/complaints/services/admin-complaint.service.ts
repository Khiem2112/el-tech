import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type ComplaintStatus = 'RECEIVED' | 'PROCESSING' | 'RESOLVED' | 'DISMISSED';

export type AdminComplaintCustomer = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
};

export type AdminComplaintOrder = {
  readonly id: string;
  readonly code: string;
  readonly status: string;
  readonly grandTotal: string;
};

export type AdminComplaintItem = {
  readonly id: string;
  readonly code: string;
  readonly customerId: string | null;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly customerEmail: string | null;
  readonly orderId: string | null;
  readonly orderCode: string | null;
  readonly serialNumber: string | null;
  readonly category: string;
  readonly status: ComplaintStatus;
  readonly title: string | null;
  readonly description: string;
  readonly resolutionNote: string | null;
  readonly resolvedAt: string | null;
  readonly resolvedBy: string | null;
  readonly attachments: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly customer?: AdminComplaintCustomer | null;
  readonly order?: AdminComplaintOrder | null;
};

export type AdminComplaintStats = {
  readonly total: number;
  readonly received: number;
  readonly processing: number;
  readonly resolved: number;
  readonly dismissed: number;
};

export type AdminComplaintListPayload = {
  readonly items: readonly AdminComplaintItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly stats: AdminComplaintStats;
};

export type AdminComplaintFilterParams = {
  readonly page?: number;
  readonly limit?: number;
  readonly status?: string;
  readonly category?: string;
  readonly search?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminComplaintService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/complaints'
      : '/v1/admin/complaints';

  readonly complaints = signal<readonly AdminComplaintItem[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(10);
  readonly totalPages = signal<number>(1);
  readonly stats = signal<AdminComplaintStats>({
    total: 0,
    received: 0,
    processing: 0,
    resolved: 0,
    dismissed: 0,
  });
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly statusFilter = signal<string>('ALL');
  readonly categoryFilter = signal<string>('ALL');
  readonly searchQuery = signal<string>('');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadComplaints(params?: AdminComplaintFilterParams): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    const currentPage = params?.page ?? this.page();
    const currentLimit = params?.limit ?? this.limit();
    const currentStatus = params?.status ?? this.statusFilter();
    const currentCategory = params?.category ?? this.categoryFilter();
    const currentSearch = params?.search ?? this.searchQuery();

    let httpParams = new HttpParams()
      .set('page', currentPage.toString())
      .set('limit', currentLimit.toString());

    if (currentStatus && currentStatus !== 'ALL') {
      httpParams = httpParams.set('status', currentStatus);
    }
    if (currentCategory && currentCategory !== 'ALL') {
      httpParams = httpParams.set('category', currentCategory);
    }
    if (currentSearch && currentSearch.trim()) {
      httpParams = httpParams.set('search', currentSearch.trim());
    }

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminComplaintListPayload>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        this.error.set(response.error.messageKey || 'Không thể tải danh sách khiếu nại');
        return;
      }

      this.complaints.set(response.data.items);
      this.total.set(response.data.total);
      this.page.set(response.data.page);
      this.limit.set(response.data.limit);
      this.totalPages.set(response.data.totalPages);
      if (response.data.stats) {
        this.stats.set(response.data.stats);
      }
    } catch (err: unknown) {
      let message = 'Lỗi kết nối máy chủ';
      if (err instanceof HttpErrorResponse && err.error) {
        message = err.error.error?.messageKey || err.error.messageKey || err.error.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getComplaintById(id: string): Promise<AdminComplaintItem> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminComplaintItem>>(`${this.baseUrl}/${id}`, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey || 'Không tìm thấy chi tiết khiếu nại');
      }

      return response.data;
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse && err.error) {
        const msg = err.error.error?.messageKey || err.error.messageKey || err.error.message;
        if (msg) throw new Error(msg);
      }
      throw err;
    }
  }

  async updateStatus(
    id: string,
    status: ComplaintStatus,
    resolutionNote?: string,
  ): Promise<AdminComplaintItem> {
    try {
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<AdminComplaintItem>>(
          `${this.baseUrl}/${id}/status`,
          { status, resolutionNote },
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey || 'Không thể cập nhật trạng thái khiếu nại');
      }

      const updated = response.data;
      this.complaints.update((list) =>
        list.map((item) => (item.id === id ? updated : item)),
      );

      await this.loadComplaints();
      return updated;
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse && err.error) {
        const msg = err.error.error?.messageKey || err.error.messageKey || err.error.message;
        if (msg) throw new Error(msg);
      }
      throw err;
    }
  }

  async deleteComplaint(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<{ success: boolean; id: string }>>(
          `${this.baseUrl}/${id}`,
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error?.messageKey ?? 'Không thể xóa phiếu khiếu nại');
      }

      this.complaints.update((list) => list.filter((item) => item.id !== id));
      await this.loadComplaints();
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse && err.error) {
        const msg = err.error.error?.messageKey || err.error.messageKey || err.error.message;
        if (msg) throw new Error(msg);
      }
      throw err;
    }
  }
}
