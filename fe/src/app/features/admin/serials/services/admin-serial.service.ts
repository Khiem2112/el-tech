import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';

export type SerialListItem = {
  id: string;
  serialNumber: string;
  status: 'AVAILABLE' | 'RESERVED' | 'ISSUED' | 'IN_TRANSIT' | 'QUARANTINED' | 'RETURNED_TO_SUPPLIER';
  skuId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  productTemplateId: number;
  productName: string;
  productSlug: string;
  categoryName: string;
  brandName: string;
  currentBranchId: number | null;
  currentBranchName: string | null;
  currentBranchCode: string | null;
  sellingPrice: string;
  createdAt: string;
  updatedAt: string;
};

export type SerialsSummary = {
  totalSerials: number;
  availableCount: number;
  reservedCount: number;
  inTransitCount: number;
  issuedCount: number;
  quarantinedCount: number;
  returnedToSupplierCount: number;
};

export type SerialsListResponse = {
  items: SerialListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: SerialsSummary;
};

export type SerialMovementDetail = {
  id: string;
  occurredAt: string;
  resultingStatus: 'AVAILABLE' | 'RESERVED' | 'ISSUED' | 'IN_TRANSIT' | 'QUARANTINED' | 'RETURNED_TO_SUPPLIER';
  fromBranchId: number | null;
  fromBranchName: string | null;
  fromBranchCode: string | null;
  toBranchId: number | null;
  toBranchName: string | null;
  toBranchCode: string | null;
  stockMoveId: string;
  stockMoveCode: string;
  moveType: string;
  reason: string | null;
  orderId: string | null;
  orderCode: string | null;
  purchaseOrderId: string | null;
  purchaseOrderCode: string | null;
  supplierName: string | null;
  actorId: string | null;
  actorName: string | null;
  summaryText: string;
};

export type SerialWarrantyInfo = {
  durationMonths: number;
  serviceProvider: string;
  startDate: string | null;
  endDate: string | null;
  isExpired: boolean;
  warrantyClaimCount: number;
};

export type SerialDetailResponse = {
  id: string;
  serialNumber: string;
  status: 'AVAILABLE' | 'RESERVED' | 'ISSUED' | 'IN_TRANSIT' | 'QUARANTINED' | 'RETURNED_TO_SUPPLIER';
  skuId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  sellingPrice: string;
  productTemplate: {
    id: number;
    name: string;
    slug: string;
    model: string;
    brandName: string;
    categoryName: string;
    media: unknown;
  };
  currentBranch: {
    id: number;
    code: string;
    name: string;
    address: string;
  } | null;
  origin: {
    stockMoveId: string;
    stockMoveCode: string;
    purchaseOrderId: string | null;
    purchaseOrderCode: string | null;
    supplierName: string | null;
    receivedAt: string | null;
  } | null;
  warranty: SerialWarrantyInfo;
  movements: SerialMovementDetail[];
  createdAt: string;
  updatedAt: string;
};

export type SerialFilterParams = {
  search?: string;
  status?: string;
  branchId?: number;
  skuId?: number;
  page?: number;
  limit?: number;
};

export type SimpleBranchOption = {
  id: number;
  name: string;
  code: string;
};

@Injectable({ providedIn: 'root' })
export class AdminSerialService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/serials'
      : '/v1/admin/serials';

  private readonly branchesUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/branches'
      : '/v1/admin/branches';

  readonly serials = signal<SerialListItem[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(10);
  readonly totalPages = signal<number>(1);
  readonly summary = signal<SerialsSummary>({
    totalSerials: 0,
    availableCount: 0,
    reservedCount: 0,
    inTransitCount: 0,
    issuedCount: 0,
    quarantinedCount: 0,
    returnedToSupplierCount: 0,
  });
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly selectedSerial = signal<SerialDetailResponse | null>(null);
  readonly isDetailLoading = signal<boolean>(false);
  readonly detailError = signal<string | null>(null);

  readonly quickLookupSerial = signal<SerialDetailResponse | null>(null);
  readonly isQuickLookupLoading = signal<boolean>(false);
  readonly quickLookupError = signal<string | null>(null);

  readonly branches = signal<SimpleBranchOption[]>([]);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadSerials(params?: SerialFilterParams): Promise<SerialsListResponse> {
    this.isLoading.set(true);
    this.error.set(null);

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
        this.http.get<ApiResponse<SerialsListResponse>>(this.baseUrl, {
          headers: this.getAuthHeaders(),
          params: httpParams,
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const data = response.data;
      this.serials.set(data.items);
      this.total.set(data.total);
      this.page.set(data.page);
      this.limit.set(data.limit);
      this.totalPages.set(data.totalPages);
      this.summary.set(data.summary);

      return data;
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err, 'Không thể tải danh sách số sê-ri');
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadSerialDetail(identifier: string): Promise<SerialDetailResponse> {
    this.isDetailLoading.set(true);
    this.detailError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<SerialDetailResponse>>(`${this.baseUrl}/${encodeURIComponent(identifier.trim())}`, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.selectedSerial.set(response.data);
      return response.data;
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err, 'Không thể tải chi tiết số sê-ri');
      this.detailError.set(message);
      throw err;
    } finally {
      this.isDetailLoading.set(false);
    }
  }

  async quickLookup(serialNumber: string): Promise<SerialDetailResponse> {
    const term = serialNumber.trim();
    if (!term) {
      throw new Error('Vui lòng nhập số sê-ri cần tra cứu');
    }

    this.isQuickLookupLoading.set(true);
    this.quickLookupError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<SerialDetailResponse>>(`${this.baseUrl}/${encodeURIComponent(term)}`, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.quickLookupSerial.set(response.data);
      return response.data;
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err, `Không tìm thấy sê-ri '${term}'`);
      this.quickLookupError.set(message);
      this.quickLookupSerial.set(null);
      throw err;
    } finally {
      this.isQuickLookupLoading.set(false);
    }
  }

  async updateStatus(
    identifier: string,
    status: string,
    branchId?: number,
    reason?: string,
  ): Promise<SerialDetailResponse> {
    try {
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<SerialDetailResponse>>(
          `${this.baseUrl}/${encodeURIComponent(identifier.trim())}/status`,
          { status, branchId, reason },
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.selectedSerial.set(response.data);
      if (this.quickLookupSerial()?.id === response.data.id) {
        this.quickLookupSerial.set(response.data);
      }

      return response.data;
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err, 'Không thể cập nhật trạng thái sê-ri');
      throw new Error(message);
    }
  }

  private extractErrorMessage(err: unknown, fallback: string): string {
    let raw = fallback;
    if (err && typeof err === 'object' && 'error' in err) {
      const httpErr = err as { error?: { error?: { messageKey?: string }; message?: string } };
      if (httpErr.error?.error?.messageKey) {
        raw = httpErr.error.error.messageKey;
      } else if (typeof httpErr.error?.message === 'string') {
        raw = httpErr.error.message;
      } else if (err instanceof Error && err.message) {
        raw = err.message;
      }
    } else if (err instanceof Error && err.message) {
      raw = err.message;
    }
    return this.formatErrorMessage(raw);
  }

  private formatErrorMessage(rawMessage: string): string {
    const messageMap: Record<string, string> = {
      'Ma dinh danh serial la bat buoc': 'Mã định danh sê-ri là bắt buộc',
      'Khong the thay doi chi nhanh truc tiep tren so se-ri. Bat buoc phai thuc hien thong qua quy trinh tao phieu dieu chuyen kho.':
        'Không thể thay đổi chi nhánh trực tiếp trên số sê-ri. Bắt buộc phải thực hiện thông qua quy trình tạo phiếu điều chuyển kho.',
      'Khong the tai danh sach so serial': 'Không thể tải danh sách số sê-ri',
      'Khong the tai chi tiet so serial': 'Không thể tải chi tiết số sê-ri',
      'Khong the cap nhat trang thai serial': 'Không thể cập nhật trạng thái sê-ri',
      'Vui long nhap so serial can tra cuu': 'Vui lòng nhập số sê-ri cần tra cứu',
    };

    if (messageMap[rawMessage]) {
      return messageMap[rawMessage];
    }

    if (rawMessage.startsWith('Khong tim thay so serial')) {
      return rawMessage
        .replace('Khong tim thay so serial', 'Không tìm thấy số sê-ri')
        .replace('trong he thong', 'trong hệ thống')
        .replace('de cap nhat', 'để cập nhật');
    }

    if (rawMessage.startsWith('Khong tim thay serial')) {
      return rawMessage.replace('Khong tim thay serial', 'Không tìm thấy sê-ri');
    }

    return rawMessage;
  }

  async loadBranches(): Promise<SimpleBranchOption[]> {
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
}
