import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SelectComponent,
  SelectOption,
} from '../../../../../components/atoms/select/select.component';
import {
  AdminOrderDetail,
  AdminOrderDetailService,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-pickup-to-delivery-amendment-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-19" class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-sm text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <h3 class="font-bold text-foreground text-sm tracking-wide">
              Chuyển Đổi Sang Giao Hàng Tận Nơi
            </h3>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-surface-alt hover:bg-surface text-muted-foreground hover:text-foreground border border-line text-xs"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            <div class="space-y-1">
              <label class="block font-semibold text-muted-foreground text-xs uppercase">
                Địa chỉ giao hàng:
              </label>
              <input
                type="text"
                [(ngModel)]="deliveryAddress"
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-muted-foreground text-xs uppercase mb-1">Tên người nhận:</label>
                <input
                  type="text"
                  [(ngModel)]="receiverName"
                  class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="block font-semibold text-muted-foreground text-xs uppercase mb-1">Số điện thoại:</label>
                <input
                  type="text"
                  [(ngModel)]="receiverPhone"
                  class="w-full px-3 py-1.5 bg-surface border border-line rounded tabular tabular-nums text-foreground text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-muted-foreground text-xs uppercase mb-1">
                  Phí giao hàng (VND):
                </label>
                <input
                  type="number"
                  [(ngModel)]="shippingFee"
                  class="w-full px-3 py-1.5 bg-surface border border-line rounded tabular tabular-nums font-bold text-primary text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="block font-semibold text-muted-foreground text-xs uppercase mb-1">Kênh xác nhận:</label>
                <app-select
                  [options]="channelOptions"
                  [value]="acceptanceChannel"
                  (valueChange)="onChannelChange($event)"
                  placeholder="Chọn kênh xác nhận"
                />
              </div>
            </div>

            <div class="p-3 bg-surface-alt border border-line rounded space-y-2">
              <div class="flex items-center justify-between">
                <label class="block font-semibold text-foreground text-xs uppercase">
                  Mã OTP xác thực:
                </label>
                <button
                  type="button"
                  (click)="sendOtp()"
                  class="text-xs text-primary hover:underline font-semibold"
                >
                  {{ otpSent() ? 'Gửi lại OTP' : 'Gửi mã OTP qua SMS' }}
                </button>
              </div>
              <input
                type="text"
                maxlength="6"
                [(ngModel)]="otpCode"
                placeholder="Nhập 6 số OTP..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded tabular tabular-nums font-bold text-foreground text-sm tracking-widest focus:outline-none focus:border-primary"
              />
              @if (otpSent()) {
                <div class="text-xs text-muted-foreground">
                  Đã gửi yêu cầu mã xác thực tới {{ receiverPhone }}.
                </div>
              }
            </div>

            @if (order().paymentMethod === 'QR' && shippingFee > 0) {
              <div class="p-3 bg-surface-alt border border-line rounded space-y-2">
                <div class="font-semibold text-foreground text-xs uppercase">
                  Mã VietQR thu phụ phí giao hàng:
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-24 h-24 bg-white p-1 rounded border border-line shrink-0 flex items-center justify-center">
                    <img
                      [src]="vietQrUrl()"
                      alt="VietQR Phụ phí giao hàng"
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <div class="space-y-1 text-xs text-muted-foreground">
                    <div>Số tiền phụ phí: <strong class="text-primary tabular tabular-nums font-bold">{{ formatCurrency(shippingFee) }}</strong></div>
                    <div>Nội dung CK: <strong class="text-foreground font-bold tabular tabular-nums">AMEND {{ order().code }}</strong></div>
                    <div>Ngân hàng: <span class="text-foreground font-medium">MB Bank (0388234567)</span></div>
                  </div>
                </div>
              </div>
            }

            <div class="space-y-1">
              <label class="block font-semibold text-muted-foreground text-xs uppercase">
                Ghi chú người xác nhận / Mã tham chiếu:
              </label>
              <input
                type="text"
                [(ngModel)]="acceptedByValue"
                placeholder="Mã cuộc gọi hoặc thông tin xác nhận..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-semibold text-muted-foreground text-xs uppercase">Lý do điều chỉnh:</label>
              <textarea
                rows="2"
                [(ngModel)]="reason"
                placeholder="Lý do chuyển sang giao hàng tận nơi..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary"
              ></textarea>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-600 dark:text-rose-400 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-surface-alt hover:bg-surface border border-line rounded font-semibold text-sm text-foreground cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !isReadyToSubmit()"
              class="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Tạo Phụ Lục...' : 'Tạo Phụ Lục Giao Hàng' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PickupToDeliveryAmendmentDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly otpSent = signal<boolean>(false);

  receiverName = '';
  receiverPhone = '';
  deliveryAddress = '';
  shippingFee = 30000;
  acceptanceChannel: 'PHONE' | 'EMAIL' | 'IN_APP' = 'PHONE';
  acceptedByValue = '';
  otpCode = '';
  reason = 'Khách hàng yêu cầu chuyển sang giao hàng tận nơi';

  readonly channelOptions: SelectOption[] = [
    { value: 'PHONE', label: 'Điện thoại (Cuộc gọi xác nhận)' },
    { value: 'EMAIL', label: 'Email phản hồi' },
    { value: 'IN_APP', label: 'Ứng dụng khách hàng' },
  ];

  readonly vietQrUrl = computed<string>(() => {
    const amount = Number(this.shippingFee) || 0;
    const ref = encodeURIComponent(`AMEND ${this.order().code}`);
    return `https://img.vietqr.io/image/MB-0388234567-compact2.png?amount=${amount}&addInfo=${ref}&accountName=CONG%20TY%20EL%20TECH`;
  });

  constructor() {
    effect(() => {
      if (this.isOpen() && this.order()) {
        this.receiverName = this.order().receiverName;
        this.receiverPhone = this.order().receiverPhone;
        this.acceptedByValue = this.order().receiverPhone;
        this.otpCode = '';
        this.otpSent.set(false);
      }
    });
  }

  onChannelChange(val: string): void {
    if (val === 'PHONE' || val === 'EMAIL' || val === 'IN_APP') {
      this.acceptanceChannel = val;
    }
  }

  sendOtp(): void {
    this.otpSent.set(true);
  }

  isReadyToSubmit(): boolean {
    return (
      Boolean(this.deliveryAddress.trim()) &&
      Boolean(this.receiverName.trim()) &&
      Boolean(this.receiverPhone.trim()) &&
      this.shippingFee >= 0 &&
      Boolean(this.otpCode.trim())
    );
  }

  onClose(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.errorMessage.set(null);
    this.closed.emit();
  }

  async onSubmit(): Promise<void> {
    if (!this.isReadyToSubmit()) {
      this.errorMessage.set('Vui lòng điền đầy đủ địa chỉ giao hàng, thông tin người nhận và mã OTP xác nhận');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const otpNote = this.otpCode.trim() ? ` [OTP: ${this.otpCode.trim()}]` : '';
    const finalAcceptedBy = (this.acceptedByValue.trim() + otpNote).trim() || `OTP: ${this.otpCode.trim()}`;

    try {
      await this.detailService.pickupToDelivery(this.order().id, {
        receiverName: this.receiverName.trim(),
        receiverPhone: this.receiverPhone.trim(),
        deliveryAddress: this.deliveryAddress.trim(),
        shippingFee: Number(this.shippingFee),
        reason: this.reason.trim(),
        acceptanceChannel: this.acceptanceChannel,
        acceptedByValue: finalAcceptedBy,
      });

      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the tao phu luc giao hang';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + ' đ';
  }
}
