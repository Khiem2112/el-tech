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
        <div class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs text-slate-200 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                Xác Nhận Đơn Hàng COD (MOD-07)
              </h3>
              <p class="text-xs text-slate-400">
                Quy trình: Chờ xác nhận COD sang Đã xác nhận đơn hàng
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-[#090d16] hover:bg-[#272f3d] text-slate-400 hover:text-white border border-[#272f3d] text-xs"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-xs leading-relaxed">
            Hệ thống sẽ tự động khóa giữ tồn kho (StockQuant.reserved) nguyên tử cho toàn bộ linh kiện tại chi nhánh phụ trách. Nếu bất kỳ linh kiện nào bị thiếu tồn khả dụng, thao tác xác nhận sẽ bị chặn.
          </div>

          <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded space-y-1.5">
            <div class="font-semibold text-slate-300">Thông tin người nhận & Xác minh liên lạc:</div>
            <div class="grid grid-cols-2 gap-2 text-slate-400">
              <div>Khách hàng: <span class="text-white font-medium">{{ order().receiverName }}</span></div>
              <div>Số điện thoại: <span class="font-mono text-white">{{ order().receiverPhone }}</span></div>
              <div>Chi nhánh: <span class="text-white font-medium">{{ order().fulfillmentBranch.name }}</span></div>
              <div>Mã đơn: <span class="font-mono text-[#76b900]">{{ order().code }}</span></div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-300">
                Kiểm tra tính sẵn sàng tồn kho (Chi nhánh {{ order().fulfillmentBranch.code }}):
              </span>
              @if (isLoadingStock()) {
                <span class="text-slate-400 text-[11px]">Đang kiểm tra tồn...</span>
              }
            </div>

            @if (isLoadingStock()) {
              <div class="p-4 text-center bg-[#090d16] border border-[#272f3d] rounded text-slate-400">
                Đang đối soát số lượng tồn kho khả dụng...
              </div>
            } @else if (stockReadiness(); as readiness) {
              <div class="space-y-1.5 bg-[#090d16] p-2.5 rounded border border-[#272f3d]">
                @for (item of readiness.items; track item.skuId) {
                  <div class="p-2 bg-[#161b26] border border-[#272f3d] rounded flex items-center justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="font-mono text-white truncate font-medium">{{ item.skuCode }}</div>
                      <div class="text-[11px] text-slate-400 truncate">{{ item.name }}</div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <div class="text-[11px] text-slate-300">
                        Cần: <span class="font-bold text-white">{{ item.requiredQuantity }}</span> | Khả dụng: <span class="font-mono" [class.text-emerald-400]="item.isSufficient" [class.text-rose-400]="!item.isSufficient">{{ item.available }}</span>
                      </div>
                      <span
                        class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5"
                        [class.bg-emerald-500/20]="item.isSufficient"
                        [class.text-emerald-300]="item.isSufficient"
                        [class.bg-rose-500/20]="!item.isSufficient"
                        [class.text-rose-300]="!item.isSufficient"
                      >
                        {{ item.isSufficient ? 'Đủ hàng giữ chỗ' : 'Thiếu tồn kho' }}
                      </span>
                    </div>
                  </div>
                }
              </div>

              @if (!readiness.canConfirm) {
                <div class="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
                  Cảnh báo: Chi nhánh không có đủ tồn kho khả dụng để thực hiện giữ hàng cho đơn COD này. Vui lòng điều chuyển kho hoặc bổ sung hàng trước khi xác nhận.
                </div>
              }
            }
          </div>

          <div class="space-y-1">
            <label class="block font-semibold text-slate-400 text-xs">Ghi chú xác nhận (Tùy chọn):</label>
            <input
              type="text"
              [(ngModel)]="note"
              placeholder="Nhập ghi chú liên hệ khách hàng xác nhận đơn..."
              class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
            />
          </div>

          @if (errorMessage()) {
            <div class="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#272f3d]">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded font-semibold text-xs text-slate-300 cursor-pointer disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || (stockReadiness() && !stockReadiness()?.canConfirm)"
              class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Khóa Tồn Kho...' : 'Xác Nhận & Khóa Tồn Kho' }}
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
