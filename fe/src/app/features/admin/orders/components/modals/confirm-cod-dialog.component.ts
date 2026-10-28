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
  StockReadinessResult,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-confirm-cod-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-07" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-lg p-5 space-y-4 text-sm text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Xác Nhận Đơn Hàng COD
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

          <div class="p-3 bg-surface-alt border border-line rounded text-xs">
            <div class="grid grid-cols-2 gap-2 text-muted">
              <div>Khách hàng: <span class="text-foreground font-medium">{{ order().receiverName }}</span></div>
              <div>Số điện thoại: <span class="text-foreground tabular tabular-nums font-medium">{{ order().receiverPhone }}</span></div>
              <div>Chi nhánh: <span class="text-foreground font-medium">{{ order().fulfillmentBranch.name }}</span></div>
              <div>Mã đơn: <span class="text-primary font-bold tabular tabular-nums">{{ order().code }}</span></div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-foreground text-xs">
                Kiểm tra tồn kho chi nhánh {{ order().fulfillmentBranch.code }}:
              </span>
              @if (isLoadingStock()) {
                <span class="text-muted text-xs">Đang kiểm tra...</span>
              }
            </div>

            @if (isLoadingStock()) {
              <div class="p-4 text-center bg-surface-alt border border-line rounded text-muted text-sm">
                Đang đối soát số lượng tồn kho khả dụng...
              </div>
            } @else if (stockReadiness(); as readiness) {
              <div class="space-y-1 bg-surface-alt p-2 rounded border border-line">
                @for (item of readiness.items; track item.skuId) {
                  <div class="p-2 bg-surface border border-line rounded flex items-center justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="text-foreground truncate font-semibold text-sm tabular tabular-nums">{{ item.skuCode }}</div>
                      <div class="text-xs text-muted truncate">{{ item.name }}</div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <div class="text-xs text-muted tabular tabular-nums">
                        Cần: <span class="font-bold text-foreground">{{ item.requiredQuantity }}</span> | Khả dụng: <span [class.text-emerald-600]="item.isSufficient" [class.dark:text-emerald-400]="item.isSufficient" [class.text-rose-600]="!item.isSufficient" [class.dark:text-rose-400]="!item.isSufficient">{{ item.available }}</span>
                      </div>
                      <span
                        class="inline-block px-1.5 py-0.5 rounded text-xs font-medium mt-0.5"
                        [class.bg-emerald-500/10]="item.isSufficient"
                        [class.text-emerald-700]="item.isSufficient"
                        [class.dark:text-emerald-400]="item.isSufficient"
                        [class.border]="item.isSufficient"
                        [class.border-emerald-500/20]="item.isSufficient"
                        [class.bg-destructive/10]="!item.isSufficient"
                        [class.text-destructive]="!item.isSufficient"
                        [class.border-destructive/20]="!item.isSufficient"
                      >
                        {{ item.isSufficient ? 'Đủ tồn kho' : 'Thiếu tồn kho' }}
                      </span>
                    </div>
                  </div>
                }
              </div>

              @if (!readiness.canConfirm) {
                <div class="p-2.5 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
                  Chi nhánh không có đủ tồn kho khả dụng để thực hiện giữ hàng cho đơn COD này.
                </div>
              }
            }
          </div>

          <div class="space-y-1">
            <label class="block font-medium text-muted text-xs">Ghi chú xác nhận:</label>
            <input
              type="text"
              [(ngModel)]="note"
              placeholder="Nhập ghi chú liên hệ khách xác nhận đơn..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary"
            />
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
              [disabled]="isSubmitting() || (stockReadiness() && !stockReadiness()?.canConfirm)"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded text-sm transition-opacity cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Khóa Tồn...' : 'Xác Nhận & Khóa Tồn Kho' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmCodDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly stockReadiness = signal<StockReadinessResult | null>(null);
  readonly isLoadingStock = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  note = '';

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadStockReadiness();
        this.note = '';
        this.errorMessage.set(null);
      }
    });
  }

  async loadStockReadiness(): Promise<void> {
    this.isLoadingStock.set(true);
    this.errorMessage.set(null);
    try {
      const result = await this.detailService.fetchStockReadiness(this.order().id);
      this.stockReadiness.set(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi kiem tra ton kho';
      this.errorMessage.set(msg);
    } finally {
      this.isLoadingStock.set(false);
    }
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
      await this.detailService.confirmCodOrder(this.order().id, this.note.trim() || undefined);
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the xac nhan don hang COD';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
