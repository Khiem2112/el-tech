import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VndPipe } from '../../lib/vnd.pipe';
import { CatalogBrand, CatalogCategory, CatalogProduct, CatalogService } from './catalog.service';

@Component({
  selector: 'app-catalog-page',
  imports: [FormsModule, RouterLink, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
  <p class="text-xs font-extrabold tracking-[0.16em] text-primary">CATALOG</p>
  <h1 class="mt-2 text-3xl font-extrabold">Sản phẩm</h1>

  <div class="mt-6 grid gap-3 lg:grid-cols-[1fr_12rem_12rem_10rem_10rem_auto]">
    <label>
      <span class="sr-only">Tìm sản phẩm</span>
      <input
        class="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        [(ngModel)]="query"
        (keyup.enter)="search()"
        placeholder="Tìm theo tên, hãng hoặc model"
      >
    </label>

    <label>
      <span class="sr-only">Danh mục</span>
      <select
        class="w-full rounded-xl border border-line bg-surface px-4 py-3"
        [ngModel]="category()"
        (ngModelChange)="setCategory($event)"
      >
        <option value="">Tất cả danh mục</option>
        @for (item of categories(); track item.id) {
          <option [value]="item.slug">{{ item.name }}</option>
        }
      </select>
    </label>

    <label>
      <span class="sr-only">Thương hiệu</span>
      <select
        class="w-full rounded-xl border border-line bg-surface px-4 py-3"
        [ngModel]="brand()"
        (ngModelChange)="setBrand($event)"
      >
        <option value="">Tất cả thương hiệu</option>
        @for (item of brands(); track item.id) {
          <option [value]="item.slug">{{ item.name }}</option>
        }
      </select>
    </label>

    <label>
      <span class="sr-only">Khoảng giá</span>
      <select
        class="w-full rounded-xl border border-line bg-surface px-4 py-3"
        [ngModel]="pricePreset()"
        (ngModelChange)="setPricePreset($event)"
      >
        <option value="">Tất cả mức giá</option>
        <option value="under-5m">Dưới 5 triệu</option>
        <option value="5m-15m">5 - 15 triệu</option>
        <option value="15m-30m">15 - 30 triệu</option>
        <option value="over-30m">Trên 30 triệu</option>
      </select>
    </label>

    <label>
      <span class="sr-only">Sắp xếp</span>
      <select
        class="w-full rounded-xl border border-line bg-surface px-4 py-3"
        [ngModel]="sort()"
        (ngModelChange)="setSort($event)"
      >
        <option value="">Mặc định</option>
        <option value="price_asc">Giá: Thấp đến cao</option>
        <option value="price_desc">Giá: Cao đến thấp</option>
        <option value="name_asc">Tên: A đến Z</option>
        <option value="name_desc">Tên: Z đến A</option>
      </select>
    </label>

    <button
      class="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-strong"
      type="button"
      (click)="search()"
    >
      Tìm kiếm
    </button>
  </div>

  @if (hasActiveFilters()) {
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <span class="text-xs font-semibold text-muted">Bộ lọc đang chọn:</span>
      @if (category(); as catSlug) {
        <span class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1 text-xs font-medium">
          Danh mục: {{ categoryName() }}
          <button type="button" class="ml-1 font-bold text-muted hover:text-danger" (click)="removeCategory()" aria-label="Loại bỏ danh mục này">[Xóa]</button>
        </span>
      }
      @if (brand(); as brandSlug) {
        <span class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1 text-xs font-medium">
          Hãng: {{ brandName() }}
          <button type="button" class="ml-1 font-bold text-muted hover:text-danger" (click)="removeBrand()" aria-label="Loại bỏ thương hiệu này">[Xóa]</button>
        </span>
      }
      @if (pricePreset(); as priceLabel) {
        <span class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1 text-xs font-medium">
          Giá: {{ pricePresetName() }}
          <button type="button" class="ml-1 font-bold text-muted hover:text-danger" (click)="removePrice()" aria-label="Loại bỏ khoảng giá này">[Xóa]</button>
        </span>
      }
      @if (query.trim()) {
        <span class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1 text-xs font-medium">
          Từ khóa: "{{ query.trim() }}"
          <button type="button" class="ml-1 font-bold text-muted hover:text-danger" (click)="removeQuery()" aria-label="Loại bỏ từ khóa tìm kiếm">[Xóa]</button>
        </span>
      }
      @if (sort()) {
        <span class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1 text-xs font-medium">
          Sắp xếp: {{ sortName() }}
          <button type="button" class="ml-1 font-bold text-muted hover:text-danger" (click)="removeSort()" aria-label="Loại bỏ sắp xếp">[Xóa]</button>
        </span>
      }
      <button
        type="button"
        class="text-xs font-bold text-primary underline hover:text-primary-strong"
        (click)="clear()"
      >
        Xóa tất cả bộ lọc
      </button>
    </div>
  }

  @if (loading()) {
    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @for (item of [1, 2, 3]; track item) {
        <div class="h-56 animate-pulse rounded-2xl bg-surface-alt"></div>
      }
    </div>
  } @else if (error()) {
    <div class="mt-8 rounded-2xl border border-danger/30 bg-danger/10 p-5" role="alert">
      <p class="font-bold">Không thể tải catalog</p>
      <p class="mt-1 text-sm">Dữ liệu hiện có của bạn vẫn an toàn. Hãy thử lại.</p>
      <button class="mt-3 rounded-lg border border-line px-4 py-2 text-sm font-bold" type="button" (click)="load()">Thử lại</button>
    </div>
  } @else if (!products().length) {
    <div class="mt-8 rounded-2xl border border-dashed border-line p-8 text-center">
      <p class="font-bold">Không có kết quả{{ query ? ' cho “' + query + '”' : '' }}</p>
      <p class="mt-1 text-sm text-muted">Thử thay đổi bộ lọc hoặc xóa các điều kiện lọc để xem thêm sản phẩm.</p>
      <button class="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-strong" type="button" (click)="clear()">Xóa bộ lọc</button>
    </div>
  } @else {
    <p class="mt-8 text-sm text-muted">{{ products().length }} mẫu sản phẩm có thể đặt</p>
    <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @for (product of products(); track product.id) {
        <article class="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <p class="text-xs font-bold text-muted">{{ product.brand.name }} · {{ product.category.name }}</p>
          <h2 class="mt-2 text-lg font-bold">{{ product.name }}</h2>
          <p class="mt-2 text-sm text-muted">{{ product.model }}</p>
          <p class="mt-5 text-xl font-extrabold">{{ product.variants[0].sellingPrice | vnd }}</p>
          <p class="mt-1 text-xs text-success">Có thể đặt</p>
          <a class="mt-5 inline-flex rounded-lg border border-line px-4 py-2 text-sm font-bold hover:border-primary" [routerLink]="['/san-pham', product.category.slug, product.slug]">Xem chi tiết</a>
        </article>
      }
    </div>
  }
</section>
  `,
})
export class CatalogPageComponent {
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly products = signal<readonly CatalogProduct[]>([]);
  protected readonly categories = signal<readonly CatalogCategory[]>([]);
  protected readonly brands = signal<readonly CatalogBrand[]>([]);
  protected readonly category = signal('');
  protected readonly brand = signal('');
  protected readonly minPrice = signal<number | null>(null);
  protected readonly maxPrice = signal<number | null>(null);
  protected readonly pricePreset = signal('');
  protected readonly sort = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected query = '';

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
    return Boolean(this.category() || this.brand() || this.pricePreset() || this.sort() || this.query.trim());
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') ?? '';
      this.category.set(params.get('category') ?? '');
      this.brand.set(params.get('brand') ?? '');
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
    this.pricePreset.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sort.set('');
    this.search();
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
