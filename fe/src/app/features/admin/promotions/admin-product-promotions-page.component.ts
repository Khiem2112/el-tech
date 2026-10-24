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
  imports: [CommonModule, FormsModule, RouterModule, PromotionFormDialogComponent],
  template: `
    <div class="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto text-sm text-slate-200">
      <!-- Toasts Notification Alert -->
      @if (toasts().length > 0) {
        <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
          @for (t of toasts(); track t.id) {
            <div
              class="pointer-events-auto p-3.5 rounded-lg border shadow-xl flex items-center justify-between text-xs font-semibold"
              [class.bg-[#161b26]]="true"
              [class.border-emerald-500]="t.type === 'success'"
              [class.text-emerald-400]="t.type === 'success'"
              [class.border-rose-500]="t.type === 'error'"
              [class.text-rose-400]="t.type === 'error'"
              [class.border-sky-500]="t.type === 'info'"
              [class.text-sky-400]="t.type === 'info'"
            >
              <span>{{ t.message }}</span>
              <button
                type="button"
                (click)="removeToast(t.id)"
                class="ml-3 text-slate-400 hover:text-white"
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

      <!-- Header Topbar SCR-23 -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2.5 py-1 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-23
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Khuyến Mãi & Biểu Phí
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Cấu hình giảm giá tự động theo danh mục hoặc danh sách SKU phần cứng (PRO-001, PRO-004)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="openCreateDialog()"
            class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Khuyến Mãi</span>
          </button>
        </div>
      </header>

      <!-- Navigation Tabs SCR-23, SCR-24, SCR-25 -->
      <nav class="flex items-center gap-2 border-b border-[#272f3d] overflow-x-auto text-xs" aria-label="Phân hệ khuyến mãi">
        <button
          type="button"
          (click)="activeTab.set('promotions')"
          class="px-4 py-2.5 border-b-2 font-bold whitespace-nowrap flex items-center gap-2 transition-colors"
          [class.border-[#76b900]]="activeTab() === 'promotions'"
          [class.text-[#76b900]]="activeTab() === 'promotions'"
          [class.border-transparent]="activeTab() !== 'promotions'"
          [class.text-slate-400]="activeTab() !== 'promotions'"
        >
          <span>Khuyến mãi sản phẩm</span>
          <span class="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-400 font-bold tabular-nums">
            {{ stats().runningCount }} đang chạy
          </span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('coupons')"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors"
          [class.border-[#76b900]]="activeTab() === 'coupons'"
          [class.text-[#76b900]]="activeTab() === 'coupons'"
          [class.border-transparent]="activeTab() !== 'coupons'"
          [class.text-slate-400]="activeTab() !== 'coupons'"
        >
          <span>Mã giảm giá (Coupon)</span>
          <span class="text-[10px] bg-[#161b26] border border-[#272f3d] px-1.5 py-0.5 rounded text-slate-400 font-mono">
            SCR-24
          </span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('shipping')"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors"
          [class.border-[#76b900]]="activeTab() === 'shipping'"
          [class.text-[#76b900]]="activeTab() === 'shipping'"
          [class.border-transparent]="activeTab() !== 'shipping'"
          [class.text-slate-400]="activeTab() !== 'shipping'"
        >
          <span>Biểu phí giao hàng & Freeship</span>
          <span class="text-[10px] bg-[#161b26] border border-[#272f3d] px-1.5 py-0.5 rounded text-slate-400 font-mono">
            SCR-25
          </span>
        </button>
      </nav>

      @if (activeTab() === 'promotions') {
        <!-- Guideline Note Banner -->
        <div class="p-3.5 bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm text-xs text-slate-300 flex items-start gap-2.5">
          <svg class="w-4 h-4 text-[#76b900] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="leading-relaxed">
            Giảm giá trực tiếp theo sản phẩm hoặc danh mục phần cứng mà khách hàng không cần nhập mã. Khi bật
            <strong class="text-white">Áp dụng độc quyền</strong>, hệ thống sẽ ngăn cộng dồn với mã coupon khi thanh toán đơn hàng.
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
            <div class="text-slate-400 text-[11px] uppercase font-semibold">Tổng chương trình</div>
            <div class="text-xl font-bold text-white tabular-nums mt-0.5">{{ stats().totalCount }}</div>
          </div>
          <div class="p-3 bg-[#161b26] border border-emerald-500/30 rounded-lg">
            <div class="text-emerald-400 text-[11px] uppercase font-semibold">Đang diễn ra</div>
            <div class="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">{{ stats().runningCount }}</div>
          </div>
          <div class="p-3 bg-[#161b26] border border-sky-500/30 rounded-lg">
            <div class="text-sky-400 text-[11px] uppercase font-semibold">Sắp diễn ra</div>
            <div class="text-xl font-bold text-sky-400 tabular-nums mt-0.5">{{ stats().upcomingCount }}</div>
          </div>
          <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
            <div class="text-slate-400 text-[11px] uppercase font-semibold">Đã kết thúc</div>
            <div class="text-xl font-bold text-slate-400 tabular-nums mt-0.5">{{ stats().expiredCount }}</div>
          </div>
        </div>

        <!-- Filter Controls Toolbar -->
        <div class="p-3.5 bg-[#161b26] border border-[#272f3d] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2.5 flex-1">
            <div class="relative min-w-[240px] flex-1 max-w-sm">
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Tìm theo tên chương trình..."
                class="w-full pl-9 pr-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#76b900] transition-colors"
              />
              <svg
                class="w-4 h-4 text-slate-500 absolute left-2.5 top-2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div class="flex items-center gap-1.5">
              <select
                [ngModel]="statusFilter()"
                (ngModelChange)="onStatusChange($event)"
                class="px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded-md text-xs text-white focus:outline-none focus:border-[#76b900]"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="RUNNING">Đang chạy</option>
                <option value="UPCOMING">Sắp diễn ra</option>
                <option value="EXPIRED">Đã kết thúc</option>
                <option value="INACTIVE">Tạm dừng</option>
              </select>

              <select
                [ngModel]="scopeFilter()"
                (ngModelChange)="onScopeChange($event)"
                class="px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded-md text-xs text-white focus:outline-none focus:border-[#76b900]"
              >
                <option value="ALL">Tất cả phạm vi</option>
                <option value="CATEGORY">Theo danh mục</option>
                <option value="SKU">Theo biến thể SKU</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span>Tổng cộng: <strong class="text-white tabular-nums">{{ total() }}</strong></span>
            <button
              type="button"
              (click)="refresh()"
              class="p-1.5 rounded hover:bg-[#272f3d] text-slate-300 hover:text-white transition-colors"
              title="Làm mới dữ liệu"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Promotions Table SCR-23 -->
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th class="py-3 px-4">Tên chương trình</th>
                  <th class="py-3 px-4">Kiểu giảm</th>
                  <th class="py-3 px-4 text-right">Mức giảm</th>
                  <th class="py-3 px-4 text-center">Độc quyền</th>
                  <th class="py-3 px-4">Thời gian hiệu lực</th>
                  <th class="py-3 px-4">Phạm vi áp dụng</th>
                  <th class="py-3 px-4 text-center">Trạng thái</th>
                  <th class="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d]">
                @if (isLoading()) {
                  <tr>
                    <td colspan="8" class="py-12 text-center text-slate-400">
                      <div class="flex flex-col items-center justify-center gap-2">
                        <span class="w-6 h-6 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin"></span>
                        <span>Đang tải danh sách chương trình khuyến mãi...</span>
                      </div>
                    </td>
                  </tr>
                } @else if (promotions().length === 0) {
                  <tr>
                    <td colspan="8" class="py-12 text-center text-slate-400">
                      <div class="flex flex-col items-center justify-center gap-2">
                        <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span class="font-semibold text-slate-300">Không tìm thấy chương trình khuyến mãi nào</span>
                        <span class="text-xs text-slate-500">Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới chương trình</span>
                      </div>
                    </td>
                  </tr>
                } @else {
                  @for (promo of promotions(); track promo.id) {
                    <tr class="hover:bg-[#090d16]/50 transition-colors">
                      <td class="py-3.5 px-4 font-bold text-white max-w-xs">
                        <div class="line-clamp-1">{{ promo.name }}</div>
                        <div class="text-[11px] text-slate-400 font-normal mt-0.5">
                          @if (promo.scope === 'SKU') {
                            <span>Áp dụng cho {{ promo.skuTargets.length }} biến thể SKU</span>
                          } @else if (promo.scope === 'CATEGORY') {
                            <span>Áp dụng cho {{ promo.categoryTargets.length }} danh mục ngành hàng</span>
                          } @else {
                            <span>Áp dụng phối hợp</span>
                          }
                        </div>
                      </td>

                      <td class="py-3.5 px-4 text-slate-300 font-medium">
                        {{ promo.discountType === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định' }}
                      </td>

                      <td class="py-3.5 px-4 text-right font-bold tabular-nums text-rose-400">
                        @if (promo.discountType === 'PERCENTAGE') {
                          {{ promo.discountValue }} %
                        } @else {
                          {{ promo.discountValue | number:'1.0-0' }} VNĐ
                        }
                      </td>

                      <td class="py-3.5 px-4 text-center">
                        @if (promo.isExclusive) {
                          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ĐỘC QUYỀN
                          </span>
                        } @else {
                          <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            CỘNG DỒN
                          </span>
                        }
                      </td>

                      <td class="py-3.5 px-4 text-slate-300 tabular-nums">
                        <div>{{ promo.effectiveFrom | date:'dd/MM/yyyy' }}</div>
                        <div class="text-[11px] text-slate-500">đến {{ promo.effectiveTo | date:'dd/MM/yyyy' }}</div>
                      </td>

                      <td class="py-3.5 px-4 font-mono text-[11px] text-slate-300 max-w-[200px]">
                        @if (promo.scope === 'CATEGORY') {
                          <div class="truncate text-white font-sans" [title]="categoryNames(promo)">
                            Danh mục: {{ categoryNames(promo) }}
                          </div>
                        } @else if (promo.scope === 'SKU') {
                          <div class="truncate" [title]="skuCodes(promo)">
                            SKU: {{ skuCodes(promo) }}
                          </div>
                        } @else {
                          <div class="text-slate-400">Kết hợp SKU & Danh mục</div>
                        }
                      </td>

                      <td class="py-3.5 px-4 text-center">
                        @if (promo.status === 'RUNNING') {
                          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            ĐANG CHẠY
                          </span>
                        } @else if (promo.status === 'UPCOMING') {
                          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            SẮP DIỄN RA
                          </span>
                        } @else if (promo.status === 'EXPIRED') {
                          <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-500 border border-slate-700">
                            HẾT HẠN
                          </span>
                        } @else {
                          <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            TẠM DỪNG
                          </span>
                        }
                      </td>

                      <td class="py-3.5 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            (click)="onToggleStatus(promo)"
                            class="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f3d] transition-colors"
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
                            class="p-1 rounded text-slate-400 hover:text-[#76b900] hover:bg-[#272f3d] transition-colors"
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
                            class="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#272f3d] transition-colors"
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

          <!-- Pagination Controls -->
          @if (!isLoading() && total() > 0) {
            <footer class="p-3.5 bg-[#090d16] border-t border-[#272f3d] flex items-center justify-between text-xs text-slate-400">
              <div>
                Hiển thị trang <strong class="text-white">{{ page() }}</strong> / <strong class="text-white">{{ totalPages() }}</strong>
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
      } @else if (activeTab() === 'coupons') {
        <div class="p-8 bg-[#161b26] border border-[#272f3d] rounded-lg text-center space-y-3">
          <h2 class="text-base font-bold text-white uppercase">Màn Hình Quản Lý Mã Giảm Giá (Coupons)</h2>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            SCR-24: Cấu hình mã voucher giảm giá cấp đơn hàng, quota phát hành và giới hạn lượt dùng mỗi khách hàng.
          </p>
        </div>
      } @else if (activeTab() === 'shipping') {
        <div class="p-8 bg-[#161b26] border border-[#272f3d] rounded-lg text-center space-y-3">
          <h2 class="text-base font-bold text-white uppercase">Màn Hình Biểu Phí Giao Hàng & Freeship</h2>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            SCR-25: Thiết lập mức phí giao hàng cố định toàn quốc và ngưỡng giá trị đơn hàng đạt điều kiện miễn phí vận chuyển.
          </p>
        </div>
      }

      <!-- MOD-33 Dialog Component -->
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

  ngOnInit(): void {
    this.promotionService.loadPromotions();
  }

  onSearchChange(val: string): void {
    this.promotionService.searchQuery.set(val);
    this.promotionService.loadPromotions({ search: val, page: 1 });
  }

  onStatusChange(val: 'ALL' | 'RUNNING' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE'): void {
    this.promotionService.statusFilter.set(val);
    this.promotionService.loadPromotions({ status: val, page: 1 });
  }

  onScopeChange(val: 'ALL' | 'SKU' | 'CATEGORY'): void {
    this.promotionService.scopeFilter.set(val);
    this.promotionService.loadPromotions({ scope: val, page: 1 });
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
