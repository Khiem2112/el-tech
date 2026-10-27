import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { InTransitTransferItem } from '../services/admin-dashboard.service';

@Component({
  selector: 'app-in-transit-transfers-card',
  standalone: true,
  imports: [CommonModule, RouterModule, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-line rounded-lg overflow-hidden flex flex-col justify-between">
      <div>
        <div class="p-4 border-b border-line flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="text-xs font-bold uppercase tracking-wider text-muted">
              Phiếu Điều Chuyển Đang Giao
            </h2>
          </div>
          <a
            [routerLink]="['/admin/inventory/transfers']"
            [queryParams]="{ status: 'IN_TRANSIT' }"
            class="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Quản lý điều chuyển</span>
            <lucide-icon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-surface-alt/60 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th class="py-2.5 px-3">Mã phiếu</th>
                <th class="py-2.5 px-3">Tuyến điều chuyển</th>
                <th class="py-2.5 px-3 text-right">Số lượng</th>
                <th class="py-2.5 px-3">Thời gian</th>
                <th class="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              @if (transfers().length === 0) {
                <tr>
                  <td colspan="5" class="py-8 text-center text-muted text-sm">
                    Không có phiếu điều chuyển nào đang trên đường vận chuyển
                  </td>
                </tr>
              } @else {
                @for (item of transfers(); track item.id) {
                  <tr class="hover:bg-surface-alt/40 transition-colors">
                    <td class="py-2.5 px-3 tabular font-semibold text-foreground whitespace-nowrap">
                      {{ item.code }}
                    </td>
                    <td class="py-2.5 px-3 text-muted whitespace-nowrap">
                      <span class="font-medium text-foreground">{{ item.sourceBranchCode }}</span>
                      <span class="mx-1 text-muted">&rarr;</span>
                      <span class="font-medium text-foreground">{{ item.destinationBranchCode }}</span>
                    </td>
                    <td class="py-2.5 px-3 tabular font-medium whitespace-nowrap text-foreground text-right">
                      {{ item.totalQuantity }} <span class="text-muted text-xs font-normal">({{ item.skuCount }} SKU)</span>
                    </td>
                    <td class="py-2.5 px-3 text-muted tabular whitespace-nowrap">
                      {{ formatDispatchedTime(item.dispatchedAt) }}
                    </td>
                    <td class="py-2.5 px-3 text-right whitespace-nowrap">
                      <a
                        [routerLink]="['/admin/inventory/transfers']"
                        [queryParams]="{ search: item.code }"
                        class="px-2 py-1 text-xs font-medium rounded bg-surface border border-line hover:border-primary/50 text-foreground transition-colors"
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

      <div class="p-3 bg-surface-alt/30 border-t border-line flex items-center justify-between flex-wrap gap-2 text-xs">
        <span class="text-muted">
          Kho đích xác nhận số lượng để hoàn tất nhập kho
        </span>
        <a
          [routerLink]="['/admin/inventory/transfers']"
          [queryParams]="{ action: 'create' }"
          class="px-3 py-1 bg-surface border border-line hover:bg-surface-alt rounded font-medium text-foreground text-xs transition-colors"
        >
          Tạo phiếu mới
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
