import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MergeCustomerDialogComponent } from './components/merge-customer-dialog.component';
import {
  AdminCustomerDetail,
  AdminCustomerMergeResult,
  AdminCustomerService,
} from './services/admin-customer.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

@Component({
  selector: 'app-admin-customer-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MergeCustomerDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto text-sm text-foreground">
      @if (toasts().length > 0) {
        <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          @for (toast of toasts(); track toast.id) {
            <div
              class="px-4 py-3 rounded-lg shadow-lg border text-xs flex items-center justify-between gap-3 animate-fade-in"
              [ngClass]="toast.type === 'success' ? 'bg-surface border-primary text-primary' : 'bg-surface border-red-500 text-red-600'"
            >
              <span>{{ toast.message }}</span>
              <button
                type="button"
                (click)="dismissToast(toast.id)"
                class="text-muted hover:text-foreground"
                title="Đóng thông báo"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
        </div>
      }

      @if (isLoading()) {
        <div class="py-16 text-center text-muted">
          <p class="font-medium text-sm">Đang tải chi tiết hồ sơ khách hàng...</p>
        </div>
      } @else if (customer(); as cust) {
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <nav class="flex items-center space-x-1.5 text-xs text-muted">
                <a routerLink="/admin/customers" class="hover:text-primary transition-colors">Khách Hàng</a>
                <span>/</span>
                <span class="font-mono text-foreground font-bold">{{ cust.id }}</span>
                <span>/</span>
                <span class="text-foreground font-bold">{{ cust.name }}</span>
              </nav>
              @if (cust.mergedIntoCustomerId) {
                <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                  Đã Gộp Hồ Sơ
                </span>
              } @else if (cust.isRegistered) {
                <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 uppercase tracking-wide">
                  Thành Viên Chính Thức
                </span>
              } @else {
                <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-muted/15 text-muted border border-line uppercase tracking-wide">
                  Khách Vãng Lai
                </span>
              }
            </div>
            <p class="text-xs text-muted mt-1">
              Ngày tạo hồ sơ: <strong class="text-foreground">{{ formatDate(cust.createdAt) }}</strong>
              @if (cust.user) {
                | Vai trò hệ thống: <strong class="text-primary font-mono">{{ cust.user.role }}</strong>
              }
            </p>
          </div>

          <div class="flex items-center gap-2">
            <a
              routerLink="/admin/customers"
              class="px-3 py-1.5 bg-surface hover:bg-surface-alt border border-line rounded text-foreground font-semibold text-xs transition-colors"
            >
              Quay lại danh sách
            </a>
            @if (!cust.mergedIntoCustomerId) {
              <button
                type="button"
                (click)="openMergeModal()"
                class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Gộp hồ sơ</span>
              </button>
            }
          </div>
        </div>

        @if (cust.mergedInto; as primaryTarget) {
          <div class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div>
              <strong class="font-bold uppercase tracking-wider block text-amber-700 dark:text-amber-400 mb-0.5">Hồ sơ này đã được hợp nhất</strong>
              Tất cả đơn hàng và giao dịch của khách hàng này đã được chuyển giao vào tài khoản chính: 
              <strong class="text-foreground">{{ primaryTarget.name }}</strong> ({{ primaryTarget.phone }} - {{ primaryTarget.email }}).
            </div>
            <a
              [routerLink]="['/admin/customers', primaryTarget.id]"
              class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs transition-colors shrink-0"
            >
              Xem hồ sơ chính
            </a>
          </div>
        }

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            class="p-4 bg-surface border rounded-lg transition-all hover:border-primary/50 group"
            [ngClass]="activeTab() === 'orders' ? 'border-primary shadow-sm' : 'border-line'"
            title="Tổng số đơn hàng khách đã đặt trên hệ thống"
          >
            <div class="flex items-center justify-between">
              <div (click)="activeTab.set('orders')" class="cursor-pointer flex-1">
                <div class="text-2xl font-black text-foreground tabular-nums group-hover:text-primary transition-colors">
                  {{ cust.stats.orderCount }}
                </div>
                <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
                  Đơn Hàng Đã Đặt
                </div>
              </div>
              <a
                [routerLink]="['/admin/orders']"
                [queryParams]="{ search: cust.phone || cust.name }"
                class="p-1 hover:text-primary text-muted transition-colors"
                title="Mở danh sách đơn hàng toàn màn hình"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div
            class="p-4 bg-surface border border-line rounded-lg"
            title="Tổng giá trị tích lũy đã hoàn tất thanh toán (LTV)"
          >
            <div class="text-2xl font-black text-primary tabular-nums whitespace-nowrap">
              {{ formatCurrency(cust.stats.totalSpent) }}
            </div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
              Tổng Chi Tiêu (LTV)
            </div>
          </div>

          <div
            (click)="activeTab.set('coupons')"
            class="p-4 bg-surface border rounded-lg cursor-pointer transition-all hover:border-primary/50 group"
            [ngClass]="activeTab() === 'coupons' ? 'border-primary shadow-sm' : 'border-line'"
            title="Số lượng voucher giảm giá đã áp dụng"
          >
            <div class="text-2xl font-black text-foreground tabular-nums group-hover:text-primary transition-colors">
              {{ cust.stats.couponUsageCount }}
            </div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
              Voucher Đã Dùng
            </div>
          </div>

          <div
            class="p-4 bg-surface border rounded-lg transition-all hover:border-primary/50 group"
            [ngClass]="activeTab() === 'reviews' ? 'border-primary shadow-sm' : 'border-line'"
            title="Số bài đánh giá linh kiện khách đã gửi"
          >
            <div class="flex items-center justify-between">
              <div (click)="activeTab.set('reviews')" class="cursor-pointer flex-1">
                <div class="text-2xl font-black text-foreground tabular-nums group-hover:text-primary transition-colors">
                  {{ cust.stats.reviewCount }}
                </div>
                <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
                  Đánh Giá Linh Kiện
                </div>
              </div>
              <a
                [routerLink]="['/admin/reviews']"
                [queryParams]="{ search: cust.phone || cust.name }"
                class="p-1 hover:text-primary text-muted transition-colors"
                title="Mở danh sách kiểm duyệt đánh giá"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div
            class="p-4 bg-surface border border-line rounded-lg"
            title="Số hồ sơ phụ đã được gộp vào tài khoản này"
          >
            <div class="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {{ cust.stats.mergedCount }}
            </div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
              Hồ Sơ Đã Gộp
            </div>
          </div>
        </div>

        <div class="bg-surface border border-line rounded-lg p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-line pb-2.5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
              Thông Tin Định Danh Khách Hàng
            </h2>
            <span class="text-xs text-muted font-mono">ID: {{ cust.id }}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label class="block text-muted font-medium mb-1">Họ và tên</label>
              <div class="p-2.5 bg-surface-alt border border-line rounded font-semibold text-foreground">
                {{ cust.name }}
              </div>
            </div>

            <div>
              <label class="block text-muted font-medium mb-1">Số điện thoại</label>
              <div class="p-2.5 bg-surface-alt border border-line rounded font-mono font-semibold text-foreground flex items-center justify-between">
                <span>{{ cust.phone }}</span>
                <span class="px-1.5 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/25">
                  Xác thực OTP
                </span>
              </div>
            </div>

            <div>
              <label class="block text-muted font-medium mb-1">Địa chỉ email</label>
              <div class="p-2.5 bg-surface-alt border border-line rounded font-semibold text-foreground flex items-center justify-between">
                <span class="truncate">{{ cust.email }}</span>
                <span class="px-1.5 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/25 shrink-0 ml-2">
                  Xác thực OTP
                </span>
              </div>
            </div>
          </div>

          @if (cust.mergedCustomers.length > 0) {
            <div class="mt-4 pt-4 border-t border-line space-y-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Các Hồ Sơ Phụ Đã Gộp Vào Tài Khoản Này ({{ cust.mergedCustomers.length }})
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                @for (sub of cust.mergedCustomers; track sub.id) {
                  <div class="p-3 bg-surface-alt border border-line rounded flex items-center justify-between text-xs">
                    <div>
                      <div class="font-bold text-foreground">{{ sub.name }}</div>
                      <div class="text-xs text-muted font-mono">{{ sub.phone }} - {{ sub.email }}</div>
                      <div class="text-xs text-muted mt-0.5">Gộp lúc: {{ formatDate(sub.createdAt) }}</div>
                    </div>
                    <div class="text-right">
                      <span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold font-mono text-xs whitespace-nowrap tabular-nums">
                        {{ sub.orderCount }} đơn đã chuyển
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-2 border-b border-line">
            <button
              type="button"
              (click)="activeTab.set('orders')"
              class="px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors"
              [ngClass]="activeTab() === 'orders' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'"
            >
              Lịch Sử Đơn Hàng ({{ cust.orders.length }})
            </button>
            <button
              type="button"
              (click)="activeTab.set('coupons')"
              class="px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors"
              [ngClass]="activeTab() === 'coupons' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'"
            >
              Voucher Đã Dùng ({{ cust.couponRedemptions.length }})
            </button>
            <button
              type="button"
              (click)="activeTab.set('reviews')"
              class="px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors"
              [ngClass]="activeTab() === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'"
            >
              Đánh Giá Sản Phẩm ({{ cust.reviews.length }})
            </button>
          </div>

          @if (activeTab() === 'orders') {
            <div class="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th class="py-3 px-4">Mã đơn</th>
                      <th class="py-3 px-4">Tóm tắt linh kiện</th>
                      <th class="py-3 px-4">Ngày đặt</th>
                      <th class="py-3 px-4">Chi nhánh</th>
                      <th class="py-3 px-4">Phương thức</th>
                      <th class="py-3 px-4 text-right">Tổng tiền</th>
                      <th class="py-3 px-4 text-center">Trạng thái</th>
                      <th class="py-3 px-4 text-center w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-line">
                    @if (cust.orders.length === 0) {
                      <tr>
                        <td colspan="8" class="py-10 text-center text-muted">
                          Khách hàng chưa có đơn hàng nào trong lịch sử.
                        </td>
                      </tr>
                    } @else {
                      @for (ord of cust.orders; track ord.id) {
                        <tr class="hover:bg-surface-alt/50 transition-colors">
                          <td class="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                            <a [routerLink]="['/admin/orders', ord.id]" class="hover:text-primary transition-colors">
                              {{ ord.code }}
                            </a>
                          </td>
                          <td class="py-3 px-4 max-w-xs truncate text-foreground" [title]="ord.summaryDescription">
                            {{ ord.summaryDescription }}
                          </td>
                          <td class="py-3 px-4 text-muted tabular-nums whitespace-nowrap">
                            {{ formatDate(ord.submittedAt) }}
                          </td>
                          <td class="py-3 px-4 text-muted whitespace-nowrap">
                            {{ ord.branch.code }} ({{ ord.branch.name }})
                          </td>
                          <td class="py-3 px-4 text-muted font-mono text-xs whitespace-nowrap">
                            {{ ord.paymentMethod }} | {{ ord.fulfillmentMethod }}
                          </td>
                          <td class="py-3 px-4 text-right font-bold tabular-nums text-foreground whitespace-nowrap">
                            {{ formatCurrency(ord.grandTotal) }}
                          </td>
                          <td class="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              class="inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                              [ngClass]="getOrderStatusBadgeClass(ord.status)"
                            >
                              {{ formatOrderStatus(ord.status) }}
                            </span>
                          </td>
                          <td class="py-3 px-4 text-center whitespace-nowrap">
                            <a
                              [routerLink]="['/admin/orders', ord.id]"
                              class="px-2 py-1 bg-surface hover:bg-surface-alt text-foreground border border-line rounded text-xs font-semibold transition-colors inline-flex items-center gap-1"
                              title="Xem chi tiết đơn hàng"
                            >
                              <span>Xem đơn</span>
                            </a>
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          @if (activeTab() === 'coupons') {
            <div class="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th class="py-3 px-4">Mã Voucher</th>
                      <th class="py-3 px-4">Tên chương trình</th>
                      <th class="py-3 px-4">Mức giảm</th>
                      <th class="py-3 px-4">Thời điểm đặt</th>
                      <th class="py-3 px-4">Thời điểm áp dụng</th>
                      <th class="py-3 px-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-line">
                    @if (cust.couponRedemptions.length === 0) {
                      <tr>
                        <td colspan="6" class="py-10 text-center text-muted">
                          Khách hàng chưa sử dụng mã giảm giá nào.
                        </td>
                      </tr>
                    } @else {
                      @for (redemption of cust.couponRedemptions; track redemption.id) {
                        <tr class="hover:bg-surface-alt/50 transition-colors">
                          <td class="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">
                            {{ redemption.coupon.code }}
                          </td>
                          <td class="py-3 px-4 font-semibold text-foreground">
                            {{ redemption.coupon.name }}
                          </td>
                          <td class="py-3 px-4 tabular-nums text-foreground whitespace-nowrap">
                            {{ formatDiscount(redemption.coupon.discountType, redemption.coupon.discountValue) }}
                          </td>
                          <td class="py-3 px-4 text-muted tabular-nums whitespace-nowrap">
                            {{ formatDate(redemption.reservedAt) }}
                          </td>
                          <td class="py-3 px-4 text-muted tabular-nums whitespace-nowrap">
                            {{ redemption.consumedAt ? formatDate(redemption.consumedAt) : 'Chưa áp dụng' }}
                          </td>
                          <td class="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              class="inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                              [ngClass]="redemption.status === 'CONSUMED' ? 'bg-primary/10 text-primary border border-primary/25' : 'bg-muted/15 text-muted border border-line'"
                            >
                              {{ redemption.status }}
                            </span>
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          @if (activeTab() === 'reviews') {
            <div class="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th class="py-3 px-4">Sản phẩm linh kiện</th>
                      <th class="py-3 px-4 text-center w-24">Đánh giá</th>
                      <th class="py-3 px-4">Nội dung nhận xét</th>
                      <th class="py-3 px-4">Mã đơn hàng</th>
                      <th class="py-3 px-4">Thời gian</th>
                      <th class="py-3 px-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-line">
                    @if (cust.reviews.length === 0) {
                      <tr>
                        <td colspan="6" class="py-10 text-center text-muted">
                          Khách hàng chưa viết đánh giá sản phẩm nào.
                        </td>
                      </tr>
                    } @else {
                      @for (rev of cust.reviews; track rev.id) {
                        <tr class="hover:bg-surface-alt/50 transition-colors">
                          <td class="py-3 px-4 font-bold text-foreground max-w-xs truncate">
                            {{ rev.productTemplate.name }}
                          </td>
                          <td class="py-3 px-4 text-center font-bold text-amber-500 font-mono whitespace-nowrap">
                            {{ rev.rating }} / 5 sao
                          </td>
                          <td class="py-3 px-4 text-foreground">
                            {{ rev.text }}
                          </td>
                          <td class="py-3 px-4 font-mono text-muted whitespace-nowrap">
                            <a [routerLink]="['/admin/orders', rev.order.id]" class="hover:text-primary underline">
                              {{ rev.order.code }}
                            </a>
                          </td>
                          <td class="py-3 px-4 text-muted tabular-nums whitespace-nowrap">
                            {{ formatDate(rev.createdAt) }}
                          </td>
                          <td class="py-3 px-4 text-center whitespace-nowrap">
                            @if (rev.isVisible) {
                              <span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/25 uppercase">
                                Hiển Thị
                              </span>
                            } @else {
                              <span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 uppercase">
                                Đã Ẩn
                              </span>
                            }
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>

        <app-merge-customer-dialog
          [isOpen]="isMergeModalOpen()"
          [targetCustomer]="customer()"
          (close)="isMergeModalOpen.set(false)"
          (merged)="handleMerged($event)"
        />
      } @else {
        <div class="py-16 text-center text-muted">
          <p class="font-medium text-sm">Không tìm thấy thông tin khách hàng yêu cầu.</p>
          <a routerLink="/admin/customers" class="mt-3 inline-block text-primary underline text-xs">
            Quay lại danh sách khách hàng
          </a>
        </div>
      }
    </div>
  `,
})
export class AdminCustomerDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly customerService = inject(AdminCustomerService);

  readonly customer = signal<AdminCustomerDetail | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly activeTab = signal<'orders' | 'coupons' | 'reviews'>('orders');
  readonly isMergeModalOpen = signal<boolean>(false);
  readonly toasts = signal<ToastNotification[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        void this.loadCustomerDetail(id);
      }
    });
  }

  async loadCustomerDetail(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const detail = await this.customerService.getCustomerById(id);
      this.customer.set(detail);
    } catch {
      this.customer.set(null);
      this.showToast('Không thể tải chi tiết hồ sơ khách hàng', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  openMergeModal(): void {
    this.isMergeModalOpen.set(true);
  }

  handleMerged(result: AdminCustomerMergeResult): void {
    this.showToast(
      `Đã gộp thành công ${result.ordersMoved} đơn hàng và dữ liệu từ hồ sơ phụ sang hồ sơ chính.`,
      'success',
    );
    const currentCustomer = this.customer();
    if (currentCustomer) {
      void this.loadCustomerDetail(currentCustomer.id);
    }
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const id = Date.now();
    this.toasts.update((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      this.dismissToast(id);
    }, 5000);
  }

  dismissToast(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  formatDiscount(type: string, value: number): string {
    if (type === 'PERCENTAGE') {
      return `Giảm ${value}%`;
    }
    return `Giảm ${this.formatCurrency(value)}`;
  }

  formatOrderStatus(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING_PAYMENT: 'Chờ thanh toán',
      PENDING_COD_CONFIRMATION: 'Chờ xác nhận COD',
      CONFIRMED: 'Đã xác nhận',
      PREPARING_COMPONENTS: 'Đang chuẩn bị',
      ASSEMBLING: 'Đang lắp ráp',
      READY_FOR_PICKUP: 'Sẵn sàng nhận',
      SHIPPING: 'Đang giao hàng',
      DELIVERY_FAILED: 'Giao thất bại',
      RETURNING: 'Đang hoàn về',
      RETURNED_TO_BRANCH: 'Đã trả về kho',
      COMPLETED: 'Hoàn tất',
      ON_HOLD: 'Tạm giữ',
      CANCELLED: 'Đã hủy',
    };
    return statusMap[status] || status;
  }

  getOrderStatusBadgeClass(status: string): string {
    if (status === 'COMPLETED') {
      return 'bg-primary/10 text-primary border border-primary/25';
    }
    if (status === 'CANCELLED' || status === 'DELIVERY_FAILED') {
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25';
    }
    if (status === 'SHIPPING' || status === 'ASSEMBLING') {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25';
    }
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25';
  }
}
