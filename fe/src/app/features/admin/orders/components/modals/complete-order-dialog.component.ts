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
  AdminOrderDetail,
  AdminOrderDetailService,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-complete-order-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-16" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-lg p-5 space-y-4 text-sm text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Hoàn Tất Đơn Hàng
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

          <div class="p-3 bg-surface-alt border border-line rounded space-y-1.5 text-xs">
            <div class="grid grid-cols-2 gap-2 text-muted">
              <div>Mã đơn: <span class="font-bold text-primary tabular tabular-nums">{{ order().code }}</span></div>
              <div>Khách nhận: <span class="text-foreground font-medium">{{ order().receiverName }}</span></div>
              <div>Hình thức: <span class="text-foreground font-medium">{{ order().fulfillmentMethod === 'PICKUP' ? 'Nhận tại shop' : 'Giao tận nơi' }}</span></div>
              <div>Thanh toán: <span class="text-foreground font-medium">{{ order().paymentMethod }}</span></div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            @if (isPickupStandalone()) {
              <div class="p-3 bg-surface-alt border border-line rounded space-y-2 text-xs">
                <div class="font-medium text-foreground">Đồng kiểm linh kiện tại showroom:</div>
                <label class="flex items-start gap-2 cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    [(ngModel)]="isInspected"
                    class="mt-0.5 rounded bg-surface border-line text-primary focus:ring-0"
                  />
                  <span>Đã đối chiếu số lượng và số Serial linh kiện bàn giao khớp đơn hàng.</span>
                </label>
                <label class="flex items-start gap-2 cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    [(ngModel)]="isDeductionConfirmed"
                    class="mt-0.5 rounded bg-surface border-line text-primary focus:ring-0"
                  />
                  <span>Xác nhận trừ tồn kho thực tế tại {{ order().fulfillmentBranch.name }} và giải phóng giữ chỗ.</span>
                </label>
              </div>
            }

            @if (isCod()) {
              <div class="p-3 bg-surface-alt border border-line rounded space-y-2 text-xs">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-muted">Tiền COD cần thu:</span>
                  <strong class="text-foreground font-bold text-sm tabular tabular-nums">
                    {{ formatCurrency(codRemainingAmount()) }}
                  </strong>
                </div>

                <div>
                  <label class="block font-medium text-muted text-xs mb-1">
                    Số tiền mặt thực thu (VND):
                  </label>
                  <input
                    type="number"
                    [(ngModel)]="collectedAmount"
                    class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground font-semibold text-sm focus:outline-none focus:border-primary tabular tabular-nums"
                  />
                </div>

                <div>
                  <label class="block font-medium text-muted text-xs mb-1">
                    Nhân viên xác nhận thu tiền:
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="actorName"
                    placeholder="Họ tên nhân viên thu tiền..."
                    class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            }

            <div class="space-y-1">
              <label class="block font-medium text-muted text-xs">Ghi chú hoàn tất (Tùy chọn):</label>
              <textarea
                rows="2"
                [(ngModel)]="note"
                placeholder="Ghi chú đối soát hoàn tất đơn..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary resize-none"
              ></textarea>
            </div>
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
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-medium text-sm text-foreground cursor-pointer disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !isReadyToSubmit()"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded text-sm transition-opacity cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Xử Lý...' : 'Xác Nhận Hoàn Tất Đơn' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CompleteOrderDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  isInspected = true;
  isDeductionConfirmed = true;
  collectedAmount = 0;
  actorName = '';
  note = '';

  readonly isCod = computed<boolean>(() => {
    return this.order().paymentMethod === 'COD';
  });

  readonly codRemainingAmount = computed<number>(() => {
    const raw = this.order().payment?.codRemaining;
    if (raw) {
      return Number(raw);
    }
    return Number(this.order().grandTotal) - Number(this.order().payment?.totalReceived || 0);
  });

  readonly isPickupStandalone = computed<boolean>(() => {
    return this.order().fulfillmentMethod === 'PICKUP' && !this.order().hasAssembly;
  });

  isReadyToSubmit(): boolean {
    if (this.isPickupStandalone() && (!this.isInspected || !this.isDeductionConfirmed)) {
      return false;
    }
    return true;
  }

  onClose(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.errorMessage.set(null);
    this.closed.emit();
  }

  async onSubmit(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.completeOrder(this.order().id, {
        codCollectedAmount: this.isCod() ? Number(this.collectedAmount || this.codRemainingAmount()) : 0,
        actorName: this.actorName.trim() || undefined,
        note: this.note.trim() || undefined,
      });

      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the hoan tat don hang';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + ' ₫';
  }
}
