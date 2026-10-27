import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LowStockAlertItem } from '../services/admin-dashboard.service';

@Component({
  selector: 'app-low-stock-alert-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
      <div class="p-5 border-b border-line flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 class="text-sm font-bold uppercase tracking-wider text-rose-600">
            Cảnh Báo Tồn Khả Dụng Thấp Hoặc Bằng 0
          </h2>
          <p class="text-[13px] text-muted mt-0.5">
            Linh kiện cần lập đơn mua nhập hàng hoặc điều chuyển nội bộ gấp
          </p>
        </div>
        <a
          [routerLink]="['/admin/inventory/balances']"
          [queryParams]="inventoryQueryParams()"
          class="text-[13px] font-semibold text-primary-strong hover:underline"
        >
          Sổ tồn kho &rarr;
        </a>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13px]">
          <thead class="bg-surface-alt/80 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th class="py-3 px-4">Mã SKU</th>
              <th class="py-3 px-4">Tên linh kiện</th>
              <th class="py-3 px-4">Chi nhánh</th>
              <th class="py-3 px-4 text-right">Tồn thực tế</th>
              <th class="py-3 px-4 text-right">Đang giữ</th>
              <th class="py-3 px-4 text-right">Khả dụng</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            @if (alerts().length === 0) {
              <tr>
                <td colspan="6" class="py-8 text-center text-muted text-[13px]">
                  Hiện không có linh kiện nào chạm ngưỡng cảnh báo tồn kho
                </td>
              </tr>
            } @else {
              @for (item of alerts(); track item.quantId) {
                <tr class="hover:bg-surface-alt/50 transition-colors">
                  <td class="py-3 px-4 font-mono text-[13px] font-semibold text-foreground">
                    {{ item.sku }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-medium text-foreground line-clamp-1">{{ item.productName }}</div>
                    @if (item.variationLabel) {
                      <div class="text-xs text-muted font-mono">{{ item.variationLabel }}</div>
                    }
                  </td>
                  <td class="py-3 px-4 text-muted text-[13px] whitespace-nowrap">
                    {{ item.branchCode }} ({{ item.branchName }})
                  </td>
                  <td class="py-3 px-4 text-right tabular-nums text-foreground font-medium">
                    {{ item.onHand }}
                  </td>
                  <td class="py-3 px-4 text-right tabular-nums text-amber-700 font-semibold">
                    {{ item.reserved }}
                  </td>
                  <td
                    class="py-3 px-4 text-right tabular-nums font-bold"
                    [class.text-rose-600]="item.available <= 0"
                    [class.text-amber-600]="item.available > 0 && item.available <= 5"
                    [class.text-primary-strong]="item.available > 5"
                  >
                    {{ item.available }}
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <div class="p-4 bg-surface-alt/50 border-t border-line flex items-center justify-between flex-wrap gap-2 text-[13px]">
        <span class="text-muted">
          Đơn hàng COD tiếp theo có chứa các SKU trên sẽ bị chặn xác nhận nếu hết hàng
        </span>
        <div class="flex items-center gap-2">
          <a
            [routerLink]="['/admin/inventory/transfers']"
            class="px-3.5 py-1.5 bg-surface border border-line hover:bg-surface-alt rounded font-semibold text-foreground text-[13px] transition-colors shadow-xs"
          >
            Điều chuyển &rarr;
          </a>
          <a
            [routerLink]="['/admin/procurement/purchase-orders/new']"
            class="px-3.5 py-1.5 bg-primary hover:bg-primary-strong rounded font-semibold text-primary-foreground text-[13px] transition-colors shadow-xs"
          >
            Lập đơn mua PO &rarr;
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
