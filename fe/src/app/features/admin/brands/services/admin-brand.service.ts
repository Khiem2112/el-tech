import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type BrandCategorySummary = {
  id: number;
  name: string;
  slug: string;
};

export type AdminBrand = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productTemplateCount: number;
  categories: BrandCategorySummary[];
};

export type CreateBrandPayload = {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  isActive?: boolean;
};

export type UpdateBrandPayload = Partial<CreateBrandPayload>;

export type BrandFilterParams = {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type BrandListApiResponse = {
  items: AdminBrand[];
  total: number;
  page: number;
  limit: number;
};

@Injectable({ providedIn: 'root' })
export class AdminBrandService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/brands'
      : '/v1/admin/brands';

  readonly brands = signal<AdminBrand[]>([]);
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

  async loadBrands(params?: BrandFilterParams): Promise<void> {
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

      if (params?.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params?.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<BrandListApiResponse>>(this.baseUrl, {
          headers,
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.brands.set(response.data.items);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Khong the tai danh sach thuong hieu';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getBrandById(id: number): Promise<AdminBrand> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminBrand>>(`${this.baseUrl}/${id}`, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async createBrand(payload: CreateBrandPayload): Promise<AdminBrand> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminBrand>>(this.baseUrl, payload, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadBrands();
    return response.data;
  }

  async updateBrand(id: number, payload: UpdateBrandPayload): Promise<AdminBrand> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<AdminBrand>>(`${this.baseUrl}/${id}`, payload, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadBrands();
    return response.data;
  }

  async toggleBrandStatus(id: number): Promise<AdminBrand> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<AdminBrand>>(
        `${this.baseUrl}/${id}/toggle-status`,
        {},
        { headers },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadBrands();
    return response.data;
  }

  async deleteBrand(id: number): Promise<void> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.delete<ApiResponse<{ success: boolean; id: number }>>(`${this.baseUrl}/${id}`, {
        headers,
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadBrands();
  }
}
