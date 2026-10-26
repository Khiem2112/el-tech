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
        <div data-modal-id="MOD-13" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-5 sm:p-6 space-y-4 text-xs text-foreground flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Lên Lịch Hẹn Giao Lại
              </h3>
              <p class="text-xs text-muted">
                Quy trình: Giao thất bại sang Thiết lập lịch hẹn giao lại
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

          @if (isLimitExceeded()) {
            <div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-700 dark:text-rose-300 text-xs space-y-1">
              <div class="font-bold uppercase tracking-wider text-rose-800 dark:text-rose-200">
                Chặn hẹn giao lại: Đã chạm giới hạn (ORD-024)
              </div>
              <p class="leading-relaxed">
                Đơn hàng đã chạm mốc 2 lần giao lại thất bại (Hiện tại: {{ order().redeliveryAttemptCount }}/2). Hệ thống không cho phép lên lịch giao tiếp, nhân viên bắt buộc phải kích hoạt luồng Chuyển hoàn về kho.
              </p>
            </div>
          } @else {
            <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
              Kiểm tra số lần giao lại hiện tại phải nhỏ hơn 2 (tối đa 2 lần). Khi xác nhận, số lần đếm tự động tăng thêm 1 và đơn hàng sẽ quay lại trạng thái Đang Giao Hàng (SHIPPING).
            </div>
          }

          <div class="p-3 bg-surface-alt border border-line rounded flex items-center justify-between">
            <span class="text-muted">Số lần đã giao lại thất bại:</span>
            <span
              class="font-mono font-bold px-2 py-0.5 rounded text-xs"
              [class.bg-amber-50]="order().redeliveryAttemptCount < 2"
              [class.text-amber-700]="order().redeliveryAttemptCount < 2"
              [class.dark:bg-amber-950/60]="order().redeliveryAttemptCount < 2"
              [class.dark:text-amber-300]="order().redeliveryAttemptCount < 2"
              [class.bg-rose-50]="order().redeliveryAttemptCount >= 2"
              [class.text-rose-700]="order().redeliveryAttemptCount >= 2"
              [class.dark:bg-rose-950/60]="order().redeliveryAttemptCount >= 2"
              [class.dark:text-rose-300]="order().redeliveryAttemptCount >= 2"
            >
              {{ order().redeliveryAttemptCount }} / 2 lần
            </span>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block font-semibold text-muted text-xs uppercase mb-1">
                Ngày hẹn giao lại
              </label>
              <input
                type="date"
                [(ngModel)]="redeliveryDate"
                [disabled]="isLimitExceeded()"
                class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label class="block font-semibold text-muted text-xs uppercase mb-1">
                Ghi chú hẹn khách (Lộ trình, thời gian cụ thể)
              </label>
              <input
                type="text"
                [(ngModel)]="note"
                [disabled]="isLimitExceeded()"
                placeholder="Khách hẹn giao sau 18h tối, gọi trước khi đến..."
                class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary disabled:opacity-50"
              />
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
              [disabled]="isSubmitting() || isLimitExceeded() || !redeliveryDate"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs rounded transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              @if (isSubmitting()) {
                <span>Đang lưu lịch hẹn...</span>
              } @else {
                <span>Xác Nhận Giao Lại (Lần {{ order().redeliveryAttemptCount + 1 }})</span>
              }
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