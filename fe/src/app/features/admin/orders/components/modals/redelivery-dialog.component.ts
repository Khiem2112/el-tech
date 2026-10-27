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
  AdminOrderDetail,
  AdminOrderDetailService,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-redelivery-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-13" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-5 space-y-4 text-xs text-foreground flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Lên Lịch Hẹn Giao Lại
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

          @if (isLimitExceeded()) {
            <div class="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs space-y-1">
              <div class="font-semibold uppercase tracking-wider text-xs">
                Chặn hẹn giao lại: Đã chạm giới hạn 2 lần
              </div>
              <p>
                Đơn hàng đã chạm mốc 2 lần giao lại thất bại. Bắt buộc kích hoạt luồng chuyển hoàn về kho.
              </p>
            </div>
          }

          <div class="p-3 bg-surface-alt border border-line rounded flex items-center justify-between">
            <span class="text-muted">Số lần đã giao thất bại:</span>
            <span
              class="font-mono font-medium px-2 py-0.5 rounded text-xs tabular-nums"
              [class.bg-surface]="order().redeliveryAttemptCount < 2"
              [class.text-foreground]="order().redeliveryAttemptCount < 2"
              [class.bg-destructive/10]="order().redeliveryAttemptCount >= 2"
              [class.text-destructive]="order().redeliveryAttemptCount >= 2"
            >
              {{ order().redeliveryAttemptCount }} / 2 lần
            </span>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block font-medium text-muted text-xs mb-1">
                Ngày hẹn giao lại:
              </label>
              <input
                type="date"
                [(ngModel)]="redeliveryDate"
                [disabled]="isLimitExceeded()"
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label class="block font-medium text-muted text-xs mb-1">
                Ghi chú hẹn khách:
              </label>
              <input
                type="text"
                [(ngModel)]="note"
                [disabled]="isLimitExceeded()"
                placeholder="Khách hẹn giao sau 18h tối, gọi trước khi đến..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary disabled:opacity-50"
              />
            </div>
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
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground font-medium text-xs rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || isLimitExceeded() || !redeliveryDate"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs rounded transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ isSubmitting() ? 'Đang Lưu...' : 'Xác Nhận Giao Lại (Lần ' + (order().redeliveryAttemptCount + 1) + ')' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class RedeliveryDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input.required<boolean>();

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  redeliveryDate = '';
  note = '';

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isLimitExceeded = computed<boolean>(() => {
    return this.order().redeliveryAttemptCount >= 2;
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        this.redeliveryDate = tomorrow.toISOString().split('T')[0];
        this.note = '';
        this.errorMessage.set(null);
      }
    });
  }

  onClose(): void {
    if (!this.isSubmitting()) {
      this.closed.emit();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isLimitExceeded()) {
      this.errorMessage.set('Đã chạm mốc 2 lần giao lại thất bại. Vui lòng chuyển hoàn về kho.');
      return;
    }

    if (!this.redeliveryDate) {
      this.errorMessage.set('Vui lòng chọn ngày hẹn giao lại.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.scheduleRedelivery(this.order().id, {
        redeliveryDate: this.redeliveryDate,
        note: this.note.trim() || undefined,
      });
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the len lich hen giao lai';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}