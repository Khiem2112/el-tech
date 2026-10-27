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
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-return-initiate-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-14" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-5 space-y-4 text-sm text-foreground flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Chuyển Hoàn Về Kho
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

          <div class="p-3 bg-surface-alt border border-line rounded space-y-1 text-xs">
            <div class="text-muted">Kho chi nhánh nhận hàng hoàn:</div>
            <div class="text-foreground font-semibold">
              {{ order().fulfillmentBranch.name }} ({{ order().fulfillmentBranch.code }})
            </div>
            <div class="text-xs text-muted truncate">
              Địa chỉ: {{ order().fulfillmentBranch.address }}
            </div>
          </div>

          <div>
            <label class="block font-medium text-muted text-xs mb-1">
              Ghi chú chuyển hoàn:
            </label>
            <textarea
              [(ngModel)]="note"
              rows="2"
              placeholder="Nhập mã vận đơn khứ hồi hoặc lý do chuyển hoàn..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary resize-none"
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
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground font-medium text-sm rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ isSubmitting() ? 'Đang Xử Lý...' : 'Xác Nhận Chuyển Hoàn' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ReturnInitiateDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input.required<boolean>();

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  note = '';

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.note = '';
        this.errorMessage.set(null);
      }
    });
  }

  onClose(): void {
    if (!this.isSubmitting()) {
      this.closed.emit();
    }
  }

  async onSubmit(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.initiateReturn(this.order().id, {
        note: this.note.trim() || undefined,
      });
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the xac nhan chuyen hoan ve kho';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}