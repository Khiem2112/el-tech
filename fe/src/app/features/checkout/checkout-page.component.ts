import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

type Otp = { readonly verificationId: string; readonly expiresAt: string };
type Quote = { readonly subtotal: string; readonly shippingFee: string; readonly grandTotal: string; readonly branches: readonly { id: number; name: string; available: boolean }[] };
type SubmitResult = { readonly code: string; readonly status: string; readonly paymentState: string; readonly paymentReference?: string; readonly expectedAmount?: string };

@Component({
  selector: 'app-checkout-page',
  imports: [FormsModule, RouterLink, VndPipe, ButtonDirective, BadgeDirective, InputDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Breadcrumbs & Stepper Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <nav class="text-xs text-muted mb-1">
            <a routerLink="/" class="hover:text-foreground">Trang chủ</a> / 
            <a routerLink="/gio-hang" class="hover:text-foreground">Giỏ hàng</a> / 
            <span class="text-foreground font-bold">Thanh toán</span>
          </nav>
          <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Thanh Toán Đơn Hàng</h1>
          <p class="text-xs text-muted mt-1">Xác minh thông tin liên hệ và phương thức nhận hàng để bảo đảm quyền lợi bảo hành.</p>
        </div>

        <div class="hidden sm:flex items-center gap-2 text-xs">
          <span appBadge variant="dark">Giỏ hàng</span>
          <lucide-icon name="ChevronRight" class="size-3 text-muted" aria-hidden="true"></lucide-icon>
          <span appBadge variant="primary">Thanh toán</span>
          <lucide-icon name="ChevronRight" class="size-3 text-muted" aria-hidden="true"></lucide-icon>
          <span appBadge variant="dark">Hoàn tất</span>
        </div>
      </div>

      <!-- Order Result State When Submitted -->
      @if (orderResult(); as order) {
        <div class="mt-8 bg-surface rounded-xl border border-line p-6 sm:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <span appBadge variant="primary" class="font-bold">
                MÃ ĐƠN: {{ order.code }}
              </span>
              <h2 class="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-2">Đặt Hàng Thành Công!</h2>
            </div>
            <div class="text-right">
              <span appBadge variant="success">
                TRẠNG THÁI: {{ order.status }}
              </span>
            </div>
          </div>

          <p class="text-xs text-muted">
            Đơn hàng của bạn đã được ghi nhận vào hệ thống. Thông tin chi tiết bảo hành và cập nhật tiến độ vận chuyển đã được gửi tới email và số điện thoại của bạn.
          </p>

          <!-- VietQR payment transfer card -->
          @if (order.paymentReference) {
            <div class="bg-gradient-to-r from-surface-dark via-surface-elevated to-surface-dark p-5 rounded-xl border border-line text-white shadow-xl space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-primary uppercase">THÔNG TIN CHUYỂN KHOẢN VIETQR</span>
                <span class="text-xs text-warning">Thời gian giữ hàng: 30 phút</span>
              </div>

              <div class="grid sm:grid-cols-2 gap-3 text-xs">
                <div class="p-3 rounded-md bg-line-dark/80 border border-line-dark">
                  <span class="text-muted block text-[10px]">Nội dung chuyển khoản (chính xác):</span>
                  <strong class="text-primary text-base tracking-wider">{{ order.paymentReference }}</strong>
                </div>
                <div class="p-3 rounded-md bg-line-dark/80 border border-line-dark">
                  <span class="text-muted block text-[10px]">Số tiền cần thanh toán:</span>
                  <strong class="text-primary text-base tabular">{{ (order.expectedAmount ?? '0') | vnd }}</strong>
                </div>
              </div>
              <p class="text-[11px] text-muted">
                Hệ thống ngân hàng liên kết sẽ tự động kiểm tra nội dung và đổi trạng thái đơn sang ĐÃ THANH TOÁN trong vòng 1-2 phút sau khi giao dịch thành công.
              </p>
            </div>
          }

          <div class="flex flex-wrap gap-3 pt-2">
            <a routerLink="/tra-cuu-don" appButton variant="primary" size="lg">
              <span>Tra cứu & theo dõi tiến trình đơn hàng</span>
              <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
            </a>
            <a routerLink="/san-pham" appButton variant="secondary" size="lg">
              <span>Tiếp tục mua linh kiện khác</span>
            </a>
          </div>
        </div>
      } @else {
        <div class="grid lg:grid-cols-12 gap-8 mt-8">
          
          <!-- Left Forms Column (Col 7) -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Customer Contact & OTP Verification -->
            <div class="bg-surface p-5 rounded-xl border border-line shadow-sm space-y-4">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <div class="flex items-center gap-2.5">
                  <div class="size-6 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <lucide-icon name="Mail" class="size-3.5" aria-hidden="true"></lucide-icon>
                  </div>
                  <h2 class="font-bold text-sm text-foreground">Thông Tin Khách Hàng & Xác Thực Liên Hệ</h2>
                </div>
                <span appBadge variant="outline" class="text-[10px] text-primary border-primary/30">BẮT BUỘC</span>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-foreground mb-1">Họ và tên người nhận</label>
                  <input
                    appInput
                    class="w-full text-xs font-medium"
                    [(ngModel)]="name"
                    placeholder="Ví dụ: Nguyễn Văn An"
                  >
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <!-- Email & Verification -->
                  <div>
                    <label class="block text-xs font-bold text-foreground mb-1">Email nhận thông báo</label>
                    <div class="flex gap-2">
                      <input
                        appInput
                        class="flex-1 text-xs"
                        [(ngModel)]="email"
                        type="email"
                        placeholder="example@domain.com"
                      >
                      <button
                        type="button"
                        appButton
                        variant="secondary"
                        size="md"
                        (click)="request('EMAIL', email)"
                        class="whitespace-nowrap"
                      >
                        Gửi OTP
                      </button>
                    </div>
                    @if (emailVerificationId()) {
                      <span class="inline-block mt-1 text-[10px] text-primary font-bold">[Email đã xác minh thành công]</span>
                    } @else {
                      <span class="inline-block mt-1 text-[10px] text-muted">Nhấn Gửi OTP để nhận mã 6 chữ số</span>
                    }
                  </div>

                  <!-- Phone & Verification -->
                  <div>
                    <label class="block text-xs font-bold text-foreground mb-1">Số điện thoại liên hệ</label>
                    <div class="flex gap-2">
                      <input
                        appInput
                        class="flex-1 text-xs"
                        [(ngModel)]="phone"
                        type="tel"
                        placeholder="0912 345 678"
                      >
                      <button
                        type="button"
                        appButton
                        variant="secondary"
                        size="md"
                        (click)="request('PHONE', phone)"
                        class="whitespace-nowrap"
                      >
                        Gửi SMS
                      </button>
                    </div>
                    @if (phoneVerificationId()) {
                      <span class="inline-block mt-1 text-[10px] text-primary font-bold">[Số điện thoại đã xác minh]</span>
                    } @else {
                      <span class="inline-block mt-1 text-[10px] text-muted">Nhấn Gửi SMS để nhận mã 6 chữ số</span>
                    }
                  </div>
                </div>

                <!-- OTP Input Box When Requested -->
                @if (pending(); as current) {
                  <div class="rounded-lg bg-surface-alt p-3.5 border border-line space-y-2">
                    <p class="font-bold text-xs text-foreground">
                      Nhập mã xác thực gửi tới {{ current.type === 'EMAIL' ? 'Email' : 'Số điện thoại' }}
                    </p>
                    <div class="flex gap-2">
                      <input
                        appInput
                        class="flex-1 text-xs font-bold"
                        [(ngModel)]="code"
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
                        Xác minh
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Fulfillment Method -->
            <div class="bg-surface p-5 rounded-xl border border-line shadow-sm space-y-4">
              <div class="flex items-center gap-2.5 border-b border-line pb-3">
                <div class="size-6 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <lucide-icon name="Truck" class="size-3.5" aria-hidden="true"></lucide-icon>
                </div>
                <h2 class="font-bold text-sm text-foreground">Phương Thức Nhận Hàng</h2>
              </div>

              <div class="grid sm:grid-cols-2 gap-3">
                <label
                  class="p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-all"
                  [class.border-primary]="fulfillment === 'DELIVERY'"
                  [class.bg-primary/5]="fulfillment === 'DELIVERY'"
                  [class.border-line]="fulfillment !== 'DELIVERY'"
                >
                  <input
                    type="radio"
                    name="fulfillment_method"
                    value="DELIVERY"
                    [(ngModel)]="fulfillment"
                    class="mt-0.5 text-primary focus:ring-primary"
                  >
                  <div>
                    <span class="font-bold text-xs text-foreground block">Giao hàng tận nơi</span>
                    <span class="text-[11px] text-muted mt-0.5 block leading-relaxed">Hỏa tốc nội thành hoặc chuyển phát bảo hiểm toàn quốc.</span>
                  </div>
                </label>

                <label
                  class="p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-all"
                  [class.border-primary]="fulfillment === 'PICKUP'"
                  [class.bg-primary/5]="fulfillment === 'PICKUP'"
                  [class.border-line]="fulfillment !== 'PICKUP'"
                >
                  <input
                    type="radio"
                    name="fulfillment_method"
                    value="PICKUP"
                    [(ngModel)]="fulfillment"
                    class="mt-0.5 text-primary focus:ring-primary"
                  >
                  <div>
                    <span class="font-bold text-xs text-foreground block">Nhận tại chi nhánh</span>
                    <span class="text-[11px] text-muted mt-0.5 block leading-relaxed">Nhận hàng và kiểm tra linh kiện trực tiếp tại cửa hàng.</span>
                  </div>
                </label>
              </div>

              <!-- Address Field For Delivery -->
              @if (fulfillment === 'DELIVERY') {
                <div class="pt-1">
                  <label class="block text-xs font-bold text-foreground mb-1">Địa chỉ nhận hàng chi tiết</label>
                  <textarea
                    appInput
                    rows="2"
                    class="w-full text-xs leading-relaxed"
                    [(ngModel)]="deliveryAddress"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  ></textarea>
                </div>
              }
            </div>

            <!-- Payment Method -->
            <div class="bg-surface p-5 rounded-xl border border-line shadow-sm space-y-4">
              <div class="flex items-center gap-2.5 border-b border-line pb-3">
                <div class="size-6 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <lucide-icon name="CreditCard" class="size-3.5" aria-hidden="true"></lucide-icon>
                </div>
                <h2 class="font-bold text-sm text-foreground">Phương Thức Thanh Toán</h2>
              </div>

              <div class="space-y-3">
                <label
                  class="p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-all"
                  [class.border-primary]="paymentMethod === 'QR'"
                  [class.bg-primary/5]="paymentMethod === 'QR'"
                  [class.border-line]="paymentMethod !== 'QR'"
                >
                  <input
                    type="radio"
                    name="payment_choice"
                    value="QR"
                    [(ngModel)]="paymentMethod"
                    class="mt-0.5 text-primary focus:ring-primary"
                  >
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-xs text-foreground">Chuyển khoản VietQR tự động (Khuyên dùng)</span>
                      <span appBadge variant="primary" class="text-[10px]">GIỮ HÀNG NGAY</span>
                    </div>
                    <p class="text-[11px] text-muted mt-1 leading-relaxed">
                      Mã QR động chứa sẵn số tiền và mã đơn. Hệ thống tự động kích hoạt trạng thái Đã Thanh Toán trong 30 giây.
                    </p>
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
                    name="payment_choice"
                    value="COD"
                    [(ngModel)]="paymentMethod"
                    class="mt-0.5 text-primary focus:ring-primary"
                  >
                  <div class="flex-1">
                    <span class="font-bold text-xs text-foreground block">Thanh toán khi nhận hàng (COD)</span>
                    <p class="text-[11px] text-muted mt-1 leading-relaxed">
                      Nhận hàng, đồng kiểm cùng shipper rồi thanh toán bằng tiền mặt.
                    </p>
                  </div>
                </label>
              </div>

              @if (paymentMethod === 'COD') {
                <div class="rounded-md bg-surface-alt p-3 text-xs text-muted border border-line">
                  <p class="font-bold text-foreground">Lưu ý về đơn hàng COD</p>
                  <p class="mt-0.5 leading-relaxed">Đối với cấu hình PC tự chọn (Custom Build), quý khách cần thanh toán tiền cọc qua mã QR để cửa hàng bắt đầu chuẩn bị linh kiện.</p>
                </div>
              }
            </div>

            <!-- VAT Red Invoice Option -->
            <div class="bg-surface p-5 rounded-xl border border-line shadow-sm space-y-3">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                <input
                  type="checkbox"
                  [(ngModel)]="requestVat"
                  class="rounded border-line text-primary focus:ring-primary"
                >
                <span>Yêu cầu xuất hóa đơn đỏ giá trị gia tăng (VAT 10%)</span>
              </label>

              @if (requestVat) {
                <div class="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label class="block text-[11px] font-bold text-foreground mb-1">Mã số thuế (MST) *</label>
                    <input appInput class="w-full text-xs" [(ngModel)]="vatTaxCode" placeholder="Ví dụ: 0101234567">
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-foreground mb-1">Tên công ty / Doanh nghiệp *</label>
                    <input appInput class="w-full text-xs" [(ngModel)]="vatCompanyName" placeholder="Công ty TNHH Giải Pháp...">
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-[11px] font-bold text-foreground mb-1">Địa chỉ trụ sở doanh nghiệp *</label>
                    <input appInput class="w-full text-xs" [(ngModel)]="vatAddress" placeholder="Địa chỉ theo giấy phép kinh doanh...">
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-[11px] font-bold text-foreground mb-1">Email nhận hóa đơn điện tử *</label>
                    <input appInput class="w-full text-xs" [(ngModel)]="vatEmail" placeholder="ketoan@company.com">
                  </div>
                </div>
              }
            </div>

          </div>

          <!-- Right Column: Quote & Confirmation Review (Col 5) -->
          <div class="lg:col-span-5 space-y-4">
            
            <div class="bg-surface-alt p-5 rounded-xl border border-line shadow-sm space-y-4 sticky top-24">
              <h2 class="text-sm font-bold text-foreground border-b border-line pb-3">Đối Soát Báo Giá & Tạo Đơn</h2>

              <!-- Branch Selector if PICKUP and Quote exists -->
              @if (quoteResult(); as quote) {
                <div class="space-y-2.5 border-b border-line pb-4">
                  <div class="flex justify-between text-xs text-muted">
                    <span>Tạm tính linh kiện:</span>
                    <span class="font-bold text-foreground tabular">{{ quote.subtotal | vnd }}</span>
                  </div>
                  <div class="flex justify-between text-xs text-muted">
                    <span>Phí vận chuyển:</span>
                    <span class="font-semibold text-primary">{{ quote.shippingFee | vnd }}</span>
                  </div>
                  <div class="flex justify-between text-sm font-black text-foreground pt-2 border-t border-line">
                    <span>Tổng tiền thanh toán:</span>
                    <span class="text-primary tabular text-base">{{ quote.grandTotal | vnd }}</span>
                  </div>

                  @if (fulfillment === 'PICKUP') {
                    <div class="pt-2">
                      <label class="block text-xs font-bold text-foreground mb-1">Chọn chi nhánh nhận linh kiện</label>
                      <select appInput class="w-full text-xs" [(ngModel)]="branchId">
                        <option [ngValue]="null">Vui lòng chọn chi nhánh</option>
                        @for (branch of quote.branches; track branch.id) {
                          <option [ngValue]="branch.id" [disabled]="!branch.available">
                            {{ branch.name }}{{ branch.available ? '' : ' (Hết linh kiện)' }}
                          </option>
                        }
                      </select>
                    </div>
                  }
                </div>

                <!-- Submit Button -->
                <button
                  type="button"
                  appButton
                  variant="primary"
                  size="lg"
                  class="w-full"
                  [disabled]="submitting() || (fulfillment === 'PICKUP' && !branchId) || (fulfillment === 'DELIVERY' && !deliveryAddress.trim())"
                  (click)="submit()"
                >
                  <span>{{ submitting() ? 'Đang tạo đơn hàng…' : 'Xác nhận tạo đơn hàng' }}</span>
                  <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
                </button>
              } @else {
                <!-- Button to generate official quote -->
                <p class="text-xs text-muted leading-relaxed">
                  Vui lòng hoàn tất xác thực email và số điện thoại ở bước 1 để tạo báo giá khóa cố định tồn kho và phí giao hàng.
                </p>
                <button
                  type="button"
                  appButton
                  variant="primary"
                  size="lg"
                  class="w-full"
                  [disabled]="!emailVerificationId() || !phoneVerificationId()"
                  (click)="quote()"
                >
                  <span>Tạo báo giá chính thức</span>
                  <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
                </button>
              }

              <!-- Return to cart link -->
              <div class="pt-1 text-center">
                <a routerLink="/gio-hang" class="text-xs font-bold text-primary hover:underline">« Quay lại chỉnh sửa giỏ hàng</a>
              </div>
            </div>

          </div>

        </div>
      }
    </section>
  `,
})
export class CheckoutPageComponent {
  private readonly api = inject(ApiClientService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  protected name = '';
  protected email = '';
  protected phone = '';
  protected code = '';
  protected fulfillment: 'PICKUP' | 'DELIVERY' = 'PICKUP';
  protected paymentMethod: 'QR' | 'COD' = 'QR';
  protected deliveryAddress = '';
  protected branchId: number | null = null;
  protected requestVat = false;
  protected vatTaxCode = '';
  protected vatCompanyName = '';
  protected vatAddress = '';
  protected vatEmail = '';

  protected readonly pending = signal<{ type: 'EMAIL' | 'PHONE'; otp: Otp } | null>(null);
  protected readonly emailVerificationId = signal<string | null>(null);
  protected readonly phoneVerificationId = signal<string | null>(null);
  protected readonly quoteResult = signal<Quote | null>(null);
  protected readonly orderResult = signal<SubmitResult | null>(null);
  protected readonly submitting = signal(false);

  protected async request(type: 'EMAIL' | 'PHONE', identifier: string): Promise<void> {
    const response = await this.api.post<Otp>('/checkout/otp', { contactType: type, identifier });
    if (response.success) this.pending.set({ type, otp: response.data });
  }

  protected async verify(): Promise<void> {
    const pending = this.pending();
    if (!pending) return;
    const response = await this.api.post<{ verifiedAt: string }>('/checkout/otp/verify', { verificationId: pending.otp.verificationId, code: this.code });
    if (response.success) {
      if (pending.type === 'EMAIL') this.emailVerificationId.set(pending.otp.verificationId);
      else this.phoneVerificationId.set(pending.otp.verificationId);
      this.pending.set(null);
      this.code = '';
    }
  }

  protected async quote(): Promise<void> {
    const cartToken = this.cart.cartToken();
    if (!cartToken) await this.cart.load();
    const token = this.cart.cartToken();
    if (!token) return;
    const response = await this.api.post<Quote>('/checkout/quote', { cartToken: token, fulfillmentMethod: this.fulfillment });
    if (response.success) {
      this.quoteResult.set(response.data);
      this.branchId = response.data.branches.find((branch) => branch.available)?.id ?? null;
    }
  }

  protected async submit(): Promise<void> {
    const cartToken = this.cart.cartToken();
    const emailVerificationId = this.emailVerificationId();
    const phoneVerificationId = this.phoneVerificationId();
    if (!cartToken || !emailVerificationId || !phoneVerificationId) return;
    if (this.fulfillment === 'PICKUP' && !this.branchId) return;
    if (this.fulfillment === 'DELIVERY' && !this.deliveryAddress.trim()) return;

    this.submitting.set(true);
    try {
      const response = await this.api.post<SubmitResult>(
        '/checkout/submit',
        {
          cartToken,
          emailVerificationId,
          phoneVerificationId,
          receiverName: this.name,
          receiverEmail: this.email,
          receiverPhone: this.phone,
          fulfillmentMethod: this.fulfillment,
          branchId: this.fulfillment === 'PICKUP' ? (this.branchId ?? undefined) : undefined,
          paymentMethod: this.paymentMethod,
          deliveryAddress: this.fulfillment === 'DELIVERY' ? this.deliveryAddress : undefined,
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
          deliveryAddress: this.deliveryAddress,
          paymentMethod: this.paymentMethod,
          paymentReference: response.data.paymentReference,
          expectedAmount: response.data.expectedAmount,
          grandTotal: this.quoteResult()?.grandTotal,
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
