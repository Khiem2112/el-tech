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
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-white">
            Hàng Đợi Khẩn Cấp Cần Xử Lý Trong Ngày
          </h2>
        </div>
        <span class="text-xs text-slate-400">
          Ưu tiên xử lý cao nhất trước khi sang các nghiệp vụ khác
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate-400 uppercase">COD Chờ Duyệt</span>
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                CHỜ XÁC NHẬN
              </span>
            </div>
            <div class="text-2xl font-black text-white tabular-nums">
              {{ (urgentQueues()?.pendingCodConfirmation ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Đơn COD mới đặt cần gọi điện chốt đơn và giữ hàng
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-[#272f3d]">
            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="orderCodQueryParams()"
              class="text-xs font-bold text-[#76b900] hover:underline block"
            >
              Xem {{ urgentQueues()?.pendingCodConfirmation ?? 0 }} đơn chờ duyệt
            </a>
          </div>
        </div>

        <div class="bg-[#161b26] border border-rose-900/60 rounded-lg p-4 shadow-sm flex flex-col justify-between bg-rose-950/20">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-rose-300 uppercase">Hàng Đợi Lệch QR (24h)</span>
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                ĐỐI SOÁT
              </span>
            </div>
            <div class="text-2xl font-black text-rose-400 tabular-nums">
              {{ (urgentQueues()?.paymentReview ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Giao dịch sai mã hoặc chậm webhook. Cần khớp tay hoặc hủy hoàn tiền
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-rose-900/40">
            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="orderQrReviewQueryParams()"
              class="text-xs font-bold text-rose-400 hover:underline block"
            >
              Vào hàng đợi đối soát mã QR
            </a>
          </div>
        </div>

        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate-400 uppercase">Nhận Tại Showroom Quá 14 Ngày</span>
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                QUÁ HẠN
              </span>
            </div>
            <div class="text-2xl font-black text-white tabular-nums">
              {{ (urgentQueues()?.pickupExpired ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Khách chưa đến nhận tại cửa hàng. Cần gọi điện hoặc hủy đơn
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-[#272f3d]">
            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="orderPickupExpiredQueryParams()"
              class="text-xs font-bold text-[#76b900] hover:underline block"
            >
              Xử lý đơn quá hạn
            </a>
          </div>
        </div>

        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-rose-400 uppercase">Linh Kiện Chạm Ngưỡng Đặt Hàng</span>
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                SẮP HẾT
              </span>
            </div>
            <div class="text-2xl font-black text-rose-400 tabular-nums">
              {{ (urgentQueues()?.lowStockSkuCount ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Tồn khả dụng chạm ngưỡng an toàn. Cần lập đơn mua PO bổ sung
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-[#272f3d]">
            <a
              [routerLink]="['/admin/inventory/balances']"
              [queryParams]="inventoryOutOfStockQueryParams()"
              class="text-xs font-bold text-rose-400 hover:underline block"
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
