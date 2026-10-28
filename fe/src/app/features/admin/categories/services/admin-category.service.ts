import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type SpecAttributeType = 'text' | 'number' | 'boolean' | 'select';

export type SpecAttribute = {
  key: string;
  label: string;
  type: SpecAttributeType;
  unit?: string | null;
  required: boolean;
  filterable: boolean;
  comparable: boolean;
  options: string[];
  isDeprecated: boolean;
};

export type AdminCategory = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  specificationSchema: SpecAttribute[];
  specificationSchemaVersion: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productTemplateCount: number;
  totalInventory: number;
  activeTransfers: number;
  children?: AdminCategory[];
};

export type CreateCategoryPayload = {
  name: string;
  slug: string;
  parentId?: number | null;
  description?: string | null;
  specificationSchema?: SpecAttribute[];
  isActive?: boolean;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type UpdateSpecSchemaPayload = {
  specificationSchema: SpecAttribute[];
};

export type CategoryFilterParams = {
  search?: string;
  parentId?: number;
  isActive?: boolean;
  tree?: boolean;
};

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/categories'
      : '/v1/admin/categories';

  readonly categories = signal<AdminCategory[]>([]);
  readonly categoryTree = signal<AdminCategory[]>([]);
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

  async loadCategories(params?: CategoryFilterParams): Promise<void> {
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

      const headers = this.getAuthHeaders();

      const [flatResponse, treeResponse] = await Promise.all([
        firstValueFrom(
          this.http.get<ApiResponse<AdminCategory[]>>(this.baseUrl, {
            headers,
            params: httpParams,
          }),
        ),
        firstValueFrom(
          this.http.get<ApiResponse<AdminCategory[]>>(`${this.baseUrl}/tree`, {
            headers,
          }),
        ),
      ]);

      if (!flatResponse.success) {
        throw new Error(flatResponse.error.messageKey);
      }
      if (!treeResponse.success) {
        throw new Error(treeResponse.error.messageKey);
      }

      this.categories.set(flatResponse.data);
      this.categoryTree.set(treeResponse.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Khong the tai danh sach danh muc nganh hang';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getCategoryById(id: number): Promise<AdminCategory> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminCategory>>(`${this.baseUrl}/${id}`, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async createCategory(payload: CreateCategoryPayload): Promise<AdminCategory> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminCategory>>(this.baseUrl, payload, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadCategories();
    return response.data;
  }

  async updateCategory(id: number, payload: UpdateCategoryPayload): Promise<AdminCategory> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AdminCategory>>(`${this.baseUrl}/${id}`, payload, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadCategories();
    return response.data;
  }

  async updateSpecSchema(id: number, payload: UpdateSpecSchemaPayload): Promise<AdminCategory> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AdminCategory>>(`${this.baseUrl}/${id}/spec-schema`, payload, {
        headers,
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadCategories();
    return response.data;
  }

  async toggleCategoryStatus(id: number): Promise<AdminCategory> {
    const headers = this.getAuthHeaders();
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<AdminCategory>>(
        `${this.baseUrl}/${id}/toggle-status`,
        {},
        { headers },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadCategories();
    return response.data;
  }
}
