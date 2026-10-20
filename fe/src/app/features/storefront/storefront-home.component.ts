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
        
        <div class="lg:col-span-7 space-y-5">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider">
            <span class="size-2 rounded-full bg-primary animate-pulse"></span>
            THẾ HỆ LINH KIỆN PC 2026 MỚI NHẤT
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
            Cấu Hình Đỉnh Cao.<br>
            <span class="text-primary">Hiệu Năng Vượt Bậc.</span>
          </h1>
          <p class="text-foreground-dark/70 text-sm sm:text-base max-w-xl leading-relaxed">
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
          <div class="grid grid-cols-3 gap-4 pt-4 border-t border-line-dark">
            <div>
              <div class="text-2xl font-black text-primary tabular">158+</div>
              <div class="text-xs text-muted">Mẫu linh kiện sẵn kho</div>
            </div>
            <div>
              <div class="text-2xl font-black text-white tabular">100%</div>
              <div class="text-xs text-muted">Chính hãng fullbox</div>
            </div>
            <div>
              <div class="text-2xl font-black text-warning tabular">36T</div>
              <div class="text-xs text-muted">Bảo hành phân phối</div>
            </div>
          </div>
        </div>

        <!-- Featured PC Showcase Card Bento (HM-03) -->
        <div class="lg:col-span-5">
          <div class="relative bg-surface-elevated p-6 rounded-2xl border border-line-dark shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-line-dark">
              <div class="flex items-center gap-1.5">
                <span class="size-2 rounded-full bg-primary animate-pulse"></span>
                <span class="text-xs font-bold font-mono text-primary uppercase tracking-wider">EL-TITAN WORKSTATION V2</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-surface-dark text-muted font-caption text-[10px] font-mono">BOM-V2.8</span>
            </div>
            
            <div class="aspect-[4/3] rounded-xl bg-surface-dark border border-line-dark flex flex-col items-center justify-center p-5 text-center relative overflow-hidden group">
              <div class="size-16 rounded-lg bg-surface-elevated border border-line-dark flex items-center justify-center font-black text-xl text-primary shadow-inner">
                <lucide-icon name="Cpu" class="size-8 text-primary" aria-hidden="true"></lucide-icon>
              </div>
              <p class="mt-3 font-bold text-white text-sm">EL-TITAN WORKSTATION V2</p>
              <p class="text-xs text-muted mt-1">Core i9-14900K · RTX 4080 Super 16GB · 64GB DDR5</p>
              <span class="mt-3 text-[10px] text-primary bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Tối ưu 4K Rendering & AI Computing
              </span>
            </div>

            <!-- Quick Specs Pill Matrix -->
            <div class="grid grid-cols-2 gap-2 font-mono text-[11px] pb-1">
              <div class="bg-surface-dark p-2 rounded border border-line-dark">
                <span class="text-muted block text-[10px]">VI XỬ LÝ (CPU)</span>
                <span class="text-foreground-dark font-bold">i9-14900K (24C/32T)</span>
              </div>
              <div class="bg-surface-dark p-2 rounded border border-line-dark">
                <span class="text-muted block text-[10px]">ĐỒ HỌA (GPU)</span>
                <span class="text-primary font-bold">RTX 4080 Super 16GB</span>
              </div>
              <div class="bg-surface-dark p-2 rounded border border-line-dark">
                <span class="text-muted block text-[10px]">BỘ NHỚ RAM</span>
                <span class="text-foreground-dark font-bold">64GB DDR5 6000MHz</span>
              </div>
              <div class="bg-surface-dark p-2 rounded border border-line-dark">
                <span class="text-muted block text-[10px]">NGUỒN & TẢN NHIỆT</span>
                <span class="text-foreground-dark font-bold">1000W Titanium / AIO 360</span>
              </div>
            </div>

            <div class="pt-3 border-t border-line-dark flex items-center justify-between">
              <div>
                <span class="text-[10px] text-muted uppercase tracking-wider block">Giá combo ưu đãi trọn gói</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-base sm:text-lg font-black text-primary tabular font-mono">51.990.000 đ</span>
                  <span class="text-xs line-through text-slate-500 tabular">54.500.000 đ</span>
                </div>
              </div>
              <a
                routerLink="/tu-lap-pc"
                appButton
                variant="primary"
                size="md"
                class="shadow-sm font-bold"
              >
                <span>Tùy biến cấu hình này</span>
                <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Live Stock Telemetry Strip (HM-01) -->
    <section class="w-full bg-surface border-b border-line px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 text-primary font-bold">
          <span class="size-2.5 rounded-full bg-primary animate-pulse inline-block"></span>
          <span>Live Stock Telemetry:</span>
          <span class="hidden sm:inline text-muted font-normal">Dữ liệu kho thực tế đồng bộ 3 chi nhánh</span>
        </div>
        <div class="flex items-center gap-4 sm:gap-6 flex-wrap text-xs">
          <div class="flex items-center gap-1.5">
            <lucide-icon name="MapPin" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
            <span class="font-bold text-foreground">Hà Nội (Thái Hà):</span>
            <span class="text-primary font-mono font-bold">1.240 SKU sẵn kho</span>
          </div>
          <div class="flex items-center gap-1.5">
            <lucide-icon name="MapPin" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
            <span class="font-bold text-foreground">TP.HCM (Ba Tháng Hai):</span>
            <span class="text-primary font-mono font-bold">1.890 SKU sẵn kho</span>
          </div>
          <div class="flex items-center gap-1.5">
            <lucide-icon name="MapPin" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
            <span class="font-bold text-foreground">Đà Nẵng (Hàm Nghi):</span>
            <span class="text-primary font-mono font-bold">680 SKU sẵn kho</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Tri-Job Launchpad (HM-02) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Job 1: Build PC -->
        <a
          routerLink="/tu-lap-pc"
          class="p-5 rounded-xl bg-surface hover:bg-surface-alt border border-line hover:border-primary transition-all group flex flex-col justify-between shadow-sm"
        >
          <div>
            <div class="size-11 rounded-lg bg-surface-alt group-hover:bg-primary/10 border border-line flex items-center justify-center text-primary group-hover:scale-105 transition-all mb-3">
              <lucide-icon name="Wrench" class="size-5" aria-hidden="true"></lucide-icon>
            </div>
            <h3 class="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Trình Cấu Hình PC Chuyên Nghiệp
            </h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Tự chọn linh kiện, ước tính công suất nguồn PSU và tự động kiểm tra tương thích Socket, PCIe.
            </p>
          </div>
          <div class="flex items-center gap-1 text-primary text-xs font-bold mt-4">
            <span>Bắt đầu tự lắp PC</span>
            <lucide-icon name="ArrowRight" class="size-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true"></lucide-icon>
          </div>
        </a>

        <!-- Job 2: Prebuilt PCs -->
        <a
          routerLink="/pc-dung-san"
          class="p-5 rounded-xl bg-surface hover:bg-surface-alt border border-line hover:border-primary transition-all group flex flex-col justify-between shadow-sm"
        >
          <div>
            <div class="size-11 rounded-lg bg-surface-alt group-hover:bg-primary/10 border border-line flex items-center justify-center text-primary group-hover:scale-105 transition-all mb-3">
              <lucide-icon name="Package" class="size-5" aria-hidden="true"></lucide-icon>
            </div>
            <h3 class="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Bộ Sưu Tập PC Ráp Sẵn
            </h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Cấu hình mẫu tối ưu sẵn chi phí và hiệu năng, đã qua 24 giờ Stress Test nhiệt độ nghiêm ngặt.
            </p>
          </div>
          <div class="flex items-center gap-1 text-primary text-xs font-bold mt-4">
            <span>Xem 3 bộ máy tiêu biểu</span>
            <lucide-icon name="ArrowRight" class="size-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true"></lucide-icon>
          </div>
        </a>

        <!-- Job 3: Hardware Catalog -->
        <a
          routerLink="/san-pham"
          class="p-5 rounded-xl bg-surface hover:bg-surface-alt border border-line hover:border-primary transition-all group flex flex-col justify-between shadow-sm"
        >
          <div>
            <div class="size-11 rounded-lg bg-surface-alt group-hover:bg-primary/10 border border-line flex items-center justify-center text-primary group-hover:scale-105 transition-all mb-3">
              <lucide-icon name="Cpu" class="size-5" aria-hidden="true"></lucide-icon>
            </div>
            <h3 class="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Linh Kiện Lẻ Chính Hãng
            </h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Bộ xử lý CPU, Card đồ họa VGA, Bo mạch chủ, Nguồn máy tính, Tản nhiệt nước AIO nguyên seal.
            </p>
          </div>
          <div class="flex items-center gap-1 text-primary text-xs font-bold mt-4">
            <span>Khám phá toàn bộ danh mục</span>
            <lucide-icon name="ArrowRight" class="size-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true"></lucide-icon>
          </div>
        </a>
      </div>
    </section>

    <!-- Virtual Prebuilt BOM Collection Showcase (HM-04) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <span class="text-xs font-bold tracking-widest text-primary uppercase">CẤU HÌNH MẪU ĐƯỢC ƯA CHUỘNG</span>
          <h2 class="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
            Bộ Sưu Tập PC Ráp Sẵn Virtual Prebuilt BOM
          </h2>
          <p class="text-xs text-muted mt-1">Lắp ráp tiêu chuẩn, cài sẵn hệ điều hành và kiểm tra xung nhịp ổn định trước khi bàn giao</p>
        </div>
        <a routerLink="/pc-dung-san" class="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
          <span>Xem tất cả cấu hình PC</span>
          <lucide-icon name="ChevronRight" class="size-3.5" aria-hidden="true"></lucide-icon>
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Prebuilt 1: EL-CREATOR Studio 4K -->
        <article class="bg-surface rounded-xl p-5 border border-line shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded bg-surface-dark text-primary font-mono text-[10px] font-bold">
                CREATOR STUDIO
              </span>
              <span class="text-[10px] font-bold text-primary flex items-center gap-1">
                <span class="size-1.5 rounded-full bg-primary inline-block"></span>
                Bảo hành 36 tháng
              </span>
            </div>

            <div class="aspect-[4/3] rounded-lg bg-surface-alt border border-line flex flex-col items-center justify-center p-4 text-center">
              <lucide-icon name="Cpu" class="size-10 text-primary mb-2" aria-hidden="true"></lucide-icon>
              <h3 class="font-bold text-xs sm:text-sm text-foreground">PC EL-CREATOR Studio 4K</h3>
              <p class="text-[11px] text-muted mt-0.5">Dành cho đồ họa Premiere, DaVinci & Render 3D</p>
            </div>

            <div class="p-3 rounded-lg bg-surface-alt space-y-1.5 font-mono text-[11px] text-foreground border border-line/60">
              <div class="flex justify-between">
                <span class="text-muted">CPU:</span>
                <span class="font-semibold">Intel Core i7-14700K</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">VGA:</span>
                <span class="font-semibold text-primary">RTX 4070 Ti Super 16G</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">RAM:</span>
                <span class="font-semibold">32GB DDR5 6000MHz</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">SSD:</span>
                <span class="font-semibold">1TB Kingston KC3000</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-line mt-4 space-y-3">
            <div class="flex items-baseline justify-between">
              <span class="text-xs text-muted">Giá trọn gói:</span>
              <span class="text-lg font-bold text-primary font-mono tabular">41.890.000 đ</span>
            </div>
            <a
              routerLink="/tu-lap-pc"
              appButton
              variant="outline"
              size="md"
              class="w-full font-bold"
            >
              <lucide-icon name="Wrench" class="size-3.5" aria-hidden="true"></lucide-icon>
              <span>Tùy biến cấu hình này</span>
            </a>
          </div>
        </article>

        <!-- Prebuilt 2: EL-GAMING Apex Predator -->
        <article class="bg-surface rounded-xl p-5 border border-line shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded bg-surface-dark text-primary font-mono text-[10px] font-bold">
                GAMING APEX
              </span>
              <span class="text-[10px] font-bold text-primary flex items-center gap-1">
                <span class="size-1.5 rounded-full bg-primary inline-block"></span>
                Bảo hành 36 tháng
              </span>
            </div>

            <div class="aspect-[4/3] rounded-lg bg-surface-alt border border-line flex flex-col items-center justify-center p-4 text-center">
              <lucide-icon name="Zap" class="size-10 text-primary mb-2" aria-hidden="true"></lucide-icon>
              <h3 class="font-bold text-xs sm:text-sm text-foreground">PC EL-GAMING Apex Predator</h3>
              <p class="text-[11px] text-muted mt-0.5">Tối ưu Gaming 4K Esports, Ray Tracing & DLSS</p>
            </div>

            <div class="p-3 rounded-lg bg-surface-alt space-y-1.5 font-mono text-[11px] text-foreground border border-line/60">
              <div class="flex justify-between">
                <span class="text-muted">CPU:</span>
                <span class="font-semibold">Core Ultra 7 265K</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">VGA:</span>
                <span class="font-semibold text-primary">ROG RTX 5080 16GB</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">RAM:</span>
                <span class="font-semibold">32GB (2x16GB) DDR5</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">PSU:</span>
                <span class="font-semibold">850W Gold ATX 3.1</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-line mt-4 space-y-3">
            <div class="flex items-baseline justify-between">
              <span class="text-xs text-muted">Giá trọn gói:</span>
              <span class="text-lg font-bold text-primary font-mono tabular">55.290.000 đ</span>
            </div>
            <a
              routerLink="/tu-lap-pc"
              appButton
              variant="outline"
              size="md"
              class="w-full font-bold"
            >
              <lucide-icon name="Wrench" class="size-3.5" aria-hidden="true"></lucide-icon>
              <span>Tùy biến cấu hình này</span>
            </a>
          </div>
        </article>

        <!-- Prebuilt 3: EL-OFFICE Pro Slim -->
        <article class="bg-surface rounded-xl p-5 border border-line shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded bg-surface-dark text-primary font-mono text-[10px] font-bold">
                OFFICE PRO
              </span>
              <span class="text-[10px] font-bold text-primary flex items-center gap-1">
                <span class="size-1.5 rounded-full bg-primary inline-block"></span>
                Bảo hành 36 tháng
              </span>
            </div>

            <div class="aspect-[4/3] rounded-lg bg-surface-alt border border-line flex flex-col items-center justify-center p-4 text-center">
              <lucide-icon name="Package" class="size-10 text-primary mb-2" aria-hidden="true"></lucide-icon>
              <h3 class="font-bold text-xs sm:text-sm text-foreground">PC EL-OFFICE Pro Slim</h3>
              <p class="text-[11px] text-muted mt-0.5">Nhỏ gọn, êm ái cho văn phòng, doanh nghiệp & kế toán</p>
            </div>

            <div class="p-3 rounded-lg bg-surface-alt space-y-1.5 font-mono text-[11px] text-foreground border border-line/60">
              <div class="flex justify-between">
                <span class="text-muted">CPU:</span>
                <span class="font-semibold">Intel Core i5-14400</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">VGA:</span>
                <span class="font-semibold text-primary">Intel UHD 730 Onboard</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">RAM:</span>
                <span class="font-semibold">16GB DDR5 5200MHz</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">SSD:</span>
                <span class="font-semibold">500GB NVMe PCIe 4.0</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-line mt-4 space-y-3">
            <div class="flex items-baseline justify-between">
              <span class="text-xs text-muted">Giá trọn gói:</span>
              <span class="text-lg font-bold text-primary font-mono tabular">14.890.000 đ</span>
            </div>
            <a
              routerLink="/tu-lap-pc"
              appButton
              variant="outline"
              size="md"
              class="w-full font-bold"
            >
              <lucide-icon name="Wrench" class="size-3.5" aria-hidden="true"></lucide-icon>
              <span>Tùy biến cấu hình này</span>
            </a>
          </div>
        </article>
      </div>
    </section>

    <!-- Core Hardware Categories Showcase -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <a routerLink="/san-pham" [queryParams]="{ category: 'cpu' }" class="group p-3.5 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">CPU</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Bộ Vi Xử Lý</h3>
          <p class="text-[11px] text-muted mt-0.5">Intel, AMD Ryzen</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 4.890.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'vga' }" class="group p-3.5 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">VGA</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Card Đồ Họa</h3>
          <p class="text-[11px] text-muted mt-0.5">RTX 40 Series, Radeon</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 8.290.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'mainboard' }" class="group p-3.5 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">MAIN</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Bo Mạch Chủ</h3>
          <p class="text-[11px] text-muted mt-0.5">Z790, B760, X670</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 3.190.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'ram' }" class="group p-3.5 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">RAM</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Bộ Nhớ RAM</h3>
          <p class="text-[11px] text-muted mt-0.5">DDR5, DDR4 RGB</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 1.890.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'ssd' }" class="group p-3.5 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">SSD</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Ổ Cứng SSD</h3>
          <p class="text-[11px] text-muted mt-0.5">NVMe PCIe Gen 4/5</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 1.450.000 đ</span>
        </a>

        <a routerLink="/san-pham" [queryParams]="{ category: 'psu' }" class="group p-3.5 rounded-lg border border-line hover:border-primary bg-surface hover:shadow-sm transition-all text-center">
          <div class="size-12 mx-auto rounded-md bg-surface-alt group-hover:bg-primary/10 text-foreground group-hover:text-primary font-bold flex items-center justify-center text-xs transition-colors">PSU</div>
          <h3 class="font-bold text-xs text-foreground mt-2.5 group-hover:text-primary transition-colors">Nguồn Máy Tính</h3>
          <p class="text-[11px] text-muted mt-0.5">Chuẩn 80 Plus Gold</p>
          <span class="inline-block mt-1.5 text-[10px] font-semibold text-muted bg-surface-alt px-1.5 py-0.5 rounded-sm">Từ 1.990.000 đ</span>
        </a>
      </div>
    </section>

    <!-- Featured Products Grid from Real Catalog -->
    <section class="bg-surface-alt py-12 border-y border-line">
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
              <div class="h-80 animate-pulse rounded-lg bg-surface border border-line"></div>
            }
          </div>
        } @else {
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (product of products(); track product.id) {
              <article class="bg-surface rounded-lg border border-line overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between group shadow-sm">
                <div class="p-4">
                  <div class="relative aspect-square rounded-md bg-surface-alt flex items-center justify-center overflow-hidden mb-3 border border-line/50">
                    <span appBadge variant="primary" class="absolute top-2 left-2 text-[10px] py-0.5 px-1.5">[HOT DEAL]</span>
                    <span appBadge variant="outline" class="absolute top-2 right-2 text-[10px] py-0.5 px-1.5 bg-surface/90 text-primary border-line">SẴN KHO</span>
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
                  <p class="text-[11px] text-warning font-semibold mt-1">5/5 Sao (Đã kiểm định)</p>
                </div>

                <div class="p-4 pt-0 border-t border-line mt-1">
                  <div class="flex items-baseline justify-between mt-3">
                    <span class="text-base font-black text-foreground tabular">
                      {{ product.variants[0].sellingPrice | vnd }}
                    </span>
                    <span class="text-[10px] text-primary font-semibold">Đã gồm VAT</span>
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

    <!-- Quick Order Lookup Banner for Guests (HM-05) -->
    <section class="w-full bg-surface py-12 px-4 sm:px-6 lg:px-8 border-b border-line">
      <div class="max-w-7xl mx-auto rounded-2xl bg-surface-dark text-foreground-dark p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-line-dark">
        <div class="space-y-2 text-center lg:text-left relative z-10 max-w-xl">
          <span class="px-2.5 py-0.5 rounded bg-primary/20 text-primary font-caption text-[11px] font-bold uppercase tracking-wider">
            CỔNG TRA CỨU ĐƠN HÀNG NHANH
          </span>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Bạn Đã Đặt Mua Hàng Tại EL-TECH?
          </h2>
          <p class="text-xs text-muted leading-relaxed">
            Nhập mã đơn hàng (ví dụ: ELT-ABC1234567) hoặc số điện thoại để kiểm tra tiến độ lắp ráp, bài test nhiệt độ FurMark và vận đơn hỏa tốc.
          </p>
        </div>

        <div class="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10">
          <div class="relative min-w-[240px] sm:min-w-[280px]">
            <input
              type="text"
              class="w-full h-11 px-4 rounded-lg bg-surface-elevated text-xs font-mono font-bold text-white placeholder:text-muted border border-line-dark focus:border-primary focus:outline-none"
              placeholder="Nhập mã đơn hoặc số ĐT..."
              [(ngModel)]="quickLookupQuery"
              (keyup.enter)="navigateToLookup()"
            >
          </div>
          <button
            type="button"
            appButton
            variant="primary"
            size="md"
            class="h-11 font-bold whitespace-nowrap cursor-pointer"
            (click)="navigateToLookup()"
          >
            <lucide-icon name="Search" class="size-4" aria-hidden="true"></lucide-icon>
            <span>Tra cứu ngay</span>
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
