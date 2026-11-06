import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { AdminComplaintItem } from '../services/admin-complaint.service';

@Component({
  selector: 'app-complaint-delete-dialog',
  standalone: true,
  imports: [CommonModule, AppIconModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        (click)="onCancel()"
        class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      ></div>

      <div
        class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-md z-10 text-sm text-foreground overflow-hidden"
      >
        <div class="p-6 space-y-4">
          <div class="flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 flex-shrink-0">
              <lucide-icon name="alert-triangle" class="w-5 h-5" aria-hidden="true"></lucide-icon>
            </div>
            <div>
              <h3 class="font-bold text-foreground text-base">
                Xác Nhận Xóa Phiếu Khiếu Nại
              </h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa phiếu khiếu nại
                <strong class="text-foreground tabular-nums font-mono">#{{ complaint.code }}</strong>
                của khách hàng
                <strong class="text-foreground">{{ complaint.customerName }}</strong>?
              </p>
            </div>
          </div>

          <div class="p-3 bg-surface-alt border border-line rounded-md text-xs text-muted space-y-1">
            <div>
              Mã đơn hàng:
              <strong class="text-foreground font-mono">{{ complaint.orderCode || 'Không có' }}</strong>
            </div>
            <div>
              Nội dung khiếu nại:
              <span class="text-foreground">{{ complaint.category }}</span>
            </div>
          </div>

          <p class="text-xs text-rose-600 font-medium">
            Thao tác này sẽ gỡ phiếu khiếu nại khỏi danh sách quản trị vận hành.
          </p>

          <div class="pt-2 border-t border-line flex items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground rounded text-xs font-semibold transition-colors cursor-pointer"
              [disabled]="isDeleting()"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              [disabled]="isDeleting()"
            >
              @if (isDeleting()) {
                <lucide-icon name="loader-circle" class="w-4 h-4 animate-spin" aria-hidden="true"></lucide-icon>
                <span>Đang xóa...</span>
              } @else {
                <lucide-icon name="trash-2" class="w-4 h-4" aria-hidden="true"></lucide-icon>
                <span>Xóa phiếu</span>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintDeleteDialogComponent {
  @Input({ required: true }) complaint!: AdminComplaintItem;
  @Input() isDeleting = signal<boolean>(false);
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
