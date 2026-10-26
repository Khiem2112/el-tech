import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminOrderDetail, AdminOrderDetailService } from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-buyer-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-surface border border-line rounded-lg p-4 shadow-card text-foreground space-y-3">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
            Người Mua & Người Nhận
          </h2>
          <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold">
            Snapshot giao hàng
          </span>
        </div>

        <div class="space-y-2 text-xs">
          <div>
            <label class="block text-muted font-medium mb-1">Họ tên khách nhận:</label>
            <div class="px-2.5 py-1.5 bg-surface-alt border border-line rounded text-foreground font-semibold">
              {{ order().receiverName }}
            </div>
          </div>

          <div>
            <label class="block text-muted font-medium mb-1">Số điện thoại liên hệ:</label>
            <div class="flex items-center gap-2">
              <div class="flex-1 px-2.5 py-1.5 bg-surface-alt border border-line rounded text-foreground font-mono font-bold">
                {{ order().receiverPhone }}
              </div>
              <a
                [href]="'tel:' + order().receiverPhone"
                class="px-2.5 py-1.5 bg-surface border border-line hover:bg-surface-alt text-foreground rounded text-xs font-semibold transition-colors"
              >
                Gọi
              </a>
            </div>
          </div>

          <div>
            <label class="block text-muted font-medium mb-1">Địa chỉ email:</label>
            <div class="px-2.5 py-1.5 bg-surface-alt border border-line rounded text-foreground font-mono truncate">
              {{ order().receiverEmail }}
            </div>
          </div>

          <div>
            <label class="block text-muted font-medium mb-1">Địa chỉ giao nhận:</label>
            <div class="px-2.5 py-1.5 bg-surface-alt border border-line rounded text-foreground text-xs min-h-[44px]">
              {{ order().receiverAddress }}
            </div>
          </div>

          <div>
            <label class="block text-muted font-medium mb-1">Ghi chú của khách hàng:</label>
            <div class="px-2.5 py-1.5 bg-surface-alt border border-line rounded text-muted italic text-xs min-h-[36px]">
              {{ order().customerNotes || 'Không có ghi chú từ khách' }}
            </div>
          </div>

          <div class="pt-1 border-t border-line">
            <div class="flex items-center justify-between mb-1">
              <label for="admin-internal-note-input" class="block text-muted font-medium">Ghi chú nội bộ admin:</label>
              <button
                type="button"
                (click)="onSaveInternalNotes()"
                [disabled]="detailService.isSavingNotes()"
                class="text-xs px-2 py-0.5 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity"
              >
                {{ detailService.isSavingNotes() ? 'Đang lưu...' : 'Lưu ghi chú' }}
              </button>
            </div>
            <textarea
              id="admin-internal-note-input"
              rows="2"
              [(ngModel)]="internalNotesInput"
              placeholder="Ghi chú nội bộ cho kỹ thuật và điều phối viên..."
              class="w-full px-2.5 py-1.5 bg-surface border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
            ></textarea>
            @if (saveSuccessMessage()) {
              <div class="text-xs text-primary font-medium mt-1">{{ saveSuccessMessage() }}</div>
            }
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 shadow-card text-foreground space-y-3">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
            Vận Chuyển & Kho
          </h2>
          <span
            class="px-2 py-0.5 rounded text-xs font-mono font-bold"
            [class.bg-emerald-50]="order().fulfillmentMethod === 'DELIVERY'"
            [class.text-emerald-700]="order().fulfillmentMethod === 'DELIVERY'"
            [class.dark:bg-emerald-950/60]="order().fulfillmentMethod === 'DELIVERY'"
            [class.dark:text-emerald-400]="order().fulfillmentMethod === 'DELIVERY'"
            [class.border]="order().fulfillmentMethod === 'DELIVERY'"
            [class.border-emerald-200]="order().fulfillmentMethod === 'DELIVERY'"
            [class.dark:border-emerald-500/30]="order().fulfillmentMethod === 'DELIVERY'"
            [class.bg-blue-50]="order().fulfillmentMethod === 'PICKUP'"
            [class.text-blue-700]="order().fulfillmentMethod === 'PICKUP'"
            [class.dark:bg-blue-950/60]="order().fulfillmentMethod === 'PICKUP'"
            [class.dark:text-blue-400]="order().fulfillmentMethod === 'PICKUP'"
          >
            {{ order().fulfillmentMethod === 'DELIVERY' ? 'GIAO TẬN NƠI' : 'NHẬN TẠI SHOWROOM' }}
          </span>
        </div>

        <div class="space-y-2 text-xs">
          <div>
            <label class="block text-muted font-medium mb-1">Hình thức nhận hàng:</label>
            <div class="px-2.5 py-1.5 bg-surface-alt border border-line rounded text-foreground font-semibold">
              {{ order().fulfillmentMethod === 'DELIVERY' ? 'Giao hàng tận nơi' : 'Nhận tại quầy showroom' }}
            </div>
          </div>

          <div>
            <label class="block text-muted font-medium mb-1">Chi nhánh xuất hàng:</label>
            <div class="px-2.5 py-1.5 bg-surface-alt border border-line rounded text-foreground font-bold">
              {{ order().fulfillmentBranch.name }} ({{ order().fulfillmentBranch.code }})
            </div>
            <div class="text-xs text-muted mt-1 pl-1">
              Địa chỉ: {{ order().fulfillmentBranch.address }}
            </div>
          </div>

          <div>
            <label class="block text-muted font-medium mb-1">Đơn vị vận chuyển đối tác:</label>
            <div class="px-2.5 py-1.5 bg-surface-alt border border-line rounded text-foreground">
              {{ order().shippingCarrier || 'Đội xe nội bộ EL-TECH / GHN Express' }}
            </div>
          </div>

          <div>
            <label class="block text-muted font-medium mb-1">Mã vận đơn đối soát:</label>
            <div class="px-2.5 py-1.5 bg-surface-alt border border-line rounded text-primary font-mono font-bold">
              {{ order().trackingCode || ('TRACK-' + order().code) }}
            </div>
          </div>

          <div class="pt-2 border-t border-line">
            <div class="flex items-center justify-between">
              <span class="text-muted">Số lần đã hẹn giao lại:</span>
              <span class="font-mono font-bold text-foreground">
                {{ order().redeliveryAttemptCount }} / 2 lần tối đa
              </span>
            </div>
            @if (order().redeliveryAttemptCount >= 2) {
              <div class="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-700 dark:text-rose-300 text-xs mt-1.5">
                Đã đạt ngưỡng 2 lần giao thất bại. Đơn hàng cần chuyển hoàn về kho chi nhánh theo quy trình.
              </div>
            }
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 shadow-card text-foreground space-y-3">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
            Trạng Thái Thanh Toán
          </h2>
          <span
            class="px-2 py-0.5 rounded text-xs font-semibold"
            [class.bg-amber-50]="order().paymentMethod === 'COD'"
            [class.text-amber-700]="order().paymentMethod === 'COD'"
            [class.dark:bg-amber-950/60]="order().paymentMethod === 'COD'"
            [class.dark:text-amber-300]="order().paymentMethod === 'COD'"
            [class.border]="order().paymentMethod === 'COD'"
            [class.border-amber-200]="order().paymentMethod === 'COD'"
            [class.dark:border-amber-500/30]="order().paymentMethod === 'COD'"
            [class.bg-emerald-50]="order().paymentMethod === 'QR'"
            [class.text-emerald-700]="order().paymentMethod === 'QR'"
            [class.dark:bg-emerald-950/60]="order().paymentMethod === 'QR'"
            [class.dark:text-emerald-400]="order().paymentMethod === 'QR'"
          >
            {{ order().paymentMethod === 'COD' ? 'Thu hộ COD' : 'Chuyển khoản VietQR' }}
          </span>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center py-1 border-b border-line">
            <span class="text-muted">Tổng giá trị đơn hàng:</span>
            <span class="font-bold text-foreground font-mono tabular-nums text-sm">
              {{ formatVnd(order().grandTotal) }}
            </span>
          </div>

          <div class="flex justify-between items-center py-1 border-b border-line">
            <span class="text-muted">Tiền cọc lắp ráp (10%):</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {{ order().payment ? formatVnd(order().payment?.totalReceived) : '0 ₫' }}
            </span>
          </div>

          <div class="flex justify-between items-center py-1 border-b border-line">
            <span class="text-muted">Tình trạng xử lý cọc:</span>
            <span class="px-2 py-0.5 rounded text-xs font-semibold bg-surface-alt border border-line text-foreground">
              {{ order().payment?.depositDisposition || (order().hasAssembly ? 'Đang giữ cọc' : 'Không áp dụng') }}
            </span>
          </div>

          <div class="flex justify-between items-center pt-2">
            <span class="font-bold text-rose-600 dark:text-rose-400 text-xs">Tiền mặt COD còn phải thu:</span>
            <span class="font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums text-base">
              {{ order().payment ? formatVnd(order().payment?.codRemaining) : formatVnd(order().grandTotal) }}
            </span>
          </div>

          @if (isCodRemaining()) {
            <div class="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-700 dark:text-amber-200 text-xs mt-2">
              Bắt buộc nhân viên/shipper thu đủ {{ order().payment ? formatVnd(order().payment?.codRemaining) : formatVnd(order().grandTotal) }} tiền mặt trước khi đánh dấu hoàn tất đơn hàng.
            </div>
          } @else {
            <div class="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-700 dark:text-emerald-300 text-xs mt-2">
              Đơn hàng đã được thanh toán đầy đủ 100%. Không phát sinh thu hộ tiền mặt.
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class OrderBuyerSectionComponent {
  readonly order = input.required<AdminOrderDetail>();

  readonly detailService = inject(AdminOrderDetailService);

  internalNotesInput = '';
  readonly saveSuccessMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.internalNotesInput = this.order().internalNotes || '';
    });
  }

  isCodRemaining(): boolean {
    const p = this.order().payment;
    if (!p) {
      return Number(this.order().grandTotal) > 0;
    }
    return Number(p.codRemaining) > 0;
  }

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

  async onSaveInternalNotes(): Promise<void> {
    const success = await this.detailService.updateNotes(this.order().id, {
      internalNotes: this.internalNotesInput,
    });
    if (success) {
      this.saveSuccessMessage.set('Đã lưu ghi chú nội bộ thành công');
      setTimeout(() => this.saveSuccessMessage.set(null), 3000);
    }
  }
}
