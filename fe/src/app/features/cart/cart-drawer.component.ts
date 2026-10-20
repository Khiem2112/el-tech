import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { VndPipe } from '../../lib/vnd.pipe';
import { ProductImagePipe } from '../../lib/product-image.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, VndPipe, ProductImagePipe, ButtonDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cart.isDrawerOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
        (click)="cart.closeDrawer()"
        aria-hidden="true"
      ></div>

      <!-- Right Slide-Over Drawer Container -->
      <aside
        aria-label="Giỏ hàng linh kiện máy tính"
        class="fixed top-0 right-0 z-50 h-screen w-full sm:w-[540px] md:w-[620px] max-w-[100vw] bg-surface-dark text-white flex flex-col shadow-2xl border-l border-line-dark animate-in slide-in-from-right duration-200"
      >
        <!-- Drawer Header -->
        <div class="flex-shrink-0 bg-surface-dark px-4 sm:px-6 pt-4 pb-3 border-b border-line-dark">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="size-7 rounded bg-surface-dark border border-line-dark flex items-center justify-center text-primary">
                <lucide-icon name="shopping-cart" class="w-4 h-4" aria-hidden="true"></lucide-icon>
              </div>
              <h2 class="text-sm font-bold text-white tracking-tight">Giỏ hàng của bạn</h2>
              <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground tabular">
                {{ cart.itemCount() }} món
              </span>
            </div>
            <button
              type="button"
              (click)="cart.closeDrawer()"
              class="size-8 rounded-lg bg-surface-elevated hover:bg-line-dark text-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-line-dark"
              aria-label="Đóng giỏ hàng"
            >
              <lucide-icon name="x" class="w-4 h-4" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          <!-- Free Shipping Progress (CA-02) -->
          <div class="mt-3 p-2.5 rounded-lg bg-surface-elevated border border-line-dark flex flex-col gap-1 text-xs">
            <div class="flex items-center justify-between font-bold">
              <span class="flex items-center gap-1.5 text-primary">
                <lucide-icon name="truck" class="w-3.5 h-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                @if (amountLeftForFreeShipping() === 0) {
                  <span>Bạn đã đạt điều kiện MIỄN PHÍ VẬN CHUYỂN!</span>
                } @else {
                  <span>Mua thêm {{ amountLeftForFreeShipping() | vnd }} để được MIỄN PHÍ VẬN CHUYỂN</span>
                }
              </span>
              <span class="text-primary font-mono font-bold">{{ freeShippingPercent() }}%</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-line-dark overflow-hidden mt-0.5">
              <div
                class="h-full rounded-full bg-primary transition-all duration-300"
                [style.width.%]="freeShippingPercent()"
              ></div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-muted">
              <span>Đơn linh kiện từ 5.000.000 đ</span>
              <span class="text-foreground-dark/70 font-medium">Bảo hiểm rơi vỡ 100%</span>
            </div>
          </div>
        </div>

        <!-- Scrollable Item List -->
        <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          @if (!cart.items().length) {
            <div class="py-12 text-center flex flex-col items-center">
              <div class="size-16 rounded-xl bg-surface-elevated border border-line-dark flex items-center justify-center text-slate-600 mb-3">
                <lucide-icon name="shopping-cart" class="w-8 h-8" aria-hidden="true"></lucide-icon>
              </div>
              <p class="text-sm font-bold text-white">Giỏ hàng của bạn đang trống</p>
              <p class="text-xs text-muted mt-1 max-w-xs">Chưa có linh kiện hoặc cấu hình PC nào trong giỏ hàng. Hãy khám phá danh mục để chọn linh kiện phù hợp.</p>
              <div class="mt-5 flex gap-2">
                <a
                  routerLink="/san-pham"
                  (click)="cart.closeDrawer()"
                  appButton
                  variant="primary"
                  size="sm"
                >
                  Xem linh kiện PC
                </a>
                <a
                  routerLink="/tu-lap-pc"
                  (click)="cart.closeDrawer()"
                  appButton
                  variant="outline"
                  size="sm"
                  class="border-line-dark bg-surface-elevated text-slate-200"
                >
                  Tự lắp PC
                </a>
              </div>
            </div>
          } @else {
            <!-- Grouped PC Build Composite Cards -->
            @for (build of cart.pcBuildGroups(); track build.key) {
              <div class="group relative p-3.5 rounded-xl bg-surface-elevated border-2 border-primary/40 shadow-sm flex flex-col gap-2.5">
                <!-- Header Strip -->
                <div class="flex items-center justify-between pb-1.5 border-b border-line-dark text-[11px]">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold uppercase tracking-wider text-[10px]">
                      Bộ PC Hoàn Chỉnh
                    </span>
                    <span class="px-1.5 py-0.5 rounded bg-surface-dark border border-line-dark text-foreground-dark/70 font-mono text-[10px] font-bold">
                      {{ build.buildType }}
                    </span>
                    <span class="px-1.5 py-0.5 rounded bg-surface-dark text-primary font-medium flex items-center gap-1 text-[10px]">
                      <lucide-icon name="shield-check" class="w-3 h-3 text-primary" aria-hidden="true"></lucide-icon>
                      <span>Tương thích 100%</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    (click)="cart.removePcBuild(build.key)"
                    class="text-slate-500 hover:text-danger p-0.5 rounded transition-colors cursor-pointer"
                    title="Xóa toàn bộ cấu hình PC này"
                    aria-label="Xóa bộ PC"
                  >
                    <lucide-icon name="trash-2" class="w-4 h-4" aria-hidden="true"></lucide-icon>
                  </button>
                </div>

                <!-- Main PC Build Overview -->
                <div class="flex gap-3 items-start pt-1">
                  <div class="size-20 rounded-lg bg-surface-dark border border-line-dark shrink-0 overflow-hidden relative p-1 flex items-center justify-center">
                    @if (build.hardwareItems[0]?.media; as media) {
                      <img
                        [src]="media | productImage"
                        [alt]="build.buildName"
                        class="h-full w-full object-contain"
                        (error)="onImageError($event)"
                      >
                    } @else {
                      <lucide-icon name="cpu" class="w-8 h-8 text-primary" aria-hidden="true"></lucide-icon>
                    }
                    <span class="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-surface-dark text-primary font-mono text-[9px] font-bold border border-line-dark">
                      PC BUILD
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                      {{ build.buildName }}
                    </h3>
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-muted">
                      <span>Mã cấu hình: <strong class="font-mono text-white font-semibold">{{ getBuildCode(build.key) }}</strong></span>
                      <span>•</span>
                      <span>Gồm <strong class="text-white">{{ build.componentCount }} linh kiện chính</strong></span>
                    </div>
                    <div class="flex items-center gap-1.5 mt-1 text-[11px] text-primary">
                      <span class="size-1.5 rounded-full bg-primary inline-block"></span>
                      <span>Sẵn hàng đầy đủ tại Showroom Hà Nội &amp; TP. HCM</span>
                    </div>
                  </div>
                </div>

                <!-- Stepper, Pricing & Edit Actions -->
                <div class="flex items-center justify-between pt-2 border-t border-line-dark">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center rounded-lg bg-surface-dark border border-line-dark p-0.5">
                      <button
                        type="button"
                        (click)="cart.setPcBuildQuantity(build.key, build.quantity - 1)"
                        class="size-7 rounded flex items-center justify-center text-foreground-dark/70 hover:bg-line-dark transition-colors cursor-pointer"
                        aria-label="Giảm số lượng bộ PC"
                      >
                        <lucide-icon name="minus" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                      </button>
                      <span class="w-8 text-center text-xs font-bold text-white tabular">{{ build.quantity }}</span>
                      <button
                        type="button"
                        (click)="cart.setPcBuildQuantity(build.key, build.quantity + 1)"
                        class="size-7 rounded flex items-center justify-center text-foreground-dark/70 hover:bg-line-dark transition-colors cursor-pointer"
                        aria-label="Tăng số lượng bộ PC"
                      >
                        <lucide-icon name="plus" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                      </button>
                    </div>
                    <a
                      routerLink="/tu-lap-pc"
                      (click)="cart.closeDrawer()"
                      class="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-strong px-2 py-1 rounded bg-surface-dark hover:bg-line-dark transition-colors border border-line-dark"
                      title="Mở trình cấu hình PC để thay đổi"
                    >
                      <lucide-icon name="settings-2" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                      <span>Sửa cấu hình</span>
                    </a>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-bold text-white tabular">{{ build.totalPrice | vnd }}</div>
                    <div class="text-[10px] text-muted">Trọn bộ dàn máy</div>
                  </div>
                </div>

                <!-- Accordion Toggle Button -->
                <div class="pt-1">
                  <button
                    type="button"
                    (click)="toggleBuildAccordion(build.key)"
                    class="w-full flex items-center justify-between px-3 py-2 bg-surface-dark hover:bg-line-dark/60 rounded-lg border border-line-dark transition-all text-white text-xs font-bold text-left cursor-pointer"
                    [attr.aria-expanded]="isBuildExpanded(build.key)"
                  >
                    <span class="flex items-center gap-2">
                      <lucide-icon name="list" class="w-4 h-4 text-primary" aria-hidden="true"></lucide-icon>
                      <span>{{ isBuildExpanded(build.key) ? 'Thu gọn chi tiết linh kiện' : 'Xem chi tiết ' + build.componentCount + ' linh kiện đã chọn' }}</span>
                      <span class="px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-bold">
                        {{ build.componentCount }} món
                      </span>
                    </span>
                    <lucide-icon
                      name="chevron-down"
                      class="w-4 h-4 text-muted transition-transform duration-200"
                      [class.rotate-180]="isBuildExpanded(build.key)"
                      aria-hidden="true"
                    ></lucide-icon>
                  </button>
                </div>

                <!-- Accordion Dropdown Content -->
                @if (isBuildExpanded(build.key)) {
                  <div class="flex flex-col gap-2 pt-1 animate-in fade-in duration-150">
                    <div class="bg-surface-dark rounded-lg p-2.5 border border-line-dark space-y-2">
                      <div class="flex items-center justify-between pb-1.5 border-b border-line-dark text-[11px] text-muted">
                        <span class="font-bold uppercase tracking-wider text-[10px] text-white">Danh mục linh kiện trong cấu hình</span>
                        <span>Giá đơn lẻ</span>
                      </div>

                      @for (hw of build.hardwareItems; track hw.id) {
                        <div class="flex items-center justify-between gap-2 py-1 border-b border-line-dark/50 last:border-b-0">
                          <div class="flex items-start gap-2 min-w-0">
                            <span class="px-1.5 py-0.5 rounded bg-surface-elevated text-primary font-mono text-[9px] font-bold shrink-0 border border-line-dark">
                              {{ getComponentBadge(hw.name, hw.sku) }}
                            </span>
                            <div class="min-w-0">
                              <p class="text-xs font-bold text-white truncate">{{ hw.name }}</p>
                              <p class="text-[10px] text-muted truncate">SKU: {{ hw.sku }} • Số lượng: {{ hw.quantity }}</p>
                            </div>
                          </div>
                          <div class="text-right shrink-0">
                            <span class="font-mono text-xs font-semibold text-white tabular">{{ hw.lineTotal | vnd }}</span>
                            <a
                              [routerLink]="['/tu-lap-pc']"
                              [queryParams]="{ swapSlot: getSlotKey(hw.name, hw.sku) }"
                              (click)="cart.closeDrawer()"
                              class="block text-[10px] text-primary hover:underline font-bold"
                            >
                              Đổi món
                            </a>
                          </div>
                        </div>
                      }

                      <!-- Free Assembly & Testing Pack Included -->
                      <div class="mt-2 p-2 rounded bg-surface-elevated flex items-center justify-between border border-line-dark text-[11px]">
                        <div class="flex items-center gap-1.5 text-primary">
                          <lucide-icon name="wrench" class="w-3.5 h-3.5 shrink-0" aria-hidden="true"></lucide-icon>
                          <span>Lắp ráp máy, giấu dây thẩm mỹ &amp; ép tải test 24h</span>
                        </div>
                        <span class="font-bold uppercase text-primary">Miễn phí (0 đ)</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Standalone Individual Cart Items -->
            @for (item of cart.individualItems(); track item.id) {
              <div class="p-3.5 rounded-xl bg-surface-elevated border border-line-dark/80 hover:border-line-dark transition-colors flex flex-col gap-2.5">
                <!-- Header Badge -->
                <div class="flex items-center justify-between pb-1.5 border-b border-line-dark text-[11px]">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-1.5 py-0.5 rounded bg-line-dark text-foreground-dark/70 font-bold uppercase">
                      Linh kiện đơn lẻ
                    </span>
                    <span class="text-muted">SKU: {{ item.sku }}</span>
                  </div>
                  <button
                    type="button"
                    (click)="cart.remove(item.id)"
                    class="text-slate-500 hover:text-danger p-0.5 rounded transition-colors cursor-pointer"
                    aria-label="Xóa khỏi giỏ hàng"
                  >
                    <lucide-icon name="trash-2" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                  </button>
                </div>

                <!-- Main Content -->
                <div class="flex gap-3 items-start">
                  <div class="size-16 rounded-lg bg-surface-dark border border-line-dark shrink-0 overflow-hidden p-1 flex items-center justify-center">
                    <img
                      [src]="item.media | productImage"
                      [alt]="item.name"
                      class="h-full w-full object-cover"
                      (error)="onImageError($event)"
                    >
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-xs font-bold text-white leading-snug line-clamp-2">
                      {{ item.name }}
                    </h3>
                    <div class="flex items-center gap-1 mt-1 text-[11px] text-primary">
                      <span class="size-1.5 rounded-full bg-primary inline-block"></span>
                      <span>Sẵn hàng tại HN 45 Thái Hà &amp; HCM 280 3/2</span>
                    </div>
                  </div>
                </div>

                <!-- Footer Stepper and Price -->
                <div class="flex items-center justify-between pt-2 border-t border-line-dark/80">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center rounded-md bg-surface-dark border border-line-dark p-0.5">
                      <button
                        type="button"
                        (click)="cart.setQuantity(item.id, item.quantity - 1)"
                        class="size-6 rounded flex items-center justify-center text-foreground-dark/70 hover:bg-line-dark transition-colors cursor-pointer"
                        aria-label="Giảm số lượng"
                      >
                        <lucide-icon name="minus" class="w-3 h-3" aria-hidden="true"></lucide-icon>
                      </button>
                      <span class="w-6 text-center text-xs font-bold text-white tabular">{{ item.quantity }}</span>
                      <button
                        type="button"
                        (click)="cart.setQuantity(item.id, item.quantity + 1)"
                        class="size-6 rounded flex items-center justify-center text-foreground-dark/70 hover:bg-line-dark transition-colors cursor-pointer"
                        aria-label="Tăng số lượng"
                      >
                        <lucide-icon name="plus" class="w-3 h-3" aria-hidden="true"></lucide-icon>
                      </button>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs font-bold text-white tabular">{{ item.lineTotal | vnd }}</div>
                    <div class="text-[10px] text-muted tabular">{{ item.unitPrice | vnd }}/món</div>
                  </div>
                </div>
              </div>
            }

            <!-- System Compatibility Status -->
            <div class="p-2.5 rounded-lg bg-surface-elevated border border-line-dark flex items-center gap-2 text-xs text-foreground-dark/70">
              <lucide-icon name="shield-check" class="w-4 h-4 text-primary shrink-0" aria-hidden="true"></lucide-icon>
              <span>Kiểm tra hệ thống: <strong>Linh kiện trong giỏ tương thích 100%</strong></span>
            </div>
          }
        </div>

        <!-- Drawer Footer -->
        @if (cart.items().length) {
          <div class="flex-shrink-0 bg-surface-dark px-4 sm:px-6 py-4 border-t border-line-dark flex flex-col gap-2.5">
            <!-- Price Breakdown -->
            <div class="space-y-1.5 text-xs">
              <div class="flex items-center justify-between text-muted">
                <span>Tạm tính linh kiện ({{ cart.itemCount() }} món):</span>
                <span class="text-white font-medium tabular">{{ cart.subtotal() | vnd }}</span>
              </div>
              <div class="flex items-center justify-between text-muted">
                <span>Phí vận chuyển:</span>
                <span class="text-primary font-bold">Miễn phí (0 đ)</span>
              </div>
              <div class="pt-2 flex items-baseline justify-between border-t border-line-dark">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-white">Tổng thanh toán:</span>
                  <span class="text-[10px] text-slate-500">(Đã bao gồm thuế VAT 10%)</span>
                </div>
                <span class="text-base font-black text-primary tabular">{{ cart.subtotal() | vnd }}</span>
              </div>
            </div>

            <!-- COD Note -->
            <div class="px-2.5 py-1.5 rounded bg-surface-elevated border border-line-dark text-[11px] text-muted leading-tight">
              Cấu hình PC Custom Build chỉ cần đặt cọc trước 10% khi chọn hình thức thanh toán COD nhận hàng.
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 pt-1">
              <a
                routerLink="/checkout"
                (click)="cart.closeDrawer()"
                class="w-full h-10 rounded-lg bg-primary hover:bg-primary-strong text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <span>Tiến hành đặt hàng (Checkout)</span>
                <lucide-icon name="arrow-right" class="w-4 h-4" aria-hidden="true"></lucide-icon>
              </a>
              <div class="flex items-center justify-between text-xs pt-0.5">
                <button
                  type="button"
                  (click)="cart.closeDrawer()"
                  class="text-muted hover:text-white transition-colors cursor-pointer"
                >
                  « Tiếp tục xem linh kiện
                </button>
                <a
                  routerLink="/gio-hang"
                  (click)="cart.closeDrawer()"
                  class="text-primary hover:underline font-bold"
                >
                  Xem trang giỏ hàng chi tiết
                </a>
              </div>
            </div>
          </div>
        }
      </aside>
    }
  `,
})
export class CartDrawerComponent {
  protected readonly cart = inject(CartService);
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

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.cart.isDrawerOpen()) {
      this.cart.closeDrawer();
    }
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
}

