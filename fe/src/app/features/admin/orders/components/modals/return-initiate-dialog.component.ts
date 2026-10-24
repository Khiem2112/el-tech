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
        <div class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 text-xs text-slate-200 flex flex-col">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                Chuyển Hàng Hoàn Về Kho Chi Nhánh (MOD-14)
              </h3>
              <p class="text-xs text-slate-400">
                Quy trình: Giao thất bại sang Đang chuyển hoàn
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
            Ghi nhận kiện hàng đang trên đường vận chuyển ngược về kho chi nhánh do khách từ chối nhận hoặc vượt quá số lần giao lại cho phép (ORD-025). Đơn hàng sẽ chuyển sang trạng thái Đang Chuyển Hoàn (RETURNING).
          </div>

          <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded space-y-1">
            <div class="text-slate-400">Kho chi nhánh đích nhận hàng hoàn:</div>
            <div class="text-white font-semibold">
              {{ order().fulfillmentBranch.name }} ({{ order().fulfillmentBranch.code }})
            </div>
            <div class="text-[11px] text-slate-400">
              Địa chỉ: {{ order().fulfillmentBranch.address }}
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Ghi chú chuyển hoàn (Mã vận đơn khứ hồi, lý do gửi trả)
            </label>
            <textarea
              [(ngModel)]="note"
              rows="2"
              placeholder="Shipper xác nhận chuyển kiện hàng quay trở lại kho..."
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
            ></textarea>
          </div>

          @if (errorMessage()) {
            <div class="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#272f3d]">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold text-xs rounded transition-colors disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              @if (isSubmitting()) {
                <span>Đang xử lý chuyển hoàn...</span>
              } @else {
                <span>Xác Nhận Chuyển Hoàn</span>
              }
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