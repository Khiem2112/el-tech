import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UrgentQueuesData } from '../services/admin-dashboard.service';

@Component({
  selector: 'app-urgent-queues-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-muted">
          Hàng Đợi Khẩn Cấp
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div class="bg-surface border border-line rounded-lg p-4 transition-colors flex flex-col justify-between">
          <div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider">
              Linh Kiện Chạm Ngưỡng Đặt
            </div>
            <div class="text-2xl font-bold text-foreground mt-1.5 tabular-nums">
              {{ (urgentQueues()?.lowStockSkuCount ?? 0) | number:'2.0-0' }}
            </div>
            <p class="text-xs text-muted mt-1">
              Tồn khả dụng chạm ngưỡng an toàn
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UrgentQueuesGridComponent {
  readonly urgentQueues = input<UrgentQueuesData | null>(null);
  readonly selectedBranchId = input<number | null>(null);
}
