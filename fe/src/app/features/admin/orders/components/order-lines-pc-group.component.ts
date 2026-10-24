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
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
          <div class="p-4 border-b border-[#272f3d] flex items-center justify-between flex-wrap gap-2 bg-[#090d16]/40">
            <div class="flex items-center gap-3">
              <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono text-xs font-bold uppercase">
                Gói PC
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-sm font-bold text-white uppercase tracking-wider">
                    {{ pcGroup.pcBuildName }}
                  </h2>
                  <span class="px-2 py-0.5 rounded bg-[#272f3d] text-slate-300 text-[11px] font-mono">
                    {{ pcGroup.pcBuildType }}
                  </span>
                </div>
                <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                  <span>Ước tính công suất: <strong class="text-[#76b900] font-mono">{{ pcGroup.totalWattage > 0 ? pcGroup.totalWattage + 'W TDP' : 'Tiêu chuẩn' }}</strong></span>
                  <span>Phí dịch vụ lắp ráp: <strong class="text-emerald-400 font-mono">{{ formatVnd(pcGroup.assemblyFee) }}</strong></span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded bg-[#76b900]/15 text-[#76b900] border border-[#76b900]/30 text-xs font-semibold">
                {{ pcGroup.hasAssembly ? 'Dịch vụ lắp ráp: Có yêu cầu' : 'Linh kiện đồng bộ' }}
              </span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th class="py-2.5 px-3 w-12 text-center">Ảnh</th>
                  <th class="py-2.5 px-3">Loại linh kiện</th>
                  <th class="py-2.5 px-3">SKU & Tên linh kiện</th>
                  <th class="py-2.5 px-3 text-center">SL</th>
                  <th class="py-2.5 px-3 text-right">Đơn giá</th>
                  <th class="py-2.5 px-3 text-right">Giảm giá SP</th>
                  <th class="py-2.5 px-3 text-right">Coupon</th>
                  <th class="py-2.5 px-3 text-right">Thành tiền</th>
                  <th class="py-2.5 px-3 text-center">Tồn khả dụng</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d]">
                @for (item of pcGroup.items; track item.id) {
                  <tr class="hover:bg-[#090d16]/30 transition-colors">
                    <td class="py-2.5 px-3 text-center">
                      <div class="w-9 h-9 rounded border border-[#272f3d] bg-[#090d16] overflow-hidden mx-auto flex items-center justify-center">
                        @if (item.imageUrl) {
                          <img [src]="item.imageUrl" [alt]="item.nameSnapshot" class="w-full h-full object-contain p-0.5" />
                        } @else {
                          <span class="text-[9px] text-slate-500 font-mono">HW</span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 font-semibold text-slate-300">
                      {{ item.categoryName || 'Linh kiện' }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-white">{{ item.nameSnapshot }}</div>
                      <div class="font-mono text-slate-400 text-[11px]">SKU: {{ item.skuSnapshot || 'N/A' }}</div>
                    </td>
                    <td class="py-2.5 px-3 text-center font-mono font-bold text-white">
                      {{ item.quantity }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                      {{ formatVnd(item.unitPrice) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                      - {{ formatVnd(item.productDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-rose-400 font-semibold">
                      - {{ formatVnd(item.couponDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-[#76b900]">
                      {{ formatVnd(item.netAmount) }}
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      @if (item.availableStock !== null) {
                        <span
                          class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold"
                          [class.text-emerald-400]="item.availableStock >= item.quantity"
                          [class.text-rose-400]="item.availableStock < item.quantity"
                        >
                          {{ item.availableStock }} cái {{ item.availableStock >= item.quantity ? '(Đủ)' : '(Thiếu)' }}
                        </span>
                      } @else {
                        <span class="text-slate-500 text-[11px]">-</span>
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
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
          <div class="p-4 border-b border-[#272f3d] flex items-center justify-between flex-wrap gap-2 bg-[#090d16]/40">
            <div>
              <h2 class="text-xs font-bold uppercase tracking-wider text-white">
                Linh Kiện & Phụ Kiện Mua Rời
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Các sản phẩm và phụ kiện đóng gói độc lập ngoài cấu hình PC
              </p>
            </div>
            <span class="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-semibold">
              {{ order().standaloneLines.length }} sản phẩm
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th class="py-2.5 px-3 w-12 text-center">Ảnh</th>
                  <th class="py-2.5 px-3">Loại linh kiện</th>
                  <th class="py-2.5 px-3">SKU & Tên linh kiện</th>
                  <th class="py-2.5 px-3 text-center">SL</th>
                  <th class="py-2.5 px-3 text-right">Đơn giá</th>
                  <th class="py-2.5 px-3 text-right">Giảm giá SP</th>
                  <th class="py-2.5 px-3 text-right">Coupon</th>
                  <th class="py-2.5 px-3 text-right">Thành tiền</th>
                  <th class="py-2.5 px-3 text-center">Tồn khả dụng</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d]">
                @for (item of order().standaloneLines; track item.id) {
                  <tr class="hover:bg-[#090d16]/30 transition-colors">
                    <td class="py-2.5 px-3 text-center">
                      <div class="w-9 h-9 rounded border border-[#272f3d] bg-[#090d16] overflow-hidden mx-auto flex items-center justify-center">
                        @if (item.imageUrl) {
                          <img [src]="item.imageUrl" [alt]="item.nameSnapshot" class="w-full h-full object-contain p-0.5" />
                        } @else {
                          <span class="text-[9px] text-slate-500 font-mono">HW</span>
                        }
                      </div>
                    </td>
                    <td class="py-2.5 px-3 font-semibold text-slate-300">
                      {{ item.categoryName || 'Linh kiện rời' }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-white">{{ item.nameSnapshot }}</div>
                      <div class="font-mono text-slate-400 text-[11px]">SKU: {{ item.skuSnapshot || 'N/A' }}</div>
                    </td>
                    <td class="py-2.5 px-3 text-center font-mono font-bold text-white">
                      {{ item.quantity }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                      {{ formatVnd(item.unitPrice) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                      - {{ formatVnd(item.productDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono tabular-nums text-rose-400 font-semibold">
                      - {{ formatVnd(item.couponDiscount) }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-[#76b900]">
                      {{ formatVnd(item.netAmount) }}
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      @if (item.availableStock !== null) {
                        <span
                          class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold"
                          [class.text-emerald-400]="item.availableStock >= item.quantity"
                          [class.text-rose-400]="item.availableStock < item.quantity"
                        >
                          {{ item.availableStock }} cái {{ item.availableStock >= item.quantity ? '(Đủ)' : '(Thiếu)' }}
                        </span>
                      } @else {
                        <span class="text-slate-500 text-[11px]">-</span>
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
