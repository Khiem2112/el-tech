import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type SupplierReturnListItem = {
  id: string;
  code: string;
  status: string;
  reason: string | null;
  sourceBranchId: number | null;
  sourceBranchName: string | null;
  sourceBranchCode: string | null;
  inboundMoveId: string | null;
  inboundMoveCode: string | null;
  purchaseOrderId: string | null;
  purchaseOrderCode: string | null;
  supplierId: number | null;
  supplierName: string | null;
  supplierCode: string | null;
  totalQuantity: number;
  lineCount: number;
  returnSources: string[];
  validatedAt: string | null;
  createdAt: string;
};

export type SupplierReturnListResponse = {
  items: SupplierReturnListItem[];
  total: number;
  page: number;
  limit: number;
};

export type EligibleReceiptSkuInfo = {
  skuId: number;
  skuCode: string;
  skuName: string;
  serialRequired: boolean;
  unitCost: string;
  receivedQuantity: number;
  alreadyReturnedQuantity: number;
  maxReturnableQuantity: number;
  currentOnHand: number;
  currentQuarantineDamaged: number;
  availableSerials: string[];
  quarantinedSerials: string[];
};

export type EligibleReceipt = {
  inboundMoveId: string;
  inboundMoveCode: string;
  validatedAt: string | null;
  purchaseOrderId: string;
  purchaseOrderCode: string;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  receivingBranchId: number;
  receivingBranchName: string;
  receivingBranchCode: string;
  skus: EligibleReceiptSkuInfo[];
};

export type CreateSupplierReturnLinePayload = {
  skuId: number;
  quantity: number;
  returnSource: 'quarantineDamaged' | 'onHand';
  serialNumbers?: string[];
};

export type CreateSupplierReturnPayload = {
  inboundStockMoveId: string;
  reason: string;
  lines: CreateSupplierReturnLinePayload[];
};

export type SupplierReturnLineDetail = {
  id: string;
  skuId: number;
  quantity: number;
  unitCost: string;
  sku: {
    id: number;
    sku: string;
    variationLabel: string | null;
    productTemplate?: {
      name: string;
    };
  };
  serialMovements: {
    id: string;
    serialUnit: {
      serialNumber: string;
    };
  }[];
  ledgerEntries: {
    deltaOnHand: number;
    deltaQuarantine: number;
    onHandAfter: number;
    quarantineAfter: number;
  }[];
};

export type SupplierReturnDetail = {
  id: string;
  code: string;
  status: string;
  reason: string | null;
  validatedAt: string | null;
  createdAt: string;
  sourceBranch?: {
    id: number;
    name: string;
    code: string;
  } | null;
  reversalOfMove?: {
    id: string;
    code: string;
    purchaseOrder?: {
      id: string;
      code: string;
      supplier: {
        id: number;
        code: string;
        name: string;
      };
    } | null;
  } | null;
  lines: SupplierReturnLineDetail[];
};

@Injectable({ providedIn: 'root' })
export class AdminSupplierReturnService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/supplier-returns'
      : '/v1/admin/supplier-returns';

  readonly supplierReturns = signal<SupplierReturnListItem[]>([]);
  readonly selectedSupplierReturn = signal<SupplierReturnDetail | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly branchFilter = signal<number | 'ALL'>('ALL');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadSupplierReturns(params?: {
    search?: string;
    branchId?: number;
    supplierId?: number;
    page?: number;
    limit?: number;
  }): Promise<SupplierReturnListResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();

      const search = params?.search !== undefined ? params.search : this.searchQuery();
      if (search.trim()) {
        httpParams = httpParams.set('search', search.trim());
      }

      const branchId = params?.branchId !== undefined ? params.branchId : this.branchFilter();
      if (branchId && branchId !== 'ALL') {
        httpParams = httpParams.set('branchId', branchId.toString());
      }

      if (params?.supplierId) {
        httpParams = httpParams.set('supplierId', params.supplierId.toString());
      }

      if (params?.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }

      if (params?.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<SupplierReturnListResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const data = response.data;
      this.supplierReturns.set(data.items);
      return data;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể tải danh sách phiếu xuất trả nhà cung cấp';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getSupplierReturnById(id: string): Promise<SupplierReturnDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<SupplierReturnDetail>>(`${this.baseUrl}/${id}`, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.selectedSupplierReturn.set(response.data);
      return response.data;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể tải chi tiết phiếu xuất trả';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadEligibleReceipts(params?: {
    search?: string;
    supplierId?: number;
    branchId?: number;
  }): Promise<EligibleReceipt[]> {
    let httpParams = new HttpParams();
    if (params?.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params?.supplierId) {
      httpParams = httpParams.set('supplierId', params.supplierId.toString());
    }
    if (params?.branchId) {
      httpParams = httpParams.set('branchId', params.branchId.toString());
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<EligibleReceipt[]>>(`${this.baseUrl}/eligible-receipts`, {
        headers: this.getAuthHeaders(),
        params: httpParams,
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async getReceiptMoveReturnInfo(receiptMoveId: string): Promise<EligibleReceipt> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<EligibleReceipt>>(
        `${this.baseUrl}/receipt-info/${receiptMoveId}`,
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async createSupplierReturn(payload: CreateSupplierReturnPayload): Promise<SupplierReturnDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<SupplierReturnDetail>>(this.baseUrl, payload, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      await this.loadSupplierReturns();
      return response.data;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Lỗi khi tạo phiếu xuất trả nhà cung cấp';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }
}
