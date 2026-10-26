import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiClientService } from '../../core/api/api-client.service';
import { createIdempotencyKey } from '../../core/api/idempotency';
import { CartService } from '../../services/cart.service';
import { VndPipe } from '../../lib/vnd.pipe';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { InputDirective } from '../../components/atoms/input/input.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

type Quote = {
  readonly subtotal: string;
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
                  <span class="text-muted block text-[10px]">Nội dung chuyển khoản (chính xác):</span>
                  <strong class="text-primary text-base tracking-wider font-mono">{{ order.paymentReference }}</strong>
                </div>
                <div class="p-3 rounded-md bg-surface-dark border border-line-dark">
                  <span class="text-muted block text-[10px]">Số tiền cần thanh toán:</span>
                  <strong class="text-primary text-base tabular font-mono">{{ (order.expectedAmount ?? '0') | vnd }}</strong>
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
                    <p class="text-[11px] text-muted">Đặt hàng nhanh chóng, không yêu cầu xác thực OTP rườm rà</p>
                  </div>
                </div>
                <span appBadge variant="outline" class="text-[10px] text-primary border-primary/30">
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
                    class="w-full text-xs font-medium"
                    [(ngModel)]="name"
                    placeholder="Ví dụ: Nguyễn Hoàng Nam"
                  >
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-foreground mb-1">
                      Số điện thoại liên hệ <span class="text-danger">*</span>
                    </label>
                    <input
                      appInput
                      class="w-full text-xs font-medium"
                      [(ngModel)]="phone"
                      type="tel"
                      placeholder="Ví dụ: 0988 234 567"
                    >
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-foreground mb-1">
                      Email nhận thông báo hóa đơn <span class="text-danger">*</span>
                    </label>
                    <input
                      appInput
                      class="w-full text-xs font-medium"
                      [(ngModel)]="email"
                      type="email"
                      placeholder="hoangnam.tech@gmail.com"
                    >
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
                  <p class="text-[11px] text-muted">Lựa chọn nhận máy tại Showroom hoặc chuyển phát tận nơi</p>
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
                  <span class="px-1.5 py-0.5 rounded text-[10px] bg-primary/15 text-primary uppercase font-bold">Miễn phí</span>
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
                    Chọn Showroom bàn giao máy:
                  </label>
                  <div class="grid gap-2">
                    @for (branch of showroomBranches; track branch.id) {
                      <label
                        class="p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all"
                        [class.border-primary]="selectedBranchId === branch.id"
                        [class.bg-primary/5]="selectedBranchId === branch.id"
                        [class.border-line]="selectedBranchId !== branch.id"
                      >
                        <div class="flex items-center gap-3">
                          <input
                            type="radio"
                            name="showroomBranch"
                            [value]="branch.id"
                            [(ngModel)]="selectedBranchId"
                            class="text-primary focus:ring-primary"
                          >
                          <div>
                            <span class="text-xs font-bold text-foreground block">{{ branch.name }}</span>
                            <span class="text-[11px] text-muted">{{ branch.address }}</span>
                          </div>
                        </div>
                        <span appBadge variant="outline" class="text-[10px] text-primary border-primary/30">
                          SẴN HÀNG
                        </span>
                      </label>
                    }
                  </div>
                  <p class="text-[11px] text-muted flex items-center gap-1.5 pt-1">
                    <lucide-icon name="ShieldCheck" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                    <span>Nhận tại cửa hàng không yêu cầu nhập địa chỉ nhà, được hỗ trợ unbox và test tại chỗ.</span>
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
                        class="w-full text-xs font-medium"
                        [(ngModel)]="province"
                        placeholder="TP. Hồ Chí Minh / Hà Nội / Đà Nẵng..."
                      >
                    </div>

                    <div>
                      <label class="block text-xs font-bold text-foreground mb-1">
                        Quận / Huyện <span class="text-danger">*</span>
                      </label>
                      <input
                        appInput
                        class="w-full text-xs font-medium"
                        [(ngModel)]="district"
                        placeholder="Quận 10 / Q. Đống Đa..."
                      >
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-foreground mb-1">
                      Địa chỉ cụ thể (Số nhà, tên đường, phường/xã) <span class="text-danger">*</span>
                    </label>
                    <input
                      appInput
                      class="w-full text-xs font-medium"
                      [(ngModel)]="streetAddress"
                      placeholder="Số 280 Ba Tháng Hai, Phường 12..."
                    >
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
                  class="w-full text-xs leading-relaxed"
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
                  <p class="text-[11px] text-muted">Hỗ trợ quét mã VietQR tự động hoặc thanh toán khi nhận hàng</p>
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
                      <span class="px-1.5 py-0.2 rounded text-[9px] bg-primary text-primary-foreground font-bold uppercase">
                        Khuyên dùng
                      </span>
                    </div>
                    <span class="text-[11px] text-muted mt-0.5 block leading-relaxed">
                      Giữ hàng ngay lập tức. Khớp lệnh tự động trong 30 giây qua ngân hàng MB Bank.
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
                    <span class="text-[11px] text-muted mt-0.5 block leading-relaxed">
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
                <span class="px-2 py-0.5 rounded-full bg-surface-alt text-muted text-[11px] font-bold">
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
                          <span class="px-1.5 py-0.2 rounded bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                            Bộ PC Hoàn Chỉnh
                          </span>
                          <span class="text-[10px] font-mono text-muted tabular">SL: {{ build.quantity }}</span>
                        </div>
                        <h4 class="text-xs font-bold text-foreground mt-1 truncate">{{ build.buildName }}</h4>
                        <span class="text-[10px] text-muted block">Bao gồm {{ build.componentCount }} linh kiện chính hãng</span>
                      </div>
                      <div class="text-right shrink-0">
                        <span class="text-xs font-bold text-foreground block tabular">{{ build.totalPrice | vnd }}</span>
                      </div>
                    </div>

                    <!-- Accordion Toggle Button (CO-02) -->
                    <button
                      type="button"
                      (click)="toggleBuildAccordion(build.key)"
                      class="w-full flex items-center justify-between px-2.5 py-1.5 bg-surface hover:bg-surface-elevated/5 rounded border border-line text-[11px] font-semibold text-foreground transition-all cursor-pointer"
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
                      <div class="space-y-1.5 pt-1.5 border-t border-line text-[11px]">
                        @for (item of build.hardwareItems; track item.id) {
                          <div class="flex items-center justify-between py-1 border-b border-line/40">
                            <div class="flex items-center gap-1.5 min-w-0">
                              <span class="px-1 py-0.2 rounded bg-surface-dark text-foreground-dark font-mono text-[9px] font-bold shrink-0">
                                {{ getComponentSlot(item.name) }}
                              </span>
                              <span class="text-foreground truncate text-[11px]">{{ item.name }}</span>
                            </div>
                            <span class="font-mono text-muted text-[10px] shrink-0 tabular ml-2">
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
                      <h4 class="text-xs font-semibold text-foreground truncate">{{ item.name }}</h4>
                      <span class="text-[10px] text-muted">Số lượng: <strong class="tabular font-medium text-foreground">{{ item.quantity }}</strong></span>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="text-xs font-bold text-foreground tabular">{{ item.lineTotal | vnd }}</span>
                    </div>
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

                @if (appliedCoupon()) {
                  <div class="flex justify-between text-primary font-medium">
                    <span>Ưu đãi mã giảm giá:</span>
                    <span class="tabular">- {{ couponDiscountAmount | vnd }}</span>
                  </div>
                }

                <div class="flex justify-between text-muted">
                  <span>Phí vận chuyển:</span>
                  <span class="font-semibold text-primary tabular">
                    {{ fulfillment === 'PICKUP' ? 'Miễn phí tại showroom' : (quoteResult()?.shippingFee ? ((quoteResult()?.shippingFee ?? '0') | vnd) : 'Miễn phí toàn quốc') }}
                  </span>
                </div>

                <div class="flex items-baseline justify-between pt-2 border-t border-line text-sm font-black text-foreground">
                  <div>
                    <span>Tổng thanh toán:</span>
                    <span class="block text-[10px] text-muted font-normal">(Đã bao gồm VAT 10%)</span>
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
                  <span appBadge variant="outline" class="text-[10px] text-primary border-primary/30">
                    Khớp tự động
                  </span>
                </div>

                <div class="bg-surface-alt p-4 rounded-xl border border-line space-y-3">
                  <!-- VietQR Header & Mock QR Container -->
                  <div class="bg-surface p-3 rounded-lg border border-line shadow-sm flex flex-col items-center mx-auto max-w-[220px]">
                    <div class="w-full flex items-center justify-between px-2 py-0.5 bg-surface-dark rounded-t text-foreground-dark text-[10px] font-mono font-bold mb-2">
                      <span class="text-primary">VIETQR</span>
                      <span class="text-slate-300">MB BANK</span>
                    </div>

                    <!-- Clean Technical VietQR SVG -->
                    <svg class="w-36 h-36 rounded bg-surface p-1 text-foreground" fill="currentColor" viewBox="0 0 200 200" aria-label="Mã VietQR thanh toán">
                      <rect fill="#090d16" height="45" rx="4" width="45" x="10" y="10"></rect>
                      <rect fill="#ffffff" height="29" rx="2" width="29" x="18" y="18"></rect>
                      <rect fill="#76b900" height="17" width="17" x="24" y="24"></rect>
                      <rect fill="#090d16" height="45" rx="4" width="45" x="145" y="10"></rect>
                      <rect fill="#ffffff" height="29" rx="2" width="29" x="153" y="18"></rect>
                      <rect fill="#76b900" height="17" width="17" x="159" y="24"></rect>
                      <rect fill="#090d16" height="45" rx="4" width="45" x="10" y="145"></rect>
                      <rect fill="#ffffff" height="29" rx="2" width="29" x="18" y="153"></rect>
                      <rect fill="#76b900" height="17" width="17" x="24" y="159"></rect>
                      <rect fill="#090d16" height="60" rx="6" width="60" x="70" y="70"></rect>
                      <rect fill="#161b26" height="52" rx="4" width="52" x="74" y="74"></rect>
                      <circle cx="100" cy="100" fill="#76b900" r="10"></circle>
                    </svg>

                    <div class="mt-2 text-center w-full">
                      <span class="text-[10px] text-muted block">Ngân hàng Quân Đội (MB Bank)</span>
                      <span class="text-xs font-bold text-foreground">CTCP CONG NGHE EL-TECH</span>
                    </div>
                  </div>

                  <!-- Bank Info and Fast Copy -->
                  <div class="bg-surface p-3 rounded-lg border border-line space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="text-muted text-[11px]">Số tài khoản:</span>
                      <div class="flex items-center gap-1.5 font-mono font-bold text-foreground">
                        <span>0868 999 888 999</span>
                        <button
                          type="button"
                          (click)="copyAccount('0868999888999')"
                          class="p-1 rounded hover:bg-surface-alt text-primary transition-colors cursor-pointer"
                          title="Sao chép số tài khoản"
                          aria-label="Sao chép số tài khoản"
                        >
                          <lucide-icon [name]="copiedAccount() ? 'Check' : 'Copy'" class="size-3.5" aria-hidden="true"></lucide-icon>
                        </button>
                      </div>
                    </div>

                    <div class="flex items-center justify-between">
                      <span class="text-muted text-[11px]">Số tiền chuyển:</span>
                      <span class="font-bold text-primary font-mono tabular">
                        {{ computedGrandTotal() | vnd }}
                      </span>
                    </div>

                    <div class="flex items-center justify-between">
                      <span class="text-muted text-[11px]">Nội dung CK:</span>
                      <div class="flex items-center gap-1.5 bg-surface-alt px-1.5 py-0.5 rounded font-mono font-bold text-foreground">
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
                      <span>Giữ đơn & mã QR trong:</span>
                    </div>
                    <span class="font-mono text-sm font-bold text-primary tabular">
                      {{ formattedCountdown() }}
                    </span>
                  </div>
                </div>
              </div>
            }

            <!-- Submit Action Button -->
            <button
              type="button"
              appButton
              variant="primary"
              size="lg"
              class="w-full font-bold h-12 text-sm shadow-md cursor-pointer"
              [disabled]="submitting() || !name.trim() || !phone.trim() || !email.trim() || (fulfillment === 'DELIVERY' && (!province.trim() || !district.trim() || !streetAddress.trim()))"
              (click)="submit()"
            >
              <lucide-icon [name]="submitting() ? 'RefreshCw' : 'ShieldCheck'" class="size-4" [class.animate-spin]="submitting()" aria-hidden="true"></lucide-icon>
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
export class CheckoutPageComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiClientService);
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);

  protected name = 'Nguyễn Hoàng Nam';
  protected phone = '0988 234 567';
  protected email = 'hoangnam.tech@gmail.com';
  protected fulfillment: 'PICKUP' | 'DELIVERY' = 'PICKUP';
  protected paymentMethod: 'QR' | 'COD' = 'QR';
  protected selectedBranchId = 1;

  protected province = 'TP. Hồ Chí Minh';
  protected district = 'Quận 10';
  protected streetAddress = '280 Ba Tháng Hai, Phường 12';
  protected technicalNotes = '';

  protected readonly appliedCoupon = signal(true);
  protected readonly couponDiscountAmount = 500000;
  protected readonly qrTransferMemo = `ELTECH-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  protected readonly expandedBuilds = signal<Record<string, boolean>>({});
  protected readonly copiedAccount = signal(false);
  protected readonly copiedMemo = signal(false);
  protected readonly countdownSeconds = signal(1200);
  protected readonly quoteResult = signal<Quote | null>(null);
  protected readonly orderResult = signal<SubmitResult | null>(null);
  protected readonly submitting = signal(false);

  private countdownTimerId: ReturnType<typeof setInterval> | null = null;

  protected readonly showroomBranches = [
    { id: 1, name: 'Hà Nội: 45 Thái Hà, Q. Đống Đa', address: '45 Thái Hà, Trung Liệt, Đống Đa, Hà Nội' },
    { id: 2, name: 'TP.HCM: 280 Ba Tháng Hai, Quận 10', address: '280 Ba Tháng Hai, Phường 12, Quận 10, TP.HCM' },
    { id: 3, name: 'Đà Nẵng: 112 Hàm Nghi, Q. Thanh Khê', address: '112 Hàm Nghi, Thạc Gián, Thanh Khê, Đà Nẵng' },
  ];

  protected readonly standaloneItems = computed(() => {
    return this.cart.items().filter((item) => !item.pcBuildKey && !item.pcBuildName);
  });

  protected readonly formattedCountdown = computed(() => {
    const total = this.countdownSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  protected readonly computedGrandTotal = computed(() => {
    const quote = this.quoteResult();
    const rawTotal = quote ? BigInt(quote.grandTotal) : BigInt(this.cart.subtotal());
    const discount = this.appliedCoupon() ? BigInt(this.couponDiscountAmount) : 0n;
    const finalVal = rawTotal > discount ? rawTotal - discount : 0n;
    return finalVal.toString();
  });

  ngOnInit(): void {
    void this.initCheckout();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownTimerId) {
      clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }
  }

  private async initCheckout(): Promise<void> {
    const token = this.cart.cartToken();
    if (!token) {
      await this.cart.load();
    }
    await this.fetchQuote();
  }

  private startCountdown(): void {
    this.countdownTimerId = setInterval(() => {
      this.countdownSeconds.update((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }

  protected setFulfillment(method: 'PICKUP' | 'DELIVERY'): void {
    this.fulfillment = method;
    void this.fetchQuote();
  }

  protected async fetchQuote(): Promise<void> {
    const token = this.cart.cartToken();
    if (!token) return;
    try {
      const response = await this.api.post<Quote>('/checkout/quote', {
        cartToken: token,
        fulfillmentMethod: this.fulfillment,
      });
      if (response.success) {
        this.quoteResult.set(response.data);
        const availableBranch = response.data.branches.find((b) => b.available);
        if (availableBranch) {
          this.selectedBranchId = availableBranch.id;
        }
      }
    } catch {
      // Keep existing calculated values on network or background quote failure
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
          receiverName: this.name,
          receiverEmail: this.email,
          receiverPhone: this.phone,
          fulfillmentMethod: this.fulfillment,
          branchId: this.fulfillment === 'PICKUP' ? this.selectedBranchId : undefined,
          paymentMethod: this.paymentMethod,
          deliveryAddress,
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
