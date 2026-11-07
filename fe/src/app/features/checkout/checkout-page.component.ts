import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiClientService } from '../../core/api/api-client.service';
import { createIdempotencyKey } from '../../core/api/idempotency';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { VndPipe } from '../../lib/vnd.pipe';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { InputDirective } from '../../components/atoms/input/input.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';
import { checkoutCustomerSchema } from '../../forms/checkout.schema';

type Quote = {
  readonly subtotal: string;
  readonly productDiscount?: string;
  readonly couponDiscount?: string;
  readonly discountAmount?: string;
  readonly couponCode?: string;
  readonly shippingFee: string;
  readonly grandTotal: string;
  readonly branches: readonly { id: number; name: string; available: boolean }[];
};

type SubmitResult = {
  readonly code: string;
  readonly status: string;
  readonly paymentState: string;
  readonly paymentReference?: string;
  readonly expectedAmount?: string;
};

@Component({
  selector: 'app-checkout-page',
  imports: [FormsModule, RouterLink, VndPipe, ButtonDirective, BadgeDirective, InputDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Breadcrumb & Header Ribbon -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <nav class="text-xs text-muted mb-1 flex items-center gap-1.5">
            <a routerLink="/" class="hover:text-foreground">Trang chủ</a>
            <span>/</span>
            <a routerLink="/gio-hang" class="hover:text-foreground">Giỏ hàng</a>
            <span>/</span>
            <span class="text-foreground font-bold">Thanh toán & Đặt hàng</span>
          </nav>
          <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Thanh Toán & Đặt Hàng</h1>
          <p class="text-xs text-muted mt-1">Hệ thống xử lý đơn hàng tự động, bảo đảm quyền lợi bảo hành phần cứng chính hãng.</p>
        </div>

        <div class="hidden sm:flex items-center gap-2 text-xs">
          <span appBadge variant="dark">Giỏ hàng</span>
          <lucide-icon name="ChevronRight" class="size-3 text-muted" aria-hidden="true"></lucide-icon>
          <span appBadge variant="primary">Thanh toán</span>
          <lucide-icon name="ChevronRight" class="size-3 text-muted" aria-hidden="true"></lucide-icon>
          <span appBadge variant="dark">Hoàn tất</span>
        </div>
      </div>

      <!-- Result State After Successful Order Submission -->
      @if (orderResult(); as order) {
        <div class="mt-8 bg-surface rounded-xl border border-line p-6 sm:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <span appBadge variant="primary" class="font-bold">
                MÃ ĐƠN HÀNG: {{ order.code }}
              </span>
              <h2 class="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-2">Đặt Hàng Thành Công!</h2>
            </div>
            <div class="text-right">
              <span appBadge variant="success">
                TRẠNG THÁI: {{ order.status }}
              </span>
            </div>
          </div>

          <p class="text-xs text-muted leading-relaxed">
            Đơn hàng của bạn đã được ghi nhận vào hệ thống EL-TECH. Nhân viên showroom sẽ tiến hành kiểm tra linh kiện và đối soát tình trạng kho ngay lập tức.
          </p>

          @if (order.paymentReference) {
            <div class="bg-surface-elevated p-5 rounded-xl border border-line-dark text-foreground-dark shadow-xl space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-primary uppercase">THÔNG TIN CHUYỂN KHOẢN VIETQR</span>
                <span class="text-xs text-warning">Thời gian giữ hàng: 20 phút</span>
              </div>

              <div class="grid sm:grid-cols-2 gap-3 text-xs">
                <div class="p-3 rounded-md bg-surface-dark border border-line-dark">
                  <span class="text-muted block text-xs">Nội dung chuyển khoản (chính xác):</span>
                  <strong class="text-primary text-base tracking-wider tabular font-bold">{{ order.paymentReference }}</strong>
                </div>
                <div class="p-3 rounded-md bg-surface-dark border border-line-dark">
                  <span class="text-muted block text-xs">Số tiền cần thanh toán:</span>
                  <strong class="text-primary text-base tabular font-bold">{{ (order.expectedAmount ?? '0') | vnd }}</strong>
                </div>
              </div>
            </div>
          }

          <div class="flex flex-wrap gap-3 pt-2">
            <a routerLink="/tra-cuu-don" appButton variant="primary" size="lg">
              <span>Tra cứu & theo dõi tiến trình đơn hàng</span>
              <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
            </a>
            <a routerLink="/san-pham" appButton variant="secondary" size="lg">
              <span>Tiếp tục xem sản phẩm</span>
            </a>
          </div>
        </div>
      } @else {
        <!-- Main Form Grid (7 cols Left, 5 cols Right) -->
        <div class="grid lg:grid-cols-12 gap-8 mt-8 items-start">
          
          <!-- Left Forms Column (Col 7) -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Customer Information Card (Streamlined, zero OTP blocker) -->
            <div class="bg-surface p-5 sm:p-6 rounded-xl border border-line shadow-sm space-y-4">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <div class="flex items-center gap-2.5">
                  <div class="size-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <lucide-icon name="User" class="size-4" aria-hidden="true"></lucide-icon>
                  </div>
                  <div>
                    <h2 class="font-bold text-sm sm:text-base text-foreground">Thông Tin Nhận Hàng</h2>
                    <p class="text-xs text-muted">Đặt hàng nhanh chóng, không yêu cầu xác thực OTP rườm rà</p>
                  </div>
                </div>
                <span appBadge variant="outline" class="text-xs text-primary border-primary/30">
                  NHẬN DIỆN NHANH
                </span>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-foreground mb-1">
                    Họ và tên người nhận <span class="text-danger">*</span>
                  </label>
                  <input
                    appInput
                    class="w-full text-sm font-medium"
                    [(ngModel)]="name"
                    (blur)="validateField('name')"
                    (ngModelChange)="clearFieldError('name')"
                    [class.border-danger]="validationErrors()['name']"
                    placeholder="Ví dụ: Nguyễn Hoàng Nam"
                  >
                  @if (validationErrors()['name']; as errorMsg) {
                    <p class="text-xs text-danger font-medium mt-1 flex items-center gap-1">
                      <lucide-icon name="AlertCircle" class="size-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                      <span>{{ errorMsg }}</span>
                    </p>
                  }
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-foreground mb-1">
                      Số điện thoại liên hệ <span class="text-danger">*</span>
                    </label>
                    <input
                      appInput
                      class="w-full text-sm font-medium"
                      [(ngModel)]="phone"
                      type="tel"
                      (blur)="validateField('phone')"
                      (ngModelChange)="clearFieldError('phone')"
                      [class.border-danger]="validationErrors()['phone']"
                      placeholder="Ví dụ: 0988 234 567"
                    >
                    @if (validationErrors()['phone']; as errorMsg) {
                      <p class="text-xs text-danger font-medium mt-1 flex items-center gap-1">
                        <lucide-icon name="AlertCircle" class="size-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                        <span>{{ errorMsg }}</span>
                      </p>
                    }
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-foreground mb-1">
                      Email nhận thông báo hóa đơn <span class="text-danger">*</span>
                    </label>
                    <input
                      appInput
                      class="w-full text-sm font-medium"
                      [(ngModel)]="email"
                      type="email"
                      (blur)="validateField('email')"
                      (ngModelChange)="clearFieldError('email')"
                      [class.border-danger]="validationErrors()['email']"
                      placeholder="hoangnam.tech@gmail.com"
                    >
                    @if (validationErrors()['email']; as errorMsg) {
                      <p class="text-xs text-danger font-medium mt-1 flex items-center gap-1">
                        <lucide-icon name="AlertCircle" class="size-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                        <span>{{ errorMsg }}</span>
                      </p>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Fulfillment Method Selection Card -->
            <div class="bg-surface p-5 sm:p-6 rounded-xl border border-line shadow-sm space-y-4">
              <div class="flex items-center gap-2.5 border-b border-line pb-3">
                <div class="size-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <lucide-icon name="Truck" class="size-4" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <h2 class="font-bold text-sm sm:text-base text-foreground">Phương Thức Nhận Hàng</h2>
                  <p class="text-xs text-muted">Lựa chọn nhận máy tại Showroom hoặc chuyển phát tận nơi</p>
                </div>
              </div>

              <!-- Fulfillment Tab Buttons -->
              <div class="grid grid-cols-2 gap-2 bg-surface-alt p-1 rounded-lg border border-line">
                <button
                  type="button"
                  (click)="setFulfillment('PICKUP')"
                  class="py-2.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  [class.bg-surface]="fulfillment === 'PICKUP'"
                  [class.text-foreground]="fulfillment === 'PICKUP'"
                  [class.shadow-sm]="fulfillment === 'PICKUP'"
                  [class.border]="fulfillment === 'PICKUP'"
                  [class.border-line]="fulfillment === 'PICKUP'"
                  [class.text-muted]="fulfillment !== 'PICKUP'"
                >
                  <lucide-icon name="Store" class="size-4" [class.text-primary]="fulfillment === 'PICKUP'" aria-hidden="true"></lucide-icon>
                  <span>Nhận tại Showroom</span>
                  <span class="px-1.5 py-0.5 rounded text-xs bg-primary/15 text-primary uppercase font-bold">Miễn phí</span>
                </button>

                <button
                  type="button"
                  (click)="setFulfillment('DELIVERY')"
                  class="py-2.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  [class.bg-surface]="fulfillment === 'DELIVERY'"
                  [class.text-foreground]="fulfillment === 'DELIVERY'"
                  [class.shadow-sm]="fulfillment === 'DELIVERY'"
                  [class.border]="fulfillment === 'DELIVERY'"
                  [class.border-line]="fulfillment === 'DELIVERY'"
                  [class.text-muted]="fulfillment !== 'DELIVERY'"
                >
                  <lucide-icon name="Truck" class="size-4" [class.text-primary]="fulfillment === 'DELIVERY'" aria-hidden="true"></lucide-icon>
                  <span>Giao hàng tận nơi</span>
                </button>
              </div>

              <!-- Pickup Showroom Options -->
              @if (fulfillment === 'PICKUP') {
                <div class="space-y-3 pt-1">
                  <label class="block text-xs font-bold text-foreground">
                    Địa điểm nhận bàn giao máy:
                  </label>
                  <div class="p-4 rounded-lg border border-primary/30 bg-primary/5 flex items-start justify-between">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-foreground block">Showroom EL-TECH</span>
                        <span appBadge variant="outline" class="text-xs text-primary border-primary/30">SHOWROOM CHÍNH</span>
                      </div>
                      <p class="text-xs text-muted">280 Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh</p>
                      <p class="text-xs text-muted">Thời gian phục vụ: 08:30 - 21:30 hàng ngày</p>
                    </div>
                    <span appBadge variant="outline" class="text-xs text-primary border-primary/30 shrink-0">
                      SẴN HÀNG
                    </span>
                  </div>
                  <p class="text-xs text-muted flex items-center gap-1.5 pt-1">
                    <lucide-icon name="ShieldCheck" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                    <span>Nhận tại showroom được hỗ trợ unbox và kiểm tra linh kiện trực tiếp cùng kỹ thuật viên.</span>
                  </p>
                </div>
              }

              <!-- Delivery Address Fields -->
              @if (fulfillment === 'DELIVERY') {
                <div class="space-y-3 pt-1">
                  <div class="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-foreground mb-1">
                        Tỉnh / Thành phố <span class="text-danger">*</span>
                      </label>
                      <input
                        appInput
                        class="w-full text-sm font-medium"
                        [(ngModel)]="province"
                        (blur)="validateField('province')"
                        (ngModelChange)="clearFieldError('province')"
                        [class.border-danger]="validationErrors()['province']"
                        placeholder="TP. Hồ Chí Minh / Hà Nội / Đà Nẵng..."
                      >
                      @if (validationErrors()['province']; as errorMsg) {
                        <p class="text-xs text-danger font-medium mt-1 flex items-center gap-1">
                          <lucide-icon name="AlertCircle" class="size-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                          <span>{{ errorMsg }}</span>
                        </p>
                      }
                    </div>

                    <div>
                      <label class="block text-xs font-bold text-foreground mb-1">
                        Quận / Huyện <span class="text-danger">*</span>
                      </label>
                      <input
                        appInput
                        class="w-full text-sm font-medium"
                        [(ngModel)]="district"
                        (blur)="validateField('district')"
                        (ngModelChange)="clearFieldError('district')"
                        [class.border-danger]="validationErrors()['district']"
                        placeholder="Quận 10 / Q. Đống Đa..."
                      >
                      @if (validationErrors()['district']; as errorMsg) {
                        <p class="text-xs text-danger font-medium mt-1 flex items-center gap-1">
                          <lucide-icon name="AlertCircle" class="size-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                          <span>{{ errorMsg }}</span>
                        </p>
                      }
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-foreground mb-1">
                      Địa chỉ cụ thể (Số nhà, tên đường, phường/xã) <span class="text-danger">*</span>
                    </label>
                    <input
                      appInput
                      class="w-full text-sm font-medium"
                      [(ngModel)]="streetAddress"
                      (blur)="validateField('streetAddress')"
                      (ngModelChange)="clearFieldError('streetAddress')"
                      [class.border-danger]="validationErrors()['streetAddress']"
                      placeholder="Số 280 Ba Tháng Hai, Phường 12..."
                    >
                    @if (validationErrors()['streetAddress']; as errorMsg) {
                      <p class="text-xs text-danger font-medium mt-1 flex items-center gap-1">
                        <lucide-icon name="AlertCircle" class="size-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                        <span>{{ errorMsg }}</span>
                      </p>
                    }
                  </div>
                </div>
              }

              <!-- Technical Notes Field -->
              <div class="pt-2 border-t border-line">
                <label class="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <lucide-icon name="FileText" class="size-3.5 text-muted" aria-hidden="true"></lucide-icon>
                  <span>Ghi chú kỹ thuật & Giao nhận (Tùy chọn)</span>
                </label>
                <textarea
                  appInput
                  rows="2"
                  class="w-full text-sm leading-relaxed"
                  [(ngModel)]="technicalNotes"
                  placeholder="Ví dụ: Cập nhật BIOS mới nhất, đi dây gọn mặt sau thùng máy, giao giờ hành chính..."
                ></textarea>
              </div>
            </div>

            <!-- Payment Method Choice Card -->
            <div class="bg-surface p-5 sm:p-6 rounded-xl border border-line shadow-sm space-y-4">
              <div class="flex items-center gap-2.5 border-b border-line pb-3">
                <div class="size-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <lucide-icon name="CreditCard" class="size-4" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <h2 class="font-bold text-sm sm:text-base text-foreground">Phương Thức Thanh Toán</h2>
                  <p class="text-xs text-muted">Hỗ trợ quét mã VietQR tự động hoặc thanh toán khi nhận hàng</p>
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-3">
                <label
                  class="p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-all"
                  [class.border-primary]="paymentMethod === 'QR'"
                  [class.bg-primary/5]="paymentMethod === 'QR'"
                  [class.border-line]="paymentMethod !== 'QR'"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="QR"
                    [(ngModel)]="paymentMethod"
                    class="mt-0.5 text-primary focus:ring-primary"
                  >
                  <div>
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-xs text-foreground">VietQR Tự Động</span>
                      <span class="px-1.5 py-0.5 rounded text-xs bg-primary text-primary-foreground font-bold uppercase">
                        Khuyên dùng
                      </span>
                    </div>
                    <span class="text-xs text-muted mt-0.5 block leading-relaxed">
                      Giữ hàng ngay lập tức. Thanh toán qua ngân hàng.
                    </span>
                  </div>
                </label>

                <label
                  class="p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-all"
                  [class.border-primary]="paymentMethod === 'COD'"
                  [class.bg-primary/5]="paymentMethod === 'COD'"
                  [class.border-line]="paymentMethod !== 'COD'"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    [(ngModel)]="paymentMethod"
                    class="mt-0.5 text-primary focus:ring-primary"
                  >
                  <div>
                    <span class="font-bold text-xs text-foreground block">Thanh toán khi nhận (COD)</span>
                    <span class="text-xs text-muted mt-0.5 block leading-relaxed">
                      Kiểm tra hàng cùng nhân viên rồi thanh toán trực tiếp tại quầy hoặc shipper.
                    </span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <!-- Right Column: Order Summary, PC Breakdown Accordion & VietQR (Col 5) -->
          <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            <!-- Order Configuration Breakdown Card -->
            <div class="bg-surface rounded-xl p-5 sm:p-6 shadow-sm border border-line space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-line">
                <div class="flex items-center gap-2">
                  <lucide-icon name="Cpu" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                  <h3 class="font-bold text-sm text-foreground">Chi Tiết Cấu Hình Đặt Mua</h3>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-surface-alt text-muted text-xs font-bold tabular">
                  {{ cart.itemCount() }} món
                </span>
              </div>

              <!-- Cart Item List -->
              <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
                <!-- Grouped PC Builds with Accordion Breakdown -->
                @for (build of cart.pcBuildGroups(); track build.key) {
                  <div class="p-3 bg-surface-alt rounded-lg border border-line space-y-2">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-bold uppercase">
                            Bộ PC Hoàn Chỉnh
                          </span>
                          <span class="text-xs text-muted tabular">SL: {{ build.quantity }}</span>
                        </div>
                        <h4 class="text-sm font-bold text-foreground mt-1 truncate">{{ build.buildName }}</h4>
                        <span class="text-xs text-muted block">Bao gồm {{ build.componentCount }} linh kiện chính hãng</span>
                      </div>
                      <div class="text-right shrink-0">
                        <span class="text-xs font-bold text-foreground block tabular">{{ build.totalPrice | vnd }}</span>
                      </div>
                    </div>

                    <!-- Accordion Toggle Button (CO-02) -->
                    <button
                      type="button"
                      (click)="toggleBuildAccordion(build.key)"
                      class="w-full flex items-center justify-between px-2.5 py-1.5 bg-surface hover:bg-surface-elevated/5 rounded border border-line text-xs font-semibold text-foreground transition-all cursor-pointer"
                      [attr.aria-expanded]="isBuildExpanded(build.key)"
                    >
                      <span class="flex items-center gap-1.5 text-primary font-bold">
                        <lucide-icon name="List" class="size-3.5" aria-hidden="true"></lucide-icon>
                        <span>{{ isBuildExpanded(build.key) ? 'Thu gọn linh kiện' : 'Xem chi tiết ' + build.componentCount + ' linh kiện đã chọn' }}</span>
                      </span>
                      <lucide-icon
                        name="ChevronDown"
                        class="size-3.5 text-muted transition-transform duration-200"
                        [class.rotate-180]="isBuildExpanded(build.key)"
                        aria-hidden="true"
                      ></lucide-icon>
                    </button>

                    <!-- Collapsible Component List -->
                    @if (isBuildExpanded(build.key)) {
                      <div class="space-y-1.5 pt-1.5 border-t border-line text-xs">
                        @for (item of build.hardwareItems; track item.id) {
                          <div class="flex items-center justify-between py-1 border-b border-line/40">
                            <div class="flex items-center gap-1.5 min-w-0">
                              <span class="px-1.5 py-0.5 rounded bg-surface-dark text-foreground-dark text-xs font-bold shrink-0">
                                {{ getComponentSlot(item.name) }}
                              </span>
                              <span class="text-foreground truncate text-xs">{{ item.name }}</span>
                            </div>
                            <span class="text-muted text-xs shrink-0 tabular ml-2">
                              {{ item.lineTotal | vnd }}
                            </span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- Standalone Non-PC Build Hardware Items -->
                @for (item of standaloneItems(); track item.id) {
                  <div class="flex items-center justify-between gap-2 p-2.5 bg-surface-alt rounded-lg border border-line">
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-semibold text-foreground truncate">{{ item.name }}</h4>
                      <span class="text-xs text-muted">Số lượng: <strong class="tabular font-medium text-foreground">{{ item.quantity }}</strong></span>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="text-xs font-bold text-foreground tabular">{{ item.lineTotal | vnd }}</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Coupon Code Input Box -->
              <div class="pt-3 border-t border-line space-y-2">
                <label class="block text-xs font-bold text-foreground">
                  Mã giảm giá / Coupon (Tùy chọn)
                </label>
                <div class="flex gap-2">
                  <input
                    appInput
                    class="flex-1 text-xs font-medium uppercase"
                    [(ngModel)]="couponCodeInput"
                    [disabled]="!!appliedCouponCode() || applyingCoupon()"
                    placeholder="Nhập mã ưu đãi..."
                  >
                  @if (!appliedCouponCode()) {
                    <button
                      type="button"
                      appButton
                      variant="secondary"
                      size="sm"
                      class="shrink-0 cursor-pointer text-xs font-semibold"
                      [disabled]="!couponCodeInput.trim() || applyingCoupon()"
                      (click)="applyCoupon()"
                    >
                      <lucide-icon [name]="applyingCoupon() ? 'loader-2' : 'Tag'" class="size-3.5" [class.animate-spin]="applyingCoupon()" aria-hidden="true"></lucide-icon>
                      <span>{{ applyingCoupon() ? 'Đang kiểm tra...' : 'Áp dụng' }}</span>
                    </button>
                  } @else {
                    <button
                      type="button"
                      appButton
                      variant="outline"
                      size="sm"
                      class="shrink-0 cursor-pointer text-xs text-danger border-danger/30 hover:bg-danger/10"
                      (click)="removeCoupon()"
                    >
                      <span>Bỏ mã</span>
                    </button>
                  }
                </div>

                @if (couponError()) {
                  <p class="text-xs text-danger font-medium flex items-center gap-1">
                    <lucide-icon name="AlertCircle" class="size-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                    <span>{{ couponError() }}</span>
                  </p>
                }
                @if (appliedCouponCode(); as code) {
                  <div class="flex items-center justify-between text-xs p-2 rounded-md bg-primary/10 border border-primary/20 text-primary">
                    <div class="flex items-center gap-1.5 font-bold">
                      <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                      <span>Đã áp dụng mã: {{ code }}</span>
                    </div>
                    <span class="font-bold tabular">- {{ couponDiscountAmount() | vnd }}</span>
                  </div>
                }
              </div>

              <!-- Price Breakdown Table -->
              <div class="space-y-2 pt-3 border-t border-line text-xs">
                <div class="flex justify-between text-muted">
                  <span>Tạm tính linh kiện:</span>
                  <span class="font-semibold text-foreground tabular">
                    {{ (quoteResult()?.subtotal ?? cart.subtotal()) | vnd }}
                  </span>
                </div>

                @if (productDiscountAmount() > 0) {
                  <div class="flex justify-between text-primary font-medium">
                    <span>Chính sách khuyến mãi (CSKM):</span>
                    <span class="tabular">- {{ productDiscountAmount() | vnd }}</span>
                  </div>
                }

                @if (appliedCouponCode() && couponDiscountAmount() > 0) {
                  <div class="flex justify-between text-primary font-medium">
                    <span>Ưu đãi mã giảm giá:</span>
                    <span class="tabular">- {{ couponDiscountAmount() | vnd }}</span>
                  </div>
                }

                <div class="flex justify-between text-muted">
                  <span>Phí vận chuyển:</span>
                  <span class="font-semibold text-primary tabular">
                    {{ fulfillment === 'PICKUP' ? 'Miễn phí tại showroom' : (shippingFeeAmount() > 0 ? (shippingFeeAmount() | vnd) : 'Miễn phí giao hàng') }}
                  </span>
                </div>

                <div class="flex items-baseline justify-between pt-2 border-t border-line text-sm font-black text-foreground">
                  <div>
                    <span>Tổng thanh toán:</span>
                    <span class="block text-xs text-muted font-normal">(Đã bao gồm VAT 10%)</span>
                  </div>
                  <span class="text-base text-primary font-bold tabular">
                    {{ computedGrandTotal() | vnd }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Dynamic VietQR Showcase Card (CO-03) -->
            @if (paymentMethod === 'QR') {
              <div class="bg-surface rounded-xl p-5 sm:p-6 shadow-sm border border-line space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-line">
                  <div class="flex items-center gap-2">
                    <span class="size-2 rounded-full bg-primary animate-pulse"></span>
                    <h3 class="font-bold text-sm text-foreground">Thanh Toán Chuyển Khoản VietQR</h3>
                  </div>
                  <span appBadge variant="outline" class="text-xs text-primary border-primary/30">
                    Khớp tự động
                  </span>
                </div>

                <div class="bg-surface-alt p-4 rounded-xl border border-line space-y-3">
                  <!-- VietQR Dynamic Image Container -->
                  <div class="bg-surface p-3 rounded-lg border border-line shadow-sm flex flex-col items-center mx-auto max-w-[240px]">
                    <div class="w-full flex items-center justify-between px-2.5 py-1 bg-surface-dark rounded-t text-foreground-dark text-xs font-bold mb-2 tabular">
                      <span class="text-primary">VIETQR</span>
                      <span class="text-slate-300">VIETCOMBANK</span>
                    </div>

                    <img
                      [src]="vietQrUrl()"
                      alt="Mã VietQR thanh toán"
                      class="w-48 h-auto rounded bg-white p-1"
                      loading="lazy"
                    />

                    <div class="mt-2 text-center w-full">
                      <span class="text-xs text-muted block">Ngân hàng TMCP Ngoại Thương (Vietcombank)</span>
                      <span class="text-xs font-bold text-foreground uppercase">NGUYEN PHAM QUOC KHIEM</span>
                    </div>
                  </div>

                  <!-- Bank Info and Fast Copy -->
                  <div class="bg-surface p-3 rounded-lg border border-line space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="text-muted text-xs">Ngân hàng:</span>
                      <span class="font-bold text-foreground">Vietcombank (VCB)</span>
                    </div>

                    <div class="flex items-center justify-between">
                      <span class="text-muted text-xs">Chủ tài khoản:</span>
                      <span class="font-bold text-foreground uppercase">NGUYEN PHAM QUOC KHIEM</span>
                    </div>

                    <div class="flex items-center justify-between">
                      <span class="text-muted text-xs">Số tài khoản:</span>
                      <div class="flex items-center gap-1.5 font-bold text-foreground tabular">
                        <span>1040346646</span>
                        <button
                          type="button"
                          (click)="copyAccount('1040346646')"
                          class="p-1 rounded hover:bg-surface-alt text-primary transition-colors cursor-pointer"
                          title="Sao chép số tài khoản"
                          aria-label="Sao chép số tài khoản"
                        >
                          <lucide-icon [name]="copiedAccount() ? 'Check' : 'Copy'" class="size-3.5" aria-hidden="true"></lucide-icon>
                        </button>
                      </div>
                    </div>

                    <div class="flex items-center justify-between">
                      <span class="text-muted text-xs">Số tiền chuyển:</span>
                      <span class="font-bold text-primary tabular">
                        {{ computedGrandTotal() | vnd }}
                      </span>
                    </div>

                    <div class="flex items-center justify-between">
                      <span class="text-muted text-xs">Nội dung CK:</span>
                      <div class="flex items-center gap-1.5 bg-surface-alt px-2 py-0.5 rounded font-bold text-foreground tabular">
                        <span>{{ qrTransferMemo }}</span>
                        <button
                          type="button"
                          (click)="copyMemo(qrTransferMemo)"
                          class="p-0.5 rounded hover:bg-surface text-primary transition-colors cursor-pointer"
                          title="Sao chép nội dung chuyển khoản"
                          aria-label="Sao chép nội dung chuyển khoản"
                        >
                          <lucide-icon [name]="copiedMemo() ? 'Check' : 'Copy'" class="size-3.5" aria-hidden="true"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 20-Minute Countdown Strip -->
                  <div class="bg-surface-dark text-foreground-dark p-3 rounded-lg flex items-center justify-between text-xs border border-line-dark">
                    <div class="flex items-center gap-1.5 text-slate-300">
                      <lucide-icon name="Clock" class="size-4 text-warning" aria-hidden="true"></lucide-icon>
                      <span>Thời gian giữ đơn VietQR:</span>
                    </div>
                    <span class="text-xs font-bold text-primary">
                      20 phút sau khi tạo đơn
                    </span>
                  </div>
                </div>
              </div>
            }

            @if (hasValidationErrors()) {
              <div class="p-3.5 rounded-lg border border-danger/40 bg-danger/10 text-danger text-xs space-y-1.5">
                <div class="font-bold flex items-center gap-1.5">
                  <lucide-icon name="AlertCircle" class="size-4 shrink-0" aria-hidden="true"></lucide-icon>
                  <span>Thông tin đơn hàng chưa đầy đủ hoặc sai định dạng:</span>
                </div>
                <ul class="list-disc list-inside space-y-0.5 pl-1.5 text-danger font-medium">
                  @for (err of validationErrorList(); track err) {
                    <li>{{ err }}</li>
                  }
                </ul>
              </div>
            }

            <!-- Submit Action Button -->
            <button
              type="button"
              appButton
              variant="primary"
              size="lg"
              class="w-full font-bold h-12 text-sm shadow-md cursor-pointer"
              [disabled]="submitting()"
              (click)="submit()"
            >
              <lucide-icon [name]="submitting() ? 'loader-2' : 'ShieldCheck'" class="size-4" [class.animate-spin]="submitting()" aria-hidden="true"></lucide-icon>
              <span>{{ submitting() ? 'Đang tạo đơn hàng...' : 'Đặt hàng ngay' }}</span>
            </button>

            <div class="text-center">
              <a routerLink="/gio-hang" class="text-xs text-muted hover:text-primary transition-colors">
                « Quay lại chỉnh sửa giỏ hàng
              </a>
            </div>

          </div>

        </div>
      }
    </section>
  `,
})
export class CheckoutPageComponent implements OnInit {
  private readonly api = inject(ApiClientService);
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected name = '';
  protected phone = '';
  protected email = '';
  protected fulfillment: 'PICKUP' | 'DELIVERY' = 'PICKUP';
  protected paymentMethod: 'QR' | 'COD' = 'QR';

  protected province = '';
  protected district = '';
  protected streetAddress = '';
  protected technicalNotes = '';

  protected couponCodeInput = '';
  protected readonly appliedCouponCode = signal<string | null>(null);
  protected readonly couponDiscountAmount = signal<number>(0);
  protected readonly productDiscountAmount = signal<number>(0);
  protected readonly shippingFeeAmount = signal<number>(0);
  protected readonly couponError = signal<string | null>(null);
  protected readonly applyingCoupon = signal<boolean>(false);

  protected readonly validationErrors = signal<Record<string, string>>({});
  protected readonly hasAttemptedSubmit = signal<boolean>(false);

  protected readonly qrTransferMemo = `ELTECH-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  protected readonly expandedBuilds = signal<Record<string, boolean>>({});
  protected readonly copiedAccount = signal(false);
  protected readonly copiedMemo = signal(false);
  protected readonly quoteResult = signal<Quote | null>(null);
  protected readonly orderResult = signal<SubmitResult | null>(null);
  protected readonly submitting = signal(false);

  protected readonly standaloneItems = computed(() => {
    return this.cart.items().filter((item) => !item.pcBuildKey && !item.pcBuildName);
  });

  protected readonly validationErrorList = computed(() => {
    return Object.values(this.validationErrors());
  });

  protected readonly hasValidationErrors = computed(() => {
    return Object.keys(this.validationErrors()).length > 0;
  });

  protected readonly computedGrandTotal = computed(() => {
    const quote = this.quoteResult();
    if (quote) {
      return quote.grandTotal;
    }
    const rawTotal = BigInt(this.cart.subtotal());
    const promo = BigInt(this.productDiscountAmount());
    const coup = BigInt(this.couponDiscountAmount());
    const totalDisc = promo + coup;
    const netSubtotal = rawTotal > totalDisc ? rawTotal - totalDisc : 0n;
    const ship = this.fulfillment === 'DELIVERY' ? BigInt(this.shippingFeeAmount()) : 0n;
    return (netSubtotal + ship).toString();
  });

  protected readonly vietQrUrl = computed<string>(() => {
    const amount = this.computedGrandTotal();
    const memo = encodeURIComponent(this.qrTransferMemo);
    return `https://img.vietqr.io/image/VCB-1040346646-compact2.svg?amount=${amount}&addInfo=${memo}&accountName=NGUYEN%20PHAM%20QUOC%20KHIEM`;
  });

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      const user = this.auth.currentUser();
      if (user) {
        this.name = user.name || '';
        this.phone = user.phone || '';
        this.email = user.email || '';
        if (user.address) {
          this.streetAddress = user.address;
        }
      }
    }
    void this.initCheckout();
  }

  private async initCheckout(): Promise<void> {
    const token = this.cart.cartToken();
    if (!token) {
      await this.cart.load();
    }
    await this.fetchQuote();
  }

  protected setFulfillment(method: 'PICKUP' | 'DELIVERY'): void {
    this.fulfillment = method;
    if (this.hasAttemptedSubmit()) {
      this.runValidation();
    }
    void this.fetchQuote();
  }

  protected async applyCoupon(): Promise<void> {
    const code = this.couponCodeInput.trim();
    if (!code) {
      this.couponError.set('Vui lòng nhập mã giảm giá trước khi áp dụng.');
      return;
    }
    this.applyingCoupon.set(true);
    this.couponError.set(null);
    try {
      await this.fetchQuote(code);
      const quote = this.quoteResult();
      const discount = Number(quote?.couponDiscount ?? quote?.discountAmount ?? 0);
      if (discount > 0 || quote?.couponCode) {
        this.appliedCouponCode.set(quote?.couponCode ?? code);
        this.couponDiscountAmount.set(discount);
        this.couponError.set(null);
      } else {
        this.appliedCouponCode.set(null);
        this.couponDiscountAmount.set(0);
        this.couponError.set('Mã giảm giá không áp dụng được cho đơn hàng này.');
      }
    } catch (err: unknown) {
      this.appliedCouponCode.set(null);
      this.couponDiscountAmount.set(0);
      const message = err instanceof Error ? err.message : 'Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng.';
      this.couponError.set(message);
    } finally {
      this.applyingCoupon.set(false);
    }
  }

  protected async removeCoupon(): Promise<void> {
    this.appliedCouponCode.set(null);
    this.couponDiscountAmount.set(0);
    this.couponCodeInput = '';
    this.couponError.set(null);
    await this.fetchQuote();
  }

  protected validateField(_fieldName?: string): void {
    if (!this.hasAttemptedSubmit()) return;
    this.runValidation();
  }

  protected clearFieldError(fieldName: string): void {
    if (this.validationErrors()[fieldName]) {
      this.validationErrors.update((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  }

  protected runValidation(): boolean {
    const data = {
      name: this.name,
      phone: this.phone,
      email: this.email,
      fulfillmentMethod: this.fulfillment,
      province: this.province,
      district: this.district,
      streetAddress: this.streetAddress,
      paymentMethod: this.paymentMethod,
    };

    const result = checkoutCustomerSchema.safeParse(data);
    if (result.success) {
      this.validationErrors.set({});
      return true;
    }

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const pathKey = issue.path[0] as string;
      if (!errors[pathKey]) {
        errors[pathKey] = issue.message;
      }
    }
    this.validationErrors.set(errors);
    return false;
  }

  protected async fetchQuote(couponCode?: string): Promise<void> {
    const token = this.cart.cartToken();
    if (!token) return;
    const codeToUse = couponCode !== undefined ? couponCode : (this.appliedCouponCode() ?? undefined);
    try {
      const response = await this.api.post<Quote>('/checkout/quote', {
        cartToken: token,
        fulfillmentMethod: this.fulfillment,
        couponCode: codeToUse || undefined,
      });
      if (response.success) {
        this.quoteResult.set(response.data);
        this.productDiscountAmount.set(Number(response.data.productDiscount ?? 0));
        this.shippingFeeAmount.set(Number(response.data.shippingFee ?? 0));
        if (response.data.couponCode) {
          this.appliedCouponCode.set(response.data.couponCode);
          this.couponDiscountAmount.set(Number(response.data.couponDiscount ?? response.data.discountAmount ?? 0));
        } else if (!codeToUse) {
          this.appliedCouponCode.set(null);
          this.couponDiscountAmount.set(0);
        }
      } else {
        const err = response.error;
        const msg = err.messageKey === 'error.couponNotFound'
          ? 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.'
          : (err.messageKey === 'error.couponExpired'
            ? 'Mã giảm giá chưa có hiệu lực hoặc đã hết hạn sử dụng.'
            : (err.messageKey === 'error.couponMinimumSubtotalNotMet'
              ? 'Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá này.'
              : (err.messageKey === 'error.couponQuotaExceeded'
                ? 'Mã giảm giá đã hết lượt sử dụng trên toàn hệ thống.'
                : (err.messageKey || 'Lỗi khi kiểm tra mã giảm giá.'))));
        throw new Error(msg);
      }
    } catch (e: unknown) {
      if (couponCode) {
        throw e;
      }
    }
  }

  protected toggleBuildAccordion(key: string): void {
    this.expandedBuilds.update((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  protected isBuildExpanded(key: string): boolean {
    return Boolean(this.expandedBuilds()[key]);
  }

  protected getComponentSlot(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('core') || lower.includes('ryzen') || lower.includes('cpu') || lower.includes('i9-') || lower.includes('i7-')) return 'CPU';
    if (lower.includes('z790') || lower.includes('b760') || lower.includes('x670') || lower.includes('b650') || lower.includes('maximus') || lower.includes('main')) return 'MAIN';
    if (lower.includes('ram') || lower.includes('ddr5') || lower.includes('ddr4') || lower.includes('dominator') || lower.includes('fury')) return 'RAM';
    if (lower.includes('rtx') || lower.includes('radeon') || lower.includes('vga') || lower.includes('gpu') || lower.includes('geforce')) return 'VGA';
    if (lower.includes('ssd') || lower.includes('nvme') || lower.includes('990 pro') || lower.includes('samsung')) return 'SSD';
    if (lower.includes('psu') || lower.includes('1000w') || lower.includes('850w') || lower.includes('seasonic') || lower.includes('nguồn')) return 'PSU';
    if (lower.includes('kraken') || lower.includes('elite') || lower.includes('aio') || lower.includes('cooler') || lower.includes('tản')) return 'COOLER';
    if (lower.includes('case') || lower.includes('o11') || lower.includes('lian li') || lower.includes('thùng') || lower.includes('vỏ')) return 'CASE';
    return 'COMP';
  }

  protected copyAccount(val: string): void {
    void navigator.clipboard?.writeText(val);
    this.copiedAccount.set(true);
    setTimeout(() => this.copiedAccount.set(false), 2000);
  }

  protected copyMemo(val: string): void {
    void navigator.clipboard?.writeText(val);
    this.copiedMemo.set(true);
    setTimeout(() => this.copiedMemo.set(false), 2000);
  }

  protected async submit(): Promise<void> {
    this.hasAttemptedSubmit.set(true);
    const isValid = this.runValidation();
    if (!isValid) {
      if (typeof window !== 'undefined') {
        const firstInvalid = document.querySelector('.border-danger');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    const cartToken = this.cart.cartToken();
    if (!cartToken) return;

    const deliveryAddress = this.fulfillment === 'DELIVERY'
      ? `${this.streetAddress}, ${this.district}, ${this.province}`.trim()
      : undefined;

    this.submitting.set(true);
    try {
      const response = await this.api.post<SubmitResult>(
        '/checkout/submit',
        {
          cartToken,
          receiverName: this.name.trim(),
          receiverEmail: this.email.trim(),
          receiverPhone: this.phone.trim(),
          fulfillmentMethod: this.fulfillment,
          paymentMethod: this.paymentMethod,
          deliveryAddress,
          couponCode: this.appliedCouponCode() || undefined,
        },
        { idempotencyKey: createIdempotencyKey() }
      );

      if (response.success) {
        this.orderResult.set(response.data);
        const orderInfo = {
          code: response.data.code,
          status: response.data.status,
          receiverName: this.name,
          receiverEmail: this.email,
          receiverPhone: this.phone,
          fulfillmentMethod: this.fulfillment,
          deliveryAddress,
          paymentMethod: this.paymentMethod,
          paymentReference: response.data.paymentReference ?? this.qrTransferMemo,
          expectedAmount: response.data.expectedAmount ?? this.computedGrandTotal(),
          grandTotal: this.computedGrandTotal(),
        };
        sessionStorage.setItem(`last_order_${response.data.code}`, JSON.stringify(orderInfo));
        localStorage.removeItem('el-tech.cart-token');
        void this.cart.load().catch(() => {});
        void this.router.navigate(['/dat-hang-thanh-cong', response.data.code]);
      }
    } finally {
      this.submitting.set(false);
    }
  }
}
