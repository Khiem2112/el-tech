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
  SelectComponent,
  SelectOption,
} from '../../../../../components/atoms/select/select.component';
import {
  AdminOrderDetail,
  AdminOrderDetailService,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-resolve-hold-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-18" class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-warning uppercase text-sm tracking-wide">
                {{ isCurrentlyOnHold() ? 'Xử Lý Ngoại Lệ Đơn Tạm Giữ' : 'Tạm Giữ Đơn Hàng' }}
              </h3>
              <p class="text-xs text-muted-foreground">
                {{ isCurrentlyOnHold() ? 'Giải quyết ngoại lệ và điều phối chu trình tiếp theo' : 'Chuyển đơn sang trạng thái tạm giữ ngoại lệ ON_HOLD' }}
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

          @if (isCurrentlyOnHold()) {
            <div class="p-3 bg-warning/10 border border-warning/30 rounded text-warning text-xs leading-relaxed space-y-1">
              <div>Đơn hàng đang bị tạm giữ với lý do: <strong class="text-foreground font-mono">{{ order().holdReason }}</strong></div>
              <div>
                @switch (order().holdReason) {
                  @case ('PAYMENT_REVIEW') {
                    Đối soát tiền lệch hoặc giao dịch chuyển khoản VietQR nghi vấn trong 24 giờ.
                  }
                  @case ('PAID_BUT_OUT_OF_STOCK') {
                    Khách hàng thanh toán trễ dẫn đến thiếu linh kiện khả dụng.
                  }
                  @case ('PICKUP_EXPIRED') {
                    Đơn nhận tại shop quá hạn lưu kho 14 ngày.
                  }
                  @default {
                    Đang cần xác minh bổ sung trước khi tiếp tục.
                  }
                }
              </div>
            </div>

            <div class="space-y-2">
              <label class="block font-semibold text-muted-foreground text-xs">Phương án xử lý:</label>
              <div class="space-y-1.5">
                <label class="flex items-start gap-2 p-2.5 bg-surface-alt border border-line rounded cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    name="resolveAction"
                    value="CONFIRM_RESUME"
                    [(ngModel)]="selectedAction"
                    class="mt-0.5 text-primary"
                  />
                  <div>
                    <div class="font-bold text-foreground">Tiếp tục xử lý đơn hàng (CONFIRMED)</div>
                    <div class="text-xs text-muted-foreground">Đã thỏa thuận phương án thành công hoặc đối soát xong, tiếp tục quy trình chuẩn.</div>
                  </div>
                </label>

                @if (order().holdReason === 'PICKUP_EXPIRED') {
                  <label class="flex items-start gap-2 p-2.5 bg-surface-alt border border-line rounded cursor-pointer hover:border-primary">
                    <input
                      type="radio"
                      name="resolveAction"
                      value="EXTEND_PICKUP"
                      [(ngModel)]="selectedAction"
                      class="mt-0.5 text-primary"
                    />
                    <div>
                      <div class="font-bold text-foreground">Gia hạn thời gian nhận hàng tại showroom</div>
                      <div class="text-xs text-muted-foreground">Khách đã phản hồi hẹn lại ngày tới nhận, tiếp tục giữ hàng tại quầy.</div>
                    </div>
                  </label>
                }

                <label class="flex items-start gap-2 p-2.5 bg-surface-alt border border-rose-500/30 rounded cursor-pointer hover:border-rose-400">
                  <input
                    type="radio"
                    name="resolveAction"
                    value="CANCEL_REFUND"
                    [(ngModel)]="selectedAction"
                    class="mt-0.5 text-rose-500"
                  />
                  <div>
                    <div class="font-bold text-rose-600 dark:text-rose-400">Hủy đơn & Hoàn tiền</div>
                    <div class="text-xs text-muted-foreground">Hủy đơn hàng, giải phóng số lượng giữ chỗ và tạo lệnh hoàn tiền nếu khách đã thanh toán.</div>
                  </div>
                </label>
              </div>
            </div>
          } @else {
            <div class="space-y-2">
              <label class="block font-semibold text-muted-foreground text-xs">Chọn nguyên nhân tạm giữ:</label>
              <app-select
                [options]="holdReasonOptions"
                [value]="selectedHoldReason"
                (valueChange)="onHoldReasonChange($event)"
                placeholder="Chọn nguyên nhân tạm giữ"
              />
            </div>
          }

          <div class="space-y-1">
            <label class="block font-semibold text-muted-foreground text-xs">
              {{ isCurrentlyOnHold() ? 'Phương án giải quyết chi tiết:' : 'Ghi chú lý do tạm giữ:' }}
            </label>
            <textarea
              rows="3"
              [(ngModel)]="note"
              [placeholder]="isCurrentlyOnHold() ? 'Ghi nhận chi tiết thỏa thuận với khách hàng...' : 'Nhập chi tiết lý do phát sinh tạm giữ...'"
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
              class="px-4 py-2 bg-warning hover:opacity-90 text-white font-bold rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Xử Lý...' : (isCurrentlyOnHold() ? 'Xác Nhận Giải Quyết' : 'Xác Nhận Tạm Giữ') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ResolveHoldDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly holdReasonOptions: SelectOption[] = [
    { value: 'PAYMENT_REVIEW', label: 'PAYMENT_REVIEW - Đối soát thanh toán / VietQR nghi vấn' },
    { value: 'PAID_BUT_OUT_OF_STOCK', label: 'PAID_BUT_OUT_OF_STOCK - Trả tiền trễ dẫn đến hết hàng' },
    { value: 'PICKUP_EXPIRED', label: 'PICKUP_EXPIRED - Đơn nhận tại showroom quá hạn 14 ngày' },
  ];

  selectedAction: 'CONFIRM_RESUME' | 'CANCEL_REFUND' | 'EXTEND_PICKUP' = 'CONFIRM_RESUME';
  selectedHoldReason: 'PAYMENT_REVIEW' | 'PAID_BUT_OUT_OF_STOCK' | 'PICKUP_EXPIRED' = 'PAYMENT_REVIEW';
  note = '';

  readonly isCurrentlyOnHold = computed<boolean>(() => {
    return this.order().status === 'ON_HOLD';
  });

  onHoldReasonChange(val: string): void {
    if (val === 'PAYMENT_REVIEW' || val === 'PAID_BUT_OUT_OF_STOCK' || val === 'PICKUP_EXPIRED') {
      this.selectedHoldReason = val;
    }
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
      this.errorMessage.set('Vui lòng nhập ghi chú xử lý');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      if (this.isCurrentlyOnHold()) {
        await this.detailService.resolveHold(this.order().id, {
          action: this.selectedAction,
          reason: this.note.trim(),
        });
      } else {
        await this.detailService.holdOrder(this.order().id, {
          holdReason: this.selectedHoldReason,
          note: this.note.trim(),
        });
      }

      this.note = '';
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the xu ly ngoai le tam giu';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
