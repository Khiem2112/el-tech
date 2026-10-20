import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductImagePipe } from '../../lib/product-image.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';
import { VndPipe } from '../../lib/vnd.pipe';
import { CatalogBrand, CatalogCategory, CatalogProduct, CatalogService } from './catalog.service';
import { CartService } from '../../services/cart.service';
import { AppIconModule, BadgeDirective, ButtonDirective, InputDirective, SelectComponent, SelectOption } from '../../components/atoms';

@Component({
  selector: 'app-catalog-page',
  imports: [FormsModule, RouterLink, VndPipe, ProductImagePipe, AppIconModule, ButtonDirective, BadgeDirective, InputDirective, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<section class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  <!-- Breadcrumbs & Heading -->
  <div class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-line">
    <div>
      <nav class="text-xs text-muted font-medium mb-1">
        <a routerLink="/" class="hover:text-foreground">Trang chủ</a> / 
        <span class="text-foreground font-semibold">Linh kiện PC</span>
      </nav>
      <h1 class="text-2xl font-black text-foreground tracking-tight">Linh Kiện Máy Tính &amp; PC</h1>
    </div>
    <div class="flex items-center gap-2">
      <!-- Mobile Filter Trigger Button -->
      <button
        type="button"
        (click)="mobileFilterOpen.set(true)"
        class="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line bg-surface text-xs font-bold text-foreground hover:bg-surface-alt transition-colors cursor-pointer"
        aria-label="Mở bộ lọc tìm kiếm"
      >
        <lucide-icon name="filter" class="w-3.5 h-3.5 text-primary" aria-hidden="true"></lucide-icon>
        <span>Bộ lọc</span>
        @if (hasActiveFilters()) {
          <span class="size-2 rounded-full bg-primary inline-block"></span>
        }
      </button>

      <div class="text-xs text-muted bg-surface-alt px-3 py-1.5 rounded-md border border-line">
        Hiển thị: <strong class="text-foreground tabular">{{ products().length }}</strong> linh kiện
      </div>
    </div>
  </div>

  <div class="grid lg:grid-cols-12 gap-6 mt-6 items-start">
    <!-- Left Sidebar: Faceted Filter Panel (Col 3) - Sticky on Desktop -->
    <aside class="hidden lg:block lg:col-span-3 space-y-4 lg:sticky lg:top-4 self-start">
      <div class="bg-surface p-4 rounded-lg border border-line space-y-4 shadow-sm">
        <div class="flex items-center justify-between border-b border-line pb-3">
          <div class="flex items-center gap-2">
            <lucide-icon name="sliders-horizontal" class="w-4 h-4 text-primary" aria-hidden="true"></lucide-icon>
            <span class="text-xs font-bold uppercase tracking-wider text-foreground">Bộ Lọc Tìm Kiếm</span>
          </div>
          @if (hasActiveFilters()) {
            <button
              type="button"
              (click)="clear()"
              class="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline cursor-pointer"
            >
              <lucide-icon name="trash-2" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
              <span>Xóa tất cả</span>
            </button>
          }
        </div>

        <!-- Keyword search box -->
        <div>
          <label class="block text-xs font-bold text-foreground mb-1.5">Từ khóa tìm kiếm</label>
          <div class="relative flex items-center">
            <lucide-icon name="search" class="absolute left-2.5 w-4 h-4 text-muted pointer-events-none" aria-hidden="true"></lucide-icon>
            <input
              type="text"
              appInput
              class="pl-8.5 pr-8"
              [(ngModel)]="query"
              (keyup.enter)="search()"
              placeholder="Tên, hãng hoặc model..."
            >
            @if (query.trim()) {
              <button
                type="button"
                (click)="removeQuery()"
                class="absolute right-2 p-1 text-muted hover:text-danger rounded transition-colors cursor-pointer"
                aria-label="Xóa từ khóa"
              >
                <lucide-icon name="x" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
              </button>
            }
          </div>
        </div>

        <!-- Categories Combobox -->
        <div>
          <label class="block text-xs font-bold text-foreground mb-1.5">Danh mục linh kiện</label>
          <app-select
            [options]="categoryOptions()"
            [value]="category()"
            (valueChange)="setCategory($event)"
            [searchable]="true"
            placeholder="Tất cả danh mục"
            searchPlaceholder="Tìm danh mục linh kiện..."
            size="sm"
            ariaLabel="Chọn danh mục linh kiện"
          />
        </div>

        <!-- Brand Chips -->
        <div>
          <label class="block text-xs font-bold text-foreground mb-1.5">Thương hiệu</label>
          <div class="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              (click)="setBrand('')"
              class="px-2.5 py-1 rounded-md border text-left text-xs transition-colors cursor-pointer"
              [class.border-primary]="!brand()"
              [class.bg-primary]="!brand()"
              [class.text-primary-foreground]="!brand()"
              [class.font-bold]="!brand()"
              [class.border-line]="brand()"
              [class.bg-surface]="brand()"
              [class.text-muted]="brand()"
            >
              Tất cả
            </button>
            @for (item of brands(); track item.id) {
              <button
                type="button"
                (click)="setBrand(item.slug)"
                class="px-2.5 py-1 rounded-md border text-left text-xs transition-colors cursor-pointer"
                [class.border-primary]="brand() === item.slug"
                [class.bg-primary]="brand() === item.slug"
                [class.text-primary-foreground]="brand() === item.slug"
                [class.font-bold]="brand() === item.slug"
                [class.border-line]="brand() !== item.slug"
                [class.bg-surface]="brand() !== item.slug"
                [class.text-muted]="brand() !== item.slug"
              >
                {{ item.name }}
              </button>
            }
          </div>
        </div>

        <!-- Branch Availability -->
        <div class="pt-2 border-t border-line">
          <label class="block text-xs font-bold text-foreground mb-1.5">Chi nhánh sẵn hàng</label>
          <div class="space-y-1.5 text-xs">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="branch_filter"
                [checked]="!branch()"
                (change)="setBranch('')"
                class="accent-primary"
              >
              <span [class.font-bold]="!branch()">Tất cả showroom</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="branch_filter"
                [checked]="branch() === 'hn'"
                (change)="setBranch('hn')"
                class="accent-primary"
              >
              <span [class.font-bold]="branch() === 'hn'">Hà Nội (45 Thái Hà)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="branch_filter"
                [checked]="branch() === 'hcm'"
                (change)="setBranch('hcm')"
                class="accent-primary"
              >
              <span [class.font-bold]="branch() === 'hcm'">TP.HCM (280 3/2)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="branch_filter"
                [checked]="branch() === 'dn'"
                (change)="setBranch('dn')"
                class="accent-primary"
              >
              <span [class.font-bold]="branch() === 'dn'">Đà Nẵng (112 Hàm Nghi)</span>
            </label>
          </div>
        </div>

        <!-- Price Range Options -->
        <div class="pt-2 border-t border-line">
          <label class="block text-xs font-bold text-foreground mb-1.5">Khoảng giá ngân sách</label>
          <div class="space-y-1.5 text-xs">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price_preset"
                [checked]="!pricePreset()"
                (change)="setPricePreset('')"
                class="accent-primary"
              >
              <span class="text-muted">Tất cả mức giá</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price_preset"
                [checked]="pricePreset() === 'under-5m'"
                (change)="setPricePreset('under-5m')"
                class="accent-primary"
              >
              <span [class.font-bold]="pricePreset() === 'under-5m'">Dưới 5 triệu</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price_preset"
                [checked]="pricePreset() === '5m-15m'"
                (change)="setPricePreset('5m-15m')"
                class="accent-primary"
              >
              <span [class.font-bold]="pricePreset() === '5m-15m'">5 - 15 triệu</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price_preset"
                [checked]="pricePreset() === '15m-30m'"
                (change)="setPricePreset('15m-30m')"
                class="accent-primary"
              >
              <span [class.font-bold]="pricePreset() === '15m-30m'">15 - 30 triệu</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price_preset"
                [checked]="pricePreset() === 'over-30m'"
                (change)="setPricePreset('over-30m')"
                class="accent-primary"
              >
              <span [class.font-bold]="pricePreset() === 'over-30m'">Trên 30 triệu</span>
            </label>
          </div>
        </div>

        <!-- Reset CTA button -->
        <div class="pt-2 border-t border-line">
          <button
            type="button"
            appButton
            variant="primary"
            size="md"
            (click)="search()"
            class="w-full cursor-pointer"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </aside>

    <!-- Right Column: Toolbar & Product Grid/List (Col 9) -->
    <div class="lg:col-span-9 space-y-4">
      <!-- Toolbar & Active Filter Chips -->
      <div class="bg-surface p-3 rounded-lg border border-line flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div class="flex flex-wrap items-center gap-2">
          @if (hasActiveFilters()) {
            <span class="text-muted font-medium">Bộ lọc:</span>
            @if (category(); as catSlug) {
              <span class="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-alt px-2 py-0.5 text-xs font-semibold text-foreground">
                Danh mục: {{ categoryName() }}
                <button type="button" class="text-muted hover:text-danger cursor-pointer p-0.5" (click)="removeCategory()" aria-label="Xóa danh mục">
                  <lucide-icon name="x" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                </button>
              </span>
            }
            @if (brand(); as brandSlug) {
              <span class="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-alt px-2 py-0.5 text-xs font-semibold text-foreground">
                Hãng: {{ brandName() }}
                <button type="button" class="text-muted hover:text-danger cursor-pointer p-0.5" (click)="removeBrand()" aria-label="Xóa hãng">
                  <lucide-icon name="x" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                </button>
              </span>
            }
            @if (branch(); as branchCode) {
              <span class="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-alt px-2 py-0.5 text-xs font-semibold text-foreground">
                Kho: {{ branchCode.toUpperCase() }}
                <button type="button" class="text-muted hover:text-danger cursor-pointer p-0.5" (click)="removeBranch()" aria-label="Xóa kho">
                  <lucide-icon name="x" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                </button>
              </span>
            }
            @if (pricePreset(); as priceLabel) {
              <span class="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-alt px-2 py-0.5 text-xs font-semibold text-foreground">
                Giá: {{ pricePresetName() }}
                <button type="button" class="text-muted hover:text-danger cursor-pointer p-0.5" (click)="removePrice()" aria-label="Xóa giá">
                  <lucide-icon name="x" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                </button>
              </span>
            }
            @if (query.trim()) {
              <span class="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-alt px-2 py-0.5 text-xs font-semibold text-foreground">
                Từ khóa: "{{ query.trim() }}"
                <button type="button" class="text-muted hover:text-danger cursor-pointer p-0.5" (click)="removeQuery()" aria-label="Xóa từ khóa">
                  <lucide-icon name="x" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                </button>
              </span>
            }
            <button type="button" class="text-xs font-bold text-primary hover:underline cursor-pointer" (click)="clear()">Xóa tất cả</button>
          } @else {
            <span class="text-muted">Đang xem tất cả linh kiện sẵn sàng đặt hàng</span>
          }
        </div>

        <div class="flex items-center gap-3 ml-auto">
          <!-- Sort Dropdown -->
          <div class="flex items-center gap-1.5">
            <span class="text-muted">Sắp xếp:</span>
            <div class="w-44">
              <app-select
                [options]="sortOptions"
                [value]="sort()"
                (valueChange)="setSort($event)"
                placeholder="Mặc định"
                size="sm"
                ariaLabel="Sắp xếp sản phẩm"
              />
            </div>
          </div>

          <!-- View Mode Toggle (Grid vs List) -->
          <div class="flex items-center rounded-md border border-line bg-surface p-0.5">
            <button
              type="button"
              (click)="viewMode.set('grid')"
              class="p-1 rounded transition-colors cursor-pointer"
              [class.bg-primary]="viewMode() === 'grid'"
              [class.text-primary-foreground]="viewMode() === 'grid'"
              [class.text-muted]="viewMode() !== 'grid'"
              aria-label="Chế độ xem dạng lưới"
              title="Xem dạng lưới"
            >
              <lucide-icon name="layout-grid" class="w-4 h-4" aria-hidden="true"></lucide-icon>
            </button>
            <button
              type="button"
              (click)="viewMode.set('list')"
              class="p-1 rounded transition-colors cursor-pointer"
              [class.bg-primary]="viewMode() === 'list'"
              [class.text-primary-foreground]="viewMode() === 'list'"
              [class.text-muted]="viewMode() !== 'list'"
              aria-label="Chế độ xem danh sách"
              title="Xem danh sách"
            >
              <lucide-icon name="list" class="w-4 h-4" aria-hidden="true"></lucide-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- State Views: Loading / Error / Empty / Grid / List -->
      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (item of [1, 2, 3, 4, 5, 6]; track item) {
            <div class="h-80 animate-pulse rounded-lg bg-surface border border-line"></div>
          }
        </div>
      } @else if (error()) {
        <div class="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center" role="alert">
          <p class="font-bold text-foreground">Không thể tải danh sách linh kiện</p>
          <p class="mt-1 text-xs text-muted">Dữ liệu hiện có của bạn vẫn an toàn. Hãy kiểm tra kết nối và thử lại.</p>
          <button appButton variant="primary" size="md" class="mt-4" type="button" (click)="load()">Thử lại</button>
        </div>
      } @else if (!products().length) {
        <div class="rounded-lg border border-dashed border-line p-10 text-center bg-surface">
          <p class="font-bold text-base text-foreground">Không tìm thấy linh kiện nào phù hợp</p>
          <p class="mt-1 text-xs text-muted">Hãy thử chọn danh mục khác, giảm bớt điều kiện lọc hoặc xóa từ khóa tìm kiếm.</p>
          <button appButton variant="primary" size="md" class="mt-4 cursor-pointer" type="button" (click)="clear()">Xóa toàn bộ bộ lọc</button>
        </div>
      } @else if (viewMode() === 'grid') {
        <!-- Grid View -->
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (product of products(); track product.id) {
            <article class="bg-surface rounded-lg border border-line overflow-hidden hover:shadow-card-hover transition-all flex flex-col justify-between group">
              <div class="p-3.5">
                <div class="relative aspect-square rounded-md bg-surface-alt flex items-center justify-center overflow-hidden mb-2.5">
                  <span appBadge variant="success" class="absolute top-2 left-2 text-[10px] font-bold">SẴN HÀNG</span>
                  <span appBadge variant="outline" class="absolute top-2 right-2 text-[10px] bg-surface/90">CHÍNH HÃNG</span>
                  <img
                    [src]="product.media | productImage"
                    [alt]="product.name"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    (error)="onImageError($event)"
                    loading="lazy"
                  >
                </div>
                
                <div class="text-[11px] font-bold text-primary uppercase tracking-wide">
                  {{ product.brand.name }} · {{ product.category.name }}
                </div>
                <h2 class="font-bold text-sm text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                  {{ product.name }}
                </h2>
                <p class="text-xs text-muted mt-1">{{ product.model }}</p>
                <div class="text-[11px] text-primary-strong font-semibold mt-1">Đã kiểm tra tương thích PC</div>
              </div>

              <div class="p-3.5 pt-0 border-t border-line mt-1">
                <div class="flex items-baseline justify-between mt-2.5">
                  <span class="text-lg font-black text-foreground tabular">
                    {{ product.variants[0].sellingPrice | vnd }}
                  </span>
                  <span class="text-[10px] text-muted">Đã gồm VAT</span>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-2.5">
                  <a
                    appButton
                    variant="outline"
                    size="sm"
                    [routerLink]="['/san-pham', product.category.slug, product.slug]"
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
                    <lucide-icon name="shopping-cart" class="w-3.5 h-3.5 mr-1" aria-hidden="true"></lucide-icon>
                    <span>{{ addingSkuId() === product.variants[0].id ? 'Đang thêm…' : (addedSkuId() === product.variants[0].id ? 'Đã thêm' : 'Thêm giỏ') }}</span>
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      } @else {
        <!-- List View -->
        <div class="space-y-3">
          @for (product of products(); track product.id) {
            <article class="bg-surface rounded-lg border border-line p-4 hover:shadow-card-hover transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              <div class="flex items-center gap-4 min-w-0 flex-1">
                <div class="size-24 rounded-md bg-surface-alt flex items-center justify-center shrink-0 overflow-hidden relative p-1 border border-line">
                  <img
                    [src]="product.media | productImage"
                    [alt]="product.name"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    (error)="onImageError($event)"
                    loading="lazy"
                  >
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-bold text-primary uppercase">{{ product.brand.name }} · {{ product.category.name }}</span>
                    <span appBadge variant="success" size="sm" class="text-[10px]">SẴN HÀNG</span>
                  </div>
                  <h2 class="font-bold text-sm text-foreground line-clamp-1 mt-0.5 group-hover:text-primary transition-colors">
                    {{ product.name }}
                  </h2>
                  <p class="text-xs text-muted mt-0.5 line-clamp-1">Model: {{ product.model }} · {{ product.description || 'Linh kiện chính hãng đầy đủ tem serial bảo hành 36 tháng.' }}</p>
                  <div class="text-[11px] text-primary-strong font-medium mt-1">Sẵn hàng tại HN 45 Thái Hà &amp; HCM 280 3/2</div>
                </div>
              </div>

              <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-line gap-2">
                <div class="text-left sm:text-right">
                  <div class="text-base font-black text-foreground tabular">{{ product.variants[0].sellingPrice | vnd }}</div>
                  <div class="text-[10px] text-muted">Đã bao gồm VAT</div>
                </div>
                <div class="flex items-center gap-2">
                  <a
                    appButton
                    variant="outline"
                    size="sm"
                    [routerLink]="['/san-pham', product.category.slug, product.slug]"
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
                    <lucide-icon name="shopping-cart" class="w-3.5 h-3.5 mr-1" aria-hidden="true"></lucide-icon>
                    <span>Thêm giỏ</span>
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </div>
  </div>

  <!-- Mobile Filter Modal Drawer -->
  @if (mobileFilterOpen()) {
    <div
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
      (click)="mobileFilterOpen.set(false)"
      aria-hidden="true"
    ></div>
    <div class="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-surface p-4 shadow-xl flex flex-col space-y-4 overflow-y-auto lg:hidden">
      <div class="flex items-center justify-between pb-2 border-b border-line">
        <h3 class="text-sm font-bold text-foreground">Bộ Lọc Tìm Kiếm</h3>
        <button
          type="button"
          (click)="mobileFilterOpen.set(false)"
          class="p-1 rounded text-muted hover:text-foreground cursor-pointer"
          aria-label="Đóng bộ lọc"
        >
          <lucide-icon name="x" class="w-5 h-5" aria-hidden="true"></lucide-icon>
        </button>
      </div>

      <!-- Mobile Category Select -->
      <div>
        <label class="block text-xs font-bold text-foreground mb-1">Danh mục linh kiện</label>
        <app-select
          [options]="categoryOptions()"
          [(value)]="tempCategory"
          [searchable]="true"
          placeholder="Tất cả danh mục"
          size="sm"
          ariaLabel="Chọn danh mục linh kiện"
        />
      </div>

      <!-- Mobile Brand Select -->
      <div>
        <label class="block text-xs font-bold text-foreground mb-1">Thương hiệu</label>
        <select
          [(ngModel)]="tempBrand"
          class="w-full text-xs p-2 rounded border border-line bg-surface-alt"
        >
          <option value="">Tất cả thương hiệu</option>
          @for (item of brands(); track item.id) {
            <option [value]="item.slug">{{ item.name }}</option>
          }
        </select>
      </div>

      <!-- Mobile Branch Select -->
      <div>
        <label class="block text-xs font-bold text-foreground mb-1">Chi nhánh sẵn hàng</label>
        <select
          [(ngModel)]="tempBranch"
          class="w-full text-xs p-2 rounded border border-line bg-surface-alt"
        >
          <option value="">Tất cả showroom</option>
          <option value="hn">Hà Nội (45 Thái Hà)</option>
          <option value="hcm">TP.HCM (280 Ba Tháng Hai)</option>
          <option value="dn">Đà Nẵng (112 Hàm Nghi)</option>
        </select>
      </div>

      <!-- Mobile Price Select -->
      <div>
        <label class="block text-xs font-bold text-foreground mb-1">Khoảng giá</label>
        <select
          [(ngModel)]="tempPricePreset"
          class="w-full text-xs p-2 rounded border border-line bg-surface-alt"
        >
          <option value="">Tất cả mức giá</option>
          <option value="under-5m">Dưới 5 triệu</option>
          <option value="5m-15m">5 - 15 triệu</option>
          <option value="15m-30m">15 - 30 triệu</option>
          <option value="over-30m">Trên 30 triệu</option>
        </select>
      </div>

      <div class="mt-auto pt-4 border-t border-line space-y-2">
        <button
          type="button"
          appButton
          variant="primary"
          size="md"
          class="w-full cursor-pointer"
          (click)="applyMobileFilters()"
        >
          Áp dụng bộ lọc
        </button>
        <button
          type="button"
          appButton
          variant="outline"
          size="sm"
          class="w-full cursor-pointer"
          (click)="clear(); mobileFilterOpen.set(false)"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    </div>
  }
</section>
  `,
})
export class CatalogPageComponent {
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly onImageError = handleProductImageError;
  protected readonly products = signal<readonly CatalogProduct[]>([]);
  protected readonly categories = signal<readonly CatalogCategory[]>([]);
  protected readonly brands = signal<readonly CatalogBrand[]>([]);
  protected readonly category = signal('');
  protected readonly brand = signal('');
  protected readonly branch = signal('');
  protected readonly minPrice = signal<number | null>(null);
  protected readonly maxPrice = signal<number | null>(null);
  protected readonly pricePreset = signal('');
  protected readonly sort = signal('');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly mobileFilterOpen = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly addingSkuId = signal<number | null>(null);
  protected readonly addedSkuId = signal<number | null>(null);
  protected query = '';

  protected tempCategory = '';
  protected tempBrand = '';
  protected tempBranch = '';
  protected tempPricePreset = '';

  protected readonly sortOptions: readonly SelectOption[] = [
    { value: '', label: 'Mặc định' },
    { value: 'price_asc', label: 'Giá: Thấp đến cao' },
    { value: 'price_desc', label: 'Giá: Cao đến thấp' },
    { value: 'name_asc', label: 'Tên: A đến Z' },
    { value: 'name_desc', label: 'Tên: Z đến A' },
  ];

  protected readonly categoryOptions = computed<readonly SelectOption[]>(() => [
    { value: '', label: 'Tất cả danh mục' },
    ...this.categories().map((c) => ({
      value: c.slug,
      label: c.name,
    })),
  ]);

  protected readonly categoryName = computed(() => {
    const slug = this.category();
    const item = this.categories().find((candidate) => candidate.slug === slug);
    return item ? item.name : slug;
  });

  protected readonly brandName = computed(() => {
    const slug = this.brand();
    const item = this.brands().find((candidate) => candidate.slug === slug);
    return item ? item.name : slug;
  });

  protected readonly pricePresetName = computed(() => {
    switch (this.pricePreset()) {
      case 'under-5m': return 'Dưới 5 triệu';
      case '5m-15m': return '5 - 15 triệu';
      case '15m-30m': return '15 - 30 triệu';
      case 'over-30m': return 'Trên 30 triệu';
      default: return '';
    }
  });

  protected readonly sortName = computed(() => {
    switch (this.sort()) {
      case 'price_asc': return 'Giá tăng dần';
      case 'price_desc': return 'Giá giảm dần';
      case 'name_asc': return 'Tên A-Z';
      case 'name_desc': return 'Tên Z-A';
      default: return '';
    }
  });

  protected readonly hasActiveFilters = computed(() => {
    return Boolean(this.category() || this.brand() || this.branch() || this.pricePreset() || this.sort() || this.query.trim());
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') ?? '';
      this.category.set(params.get('category') ?? '');
      this.brand.set(params.get('brand') ?? '');
      this.branch.set(params.get('branch') ?? '');
      const min = params.get('minPrice') ? Number(params.get('minPrice')) : null;
      const max = params.get('maxPrice') ? Number(params.get('maxPrice')) : null;
      this.minPrice.set(min);
      this.maxPrice.set(max);
      this.pricePreset.set(this.calculatePresetFromRange(min, max));
      this.sort.set(params.get('sort') ?? '');
      void this.load();
    });
    void this.loadMetadata();
  }

  protected async addToCart(product: CatalogProduct): Promise<void> {
    const variant = product.variants[0];
    if (!variant) return;
    this.addingSkuId.set(variant.id);
    try {
      await this.cart.add(variant.id, 1);
      this.addedSkuId.set(variant.id);
      this.cart.openDrawer();
      setTimeout(() => {
        if (this.addedSkuId() === variant.id) {
          this.addedSkuId.set(null);
        }
      }, 2500);
    } finally {
      this.addingSkuId.set(null);
    }
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      this.products.set(
        await this.catalog.list({
          query: this.query,
          category: this.category(),
          brand: this.brand(),
          minPrice: this.minPrice(),
          maxPrice: this.maxPrice(),
          sort: this.sort(),
        }),
      );
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected search(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.query.trim() || null,
        category: this.category() || null,
        brand: this.brand() || null,
        branch: this.branch() || null,
        minPrice: this.minPrice() !== null ? this.minPrice() : null,
        maxPrice: this.maxPrice() !== null ? this.maxPrice() : null,
        sort: this.sort() || null,
      },
      queryParamsHandling: '',
    });
  }

  protected setCategory(category: string): void {
    this.category.set(category);
    this.search();
  }

  protected setBrand(brand: string): void {
    this.brand.set(brand);
    this.search();
  }

  protected setBranch(branch: string): void {
    this.branch.set(branch);
    this.search();
  }

  protected setSort(sort: string): void {
    this.sort.set(sort);
    this.search();
  }

  protected setPricePreset(preset: string): void {
    this.pricePreset.set(preset);
    let min: number | null = null;
    let max: number | null = null;
    if (preset === 'under-5m') {
      max = 5000000;
    } else if (preset === '5m-15m') {
      min = 5000000;
      max = 15000000;
    } else if (preset === '15m-30m') {
      min = 15000000;
      max = 30000000;
    } else if (preset === 'over-30m') {
      min = 30000000;
    }
    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.search();
  }

  protected removeCategory(): void {
    this.category.set('');
    this.search();
  }

  protected removeBrand(): void {
    this.brand.set('');
    this.search();
  }

  protected removeBranch(): void {
    this.branch.set('');
    this.search();
  }

  protected removePrice(): void {
    this.pricePreset.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.search();
  }

  protected removeQuery(): void {
    this.query = '';
    this.search();
  }

  protected removeSort(): void {
    this.sort.set('');
    this.search();
  }

  protected clear(): void {
    this.query = '';
    this.category.set('');
    this.brand.set('');
    this.branch.set('');
    this.pricePreset.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sort.set('');
    this.search();
  }

  protected applyMobileFilters(): void {
    this.category.set(this.tempCategory);
    this.brand.set(this.tempBrand);
    this.branch.set(this.tempBranch);
    if (this.tempPricePreset) {
      this.setPricePreset(this.tempPricePreset);
    } else {
      this.search();
    }
    this.mobileFilterOpen.set(false);
  }

  private calculatePresetFromRange(min: number | null, max: number | null): string {
    if (min === null && max === 5000000) return 'under-5m';
    if (min === 5000000 && max === 15000000) return '5m-15m';
    if (min === 15000000 && max === 30000000) return '15m-30m';
    if (min === 30000000 && max === null) return 'over-30m';
    return '';
  }

  private async loadMetadata(): Promise<void> {
    try {
      const [categories, brands] = await Promise.all([
        this.catalog.categories(),
        this.catalog.brands(),
      ]);
      this.categories.set(categories);
      this.brands.set(brands);
    } catch {
      this.categories.set([]);
      this.brands.set([]);
    }
  }
}
