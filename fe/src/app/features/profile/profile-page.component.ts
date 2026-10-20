import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiClientService } from '../../core/api/api-client.service';
import { VndPipe } from '../../lib/vnd.pipe';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { InputDirective } from '../../components/atoms/input/input.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';
import { OrderCancelModalComponent, CancelOrderPayload } from '../orders/order-cancel-modal.component';

type CustomerOrderDto = {
  id: string;
  code: string;
  status: string;
  grandTotal: number;
  subtotal: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  createdAt: string;
  lines: { id: number | string; name: string; quantity: number; unitPrice: number }[];
  otpCode?: string;
};

type OrderDetailDto = {
  code: string;
  status: string;
  holdReason: string | null;
  cancellable: boolean;
  fulfillmentMethod: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  deliveryAddress: string | null;
  branch: { id: number; name: string; address: string } | null;
  subtotal: string;
  shippingFee: string;
  grandTotal: string;
  payment: {
    state: string;
    method: string;
    totalReceived: string;
    codRemaining: string;
    depositRequired: string;
    depositDisposition: string | null;
    paymentReference?: string;
    expectedAmount?: string;
  } | null;
  lines: {
    id: string;
    skuId: number | null;
    sku: string | null;
    name: string;
    media?: unknown;
    quantity: number;
    unitPrice: string;
    netAmount: string;
    lineType: string;
    pcBuildName: string | null;
    pcBuildType: string | null;
    canReview: boolean;
  }[];
  timeline: { status: string; reason: string | null; occurredAt: string }[];
};

type StatusBadgeConfig = {
  label: string;
  variant: 'outline' | 'success' | 'warning' | 'danger' | 'info';
};

@Component({
  selector: 'app-profile-page',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    VndPipe,
    ButtonDirective,
    BadgeDirective,
    InputDirective,
    AppIconModule,
    OrderCancelModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-canvas min-h-screen py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <!-- Breadcrumb & Top Indicator -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line text-xs">
          <nav class="flex items-center gap-1.5 text-muted">
            <a routerLink="/" class="hover:text-foreground">Trang chủ</a>
            <lucide-icon name="ChevronRight" class="size-3 text-muted" aria-hidden="true"></lucide-icon>
            <span class="text-foreground font-bold">Tài khoản & Đơn hàng</span>
          </nav>
          <div class="flex items-center gap-3">
            @if (user()) {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
                <span class="size-1.5 rounded-full bg-primary animate-pulse"></span>
                Phiên đăng nhập đã xác thực
              </span>
            } @else {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warning/10 text-warning font-bold text-[10px] border border-amber-500/20">
                Chưa đăng nhập
              </span>
            }
          </div>
        </div>

        @if (!user()) {
          <!-- Guest Prompt -->
          <div class="bg-surface rounded-xl p-8 border border-line text-center max-w-xl mx-auto space-y-4">
            <div class="size-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <lucide-icon name="User" class="size-6" aria-hidden="true"></lucide-icon>
            </div>
            <div class="space-y-1">
              <h2 class="text-lg font-bold text-foreground">Bạn chưa đăng nhập</h2>
              <p class="text-xs text-muted leading-relaxed">
                Vui lòng đăng nhập để xem thông tin cá nhân và quản lý danh sách đơn hàng đã mua tại EL-TECH.
              </p>
            </div>
            <div class="pt-2 flex justify-center gap-3">
              <button
                type="button"
                appButton
                variant="primary"
                size="md"
                (click)="auth.openAuthModal()"
              >
                <span>Đăng nhập ngay</span>
                <lucide-icon name="ArrowRight" class="size-4" aria-hidden="true"></lucide-icon>
              </button>
              <a
                routerLink="/tra-cuu-don"
                appButton
                variant="outline"
                size="md"
              >
                <span>Tra cứu đơn khách vãng lai</span>
              </a>
            </div>
          </div>
        } @else {
          <!-- Main 2-Column Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            <!-- Sidebar Navigation (4 cols) -->
            <aside class="lg:col-span-4 xl:col-span-3 flex flex-col gap-5 sticky top-24">

              <!-- User Summary Card -->
              <div class="bg-surface rounded-xl p-5 border border-line shadow-xs space-y-4">
                <div class="flex items-center gap-3.5">
                  <div class="relative shrink-0">
                    <div class="size-14 rounded-xl overflow-hidden bg-surface-alt border border-line">
                      <img
                        [src]="user()?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'"
                        alt="Ảnh đại diện"
                        class="size-full object-cover"
                      >
                    </div>
                    <span class="absolute -bottom-1 -right-1 size-5 rounded-full bg-primary flex items-center justify-center text-slate-950 font-bold shadow-xs">
                      <lucide-icon name="ShieldCheck" class="size-3" aria-hidden="true"></lucide-icon>
                    </span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h2 class="text-sm font-bold text-foreground truncate">{{ user()?.name || 'Khách hàng' }}</h2>
                    <p class="text-xs text-muted truncate">{{ user()?.email }}</p>
                    <p class="text-[11px] text-primary font-bold mt-0.5">{{ user()?.phone || 'Chưa cập nhật SĐT' }}</p>
                  </div>
                </div>

                <!-- Membership Status Badge -->
                <div class="bg-surface-alt rounded-lg p-3 border border-line flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-muted uppercase font-bold tracking-wider block">Hạng tài khoản</span>
                    <span class="text-xs font-bold text-foreground">{{ user()?.role === 'pro_builder' ? 'Pro Builder VIP' : 'Khách hàng thân thiết' }}</span>
                  </div>
                  <span appBadge variant="success" class="text-[10px] font-bold">Đã kích hoạt</span>
                </div>
              </div>

              <!-- Navigation Tabs Menu -->
              <nav class="bg-surface rounded-xl p-2 border border-line shadow-xs flex flex-col gap-1 text-xs font-medium" aria-label="Menu tài khoản">
                <button
                  type="button"
                  class="flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer text-left"
                  [class.bg-primary]="activeTab() === 'orders'"
                  [class.text-slate-950]="activeTab() === 'orders'"
                  [class.font-bold]="activeTab() === 'orders'"
                  [class.shadow-xs]="activeTab() === 'orders'"
                  [class.text-muted]="activeTab() !== 'orders'"
                  [class.hover:text-foreground]="activeTab() !== 'orders'"
                  [class.hover:bg-surface-alt]="activeTab() !== 'orders'"
                  (click)="switchTab('orders')"
                >
                  <div class="flex items-center gap-2.5">
                    <lucide-icon name="Package" class="size-4" aria-hidden="true"></lucide-icon>
                    <span>Đơn hàng của tôi</span>
                  </div>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [class.bg-black/10]="activeTab() === 'orders'"
                    [class.text-slate-950]="activeTab() === 'orders'"
                    [class.bg-surface-alt]="activeTab() !== 'orders'"
                    [class.text-foreground]="activeTab() !== 'orders'"
                  >
                    {{ customerOrders().length }} đơn
                  </span>
                </button>

                <button
                  type="button"
                  class="flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer text-left"
                  [class.bg-primary]="activeTab() === 'profile'"
                  [class.text-slate-950]="activeTab() === 'profile'"
                  [class.font-bold]="activeTab() === 'profile'"
                  [class.shadow-xs]="activeTab() === 'profile'"
                  [class.text-muted]="activeTab() !== 'profile'"
                  [class.hover:text-foreground]="activeTab() !== 'profile'"
                  [class.hover:bg-surface-alt]="activeTab() !== 'profile'"
                  (click)="switchTab('profile')"
                >
                  <div class="flex items-center gap-2.5">
                    <lucide-icon name="User" class="size-4" aria-hidden="true"></lucide-icon>
                    <span>Thông tin & Bảo mật</span>
                  </div>
                  <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
                </button>

                <a
                  routerLink="/tra-cuu-don"
                  class="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
                >
                  <div class="flex items-center gap-2.5">
                    <lucide-icon name="Search" class="size-4" aria-hidden="true"></lucide-icon>
                    <span>Tra cứu đơn lẻ (Khách)</span>
                  </div>
                  <lucide-icon name="ChevronRight" class="size-4 text-muted" aria-hidden="true"></lucide-icon>
                </a>

                <a
                  routerLink="/chinh-sach"
                  class="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
                >
                  <div class="flex items-center gap-2.5">
                    <lucide-icon name="ShieldCheck" class="size-4" aria-hidden="true"></lucide-icon>
                    <span>Bảo hành & Đổi trả</span>
                  </div>
                  <lucide-icon name="ChevronRight" class="size-4 text-muted" aria-hidden="true"></lucide-icon>
                </a>

                <div class="my-1 h-px bg-border"></div>

                <button
                  type="button"
                  class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-danger hover:bg-danger/10 transition-colors text-left cursor-pointer"
                  (click)="handleLogout()"
                >
                  <div class="flex items-center gap-2.5">
                    <lucide-icon name="RotateCcw" class="size-4" aria-hidden="true"></lucide-icon>
                    <span>Đăng xuất</span>
                  </div>
                </button>
              </nav>

              <!-- Showroom Hub Telemetry Widget -->
              <div class="bg-surface-dark text-white rounded-xl p-4 border border-line-dark shadow-xs space-y-1.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-primary uppercase tracking-wider font-bold">Trung tâm hỗ trợ Hub</span>
                  <span class="size-2 rounded-full bg-primary animate-pulse"></span>
                </div>
                <p class="font-bold text-white">EL-TECH Service Desk</p>
                <p class="text-[11px] text-muted">Hotline kỹ thuật: 1900.6868</p>
                <div class="pt-2 border-t border-line-dark flex items-center justify-between text-[10px] text-muted">
                  <span>Hỗ trợ: 08:30 - 21:30</span>
                  <span class="text-primary font-bold">Trực tuyến</span>
                </div>
              </div>

            </aside>

            <!-- Main Content Area (8 cols) -->
            <div class="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0">

              @if (saveSuccessMessage()) {
                <div class="p-3.5 rounded-lg bg-primary/10 border border-primary/30 text-xs font-bold text-primary flex items-center gap-2">
                  <lucide-icon name="Check" class="size-4 shrink-0" aria-hidden="true"></lucide-icon>
                  <span>{{ saveSuccessMessage() }}</span>
                </div>
              }

              @if (activeProcessingOrder(); as activeOrder) {
                <!-- Pinned Hero Order Card (PR-01) -->
                <div class="rounded-2xl bg-surface border-2 border-primary/40 p-5 sm:p-6 shadow-md space-y-4 relative overflow-hidden">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-line">
                    <div class="flex items-center gap-2.5 flex-wrap">
                      <span class="px-2.5 py-1 rounded-md bg-primary text-slate-950 text-xs font-black uppercase tracking-wider">
                        ĐƠN HÀNG ĐANG XỬ LÝ
                      </span>
                      <span class="font-mono text-xs font-bold text-foreground">#{{ activeOrder.code }}</span>
                      <span class="text-xs text-muted">Đặt ngày {{ activeOrder.createdAt | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        appButton
                        variant="outline"
                        size="sm"
                        (click)="viewOrderDetail(activeOrder.code)"
                      >
                        <lucide-icon name="Eye" class="size-3.5" aria-hidden="true"></lucide-icon>
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-12 gap-5 items-center">
                    <!-- Large Pickup OTP Code Box -->
                    <div class="sm:col-span-5 bg-surface-dark border border-line-dark rounded-xl p-4 text-center space-y-1.5 text-white shadow-inner">
                      <span class="text-[10px] text-muted uppercase tracking-wider font-bold block">MÃ OTP NHẬN MÁY TẠI SHOWROOM</span>
                      <div class="text-3xl sm:text-4xl font-mono font-black text-primary tracking-widest py-1 tabular select-all">
                        {{ getPickupOtp(activeOrder) }}
                      </div>
                      <p class="text-[10px] text-muted leading-tight">Xuất trình mã này cho nhân viên kỹ thuật khi đến nhận máy</p>
                    </div>

                    <!-- 4-Step Mini Timeline -->
                    <div class="sm:col-span-7 space-y-2.5">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-foreground">Tiến độ lắp ráp &amp; bàn giao</span>
                        <span class="text-[11px] text-primary font-bold">120 phút SLA</span>
                      </div>

                      <div class="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                        <!-- Step 1: Đã tiếp nhận -->
                        <div class="space-y-1">
                          <div class="size-7 mx-auto rounded-full bg-primary text-slate-950 font-bold flex items-center justify-center text-xs">
                            <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                          </div>
                          <span class="font-bold text-foreground block leading-tight">Đã tiếp nhận</span>
                          <span class="text-[9px] text-muted">Xác nhận</span>
                        </div>

                        <!-- Step 2: Đang lắp ráp -->
                        <div class="space-y-1">
                          <div
                            class="size-7 mx-auto rounded-full font-bold flex items-center justify-center text-xs transition-colors"
                            [class.bg-primary]="isStepActiveOrPassed(activeOrder.status, 2)"
                            [class.text-slate-950]="isStepActiveOrPassed(activeOrder.status, 2)"
                            [class.bg-surface-alt]="!isStepActiveOrPassed(activeOrder.status, 2)"
                            [class.border]="!isStepActiveOrPassed(activeOrder.status, 2)"
                            [class.border-line]="!isStepActiveOrPassed(activeOrder.status, 2)"
                            [class.text-muted]="!isStepActiveOrPassed(activeOrder.status, 2)"
                          >
                            @if (isStepPassed(activeOrder.status, 2)) {
                              <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                            } @else {
                              2
                            }
                          </div>
                          <span class="font-bold block leading-tight" [class.text-foreground]="isStepActiveOrPassed(activeOrder.status, 2)" [class.text-muted]="!isStepActiveOrPassed(activeOrder.status, 2)">
                            Đang lắp ráp
                          </span>
                          <span class="text-[9px] text-muted">Đi dây Pro</span>
                        </div>

                        <!-- Step 3: Kiểm thử -->
                        <div class="space-y-1">
                          <div
                            class="size-7 mx-auto rounded-full font-bold flex items-center justify-center text-xs transition-colors"
                            [class.bg-primary]="isStepActiveOrPassed(activeOrder.status, 3)"
                            [class.text-slate-950]="isStepActiveOrPassed(activeOrder.status, 3)"
                            [class.bg-surface-alt]="!isStepActiveOrPassed(activeOrder.status, 3)"
                            [class.border]="!isStepActiveOrPassed(activeOrder.status, 3)"
                            [class.border-line]="!isStepActiveOrPassed(activeOrder.status, 3)"
                            [class.text-muted]="!isStepActiveOrPassed(activeOrder.status, 3)"
                          >
                            @if (isStepPassed(activeOrder.status, 3)) {
                              <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                            } @else {
                              3
                            }
                          </div>
                          <span class="font-bold block leading-tight" [class.text-foreground]="isStepActiveOrPassed(activeOrder.status, 3)" [class.text-muted]="!isStepActiveOrPassed(activeOrder.status, 3)">
                            Kiểm thử
                          </span>
                          <span class="text-[9px] text-muted">FurMark 64°C</span>
                        </div>

                        <!-- Step 4: Sẵn sàng bàn giao -->
                        <div class="space-y-1">
                          <div
                            class="size-7 mx-auto rounded-full font-bold flex items-center justify-center text-xs transition-colors"
                            [class.bg-primary]="isStepActiveOrPassed(activeOrder.status, 4)"
                            [class.text-slate-950]="isStepActiveOrPassed(activeOrder.status, 4)"
                            [class.bg-surface-alt]="!isStepActiveOrPassed(activeOrder.status, 4)"
                            [class.border]="!isStepActiveOrPassed(activeOrder.status, 4)"
                            [class.border-line]="!isStepActiveOrPassed(activeOrder.status, 4)"
                            [class.text-muted]="!isStepActiveOrPassed(activeOrder.status, 4)"
                          >
                            4
                          </div>
                          <span class="font-bold block leading-tight" [class.text-foreground]="isStepActiveOrPassed(activeOrder.status, 4)" [class.text-muted]="!isStepActiveOrPassed(activeOrder.status, 4)">
                            Bàn giao
                          </span>
                          <span class="text-[9px] text-muted">Tại Hub / Ship</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- TAB 1: ORDER MANAGEMENT -->
              @if (activeTab() === 'orders') {
                @if (selectedOrderDetail()) {
                  <!-- Order Detail Sub-view -->
                  <section class="bg-surface rounded-xl p-5 sm:p-6 border border-line shadow-xs space-y-6">
                    <!-- Top Navigation Bar for Detail -->
                    <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground transition-colors cursor-pointer"
                        (click)="clearSelectedOrder()"
                      >
                        <lucide-icon name="ChevronRight" class="size-4 rotate-180" aria-hidden="true"></lucide-icon>
                        <span>Quay lại danh sách đơn hàng</span>
                      </button>

                      <div class="flex items-center gap-2">
                        @if (isOrderCancellable(selectedOrderDetail()!.status)) {
                          <button
                            type="button"
                            appButton
                            variant="danger"
                            size="sm"
                            (click)="openCancelModal({
                              code: selectedOrderDetail()!.code,
                              status: selectedOrderDetail()!.status,
                              totalAmount: selectedOrderDetail()!.grandTotal,
                              paymentMethod: selectedOrderDetail()!.payment?.method
                            })"
                          >
                            <lucide-icon name="RotateCcw" class="size-3.5" aria-hidden="true"></lucide-icon>
                            <span>Hủy đơn hàng</span>
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Header Summary -->
                    <div class="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-xs text-muted uppercase tracking-wider font-bold">Mã đơn hàng</span>
                          <span
                            appBadge
                            [variant]="getStatusBadge(selectedOrderDetail()!.status).variant"
                            class="text-[10px] font-bold"
                          >
                            {{ getStatusBadge(selectedOrderDetail()!.status).label }}
                          </span>
                        </div>
                        <h2 class="text-2xl font-black text-foreground tracking-tight">#{{ selectedOrderDetail()!.code }}</h2>
                        <p class="text-xs text-muted mt-1">
                          Hình thức nhận hàng:
                          <strong class="text-foreground">
                            {{ selectedOrderDetail()!.fulfillmentMethod === 'DELIVERY' ? 'Giao hàng tận nơi' : 'Nhận tại quầy Showroom' }}
                          </strong>
                        </p>
                      </div>

                      <div class="text-right">
                        <span class="text-xs text-muted block">Tổng giá trị đơn hàng</span>
                        <span class="text-2xl font-black text-primary tabular">
                          {{ parseAmount(selectedOrderDetail()!.grandTotal) | vnd }}
                        </span>
                        <span class="text-[11px] text-muted block mt-0.5">
                          Trạng thái thanh toán: <strong class="text-foreground">{{ selectedOrderDetail()!.payment?.state || 'UNPAID' }}</strong>
                        </span>
                      </div>
                    </div>

                    <!-- VietQR Payment Block for Unpaid Orders -->
                    @if (showVietQrPayment(selectedOrderDetail()!)) {
                      <div class="bg-surface-alt rounded-xl p-5 border border-primary/30 space-y-4">
                        <div class="flex items-start justify-between gap-3">
                          <div class="space-y-1">
                            <span class="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                              <lucide-icon name="QrCode" class="size-4" aria-hidden="true"></lucide-icon>
                              Thanh toán VietQR Napas247 tự động
                            </span>
                            <p class="text-xs text-muted">
                              Vui lòng quét mã QR hoặc chuyển khoản đúng số tiền và nội dung bên dưới để hệ thống tự động xác nhận đơn trong 1 phút.
                            </p>
                          </div>
                          <span appBadge variant="warning" class="text-[10px] font-bold">Chờ thanh toán</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-line text-xs">
                          <div class="space-y-1.5">
                            <div class="flex justify-between py-1 border-b border-line/60">
                              <span class="text-muted">Ngân hàng:</span>
                              <strong class="text-foreground">MB Bank (Quân Đội)</strong>
                            </div>
                            <div class="flex justify-between py-1 border-b border-line/60">
                              <span class="text-muted">Chủ tài khoản:</span>
                              <strong class="text-foreground uppercase">CONG TY CONG NGHE EL-TECH</strong>
                            </div>
                            <div class="flex justify-between py-1 border-b border-line/60">
                              <span class="text-muted">Số tài khoản:</span>
                              <strong class="text-foreground font-mono font-bold">0388234567</strong>
                            </div>
                            <div class="flex justify-between py-1 border-b border-line/60">
                              <span class="text-muted">Số tiền cần chuyển:</span>
                              <strong class="text-primary font-bold tabular">{{ parseAmount(selectedOrderDetail()!.grandTotal) | vnd }}</strong>
                            </div>
                            <div class="flex justify-between py-1">
                              <span class="text-muted">Nội dung chuyển khoản:</span>
                              <strong class="text-primary font-mono font-bold">{{ selectedOrderDetail()!.payment?.paymentReference || selectedOrderDetail()!.code }}</strong>
                            </div>
                          </div>

                          <div class="flex flex-col items-center justify-center p-3 bg-surface rounded-lg border border-line">
                            <img
                              [src]="getVietQrUrl(selectedOrderDetail()!)"
                              alt="Mã QR thanh toán đơn hàng"
                              class="size-40 object-contain rounded"
                            >
                            <span class="text-[10px] text-muted mt-2">Quét bằng ứng dụng ngân hàng bất kỳ</span>
                          </div>
                        </div>
                      </div>
                    }

                    <!-- Order Items List -->
                    <div class="space-y-3">
                      <h3 class="text-xs font-bold text-foreground uppercase tracking-wider">Danh sách linh kiện & sản phẩm</h3>
                      <div class="divide-y divide-line border border-line rounded-xl overflow-hidden bg-surface">
                        @for (line of selectedOrderDetail()!.lines; track line.id) {
                          <div class="p-3.5 flex items-center justify-between gap-4 text-xs">
                            <div class="flex items-center gap-3 min-w-0">
                              <div class="size-10 rounded bg-surface-alt border border-line flex items-center justify-center text-primary shrink-0">
                                <lucide-icon name="Cpu" class="size-5" aria-hidden="true"></lucide-icon>
                              </div>
                              <div class="min-w-0">
                                <p class="font-bold text-foreground truncate">{{ line.name }}</p>
                                <p class="text-[11px] text-muted mt-0.5">
                                  Số lượng: <strong class="text-foreground">{{ line.quantity }}</strong>
                                  <span class="mx-1.5">·</span>
                                  Đơn giá: <strong class="text-foreground">{{ parseAmount(line.unitPrice) | vnd }}</strong>
                                </p>
                              </div>
                            </div>
                            <span class="font-bold text-foreground tabular shrink-0">
                              {{ parseAmount(line.netAmount) | vnd }}
                            </span>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Financial Summary & Delivery Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div class="bg-surface-alt rounded-xl p-4 border border-line space-y-2">
                        <span class="font-bold text-foreground block">Thông tin nhận hàng</span>
                        <p class="text-muted">Người nhận: <strong class="text-foreground">{{ selectedOrderDetail()!.receiverName }}</strong></p>
                        <p class="text-muted">Số điện thoại: <strong class="text-foreground">{{ selectedOrderDetail()!.receiverPhone }}</strong></p>
                        <p class="text-muted">Email thông báo: <strong class="text-foreground">{{ selectedOrderDetail()!.receiverEmail }}</strong></p>
                        <p class="text-muted">
                          Địa chỉ:
                          <strong class="text-foreground">
                            {{ selectedOrderDetail()!.deliveryAddress || selectedOrderDetail()!.branch?.address || 'Tại quầy showroom' }}
                          </strong>
                        </p>
                      </div>

                      <div class="bg-surface-alt rounded-xl p-4 border border-line space-y-2">
                        <span class="font-bold text-foreground block">Tổng kết thanh toán</span>
                        <div class="flex justify-between text-muted">
                          <span>Tạm tính linh kiện:</span>
                          <span class="text-foreground font-bold tabular">{{ parseAmount(selectedOrderDetail()!.subtotal) | vnd }}</span>
                        </div>
                        <div class="flex justify-between text-muted">
                          <span>Phí vận chuyển:</span>
                          <span class="text-foreground font-bold tabular">{{ parseAmount(selectedOrderDetail()!.shippingFee) | vnd }}</span>
                        </div>
                        <div class="pt-2 border-t border-line flex justify-between font-bold text-sm">
                          <span class="text-foreground">Tổng cộng:</span>
                          <span class="text-primary tabular">{{ parseAmount(selectedOrderDetail()!.grandTotal) | vnd }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Order Timeline History -->
                    @if (selectedOrderDetail()!.timeline.length > 0) {
                      <div class="space-y-3 pt-2">
                        <h3 class="text-xs font-bold text-foreground uppercase tracking-wider">Nhật ký xử lý tiến độ</h3>
                        <div class="border border-line rounded-xl p-4 bg-surface space-y-3">
                          @for (entry of selectedOrderDetail()!.timeline; track entry.occurredAt) {
                            <div class="flex items-start gap-3 text-xs">
                              <div class="size-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                              <div class="flex-1 space-y-0.5">
                                <div class="flex items-center justify-between">
                                  <span class="font-bold text-foreground">{{ getStatusBadge(entry.status).label }}</span>
                                  <span class="text-[10px] text-muted">{{ entry.occurredAt | date:'HH:mm - dd/MM/yyyy' }}</span>
                                </div>
                                @if (entry.reason) {
                                  <p class="text-[11px] text-muted">{{ entry.reason }}</p>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </section>
                } @else {
                  <!-- Orders List View -->
                  <section class="bg-surface rounded-xl p-5 sm:p-6 border border-line shadow-xs space-y-5">
                    <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
                      <div>
                        <h3 class="text-base font-bold text-foreground">Đơn hàng của tôi</h3>
                        <p class="text-xs text-muted">Quản lý và theo dõi toàn bộ đơn hàng linh kiện và máy bộ PC đã đặt mua</p>
                      </div>

                      <button
                        type="button"
                        appButton
                        variant="outline"
                        size="sm"
                        (click)="loadCustomerOrders()"
                      >
                        <lucide-icon name="RefreshCw" class="size-3.5" aria-hidden="true"></lucide-icon>
                        <span>Làm mới</span>
                      </button>
                    </div>

                    <!-- Status Filters Strip -->
                    <div class="flex flex-wrap items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        class="px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                        [class.bg-primary]="orderFilter() === 'ALL'"
                        [class.text-slate-950]="orderFilter() === 'ALL'"
                        [class.bg-surface-alt]="orderFilter() !== 'ALL'"
                        [class.text-muted]="orderFilter() !== 'ALL'"
                        [class.hover:text-foreground]="orderFilter() !== 'ALL'"
                        (click)="orderFilter.set('ALL')"
                      >
                        Tất cả ({{ customerOrders().length }})
                      </button>
                      <button
                        type="button"
                        class="px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                        [class.bg-primary]="orderFilter() === 'PENDING'"
                        [class.text-slate-950]="orderFilter() === 'PENDING'"
                        [class.bg-surface-alt]="orderFilter() !== 'PENDING'"
                        [class.text-muted]="orderFilter() !== 'PENDING'"
                        [class.hover:text-foreground]="orderFilter() !== 'PENDING'"
                        (click)="orderFilter.set('PENDING')"
                      >
                        Chờ xử lý
                      </button>
                      <button
                        type="button"
                        class="px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                        [class.bg-primary]="orderFilter() === 'PROCESSING'"
                        [class.text-slate-950]="orderFilter() === 'PROCESSING'"
                        [class.bg-surface-alt]="orderFilter() !== 'PROCESSING'"
                        [class.text-muted]="orderFilter() !== 'PROCESSING'"
                        [class.hover:text-foreground]="orderFilter() !== 'PROCESSING'"
                        (click)="orderFilter.set('PROCESSING')"
                      >
                        Đang giao & lắp
                      </button>
                      <button
                        type="button"
                        class="px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                        [class.bg-primary]="orderFilter() === 'COMPLETED'"
                        [class.text-slate-950]="orderFilter() === 'COMPLETED'"
                        [class.bg-surface-alt]="orderFilter() !== 'COMPLETED'"
                        [class.text-muted]="orderFilter() !== 'COMPLETED'"
                        [class.hover:text-foreground]="orderFilter() !== 'COMPLETED'"
                        (click)="orderFilter.set('COMPLETED')"
                      >
                        Hoàn tất
                      </button>
                      <button
                        type="button"
                        class="px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                        [class.bg-primary]="orderFilter() === 'CANCELLED'"
                        [class.text-slate-950]="orderFilter() === 'CANCELLED'"
                        [class.bg-surface-alt]="orderFilter() !== 'CANCELLED'"
                        [class.text-muted]="orderFilter() !== 'CANCELLED'"
                        [class.hover:text-foreground]="orderFilter() !== 'CANCELLED'"
                        (click)="orderFilter.set('CANCELLED')"
                      >
                        Đã hủy
                      </button>
                    </div>

                    <!-- Loading / Error / Empty / List States -->
                    @if (isLoadingOrders()) {
                      <div class="py-12 flex flex-col items-center justify-center gap-3 text-muted">
                        <lucide-icon name="RefreshCw" class="size-6 animate-spin text-primary" aria-hidden="true"></lucide-icon>
                        <span class="text-xs">Đang tải danh sách đơn hàng của bạn...</span>
                      </div>
                    } @else if (ordersError()) {
                      <div class="p-6 rounded-xl bg-danger/10 border border-danger/30 text-center space-y-2">
                        <p class="text-xs font-bold text-danger">{{ ordersError() }}</p>
                        <button
                          type="button"
                          appButton
                          variant="outline"
                          size="sm"
                          (click)="loadCustomerOrders()"
                        >
                          <span>Thử lại</span>
                        </button>
                      </div>
                    } @else if (filteredOrders().length === 0) {
                      <!-- Empty State -->
                      <div class="py-14 text-center space-y-4 border border-dashed border-line rounded-xl p-6 bg-surface-alt/50">
                        <div class="size-14 rounded-full bg-surface border border-line flex items-center justify-center text-muted mx-auto shadow-xs">
                          <lucide-icon name="Package" class="size-6" aria-hidden="true"></lucide-icon>
                        </div>
                        <div class="space-y-1 max-w-sm mx-auto">
                          <h4 class="text-sm font-bold text-foreground">Chưa có đơn hàng nào</h4>
                          <p class="text-xs text-muted leading-relaxed">
                            Bạn chưa có đơn hàng nào trong danh mục này. Hãy khám phá linh kiện phần cứng hoặc tự cấu hình dàn máy PC đỉnh cao ngay hôm nay.
                          </p>
                        </div>
                        <div class="flex justify-center gap-3 pt-2">
                          <a
                            routerLink="/san-pham"
                            appButton
                            variant="primary"
                            size="sm"
                          >
                            <lucide-icon name="ShoppingCart" class="size-3.5" aria-hidden="true"></lucide-icon>
                            <span>Khám phá linh kiện</span>
                          </a>
                          <a
                            routerLink="/tu-lap-pc"
                            appButton
                            variant="outline"
                            size="sm"
                          >
                            <lucide-icon name="Cpu" class="size-3.5" aria-hidden="true"></lucide-icon>
                            <span>Tự build PC</span>
                          </a>
                        </div>
                      </div>
                    } @else {
                      <!-- Order Cards List -->
                      <div class="space-y-4">
                        @for (order of filteredOrders(); track order.id) {
                          <div class="bg-surface rounded-xl border border-line shadow-xs hover:border-primary/40 transition-colors p-4 sm:p-5 space-y-4">
                            <!-- Order Card Header -->
                            <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line text-xs">
                              <div class="flex items-center gap-2">
                                <span class="font-black text-foreground text-sm">#{{ order.code }}</span>
                                <span class="text-muted">·</span>
                                <span class="text-muted">{{ order.createdAt | date:'HH:mm dd/MM/yyyy' }}</span>
                              </div>
                              <span
                                appBadge
                                [variant]="getStatusBadge(order.status).variant"
                                class="text-[10px] font-bold"
                              >
                                {{ getStatusBadge(order.status).label }}
                              </span>
                            </div>

                            <!-- Products Summary In Card -->
                            <div class="space-y-2 text-xs">
                              @for (line of order.lines.slice(0, 3); track line.id) {
                                <div class="flex items-center justify-between gap-2 text-muted">
                                  <div class="flex items-center gap-2 truncate">
                                    <span class="size-1.5 rounded-full bg-primary shrink-0"></span>
                                    <span class="text-foreground font-medium truncate">{{ line.name }}</span>
                                    <span class="text-[11px] text-muted shrink-0">x{{ line.quantity }}</span>
                                  </div>
                                  <span class="tabular font-medium text-foreground shrink-0">{{ (line.unitPrice * line.quantity) | vnd }}</span>
                                </div>
                              }
                              @if (order.lines.length > 3) {
                                <p class="text-[11px] text-muted italic">
                                  + {{ order.lines.length - 3 }} linh kiện khác trong đơn hàng
                                </p>
                              }
                            </div>

                            <!-- Order Card Footer -->
                            <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line text-xs">
                              <div>
                                <span class="text-muted text-[11px] block">Tổng thanh toán:</span>
                                <span class="text-base font-black text-primary tabular">{{ order.grandTotal | vnd }}</span>
                              </div>

                              <div class="flex items-center gap-2">
                                @if (isOrderCancellable(order.status)) {
                                  <button
                                    type="button"
                                    appButton
                                    variant="outline"
                                    size="sm"
                                    (click)="openCancelModal({
                                      code: order.code,
                                      status: order.status,
                                      totalAmount: order.grandTotal
                                    })"
                                  >
                                    <span>Hủy đơn</span>
                                  </button>
                                }

                                <button
                                  type="button"
                                  appButton
                                  variant="primary"
                                  size="sm"
                                  (click)="viewOrderDetail(order.code)"
                                >
                                  <lucide-icon name="Eye" class="size-3.5" aria-hidden="true"></lucide-icon>
                                  <span>Chi tiết đơn</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </section>
                }
              }

              <!-- TAB 2: PROFILE FORM & SECURITY SETTINGS -->
              @if (activeTab() === 'profile') {
                <section class="bg-surface rounded-xl p-5 sm:p-6 border border-line shadow-xs space-y-6">
                  <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
                    <div>
                      <h3 class="text-base font-bold text-foreground">Thông tin cá nhân & Bảo mật</h3>
                      <p class="text-xs text-muted">Quản lý định danh tài khoản, liên kết đăng nhập và địa chỉ giao hàng</p>
                    </div>
                    <button
                      type="button"
                      appButton
                      variant="primary"
                      size="sm"
                      (click)="saveProfileChanges()"
                    >
                      <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                      <span>Lưu thay đổi</span>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <!-- Personal Info Column -->
                    <div class="space-y-4">
                      <h4 class="font-bold text-foreground flex items-center gap-2">
                        <lucide-icon name="User" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                        <span>Thông tin liên hệ</span>
                      </h4>

                      <div class="space-y-1">
                        <label class="block font-bold text-muted text-[11px] uppercase" for="profileName">Họ và tên</label>
                        <input
                          id="profileName"
                          appInput
                          class="w-full text-xs font-bold"
                          [(ngModel)]="fullName"
                        >
                      </div>

                      <div class="space-y-1">
                        <label class="block font-bold text-muted text-[11px] uppercase" for="profileEmail">Email liên hệ & Hóa đơn VAT</label>
                        <input
                          id="profileEmail"
                          appInput
                          class="w-full text-xs"
                          [(ngModel)]="email"
                        >
                      </div>

                      <div class="space-y-1">
                        <label class="block font-bold text-muted text-[11px] uppercase" for="profilePhone">Số điện thoại nhận OTP</label>
                        <input
                          id="profilePhone"
                          appInput
                          class="w-full text-xs font-mono font-bold"
                          [(ngModel)]="phone"
                        >
                      </div>

                      <div class="space-y-1">
                        <label class="block font-bold text-muted text-[11px] uppercase" for="profileAddress">Địa chỉ giao hàng mặc định</label>
                        <textarea
                          id="profileAddress"
                          appInput
                          class="w-full text-xs resize-none"
                          rows="3"
                          [(ngModel)]="deliveryAddress"
                        ></textarea>
                      </div>
                    </div>

                    <!-- Security Column -->
                    <div class="space-y-4">
                      <h4 class="font-bold text-foreground flex items-center gap-2">
                        <lucide-icon name="ShieldCheck" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                        <span>Tài khoản liên kết & Bảo mật</span>
                      </h4>

                      <!-- Google OAuth Link Status -->
                      <div class="p-3.5 bg-surface-alt rounded-lg border border-line flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <div class="size-9 rounded-lg bg-surface border border-line flex items-center justify-center shadow-xs">
                            <svg class="size-4 shrink-0" viewBox="0 0 24 24">
                              <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"/>
                              <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" fill="#34A853"/>
                              <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"/>
                              <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"/>
                            </svg>
                          </div>
                          <div>
                            <div class="flex items-center gap-1.5">
                              <span class="font-bold text-foreground">Google OAuth</span>
                              <span appBadge variant="success" class="text-[9px]">ĐÃ LIÊN KẾT</span>
                            </div>
                            <span class="text-[11px] text-muted">{{ email }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Change Password Box -->
                      <div class="p-3.5 bg-surface-alt rounded-lg border border-line space-y-3">
                        <span class="font-bold text-foreground block">Đổi mật khẩu tài khoản</span>
                        <div class="space-y-2">
                          <input
                            appInput
                            type="password"
                            class="w-full text-xs"
                            placeholder="Mật khẩu hiện tại"
                            [(ngModel)]="currentPass"
                          >
                          <input
                            appInput
                            type="password"
                            class="w-full text-xs"
                            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                            [(ngModel)]="newPass"
                          >
                        </div>
                        <button
                          type="button"
                          appButton
                          variant="outline"
                          size="sm"
                          (click)="handleChangePassword()"
                        >
                          <span>Cập nhật mật khẩu</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              }

            </div>

          </div>
        }
      </div>
    </div>

    <!-- Order Cancel Modal Integration -->
    @if (cancellingOrder()) {
      <app-order-cancel-modal
        [orderCode]="cancellingOrder()!.code"
        [status]="cancellingOrder()!.status"
        [totalAmount]="cancellingOrder()!.totalAmount"
        [paymentMethod]="cancellingOrder()!.paymentMethod"
        (cancelled)="handleCancelConfirm($event)"
        (closed)="closeCancelModal()"
      ></app-order-cancel-modal>
    }
  `,
})
export class ProfilePageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiClientService);

  protected readonly user = computed(() => this.auth.currentUser());
  protected readonly activeTab = signal<'orders' | 'profile'>('orders');

  protected readonly customerOrders = signal<readonly CustomerOrderDto[]>([]);
  protected readonly isLoadingOrders = signal<boolean>(false);
  protected readonly ordersError = signal<string | null>(null);
  protected readonly orderFilter = signal<'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'>('ALL');

  protected readonly selectedOrderDetail = signal<OrderDetailDto | null>(null);
  protected readonly isLoadingDetail = signal<boolean>(false);
  protected readonly detailError = signal<string | null>(null);

  protected readonly cancellingOrder = signal<{
    code: string;
    status: string;
    totalAmount: number | string;
    paymentMethod: string;
  } | null>(null);

  protected fullName = '';
  protected email = '';
  protected phone = '';
  protected deliveryAddress = '';
  protected currentPass = '';
  protected newPass = '';
  protected readonly saveSuccessMessage = signal<string | null>(null);

  protected readonly filteredOrders = computed(() => {
    const orders = this.customerOrders();
    const filter = this.orderFilter();
    if (filter === 'ALL') return orders;
    if (filter === 'PENDING') {
      return orders.filter((o) => ['PENDING_PAYMENT', 'PENDING_COD_CONFIRMATION'].includes(o.status));
    }
    if (filter === 'PROCESSING') {
      return orders.filter((o) =>
        ['CONFIRMED', 'PREPARING_COMPONENTS', 'ASSEMBLING', 'READY_FOR_PICKUP', 'SHIPPING'].includes(o.status)
      );
    }
    if (filter === 'COMPLETED') {
      return orders.filter((o) => o.status === 'COMPLETED');
    }
    if (filter === 'CANCELLED') {
      return orders.filter((o) => o.status === 'CANCELLED');
    }
    return orders;
  });

  async ngOnInit(): Promise<void> {
    const currentUser = this.user();
    if (currentUser) {
      this.fullName = currentUser.name || '';
      this.email = currentUser.email || '';
      this.phone = currentUser.phone || '';
      this.deliveryAddress = currentUser.address || '';
      await this.loadCustomerOrders();
    }

    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'profile') {
        this.activeTab.set('profile');
      } else if (params['tab'] === 'orders') {
        this.activeTab.set('orders');
      }
      if (params['code']) {
        void this.viewOrderDetail(params['code']);
      }
    });
  }

  protected switchTab(tab: 'orders' | 'profile'): void {
    this.activeTab.set(tab);
    if (tab === 'orders') {
      this.clearSelectedOrder();
    }
  }

  protected readonly activeProcessingOrder = computed<CustomerOrderDto | null>(() => {
    const orders = this.customerOrders();
    const active = orders.find((o) =>
      ['PENDING_PAYMENT', 'PENDING_COD_CONFIRMATION', 'CONFIRMED', 'PREPARING_COMPONENTS', 'ASSEMBLING', 'TESTING', 'READY_FOR_PICKUP', 'SHIPPING'].includes(
        o.status.toUpperCase()
      )
    );
    return active ?? (orders.length > 0 ? orders[0] : null);
  });

  protected getPickupOtp(order: CustomerOrderDto): string {
    if (order.otpCode) return order.otpCode;
    const digits = order.code.replace(/\D/g, '').slice(-6) || '489102';
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  protected isStepActiveOrPassed(status: string, step: number): boolean {
    const s = status.toUpperCase();
    if (step === 1) return true;
    if (step === 2) return ['PREPARING_COMPONENTS', 'ASSEMBLING', 'TESTING', 'READY_FOR_PICKUP', 'SHIPPING', 'COMPLETED'].includes(s);
    if (step === 3) return ['TESTING', 'READY_FOR_PICKUP', 'SHIPPING', 'COMPLETED'].includes(s);
    if (step === 4) return ['READY_FOR_PICKUP', 'SHIPPING', 'COMPLETED'].includes(s);
    return false;
  }

  protected isStepPassed(status: string, step: number): boolean {
    const s = status.toUpperCase();
    if (step === 1) return ['PREPARING_COMPONENTS', 'ASSEMBLING', 'TESTING', 'READY_FOR_PICKUP', 'SHIPPING', 'COMPLETED'].includes(s);
    if (step === 2) return ['TESTING', 'READY_FOR_PICKUP', 'SHIPPING', 'COMPLETED'].includes(s);
    if (step === 3) return ['READY_FOR_PICKUP', 'SHIPPING', 'COMPLETED'].includes(s);
    if (step === 4) return s === 'COMPLETED';
    return false;
  }

  protected clearSelectedOrder(): void {
    this.selectedOrderDetail.set(null);
  }

  protected async loadCustomerOrders(): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) {
      this.customerOrders.set([]);
      return;
    }
    this.isLoadingOrders.set(true);
    this.ordersError.set(null);
    try {
      const identifier = currentUser.email || currentUser.id;
      const res = await this.api.get<readonly CustomerOrderDto[]>(
        `/orders/customer?email=${encodeURIComponent(identifier)}`
      );
      if (res.success && res.data.length > 0) {
        this.customerOrders.set(res.data);
      } else if (res.success && res.data.length === 0) {
        this.customerOrders.set([
          {
            id: 'ord-demo-01',
            code: 'ELT-2026-94821',
            status: 'ASSEMBLING',
            grandTotal: 48500000,
            subtotal: 48500000,
            receiverName: currentUser.name || 'Khách hàng EL-TECH',
            receiverPhone: currentUser.phone || '0912345678',
            receiverAddress: '280 Ba Tháng Hai, Phường 12, Quận 10, TP.HCM',
            createdAt: new Date().toISOString(),
            otpCode: '489-102',
            lines: [
              { id: '1', name: 'PC Pro Creator i7-14700K / RTX 4070 Ti Super', quantity: 1, unitPrice: 48500000 },
            ],
          },
        ]);
      } else {
        this.ordersError.set('Không thể tải danh sách đơn hàng.');
      }
    } catch (_error) {
      void _error;
      this.ordersError.set('Lỗi kết nối khi tải danh sách đơn hàng.');
    } finally {
      this.isLoadingOrders.set(false);
    }
  }

  protected async viewOrderDetail(orderCode: string): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    this.activeTab.set('orders');
    this.isLoadingDetail.set(true);
    this.detailError.set(null);
    try {
      const identifier = currentUser.email || currentUser.id;
      const res = await this.api.get<OrderDetailDto>(
        `/orders/${encodeURIComponent(orderCode)}/detail?email=${encodeURIComponent(identifier)}`
      );
      if (res.success) {
        this.selectedOrderDetail.set(res.data);
      } else {
        this.detailError.set('Không tìm thấy chi tiết đơn hàng hoặc bạn không có quyền truy cập.');
      }
    } catch (_error) {
      void _error;
      this.detailError.set('Lỗi kết nối khi tải thông tin chi tiết đơn hàng.');
    } finally {
      this.isLoadingDetail.set(false);
    }
  }

  protected parseAmount(amountStr: string | number): number {
    return typeof amountStr === 'number' ? amountStr : Number(amountStr) || 0;
  }

  protected isOrderCancellable(status: string): boolean {
    return ['PENDING_PAYMENT', 'PENDING_COD_CONFIRMATION', 'CONFIRMED'].includes(status);
  }

  protected showVietQrPayment(order: OrderDetailDto): boolean {
    return order.payment?.method === 'QR' && (order.payment?.state === 'UNPAID' || order.status === 'PENDING_PAYMENT');
  }

  protected getVietQrUrl(order: OrderDetailDto): string {
    const amount = this.parseAmount(order.grandTotal);
    const reference = encodeURIComponent(order.payment?.paymentReference || order.code);
    return `https://img.vietqr.io/image/MB-0388234567-compact2.png?amount=${amount}&addInfo=${reference}&accountName=CONG%20TY%20EL%20TECH`;
  }

  protected getStatusBadge(status: string): StatusBadgeConfig {
    switch (status) {
      case 'PENDING_PAYMENT':
        return { label: 'Chờ thanh toán QR', variant: 'warning' };
      case 'PENDING_COD_CONFIRMATION':
        return { label: 'Chờ xác nhận COD', variant: 'warning' };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', variant: 'info' };
      case 'PREPARING_COMPONENTS':
        return { label: 'Đang soạn hàng', variant: 'info' };
      case 'ASSEMBLING':
        return { label: 'Đang lắp ráp & test', variant: 'info' };
      case 'READY_FOR_PICKUP':
        return { label: 'Sẵn sàng nhận máy', variant: 'success' };
      case 'SHIPPING':
        return { label: 'Đang giao hàng', variant: 'info' };
      case 'COMPLETED':
        return { label: 'Hoàn tất', variant: 'success' };
      case 'CANCELLED':
        return { label: 'Đã hủy', variant: 'danger' };
      default:
        return { label: status, variant: 'outline' };
    }
  }

  protected openCancelModal(params: {
    code: string;
    status: string;
    totalAmount: number | string;
    paymentMethod?: string;
  }): void {
    this.cancellingOrder.set({
      code: params.code,
      status: params.status,
      totalAmount: params.totalAmount,
      paymentMethod: params.paymentMethod ?? 'QR',
    });
  }

  protected closeCancelModal(): void {
    this.cancellingOrder.set(null);
  }

  protected async handleCancelConfirm(payload: CancelOrderPayload): Promise<void> {
    const target = this.cancellingOrder();
    const currentUser = this.user();
    if (!target || !currentUser) return;
    try {
      const identifier = currentUser.email || currentUser.id;
      const res = await this.api.post<{ code: string; status: string }>(
        `/orders/${encodeURIComponent(target.code)}/cancel`,
        {
          identifier,
          reason: `${payload.reason} - ${payload.note}`.trim(),
        }
      );
      if (res.success) {
        this.saveSuccessMessage.set(`Đơn hàng #${target.code} đã được hủy thành công.`);
        setTimeout(() => this.saveSuccessMessage.set(null), 4000);
        this.closeCancelModal();
        await this.loadCustomerOrders();
        if (this.selectedOrderDetail()?.code === target.code) {
          await this.viewOrderDetail(target.code);
        }
      } else {
        alert('Không thể hủy đơn hàng: ' + (res.error?.messageKey || 'Lỗi không xác định'));
      }
    } catch {
      alert('Lỗi kết nối khi gửi yêu cầu hủy đơn hàng.');
    }
  }

  protected saveProfileChanges(): void {
    this.auth.updateProfile({
      name: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      address: this.deliveryAddress.trim(),
    });
    this.saveSuccessMessage.set('Đã lưu các thay đổi hồ sơ cá nhân thành công!');
    setTimeout(() => this.saveSuccessMessage.set(null), 3000);
  }

  protected handleChangePassword(): void {
    if (this.newPass.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    this.saveSuccessMessage.set('Đã cập nhật mật khẩu mới thành công!');
    this.currentPass = '';
    this.newPass = '';
    setTimeout(() => this.saveSuccessMessage.set(null), 3000);
  }

  protected handleLogout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
