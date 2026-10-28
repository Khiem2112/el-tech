import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { handleProductImageError } from '../../../../core/constants/product.constants';
import { AdminOrderDetail } from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-lines-pc-group',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      @for (pcGroup of order().pcBuildGroups; track pcGroup.pcBuildKey) {
        <div class="bg-surface border border-line rounded-lg text-foreground overflow-hidden">
          <div class="p-3.5 border-b border-line flex items-center justify-between flex-wrap gap-2 bg-surface-alt/40">
            <div class="flex items-center gap-2.5">
              <span class="px-2 py-0.5 rounded bg-surface-elevated text-primary border border-line text-xs font-semibold uppercase">
                Gói PC
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-xs font-bold text-foreground uppercase tracking-wider">
                    {{ pcGroup.pcBuildName }}
                  </h2>
                  <span class="px-1.5 py-0.5 rounded bg-surface border border-line text-muted text-xs">
                    {{ pcGroup.pcBuildType }}
                  </span>
                </div>
                <div class="text-xs text-muted mt-0.5 flex items-center gap-3">
                  <span>Công suất: <strong class="text-foreground tabular tabular-nums">{{ pcGroup.totalWattage > 0 ? pcGroup.totalWattage + 'W TDP' : 'Tiêu chuẩn' }}</strong></span>
                  <span>Phí lắp ráp: <strong class="text-foreground tabular tabular-nums">{{ formatVnd(pcGroup.assemblyFee) }}</strong></span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-xs font-medium border"
                [class.bg-primary/10]="pcGroup.hasAssembly"
                [class.text-primary]="pcGroup.hasAssembly"
                [class.border-primary/20]="pcGroup.hasAssembly"
                [class.bg-surface-alt]="!pcGroup.hasAssembly"
                [class.text-muted]="!pcGroup.hasAssembly"
                [class.border-line]="!pcGroup.hasAssembly"
              >
                {{ pcGroup.hasAssembly ? 'Dịch vụ ráp PC: Có yêu cầu' : 'Linh kiện đồng bộ' }}
              </span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-surface-alt/60 border-b border-line text-muted font-medium uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-2.5 px-3 w-10 text-center whitespace-nowrap">Ảnh</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Danh mục</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Linh kiện & Sê-ri</th>
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
                  <tr class="hover:bg-surface-alt/40 transition-colors">
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">
                      <div class="w-8 h-8 rounded border border-line bg-surface overflow-hidden mx-auto flex items-center justify-center">
                        @if (item.imageUrl) {
                          <img
                            src="/images/products/placeholder.webp"
                            [src]="item.imageUrl || '/images/products/placeholder.webp'"
                            [alt]="item.nameSnapshot || 'Linh kiện PC'"
                            class="w-full h-full object-contain p-0.5"
                            (error)="onImageError($event)"
                          />
                        } @else {
                          <span class="text-xs text-muted">HW</span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-muted whitespace-nowrap text-xs">
                      {{ item.categoryName || 'Linh kiện' }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-medium text-foreground text-sm">{{ item.nameSnapshot }}</div>
                      <div class="text-muted text-xs flex items-center gap-2 mt-0.5">
                        <span class="tabular tabular-nums">SKU: {{ item.skuSnapshot || 'N/A' }}</span>
                        @if (item.specSnapshot?.['serialNumber'] || item.specSnapshot?.['serial']) {
                          <span class="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary text-xs tabular tabular-nums">
                            S/N: {{ item.specSnapshot?.['serialNumber'] || item.specSnapshot?.['serial'] }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-center font-medium text-foreground whitespace-nowrap tabular tabular-nums">
                      {{ item.quantity }}
                    </td>
                    <td class="py-2.5 px-3 text-right tabular tabular-nums text-foreground whitespace-nowrap">
                      {{ formatVnd(item.unitPrice) }}
                    </td>
                    <td class="py-2.5 px-3 text-right tabular tabular-nums text-muted whitespace-nowrap">
                      - {{ formatVnd(item.productDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right tabular tabular-nums text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      - {{ formatVnd(item.couponDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-semibold tabular tabular-nums text-foreground whitespace-nowrap">
                      {{ formatVnd(item.netAmount) }}
                    </td>
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">
                      @if (item.availableStock !== null) {
                        <span
                          class="px-2 py-0.5 rounded text-xs tabular tabular-nums"
                          [class.text-emerald-600]="item.availableStock >= item.quantity"
                          [class.dark:text-emerald-400]="item.availableStock >= item.quantity"
                          [class.text-rose-600]="item.availableStock < item.quantity"
                          [class.dark:text-rose-400]="item.availableStock < item.quantity"
                        >
                          {{ item.availableStock }} {{ item.availableStock >= item.quantity ? '(Đủ)' : '(Thiếu)' }}
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
        <div class="bg-surface border border-line rounded-lg text-foreground overflow-hidden">
          <div class="p-3.5 border-b border-line flex items-center justify-between flex-wrap gap-2 bg-surface-alt/40">
            <div>
              <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
                Linh Kiện & Phụ Kiện Mua Rời
              </h2>
            </div>
            <span class="px-2 py-0.5 rounded bg-surface-alt border border-line text-muted text-xs tabular tabular-nums">
              {{ order().standaloneLines.length }} sản phẩm
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-surface-alt/60 border-b border-line text-muted font-medium uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-2.5 px-3 w-10 text-center whitespace-nowrap">Ảnh</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Danh mục</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Linh kiện & Sê-ri</th>
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
                  <tr class="hover:bg-surface-alt/40 transition-colors">
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">
                      <div class="w-8 h-8 rounded border border-line bg-surface overflow-hidden mx-auto flex items-center justify-center">
                        @if (item.imageUrl) {
                          <img
                            src="/images/products/placeholder.webp"
                            [src]="item.imageUrl || '/images/products/placeholder.webp'"
                            [alt]="item.nameSnapshot || 'Linh kiện PC'"
                            class="w-full h-full object-contain p-0.5"
                            (error)="onImageError($event)"
                          />
                        } @else {
                          <span class="text-xs text-muted">HW</span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-muted whitespace-nowrap text-xs">
                      {{ item.categoryName || 'Linh kiện rời' }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-medium text-foreground text-sm">{{ item.nameSnapshot }}</div>
                      <div class="text-muted text-xs flex items-center gap-2 mt-0.5">
                        <span class="tabular tabular-nums">SKU: {{ item.skuSnapshot || 'N/A' }}</span>
                        @if (item.specSnapshot?.['serialNumber'] || item.specSnapshot?.['serial']) {
                          <span class="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary text-xs tabular tabular-nums">
                            S/N: {{ item.specSnapshot?.['serialNumber'] || item.specSnapshot?.['serial'] }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-center font-medium text-foreground whitespace-nowrap tabular tabular-nums">
                      {{ item.quantity }}
                    </td>
                    <td class="py-2.5 px-3 text-right tabular tabular-nums text-foreground whitespace-nowrap">
                      {{ formatVnd(item.unitPrice) }}
                    </td>
                    <td class="py-2.5 px-3 text-right tabular tabular-nums text-muted whitespace-nowrap">
                      - {{ formatVnd(item.productDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right tabular tabular-nums text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      - {{ formatVnd(item.couponDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-semibold tabular tabular-nums text-foreground whitespace-nowrap">
                      {{ formatVnd(item.netAmount) }}
                    </td>
                    <td class="py-2.5 px-3 text-center whitespace-nowrap">
                      @if (item.availableStock !== null) {
                        <span
                          class="px-2 py-0.5 rounded text-xs tabular tabular-nums"
                          [class.text-emerald-600]="item.availableStock >= item.quantity"
                          [class.dark:text-emerald-400]="item.availableStock >= item.quantity"
                          [class.text-rose-600]="item.availableStock < item.quantity"
                          [class.dark:text-rose-400]="item.availableStock < item.quantity"
                        >
                          {{ item.availableStock }} {{ item.availableStock >= item.quantity ? '(Đủ)' : '(Thiếu)' }}
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
  protected readonly onImageError = handleProductImageError;

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
