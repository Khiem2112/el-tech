import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { UrgentQueuesData } from '../services/admin-dashboard.service';

@Component({
  selector: 'app-urgent-queues-grid',
  standalone: true,
  imports: [CommonModule, RouterModule, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-muted">
          Hàng Đợi Khẩn Cấp
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          class="rounded-lg p-4 transition-colors flex flex-col justify-between"
          [class.bg-amber-50/20]="(urgentQueues()?.pendingCodConfirmation ?? 0) > 0"
          [class.border]="true"
          [class.border-amber-300]="(urgentQueues()?.pendingCodConfirmation ?? 0) > 0"
          [class.bg-surface]="(urgentQueues()?.pendingCodConfirmation ?? 0) === 0"
          [class.border-line]="(urgentQueues()?.pendingCodConfirmation ?? 0) === 0"
        >
          <div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider">
              COD Chờ Xác Nhận
            </div>
            <div
              class="text-2xl font-bold mt-1.5 tabular-nums"
              [class.text-amber-600]="(urgentQueues()?.pendingCodConfirmation ?? 0) > 0"
              [class.text-foreground]="(urgentQueues()?.pendingCodConfirmation ?? 0) === 0"
            >
              {{ (urgentQueues()?.pendingCodConfirmation ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-xs text-muted mt-1">
              Đơn COD mới cần gọi chốt và giữ hàng
            </p>
          </div>
          <div
            class="mt-3 pt-2.5 border-t"
            [class.border-amber-200]="(urgentQueues()?.pendingCodConfirmation ?? 0) > 0"
            [class.border-line]="(urgentQueues()?.pendingCodConfirmation ?? 0) === 0"
          >
            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="orderCodQueryParams()"
              class="text-xs font-semibold hover:underline inline-flex items-center gap-1"
              [class.text-amber-700]="(urgentQueues()?.pendingCodConfirmation ?? 0) > 0"
              [class.text-foreground]="(urgentQueues()?.pendingCodConfirmation ?? 0) === 0"
            >
              <span>Xem {{ urgentQueues()?.pendingCodConfirmation ?? 0 }} đơn chờ</span>
              <lucide-icon name="arrow-right" class="w-3 h-3" aria-hidden="true"></lucide-icon>
            </a>
          </div>
        </div>

        <div
          class="rounded-lg p-4 transition-colors flex flex-col justify-between"
          [class.bg-rose-50/20]="(urgentQueues()?.paymentReview ?? 0) > 0"
          [class.border]="true"
          [class.border-rose-300]="(urgentQueues()?.paymentReview ?? 0) > 0"
          [class.bg-surface]="(urgentQueues()?.paymentReview ?? 0) === 0"
          [class.border-line]="(urgentQueues()?.paymentReview ?? 0) === 0"
        >
          <div>
            <div
              class="text-xs font-semibold uppercase tracking-wider"
              [class.text-rose-700]="(urgentQueues()?.paymentReview ?? 0) > 0"
              [class.text-muted]="(urgentQueues()?.paymentReview ?? 0) === 0"
            >
              Đối Soát Lệch QR
            </div>
            <div
              class="text-2xl font-bold mt-1.5 tabular-nums"
              [class.text-rose-600]="(urgentQueues()?.paymentReview ?? 0) > 0"
              [class.text-foreground]="(urgentQueues()?.paymentReview ?? 0) === 0"
            >
              {{ (urgentQueues()?.paymentReview ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-xs text-muted mt-1">
              Giao dịch sai mã hoặc chậm webhook
            </p>
          </div>
          <div
            class="mt-3 pt-2.5 border-t"
            [class.border-rose-200]="(urgentQueues()?.paymentReview ?? 0) > 0"
            [class.border-line]="(urgentQueues()?.paymentReview ?? 0) === 0"
          >
            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="orderQrReviewQueryParams()"
              class="text-xs font-semibold hover:underline inline-flex items-center gap-1"
              [class.text-rose-700]="(urgentQueues()?.paymentReview ?? 0) > 0"
              [class.text-foreground]="(urgentQueues()?.paymentReview ?? 0) === 0"
            >
              <span>Vào hàng đợi đối soát</span>
              <lucide-icon name="arrow-right" class="w-3 h-3" aria-hidden="true"></lucide-icon>
            </a>
          </div>
        </div>

        <div class="bg-surface border border-line rounded-lg p-4 transition-colors flex flex-col justify-between">
          <div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider">
              Showroom Quá Hạn
            </div>
            <div class="text-2xl font-bold text-foreground mt-1.5 tabular-nums">
              {{ (urgentQueues()?.pickupExpired ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-xs text-muted mt-1">
              Khách chưa nhận tại cửa hàng quá 14 ngày
            </p>
          </div>
          <div class="mt-3 pt-2.5 border-t border-line">
            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="orderPickupExpiredQueryParams()"
              class="text-xs font-semibold text-foreground hover:underline inline-flex items-center gap-1"
            >
              <span>Xử lý đơn quá hạn</span>
              <lucide-icon name="arrow-right" class="w-3 h-3" aria-hidden="true"></lucide-icon>
            </a>
          </div>
        </div>

        <div class="bg-surface border border-line rounded-lg p-4 transition-colors flex flex-col justify-between">
          <div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider">
              SKU Chạm Ngưỡng Đặt
            </div>
            <div class="text-2xl font-bold text-foreground mt-1.5 tabular-nums">
              {{ (urgentQueues()?.lowStockSkuCount ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-xs text-muted mt-1">
              Tồn khả dụng chạm ngưỡng an toàn
            </p>
          </div>
          <div class="mt-3 pt-2.5 border-t border-line">
            <a
              [routerLink]="['/admin/inventory/balances']"
              [queryParams]="inventoryOutOfStockQueryParams()"
              class="text-xs font-semibold text-foreground hover:underline inline-flex items-center gap-1"
            >
              <span>Kiểm tra {{ urgentQueues()?.lowStockSkuCount ?? 0 }} SKU</span>
              <lucide-icon name="arrow-right" class="w-3 h-3" aria-hidden="true"></lucide-icon>
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
