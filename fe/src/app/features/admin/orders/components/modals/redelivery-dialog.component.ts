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
        <div class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 text-xs text-slate-200 flex flex-col">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                Lên Lịch Hẹn Giao Lại (MOD-13)
              </h3>
              <p class="text-xs text-slate-400">
                Quy trình: Giao thất bại sang Thiết lập lịch hẹn giao lại
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

          @if (isLimitExceeded()) {
            <div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs space-y-1">
              <div class="font-bold uppercase tracking-wider text-rose-200">
                Chặn hẹn giao lại: Đã chạm giới hạn (ORD-024)
              </div>
              <p class="leading-relaxed">
                Đơn hàng đã chạm mốc 2 lần giao lại thất bại (Hiện tại: {{ order().redeliveryAttemptCount }}/2). Hệ thống không cho phép lên lịch giao tiếp, nhân viên bắt buộc phải kích hoạt luồng Chuyển hoàn về kho (MOD-14).
              </p>
            </div>
          } @else {
            <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 text-xs leading-relaxed">
              Kiểm tra số lần giao lại hiện tại phải nhỏ hơn 2 (tối đa 2 lần). Khi xác nhận, số lần đếm tự động tăng thêm 1 và đơn hàng sẽ quay lại trạng thái Đang Giao Hàng (SHIPPING).
            </div>
          }

          <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded flex items-center justify-between">
            <span class="text-slate-400">Số lần đã giao lại thất bại:</span>
            <span
              class="font-mono font-bold px-2 py-0.5 rounded text-xs"
              [class.bg-amber-500/20]="order().redeliveryAttemptCount < 2"
              [class.text-amber-300]="order().redeliveryAttemptCount < 2"
              [class.bg-rose-500/20]="order().redeliveryAttemptCount >= 2"
              [class.text-rose-300]="order().redeliveryAttemptCount >= 2"
            >
              {{ order().redeliveryAttemptCount }} / 2 lần
            </span>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                Ngày hẹn giao lại
              </label>
              <input
                type="date"
                [(ngModel)]="redeliveryDate"
                [disabled]="isLimitExceeded()"
                class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900] disabled:opacity-50"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                Ghi chú hẹn khách (Lộ trình, thời gian cụ thể)
              </label>
              <input
                type="text"
                [(ngModel)]="note"
                [disabled]="isLimitExceeded()"
                placeholder="Khách hẹn giao sau 18h tối, gọi trước khi đến..."
                class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900] disabled:opacity-50"
              />
            </div>
          </div>

          @if (errorMessage()) {
            <div class="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#272f3d]">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold text-xs rounded transition-colors disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || isLimitExceeded() || !redeliveryDate"
              class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
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