import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { PurchaseOrderDetail } from '../services/admin-purchase-order.service';

@Component({
  selector: 'app-confirm-po-dialog',
  standalone: true,
  imports: [CommonModule, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen && po) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-white border border-line rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 z-10 text-xs text-foreground"
        >
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Xác Nhận Đơn Mua Hàng
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Khóa dữ liệu và chuyển đơn PO #{{ po.code }} sang trạng thái đã xác nhận
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
              title="Đóng"
              aria-label="Đóng"
            >
              <lucide-icon name="x" class="size-4" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          <div class="bg-surface p-3.5 rounded-lg border border-line space-y-2 text-xs">
            <div class="flex justify-between items-center text-muted">
              <span>Nhà cung cấp:</span>
              <strong class="text-foreground text-right truncate max-w-[220px]">{{ po.supplier.name }}</strong>
            </div>
            <div class="flex justify-between items-center text-muted">
              <span>Kho nhận hàng:</span>
              <strong class="text-foreground text-right truncate max-w-[220px]">{{ po.receivingBranch.name }}</strong>
            </div>
            <div class="flex justify-between items-center text-muted">
              <span>Quy mô đơn:</span>
              <span class="text-foreground">
                <strong class="tabular tabular-nums">{{ po.lines.length }}</strong> dòng linh kiện
                (<strong class="tabular tabular-nums">{{ po.totalQuantity }}</strong> chiếc)
              </span>
            </div>
            <div class="flex justify-between items-center text-muted pt-2 border-t border-line">
              <span class="font-semibold text-foreground">Tổng giá trị đơn:</span>
              <strong class="text-primary text-sm tabular-nums tabular font-bold">
                {{ formatCurrency(po.totalAmount) }} ₫
              </strong>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              (click)="onCancel()"
              [disabled]="isSubmitting"
              class="px-4 py-2 bg-surface-alt hover:bg-surface-alt/80 border border-line rounded font-semibold text-sm text-foreground transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              [disabled]="isSubmitting"
              class="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded text-sm transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
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

  formatCurrency(value: string | number | undefined): string {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('vi-VN');
  }
}
