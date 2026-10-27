import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AdminOrderDetail } from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-finance-summary',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-line rounded-lg text-foreground overflow-hidden">
      <div class="p-3.5 border-b border-line bg-surface-alt/40 flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
          Tài Chính & Quyết Toán Đơn Hàng
        </h2>
        <span class="px-2 py-0.5 rounded bg-surface-alt border border-line text-muted text-xs font-mono">
          {{ order().paymentMethod === 'COD' ? 'Thu hộ COD' : 'Chuyển khoản QR' }}
        </span>
      </div>

      <div class="p-4 sm:p-5 space-y-4 text-xs">
        @if (hasQrReview()) {
          <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <span>Phát hiện giao dịch chuyển khoản VietQR bị lệch cần đối soát.</span>
            <button
              type="button"
              (click)="openModalRequested.emit('MOD-20')"
              class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
            >
              Đối Soát QR
            </button>
          </div>
        }

        @if (hasPendingRefund()) {
          <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <span>Có khoản hoàn tiền đang ở trạng thái chờ thực hiện chuyển khoản.</span>
            <button
              type="button"
              (click)="openModalRequested.emit('MOD-21')"
              class="px-2.5 py-1 bg-primary hover:opacity-90 text-primary-foreground rounded text-xs font-semibold cursor-pointer transition-opacity"
            >
              Hoàn Tiền
            </button>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-2.5">
            <h3 class="font-semibold text-muted uppercase tracking-wider text-[11px] border-b border-line pb-1">
              Trạng Thái Thanh Toán
            </h3>

            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-muted">Kênh thanh toán:</span>
                <span class="font-medium text-foreground">{{ order().paymentMethod === 'COD' ? 'Thanh toán tiền mặt COD' : 'Chuyển khoản VietQR' }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-muted">Tình trạng thanh toán:</span>
                <span class="font-medium text-foreground">
                  {{ order().payment?.state === 'PAID' ? 'Đã thanh toán 100%' : (order().payment?.state === 'REFUNDED' ? 'Đã hoàn tiền' : (order().payment?.state === 'PARTIALLY_PAID' ? 'Đã thanh toán một phần' : 'Chưa thanh toán')) }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-muted">Tiền cọc lắp ráp PC:</span>
                <span class="font-mono tabular-nums text-foreground">
                  {{ order().hasAssembly ? (order().payment?.depositDisposition || 'Đang giữ cọc 10%') : 'Không áp dụng' }}
                </span>
              </div>

              <div class="flex items-center justify-between text-muted text-[11px] pt-1 border-t border-line">
                <span>Thuế VAT (đã gồm trong giá niêm yết):</span>
                <span class="font-mono tabular-nums text-foreground">{{ formatVnd(order().taxAmount) }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="font-semibold text-muted uppercase tracking-wider text-[11px] border-b border-line pb-1">
              Bảng Kê Chi Phí
            </h3>

            <div class="space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-muted">Tạm tính tiền hàng:</span>
                <span class="font-medium text-foreground font-mono tabular-nums">
                  {{ formatVnd(order().subtotal) }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-muted">Giảm giá sản phẩm:</span>
                <span class="text-muted font-mono tabular-nums">
                  - {{ formatVnd(order().productDiscount) }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-muted">Giảm giá Coupon:</span>
                <span class="text-rose-600 dark:text-rose-400 font-mono tabular-nums font-medium">
                  - {{ formatVnd(order().couponDiscount) }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-muted">Phí dịch vụ lắp ráp:</span>
                <span class="font-mono tabular-nums text-foreground">
                  {{ totalAssemblyFee() > 0 ? formatVnd(totalAssemblyFee()) : '0 ₫ (Miễn phí theo gói)' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-muted">Phí vận chuyển:</span>
                <span class="font-mono tabular-nums text-foreground">
                  {{ Number(order().shippingFee) === 0 ? '0 ₫ (Miễn phí)' : formatVnd(order().shippingFee) }}
                </span>
              </div>

              <div class="border-t border-line pt-2 flex items-center justify-between">
                <span class="font-semibold text-foreground text-xs uppercase">Tổng Tiền Đơn Hàng:</span>
                <span class="font-bold text-foreground text-sm font-mono tabular-nums">
                  {{ formatVnd(order().grandTotal) }}
                </span>
              </div>

              <div class="flex items-center justify-between text-muted">
                <span>Đã thanh toán (Cọc / QR):</span>
                <span class="font-mono tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                  - {{ order().payment ? formatVnd(order().payment?.totalReceived) : '0 ₫' }}
                </span>
              </div>

              <div class="flex items-center justify-between bg-surface-alt px-3 py-2 rounded border border-line">
                <span class="font-semibold text-foreground uppercase text-xs">Tiền Mặt COD Còn Phải Thu:</span>
                <span class="font-bold text-primary text-sm font-mono tabular-nums">
                  {{ order().payment ? formatVnd(order().payment?.codRemaining) : formatVnd(order().grandTotal) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrderFinanceSummaryComponent {
  readonly order = input.required<AdminOrderDetail>();
  readonly openModalRequested = output<string>();

  readonly Number = Number;

  readonly hasQrReview = computed<boolean>(() => {
    return Boolean(this.order().payment?.charges.some((c) => c.status === 'REVIEW'));
  });

  readonly hasPendingRefund = computed<boolean>(() => {
    return Boolean(this.order().payment?.refunds.some((r) => r.status === 'PENDING'));
  });

  readonly totalAssemblyFee = computed<number>(() => {
    let sum = 0;
    for (const group of this.order().pcBuildGroups) {
      const fee = Number(group.assemblyFee);
      if (!Number.isNaN(fee)) {
        sum += fee;
      }
    }
    return sum;
  });

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
