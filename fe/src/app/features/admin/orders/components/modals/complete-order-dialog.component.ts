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
        <div class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs text-slate-200 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                Xác Nhận Bàn Giao & Hoàn Tất Đơn Hàng (MOD-16)
              </h3>
              <p class="text-xs text-slate-400">
                Quy trình: Hoàn tất giao nhận và kích hoạt quyền đánh giá đã xác minh
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

          <div class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 text-xs leading-relaxed">
            @if (isPickupStandalone()) {
              Đơn nhận tại showroom mua linh kiện lẻ: Số lượng tồn kho đang ở trạng thái giữ chỗ sẽ chính thức được trừ tồn thực tế (onHand) và giải phóng số lượng giữ (reserved) ngay tại quầy khi hoàn tất.
            } @else {
              Xác nhận đơn hàng đã được giao tận tay khách hàng thành công. Toàn bộ chu trình vận hành và tài chính của đơn hàng sẽ được chốt sổ.
            }
          </div>

          <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded space-y-1.5">
            <div class="font-semibold text-slate-300">Thông tin đối soát đơn hàng:</div>
            <div class="grid grid-cols-2 gap-2 text-slate-400">
              <div>Mã đơn: <span class="font-mono text-[#76b900]">{{ order().code }}</span></div>
              <div>Khách nhận: <span class="text-white font-medium">{{ order().receiverName }}</span></div>
              <div>Hình thức nhận: <span class="text-white font-medium">{{ order().fulfillmentMethod === 'PICKUP' ? 'Nhận tại quầy showroom' : 'Giao hàng tận nơi' }}</span></div>
              <div>Thanh toán: <span class="text-white font-medium">{{ order().paymentMethod }}</span></div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            @if (isPickupStandalone()) {
              <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded space-y-2">
                <div class="font-semibold text-white">Đồng kiểm linh kiện & Bàn giao tại showroom:</div>
                <label class="flex items-start gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    [(ngModel)]="isInspected"
                    class="mt-0.5 rounded bg-[#161b26] border-[#272f3d] text-[#76b900] focus:ring-0"
                  />
                  <span>Đã đối chiếu số lượng và số Serial linh kiện bàn giao khớp 100% với đơn hàng.</span>
                </label>
                <label class="flex items-start gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    [(ngModel)]="isDeductionConfirmed"
                    class="mt-0.5 rounded bg-[#161b26] border-[#272f3d] text-[#76b900] focus:ring-0"
                  />
                  <span>Xác nhận trừ tồn kho thực tế tại kho {{ order().fulfillmentBranch.name }} và giải phóng giữ chỗ.</span>
                </label>
              </div>
            }

            @if (isCod()) {
              <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-400">Số tiền COD cần thu:</span>
                  <strong class="text-rose-400 font-bold font-mono text-sm">
                    {{ formatCurrency(codRemainingAmount()) }}
                  </strong>
                </div>

                <div>
                  <label class="block font-semibold text-slate-400 text-xs mb-1">
                    Xác nhận số tiền mặt thực thu (VND):
                  </label>
                  <input
                    type="number"
                    [(ngModel)]="collectedAmount"
                    class="w-full px-3 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white font-mono font-bold text-xs focus:outline-none focus:border-[#76b900]"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-400 text-xs mb-1">
                    Nhân viên xác nhận thu tiền:
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="actorName"
                    placeholder="Họ tên nhân viên thu ngân hoặc vận chuyển..."
                    class="w-full px-3 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                  />
                </div>
              </div>
            }

            <div class="space-y-1">
              <label class="block font-semibold text-slate-400 text-xs">Ghi chú hoàn tất (Tùy chọn):</label>
              <textarea
                rows="2"
                [(ngModel)]="note"
                placeholder="Ghi chú đối soát hoàn tất đơn hàng..."
                class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
              ></textarea>
            </div>
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
              [disabled]="isSubmitting() || !isReadyToSubmit()"
              class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Xử Lý Hoàn Tất...' : 'Xác Nhận Hoàn Tất Đơn' }}
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
