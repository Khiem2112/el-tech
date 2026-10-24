import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type PurchaseOrderStatus = 'DRAFT' | 'CONFIRMED' | 'RECEIVED' | 'CLOSED' | 'CANCELLED';

export type PurchaseOrderListItem = {
  id: string;
  code: string;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  receivingBranchId: number;
  receivingBranchName: string;
  receivingBranchCode: string;
  status: PurchaseOrderStatus;
  lineCount: number;
  totalQuantity: number;
  totalAmount: string;
  note: string | null;
  cancellationReason: string | null;
  supersedesPurchaseOrderId: string | null;
  supersedesCode: string | null;
  supersededByCode: string | null;
  hasReceiptMove: boolean;
  confirmedAt: string | null;
  receivedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrderLineSku = {
  id: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  serialRequired: boolean;
  imageUrl: string | null;
  templateName: string;
  categoryName: string;
  brandName: string;
};

export type PurchaseOrderLineItem = {
  id: string;
  skuId: number;
  quantity: number;
  agreedUnitCost: string;
  lineTotal: string;
  sku: PurchaseOrderLineSku;
  receivedSerials: string[];
};

export type PurchaseOrderDetail = {
  id: string;
  code: string;
  status: PurchaseOrderStatus;
  supplierId: number;
  supplier: {
    id: number;
    code: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    contactName?: string | null;
  };
  receivingBranchId: number;
  receivingBranch: {
    id: number;
    code: string;
    name: string;
    address?: string | null;
    code_name?: string;
  };
  note: string | null;
  cancellationReason: string | null;
  confirmedAt: string | null;
  receivedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  lines: PurchaseOrderLineItem[];
  totalQuantity: number;
  totalAmount: string;
  supersedesPurchaseOrder: {
    id: string;
    code: string;
    status: PurchaseOrderStatus;
    createdAt: string;
  } | null;
  supersededByOrders: {
    id: string;
    code: string;
    status: PurchaseOrderStatus;
    createdAt: string;
  }[];
  receiptMove: {
    id: string;
    code: string;
    status: string;
    validatedAt: string | null;
    lineCount: number;
  } | null;
};

export type PurchaseOrderListResponse = {
  items: PurchaseOrderListItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreatePurchaseOrderItemPayload = {
  skuId: number;
  quantity: number;
  agreedUnitCost: number;
};

export type CreatePurchaseOrderPayload = {
  code?: string;
  supplierId: number;
  receivingBranchId: number;
  note?: string | null;
  lines: CreatePurchaseOrderItemPayload[];
};

export type UpdatePurchaseOrderPayload = {
  supplierId?: number;
  receivingBranchId?: number;
  note?: string | null;
  lines?: CreatePurchaseOrderItemPayload[];
};

export type ValidateReceiptLinePayload = {
  skuId: number;
  receivedQuantity: number;
  serialNumbers?: string[];
};

export type ValidateReceiptPayload = {
  lines: ValidateReceiptLinePayload[];
};

export type ShortShipmentLinePayload = {
  skuId: number;
  actualQuantity: number;
};

export type ShortShipmentPayload = {
  reason?: string;
  lines: ShortShipmentLinePayload[];
};

export type CatalogVariantOption = {
  id: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  serialRequired: boolean;
  sellingPrice: string;
  imageUrl: string | null;
  productTemplate: {
    name: string;
    category: { name: string };
    brand: { name: string };
  };
};

export type SimpleOption = {
  id: number;
  name: string;
  code: string;
};

@Injectable({ providedIn: 'root' })
export class AdminPurchaseOrderService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/purchase-orders'
      : '/v1/admin/purchase-orders';

  private readonly suppliersUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/suppliers'
      : '/v1/admin/suppliers';

  private readonly branchesUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/branches'
      : '/v1/admin/branches';

  private readonly catalogVariantsUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/catalog/variants'
      : '/v1/admin/catalog/variants';

  readonly purchaseOrders = signal<PurchaseOrderListItem[]>([]);
  readonly selectedPurchaseOrder = signal<PurchaseOrderDetail | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<PurchaseOrderStatus | 'ALL'>('ALL');

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadPurchaseOrders(params?: {
    search?: string;
    status?: PurchaseOrderStatus | 'ALL';
    supplierId?: number;
    receivingBranchId?: number;
    page?: number;
    limit?: number;
  }): Promise<PurchaseOrderListResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams();

      const search = params?.search !== undefined ? params.search : this.searchQuery();
      if (search.trim()) {
        httpParams = httpParams.set('search', search.trim());
      }

      const status = params?.status !== undefined ? params.status : this.statusFilter();
      if (status && status !== 'ALL') {
        httpParams = httpParams.set('status', status);
      }

      if (params?.supplierId) {
        httpParams = httpParams.set('supplierId', params.supplierId.toString());
      }

      if (params?.receivingBranchId) {
        httpParams = httpParams.set('receivingBranchId', params.receivingBranchId.toString());
      }

      if (params?.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }

      if (params?.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<PurchaseOrderListResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.purchaseOrders.set(response.data.items);
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Khong the tai danh sach don mua hang';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrderDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<PurchaseOrderDetail>>(`${this.baseUrl}/${id}`, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.selectedPurchaseOrder.set(response.data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Khong the tai thong tin don mua hang';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrderDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<PurchaseOrderDetail>>(this.baseUrl, payload, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Khong the tao moi don mua hang';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updatePurchaseOrder(
    id: string,
    payload: UpdatePurchaseOrderPayload,
  ): Promise<PurchaseOrderDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<PurchaseOrderDetail>>(`${this.baseUrl}/${id}`, payload, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Khong the cap nhat don mua hang';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async confirmPurchaseOrder(id: string): Promise<PurchaseOrderDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<PurchaseOrderDetail>>(
          `${this.baseUrl}/${id}/confirm`,
          {},
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Khong the xac nhan don mua hang';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async validateReceipt(id: string, payload: ValidateReceiptPayload): Promise<PurchaseOrderDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<PurchaseOrderDetail>>(
          `${this.baseUrl}/${id}/receipt`,
          payload,
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Doi soat nhap kho that bai';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleShortShipment(id: string, payload: ShortShipmentPayload): Promise<PurchaseOrderDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<PurchaseOrderDetail>>(
          `${this.baseUrl}/${id}/short-shipment`,
          payload,
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Xu ly giao thieu hang that bai';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async closePurchaseOrder(id: string): Promise<PurchaseOrderDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<PurchaseOrderDetail>>(
          `${this.baseUrl}/${id}/close`,
          {},
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Khong the dong don mua hang';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async cancelPurchaseOrder(id: string, reason: string): Promise<PurchaseOrderDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<PurchaseOrderDetail>>(
          `${this.baseUrl}/${id}/cancel`,
          { reason },
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Khong the huy don mua hang';
      this.error.set(errorMessage);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadSuppliers(): Promise<SimpleOption[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ items: { id: number; name: string; code: string; isActive: boolean }[] }>>(
          this.suppliersUrl,
          {
            headers: this.getAuthHeaders(),
            params: new HttpParams().set('isActive', 'true').set('limit', '100'),
          },
        ),
      );

      if (response.success) {
        return response.data.items.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
        }));
      }
      return [];
    } catch {
      return [];
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
        return response.data.items.map((b) => ({
          id: b.id,
          name: b.name,
          code: b.code,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  async searchCatalogVariants(search: string): Promise<CatalogVariantOption[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ items: CatalogVariantOption[] }>>(
          this.catalogVariantsUrl,
          {
            headers: this.getAuthHeaders(),
            params: new HttpParams().set('search', search).set('limit', '20'),
          },
        ),
      );

      if (response.success) {
        return response.data.items;
      }
      return [];
    } catch {
      return [];
    }
  }
}
