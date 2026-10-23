import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type AdminBranch = {
  id: number;
  code: string;
  name: string;
  address: string;
  openingHour: unknown;
  deliveryPriority: number;
  deliveryAreaCodes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BranchListPayload = {
  items: AdminBranch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateBranchPayload = {
  code: string;
  name: string;
  address: string;
  openingHour?: string | Record<string, unknown>;
  deliveryPriority: number;
  deliveryAreaCodes: string[] | string;
  phone?: string;
  email?: string;
  isActive?: boolean;
};

export type UpdateBranchPayload = Partial<CreateBranchPayload>;

export type BranchFilterParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

@Injectable({ providedIn: 'root' })
export class AdminBranchService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/branches'
      : '/v1/admin/branches';

  readonly branches = signal<AdminBranch[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
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

  async loadBranches(params?: BranchFilterParams): Promise<void> {
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

      let activeParam = params?.isActive;
      if (activeParam === undefined) {
        const filter = this.statusFilter();
        if (filter === 'ACTIVE') {
          activeParam = true;
        } else if (filter === 'INACTIVE') {
          activeParam = false;
        }
      }

      if (typeof activeParam === 'boolean') {
        httpParams = httpParams.set('isActive', activeParam.toString());
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<BranchListPayload>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (response.success) {
        this.branches.set(response.data.items);
        this.total.set(response.data.total);
        this.page.set(response.data.page);
        this.limit.set(response.data.limit);
        this.totalPages.set(response.data.totalPages);
      } else {
        this.error.set(response.error.messageKey);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Loi khi tai danh sach chi nhanh';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getBranch(id: number): Promise<AdminBranch> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminBranch>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async createBranch(payload: CreateBranchPayload): Promise<AdminBranch> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminBranch>>(this.baseUrl, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadBranches();
    return response.data;
  }

  async updateBranch(id: number, payload: UpdateBranchPayload): Promise<AdminBranch> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AdminBranch>>(`${this.baseUrl}/${id}`, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    const updated = response.data;
    this.branches.update((list) =>
      list.map((item) => (item.id === id ? updated : item)),
    );

    return updated;
  }

  async toggleStatus(id: number): Promise<AdminBranch> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<AdminBranch>>(`${this.baseUrl}/${id}/toggle-status`, {}, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    const updated = response.data;
    this.branches.update((list) =>
      list.map((item) => (item.id === id ? updated : item)),
    );

    return updated;
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.page.set(1);
  }

  setStatusFilter(filter: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.statusFilter.set(filter);
    this.page.set(1);
  }

  setPage(newPage: number): void {
    this.page.set(newPage);
  }
}
