import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CatalogProduct, CatalogService } from '../catalog/catalog.service';
import { CartService } from '../../services/cart.service';
import { VndPipe } from '../../lib/vnd.pipe';
import { ProductImagePipe } from '../../lib/product-image.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

@Component({
  selector: 'app-storefront-home',
  imports: [FormsModule, RouterLink, VndPipe, ProductImagePipe, ButtonDirective, BadgeDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Enthusiast Showcase Hero Banner -->
    <section class="relative bg-surface-dark text-white overflow-hidden py-12 px-4 sm:px-6 lg:px-8 border-b border-line-dark">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(118,185,0,0.18),rgba(255,255,255,0))]"></div>
      <div class="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
        
        <div class="lg:col-span-7 space-y-4">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
            Cấu Hình Đỉnh Cao.<br>
            <span class="text-primary">Hiệu Năng Vượt Bậc.</span>
          </h1>
          <p class="text-foreground-dark/70 text-sm sm:text-base max-w-xl leading-relaxed">
            Hệ sinh thái phần cứng chính hãng tuyển chọn: Intel Gen 14, AMD Ryzen 7000/9000, NVIDIA RTX 40 Super. Kiểm tra độ tương thích và tồn kho theo thời gian thực.
          </p>
          
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <a
              routerLink="/san-pham"
              appButton
              variant="primary"
              size="lg"
            >
              <lucide-icon name="Cpu" class="size-4" aria-hidden="true"></lucide-icon>
              <span>Khám phá linh kiện</span>
            </a>
            <a
              routerLink="/tu-lap-pc"
              appButton
              variant="secondary"
              size="lg"
            >
              <lucide-icon name="Wrench" class="size-4" aria-hidden="true"></lucide-icon>
              <span>Đến PC Builder</span>
            </a>
          </div>
        </div>

        <!-- Featured PC Showcase -->
        <div class="lg:col-span-5">
          <div class="bg-surface-elevated p-6 rounded-2xl border border-line-dark shadow-xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-line-dark">
              <span class="text-xs font-bold text-primary uppercase tracking-wider">EL-TITAN WORKSTATION</span>
              <span class="text-xs text-muted">Dựng sẵn &amp; kiểm định</span>
            </div>
            
            <div class="space-y-2">
              <h3 class="font-bold text-white text-base">Intel Core i9-14900K · RTX 4080 Super</h3>
              <p class="text-xs text-muted">64GB DDR5 6000MHz · 1000W Platinum · Tản nước AIO 360</p>
            </div>

            <!-- Clean Specs Matrix -->
            <div class="grid grid-cols-2 gap-2 text-xs pt-1">
              <div class="bg-surface-dark p-2.5 rounded border border-line-dark">
                <span class="text-muted block text-xs font-semibold">VI XỬ LÝ</span>
                <span class="text-foreground-dark font-semibold">i9-14900K (24C/32T)</span>
              </div>
              <div class="bg-surface-dark p-2.5 rounded border border-line-dark">
                <span class="text-muted block text-xs font-semibold">CARD ĐỒ HỌA</span>
                <span class="text-primary font-semibold">RTX 4080 Super 16GB</span>
              </div>
              <div class="bg-surface-dark p-2.5 rounded border border-line-dark">
                <span class="text-muted block text-xs font-semibold">BỘ NHỚ RAM</span>
                <span class="text-foreground-dark font-semibold">64GB DDR5 6000</span>
              </div>
              <div class="bg-surface-dark p-2.5 rounded border border-line-dark">
                <span class="text-muted block text-xs font-semibold">LƯU TRỮ SSD</span>
                <span class="text-foreground-dark font-semibold">2TB NVMe Gen 4</span>
              </div>
            </div>

            <div class="pt-3 border-t border-line-dark flex items-center justify-between">
              <div>
                <span class="text-xs text-muted block">Giá combo trọn gói</span>
                <span class="text-lg font-black text-primary tabular">51.990.000 đ</span>
              </div>
              <a
                routerLink="/tu-lap-pc"
                appButton
                variant="primary"
                size="md"
                class="font-bold"
              >
                <span>Tùy chỉnh cấu hình</span>
                <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Core Hardware Categories Showcase -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex items-end justify-between mb-6">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-foreground tracking-tight">Danh Mục Linh Kiện</h2>
          <p class="text-xs text-muted mt-0.5">Linh kiện máy tính chính hãng bảo hành phân phối toàn quốc</p>
        </div>
        <a routerLink="/san-pham" class="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
          <span>Xem tất cả</span>
          <lucide-icon name="ChevronRight" class="size-3.5" aria-hidden="true"></lucide-icon>
        </a>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <a routerLink="/san-pham" [queryParams]="{ category: 'cpu' }" class="group p-4 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-xs transition-all text-center">
          <div class="size-11 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">CPU</div>
          <h3 class="font-bold text-xs text-foreground mt-2 group-hover:text-primary transition-colors">Bộ Vi Xử Lý</h3>
          <p class="text-xs text-muted mt-0.5">Intel, AMD Ryzen</p>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'vga' }" class="group p-4 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-xs transition-all text-center">
          <div class="size-11 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">VGA</div>
          <h3 class="font-bold text-xs text-foreground mt-2 group-hover:text-primary transition-colors">Card Đồ Họa</h3>
          <p class="text-xs text-muted mt-0.5">RTX 40 / 50 Series</p>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'mainboard' }" class="group p-4 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-xs transition-all text-center">
          <div class="size-11 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">MAIN</div>
          <h3 class="font-bold text-xs text-foreground mt-2 group-hover:text-primary transition-colors">Bo Mạch Chủ</h3>
          <p class="text-xs text-muted mt-0.5">Z790, B760, X670</p>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'ram' }" class="group p-4 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-xs transition-all text-center">
          <div class="size-11 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">RAM</div>
          <h3 class="font-bold text-xs text-foreground mt-2 group-hover:text-primary transition-colors">Bộ Nhớ RAM</h3>
          <p class="text-xs text-muted mt-0.5">DDR5, DDR4 RGB</p>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'ssd' }" class="group p-4 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-xs transition-all text-center">
          <div class="size-11 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">SSD</div>
          <h3 class="font-bold text-xs text-foreground mt-2 group-hover:text-primary transition-colors">Ổ Cứng SSD</h3>
          <p class="text-xs text-muted mt-0.5">NVMe PCIe Gen 4/5</p>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'psu' }" class="group p-4 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-xs transition-all text-center">
          <div class="size-11 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">PSU</div>
          <h3 class="font-bold text-xs text-foreground mt-2 group-hover:text-primary transition-colors">Nguồn Máy Tính</h3>
          <p class="text-xs text-muted mt-0.5">Chuẩn 80 Plus Gold</p>
        </a>
      </div>
    </section>

    <!-- Prebuilt PC Configurations -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-line">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Khám Phá Cấu Hình PC Dựng Sẵn
          </h2>
          <p class="text-xs text-muted mt-0.5">Lắp ráp tiêu chuẩn, cài sẵn hệ điều hành và kiểm tra xung nhịp ổn định trước khi bàn giao</p>
        </div>
        <a routerLink="/pc-dung-san" class="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
          <span>Xem tất cả cấu hình</span>
          <lucide-icon name="ChevronRight" class="size-3.5" aria-hidden="true"></lucide-icon>
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Prebuilt 1 -->
        <article class="bg-surface rounded-xl p-5 border border-line shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-foreground">CREATOR STUDIO</span>
              <span class="text-xs text-muted">Bảo hành 36 tháng</span>
            </div>

            <div class="space-y-1">
              <h3 class="font-bold text-sm text-foreground">PC EL-CREATOR Studio 4K</h3>
              <p class="text-xs text-muted">Tối ưu Premiere, DaVinci &amp; Render 3D</p>
            </div>

            <div class="space-y-1.5 text-xs text-muted pt-2 border-t border-line">
              <div class="flex justify-between">
                <span>CPU:</span>
                <span class="font-semibold text-foreground">Core i7-14700K</span>
              </div>
              <div class="flex justify-between">
                <span>VGA:</span>
                <span class="font-semibold text-primary">RTX 4070 Ti Super 16G</span>
              </div>
              <div class="flex justify-between">
                <span>RAM:</span>
                <span class="font-semibold text-foreground">32GB DDR5 6000MHz</span>
              </div>
              <div class="flex justify-between">
                <span>SSD:</span>
                <span class="font-semibold text-foreground">1TB Kingston KC3000</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-line mt-4 space-y-3">
            <div class="flex items-baseline justify-between">
              <span class="text-xs text-muted">Giá trọn gói:</span>
              <span class="text-base font-bold text-foreground tabular">41.890.000 đ</span>
            </div>
            <a
              routerLink="/tu-lap-pc"
              appButton
              variant="outline"
              size="md"
              class="w-full font-bold"
            >
              <lucide-icon name="Wrench" class="size-3.5" aria-hidden="true"></lucide-icon>
              <span>Tùy chỉnh cấu hình</span>
            </a>
          </div>
        </article>

        <!-- Prebuilt 2 -->
        <article class="bg-surface rounded-xl p-5 border border-line shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-foreground">GAMING APEX</span>
              <span class="text-xs text-muted">Bảo hành 36 tháng</span>
            </div>

            <div class="space-y-1">
              <h3 class="font-bold text-sm text-foreground">PC EL-GAMING Apex Predator</h3>
              <p class="text-xs text-muted">Chiến mượt Game 4K, Ray Tracing &amp; DLSS</p>
            </div>

            <div class="space-y-1.5 text-xs text-muted pt-2 border-t border-line">
              <div class="flex justify-between">
                <span>CPU:</span>
                <span class="font-semibold text-foreground">Core Ultra 7 265K</span>
              </div>
              <div class="flex justify-between">
                <span>VGA:</span>
                <span class="font-semibold text-primary">ROG RTX 5080 16GB</span>
              </div>
              <div class="flex justify-between">
                <span>RAM:</span>
                <span class="font-semibold text-foreground">32GB (2x16GB) DDR5</span>
              </div>
              <div class="flex justify-between">
                <span>PSU:</span>
                <span class="font-semibold text-foreground">850W Gold ATX 3.1</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-line mt-4 space-y-3">
            <div class="flex items-baseline justify-between">
              <span class="text-xs text-muted">Giá trọn gói:</span>
              <span class="text-base font-bold text-foreground tabular">55.290.000 đ</span>
            </div>
            <a
              routerLink="/tu-lap-pc"
              appButton
              variant="outline"
              size="md"
              class="w-full font-bold"
            >
              <lucide-icon name="Wrench" class="size-3.5" aria-hidden="true"></lucide-icon>
              <span>Tùy chỉnh cấu hình</span>
            </a>
          </div>
        </article>

        <!-- Prebuilt 3 -->
        <article class="bg-surface rounded-xl p-5 border border-line shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-foreground">OFFICE PRO</span>
              <span class="text-xs text-muted">Bảo hành 36 tháng</span>
            </div>

            <div class="space-y-1">
              <h3 class="font-bold text-sm text-foreground">PC EL-OFFICE Pro Slim</h3>
              <p class="text-xs text-muted">Nhỏ gọn, êm ái cho văn phòng &amp; doanh nghiệp</p>
            </div>

            <div class="space-y-1.5 text-xs text-muted pt-2 border-t border-line">
              <div class="flex justify-between">
                <span>CPU:</span>
                <span class="font-semibold text-foreground">Core i5-14400</span>
              </div>
              <div class="flex justify-between">
                <span>VGA:</span>
                <span class="font-semibold text-primary">Intel UHD 730 Onboard</span>
              </div>
              <div class="flex justify-between">
                <span>RAM:</span>
                <span class="font-semibold text-foreground">16GB DDR5 5200MHz</span>
              </div>
              <div class="flex justify-between">
                <span>SSD:</span>
                <span class="font-semibold text-foreground">500GB NVMe PCIe 4.0</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-line mt-4 space-y-3">
            <div class="flex items-baseline justify-between">
              <span class="text-xs text-muted">Giá trọn gói:</span>
              <span class="text-base font-bold text-foreground tabular">14.890.000 đ</span>
            </div>
            <a
              routerLink="/tu-lap-pc"
              appButton
              variant="outline"
              size="md"
              class="w-full font-bold"
            >
              <lucide-icon name="Wrench" class="size-3.5" aria-hidden="true"></lucide-icon>
              <span>Tùy chỉnh cấu hình</span>
            </a>
          </div>
        </article>
      </div>
    </section>

    <!-- Featured Products Grid -->
    <section class="bg-surface-alt py-10 border-y border-line">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-foreground tracking-tight">Sản Phẩm Nổi Bật</h2>
            <p class="text-xs text-muted mt-0.5">Linh kiện phần cứng bán chạy nhất tại hệ thống</p>
          </div>
          <a routerLink="/san-pham" class="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
            <span>Xem tất cả sản phẩm</span>
            <lucide-icon name="ChevronRight" class="size-3.5" aria-hidden="true"></lucide-icon>
          </a>
        </div>

        @if (loading()) {
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (item of [1, 2, 3, 4]; track item) {
              <div class="h-80 animate-pulse rounded-lg bg-surface border border-line"></div>
            }
          </div>
        } @else {
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (product of products(); track product.id) {
              <article class="bg-surface rounded-lg border border-line overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xs">
                <a [routerLink]="['/san-pham', product.category.slug, product.slug]" class="p-4 block">
                  <div class="relative aspect-square rounded-md bg-surface-alt flex items-center justify-center overflow-hidden mb-3 border border-line/50">
                    <span appBadge variant="outline" class="absolute top-2 right-2 text-xs py-0.5 px-1.5 bg-surface/90 text-primary border-line">SẴN KHO</span>
                    <img
                      [src]="product.media | productImage"
                      [alt]="product.name"
                      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      (error)="onImageError($event)"
                      loading="lazy"
                    >
                  </div>
                  <div class="text-xs font-bold text-primary uppercase">{{ product.brand.name }} · {{ product.category.name }}</div>
                  <h3 class="font-bold text-sm text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                    {{ product.name }}
                  </h3>
                  <p class="text-xs text-muted mt-1">{{ product.model }}</p>
                </a>

                <div class="p-4 pt-0 border-t border-line mt-1">
                  <div class="flex items-baseline justify-between mt-3">
                    <span class="text-base font-black text-foreground tabular">
                      {{ product.variants[0].sellingPrice | vnd }}
                    </span>
                    <span class="text-xs text-muted">Đã bao gồm VAT</span>
                  </div>
                  <div class="mt-3">
                    <button
                      type="button"
                      appButton
                      variant="primary"
                      size="sm"
                      class="w-full cursor-pointer"
                      [disabled]="addingSkuId() === product.variants[0].id"
                      (click)="addToCart(product)"
                    >
                      <lucide-icon name="ShoppingCart" class="size-3.5 mr-1" aria-hidden="true"></lucide-icon>
                      <span>{{ addingSkuId() === product.variants[0].id ? 'Đang thêm…' : (addedSkuId() === product.variants[0].id ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng') }}</span>
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </section>

    <!-- Quick Order Lookup Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="rounded-xl bg-surface-dark text-foreground-dark p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-line-dark shadow-xs">
        <div class="space-y-1 text-center md:text-left max-w-lg">
          <h2 class="text-lg sm:text-xl font-bold text-white tracking-tight">
            Tra Cứu Tiến Độ Đơn Hàng
          </h2>
          <p class="text-xs text-muted">
            Nhập mã đơn hàng hoặc số điện thoại để theo dõi lắp ráp và vận chuyển.
          </p>
        </div>

        <div class="w-full md:w-auto flex items-center gap-2">
          <input
            type="text"
            class="h-10 px-3.5 rounded-lg bg-surface-elevated text-sm font-semibold text-white placeholder:text-muted border border-line-dark focus:border-primary focus:outline-none w-full sm:w-64"
            placeholder="Mã đơn hoặc số ĐT..."
            [(ngModel)]="quickLookupQuery"
            (keyup.enter)="navigateToLookup()"
          >
          <button
            type="button"
            appButton
            variant="primary"
            size="md"
            class="h-10 font-bold whitespace-nowrap cursor-pointer"
            (click)="navigateToLookup()"
          >
            <lucide-icon name="Search" class="size-4" aria-hidden="true"></lucide-icon>
            <span>Tra cứu</span>
          </button>
        </div>
      </div>
    </section>
  `,
})
export class StorefrontHomeComponent {
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  protected readonly onImageError = handleProductImageError;
  protected readonly products = signal<readonly CatalogProduct[]>([]);
  protected readonly loading = signal(true);
  protected readonly addingSkuId = signal<number | null>(null);
  protected readonly addedSkuId = signal<number | null>(null);
  protected quickLookupQuery = '';

  constructor() {
    void this.load();
  }

  protected navigateToLookup(): void {
    const q = this.quickLookupQuery.trim();
    if (q) {
      void this.router.navigate(['/tra-cuu-don'], { queryParams: { code: q } });
    } else {
      void this.router.navigate(['/tra-cuu-don']);
    }
  }

  protected async addToCart(product: CatalogProduct): Promise<void> {
    const variant = product.variants[0];
    if (!variant) return;
    this.addingSkuId.set(variant.id);
    try {
      await this.cart.add(variant.id, 1);
      this.addedSkuId.set(variant.id);
      setTimeout(() => {
        if (this.addedSkuId() === variant.id) {
          this.addedSkuId.set(null);
        }
      }, 2500);
    } finally {
      this.addingSkuId.set(null);
    }
  }

  private async load(): Promise<void> {
    try {
      const result = await this.catalog.list();
      this.products.set(result.slice(0, 8));
    } catch {
      this.products.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
