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
      receivedAmount?: string;
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

export type StockReadinessItem = {
  skuId: number;
  skuCode: string;
  name: string;
  requiredQuantity: number;
  onHand: number;
  reserved: number;
  available: number;
  isSufficient: boolean;
};

export type StockReadinessResult = {
  orderId: string;
  orderCode: string;
  branch: {
    id: number;
    code: string;
    name: string;
  };
  canConfirm: boolean;
  items: StockReadinessItem[];
};

export type AvailableSerialItem = {
  id: string;
  serialNumber: string;
  status: string;
};

export type AssemblyRequirementItem = {
  skuId: number;
  skuCode: string;
  name: string;
  quantity: number;
  serialRequired: boolean;
  availableSerials: AvailableSerialItem[];
};

export type AssemblyRequirementsResult = {
  orderId: string;
  orderCode: string;
  branch: {
    id: number;
    code: string;
    name: string;
  };
  hasAssembly: boolean;
  items: AssemblyRequirementItem[];
};

export type OrderOperationResponse = {
  success: boolean;
  orderId: string;
  orderCode: string;
  status: string;
  message: string;
  stockMoveCode?: string;
};

export type StandaloneSerialRequirementItem = {
  skuId: number;
  skuCode: string;
  name: string;
  quantity: number;
  availableSerials: AvailableSerialItem[];
};

export type PendingAmendmentItem = {
  id: string;
  type: string;
  fee: string;
  status: string;
  reason: string;
};

export type ShippingRequirementsResult = {
  orderId: string;
  orderCode: string;
  hasAssembly: boolean;
  fulfillmentMethod: 'PICKUP' | 'DELIVERY';
  status: AdminOrderStatus;
  pendingAmendments: PendingAmendmentItem[];
  hasUnpaidAmendments: boolean;
  standaloneSerialRequirements: StandaloneSerialRequirementItem[];
};

export type ReturnItem = {
  skuId: number;
  skuCode: string;
  name: string;
  quantity: number;
};

export type ReturnIssuedSerial = {
  id: string;
  serialNumber: string;
  skuId: number;
  skuCode: string;
};

export type ReturnRequirementsResult = {
  orderId: string;
  orderCode: string;
  status: AdminOrderStatus;
  items: ReturnItem[];
  issuedSerials: ReturnIssuedSerial[];
};

export type ShipOrderPayload = {
  carrier: string;
  trackingCode: string;
  note?: string;
  serialAssignments?: Array<{ skuId: number; serialNumber: string }>;
};

export type DeliveryFailedPayload = {
  reason: string;
  note?: string;
};

export type ScheduleRedeliveryPayload = {
  redeliveryDate: string;
  note?: string;
};

export type InitiateReturnPayload = {
  note?: string;
};

export type ReceiveReturnPayload = {
  note?: string;
  verifiedSerialNumbers?: string[];
};

export type CancellationPreview = {
  orderId: string;
  orderCode: string;
  currentStatus: AdminOrderStatus;
  canCancel: boolean;
  blockReason?: string;
  isCustomPc: boolean;
  hasPreparedComponents: boolean;
  depositRequired: string;
  isDepositForfeited: boolean;
  totalReceived: string;
  refundableAmount: string;
  reservedItemsCount: number;
};

export type QrDiscrepancyDetail = {
  orderId: string;
  orderCode: string;
  expectedAmount: string;
  receivedAmount: string;
  differenceAmount: string;
  isUnderpaid: boolean;
  isOverpaid: boolean;
  isExactMatch: boolean;
  chargeId: string;
  providerReference: string;
  providerTransactionId?: string;
  reviewDeadlineAt?: string;
};

export type CompleteOrderPayload = {
  codCollectedAmount?: number;
  actorName?: string;
  note?: string;
  confirmedSerialNumbers?: string[];
};

export type CancelOrderPayload = {
  reason: string;
  note?: string;
};

export type HoldOrderPayload = {
  holdReason: 'PAYMENT_REVIEW' | 'PAID_BUT_OUT_OF_STOCK' | 'PICKUP_EXPIRED';
  note: string;
};

export type ResolveHoldPayload = {
  action: 'CONFIRM_RESUME' | 'CANCEL_REFUND' | 'EXTEND_PICKUP';
  reason: string;
  note?: string;
};

export type PickupToDeliveryPayload = {
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  shippingFee: number;
  reason?: string;
  acceptanceChannel?: 'PHONE' | 'EMAIL' | 'IN_APP';
  acceptedByValue?: string;
};

export type ResolveQrDiscrepancyPayload = {
  resolutionType: 'MANUAL_MATCH' | 'CANCEL_REFUND';
  note: string;
  transactionReference?: string;
};

export type ManualRefundPayload = {
  transactionReference: string;
  bankName?: string;
  transferredAt?: string;
  note?: string;
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

  async fetchStockReadiness(orderId: string): Promise<StockReadinessResult | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<StockReadinessResult>>(
          `${this.baseUrl}/${orderId}/stock-readiness`,
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Khong the kiem tra ton kho don hang';
      this.error.set(message);
      return null;
    }
  }

  async fetchAssemblyRequirements(orderId: string): Promise<AssemblyRequirementsResult | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AssemblyRequirementsResult>>(
          `${this.baseUrl}/${orderId}/assembly-requirements`,
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.success) {
        throw new Error(response.error.messageKey);
      }

      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Khong the kiem tra linh kien can lap rap';
      this.error.set(message);
      return null;
    }
  }

  async confirmCodOrder(orderId: string, note?: string): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/confirm-cod`,
        { note },
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi xac nhan don hang COD');
    }

    return response.data;
  }

  async prepareOrder(orderId: string, note?: string): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/prepare`,
        { note },
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi chuyen trang thai soan hang');
    }

    return response.data;
  }

  async assembleOrder(
    orderId: string,
    payload: { technicianName?: string; serialAssignments: Array<{ skuId: number; serialNumber: string }> },
  ): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/assemble`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi chuyen ban lap rap PC');
    }

    return response.data;
  }

  async readyForPickup(orderId: string, note?: string): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/ready-for-pickup`,
        { note },
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi bao san sang nhan tai showroom');
    }

    return response.data;
  }

  async getShippingRequirements(orderId: string): Promise<ShippingRequirementsResult> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<ShippingRequirementsResult>>(
        `${this.baseUrl}/${orderId}/shipping-requirements`,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi tai thong tin dieu kien xuat kho giao hang');
    }

    return response.data;
  }

  async getReturnRequirements(orderId: string): Promise<ReturnRequirementsResult> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<ReturnRequirementsResult>>(
        `${this.baseUrl}/${orderId}/return-requirements`,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi tai danh sach linh kien nhan hang chuyen hoan');
    }

    return response.data;
  }

  async shipOrder(orderId: string, payload: ShipOrderPayload): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/ship`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      const detailsMsg = response.error.details && typeof response.error.details === 'object' && 'message' in response.error.details
        ? String(response.error.details['message'])
        : null;
      throw new Error(detailsMsg || response.error.messageKey || 'Loi khi xuat kho ban giao van chuyen');
    }

    return response.data;
  }

  async deliveryFailed(orderId: string, payload: DeliveryFailedPayload): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/delivery-failed`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi ghi nhan giao hang that bai');
    }

    return response.data;
  }

  async scheduleRedelivery(orderId: string, payload: ScheduleRedeliveryPayload): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/schedule-redelivery`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      const detailsMsg = response.error.details && typeof response.error.details === 'object' && 'message' in response.error.details
        ? String(response.error.details['message'])
        : null;
      throw new Error(detailsMsg || response.error.messageKey || 'Loi khi len lich hen giao lai');
    }

    return response.data;
  }

  async initiateReturn(orderId: string, payload?: InitiateReturnPayload): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/initiate-return`,
        payload || {},
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi xac nhan kien hang chuyen hoan ve kho');
    }

    return response.data;
  }

  async receiveReturn(orderId: string, payload?: ReceiveReturnPayload): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/receive-return`,
        payload || {},
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi xac nhan nhan hang hoan ve kho chi nhanh');
    }

    return response.data;
  }

  async getCancellationPreview(orderId: string): Promise<CancellationPreview | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<CancellationPreview>>(
          `${this.baseUrl}/${orderId}/cancel-preview`,
          { headers: this.getAuthHeaders() },
        ),
      );
      return response.success ? response.data : null;
    } catch {
      return null;
    }
  }

  async getQrDiscrepancy(orderId: string): Promise<QrDiscrepancyDetail | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<QrDiscrepancyDetail>>(
          `${this.baseUrl}/${orderId}/qr-discrepancy`,
          { headers: this.getAuthHeaders() },
        ),
      );
      return response.success ? response.data : null;
    } catch {
      return null;
    }
  }

  async completeOrder(orderId: string, payload: CompleteOrderPayload): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/complete`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi hoan tat don hang');
    }

    return response.data;
  }

  async cancelOrder(orderId: string, payload: CancelOrderPayload): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/cancel`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      const detailsMsg =
        response.error.details &&
        typeof response.error.details === 'object' &&
        'message' in response.error.details
          ? String(response.error.details['message'])
          : null;
      throw new Error(detailsMsg || response.error.messageKey || 'Loi khi huy don hang');
    }

    return response.data;
  }

  async holdOrder(orderId: string, payload: HoldOrderPayload): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/hold`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi tam giu don hang');
    }

    return response.data;
  }

  async resolveHold(orderId: string, payload: ResolveHoldPayload): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/resolve-hold`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi giai quyet ngoai le ON_HOLD');
    }

    return response.data;
  }

  async pickupToDelivery(
    orderId: string,
    payload: PickupToDeliveryPayload,
  ): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/pickup-to-delivery`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi tao phu luc chuyen sang giao hang tan noi');
    }

    return response.data;
  }

  async resolveQrDiscrepancy(
    orderId: string,
    payload: ResolveQrDiscrepancyPayload,
  ): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/${orderId}/resolve-qr-discrepancy`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi xu ly doi soat giao dich VietQR');
    }

    return response.data;
  }

  async processManualRefund(
    refundId: string,
    payload: ManualRefundPayload,
  ): Promise<OrderOperationResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<OrderOperationResponse>>(
        `${this.baseUrl}/refunds/${refundId}/process-manual`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Loi khi xac nhan hoan tien thu cong');
    }

    return response.data;
  }
}
