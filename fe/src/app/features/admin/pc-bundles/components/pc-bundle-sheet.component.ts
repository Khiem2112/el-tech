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
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'bundle-sheet-title'"
      >
        <div
          class="relative bg-[#161b26] border-l border-[#272f3d] shadow-2xl w-full max-w-3xl h-full flex flex-col text-xs text-white"
          (click)="$event.stopPropagation()"
        >
          <!-- Sheet Header -->
          <div class="h-14 px-6 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
            <div>
              <h2 id="bundle-sheet-title" class="font-bold text-white uppercase text-sm tracking-wide">
                {{ isEditMode() ? 'Cấu Hình Định Mức BOM Bộ Máy Tính' : 'Tạo Mới Cấu Hình Bộ Máy Tính' }}
              </h2>
              <p class="text-xs text-slate-400">
                {{ isEditMode() ? ('Bộ máy: ' + name()) : 'Thiết lập định mức linh kiện ảo (Virtual BOM)' }}
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Đóng bảng trượt (ESC)"
              aria-label="Đóng bảng trượt"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Business Rules Notice (PCB-001, PCB-002) -->
          <div class="p-3.5 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <svg class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong class="font-bold">Quy tắc PCB-001 & PCB-002:</strong>
              Bộ PC dựng sẵn là định mức linh kiện ảo (BOM) không lưu tồn kho vật lý riêng. Tồn kho và giá trị cấu hình được tính toán trực tiếp từ các SKU thành phần đang ở trạng thái ACTIVE.
            </div>
          </div>

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="m-4 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
              <button type="button" (click)="errorMessage.set(null)" class="text-rose-400 hover:text-white" title="Ẩn thông báo">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          }

          <!-- Sheet Content (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5">
            <!-- Thong tin co ban cua bo PC -->
            <div class="space-y-3 p-4 bg-[#090d16] border border-[#272f3d] rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label for="bundle-name-input" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                    Tên Bộ Máy Tính *
                  </label>
                  <input
                    id="bundle-name-input"
                    type="text"
                    [ngModel]="name()"
                    (ngModelChange)="onNameChange($event)"
                    placeholder="VD: EL-TECH TITAN X: AMD 9800X3D + RTX 5090"
                    class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white font-semibold focus:outline-none focus:border-[#76b900] text-xs"
                  />
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label for="bundle-slug-input" class="block font-semibold text-slate-400 text-xs uppercase">
                      Đường Dẫn Slug *
                    </label>
                    <button
                      type="button"
                      (click)="autoGenerateSlug()"
                      class="text-[11px] text-[#76b900] hover:underline"
                    >
                      Tạo tự động
                    </button>
                  </div>
                  <input
                    id="bundle-slug-input"
                    type="text"
                    [ngModel]="slug()"
                    (ngModelChange)="slug.set($event)"
                    placeholder="VD: el-tech-titan-x-9800x3d-rtx5090"
                    class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white font-mono focus:outline-none focus:border-[#76b900] text-xs"
                  />
                </div>
              </div>

              <div>
                <label for="bundle-desc-input" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                  Mô Tả Bộ Máy
                </label>
                <textarea
                  id="bundle-desc-input"
                  rows="2"
                  [ngModel]="description()"
                  (ngModelChange)="description.set($event)"
                  placeholder="Mô tả tóm tắt đối tượng sử dụng, phân khúc hiệu năng..."
                  class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] text-xs resize-none"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label for="bundle-lifecycle-select" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                    Trạng Thái Vòng Đời
                  </label>
                  <select
                    id="bundle-lifecycle-select"
                    [ngModel]="lifecycleState()"
                    (ngModelChange)="lifecycleState.set($event)"
                    class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white font-medium focus:outline-none focus:border-[#76b900] text-xs"
                  >
                    <option value="DRAFT">Bản nháp (DRAFT)</option>
                    <option value="ACTIVE">Đang kinh doanh (ACTIVE)</option>
                    <option value="PAUSED">Tạm dừng bán (PAUSED)</option>
                    <option value="DISCONTINUED">Ngừng kinh doanh (DISCONTINUED)</option>
                  </select>
                </div>

                <div class="flex items-center gap-2 pt-6">
                  <input
                    id="bundle-is-active"
                    type="checkbox"
                    [checked]="isActive()"
                    (change)="isActive.set(!isActive())"
                    class="w-4 h-4 rounded border-[#272f3d] bg-[#161b26] text-[#76b900] focus:ring-0"
                  />
                  <label for="bundle-is-active" class="font-medium text-slate-300 text-xs cursor-pointer select-none">
                    Kích hoạt hiển thị hệ thống
                  </label>
                </div>
              </div>
            </div>

            <!-- Bang danh sach linh kien Bo PC -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold text-white uppercase tracking-wider text-xs">
                    Danh Sách Linh Kiện Cấu Thành (BOM)
                  </span>
                  <span class="text-slate-400 ml-2">({{ bomItems().length }} linh kiện)</span>
                </div>
                <button
                  type="button"
                  (click)="showSearchPanel.set(!showSearchPanel())"
                  class="px-3 py-1 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded font-semibold text-white text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{{ showSearchPanel() ? 'Đóng Bộ Tìm Kiếm' : 'Thêm Linh Kiện Vào BOM' }}</span>
                </button>
              </div>

              <!-- Hop thoai tim kiem nhanh linh kien SKU -->
              @if (showSearchPanel()) {
                <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded-lg space-y-3">
                  <div class="font-bold text-white text-xs uppercase flex items-center justify-between pb-1 border-b border-[#272f3d]">
                    <span class="text-[#76b900]">Tra cứu SKU linh kiện đang hoạt động (ACTIVE)</span>
                    <button
                      type="button"
                      (click)="showSearchPanel.set(false)"
                      class="text-slate-400 hover:text-white"
                      title="Đóng"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div class="md:col-span-5">
                      <select
                        [ngModel]="searchCategoryId()"
                        (ngModelChange)="onSearchCategoryChange($event)"
                        class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                      >
                        <option [ngValue]="null">Tất cả ngành hàng linh kiện</option>
                        @for (category of categories(); track category.id) {
                          <option [ngValue]="category.id">{{ category.name }}</option>
                        }
                      </select>
                    </div>

                    <div class="md:col-span-7 flex items-center gap-1.5">
                      <input
                        type="text"
                        [ngModel]="searchKeyword()"
                        (ngModelChange)="searchKeyword.set($event)"
                        (keydown.enter)="executeVariantSearch()"
                        placeholder="Nhập tên linh kiện, mã SKU hoặc barcode..."
                        class="flex-1 px-3 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                      />
                      <button
                        type="button"
                        (click)="executeVariantSearch()"
                        [disabled]="isSearchingVariants()"
                        class="px-3 py-1.5 bg-[#272f3d] hover:bg-[#343e50] text-white font-semibold text-xs rounded transition-colors whitespace-nowrap"
                      >
                        {{ isSearchingVariants() ? 'Đang tìm...' : 'Tìm Kiếm' }}
                      </button>
                    </div>
                  </div>

                  <!-- Ket qua tim kiem linh kien -->
                  @if (variantSearchResults().length > 0) {
                    <div class="max-h-48 overflow-y-auto border border-[#272f3d] rounded divide-y divide-[#272f3d] bg-[#161b26]">
                      @for (sku of variantSearchResults(); track sku.id) {
                        <div class="p-2.5 flex items-center justify-between hover:bg-[#090d16] transition-colors gap-2">
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                              <span class="px-1.5 py-0.5 rounded bg-[#090d16] border border-[#272f3d] text-[10px] text-slate-300 font-medium uppercase">
                                {{ sku.productTemplate.category.name }}
                              </span>
                              <span class="font-semibold text-white truncate text-xs">{{ sku.productTemplate.name }}</span>
                              @if (sku.variationLabel) {
                                <span class="text-slate-400 text-[11px]">({{ sku.variationLabel }})</span>
                              }
                            </div>
                            <div class="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-3">
                              <span>SKU: {{ sku.sku }}</span>
                              <span class="text-[#76b900] font-bold tabular-nums">
                                {{ formatCurrency(parsePrice(sku.sellingPrice)) }}
                              </span>
                              <span>Tồn khả dụng: {{ sku.totalAvailable }}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            (click)="addVariantToBom(sku)"
                            class="px-2.5 py-1 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors whitespace-nowrap shadow-xs"
                          >
                            + Chọn
                          </button>
                        </div>
                      }
                    </div>
                  } @else if (hasSearched() && !isSearchingVariants()) {
                    <div class="p-3 text-center text-slate-400 text-xs italic bg-[#161b26] border border-[#272f3d] rounded">
                      Không tìm thấy linh kiện biến thể ACTIVE phù hợp với từ khóa.
                    </div>
                  }
                </div>
              }

              <!-- Bang linh kien BOM da chon -->
              <div class="border border-[#272f3d] rounded-lg overflow-hidden shadow-xs bg-[#090d16]">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#161b26] border-b border-[#272f3d] text-slate-400 font-semibold uppercase text-xs">
                    <tr>
                      <th class="py-2.5 px-3">Ngành Hàng</th>
                      <th class="py-2.5 px-3">Linh Kiện & Mã SKU</th>
                      <th class="py-2.5 px-2 text-center w-16">SL</th>
                      <th class="py-2.5 px-3 text-right">Đơn Giá</th>
                      <th class="py-2.5 px-3 text-right">Thành Tiền</th>
                      <th class="py-2.5 px-3 text-center w-14">Xóa</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#272f3d]">
                    @if (bomItems().length === 0) {
                      <tr>
                        <td colspan="6" class="py-6 text-center text-slate-400 italic">
                          Chưa có linh kiện nào trong cấu hình BOM. Hãy nhấn nút "Thêm Linh Kiện Vào BOM" ở trên để nạp linh kiện.
                        </td>
                      </tr>
                    } @else {
                      @for (item of bomItems(); track item.skuId; let idx = $index) {
                        <tr class="hover:bg-[#161b26]/50 transition-colors">
                          <td class="py-2.5 px-3 font-semibold text-slate-300 whitespace-nowrap">
                            {{ item.categoryName }}
                          </td>
                          <td class="py-2.5 px-3 min-w-0">
                            <div class="font-medium text-white">{{ item.productName }}</div>
                            <div class="font-mono text-slate-400 text-[11px]">{{ item.sku }}</div>
                          </td>
                          <td class="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              max="99"
                              [ngModel]="item.quantity"
                              (ngModelChange)="updateItemQuantity(idx, $event)"
                              class="w-12 px-1 py-1 bg-[#161b26] border border-[#272f3d] rounded text-center font-bold tabular-nums text-xs text-white focus:outline-none focus:border-[#76b900]"
                            />
                          </td>
                          <td class="py-2.5 px-3 text-right tabular-nums text-slate-400 whitespace-nowrap">
                            {{ formatCurrency(item.sellingPrice) }}
                          </td>
                          <td class="py-2.5 px-3 text-right tabular-nums font-bold text-white whitespace-nowrap">
                            {{ formatCurrency(item.lineTotal) }}
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              (click)="removeBomItem(idx)"
                              class="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#272f3d] transition-colors"
                              title="Xóa linh kiện khỏi BOM"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Khoi Dinh Gia Tu Dong Theo BOM -->
            <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded-lg space-y-3">
              <div class="font-bold text-white text-xs uppercase tracking-wider border-b border-[#272f3d] pb-2 flex items-center justify-between">
                <span>Cơ Chế Định Giá Bộ Máy Tính</span>
                <span class="text-slate-400 text-[11px] font-normal">Tự động tổng hợp thời gian thực</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <!-- Tong gia linh kien -->
                <div class="bg-[#161b26] p-3 rounded border border-[#272f3d] space-y-1">
                  <span class="block text-slate-400 text-xs uppercase font-semibold">Tổng Giá Linh Kiện</span>
                  <div class="text-base font-black text-white tabular-nums">
                    {{ formatCurrency(grossTotal()) }}
                  </div>
                  <p class="text-[11px] text-slate-500">Tự động tính từ tổng đơn giá linh kiện</p>
                </div>

                <!-- Giam gia goi may tinh -->
                <div class="bg-[#161b26] p-3 rounded border border-[#272f3d] space-y-1">
                  <label for="bundle-discount-input" class="block text-xs uppercase font-semibold text-rose-400">
                    Giảm Giá Bộ Máy (VNĐ)
                  </label>
                  <input
                    id="bundle-discount-input"
                    type="number"
                    step="50000"
                    min="0"
                    [ngModel]="discount()"
                    (ngModelChange)="onDiscountChange($event)"
                    class="w-full px-2.5 py-1.5 bg-[#090d16] border border-[#272f3d] rounded font-black text-rose-400 tabular-nums text-sm focus:outline-none focus:border-rose-400"
                  />
                  <p class="text-[11px] text-slate-500">Khoản giảm ưu đãi khi mua trọn bộ</p>
                </div>

                <!-- Gia ban tron bo -->
                <div class="bg-[#76b900]/10 p-3 rounded border border-[#76b900]/40 space-y-1">
                  <span class="block text-xs uppercase font-bold text-[#76b900]">Giá Bán Trọn Bộ</span>
                  <div class="text-lg font-black text-[#76b900] tabular-nums">
                    {{ formatCurrency(finalPrice()) }}
                  </div>
                  <p class="text-[11px] text-[#76b900]/80 font-medium">Giá niêm yết áp dụng cho khách hàng</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sheet Footer Actions -->
          <div class="h-14 px-6 border-t border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
            <div class="text-slate-400 text-xs truncate max-w-sm">
              <span>Tổng linh kiện: <strong class="text-white">{{ formatCurrency(grossTotal()) }}</strong></span>
              @if (discount() > 0) {
                <span class="ml-2 text-rose-400">| Giảm: -{{ formatCurrency(discount()) }}</span>
              }
              <span class="ml-2">| Giá bán: <strong class="text-[#76b900]">{{ formatCurrency(finalPrice()) }}</strong></span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="onClose()"
                class="px-4 py-2 bg-[#272f3d] hover:bg-[#343e50] text-slate-200 font-semibold rounded text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                (click)="onSave()"
                [disabled]="isSaving()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
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

  readonly showSearchPanel = signal<boolean>(false);
  readonly searchKeyword = signal<string>('');
  readonly searchCategoryId = signal<number | null>(null);
  readonly variantSearchResults = signal<readonly AdminVariantCatalogItem[]>([]);
  readonly isSearchingVariants = signal<boolean>(false);
  readonly hasSearched = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly categories = this.categoryService.categories;

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
    if (!this.isEditMode() && (!this.slug() || this.slug() === this.generateSlug(this.name()))) {
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

  onDiscountChange(val: number | string): void {
    const num = Number(val);
    this.discount.set(Number.isFinite(num) && num >= 0 ? num : 0);
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
  }

  onSearchCategoryChange(catId: number | null): void {
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
      this.errorMessage.set(`Linh kiện ${sku.sku} không ở trạng thái ACTIVE (Quy tắc PCB-001).`);
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
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  }

  onClose(): void {
    this.errorMessage.set(null);
    this.closed.emit();
  }

  async onSave(): Promise<void> {
    this.errorMessage.set(null);

    const nameVal = this.name().trim();
    const slugVal = this.slug().trim();

    if (!nameVal || nameVal.length < 3) {
      this.errorMessage.set('Tên bộ máy tính phải có ít nhất 3 ký tự');
      return;
    }

    if (!slugVal || !/^[a-z0-9-]+$/.test(slugVal)) {
      this.errorMessage.set('Đường dẫn slug không hợp lệ (chỉ gồm chữ thường, số và gạch ngang)');
      return;
    }

    if (this.bomItems().length === 0) {
      this.errorMessage.set('Cấu hình Virtual BOM phải có ít nhất 1 linh kiện thành phần');
      return;
    }

    for (const item of this.bomItems()) {
      if (!item.isActive || item.lifecycleState !== 'ACTIVE') {
        this.errorMessage.set(`Linh kiện SKU ${item.sku} không ở trạng thái ACTIVE (Quy tắc PCB-001)`);
        return;
      }
    }

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
      const message = err instanceof Error ? err.message : 'Lỗi khi lưu cấu hình bộ máy tính';
      this.errorMessage.set(message);
    } finally {
      this.isSaving.set(false);
    }
  }
}
