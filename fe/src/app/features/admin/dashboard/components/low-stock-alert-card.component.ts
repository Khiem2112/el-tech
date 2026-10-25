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
    <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm">
      <div class="p-4 border-b border-[#272f3d] flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-rose-400">
            Cảnh Báo Tồn Khả Dụng Thấp Hoặc Bằng 0
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Linh kiện cần lập đơn mua nhập hàng hoặc điều chuyển nội bộ gấp
          </p>
        </div>
        <a
          [routerLink]="['/admin/inventory/balances']"
          [queryParams]="inventoryQueryParams()"
          class="text-xs font-semibold text-[#76b900] hover:underline"
        >
          Sổ tồn kho &rarr;
        </a>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th class="py-2.5 px-3">Mã SKU</th>
              <th class="py-2.5 px-3">Tên linh kiện</th>
              <th class="py-2.5 px-3">Chi nhánh</th>
              <th class="py-2.5 px-3 text-right">Tồn thực tế</th>
              <th class="py-2.5 px-3 text-right">Đang giữ</th>
              <th class="py-2.5 px-3 text-right">Khả dụng</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#272f3d]">
            @if (alerts().length === 0) {
              <tr>
                <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
                  Hiện không có linh kiện nào chạm ngưỡng cảnh báo tồn kho
                </td>
              </tr>
            } @else {
              @for (item of alerts(); track item.quantId) {
                <tr class="hover:bg-[#090d16]/30 transition-colors">
                  <td class="py-2.5 px-3 font-mono text-xs font-semibold text-white">
                    {{ item.sku }}
                  </td>
                  <td class="py-2.5 px-3">
                    <div class="font-medium text-white line-clamp-1">{{ item.productName }}</div>
                    @if (item.variationLabel) {
                      <div class="text-[11px] text-slate-400 font-mono">{{ item.variationLabel }}</div>
                    }
                  </td>
                  <td class="py-2.5 px-3 text-slate-400 text-xs whitespace-nowrap">
                    {{ item.branchCode }} ({{ item.branchName }})
                  </td>
                  <td class="py-2.5 px-3 text-right tabular-nums text-slate-200">
                    {{ item.onHand }}
                  </td>
                  <td class="py-2.5 px-3 text-right tabular-nums text-amber-400">
                    {{ item.reserved }}
                  </td>
                  <td
                    class="py-2.5 px-3 text-right tabular-nums font-bold"
                    [class.text-rose-400]="item.available <= 0"
                    [class.text-amber-400]="item.available > 0 && item.available <= 5"
                    [class.text-[#76b900]]="item.available > 5"
                  >
                    {{ item.available }}
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <div class="p-3 bg-[#090d16] border-t border-[#272f3d] flex items-center justify-between flex-wrap gap-2 text-xs">
        <span class="text-slate-400">
          Đơn hàng COD tiếp theo có chứa các SKU trên sẽ bị chặn xác nhận nếu hết hàng
        </span>
        <div class="flex items-center gap-2">
          <a
            [routerLink]="['/admin/inventory/transfers']"
            class="px-2.5 py-1 bg-[#161b26] border border-[#272f3d] hover:bg-[#272f3d] rounded font-semibold text-slate-200 transition-colors"
          >
            Điều chuyển &rarr;
          </a>
          <a
            [routerLink]="['/admin/procurement/purchase-orders/new']"
            class="px-2.5 py-1 bg-[#76b900] hover:bg-[#5a8d00] rounded font-semibold text-[#090d16] transition-colors"
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
