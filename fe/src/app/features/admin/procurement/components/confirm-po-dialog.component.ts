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
          class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-white border border-line rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 z-10 text-[13px] text-foreground"
        >
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Xác Nhận Đơn Mua Hàng
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Bản thảo &rarr; Đã xác nhận (Phê duyệt đơn PO #{{ po.code }})
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-3.5 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs leading-relaxed space-y-1.5">
            <div class="font-semibold text-blue-900">Quy tắc nghiệp vụ PUR-003, PUR-005:</div>
            <div>
              Khi xác nhận, hệ thống sẽ khóa cứng toàn bộ thông tin đối tác nhà cung cấp (<strong>{{ po.supplier.name }}</strong>), kho chi nhánh nhận hàng (<strong>{{ po.receivingBranch.name }}</strong>), danh sách linh kiện, số lượng đặt và đơn giá thỏa thuận.
            </div>
            <div>
              Sau khi xác nhận, đơn hàng sẵn sàng cho quy trình đối soát nhập kho tại điểm đích. Không được phép chỉnh sửa dòng hàng trực tiếp.
            </div>
          </div>

          <div class="bg-surface p-3 rounded border border-line space-y-1">
            <div class="flex justify-between text-muted text-xs">
              <span>Tổng số mặt hàng:</span>
              <strong class="text-foreground">{{ po.lines.length }} linh kiện</strong>
            </div>
            <div class="flex justify-between text-muted text-xs">
              <span>Tổng số lượng:</span>
              <strong class="text-foreground">{{ po.totalQuantity }} chiếc</strong>
            </div>
            <div class="flex justify-between text-muted text-xs pt-1 border-t border-line">
              <span>Tổng giá trị đơn:</span>
              <strong class="text-primary text-[13px] tabular-nums font-mono font-bold">{{ po.totalAmount }} ₫</strong>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              (click)="onCancel()"
              [disabled]="isSubmitting"
              class="px-4 py-2 bg-surface-alt hover:bg-surface-alt/80 border border-line rounded font-semibold text-[13px] text-foreground transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              [disabled]="isSubmitting"
              class="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded text-[13px] transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              @if (isSubmitting) {
                <div class="w-3.5 h-3.5 border-2 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full animate-spin"></div>
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
