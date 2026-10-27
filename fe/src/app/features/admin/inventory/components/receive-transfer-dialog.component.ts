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
  selector: 'app-receive-transfer-dialog',
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
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Xác Nhận Nhập Kho
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Phiếu: <strong class="text-foreground tabular">{{ transfer.code }}</strong> - Kho nhận: {{ transfer.destinationBranchName }}
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

              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs uppercase font-semibold text-muted">
                  <span>Linh kiện tiếp nhận</span>
                  <span class="text-foreground font-bold tabular tabular-nums">{{ transfer.totalQuantity }} chiếc</span>
                </div>
                <div class="space-y-1.5 max-h-48 overflow-y-auto">
                  @for (line of transfer.lines; track line.id) {
                    <div class="p-2.5 bg-surface-alt border border-line rounded flex items-center justify-between">
                      <div>
                        <div class="font-bold text-foreground">{{ line.productName }}</div>
                        <div class="text-xs text-muted tabular">SKU: {{ line.skuCode }}</div>
                      </div>
                      <div class="font-bold text-foreground text-sm tabular tabular-nums">
                        {{ line.quantity }} chiếc
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div>
                <label for="receive-note" class="block font-semibold text-muted text-xs uppercase mb-1">
                  Ghi Chú Tiếp Nhận (Tùy Chọn)
                </label>
                <input
                  id="receive-note"
                  type="text"
                  [ngModel]="note()"
                  (ngModelChange)="note.set($event)"
                  name="receiveNote"
                  placeholder="Ví dụ: Đã kiểm tra nguyên seal, đủ linh kiện theo phiếu"
                  class="w-full h-9 px-3 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted"
                />
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
                Hủy bỏ
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                appButton
                variant="primary"
                size="sm"
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
