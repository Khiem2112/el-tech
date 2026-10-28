import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type TransferStatusDisplay = 'REQUESTED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export type TransferLineItem = {
  id: string;
  skuId: number;
  skuCode: string;
  productName: string;
  productImage: string | null;
  variationLabel: string | null;
  quantity: number;
  unitCost: string;
  serialRequired: boolean;
  serialNumbers: string[];
};

export type TransferListItem = {
  id: string;
  code: string;
  status: string;
  displayStatus: TransferStatusDisplay;
  sourceBranchId: number;
  sourceBranchCode: string;
  sourceBranchName: string;
  destinationBranchId: number;
  destinationBranchCode: string;
  destinationBranchName: string;
  totalQuantity: number;
  lineCount: number;
  primaryProductName: string;
  primaryProductImage: string | null;
  reason: string | null;
  createdAt: string;
  dispatchedAt: string | null;
  validatedAt: string | null;
  cancelledAt: string | null;
  dispatchedByName: string | null;
  validatedByName: string | null;
  lines: TransferLineItem[];
};

export type TransferSummary = {
  totalTransfers: number;
  inTransitUnits: number;
  connectedBranchesCount: number;
  fullReceiptRate: string;
};

export type TransferListResponse = {
  items: TransferListItem[];
  total: number;
  page: number;
  limit: number;
  summary: TransferSummary;
};

export type TransferDetail = TransferListItem & {
  sourceBranchAddress: string;
  destinationBranchAddress: string;
};

export type TransferEligibleSku = {
  skuId: number;
  skuCode: string;
  productName: string;
  productImage: string | null;
  variationLabel: string | null;
  availableQuantity: number;
  onHand: number;
  reserved: number;
  serialRequired: boolean;
  currentCost: string;
};

export type BranchOption = {
  id: number;
  code: string;
  name: string;
  address?: string;
};

export type TransferFilterParams = {
  search?: string;
  status?: string;
  sourceBranchId?: number;
  destinationBranchId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export type CreateTransferLinePayload = {
  skuId: number;
  quantity: number;
};

export type CreateTransferPayload = {
  sourceBranchId: number;
  destinationBranchId: number;
  reason?: string;
  lines: CreateTransferLinePayload[];
};

export type DispatchTransferLinePayload = {
  skuId: number;
  serialNumbers?: string[];
};

export type DispatchTransferPayload = {
  lines: DispatchTransferLinePayload[];
};

export type ReceiveTransferPayload = {
  note?: string;
};

export type CancelTransferPayload = {
  reason: string;
};

@Injectable({
  providedIn: 'root',
})
export class AdminTransferService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/transfers'
      : '/v1/admin/transfers';

  private readonly branchesUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/branches'
      : '/v1/admin/branches';

  readonly transfers = signal<TransferListItem[]>([]);
  readonly transfersTotal = signal<number>(0);
  readonly transfersPage = signal<number>(1);
  readonly transfersLimit = signal<number>(20);
  readonly transfersSummary = signal<TransferSummary>({
    totalTransfers: 0,
    inTransitUnits: 0,
    connectedBranchesCount: 0,
    fullReceiptRate: '100%',
  });
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly branches = signal<BranchOption[]>([]);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadTransfers(params?: TransferFilterParams): Promise<TransferListResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();

      if (params?.search && params.search.trim()) {
        httpParams = httpParams.set('search', params.search.trim());
      }
      if (params?.status && params.status !== 'ALL') {
        httpParams = httpParams.set('status', params.status);
      }
      if (params?.sourceBranchId) {
        httpParams = httpParams.set('sourceBranchId', params.sourceBranchId.toString());
      }
      if (params?.destinationBranchId) {
        httpParams = httpParams.set('destinationBranchId', params.destinationBranchId.toString());
      }
      if (params?.dateFrom) {
        httpParams = httpParams.set('dateFrom', params.dateFrom);
      }
      if (params?.dateTo) {
        httpParams = httpParams.set('dateTo', params.dateTo);
      }
      if (params?.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params?.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<TransferListResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const data = response.data;
      this.transfers.set(data.items);
      this.transfersTotal.set(data.total);
      this.transfersPage.set(data.page);
      this.transfersLimit.set(data.limit);
      this.transfersSummary.set(data.summary);

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Khong the tai danh sach dieu chuyen';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getTransferById(id: string): Promise<TransferDetail> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<TransferDetail>>(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async createTransfer(payload: CreateTransferPayload): Promise<TransferDetail> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<TransferDetail>>(this.baseUrl, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async dispatchTransfer(id: string, payload: DispatchTransferPayload): Promise<TransferDetail> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<TransferDetail>>(`${this.baseUrl}/${id}/dispatch`, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async receiveTransfer(id: string, payload?: ReceiveTransferPayload): Promise<TransferDetail> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<TransferDetail>>(`${this.baseUrl}/${id}/receive`, payload ?? {}, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async cancelTransfer(id: string, payload: CancelTransferPayload): Promise<TransferDetail> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<TransferDetail>>(`${this.baseUrl}/${id}/cancel`, payload, {
        headers: this.getAuthHeaders(),
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    return response.data;
  }

  async loadEligibleSkus(branchId: number): Promise<TransferEligibleSku[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<TransferEligibleSku[]>>(`${this.baseUrl}/eligible-skus`, {
          headers: this.getAuthHeaders(),
          params: new HttpParams().set('branchId', branchId.toString()),
        }),
      );

      if (response.success) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  }

  async loadAvailableSerials(transferId: string, skuId: number): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/${transferId}/available-serials`, {
          headers: this.getAuthHeaders(),
          params: new HttpParams().set('skuId', skuId.toString()),
        }),
      );

      if (response.success) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  }

  async loadBranches(): Promise<BranchOption[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ items: { id: number; name: string; code: string; address?: string; isActive: boolean }[] }>>(
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
          address: b.address,
        }));
        this.branches.set(list);
        return list;
      }
      return [];
    } catch {
      return [];
    }
  }
}
