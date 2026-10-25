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
    CouponFormDialogComponent,
    CouponRedemptionSheetComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header SCR-24 -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272f3d] pb-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-bold tracking-tight uppercase text-white">
              Mã Giảm Giá Đơn Hàng
            </h1>
            <span class="text-xs text-slate-400 border-l border-[#272f3d] pl-3 font-mono">
              SCR-24
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Quản lý hạn mức sử dụng coupon cấp đơn hàng, quota phát hành và kiểm toán lịch sử đổi mã
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="onOpenCreateDialog()"
            class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tạo Mã Giảm Giá</span>
          </button>
        </div>
      </header>

      <!-- Navigation Tabs SCR-23, SCR-24, SCR-25 -->
      <nav class="flex items-center gap-2 border-b border-[#272f3d] overflow-x-auto text-xs" aria-label="Phân hệ khuyến mãi">
        <a
          routerLink="/admin/promotions"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-slate-400 hover:text-white"
        >
          <span>Khuyến mãi sản phẩm</span>
          <span class="text-[10px] bg-[#161b26] border border-[#272f3d] px-1.5 py-0.5 rounded text-slate-400 font-mono">
            SCR-23
          </span>
        </a>

        <a
          routerLink="/admin/promotions/coupons"
          class="px-4 py-2.5 border-b-2 font-bold whitespace-nowrap flex items-center gap-2 transition-colors border-[#76b900] text-[#76b900]"
        >
          <span>Mã giảm giá (Coupon)</span>
          <span class="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-400 font-bold tabular-nums">
            {{ stats().runningCount }} đang chạy
          </span>
        </a>

        <div
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-slate-400"
        >
          <span>Biểu phí giao hàng & Freeship</span>
          <span class="text-[10px] bg-[#161b26] border border-[#272f3d] px-1.5 py-0.5 rounded text-slate-400 font-mono">
            SCR-25
          </span>
        </div>
      </nav>

      <!-- Guideline Note Banner -->
      <div class="p-3.5 bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm text-xs text-slate-300 flex items-start gap-2.5">
        <svg class="w-4 h-4 text-[#76b900] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="leading-relaxed">
          Quản lý hạn mức sử dụng coupon trên toàn hệ thống và số lần tối đa mỗi khách hàng. Khi đơn hàng hủy hợp lệ, quota của khách sẽ tự động được hoàn trả.
        </div>
      </div>

      <!-- KPI Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3.5 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-slate-400 text-[11px] uppercase font-semibold">Tổng mã coupon</div>
          <div class="text-xl font-bold text-white tabular-nums mt-0.5">{{ stats().totalCount }}</div>
        </div>
        <div class="p-3.5 bg-[#161b26] border border-emerald-500/30 rounded-lg">
          <div class="text-emerald-400 text-[11px] uppercase font-semibold">Đang hoạt động</div>
          <div class="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">{{ stats().runningCount }}</div>
        </div>
        <div class="p-3.5 bg-[#161b26] border border-sky-500/30 rounded-lg">
          <div class="text-sky-400 text-[11px] uppercase font-semibold">Sắp diễn ra</div>
          <div class="text-xl font-bold text-sky-400 tabular-nums mt-0.5">{{ stats().upcomingCount }}</div>
        </div>
        <div class="p-3.5 bg-[#161b26] border border-slate-700 rounded-lg">
          <div class="text-slate-400 text-[11px] uppercase font-semibold">Hết hạn / Tạm dừng</div>
          <div class="text-xl font-bold text-slate-300 tabular-nums mt-0.5">{{ stats().expiredCount }}</div>
        </div>
      </div>

      <!-- Filters & Actions Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161b26] p-3.5 rounded-lg border border-[#272f3d]">
        <div class="flex-1 flex flex-col sm:flex-row items-center gap-2.5">
          <!-- Search Input -->
          <div class="relative w-full sm:w-72">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm mã hoặc tên chương trình..."
              class="w-full pl-8 pr-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#76b900] transition-colors"
            />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Status Filter -->
          <select
            [ngModel]="statusFilter()"
            (ngModelChange)="onStatusChange($event)"
            class="w-full sm:w-auto px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white focus:outline-none focus:border-[#76b900] transition-colors"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="RUNNING">Đang hoạt động</option>
            <option value="UPCOMING">Sắp diễn ra</option>
            <option value="EXPIRED">Đã hết hạn</option>
            <option value="INACTIVE">Đang tạm dừng</option>
          </select>

          <!-- Discount Type Filter -->
          <select
            [ngModel]="discountTypeFilter()"
            (ngModelChange)="onDiscountTypeChange($event)"
            class="w-full sm:w-auto px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white focus:outline-none focus:border-[#76b900] transition-colors"
          >
            <option value="ALL">Tất cả kiểu giảm</option>
            <option value="PERCENTAGE">Theo phần trăm (%)</option>
            <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
          </select>
        </div>

        <button
          type="button"
          (click)="onRefresh()"
          class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] text-slate-300 text-xs font-semibold rounded border border-[#272f3d] transition-colors inline-flex items-center gap-1.5 justify-center"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Làm mới</span>
        </button>
      </div>

      <!-- Coupons Table SCR-24 -->
      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="py-3 px-4">Mã coupon</th>
                <th class="py-3 px-4">Tên chương trình</th>
                <th class="py-3 px-4 text-right">Mức giảm</th>
                <th class="py-3 px-4 text-right">Đơn tối thiểu</th>
                <th class="py-3 px-4 text-center">Tiến độ lượt dùng</th>
                <th class="py-3 px-4">Hiệu lực</th>
                <th class="py-3 px-4 text-center">Trạng thái</th>
                <th class="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#272f3d] text-white">
              @if (isLoading()) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-slate-400">
                    <span class="inline-block w-5 h-5 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin align-middle mr-2"></span>
                    <span>Đang tải danh sách mã giảm giá...</span>
                  </td>
                </tr>
              } @else if (coupons().length === 0) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-slate-400">
                    <p class="font-semibold text-slate-300">Không tìm thấy mã giảm giá phù hợp</p>
                    <p class="text-[11px] mt-1 text-slate-500">Hãy tạo mã giảm giá mới hoặc thử lại với bộ lọc khác</p>
                  </td>
                </tr>
              } @else {
                @for (coupon of coupons(); track coupon.id) {
                  <tr class="hover:bg-[#1a2232] transition-colors">
                    <!-- Code -->
                    <td class="py-3 px-4 font-mono font-bold text-[#76b900] text-sm">
                      {{ coupon.code }}
                    </td>

                    <!-- Name -->
                    <td class="py-3 px-4">
                      <div class="font-bold text-white text-xs">{{ coupon.name }}</div>
                      @if (coupon.requiredPaymentMethod) {
                        <div class="text-[10px] text-slate-400 mt-0.5">
                          Phương thức: {{ coupon.requiredPaymentMethod === 'QR' ? 'VietQR' : 'COD' }}
                        </div>
                      }
                    </td>

                    <!-- Discount Value -->
                    <td class="py-3 px-4 text-right font-bold tabular-nums text-white">
                      @if (coupon.discountType === 'PERCENTAGE') {
                        <span>{{ coupon.discountValue }}%</span>
                        @if (coupon.maximumDiscount) {
                          <div class="text-[10px] text-slate-400 font-normal">
                            Tối đa: {{ coupon.maximumDiscount | number:'1.0-0' }} ₫
                          </div>
                        }
                      } @else {
                        <span>{{ coupon.discountValue | number:'1.0-0' }} ₫</span>
                      }
                    </td>

                    <!-- Minimum Subtotal -->
                    <td class="py-3 px-4 text-right tabular-nums text-slate-300 font-semibold">
                      {{ coupon.minimumSubtotal > 0 ? (coupon.minimumSubtotal | number:'1.0-0') + ' ₫' : 'Không yêu cầu' }}
                    </td>

                    <!-- Usage Quota Progress -->
                    <td class="py-3 px-4 text-center tabular-nums">
                      <div class="font-bold text-white">
                        {{ coupon.stats.usedCount }} / {{ coupon.globalQuota ? (coupon.globalQuota | number:'1.0-0') : 'Không giới hạn' }}
                      </div>
                      <div class="text-[10px] text-slate-400 mt-0.5">
                        Đã chốt: {{ coupon.stats.consumedCount }} | Đang giữ: {{ coupon.stats.reservedCount }}
                      </div>
                    </td>

                    <!-- Validity Period -->
                    <td class="py-3 px-4 text-slate-300 tabular-nums text-[11px]">
                      <div>{{ coupon.effectiveFrom | date:'dd/MM/yyyy' }}</div>
                      <div class="text-slate-400 text-[10px]">đến {{ coupon.effectiveTo | date:'dd/MM/yyyy' }}</div>
                    </td>

                    <!-- Status Badge -->
                    <td class="py-3 px-4 text-center">
                      @if (!coupon.isActive) {
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          Tạm dừng
                        </span>
                      } @else if (coupon.status === 'RUNNING') {
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Đang chạy
                        </span>
                      } @else if (coupon.status === 'UPCOMING') {
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                          Sắp diễn ra
                        </span>
                      } @else if (coupon.status === 'EXPIRED') {
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Đã hết hạn
                        </span>
                      }
                    </td>

                    <!-- Actions -->
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <!-- History Button MOD-35 -->
                        <button
                          type="button"
                          (click)="onOpenHistorySheet(coupon)"
                          class="p-1.5 rounded hover:bg-[#272f3d] text-[#76b900] transition-colors"
                          title="Xem lịch sử sử dụng (MOD-35)"
                          aria-label="Xem lịch sử sử dụng"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>

                        <!-- Edit Button MOD-34 -->
                        <button
                          type="button"
                          (click)="onOpenEditDialog(coupon)"
                          class="p-1.5 rounded hover:bg-[#272f3d] text-slate-300 hover:text-white transition-colors"
                          title="Chỉnh sửa mã giảm giá (MOD-34)"
                          aria-label="Chỉnh sửa mã giảm giá"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>

                        <!-- Toggle Status Button -->
                        <button
                          type="button"
                          (click)="onToggleStatus(coupon)"
                          class="p-1.5 rounded hover:bg-[#272f3d] text-slate-300 hover:text-white transition-colors"
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

                        <!-- Delete Button -->
                        <button
                          type="button"
                          (click)="onDelete(coupon)"
                          class="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition-colors"
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

        <!-- Pagination Controls -->
        @if (!isLoading() && total() > 0) {
          <footer class="p-3.5 bg-[#090d16] border-t border-[#272f3d] flex items-center justify-between text-xs text-slate-400">
            <div>
              Hiển thị trang <strong class="text-white">{{ page() }}</strong> / <strong class="text-white">{{ totalPages() }}</strong>
              (Tổng cộng: <strong class="text-white">{{ total() }}</strong> mã)
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                (click)="onPageChange(page() - 1)"
                [disabled]="page() <= 1"
                class="px-2.5 py-1 bg-[#161b26] hover:bg-[#272f3d] disabled:opacity-40 text-slate-200 rounded border border-[#272f3d] transition-colors"
              >
                Trước
              </button>
              <button
                type="button"
                (click)="onPageChange(page() + 1)"
                [disabled]="page() >= totalPages()"
                class="px-2.5 py-1 bg-[#161b26] hover:bg-[#272f3d] disabled:opacity-40 text-slate-200 rounded border border-[#272f3d] transition-colors"
              >
                Sau
              </button>
            </div>
          </footer>
        }
      </div>

      <!-- MOD-34 Dialog Component -->
      <app-coupon-form-dialog
        [isOpen]="isDialogOpen()"
        [coupon]="editingCoupon()"
        (closeDialog)="onCloseDialog()"
        (saveSuccess)="onSaveSuccess($event)"
      />

      <!-- MOD-35 Sheet Component -->
      <app-coupon-redemption-sheet
        [isOpen]="isSheetOpen()"
        [coupon]="selectedCouponForHistory()"
        (closeSheet)="onCloseSheet()"
      />

      <!-- Toasts Notification Strip -->
      @if (toasts().length > 0) {
        <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          @for (toast of toasts(); track toast.id) {
            <div
              class="px-4 py-3 rounded-lg shadow-lg text-xs font-semibold flex items-center justify-between border"
              [class.bg-emerald-950]="toast.type === 'success'"
              [class.border-emerald-500]="toast.type === 'success'"
              [class.text-emerald-200]="toast.type === 'success'"
              [class.bg-rose-950]="toast.type === 'error'"
              [class.border-rose-500]="toast.type === 'error'"
              [class.text-rose-200]="toast.type === 'error'"
              [class.bg-slate-900]="toast.type === 'info'"
              [class.border-slate-600]="toast.type === 'info'"
              [class.text-slate-200]="toast.type === 'info'"
            >
              <span>{{ toast.message }}</span>
              <button
                type="button"
                (click)="dismissToast(toast.id)"
                class="ml-3 text-slate-400 hover:text-white"
              >
                ✕
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

  ngOnInit(): void {
    this.couponService.loadCoupons();
  }

  onSearchChange(val: string): void {
    this.couponService.searchQuery.set(val);
    this.couponService.loadCoupons({ search: val, page: 1 });
  }

  onStatusChange(val: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'UPCOMING' | 'EXPIRED'): void {
    this.couponService.statusFilter.set(val);
    this.couponService.loadCoupons({ status: val, page: 1 });
  }

  onDiscountTypeChange(val: 'ALL' | 'PERCENTAGE' | 'FIXED_AMOUNT'): void {
    this.couponService.discountTypeFilter.set(val);
    this.couponService.loadCoupons({ discountType: val, page: 1 });
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
