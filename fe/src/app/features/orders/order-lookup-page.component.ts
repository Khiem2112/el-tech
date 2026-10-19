import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../core/api/api-client.service';
import { VndPipe } from '../../lib/vnd.pipe';

type OrderLine = {
  readonly id: string;
  readonly skuId: number | null;
  readonly sku: string | null;
  readonly name: string;
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
  imports: [FormsModule, VndPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="mx-auto max-w-3xl px-4 py-10 sm:px-6"><h1 class="text-3xl font-extrabold">Tra cứu đơn hàng</h1><p class="mt-2 text-muted">Nhập mã đơn và email hoặc số điện thoại đã dùng khi đặt hàng.</p><div class="mt-7 space-y-4 rounded-2xl border border-line bg-surface p-6"><input class="w-full rounded-lg border border-line p-3" [(ngModel)]="code" placeholder="Mã đơn ELT-..."><input class="w-full rounded-lg border border-line p-3" [(ngModel)]="identifier" placeholder="Email hoặc số điện thoại"><button type="button" class="rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground" (click)="request()">Gửi mã OTP</button>@if (verificationId()) { <div class="border-t border-line pt-4"><input class="rounded-lg border border-line p-3" [(ngModel)]="otp" inputmode="numeric" placeholder="Mã OTP 6 chữ số"><button type="button" class="ml-2 rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground" (click)="verify()">Xem thông tin đơn</button></div> }</div>@if (order(); as item) { <section class="mt-6 rounded-2xl border border-line bg-surface p-6"><div class="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4"><div><h2 class="text-2xl font-extrabold">Đơn hàng {{ item.code }}</h2><p class="mt-1 text-sm text-muted">Người nhận: {{ item.receiverName }} · {{ item.receiverPhone }}</p></div><div class="text-right"><p class="text-sm font-bold">Trạng thái: {{ item.status }}</p><p class="text-xs text-muted">Thanh toán: {{ item.payment?.state }}</p></div></div>@if (item.payment?.paymentReference && item.payment?.state === 'UNPAID') { <div class="mt-4 rounded-xl border border-line bg-surface-alt p-4"><p class="font-bold text-primary">Thông tin thanh toán chuyển khoản QR</p><p class="mt-1 text-sm">Mã tham chiếu: <strong>{{ item.payment?.paymentReference }}</strong></p><p class="mt-1 text-sm">Số tiền cần thanh toán: <strong>{{ (item.payment?.expectedAmount ?? '0') | vnd }}</strong></p><p class="mt-2 text-xs text-muted">Quý khách vui lòng chuyển khoản đúng số tiền và nội dung chuyển khoản để hệ thống tự động xác nhận đơn.</p></div> }<div class="mt-5 grid gap-4 sm:grid-cols-2 text-sm"><div class="rounded-xl border border-line p-4"><p class="font-bold">Phương thức nhận hàng</p><p class="mt-1 text-muted">{{ item.fulfillmentMethod === 'DELIVERY' ? 'Giao hàng tận nơi' : 'Nhận tại chi nhánh' }}</p>@if (item.fulfillmentMethod === 'DELIVERY') { <p class="mt-2 font-medium">Địa chỉ: {{ item.deliveryAddress }}</p> } @else if (item.branch) { <p class="mt-2 font-medium">Chi nhánh: {{ item.branch.name }} - {{ item.branch.address }}</p> }</div><div class="rounded-xl border border-line p-4"><p class="font-bold">Phương thức thanh toán</p><p class="mt-1 text-muted">{{ item.payment?.method === 'QR' ? 'Chuyển khoản QR' : 'Thanh toán COD' }}</p>@if (item.payment?.depositDisposition) { <p class="mt-1 text-xs">Trạng thái cọc: {{ item.payment?.depositDisposition }}</p> }<p class="mt-2 font-bold text-lg">Tổng cộng: {{ item.grandTotal | vnd }}</p></div></div><h3 class="mt-6 font-bold text-lg">Danh sách linh kiện</h3><div class="mt-3 divide-y divide-line rounded-xl border border-line">@for (line of item.lines; track line.id) { <div class="p-4"><div class="flex justify-between items-start"><div><p class="font-bold">{{ line.name }}</p>@if (line.pcBuildName) { <p class="text-xs text-primary font-semibold">Thuộc cấu hình: {{ line.pcBuildName }} ({{ line.pcBuildType }})</p> }<p class="text-xs text-muted">Số lượng: {{ line.quantity }} · Đơn giá: {{ line.unitPrice | vnd }}</p></div><span class="font-bold">{{ line.netAmount | vnd }}</span></div>@if (line.canReview && reviewingLineId() !== line.id) { <div class="mt-3"><button type="button" class="text-xs font-bold text-primary underline" (click)="openReview(line.id)">Viết đánh giá sản phẩm</button></div> }@if (reviewingLineId() === line.id) { <div class="mt-3 rounded-lg bg-surface-alt p-3 text-sm"><p class="font-bold">Đánh giá sản phẩm</p><div class="mt-2 flex items-center gap-2"><span class="text-xs">Số sao (1-5):</span><select class="rounded border border-line p-1" [(ngModel)]="reviewRating"><option [ngValue]="5">5 sao</option><option [ngValue]="4">4 sao</option><option [ngValue]="3">3 sao</option><option [ngValue]="2">2 sao</option><option [ngValue]="1">1 sao</option></select></div><textarea class="mt-2 w-full rounded border border-line p-2 text-sm" [(ngModel)]="reviewText" placeholder="Nhận xét chi tiết về chất lượng sản phẩm (tối thiểu 10 ký tự)..."></textarea><div class="mt-2 flex gap-2"><button type="button" class="rounded bg-primary px-3 py-1 text-xs font-bold text-primary-foreground" (click)="submitReview(line)">Gửi đánh giá</button><button type="button" class="rounded border border-line px-3 py-1 text-xs" (click)="reviewingLineId.set(null)">Hủy</button></div></div> }</div> }</div><div class="mt-4 flex justify-between border-t border-line pt-4 text-sm"><span class="text-muted">Tạm tính: {{ item.subtotal | vnd }} · Phí giao hàng: {{ item.shippingFee | vnd }}</span><span class="font-extrabold text-lg">Tổng: {{ item.grandTotal | vnd }}</span></div>@if (item.cancellable) { <div class="mt-6 rounded-xl border border-danger/30 bg-danger/5 p-4"><h3 class="font-bold text-danger">Hủy đơn hàng</h3><p class="mt-1 text-xs text-muted">Đơn hàng chưa qua giai đoạn chuẩn bị linh kiện nên quý khách có thể tự hủy.</p>@if (!showCancelConfirm()) { <button type="button" class="mt-3 rounded-lg border border-danger px-4 py-2 text-sm font-bold text-danger hover:bg-danger/10" (click)="showCancelConfirm.set(true)">Yêu cầu hủy đơn hàng</button> } @else { <div class="mt-3 space-y-3"><input class="w-full rounded-lg border border-line p-2 text-sm" [(ngModel)]="cancelReason" placeholder="Nhập lý do hủy đơn hàng..."><div class="flex gap-2"><button type="button" class="rounded-lg bg-danger px-4 py-2 text-sm font-bold text-white" (click)="cancelOrder(item.code)">Xác nhận hủy đơn</button><button type="button" class="rounded-lg border border-line px-4 py-2 text-sm" (click)="showCancelConfirm.set(false)">Quay lại</button></div></div> }</div> }<h3 class="mt-8 font-bold">Lịch sử xử lý đơn hàng</h3><ol class="mt-3 space-y-2 text-sm">@for (entry of item.timeline; track entry.occurredAt) { <li class="text-muted"><span class="font-medium text-foreground">{{ entry.occurredAt | date:'short' }}</span> — {{ entry.status }}{{ entry.reason ? ' (' + entry.reason + ')' : '' }}</li> }</ol></section> }</section>`,
})
export class OrderLookupPageComponent {
  private readonly api = inject(ApiClientService);
  protected code = '';
  protected identifier = '';
  protected otp = '';
  protected cancelReason = '';
  protected reviewText = '';
  protected reviewRating = 5;
  protected readonly verificationId = signal<string | null>(null);
  protected readonly sessionToken = signal<string | null>(null);
  protected readonly order = signal<Order | null>(null);
  protected readonly showCancelConfirm = signal(false);
  protected readonly reviewingLineId = signal<string | null>(null);

  protected async request(): Promise<void> {
    const response = await this.api.post<Otp>('/orders/lookup/request', { code: this.code, identifier: this.identifier });
    if (response.success) this.verificationId.set(response.data.verificationId);
  }

  protected async verify(): Promise<void> {
    const verificationId = this.verificationId();
    if (!verificationId) return;
    const response = await this.api.post<{ verificationId: string; sessionToken: string; order: Order }>('/orders/lookup/verify', { verificationId, code: this.otp });
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

  protected async cancelOrder(orderCode: string): Promise<void> {
    const response = await this.api.post<{ code: string; status: string; paymentState: string }>(`/orders/${orderCode}/cancel`, {
      identifier: this.identifier,
      sessionToken: this.sessionToken() ?? undefined,
      reason: this.cancelReason || undefined,
    });
    if (response.success) {
      this.showCancelConfirm.set(false);
      await this.refreshOrder();
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
