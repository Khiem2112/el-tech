import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiClientService } from '../../core/api/api-client.service';
import { VndPipe } from '../../lib/vnd.pipe';
import { ProductImagePipe } from '../../lib/product-image.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { InputDirective } from '../../components/atoms/input/input.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../components/atoms/select/select.component';
import { CancelOrderPayload, OrderCancelModalComponent } from './order-cancel-modal.component';

type OrderLine = {
  readonly id: string;
  readonly skuId: number | null;
  readonly sku: string | null;
  readonly name: string;
  readonly media?: unknown;
  readonly quantity: number;
  readonly unitPrice: string;
  readonly netAmount: string;
  readonly lineType: string;
  readonly pcBuildName: string | null;
  readonly pcBuildType: string | null;
  canReview: boolean;
};

type Order = {
  readonly code: string;
  readonly status: string;
  readonly holdReason: string | null;
  readonly cancellable: boolean;
  readonly fulfillmentMethod: string;
  readonly receiverName: string;
  readonly receiverEmail: string;
  readonly receiverPhone: string;
  readonly deliveryAddress: string | null;
  readonly branch: { id: number; name: string; address: string } | null;
  readonly subtotal: string;
  readonly shippingFee: string;
  readonly grandTotal: string;
  readonly payment: {
    readonly state: string;
    readonly method: string;
    readonly totalReceived: string;
    readonly codRemaining: string;
    readonly depositRequired: string;
    readonly depositDisposition: string | null;
    readonly paymentReference?: string;
    readonly expectedAmount?: string;
  } | null;
  readonly lines: OrderLine[];
  readonly timeline: readonly { readonly status: string; readonly reason: string | null; readonly occurredAt: string }[];
};

@Component({
  selector: 'app-order-lookup-page',
  imports: [
    FormsModule,
    RouterLink,
    VndPipe,
    DatePipe,
    ProductImagePipe,
    ButtonDirective,
    BadgeDirective,
    InputDirective,
    AppIconModule,
    SelectComponent,
    OrderCancelModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <!-- Breadcrumbs & Heading -->
      <div class="pb-6 border-b border-line">
        <nav class="text-xs text-muted mb-1">
          <a routerLink="/" class="hover:text-foreground">Trang chủ</a> / 
          <span class="text-foreground font-bold">Tra cứu trạng thái đơn</span>
        </nav>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Tra Cứu &amp; Theo Dõi Đơn Hàng</h1>
            <p class="text-xs text-muted mt-1">Nhập mã đơn hàng hoặc sử dụng số điện thoại / email đã đặt hàng để xem tiến độ đóng gói và thông tin thanh toán.</p>
          </div>
        </div>
      </div>

      <!-- Smart Authenticated User Handoff Banner -->
      @if (auth.isLoggedIn()) {
        <div class="max-w-2xl mx-auto bg-primary/10 border border-primary/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="size-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <lucide-icon name="User" class="size-5" aria-hidden="true"></lucide-icon>
            </div>
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-foreground">Bạn đang đăng nhập:</span>
                <span class="text-xs font-bold text-primary">{{ auth.currentUser()?.name || auth.currentUser()?.email }}</span>
              </div>
              <p class="text-xs text-muted">
                Bạn có thể xem toàn bộ lịch sử đơn hàng và chi tiết trực tiếp tại mục Đơn hàng của tôi mà không cần nhập OTP.
              </p>
            </div>
          </div>
          <a
            routerLink="/tai-khoan"
            [queryParams]="{ tab: 'orders' }"
            appButton
            variant="primary"
            size="sm"
            class="shrink-0 font-bold"
          >
            <lucide-icon name="Package" class="size-3.5" aria-hidden="true"></lucide-icon>
            <span>Đơn hàng của tôi</span>
          </a>
        </div>
      }

      <!-- 3-Tab Order Lookup Card -->
      <div class="max-w-2xl mx-auto bg-surface-alt p-5 sm:p-6 rounded-xl border border-line shadow-sm space-y-5">
        <!-- Tabs Navigation -->
        <div class="grid grid-cols-3 gap-1 bg-surface p-1 rounded-xl border border-line">
          <button
            type="button"
            (click)="switchTab('code')"
            class="py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
            [class.bg-surface-alt]="activeTab() === 'code'"
            [class.text-foreground]="activeTab() === 'code'"
            [class.shadow-xs]="activeTab() === 'code'"
            [class.text-muted]="activeTab() !== 'code'"
            [class.hover:text-foreground]="activeTab() !== 'code'"
          >
            <lucide-icon name="Package" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
            <span>Mã đơn hàng</span>
          </button>
          <button
            type="button"
            (click)="switchTab('phone')"
            class="py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
            [class.bg-surface-alt]="activeTab() === 'phone'"
            [class.text-foreground]="activeTab() === 'phone'"
            [class.shadow-xs]="activeTab() === 'phone'"
            [class.text-muted]="activeTab() !== 'phone'"
            [class.hover:text-foreground]="activeTab() !== 'phone'"
          >
            <lucide-icon name="Phone" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
            <span>Số điện thoại</span>
          </button>
          <button
            type="button"
            (click)="switchTab('email')"
            class="py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
            [class.bg-surface-alt]="activeTab() === 'email'"
            [class.text-foreground]="activeTab() === 'email'"
            [class.shadow-xs]="activeTab() === 'email'"
            [class.text-muted]="activeTab() !== 'email'"
            [class.hover:text-foreground]="activeTab() !== 'email'"
          >
            <lucide-icon name="Mail" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
            <span>Email</span>
          </button>
        </div>

        <!-- Tab 1: Tra cứu theo Mã đơn hàng -->
        @if (activeTab() === 'code') {
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-foreground mb-1" for="lookupOrderCode">Mã đơn hàng</label>
              <input
                id="lookupOrderCode"
                appInput
                class="w-full text-xs font-bold uppercase"
                [(ngModel)]="orderCode"
                (keydown.enter)="searchByCode()"
                placeholder="Ví dụ: ELT-2026-0001"
              >
              <p class="text-xs text-muted mt-1">Mã đơn hàng được hiển thị sau khi đặt hàng thành công hoặc trong tin nhắn / email biên nhận.</p>
            </div>

            <button
              type="button"
              appButton
              variant="primary"
              size="lg"
              class="w-full font-bold"
              [disabled]="isSearching() || !orderCode.trim()"
              (click)="searchByCode()"
            >
              @if (isSearching()) {
                <lucide-icon name="loader-2" class="size-4 animate-spin" aria-hidden="true"></lucide-icon>
                <span>Đang tra cứu đơn hàng...</span>
              } @else {
                <lucide-icon name="Search" class="size-4" aria-hidden="true"></lucide-icon>
                <span>Tra cứu đơn hàng</span>
              }
            </button>
          </div>
        }

        <!-- Tab 2: Tra cứu theo Số điện thoại -->
        @if (activeTab() === 'phone') {
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-foreground mb-1" for="lookupPhone">Số điện thoại đặt hàng</label>
              <input
                id="lookupPhone"
                appInput
                class="w-full text-xs font-bold"
                [(ngModel)]="phoneNumber"
                (keydown.enter)="requestPhoneOtp()"
                placeholder="Ví dụ: 0912345678"
                type="tel"
              >
              <p class="text-xs text-muted mt-1">Hệ thống sẽ gửi mã xác thực OTP 6 chữ số đến số điện thoại này để bảo mật thông tin đơn hàng.</p>
            </div>

            <button
              type="button"
              appButton
              variant="primary"
              size="lg"
              class="w-full font-bold"
              [disabled]="isRequestingOtp() || !phoneNumber.trim()"
              (click)="requestPhoneOtp()"
            >
              @if (isRequestingOtp()) {
                <lucide-icon name="loader-2" class="size-4 animate-spin" aria-hidden="true"></lucide-icon>
                <span>Đang gửi mã xác thực...</span>
              } @else {
                <lucide-icon name="Phone" class="size-4" aria-hidden="true"></lucide-icon>
                <span>Gửi mã xác thực</span>
              }
            </button>
          </div>
        }

        <!-- Tab 3: Tra cứu theo Email -->
        @if (activeTab() === 'email') {
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-foreground mb-1" for="lookupEmail">Email đặt hàng</label>
              <input
                id="lookupEmail"
                appInput
                class="w-full text-xs font-bold"
                [(ngModel)]="emailAddress"
                (keydown.enter)="requestEmailOtp()"
                placeholder="Ví dụ: customer@example.com"
                type="email"
              >
              <p class="text-xs text-muted mt-1">Hệ thống sẽ gửi mã xác thực OTP 6 chữ số đến địa chỉ email này để bảo mật thông tin đơn hàng.</p>
            </div>

            <button
              type="button"
              appButton
              variant="primary"
              size="lg"
              class="w-full font-bold"
              [disabled]="isRequestingOtp() || !emailAddress.trim()"
              (click)="requestEmailOtp()"
            >
              @if (isRequestingOtp()) {
                <lucide-icon name="loader-2" class="size-4 animate-spin" aria-hidden="true"></lucide-icon>
                <span>Đang gửi mã xác thực...</span>
              } @else {
                <lucide-icon name="Mail" class="size-4" aria-hidden="true"></lucide-icon>
                <span>Gửi mã xác thực</span>
              }
            </button>
          </div>
        }

        <!-- Search Error Notification -->
        @if (searchError()) {
          <div class="p-3.5 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2">
            <lucide-icon name="AlertTriangle" class="size-4 shrink-0 mt-0.5" aria-hidden="true"></lucide-icon>
            <div class="flex-1 space-y-1">
              <span class="font-bold block">Thông báo</span>
              <p class="text-foreground/80 text-xs leading-relaxed">{{ searchError() }}</p>
            </div>
          </div>
        }

        <!-- OTP Input Dialog/Card (for Phone & Email lookups) -->
        @if (verificationId() && (activeTab() === 'phone' || activeTab() === 'email')) {
          <div class="border-t border-line pt-4 space-y-3 bg-surface p-4 rounded-lg border border-line">
            <div>
              <label class="block text-xs font-bold text-foreground" for="lookupOtp">
                Nhập mã OTP 6 chữ số vừa gửi đến {{ otpTarget() }}
              </label>
              <p class="text-xs text-muted mt-0.5">Mã OTP có hiệu lực trong 5 phút.</p>
            </div>

            <div class="flex gap-2">
              <input
                id="lookupOtp"
                appInput
                class="flex-1 text-xs font-bold tracking-widest text-center"
                [(ngModel)]="otp"
                (keydown.enter)="verifyOtp()"
                inputmode="numeric"
                maxlength="6"
                placeholder="6 chữ số (ví dụ: 123456)"
              >
              <button
                type="button"
                appButton
                variant="primary"
                size="md"
                class="font-bold shrink-0"
                [disabled]="isVerifyingOtp() || !otp.trim()"
                (click)="verifyOtp()"
              >
                @if (isVerifyingOtp()) {
                  <lucide-icon name="loader-2" class="size-4 animate-spin" aria-hidden="true"></lucide-icon>
                  <span>Đang xác thực...</span>
                } @else {
                  <span>Xác thực &amp; Xem đơn</span>
                  <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
                }
              </button>
            </div>

            @if (verifyError()) {
              <div class="p-2.5 rounded bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-1.5">
                <lucide-icon name="AlertTriangle" class="size-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                <span>{{ verifyError() }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- SKELETON LOADING STATE -->
      @if (isSearching() || isVerifyingOtp()) {
        <div class="bg-surface rounded-xl border border-line overflow-hidden shadow-sm animate-pulse space-y-4" aria-busy="true">
          <!-- Header Bar Skeleton -->
          <div class="bg-surface-dark p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-line">
            <div class="space-y-2">
              <div class="h-5 w-48 bg-line-dark rounded"></div>
              <div class="h-6 w-64 bg-line-dark rounded"></div>
            </div>
            <div class="flex gap-2">
              <div class="h-7 w-28 bg-line-dark rounded-full"></div>
              <div class="h-7 w-32 bg-line-dark rounded-full"></div>
            </div>
          </div>

          <!-- Stepper Skeleton -->
          <div class="p-5 bg-surface-alt border-b border-line">
            <div class="grid grid-cols-5 gap-2">
              @for (step of [1, 2, 3, 4, 5]; track step) {
                <div class="flex flex-col items-center space-y-2">
                  <div class="size-8 rounded-full bg-line"></div>
                  <div class="h-3 w-16 bg-line rounded"></div>
                </div>
              }
            </div>
          </div>

          <!-- Cards Skeleton -->
          <div class="p-5 sm:p-6 space-y-6">
            <div class="grid sm:grid-cols-3 gap-3">
              <div class="h-16 bg-surface-alt rounded-xl border border-line"></div>
              <div class="h-16 bg-surface-alt rounded-xl border border-line"></div>
              <div class="h-16 bg-surface-alt rounded-xl border border-line"></div>
            </div>

            <div class="h-28 bg-surface-alt rounded-xl border border-line"></div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div class="h-24 bg-surface-alt rounded-lg border border-line"></div>
              <div class="h-24 bg-surface-alt rounded-lg border border-line"></div>
            </div>

            <!-- Lines Skeleton -->
            <div class="space-y-3">
              <div class="h-4 w-40 bg-line rounded"></div>
              <div class="rounded-lg border border-line divide-y divide-border bg-surface">
                @for (row of [1, 2]; track row) {
                  <div class="p-4 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3 flex-1">
                      <div class="size-14 rounded-md bg-surface-alt shrink-0"></div>
                      <div class="space-y-2 flex-1">
                        <div class="h-3 w-48 bg-line rounded"></div>
                        <div class="h-2.5 w-24 bg-line rounded"></div>
                      </div>
                    </div>
                    <div class="h-4 w-20 bg-line rounded"></div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Back to Guest Orders List Button -->
      @if (!isSearching() && !isVerifyingOtp() && guestOrders().length > 1 && order()) {
        <div class="max-w-7xl mx-auto flex items-center justify-start">
          <button
            type="button"
            appButton
            variant="outline"
            size="sm"
            (click)="order.set(null)"
          >
            <lucide-icon name="ChevronLeft" class="size-3.5" aria-hidden="true"></lucide-icon>
            <span>Quay lại danh sách đơn hàng ({{ guestOrders().length }} đơn)</span>
          </button>
        </div>
      }

      <!-- Guest Orders List (when multiple orders found and none selected yet) -->
      @if (!isSearching() && !isVerifyingOtp() && !order() && guestOrders().length > 0) {
        <div class="max-w-4xl mx-auto space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-line">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-foreground">Danh Sách Đơn Hàng Tìm Thấy ({{ guestOrders().length }})</h2>
              <p class="text-xs text-muted">Bấm vào đơn hàng để xem chi tiết tiến độ, linh kiện và thông tin thanh toán.</p>
            </div>
            <span class="text-xs font-semibold text-primary">Đã xác thực OTP</span>
          </div>

          <div class="grid gap-3">
            @for (item of guestOrders(); track item.code) {
              <div
                class="p-4 sm:p-5 rounded-xl bg-surface border border-line hover:border-primary/50 transition-colors shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                (click)="selectGuestOrder(item)"
              >
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <span appBadge variant="primary" class="font-bold">
                      MÃ ĐƠN: {{ item.code }}
                    </span>
                    <span appBadge variant="dark">
                      {{ item.status }}
                    </span>
                    <span
                      appBadge
                      [variant]="item.payment?.state === 'PAID' ? 'success' : 'outline'"
                    >
                      {{ item.payment?.state === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN' }}
                    </span>
                  </div>
                  <div class="text-xs text-muted">
                    Người nhận: <span class="text-foreground font-semibold">{{ item.receiverName }}</span> · {{ item.receiverPhone }}
                  </div>
                  <div class="text-xs text-muted truncate">
                    {{ item.lines.length }} món linh kiện · {{ item.fulfillmentMethod === 'DELIVERY' ? 'Giao hàng tận nơi' : 'Nhận tại showroom' }}
                  </div>
                </div>

                <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-line">
                  <div class="text-left sm:text-right">
                    <span class="text-xs text-muted block">Tổng thanh toán</span>
                    <span class="text-base font-black text-primary tabular">{{ item.grandTotal | vnd }}</span>
                  </div>
                  <button
                    type="button"
                    appButton
                    variant="secondary"
                    size="sm"
                    class="shrink-0 font-bold"
                    (click)="selectGuestOrder(item); $event.stopPropagation()"
                  >
                    <span>Xem chi tiết</span>
                    <lucide-icon name="ChevronRight" class="size-3.5" aria-hidden="true"></lucide-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Detailed Order View When Retrieved -->
      @if (!isSearching() && !isVerifyingOtp() && order(); as item) {
        <div class="bg-surface rounded-xl border border-line overflow-hidden shadow-sm">
          
          <!-- Header Bar with Status Badges -->
          <div class="bg-surface-dark text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-line">
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <span appBadge variant="primary" class="font-bold">
                  MÃ ĐƠN: {{ item.code }}
                </span>
                <span class="text-xs text-muted">Người nhận: {{ item.receiverName }} · {{ item.receiverPhone }}</span>
              </div>
              <h2 class="text-xl font-black tracking-tight mt-1 text-white">Chi Tiết Đơn Hàng Linh Kiện PC</h2>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span appBadge variant="dark">
                TRẠNG THÁI: {{ item.status }}
              </span>
              <span
                appBadge
                [variant]="item.payment?.state === 'PAID' ? 'success' : 'outline'"
              >
                THANH TOÁN: {{ item.payment?.state ?? 'CHƯA THANH TOÁN' }}
              </span>
              <button
                type="button"
                appButton
                variant="outline"
                size="sm"
                class="border-line-dark text-slate-200 hover:text-white"
                (click)="triggerPrint()"
              >
                <lucide-icon name="Printer" class="size-3.5" aria-hidden="true"></lucide-icon>
                <span>In biên nhận</span>
              </button>
            </div>
          </div>

          <!-- 5-Stage Visual Stepper -->
          <div class="p-5 bg-surface-alt border-b border-line">
            <div class="grid grid-cols-5 gap-2 text-center text-xs">
              <!-- Stage 1: Đã xác nhận -->
              <div class="space-y-1">
                <div
                  class="size-8 mx-auto rounded-full font-bold text-xs flex items-center justify-center transition-colors"
                  [class.bg-primary]="currentStageIndex() >= 1"
                  [class.text-slate-950]="currentStageIndex() >= 1"
                  [class.bg-surface]="currentStageIndex() < 1"
                  [class.border]="currentStageIndex() < 1"
                  [class.border-line]="currentStageIndex() < 1"
                  [class.text-muted]="currentStageIndex() < 1"
                >
                  @if (currentStageIndex() > 1) {
                    <lucide-icon name="Check" class="size-4" aria-hidden="true"></lucide-icon>
                  } @else {
                    1
                  }
                </div>
                <div class="font-bold" [class.text-primary]="currentStageIndex() >= 1" [class.text-muted]="currentStageIndex() < 1">
                  Đã xác nhận
                </div>
                <div class="text-xs text-muted">CONFIRMED</div>
              </div>

              <!-- Stage 2: Chuẩn bị linh kiện -->
              <div class="space-y-1">
                <div
                  class="size-8 mx-auto rounded-full font-bold text-xs flex items-center justify-center transition-colors"
                  [class.bg-primary]="currentStageIndex() >= 2"
                  [class.text-slate-950]="currentStageIndex() >= 2"
                  [class.bg-surface]="currentStageIndex() < 2"
                  [class.border]="currentStageIndex() < 2"
                  [class.border-line]="currentStageIndex() < 2"
                  [class.text-muted]="currentStageIndex() < 2"
                >
                  @if (currentStageIndex() > 2) {
                    <lucide-icon name="Check" class="size-4" aria-hidden="true"></lucide-icon>
                  } @else {
                    2
                  }
                </div>
                <div class="font-bold" [class.text-primary]="currentStageIndex() >= 2" [class.text-muted]="currentStageIndex() < 2">
                  Soạn linh kiện
                </div>
                <div class="text-xs text-muted">Kiểm tra seal</div>
              </div>

              <!-- Stage 3: Lắp ráp & Stress test -->
              <div class="space-y-1">
                <div
                  class="size-8 mx-auto rounded-full font-bold text-xs flex items-center justify-center transition-colors"
                  [class.bg-primary]="currentStageIndex() >= 3"
                  [class.text-slate-950]="currentStageIndex() >= 3"
                  [class.bg-surface]="currentStageIndex() < 3"
                  [class.border]="currentStageIndex() < 3"
                  [class.border-line]="currentStageIndex() < 3"
                  [class.text-muted]="currentStageIndex() < 3"
                >
                  @if (currentStageIndex() > 3) {
                    <lucide-icon name="Check" class="size-4" aria-hidden="true"></lucide-icon>
                  } @else {
                    3
                  }
                </div>
                <div class="font-bold" [class.text-primary]="currentStageIndex() >= 3" [class.text-muted]="currentStageIndex() < 3">
                  Ráp & Stress Test
                </div>
                <div class="text-xs text-muted">Bench & Furmark</div>
              </div>

              <!-- Stage 4: Sẵn sàng giao / Hub -->
              <div class="space-y-1">
                <div
                  class="size-8 mx-auto rounded-full font-bold text-xs flex items-center justify-center transition-colors"
                  [class.bg-primary]="currentStageIndex() >= 4"
                  [class.text-slate-950]="currentStageIndex() >= 4"
                  [class.bg-surface]="currentStageIndex() < 4"
                  [class.border]="currentStageIndex() < 4"
                  [class.border-line]="currentStageIndex() < 4"
                  [class.text-muted]="currentStageIndex() < 4"
                >
                  @if (currentStageIndex() > 4) {
                    <lucide-icon name="Check" class="size-4" aria-hidden="true"></lucide-icon>
                  } @else {
                    4
                  }
                </div>
                <div class="font-bold" [class.text-primary]="currentStageIndex() >= 4" [class.text-muted]="currentStageIndex() < 4">
                  Sẵn sàng / Hub
                </div>
                <div class="text-xs text-muted">Giao 2H / OTP Hub</div>
              </div>

              <!-- Stage 5: Hoàn tất -->
              <div class="space-y-1">
                <div
                  class="size-8 mx-auto rounded-full font-bold text-xs flex items-center justify-center transition-colors"
                  [class.bg-primary]="currentStageIndex() >= 5"
                  [class.text-slate-950]="currentStageIndex() >= 5"
                  [class.bg-surface]="currentStageIndex() < 5"
                  [class.border]="currentStageIndex() < 5"
                  [class.border-line]="currentStageIndex() < 5"
                  [class.text-muted]="currentStageIndex() < 5"
                >
                  5
                </div>
                <div class="font-bold" [class.text-primary]="currentStageIndex() >= 5" [class.text-muted]="currentStageIndex() < 5">
                  Hoàn tất
                </div>
                <div class="text-xs text-muted">Bảo hành 36T</div>
              </div>
            </div>
          </div>

          <!-- Telemetry Strip -->
          <div class="bg-surface px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-4 flex-wrap">
              <span class="flex items-center gap-1.5 text-muted">
                <lucide-icon name="Calendar" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                <span>Thời gian tạo: <strong class="text-foreground tabular">{{ orderCreatedAt() }}</strong></span>
              </span>
              <span class="flex items-center gap-1.5 text-muted">
                <lucide-icon name="Wrench" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                <span>Kỹ thuật viên: <strong class="text-foreground">{{ technicianInCharge() }}</strong></span>
              </span>
              @if (item.fulfillmentMethod === 'PICKUP') {
                <span class="flex items-center gap-1.5 text-muted bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  <span class="text-sky-500 font-bold">Mã OTP nhận tại quầy:</span>
                  <strong class="text-foreground tabular font-bold">{{ pickupOtp() }}</strong>
                </span>
              }
            </div>

            <!-- Cancel Button Trigger -->
            @if (item.cancellable && item.status !== 'CANCELLED') {
              <button
                type="button"
                appButton
                variant="danger"
                size="sm"
                (click)="showCancelModal.set(true)"
              >
                <lucide-icon name="RotateCcw" class="size-3.5" aria-hidden="true"></lucide-icon>
                <span>Hủy đơn hàng trực tuyến</span>
              </button>
            }
          </div>

          <div class="p-5 sm:p-6 space-y-6">
            <!-- SLA Commitments Strip (TR-01) -->
            <div class="grid sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-alt border border-line text-xs">
              <div class="flex items-center gap-2.5">
                <div class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <lucide-icon name="Clock" class="size-4" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <span class="font-bold text-foreground block">SLA Lắp Ráp 120 Phút</span>
                  <span class="text-xs text-muted">Bàn giao &amp; kiểm tra hỏa tốc</span>
                </div>
              </div>

              <div class="flex items-center gap-2.5">
                <div class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <lucide-icon name="ShieldCheck" class="size-4" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <span class="font-bold text-foreground block">Hỗ Trợ Kỹ Thuật 7 Ngày/Tuần</span>
                  <span class="text-xs text-muted">Chuyên viên hỗ trợ trọn đời máy</span>
                </div>
              </div>

              <div class="flex items-center gap-2.5">
                <div class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <lucide-icon name="Package" class="size-4" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <span class="font-bold text-foreground block">Đóng Gói Chống Sốc Tiêu Chuẩn</span>
                  <span class="text-xs text-muted">Bảo hiểm linh kiện 100%</span>
                </div>
              </div>
            </div>

            <!-- Hardware Quality Certification & Stress Test Telemetry (TR-02) -->
            <div class="rounded-xl p-4 sm:p-5 bg-surface-dark border border-line-dark text-white space-y-3 shadow-md">
              <div class="flex items-center justify-between pb-2 border-b border-line-dark text-xs">
                <div class="flex items-center gap-2">
                  <lucide-icon name="Cpu" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                  <span class="font-bold text-white uppercase tracking-wider text-xs">Chứng Nhận Kiểm Định &amp; Stress Test Phần Cứng</span>
                </div>
                <span class="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-xs font-bold">
                  ĐẠT TIÊU CHUẨN XUẤT XƯỞNG
                </span>
              </div>

              <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div class="p-2.5 rounded-lg bg-surface-elevated border border-line-dark">
                  <span class="text-xs text-muted block">Chuyên viên phụ trách:</span>
                  <strong class="text-white font-bold block mt-0.5">Vũ Hoàng (KTV-0824)</strong>
                  <span class="text-xs text-primary font-medium">Senior Hardware Specialist</span>
                </div>

                <div class="p-2.5 rounded-lg bg-surface-elevated border border-line-dark">
                  <span class="text-xs text-muted block">FurMark GPU Stress Test:</span>
                  <strong class="text-primary font-bold block mt-0.5 tabular">Max 64°C (Safe)</strong>
                  <span class="text-xs text-muted">Fan profile 55% RPM tối ưu</span>
                </div>

                <div class="p-2.5 rounded-lg bg-surface-elevated border border-line-dark">
                  <span class="text-xs text-muted block">Cinebench R23 Multi-Core:</span>
                  <strong class="text-white font-bold block mt-0.5">Ổn định 100% (Pass)</strong>
                  <span class="text-xs text-muted">Điện áp CPU &amp; VRM mát mẻ</span>
                </div>

                <div class="p-2.5 rounded-lg bg-surface-elevated border border-line-dark">
                  <span class="text-xs text-muted block">Cập nhật BIOS &amp; Profile RAM:</span>
                  <strong class="text-white font-bold block mt-0.5">XMP / EXPO Active</strong>
                  <span class="text-xs text-muted">Driver WHQL mới nhất</span>
                </div>
              </div>
            </div>
            
            <!-- VietQR Dynamic Payment Transfer Card (When Unpaid) -->
            @if (item.payment?.paymentReference && item.payment?.state === 'UNPAID') {
              <div class="bg-gradient-to-r from-surface-dark via-surface-elevated to-surface-dark p-5 rounded-xl border border-line text-white shadow-xl grid md:grid-cols-12 gap-5 items-center">
                <div class="md:col-span-4 flex flex-col items-center justify-center text-center p-3.5 bg-surface-dark rounded-lg border border-line-dark">
                  <div class="size-36 rounded-md bg-white p-2.5 flex flex-col items-center justify-center shadow-inner">
                    <div class="size-28 bg-surface-dark rounded flex flex-col items-center justify-center text-xs text-primary font-bold p-2 text-center">
                      [MÃ VIETQR CHUYỂN KHOẢN TỰ ĐỘNG]
                    </div>
                  </div>
                  <span class="mt-2 text-xs text-muted">Quét bằng ứng dụng Ngân hàng</span>
                </div>

                <div class="md:col-span-8 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-primary uppercase">THÔNG TIN CHUYỂN KHOẢN CHÍNH XÁC</span>
                    <span class="text-xs text-warning">Giữ linh kiện: 30 phút</span>
                  </div>
                  <div class="grid sm:grid-cols-2 gap-3 text-xs">
                    <div class="p-3 rounded-md bg-line-dark/80 border border-line-dark">
                      <span class="text-muted block text-xs">Nội dung chuyển khoản (chính xác):</span>
                      <strong class="text-primary text-base tracking-wider tabular font-bold">{{ item.payment?.paymentReference }}</strong>
                    </div>
                    <div class="p-3 rounded-md bg-line-dark/80 border border-line-dark">
                      <span class="text-muted block text-xs">Số tiền cần thanh toán:</span>
                      <strong class="text-primary text-base tabular font-bold">{{ (item.payment?.expectedAmount ?? '0') | vnd }}</strong>
                    </div>
                  </div>
                  <p class="text-xs text-muted">
                    Quý khách vui lòng chuyển đúng nội dung để hệ thống tự động xác nhận đơn trong 1-2 phút.
                  </p>
                </div>
              </div>
            }

            <!-- Customer & Fulfillment Information Cards -->
            <div class="grid sm:grid-cols-2 gap-4 text-xs">
              <div class="p-4 rounded-lg bg-surface-alt border border-line space-y-1.5">
                <span class="font-bold text-foreground block text-sm">Thông Tin Nhận Hàng</span>
                <p>Hình thức: <strong class="text-foreground">{{ item.fulfillmentMethod === 'DELIVERY' ? 'Giao hàng tận nơi' : 'Nhận tại chi nhánh' }}</strong></p>
                @if (item.fulfillmentMethod === 'DELIVERY') {
                  <p>Địa chỉ giao: <span class="text-foreground">{{ item.deliveryAddress }}</span></p>
                } @else if (item.branch) {
                  <p>Chi nhánh: <span class="text-foreground">{{ item.branch.name }} - {{ item.branch.address }}</span></p>
                }
              </div>

              <div class="p-4 rounded-lg bg-surface-alt border border-line space-y-1.5">
                <span class="font-bold text-foreground block text-sm">Phương Thức Thanh Toán</span>
                <p>Hình thức: <strong class="text-foreground">{{ item.payment?.method === 'QR' ? 'Chuyển khoản VietQR' : 'Thanh toán COD' }}</strong></p>
                @if (item.payment?.depositDisposition) {
                  <p class="text-muted">Trạng thái đặt cọc: {{ item.payment?.depositDisposition }}</p>
                }
                <p class="text-sm font-black text-foreground pt-1 border-t border-line">
                  Tổng thanh toán: <span class="text-primary tabular text-base">{{ item.grandTotal | vnd }}</span>
                </p>
              </div>
            </div>

            <!-- Ordered Components List -->
            <div>
              <h3 class="font-bold text-sm text-foreground mb-3">Danh Sách Linh Kiện Trong Đơn Hàng</h3>
              <div class="bg-surface rounded-lg border border-line divide-y divide-border overflow-hidden shadow-sm">
                @for (line of item.lines; track line.id) {
                  <div class="p-4 sm:p-5">
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div class="size-14 rounded-md bg-surface-alt border border-line flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            [src]="line.media | productImage"
                            [alt]="line.name"
                            class="h-full w-full object-cover"
                            (error)="onImageError($event)"
                          >
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="font-bold text-sm text-foreground truncate">{{ line.name }}</p>
                          @if (line.pcBuildName) {
                            <p class="text-xs text-primary font-semibold">BOM CẤU HÌNH: {{ line.pcBuildName }} ({{ line.pcBuildType }})</p>
                          }
                          <p class="text-xs text-muted">SL: <span class="tabular font-medium">{{ line.quantity }}</span> · Đơn giá: <span class="tabular font-medium">{{ line.unitPrice | vnd }}</span></p>
                        </div>
                      </div>
                      <span class="font-bold text-xs text-foreground shrink-0 tabular">{{ line.netAmount | vnd }}</span>
                    </div>

                    <!-- Customer Review action if line is eligible -->
                    @if (line.canReview && reviewingLineId() !== line.id) {
                      <div class="mt-2.5">
                        <button type="button" class="text-xs font-bold text-primary underline inline-flex items-center gap-1" (click)="openReview(line.id)">
                          <lucide-icon name="Star" class="size-3.5" aria-hidden="true"></lucide-icon>
                          <span>Viết đánh giá sản phẩm sau khi sử dụng</span>
                        </button>
                      </div>
                    }

                    <!-- Review Form -->
                    @if (reviewingLineId() === line.id) {
                      <div class="mt-3 rounded-lg bg-surface-alt p-3.5 text-xs border border-line space-y-2.5">
                        <p class="font-bold text-foreground">Đánh giá linh kiện</p>
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-medium">Số sao:</span>
                          <app-select
                            [options]="ratingOptions"
                            [value]="reviewRating.toString()"
                            (valueChange)="reviewRating = +$event"
                            size="sm"
                            class="w-48"
                            ariaLabel="Số sao đánh giá"
                          />
                        </div>
                        <textarea
                          appInput
                          class="w-full text-xs"
                          rows="2"
                          [(ngModel)]="reviewText"
                          placeholder="Nhận xét chi tiết về hiệu năng, nhiệt độ và đóng gói (tối thiểu 10 ký tự)..."
                        ></textarea>
                        <div class="flex gap-2">
                          <button
                            type="button"
                            appButton
                            variant="primary"
                            size="sm"
                            [disabled]="isSubmittingReview() || reviewText.trim().length < 10"
                            (click)="submitReview(line)"
                          >
                            @if (isSubmittingReview()) {
                              <lucide-icon name="loader-2" class="size-4 animate-spin" aria-hidden="true"></lucide-icon>
                              <span>Đang gửi...</span>
                            } @else {
                              <span>Gửi đánh giá</span>
                            }
                          </button>
                          <button
                            type="button"
                            appButton
                            variant="outline"
                            size="sm"
                            (click)="reviewingLineId.set(null)"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Price breakdown summary -->
              <div class="mt-3 flex justify-between text-xs text-muted px-2">
                <span>Tạm tính: <span class="tabular font-medium">{{ item.subtotal | vnd }}</span> · Phí giao hàng: <span class="tabular font-medium">{{ item.shippingFee | vnd }}</span></span>
                <span class="font-black text-foreground text-sm tabular">Tổng cộng: {{ item.grandTotal | vnd }}</span>
              </div>
            </div>

            <!-- Processing Timeline Log -->
            <div class="border-t border-line pt-5">
              <h3 class="font-bold text-sm text-foreground mb-3">Nhật Ký Xử Lý Đơn Hàng (Timeline)</h3>
              <ol class="space-y-2 text-xs text-muted">
                @for (entry of item.timeline; track entry.occurredAt) {
                  <li class="flex items-center gap-3">
                    <span class="text-muted">{{ entry.occurredAt | date:'HH:mm:ss dd/MM' }}</span>
                    <span class="size-1.5 rounded-full bg-primary"></span>
                    <span class="text-foreground font-medium">{{ entry.status }}{{ entry.reason ? ' (' + entry.reason + ')' : '' }}</span>
                  </li>
                }
              </ol>
            </div>

          </div>

        </div>
      }

      <!-- Empty Guide State (When No Order Selected/Retrieved) -->
      @if (!isSearching() && !isVerifyingOtp() && !order() && guestOrders().length === 0) {
        <div class="max-w-2xl mx-auto rounded-xl border border-line bg-surface p-8 text-center space-y-4 shadow-xs">
          <div class="size-12 rounded-full bg-surface-alt border border-line flex items-center justify-center mx-auto text-primary">
            <lucide-icon name="Package" class="size-6" aria-hidden="true"></lucide-icon>
          </div>
          <div class="space-y-1.5">
            <h3 class="text-base font-bold text-foreground">Chưa có đơn hàng nào được chọn tra cứu</h3>
            <p class="text-xs text-muted max-w-md mx-auto leading-relaxed">
              Nhập mã đơn hàng hoặc sử dụng số điện thoại / email đặt hàng để nhận mã xác thực OTP, kiểm tra tiến độ đóng gói, kết quả stress-test và mã thanh toán VietQR.
            </p>
          </div>

          <div class="grid sm:grid-cols-3 gap-3 pt-3 border-t border-line text-left">
            <div class="p-3 rounded-lg bg-surface-alt border border-line space-y-1">
              <span class="text-xs font-bold text-foreground flex items-center gap-1.5">
                <lucide-icon name="Clock" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                Tiến độ 5 giai đoạn
              </span>
              <p class="text-xs text-muted leading-relaxed">Cập nhật trực tiếp từ kho và bàn test bench</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-alt border border-line space-y-1">
              <span class="text-xs font-bold text-foreground flex items-center gap-1.5">
                <lucide-icon name="Cpu" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                Kết quả Stress Test
              </span>
              <p class="text-xs text-muted leading-relaxed">Xem nhiệt độ Furmark và Cinebench xuất xưởng</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-alt border border-line space-y-1">
              <span class="text-xs font-bold text-foreground flex items-center gap-1.5">
                <lucide-icon name="QrCode" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                Thanh toán VietQR
              </span>
              <p class="text-xs text-muted leading-relaxed">Mã QR chính xác theo nội dung đơn hàng</p>
            </div>
          </div>
        </div>
      }

      <!-- Order Cancel Modal Dialog -->
      @if (showCancelModal() && order(); as curOrder) {
        <app-order-cancel-modal
          [orderCode]="curOrder.code"
          [status]="curOrder.status"
          [totalAmount]="curOrder.grandTotal"
          [paymentMethod]="curOrder.payment?.method ?? 'QR'"
          (cancelled)="handleModalCancel(curOrder.code, $event)"
          (closed)="showCancelModal.set(false)"
        ></app-order-cancel-modal>
      }
    </section>
  `,
})
export class OrderLookupPageComponent implements OnInit {
  private readonly api = inject(ApiClientService);
  protected readonly auth = inject(AuthService);
  protected readonly onImageError = handleProductImageError;

  protected readonly activeTab = signal<'code' | 'phone' | 'email'>('code');
  protected orderCode = '';
  protected phoneNumber = '';
  protected emailAddress = '';
  protected otp = '';
  protected readonly otpTarget = signal<string>('');

  protected readonly ratingOptions: readonly SelectOption[] = [
    { value: '5', label: '5 sao - Rất tốt' },
    { value: '4', label: '4 sao - Tốt' },
    { value: '3', label: '3 sao - Bình thường' },
    { value: '2', label: '2 sao - Chưa ưng ý' },
    { value: '1', label: '1 sao - Kém' },
  ];

  protected reviewRating = 5;
  protected reviewText = '';
  protected readonly verificationId = signal<string | null>(null);
  protected readonly sessionToken = signal<string | null>(null);
  protected readonly guestOrders = signal<readonly Order[]>([]);
  protected readonly order = signal<Order | null>(null);
  protected readonly showCancelModal = signal(false);
  protected readonly reviewingLineId = signal<string | null>(null);

  protected readonly isSearching = signal(false);
  protected readonly isRequestingOtp = signal(false);
  protected readonly isVerifyingOtp = signal(false);
  protected readonly isSubmittingReview = signal(false);

  protected readonly searchError = signal<string | null>(null);
  protected readonly verifyError = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      if (user.phone) {
        this.phoneNumber = user.phone;
      }
      if (user.email) {
        this.emailAddress = user.email;
      }
    }
  }

  protected switchTab(tab: 'code' | 'phone' | 'email'): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.searchError.set(null);
    this.verifyError.set(null);
    this.verificationId.set(null);
    this.otp = '';
  }

  protected selectGuestOrder(orderItem: Order): void {
    this.order.set(orderItem);
  }

  protected readonly currentStageIndex = computed(() => {
    const o = this.order();
    if (!o) return 0;
    const status = o.status.toUpperCase();
    if (status === 'COMPLETED') return 5;
    if (status === 'READY_FOR_PICKUP' || status === 'SHIPPING') return 4;
    if (status === 'ASSEMBLING' || status === 'TESTING') return 3;
    if (status === 'PREPARING_COMPONENTS') return 2;
    if (status === 'CONFIRMED' || status === 'PENDING_PAYMENT' || status === 'PENDING_COD_CONFIRMATION') return 1;
    return 0;
  });

  protected readonly orderCreatedAt = computed(() => {
    const timeline = this.order()?.timeline;
    if (timeline && timeline.length > 0) {
      return timeline[0].occurredAt;
    }
    return 'Hôm nay';
  });

  protected readonly technicianInCharge = computed(() => {
    return 'Vũ Hoàng (KTV-0824 - Senior Specialist)';
  });

  protected readonly pickupOtp = computed(() => {
    const code = this.order()?.code ?? '';
    const digits = code.replace(/\D/g, '').slice(-6);
    return digits ? `OTP-${digits}` : 'OTP-981240';
  });

  protected async searchByCode(): Promise<void> {
    const code = this.orderCode.trim();
    if (this.isSearching() || !code) return;

    this.isSearching.set(true);
    this.searchError.set(null);
    this.order.set(null);
    this.guestOrders.set([]);
    this.verificationId.set(null);

    try {
      const response = await this.api.get<Order>(`/orders/${encodeURIComponent(code)}/detail`);
      if (response.success) {
        this.order.set(response.data);
      } else {
        this.searchError.set(
          this.formatErrorMessage(
            response.error?.code || response.error?.messageKey,
            'Không tìm thấy đơn hàng với mã đã nhập. Vui lòng kiểm tra lại.'
          )
        );
      }
    } catch {
      this.searchError.set('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      this.isSearching.set(false);
    }
  }

  protected async requestPhoneOtp(): Promise<void> {
    const phone = this.phoneNumber.trim();
    if (this.isRequestingOtp() || !phone) return;

    this.isRequestingOtp.set(true);
    this.searchError.set(null);
    this.verifyError.set(null);
    this.verificationId.set(null);
    this.order.set(null);
    this.guestOrders.set([]);
    this.otp = '';

    try {
      const response = await this.api.post<{ verificationId: string; expiresAt: string }>(
        '/orders/lookup/request-otp',
        { identifier: phone, contactType: 'PHONE' }
      );
      if (response.success) {
        this.verificationId.set(response.data.verificationId);
        this.otpTarget.set(phone);
      } else {
        this.searchError.set(
          this.formatErrorMessage(
            response.error?.code || response.error?.messageKey,
            'Không tìm thấy đơn hàng nào liên kết với số điện thoại này.'
          )
        );
      }
    } catch {
      this.searchError.set('Lỗi kết nối máy chủ khi gửi mã xác thực. Vui lòng thử lại sau.');
    } finally {
      this.isRequestingOtp.set(false);
    }
  }

  protected async requestEmailOtp(): Promise<void> {
    const email = this.emailAddress.trim();
    if (this.isRequestingOtp() || !email) return;

    this.isRequestingOtp.set(true);
    this.searchError.set(null);
    this.verifyError.set(null);
    this.verificationId.set(null);
    this.order.set(null);
    this.guestOrders.set([]);
    this.otp = '';

    try {
      const response = await this.api.post<{ verificationId: string; expiresAt: string }>(
        '/orders/lookup/request-otp',
        { identifier: email, contactType: 'EMAIL' }
      );
      if (response.success) {
        this.verificationId.set(response.data.verificationId);
        this.otpTarget.set(email);
      } else {
        this.searchError.set(
          this.formatErrorMessage(
            response.error?.code || response.error?.messageKey,
            'Không tìm thấy đơn hàng nào liên kết với email này.'
          )
        );
      }
    } catch {
      this.searchError.set('Lỗi kết nối máy chủ khi gửi mã xác thực. Vui lòng thử lại sau.');
    } finally {
      this.isRequestingOtp.set(false);
    }
  }

  protected async verifyOtp(): Promise<void> {
    const verificationId = this.verificationId();
    const otp = this.otp.trim();
    if (!verificationId || this.isVerifyingOtp() || !otp) return;

    this.isVerifyingOtp.set(true);
    this.verifyError.set(null);

    try {
      const response = await this.api.post<{ verificationId: string; sessionToken: string; orders: readonly Order[] }>(
        '/orders/lookup/verify-otp',
        { verificationId, otp }
      );
      if (response.success) {
        this.sessionToken.set(response.data.sessionToken || response.data.verificationId);
        const orders = response.data.orders;
        this.guestOrders.set(orders);
        if (orders.length === 1) {
          this.order.set(orders[0]);
        } else if (orders.length > 1) {
          this.order.set(null);
        } else {
          this.verifyError.set('Không tìm thấy đơn hàng nào tương ứng.');
        }
      } else {
        this.verifyError.set(
          this.formatErrorMessage(
            response.error?.code || response.error?.messageKey,
            'Mã OTP không chính xác hoặc đã hết hạn.'
          )
        );
      }
    } catch {
      this.verifyError.set('Lỗi kết nối khi xác thực OTP. Vui lòng thử lại.');
    } finally {
      this.isVerifyingOtp.set(false);
    }
  }

  protected async refreshOrder(): Promise<void> {
    const cur = this.order();
    if (!cur) return;
    const response = await this.api.get<Order>(`/orders/${encodeURIComponent(cur.code)}/detail`);
    if (response.success) {
      this.order.set(response.data);
      this.guestOrders.update((list) =>
        list.map((o) => (o.code === response.data.code ? response.data : o))
      );
    }
  }

  protected async handleModalCancel(orderCode: string, payload: CancelOrderPayload): Promise<void> {
    const reasonText = payload.note ? `${payload.reason} - ${payload.note}` : payload.reason;
    const cur = this.order();
    const identifier =
      cur?.receiverPhone ||
      cur?.receiverEmail ||
      this.phoneNumber.trim() ||
      this.emailAddress.trim() ||
      this.auth.currentUser()?.email ||
      '';

    const response = await this.api.post<{ code: string; status: string; paymentState: string }>(`/orders/${orderCode}/cancel`, {
      identifier,
      sessionToken: this.sessionToken() ?? undefined,
      reason: reasonText,
      bankInfo: payload.bankInfo,
    });
    if (response.success) {
      this.showCancelModal.set(false);
      await this.refreshOrder();
    }
  }

  protected triggerPrint(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  protected openReview(lineId: string): void {
    this.reviewingLineId.set(lineId);
    this.reviewText = '';
    this.reviewRating = 5;
  }

  protected async submitReview(line: OrderLine): Promise<void> {
    const verificationId = this.verificationId();
    if (!verificationId || this.reviewText.trim().length < 10 || this.isSubmittingReview()) return;
    this.isSubmittingReview.set(true);
    try {
      const response = await this.api.post<{ id: string }>('/reviews', {
        verificationId,
        orderLineId: line.id,
        rating: this.reviewRating,
        text: this.reviewText.trim(),
      });
      if (response.success) {
        line.canReview = false;
        this.reviewingLineId.set(null);
        await this.refreshOrder();
      }
    } finally {
      this.isSubmittingReview.set(false);
    }
  }

  private formatErrorMessage(code?: string, fallback = 'Không tìm thấy đơn hàng với thông tin đã cung cấp.'): string {
    if (!code) return fallback;
    switch (code) {
      case 'ORDER_NOT_FOUND':
      case 'error.orderNotFound':
        return 'Không tìm thấy đơn hàng với thông tin đã cung cấp. Vui lòng kiểm tra lại.';
      case 'OTP_INVALID':
      case 'error.otpInvalid':
        return 'Mã xác thực OTP không chính xác. Vui lòng kiểm tra và nhập lại.';
      case 'SESSION_EXPIRED':
      case 'error.sessionExpired':
        return 'Mã xác thực OTP hoặc phiên tra cứu đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.';
      case 'ORDER_ACCESS_DENIED':
      case 'error.orderAccessDenied':
        return 'Bạn không có quyền truy cập vào thông tin đơn hàng này.';
      default:
        return fallback;
    }
  }
}
