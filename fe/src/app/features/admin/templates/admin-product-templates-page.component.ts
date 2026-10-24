import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminBrandService } from '../brands/services/admin-brand.service';
import { AdminCategoryService } from '../categories/services/admin-category.service';
import { LifecycleTransitionDialogComponent } from './components/lifecycle-transition-dialog.component';
import {
  AdminProductTemplateService,
  ProductLifecycle,
  ProductTemplateListItem,
} from './services/admin-product-template.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

@Component({
  selector: 'app-admin-product-templates-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LifecycleTransitionDialogComponent,
  ],
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-05
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Mẫu Sản Phẩm
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Quản lý danh mục mẫu phần cứng độc lập, bộ lọc đa chiều và biến thể SKU (CAT-002)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center bg-[#161b26] border border-[#272f3d] rounded p-0.5 text-xs">
            <button
              type="button"
              (click)="setViewMode('list')"
              [class.bg-[#76b900]]="viewMode() === 'list'"
              [class.text-[#090d16]]="viewMode() === 'list'"
              [class.font-bold]="viewMode() === 'list'"
              [class.text-slate-400]="viewMode() !== 'list'"
              class="px-3 py-1.5 rounded transition-all"
              title="Chế độ xem bảng"
            >
              Dạng bảng
            </button>
            <button
              type="button"
              (click)="setViewMode('kanban')"
              [class.bg-[#76b900]]="viewMode() === 'kanban'"
              [class.text-[#090d16]]="viewMode() === 'kanban'"
              [class.font-bold]="viewMode() === 'kanban'"
              [class.text-slate-400]="viewMode() !== 'kanban'"
              class="px-3 py-1.5 rounded transition-all"
              title="Chế độ xem thẻ trực quan"
            >
              Dạng thẻ
            </button>
          </div>

          <a
            routerLink="/admin/catalog/templates/new"
            class="px-3.5 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors shadow-sm inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Mẫu Mới</span>
          </a>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 shadow-sm space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#272f3d] gap-4 flex-wrap">
          <div class="flex items-center gap-2 text-xs">
            <span class="w-2 h-2 rounded-full bg-[#76b900]"></span>
            <span class="font-bold text-white uppercase tracking-wide">Bộ Lọc Đa Chiều</span>
            <span class="text-slate-400">
              | Tìm thấy <strong class="text-[#76b900] font-bold tabular-nums">{{ total() }}</strong> mẫu sản phẩm
            </span>
          </div>

          <button
            type="button"
            (click)="resetFilters()"
            class="px-3 py-1 text-xs font-semibold bg-[#272f3d] hover:bg-[#343e50] text-slate-200 rounded transition-colors"
          >
            Đặt Lại
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label class="block font-semibold text-slate-400 text-xs uppercase mb-1.5">Tìm Kiếm</label>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Tên mẫu, model hoặc slug..."
              class="w-full px-3.5 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white focus:outline-none focus:border-[#76b900]"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-400 text-xs uppercase mb-1.5">Danh Mục</label>
            <select
              [value]="categoryFilter() ?? ''"
              (change)="onCategoryChange($event)"
              class="w-full px-3.5 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white focus:outline-none focus:border-[#76b900]"
            >
              <option value="">Tất cả danh mục</option>
              @for (cat of categoryList(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-400 text-xs uppercase mb-1.5">Thương Hiệu</label>
            <select
              [value]="brandFilter() ?? ''"
              (change)="onBrandChange($event)"
              class="w-full px-3.5 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white focus:outline-none focus:border-[#76b900]"
            >
              <option value="">Tất cả thương hiệu</option>
              @for (b of brandList(); track b.id) {
                <option [value]="b.id">{{ b.name }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-400 text-xs uppercase mb-1.5">Trạng Thái</label>
            <select
              [value]="statusFilter()"
              (change)="onStatusChange($event)"
              class="w-full px-3.5 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white focus:outline-none focus:border-[#76b900]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang bán</option>
              <option value="DRAFT">Bản thảo</option>
              <option value="PAUSED">Tạm dừng</option>
              <option value="DISCONTINUED">Ngừng kinh doanh</option>
            </select>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="p-12 text-center text-slate-400">
          Đang tải dữ liệu mẫu sản phẩm...
        </div>
      } @else if (templates().length === 0) {
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-12 text-center space-y-3">
          <p class="text-slate-300 font-medium">Không tìm thấy mẫu sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
          <button
            type="button"
            (click)="resetFilters()"
            class="px-4 py-2 bg-[#272f3d] hover:bg-[#343e50] text-slate-200 rounded text-xs font-semibold"
          >
            Xóa bộ lọc
          </button>
        </div>
      } @else {
        @if (viewMode() === 'list') {
          <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th class="py-3 px-4 w-16 text-center">Ảnh</th>
                    <th class="py-3 px-4">Tên Mẫu Sản Phẩm</th>
                    <th class="py-3 px-4">Thương Hiệu</th>
                    <th class="py-3 px-4">Danh Mục</th>
                    <th class="py-3 px-4">Model</th>
                    <th class="py-3 px-4 text-center">Biến Thể</th>
                    <th class="py-3 px-4 text-right">Khoảng Giá</th>
                    <th class="py-3 px-4 text-right">Tồn Khả Dụng</th>
                    <th class="py-3 px-4 text-center">Trạng Thái</th>
                    <th class="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#272f3d]">
                  @for (tpl of templates(); track tpl.id) {
                    <tr class="hover:bg-[#090d16]/50 transition-colors">
                      <td class="py-3 px-4 text-center">
                        <div class="w-11 h-11 rounded border border-[#272f3d] bg-[#090d16] overflow-hidden flex items-center justify-center mx-auto">
                          @if (getFirstMedia(tpl)) {
                            <img [src]="getFirstMedia(tpl)" [alt]="tpl.name" class="w-full h-full object-contain p-0.5" />
                          } @else {
                            <span class="text-[10px] text-slate-500 font-mono">NO IMG</span>
                          }
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <a
                          [routerLink]="['/admin/catalog/templates', tpl.id]"
                          class="font-bold text-white hover:text-[#76b900] transition-colors"
                        >
                          {{ tpl.name }}
                        </a>
                        <div class="text-[11px] font-mono text-slate-400 mt-0.5">
                          slug: {{ tpl.slug }}
                        </div>
                      </td>
                      <td class="py-3 px-4 font-medium text-slate-200">
                        {{ tpl.brand.name }}
                      </td>
                      <td class="py-3 px-4 text-slate-400">
                        {{ tpl.category.name }}
                      </td>
                      <td class="py-3 px-4 font-mono text-slate-300">
                        {{ tpl.model }}
                      </td>
                      <td class="py-3 px-4 text-center tabular-nums font-semibold text-white">
                        {{ tpl.variantCount }} SKU
                      </td>
                      <td class="py-3 px-4 text-right tabular-nums font-bold text-white">
                        {{ formatPriceRange(tpl.minSellingPrice, tpl.maxSellingPrice) }}
                      </td>
                      <td class="py-3 px-4 text-right tabular-nums font-semibold" [class.text-emerald-400]="tpl.totalAvailable > 0" [class.text-rose-400]="tpl.totalAvailable <= 0">
                        {{ tpl.totalAvailable }} chiếc
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span [class]="getLifecycleBadgeClass(tpl.lifecycleState)">
                          {{ getLifecycleLabel(tpl.lifecycleState) }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            (click)="openTransitionModal(tpl)"
                            class="p-1.5 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
                            title="Đổi trạng thái vòng đời"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <a
                            [routerLink]="['/admin/catalog/templates', tpl.id]"
                            class="p-1.5 rounded hover:bg-[#272f3d] text-[#76b900] hover:text-[#5a8d00] transition-colors"
                            title="Chi tiết"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                          <button
                            type="button"
                            (click)="deleteTemplate(tpl)"
                            class="p-1.5 rounded hover:bg-[#272f3d] text-rose-400 hover:text-rose-300 transition-colors"
                            title="Xóa mẫu sản phẩm"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (tpl of templates(); track tpl.id) {
              <div class="bg-[#161b26] border border-[#272f3d] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#76b900]/50 transition-all shadow-sm">
                <div class="relative h-44 bg-[#090d16] flex items-center justify-center p-3">
                  @if (getFirstMedia(tpl)) {
                    <img [src]="getFirstMedia(tpl)" [alt]="tpl.name" class="max-h-full max-w-full object-contain" />
                  } @else {
                    <div class="text-slate-600 font-mono text-xs">NO COVER IMAGE</div>
                  }
                  <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#161b26]/90 text-white border border-[#272f3d]">
                    {{ tpl.brand.name }}
                  </span>
                  <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-bold" [class]="getLifecycleBadgeClass(tpl.lifecycleState)">
                    {{ getLifecycleLabel(tpl.lifecycleState) }}
                  </span>
                </div>

                <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div class="text-[11px] text-slate-400 uppercase font-semibold">
                      {{ tpl.category.name }} | {{ tpl.model }}
                    </div>
                    <a
                      [routerLink]="['/admin/catalog/templates', tpl.id]"
                      class="font-bold text-white text-sm hover:text-[#76b900] block mt-1 line-clamp-1"
                    >
                      {{ tpl.name }}
                    </a>
                    <div class="text-xs font-bold text-[#76b900] mt-1.5 tabular-nums">
                      {{ formatPriceRange(tpl.minSellingPrice, tpl.maxSellingPrice) }}
                    </div>
                  </div>

                  <div class="p-2.5 bg-[#090d16] rounded border border-[#272f3d] space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400">Biến thể SKU:</span>
                      <span class="font-bold text-white">{{ tpl.variantCount }} SKUs</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400">Tồn khả dụng:</span>
                      <span class="font-bold" [class.text-emerald-400]="tpl.totalAvailable > 0" [class.text-rose-400]="tpl.totalAvailable <= 0">
                        {{ tpl.totalAvailable }} chiếc
                      </span>
                    </div>
                    <div class="w-full bg-[#272f3d] rounded-full h-1.5 overflow-hidden">
                      <div
                        class="bg-[#76b900] h-full rounded-full transition-all"
                        [style.width.%]="tpl.totalAvailable > 0 ? 70 : 0"
                      ></div>
                    </div>
                  </div>

                  <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#272f3d]">
                    <button
                      type="button"
                      (click)="openTransitionModal(tpl)"
                      class="p-1.5 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
                      title="Đổi trạng thái"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <a
                      [routerLink]="['/admin/catalog/templates', tpl.id]"
                      class="px-3 py-1 bg-[#272f3d] hover:bg-[#343e50] text-[#76b900] text-xs font-semibold rounded transition-colors"
                    >
                      Chi tiết
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <div class="flex items-center justify-between pt-4 border-t border-[#272f3d] text-xs text-slate-400">
          <div>
            Trang {{ page() }} / {{ totalPages() }} (Tổng số {{ total() }} mẫu sản phẩm)
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              [disabled]="page() <= 1"
              (click)="onPageChange(page() - 1)"
              class="px-3 py-1 bg-[#161b26] border border-[#272f3d] hover:bg-[#272f3d] text-slate-200 rounded disabled:opacity-40 transition-colors"
            >
              Trang trước
            </button>
            <button
              type="button"
              [disabled]="page() >= totalPages()"
              (click)="onPageChange(page() + 1)"
              class="px-3 py-1 bg-[#161b26] border border-[#272f3d] hover:bg-[#272f3d] text-slate-200 rounded disabled:opacity-40 transition-colors"
            >
              Trang sau
            </button>
          </div>
        </div>
      }

      <app-lifecycle-transition-dialog
        [isOpen]="isTransitionModalOpen()"
        targetType="template"
        [targetId]="selectedTemplate()?.id ?? 0"
        [targetName]="selectedTemplate()?.name ?? ''"
        [currentState]="selectedTemplate()?.lifecycleState ?? 'DRAFT'"
        [missingSpecKeys]="[]"
        [activeVariantCount]="selectedTemplate()?.variantCount ?? 0"
        (close)="isTransitionModalOpen.set(false)"
        (transitioned)="onLifecycleTransitioned()"
      />

      @if (toasts().length > 0) {
        <div class="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
          @for (toast of toasts(); track toast.id) {
            <div
              [class.bg-emerald-950]="toast.type === 'success'"
              [class.border-emerald-800]="toast.type === 'success'"
              [class.text-emerald-200]="toast.type === 'success'"
              [class.bg-rose-950]="toast.type === 'error'"
              [class.border-rose-800]="toast.type === 'error'"
              [class.text-rose-200]="toast.type === 'error'"
              [class.bg-[#161b26]]="toast.type === 'info'"
              [class.border-[#272f3d]]="toast.type === 'info'"
              [class.text-slate-200]="toast.type === 'info'"
              class="p-3 border rounded shadow-lg text-xs flex items-center justify-between gap-3 animate-fade-in"
            >
              <span>{{ toast.message }}</span>
              <button
                type="button"
                (click)="removeToast(toast.id)"
                class="text-slate-400 hover:text-white text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductTemplatesPageComponent implements OnInit {
  private readonly templateService = inject(AdminProductTemplateService);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly brandService = inject(AdminBrandService);
  private readonly router = inject(Router);

  readonly templates = this.templateService.templates;
  readonly isLoading = this.templateService.isLoading;
  readonly total = this.templateService.total;
  readonly page = this.templateService.page;
  readonly limit = this.templateService.limit;
  readonly viewMode = this.templateService.viewMode;

  readonly searchQuery = this.templateService.searchQuery;
  readonly categoryFilter = this.templateService.categoryFilter;
  readonly brandFilter = this.templateService.brandFilter;
  readonly statusFilter = this.templateService.statusFilter;

  readonly categoryList = this.categoryService.categories;
  readonly brandList = this.brandService.brands;

  readonly isTransitionModalOpen = signal<boolean>(false);
  readonly selectedTemplate = signal<ProductTemplateListItem | null>(null);

  readonly toasts = signal<ToastNotification[]>([]);
  private toastIdCounter = 0;

  readonly totalPages = computed(() => {
    const l = this.limit();
    const t = this.total();
    return l > 0 ? Math.ceil(t / l) : 1;
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.templateService.loadTemplates(),
      this.categoryService.loadCategories({ tree: false }),
      this.brandService.loadBrands(),
    ]);
  }

  setViewMode(mode: 'list' | 'kanban'): void {
    this.templateService.viewMode.set(mode);
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.templateService.searchQuery.set(val);
    this.templateService.page.set(1);
    void this.templateService.loadTemplates();
  }

  onCategoryChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.templateService.categoryFilter.set(val ? Number(val) : null);
    this.templateService.page.set(1);
    void this.templateService.loadTemplates();
  }

  onBrandChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.templateService.brandFilter.set(val ? Number(val) : null);
    this.templateService.page.set(1);
    void this.templateService.loadTemplates();
  }

  onStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.templateService.statusFilter.set(val);
    this.templateService.page.set(1);
    void this.templateService.loadTemplates();
  }

  resetFilters(): void {
    this.templateService.searchQuery.set('');
    this.templateService.categoryFilter.set(null);
    this.templateService.brandFilter.set(null);
    this.templateService.statusFilter.set('ALL');
    this.templateService.page.set(1);
    void this.templateService.loadTemplates();
  }

  onPageChange(newPage: number): void {
    this.templateService.page.set(newPage);
    void this.templateService.loadTemplates();
  }

  getFirstMedia(tpl: ProductTemplateListItem): string | null {
    if (Array.isArray(tpl.media) && tpl.media.length > 0) {
      const first = tpl.media[0];
      if (typeof first === 'string') {
        return first;
      }
      if (first && typeof first === 'object' && 'url' in first) {
        return (first as { url: string }).url;
      }
    }
    return null;
  }

  formatPriceRange(min: string | null, max: string | null): string {
    if (!min && !max) {
      return 'Chưa định giá';
    }
    const minVal = min ? Number(min).toLocaleString('vi-VN') + ' đ' : '';
    const maxVal = max ? Number(max).toLocaleString('vi-VN') + ' đ' : '';
    if (min && max && min !== max) {
      return `${minVal} - ${maxVal}`;
    }
    return minVal || maxVal;
  }

  getLifecycleLabel(state: ProductLifecycle): string {
    switch (state) {
      case 'ACTIVE':
        return 'Đang bán';
      case 'DRAFT':
        return 'Bản thảo';
      case 'PAUSED':
        return 'Tạm dừng';
      case 'DISCONTINUED':
        return 'Ngừng bán';
    }
  }

  getLifecycleBadgeClass(state: ProductLifecycle): string {
    switch (state) {
      case 'ACTIVE':
        return 'px-2 py-0.5 rounded text-[11px] font-bold bg-[#76b900]/20 text-[#76b900] border border-[#76b900]/30';
      case 'DRAFT':
        return 'px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700';
      case 'PAUSED':
        return 'px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800';
      case 'DISCONTINUED':
        return 'px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-800';
    }
  }

  openTransitionModal(tpl: ProductTemplateListItem): void {
    this.selectedTemplate.set(tpl);
    this.isTransitionModalOpen.set(true);
  }

  onLifecycleTransitioned(): void {
    this.showToast('Cập nhật trạng thái vòng đời thành công', 'success');
  }

  async deleteTemplate(tpl: ProductTemplateListItem): Promise<void> {
    const confirmed = confirm(
      `Bạn có chắc chắn muốn xóa mẫu sản phẩm "${tpl.name}"? Hành động này sẽ thất bại nếu mẫu đã có giao dịch hoặc tồn kho (CAT-010).`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await this.templateService.deleteTemplate(tpl.id);
      this.showToast('Đã xóa mẫu sản phẩm', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa mẫu sản phẩm';
      this.showToast(msg, 'error');
    }
  }

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    const id = ++this.toastIdCounter;
    this.toasts.update((current) => [...current, { id, message, type }]);
    setTimeout(() => this.removeToast(id), 5000);
  }

  removeToast(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
