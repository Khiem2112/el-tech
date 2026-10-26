import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { VndPipe } from '../../lib/vnd.pipe';
import { ProductImagePipe } from '../../lib/product-image.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, VndPipe, ProductImagePipe, ButtonDirective, BadgeDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Breadcrumbs & Stepper Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <nav class="text-xs text-muted mb-1">
            <a routerLink="/" class="hover:text-foreground">Trang chủ</a> / 
            <span class="text-foreground font-bold">Giỏ hàng</span>
          </nav>
          <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Giỏ Hàng Mua Sắm</h1>
          <p class="text-xs text-muted mt-1">Các linh kiện trong giỏ sẽ được kiểm tra và giữ tồn kho trước khi thanh toán.</p>
        </div>

        <div class="hidden sm:flex items-center gap-2 text-xs">
          <span appBadge variant="primary">Giỏ hàng</span>
          <lucide-icon name="chevron-right" class="size-3 text-muted" aria-hidden="true"></lucide-icon>
          <span appBadge variant="dark">Thanh toán</span>
          <lucide-icon name="chevron-right" class="size-3 text-muted" aria-hidden="true"></lucide-icon>
          <span appBadge variant="dark">Hoàn tất</span>
        </div>
      </div>

      @if (loading()) {
        <div class="mt-8 grid gap-8 lg:grid-cols-12">
          <div class="lg:col-span-8 space-y-4">
            <div class="h-40 animate-pulse rounded-lg bg-surface-alt border border-line"></div>
            <div class="h-40 animate-pulse rounded-lg bg-surface-alt border border-line"></div>
          </div>
          <div class="lg:col-span-4">
            <div class="h-72 animate-pulse rounded-xl bg-surface-alt border border-line"></div>
          </div>
        </div>
      } @else if (!cart.items().length) {
        <div class="mt-8 rounded-xl border border-dashed border-line p-10 text-center bg-surface max-w-2xl mx-auto shadow-sm">
          <div class="size-14 mx-auto rounded-lg bg-surface-alt text-primary flex items-center justify-center mb-4 border border-line">
            <lucide-icon name="shopping-cart" class="size-7" aria-hidden="true"></lucide-icon>
          </div>
          <h2 class="text-lg font-bold text-foreground">Giỏ hàng của bạn đang trống</h2>
          <p class="mt-1 text-xs text-muted max-w-sm mx-auto">Chưa có linh kiện hoặc cấu hình PC nào trong giỏ hàng. Hãy khám phá danh mục để chọn phần cứng phù hợp.</p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <a routerLink="/san-pham" appButton variant="primary" size="md">
              <lucide-icon name="cpu" class="size-4" aria-hidden="true"></lucide-icon>
              <span>Khám phá danh mục linh kiện</span>
            </a>
            <a routerLink="/pc-dung-san" appButton variant="secondary" size="md">
              <span>Xem PC dựng sẵn</span>
            </a>
          </div>
        </div>
      } @else {
        <div class="grid lg:grid-cols-12 gap-8 mt-8">
          
          <!-- Left Column: Items List (Col 8) -->
          <div class="lg:col-span-8 space-y-4">
            
            <!-- Free Shipping Progress (CA-02) -->
            <div class="p-3.5 rounded-lg bg-surface border border-line flex flex-col gap-1.5 text-xs shadow-sm">
              <div class="flex items-center justify-between font-bold">
                <span class="flex items-center gap-2 text-primary">
                  <lucide-icon name="truck" class="size-4 shrink-0" aria-hidden="true"></lucide-icon>
                  @if (amountLeftForFreeShipping() === 0) {
                    <span>Đơn hàng đạt điều kiện MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC!</span>
                  } @else {
                    <span>Mua thêm <strong class="tabular font-bold">{{ amountLeftForFreeShipping() | vnd }}</strong> để được MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC</span>
                  }
                </span>
                <span class="text-primary font-mono font-bold tabular">{{ freeShippingPercent() }}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-surface-alt border border-line overflow-hidden">
                <div
                  class="h-full rounded-full bg-primary transition-all duration-300"
                  [style.width.%]="freeShippingPercent()"
                ></div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-muted">
                <span>Miễn phí vận chuyển cho đơn hàng linh kiện từ 5.000.000 đ</span>
                <span class="text-primary font-medium">Bảo hiểm linh kiện 100%</span>
              </div>
            </div>

            <!-- Grouped PC Build Cards -->
            @for (build of cart.pcBuildGroups(); track build.key) {
              <div class="bg-surface rounded-xl border-2 border-primary/40 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
                <div class="flex items-center justify-between pb-2 border-b border-line text-xs">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold uppercase tracking-wider text-[10px]">
                      Bộ PC Hoàn Chỉnh
                    </span>
                    <span class="px-1.5 py-0.5 rounded bg-surface-alt border border-line text-foreground font-mono text-[10px] font-bold">
                      {{ build.buildType }}
                    </span>
                    <span class="text-xs text-primary font-bold flex items-center gap-1">
                      <lucide-icon name="shield-check" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                      <span>Tương thích 100%</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    class="text-xs text-danger hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                    (click)="cart.removePcBuild(build.key)"
                  >
                    <lucide-icon name="trash-2" class="size-3.5" aria-hidden="true"></lucide-icon>
                    <span>Xóa toàn bộ PC</span>
                  </button>
                </div>

                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div class="flex items-center gap-4 min-w-0 flex-1">
                    <div class="size-16 sm:size-20 rounded-md bg-surface-alt border border-line flex items-center justify-center shrink-0 overflow-hidden relative">
                      @if (build.hardwareItems[0]?.media; as media) {
                        <img
                          [src]="media | productImage"
                          [alt]="build.buildName"
                          class="h-full w-full object-contain"
                          (error)="onImageError($event)"
                        >
                      } @else {
                        <lucide-icon name="cpu" class="size-8 text-primary" aria-hidden="true"></lucide-icon>
                      }
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="font-bold text-sm sm:text-base text-foreground truncate">{{ build.buildName }}</h3>
                      <div class="flex flex-wrap items-center gap-2 text-xs text-muted mt-1">
                        <span>Mã: <strong class="font-mono text-foreground">{{ getBuildCode(build.key) }}</strong></span>
                        <span>•</span>
                        <span>{{ build.componentCount }} linh kiện chính</span>
                        <span>•</span>
                        <span class="text-primary font-semibold">Sẵn sàng lắp ráp</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-line">
                    <div class="flex items-center border border-line rounded-md bg-surface overflow-hidden">
                      <button
                        type="button"
                        appButton
                        variant="ghost"
                        size="sm"
                        class="h-8 w-8 p-0 rounded-none border-0"
                        (click)="cart.setPcBuildQuantity(build.key, build.quantity - 1)"
                        aria-label="Giảm số lượng bộ PC"
                      >
                        <lucide-icon name="minus" class="size-3" aria-hidden="true"></lucide-icon>
                      </button>
                      <span class="px-2.5 py-1 text-xs font-bold text-foreground min-w-[2rem] text-center tabular">{{ build.quantity }}</span>
                      <button
                        type="button"
                        appButton
                        variant="ghost"
                        size="sm"
                        class="h-8 w-8 p-0 rounded-none border-0"
                        (click)="cart.setPcBuildQuantity(build.key, build.quantity + 1)"
                        aria-label="Tăng số lượng bộ PC"
                      >
                        <lucide-icon name="plus" class="size-3" aria-hidden="true"></lucide-icon>
                      </button>
                    </div>

                    <div class="text-right">
                      <div class="text-base sm:text-lg font-black text-foreground tabular">{{ build.totalPrice | vnd }}</div>
                      <a
                        routerLink="/tu-lap-pc"
                        class="text-xs text-primary hover:underline font-bold mt-0.5 inline-block"
                      >
                        Sửa cấu hình
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Accordion Toggle Button -->
                <div class="pt-1">
                  <button
                    type="button"
                    (click)="toggleBuildAccordion(build.key)"
                    class="w-full flex items-center justify-between px-3 py-2 bg-surface-alt hover:bg-surface-alt/80 rounded-lg border border-line transition-all text-foreground text-xs font-bold text-left cursor-pointer"
                    [attr.aria-expanded]="isBuildExpanded(build.key)"
                  >
                    <span class="flex items-center gap-2">
                      <lucide-icon name="list" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                      <span>{{ isBuildExpanded(build.key) ? 'Thu gọn chi tiết linh kiện' : 'Xem chi tiết ' + build.componentCount + ' linh kiện trong bộ PC' }}</span>
                      <span class="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] font-bold tabular">
                        {{ build.componentCount }} món
                      </span>
                    </span>
                    <lucide-icon
                      name="chevron-down"
                      class="size-4 text-muted transition-transform duration-200"
                      [class.rotate-180]="isBuildExpanded(build.key)"
                      aria-hidden="true"
                    ></lucide-icon>
                  </button>
                </div>

                <!-- Accordion Content -->
                @if (isBuildExpanded(build.key)) {
                  <div class="rounded-lg bg-surface-alt/50 border border-line p-3 space-y-2">
                    @for (hw of build.hardwareItems; track hw.id) {
                      <div class="flex items-center justify-between gap-3 py-1.5 border-b border-line last:border-b-0 text-xs">
                        <div class="flex items-center gap-2 min-w-0">
                          <span class="px-1.5 py-0.5 rounded bg-surface border border-line text-primary font-mono text-[9px] font-bold shrink-0">
                            {{ getComponentBadge(hw.name, hw.sku) }}
                          </span>
                          <span class="font-bold text-foreground truncate">{{ hw.name }}</span>
                        </div>
                        <div class="flex items-center gap-3 shrink-0">
                          <span class="font-mono text-muted tabular">{{ hw.unitPrice | vnd }}</span>
                          <span class="text-muted tabular">x{{ hw.quantity }}</span>
                          <span class="font-mono font-bold text-foreground tabular">{{ hw.lineTotal | vnd }}</span>
                          <a
                            [routerLink]="['/tu-lap-pc']"
                            [queryParams]="{ swapSlot: getSlotKey(hw.name, hw.sku) }"
                            class="text-[11px] text-primary hover:underline font-bold"
                          >
                            Đổi món
                          </a>
                        </div>
                      </div>
                    }
                    <div class="mt-2 p-2 rounded bg-primary/10 border border-primary/20 flex items-center justify-between text-xs text-primary">
                      <div class="flex items-center gap-1.5 font-bold">
                        <lucide-icon name="wrench" class="size-3.5" aria-hidden="true"></lucide-icon>
                        <span>Miễn phí gói lắp ráp, giấu dây thẩm mỹ và stress test 24h</span>
                      </div>
                      <span class="font-bold uppercase text-[10px]">0 đ</span>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Individual Standalone Items -->
            @if (cart.individualItems().length > 0) {
              <div class="bg-surface rounded-lg border border-line divide-y divide-border overflow-hidden shadow-sm">
                @for (item of cart.individualItems(); track item.id) {
                  <article class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-4 min-w-0 flex-1">
                      <div class="size-16 sm:size-20 rounded-md bg-surface-alt border border-line flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          [src]="item.media | productImage"
                          [alt]="item.name"
                          class="h-full w-full object-cover"
                          (error)="onImageError($event)"
                        >
                      </div>
                      <div class="min-w-0 flex-1">
                        <span class="text-[10px] font-bold text-primary uppercase">LINH KIỆN ĐƠN LẺ</span>
                        <h3 class="font-bold text-xs sm:text-sm text-foreground mt-0.5 truncate">{{ item.name }}</h3>
                        <p class="text-xs text-muted mt-0.5">Mã SKU: <span class="font-mono tabular">{{ item.sku }}</span> · Đơn giá: <span class="tabular font-semibold text-foreground">{{ item.unitPrice | vnd }}</span></p>
                        <span appBadge variant="success" size="sm" class="mt-1">Sẵn sàng giao</span>
                      </div>
                    </div>

                    <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-line">
                      <div class="flex items-center border border-line rounded-md bg-surface overflow-hidden">
                        <button
                          type="button"
                          appButton
                          variant="ghost"
                          size="sm"
                          class="h-8 w-8 p-0 rounded-none border-0"
                          (click)="change(item.id, item.quantity - 1)"
                          aria-label="Giảm số lượng"
                        >
                          <lucide-icon name="minus" class="size-3" aria-hidden="true"></lucide-icon>
                        </button>
                        <span class="px-2.5 py-1 text-xs font-bold text-foreground min-w-[2rem] text-center tabular">{{ item.quantity }}</span>
                        <button
                          type="button"
                          appButton
                          variant="ghost"
                          size="sm"
                          class="h-8 w-8 p-0 rounded-none border-0"
                          (click)="change(item.id, item.quantity + 1)"
                          aria-label="Tăng số lượng"
                        >
                          <lucide-icon name="plus" class="size-3" aria-hidden="true"></lucide-icon>
                        </button>
                      </div>

                      <div class="text-right">
                        <div class="text-base font-black text-foreground tabular">{{ item.lineTotal | vnd }}</div>
                        <button
                          type="button"
                          class="text-xs text-danger hover:underline font-bold mt-1 inline-flex items-center gap-1 cursor-pointer"
                          (click)="remove(item.id)"
                        >
                          <lucide-icon name="trash-2" class="size-3.5" aria-hidden="true"></lucide-icon>
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </article>
                }
              </div>
            }

            <!-- Bottom Actions -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
              <a routerLink="/san-pham" class="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                <span>« Tiếp tục tìm kiếm linh kiện khác</span>
              </a>
              <span class="text-xs text-muted">Tổng cộng: {{ cart.itemCount() }} sản phẩm trong giỏ</span>
            </div>

          </div>

          <!-- Right Column: Order Summary (Col 4) -->
          <div class="lg:col-span-4 space-y-4">
            
            <div class="bg-surface-alt p-5 rounded-xl border border-line shadow-sm space-y-4 sticky top-24">
              <h2 class="text-sm font-bold text-foreground border-b border-line pb-3">Tóm Tắt Đơn Hàng</h2>

              <!-- Price Calculations -->
              <div class="space-y-2 text-xs">
                <div class="flex justify-between text-muted">
                  <span>Tạm tính linh kiện ({{ cart.itemCount() }} món):</span>
                  <span class="font-bold text-foreground tabular">{{ cart.subtotal() | vnd }}</span>
                </div>
                <div class="flex justify-between text-muted">
                  <span>Phí vận chuyển giao tận nơi:</span>
                  <span class="font-semibold text-primary">0 đ (Miễn phí)</span>
                </div>
                <div class="flex justify-between text-foreground text-sm font-black border-t border-line pt-2.5">
                  <span>Tổng tiền tạm tính:</span>
                  <span class="text-primary tabular text-base">{{ cart.subtotal() | vnd }}</span>
                </div>
                <p class="text-[11px] text-muted text-right">Đã bao gồm thuế giá trị gia tăng (VAT 10%)</p>
              </div>

              <!-- Checkout CTA Button -->
              <a
                routerLink="/checkout"
                appButton
                variant="primary"
                size="lg"
                class="w-full"
              >
                <span>Tiến hành đặt hàng (Checkout)</span>
                <lucide-icon name="chevron-right" class="size-4" aria-hidden="true"></lucide-icon>
              </a>

              <!-- Trust Assurances -->
              <div class="pt-2 text-[11px] text-muted space-y-1.5 border-t border-line">
                <p>· Khách vãng lai không cần đăng nhập vẫn có thể đặt mua.</p>
                <p>· Hỗ trợ thanh toán chuyển khoản VietQR tự động khóa linh kiện.</p>
                <p>· Đổi mới trong 30 ngày nếu phát sinh lỗi kỹ thuật phần cứng.</p>
              </div>
            </div>

          </div>

        </div>
      }
    </section>
  `,
})
export class CartPageComponent {
  protected readonly cart = inject(CartService);
  protected readonly loading = signal(true);
  protected readonly onImageError = handleProductImageError;
  protected readonly expandedBuildKeys = signal<Record<string, boolean>>({});

  protected readonly freeShippingThreshold = 5_000_000;

  protected readonly freeShippingPercent = computed<number>(() => {
    const total = Number(this.cart.subtotal()) || 0;
    return Math.min(100, Math.round((total / this.freeShippingThreshold) * 100));
  });

  protected readonly amountLeftForFreeShipping = computed<number>(() => {
    const total = Number(this.cart.subtotal()) || 0;
    return Math.max(0, this.freeShippingThreshold - total);
  });

  protected getSlotKey(name: string, sku: string): string {
    const badge = this.getComponentBadge(name, sku);
    const map: Record<string, string> = {
      CPU: 'cpu',
      MAIN: 'mainboard',
      RAM: 'ram',
      VGA: 'vga',
      SSD: 'ssd',
      PSU: 'psu',
      COOL: 'cooling',
      CASE: 'case',
    };
    return map[badge] || 'cpu';
  }

  constructor() {
    void this.load();
  }

  protected change(itemId: string, quantity: number): void {
    void this.cart.setQuantity(itemId, quantity);
  }

  protected remove(itemId: string): void {
    void this.cart.remove(itemId);
  }

  protected toggleBuildAccordion(key: string): void {
    this.expandedBuildKeys.update((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  protected isBuildExpanded(key: string): boolean {
    return !!this.expandedBuildKeys()[key];
  }

  protected getComponentBadge(name: string, sku: string): string {
    const n = (name + ' ' + sku).toLowerCase();
    if (n.includes('core') || n.includes('ryzen') || n.includes('cpu')) return 'CPU';
    if (n.includes('main') || n.includes('z790') || n.includes('b760') || n.includes('b650') || n.includes('x670') || n.includes('bo mạch')) return 'MAIN';
    if (n.includes('ram') || n.includes('ddr4') || n.includes('ddr5')) return 'RAM';
    if (n.includes('rtx') || n.includes('gtx') || n.includes('radeon') || n.includes('vga') || n.includes('card')) return 'VGA';
    if (n.includes('ssd') || n.includes('nvme') || n.includes('m.2')) return 'SSD';
    if (n.includes('nguồn') || n.includes('psu') || n.includes('plus gold') || n.includes('power')) return 'PSU';
    if (n.includes('tản') || n.includes('aio') || n.includes('cooler') || n.includes('cooling') || n.includes('radiator')) return 'COOL';
    if (n.includes('case') || n.includes('vỏ') || n.includes('tower')) return 'CASE';
    return 'PART';
  }

  protected getBuildCode(key: string): string {
    const clean = key.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
    return `BUILD-ELT-${clean || '9428'}`;
  }

  private async load(): Promise<void> {
    try {
      await this.cart.load();
    } finally {
      this.loading.set(false);
    }
  }
}
