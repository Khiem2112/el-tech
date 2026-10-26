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
  selector: 'app-delivery-failed-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-12" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-5 sm:p-6 space-y-4 text-xs text-foreground flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Ghi Nhận Giao Hàng Thất Bại
              </h3>
              <p class="text-xs text-muted">
                Quy trình: Đang giao hàng sang Ghi nhận giao thất bại
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-surface hover:bg-surface-alt text-muted hover:text-foreground border border-line text-xs transition-colors"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
            Tuyệt đối không khôi phục tồn kho hay sinh phiếu đảo ngược kho tại bước này vì hàng hóa vẫn đang nằm trên tay nhân viên giao nhận hoặc đơn vị vận chuyển (ORD-024, INV-022).
          </div>

          <div class="space-y-3">
            <div>
              <label class="block font-semibold text-muted text-xs uppercase mb-1">
                Lý do giao hàng thất bại
              </label>
              <select
                [(ngModel)]="selectedReason"
                class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Khách hàng không bắt máy sau 3 cuộc gọi">
                  Khách hàng không bắt máy sau 3 cuộc gọi
                </option>
                <option value="Sai thông tin địa chỉ hoặc số điện thoại người nhận">
                  Sai thông tin địa chỉ hoặc số điện thoại người nhận
                </option>
                <option value="Khách hàng từ chối nhận hàng tại thời điểm giao">
                  Khách hàng từ chối nhận hàng tại thời điểm giao
                </option>
                <option value="Khách bận, xin hẹn lại ngày giao khác">
                  Khách bận, xin hẹn lại ngày giao khác
                </option>
                <option value="CUSTOM">
                  Lý do khác (nhập mô tả bên dưới)
                </option>
              </select>
            </div>

            @if (selectedReason === 'CUSTOM') {
              <div>
                <label class="block font-semibold text-muted text-xs uppercase mb-1">
                  Nhập lý do cụ thể
                </label>
                <input
                  type="text"
                  [(ngModel)]="customReason"
                  placeholder="Mô tả lý do giao thất bại..."
                  class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
                />
              </div>
            }

            <div>
              <label class="block font-semibold text-muted text-xs uppercase mb-1">
                Ghi chú chi tiết từ shipper / hãng vận chuyển (Tùy chọn)
              </label>
              <textarea
                [(ngModel)]="note"
                rows="2"
                placeholder="Ghi chú thời gian gọi, phản hồi của khách, mã đối soát shipper..."
                class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary resize-none"
              ></textarea>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded text-rose-700 dark:text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground font-semibold text-xs rounded transition-colors disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !effectiveReason()"
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              @if (isSubmitting()) {
                <span>Đang ghi nhận...</span>
              } @else {
                <span>Ghi Nhận Thất Bại</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DeliveryFailedDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input.required<boolean>();

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  selectedReason = 'Khách hàng không bắt máy sau 3 cuộc gọi';
  customReason = '';
  note = '';

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.selectedReason = 'Khách hàng không bắt máy sau 3 cuộc gọi';
        this.customReason = '';
        this.note = '';
        this.errorMessage.set(null);
      }
    });
  }

  effectiveReason(): string {
    if (this.selectedReason === 'CUSTOM') {
      return this.customReason.trim();
    }
    return this.selectedReason;
  }

  onClose(): void {
    if (!this.isSubmitting()) {
      this.closed.emit();
    }
  }

  async onSubmit(): Promise<void> {
    const reason = this.effectiveReason();
    if (!reason) {
      this.errorMessage.set('Vui lòng chọn hoặc nhập lý do giao hàng không thành công.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.deliveryFailed(this.order().id, {
        reason,
        note: this.note.trim() || undefined,
      });
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the ghi nhan giao hang that bai';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}