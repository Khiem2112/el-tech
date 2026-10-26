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
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { BrandFormDialogComponent } from './components/brand-form-dialog.component';
import {
  AdminBrand,
  AdminBrandService,
} from './services/admin-brand.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

@Component({
  selector: 'app-admin-brands-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonDirective, SelectComponent, BrandFormDialogComponent],
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Quản Lý Thương Hiệu
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Danh sách nhà sản xuất linh kiện máy tính và thống kê mẫu sản phẩm liên kết
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            appButton
            variant="primary"
            size="sm"
            (click)="openCreateModal()"
            class="uppercase tracking-wide"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Thương Hiệu</span>
          </button>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative flex-1">
            <input
              type="text"
              [ngModel]="brandService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm kiếm thương hiệu hoặc mã đường dẫn slug..."
              class="w-full pl-9 pr-4 py-2 bg-surface-alt border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
            />
            <svg
              class="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-muted font-medium whitespace-nowrap">Trạng thái:</span>
            <app-select
              [options]="statusOptions"
              [value]="brandService.statusFilter()"
              (valueChange)="onStatusFilterChange($event)"
              size="sm"
              class="w-48"
            />
          </div>
        </div>

        <div class="text-xs text-muted text-right">
          Tổng số: <strong class="text-foreground">{{ visibleBrands().length }}</strong> thương hiệu
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
        @if (brandService.isLoading()) {
          <div class="p-8 text-center text-muted space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải danh sách thương hiệu...</p>
          </div>
        } @else if (visibleBrands().length === 0) {
          <div class="p-12 text-center text-muted space-y-3">
            <div class="w-12 h-12 mx-auto rounded-full bg-surface-alt border border-line flex items-center justify-center text-muted">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-foreground">Không tìm thấy thương hiệu phù hợp</h3>
            <p class="text-xs text-muted max-w-sm mx-auto">
              Không có thương hiệu nào khớp với từ khóa tìm kiếm hoặc bộ lọc được chọn.
            </p>
            <button
              type="button"
              appButton
              variant="secondary"
              size="sm"
              (click)="clearFilters()"
            >
              Xóa bộ lọc
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[1000px]">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-3 px-4 whitespace-nowrap">Thương Hiệu</th>
                  <th class="py-3 px-4 whitespace-nowrap">Đường Dẫn (Slug)</th>
                  <th class="py-3 px-4 whitespace-nowrap">Ngành Hàng Liên Kết</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Mẫu Sản Phẩm</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Trạng Thái</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-xs">
                @for (brand of visibleBrands(); track brand.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors group">
                    <td class="py-3 px-4 font-semibold text-foreground">
                      <div class="flex items-center gap-2">
                        <span
                          class="w-2 h-2 rounded-full flex-shrink-0"
                          [class.bg-primary]="brand.isActive"
                          [class.bg-slate-300]="!brand.isActive"
                        ></span>
                        <span class="font-bold text-foreground">{{ brand.name }}</span>
                      </div>
                      @if (brand.description) {
                        <div class="text-xs text-muted font-normal mt-0.5 line-clamp-1 max-w-xs">
                          {{ brand.description }}
                        </div>
                      }
                    </td>

                    <td class="py-3 px-4 font-mono text-xs text-muted whitespace-nowrap">
                      {{ brand.slug }}
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      @if (brand.categories.length > 0) {
                        <div class="flex flex-wrap gap-1 max-w-xs">
                          @for (cat of brand.categories; track cat.id) {
                            <span class="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {{ cat.name }}
                            </span>
                          }
                        </div>
                      } @else {
                        <span class="text-xs text-muted italic">Chưa liên kết</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-center tabular-nums whitespace-nowrap">
                      <div class="font-bold text-foreground">
                        {{ brand.productTemplateCount }}
                      </div>
                      <div class="text-xs text-muted">mẫu sản phẩm</div>
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (brand.isActive) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Hoạt động
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Tạm dừng
                        </span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="toggleBreakdown(brand.id)"
                          [title]="isExpanded(brand.id) ? 'Thu gọn cơ cấu' : 'Xem chi tiết cơ cấu'"
                          class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-primary-strong transition-colors"
                          [class.text-primary-strong]="isExpanded(brand.id)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <line x1="10" y1="9" x2="8" y2="9" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          (click)="openEditModal(brand)"
                          title="Chỉnh sửa thông tin"
                          class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          (click)="toggleBrandStatus(brand)"
                          [title]="brand.isActive ? 'Tạm dừng hoạt động' : 'Kích hoạt hoạt động'"
                          class="p-1.5 rounded hover:bg-surface-alt transition-colors"
                          [class.text-amber-600]="brand.isActive"
                          [class.text-emerald-600]="!brand.isActive"
                        >
                          @if (brand.isActive) {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          } @else {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                        </button>

                        @if (brand.productTemplateCount === 0) {
                          <button
                            type="button"
                            (click)="deleteBrand(brand)"
                            title="Xóa thương hiệu"
                            class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-rose-600 transition-colors"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>

                  @if (isExpanded(brand.id)) {
                    <tr class="bg-surface-alt border-b border-line">
                      <td colspan="6" class="p-4">
                        <div class="bg-surface border border-line rounded-md p-4 space-y-3 shadow-xs">
                          <div class="flex items-center justify-between pb-2 border-b border-line">
                            <span class="text-xs font-bold text-foreground uppercase tracking-wider">
                              Cơ cấu ngành hàng liên kết: {{ brand.name }}
                            </span>
                            <span class="text-xs text-muted">
                              Tổng cộng: {{ brand.categories.length }} ngành hàng
                            </span>
                          </div>

                          @if (brand.categories.length > 0) {
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              @for (cat of brand.categories; track cat.id) {
                                <div class="p-2.5 rounded bg-surface-alt border border-line flex items-center justify-between">
                                  <div>
                                    <div class="font-semibold text-xs text-foreground">{{ cat.name }}</div>
                                    <div class="font-mono text-xs text-muted">{{ cat.slug }}</div>
                                  </div>
                                  <span class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Đang phân phối
                                  </span>
                                </div>
                              }
                            </div>
                          } @else {
                            <div class="py-3 text-center text-xs text-muted">
                              Chưa có sản phẩm nào thuộc thương hiệu này được liên kết với danh mục ngành hàng.
                            </div>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <app-brand-form-dialog
        [isOpen]="isModalOpen()"
        [brand]="selectedBrand()"
        (closeDialog)="closeModal()"
        (saved)="onBrandSaved($event)"
      />

      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        @for (toast of toasts(); track toast.id) {
          <div
            class="pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-xs font-medium transition-all bg-surface"
            [class.border-emerald-400]="toast.type === 'success'"
            [class.text-emerald-800]="toast.type === 'success'"
            [class.border-rose-400]="toast.type === 'error'"
            [class.text-rose-800]="toast.type === 'error'"
            [class.border-blue-400]="toast.type === 'info'"
            [class.text-blue-800]="toast.type === 'info'"
          >
            {{ toast.message }}
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBrandsPageComponent implements OnInit {
  readonly brandService = inject(AdminBrandService);

  readonly statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Tạm dừng hoạt động' },
  ];

  readonly isModalOpen = signal<boolean>(false);
  readonly selectedBrand = signal<AdminBrand | null>(null);
  readonly expandedBrandIds = signal<Set<number>>(new Set());
  readonly toasts = signal<ToastNotification[]>([]);

  readonly visibleBrands = computed(() => {
    const list = this.brandService.brands();
    const query = this.brandService.searchQuery().trim().toLowerCase();
    const status = this.brandService.statusFilter();

    return list.filter((b) => {
      const matchSearch =
        !query ||
        b.name.toLowerCase().includes(query) ||
        b.slug.toLowerCase().includes(query);

      const matchStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && b.isActive) ||
        (status === 'INACTIVE' && !b.isActive);

      return matchSearch && matchStatus;
    });
  });

  ngOnInit(): void {
    void this.brandService.loadBrands();
  }

  onSearchChange(value: string): void {
    this.brandService.searchQuery.set(value);
  }

  onStatusFilterChange(value: string): void {
    this.brandService.statusFilter.set(value as 'ALL' | 'ACTIVE' | 'INACTIVE');
    void this.brandService.loadBrands();
  }

  clearFilters(): void {
    this.brandService.searchQuery.set('');
    this.brandService.statusFilter.set('ALL');
    void this.brandService.loadBrands();
  }

  isExpanded(brandId: number): boolean {
    return this.expandedBrandIds().has(brandId);
  }

  toggleBreakdown(brandId: number): void {
    const current = new Set(this.expandedBrandIds());
    if (current.has(brandId)) {
      current.delete(brandId);
    } else {
      current.add(brandId);
    }
    this.expandedBrandIds.set(current);
  }

  openCreateModal(): void {
    this.selectedBrand.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(brand: AdminBrand): void {
    this.selectedBrand.set(brand);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedBrand.set(null);
  }

  onBrandSaved(brand: AdminBrand): void {
    this.showToast(
      `Lưu thương hiệu "${brand.name}" thành công`,
      'success',
    );
  }

  async toggleBrandStatus(brand: AdminBrand): Promise<void> {
    try {
      const updated = await this.brandService.toggleBrandStatus(brand.id);
      const action = updated.isActive ? 'Kích hoạt' : 'Tạm dừng';
      this.showToast(
        `${action} thương hiệu "${brand.name}" thành công`,
        'success',
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi đổi trạng thái';
      this.showToast(message, 'error');
    }
  }

  async deleteBrand(brand: AdminBrand): Promise<void> {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa thương hiệu "${brand.name}" không?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await this.brandService.deleteBrand(brand.id);
      this.showToast(
        `Xóa thương hiệu "${brand.name}" thành công`,
        'success',
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa thương hiệu';
      this.showToast(message, 'error');
    }
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = Date.now();
    this.toasts.update((current) => [...current, { id, message, type }]);

    setTimeout(() => {
      this.toasts.update((current) => current.filter((t) => t.id !== id));
    }, 4000);
  }
}
