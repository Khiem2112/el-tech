import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminOrderDetail,
  AdminOrderDetailService,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-pickup-to-delivery-amendment-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs text-slate-200 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                Chuyển Sang Giao Hàng Tận Nơi (MOD-19)
              </h3>
              <p class="text-xs text-slate-400">
                Quy trình: Tạo phụ lục chuyển đổi hình thức nhận hàng (Nhận tại quầy &rarr; Giao tận nơi)
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-[#090d16] hover:bg-[#272f3d] text-slate-400 hover:text-white border border-[#272f3d] text-xs"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 text-xs leading-relaxed space-y-1">
            <div>Phụ lục sẽ cập nhật thông tin địa chỉ giao nhận mà không làm thay đổi snapshot giá ban đầu.</div>
            <div>
              @if (order().paymentMethod === 'COD') {
                Đối với đơn COD, phụ phí giao hàng sẽ tự động cộng vào số tiền COD cần thu khi giao.
              } @else {
                Đối với đơn QR/Online, hệ thống sẽ sinh mã QR phụ phí giao hàng riêng; kiện hàng chỉ được phép xuất kho sau khi phụ phí này đã thanh toán.
              }
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            <div class="space-y-1">
              <label class="block font-semibold text-slate-400 text-xs">
                Địa chỉ giao hàng chi tiết:
              </label>
              <input
                type="text"
                [(ngModel)]="deliveryAddress"
                placeholder="Số nhà, ngõ/đường, phường/xã, quận/huyện, tỉnh/thành..."
                class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 text-xs mb-1">Tên người nhận:</label>
                <input
                  type="text"
                  [(ngModel)]="receiverName"
                  class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 text-xs mb-1">Số điện thoại:</label>
                <input
                  type="text"
                  [(ngModel)]="receiverPhone"
                  class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded font-mono text-white text-xs focus:outline-none focus:border-[#76b900]"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-400 text-xs mb-1">
                  Biểu phí giao hàng áp dụng (VND):
                </label>
                <input
                  type="number"
                  [(ngModel)]="shippingFee"
                  class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded font-mono font-bold text-[#76b900] text-xs focus:outline-none focus:border-[#76b900]"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-400 text-xs mb-1">Kênh xác nhận khách:</label>
                <select
                  [(ngModel)]="acceptanceChannel"
                  class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                >
                  <option value="PHONE">Điện thoại (Cuộc gọi xác nhận)</option>
                  <option value="EMAIL">Email phản hồi</option>
                  <option value="IN_APP">Ứng dụng khách hàng</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="block font-semibold text-slate-400 text-xs">
                Mã xác thực hoặc người xác nhận:
              </label>
              <input
                type="text"
                [(ngModel)]="acceptedByValue"
                placeholder="Nhập mã xác thực cuộc gọi hoặc số điện thoại xác nhận..."
                class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-semibold text-slate-400 text-xs">Lý do điều chỉnh:</label>
              <textarea
                rows="2"
                [(ngModel)]="reason"
                placeholder="Khách hàng không tiện qua showroom, yêu cầu giao tận nơi..."
                class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
              ></textarea>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#272f3d]">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded font-semibold text-xs text-slate-300 cursor-pointer disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !isReadyToSubmit()"
              class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
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

  receiverName = '';
  receiverPhone = '';
  deliveryAddress = '';
  shippingFee = 30000;
  acceptanceChannel: 'PHONE' | 'EMAIL' | 'IN_APP' = 'PHONE';
  acceptedByValue = '';
  reason = 'Khách hàng yêu cầu chuyển sang giao hàng tận nơi';

  constructor() {
    effect(() => {
      if (this.isOpen() && this.order()) {
        this.receiverName = this.order().receiverName;
        this.receiverPhone = this.order().receiverPhone;
        this.acceptedByValue = this.order().receiverPhone;
      }
    });
  }

  isReadyToSubmit(): boolean {
    return (
      Boolean(this.deliveryAddress.trim()) &&
      Boolean(this.receiverName.trim()) &&
      Boolean(this.receiverPhone.trim()) &&
      this.shippingFee >= 0
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
      this.errorMessage.set('Vui lòng điền đầy đủ địa chỉ giao hàng và thông tin người nhận');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.pickupToDelivery(this.order().id, {
        receiverName: this.receiverName.trim(),
        receiverPhone: this.receiverPhone.trim(),
        deliveryAddress: this.deliveryAddress.trim(),
        shippingFee: Number(this.shippingFee),
        reason: this.reason.trim(),
        acceptanceChannel: this.acceptanceChannel,
        acceptedByValue: this.acceptedByValue.trim() || undefined,
      });

      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the tao phu luc giao hang';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
