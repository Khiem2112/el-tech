import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
            
            <!-- Free Shipping Announcement -->
            <div class="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <lucide-icon name="truck" class="size-4 text-primary shrink-0" aria-hidden="true"></lucide-icon>
                <div>
                  <span class="font-bold">Đơn hàng đạt điều kiện MIỄN PHÍ VẬN CHUYỂN!</span>
                  <p class="text-[11px] text-primary mt-0.5">Giá trị đơn hàng linh kiện trên 2.000.000 đ được miễn phí giao hàng toàn quốc.</p>
                </div>
              </div>
              <span appBadge variant="primary" class="text-[10px]">FREESHIP ÁP DỤNG</span>
            </div>

            <!-- Items Container -->
            <div class="bg-surface rounded-lg border border-line divide-y divide-border overflow-hidden shadow-sm">
              @for (item of cart.items(); track item.id) {
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
                      @if (item.pcBuildName) {
                        <span class="text-[10px] font-bold text-primary uppercase">
                          BOM CẤU HÌNH: {{ item.pcBuildName }} ({{ item.pcBuildType }})
                        </span>
                      } @else {
                        <span class="text-[10px] font-bold text-primary uppercase">LINH KIỆN ĐƠN LẺ</span>
                      }
                      <h3 class="font-bold text-xs sm:text-sm text-foreground mt-0.5 truncate">{{ item.name }}</h3>
                      <p class="text-xs text-muted mt-0.5">Mã SKU: {{ item.sku }} · Đơn giá: {{ item.unitPrice | vnd }}</p>
                      <span appBadge variant="success" size="sm" class="mt-1">Sẵn sàng giao</span>
                    </div>
                  </div>

                  <!-- Quantity Controls & Line Total -->
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
                      <span class="px-2.5 py-1 text-xs font-bold text-foreground min-w-[2rem] text-center">{{ item.quantity }}</span>
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

  constructor() {
    void this.load();
  }

  protected change(itemId: string, quantity: number): void {
    void this.cart.setQuantity(itemId, quantity);
  }

  protected remove(itemId: string): void {
    void this.cart.remove(itemId);
  }

  private async load(): Promise<void> {
    try {
      await this.cart.load();
    } finally {
      this.loading.set(false);
    }
  }
}
