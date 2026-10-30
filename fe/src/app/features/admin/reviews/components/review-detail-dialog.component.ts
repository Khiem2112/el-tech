import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminReviewItem, AdminReviewService } from '../services/admin-review.service';

@Component({
  selector: 'app-review-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        (click)="onClose()"
        class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      ></div>

      <div
        class="relative bg-white border border-line rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-sm text-foreground overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-line px-6 py-4 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-foreground uppercase tracking-wide text-base">
                Chi Tiết & Kiểm Duyệt Đánh Giá
              </h3>
            </div>
            <p class="text-xs text-muted mt-0.5">
              Kiểm duyệt nội dung và quản lý hiển thị đánh giá sản phẩm
            </p>
          </div>

          <button
            type="button"
            (click)="onClose()"
            class="p-1.5 rounded-md hover:bg-surface-alt text-muted hover:text-foreground transition-colors cursor-pointer"
            title="Đóng hộp thoại"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="p-4 bg-surface border border-line rounded-lg space-y-3">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-xs font-semibold uppercase text-muted">Sản phẩm đánh giá</div>
                <div class="font-bold text-foreground text-base mt-0.5">
                  {{ review.productTemplate.name }}
                </div>
                <div class="text-xs text-muted tabular-nums mt-0.5">
                  Mã SKU: {{ review.sku.sku }}
                  @if (review.sku.variationLabel) {
                    <span> - {{ review.sku.variationLabel }}</span>
                  }
                </div>
              </div>

              <div class="text-right flex-shrink-0">
                <div class="text-xs font-semibold uppercase text-muted">Đánh giá</div>
                <div class="font-bold text-amber-600 text-lg tabular-nums mt-0.5">
                  {{ review.rating }} / 5 sao
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-line text-xs">
              <div>
                <span class="text-muted">Người đánh giá:</span>
                <span class="font-semibold text-foreground ml-1">{{ review.customer?.name || review.authorName || 'Khách vãng lai' }}</span>
                <div class="text-muted text-xs mt-0.5">
                  {{ review.customer?.email || 'Không có email' }} - {{ review.customer?.phone || 'Không có SĐT' }}
                </div>
              </div>
              <div class="md:text-right">
                <span class="text-muted">Đơn hàng hoàn tất:</span>
                <span class="font-bold text-primary ml-1 tabular-nums">{{ review.order?.code || 'Đánh giá tự do' }}</span>
                <div class="text-muted text-xs mt-0.5">
                  Ngày gửi: {{ review.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                </div>
              </div>
            </div>

            <div class="pt-2">
              <div class="text-xs font-semibold text-muted uppercase mb-1">Nội dung nhận xét</div>
              <p class="text-foreground p-3 bg-white rounded border border-line text-sm whitespace-pre-wrap leading-relaxed">
                "{{ review.text }}"
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between p-2.5 rounded border" [class]="review.isVisible ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'">
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase font-bold tracking-wider">Trạng thái:</span>
              <span class="px-2 py-0.5 rounded text-xs font-bold uppercase" [class]="review.isVisible ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-700 dark:text-rose-400'">
                {{ review.isVisible ? 'ĐANG HIỂN THỊ' : 'ĐÃ BỊ ẨN' }}
              </span>
            </div>
            @if (!review.isVisible && review.hiddenReason) {
              <div class="text-xs">
                Lý do: <strong class="text-foreground">{{ review.hiddenReason }}</strong>
              </div>
            }
          </div>

          @if (review.isVisible) {
            <div>
              <label class="block font-semibold text-foreground text-xs uppercase mb-1.5">
                Lý do ẩn đánh giá <span class="text-rose-600">*</span>
              </label>
              <textarea
                rows="3"
                [(ngModel)]="reasonInput"
                placeholder="Nhập lý do ẩn (Spam, ngôn từ kích động, xúc phạm, lộ thông tin cá nhân... tối thiểu 3 ký tự)"
                class="w-full px-3 py-2 bg-surface border border-line rounded-md text-foreground text-sm focus:outline-none focus:border-rose-500 transition-colors"
              ></textarea>
              @if (validationError()) {
                <p class="text-xs text-rose-600 mt-1 font-medium">{{ validationError() }}</p>
              }
            </div>
          } @else {
            <div>
              <label class="block font-semibold text-foreground text-xs uppercase mb-1.5">
                Ghi chú khi bỏ ẩn (Tùy chọn)
              </label>
              <textarea
                rows="2"
                [(ngModel)]="reasonInput"
                placeholder="Nhập ghi chú phục hồi hiển thị (Đã xác minh đánh giá hợp lệ...)"
                class="w-full px-3 py-2 bg-surface border border-line rounded-md text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              ></textarea>
            </div>
          }

          @if (review.revisionHistory && review.revisionHistory.length > 0) {
            <div class="pt-2">
              <div class="text-xs font-semibold text-muted uppercase mb-2">Lịch sử kiểm toán</div>
              <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                @for (hist of review.revisionHistory; track hist.changedAt) {
                  <div class="p-2 bg-surface border border-line rounded text-xs flex items-center justify-between">
                    <div>
                      <span class="font-bold text-foreground">{{ hist.action }}</span>
                      <span class="text-muted ml-2">bởi {{ hist.changedBy }}</span>
                      @if (hist.reason) {
                        <span class="text-muted block text-xs mt-0.5">Lý do: {{ hist.reason }}</span>
                      }
                    </div>
                    <span class="text-muted tabular-nums text-xs">
                      {{ hist.changedAt | date: 'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-line bg-surface-alt/40 flex-shrink-0">
          <button
            type="button"
            (click)="onClose()"
            class="px-4 py-2 bg-surface-alt border border-line hover:bg-surface-alt/80 text-foreground rounded-md font-semibold text-sm transition-colors cursor-pointer"
          >
            Đóng
          </button>

          @if (review.isVisible) {
            <button
              type="button"
              (click)="onToggleVisibility(false)"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-md text-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              @if (isSubmitting()) {
                <span>Đang xử lý...</span>
              } @else {
                <span>Ẩn Đánh Giá Khỏi Gian Hàng</span>
              }
            </button>
          } @else {
            <button
              type="button"
              (click)="onToggleVisibility(true)"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-bold rounded-md text-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              @if (isSubmitting()) {
                <span>Đang xử lý...</span>
              } @else {
                <span>Hiện Lại Đánh Giá</span>
              }
            </button>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDetailDialogComponent {
  @Input({ required: true }) review!: AdminReviewItem;
  @Output() closed = new EventEmitter<void>();
  @Output() visibilityChanged = new EventEmitter<AdminReviewItem>();

  private readonly reviewService = inject(AdminReviewService);

  reasonInput = '';
  readonly validationError = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  onClose(): void {
    this.closed.emit();
  }

  async onToggleVisibility(targetVisible: boolean): Promise<void> {
    this.validationError.set(null);

    if (!targetVisible && (!this.reasonInput || this.reasonInput.trim().length < 3)) {
      this.validationError.set('Vui lòng nhập lý do ẩn đánh giá (tối thiểu 3 ký tự).');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const updated = await this.reviewService.updateVisibility(
        this.review.id,
        targetVisible,
        this.reasonInput.trim() || undefined,
      );
      this.visibilityChanged.emit(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái hiển thị';
      this.validationError.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
