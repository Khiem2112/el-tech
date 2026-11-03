import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { LowStockAlertItem } from '../services/admin-dashboard.service';

@Component({
  selector: 'app-low-stock-alert-card',
  standalone: true,
  imports: [CommonModule, RouterModule, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-line rounded-lg overflow-hidden flex flex-col justify-between">
      <div>
        <div class="p-4 border-b border-line flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="text-xs font-bold uppercase tracking-wider text-muted">
              Cảnh Báo Tồn Kho Thấp
            </h2>
          </div>
          <a
            routerLink="/admin/inventory/balances"
            class="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Sổ tồn kho</span>
            <lucide-icon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-surface-alt/60 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th class="py-2.5 px-3">Mã linh kiện</th>
                <th class="py-2.5 px-3">Linh kiện</th>
                <th class="py-2.5 px-3 text-right">Khả dụng</th>
                <th class="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              @if (filteredAlerts().length === 0) {
                <tr>
                  <td colspan="4" class="py-8 text-center text-muted text-xs">
                    Tồn kho an toàn, không có cảnh báo
                  </td>
                </tr>
              } @else {
                @for (item of filteredAlerts(); track item.quantId) {
                  <tr class="hover:bg-surface-alt/40 transition-colors">
                    <td class="py-2.5 px-3 tabular font-semibold text-foreground whitespace-nowrap">
                      {{ item.sku }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-medium text-foreground line-clamp-1">{{ item.productName }}</div>
                      <div class="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                        <span>STORE-MAIN</span>
                        @if (item.variationLabel) {
                          <span>&bull;</span>
                          <span class="tabular">{{ item.variationLabel }}</span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                      <span
                        class="font-bold tabular"
                        [class.text-rose-600]="item.available <= 0"
                        [class.text-amber-600]="item.available > 0 && item.available <= 5"
                        [class.text-foreground]="item.available > 5"
                      >
                        {{ item.available }}
                      </span>
                      <span class="text-xs text-muted ml-1 font-normal tabular">/ {{ item.onHand }}</span>
                    </td>
                    <td class="py-2.5 px-3 text-right whitespace-nowrap">
                      <a
                        [routerLink]="['/admin/procurement/purchase-orders/new']"
                        [queryParams]="{ skuId: item.skuId }"
                        class="px-2.5 py-1 text-xs font-semibold rounded bg-surface border border-line hover:border-primary/50 text-foreground transition-colors"
                      >
                        Tạo đơn mua hàng
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
          Đơn COD sẽ tạm chặn nếu hết hàng khả dụng
        </span>
        <div class="flex items-center gap-2">
          <a
            routerLink="/admin/procurement/purchase-orders/new"
            class="px-3 py-1 bg-primary hover:bg-primary-strong rounded font-semibold text-primary-foreground transition-colors"
          >
            Tạo đơn mua hàng
          </a>
        </div>
      </div>
    </div>
  `,
})
export class LowStockAlertCardComponent {
  readonly alerts = input<LowStockAlertItem[]>([]);
  readonly selectedBranchId = input<number | null>(null);

  readonly filteredAlerts = computed<LowStockAlertItem[]>(() => {
    return this.alerts().filter((item) => {
      const isBelowThirtyPercent = item.onHand <= 0 || item.available < item.onHand * 0.3;
      const isAtOrBelowThreshold =
        typeof item.reorderThreshold === 'number' && item.reorderThreshold > 0
          ? item.available <= item.reorderThreshold
          : false;
      return isBelowThirtyPercent || isAtOrBelowThreshold;
    });
  });
}
