import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
import { AdminComplaintItem, ComplaintStatus } from '../services/admin-complaint.service';

export type ComplaintStatusChangePayload = {
  readonly status: ComplaintStatus;
  readonly resolutionNote: string;
};

@Component({
  selector: 'app-complaint-status-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconModule, SelectComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        (click)="onCancel()"
        class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      ></div>

      <div
        class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-lg z-10 text-sm text-foreground overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-line px-6 py-4 bg-surface">
          <div>
            <h3 class="font-bold text-foreground text-base">
              Chuyển Trạng Thái Khiếu Nại
            </h3>
            <p class="text-xs text-muted mt-0.5">
              Cập nhật quy trình tiếp nhận và ghi nhận phương án giải quyết cho phiếu
              <strong class="text-foreground tabular-nums font-mono">#{{ complaint.code }}</strong>
            </p>
          </div>

          <button
            type="button"
            (click)="onCancel()"
            class="p-1.5 rounded-md hover:bg-surface-alt text-muted hover:text-foreground transition-colors cursor-pointer"
            title="Đóng"
            aria-label="Đóng"
          >
            <lucide-icon name="x" class="w-5 h-5" aria-hidden="true"></lucide-icon>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
              Trạng thái tiếp nhận & xử lý <span class="text-rose-500">*</span>
            </label>
            <app-select
              [options]="statusOptions"
              [value]="selectedStatus"
              (valueChange)="selectedStatus = $event"
              size="sm"
              ariaLabel="Chọn trạng thái khiếu nại"
            />
            <p class="text-xs text-muted mt-1">
              {{ getStatusDescription(selectedStatus) }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
              Ghi chú xử lý / Phương án giải quyết
            </label>
            <textarea
              [(ngModel)]="resolutionNote"
              name="resolutionNote"
              rows="4"
              placeholder="Nhập chi tiết biện pháp hỗ trợ, kết quả kiểm định kỹ thuật hoặc lý do từ chối xử lý..."
              class="w-full px-3 py-2 bg-surface border border-line rounded text-xs text-foreground placeholder-muted focus:outline-none focus:border-primary resize-none leading-relaxed"
            ></textarea>
            <p class="text-xs text-muted mt-1">
              Ghi chú sẽ được lưu vào lịch sử tiếp nhận để phục vụ tra cứu bảo hành và đối soát.
            </p>
          </div>

          @if (errorMessage()) {
            <div class="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-600 font-medium">
              {{ errorMessage() }}
            </div>
          }

          <div class="pt-3 border-t border-line flex items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground rounded text-xs font-semibold transition-colors cursor-pointer"
              [disabled]="isSaving()"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              [disabled]="isSaving()"
            >
              @if (isSaving()) {
                <lucide-icon name="loader-circle" class="w-4 h-4 animate-spin" aria-hidden="true"></lucide-icon>
                <span>Đang lưu...</span>
              } @else {
                <lucide-icon name="check" class="w-4 h-4" aria-hidden="true"></lucide-icon>
                <span>Lưu thay đổi</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintStatusDialogComponent implements OnInit {
  @Input({ required: true }) complaint!: AdminComplaintItem;
  @Input() isSaving = signal<boolean>(false);
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<ComplaintStatusChangePayload>();

  selectedStatus: string = 'RECEIVED';
  resolutionNote: string = '';
  readonly errorMessage = signal<string | null>(null);

  readonly statusOptions: readonly SelectOption[] = [
    { value: 'RECEIVED', label: 'Đã tiếp nhận (Chờ xử lý)' },
    { value: 'PROCESSING', label: 'Đang xử lý ngoại tuyến' },
    { value: 'RESOLVED', label: 'Đã xử lý (Hoàn tất giải quyết)' },
    { value: 'DISMISSED', label: 'Không xử lý (Từ chối giải quyết)' },
  ];

  ngOnInit(): void {
    this.selectedStatus = this.complaint.status;
    this.resolutionNote = this.complaint.resolutionNote || '';
  }

  getStatusDescription(status: string): string {
    switch (status) {
      case 'RECEIVED':
        return 'Phiếu mới được khách hàng gửi lên, chờ kỹ thuật viên kiểm định sơ bộ.';
      case 'PROCESSING':
        return 'Kỹ thuật viên đang kiểm định linh kiện hoặc liên hệ các bên liên quan để xử lý.';
      case 'RESOLVED':
        return 'Đã hoàn tất đổi mới, sửa chữa linh kiện hoặc hoàn tiền thành công cho khách.';
      case 'DISMISSED':
        return 'Không giải quyết do lỗi vật lý do người dùng gây ra hoặc ngoài phạm vi chính sách.';
      default:
        return '';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    const status = this.selectedStatus as ComplaintStatus;

    if ((status === 'RESOLVED' || status === 'DISMISSED') && this.resolutionNote.trim().length < 5) {
      this.errorMessage.set('Vui lòng nhập ghi chú phương án xử lý hoặc lý do từ chối (tối thiểu 5 ký tự).');
      return;
    }

    this.save.emit({
      status,
      resolutionNote: this.resolutionNote.trim(),
    });
  }
}
