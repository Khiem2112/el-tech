import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  SelectComponent,
  SelectOption,
} from '../../../components/atoms/select/select.component';
import { PromotionFormDialogComponent } from './components/promotion-form-dialog.component';
import {
  AdminProductPromotion,
  AdminPromotionService,
} from './services/admin-promotion.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

@Component({
  selector: 'app-admin-product-promotions-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SelectComponent,
    PromotionFormDialogComponent,
  ],
  template: `
    <div class="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto text-sm text-foreground">
      @if (toasts().length > 0) {
        <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
          @for (t of toasts(); track t.id) {
            <div
              class="pointer-events-auto p-3.5 rounded-lg border shadow-xl flex items-center justify-between text-xs font-semibold bg-surface border-line"
              [class.border-emerald-500]="t.type === 'success'"
              [class.text-emerald-700]="t.type === 'success'"
              [class.dark:text-emerald-400]="t.type === 'success'"
              [class.border-rose-500]="t.type === 'error'"
              [class.text-rose-700]="t.type === 'error'"
              [class.dark:text-rose-400]="t.type === 'error'"
              [class.border-sky-500]="t.type === 'info'"
              [class.text-sky-700]="t.type === 'info'"
              [class.dark:text-sky-400]="t.type === 'info'"
            >
              <span>{{ t.message }}</span>
              <button
                type="button"
                (click)="removeToast(t.id)"
                class="ml-3 text-muted hover:text-foreground"
                aria-label="Đóng thông báo"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
        </div>
      }

      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Chương Trình Khuyến Mãi
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Cấu hình giảm giá tự động theo danh mục hoặc danh sách SKU phần cứng
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="openCreateDialog()"
            class="px-4 py-2 bg-primary hover:bg-primary-strong text-primary-foreground font-bold text-xs rounded transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Khuyến Mãi</span>
          </button>
        </div>
      </header>

      <nav class="flex items-center gap-2 border-b border-line overflow-x-auto text-xs" aria-label="Phân hệ khuyến mãi">
        <button
          type="button"
          (click)="activeTab.set('promotions')"
          class="px-4 py-2.5 border-b-2 font-bold whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer"
          [class.border-primary]="activeTab() === 'promotions'"
          [class.text-primary]="activeTab() === 'promotions'"
          [class.border-transparent]="activeTab() !== 'promotions'"
          [class.text-muted]="activeTab() !== 'promotions'"
        >
          <span>Chương Trình Khuyến Mãi</span>
          <span class="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold tabular-nums whitespace-nowrap">
            {{ stats().runningCount }} đang chạy
          </span>
        </button>

        <a
          routerLink="/admin/promotions/coupons"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-muted hover:text-foreground"
        >
          <span>Mã Giảm Giá (Coupons)</span>
        </a>

        <a
          routerLink="/admin/promotions/shipping-fee"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-muted hover:text-foreground"
        >
          <span>Biểu Phí Giao Hàng</span>
        </a>
      </nav>

      @if (activeTab() === 'promotions') {
        <div class="p-3.5 bg-primary/5 border border-primary/20 rounded-lg shadow-xs text-xs text-foreground flex items-start gap-2.5">
          <svg class="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="leading-relaxed text-muted">
            Giảm giá trực tiếp theo sản phẩm hoặc danh mục phần cứng mà khách hàng không cần nhập mã. Khi bật
            <strong class="text-foreground">Áp dụng độc quyền</strong>, hệ thống sẽ ngăn cộng dồn với mã coupon khi thanh toán đơn hàng.
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 bg-surface border border-line rounded-lg shadow-xs">
            <div class="text-muted text-xs uppercase font-semibold">Tổng chương trình</div>
            <div class="text-2xl font-bold font-mono text-foreground tabular-nums mt-0.5">{{ stats().totalCount }}</div>
          </div>
          <div class="p-3.5 bg-surface border border-line rounded-lg shadow-xs">
            <div class="text-emerald-700 dark:text-emerald-400 text-xs uppercase font-semibold">Đang diễn ra</div>
            <div class="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">{{ stats().runningCount }}</div>
          </div>
          <div class="p-3.5 bg-surface border border-line rounded-lg shadow-xs">
            <div class="text-sky-700 dark:text-sky-400 text-xs uppercase font-semibold">Sắp diễn ra</div>
            <div class="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 tabular-nums mt-0.5">{{ stats().upcomingCount }}</div>
          </div>
          <div class="p-3.5 bg-surface border border-line rounded-lg shadow-xs">
            <div class="text-muted text-xs uppercase font-semibold">Đã kết thúc</div>
            <div class="text-2xl font-bold font-mono text-muted tabular-nums mt-0.5">{{ stats().expiredCount }}</div>
          </div>
        </div>

        <div class="p-3.5 bg-surface border border-line rounded-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2.5 flex-1">
            <div class="relative min-w-[240px] flex-1 max-w-sm">
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Tìm theo tên chương trình..."
                class="w-full pl-9 pr-3 py-1.5 bg-surface-alt border border-line rounded-md text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <svg
                class="w-4 h-4 text-muted absolute left-2.5 top-2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div class="w-48">
              <app-select
                [options]="statusOptions"
                [value]="statusFilter()"
                (valueChange)="onStatusChange($event)"
                size="sm"
              />
            </div>

            <div class="w-48">
              <app-select
                [options]="scopeOptions"
                [value]="scopeFilter()"
                (valueChange)="onScopeChange($event)"
                size="sm"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs text-muted">
            <span class="whitespace-nowrap">Tổng cộng: <strong class="text-foreground tabular-nums">{{ total() }}</strong></span>
            <button
              type="button"
              (click)="refresh()"
              class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground border border-line transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
              aria-label="Làm mới danh sách khuyến mãi"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs min-w-[1000px] border-collapse">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-3 px-4">Tên chương trình</th>
                  <th class="py-3 px-4 whitespace-nowrap">Kiểu giảm</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Mức giảm</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Độc quyền</th>
                  <th class="py-3 px-4 whitespace-nowrap">Thời gian hiệu lực</th>
                  <th class="py-3 px-4">Phạm vi áp dụng</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Trạng thái</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-foreground">
                @if (isLoading()) {
                  <tr>
                    <td colspan="8" class="py-12 text-center text-muted">
                      <div class="flex flex-col items-center justify-center gap-2">
                        <span class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        <span>Đang tải danh sách chương trình khuyến mãi...</span>
                      </div>
                    </td>
                  </tr>
                } @else if (promotions().length === 0) {
                  <tr>
                    <td colspan="8" class="py-12 text-center text-muted">
                      <div class="flex flex-col items-center justify-center gap-2">
                        <svg class="w-8 h-8 text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span class="font-semibold text-foreground">Không tìm thấy chương trình khuyến mãi nào</span>
                        <span class="text-xs text-muted">Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới chương trình</span>
                      </div>
                    </td>
                  </tr>
                } @else {
                  @for (promo of promotions(); track promo.id) {
                    <tr class="hover:bg-surface-alt/60 transition-colors">
                      <td class="py-3.5 px-4 font-bold text-foreground max-w-xs">
                        <div class="line-clamp-1">{{ promo.name }}</div>
                        <div class="text-xs text-muted font-normal mt-0.5">
                          @if (promo.scope === 'SKU') {
                            <span>Áp dụng cho {{ promo.skuTargets.length }} biến thể SKU</span>
                          } @else if (promo.scope === 'CATEGORY') {
                            <span>Áp dụng cho {{ promo.categoryTargets.length }} danh mục ngành hàng</span>
                          } @else {
                            <span>Áp dụng phối hợp</span>
                          }
                        </div>
                      </td>

                      <td class="py-3.5 px-4 text-foreground font-medium whitespace-nowrap">
                        {{ promo.discountType === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định' }}
                      </td>

                      <td class="py-3.5 px-4 text-right font-bold tabular-nums whitespace-nowrap text-rose-600 dark:text-rose-400">
                        @if (promo.discountType === 'PERCENTAGE') {
                          {{ promo.discountValue }} %
                        } @else {
                          {{ promo.discountValue | number:'1.0-0' }} VNĐ
                        }
                      </td>

                      <td class="py-3.5 px-4 text-center whitespace-nowrap">
                        @if (promo.isExclusive) {
                          <span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                            ĐỘC QUYỀN
                          </span>
                        } @else {
                          <span class="px-2 py-0.5 rounded text-xs font-medium bg-surface-alt text-muted border border-line whitespace-nowrap">
                            CỘNG DỒN
                          </span>
                        }
                      </td>

                      <td class="py-3.5 px-4 text-muted tabular-nums whitespace-nowrap text-xs">
                        <div>{{ promo.effectiveFrom | date:'dd/MM/yyyy' }}</div>
                        <div class="text-muted">đến {{ promo.effectiveTo | date:'dd/MM/yyyy' }}</div>
                      </td>

                      <td class="py-3.5 px-4 font-mono text-xs text-muted max-w-[200px]">
                        @if (promo.scope === 'CATEGORY') {
                          <div class="truncate text-foreground font-sans" [title]="categoryNames(promo)">
                            Danh mục: {{ categoryNames(promo) }}
                          </div>
                        } @else if (promo.scope === 'SKU') {
                          <div class="truncate" [title]="skuCodes(promo)">
                            SKU: {{ skuCodes(promo) }}
                          </div>
                        } @else {
                          <div class="text-muted">Kết hợp SKU & Danh mục</div>
                        }
                      </td>

                      <td class="py-3.5 px-4 text-center whitespace-nowrap">
                        @if (promo.status === 'RUNNING') {
                          <span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                            ĐANG CHẠY
                          </span>
                        } @else if (promo.status === 'UPCOMING') {
                          <span class="px-2 py-0.5 rounded text-xs font-bold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 whitespace-nowrap">
                            SẮP DIỄN RA
                          </span>
                        } @else if (promo.status === 'EXPIRED') {
                          <span class="px-2 py-0.5 rounded text-xs font-medium bg-surface-alt text-muted border border-line whitespace-nowrap">
                            HẾT HẠN
                          </span>
                        } @else {
                          <span class="px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
                            TẠM DỪNG
                          </span>
                        }
                      </td>

                      <td class="py-3.5 px-4 text-right whitespace-nowrap">
                        <div class="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            (click)="onToggleStatus(promo)"
                            class="p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-alt border border-transparent hover:border-line transition-colors cursor-pointer"
                            [title]="promo.isActive ? 'Tạm dừng chương trình' : 'Kích hoạt chương trình'"
                            aria-label="Chuyển đổi trạng thái kích hoạt"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M12 9v4" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            (click)="openEditDialog(promo)"
                            class="p-1.5 rounded text-muted hover:text-primary hover:bg-surface-alt border border-transparent hover:border-line transition-colors cursor-pointer"
                            title="Chỉnh sửa chương trình"
                            aria-label="Chỉnh sửa chương trình"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            (click)="onDelete(promo)"
                            class="p-1.5 rounded text-muted hover:text-rose-600 hover:bg-surface-alt border border-transparent hover:border-line transition-colors cursor-pointer"
                            title="Xóa chương trình"
                            aria-label="Xóa chương trình"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          @if (!isLoading() && total() > 0) {
            <footer class="p-3.5 bg-surface border-t border-line flex items-center justify-between text-xs text-muted">
              <div>
                Hiển thị trang <strong class="text-foreground">{{ page() }}</strong> / <strong class="text-foreground">{{ totalPages() }}</strong>
              </div>

              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  (click)="onPageChange(page() - 1)"
                  [disabled]="page() <= 1"
                  class="px-2.5 py-1 bg-surface-alt hover:bg-surface disabled:opacity-40 text-foreground rounded border border-line transition-colors cursor-pointer"
                >
                  Trước
                </button>
                <button
                  type="button"
                  (click)="onPageChange(page() + 1)"
                  [disabled]="page() >= totalPages()"
                  class="px-2.5 py-1 bg-surface-alt hover:bg-surface disabled:opacity-40 text-foreground rounded border border-line transition-colors cursor-pointer"
                >
                  Sau
                </button>
              </div>
            </footer>
          }
        </div>
      }

      <app-promotion-form-dialog
        [isOpen]="isDialogOpen()"
        [promotion]="editingPromotion()"
        (closeDialog)="onCloseDialog()"
        (saveSuccess)="onSaveSuccess($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductPromotionsPageComponent implements OnInit {
  private readonly promotionService = inject(AdminPromotionService);

  readonly activeTab = signal<'promotions' | 'coupons' | 'shipping'>('promotions');
  readonly isDialogOpen = signal<boolean>(false);
  readonly editingPromotion = signal<AdminProductPromotion | null>(null);

  readonly toasts = signal<ToastNotification[]>([]);

  readonly promotions = computed(() => this.promotionService.promotions());
  readonly isLoading = computed(() => this.promotionService.isLoading());
  readonly stats = computed(() => this.promotionService.stats());
  readonly total = computed(() => this.promotionService.total());
  readonly page = computed(() => this.promotionService.page());
  readonly totalPages = computed(() => this.promotionService.totalPages());

  readonly searchQuery = computed(() => this.promotionService.searchQuery());
  readonly statusFilter = computed(() => this.promotionService.statusFilter());
  readonly scopeFilter = computed(() => this.promotionService.scopeFilter());

  readonly statusOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'RUNNING', label: 'Đang chạy' },
    { value: 'UPCOMING', label: 'Sắp diễn ra' },
    { value: 'EXPIRED', label: 'Đã kết thúc' },
    { value: 'INACTIVE', label: 'Tạm dừng' },
  ];

  readonly scopeOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả phạm vi' },
    { value: 'CATEGORY', label: 'Theo danh mục' },
    { value: 'SKU', label: 'Theo biến thể SKU' },
  ];

  ngOnInit(): void {
    this.promotionService.loadPromotions();
  }

  onSearchChange(val: string): void {
    this.promotionService.searchQuery.set(val);
    this.promotionService.loadPromotions({ search: val, page: 1 });
  }

  onStatusChange(val: string): void {
    const validVal = val as 'ALL' | 'RUNNING' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE';
    this.promotionService.statusFilter.set(validVal);
    this.promotionService.loadPromotions({ status: validVal, page: 1 });
  }

  onScopeChange(val: string): void {
    const validVal = val as 'ALL' | 'SKU' | 'CATEGORY';
    this.promotionService.scopeFilter.set(validVal);
    this.promotionService.loadPromotions({ scope: validVal, page: 1 });
  }

  onPageChange(nextPage: number): void {
    if (nextPage >= 1 && nextPage <= this.totalPages()) {
      this.promotionService.loadPromotions({ page: nextPage });
    }
  }

  refresh(): void {
    this.promotionService.loadPromotions();
  }

  openCreateDialog(): void {
    this.editingPromotion.set(null);
    this.isDialogOpen.set(true);
  }

  openEditDialog(promo: AdminProductPromotion): void {
    this.editingPromotion.set(promo);
    this.isDialogOpen.set(true);
  }

  onCloseDialog(): void {
    this.isDialogOpen.set(false);
    this.editingPromotion.set(null);
  }

  onSaveSuccess(savedPromo: AdminProductPromotion): void {
    const isEdit = Boolean(this.editingPromotion());
    this.showToast(
      isEdit
        ? `Đã cập nhật chương trình "${savedPromo.name}" thành công`
        : `Đã tạo mới chương trình "${savedPromo.name}" thành công`,
      'success',
    );
    this.onCloseDialog();
  }

  async onToggleStatus(promo: AdminProductPromotion): Promise<void> {
    try {
      const updated = await this.promotionService.toggleStatus(promo.id);
      this.showToast(
        updated.isActive
          ? `Đã kích hoạt chương trình "${promo.name}"`
          : `Đã tạm dừng chương trình "${promo.name}"`,
        'info',
      );
    } catch {
      this.showToast('Không thể cập nhật trạng thái chương trình', 'error');
    }
  }

  async onDelete(promo: AdminProductPromotion): Promise<void> {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa chương trình khuyến mãi "${promo.name}"?`);
    if (!confirmed) return;

    try {
      await this.promotionService.deletePromotion(promo.id);
      this.showToast(`Đã xóa chương trình "${promo.name}"`, 'success');
    } catch {
      this.showToast('Không thể xóa chương trình khuyến mãi', 'error');
    }
  }

  categoryNames(promo: AdminProductPromotion): string {
    if (!promo.categoryTargets || promo.categoryTargets.length === 0) return 'Tất cả';
    return promo.categoryTargets.map((c) => c.name).join(', ');
  }

  skuCodes(promo: AdminProductPromotion): string {
    if (!promo.skuTargets || promo.skuTargets.length === 0) return 'Tất cả';
    return promo.skuTargets.map((s) => s.sku).join(', ');
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    const id = Date.now();
    this.toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
