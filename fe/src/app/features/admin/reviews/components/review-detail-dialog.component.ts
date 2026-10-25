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
        class="fixed inset-0 bg-[#090d16]/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      ></div>

      <div
        class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-sm overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-[#272f3d] px-6 py-4 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-white uppercase tracking-wide">
                Chi Tiết & Kiểm Duyệt Đánh Giá
              </h3>
              <span class="text-[10px] font-mono bg-[#090d16] text-[#76b900] border border-[#272f3d] px-2 py-0.5 rounded">
                MOD-38
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              Kiểm duyệt nội dung và quản lý hiển thị đánh giá sản phẩm
            </p>
          </div>

          <button
            type="button"
            (click)="onClose()"
            class="p-1.5 rounded-md hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
            title="Đóng hộp thoại"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded-lg space-y-3">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-xs font-semibold uppercase text-slate-400">Sản phẩm đánh giá</div>
                <div class="font-bold text-white text-base mt-0.5">
                  {{ review.productTemplate.name }}
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5">
                  Mã SKU: {{ review.sku.sku }}
                  @if (review.sku.variationLabel) {
                    <span> - {{ review.sku.variationLabel }}</span>
                  }
                </div>
              </div>

              <div class="text-right flex-shrink-0">
                <div class="text-xs font-semibold uppercase text-slate-400">Đánh giá</div>
                <div class="font-bold text-amber-400 text-lg tabular-nums mt-0.5">
                  {{ review.rating }} / 5 sao
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#272f3d]/60 text-xs">
              <div>
                <span class="text-slate-400">Người đánh giá:</span>
                <span class="font-semibold text-slate-200 ml-1">{{ review.customer.name }}</span>
                <div class="text-slate-400 text-[11px] mt-0.5">
                  {{ review.customer.email }} - {{ review.customer.phone }}
                </div>
              </div>
              <div class="md:text-right">
                <span class="text-slate-400">Đơn hàng hoàn tất:</span>
                <span class="font-mono font-bold text-[#76b900] ml-1">{{ review.order.code }}</span>
                <div class="text-slate-400 text-[11px] mt-0.5">
                  Ngày gửi: {{ review.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                </div>
              </div>
            </div>

            <div class="pt-2">
              <div class="text-xs font-semibold text-slate-400 uppercase mb-1">Nội dung nhận xét</div>
              <p class="text-slate-100 p-3 bg-[#161b26] rounded border border-[#272f3d] text-sm whitespace-pre-wrap leading-relaxed">
                "{{ review.text }}"
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between p-3 rounded-lg border" [class]="review.isVisible ? 'bg-[#76b900]/10 border-[#76b900]/30 text-[#88d400]' : 'bg-rose-950/30 border-rose-800/40 text-rose-300'">
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase font-extrabold tracking-wider">Trạng thái hiện tại:</span>
              <span class="px-2 py-0.5 rounded text-xs font-bold uppercase" [class]="review.isVisible ? 'bg-[#76b900]/20 text-[#88d400]' : 'bg-rose-900/40 text-rose-300'">
                {{ review.isVisible ? 'ĐANG HIỂN THỊ' : 'ĐÃ BỊ ẨN KHỎI GIAN HÀNG' }}
              </span>
            </div>
            @if (!review.isVisible && review.hiddenReason) {
              <div class="text-xs text-rose-300">
                Lý do ẩn: <strong class="text-white">{{ review.hiddenReason }}</strong>
              </div>
            }
          </div>

          <div class="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-amber-200 text-xs leading-relaxed">
            Hệ thống sẽ lưu vết nhân viên thực hiện ẩn hoặc hiện đánh giá vào lịch sử kiểm toán và không xóa bản ghi gốc trong cơ sở dữ liệu.
          </div>

          @if (review.isVisible) {
            <div>
              <label class="block font-semibold text-slate-300 text-xs uppercase mb-1.5">
                Lý do ẩn đánh giá <span class="text-rose-400">*</span>
              </label>
              <textarea
                rows="3"
                [(ngModel)]="reasonInput"
                placeholder="Nhập lý do ẩn (Spam, ngôn từ kích động, xúc phạm, lộ thông tin cá nhân... tối thiểu 3 ký tự)"
                class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded-md text-slate-100 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              ></textarea>
              @if (validationError()) {
                <p class="text-xs text-rose-400 mt-1 font-medium">{{ validationError() }}</p>
              }
            </div>
          } @else {
            <div>
              <label class="block font-semibold text-slate-300 text-xs uppercase mb-1.5">
                Ghi chú khi bỏ ẩn (Tùy chọn)
              </label>
              <textarea
                rows="2"
                [(ngModel)]="reasonInput"
                placeholder="Nhập ghi chú phục hồi hiển thị (Đã xác minh đánh giá hợp lệ...)"
                class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded-md text-slate-100 text-sm focus:outline-none focus:border-[#76b900] transition-colors"
              ></textarea>
            </div>
          }

          @if (review.revisionHistory && review.revisionHistory.length > 0) {
            <div class="pt-2">
              <div class="text-xs font-semibold text-slate-400 uppercase mb-2">Lịch sử kiểm toán</div>
              <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                @for (hist of review.revisionHistory; track hist.changedAt) {
                  <div class="p-2 bg-[#090d16] border border-[#272f3d] rounded text-xs flex items-center justify-between">
                    <div>
                      <span class="font-bold text-slate-200">{{ hist.action }}</span>
                      <span class="text-slate-400 ml-2">bởi {{ hist.changedBy }}</span>
                      @if (hist.reason) {
                        <span class="text-slate-300 block text-[11px] mt-0.5">Lý do: {{ hist.reason }}</span>
                      }
                    </div>
                    <span class="text-slate-500 tabular-nums text-[11px]">
                      {{ hist.changedAt | date: 'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#272f3d] bg-[#090d16] flex-shrink-0">
          <button
            type="button"
            (click)="onClose()"
            class="px-4 py-2 bg-[#161b26] border border-[#272f3d] hover:bg-[#272f3d] text-slate-300 hover:text-white rounded-md font-semibold text-xs transition-colors"
          >
            Đóng
          </button>

          @if (review.isVisible) {
            <button
              type="button"
              (click)="onToggleVisibility(false)"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-md text-xs shadow-sm transition-colors flex items-center gap-1.5"
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
              class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:opacity-50 text-[#090d16] font-bold rounded-md text-xs shadow-sm transition-colors flex items-center gap-1.5"
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
