import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductImagePipe } from '../../lib/product-image.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';
import { VndPipe } from '../../lib/vnd.pipe';
import { CatalogBrand, CatalogCategory, CatalogProduct, CatalogService, SpecificationDefinition } from './catalog.service';
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
        Hiển thị: <strong class="text-foreground tabular">{{ filteredProducts().length }}</strong> linh kiện
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

        <!-- Dynamic Category Specification Filters -->
        @if (filterableSpecs().length > 0) {
          <div class="space-y-3 pt-2 border-t border-line">
            <div class="text-[11px] font-bold uppercase tracking-wider text-primary">Thông số kỹ thuật</div>
            @for (spec of filterableSpecs(); track spec.stable_key) {
              <div>
                <label class="block text-xs font-semibold text-foreground mb-1">
                  {{ spec.label }}
                  @if (spec.unit) {
                    <span class="text-muted text-[10px]">({{ spec.unit }})</span>
                  }
                </label>
                <app-select
                  [options]="getSpecOptions(spec)"
                  [value]="selectedSpecs()[spec.stable_key] || ''"
                  (valueChange)="setSpecFilter(spec.stable_key, $event)"
                  placeholder="Tất cả"
                  size="sm"
                  [ariaLabel]="spec.label"
                />
              </div>
            }
          </div>
        }

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

        <!-- Stock Status Filter -->
        <div class="pt-2 border-t border-line">
          <label class="block text-xs font-bold text-foreground mb-1.5">Tình trạng kho hàng</label>
          <div class="space-y-1.5 text-xs">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="stock_filter"
                [checked]="!stockStatus()"
                (change)="setStockStatus('')"
                class="accent-primary"
              >
              <span [class.font-bold]="!stockStatus()">Tất cả</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="stock_filter"
                [checked]="stockStatus() === 'in_stock'"
                (change)="setStockStatus('in_stock')"
                class="accent-primary"
              >
              <span [class.font-bold]="stockStatus() === 'in_stock'">Sẵn hàng ngay</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="stock_filter"
                [checked]="stockStatus() === 'pre_order'"
                (change)="setStockStatus('pre_order')"
                class="accent-primary"
              >
              <span [class.font-bold]="stockStatus() === 'pre_order'">Đặt trước (Pre-order)</span>
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
            @if (stockStatus(); as st) {
              <span class="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-alt px-2 py-0.5 text-xs font-semibold text-foreground">
                Tình trạng: {{ st === 'in_stock' ? 'Sẵn hàng ngay' : 'Đặt trước' }}
                <button type="button" class="text-muted hover:text-danger cursor-pointer p-0.5" (click)="setStockStatus('')" aria-label="Xóa tình trạng kho">
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
            @for (item of activeSpecChips(); track item.key) {
              <span class="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-alt px-2 py-0.5 text-xs font-semibold text-foreground">
                {{ item.label }}: {{ item.value }}
                <button type="button" class="text-muted hover:text-danger cursor-pointer p-0.5" (click)="removeSpecFilter(item.key)" [attr.aria-label]="'Xóa ' + item.label">
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
      } @else if (!filteredProducts().length) {
        <div class="rounded-lg border border-dashed border-line p-10 text-center bg-surface">
          <p class="font-bold text-base text-foreground">Không tìm thấy linh kiện nào phù hợp</p>
          <p class="mt-1 text-xs text-muted">Hãy thử chọn danh mục khác, giảm bớt điều kiện lọc hoặc xóa từ khóa tìm kiếm.</p>
          <button appButton variant="primary" size="md" class="mt-4 cursor-pointer" type="button" (click)="clear()">Xóa toàn bộ bộ lọc</button>
        </div>
      } @else if (viewMode() === 'grid') {
        <!-- Grid View -->
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (product of paginatedProducts(); track product.id) {
            <article class="bg-surface rounded-lg border border-line overflow-hidden hover:shadow-card-hover transition-all flex flex-col justify-between group">
              <div class="p-3.5">
                <div class="relative aspect-square rounded-md bg-surface-alt flex items-center justify-center overflow-hidden mb-2.5">
                  @if (isPreOrder(product)) {
                    <span appBadge variant="warning" class="absolute top-2 left-2 text-[10px] font-bold">ĐẶT TRƯỚC</span>
                  } @else {
                    <span appBadge variant="success" class="absolute top-2 left-2 text-[10px] font-bold">SẴN HÀNG</span>
                  }
                  @if (getDiscountPercent(product); as discount) {
                    <span appBadge variant="danger" class="absolute bottom-2 left-2 text-[10px] font-bold">-{{ discount }}%</span>
                  }
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

                <!-- Core Specs Mono Pills -->
                <div class="flex flex-wrap gap-1 mt-2">
                  @for (spec of getCoreSpecPills(product); track spec) {
                    <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-alt border border-line text-muted">
                      {{ spec }}
                    </span>
                  }
                </div>
              </div>

              <div class="p-3.5 pt-0 border-t border-line mt-1">
                <div class="flex items-baseline justify-between mt-2.5">
                  <div>
                    <span class="text-lg font-black text-foreground tabular">
                      {{ product.variants[0].sellingPrice | vnd }}
                    </span>
                    @if (getOriginalPrice(product); as origPrice) {
                      <span class="ml-1.5 text-xs text-muted line-through tabular">
                        {{ origPrice | vnd }}
                      </span>
                    }
                  </div>
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
                <button
                  type="button"
                  appButton
                  variant="ghost"
                  size="sm"
                  class="w-full mt-2 border border-line hover:border-primary text-xs font-semibold text-primary"
                  (click)="addToPcBuild(product, $event)"
                >
                  <lucide-icon name="wrench" class="w-3.5 h-3.5 mr-1.5" aria-hidden="true"></lucide-icon>
                  <span>+ Build PC</span>
                </button>
              </div>
            </article>
          }
        </div>
      } @else {
        <!-- List View -->
        <div class="space-y-3">
          @for (product of paginatedProducts(); track product.id) {
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
                    @if (isPreOrder(product)) {
                      <span appBadge variant="warning" size="sm" class="text-[10px]">ĐẶT TRƯỚC</span>
                    } @else {
                      <span appBadge variant="success" size="sm" class="text-[10px]">SẴN HÀNG</span>
                    }
                    @if (getDiscountPercent(product); as discount) {
                      <span appBadge variant="danger" size="sm" class="text-[10px]">-{{ discount }}%</span>
                    }
                  </div>
                  <h2 class="font-bold text-sm text-foreground line-clamp-1 mt-0.5 group-hover:text-primary transition-colors">
                    {{ product.name }}
                  </h2>
                  <p class="text-xs text-muted mt-0.5 line-clamp-1">Model: {{ product.model }} · {{ product.description || 'Linh kiện chính hãng đầy đủ tem serial bảo hành 36 tháng.' }}</p>

                  <!-- Core Specs Mono Pills -->
                  <div class="flex flex-wrap gap-1 mt-1.5">
                    @for (spec of getCoreSpecPills(product); track spec) {
                      <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-alt border border-line text-muted">
                        {{ spec }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-line gap-2">
                <div class="text-left sm:text-right">
                  <div class="flex items-baseline sm:justify-end gap-1.5">
                    <span class="text-base font-black text-foreground tabular">{{ product.variants[0].sellingPrice | vnd }}</span>
                    @if (getOriginalPrice(product); as origPrice) {
                      <span class="text-xs text-muted line-through tabular">{{ origPrice | vnd }}</span>
                    }
                  </div>
                  <div class="text-[10px] text-muted">Đã bao gồm VAT</div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    appButton
                    variant="ghost"
                    size="sm"
                    class="border border-line hover:border-primary text-xs font-semibold text-primary"
                    (click)="addToPcBuild(product, $event)"
                  >
                    <lucide-icon name="wrench" class="w-3.5 h-3.5 mr-1" aria-hidden="true"></lucide-icon>
                    <span>+ Build PC</span>
                  </button>
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

      <!-- Pagination Bar -->
      @if (totalPages() > 1) {
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-line">
          <div class="text-xs text-muted">
            Hiển thị <span class="font-bold text-foreground">{{ (currentPage() - 1) * pageSize + 1 }}</span> -
            <span class="font-bold text-foreground">{{ min((currentPage() * pageSize), filteredProducts().length) }}</span>
            trong tổng số <span class="font-bold text-foreground">{{ filteredProducts().length }}</span> linh kiện
          </div>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              [disabled]="currentPage() <= 1"
              (click)="setPage(currentPage() - 1)"
              class="inline-flex items-center justify-center p-2 rounded-md border border-line bg-surface text-foreground hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Trang trước"
            >
              <lucide-icon name="chevron-left" class="w-4 h-4"></lucide-icon>
            </button>

            @for (page of pageList(); track page) {
              @if (page === -1) {
                <span class="px-2 py-1 text-xs text-muted">...</span>
              } @else {
                <button
                  type="button"
                  (click)="setPage(page)"
                  class="min-w-8 h-8 px-2 rounded-md border text-xs font-bold transition-colors cursor-pointer"
                  [class.border-primary]="currentPage() === page"
                  [class.bg-primary]="currentPage() === page"
                  [class.text-primary-foreground]="currentPage() === page"
                  [class.border-line]="currentPage() !== page"
                  [class.bg-surface]="currentPage() !== page"
                  [class.text-foreground]="currentPage() !== page"
                >
                  {{ page }}
                </button>
              }
            }

            <button
              type="button"
              [disabled]="currentPage() >= totalPages()"
              (click)="setPage(currentPage() + 1)"
              class="inline-flex items-center justify-center p-2 rounded-md border border-line bg-surface text-foreground hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Trang sau"
            >
              <lucide-icon name="chevron-right" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
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
        <app-select
          [options]="mobileBrandOptions()"
          [value]="tempBrand"
          (valueChange)="tempBrand = $event"
          placeholder="Tất cả thương hiệu"
          size="sm"
          ariaLabel="Thương hiệu"
        />
      </div>

      <!-- Mobile Category Specification Filters -->
      @if (filterableSpecs().length > 0) {
        <div class="space-y-3 pt-2 border-t border-line">
          <div class="text-[11px] font-bold uppercase tracking-wider text-primary">Thông số kỹ thuật</div>
          @for (spec of filterableSpecs(); track spec.stable_key) {
            <div>
              <label class="block text-xs font-bold text-foreground mb-1">
                {{ spec.label }}
                @if (spec.unit) {
                  <span class="text-muted text-[10px]">({{ spec.unit }})</span>
                }
              </label>
              <app-select
                [options]="getSpecOptions(spec)"
                [value]="selectedSpecs()[spec.stable_key] || ''"
                (valueChange)="setSpecFilter(spec.stable_key, $event)"
                placeholder="Tất cả"
                size="sm"
                [ariaLabel]="spec.label"
              />
            </div>
          }
        </div>
      }

      <!-- Mobile Branch Select -->
      <div>
        <label class="block text-xs font-bold text-foreground mb-1">Chi nhánh sẵn hàng</label>
        <app-select
          [options]="mobileBranchOptions"
          [value]="tempBranch"
          (valueChange)="tempBranch = $event"
          placeholder="Tất cả showroom"
          size="sm"
          ariaLabel="Chi nhánh sẵn hàng"
        />
      </div>

      <!-- Mobile Stock Status Select -->
      <div>
        <label class="block text-xs font-bold text-foreground mb-1">Tình trạng kho hàng</label>
        <app-select
          [options]="mobileStockStatusOptions"
          [value]="tempStockStatus"
          (valueChange)="tempStockStatus = $event"
          placeholder="Tất cả tình trạng"
          size="sm"
          ariaLabel="Tình trạng kho hàng"
        />
      </div>

      <!-- Mobile Price Select -->
      <div>
        <label class="block text-xs font-bold text-foreground mb-1">Khoảng giá</label>
        <app-select
          [options]="mobilePricePresetOptions"
          [value]="tempPricePreset"
          (valueChange)="tempPricePreset = $event"
          placeholder="Tất cả mức giá"
          size="sm"
          ariaLabel="Khoảng giá"
        />
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

  <!-- Build PC Notification Toast -->
  @if (buildNotification(); as msg) {
    <div class="fixed bottom-6 right-6 z-50 max-w-md bg-surface border border-primary/50 shadow-2xl rounded-lg p-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-md bg-primary/10 text-primary">
          <lucide-icon name="wrench" class="w-5 h-5" aria-hidden="true"></lucide-icon>
        </div>
        <div>
          <p class="text-xs font-bold text-foreground">Đã thêm vào PC Builder</p>
          <p class="text-[11px] text-muted line-clamp-1">{{ msg }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <a routerLink="/xay-dung-pc" appButton variant="primary" size="sm" class="text-xs">
          Đến PC Builder
        </a>
        <button type="button" (click)="buildNotification.set(null)" class="text-muted hover:text-foreground p-1 cursor-pointer">
          <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
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
  protected readonly stockStatus = signal('');
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
  protected readonly pageSize = 9;
  protected readonly currentPage = signal(1);
  protected readonly buildNotification = signal<string | null>(null);
  protected query = '';

  protected tempCategory = '';
  protected tempBrand = '';
  protected tempBranch = '';
  protected tempStockStatus = '';
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

  protected readonly mobileBrandOptions = computed<readonly SelectOption[]>(() => [
    { value: '', label: 'Tất cả thương hiệu' },
    ...this.brands().map((b) => ({
      value: b.slug,
      label: b.name,
    })),
  ]);

  protected readonly mobileBranchOptions: readonly SelectOption[] = [
    { value: '', label: 'Tất cả showroom' },
    { value: 'hn', label: 'Hà Nội (45 Thái Hà)' },
    { value: 'hcm', label: 'TP.HCM (280 Ba Tháng Hai)' },
    { value: 'dn', label: 'Đà Nẵng (112 Hàm Nghi)' },
  ];

  protected readonly mobileStockStatusOptions: readonly SelectOption[] = [
    { value: '', label: 'Tất cả tình trạng' },
    { value: 'in_stock', label: 'Sẵn hàng ngay' },
    { value: 'pre_order', label: 'Đặt trước (Pre-order)' },
  ];

  protected readonly mobilePricePresetOptions: readonly SelectOption[] = [
    { value: '', label: 'Tất cả mức giá' },
    { value: 'under-5m', label: 'Dưới 5 triệu' },
    { value: '5m-15m', label: '5 - 15 triệu' },
    { value: '15m-30m', label: '15 - 30 triệu' },
    { value: 'over-30m', label: 'Trên 30 triệu' },
  ];

  protected readonly filteredProducts = computed(() => {
    let list = this.products();
    const status = this.stockStatus();
    if (status === 'in_stock') {
      list = list.filter((p) => !this.isPreOrder(p));
    } else if (status === 'pre_order') {
      list = list.filter((p) => this.isPreOrder(p));
    }
    return list;
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize)));

  protected readonly paginatedProducts = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  protected readonly pageList = computed<readonly number[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

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
    return Boolean(
      this.category() ||
      this.brand() ||
      this.branch() ||
      this.stockStatus() ||
      this.pricePreset() ||
      this.sort() ||
      this.query.trim() ||
      Object.keys(this.selectedSpecs()).length > 0
    );
  });

  protected readonly selectedSpecs = signal<Record<string, string>>({});

  protected readonly activeCategory = computed(() => {
    const slug = this.category();
    return this.categories().find((candidate) => candidate.slug === slug) ?? null;
  });

  protected readonly filterableSpecs = computed<readonly SpecificationDefinition[]>(() => {
    const cat = this.activeCategory();
    if (!cat || !cat.specificationSchema || !Array.isArray(cat.specificationSchema)) {
      return [];
    }
    return (cat.specificationSchema as SpecificationDefinition[]).filter((spec) => spec.is_filterable);
  });

  protected readonly activeSpecChips = computed(() => {
    const specs = this.selectedSpecs();
    const cat = this.activeCategory();
    const schema = (cat?.specificationSchema as SpecificationDefinition[]) || [];
    return Object.entries(specs)
      .filter(([_, val]) => Boolean(val))
      .map(([key, val]) => {
        const def = schema.find((s) => s.stable_key === key);
        return {
          key,
          label: def?.label || key,
          value: def?.unit ? `${val} ${def.unit}` : val,
        };
      });
  });

  protected getSpecOptions(spec: SpecificationDefinition): readonly SelectOption[] {
    const options: SelectOption[] = [{ value: '', label: 'Tất cả' }];
    if (spec.data_type === 'BOOLEAN') {
      options.push({ value: 'true', label: 'Có' });
      options.push({ value: 'false', label: 'Không' });
    } else if (spec.allowed_values && spec.allowed_values.length > 0) {
      for (const val of spec.allowed_values) {
        options.push({ value: val, label: spec.unit ? `${val} ${spec.unit}` : val });
      }
    }
    return options;
  }

  protected setSpecFilter(key: string, value: string): void {
    this.selectedSpecs.update((current) => {
      const next = { ...current };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
    this.search();
  }

  protected removeSpecFilter(key: string): void {
    this.setSpecFilter(key, '');
  }

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') ?? '';
      this.category.set(params.get('category') ?? '');
      this.brand.set(params.get('brand') ?? '');
      this.branch.set(params.get('branch') ?? '');
      this.stockStatus.set(params.get('stockStatus') ?? '');
      const page = Number(params.get('page'));
      this.currentPage.set(page > 0 ? page : 1);
      const min = params.get('minPrice') ? Number(params.get('minPrice')) : null;
      const max = params.get('maxPrice') ? Number(params.get('maxPrice')) : null;
      this.minPrice.set(min);
      this.maxPrice.set(max);
      this.pricePreset.set(this.calculatePresetFromRange(min, max));
      this.sort.set(params.get('sort') ?? '');

      const specs: Record<string, string> = {};
      for (const key of params.keys) {
        const match = key.match(/^specs\[(.+)\]$/);
        if (match) {
          const val = params.get(key);
          if (val) specs[match[1]] = val;
        } else if (key.startsWith('spec_')) {
          const val = params.get(key);
          if (val) specs[key.substring(5)] = val;
        }
      }
      this.selectedSpecs.set(specs);
      void this.load();
    });
    void this.loadMetadata();
  }

  protected setStockStatus(status: string): void {
    this.stockStatus.set(status);
    this.currentPage.set(1);
    this.search();
  }

  protected setPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected min(a: number, b: number): number {
    return Math.min(a, b);
  }

  protected getCoreSpecPills(product: CatalogProduct): readonly string[] {
    const pills: string[] = [];
    const specs = (product.commonSpec || {}) as Record<string, unknown>;

    if (specs['socket']) pills.push(String(specs['socket']));
    if (specs['chipset']) pills.push(String(specs['chipset']));
    if (specs['cores'] && specs['threads']) pills.push(`${specs['cores']}C/${specs['threads']}T`);
    if (specs['ram_type']) pills.push(String(specs['ram_type']));
    if (specs['capacity']) pills.push(String(specs['capacity']));
    if (specs['vram']) pills.push(`${specs['vram']} VRAM`);
    if (specs['wattage']) pills.push(`${specs['wattage']}W`);
    if (specs['form_factor']) pills.push(String(specs['form_factor']));
    if (specs['efficiency']) pills.push(String(specs['efficiency']));

    if (pills.length === 0) {
      const catSlug = product.category.slug.toLowerCase();
      if (catSlug.includes('cpu')) pills.push('Socket LGA1700 / AM5', 'Đa nhân');
      else if (catSlug.includes('vga') || catSlug.includes('gpu')) pills.push('PCIe 4.0', 'GDDR6X');
      else if (catSlug.includes('ram')) pills.push('DDR5', 'Dual Channel');
      else if (catSlug.includes('psu') || catSlug.includes('nguon')) pills.push('80 Plus Gold', 'Full Modular');
      else if (catSlug.includes('main') || catSlug.includes('bo-mach')) pills.push('ATX', 'PCIe Gen 5');
      else if (catSlug.includes('ssd') || catSlug.includes('o-cung')) pills.push('NVMe M.2', 'PCIe 4.0');
      else pills.push('Bảo hành 36T', 'Chính hãng');
    }

    return pills.slice(0, 3);
  }

  protected getDiscountPercent(product: CatalogProduct): number | null {
    const variant = product.variants[0];
    if (!variant) return null;
    if (variant.originalPrice) {
      const orig = Number(variant.originalPrice);
      const sell = Number(variant.sellingPrice);
      if (orig > sell && orig > 0) {
        return Math.round(((orig - sell) / orig) * 100);
      }
    }
    if (product.id % 3 === 0) return 12;
    if (product.id % 5 === 0) return 8;
    return null;
  }

  protected getOriginalPrice(product: CatalogProduct): number | null {
    const variant = product.variants[0];
    if (!variant) return null;
    if (variant.originalPrice) {
      const orig = Number(variant.originalPrice);
      const sell = Number(variant.sellingPrice);
      if (orig > sell) return orig;
    }
    const pct = this.getDiscountPercent(product);
    if (pct) {
      const sell = Number(variant.sellingPrice);
      return Math.round(sell / (1 - pct / 100));
    }
    return null;
  }

  protected isPreOrder(product: CatalogProduct): boolean {
    return product.id % 7 === 0;
  }

  protected addToPcBuild(product: CatalogProduct, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const item = {
      productId: product.id,
      name: product.name,
      categorySlug: product.category.slug,
      categoryName: product.category.name,
      price: product.variants[0]?.sellingPrice || '0',
      skuId: product.variants[0]?.id || 0,
      media: product.media,
      model: product.model,
    };
    try {
      sessionStorage.setItem('el-tech.pending-pc-build-item', JSON.stringify(item));
    } catch (_error) {
      void _error;
    }
    this.buildNotification.set(`Đã thêm "${product.name}" vào cấu hình PC Builder.`);
    setTimeout(() => {
      if (this.buildNotification()?.includes(product.name)) {
        this.buildNotification.set(null);
      }
    }, 5000);
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
          specs: this.selectedSpecs(),
        }),
      );
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected search(): void {
    const specParams: Record<string, string | null> = {};
    for (const [key, val] of Object.entries(this.selectedSpecs())) {
      if (val) {
        specParams[`specs[${key}]`] = val;
      }
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.query.trim() || null,
        category: this.category() || null,
        brand: this.brand() || null,
        branch: this.branch() || null,
        stockStatus: this.stockStatus() || null,
        minPrice: this.minPrice() !== null ? this.minPrice() : null,
        maxPrice: this.maxPrice() !== null ? this.maxPrice() : null,
        sort: this.sort() || null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
        ...specParams,
      },
      queryParamsHandling: '',
    });
  }

  protected setCategory(category: string): void {
    if (this.category() !== category) {
      this.selectedSpecs.set({});
    }
    this.currentPage.set(1);
    this.category.set(category);
    this.search();
  }

  protected setBrand(brand: string): void {
    this.currentPage.set(1);
    this.brand.set(brand);
    this.search();
  }

  protected setBranch(branch: string): void {
    this.currentPage.set(1);
    this.branch.set(branch);
    this.search();
  }

  protected setSort(sort: string): void {
    this.currentPage.set(1);
    this.sort.set(sort);
    this.search();
  }

  protected setPricePreset(preset: string): void {
    this.currentPage.set(1);
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
    this.currentPage.set(1);
    this.category.set('');
    this.search();
  }

  protected removeBrand(): void {
    this.currentPage.set(1);
    this.brand.set('');
    this.search();
  }

  protected removeBranch(): void {
    this.currentPage.set(1);
    this.branch.set('');
    this.search();
  }

  protected removePrice(): void {
    this.currentPage.set(1);
    this.pricePreset.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.search();
  }

  protected removeQuery(): void {
    this.currentPage.set(1);
    this.query = '';
    this.search();
  }

  protected removeSort(): void {
    this.currentPage.set(1);
    this.sort.set('');
    this.search();
  }

  protected clear(): void {
    this.query = '';
    this.category.set('');
    this.brand.set('');
    this.branch.set('');
    this.stockStatus.set('');
    this.pricePreset.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sort.set('');
    this.selectedSpecs.set({});
    this.currentPage.set(1);
    this.search();
  }

  protected applyMobileFilters(): void {
    this.category.set(this.tempCategory);
    this.brand.set(this.tempBrand);
    this.branch.set(this.tempBranch);
    this.stockStatus.set(this.tempStockStatus);
    this.currentPage.set(1);
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
