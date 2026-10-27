import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InTransitTransferItem } from '../services/admin-dashboard.service';

@Component({
  selector: 'app-in-transit-transfers-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden flex flex-col justify-between">
      <div>
        <div class="p-5 border-b border-line flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="text-sm font-bold uppercase tracking-wider text-foreground">
              Phiếu Điều Chuyển Đang Vận Chuyển
            </h2>
            <p class="text-[13px] text-muted mt-0.5">
              Linh kiện đang vận chuyển giữa các kho chi nhánh
            </p>
          </div>
          <a
            [routerLink]="['/admin/inventory/transfers']"
            [queryParams]="{ status: 'IN_TRANSIT' }"
            class="text-[13px] font-semibold text-primary-strong hover:underline"
          >
            Quản lý điều chuyển &rarr;
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-[13px]">
            <thead class="bg-surface-alt/80 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th class="py-3 px-4">Mã phiếu</th>
                <th class="py-3 px-4">Kho gửi</th>
                <th class="py-3 px-4">Kho nhận</th>
                <th class="py-3 px-4">Số lượng</th>
                <th class="py-3 px-4">Thời gian xuất</th>
                <th class="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              @if (transfers().length === 0) {
                <tr>
                  <td colspan="6" class="py-8 text-center text-muted text-[13px]">
                    Hiện không có phiếu điều chuyển nào đang trên đường vận chuyển
                  </td>
                </tr>
              } @else {
                @for (item of transfers(); track item.id) {
                  <tr class="hover:bg-surface-alt/50 transition-colors">
                    <td class="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                      {{ item.code }}
                    </td>
                    <td class="py-3 px-4 text-muted whitespace-nowrap">
                      {{ item.sourceBranchCode }} ({{ item.sourceBranchName }})
                    </td>
                    <td class="py-3 px-4 text-muted whitespace-nowrap">
                      {{ item.destinationBranchCode }} ({{ item.destinationBranchName }})
                    </td>
                    <td class="py-3 px-4 tabular-nums font-medium whitespace-nowrap text-foreground">
                      {{ item.totalQuantity }} chiếc ({{ item.skuCount }} SKU)
                    </td>
                    <td class="py-3 px-4 text-muted tabular-nums whitespace-nowrap">
                      {{ formatDispatchedTime(item.dispatchedAt) }}
                    </td>
                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <a
                        [routerLink]="['/admin/inventory/transfers']"
                        [queryParams]="{ search: item.code }"
                        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-surface hover:bg-surface-alt border border-line text-primary hover:border-primary/50 transition-colors shadow-xs"
                        title="Xác nhận nhận hàng tại kho đích"
                      >
                        Nhận hàng
                      </a>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="p-4 bg-surface-alt/50 border-t border-line flex items-center justify-between flex-wrap gap-2 text-[13px]">
        <span class="text-muted">
          Kho đích sẽ xác nhận nhận đủ 100% số lượng để hoàn tất
        </span>
        <a
          [routerLink]="['/admin/inventory/transfers']"
          [queryParams]="{ action: 'create' }"
          class="px-3.5 py-1.5 bg-surface border border-line hover:bg-surface-alt rounded font-semibold text-foreground text-[13px] transition-colors shadow-xs"
        >
          Tạo phiếu mới &rarr;
        </a>
      </div>
    </div>
  `,
})
export class InTransitTransfersCardComponent {
  readonly transfers = input<readonly InTransitTransferItem[]>([]);
  readonly selectedBranchId = input<number | null>(null);

  formatDispatchedTime(timeStr: string | null): string {
    if (!timeStr) {
      return '--:--';
    }
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      return timeStr;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
  }
}
