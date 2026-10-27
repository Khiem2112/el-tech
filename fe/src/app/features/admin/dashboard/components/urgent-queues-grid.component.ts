import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UrgentQueuesData } from '../services/admin-dashboard.service';

@Component({
  selector: 'app-urgent-queues-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-bold uppercase tracking-wider text-foreground">
          Hàng Đợi Khẩn Cấp Cần Xử Lý
        </h2>
        <span class="text-[13px] text-muted">
          Ưu tiên xử lý các nghiệp vụ tồn đọng
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-surface border border-line rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-line-strong transition-colors">
          <div>
            <div class="text-[13px] font-semibold text-muted uppercase mb-1">
              COD Chờ Xác Nhận
            </div>
            <div class="text-3xl font-black text-foreground tabular-nums">
              {{ (urgentQueues()?.pendingCodConfirmation ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-[13px] text-muted mt-1.5">
              Đơn COD mới đặt cần gọi điện chốt đơn và giữ hàng
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-line">
            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="orderCodQueryParams()"
              class="text-[13px] font-bold text-primary-strong hover:underline block"
            >
              Xem {{ urgentQueues()?.pendingCodConfirmation ?? 0 }} đơn chờ duyệt
            </a>
          </div>
        </div>

        <div class="bg-rose-50/20 border border-rose-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-colors">
          <div>
            <div class="text-[13px] font-semibold text-rose-700 uppercase mb-1">
              Đối Soát Lệch QR
            </div>
            <div class="text-3xl font-black text-rose-600 tabular-nums">
              {{ (urgentQueues()?.paymentReview ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-[13px] text-muted mt-1.5">
              Giao dịch sai mã hoặc chậm webhook cần khớp tay
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-rose-200">
            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="orderQrReviewQueryParams()"
              class="text-[13px] font-bold text-rose-600 hover:underline block"
            >
              Vào hàng đợi đối soát
            </a>
          </div>
        </div>

        <div class="bg-surface border border-line rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-line-strong transition-colors">
          <div>
            <div class="text-[13px] font-semibold text-muted uppercase mb-1">
              Showroom Quá Hạn
            </div>
            <div class="text-3xl font-black text-foreground tabular-nums">
              {{ (urgentQueues()?.pickupExpired ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-[13px] text-muted mt-1.5">
              Khách chưa nhận tại cửa hàng quá 14 ngày
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-line">
            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="orderPickupExpiredQueryParams()"
              class="text-[13px] font-bold text-primary-strong hover:underline block"
            >
              Xử lý đơn quá hạn
            </a>
          </div>
        </div>

        <div class="bg-surface border border-line rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-line-strong transition-colors">
          <div>
            <div class="text-[13px] font-semibold text-rose-600 uppercase mb-1">
              SKU Chạm Ngưỡng Đặt Hàng
            </div>
            <div class="text-3xl font-black text-rose-600 tabular-nums">
              {{ (urgentQueues()?.lowStockSkuCount ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-[13px] text-muted mt-1.5">
              Tồn khả dụng chạm ngưỡng an toàn, cần lập PO
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-line">
            <a
              [routerLink]="['/admin/inventory/balances']"
              [queryParams]="inventoryOutOfStockQueryParams()"
              class="text-[13px] font-bold text-rose-600 hover:underline block"
            >
              Kiểm tra {{ urgentQueues()?.lowStockSkuCount ?? 0 }} SKU sắp hết
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UrgentQueuesGridComponent {
  readonly urgentQueues = input<UrgentQueuesData | null>(null);
  readonly selectedBranchId = input<number | null>(null);

  orderCodQueryParams(): Record<string, string | number> {
    const params: Record<string, string | number> = {
      tab: 'PENDING_COD_CONFIRMATION',
      status: 'PENDING_COD_CONFIRMATION',
    };
    const branchId = this.selectedBranchId();
    if (branchId !== null) {
      params['branchId'] = branchId;
    }
    return params;
  }

  orderQrReviewQueryParams(): Record<string, string | number> {
    const params: Record<string, string | number> = {
      tab: 'ON_HOLD',
      status: 'ON_HOLD',
    };
    const branchId = this.selectedBranchId();
    if (branchId !== null) {
      params['branchId'] = branchId;
    }
    return params;
  }

  orderPickupExpiredQueryParams(): Record<string, string | number> {
    const params: Record<string, string | number> = {
      tab: 'READY_FOR_PICKUP',
      status: 'READY_FOR_PICKUP',
    };
    const branchId = this.selectedBranchId();
    if (branchId !== null) {
      params['branchId'] = branchId;
    }
    return params;
  }

  inventoryOutOfStockQueryParams(): Record<string, string | number> {
    const params: Record<string, string | number> = {
      stockStatus: 'OUT_OF_STOCK',
    };
    const branchId = this.selectedBranchId();
    if (branchId !== null) {
      params['branchId'] = branchId;
    }
    return params;
  }
}
