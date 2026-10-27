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
        <div data-modal-id="MOD-10" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-5 space-y-4 text-sm text-foreground">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Báo Sẵn Sàng Nhận Tại Shop
              </h3>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-surface hover:bg-surface-alt text-muted hover:text-foreground border border-line text-xs transition-colors cursor-pointer"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          <div class="p-3 bg-surface-alt border border-line rounded space-y-1.5 text-muted text-xs">
            <div class="flex justify-between">
              <span>Mã đơn hàng:</span>
              <span class="text-primary font-bold tabular tabular-nums">{{ order().code }}</span>
            </div>
            <div class="flex justify-between">
              <span>Người nhận hàng:</span>
              <span class="text-foreground font-medium">{{ order().receiverName }} (<span class="tabular tabular-nums">{{ order().receiverPhone }}</span>)</span>
            </div>
            <div class="flex justify-between">
              <span>Showroom:</span>
              <span class="text-foreground font-medium">{{ order().fulfillmentBranch.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>Địa chỉ showroom:</span>
              <span class="text-foreground text-right truncate max-w-[200px]">{{ order().fulfillmentBranch.address }}</span>
            </div>
            <div class="flex justify-between border-t border-line pt-1.5 mt-1.5">
              <span>Hạn lưu kho (14 ngày):</span>
              <span class="text-primary font-medium tabular tabular-nums">{{ pickupDeadlineText() }}</span>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block font-medium text-muted text-xs">Ghi chú gửi kèm thông báo:</label>
            <input
              type="text"
              [(ngModel)]="note"
              placeholder="Nhập ghi chú vị trí quầy nhận hoặc dặn dò khách..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary"
            />
          </div>

          @if (errorMessage()) {
            <div class="p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-medium text-sm text-foreground cursor-pointer disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded text-sm transition-opacity cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Gửi...' : 'Báo Khách Nhận Hàng' }}
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
