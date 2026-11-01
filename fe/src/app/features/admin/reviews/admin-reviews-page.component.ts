import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppIconModule } from '../../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { ReviewDetailDialogComponent } from './components/review-detail-dialog.component';
import {
  AdminReviewItem,
  AdminReviewService,
} from './services/admin-review.service';

type ToastNotification = {
  readonly id: string;
  readonly message: string;
  readonly type: 'success' | 'error' | 'warning';
};

@Component({
  selector: 'app-admin-reviews-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReviewDetailDialogComponent, AppIconModule, SelectComponent],
  template: `
    <div class="p-4 lg:p-6 space-y-4 w-full text-xs text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold tracking-tight uppercase text-foreground">
            Đánh Giá Sản Phẩm
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Theo dõi ý kiến phản hồi và đánh giá sản phẩm từ người dùng
          </p>
        </div>
      </div>

      <div class="bg-surface border border-line rounded overflow-hidden">
        <div class="p-3 border-b border-line flex items-center justify-between flex-wrap gap-2.5">
          <div class="flex items-center flex-wrap gap-2 flex-1">
            <div class="relative min-w-[200px] max-w-xs flex-1">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
                placeholder="Tìm sản phẩm, khách, mã đơn..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground placeholder-muted focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <app-select
              [options]="ratingOptions"
              [value]="selectedRating"
              (valueChange)="selectedRating = $event; onFilterChange()"
              size="sm"
              class="w-40"
              ariaLabel="Lọc theo số sao đánh giá"
            />

            <app-select
              [options]="visibilityOptions"
              [value]="selectedVisibility"
              (valueChange)="onVisibilitySelect($event)"
              size="sm"
              class="w-40"
              ariaLabel="Lọc theo trạng thái hiển thị"
            />

            <button
              type="button"
              (click)="onSearch()"
              class="px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-sm transition-colors cursor-pointer"
            >
              Lọc dữ liệu
            </button>
          </div>
        </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-surface-alt/70 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-3 px-4">Sản phẩm</th>
                  <th class="py-3 px-4">Khách hàng</th>
                  <th class="py-3 px-4 text-center">Đánh giá</th>
                  <th class="py-3 px-4">Nội dung</th>
                  <th class="py-3 px-4">Mã đơn</th>
                  <th class="py-3 px-4 text-center">Trạng thái</th>
                  <th class="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-sm">
                @if (reviewService.isLoading()) {
                  <tr>
                    <td colspan="7" class="py-12 text-center text-muted">
                      <div class="inline-block animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                      <div>Đang tải dữ liệu đánh giá sản phẩm...</div>
                    </td>
                  </tr>
                } @else if (reviewService.reviews().length === 0) {
                  <tr>
                    <td colspan="7" class="py-12 text-center text-muted">
                      Không tìm thấy đánh giá sản phẩm nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                } @else {
                  @for (rev of reviewService.reviews(); track rev.id) {
                    <tr class="hover:bg-surface-alt/40 transition-colors">
                      <td class="py-3 px-4">
                        <div class="font-bold text-foreground max-w-xs truncate">
                          {{ rev.productTemplate.name }}
                        </div>
                        <div class="text-xs text-muted tabular-nums mt-0.5">
                          SKU: {{ rev.sku.sku }}
                        </div>
                      </td>

                      <td class="py-3 px-4">
                        <div class="font-semibold text-foreground">{{ rev.customer?.name || rev.authorName || 'Khách vãng lai' }}</div>
                        <div class="text-xs text-muted mt-0.5">{{ rev.customer?.email || 'Chưa liên kết tài khoản' }}</div>
                      </td>

                      <td class="py-3 px-4 text-center font-bold text-amber-600 tabular-nums">
                        {{ rev.rating }} / 5 sao
                      </td>

                      <td class="py-3 px-4 text-foreground/80 max-w-xs truncate" [title]="rev.text">
                        {{ rev.text }}
                      </td>

                      <td class="py-3 px-4 font-bold text-primary tabular-nums">
                        @if (rev.order) {
                          <a
                            [routerLink]="['/admin/orders', rev.order.id]"
                            class="hover:underline"
                          >
                            {{ rev.order.code }}
                          </a>
                        } @else {
                          <span class="text-xs text-muted font-normal">Đánh giá tự do</span>
                        }
                      </td>

                      <td class="py-3 px-4 text-center">
                        @if (rev.isVisible) {
                          <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                            HIỂN THỊ
                          </span>
                        } @else {
                          <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                            ĐÃ BỊ ẨN
                          </span>
                        }
                      </td>

                      <td class="py-3 px-4 text-right">
                        <button
                          type="button"
                          (click)="openDetailDialog(rev)"
                          class="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-surface-alt text-muted hover:text-primary transition-colors cursor-pointer"
                          title="Xem chi tiết"
                          aria-label="Xem chi tiết nhận xét đánh giá"
                        >
                          <lucide-icon name="file-text" class="size-4" aria-hidden="true"></lucide-icon>
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          @if (reviewService.total() > 0) {
            <div class="p-4 border-t border-line flex items-center justify-between text-sm text-muted">
              <div>
                Hiển thị trang <strong class="text-foreground tabular-nums">{{ reviewService.page() }}</strong> /
                <strong class="text-foreground tabular-nums">{{ reviewService.totalPages() }}</strong>
                (Tổng cộng <strong class="text-foreground tabular-nums">{{ reviewService.total() }}</strong> đánh giá)
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  [disabled]="reviewService.page() <= 1 || reviewService.isLoading()"
                  (click)="goToPage(reviewService.page() - 1)"
                  class="px-3 py-1 bg-surface-alt hover:bg-surface-alt/80 border border-line rounded disabled:opacity-40 text-foreground transition-colors text-sm cursor-pointer"
                >
                  Trước
                </button>
                <button
                  type="button"
                  [disabled]="reviewService.page() >= reviewService.totalPages() || reviewService.isLoading()"
                  (click)="goToPage(reviewService.page() + 1)"
                  class="px-3 py-1 bg-surface-alt hover:bg-surface-alt/80 border border-line rounded disabled:opacity-40 text-foreground transition-colors text-sm cursor-pointer"
                >
                  Sau
                </button>
              </div>
            </div>
          }
        </div>

      @if (selectedReview()) {
        <app-review-detail-dialog
          [review]="selectedReview()!"
          (closed)="closeDetailDialog()"
        />
      }

      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        @for (toast of toasts(); track toast.id) {
          <div
            class="px-4 py-2.5 rounded-md shadow-lg text-sm font-semibold border flex items-center justify-between gap-3 transition-all"
            [class]="toast.type === 'success' ? 'bg-surface border-emerald-500 text-emerald-700' : toast.type === 'error' ? 'bg-surface border-rose-500 text-rose-700' : 'bg-surface border-amber-500 text-amber-700'"
          >
            <span>{{ toast.message }}</span>
            <button
              type="button"
              (click)="removeToast(toast.id)"
              class="text-muted hover:text-foreground cursor-pointer"
            >
              x
            </button>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReviewsPageComponent implements OnInit {
  readonly reviewService = inject(AdminReviewService);
  private readonly route = inject(ActivatedRoute);

  readonly ratingOptions: readonly SelectOption[] = [
    { value: '', label: 'Tất cả số sao (1-5)' },
    { value: '5', label: '5 sao' },
    { value: '4', label: '4 sao' },
    { value: '3', label: '3 sao' },
    { value: '2', label: '2 sao' },
    { value: '1', label: '1 sao' },
  ];

  readonly visibilityOptions: readonly SelectOption[] = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'true', label: 'Đang hiển thị' },
    { value: 'false', label: 'Đã bị ẩn' },
  ];

  searchQuery = '';
  selectedRating = '';
  selectedVisibility: 'all' | 'true' | 'false' = 'all';

  onVisibilitySelect(val: string): void {
    this.selectedVisibility = val as 'all' | 'true' | 'false';
    void this.onFilterChange();
  }

  readonly selectedReview = signal<AdminReviewItem | null>(null);
  readonly toasts = signal<readonly ToastNotification[]>([]);

  ngOnInit(): void {
    const searchParam = this.route.snapshot.queryParams['search'];
    if (searchParam) {
      this.searchQuery = searchParam;
    }
    void this.loadData();
  }

  async loadData(): Promise<void> {
    const rating = this.selectedRating ? parseInt(this.selectedRating, 10) : undefined;
    await this.reviewService.loadReviews({
      page: 1,
      rating,
      isVisible: this.selectedVisibility,
      search: this.searchQuery,
    });
  }

  async onFilterChange(): Promise<void> {
    await this.loadData();
  }

  async onSearch(): Promise<void> {
    await this.loadData();
  }

  async goToPage(page: number): Promise<void> {
    const rating = this.selectedRating ? parseInt(this.selectedRating, 10) : undefined;
    await this.reviewService.loadReviews({
      page,
      rating,
      isVisible: this.selectedVisibility,
      search: this.searchQuery,
    });
  }

  openDetailDialog(review: AdminReviewItem): void {
    this.selectedReview.set(review);
  }

  closeDetailDialog(): void {
    this.selectedReview.set(null);
  }

  addToast(message: string, type: 'success' | 'error' | 'warning'): void {
    const id = Date.now().toString();
    const toast: ToastNotification = { id, message, type };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
