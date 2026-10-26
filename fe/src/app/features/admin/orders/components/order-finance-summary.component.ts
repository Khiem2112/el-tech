import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AdminOrderDetail } from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-finance-summary',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-line rounded-lg shadow-card text-foreground overflow-hidden">
      <div class="p-4 border-b border-line bg-surface-alt flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
          Tóm Tắt Tài Chính & Quyết Toán Đơn Hàng
        </h2>
        <span class="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 text-xs font-mono font-bold">
          Quyết toán minh bạch
        </span>
      </div>

      <div class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div class="space-y-3">
          <h3 class="font-bold text-foreground uppercase tracking-wider text-xs border-b border-line pb-1.5">
            Cơ Sở Tính Toán & Nguyên Tắc Khấu Trừ
          </h3>
          <div class="p-3 bg-surface-alt rounded border border-line space-y-2 text-muted">
            <div>
              Mã giảm giá coupon (nếu có) được phân bổ theo tỷ trọng đơn giá ban đầu của từng linh kiện cấu thành nhằm phục vụ công tác tính giá vốn, khấu hao và hoàn tiền từng phần khi có yêu cầu hủy dòng hàng.
            </div>
            <div>
              Đơn hàng có giá trị thanh toán ròng từ 2.000.000 ₫ trở lên áp dụng chính sách miễn phí giao hàng tiêu chuẩn theo cấu hình biểu phí vận chuyển chi nhánh.
            </div>
            <div>
              Đối với đơn đặt hàng COD có dịch vụ lắp ráp máy tính (PC Build), hệ thống yêu cầu cọc tối thiểu 10% qua chuyển khoản VietQR để xác thực linh kiện. Số tiền còn lại thu tiền mặt (COD) tại quầy hoặc khi giao hàng.
            </div>
          </div>

          @if (hasQrReview()) {
            <div class="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
              <span>Phát hiện giao dịch chuyển khoản VietQR bị lệch cần đối soát.</span>
              <button
                type="button"
                (click)="openModalRequested.emit('MOD-20')"
                class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold cursor-pointer transition-colors"
              >
                Đối Soát QR
              </button>
            </div>
          }

          @if (hasPendingRefund()) {
            <div class="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
              <span>Có khoản hoàn tiền đang ở trạng thái chờ thực hiện chuyển khoản.</span>
              <button
                type="button"
                (click)="openModalRequested.emit('MOD-21')"
                class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer transition-colors"
              >
                Hoàn Tiền
              </button>
            </div>
          }
        </div>

        <div class="bg-surface-alt p-4 rounded-lg border border-line space-y-2">
          <h3 class="font-bold text-foreground uppercase tracking-wider text-xs border-b border-line pb-1.5">
            Bảng Kê Chi Phí Chi Tiết
          </h3>

          <div class="space-y-1.5 pt-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-muted">Tạm tính tiền hàng:</span>
              <span class="font-bold text-foreground font-mono tabular-nums">
                {{ formatVnd(order().subtotal) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-muted">Giảm giá trực tiếp từ sản phẩm:</span>
              <span class="font-semibold text-muted font-mono tabular-nums">
                - {{ formatVnd(order().productDiscount) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-muted">Giảm giá Coupon đơn hàng:</span>
              <span class="font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                - {{ formatVnd(order().couponDiscount) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-muted">Phí dịch vụ lắp ráp máy tính:</span>
              <span class="font-bold text-foreground font-mono tabular-nums">
                {{ totalAssemblyFee() > 0 ? formatVnd(totalAssemblyFee()) : '0 ₫ (Miễn phí theo gói PC)' }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-muted">Phí vận chuyển giao hàng:</span>
              <span class="font-bold font-mono tabular-nums" [class.text-primary]="Number(order().shippingFee) === 0" [class.text-foreground]="Number(order().shippingFee) > 0">
                {{ Number(order().shippingFee) === 0 ? '0 ₫ (Miễn phí giao hàng)' : formatVnd(order().shippingFee) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-muted text-xs">
              <span>Thuế VAT (đã bao gồm trong giá niêm yết):</span>
              <span class="font-mono tabular-nums">
                {{ formatVnd(order().taxAmount) }}
              </span>
            </div>

            <div class="border-t border-line pt-2 flex items-center justify-between">
              <span class="font-bold text-foreground text-sm uppercase">Tổng Tiền Thanh Toán:</span>
              <span class="font-black text-primary text-base font-mono tabular-nums">
                {{ formatVnd(order().grandTotal) }}
              </span>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-dashed border-line">
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Đã thanh toán (Cọc 10% / VietQR):</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                - {{ order().payment ? formatVnd(order().payment?.totalReceived) : '0 ₫' }}
              </span>
            </div>

            <div class="flex items-center justify-between bg-rose-500/10 p-2 rounded border border-rose-500/25 mt-1">
              <span class="font-bold text-rose-700 dark:text-rose-300 uppercase text-xs">Tiền Mặt COD Còn Phải Thu:</span>
              <span class="font-bold text-rose-600 dark:text-rose-400 text-sm font-mono tabular-nums">
                {{ order().payment ? formatVnd(order().payment?.codRemaining) : formatVnd(order().grandTotal) }}
              </span>
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
