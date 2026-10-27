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
  selector: 'app-manual-refund-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-21" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-5 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Xác Nhận Đã Hoàn Tiền
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

          @if (pendingRefund(); as r) {
            <div class="p-3 bg-surface-alt border border-line rounded space-y-1.5 text-xs">
              <div class="flex justify-between items-center">
                <span class="text-muted">Người nhận:</span>
                <strong class="text-foreground">{{ order().receiverName }} (<span class="font-mono tabular-nums">{{ order().receiverPhone }}</span>)</strong>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted">Số tiền hoàn:</span>
                <strong class="font-mono text-foreground font-bold text-sm tabular-nums">
                  {{ formatCurrency(r.amount) }}
                </strong>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-muted">Lý do hoàn:</span>
                <span class="text-foreground truncate max-w-[200px]" [title]="r.reason">{{ r.reason }}</span>
              </div>
            </div>
          } @else {
            <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-700 dark:text-amber-300 text-xs">
              Không tìm thấy bản ghi hoàn tiền ở trạng thái chờ cho đơn này.
            </div>
          }

          <div class="space-y-2.5">
            <div class="space-y-1">
              <label class="block font-medium text-muted text-xs">
                Mã giao dịch ngân hàng:
              </label>
              <input
                type="text"
                [(ngModel)]="transactionReference"
                placeholder="Nhập mã tham chiếu chuyển khoản..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded font-mono text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-medium text-muted text-xs">
                Tài khoản ngân hàng gửi:
              </label>
              <input
                type="text"
                [(ngModel)]="bankName"
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-medium text-muted text-xs">
                Thời điểm chuyển tiền:
              </label>
              <input
                type="datetime-local"
                [(ngModel)]="transferredAt"
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary font-mono tabular-nums"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-medium text-muted text-xs">
                Ghi chú đối soát (Tùy chọn):
              </label>
              <textarea
                rows="2"
                [(ngModel)]="note"
                placeholder="Nhập ghi chú hoặc số biên nhận..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary resize-none"
              ></textarea>
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
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-medium text-xs text-foreground cursor-pointer disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !isReadyToSubmit()"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded text-xs transition-opacity cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Lưu...' : 'Xác Nhận Đã Chuyển Tiền' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ManualRefundDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  transactionReference = '';
  bankName = 'Techcombank (Tài khoản công ty EL-TECH)';
  transferredAt = new Date().toISOString().slice(0, 16);
  note = '';

  readonly pendingRefund = computed(() => {
    return this.order().payment?.refunds.find((r) => r.status === 'PENDING') || null;
  });

  isReadyToSubmit(): boolean {
    return Boolean(this.transactionReference.trim()) && Boolean(this.pendingRefund());
  }

  onClose(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.errorMessage.set(null);
    this.transactionReference = '';
    this.note = '';
    this.closed.emit();
  }

  async onSubmit(): Promise<void> {
    const refund = this.pendingRefund();
    if (!refund) {
      this.errorMessage.set('Không có bản ghi hoàn tiền nào đang chờ xử lý');
      return;
    }

    if (!this.transactionReference.trim()) {
      this.errorMessage.set('Vui lòng nhập mã giao dịch chuyển khoản ngân hàng');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.processManualRefund(refund.id, {
        transactionReference: this.transactionReference.trim(),
        bankName: this.bankName.trim() || undefined,
        transferredAt: this.transferredAt ? new Date(this.transferredAt).toISOString() : undefined,
        note: this.note.trim() || undefined,
      });

      this.transactionReference = '';
      this.note = '';
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the xac nhan hoan tien thu cong';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  formatCurrency(value: string | number): string {
    const num = Number(value || 0);
    return num.toLocaleString('vi-VN') + ' đ';
  }
}
