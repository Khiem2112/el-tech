import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type StockMoveSku = {
  id: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  template: {
    id: number;
    name: string;
  };
};

export type StockMoveLineSerialUnit = {
  serialNumber: string;
  status: string;
};

export type StockMoveLineItem = {
  id: string;
  stockMoveId: string;
  skuId: number;
  quantity: number;
  unitCost: string;
  sku: StockMoveSku;
  receivedSerialUnits: StockMoveLineSerialUnit[];
  serialMovements: StockMoveLineSerialUnit[];
  serials: string[];
};

export type StockMoveOrder = {
  id: string;
  code: string;
  receiverName: string;
  receiverPhone: string;
  status: string;
  createdAt: string;
};

export type StockMovePurchaseOrder = {
  id: string;
  poNumber: string;
  code: string;
  supplier: {
    name: string;
  };
  status: string;
  createdAt: string;
};

export type StockMoveType = 'PURCHASE_RECEIPT' | 'ORDER_ISSUE';
export type StockMoveStatus = 'DRAFT' | 'RESERVED' | 'VALIDATED' | 'CANCELLED';

export type StockMoveListItem = {
  id: string;
  code: string;
  orderId: string | null;
  purchaseOrderId: string | null;
  moveType: StockMoveType;
  status: StockMoveStatus;
  reason: string | null;
  reservedAt: string | null;
  validatedAt: string | null;
  cancelledAt: string | null;
  dispatchedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: StockMoveOrder | null;
  purchaseOrder: StockMovePurchaseOrder | null;
  lines: StockMoveLineItem[];
  totalQuantity: number;
  totalLines: number;
};

export type StockMovesResponse = {
  items: StockMoveListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StockMoveFilterParams = {
  search?: string;
  moveType?: string;
  status?: string;
  page?: number;
  limit?: number;
};

@Injectable({
  providedIn: 'root',
})
export class AdminStockMoveService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/inventory/moves'
      : '/v1/admin/inventory/moves';

  readonly moves = signal<StockMoveListItem[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);
  readonly totalPages = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly expandedMoveIds = signal<Set<string>>(new Set<string>());

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  toggleExpand(moveId: string): void {
    const current = new Set(this.expandedMoveIds());
    if (current.has(moveId)) {
      current.delete(moveId);
    } else {
      current.add(moveId);
    }
    this.expandedMoveIds.set(current);
  }

  isExpanded(moveId: string): boolean {
    return this.expandedMoveIds().has(moveId);
  }

  expandAll(): void {
    const currentIds = new Set(this.moves().map((m) => m.id));
    this.expandedMoveIds.set(currentIds);
  }

  collapseAll(): void {
    this.expandedMoveIds.set(new Set<string>());
  }

  async loadStockMoves(params?: StockMoveFilterParams): Promise<StockMovesResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();

      if (params?.search && params.search.trim()) {
        httpParams = httpParams.set('search', params.search.trim());
      }
      if (params?.moveType && params.moveType !== 'ALL') {
        httpParams = httpParams.set('moveType', params.moveType);
      }
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
        this.http.get<ApiResponse<StockMovesResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const data = response.data;
      this.moves.set(data.items);
      this.total.set(data.total);
      this.page.set(data.page);
      this.limit.set(data.limit);
      this.totalPages.set(data.totalPages);

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Khong the tai danh sach phieu kho';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }
}
