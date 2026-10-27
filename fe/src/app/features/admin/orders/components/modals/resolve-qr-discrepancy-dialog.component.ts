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
  QrDiscrepancyDetail,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-resolve-qr-discrepancy-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-20" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-lg p-5 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-destructive uppercase text-sm tracking-wide">
                Đối Soát Lệch VietQR
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

          @if (isLoadingDetail()) {
            <div class="p-4 text-center bg-surface-alt border border-line rounded text-muted">
              Đang tải dữ liệu giao dịch webhook và tài khoản ngân hàng...
            </div>
          } @else if (discrepancy(); as d) {
            <div class="p-3 bg-surface-alt border border-line rounded space-y-1.5 text-xs">
              <div class="flex justify-between items-center">
                <span class="text-muted">Đơn hàng yêu cầu:</span>
                <strong class="font-mono text-foreground tabular-nums">{{ formatCurrency(d.expectedAmount) }}</strong>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted">Thực nhận ngân hàng:</span>
                <strong class="font-mono text-foreground font-bold tabular-nums">{{ formatCurrency(d.receivedAmount) }}</strong>
              </div>
              <div class="flex justify-between items-center pt-1 border-t border-line">
                <span class="text-muted">Chênh lệch:</span>
                <strong
                  class="font-mono font-semibold tabular-nums"
                  [class.text-destructive]="d.isUnderpaid"
                  [class.text-emerald-600]="d.isExactMatch"
                  [class.dark:text-emerald-400]="d.isExactMatch"
                  [class.text-amber-700]="d.isOverpaid"
                  [class.dark:text-amber-400]="d.isOverpaid"
                >
                  {{ formatCurrency(d.differenceAmount) }}
                  @if (d.isUnderpaid) { (Chuyển thiếu) }
                  @else if (d.isOverpaid) { (Chuyển thừa) }
                  @else { (Khớp số tiền) }
                </strong>
              </div>
              @if (d.providerReference) {
                <div class="text-[11px] text-muted pt-0.5 font-mono">
                  Mã GD: {{ d.providerReference }}
                </div>
              }
            </div>

            <div class="space-y-2">
              <label class="block font-medium text-muted text-xs">Phương án xử lý:</label>
              <div class="space-y-2">
                <label
                  class="flex items-start gap-2.5 p-2.5 rounded border transition-colors"
                  [class.bg-surface-alt]="d.isExactMatch"
                  [class.border-primary]="selectedResolution === 'MANUAL_MATCH'"
                  [class.border-line]="selectedResolution !== 'MANUAL_MATCH'"
                  [class.cursor-pointer]="d.isExactMatch"
                  [class.opacity-50]="!d.isExactMatch"
                  [class.cursor-not-allowed]="!d.isExactMatch"
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="MANUAL_MATCH"
                    [(ngModel)]="selectedResolution"
                    [disabled]="!d.isExactMatch"
                    class="mt-0.5 text-primary"
                  />
                  <div>
                    <div class="font-medium text-foreground">
                      Khớp thủ công (Xác nhận đơn CONFIRMED)
                    </div>
                    <div class="text-[11px] text-muted mt-0.5">
                      Áp dụng khi ngân hàng đã thực nhận đủ 100%, bỏ qua lỗi cú pháp nội dung.
                    </div>
                  </div>
                </label>

                <label
                  class="flex items-start gap-2.5 p-2.5 rounded border transition-colors bg-surface-alt cursor-pointer"
                  [class.border-destructive]="selectedResolution === 'CANCEL_REFUND'"
                  [class.border-line]="selectedResolution !== 'CANCEL_REFUND'"
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="CANCEL_REFUND"
                    [(ngModel)]="selectedResolution"
                    class="mt-0.5 text-destructive"
                  />
                  <div>
                    <div class="font-medium text-destructive">
                      Hủy đơn & Hoàn trả số tiền thực nhận (REFUND_PENDING)
                    </div>
                    <div class="text-[11px] text-muted mt-0.5">
                      Hủy đơn {{ order().code }}, giải phóng tồn kho và chuyển {{ formatCurrency(d.receivedAmount) }} vào hàng đợi hoàn tiền.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          }

          <div class="space-y-1">
            <label class="block font-medium text-muted text-xs">
              Ghi chú đối soát:
            </label>
            <textarea
              rows="2"
              [(ngModel)]="note"
              placeholder="Nhập mã chuẩn chi hoặc lý do xử lý đối soát..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary resize-none"
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
              [disabled]="isSubmitting() || !note.trim()"
              class="px-4 py-2 bg-destructive hover:opacity-90 text-white font-semibold rounded text-xs transition-opacity cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Xử Lý...' : 'Xác Nhận Đối Soát' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ResolveQrDiscrepancyDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly discrepancy = signal<QrDiscrepancyDetail | null>(null);
  readonly isLoadingDetail = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  selectedResolution: 'MANUAL_MATCH' | 'CANCEL_REFUND' = 'CANCEL_REFUND';
  note = '';

  constructor() {
    effect(() => {
      if (this.isOpen() && this.order()) {
        this.loadDiscrepancy();
      }
    });
  }

  async loadDiscrepancy(): Promise<void> {
    this.isLoadingDetail.set(true);
    this.errorMessage.set(null);

    const data = await this.detailService.getQrDiscrepancy(this.order().id);
    this.discrepancy.set(data);
    if (data?.isExactMatch) {
      this.selectedResolution = 'MANUAL_MATCH';
    } else {
      this.selectedResolution = 'CANCEL_REFUND';
    }
    this.isLoadingDetail.set(false);
  }

  onClose(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.errorMessage.set(null);
    this.note = '';
    this.closed.emit();
  }

  async onSubmit(): Promise<void> {
    if (!this.note.trim()) {
      this.errorMessage.set('Vui lòng nhập ghi chú đối soát kiểm toán bắt buộc');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.resolveQrDiscrepancy(this.order().id, {
        resolutionType: this.selectedResolution,
        note: this.note.trim(),
        transactionReference: this.discrepancy()?.providerTransactionId,
      });

      this.note = '';
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the xu ly doi soat VietQR';
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
