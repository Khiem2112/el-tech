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
  selector: 'app-receive-transfer-dialog',
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
                <span class="px-1.5 py-0.5 rounded bg-[#090d16] border border-[#272f3d] text-[#76b900] font-mono text-[10px] font-bold">
                  MOD-26
                </span>
                <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                  Xác Nhận Nhập Kho (Receive)
                </h3>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Phiếu: <strong class="text-white font-mono">{{ transfer.code }}</strong> - Kho nhận: {{ transfer.destinationBranchName }}
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
              <div class="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded text-emerald-200 text-xs leading-relaxed">
                Chi nhánh đích xác nhận nhận đủ 100% số lượng linh kiện ({{ transfer.totalQuantity }} chiếc). Hệ thống sẽ tăng tồn kho thực tế onHand tại kho nhận, tính lại giá vốn bình quân gia quyền (WAC), ghi nhận TRANSFER_IN và chuyển sê-ri sang khả dụng tại kho mới.
              </div>

              @if (errorMessage()) {
                <div class="p-3 bg-rose-950/40 border border-rose-800/80 rounded text-rose-300 text-xs">
                  {{ errorMessage() }}
                </div>
              }

              <div class="space-y-2">
                <div class="text-slate-400 font-semibold uppercase text-[11px]">Danh sách linh kiện tiếp nhận:</div>
                <div class="space-y-1.5 max-h-48 overflow-y-auto">
                  @for (line of transfer.lines; track line.id) {
                    <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded flex items-center justify-between">
                      <div>
                        <div class="font-bold text-white">{{ line.productName }}</div>
                        <div class="text-[11px] font-mono text-slate-400">SKU: {{ line.skuCode }}</div>
                      </div>
                      <div class="font-bold text-white font-mono text-sm">
                        {{ line.quantity }} chiếc
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div>
                <label for="receive-note" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                  Ghi Chú Tiếp Nhận (Tùy Chọn)
                </label>
                <input
                  id="receive-note"
                  type="text"
                  [ngModel]="note()"
                  (ngModelChange)="note.set($event)"
                  name="receiveNote"
                  placeholder="Ví dụ: Đã kiểm tra nguyên tem niêm phong, đủ số lượng"
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                />
              </div>
            </div>

            <div class="p-4 border-t border-[#272f3d] flex items-center justify-end gap-3 flex-shrink-0 bg-[#161b26]">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold text-xs rounded transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold text-xs rounded transition-colors shadow-sm"
              >
                @if (isSubmitting()) {
                  Đang nhận hàng...
                } @else {
                  Xác nhận đã nhận đủ
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ReceiveTransferDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() transfer: TransferListItem | null = null;
  @Output() received = new EventEmitter<TransferDetail>();
  @Output() closed = new EventEmitter<void>();

  private readonly transferService = inject(AdminTransferService);

  readonly note = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.note.set('');
      this.errorMessage.set(null);
      this.isSubmitting.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.transfer) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const updated = await this.transferService.receiveTransfer(this.transfer.id, {
        note: this.note().trim() || undefined,
      });
      this.received.emit(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xác nhận nhận hàng điều chuyển';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.closed.emit();
  }
}
