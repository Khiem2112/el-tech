import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
import {
  AdminTransferService,
  TransferDetail,
  TransferListItem,
} from '../services/admin-transfer.service';

@Component({
  selector: 'app-cancel-transfer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen && transfer) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col z-10 text-sm text-foreground"
        >
          <div class="p-5 border-b border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            <div>
              <h3 class="font-bold text-danger uppercase text-sm tracking-wide">
                Hủy Phiếu Yêu Cầu Điều Chuyển
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Phiếu: <strong class="text-foreground tabular">{{ transfer.code }}</strong>
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-surface text-muted hover:text-foreground transition-colors border border-transparent hover:border-line"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              @if (errorMessage()) {
                <div class="p-3 bg-danger/10 border border-danger/30 rounded text-danger text-xs font-semibold">
                  {{ errorMessage() }}
                </div>
              }

              <div class="space-y-1.5">
                <label class="block font-semibold text-muted text-xs uppercase">
                  Lý do nhanh:
                </label>
                <div class="flex flex-wrap gap-1.5">
                  @for (preset of cancelPresets; track preset) {
                    <button
                      type="button"
                      (click)="reason.set(preset)"
                      class="px-3 py-1.5 rounded text-sm font-semibold border transition-colors"
                      [ngClass]="reason() === preset ? 'bg-danger text-white border-danger' : 'bg-surface border-line text-foreground hover:bg-surface-alt'"
                    >
                      {{ preset }}
                    </button>
                  }
                </div>
              </div>

              <div>
                <label for="cancel-reason" class="block font-semibold text-muted text-xs uppercase mb-1">
                  Chi tiết lý do hủy <span class="text-danger">*</span>
                </label>
                <textarea
                  id="cancel-reason"
                  rows="3"
                  required
                  [ngModel]="reason()"
                  (ngModelChange)="reason.set($event)"
                  name="cancelReason"
                  placeholder="Nhập chi tiết lý do hủy phiếu điều chuyển này..."
                  class="w-full h-24 px-3 py-2 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger"
                ></textarea>
              </div>
            </div>

            <div class="p-4 border-t border-line flex items-center justify-end gap-3 flex-shrink-0 bg-surface-alt">
              <button
                type="button"
                (click)="onCancel()"
                appButton
                variant="secondary"
                size="sm"
              >
                Đóng
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting() || reason().trim().length < 3"
                appButton
                variant="danger"
                size="sm"
              >
                @if (isSubmitting()) {
                  Đang hủy phiếu...
                } @else {
                  Xác nhận hủy phiếu
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CancelTransferDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() transfer: TransferListItem | null = null;
  @Output() cancelled = new EventEmitter<TransferDetail>();
  @Output() closed = new EventEmitter<void>();

  private readonly transferService = inject(AdminTransferService);

  readonly reason = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly cancelPresets = [
    'Tạo nhầm chi nhánh',
    'Kho xuất thiếu hàng',
    'Đã gom sang phiếu khác',
    'Khách hủy yêu cầu cấu hình',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.reason.set('');
      this.errorMessage.set(null);
      this.isSubmitting.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.transfer) {
      return;
    }

    const cancelReason = this.reason().trim();
    if (cancelReason.length < 3) {
      this.errorMessage.set('Vui lòng nhập lý do hủy ít nhất 3 ký tự');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const updated = await this.transferService.cancelTransfer(this.transfer.id, {
        reason: cancelReason,
      });
      this.cancelled.emit(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi hủy phiếu điều chuyển';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.closed.emit();
  }
}
