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
  CancellationPreview,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-cancel-order-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-17" class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-rose-600 dark:text-rose-400 uppercase text-sm tracking-wide">
                Hủy Đơn Hàng
              </h3>
              <p class="text-xs text-muted-foreground">
                Quy trình: Hủy bỏ đơn hàng, giải phóng tồn kho và quyết toán tiền cọc
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

          @if (isLoadingPreview()) {
            <div class="p-6 text-center bg-surface-alt border border-line rounded text-muted-foreground">
              Đang tính toán chính sách tiền cọc và tồn kho...
            </div>
          } @else if (preview(); as p) {
            @if (!p.canCancel) {
              <div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-600 dark:text-rose-300 text-xs">
                {{ p.blockReason || 'Đơn hàng không thể hủy trực tiếp ở trạng thái hiện tại.' }}
              </div>
            } @else {
              <div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-700 dark:text-rose-300 text-xs space-y-1.5 leading-relaxed">
                <div class="font-bold uppercase tracking-wider text-xs">Hệ quả tài chính và kho vận khi hủy:</div>
                <div>- Tự động giải phóng {{ p.reservedItemsCount }} linh kiện đang giữ chỗ kho và hoàn lại hạn mức sử dụng coupon (nếu có).</div>
                @if (p.isDepositForfeited) {
                  <div class="font-semibold text-rose-800 dark:text-rose-200">
                    - Đơn hàng PC ráp theo yêu cầu đã qua bước soạn hàng: Tiền cọc 10% ({{ formatCurrency(p.depositRequired) }}) bị tịch thu bồi thường chi phí kỹ thuật (FORFEITED).
                  </div>
                  @if (Number(p.refundableAmount) > 0) {
                    <div>
                      - Số tiền thanh toán dư sau khi trừ tiền cọc: <strong class="text-foreground font-mono">{{ formatCurrency(p.refundableAmount) }}</strong> sẽ chuyển sang trạng thái chờ hoàn tiền (REFUND_PENDING).
                    </div>
                  }
                } @else {
                  @if (Number(p.refundableAmount) > 0) {
                    <div>
                      - Toàn bộ số tiền đã thanh toán trước ({{ formatCurrency(p.refundableAmount) }}) sẽ được chuyển sang hàng đợi chờ hoàn tiền (REFUND_PENDING).
                    </div>
                  } @else {
                    <div>- Đơn hàng chưa phát sinh giao dịch thanh toán hoặc tiền cọc cần xử lý.</div>
                  }
                }
              </div>

              <div class="p-3 bg-surface-alt border border-line rounded space-y-1.5">
                <div class="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>Mã đơn: <span class="font-mono text-foreground font-bold">{{ order().code }}</span></div>
                  <div>Khách hàng: <span class="text-foreground">{{ order().receiverName }}</span></div>
                  <div>Trạng thái hiện tại: <span class="text-amber-600 dark:text-amber-400 font-mono">{{ order().status }}</span></div>
                  <div>Hoàn tiền dự kiến: <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{{ formatCurrency(p.refundableAmount) }}</span></div>
                </div>
              </div>
            }
          }

          <div class="space-y-1">
            <label class="block font-semibold text-muted-foreground text-xs">
              Lý do hủy đơn bắt buộc:
            </label>
            <textarea
              rows="3"
              [(ngModel)]="reason"
              placeholder="Nhập lý do hủy chi tiết để phục vụ đối soát, thống kê và thông báo tới khách hàng..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-rose-500"
            ></textarea>
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
              Đóng
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !isReadyToSubmit()"
              class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Hủy Đơn...' : 'Xác Nhận Hủy Đơn Hàng' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CancelOrderDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly preview = signal<CancellationPreview | null>(null);
  readonly isLoadingPreview = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  reason = '';

  constructor() {
    effect(() => {
      if (this.isOpen() && this.order()) {
        this.loadPreview();
      }
    });
  }

  async loadPreview(): Promise<void> {
    this.isLoadingPreview.set(true);
    this.errorMessage.set(null);

    const res = await this.detailService.getCancellationPreview(this.order().id);
    this.preview.set(res);
    this.isLoadingPreview.set(false);
  }

  isReadyToSubmit(): boolean {
    if (!this.reason.trim()) {
      return false;
    }
    if (this.preview() && !this.preview()?.canCancel) {
      return false;
    }
    return true;
  }

  onClose(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.errorMessage.set(null);
    this.reason = '';
    this.closed.emit();
  }

  async onSubmit(): Promise<void> {
    if (!this.reason.trim()) {
      this.errorMessage.set('Vui lòng nhập lý do hủy đơn bắt buộc');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.cancelOrder(this.order().id, {
        reason: this.reason.trim(),
      });

      this.reason = '';
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the huy don hang';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  Number(val: string | number): number {
    return Number(val || 0);
  }

  formatCurrency(value: string | number): string {
    const num = Number(value || 0);
    return num.toLocaleString('vi-VN') + ' ₫';
  }
}
