import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VndPipe } from '../../lib/vnd.pipe';
import { ApiClientService } from '../../core/api/api-client.service';
import { CatalogCategory, CatalogProduct, CatalogService } from '../catalog/catalog.service';
import { CartService } from '../../services/cart.service';

type BuildLine = { readonly skuId: number; readonly sku: string; readonly name: string; readonly quantity: number; readonly unitPrice: string; readonly lineTotal: string };
type BuildPreview = { readonly lines: readonly BuildLine[]; readonly total: string };

@Component({
  selector: 'app-custom-build-page',
  imports: [FormsModule, RouterLink, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
  <a routerLink="/pc-dung-san" class="text-sm font-bold text-primary">PC dựng sẵn</a>
  <p class="mt-6 text-xs font-extrabold tracking-[.16em] text-primary">CUSTOM BUILD</p>
  <h1 class="mt-2 text-3xl font-extrabold">Tự lắp PC</h1>
  <p class="mt-3 max-w-3xl text-muted">Chọn linh kiện và xem giá dự toán. Giá, tồn kho và tính khả dụng sẽ được xác nhận lại trước khi đặt hàng.</p>

  <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
    <div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-lg font-bold">Chọn linh kiện</h2>
        <span class="text-xs text-muted">{{ filteredProducts().length }} linh kiện phù hợp</span>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <label>
          <span class="sr-only">Tìm linh kiện</span>
          <input
            class="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            [(ngModel)]="searchFilter"
            placeholder="Tìm theo tên linh kiện hoặc hãng..."
          >
        </label>
        <label>
          <span class="sr-only">Danh mục linh kiện</span>
          <select
            class="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm"
            [ngModel]="selectedCategory()"
            (ngModelChange)="selectedCategory.set($event)"
          >
            <option value="">Tất cả danh mục linh kiện</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.slug">{{ cat.name }}</option>
            }
          </select>
        </label>
      </div>

      @if (selectedCategory() || searchFilter.trim()) {
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span class="text-xs text-muted">Đang lọc:</span>
          @if (selectedCategory(); as catSlug) {
            <span class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs">
              Danh mục: {{ selectedCategoryName() }}
              <button type="button" class="font-bold text-muted hover:text-danger" (click)="selectedCategory.set('')" aria-label="Loại bỏ lọc danh mục">[Xóa]</button>
            </span>
          }
          @if (searchFilter.trim(); as query) {
            <span class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs">
              Từ khóa: "{{ query }}"
              <button type="button" class="font-bold text-muted hover:text-danger" (click)="searchFilter = ''" aria-label="Loại bỏ lọc từ khóa">[Xóa]</button>
            </span>
          }
          <button type="button" class="text-xs font-bold text-primary underline" (click)="clearFilter()">Xóa lọc</button>
        </div>
      }

      @if (loading()) {
        <div class="mt-4 h-48 animate-pulse rounded-2xl bg-surface-alt"></div>
      } @else if (!filteredProducts().length) {
        <div class="mt-6 rounded-2xl border border-dashed border-line p-8 text-center">
          <p class="font-bold">Không tìm thấy linh kiện phù hợp</p>
          <p class="mt-1 text-sm text-muted">Hãy thử chọn danh mục khác hoặc xóa từ khóa tìm kiếm.</p>
          <button type="button" class="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground" (click)="clearFilter()">Xóa bộ lọc</button>
        </div>
      } @else {
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          @for (product of filteredProducts(); track product.id) {
            <article class="rounded-xl border border-line bg-surface p-4">
              <p class="text-xs font-bold text-muted">{{ product.category.name }} · {{ product.brand.name }}</p>
              <h3 class="mt-1 font-bold">{{ product.name }}</h3>
              <div class="mt-3 flex flex-wrap gap-2">
                @for (variant of product.variants; track variant.id) {
                  <button type="button" class="rounded-lg border border-line px-3 py-2 text-left text-sm hover:border-primary" (click)="add(variant.id)">
                    <span class="block font-semibold">{{ variant.variationLabel ?? variant.sku }}</span>
                    <span class="text-muted">{{ variant.sellingPrice | vnd }}</span>
                  </button>
                }
              </div>
            </article>
          }
        </div>
      }
    </div>

    <aside class="h-fit rounded-2xl border border-line bg-surface p-5 shadow-card">
      <h2 class="text-lg font-extrabold">Cấu hình hiện tại</h2>
      @if (!preview().lines.length) {
        <p class="mt-4 text-sm text-muted">Chưa có linh kiện nào được chọn.</p>
      } @else {
        <ul class="mt-4 space-y-3">
          @for (line of preview().lines; track line.skuId) {
            <li class="flex gap-3 text-sm">
              <div class="min-w-0 flex-1">
                <p class="font-semibold">{{ line.name }}</p>
                <p class="text-muted">{{ line.quantity }} × {{ line.unitPrice | vnd }}</p>
              </div>
              <button type="button" class="text-danger" (click)="remove(line.skuId)">Xóa</button>
            </li>
          }
        </ul>
        <div class="mt-5 border-t border-line pt-4">
          <p class="flex justify-between font-extrabold">
            <span>Tạm tính</span>
            <span>{{ preview().total | vnd }}</span>
          </p>
        </div>
        <label class="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" [(ngModel)]="hasAssemblyService" class="rounded border-line text-primary">
          <span>Yêu cầu hỗ trợ lắp ráp máy tính</span>
        </label>
      }

      <p class="mt-5 rounded-xl bg-surface-alt p-3 text-xs leading-5 text-muted">Đây là công cụ chọn cấu hình, không cam kết tự động tương thích phần cứng. Hãy xem kỹ thông số hoặc liên hệ tư vấn trước khi thanh toán.</p>
      <button type="button" class="mt-5 inline-flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50" [disabled]="!preview().lines.length || adding()" (click)="proceedToCart()">{{ adding() ? 'Đang thêm vào giỏ…' : 'Thêm cấu hình vào giỏ hàng' }}</button>
    </aside>
  </div>
</section>
  `,
})
export class CustomBuildPageComponent {
  private readonly catalog = inject(CatalogService);
  private readonly api = inject(ApiClientService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  protected readonly products = signal<readonly CatalogProduct[]>([]);
  protected readonly categories = signal<readonly CatalogCategory[]>([]);
  protected readonly selectedCategory = signal('');
  protected searchFilter = '';
  protected readonly preview = signal<BuildPreview>({ lines: [], total: '0' });
  protected readonly loading = signal(true);
  protected readonly adding = signal(false);
  protected hasAssemblyService = false;
  private readonly lines = signal<readonly { skuId: number; quantity: number }[]>([]);

  protected readonly selectedCategoryName = computed(() => {
    const slug = this.selectedCategory();
    const item = this.categories().find((candidate) => candidate.slug === slug);
    return item ? item.name : slug;
  });

  protected readonly filteredProducts = computed(() => {
    const all = this.products();
    const cat = this.selectedCategory();
    const query = this.searchFilter.trim().toLowerCase();

    return all.filter((product) => {
      const matchCategory = !cat || product.category.slug === cat;
      const matchQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.name.toLowerCase().includes(query) ||
        product.model.toLowerCase().includes(query);
      return matchCategory && matchQuery;
    });
  });

  constructor() {
    void this.load();
    void this.loadCategories();
  }

  protected add(skuId: number): void {
    const existing = this.lines().find((line) => line.skuId === skuId);
    this.lines.update((lines) => existing ? lines.map((line) => line.skuId === skuId ? { ...line, quantity: line.quantity + 1 } : line) : [...lines, { skuId, quantity: 1 }]);
    void this.refreshPreview();
  }

  protected remove(skuId: number): void {
    this.lines.update((lines) => lines.filter((line) => line.skuId !== skuId));
    void this.refreshPreview();
  }

  protected clearFilter(): void {
    this.selectedCategory.set('');
    this.searchFilter = '';
  }

  protected async proceedToCart(): Promise<void> {
    const lines = this.lines();
    if (!lines.length) return;
    this.adding.set(true);
    try {
      await this.cart.addBuild({
        buildName: 'Custom PC Build',
        buildType: 'CUSTOM',
        items: lines,
        hasAssemblyService: this.hasAssemblyService,
      });
      void this.router.navigate(['/gio-hang']);
    } finally {
      this.adding.set(false);
    }
  }

  private async load(): Promise<void> {
    try {
      this.products.set(await this.catalog.list());
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCategories(): Promise<void> {
    try {
      this.categories.set(await this.catalog.categories());
    } catch {
      this.categories.set([]);
    }
  }

  private async refreshPreview(): Promise<void> {
    if (!this.lines().length) {
      this.preview.set({ lines: [], total: '0' });
      return;
    }
    const response = await this.api.post<BuildPreview>('/pc-builds/preview', { lines: this.lines() });
    if (response.success) this.preview.set(response.data);
  }
}
