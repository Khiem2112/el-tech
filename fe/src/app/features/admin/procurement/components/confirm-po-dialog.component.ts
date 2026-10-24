import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { PurchaseOrderDetail } from '../services/admin-purchase-order.service';

@Component({
  selector: 'app-confirm-po-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen && po) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-[#090d16]/75 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 z-10 text-xs text-slate-200"
        >
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                Xác Nhận Đơn Mua Hàng
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Bản thảo &rarr; Đã xác nhận (Phê duyệt đơn PO #{{ po.code }})
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

          <div class="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded text-blue-200 text-xs leading-relaxed space-y-1.5">
            <div class="font-semibold text-blue-300">Quy tắc nghiệp vụ PUR-003, PUR-005:</div>
            <div>
              Khi xác nhận, hệ thống sẽ khóa cứng toàn bộ thông tin đối tác nhà cung cấp (<strong>{{ po.supplier.name }}</strong>), kho chi nhánh nhận hàng (<strong>{{ po.receivingBranch.name }}</strong>), danh sách linh kiện, số lượng đặt và đơn giá thỏa thuận.
            </div>
            <div>
              Sau khi xác nhận, đơn hàng sẵn sàng cho quy trình đối soát nhập kho tại điểm đích. Không được phép chỉnh sửa dòng hàng trực tiếp.
            </div>
          </div>

          <div class="bg-[#090d16] p-3 rounded border border-[#272f3d] space-y-1">
            <div class="flex justify-between text-slate-400">
              <span>Tổng số mặt hàng:</span>
              <strong class="text-white">{{ po.lines.length }} linh kiện</strong>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Tổng số lượng:</span>
              <strong class="text-white">{{ po.totalQuantity }} chiếc</strong>
            </div>
            <div class="flex justify-between text-slate-400 pt-1 border-t border-[#272f3d]">
              <span>Tổng giá trị đơn:</span>
              <strong class="text-[#76b900] text-sm tabular-nums font-mono">{{ po.totalAmount }} ₫</strong>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#272f3d]">
            <button
              type="button"
              (click)="onCancel()"
              [disabled]="isSubmitting"
              class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded font-semibold text-xs text-slate-300 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              [disabled]="isSubmitting"
              class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              @if (isSubmitting) {
                <div class="w-3.5 h-3.5 border-2 border-t-[#090d16] border-r-transparent border-b-[#090d16] border-l-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              } @else {
                <span>Xác Nhận Đơn Mua</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmPODialogComponent {
  @Input() po: PurchaseOrderDetail | null = null;
  @Input() isOpen = false;
  @Input() isSubmitting = false;

  @Output() readonly confirmed = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
