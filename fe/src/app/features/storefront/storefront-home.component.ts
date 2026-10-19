import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  imports: [RouterLink, VndPipe, ProductImagePipe, ButtonDirective, BadgeDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Enthusiast Showcase Hero Banner -->
    <section class="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(118,185,0,0.18),rgba(255,255,255,0))]"></div>
      <div class="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
        
        <div class="lg:col-span-7 space-y-5">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider">
            <span class="size-2 rounded-full bg-primary animate-pulse"></span>
            THẾ HỆ LINH KIỆN PC 2026 MỚI NHẤT
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
            Cấu Hình Đỉnh Cao.<br>
            <span class="bg-gradient-to-r from-primary via-emerald-300 to-cyan-400 bg-clip-text text-transparent">Hiệu Năng Vượt Bậc.</span>
          </h1>
          <p class="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Hệ sinh thái phần cứng chính hãng tuyển chọn: Intel Gen 14, AMD Ryzen 7000/9000, NVIDIA RTX 40 Super. Kiểm tra độ tương thích và tồn kho theo thời gian thực.
          </p>
          
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <a
              routerLink="/san-pham"
              appButton
              variant="primary"
              size="lg"
            >
              <lucide-icon name="Cpu" class="size-4" aria-hidden="true"></lucide-icon>
              <span>Khám phá danh mục linh kiện</span>
            </a>
            <a
              routerLink="/tu-lap-pc"
              appButton
              variant="secondary"
              size="lg"
            >
              <lucide-icon name="Wrench" class="size-4" aria-hidden="true"></lucide-icon>
              <span>Tự lắp PC cấu hình chuẩn</span>
            </a>
          </div>

          <!-- Highlight hardware badges -->
          <div class="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <div class="text-2xl font-black text-primary tabular">158+</div>
              <div class="text-xs text-slate-400">Mẫu linh kiện sẵn kho</div>
            </div>
            <div>
              <div class="text-2xl font-black text-cyan-400 tabular">100%</div>
              <div class="text-xs text-slate-400">Chính hãng fullbox</div>
            </div>
            <div>
              <div class="text-2xl font-black text-amber-400 tabular">36T</div>
              <div class="text-xs text-slate-400">Bảo hành phân phối</div>
            </div>
          </div>
        </div>

        <!-- Featured PC Showcase Card -->
        <div class="lg:col-span-5">
          <div class="relative bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-border shadow-2xl space-y-4">
            <div class="flex items-center justify-between">
              <span appBadge variant="outline" class="border-rose-500/40 text-rose-400 bg-rose-500/10">CẤU HÌNH TIÊU BIỂU</span>
              <span class="text-xs text-slate-400">ELT-SPEC-01</span>
            </div>
            
            <div class="aspect-[4/3] rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-border flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
              <div class="size-16 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xl text-primary shadow-inner">
                PC
              </div>
              <p class="mt-3 font-bold text-slate-200 text-sm">EL-TECH TITAN GAMING PRO</p>
              <p class="text-xs text-slate-400 mt-1">i7 14700K · RTX 4070 Ti Super · 32GB DDR5</p>
              <span class="mt-3 text-[10px] text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-sm font-bold">
                TỐI ƯU 4K GAMING & RENDER 3D
              </span>
            </div>

            <div class="space-y-2 border-t border-border pt-4">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-slate-400">Giá trọn gói ưu đãi:</span>
                <div class="text-right">
                  <span class="text-xs line-through text-slate-500 tabular mr-2">48.900.000 đ</span>
                  <span class="text-2xl font-black text-primary tabular">44.990.000 đ</span>
                </div>
              </div>
              <a
                routerLink="/pc-dung-san"
                appButton
                variant="outline"
                size="md"
                class="w-full text-slate-200 hover:text-white"
              >
                <span>Xem chi tiết danh sách linh kiện BOM</span>
                <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Value Propositions Strip -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-surface p-4 rounded-lg shadow-sm border border-border flex items-start gap-3">
          <div class="size-9 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <lucide-icon name="ShieldCheck" class="size-5" aria-hidden="true"></lucide-icon>
          </div>
          <div>
            <h2 class="font-bold text-sm text-foreground">Chính Hãng Phân Phối</h2>
            <p class="text-xs text-muted mt-0.5 leading-relaxed">Đầy đủ hóa đơn VAT điện tử, tem bảo hành chính hãng từ nhà phân phối.</p>
          </div>
        </div>

        <div class="bg-surface p-4 rounded-lg shadow-sm border border-border flex items-start gap-3">
          <div class="size-9 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <lucide-icon name="Truck" class="size-5" aria-hidden="true"></lucide-icon>
          </div>
          <div>
            <h2 class="font-bold text-sm text-foreground">Giao Nhanh 2 Giờ</h2>
            <p class="text-xs text-muted mt-0.5 leading-relaxed">Hỗ trợ giao hỏa tốc nội thành Hà Nội & TP. Hồ Chí Minh trong 120 phút.</p>
          </div>
        </div>

        <div class="bg-surface p-4 rounded-lg shadow-sm border border-border flex items-start gap-3">
          <div class="size-9 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <lucide-icon name="RotateCcw" class="size-5" aria-hidden="true"></lucide-icon>
          </div>
          <div>
            <h2 class="font-bold text-sm text-foreground">1 Đổi 1 Trong 30 Ngày</h2>
            <p class="text-xs text-muted mt-0.5 leading-relaxed">Lỗi kỹ thuật phần cứng do nhà sản xuất được đổi ngay linh kiện mới nguyên hộp.</p>
          </div>
        </div>

        <div class="bg-surface p-4 rounded-lg shadow-sm border border-border flex items-start gap-3">
          <div class="size-9 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <lucide-icon name="Wrench" class="size-5" aria-hidden="true"></lucide-icon>
          </div>
          <div>
            <h2 class="font-bold text-sm text-foreground">Miễn Phí Ráp & Cài Đặt</h2>
            <p class="text-xs text-muted mt-0.5 leading-relaxed">Lắp ráp tiêu chuẩn phòng sạch, đi dây gọn gàng, test stress nhiệt độ 24h.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Hardware Categories Showcase -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-end justify-between mb-6">
        <div>
          <p class="text-xs font-bold tracking-widest text-primary uppercase">DANH MỤC TRỌNG TÂM</p>
          <h2 class="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">Linh Kiện Phần Cứng Cao Cấp</h2>
        </div>
        <a routerLink="/san-pham" class="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
          <span>Xem tất cả linh kiện</span>
          <lucide-icon name="ChevronRight" class="size-3.5" aria-hidden="true"></lucide-icon>
        </a>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <a routerLink="/san-pham" [queryParams]="{ category: 'cpu' }" class="group p-3.5 rounded-lg border border-border hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">CPU</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Bộ Vi Xử Lý</h3>
          <p class="text-[11px] text-muted mt-0.5">Intel, AMD Ryzen</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 4.890.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'vga' }" class="group p-3.5 rounded-lg border border-border hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">VGA</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Card Đồ Họa</h3>
          <p class="text-[11px] text-muted mt-0.5">RTX 40 Series, Radeon</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 8.290.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'mainboard' }" class="group p-3.5 rounded-lg border border-border hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">MAIN</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Bo Mạch Chủ</h3>
          <p class="text-[11px] text-muted mt-0.5">Z790, B760, X670</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 3.190.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'ram' }" class="group p-3.5 rounded-lg border border-border hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">RAM</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Bộ Nhớ RAM</h3>
          <p class="text-[11px] text-muted mt-0.5">DDR5, DDR4 RGB</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 1.890.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'ssd' }" class="group p-3.5 rounded-lg border border-border hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">SSD</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Ổ Cứng SSD</h3>
          <p class="text-[11px] text-muted mt-0.5">NVMe PCIe Gen 4/5</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 1.450.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'psu' }" class="group p-3.5 rounded-lg border border-border hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">PSU</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Nguồn Máy Tính</h3>
          <p class="text-[11px] text-muted mt-0.5">Chuẩn 80 Plus Gold</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 1.990.000 đ</span>
        </a>
      </div>
    </section>

    <!-- Featured Products Grid from Real Catalog -->
    <section class="bg-surface-alt py-12 border-y border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-6">
          <div>
            <p class="text-xs font-bold tracking-widest text-primary uppercase">SẢN PHẨM NỔI BẬT</p>
            <h2 class="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">Linh Kiện Bán Chạy Nhất</h2>
          </div>
          <a routerLink="/san-pham" class="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
            <span>Khám phá catalog đầy đủ</span>
            <lucide-icon name="ChevronRight" class="size-3.5" aria-hidden="true"></lucide-icon>
          </a>
        </div>

        @if (loading()) {
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (item of [1, 2, 3, 4]; track item) {
              <div class="h-80 animate-pulse rounded-lg bg-surface border border-border"></div>
            }
          </div>
        } @else {
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (product of products(); track product.id) {
              <article class="bg-surface rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between group shadow-sm">
                <div class="p-4">
                  <div class="relative aspect-square rounded-md bg-surface-alt flex items-center justify-center overflow-hidden mb-3 border border-border/50">
                    <span appBadge variant="primary" class="absolute top-2 left-2 text-[10px] py-0.5 px-1.5">[HOT DEAL]</span>
                    <span appBadge variant="outline" class="absolute top-2 right-2 text-[10px] py-0.5 px-1.5 bg-surface/90 text-emerald-400 border-border">SẴN KHO</span>
                    <img
                      [src]="product.media | productImage"
                      [alt]="product.name"
                      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      (error)="onImageError($event)"
                      loading="lazy"
                    >
                  </div>
                  <div class="text-[11px] font-bold text-primary uppercase">{{ product.brand.name }} · {{ product.category.name }}</div>
                  <h3 class="font-bold text-xs text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                    {{ product.name }}
                  </h3>
                  <p class="text-xs text-muted mt-1">{{ product.model }}</p>
                  <p class="text-[11px] text-amber-400 font-semibold mt-1">5/5 Sao (Đã kiểm định)</p>
                </div>

                <div class="p-4 pt-0 border-t border-border mt-1">
                  <div class="flex items-baseline justify-between mt-3">
                    <span class="text-base font-black text-foreground tabular">
                      {{ product.variants[0].sellingPrice | vnd }}
                    </span>
                    <span class="text-[10px] text-emerald-400 font-semibold">Đã gồm VAT</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 mt-3">
                    <a
                      [routerLink]="['/san-pham', product.category.slug, product.slug]"
                      appButton
                      variant="outline"
                      size="sm"
                    >
                      Chi tiết
                    </a>
                    <button
                      type="button"
                      appButton
                      variant="primary"
                      size="sm"
                      [disabled]="addingSkuId() === product.variants[0].id"
                      (click)="addToCart(product)"
                    >
                      <lucide-icon name="ShoppingCart" class="size-3.5" aria-hidden="true"></lucide-icon>
                      <span>{{ addingSkuId() === product.variants[0].id ? 'Đang thêm…' : (addedSkuId() === product.variants[0].id ? 'Đã thêm' : 'Thêm giỏ') }}</span>
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </section>

    <!-- Custom PC Builder Callout Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-xl p-6 sm:p-10 text-white border border-border shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="space-y-2.5 max-w-xl">
          <span appBadge variant="outline" class="border-primary/40 text-primary bg-primary/10">CÔNG CỤ TỰ BUILD PC THÔNG MINH</span>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight">Tự Lắp Ráp Bộ PC Của Riêng Bạn</h2>
          <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Hệ thống tự động kiểm tra tương thích chân socket CPU, chuẩn RAM, công suất bộ nguồn PSU và kích thước vỏ case. Tư vấn cấu hình tối ưu chi phí.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 shrink-0">
          <a
            routerLink="/tu-lap-pc"
            appButton
            variant="primary"
            size="lg"
          >
            <lucide-icon name="Wrench" class="size-4" aria-hidden="true"></lucide-icon>
            <span>Bắt đầu tự lắp PC</span>
          </a>
          <a
            routerLink="/pc-dung-san"
            appButton
            variant="secondary"
            size="lg"
          >
            <span>Xem PC dựng sẵn</span>
            <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
          </a>
        </div>
      </div>
    </section>
  `,
})
export class StorefrontHomeComponent {
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);

  protected readonly onImageError = handleProductImageError;
  protected readonly products = signal<readonly CatalogProduct[]>([]);
  protected readonly loading = signal(true);
  protected readonly addingSkuId = signal<number | null>(null);
  protected readonly addedSkuId = signal<number | null>(null);

  constructor() {
    void this.load();
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
