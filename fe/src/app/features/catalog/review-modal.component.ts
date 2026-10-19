import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconModule, ButtonDirective, InputDirective } from '../../components/atoms';

@Component({
  selector: 'app-review-modal',
  imports: [FormsModule, AppIconModule, ButtonDirective, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        (click)="onBackdropClick($event)"
      >
        <div
          class="relative w-full max-w-2xl bg-surface-dark border border-line-dark text-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Accent Line -->
          <div class="h-1.5 w-full bg-gradient-to-r from-primary via-primary-pale to-primary"></div>

          <!-- Header -->
          <div class="p-5 bg-surface-elevated border-b border-line-dark flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-white tracking-tight">Đánh Giá Linh Kiện Đã Mua</h2>
                <span class="text-xs font-mono text-muted">#{{ orderCode || 'ELT-87119' }}</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                  <lucide-icon name="shield-check" class="w-3 h-3" aria-hidden="true"></lucide-icon>
                  Verified Purchase
                </span>
              </div>
              <p class="text-xs text-muted mt-1">
                Linh kiện: <strong class="text-slate-200">{{ productName || 'Linh kiện phần cứng EL-TECH' }}</strong>
              </p>
            </div>
            <button
              type="button"
              (click)="close()"
              class="size-8 rounded-lg bg-surface-dark hover:bg-line-dark text-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-line-dark shrink-0"
              aria-label="Đóng cửa sổ đánh giá"
            >
              <lucide-icon name="x" class="w-4 h-4" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          <!-- Compliance Notice REV-004 -->
          <div class="px-5 py-2.5 bg-black/40 border-b border-line-dark/80 flex items-center gap-2 text-xs text-muted">
            <lucide-icon name="shield-check" class="w-4 h-4 text-primary shrink-0" aria-hidden="true"></lucide-icon>
            <span>Quy định REV-004: Mỗi Serial Number chỉ được cấp quyền đánh giá hiệu năng 1 lần duy nhất để bảo đảm dữ liệu benchmark công bằng.</span>
          </div>

          <!-- Modal Body -->
          <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <!-- 5-Star Rating -->
            <div class="p-4 rounded-xl bg-surface-elevated border border-line-dark flex flex-col items-center justify-center text-center">
              <span class="text-xs font-bold uppercase tracking-wider text-muted">Mức độ hài lòng tổng quan</span>
              <div class="flex items-center gap-2 py-2">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <button
                    type="button"
                    (click)="setRating(star)"
                    class="p-1 text-slate-600 hover:text-warning transition-colors cursor-pointer"
                    [class.text-warning]="star <= rating()"
                    [attr.aria-label]="star + ' sao'"
                  >
                    <lucide-icon name="star" class="w-7 h-7 fill-current" aria-hidden="true"></lucide-icon>
                  </button>
                }
              </div>
              <span class="text-xs font-bold text-primary">{{ ratingLabel() }}</span>
            </div>

            <!-- Technical Criteria Quick Pills -->
            <div class="space-y-1.5 text-xs">
              <span class="font-bold text-foreground-dark/70">Đặc tính kỹ thuật ấn tượng:</span>
              <div class="flex flex-wrap gap-2">
                @for (pill of criteriaList; track pill) {
                  <button
                    type="button"
                    (click)="togglePill(pill)"
                    class="px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer"
                    [class.bg-primary]="selectedPills().includes(pill)"
                    [class.text-primary-foreground]="selectedPills().includes(pill)"
                    [class.font-bold]="selectedPills().includes(pill)"
                    [class.border-primary]="selectedPills().includes(pill)"
                    [class.bg-surface-elevated]="!selectedPills().includes(pill)"
                    [class.text-foreground-dark/70]="!selectedPills().includes(pill)"
                    [class.border-line-dark]="!selectedPills().includes(pill)"
                  >
                    {{ pill }}
                  </button>
                }
              </div>
            </div>

            <!-- Review Textarea -->
            <div class="space-y-1 text-xs">
              <div class="flex justify-between items-center">
                <label for="review-content" class="font-bold text-foreground-dark/70">Nhận xét chi tiết trải nghiệm thực tế</label>
                <span class="text-[11px] text-slate-500">{{ reviewText.length }}/1000 ký tự</span>
              </div>
              <textarea
                id="review-content"
                appInput
                rows="3"
                [(ngModel)]="reviewText"
                placeholder="Chia sẻ nhiệt độ stress test Furmark, độ ổn định khi render hoặc chơi game..."
                class="w-full bg-surface-elevated border-line-dark text-white placeholder:text-slate-500 text-xs"
              ></textarea>
            </div>

            <!-- Pre-attached Media Mock -->
            <div class="space-y-1.5 text-xs">
              <span class="font-bold text-foreground-dark/70">Hình ảnh / Benchmark thực tế (Tùy chọn)</span>
              <div class="flex items-center gap-2">
                <div class="size-16 rounded-lg border border-dashed border-line-dark bg-surface-elevated flex flex-col items-center justify-center text-slate-500 hover:text-foreground-dark/70 cursor-pointer">
                  <lucide-icon name="camera" class="w-5 h-5" aria-hidden="true"></lucide-icon>
                  <span class="text-[9px] mt-0.5">Thêm ảnh</span>
                </div>
                <div class="size-16 rounded-lg border border-line-dark bg-surface-dark p-1 flex items-center justify-center text-[10px] text-primary font-bold text-center">
                  Tem Serial Đã Xác Thực
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="p-4 bg-surface-elevated border-t border-line-dark flex items-center justify-between gap-3">
            <span class="text-[11px] text-slate-500 hidden sm:inline">
              Bảo mật: 4 số cuối Serial sẽ được mã hóa khi hiển thị công khai.
            </span>
            <div class="flex items-center gap-2 ml-auto">
              <button
                type="button"
                (click)="close()"
                class="px-4 py-2 rounded-lg border border-line-dark text-xs font-semibold text-foreground-dark/70 hover:bg-line-dark transition-colors cursor-pointer"
              >
                Để sau
              </button>
              <button
                type="button"
                appButton
                variant="primary"
                size="sm"
                [disabled]="isSubmitting() || isSubmittedState()"
                (click)="submitReview()"
                class="min-w-[140px]"
              >
                @if (isSubmitting()) {
                  <span>Đang mã hóa...</span>
                } @else if (isSubmittedState()) {
                  <span>Đã gửi thành công!</span>
                } @else {
                  <span>Gửi đánh giá xác thực</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ReviewModalComponent {
  @Input() isOpen = false;
  @Input() orderCode = '';
  @Input() serialNumber = '';
  @Input() productName = '';
  @Output() closed = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ rating: number; content: string }>();

  protected readonly rating = signal(5);
  protected readonly selectedPills = signal<string[]>(['Nhiệt độ mát < 60°C', 'Êm ái không ồn']);
  protected readonly isSubmitting = signal(false);
  protected readonly isSubmittedState = signal(false);
  protected reviewText = '';

  protected readonly criteriaList = [
    'Nhiệt độ mát < 60°C',
    'Êm ái không ồn',
    'Hoàn thiện cao cấp',
    'Hiệu năng vượt kỳ vọng',
    'Tiết kiệm điện',
  ];

  protected ratingLabel(): string {
    switch (this.rating()) {
      case 1: return 'Rất thất vọng (1.0 / 5.0)';
      case 2: return 'Chưa đạt kỳ vọng (2.0 / 5.0)';
      case 3: return 'Tạm ổn trong tầm giá (3.0 / 5.0)';
      case 4: return 'Hài lòng, đúng cam kết (4.0 / 5.0)';
      case 5: return 'Rất hài lòng, hiệu năng cực đỉnh (5.0 / 5.0)';
      default: return '';
    }
  }

  protected setRating(stars: number): void {
    this.rating.set(stars);
  }

  protected togglePill(pill: string): void {
    this.selectedPills.update((current) => {
      if (current.includes(pill)) {
        return current.filter((p) => p !== pill);
      }
      return [...current, pill];
    });
  }

  protected close(): void {
    this.closed.emit();
    this.closeModal.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  protected submitReview(): void {
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSubmittedState.set(true);
      this.submitted.emit({
        rating: this.rating(),
        content: this.reviewText.trim(),
      });
      setTimeout(() => {
        this.isSubmittedState.set(false);
        this.close();
      }, 1200);
    }, 800);
  }
}
