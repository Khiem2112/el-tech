import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type AdminSupplier = {
  id: number;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  purchaseOrderCount: number;
};

export type CreateSupplierPayload = {
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactName?: string | null;
  isActive?: boolean;
};

export type UpdateSupplierPayload = Partial<CreateSupplierPayload>;

export type SupplierFilterParams = {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type SupplierListApiResponse = {
  items: AdminSupplier[];
  total: number;
  page: number;
  limit: number;
};

@Injectable({ providedIn: 'root' })
export class AdminSupplierService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/suppliers'
      : '/v1/admin/suppliers';

  readonly suppliers = signal<AdminSupplier[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(10);
  readonly totalPages = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async setPage(newPage: number): Promise<void> {
    this.page.set(newPage);
    await this.loadSuppliers({ page: newPage });
  }

  async loadSuppliers(params?: SupplierFilterParams): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();

      const targetSearch = params?.search !== undefined ? params.search : this.searchQuery();
      if (targetSearch.trim()) {
        httpParams = httpParams.set('search', targetSearch.trim());
      }

      let activeParam = params?.isActive;
      if (activeParam === undefined) {
        const filter = this.statusFilter();
        if (filter === 'ACTIVE') {
          activeParam = true;
        } else if (filter === 'INACTIVE') {
          activeParam = false;
        }
      }

      if (activeParam !== undefined) {
        httpParams = httpParams.set('isActive', activeParam ? 'true' : 'false');
      }

      const targetPage = params?.page ?? this.page();
      const targetLimit = params?.limit ?? this.limit();
      httpParams = httpParams.set('page', targetPage.toString());
      httpParams = httpParams.set('limit', targetLimit.toString());

      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<SupplierListApiResponse>>(this.baseUrl, {
          headers,
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.suppliers.set(response.data.items);
      this.total.set(response.data.total);
      this.page.set(response.data.page);
      this.limit.set(response.data.limit);
      this.totalPages.set(Math.ceil(response.data.total / response.data.limit) || 1);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Khong the tai danh sach nha cung cap';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getSupplierById(id: number): Promise<AdminSupplier> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminSupplier>>(`${this.baseUrl}/${id}`, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async createSupplier(payload: CreateSupplierPayload): Promise<AdminSupplier> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminSupplier>>(this.baseUrl, payload, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadSuppliers();
    return response.data;
  }

  async updateSupplier(id: number, payload: UpdateSupplierPayload): Promise<AdminSupplier> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AdminSupplier>>(`${this.baseUrl}/${id}`, payload, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadSuppliers();
    return response.data;
  }

  async toggleSupplierStatus(id: number): Promise<AdminSupplier> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<AdminSupplier>>(
        `${this.baseUrl}/${id}/toggle-status`,
        {},
        { headers },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadSuppliers();
    return response.data;
  }

  async deleteSupplier(id: number): Promise<void> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.delete<ApiResponse<{ success: boolean; id: number }>>(`${this.baseUrl}/${id}`, {
        headers,
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadSuppliers();
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setStatusFilter(filter: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.statusFilter.set(filter);
  }
}
