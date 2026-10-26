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
import { Router } from '@angular/router';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { CategoryFormDialogComponent } from './components/category-form-dialog.component';
import { SpecSchemaSheetComponent } from './components/spec-schema-sheet.component';
import {
  AdminCategory,
  AdminCategoryService,
} from './services/admin-category.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

type FlattenedCategoryRow = AdminCategory & {
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
};

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonDirective,
    SelectComponent,
    CategoryFormDialogComponent,
    SpecSchemaSheetComponent,
  ],
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Danh Mục Sản Phẩm
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Quản lý cây phân cấp ngành hàng linh kiện PC và cấu hình schema thông số kỹ thuật động
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
            <span>Thêm Danh Mục</span>
          </button>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative flex-1">
            <input
              type="text"
              [ngModel]="categoryService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm kiếm theo tên hoặc mã đường dẫn slug..."
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
              [value]="categoryService.statusFilter()"
              (valueChange)="onStatusFilterChange($event)"
              size="sm"
              class="w-48"
            />
          </div>
        </div>

        <div class="text-xs text-muted text-right">
          Tổng số: <strong class="text-foreground">{{ visibleCategories().length }}</strong> danh mục
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1000px]">
            <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th class="py-3 px-4 whitespace-nowrap">Tên Danh Mục Ngành Hàng</th>
                <th class="py-3 px-4 whitespace-nowrap">Mã Đường Dẫn (Slug)</th>
                <th class="py-3 px-4 text-center whitespace-nowrap">Phiên Bản Schema</th>
                <th class="py-3 px-4 text-center whitespace-nowrap">Smart Buttons (Sản Phẩm & Tồn Kho)</th>
                <th class="py-3 px-4 text-center whitespace-nowrap">Trạng Thái</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line text-xs">
              @if (categoryService.isLoading()) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-muted">
                    <div class="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Đang tải cây danh mục ngành hàng...</p>
                  </td>
                </tr>
              } @else if (visibleCategories().length === 0) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-muted">
                    <p class="font-medium text-foreground">Không tìm thấy danh mục ngành hàng nào phù hợp</p>
                    <p class="text-xs text-muted mt-1">Vui lòng điều chỉnh lại bộ lọc hoặc tạo danh mục mới</p>
                  </td>
                </tr>
              } @else {
                @for (cat of visibleCategories(); track cat.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors group">
                    <td class="py-3 px-4 font-bold text-foreground">
                      <div class="flex items-center gap-2" [style.padding-left.px]="cat.depth * 24">
                        @if (cat.hasChildren) {
                          <button
                            type="button"
                            (click)="toggleExpand(cat.id)"
                            class="p-0.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
                            [title]="cat.isExpanded ? 'Thu gọn' : 'Mở rộng'"
                          >
                            <svg
                              class="w-3.5 h-3.5 transform transition-transform"
                              [ngClass]="{ 'rotate-90': cat.isExpanded }"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              viewBox="0 0 24 24"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        } @else if (cat.depth > 0) {
                          <span class="w-3.5 h-3.5 flex items-center justify-center text-muted font-mono text-xs">
                            --
                          </span>
                        } @else {
                          <span class="w-3.5"></span>
                        }

                        <span
                          class="w-2 h-2 rounded-full"
                          [ngClass]="cat.isActive ? 'bg-primary' : 'bg-slate-300'"
                        ></span>
                        <span>{{ cat.name }}</span>
                        @if (cat.description) {
                          <span class="text-xs text-muted font-normal hidden md:inline truncate max-w-xs" [title]="cat.description">
                            - {{ cat.description }}
                          </span>
                        }
                      </div>
                    </td>

                    <td class="py-3 px-4 font-mono text-muted text-xs whitespace-nowrap">
                      {{ cat.slug }}
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      <span class="px-2.5 py-0.5 rounded font-mono font-bold bg-surface-alt text-primary-strong border border-line text-xs">
                        v{{ cat.specificationSchemaVersion }}
                      </span>
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      <div class="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          (click)="onNavigateToTemplates(cat)"
                          class="px-2.5 py-0.5 bg-surface-alt hover:bg-surface border border-line rounded font-bold text-xs text-foreground transition-colors cursor-pointer"
                          title="Bấm để xem danh sách mẫu sản phẩm thuộc danh mục này"
                        >
                          {{ cat.productTemplateCount }} mẫu
                        </button>

                        <button
                          type="button"
                          (click)="onNavigateToInventory(cat)"
                          class="px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-bold text-xs transition-colors cursor-pointer"
                          title="Bấm để xem số lượng tồn kho của danh mục này"
                        >
                          {{ cat.totalInventory }} tồn
                        </button>

                        <button
                          type="button"
                          (click)="onNavigateToTransfers(cat)"
                          class="px-2.5 py-0.5 rounded font-bold text-xs transition-colors cursor-pointer"
                          [ngClass]="cat.activeTransfers > 0 ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200' : 'bg-surface-alt hover:bg-surface text-muted border border-line'"
                          title="Bấm để xem phiếu điều chuyển kho liên quan đến danh mục này"
                        >
                          {{ cat.activeTransfers }} điều chuyển
                        </button>
                      </div>
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (cat.isActive) {
                        <span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đang hoạt động
                        </span>
                      } @else {
                        <span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Tạm dừng
                        </span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        (click)="openSpecSchemaSheet(cat)"
                        class="p-1.5 rounded hover:bg-surface-alt text-primary-strong transition-colors"
                        title="Cấu hình thuộc tính kỹ thuật động"
                        aria-label="Cấu hình thuộc tính kỹ thuật động"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <line x1="10" y1="9" x2="8" y2="9"/>
                        </svg>
                      </button>

                      <button
                        type="button"
                        (click)="openEditModal(cat)"
                        class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
                        title="Chỉnh sửa danh mục"
                        aria-label="Chỉnh sửa danh mục"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                      </button>

                      <button
                        type="button"
                        (click)="toggleCategoryStatus(cat)"
                        class="p-1.5 rounded hover:bg-surface-alt transition-colors"
                        [ngClass]="cat.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'"
                        [title]="cat.isActive ? 'Tạm dừng danh mục' : 'Kích hoạt danh mục'"
                        [aria-label]="cat.isActive ? 'Tạm dừng danh mục' : 'Kích hoạt danh mục'"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
    </div>

    <!-- Hộp thoại Thêm/Sửa Danh Mục Ngành Hàng -->
    <app-category-form-dialog
      [isOpen]="isFormModalOpen()"
      [categoryToEdit]="selectedCategoryForEdit()"
      [allCategories]="categoryService.categories()"
      (closeDialog)="closeFormModal()"
      (saved)="onCategorySaved($event)"
    />

    <!-- Bảng trượt Cấu Hình Schema Thông Số Kỹ Thuật Động -->
    <app-spec-schema-sheet
      [isOpen]="isSpecSheetOpen()"
      [category]="selectedCategoryForSpec()"
      (closeSheet)="closeSpecSheet()"
      (saved)="onSpecSchemaSaved($event)"
    />

    <!-- Thông báo hệ thống (Toast container) -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-xs font-semibold flex items-center justify-between gap-3 border transition-all transform translate-y-0 bg-surface"
          [ngClass]="{
            'text-emerald-800 border-emerald-400': toast.type === 'success',
            'text-rose-800 border-rose-400': toast.type === 'error',
            'text-blue-800 border-blue-400': toast.type === 'info'
          }"
        >
          <span>{{ toast.message }}</span>
          <button
            type="button"
            (click)="dismissToast(toast.id)"
            class="p-0.5 rounded text-muted hover:text-foreground transition-colors"
            title="Đóng thông báo"
            aria-label="Đóng thông báo"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesPageComponent implements OnInit {
  readonly categoryService = inject(AdminCategoryService);
  private readonly router = inject(Router);

  readonly statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Tạm dừng hoạt động' },
  ];

  readonly isFormModalOpen = signal<boolean>(false);
  readonly selectedCategoryForEdit = signal<AdminCategory | null>(null);

  readonly isSpecSheetOpen = signal<boolean>(false);
  readonly selectedCategoryForSpec = signal<AdminCategory | null>(null);

  readonly collapsedIds = signal<Set<number>>(new Set());
  readonly toasts = signal<ToastNotification[]>([]);

  readonly visibleCategories = computed<FlattenedCategoryRow[]>(() => {
    const search = this.categoryService.searchQuery().trim().toLowerCase();
    const status = this.categoryService.statusFilter();
    const tree = this.categoryService.categoryTree();
    const flatList = this.categoryService.categories();

    if (search.length > 0) {
      return flatList
        .filter((cat) => {
          const matchSearch =
            cat.name.toLowerCase().includes(search) || cat.slug.toLowerCase().includes(search);
          const matchStatus =
            status === 'ALL' ||
            (status === 'ACTIVE' && cat.isActive) ||
            (status === 'INACTIVE' && !cat.isActive);
          return matchSearch && matchStatus;
        })
        .map((cat) => ({
          ...cat,
          depth: 0,
          hasChildren: false,
          isExpanded: false,
        }));
    }

    const collapsed = this.collapsedIds();
    const rows: FlattenedCategoryRow[] = [];

    const traverse = (node: AdminCategory, depth: number): void => {
      const matchStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && node.isActive) ||
        (status === 'INACTIVE' && !node.isActive);

      const hasChildren = Boolean(node.children && node.children.length > 0);
      const isExpanded = !collapsed.has(node.id);

      if (matchStatus) {
        rows.push({
          ...node,
          depth,
          hasChildren,
          isExpanded,
        });
      }

      if (hasChildren && isExpanded && node.children) {
        for (const child of node.children) {
          traverse(child, depth + 1);
        }
      }
    };

    for (const root of tree) {
      traverse(root, 0);
    }

    return rows;
  });

  async ngOnInit(): Promise<void> {
    await this.categoryService.loadCategories();
  }

  onSearchChange(term: string): void {
    this.categoryService.searchQuery.set(term);
  }

  onStatusFilterChange(filter: string): void {
    this.categoryService.statusFilter.set(filter as 'ALL' | 'ACTIVE' | 'INACTIVE');
    this.categoryService.loadCategories();
  }

  toggleExpand(categoryId: number): void {
    this.collapsedIds.update((set) => {
      const next = new Set(set);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  openCreateModal(): void {
    this.selectedCategoryForEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(category: AdminCategory): void {
    this.selectedCategoryForEdit.set(category);
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.selectedCategoryForEdit.set(null);
  }

  onCategorySaved(category: AdminCategory): void {
    const isEdit = Boolean(this.selectedCategoryForEdit());
    this.showToast(
      isEdit
        ? `Cập nhật danh mục "${category.name}" thành công`
        : `Thêm danh mục "${category.name}" thành công`,
      'success',
    );
  }

  openSpecSchemaSheet(category: AdminCategory): void {
    this.selectedCategoryForSpec.set(category);
    this.isSpecSheetOpen.set(true);
  }

  closeSpecSheet(): void {
    this.isSpecSheetOpen.set(false);
    this.selectedCategoryForSpec.set(null);
  }

  onSpecSchemaSaved(category: AdminCategory): void {
    this.showToast(
      `Đã cập nhật schema thông số kỹ thuật "${category.name}" lên phiên bản v${category.specificationSchemaVersion}`,
      'success',
    );
  }

  async toggleCategoryStatus(category: AdminCategory): Promise<void> {
    try {
      const updated = await this.categoryService.toggleCategoryStatus(category.id);
      this.showToast(
        updated.isActive
          ? `Đã kích hoạt hoạt động danh mục "${updated.name}"`
          : `Đã tạm dừng hoạt động danh mục "${updated.name}"`,
        'success',
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi đổi trạng thái danh mục';
      this.showToast(message, 'error');
    }
  }

  onNavigateToTemplates(category: AdminCategory): void {
    this.router.navigate(['/admin/catalog/templates'], {
      queryParams: { categoryId: category.id, category: category.slug },
    });
  }

  onNavigateToInventory(category: AdminCategory): void {
    this.router.navigate(['/admin/inventory/balances'], {
      queryParams: { categoryId: category.id, category: category.slug },
    });
  }

  onNavigateToTransfers(category: AdminCategory): void {
    this.router.navigate(['/admin/inventory/transfers'], {
      queryParams: { categoryId: category.id, category: category.slug },
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = Date.now() + Math.random();
    this.toasts.update((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      this.dismissToast(id);
    }, 4000);
  }

  dismissToast(id: number): void {
    this.toasts.update((current) => current.filter((item) => item.id !== id));
  }
}
