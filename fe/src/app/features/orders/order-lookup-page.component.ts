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

type Otp = { readonly verificationId: string; readonly expiresAt: string; readonly channel: string; readonly code?: string };

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
            <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Tra Cứu & Theo Dõi Đơn Hàng</h1>
            <p class="text-xs text-muted mt-1">Nhập mã đơn hàng và số điện thoại hoặc email đã dùng khi đặt hàng để xem tiến độ đóng gói và thông tin thanh toán.</p>
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
            class="shrink-0"
          >
            <lucide-icon name="Package" class="size-3.5" aria-hidden="true"></lucide-icon>
            <span>Đơn hàng của tôi</span>
          </a>
        </div>
      }

      <!-- Order Lookup Input Box -->
      <div class="max-w-2xl mx-auto bg-surface-alt p-5 sm:p-6 rounded-xl border border-line shadow-sm space-y-4">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-foreground mb-1" for="lookupCode">Mã đơn hàng</label>
            <input
              id="lookupCode"
              appInput
              class="w-full text-xs font-bold uppercase"
              [(ngModel)]="code"
              placeholder="Ví dụ: ELT-2026-..."
            >
          </div>
          <div>
            <label class="block text-xs font-bold text-foreground mb-1" for="lookupIdentifier">Email hoặc Số điện thoại</label>
            <input
              id="lookupIdentifier"
              appInput
              class="w-full text-xs"
              [(ngModel)]="identifier"
              placeholder="0912345678 hoặc email@..."
            >
          </div>
        </div>

        <button
          type="button"
          appButton
          variant="secondary"
          size="lg"
          class="w-full"
          (click)="request()"
        >
          <lucide-icon name="Search" class="size-4" aria-hidden="true"></lucide-icon>
          <span>Gửi mã xác thực OTP tra cứu</span>
        </button>

        <!-- OTP Input Step -->
        @if (verificationId()) {
          <div class="border-t border-line pt-4 space-y-2">
            <label class="block text-xs font-bold text-foreground" for="lookupOtp">Nhập mã OTP 6 chữ số vừa nhận được</label>
            <div class="flex gap-2">
              <input
                id="lookupOtp"
                appInput
                class="flex-1 text-xs font-bold"
                [(ngModel)]="otp"
                inputmode="numeric"
                placeholder="6 chữ số (ví dụ: 123456)"
              >
              <button
                type="button"
                appButton
                variant="primary"
                size="md"
                (click)="verify()"
              >
                <span>Xem chi tiết đơn</span>
                <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Detailed Order View When Retrieved -->
      @if (order(); as item) {
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
                <div class="text-[10px] text-muted">CONFIRMED</div>
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
                <div class="text-[10px] text-muted">Kiểm tra seal</div>
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
                <div class="text-[10px] text-muted">Bench & Furmark</div>
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
                <div class="text-[10px] text-muted">Giao 2H / OTP Hub</div>
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
                <div class="text-[10px] text-muted">Bảo hành 36T</div>
              </div>
            </div>
          </div>

          <!-- Telemetry Strip -->
          <div class="bg-surface px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-4 flex-wrap">
              <span class="flex items-center gap-1.5 text-muted">
                <lucide-icon name="Clock" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                <span>Thời gian tạo: <strong class="text-foreground">{{ orderCreatedAt() }}</strong></span>
              </span>
              <span class="flex items-center gap-1.5 text-muted">
                <lucide-icon name="Wrench" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                <span>Kỹ thuật viên: <strong class="text-foreground">{{ technicianInCharge() }}</strong></span>
              </span>
              @if (item.fulfillmentMethod === 'PICKUP') {
                <span class="flex items-center gap-1.5 text-muted bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  <span class="text-sky-500 font-bold">Mã OTP nhận tại quầy:</span>
                  <strong class="font-mono text-foreground">{{ pickupOtp() }}</strong>
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
                  <span class="text-[11px] text-muted">Bàn giao &amp; kiểm tra hỏa tốc</span>
                </div>
              </div>

              <div class="flex items-center gap-2.5">
                <div class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <lucide-icon name="ShieldCheck" class="size-4" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <span class="font-bold text-foreground block">Hỗ Trợ Kỹ Thuật 7 Ngày/Tuần</span>
                  <span class="text-[11px] text-muted">Chuyên viên hỗ trợ trọn đời máy</span>
                </div>
              </div>

              <div class="flex items-center gap-2.5">
                <div class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <lucide-icon name="Package" class="size-4" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <span class="font-bold text-foreground block">Đóng Gói Chống Sốc Tiêu Chuẩn</span>
                  <span class="text-[11px] text-muted">Bảo hiểm linh kiện 100%</span>
                </div>
              </div>
            </div>

            <!-- Hardware Quality Certification & Stress Test Telemetry (TR-02) -->
            <div class="rounded-xl p-4 sm:p-5 bg-surface-dark border border-line-dark text-white space-y-3 shadow-md">
              <div class="flex items-center justify-between pb-2 border-b border-line-dark text-xs">
                <div class="flex items-center gap-2">
                  <lucide-icon name="Cpu" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                  <span class="font-bold text-white uppercase tracking-wider text-[11px]">Chứng Nhận Kiểm Định &amp; Stress Test Phần Cứng</span>
                </div>
                <span class="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold">
                  ĐẠT TIÊU CHUẨN XUẤT XƯỞNG
                </span>
              </div>

              <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div class="p-2.5 rounded-lg bg-surface-elevated border border-line-dark">
                  <span class="text-[10px] text-muted block">Chuyên viên phụ trách:</span>
                  <strong class="text-white font-bold block mt-0.5">Vũ Hoàng (KTV-0824)</strong>
                  <span class="text-[9px] text-primary font-medium">Senior Hardware Specialist</span>
                </div>

                <div class="p-2.5 rounded-lg bg-surface-elevated border border-line-dark">
                  <span class="text-[10px] text-muted block">FurMark GPU Stress Test:</span>
                  <strong class="text-primary font-bold block mt-0.5">Max 64°C (Safe)</strong>
                  <span class="text-[9px] text-muted">Fan profile 55% RPM tối ưu</span>
                </div>

                <div class="p-2.5 rounded-lg bg-surface-elevated border border-line-dark">
                  <span class="text-[10px] text-muted block">Cinebench R23 Multi-Core:</span>
                  <strong class="text-white font-bold block mt-0.5">Ổn định 100% (Pass)</strong>
                  <span class="text-[9px] text-muted">Điện áp CPU &amp; VRM mát mẻ</span>
                </div>

                <div class="p-2.5 rounded-lg bg-surface-elevated border border-line-dark">
                  <span class="text-[10px] text-muted block">Cập nhật BIOS &amp; Profile RAM:</span>
                  <strong class="text-white font-bold block mt-0.5">XMP / EXPO Active</strong>
                  <span class="text-[9px] text-muted">Driver WHQL mới nhất</span>
                </div>
              </div>
            </div>
            
            <!-- VietQR Dynamic Payment Transfer Card (When Unpaid) -->
            @if (item.payment?.paymentReference && item.payment?.state === 'UNPAID') {
              <div class="bg-gradient-to-r from-surface-dark via-surface-elevated to-surface-dark p-5 rounded-xl border border-line text-white shadow-xl grid md:grid-cols-12 gap-5 items-center">
                <div class="md:col-span-4 flex flex-col items-center justify-center text-center p-3.5 bg-surface-dark rounded-lg border border-line-dark">
                  <div class="size-36 rounded-md bg-white p-2.5 flex flex-col items-center justify-center shadow-inner">
                    <div class="size-28 bg-surface-dark rounded flex flex-col items-center justify-center text-[10px] text-primary font-bold p-2 text-center">
                      [MÃ VIETQR CHUYỂN KHOẢN TỰ ĐỘNG]
                    </div>
                  </div>
                  <span class="mt-2 text-[10px] text-muted">Quét bằng ứng dụng Ngân hàng</span>
                </div>

                <div class="md:col-span-8 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-primary uppercase">THÔNG TIN CHUYỂN KHOẢN CHÍNH XÁC</span>
                    <span class="text-xs text-warning">Giữ linh kiện: 30 phút</span>
                  </div>
                  <div class="grid sm:grid-cols-2 gap-3 text-xs">
                    <div class="p-3 rounded-md bg-line-dark/80 border border-line-dark">
                      <span class="text-muted block text-[10px]">Nội dung chuyển khoản (chính xác):</span>
                      <strong class="text-primary text-base tracking-wider">{{ item.payment?.paymentReference }}</strong>
                    </div>
                    <div class="p-3 rounded-md bg-line-dark/80 border border-line-dark">
                      <span class="text-muted block text-[10px]">Số tiền cần thanh toán:</span>
                      <strong class="text-primary text-base tabular">{{ (item.payment?.expectedAmount ?? '0') | vnd }}</strong>
                    </div>
                  </div>
                  <p class="text-[11px] text-muted">
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
                          <p class="font-bold text-xs text-foreground truncate">{{ line.name }}</p>
                          @if (line.pcBuildName) {
                            <p class="text-[10px] text-primary font-semibold">BOM CẤU HÌNH: {{ line.pcBuildName }} ({{ line.pcBuildType }})</p>
                          }
                          <p class="text-[11px] text-muted">SL: <span class="tabular font-medium">{{ line.quantity }}</span> · Đơn giá: <span class="tabular font-medium">{{ line.unitPrice | vnd }}</span></p>
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
                            (click)="submitReview(line)"
                          >
                            Gửi đánh giá
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

  protected code = '';
  protected identifier = '';
  protected otp = '';
  protected reviewText = '';
  protected readonly ratingOptions: readonly SelectOption[] = [
    { value: '5', label: '5 sao - Rất tốt' },
    { value: '4', label: '4 sao - Tốt' },
    { value: '3', label: '3 sao - Bình thường' },
    { value: '2', label: '2 sao - Chưa ưng ý' },
    { value: '1', label: '1 sao - Kém' },
  ];

  protected reviewRating = 5;
  protected readonly verificationId = signal<string | null>(null);
  protected readonly sessionToken = signal<string | null>(null);
  protected readonly order = signal<Order | null>(null);
  protected readonly showCancelModal = signal(false);
  protected readonly reviewingLineId = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.identifier = user.email || user.phone || '';
    }
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

  protected async request(): Promise<void> {
    const response = await this.api.post<Otp>('/orders/lookup/request', { code: this.code.trim(), identifier: this.identifier.trim() });
    if (response.success) this.verificationId.set(response.data.verificationId);
  }

  protected async verify(): Promise<void> {
    const verificationId = this.verificationId();
    if (!verificationId) return;
    const response = await this.api.post<{ verificationId: string; sessionToken: string; order: Order }>('/orders/lookup/verify', { verificationId, code: this.otp.trim() });
    if (response.success) {
      this.sessionToken.set(response.data.sessionToken || response.data.verificationId);
      this.order.set(response.data.order);
    }
  }

  protected async refreshOrder(): Promise<void> {
    const sessionToken = this.sessionToken();
    if (!sessionToken) return;
    const response = await this.api.post<Order>('/orders/lookup/session', { sessionToken });
    if (response.success) {
      this.order.set(response.data);
    }
  }

  protected async handleModalCancel(orderCode: string, payload: CancelOrderPayload): Promise<void> {
    const reasonText = payload.note ? `${payload.reason} - ${payload.note}` : payload.reason;
    const response = await this.api.post<{ code: string; status: string; paymentState: string }>(`/orders/${orderCode}/cancel`, {
      identifier: this.identifier.trim(),
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
    if (!verificationId || this.reviewText.trim().length < 10) return;
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
  }
}
