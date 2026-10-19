import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VndPipe } from '../../lib/vnd.pipe';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { InputDirective } from '../../components/atoms/input/input.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

export type CancelOrderPayload = {
  reason: string;
  note: string;
  bankInfo: {
    bankName: string;
    account: string;
    holder: string;
  };
};

@Component({
  selector: 'app-order-cancel-modal',
  imports: [FormsModule, VndPipe, ButtonDirective, BadgeDirective, InputDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div class="w-full max-w-2xl bg-surface rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden max-h-[90vh]">
        <!-- Modal Header -->
        <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-border">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <lucide-icon name="RotateCcw" class="size-5 text-amber-400" aria-hidden="true"></lucide-icon>
              <h2 id="cancel-modal-title" class="text-lg font-black tracking-tight text-white">
                Hủy Đơn Hàng #{{ orderCode() }}
              </h2>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span appBadge variant="outline" class="border-primary/40 text-primary font-bold">
                {{ status() }}
              </span>
              <span class="text-slate-400">| Đủ điều kiện hủy tự phục vụ trực tuyến</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Đóng cửa sổ"
            class="size-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            (click)="handleClose()"
          >
            <lucide-icon name="X" class="size-4" aria-hidden="true"></lucide-icon>
          </button>
        </div>

        <!-- Scrollable Modal Content -->
        <div class="p-6 overflow-y-auto space-y-5 text-xs text-foreground">
          <!-- Policy ORD-012 & ORD-014 Warning Cards -->
          <div class="space-y-3">
            <div class="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-lg flex items-start gap-3">
              <lucide-icon name="ShieldCheck" class="size-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true"></lucide-icon>
              <div class="space-y-1">
                <span class="font-bold text-amber-500 uppercase tracking-wide text-[11px] block">
                  Quy định hủy đơn trực tuyến (ORD-012)
                </span>
                <p class="text-muted leading-relaxed">
                  Đơn hàng được phép tự hủy trực tuyến khi ở trạng thái
                  <strong class="text-foreground">PENDING_PAYMENT</strong>,
                  <strong class="text-foreground">PENDING_COD_CONFIRMATION</strong> hoặc
                  <strong class="text-foreground">CONFIRMED</strong> trước khi chuyên viên kỹ thuật tiến hành bóc seal linh kiện.
                </p>
              </div>
            </div>

            <div class="bg-primary/10 border border-primary/30 p-3.5 rounded-lg flex items-start gap-3">
              <lucide-icon name="CreditCard" class="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true"></lucide-icon>
              <div class="space-y-1">
                <span class="font-bold text-primary uppercase tracking-wide text-[11px] block">
                  Chính sách hoàn tiền 100% (ORD-014)
                </span>
                <p class="text-muted leading-relaxed">
                  Số tiền đã thanh toán hoặc tiền cọc sẽ được hoàn trả 100% (<strong class="text-foreground">{{ totalAmount() | vnd }}</strong>)
                  vào tài khoản gốc trong vòng 24 giờ làm việc theo quy trình đối soát không thu phí giao dịch.
                </p>
              </div>
            </div>
          </div>

          <!-- Order Summary Line -->
          <div class="bg-surface-alt p-3.5 rounded-lg border border-border flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded bg-surface border border-border flex items-center justify-center text-primary">
                <lucide-icon name="Package" class="size-5" aria-hidden="true"></lucide-icon>
              </div>
              <div>
                <span class="text-[10px] text-muted uppercase font-bold tracking-wider">Mã đơn hàng</span>
                <p class="font-bold text-sm text-foreground">#{{ orderCode() }}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-muted uppercase font-bold tracking-wider">Tổng giá trị đơn</span>
              <p class="font-bold text-sm text-primary tabular">{{ totalAmount() | vnd }}</p>
            </div>
          </div>

          <!-- Cancellation Reason Form -->
          <form class="space-y-4" (ngSubmit)="$event.preventDefault()">
            <div class="space-y-1.5">
              <label class="font-bold text-foreground block" for="cancelReason">
                Lý do hủy đơn hàng <span class="text-danger">*</span>
              </label>
              <select
                id="cancelReason"
                appInput
                class="w-full text-xs"
                [ngModel]="selectedReason()"
                (ngModelChange)="selectedReason.set($event)"
                name="cancelReason"
                required
              >
                <option value="" disabled selected>Chọn lý do phù hợp...</option>
                <option value="hardware_change">Thay đổi nhu cầu cấu hình linh kiện PC</option>
                <option value="shipping_address">Muốn đổi phương thức nhận hàng hoặc địa chỉ</option>
                <option value="lead_time">Thời gian lắp ráp và bàn giao chưa phù hợp</option>
                <option value="other">Lý do cá nhân khác</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="font-bold text-foreground block" for="cancelDetailNote">
                Mô tả chi tiết bổ sung (tùy chọn)
              </label>
              <textarea
                id="cancelDetailNote"
                appInput
                class="w-full text-xs"
                rows="2"
                [ngModel]="detailNote()"
                (ngModelChange)="detailNote.set($event)"
                name="cancelDetailNote"
                placeholder="Nhập ghi chú hỗ trợ xử lý hủy đơn nhanh chóng..."
              ></textarea>
            </div>

            <!-- Refund Account Info -->
            <div class="bg-surface-alt p-3.5 rounded-lg border border-border space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-foreground flex items-center gap-1.5">
                  <lucide-icon name="CreditCard" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                  Thông tin tài khoản nhận hoàn tiền
                </span>
                <span class="text-[11px] text-primary font-bold">Khớp giao dịch đối soát</span>
              </div>
              <div class="grid sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[10px] text-muted uppercase font-bold" for="bankName">Ngân hàng thụ hưởng</label>
                  <input
                    id="bankName"
                    appInput
                    class="w-full text-xs font-semibold"
                    [ngModel]="refundBankName()"
                    (ngModelChange)="refundBankName.set($event)"
                    name="bankName"
                    placeholder="Tên ngân hàng (ví dụ: Vietcombank, MB Bank)"
                  >
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] text-muted uppercase font-bold" for="bankAccount">Số tài khoản / VietQR</label>
                  <input
                    id="bankAccount"
                    appInput
                    class="w-full text-xs font-semibold"
                    [ngModel]="refundAccount()"
                    (ngModelChange)="refundAccount.set($event)"
                    name="bankAccount"
                    placeholder="Số tài khoản ngân hàng"
                  >
                </div>
              </div>
            </div>

            <!-- Confirmation Checkbox -->
            <label class="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                class="mt-0.5 rounded border-border text-primary focus:ring-primary size-4"
                [checked]="confirmedRules()"
                (change)="confirmedRules.set(!confirmedRules())"
              >
              <span class="text-xs text-muted leading-relaxed select-none">
                Tôi xác nhận yêu cầu hủy đơn và hiểu rằng linh kiện đang giữ trong đơn #{{ orderCode() }} sẽ được hoàn trả về kho chung ngay sau khi lệnh được duyệt.
              </span>
            </label>
          </form>
        </div>

        <!-- Modal Footer Actions -->
        <div class="bg-surface-alt px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            appButton
            variant="outline"
            size="md"
            class="w-full sm:w-auto"
            (click)="handleClose()"
          >
            Quay lại kiểm tra
          </button>
          <button
            type="button"
            appButton
            variant="danger"
            size="md"
            class="w-full sm:w-auto"
            [disabled]="!canSubmit()"
            (click)="handleConfirmCancel()"
          >
            <lucide-icon name="RotateCcw" class="size-4" aria-hidden="true"></lucide-icon>
            <span>Xác nhận hủy đơn & Yêu cầu hoàn tiền</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class OrderCancelModalComponent {
  readonly orderCode = input.required<string>();
  readonly status = input<string>('CONFIRMED');
  readonly totalAmount = input<string | number>('0');
  readonly paymentMethod = input<string>('QR');

  readonly cancelled = output<CancelOrderPayload>();
  readonly closed = output<void>();

  protected readonly selectedReason = signal('');
  protected readonly detailNote = signal('');
  protected readonly confirmedRules = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly refundBankName = signal('MB BANK (Quân Đội)');
  protected readonly refundAccount = signal('**** **** 0892');
  protected readonly refundHolder = signal('NGUYEN HOANG ANH');

  protected readonly canSubmit = computed(() => {
    return !!this.selectedReason() && this.confirmedRules() && !this.isSubmitting();
  });

  protected handleClose(): void {
    this.closed.emit();
  }

  protected handleConfirmCancel(): void {
    if (!this.canSubmit()) return;
    this.isSubmitting.set(true);
    this.cancelled.emit({
      reason: this.selectedReason(),
      note: this.detailNote(),
      bankInfo: {
        bankName: this.refundBankName(),
        account: this.refundAccount(),
        holder: this.refundHolder(),
      },
    });
  }
}
