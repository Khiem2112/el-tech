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
import {
  AdminCustomerDetail,
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
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-4 lg:p-6 space-y-5 text-sm text-foreground">
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
        <div class="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-line">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate max-w-[240px] sm:max-w-md" [title]="cust.name">
                {{ cust.name }}
              </h1>

              <button
                type="button"
                (click)="copyCustomerId(cust.id)"
                class="inline-flex items-center gap-1 font-mono text-xs text-muted hover:text-foreground bg-surface-alt hover:bg-surface border border-line px-2 py-0.5 rounded truncate max-w-[200px] sm:max-w-[280px] transition-colors cursor-pointer"
                [title]="'Mã khách hàng: ' + cust.id + ' (Bấm để sao chép)'"
                aria-label="Sao chép mã khách hàng"
              >
                <svg class="w-3 h-3 shrink-0 text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span class="truncate">ID: {{ cust.id }}</span>
              </button>

              @if (cust.mergedIntoCustomerId) {
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wide whitespace-nowrap">
                  Đã Gộp Hồ Sơ
                </span>
              } @else if (cust.isRegistered) {
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary-strong border border-primary/30 uppercase tracking-wide whitespace-nowrap">
                  Thành Viên Chính Thức
                </span>
              } @else {
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-alt text-muted border border-line uppercase tracking-wide whitespace-nowrap">
                  Khách Vãng Lai
                </span>
              }
            </div>

            <div class="flex items-center gap-2 text-xs text-muted mt-1.5 flex-wrap">
              <a routerLink="/admin/customers" class="hover:text-primary transition-colors font-medium">Khách Hàng</a>
              <span class="text-muted/40">/</span>
              <span>Ngày tạo hồ sơ: <strong class="text-foreground">{{ formatDate(cust.createdAt) }}</strong></span>
              @if (cust.user) {
                <span class="text-muted/40">|</span>
                <span>Vai trò hệ thống: <strong class="text-primary font-semibold">{{ cust.user.role }}</strong></span>
              }
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <a
              routerLink="/admin/customers"
              class="px-3 py-1.5 bg-surface hover:bg-surface-alt border border-line rounded text-foreground font-semibold text-xs transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Quay lại danh sách</span>
            </a>
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
            class="p-3 bg-surface border rounded transition-colors"
            [ngClass]="activeTab() === 'orders' ? 'border-primary' : 'border-line'"
          >
            <div (click)="activeTab.set('orders')" class="cursor-pointer">
              <div class="text-xl font-bold text-foreground tabular-nums">
                {{ cust.stats.orderCount }}
              </div>
              <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">
                Đơn Hàng
              </div>
            </div>
          </div>

          <div class="p-3 bg-surface border border-line rounded">
            <div class="text-xl font-bold text-primary tabular-nums whitespace-nowrap">
              {{ formatCurrency(cust.stats.totalSpent) }}
            </div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">
              Tổng Chi Tiêu (LTV)
            </div>
          </div>

          <div
            (click)="activeTab.set('coupons')"
            class="p-3 bg-surface border rounded cursor-pointer transition-colors"
            [ngClass]="activeTab() === 'coupons' ? 'border-primary' : 'border-line'"
          >
            <div class="text-xl font-bold text-foreground tabular-nums">
              {{ cust.stats.couponUsageCount }}
            </div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">
              Voucher Đã Dùng
            </div>
          </div>

          <div
            class="p-3 bg-surface border rounded transition-colors"
            [ngClass]="activeTab() === 'reviews' ? 'border-primary' : 'border-line'"
          >
            <div (click)="activeTab.set('reviews')" class="cursor-pointer">
              <div class="text-xl font-bold text-foreground tabular-nums">
                {{ cust.stats.reviewCount }}
              </div>
              <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">
                Đánh Giá SP
              </div>
            </div>
          </div>

          <div class="p-3 bg-surface border border-line rounded">
            <div class="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {{ cust.stats.mergedCount }}
            </div>
            <div class="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">
              Hồ Sơ Đã Gộp
            </div>
          </div>
        </div>

        <div class="bg-surface border border-line rounded p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-line pb-2">
            <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
              Thông Tin Định Danh Khách Hàng
            </h2>
            <span class="text-xs text-muted tabular-nums">ID: {{ cust.id }}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span class="text-muted block text-xs uppercase font-medium">Họ và tên</span>
              <span class="font-bold text-foreground text-sm mt-0.5 block">{{ cust.name }}</span>
            </div>

            <div>
              <span class="text-muted block text-xs uppercase font-medium">Số điện thoại</span>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="font-bold text-foreground text-sm tabular-nums">{{ cust.phone }}</span>
                <span class="px-1.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/25">
                  Xác thực OTP
                </span>
              </div>
            </div>

            <div>
              <span class="text-muted block text-xs uppercase font-medium">Địa chỉ email</span>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="font-semibold text-foreground truncate text-sm">{{ cust.email }}</span>
                <span class="px-1.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/25 shrink-0">
                  Xác thực OTP
                </span>
              </div>
            </div>
          </div>

          @if (cust.mergedCustomers.length > 0) {
            <div class="mt-3 pt-3 border-t border-line space-y-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Các Hồ Sơ Phụ Đã Gộp Vào Tài Khoản Này ({{ cust.mergedCustomers.length }})
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                @for (sub of cust.mergedCustomers; track sub.id) {
                  <div class="p-2.5 bg-surface-alt border border-line rounded flex items-center justify-between text-xs">
                    <div>
                      <div class="font-bold text-foreground">{{ sub.name }}</div>
                      <div class="text-xs text-muted tabular-nums">{{ sub.phone }} - {{ sub.email }}</div>
                      <div class="text-xs text-muted mt-0.5">Gộp lúc: {{ formatDate(sub.createdAt) }}</div>
                    </div>
                    <div class="text-right">
                      <span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-xs whitespace-nowrap tabular-nums">
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
                <table class="w-full text-left border-collapse text-sm">
                  <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th class="py-3 px-4">Mã đơn</th>
                      <th class="py-3 px-4">Tóm tắt linh kiện</th>
                      <th class="py-3 px-4">Ngày đặt</th>
                      <th class="py-3 px-4">Phương thức</th>
                      <th class="py-3 px-4 text-right">Tổng tiền</th>
                      <th class="py-3 px-4 text-center">Trạng thái</th>
                      <th class="py-3 px-4 text-center w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-line">
                    @if (cust.orders.length === 0) {
                      <tr>
                        <td colspan="7" class="py-10 text-center text-muted">
                          Khách hàng chưa có đơn hàng nào trong lịch sử.
                        </td>
                      </tr>
                    } @else {
                      @for (ord of cust.orders; track ord.id) {
                        <tr class="hover:bg-surface-alt/50 transition-colors">
                          <td class="py-3 px-4 font-bold text-foreground whitespace-nowrap tabular-nums">
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
                          <td class="py-3 px-4 text-muted text-xs whitespace-nowrap tabular-nums">
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
                <table class="w-full text-left border-collapse text-sm">
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
                          <td class="py-3 px-4 font-bold text-primary whitespace-nowrap tabular-nums">
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
                <table class="w-full text-left border-collapse text-sm">
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
                          <td class="py-3 px-4 text-center font-bold text-amber-500 whitespace-nowrap tabular-nums">
                            {{ rev.rating }} / 5 sao
                          </td>
                          <td class="py-3 px-4 text-foreground">
                            {{ rev.text }}
                          </td>
                          <td class="py-3 px-4 text-muted whitespace-nowrap tabular-nums">
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

  copyCustomerId(id: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(id);
      this.showToast('Đã sao chép mã khách hàng vào bộ nhớ tạm', 'success');
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
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
    }
    if (status === 'CANCELLED' || status === 'DELIVERY_FAILED') {
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20';
    }
    if (status === 'SHIPPING' || status === 'ASSEMBLING') {
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20';
    }
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';
  }
}
