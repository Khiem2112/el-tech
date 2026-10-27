import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
            [routerLink]="['/admin/inventory/balances']"
            [queryParams]="inventoryQueryParams()"
            class="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Sổ tồn kho</span>
            <lucide-icon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-alt/60 border-b border-line text-muted font-semibold uppercase tracking-wider">
              <tr>
                <th class="py-2.5 px-3">Mã SKU</th>
                <th class="py-2.5 px-3">Linh kiện &amp; Chi nhánh</th>
                <th class="py-2.5 px-3 text-right">Khả dụng</th>
                <th class="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              @if (alerts().length === 0) {
                <tr>
                  <td colspan="4" class="py-8 text-center text-muted text-xs">
                    Mức tồn kho tất cả linh kiện đều trong ngưỡng an toàn
                  </td>
                </tr>
              } @else {
                @for (item of alerts(); track item.quantId) {
                  <tr class="hover:bg-surface-alt/40 transition-colors">
                    <td class="py-2.5 px-3 font-mono font-semibold text-foreground whitespace-nowrap">
                      {{ item.sku }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-medium text-foreground line-clamp-1">{{ item.productName }}</div>
                      <div class="text-[11px] text-muted flex items-center gap-1.5 mt-0.5">
                        <span>{{ item.branchCode }}</span>
                        @if (item.variationLabel) {
                          <span>&bull;</span>
                          <span class="font-mono">{{ item.variationLabel }}</span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                      <span
                        class="font-bold"
                        [class.text-rose-600]="item.available <= 0"
                        [class.text-amber-600]="item.available > 0 && item.available <= 5"
                        [class.text-foreground]="item.available > 5"
                      >
                        {{ item.available }}
                      </span>
                      <span class="text-[11px] text-muted ml-1 font-normal">/ {{ item.onHand }}</span>
                    </td>
                    <td class="py-2.5 px-3 text-right whitespace-nowrap">
                      <a
                        [routerLink]="['/admin/procurement/purchase-orders/new']"
                        class="px-2 py-1 text-xs font-medium rounded bg-surface border border-line hover:border-primary/50 text-foreground transition-colors"
                      >
                        Lập PO
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
            [routerLink]="['/admin/inventory/transfers']"
            class="px-3 py-1 bg-surface border border-line hover:bg-surface-alt rounded font-medium text-foreground transition-colors"
          >
            Điều chuyển
          </a>
          <a
            [routerLink]="['/admin/procurement/purchase-orders/new']"
            class="px-3 py-1 bg-primary hover:bg-primary-strong rounded font-semibold text-primary-foreground transition-colors"
          >
            Tạo đơn PO
          </a>
        </div>
      </div>
    </div>
  `,
})
export class LowStockAlertCardComponent {
  readonly alerts = input<LowStockAlertItem[]>([]);
  readonly selectedBranchId = input<number | null>(null);

  inventoryQueryParams(): Record<string, string | number> {
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
