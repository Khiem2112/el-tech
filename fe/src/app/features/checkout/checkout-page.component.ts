import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiClientService } from '../../core/api/api-client.service';
import { createIdempotencyKey } from '../../core/api/idempotency';
import { CartService } from '../../services/cart.service';
import { VndPipe } from '../../lib/vnd.pipe';

type Otp = { readonly verificationId: string; readonly expiresAt: string };
type Quote = { readonly subtotal: string; readonly shippingFee: string; readonly grandTotal: string; readonly branches: readonly { id: number; name: string; available: boolean }[] };
type SubmitResult = { readonly code: string; readonly status: string; readonly paymentState: string; readonly paymentReference?: string; readonly expectedAmount?: string };

@Component({
  selector: 'app-checkout-page',
  imports: [FormsModule, RouterLink, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="mx-auto max-w-3xl px-4 py-10 sm:px-6"><h1 class="text-3xl font-extrabold">Checkout</h1><p class="mt-2 text-muted">Xác minh email và số điện thoại trước khi tạo báo giá.</p><div class="mt-8 space-y-5 rounded-2xl border border-line bg-surface p-6"><label class="block"><span class="font-bold">Người nhận</span><input class="mt-2 w-full rounded-lg border border-line p-3" [(ngModel)]="name" placeholder="Nguyễn Văn A"></label><label class="block"><span class="font-bold">Email</span><input class="mt-2 w-full rounded-lg border border-line p-3" [(ngModel)]="email" type="email" placeholder="example@domain.com"><button type="button" class="mt-2 text-sm font-bold text-primary" (click)="request('EMAIL', email)">Gửi mã email</button></label><label class="block"><span class="font-bold">Số điện thoại</span><input class="mt-2 w-full rounded-lg border border-line p-3" [(ngModel)]="phone" type="tel" placeholder="0912345678"><button type="button" class="mt-2 text-sm font-bold text-primary" (click)="request('PHONE', phone)">Gửi mã SMS</button></label>@if (pending(); as current) { <div class="rounded-xl bg-surface-alt p-4"><p class="font-bold">Nhập mã xác thực {{ current.type === 'EMAIL' ? 'email' : 'SMS' }}</p><input class="mt-3 rounded-lg border border-line p-3" [(ngModel)]="code" inputmode="numeric" placeholder="6 chữ số"><button type="button" class="ml-2 rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground" (click)="verify()">Xác minh</button></div> }<label class="block"><span class="font-bold">Phương thức nhận hàng</span><select class="mt-2 w-full rounded-lg border border-line p-3" [(ngModel)]="fulfillment"><option value="PICKUP">Nhận tại chi nhánh</option><option value="DELIVERY">Giao hàng tận nơi</option></select></label>@if (fulfillment === 'DELIVERY') { <label class="block"><span class="font-bold">Địa chỉ giao hàng</span><textarea class="mt-2 w-full rounded-lg border border-line p-3" [(ngModel)]="deliveryAddress" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"></textarea></label> }<label class="block"><span class="font-bold">Phương thức thanh toán</span><select class="mt-2 w-full rounded-lg border border-line p-3" [(ngModel)]="paymentMethod"><option value="QR">Chuyển khoản QR (Giữ linh kiện ngay)</option><option value="COD">Thanh toán khi nhận hàng (COD)</option></select></label>@if (paymentMethod === 'COD') { <div class="rounded-xl bg-surface-alt p-4 text-xs text-muted"><p class="font-bold text-foreground">Lưu ý về đơn hàng COD</p><p class="mt-1">Đối với cấu hình PC tự chọn (Custom Build), quý khách cần thanh toán tiền cọc qua mã QR để cửa hàng bắt đầu chuẩn bị linh kiện.</p></div> }<button type="button" class="rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground disabled:opacity-50" [disabled]="!emailVerificationId() || !phoneVerificationId()" (click)="quote()">Xem báo giá</button></div>@if (quoteResult(); as quote) { <section class="mt-6 rounded-2xl border border-line bg-surface p-6"><h2 class="text-xl font-extrabold">Báo giá xác nhận</h2><p class="mt-4 flex justify-between"><span>Tạm tính linh kiện</span><span>{{ quote.subtotal | vnd }}</span></p><p class="mt-2 flex justify-between"><span>Phí giao hàng</span><span>{{ quote.shippingFee | vnd }}</span></p><p class="mt-4 flex justify-between border-t border-line pt-4 text-xl font-extrabold"><span>Tổng thanh toán</span><span>{{ quote.grandTotal | vnd }}</span></p>@if (fulfillment === 'PICKUP') { <label class="mt-5 block"><span class="font-bold">Chọn chi nhánh nhận hàng</span><select class="mt-2 w-full rounded-lg border border-line p-3" [(ngModel)]="branchId"><option [ngValue]="null">Chọn chi nhánh</option>@for (branch of quote.branches; track branch.id) { <option [ngValue]="branch.id" [disabled]="!branch.available">{{ branch.name }}{{ branch.available ? '' : ' (Hết linh kiện)' }}</option> }</select></label> } @else { <div class="mt-5 rounded-xl bg-surface-alt p-4 text-sm"><p class="font-bold text-foreground">Điều phối giao hàng</p><p class="mt-1 text-muted">Hệ thống sẽ tự động chọn chi nhánh còn đủ linh kiện để giao nhanh nhất đến địa chỉ của bạn.</p></div> }<button type="button" class="mt-5 rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground disabled:opacity-50" [disabled]="submitting() || (fulfillment === 'PICKUP' && !branchId)" (click)="submit()">{{ submitting() ? 'Đang tạo đơn hàng…' : 'Xác nhận tạo đơn' }}</button></section> }@if (orderResult(); as order) { <section class="mt-6 rounded-2xl border border-success/30 bg-success/10 p-5"><h2 class="font-extrabold text-success">Đã tạo đơn hàng thành công: {{ order.code }}</h2><p class="mt-2 text-sm">Trạng thái đơn: <strong>{{ order.status }}</strong> · Thanh toán: <strong>{{ order.paymentState }}</strong></p>@if (order.paymentReference) { <div class="mt-4 rounded-xl border border-line bg-surface p-4 text-sm"><p class="font-bold">Thông tin thanh toán QR</p><p class="mt-1">Mã nội dung: <strong>{{ order.paymentReference }}</strong></p><p class="mt-1">Số tiền: <strong>{{ (order.expectedAmount ?? '0') | vnd }}</strong></p><p class="mt-2 text-xs text-muted">Quý khách có 30 phút để hoàn tất chuyển khoản trước khi đơn hàng hết hạn.</p></div> }<a routerLink="/tra-cuu-don" class="mt-4 inline-flex font-bold text-primary">Xem chi tiết đơn hàng trong mục Tra cứu</a></section> }<a routerLink="/gio-hang" class="mt-5 inline-flex font-bold text-primary">Quay lại giỏ hàng</a></section>`,
})
export class CheckoutPageComponent {
  private readonly api = inject(ApiClientService);
  private readonly cart = inject(CartService);
  protected name = '';
  protected email = '';
  protected phone = '';
  protected code = '';
  protected fulfillment: 'PICKUP' | 'DELIVERY' = 'PICKUP';
  protected paymentMethod: 'QR' | 'COD' = 'QR';
  protected deliveryAddress = '';
  protected branchId: number | null = null;
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
      if (response.success) this.orderResult.set(response.data);
    } finally {
      this.submitting.set(false);
    }
  }
}
