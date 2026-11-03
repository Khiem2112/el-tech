import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
import { handleProductImageError } from '../../../../core/constants/product.constants';
import {
  AdminPurchaseOrderService,
  CatalogVariantOption,
  SimpleOption,
} from '../services/admin-purchase-order.service';

@Component({
  selector: 'app-select-po-component-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconModule, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
        (click)="onBackdropClick($event)"
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-component-modal-title"
      >
        <div
          class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col z-10 text-xs text-foreground my-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="p-4 border-b border-line flex items-center justify-between flex-shrink-0">
            <div>
              <h3 id="select-component-modal-title" class="font-bold text-foreground uppercase text-sm tracking-wide">
                Chọn Linh Kiện Mua Hàng
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Duyệt danh mục linh kiện phần cứng từ catalog để thêm nhanh vào đơn mua hàng
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors cursor-pointer"
              title="Đóng hộp thoại"
              aria-label="Đóng hộp thoại"
            >
              <lucide-icon name="x" class="size-4" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          <div class="p-4 border-b border-line bg-surface-alt/40 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 flex-shrink-0">
            <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div class="relative flex-1">
                <label for="component-search" class="block text-xs font-semibold text-muted uppercase mb-1">
                  Tìm kiếm linh kiện
                </label>
                <div class="relative">
                  <input
                    id="component-search"
                    type="text"
                    [ngModel]="searchQuery()"
                    (ngModelChange)="onSearchQueryChange($event)"
                    placeholder="Tìm theo tên linh kiện, mã SKU, barcode..."
                    class="w-full h-8 pl-8 pr-3 bg-white border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                  />
                  <lucide-icon
                    name="search"
                    class="size-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  ></lucide-icon>
                </div>
              </div>

              <div class="w-full sm:w-60">
                <span class="block text-xs font-semibold text-muted uppercase mb-1">
                  Loại linh kiện
                </span>
                <app-select
                  [options]="categoryOptions()"
                  [value]="selectedCategoryId()"
                  (valueChange)="onCategoryFilterChange($event)"
                  size="sm"
                  ariaLabel="Loại linh kiện"
                />
              </div>

              @if (searchQuery() || selectedCategoryId() !== 'ALL') {
                <button
                  type="button"
                  (click)="resetFilters()"
                  class="h-8 px-3 rounded bg-surface border border-line hover:bg-surface-alt text-xs font-medium text-foreground transition-colors whitespace-nowrap cursor-pointer"
                >
                  Xóa lọc
                </button>
              }
            </div>

            <div class="h-8 flex items-center text-xs text-muted text-right whitespace-nowrap">
              Tìm thấy: <strong class="text-foreground tabular tabular-nums ml-1 mr-1">{{ variants().length }}</strong> linh kiện
            </div>
          </div>

          <div class="overflow-y-auto flex-1 max-h-[50vh]">
            @if (isLoading()) {
              <div class="p-12 text-center text-muted space-y-3">
                <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
                <p class="text-xs">Đang tải danh mục linh kiện...</p>
              </div>
            } @else if (variants().length === 0) {
              <div class="p-12 text-center text-muted space-y-3">
                <div class="w-10 h-10 mx-auto rounded-full bg-surface-alt border border-line flex items-center justify-center text-muted">
                  <lucide-icon name="package" class="size-5" aria-hidden="true"></lucide-icon>
                </div>
                <h4 class="text-sm font-semibold text-foreground">Không tìm thấy linh kiện phù hợp</h4>
                <p class="text-xs text-muted max-w-sm mx-auto">
                  Thử tìm kiếm với từ khóa khác hoặc chuyển sang loại linh kiện khác.
                </p>
              </div>
            } @else {
              <table class="w-full text-left border-collapse text-xs">
                <thead class="bg-surface-alt/70 border-b border-line text-muted font-semibold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th class="py-2 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        [checked]="isAllSelected()"
                        (change)="toggleSelectAll()"
                        aria-label="Chọn tất cả linh kiện"
                        class="rounded border-line text-primary focus:ring-primary size-3.5"
                      />
                    </th>
                    <th class="py-2 px-3 w-12 text-center">Ảnh</th>
                    <th class="py-2 px-3 whitespace-nowrap">Mã SKU</th>
                    <th class="py-2 px-3 whitespace-nowrap">Tên Linh Kiện</th>
                    <th class="py-2 px-3 whitespace-nowrap">Loại Linh Kiện</th>
                    <th class="py-2 px-3 text-right whitespace-nowrap">Giá Bán Niêm Yết</th>
                    <th class="py-2 px-3 text-center whitespace-nowrap">Serial</th>
                    <th class="py-2 px-3 text-right whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line text-foreground">
                  @for (v of variants(); track v.id) {
                    <tr
                      class="hover:bg-surface-alt/50 transition-colors"
                      [class.bg-primary/5]="selectedVariantsMap().has(v.id)"
                    >
                      <td class="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          [checked]="selectedVariantsMap().has(v.id)"
                          [disabled]="alreadySelectedSet().has(v.id)"
                          (change)="toggleVariantSelection(v)"
                          [attr.aria-label]="'Chọn linh kiện ' + v.sku"
                          class="rounded border-line text-primary focus:ring-primary size-3.5 disabled:opacity-40"
                        />
                      </td>
                      <td class="py-2 px-3 text-center">
                        <div class="w-8 h-8 rounded bg-surface border border-line overflow-hidden flex items-center justify-center mx-auto">
                          <img
                            src="/images/products/placeholder.webp"
                            [src]="v.imageUrl || '/images/products/placeholder.webp'"
                            [alt]="v.productTemplate.name"
                            class="w-full h-full object-contain p-0.5"
                            (error)="onImageError($event)"
                          />
                        </div>
                      </td>
                      <td class="py-2 px-3 tabular font-bold whitespace-nowrap">
                        <span class="text-primary-strong">{{ v.sku }}</span>
                        @if (v.variationLabel) {
                          <div class="text-[11px] text-muted font-normal">{{ v.variationLabel }}</div>
                        }
                      </td>
                      <td class="py-2 px-3 font-semibold">
                        <div class="line-clamp-2">{{ v.productTemplate.name }}</div>
                        @if (v.productTemplate.brand?.name) {
                          <span class="text-[11px] text-muted font-normal">Hãng: {{ v.productTemplate.brand?.name }}</span>
                        }
                      </td>
                      <td class="py-2 px-3 whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded bg-surface-alt border border-line text-[11px] font-medium text-muted">
                          {{ v.productTemplate.category?.name || 'Khác' }}
                        </span>
                      </td>
                      <td class="py-2 px-3 text-right font-bold tabular tabular-nums text-foreground whitespace-nowrap">
                        {{ formatCurrency(v.sellingPrice) }} ₫
                      </td>
                      <td class="py-2 px-3 text-center whitespace-nowrap">
                        @if (v.serialRequired) {
                          <span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                            Cần Serial
                          </span>
                        } @else {
                          <span class="text-muted text-[11px]">-</span>
                        }
                      </td>
                      <td class="py-2 px-3 text-right whitespace-nowrap">
                        @if (alreadySelectedSet().has(v.id)) {
                          <span class="px-2 py-1 rounded bg-surface-alt text-muted text-[11px] font-semibold border border-line">
                            Đã thêm
                          </span>
                        } @else {
                          <button
                            type="button"
                            (click)="onSelectSingle(v)"
                            class="px-2.5 py-1 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded transition-colors shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <lucide-icon name="plus" class="size-3" aria-hidden="true"></lucide-icon>
                            <span>Chọn</span>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <div class="p-3.5 border-t border-line flex items-center justify-between flex-shrink-0 bg-surface-alt/40">
            <div class="text-xs text-muted">
              @if (selectedVariantsMap().size > 0) {
                <span>
                  Đã chọn: <strong class="text-foreground tabular tabular-nums font-bold">{{ selectedVariantsMap().size }}</strong> linh kiện
                </span>
              } @else {
                <span>Tích chọn ô đầu dòng để thêm hàng loạt linh kiện vào đơn</span>
              }
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="onClose()"
                class="px-4 py-1.5 bg-surface-alt hover:bg-surface-alt/80 border border-line rounded font-semibold text-xs text-foreground transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                (click)="onBatchAdd()"
                [disabled]="selectedVariantsMap().size === 0"
                class="px-4 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded text-xs transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 cursor-pointer"
              >
                <lucide-icon name="plus" class="size-3.5" aria-hidden="true"></lucide-icon>
                <span>Thêm {{ selectedVariantsMap().size > 0 ? selectedVariantsMap().size : '' }} Linh Kiện Đã Chọn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class SelectPoComponentModalComponent implements OnInit {
  protected readonly onImageError = handleProductImageError;
  private readonly poService = inject(AdminPurchaseOrderService);

  readonly isOpen = input<boolean>(false);
  readonly alreadySelectedSkuIds = input<number[]>([]);

  readonly componentSelected = output<CatalogVariantOption>();
  readonly componentsBatchSelected = output<CatalogVariantOption[]>();
  readonly closed = output<void>();

  readonly searchQuery = signal<string>('');
  readonly selectedCategoryId = signal<string>('ALL');
  readonly categories = signal<SimpleOption[]>([]);
  readonly variants = signal<CatalogVariantOption[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly selectedVariantsMap = signal<Map<number, CatalogVariantOption>>(new Map());

  readonly alreadySelectedSet = computed<Set<number>>(() => new Set(this.alreadySelectedSkuIds()));

  readonly categoryOptions = computed<SelectOption[]>(() => [
    { value: 'ALL', label: 'Tất cả loại linh kiện' },
    ...this.categories().map((c) => ({
      value: c.id.toString(),
      label: c.name,
    })),
  ]);

  readonly isAllSelected = computed<boolean>(() => {
    const available = this.variants().filter((v) => !this.alreadySelectedSet().has(v.id));
    if (available.length === 0) {
      return false;
    }
    return available.every((v) => this.selectedVariantsMap().has(v.id));
  });

  constructor() {
    effect(
      () => {
        if (this.isOpen()) {
          this.onModalOpened();
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    void this.loadCategories();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private async onModalOpened(): Promise<void> {
    this.selectedVariantsMap.set(new Map());
    if (this.categories().length === 0) {
      await this.loadCategories();
    }
    await this.fetchVariants();
  }

  private async loadCategories(): Promise<void> {
    const list = await this.poService.loadCategories();
    this.categories.set(list);
  }

  async fetchVariants(): Promise<void> {
    this.isLoading.set(true);
    try {
      const term = this.searchQuery().trim();
      const catVal = this.selectedCategoryId();
      const catId = catVal !== 'ALL' && catVal ? Number(catVal) : undefined;

      const results = await this.poService.searchCatalogVariants({
        search: term || undefined,
        categoryId: catId,
        limit: 100,
      });

      this.variants.set(results);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearchQueryChange(term: string): void {
    this.searchQuery.set(term);
    void this.fetchVariants();
  }

  onCategoryFilterChange(val: string): void {
    this.selectedCategoryId.set(val || 'ALL');
    void this.fetchVariants();
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategoryId.set('ALL');
    void this.fetchVariants();
  }

  toggleVariantSelection(variant: CatalogVariantOption): void {
    const current = new Map(this.selectedVariantsMap());
    if (current.has(variant.id)) {
      current.delete(variant.id);
    } else {
      current.set(variant.id, variant);
    }
    this.selectedVariantsMap.set(current);
  }

  toggleSelectAll(): void {
    const current = new Map(this.selectedVariantsMap());
    const available = this.variants().filter((v) => !this.alreadySelectedSet().has(v.id));

    if (this.isAllSelected()) {
      for (const v of available) {
        current.delete(v.id);
      }
    } else {
      for (const v of available) {
        current.set(v.id, v);
      }
    }
    this.selectedVariantsMap.set(current);
  }

  onSelectSingle(variant: CatalogVariantOption): void {
    this.componentSelected.emit(variant);
    const updatedMap = new Map(this.selectedVariantsMap());
    updatedMap.delete(variant.id);
    this.selectedVariantsMap.set(updatedMap);
  }

  onBatchAdd(): void {
    const selected = Array.from(this.selectedVariantsMap().values());
    if (selected.length > 0) {
      this.componentsBatchSelected.emit(selected);
      this.selectedVariantsMap.set(new Map());
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  formatCurrency(value: string | number): string {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) {
      return '0';
    }
    return num.toLocaleString('vi-VN');
  }
}
