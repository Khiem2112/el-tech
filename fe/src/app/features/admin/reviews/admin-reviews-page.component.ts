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
    <div class="flex flex-col h-full bg-[#090d16] text-white overflow-hidden text-sm">
      <header class="h-14 bg-[#161b26] border-b border-[#272f3d] flex items-center justify-between px-6 flex-shrink-0">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold tracking-tight uppercase text-white">
            Đánh Giá Sản Phẩm
          </h1>
          <span class="text-xs text-slate-400 border-l border-[#272f3d] pl-3 font-mono">
            SCR-28
          </span>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400 hidden sm:inline">
            Chỉ khách hàng đã mua và hoàn tất đơn mới được đánh giá
          </span>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
          <div class="p-4 border-b border-[#272f3d] flex items-center justify-between flex-wrap gap-3">
            <span class="text-xs text-slate-400">
              Giám sát và kiểm duyệt nhận xét đánh giá từ khách hàng
            </span>

            <div class="flex items-center flex-wrap gap-2">
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="onSearch()"
                  placeholder="Tìm sản phẩm, khách, mã đơn..."
                  class="px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white placeholder-slate-500 focus:outline-none focus:border-[#76b900] text-xs w-52"
                />
              </div>

              <app-select
                [options]="ratingOptions"
                [value]="selectedRating"
                (valueChange)="selectedRating = $event; onFilterChange()"
                size="sm"
                class="w-44"
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
                class="px-3 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors"
              >
                Lọc dữ liệu
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-[#090d16]/70 border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
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
              <tbody class="divide-y divide-[#272f3d] text-xs">
                @if (reviewService.isLoading()) {
                  <tr>
                    <td colspan="7" class="py-12 text-center text-slate-400">
                      <div class="inline-block animate-spin w-6 h-6 border-2 border-[#76b900] border-t-transparent rounded-full mb-2"></div>
                      <div>Đang tải dữ liệu đánh giá sản phẩm...</div>
                    </td>
                  </tr>
                } @else if (reviewService.reviews().length === 0) {
                  <tr>
                    <td colspan="7" class="py-12 text-center text-slate-400">
                      Không tìm thấy đánh giá sản phẩm nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                } @else {
                  @for (rev of reviewService.reviews(); track rev.id) {
                    <tr class="hover:bg-[#1f2736] transition-colors">
                      <td class="py-3 px-4">
                        <div class="font-bold text-white max-w-xs truncate">
                          {{ rev.productTemplate.name }}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                          SKU: {{ rev.sku.sku }}
                        </div>
                      </td>

                      <td class="py-3 px-4">
                        <div class="font-semibold text-slate-200">{{ rev.customer.name }}</div>
                        <div class="text-[11px] text-slate-400 mt-0.5">{{ rev.customer.email }}</div>
                      </td>

                      <td class="py-3 px-4 text-center font-bold text-amber-400 tabular-nums">
                        {{ rev.rating }} / 5 sao
                      </td>

                      <td class="py-3 px-4 text-slate-300 max-w-xs truncate" [title]="rev.text">
                        {{ rev.text }}
                      </td>

                      <td class="py-3 px-4 font-mono font-bold text-[#76b900]">
                        <a
                          [routerLink]="['/admin/orders', rev.order.id]"
                          class="hover:underline"
                        >
                          {{ rev.order.code }}
                        </a>
                      </td>

                      <td class="py-3 px-4 text-center">
                        @if (rev.isVisible) {
                          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#76b900]/20 text-[#88d400] border border-[#76b900]/30 uppercase">
                            HIỂN THỊ
                          </span>
                        } @else {
                          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/40 uppercase">
                            ĐÃ BỊ ẨN
                          </span>
                        }
                      </td>

                      <td class="py-3 px-4 text-right">
                        <button
                          type="button"
                          (click)="openDetailDialog(rev)"
                          class="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-[#272f3d] text-[#76b900] hover:text-[#88d400] transition-colors"
                          title="Chi tiết & Kiểm duyệt"
                          aria-label="Xem chi tiết và kiểm duyệt nhận xét đánh giá"
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
            <div class="p-4 border-t border-[#272f3d] flex items-center justify-between text-xs text-slate-400">
              <div>
                Hiển thị trang <strong class="text-white">{{ reviewService.page() }}</strong> /
                <strong class="text-white">{{ reviewService.totalPages() }}</strong>
                (Tổng cộng <strong class="text-white">{{ reviewService.total() }}</strong> đánh giá)
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  [disabled]="reviewService.page() <= 1 || reviewService.isLoading()"
                  (click)="goToPage(reviewService.page() - 1)"
                  class="px-3 py-1 bg-[#090d16] border border-[#272f3d] rounded hover:bg-[#272f3d] disabled:opacity-40 disabled:hover:bg-[#090d16] text-slate-200 transition-colors"
                >
                  Trước
                </button>
                <button
                  type="button"
                  [disabled]="reviewService.page() >= reviewService.totalPages() || reviewService.isLoading()"
                  (click)="goToPage(reviewService.page() + 1)"
                  class="px-3 py-1 bg-[#090d16] border border-[#272f3d] rounded hover:bg-[#272f3d] disabled:opacity-40 disabled:hover:bg-[#090d16] text-slate-200 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          }
        </div>
      </main>

      @if (selectedReview()) {
        <app-review-detail-dialog
          [review]="selectedReview()!"
          (closed)="closeDetailDialog()"
          (visibilityChanged)="onReviewVisibilityChanged($event)"
        />
      }

      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        @for (toast of toasts(); track toast.id) {
          <div
            class="px-4 py-2.5 rounded-md shadow-lg text-xs font-semibold border flex items-center justify-between gap-3 transition-all"
            [class]="toast.type === 'success' ? 'bg-[#161b26] border-[#76b900] text-[#76b900]' : toast.type === 'error' ? 'bg-[#161b26] border-rose-600 text-rose-400' : 'bg-[#161b26] border-amber-600 text-amber-300'"
          >
            <span>{{ toast.message }}</span>
            <button
              type="button"
              (click)="removeToast(toast.id)"
              class="text-slate-400 hover:text-white"
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

  onReviewVisibilityChanged(updated: AdminReviewItem): void {
    this.selectedReview.set(null);
    const actionText = updated.isVisible
      ? 'Đã phục hồi hiển thị đánh giá thành công'
      : 'Đã ẩn đánh giá và ghi nhận lý do kiểm toán';
    this.addToast(actionText, 'success');
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
