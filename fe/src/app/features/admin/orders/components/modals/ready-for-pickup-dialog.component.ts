import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  selector: 'app-ready-for-pickup-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-10" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-5 sm:p-6 space-y-4 text-xs text-foreground">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Báo Sẵn Sàng Nhận Tại Shop
              </h3>
              <p class="text-xs text-muted">
                Quy trình: Đang chuẩn bị sang Sẵn sàng nhận tại showroom
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
            Áp dụng cho đơn nhận tại quầy. Hệ thống sẽ gửi thông báo transactional tự động (SMS, Email, In-app) mời khách đến nhận máy và bắt đầu kích hoạt đồng hồ đếm lùi thời hạn lưu kho 14 ngày.
          </div>

          <div class="p-3 bg-surface-alt border border-line rounded space-y-1.5 text-muted">
            <div class="flex justify-between">
              <span>Mã đơn hàng:</span>
              <span class="font-mono text-foreground font-bold">{{ order().code }}</span>
            </div>
            <div class="flex justify-between">
              <span>Người nhận hàng:</span>
              <span class="text-foreground">{{ order().receiverName }} ({{ order().receiverPhone }})</span>
            </div>
            <div class="flex justify-between">
              <span>Showroom tiếp nhận:</span>
              <span class="text-foreground font-semibold">{{ order().fulfillmentBranch.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>Địa chỉ showroom:</span>
              <span class="text-foreground text-right truncate max-w-[200px]">{{ order().fulfillmentBranch.address }}</span>
            </div>
            <div class="flex justify-between border-t border-line pt-1.5 mt-1.5">
              <span>Hạn chót giữ hàng (14 ngày):</span>
              <span class="font-mono text-primary font-bold">{{ pickupDeadlineText() }}</span>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block font-semibold text-muted text-xs">Ghi chú gửi kèm thông báo (Tùy chọn):</label>
            <input
              type="text"
              [(ngModel)]="note"
              placeholder="Nhập ghi chú vị trí quầy nhận hoặc dặn dò khách..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
            />
          </div>

          @if (errorMessage()) {
            <div class="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-700 dark:text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-semibold text-xs text-foreground cursor-pointer disabled:opacity-50 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded text-xs transition-opacity cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Phát Thông Báo...' : 'Báo Khách Nhận Hàng' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ReadyForPickupDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  note = '';

  readonly pickupDeadlineText = computed<string>(() => {
    const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  });

  onClose(): void {
    if (!this.isSubmitting()) {
      this.closed.emit();
    }
  }

  async onSubmit(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.readyForPickup(this.order().id, this.note.trim() || undefined);
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the bao san sang nhan hang';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
