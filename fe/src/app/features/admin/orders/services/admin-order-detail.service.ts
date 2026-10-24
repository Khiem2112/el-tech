import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';
import { AdminOrderStatus } from './admin-order.service';

export type AdminOrderTransition = {
  targetStatus: AdminOrderStatus;
  label: string;
  actionKey: string;
  modalId?: string;
  isPrimary?: boolean;
  isDestructive?: boolean;
};

export type AdminOrderLineItem = {
  id: string;
  skuId: number | null;
  sourcePcBundleId: number | null;
  lineType: 'SKU' | 'SERVICE';
  serviceType: 'ASSEMBLY' | null;
  pcBuildKey: string | null;
  pcBuildNameSnapshot: string | null;
  pcBuildTypeSnapshot: string | null;
  skuSnapshot: string | null;
  nameSnapshot: string;
  specSnapshot: Record<string, unknown>;
  taxSnapshot: Record<string, unknown>;
  promotionSnapshots: unknown[];
  quantity: number;
  unitPrice: string;
  productDiscount: string;
  couponDiscount: string;
  netAmount: string;
  sortOrder: number;
  availableStock: number | null;
  categoryName?: string;
  imageUrl?: string;
};

export type AdminPcBuildGroup = {
  pcBuildKey: string;
  pcBuildName: string;
  pcBuildType: string;
  hasAssembly: boolean;
  assemblyFee: string;
  totalWattage: number;
  items: AdminOrderLineItem[];
};

export type AdminOrderTimelineEvent = {
  id: string;
  previousStatus: AdminOrderStatus;
  nextStatus: AdminOrderStatus;
  reason: string | null;
  actorType: 'CUSTOMER' | 'ADMIN' | 'SYSTEM' | 'PAYMENT_PROVIDER';
  actorId: string | null;
  actorName: string;
  occurredAt: string;
};

export type AdminOrderDetail = {
  id: string;
  code: string;
  status: AdminOrderStatus;
  holdReason: string | null;
  cancellationReason: string | null;
  redeliveryAttemptCount: number;
  fulfillmentMethod: 'PICKUP' | 'DELIVERY';
  paymentMethod: 'QR' | 'COD';
  subtotal: string;
  productDiscount: string;
  couponDiscount: string;
  shippingFee: string;
  taxAmount: string;
  roundingAdjustment: string;
  grandTotal: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverAddress: string;
  customerNotes: string | null;
  internalNotes: string | null;
  shippingCarrier: string | null;
  trackingCode: string | null;
  hasAssembly: boolean;
  submittedAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
  };
  fulfillmentBranch: {
    id: number;
    code: string;
    name: string;
    address: string;
  };
  payment: {
    id: string;
    state: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
    method: 'QR' | 'COD';
    depositDisposition: string | null;
    depositRequired: string;
    totalReceived: string;
    codRemaining: string;
    charges: Array<{
      id: string;
      chargeType: string;
      providerReference: string;
      expectedAmount: string;
      status: string;
      createdAt: string;
      providerTransactionId?: string;
    }>;
    refunds: Array<{
      id: string;
      amount: string;
      reason: string;
      status: string;
      createdAt: string;
    }>;
    codCollections: Array<{
      id: string;
      amount: string;
      actorId: string | null;
      occurredAt: string;
    }>;
  } | null;
  stockMoves: Array<{
    id: string;
    code: string;
    moveType: string;
    status: string;
    reason: string | null;
    createdAt: string;
    reservedAt: string | null;
    dispatchedAt: string | null;
    validatedAt: string | null;
  }>;
  amendments: Array<{
    id: string;
    type: string;
    status: string;
    fee: string;
    reason: string | null;
    createdAt: string;
  }>;
  statusHistories: AdminOrderTimelineEvent[];
  lines: AdminOrderLineItem[];
  pcBuildGroups: AdminPcBuildGroup[];
  standaloneLines: AdminOrderLineItem[];
  availableTransitions: AdminOrderTransition[];
};

@Injectable({ providedIn: 'root' })
export class AdminOrderDetailService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/orders'
      : '/v1/admin/orders';

  readonly order = signal<AdminOrderDetail | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly isSavingNotes = signal<boolean>(false);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async fetchOrderDetail(id: string): Promise<AdminOrderDetail | null> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminOrderDetail>>(`${this.baseUrl}/${id}`, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      this.order.set(response.data);
      return response.data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Khong the tai thong tin chi tiet don hang';
      this.error.set(message);
      this.order.set(null);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateNotes(
    id: string,
    notes: { internalNotes?: string; customerNotes?: string },
  ): Promise<boolean> {
    this.isSavingNotes.set(true);

    try {
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<{ internalNotes: string | null; customerNotes: string | null }>>(
          `${this.baseUrl}/${id}/notes`,
          notes,
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      const current = this.order();
      if (current) {
        this.order.set({
          ...current,
          internalNotes: response.data.internalNotes,
          customerNotes: response.data.customerNotes,
        });
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Loi khi cap nhat ghi chu';
      this.error.set(message);
      return false;
    } finally {
      this.isSavingNotes.set(false);
    }
  }
}
