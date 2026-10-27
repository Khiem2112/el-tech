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
        <div data-modal-id="MOD-17" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-lg p-5 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-destructive uppercase text-sm tracking-wide">
                Hủy Đơn Hàng
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

          @if (isLoadingPreview()) {
            <div class="p-4 text-center bg-surface-alt border border-line rounded text-muted">
              Đang tính toán chính sách tiền cọc và tồn kho...
            </div>
          } @else if (preview(); as p) {
            @if (!p.canCancel) {
              <div class="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
                {{ p.blockReason || 'Đơn hàng không thể hủy trực tiếp ở trạng thái hiện tại.' }}
              </div>
            } @else {
              <div class="p-3 bg-surface-alt border border-line rounded space-y-1.5 text-xs">
                <div class="grid grid-cols-2 gap-2 text-muted">
                  <div>Mã đơn: <span class="font-mono text-foreground font-bold tabular-nums">{{ order().code }}</span></div>
                  <div>Khách hàng: <span class="text-foreground font-medium">{{ order().receiverName }}</span></div>
                  <div>Trạng thái: <span class="font-mono text-foreground">{{ order().status }}</span></div>
                  <div>Hoàn tiền dự kiến: <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">{{ formatCurrency(p.refundableAmount) }}</span></div>
                </div>
                <div class="pt-1.5 border-t border-line text-muted">
                  Giải phóng {{ p.reservedItemsCount }} linh kiện giữ chỗ kho.
                  @if (p.isDepositForfeited) {
                    <span class="text-destructive font-medium ml-1">Tiền cọc 10% bị tịch thu do đã qua bước soạn hàng.</span>
                  }
                </div>
              </div>
            }
          }

          <div class="space-y-1">
            <label class="block font-medium text-muted text-xs">
              Lý do hủy đơn:
            </label>
            <textarea
              rows="2"
              [(ngModel)]="reason"
              placeholder="Nhập lý do hủy chi tiết..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-destructive resize-none"
            ></textarea>
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
              class="px-4 py-2 bg-destructive hover:opacity-90 text-white font-semibold rounded text-xs transition-opacity cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Hủy Đơn...' : 'Xác Nhận Hủy Đơn' }}
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
