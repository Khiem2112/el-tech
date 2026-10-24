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
import {
  AdminTransferService,
  TransferDetail,
  TransferListItem,
} from '../services/admin-transfer.service';

@Component({
  selector: 'app-cancel-transfer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen && transfer) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-[#090d16]/75 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-md max-h-[92vh] flex flex-col z-10 text-xs text-slate-200"
        >
          <div class="p-5 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded bg-[#090d16] border border-[#272f3d] text-rose-400 font-mono text-[10px] font-bold">
                  MOD-27
                </span>
                <h3 class="font-bold text-rose-400 uppercase text-sm tracking-wide">
                  Hủy Phiếu Yêu Cầu Điều Chuyển
                </h3>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Phiếu: <strong class="text-white font-mono">{{ transfer.code }}</strong>
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              <div class="p-3 bg-rose-950/30 border border-rose-800/60 rounded text-rose-200 text-xs leading-relaxed">
                Chỉ cho phép hủy khi phiếu điều chuyển đang ở trạng thái Chờ xuất (REQUESTED) và chưa xuất hàng khỏi kho (TRF-002).
              </div>

              @if (errorMessage()) {
                <div class="p-3 bg-rose-950/40 border border-rose-800/80 rounded text-rose-300 text-xs">
                  {{ errorMessage() }}
                </div>
              }

              <div>
                <label for="cancel-reason" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                  Lý Do Hủy Yêu Cầu Điều Chuyển <span class="text-rose-400">*</span>
                </label>
                <textarea
                  id="cancel-reason"
                  rows="3"
                  required
                  [ngModel]="reason()"
                  (ngModelChange)="reason.set($event)"
                  name="cancelReason"
                  placeholder="Nhập chi tiết lý do hủy phiếu điều chuyển này..."
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-rose-400"
                ></textarea>
              </div>
            </div>

            <div class="p-4 border-t border-[#272f3d] flex items-center justify-end gap-3 flex-shrink-0 bg-[#161b26]">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold text-xs rounded transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting() || reason().trim().length < 3"
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-xs rounded transition-colors shadow-sm"
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
