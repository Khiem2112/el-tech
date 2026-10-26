import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
  selector: 'app-prepare-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-08" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-5 sm:p-6 space-y-4 text-xs text-foreground">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Bắt Đầu Soạn Hàng Linh Kiện
              </h3>
              <p class="text-xs text-muted">
                Quy trình: Đã xác nhận sang Bắt đầu soạn hàng
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

          <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
            Chuyển đơn sang khâu soạn hàng thực tế tại kho. Từ thời điểm này trở đi, khách hàng không còn quyền tự hủy đơn trên giao diện người dùng (ORD-015). Nếu đơn hàng có tiền đặt cọc lắp ráp máy 10%, khoản cọc sẽ bị tịch thu nếu khách hàng yêu cầu hủy sau bước này.
          </div>

          <div class="p-3 bg-surface-alt border border-line rounded space-y-1.5 text-muted">
            <div class="flex justify-between">
              <span>Mã đơn hàng:</span>
              <span class="font-mono text-foreground font-bold">{{ order().code }}</span>
            </div>
            <div class="flex justify-between">
              <span>Khách hàng:</span>
              <span class="text-foreground">{{ order().customer.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>Kho thực hiện:</span>
              <span class="text-foreground">{{ order().fulfillmentBranch.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>Dạng đơn hàng:</span>
              <span class="font-semibold text-foreground">
                {{ order().hasAssembly ? 'Máy tính lắp ráp (Custom PC)' : 'Linh kiện bán lẻ' }}
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block font-semibold text-muted text-xs">Ghi chú phân công soạn kho (Tùy chọn):</label>
            <input
              type="text"
              [(ngModel)]="note"
              placeholder="Nhập tên nhân viên kho hoặc ghi chú gom hàng..."
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
              {{ isSubmitting() ? 'Đang Chuyển...' : 'Bắt Đầu Soạn Hàng' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PrepareDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  note = '';

  onClose(): void {
    if (!this.isSubmitting()) {
      this.closed.emit();
    }
  }

  async onSubmit(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.prepareOrder(this.order().id, this.note.trim() || undefined);
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the chuyen trang thai soan hang';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
