import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
import { AdminCategoryService } from '../../categories/services/admin-category.service';
import { AdminVariantCatalogItem, ProductLifecycle } from '../../variants/services/admin-variant.service';
import {
  AdminPcBundle,
  AdminPcBundleService,
  CreatePcBundlePayload,
  UpdatePcBundlePayload,
} from '../services/admin-pc-bundle.service';

type EditableBomItem = {
  skuId: number;
  sku: string;
  productName: string;
  categoryName: string;
  categorySlug: string;
  sellingPrice: number;
  quantity: number;
  sortOrder: number;
  lineTotal: number;
  isActive: boolean;
  lifecycleState: ProductLifecycle;
};

@Component({
  selector: 'app-pc-bundle-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonDirective, SelectComponent, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'bundle-sheet-title'"
      >
        <div
          data-modal-id="MOD-06"
          class="relative bg-surface border-l border-line shadow-2xl w-full max-w-3xl h-full flex flex-col text-xs text-foreground"
          (click)="$event.stopPropagation()"
        >
          <div class="h-14 px-6 border-b border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            <div>
              <h2 id="bundle-sheet-title" class="font-bold text-foreground uppercase text-sm tracking-wide">
                {{ isEditMode() ? 'Cấu Hình Định Mức BOM PC Lắp Sẵn' : 'Tạo Mới Cấu Hình PC Lắp Sẵn' }}
              </h2>
              <p class="text-xs text-muted">
                {{ isEditMode() ? ('Cấu hình: ' + name()) : 'Thiết lập định mức linh kiện ảo (Virtual BOM)' }}
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1 rounded hover:bg-surface text-muted hover:text-foreground transition-colors"
              title="Đóng bảng trượt (ESC)"
              aria-label="Đóng bảng trượt"
            >
              <lucide-icon name="x" class="size-5" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          @if (errorMessage()) {
            <div class="m-4 p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <lucide-icon name="alert-triangle" class="size-4 text-destructive shrink-0" aria-hidden="true"></lucide-icon>
                <span>{{ errorMessage() }}</span>
              </div>
              <button type="button" (click)="errorMessage.set(null)" class="text-destructive hover:opacity-80" title="Ẩn thông báo">
                <lucide-icon name="x" class="size-4" aria-hidden="true"></lucide-icon>
              </button>
            </div>
          }

          <div class="flex-1 overflow-y-auto p-6 space-y-5">
            <div class="space-y-3">
              <div>
                <label for="bundle-name-input" class="block font-semibold text-muted text-xs uppercase mb-1">
                  Tên PC Lắp Sẵn *
                </label>
                <input
                  id="bundle-name-input"
                  type="text"
                  [ngModel]="name()"
                  (ngModelChange)="onNameChange($event)"
                  placeholder="VD: EL-TECH TITAN X: AMD 9800X3D + RTX 5090"
                  [class.border-destructive]="Boolean(nameError())"
                  [class.ring-1]="Boolean(nameError())"
                  [class.ring-destructive]="Boolean(nameError())"
                  class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-semibold focus:outline-none focus:border-primary text-xs transition-colors"
                />
                @if (nameError()) {
                  <p class="text-xs text-destructive mt-1 font-medium">{{ nameError() }}</p>
                }
              </div>

              <div>
                <label for="bundle-desc-input" class="block font-semibold text-muted text-xs uppercase mb-1">
                  Mô Tả PC Lắp Sẵn
                </label>
                <textarea
                  id="bundle-desc-input"
                  rows="2"
                  [ngModel]="description()"
                  (ngModelChange)="description.set($event)"
                  placeholder="Mô tả tóm tắt đối tượng sử dụng, phân khúc hiệu năng..."
                  class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground focus:outline-none focus:border-primary text-xs resize-none"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label class="block font-semibold text-muted text-xs uppercase mb-1">
                    Trạng Thái Vòng Đời
                  </label>
                  <app-select
                    [options]="lifecycleOptions"
                    [value]="lifecycleState()"
                    (valueChange)="onLifecycleSelectChange($event)"
                    placeholder="Chọn trạng thái"
                  />
                </div>

                <div class="flex items-center gap-2 pt-6">
                  <input
                    id="bundle-is-active"
                    type="checkbox"
                    [checked]="isActive()"
                    (change)="isActive.set(!isActive())"
                    class="w-4 h-4 rounded border-line bg-surface text-primary focus:ring-0"
                  />
                  <label for="bundle-is-active" class="font-medium text-foreground text-xs cursor-pointer select-none">
                    Kích hoạt hiển thị hệ thống
                  </label>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold text-foreground uppercase tracking-wider text-xs">
                    Danh Sách Linh Kiện Cấu Thành (BOM)
                  </span>
                  <span class="text-muted ml-2">({{ bomItems().length }} linh kiện)</span>
                </div>
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="sm"
                  (click)="showSearchPanel.set(!showSearchPanel())"
                  class="inline-flex items-center gap-1.5"
                >
                  <lucide-icon name="plus" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  <span>{{ showSearchPanel() ? 'Đóng Bộ Tìm Kiếm' : 'Thêm Linh Kiện Vào BOM' }}</span>
                </button>
              </div>

              @if (showSearchPanel()) {
                <div class="p-4 bg-surface-alt border border-line rounded-lg space-y-3">
                  <div class="font-bold text-foreground text-xs uppercase flex items-center justify-between pb-1 border-b border-line">
                    <span class="text-primary">Tra cứu SKU linh kiện đang hoạt động (ACTIVE)</span>
                    <button
                      type="button"
                      (click)="showSearchPanel.set(false)"
                      class="text-muted hover:text-foreground"
                      title="Đóng"
                    >
                      <lucide-icon name="x" class="size-4" aria-hidden="true"></lucide-icon>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div class="md:col-span-5">
                      <app-select
                        [options]="categorySearchOptions()"
                        [value]="searchCategoryId() !== null ? String(searchCategoryId()) : ''"
                        (valueChange)="onSearchCategorySelectChange($event)"
                        placeholder="Tất cả ngành hàng linh kiện"
                      />
                    </div>

                    <div class="md:col-span-7 flex items-center gap-1.5">
                      <input
                        type="text"
                        [ngModel]="searchKeyword()"
                        (ngModelChange)="searchKeyword.set($event)"
                        (keydown.enter)="executeVariantSearch()"
                        placeholder="Nhập tên linh kiện, mã linh kiện hoặc barcode..."
                        class="flex-1 px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        appButton
                        variant="primary"
                        size="sm"
                        (click)="executeVariantSearch()"
                        [disabled]="isSearchingVariants()"
                        class="whitespace-nowrap"
                      >
                        {{ isSearchingVariants() ? 'Đang tìm...' : 'Tìm Kiếm' }}
                      </button>
                    </div>
                  </div>

                  @if (variantSearchResults().length > 0) {
                    <div class="max-h-48 overflow-y-auto border border-line rounded divide-y divide-line bg-surface">
                      @for (sku of variantSearchResults(); track sku.id) {
                        <div class="p-2.5 flex items-center justify-between hover:bg-surface-alt transition-colors gap-2">
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                              <span class="px-1.5 py-0.5 rounded bg-surface-alt border border-line text-xs text-muted font-medium uppercase">
                                {{ sku.productTemplate.category.name }}
                              </span>
                              <span class="font-semibold text-foreground truncate text-xs">{{ sku.productTemplate.name }}</span>
                              @if (sku.variationLabel) {
                                <span class="text-muted text-xs">({{ sku.variationLabel }})</span>
                              }
                            </div>
                            <div class="text-xs text-muted mt-0.5 flex items-center gap-3">
                              <span>SKU: <span class="tabular">{{ sku.sku }}</span></span>
                              <span class="text-primary font-bold tabular-nums">
                                {{ formatCurrency(parsePrice(sku.sellingPrice)) }}
                              </span>
                              <span>Tồn khả dụng: <span class="tabular-nums">{{ sku.totalAvailable }}</span></span>
                            </div>
                          </div>

                          <button
                            type="button"
                            appButton
                            variant="primary"
                            size="sm"
                            (click)="addVariantToBom(sku)"
                            class="whitespace-nowrap shadow-xs"
                          >
                            + Chọn
                          </button>
                        </div>
                      }
                    </div>
                  } @else if (hasSearched() && !isSearchingVariants()) {
                    <div class="p-3 text-center text-muted text-xs italic bg-surface border border-line rounded">
                      Không tìm thấy linh kiện biến thể ACTIVE phù hợp với từ khóa.
                    </div>
                  }
                </div>
              }

              <div
                class="border rounded-lg overflow-hidden shadow-xs bg-surface transition-colors"
                [class.border-destructive]="Boolean(bomError())"
                [class.ring-1]="Boolean(bomError())"
                [class.ring-destructive]="Boolean(bomError())"
                [class.border-line]="!bomError()"
              >
                <table class="w-full text-left text-sm">
                  <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase text-xs">
                    <tr>
                      <th class="py-2.5 px-3">Ngành Hàng</th>
                      <th class="py-2.5 px-3">Linh Kiện & Mã SKU</th>
                      <th class="py-2.5 px-2 text-center w-16">SL</th>
                      <th class="py-2.5 px-3 text-right">Đơn Giá</th>
                      <th class="py-2.5 px-3 text-right">Thành Tiền</th>
                      <th class="py-2.5 px-3 text-center w-14">Xóa</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-line">
                    @if (bomItems().length === 0) {
                      <tr>
                        <td colspan="6" class="py-6 text-center text-muted italic">
                          Chưa có linh kiện nào trong cấu hình BOM. Hãy nhấn nút "Thêm Linh Kiện Vào BOM" ở trên để nạp linh kiện.
                        </td>
                      </tr>
                    } @else {
                      @for (item of bomItems(); track item.skuId; let idx = $index) {
                        <tr class="hover:bg-surface-alt/50 transition-colors">
                          <td class="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">
                            {{ item.categoryName }}
                          </td>
                          <td class="py-2.5 px-3 min-w-0">
                            <div class="font-medium text-foreground">{{ item.productName }}</div>
                            <div class="text-muted text-xs tabular">{{ item.sku }}</div>
                          </td>
                          <td class="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              max="99"
                              [ngModel]="item.quantity"
                              (ngModelChange)="updateItemQuantity(idx, $event)"
                              class="w-12 px-1 py-1 bg-surface border border-line rounded text-center font-bold tabular-nums text-xs text-foreground focus:outline-none focus:border-primary"
                            />
                          </td>
                          <td class="py-2.5 px-3 text-right tabular-nums text-muted whitespace-nowrap">
                            {{ formatCurrency(item.sellingPrice) }}
                          </td>
                          <td class="py-2.5 px-3 text-right tabular-nums font-bold text-foreground whitespace-nowrap">
                            {{ formatCurrency(item.lineTotal) }}
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              (click)="removeBomItem(idx)"
                              class="p-1 rounded text-destructive hover:opacity-80 hover:bg-surface-alt transition-colors"
                              title="Xóa linh kiện khỏi BOM"
                              aria-label="Xóa linh kiện khỏi BOM"
                            >
                              <lucide-icon name="trash-2" class="size-4 text-destructive" aria-hidden="true"></lucide-icon>
                            </button>
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
              @if (bomError()) {
                <p class="text-xs text-destructive mt-1 font-medium">{{ bomError() }}</p>
              }
            </div>

            <div class="pt-2 border-t border-line/60 space-y-3">
              <div class="font-bold text-foreground text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Định Giá Cấu Hình</span>
                <span class="text-muted text-xs font-normal">Tự động tổng hợp</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div class="p-3 bg-surface-alt/70 rounded border border-line space-y-1">
                  <span class="block text-muted text-xs uppercase font-semibold">Tổng Linh Kiện Lẻ</span>
                  <div class="text-base font-bold text-foreground tabular-nums">
                    {{ formatCurrency(grossTotal()) }}
                  </div>
                </div>

                <div class="p-3 bg-surface-alt/70 rounded border border-line space-y-1">
                  <label for="bundle-discount-input" class="block text-xs uppercase font-semibold text-destructive">
                    Chiết Khấu Trọn Bộ (VNĐ)
                  </label>
                  <input
                    id="bundle-discount-input"
                    type="number"
                    step="50000"
                    min="0"
                    [ngModel]="discount()"
                    (ngModelChange)="onDiscountChange($event)"
                    [class.border-destructive]="Boolean(discountError())"
                    [class.ring-1]="Boolean(discountError())"
                    [class.ring-destructive]="Boolean(discountError())"
                    class="w-full px-2 py-1 bg-surface border border-line rounded font-bold text-destructive tabular-nums text-sm focus:outline-none focus:border-destructive transition-colors"
                  />
                  @if (discountError()) {
                    <p class="text-xs text-destructive mt-1 font-medium">{{ discountError() }}</p>
                  }
                </div>

                <div class="p-3 bg-primary/10 rounded border border-primary/30 space-y-1">
                  <span class="block text-xs uppercase font-bold text-primary">Giá Bán Trọn Bộ</span>
                  <div class="text-base font-bold text-primary tabular-nums">
                    {{ formatCurrency(finalPrice()) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="h-14 px-6 border-t border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            <div class="text-muted text-xs truncate max-w-sm">
              <span>Tổng linh kiện: <strong class="text-foreground tabular">{{ formatCurrency(grossTotal()) }}</strong></span>
              @if (discount() > 0) {
                <span class="ml-2 text-destructive tabular">| Giảm: -{{ formatCurrency(discount()) }}</span>
              }
              <span class="ml-2">| Giá bán: <strong class="text-primary tabular">{{ formatCurrency(finalPrice()) }}</strong></span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                appButton
                variant="outline"
                size="sm"
                (click)="onClose()"
              >
                Hủy
              </button>
              <button
                type="button"
                appButton
                variant="primary"
                size="sm"
                (click)="onSave()"
                [disabled]="isSaving()"
                class="disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                @if (isSaving()) {
                  <span>Đang lưu...</span>
                } @else {
                  <span>Lưu Thay Đổi</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class PcBundleSheetComponent {
  protected readonly String = String;
  protected readonly Boolean = Boolean;

  private readonly bundleService = inject(AdminPcBundleService);
  private readonly categoryService = inject(AdminCategoryService);

  readonly isOpen = input<boolean>(false);
  readonly bundle = input<AdminPcBundle | null>(null);

  readonly closed = output<void>();
  readonly saved = output<AdminPcBundle>();

  readonly name = signal<string>('');
  readonly slug = signal<string>('');
  readonly description = signal<string>('');
  readonly lifecycleState = signal<ProductLifecycle>('DRAFT');
  readonly isActive = signal<boolean>(true);
  readonly discount = signal<number>(0);
  readonly bomItems = signal<readonly EditableBomItem[]>([]);

  readonly nameError = signal<string | null>(null);
  readonly bomError = signal<string | null>(null);
  readonly discountError = signal<string | null>(null);

  readonly showSearchPanel = signal<boolean>(false);
  readonly searchKeyword = signal<string>('');
  readonly searchCategoryId = signal<number | null>(null);
  readonly variantSearchResults = signal<readonly AdminVariantCatalogItem[]>([]);
  readonly isSearchingVariants = signal<boolean>(false);
  readonly hasSearched = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly categories = this.categoryService.categories;

  readonly lifecycleOptions: SelectOption[] = [
    { value: 'DRAFT', label: 'Bản nháp (DRAFT)' },
    { value: 'ACTIVE', label: 'Đang kinh doanh (ACTIVE)' },
    { value: 'PAUSED', label: 'Tạm dừng bán (PAUSED)' },
    { value: 'DISCONTINUED', label: 'Ngừng kinh doanh (DISCONTINUED)' },
  ];

  readonly categorySearchOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả ngành hàng linh kiện' },
    ...this.categories().map((c) => ({ value: String(c.id), label: c.name })),
  ]);

  readonly isEditMode = computed(() => Boolean(this.bundle() && this.bundle()!.id));

  readonly grossTotal = computed(() => {
    return this.bomItems().reduce((sum, item) => sum + item.lineTotal, 0);
  });

  readonly finalPrice = computed(() => {
    return Math.max(0, this.grossTotal() - this.discount());
  });

  constructor() {
    effect(() => {
      const currentBundle = this.bundle();
      const open = this.isOpen();

      if (open && currentBundle) {
        this.name.set(currentBundle.name);
        this.slug.set(currentBundle.slug);
        this.description.set(currentBundle.description ?? '');
        this.lifecycleState.set(currentBundle.lifecycleState);
        this.isActive.set(currentBundle.isActive);
        this.discount.set(currentBundle.discountAmount ?? 0);
        this.errorMessage.set(null);
        this.nameError.set(null);
        this.bomError.set(null);
        this.discountError.set(null);
        this.showSearchPanel.set(false);
        this.hasSearched.set(false);
        this.variantSearchResults.set([]);

        if (currentBundle.items && currentBundle.items.length > 0) {
          const mapped: EditableBomItem[] = currentBundle.items.map((item) => ({
            skuId: item.skuId,
            sku: item.sku,
            productName: item.productName,
            categoryName: item.categoryName,
            categorySlug: item.categorySlug,
            sellingPrice: item.unitPrice,
            quantity: item.quantity,
            sortOrder: item.sortOrder,
            lineTotal: item.lineTotal,
            isActive: item.isActive,
            lifecycleState: item.lifecycleState,
          }));
          this.bomItems.set(mapped);
        } else {
          this.loadBundleFullDetails(currentBundle.id);
        }
      } else if (open && !currentBundle) {
        this.name.set('');
        this.slug.set('');
        this.description.set('');
        this.lifecycleState.set('DRAFT');
        this.isActive.set(true);
        this.discount.set(0);
        this.bomItems.set([]);
        this.errorMessage.set(null);
        this.nameError.set(null);
        this.bomError.set(null);
        this.discountError.set(null);
        this.showSearchPanel.set(false);
        this.hasSearched.set(false);
        this.variantSearchResults.set([]);
      }
    });

    if (this.categoryService.categories().length === 0) {
      this.categoryService.loadCategories().catch(() => {});
    }
  }

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }

  private async loadBundleFullDetails(id: number): Promise<void> {
    try {
      const full = await this.bundleService.getBundleById(id);
      if (full.items) {
        const mapped: EditableBomItem[] = full.items.map((item) => ({
          skuId: item.skuId,
          sku: item.sku,
          productName: item.productName,
          categoryName: item.categoryName,
          categorySlug: item.categorySlug,
          sellingPrice: item.unitPrice,
          quantity: item.quantity,
          sortOrder: item.sortOrder,
          lineTotal: item.lineTotal,
          isActive: item.isActive,
          lifecycleState: item.lifecycleState,
        }));
        this.bomItems.set(mapped);
      }
    } catch {
      this.errorMessage.set('Không thể tải chi tiết danh sách linh kiện');
    }
  }

  onNameChange(val: string): void {
    this.name.set(val);
    if (this.nameError() && val.trim().length >= 3) {
      this.nameError.set(null);
    }
    if (!this.isEditMode() || !this.slug()) {
      this.slug.set(this.generateSlug(val));
    }
  }

  autoGenerateSlug(): void {
    if (this.name().trim()) {
      this.slug.set(this.generateSlug(this.name()));
    }
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);
  }

  onLifecycleSelectChange(val: string | number): void {
    this.lifecycleState.set(val as ProductLifecycle);
  }

  onDiscountChange(val: number | string): void {
    const num = Number(val);
    const clean = Number.isFinite(num) && num >= 0 ? num : 0;
    this.discount.set(clean);
    if (this.discountError()) {
      if (clean >= 0 && (this.grossTotal() === 0 || clean <= this.grossTotal())) {
        this.discountError.set(null);
      }
    }
  }

  updateItemQuantity(index: number, newQty: number | string): void {
    const qty = Math.max(1, Math.min(99, Number(newQty) || 1));
    const items = [...this.bomItems()];
    const current = items[index];
    if (current) {
      items[index] = {
        ...current,
        quantity: qty,
        lineTotal: current.sellingPrice * qty,
      };
      this.bomItems.set(items);
    }
  }

  removeBomItem(index: number): void {
    const items = [...this.bomItems()];
    items.splice(index, 1);
    this.bomItems.set(items);
    if (items.length === 0) {
      this.bomError.set('Vui lòng thêm ít nhất 1 linh kiện vào cấu hình BOM');
    } else {
      const inactive = items.find((item) => !item.isActive || item.lifecycleState !== 'ACTIVE');
      if (inactive) {
        this.bomError.set(`Linh kiện SKU ${inactive.sku} không ở trạng thái ACTIVE`);
      } else {
        this.bomError.set(null);
      }
    }
  }

  onSearchCategorySelectChange(val: string | number): void {
    const catId = val ? Number(val) : null;
    this.searchCategoryId.set(catId);
    this.executeVariantSearch();
  }

  async executeVariantSearch(): Promise<void> {
    this.isSearchingVariants.set(true);
    this.hasSearched.set(true);
    try {
      const results = await this.bundleService.searchActiveVariants(
        this.searchKeyword(),
        this.searchCategoryId() ?? undefined,
      );
      this.variantSearchResults.set(results);
    } catch {
      this.errorMessage.set('Lỗi khi tra cứu danh mục biến thể SKU');
    } finally {
      this.isSearchingVariants.set(false);
    }
  }

  addVariantToBom(sku: AdminVariantCatalogItem): void {
    if (sku.lifecycleState !== 'ACTIVE' || !sku.isActive) {
      this.errorMessage.set(`Linh kiện ${sku.sku} không ở trạng thái ACTIVE.`);
      return;
    }

    const items = [...this.bomItems()];
    const existingIndex = items.findIndex((i) => i.skuId === sku.id);

    if (existingIndex >= 0) {
      const item = items[existingIndex];
      items[existingIndex] = {
        ...item,
        quantity: item.quantity + 1,
        lineTotal: item.sellingPrice * (item.quantity + 1),
      };
      this.bomItems.set(items);
    } else {
      const price = this.parsePrice(sku.sellingPrice);
      const newItem: EditableBomItem = {
        skuId: sku.id,
        sku: sku.sku,
        productName: sku.productTemplate.name,
        categoryName: sku.productTemplate.category.name,
        categorySlug: sku.productTemplate.category.slug,
        sellingPrice: price,
        quantity: 1,
        sortOrder: items.length + 1,
        lineTotal: price,
        isActive: sku.isActive,
        lifecycleState: sku.lifecycleState,
      };
      this.bomItems.set([...items, newItem]);
    }

    if (this.bomError()) {
      this.bomError.set(null);
    }
  }

  parsePrice(val: unknown): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const clean = val.replace(/[^0-9.]/g, '');
      return Number.parseFloat(clean) || 0;
    }
    return 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
  }

  onClose(): void {
    this.errorMessage.set(null);
    this.nameError.set(null);
    this.bomError.set(null);
    this.discountError.set(null);
    this.closed.emit();
  }

  async onSave(): Promise<void> {
    this.errorMessage.set(null);

    let hasError = false;
    const nameVal = this.name().trim();

    if (!nameVal) {
      this.nameError.set('Vui lòng nhập tên PC lắp sẵn');
      hasError = true;
    } else if (nameVal.length < 3) {
      this.nameError.set('Tên PC lắp sẵn phải có ít nhất 3 ký tự');
      hasError = true;
    } else {
      this.nameError.set(null);
    }

    if (this.bomItems().length === 0) {
      this.bomError.set('Vui lòng thêm ít nhất 1 linh kiện vào cấu hình BOM');
      hasError = true;
    } else {
      const inactive = this.bomItems().find((item) => !item.isActive || item.lifecycleState !== 'ACTIVE');
      if (inactive) {
        this.bomError.set(`Linh kiện SKU ${inactive.sku} không ở trạng thái ACTIVE`);
        hasError = true;
      } else {
        this.bomError.set(null);
      }
    }

    const discountVal = this.discount();
    if (discountVal < 0) {
      this.discountError.set('Chiết khấu không được âm');
      hasError = true;
    } else if (this.grossTotal() > 0 && discountVal > this.grossTotal()) {
      this.discountError.set('Chiết khấu không được vượt quá tổng giá trị linh kiện');
      hasError = true;
    } else {
      this.discountError.set(null);
    }

    if (hasError) {
      return;
    }

    const slugVal = (this.slug() || this.generateSlug(nameVal)).trim();

    this.isSaving.set(true);

    try {
      const itemsPayload = this.bomItems().map((item, index) => ({
        skuId: item.skuId,
        quantity: item.quantity,
        sortOrder: index + 1,
      }));

      let result: AdminPcBundle;

      if (this.isEditMode()) {
        const updatePayload: UpdatePcBundlePayload = {
          name: nameVal,
          slug: slugVal,
          description: this.description().trim() || null,
          lifecycleState: this.lifecycleState(),
          isActive: this.isActive(),
          discount: this.discount(),
          items: itemsPayload,
        };
        result = await this.bundleService.updateBundle(this.bundle()!.id, updatePayload);
      } else {
        const createPayload: CreatePcBundlePayload = {
          name: nameVal,
          slug: slugVal,
          description: this.description().trim() || null,
          lifecycleState: this.lifecycleState(),
          isActive: this.isActive(),
          discount: this.discount(),
          items: itemsPayload,
        };
        result = await this.bundleService.createBundle(createPayload);
      }

      this.saved.emit(result);
      this.onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi lưu cấu hình PC lắp sẵn';
      this.errorMessage.set(message);
    } finally {
      this.isSaving.set(false);
    }
  }
}
