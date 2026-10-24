import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type InventoryBalanceItem = {
  id: string;
  branchId: number;
  branchCode: string;
  branchName: string;
  branchAddress: string;
  skuId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  productTemplateId: number;
  productName: string;
  productSlug: string;
  categoryId: number;
  categoryName: string;
  brandName: string;
  onHand: number;
  reserved: number;
  quarantineDamaged: number;
  available: number;
  weightedAverageCost: string;
  sellingPrice: string;
  serialRequired: boolean;
  version: number;
  updatedAt: string;
};

export type InventoryBalancesSummary = {
  totalQuants: number;
  totalOnHand: number;
  totalReserved: number;
  totalQuarantine: number;
  totalAvailable: number;
  totalInventoryValue: string;
};

export type InventoryBalancesResponse = {
  items: InventoryBalanceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: InventoryBalancesSummary;
};

export type StockLedgerEntryItem = {
  id: string;
  stockQuantId: string;
  branchId: number;
  branchCode: string;
  branchName: string;
  skuId: number;
  sku: string;
  productName: string;
  variationLabel: string | null;
  entryType: string;
  deltaOnHand: number;
  deltaReserved: number;
  deltaQuarantine: number;
  onHandAfter: number;
  reservedAfter: number;
  quarantineAfter: number;
  actorType: string;
  actorId: string | null;
  occurredAt: string;
  documentCode: string;
  moveCode: string;
  moveType: string;
  reason: string | null;
  sourceBranchName: string | null;
  destinationBranchName: string | null;
};

export type StockLedgerResponse = {
  items: StockLedgerEntryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StockQuantLedgerDetail = {
  quant: InventoryBalanceItem;
  entries: StockLedgerEntryItem[];
};

export type SimpleOption = {
  id: number;
  name: string;
  code: string;
};

export type InventoryFilterParams = {
  search?: string;
  branchId?: number;
  categoryId?: number;
  stockStatus?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  page?: number;
  limit?: number;
};

export type LedgerFilterParams = {
  search?: string;
  branchId?: number;
  skuId?: number;
  entryType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

@Injectable({ providedIn: 'root' })
export class AdminInventoryService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/inventory'
      : '/v1/admin/inventory';

  private readonly branchesUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/branches'
      : '/v1/admin/branches';

  private readonly categoriesUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/categories'
      : '/v1/admin/categories';

  readonly balances = signal<InventoryBalanceItem[]>([]);
  readonly balancesTotal = signal<number>(0);
  readonly balancesPage = signal<number>(1);
  readonly balancesLimit = signal<number>(50);
  readonly balancesTotalPages = signal<number>(1);
  readonly balancesSummary = signal<InventoryBalancesSummary>({
    totalQuants: 0,
    totalOnHand: 0,
    totalReserved: 0,
    totalQuarantine: 0,
    totalAvailable: 0,
    totalInventoryValue: '0',
  });
  readonly isBalancesLoading = signal<boolean>(false);
  readonly balancesError = signal<string | null>(null);

  readonly ledgerEntries = signal<StockLedgerEntryItem[]>([]);
  readonly ledgerTotal = signal<number>(0);
  readonly ledgerPage = signal<number>(1);
  readonly ledgerLimit = signal<number>(50);
  readonly ledgerTotalPages = signal<number>(1);
  readonly isLedgerLoading = signal<boolean>(false);
  readonly ledgerError = signal<string | null>(null);

  readonly selectedQuantLedger = signal<StockQuantLedgerDetail | null>(null);
  readonly isSheetLoading = signal<boolean>(false);
  readonly sheetError = signal<string | null>(null);

  readonly branches = signal<SimpleOption[]>([]);
  readonly categories = signal<SimpleOption[]>([]);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadBalances(params?: InventoryFilterParams): Promise<InventoryBalancesResponse> {
    this.isBalancesLoading.set(true);
    this.balancesError.set(null);

    try {
      let httpParams = new HttpParams();

      if (params?.search && params.search.trim()) {
        httpParams = httpParams.set('search', params.search.trim());
      }
      if (params?.branchId) {
        httpParams = httpParams.set('branchId', params.branchId.toString());
      }
      if (params?.categoryId) {
        httpParams = httpParams.set('categoryId', params.categoryId.toString());
      }
      if (params?.stockStatus && params.stockStatus !== 'ALL') {
        httpParams = httpParams.set('stockStatus', params.stockStatus);
      }
      if (params?.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params?.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<InventoryBalancesResponse>>(`${this.baseUrl}/balances`, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const data = response.data;
      this.balances.set(data.items);
      this.balancesTotal.set(data.total);
      this.balancesPage.set(data.page);
      this.balancesLimit.set(data.limit);
      this.balancesTotalPages.set(data.totalPages);
      this.balancesSummary.set(data.summary);

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Khong the tai danh sach ton kho';
      this.balancesError.set(message);
      throw err;
    } finally {
      this.isBalancesLoading.set(false);
    }
  }

  async loadQuantLedger(stockQuantId: string): Promise<StockQuantLedgerDetail> {
    this.isSheetLoading.set(true);
    this.sheetError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<StockQuantLedgerDetail>>(
          `${this.baseUrl}/balances/${stockQuantId}/ledger`,
          {
            headers: this.getAuthHeaders(),
          },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.selectedQuantLedger.set(response.data);
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Khong the tai so kho cua SKU';
      this.sheetError.set(message);
      throw err;
    } finally {
      this.isSheetLoading.set(false);
    }
  }

  async loadLedger(params?: LedgerFilterParams): Promise<StockLedgerResponse> {
    this.isLedgerLoading.set(true);
    this.ledgerError.set(null);

    try {
      let httpParams = new HttpParams();

      if (params?.search && params.search.trim()) {
        httpParams = httpParams.set('search', params.search.trim());
      }
      if (params?.branchId) {
        httpParams = httpParams.set('branchId', params.branchId.toString());
      }
      if (params?.skuId) {
        httpParams = httpParams.set('skuId', params.skuId.toString());
      }
      if (params?.entryType) {
        httpParams = httpParams.set('entryType', params.entryType);
      }
      if (params?.startDate) {
        httpParams = httpParams.set('startDate', params.startDate);
      }
      if (params?.endDate) {
        httpParams = httpParams.set('endDate', params.endDate);
      }
      if (params?.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params?.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<StockLedgerResponse>>(`${this.baseUrl}/ledger`, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const data = response.data;
      this.ledgerEntries.set(data.items);
      this.ledgerTotal.set(data.total);
      this.ledgerPage.set(data.page);
      this.ledgerLimit.set(data.limit);
      this.ledgerTotalPages.set(data.totalPages);

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Khong the tai so kho bat bien';
      this.ledgerError.set(message);
      throw err;
    } finally {
      this.isLedgerLoading.set(false);
    }
  }

  async loadBranches(): Promise<SimpleOption[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ items: { id: number; name: string; code: string; isActive: boolean }[] }>>(
          this.branchesUrl,
          {
            headers: this.getAuthHeaders(),
            params: new HttpParams().set('isActive', 'true').set('limit', '100'),
          },
        ),
      );

      if (response.success) {
        const list = response.data.items.map((b) => ({
          id: b.id,
          name: b.name,
          code: b.code,
        }));
        this.branches.set(list);
        return list;
      }
      return [];
    } catch {
      return [];
    }
  }

  async loadCategories(): Promise<SimpleOption[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ items?: { id: number; name: string; slug: string }[] } | { id: number; name: string; slug: string }[]>>(
          this.categoriesUrl,
          {
            headers: this.getAuthHeaders(),
            params: new HttpParams().set('limit', '100'),
          },
        ),
      );

      if (response.success) {
        let rawItems: { id: number; name: string; slug: string }[] = [];
        if (Array.isArray(response.data)) {
          rawItems = response.data;
        } else if (response.data && Array.isArray((response.data as { items?: { id: number; name: string; slug: string }[] }).items)) {
          rawItems = (response.data as { items: { id: number; name: string; slug: string }[] }).items;
        }
        const list = rawItems.map((c) => ({
          id: c.id,
          name: c.name,
          code: c.slug,
        }));
        this.categories.set(list);
        return list;
      }
      return [];
    } catch {
      return [];
    }
  }
}
