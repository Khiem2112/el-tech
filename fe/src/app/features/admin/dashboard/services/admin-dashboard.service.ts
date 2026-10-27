import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../../core/api/admin-api.service';
import { ApiResponse } from '../../../../core/api/api.types';
import { AdminBranch, AdminBranchService } from '../../branches/services/admin-branch.service';

export type UrgentQueuesData = {
  pendingCodConfirmation: number;
  paymentReview: number;
  pickupExpired: number;
  lowStockSkuCount: number;
};

export type BranchOrderStatus = {
  branchId: number;
  branchCode: string;
  branchName: string;
  confirmed: number;
  preparingComponents: number;
  assembling: number;
  readyForPickup: number;
  shipping: number;
  onHold: number;
  total: number;
};

export type OrderStatusDistributionData = {
  byBranch: BranchOrderStatus[];
  systemTotal: {
    confirmed: number;
    preparingComponents: number;
    assembling: number;
    readyForPickup: number;
    shipping: number;
    onHold: number;
    total: number;
  };
  statusCounts: Record<string, number>;
};

export type LowStockAlertItem = {
  quantId: string;
  skuId: number;
  sku: string;
  productName: string;
  variationLabel?: string | null;
  brandName: string;
  categoryName: string;
  branchId: number;
  branchCode: string;
  branchName: string;
  onHand: number;
  reserved: number;
  quarantineDamaged: number;
  available: number;
};

export type InTransitTransferItem = {
  id: string;
  code: string;
  sourceBranchCode: string;
  sourceBranchName: string;
  destinationBranchCode: string;
  destinationBranchName: string;
  totalQuantity: number;
  skuCount: number;
  dispatchedAt: string | null;
};

export type AdminDashboardSummary = {
  urgentQueues: UrgentQueuesData;
  orderDistribution: OrderStatusDistributionData;
  lowStockAlerts: LowStockAlertItem[];
  inTransitTransfers?: InTransitTransferItem[];
};

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);
  private readonly branchService = inject(AdminBranchService);

  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/admin/dashboard'
      : '/v1/admin/dashboard';

  readonly selectedBranchId = signal<number | null>(null);
  readonly summary = signal<AdminDashboardSummary | null>(null);
  readonly urgentQueues = signal<UrgentQueuesData | null>(null);
  readonly orderDistribution = signal<OrderStatusDistributionData | null>(null);
  readonly lowStockAlerts = signal<LowStockAlertItem[]>([]);
  readonly inTransitTransfers = signal<InTransitTransferItem[]>([]);
  readonly branches = signal<AdminBranch[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.adminApi.adminToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async loadBranches(): Promise<void> {
    try {
      await this.branchService.loadBranches({ limit: 100, isActive: true });
      this.branches.set(this.branchService.branches());
    } catch {
      this.branches.set([]);
    }
  }

  async loadDashboard(branchId?: number | null): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    const targetBranchId = branchId !== undefined ? branchId : this.selectedBranchId();

    try {
      let params = new HttpParams();
      if (targetBranchId !== null && targetBranchId !== undefined) {
        params = params.set('branchId', targetBranchId.toString());
      }

      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminDashboardSummary>>(`${this.baseUrl}/summary`, {
          headers,
          params,
        }),
      );

      if (response.success && response.data) {
        this.summary.set(response.data);
        this.urgentQueues.set(response.data.urgentQueues);
        this.orderDistribution.set(response.data.orderDistribution);
        this.lowStockAlerts.set(response.data.lowStockAlerts);
        this.inTransitTransfers.set(response.data.inTransitTransfers ?? []);
      } else {
        this.error.set('Khong the tai du lieu ban dieu khien');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Loi he thong khi ket noi may chu';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async setSelectedBranch(branchId: number | null): Promise<void> {
    this.selectedBranchId.set(branchId);
    await this.loadDashboard(branchId);
  }

  async refresh(): Promise<void> {
    await this.loadDashboard(this.selectedBranchId());
  }
}
