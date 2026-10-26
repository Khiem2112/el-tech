import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AdminOrderDetail } from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-lines-pc-group',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      @for (pcGroup of order().pcBuildGroups; track pcGroup.pcBuildKey) {
        <div class="bg-surface border border-line rounded-lg shadow-card text-foreground overflow-hidden">
          <div class="p-4 border-b border-line flex items-center justify-between flex-wrap gap-2 bg-surface-alt">
            <div class="flex items-center gap-3">
              <span class="px-2 py-0.5 rounded bg-surface-elevated text-primary border border-line font-mono text-xs font-bold uppercase">
                Gói PC
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-sm font-bold text-foreground uppercase tracking-wider">
                    {{ pcGroup.pcBuildName }}
                  </h2>
                  <span class="px-2 py-0.5 rounded bg-surface border border-line text-muted text-xs font-mono">
                    {{ pcGroup.pcBuildType }}
                  </span>
                </div>
                <div class="text-xs text-muted mt-0.5 flex items-center gap-3">
                  <span>Ước tính công suất: <strong class="text-primary font-mono">{{ pcGroup.totalWattage > 0 ? pcGroup.totalWattage + 'W TDP' : 'Tiêu chuẩn' }}</strong></span>
                  <span>Phí dịch vụ lắp ráp: <strong class="text-emerald-600 dark:text-emerald-400 font-mono">{{ formatVnd(pcGroup.assemblyFee) }}</strong></span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/30 text-xs font-semibold">
                {{ pcGroup.hasAssembly ? 'Dịch vụ lắp ráp: Có yêu cầu' : 'Linh kiện đồng bộ' }}
              </span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th class="py-2.5 px-3 w-12 text-center whitespace-nowrap">Ảnh</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Loại linh kiện</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">SKU & Tên linh kiện</th>
                  <th class="py-2.5 px-3 text-center whitespace-nowrap">SL</th>
                  <th class="py-2.5 px-3 text-right whitespace-nowrap">Đơn giá</th>
                  <th class="py-2.5 px-3 text-right whitespace-nowrap">Giảm giá SP</th>
                  <th class="py-2.5 px-3 text-right whitespace-nowrap">Coupon</th>
                  <th class="py-2.5 px-3 text-right whitespace-nowrap">Thành tiền</th>
                  <th class="py-2.5 px-3 text-center whitespace-nowrap">Tồn khả dụng</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                @for (item of pcGroup.items; track item.id) {
                  <tr class="hover:bg-surface-alt/60 transition-colors">
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">
                      <div class="w-9 h-9 rounded border border-line bg-surface overflow-hidden mx-auto flex items-center justify-center">
                        @if (item.imageUrl) {
                          <img [src]="item.imageUrl" [alt]="item.nameSnapshot" class="w-full h-full object-contain p-0.5" />
                        } @else {
                          <span class="text-xs text-muted font-mono">HW</span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">
                      {{ item.categoryName || 'Linh kiện' }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-foreground">{{ item.nameSnapshot }}</div>
                      <div class="font-mono text-muted text-xs">SKU: {{ item.skuSnapshot || 'N/A' }}</div>
                    </td>
                    <td class="py-2.5 px-3 text-center font-mono font-bold text-foreground whitespace-nowrap">
                      {{ item.quantity }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-foreground whitespace-nowrap">
                      {{ formatVnd(item.unitPrice) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-muted whitespace-nowrap">
                      - {{ formatVnd(item.productDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold whitespace-nowrap">
                      - {{ formatVnd(item.couponDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-primary whitespace-nowrap">
                      {{ formatVnd(item.netAmount) }}
                    </td>
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">
                      @if (item.availableStock !== null) {
                        <span
                          class="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                          [class.text-emerald-600]="item.availableStock >= item.quantity"
                          [class.dark:text-emerald-400]="item.availableStock >= item.quantity"
                          [class.text-rose-600]="item.availableStock < item.quantity"
                          [class.dark:text-rose-400]="item.availableStock < item.quantity"
                        >
                          {{ item.availableStock }} cái {{ item.availableStock >= item.quantity ? '(Đủ)' : '(Thiếu)' }}
                        </span>
                      } @else {
                        <span class="text-muted text-xs">-</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (order().standaloneLines.length > 0) {
        <div class="bg-surface border border-line rounded-lg shadow-card text-foreground overflow-hidden">
          <div class="p-4 border-b border-line flex items-center justify-between flex-wrap gap-2 bg-surface-alt">
            <div>
              <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
                Linh Kiện & Phụ Kiện Mua Rời
              </h2>
              <p class="text-xs text-muted mt-0.5">
                Các sản phẩm và phụ kiện đóng gói độc lập ngoài cấu hình PC
              </p>
            </div>
            <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold">
              {{ order().standaloneLines.length }} sản phẩm
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th class="py-2.5 px-3 w-12 text-center whitespace-nowrap">Ảnh</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Loại linh kiện</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">SKU & Tên linh kiện</th>
                  <th class="py-2.5 px-3 text-center whitespace-nowrap">SL</th>
                  <th class="py-2.5 px-3 text-right whitespace-nowrap">Đơn giá</th>
                  <th class="py-2.5 px-3 text-right whitespace-nowrap">Giảm giá SP</th>
                  <th class="py-2.5 px-3 text-right whitespace-nowrap">Coupon</th>
                  <th class="py-2.5 px-3 text-right whitespace-nowrap">Thành tiền</th>
                  <th class="py-2.5 px-3 text-center whitespace-nowrap">Tồn khả dụng</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                @for (item of order().standaloneLines; track item.id) {
                  <tr class="hover:bg-surface-alt/60 transition-colors">
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">
                      <div class="w-9 h-9 rounded border border-line bg-surface overflow-hidden mx-auto flex items-center justify-center">
                        @if (item.imageUrl) {
                          <img [src]="item.imageUrl" [alt]="item.nameSnapshot" class="w-full h-full object-contain p-0.5" />
                        } @else {
                          <span class="text-xs text-muted font-mono">HW</span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">
                      {{ item.categoryName || 'Linh kiện rời' }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-foreground">{{ item.nameSnapshot }}</div>
                      <div class="font-mono text-muted text-xs">SKU: {{ item.skuSnapshot || 'N/A' }}</div>
                    </td>
                    <td class="py-2.5 px-3 text-center font-mono font-bold text-foreground whitespace-nowrap">
                      {{ item.quantity }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-foreground whitespace-nowrap">
                      {{ formatVnd(item.unitPrice) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-muted whitespace-nowrap">
                      - {{ formatVnd(item.productDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold whitespace-nowrap">
                      - {{ formatVnd(item.couponDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-primary whitespace-nowrap">
                      {{ formatVnd(item.netAmount) }}
                    </td>
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">
                      @if (item.availableStock !== null) {
                        <span
                          class="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                          [class.text-emerald-600]="item.availableStock >= item.quantity"
                          [class.dark:text-emerald-400]="item.availableStock >= item.quantity"
                          [class.text-rose-600]="item.availableStock < item.quantity"
                          [class.dark:text-rose-400]="item.availableStock < item.quantity"
                        >
                          {{ item.availableStock }} cái {{ item.availableStock >= item.quantity ? '(Đủ)' : '(Thiếu)' }}
                        </span>
                      } @else {
                        <span class="text-muted text-xs">-</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderLinesPcGroupComponent {
  readonly order = input.required<AdminOrderDetail>();

  formatVnd(amount: string | number | undefined | null): string {
    if (amount === undefined || amount === null) {
      return '0 ₫';
    }
    const num = typeof amount === 'number' ? amount : Number(amount);
    if (Number.isNaN(num)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
  }
}
