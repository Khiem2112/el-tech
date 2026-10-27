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
import { RouterLink } from '@angular/router';
import {
  SelectComponent,
  SelectOption,
} from '../../../components/atoms/select/select.component';
import { CouponFormDialogComponent } from './components/coupon-form-dialog.component';
import { CouponRedemptionSheetComponent } from './components/coupon-redemption-sheet.component';
import {
  AdminCoupon,
  AdminCouponService,
} from './services/admin-coupon.service';

type ToastNotification = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};

@Component({
  selector: 'app-admin-coupons-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SelectComponent,
    CouponFormDialogComponent,
    CouponRedemptionSheetComponent,
  ],
  template: `
    <div class="w-full space-y-6 p-4 lg:p-6 text-sm text-foreground">
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight uppercase text-foreground">
            Mã Giảm Giá Đơn Hàng
          </h1>
          <p class="text-xs text-muted mt-1">
            Quản lý hạn mức sử dụng coupon cấp đơn hàng, quota phát hành và kiểm toán lịch sử đổi mã
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="onOpenCreateDialog()"
            class="px-4 py-2 bg-primary hover:bg-primary-strong text-primary-foreground font-bold text-xs rounded transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tạo Mã Giảm Giá</span>
          </button>
        </div>
      </header>

      <nav class="flex items-center gap-2 border-b border-line overflow-x-auto text-xs" aria-label="Phân hệ khuyến mãi">
        <a
          routerLink="/admin/promotions"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-muted hover:text-foreground"
        >
          <span>Chương Trình Khuyến Mãi</span>
        </a>

        <a
          routerLink="/admin/promotions/coupons"
          class="px-4 py-2.5 border-b-2 font-bold whitespace-nowrap flex items-center gap-2 transition-colors border-primary text-primary"
        >
          <span>Mã Giảm Giá (Coupons)</span>
          <span class="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold tabular-nums whitespace-nowrap">
            {{ stats().runningCount }} đang chạy
          </span>
        </a>

        <a
          routerLink="/admin/promotions/shipping-fee"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-muted hover:text-foreground"
        >
          <span>Biểu Phí Giao Hàng</span>
        </a>
      </nav>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3 bg-surface border border-line rounded">
          <div class="text-muted text-xs uppercase font-semibold">Tổng mã coupon</div>
          <div class="text-xl font-bold text-foreground tabular-nums mt-0.5">{{ stats().totalCount }}</div>
        </div>
        <div class="p-3 bg-surface border border-line rounded">
          <div class="text-emerald-700 dark:text-emerald-400 text-xs uppercase font-semibold">Đang hoạt động</div>
          <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">{{ stats().runningCount }}</div>
        </div>
        <div class="p-3 bg-surface border border-line rounded">
          <div class="text-sky-700 dark:text-sky-400 text-xs uppercase font-semibold">Sắp diễn ra</div>
          <div class="text-xl font-bold text-sky-600 dark:text-sky-400 tabular-nums mt-0.5">{{ stats().upcomingCount }}</div>
        </div>
        <div class="p-3 bg-surface border border-line rounded">
          <div class="text-muted text-xs uppercase font-semibold">Hết hạn / Tạm dừng</div>
          <div class="text-xl font-bold text-muted tabular-nums mt-0.5">{{ stats().expiredCount }}</div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded border border-line">
        <div class="flex-1 flex flex-col sm:flex-row items-center gap-2.5">
          <div class="relative w-full sm:w-72">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm mã hoặc tên chương trình..."
              class="w-full pl-8 pr-3 py-1.5 bg-surface-alt border border-line rounded text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            />
            <svg class="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div class="w-full sm:w-48">
            <app-select
              [options]="statusOptions"
              [value]="statusFilter()"
              (valueChange)="onStatusChange($event)"
              size="sm"
            />
          </div>

          <div class="w-full sm:w-52">
            <app-select
              [options]="discountTypeOptions"
              [value]="discountTypeFilter()"
              (valueChange)="onDiscountTypeChange($event)"
              size="sm"
            />
          </div>
        </div>

        <button
          type="button"
          (click)="onRefresh()"
          class="px-3 py-1.5 bg-surface-alt hover:bg-surface text-foreground text-xs font-semibold rounded border border-line transition-colors inline-flex items-center gap-1.5 justify-center cursor-pointer"
        >
          <svg class="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Làm mới</span>
        </button>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm min-w-[1000px]">
            <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th class="py-3 px-4 whitespace-nowrap">Mã coupon</th>
                <th class="py-3 px-4">Tên chương trình</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Mức giảm</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Đơn tối thiểu</th>
                <th class="py-3 px-4 text-center whitespace-nowrap">Tiến độ lượt dùng</th>
                <th class="py-3 px-4 whitespace-nowrap">Hiệu lực</th>
                <th class="py-3 px-4 text-center whitespace-nowrap">Trạng thái</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line text-foreground">
              @if (isLoading()) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-muted">
                    <span class="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle mr-2"></span>
                    <span>Đang tải danh sách mã giảm giá...</span>
                  </td>
                </tr>
              } @else if (coupons().length === 0) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-muted">
                    <p class="font-semibold text-foreground">Không tìm thấy mã giảm giá phù hợp</p>
                    <p class="text-xs mt-1 text-muted">Hãy tạo mã giảm giá mới hoặc thử lại với bộ lọc khác</p>
                  </td>
                </tr>
              } @else {
                @for (coupon of coupons(); track coupon.id) {
                  <tr class="hover:bg-surface-alt/60 transition-colors">
                    <td class="py-3 px-4 font-bold text-primary text-sm whitespace-nowrap tabular tabular-nums">
                      {{ coupon.code }}
                    </td>

                    <td class="py-3 px-4">
                      <div class="font-bold text-foreground text-sm">{{ coupon.name }}</div>
                      @if (coupon.requiredPaymentMethod) {
                        <div class="text-xs text-muted mt-0.5">
                          Phương thức: {{ coupon.requiredPaymentMethod === 'QR' ? 'VietQR' : 'COD' }}
                        </div>
                      }
                    </td>

                    <td class="py-3 px-4 text-right font-bold tabular tabular-nums whitespace-nowrap text-foreground">
                      @if (coupon.discountType === 'PERCENTAGE') {
                        <span class="tabular">{{ coupon.discountValue }}%</span>
                        @if (coupon.maximumDiscount) {
                          <div class="text-xs text-muted font-normal tabular">
                            Tối đa: {{ coupon.maximumDiscount | number:'1.0-0' }} ₫
                          </div>
                        }
                      } @else {
                        <span class="tabular">{{ coupon.discountValue | number:'1.0-0' }} ₫</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right tabular tabular-nums whitespace-nowrap text-foreground font-semibold">
                      {{ coupon.minimumSubtotal > 0 ? (coupon.minimumSubtotal | number:'1.0-0') + ' ₫' : 'Không yêu cầu' }}
                    </td>

                    <td class="py-3 px-4 text-center tabular tabular-nums whitespace-nowrap">
                      <div class="font-bold text-foreground tabular">
                        {{ coupon.stats.usedCount }} / {{ coupon.globalQuota ? (coupon.globalQuota | number:'1.0-0') : 'Không giới hạn' }}
                      </div>
                      <div class="text-xs text-muted mt-0.5">
                        Đã chốt: {{ coupon.stats.consumedCount }} | Đang giữ: {{ coupon.stats.reservedCount }}
                      </div>
                    </td>

                    <td class="py-3 px-4 text-muted tabular tabular-nums whitespace-nowrap text-xs">
                      <div>{{ coupon.effectiveFrom | date:'dd/MM/yyyy' }}</div>
                      <div class="text-muted">đến {{ coupon.effectiveTo | date:'dd/MM/yyyy' }}</div>
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (!coupon.isActive) {
                        <span class="px-2 py-0.5 rounded text-xs font-semibold bg-surface-alt text-muted border border-line whitespace-nowrap">
                          Tạm dừng
                        </span>
                      } @else if (coupon.status === 'RUNNING') {
                        <span class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          Đang chạy
                        </span>
                      } @else if (coupon.status === 'UPCOMING') {
                        <span class="px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 whitespace-nowrap">
                          Sắp diễn ra
                        </span>
                      } @else if (coupon.status === 'EXPIRED') {
                        <span class="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                          Đã hết hạn
                        </span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="onOpenHistorySheet(coupon)"
                          class="p-1.5 rounded hover:bg-surface-alt text-primary transition-colors cursor-pointer"
                          title="Xem lịch sử sử dụng"
                          aria-label="Xem lịch sử sử dụng"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          (click)="onOpenEditDialog(coupon)"
                          class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors cursor-pointer"
                          title="Chỉnh sửa mã giảm giá"
                          aria-label="Chỉnh sửa mã giảm giá"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          (click)="onToggleStatus(coupon)"
                          class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors cursor-pointer"
                          [title]="coupon.isActive ? 'Tạm dừng kích hoạt' : 'Kích hoạt lại'"
                          [aria-label]="coupon.isActive ? 'Tạm dừng kích hoạt' : 'Kích hoạt lại'"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            @if (coupon.isActive) {
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            } @else {
                              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            }
                          </svg>
                        </button>

                        <button
                          type="button"
                          (click)="onDelete(coupon)"
                          class="p-1.5 rounded hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Xóa mã giảm giá"
                          aria-label="Xóa mã giảm giá"
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
          <footer class="p-3.5 bg-surface border-t border-line flex items-center justify-between text-sm text-muted">
            <div>
              Hiển thị trang <strong class="text-foreground tabular">{{ page() }}</strong> / <strong class="text-foreground tabular">{{ totalPages() }}</strong>
              (Tổng cộng: <strong class="text-foreground tabular tabular-nums">{{ total() }}</strong> mã)
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                (click)="onPageChange(page() - 1)"
                [disabled]="page() <= 1"
                class="px-2.5 py-1 bg-surface-alt hover:bg-surface disabled:opacity-40 text-foreground text-sm rounded border border-line transition-colors cursor-pointer"
              >
                Trước
              </button>
              <button
                type="button"
                (click)="onPageChange(page() + 1)"
                [disabled]="page() >= totalPages()"
                class="px-2.5 py-1 bg-surface-alt hover:bg-surface disabled:opacity-40 text-foreground text-sm rounded border border-line transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          </footer>
        }
      </div>

      <app-coupon-form-dialog
        [isOpen]="isDialogOpen()"
        [coupon]="editingCoupon()"
        (closeDialog)="onCloseDialog()"
        (saveSuccess)="onSaveSuccess($event)"
      />

      <app-coupon-redemption-sheet
        [isOpen]="isSheetOpen()"
        [coupon]="selectedCouponForHistory()"
        (closeSheet)="onCloseSheet()"
      />

      @if (toasts().length > 0) {
        <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          @for (toast of toasts(); track toast.id) {
            <div
              class="pointer-events-auto px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center justify-between border bg-surface border-line"
              [class.border-emerald-500]="toast.type === 'success'"
              [class.text-emerald-700]="toast.type === 'success'"
              [class.dark:text-emerald-400]="toast.type === 'success'"
              [class.border-rose-500]="toast.type === 'error'"
              [class.text-rose-700]="toast.type === 'error'"
              [class.dark:text-rose-400]="toast.type === 'error'"
              [class.border-sky-500]="toast.type === 'info'"
              [class.text-sky-700]="toast.type === 'info'"
              [class.dark:text-sky-400]="toast.type === 'info'"
            >
              <span>{{ toast.message }}</span>
              <button
                type="button"
                (click)="dismissToast(toast.id)"
                class="ml-3 text-muted hover:text-foreground cursor-pointer"
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCouponsPageComponent implements OnInit {
  private readonly couponService = inject(AdminCouponService);

  readonly isDialogOpen = signal<boolean>(false);
  readonly editingCoupon = signal<AdminCoupon | null>(null);

  readonly isSheetOpen = signal<boolean>(false);
  readonly selectedCouponForHistory = signal<AdminCoupon | null>(null);

  readonly toasts = signal<ToastNotification[]>([]);

  readonly coupons = computed(() => this.couponService.coupons());
  readonly isLoading = computed(() => this.couponService.isLoading());
  readonly stats = computed(() => this.couponService.stats());
  readonly total = computed(() => this.couponService.total());
  readonly page = computed(() => this.couponService.page());
  readonly totalPages = computed(() => this.couponService.totalPages());

  readonly searchQuery = computed(() => this.couponService.searchQuery());
  readonly statusFilter = computed(() => this.couponService.statusFilter());
  readonly discountTypeFilter = computed(() => this.couponService.discountTypeFilter());

  readonly statusOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'RUNNING', label: 'Đang hoạt động' },
    { value: 'UPCOMING', label: 'Sắp diễn ra' },
    { value: 'EXPIRED', label: 'Đã hết hạn' },
    { value: 'INACTIVE', label: 'Đang tạm dừng' },
  ];

  readonly discountTypeOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả kiểu giảm' },
    { value: 'PERCENTAGE', label: 'Theo phần trăm (%)' },
    { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (VNĐ)' },
  ];

  ngOnInit(): void {
    this.couponService.loadCoupons();
  }

  onSearchChange(val: string): void {
    this.couponService.searchQuery.set(val);
    this.couponService.loadCoupons({ search: val, page: 1 });
  }

  onStatusChange(val: string): void {
    const validVal = val as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'UPCOMING' | 'EXPIRED';
    this.couponService.statusFilter.set(validVal);
    this.couponService.loadCoupons({ status: validVal, page: 1 });
  }

  onDiscountTypeChange(val: string): void {
    const validVal = val as 'ALL' | 'PERCENTAGE' | 'FIXED_AMOUNT';
    this.couponService.discountTypeFilter.set(validVal);
    this.couponService.loadCoupons({ discountType: validVal, page: 1 });
  }

  onPageChange(nextPage: number): void {
    if (nextPage >= 1 && nextPage <= this.totalPages()) {
      this.couponService.loadCoupons({ page: nextPage });
    }
  }

  onRefresh(): void {
    this.couponService.loadCoupons();
  }

  onOpenCreateDialog(): void {
    this.editingCoupon.set(null);
    this.isDialogOpen.set(true);
  }

  onOpenEditDialog(coupon: AdminCoupon): void {
    this.editingCoupon.set(coupon);
    this.isDialogOpen.set(true);
  }

  onCloseDialog(): void {
    this.isDialogOpen.set(false);
    this.editingCoupon.set(null);
  }

  onSaveSuccess(coupon: AdminCoupon): void {
    this.showToast('success', `Đã lưu thành công mã giảm giá ${coupon.code}`);
    this.onCloseDialog();
  }

  onOpenHistorySheet(coupon: AdminCoupon): void {
    this.selectedCouponForHistory.set(coupon);
    this.isSheetOpen.set(true);
  }

  onCloseSheet(): void {
    this.isSheetOpen.set(false);
    this.selectedCouponForHistory.set(null);
  }

  async onToggleStatus(coupon: AdminCoupon): Promise<void> {
    try {
      const updated = await this.couponService.toggleStatus(coupon.id);
      const label = updated.isActive ? 'Đã kích hoạt' : 'Đã tạm dừng';
      this.showToast('success', `${label} mã coupon ${coupon.code}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
      this.showToast('error', msg);
    }
  }

  async onDelete(coupon: AdminCoupon): Promise<void> {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa mã giảm giá ${coupon.code}? Nếu mã đã có lượt dùng, hệ thống sẽ tự động chuyển sang tạm dừng để bảo toàn dữ liệu đối soát.`,
    );
    if (!confirmed) return;

    try {
      const result = await this.couponService.deleteCoupon(coupon.id);
      if (result.deleted) {
        this.showToast('success', `Đã xóa mã giảm giá ${coupon.code}`);
      } else {
        this.showToast('info', `Mã coupon ${coupon.code} đã có lượt sử dụng trong đơn hàng nên được chuyển sang trạng thái Tạm dừng`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa mã giảm giá';
      this.showToast('error', msg);
    }
  }

  showToast(type: 'success' | 'error' | 'info', message: string): void {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.update((current) => [...current, { id, type, message }]);
    setTimeout(() => {
      this.dismissToast(id);
    }, 4000);
  }

  dismissToast(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
