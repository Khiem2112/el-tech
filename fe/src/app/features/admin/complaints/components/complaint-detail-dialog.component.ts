import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { AdminComplaintItem, ComplaintStatus } from '../services/admin-complaint.service';

@Component({
  selector: 'app-complaint-detail-dialog',
  standalone: true,
  imports: [CommonModule, RouterModule, AppIconModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        (click)="onClose()"
        class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      ></div>

      <div
        class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-sm text-foreground overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-line px-6 py-4 flex-shrink-0 bg-surface">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider tabular-nums font-mono bg-surface-alt border border-line text-foreground">
                #{{ complaint.code }}
              </span>
              <span
                class="px-2.5 py-0.5 rounded text-xs font-bold"
                [class]="getStatusBadgeClass(complaint.status)"
              >
                {{ getStatusLabel(complaint.status) }}
              </span>
            </div>
            <h3 class="font-bold text-foreground text-base mt-1.5">
              {{ complaint.title || complaint.category }}
            </h3>
          </div>

          <button
            type="button"
            (click)="onClose()"
            class="p-1.5 rounded-md hover:bg-surface-alt text-muted hover:text-foreground transition-colors cursor-pointer"
            title="Đóng hộp thoại"
            aria-label="Đóng hộp thoại"
          >
            <lucide-icon name="x" class="w-5 h-5" aria-hidden="true"></lucide-icon>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-3.5 bg-surface-alt rounded-lg border border-line space-y-2">
              <div class="text-xs font-bold uppercase text-muted tracking-wide flex items-center gap-1.5">
                <lucide-icon name="user" class="w-3.5 h-3.5 text-primary" aria-hidden="true"></lucide-icon>
                <span>Thông tin khách hàng</span>
              </div>
              <div class="space-y-1 text-xs">
                <div>
                  <span class="text-muted">Họ và tên:</span>
                  <strong class="text-foreground ml-1">{{ complaint.customerName }}</strong>
                </div>
                <div>
                  <span class="text-muted">Số điện thoại:</span>
                  <strong class="text-foreground ml-1 tabular-nums">{{ complaint.customerPhone }}</strong>
                </div>
                <div>
                  <span class="text-muted">Email liên hệ:</span>
                  <span class="text-foreground ml-1">{{ complaint.customerEmail || 'Chưa cung cấp' }}</span>
                </div>
              </div>
            </div>

            <div class="p-3.5 bg-surface-alt rounded-lg border border-line space-y-2">
              <div class="text-xs font-bold uppercase text-muted tracking-wide flex items-center gap-1.5">
                <lucide-icon name="package" class="w-3.5 h-3.5 text-primary" aria-hidden="true"></lucide-icon>
                <span>Thông tin đơn hàng & Thiết bị</span>
              </div>
              <div class="space-y-1 text-xs">
                <div>
                  <span class="text-muted">Mã đơn hàng:</span>
                  @if (complaint.orderCode) {
                    <span class="text-primary font-bold ml-1 tabular-nums font-mono">
                      {{ complaint.orderCode }}
                    </span>
                  } @else {
                    <span class="text-muted ml-1">Không liên kết mã đơn</span>
                  }
                </div>
                <div>
                  <span class="text-muted">Số Serial (S/N):</span>
                  <span class="text-foreground ml-1 tabular-nums font-mono font-medium">
                    {{ complaint.serialNumber || 'Không có' }}
                  </span>
                </div>
                <div>
                  <span class="text-muted">Thời điểm gửi:</span>
                  <span class="text-foreground ml-1 tabular-nums">
                    {{ complaint.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-surface rounded-lg border border-line space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-muted uppercase tracking-wide">Phân loại khiếu nại</span>
              <span class="px-2 py-0.5 rounded bg-surface-alt border border-line font-medium text-foreground">
                {{ complaint.category }}
              </span>
            </div>
            <div>
              <div class="text-xs font-bold text-muted uppercase tracking-wide mb-1">Mô tả tình trạng từ khách</div>
              <p class="text-foreground p-3 bg-surface-alt rounded border border-line text-xs whitespace-pre-wrap leading-relaxed">
                {{ complaint.description }}
              </p>
            </div>
          </div>

          @if (complaint.attachments.length > 0) {
            <div class="space-y-2">
              <div class="text-xs font-bold text-muted uppercase tracking-wide">Tệp & Hình ảnh đính kèm</div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                @for (imgUrl of complaint.attachments; track imgUrl) {
                  <a
                    [href]="imgUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block rounded-lg overflow-hidden border border-line hover:border-primary transition-colors aspect-video bg-surface-alt"
                  >
                    <img [src]="imgUrl" alt="Tệp đính kèm khiếu nại" class="w-full h-full object-cover" />
                  </a>
                }
              </div>
            </div>
          }

          <div class="p-4 rounded-lg border border-line space-y-2" [class]="getResolutionBoxClass(complaint.status)">
            <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
              <span>Tiến độ & Ghi chú xử lý</span>
              <span>{{ getStatusLabel(complaint.status) }}</span>
            </div>

            @if (complaint.resolutionNote) {
              <div class="text-xs leading-relaxed whitespace-pre-wrap">
                {{ complaint.resolutionNote }}
              </div>
            } @else {
              <p class="text-xs text-muted italic">
                Chưa có ghi chú xử lý từ nhân viên tiếp nhận.
              </p>
            }

            <div class="pt-2 border-t border-line/40 flex items-center justify-between text-xs text-muted">
              <span>Người phụ trách: <strong class="text-foreground">{{ complaint.resolvedBy || 'Chưa phân công' }}</strong></span>
              @if (complaint.resolvedAt) {
                <span class="tabular-nums">Xử lý lúc: {{ complaint.resolvedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              }
            </div>
          </div>
        </div>

        <div class="border-t border-line px-6 py-3.5 bg-surface-alt flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            (click)="onOpenStatusDialog()"
            class="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <lucide-icon name="pencil" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
            <span>Cập nhật trạng thái</span>
          </button>

          <button
            type="button"
            (click)="onClose()"
            class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintDetailDialogComponent {
  @Input({ required: true }) complaint!: AdminComplaintItem;
  @Output() close = new EventEmitter<void>();
  @Output() changeStatus = new EventEmitter<AdminComplaintItem>();

  onClose(): void {
    this.close.emit();
  }

  onOpenStatusDialog(): void {
    this.changeStatus.emit(this.complaint);
  }

  getStatusLabel(status: ComplaintStatus): string {
    switch (status) {
      case 'RECEIVED':
        return 'Đã tiếp nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'RESOLVED':
        return 'Đã xử lý';
      case 'DISMISSED':
        return 'Không xử lý';
      default:
        return status;
    }
  }

  getStatusBadgeClass(status: ComplaintStatus): string {
    switch (status) {
      case 'RECEIVED':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'PROCESSING':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'DISMISSED':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      default:
        return 'bg-surface-alt text-muted border border-line';
    }
  }

  getResolutionBoxClass(status: ComplaintStatus): string {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-300';
      case 'DISMISSED':
        return 'bg-rose-500/5 border-rose-500/30 text-rose-800 dark:text-rose-300';
      case 'PROCESSING':
        return 'bg-primary/5 border-primary/30 text-foreground';
      default:
        return 'bg-surface-alt border-line text-foreground';
    }
  }
}
