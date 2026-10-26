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
        <div data-modal-id="MOD-21" class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Xác Nhận Đã Hoàn Tiền Thủ Công
              </h3>
              <p class="text-xs text-muted-foreground">
                Ghi nhận mã chuẩn chi ngân hàng và cập nhật trạng thái đơn sang REFUNDED
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-surface-alt hover:bg-surface text-muted-foreground hover:text-foreground border border-line text-xs"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          @if (pendingRefund(); as r) {
            <div class="p-3 bg-surface-alt border border-line rounded space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Khách hàng nhận:</span>
                <strong class="text-foreground">{{ order().receiverName }} ({{ order().receiverPhone }})</strong>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Số tiền cần hoàn:</span>
                <strong class="font-mono text-rose-600 dark:text-rose-400 font-bold text-sm">
                  {{ formatCurrency(r.amount) }}
                </strong>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-muted-foreground">Lý do hoàn tiền:</span>
                <span class="text-foreground truncate max-w-[200px]" [title]="r.reason">{{ r.reason }}</span>
              </div>
            </div>
          } @else {
            <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-800 dark:text-amber-300 text-xs">
              Cảnh báo: Hiện không tìm thấy bản ghi hoàn tiền nào ở trạng thái chờ (PENDING) cho đơn này.
            </div>
          }

          <div class="space-y-3">
            <div class="space-y-1">
              <label class="block font-semibold text-muted-foreground text-xs uppercase">
                Mã giao dịch chuyển khoản ngân hàng (Bắt buộc):
              </label>
              <input
                type="text"
                [(ngModel)]="transactionReference"
                placeholder="FT261022881902..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded font-mono text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-semibold text-muted-foreground text-xs uppercase">
                Ngân hàng thực hiện chuyển tiền:
              </label>
              <input
                type="text"
                [(ngModel)]="bankName"
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-semibold text-muted-foreground text-xs uppercase">
                Thời điểm chuyển khoản:
              </label>
              <input
                type="datetime-local"
                [(ngModel)]="transferredAt"
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-semibold text-muted-foreground text-xs uppercase">
                Ghi chú đối soát bổ sung (Tùy chọn):
              </label>
              <textarea
                rows="2"
                [(ngModel)]="note"
                placeholder="Nhập thêm ghi chú chứng từ hoặc biên nhận đính kèm..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
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
              class="px-4 py-2 bg-surface-alt hover:bg-surface border border-line rounded font-semibold text-xs text-foreground cursor-pointer disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !isReadyToSubmit()"
              class="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Xác Nhận...' : 'Xác Nhận Đã Chuyển Tiền' }}
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
