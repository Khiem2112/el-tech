import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AdminOrderDetail } from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-finance-summary',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-[#272f3d] bg-[#090d16]/40 flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-white">
          Tóm Tắt Tài Chính & Quyết Toán Đơn Hàng
        </h2>
        <span class="px-2 py-0.5 rounded bg-[#76b900]/15 text-[#76b900] border border-[#76b900]/30 text-[11px] font-mono font-bold">
          Quyết toán minh bạch
        </span>
      </div>

      <div class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div class="space-y-3">
          <h3 class="font-bold text-slate-300 uppercase tracking-wider text-xs border-b border-[#272f3d] pb-1.5">
            Cơ Sở Tính Toán & Nguyên Tắc Khấu Trừ
          </h3>
          <div class="p-3 bg-[#090d16] rounded border border-[#272f3d] space-y-2 text-slate-400">
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
        </div>

        <div class="bg-[#090d16] p-4 rounded-lg border border-[#272f3d] space-y-2">
          <h3 class="font-bold text-white uppercase tracking-wider text-xs border-b border-[#272f3d] pb-1.5">
            Bảng Kê Chi Phí Chi Tiết
          </h3>

          <div class="space-y-1.5 pt-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Tạm tính tiền hàng:</span>
              <span class="font-bold text-white font-mono tabular-nums">
                {{ formatVnd(order().subtotal) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-400">Giảm giá trực tiếp từ sản phẩm:</span>
              <span class="font-semibold text-slate-400 font-mono tabular-nums">
                - {{ formatVnd(order().productDiscount) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-400">Giảm giá Coupon đơn hàng:</span>
              <span class="font-bold text-rose-400 font-mono tabular-nums">
                - {{ formatVnd(order().couponDiscount) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-400">Phí dịch vụ lắp ráp máy tính:</span>
              <span class="font-bold text-slate-200 font-mono tabular-nums">
                {{ totalAssemblyFee() > 0 ? formatVnd(totalAssemblyFee()) : '0 ₫ (Miễn phí theo gói PC)' }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-400">Phí vận chuyển giao hàng:</span>
              <span class="font-bold font-mono tabular-nums" [class.text-[#76b900]]="Number(order().shippingFee) === 0" [class.text-white]="Number(order().shippingFee) > 0">
                {{ Number(order().shippingFee) === 0 ? '0 ₫ (Miễn phí giao hàng)' : formatVnd(order().shippingFee) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Thuế VAT (đã bao gồm trong giá niêm yết):</span>
              <span class="font-mono tabular-nums">
                {{ formatVnd(order().taxAmount) }}
              </span>
            </div>

            <div class="border-t border-[#272f3d] pt-2 flex items-center justify-between">
              <span class="font-black text-white text-sm uppercase">Tổng Tiền Thanh Toán:</span>
              <span class="font-black text-[#76b900] text-base font-mono tabular-nums">
                {{ formatVnd(order().grandTotal) }}
              </span>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-dashed border-[#272f3d]">
              <span class="text-emerald-400 font-semibold">Đã thanh toán (Cọc 10% / VietQR):</span>
              <span class="font-bold text-emerald-400 font-mono tabular-nums">
                - {{ order().payment ? formatVnd(order().payment?.totalReceived) : '0 ₫' }}
              </span>
            </div>

            <div class="flex items-center justify-between bg-rose-500/10 p-2 rounded border border-rose-500/25 mt-1">
              <span class="font-bold text-rose-300 uppercase text-xs">Tiền Mặt COD Còn Phải Thu:</span>
              <span class="font-black text-rose-400 text-sm font-mono tabular-nums">
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

  readonly Number = Number;

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
