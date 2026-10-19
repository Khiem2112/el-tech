import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppIconModule, ButtonDirective } from '../../components/atoms';
import { VndPipe } from '../../lib/vnd.pipe';

type StoredOrderData = {
  readonly code: string;
  readonly status: string;
  readonly receiverName?: string;
  readonly receiverEmail?: string;
  readonly receiverPhone?: string;
  readonly fulfillmentMethod?: string;
  readonly branchName?: string;
  readonly deliveryAddress?: string;
  readonly paymentMethod?: string;
  readonly paymentReference?: string;
  readonly expectedAmount?: string;
  readonly grandTotal?: string;
  readonly items?: readonly {
    readonly name: string;
    readonly quantity: number;
    readonly unitPrice: string;
    readonly sku?: string;
  }[];
};

@Component({
  selector: 'app-order-success-page',
  imports: [RouterLink, VndPipe, AppIconModule, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @media print {
      header, footer, nav, .no-print {
        display: none !important;
      }
      body, main {
        background: white !important;
        color: black !important;
        padding: 0 !important;
      }
      .print-expand {
        width: 100% !important;
        max-width: 100% !important;
        border: none !important;
        box-shadow: none !important;
      }
    }
  `],
  template: `
    <section class="w-full bg-canvas min-h-screen pb-16">
      <!-- Status Hero Ribbon -->
      <header class="w-full bg-surface-elevated text-foreground-dark px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden border-b border-border">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div class="flex items-start gap-4">
            <div class="size-14 rounded-2xl bg-surface-dark flex items-center justify-center shrink-0 border border-border shadow-lg">
              <lucide-icon name="shield-check" class="size-8 text-primary" aria-hidden="true"></lucide-icon>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  HỆ THỐNG ĐÃ XÁC NHẬN
                </span>
                <span class="text-xs text-muted">Đang chuẩn bị linh kiện xuất kho</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-foreground-dark tracking-tight mt-1">
                Đặt Hàng Thành Công!
              </h1>
              <p class="text-xs text-muted mt-1 max-w-2xl">
                Đơn hàng của bạn đã được ghi nhận vào hệ thống. Đội ngũ kỹ thuật viên đang tiến hành test linh kiện theo đúng tiêu chuẩn xuất xưởng.
              </p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto no-print">
            <button
              type="button"
              appButton
              variant="outline"
              size="md"
              (click)="printReceipt()"
              class="border-border text-foreground-dark bg-surface-dark hover:bg-surface-elevated"
            >
              <lucide-icon name="printer" class="size-4" aria-hidden="true"></lucide-icon>
              <span>In đơn hàng</span>
            </button>
            <a
              routerLink="/tra-cuu-don"
              appButton
              variant="primary"
              size="md"
            >
              <span>Theo dõi đơn hàng</span>
              <lucide-icon name="arrow-right" class="size-4" aria-hidden="true"></lucide-icon>
            </a>
          </div>
        </div>
      </header>

      <!-- Main Receipt Workspace -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print-expand">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left Column: Order Credentials, Hardware BOM & Logistics (8 cols) -->
          <div class="lg:col-span-8 space-y-6">
            
            <!-- Order Identity & OTP Card -->
            <div class="bg-surface rounded-xl p-5 shadow-sm border border-border space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-muted">Mã đơn hàng chính thức</span>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                      #{{ orderCode() }}
                    </span>
                    <button
                      type="button"
                      (click)="copyCode()"
                      class="size-7 rounded-md bg-surface-alt hover:bg-border text-muted hover:text-foreground flex items-center justify-center transition-colors cursor-pointer border border-border"
                      title="Sao chép mã đơn hàng"
                      aria-label="Sao chép mã đơn hàng"
                    >
                      <lucide-icon name="copy" class="size-3.5" aria-hidden="true"></lucide-icon>
                    </button>
                    @if (codeCopied()) {
                      <span class="text-[10px] font-bold text-primary">Đã sao chép</span>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="px-3.5 py-1.5 rounded-lg bg-surface-alt border border-border text-right">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-muted block">Mã OTP nhận máy</span>
                    <span class="text-sm sm:text-base font-black text-primary tracking-widest">{{ otpCode() }}</span>
                  </div>
                </div>
              </div>

              <!-- Logistics Status Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-surface-alt text-xs">
                <div>
                  <span class="text-[10px] font-bold uppercase text-muted">Thời gian đặt</span>
                  <p class="font-bold text-foreground mt-0.5">{{ orderDate() }}</p>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase text-muted">Dự kiến hoàn tất</span>
                  <p class="font-bold text-primary mt-0.5">Hôm nay - Sẵn sàng sau 2H</p>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase text-muted">Hình thức nhận</span>
                  <p class="font-bold text-foreground mt-0.5 flex items-center gap-1">
                    <lucide-icon name="store" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                    <span>{{ fulfillmentLabel() }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Hardware Breakdown Table -->
            <div class="bg-surface rounded-xl p-5 shadow-sm border border-border space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-border">
                <div class="flex items-center gap-2">
                  <lucide-icon name="cpu" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                  <h2 class="text-sm font-bold text-foreground">Chi Tiết Cấu Hình & Linh Kiện Đặt Mua</h2>
                </div>
                <span class="text-xs text-muted">Gói lắp ráp chính hãng</span>
              </div>

              <div class="divide-y divide-border text-xs">
                @for (item of orderItems(); track item.name) {
                  <div class="py-3 flex items-center justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="px-1.5 py-0.2 rounded bg-surface-alt text-muted text-[10px] font-bold uppercase border border-border">
                          {{ item.sku || 'HARDWARE' }}
                        </span>
                        <span class="text-[10px] text-emerald-400 font-bold">Bảo hành 36T</span>
                      </div>
                      <h3 class="text-xs font-bold text-foreground truncate mt-1">{{ item.name }}</h3>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="text-muted text-[11px] block">SL: {{ item.quantity }}</span>
                      <span class="font-bold text-foreground tabular">{{ item.unitPrice | vnd }}</span>
                    </div>
                  </div>
                }

                <!-- Free Technical Services Item -->
                <div class="py-3 flex items-center justify-between gap-4 bg-primary/5 px-3 rounded-lg border border-primary/20">
                  <div class="flex items-center gap-2.5">
                    <div class="size-7 rounded bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <lucide-icon name="wrench" class="size-4" aria-hidden="true"></lucide-icon>
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="font-bold text-foreground text-xs">Lắp ráp & Stress Test FurMark 24h</span>
                        <span class="px-1.5 py-0.2 rounded bg-primary text-primary-foreground font-bold text-[9px]">TẶNG KÈM</span>
                      </div>
                      <p class="text-[11px] text-muted">Đi dây giấu cáp thẩm mỹ, cập nhật BIOS bo mạch mới nhất.</p>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-xs line-through text-muted block">500.000 đ</span>
                    <span class="text-xs font-bold text-primary">0 đ</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fulfillment Location & Receiver Info -->
            <div class="bg-surface rounded-xl p-5 shadow-sm border border-border space-y-4">
              <div class="flex items-center gap-2 pb-3 border-b border-border">
                <lucide-icon name="map-pin" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                <h2 class="text-sm font-bold text-foreground">Địa Điểm Bàn Giao & Thông Tin Người Nhận</h2>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div class="p-3.5 rounded-lg bg-surface-alt border border-border space-y-1">
                  <span class="text-[10px] font-bold uppercase text-primary">Địa điểm nhận bàn giao</span>
                  <h4 class="font-bold text-foreground text-xs">{{ branchLocationName() }}</h4>
                  <p class="text-muted text-[11px] leading-relaxed">{{ branchAddress() }}</p>
                  <p class="text-muted text-[11px] pt-1">Hotline showroom: 1900.6868 (08:30 - 21:30)</p>
                </div>

                <div class="p-3.5 rounded-lg bg-surface-alt border border-border space-y-1">
                  <span class="text-[10px] font-bold uppercase text-muted">Thông tin người nhận</span>
                  <h4 class="font-bold text-foreground text-xs">{{ receiverName() }}</h4>
                  <p class="text-muted text-[11px]">Số điện thoại: {{ receiverPhone() }}</p>
                  <p class="text-muted text-[11px]">Email nhận hóa đơn: {{ receiverEmail() }}</p>
                </div>
              </div>
            </div>

            <!-- Policy & Cancellation Notice -->
            <div class="p-4 rounded-xl bg-surface-alt border border-border space-y-1 text-xs text-muted">
              <span class="font-bold text-foreground block">Quy định hủy đơn & đổi trả linh kiện:</span>
              <p class="leading-relaxed">
                Khách hàng có thể tự hủy đơn hàng trực tuyến hoặc thay đổi linh kiện trước khi kỹ thuật bắt đầu mở seal linh kiện để lắp ráp.
                Mọi khoản thanh toán giữ chỗ sẽ được hoàn trả tự động theo quy định.
              </p>
            </div>
          </div>

          <!-- Right Column: Payment Transfer & Technical Contact (4 cols) -->
          <div class="lg:col-span-4 space-y-6">
            
            <!-- VietQR Payment Instruction Card -->
            @if (isQrPayment()) {
              <div class="bg-surface rounded-xl p-5 shadow-sm border border-border space-y-4">
                <div class="flex items-center justify-between border-b border-border pb-3">
                  <div class="flex items-center gap-1.5">
                    <lucide-icon name="qr-code" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                    <h3 class="text-xs font-bold uppercase text-foreground">Thanh Toán Chuyển Khoản VietQR</h3>
                  </div>
                  <span class="text-[11px] font-mono text-amber-400 font-bold">
                    Còn {{ formattedTimer() }}
                  </span>
                </div>

                <!-- QR Code Dynamic Graphic -->
                <div class="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-alt border border-border">
                  <img
                    [src]="qrCodeUrl()"
                    alt="VietQR Chuyển Khoản"
                    class="size-44 object-contain rounded-lg border border-border bg-white p-2"
                  >
                  <p class="text-[10px] text-muted text-center mt-2">
                    Mở ứng dụng Mobile Banking bất kỳ để quét mã QR thanh toán nhanh
                  </p>
                </div>

                <!-- Payment Reference & Amount Boxes -->
                <div class="space-y-2 text-xs">
                  <div class="p-2.5 rounded-lg bg-surface-alt border border-border">
                    <span class="text-[10px] text-muted block">Nội dung chuyển khoản (bắt buộc chính xác):</span>
                    <div class="flex items-center justify-between mt-0.5">
                      <strong class="text-primary font-mono text-xs">{{ paymentReference() }}</strong>
                      <button
                        type="button"
                        (click)="copyRef()"
                        class="text-[10px] text-muted hover:text-foreground font-bold underline cursor-pointer"
                      >
                        Sao chép
                      </button>
                    </div>
                  </div>

                  <div class="p-2.5 rounded-lg bg-surface-alt border border-border">
                    <span class="text-[10px] text-muted block">Số tiền thanh toán:</span>
                    <strong class="text-foreground text-sm font-black tabular mt-0.5 block">
                      {{ (expectedAmount() || grandTotal()) | vnd }}
                    </strong>
                  </div>

                  <div class="p-2.5 rounded-lg bg-surface-alt border border-border text-[11px] text-muted space-y-0.5">
                    <div class="text-foreground font-bold">Ngân hàng Quân Đội (MB Bank)</div>
                    <div>Số tài khoản: <strong>0988234567</strong></div>
                    <div>Chủ TK: <strong>CONG TY TNHH CONG NGHE EL-TECH</strong></div>
                  </div>
                </div>

                <div class="p-2 rounded bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-[11px]">
                  Hệ thống tự động kiểm tra sao kê ngân hàng và kích hoạt trạng thái ĐÃ THANH TOÁN sau 30-60 giây.
                </div>
              </div>
            }

            <!-- Dedicated Technical Support Contact Card -->
            <div class="bg-surface rounded-xl p-5 shadow-sm border border-border space-y-3 text-xs">
              <div class="flex items-center gap-2 text-foreground font-bold border-b border-border pb-2.5">
                <lucide-icon name="user" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                <span>Kỹ Thuật Viên Phụ Trách Đơn Hàng</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-surface-alt border border-border flex items-center justify-center font-bold text-primary">
                  HL
                </div>
                <div>
                  <h4 class="font-bold text-foreground text-xs">KTV Hoàng Long</h4>
                  <p class="text-[11px] text-muted">Chuyên viên Lắp ráp & Stress Test PC</p>
                </div>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                Kỹ thuật viên sẽ liên hệ với bạn qua số điện thoại để chốt chi tiết đi dây và cập nhật BIOS trước khi đóng gói.
              </p>
            </div>
          </div>
        </div>
      </main>
    </section>
  `,
})
export class OrderSuccessPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);

  protected readonly orderCode = signal<string>('');
  protected readonly otpCode = signal<string>('489 - 102');
  protected readonly codeCopied = signal(false);
  protected readonly orderDate = signal<string>('Hôm nay');
  protected readonly fulfillmentLabel = signal<string>('Nhận tại Showroom');
  protected readonly branchLocationName = signal<string>('EL-TECH TP.HCM (Quận 10)');
  protected readonly branchAddress = signal<string>('280 Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh');
  protected readonly receiverName = signal<string>('Nguyễn Hoàng Nam');
  protected readonly receiverPhone = signal<string>('0988 234 567');
  protected readonly receiverEmail = signal<string>('hoangnam.tech@gmail.com');
  protected readonly paymentReference = signal<string>('ELT-94820-QR');
  protected readonly expectedAmount = signal<string>('51990000');
  protected readonly grandTotal = signal<string>('51990000');
  protected readonly isQrPayment = signal<boolean>(true);

  protected readonly orderItems = signal<
    readonly {
      readonly name: string;
      readonly quantity: number;
      readonly unitPrice: string;
      readonly sku?: string;
    }[]
  >([
    {
      name: 'ASUS TUF Gaming GeForce RTX 5070 Ti 16GB GDDR7',
      quantity: 1,
      unitPrice: '23990000',
      sku: 'VGA-5070TI',
    },
    {
      name: 'Intel Core i7-14700K (3.4GHz turbo 5.6GHz, 20C/28T)',
      quantity: 1,
      unitPrice: '10490000',
      sku: 'CPU-14700K',
    },
    {
      name: 'ASUS ROG STRIX Z790-A GAMING WIFI II DDR5',
      quantity: 1,
      unitPrice: '8990000',
      sku: 'MB-Z790A',
    },
    {
      name: 'Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5',
      quantity: 1,
      unitPrice: '4250000',
      sku: 'RAM-DDR5-32G',
    },
  ]);

  protected readonly secondsRemaining = signal(1800);
  private timerHandle?: ReturnType<typeof setInterval>;

  protected readonly formattedTimer = signal('30:00');

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code') ?? 'ELT-94820';
    this.orderCode.set(code);
    this.paymentReference.set(code + '-QR');

    const storedRaw = sessionStorage.getItem(`last_order_${code}`);
    if (storedRaw) {
      try {
        const stored = JSON.parse(storedRaw) as StoredOrderData;
        if (stored.receiverName) this.receiverName.set(stored.receiverName);
        if (stored.receiverEmail) this.receiverEmail.set(stored.receiverEmail);
        if (stored.receiverPhone) this.receiverPhone.set(stored.receiverPhone);
        if (stored.fulfillmentMethod === 'DELIVERY') {
          this.fulfillmentLabel.set('Giao hàng tận nơi 2H');
          if (stored.deliveryAddress) this.branchAddress.set(stored.deliveryAddress);
          this.branchLocationName.set('Giao hàng hỏa tốc nội thành');
        }
        if (stored.paymentMethod) {
          this.isQrPayment.set(stored.paymentMethod === 'QR');
        }
        if (stored.paymentReference) this.paymentReference.set(stored.paymentReference);
        if (stored.expectedAmount) this.expectedAmount.set(stored.expectedAmount);
        if (stored.grandTotal) this.grandTotal.set(stored.grandTotal);
        if (stored.items && stored.items.length > 0) this.orderItems.set(stored.items);
      } catch {
        // Fallback to default preview data
      }
    }

    this.timerHandle = setInterval(() => {
      const current = this.secondsRemaining();
      if (current <= 1) {
        clearInterval(this.timerHandle);
        this.formattedTimer.set('00:00');
        return;
      }
      const next = current - 1;
      this.secondsRemaining.set(next);
      const mins = Math.floor(next / 60);
      const secs = next % 60;
      this.formattedTimer.set(`${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerHandle) clearInterval(this.timerHandle);
  }

  protected qrCodeUrl(): string {
    const amount = this.expectedAmount() || this.grandTotal() || '51990000';
    const ref = encodeURIComponent(this.paymentReference());
    return `https://api.vietqr.io/image/970422-0988234567-compact2.jpg?amount=${amount}&addInfo=${ref}&accountName=CONG%20TY%20EL-TECH`;
  }

  protected copyCode(): void {
    void navigator.clipboard.writeText(this.orderCode());
    this.codeCopied.set(true);
    setTimeout(() => this.codeCopied.set(false), 3000);
  }

  protected copyRef(): void {
    void navigator.clipboard.writeText(this.paymentReference());
  }

  protected printReceipt(): void {
    window.print();
  }
}
