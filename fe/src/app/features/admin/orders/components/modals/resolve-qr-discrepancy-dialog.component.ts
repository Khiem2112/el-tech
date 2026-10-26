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
        <div data-modal-id="MOD-20" class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-rose-600 dark:text-rose-400 uppercase text-sm tracking-wide">
                Đối Soát Giao Dịch Lệch VietQR
              </h3>
              <p class="text-xs text-muted-foreground">
                Tuân thủ quy định: Tuyệt đối không chấp nhận nộp thêm tiền mặt đối với đơn thanh toán trực tuyến
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

          <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-800 dark:text-amber-300 text-xs leading-relaxed space-y-1">
            <div class="font-bold uppercase tracking-wider text-xs">Quy tắc đối soát thanh toán trực tuyến:</div>
            <div>- Hệ thống không hỗ trợ thu tiền mặt bổ sung cho đơn đặt online và không cho phép chuyển bù nhiều lần.</div>
            <div>- "Khớp thủ công" chỉ hợp lệ khi tài khoản ngân hàng đã thực nhận đủ 100% nhưng sai cú pháp mã tham chiếu.</div>
            <div>- Trường hợp chuyển thiếu tiền hoặc hết hạn 24 giờ đối soát: Bắt buộc hủy đơn và hoàn trả 100% số tiền thực nhận sang hàng đợi REFUND_PENDING.</div>
          </div>

          @if (isLoadingDetail()) {
            <div class="p-6 text-center bg-surface-alt border border-line rounded text-muted-foreground">
              Đang tải dữ liệu giao dịch webhook và tài khoản ngân hàng...
            </div>
          } @else if (discrepancy(); as d) {
            <div class="p-3 bg-surface-alt border border-line rounded space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Số tiền đơn hàng yêu cầu:</span>
                <strong class="font-mono text-foreground text-sm">{{ formatCurrency(d.expectedAmount) }}</strong>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Số tiền thực nhận từ ngân hàng:</span>
                <strong class="font-mono text-rose-600 dark:text-rose-400 text-sm">{{ formatCurrency(d.receivedAmount) }}</strong>
              </div>
              <div class="flex justify-between items-center pt-1 border-t border-line">
                <span class="text-muted-foreground">Chênh lệch phát hiện:</span>
                <strong
                  class="font-mono font-bold"
                  [class.text-rose-600]="d.isUnderpaid"
                  [class.dark:text-rose-400]="d.isUnderpaid"
                  [class.text-emerald-600]="d.isExactMatch"
                  [class.dark:text-emerald-400]="d.isExactMatch"
                  [class.text-amber-600]="d.isOverpaid"
                  [class.dark:text-amber-400]="d.isOverpaid"
                >
                  {{ formatCurrency(d.differenceAmount) }}
                  @if (d.isUnderpaid) { (Chuyển thiếu tiền) }
                  @else if (d.isOverpaid) { (Chuyển thừa tiền) }
                  @else { (Khớp 100% số tiền) }
                </strong>
              </div>
              @if (d.providerReference) {
                <div class="text-xs text-muted-foreground">
                  Mã tham chiếu: <span class="font-mono text-foreground">{{ d.providerReference }}</span>
                  @if (d.providerTransactionId) {
                    | Mã GD NH: <span class="font-mono text-foreground">{{ d.providerTransactionId }}</span>
                  }
                </div>
              }
            </div>

            <div class="space-y-2">
              <label class="block font-semibold text-muted-foreground text-xs uppercase">Chọn phương án giải quyết:</label>
              <div class="space-y-2">
                <label
                  class="flex items-start gap-2.5 p-3 rounded border transition-colors"
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
                    <div class="font-bold text-foreground">
                      Khớp thủ công (Xác nhận đơn CONFIRMED)
                    </div>
                    <div class="text-xs text-muted-foreground mt-0.5">
                      Chỉ cho phép khi ngân hàng đã thực nhận đủ 100% tiền đơn. Bỏ qua lỗi cú pháp nội dung chuyển khoản.
                    </div>
                    @if (!d.isExactMatch) {
                      <div class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                        Vô hiệu hóa vì giao dịch thực tế bị lệch so với giá trị đơn hàng.
                      </div>
                    }
                  </div>
                </label>

                <label
                  class="flex items-start gap-2.5 p-3 rounded border transition-colors bg-surface-alt cursor-pointer"
                  [class.border-rose-500]="selectedResolution === 'CANCEL_REFUND'"
                  [class.border-line]="selectedResolution !== 'CANCEL_REFUND'"
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="CANCEL_REFUND"
                    [(ngModel)]="selectedResolution"
                    class="mt-0.5 text-rose-500"
                  />
                  <div>
                    <div class="font-bold text-rose-600 dark:text-rose-400">
                      Hủy đơn & Hoàn trả 100% số tiền thực nhận (REFUND_PENDING)
                    </div>
                    <div class="text-xs text-muted-foreground mt-0.5">
                      Hủy đơn hàng {{ order().code }}, giải phóng tồn kho giữ chỗ và chuyển {{ formatCurrency(d.receivedAmount) }} vào hàng đợi hoàn tiền thủ công.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          }

          <div class="space-y-1">
            <label class="block font-semibold text-muted-foreground text-xs uppercase">
              Ghi chú đối soát kiểm toán (Bắt buộc):
            </label>
            <textarea
              rows="3"
              [(ngModel)]="note"
              placeholder="Nhập mã giao dịch ngân hàng khớp lệnh hoặc lý do hủy hoàn tiền đối soát..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
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
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !note.trim()"
              class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Xử Lý Đối Soát...' : 'Xác Nhận Xử Lý Đối Soát' }}
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
