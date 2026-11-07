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

export function normalizeSpecSchema(raw: unknown): SpecAttribute[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => {
    if (!item || typeof item !== 'object') {
      return {
        key: 'unknown',
        label: 'Unknown',
        type: 'text',
        unit: null,
        required: false,
        filterable: false,
        comparable: false,
        options: [],
        isDeprecated: false,
      };
    }
    const record = item as Record<string, unknown>;
    const key = String(record['key'] || record['stable_key'] || '').trim().toLowerCase();
    const label = String(record['label'] || key || '').trim();
    const rawType = String(record['type'] || record['data_type'] || 'text').trim().toLowerCase();
    let type: SpecAttributeType = 'text';
    if (rawType === 'number') {
      type = 'number';
    } else if (rawType === 'boolean') {
      type = 'boolean';
    } else if (rawType === 'select' || rawType === 'enum') {
      type = 'select';
    }
    const unit = record['unit'] !== undefined && record['unit'] !== null ? String(record['unit']).trim() : null;
    const required = Boolean(record['required'] ?? record['is_required']);
    const filterable = Boolean(record['filterable'] ?? record['is_filterable']);
    const comparable = Boolean(record['comparable'] ?? record['is_comparable']);
    const rawOptions = record['options'] ?? record['allowed_values'];
    const options = Array.isArray(rawOptions) ? rawOptions.map(String) : [];
    const isDeprecated = Boolean(record['isDeprecated'] ?? record['is_deprecated']);

    return {
      key,
      label,
      type,
      unit,
      required,
      filterable,
      comparable,
      options,
      isDeprecated,
    };
  });
}

export function slugifyCategory(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export type CreateCategoryPayload = {
  name: string;
  slug?: string;
  parentId?: number | null;
  description?: string | null;
  specificationSchema?: SpecAttribute[];
  isActive?: boolean;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type UpdateSpecSchemaPayload = {
  specificationSchema: SpecAttribute[];
};

export type CategoryListResponse = {
  items: AdminCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
    await this.loadCategories({ page: newPage });
  }

  async loadCategories(params?: CategoryFilterParams & { page?: number; limit?: number }): Promise<void> {
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
      const targetLimit = this.limit();
      httpParams = httpParams.set('page', targetPage.toString());
      httpParams = httpParams.set('limit', targetLimit.toString());

      const headers = this.getAuthHeaders();

      const [flatResponse, treeResponse] = await Promise.all([
        firstValueFrom(
          this.http.get<ApiResponse<CategoryListResponse>>(this.baseUrl, {
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

      const normalizedItems = (flatResponse.data.items || []).map((cat) => ({
        ...cat,
        specificationSchema: normalizeSpecSchema(cat.specificationSchema),
      }));
      this.categories.set(normalizedItems);
      this.total.set(flatResponse.data.total);
      this.page.set(flatResponse.data.page);
      this.limit.set(flatResponse.data.limit);
      this.totalPages.set(flatResponse.data.totalPages);
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

    return {
      ...response.data,
      specificationSchema: normalizeSpecSchema(response.data.specificationSchema),
    };
  }

  async createCategory(payload: CreateCategoryPayload): Promise<AdminCategory> {
    const headers = this.getAuthHeaders();
    const finalPayload = {
      ...payload,
      slug: payload.slug?.trim() ? payload.slug.trim() : slugifyCategory(payload.name),
    };
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminCategory>>(this.baseUrl, finalPayload, { headers }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    await this.loadCategories();
    return {
      ...response.data,
      specificationSchema: normalizeSpecSchema(response.data.specificationSchema),
    };
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
    return {
      ...response.data,
      specificationSchema: normalizeSpecSchema(response.data.specificationSchema),
    };
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
    return {
      ...response.data,
      specificationSchema: normalizeSpecSchema(response.data.specificationSchema),
    };
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
    return {
      ...response.data,
      specificationSchema: normalizeSpecSchema(response.data.specificationSchema),
    };
  }
}
