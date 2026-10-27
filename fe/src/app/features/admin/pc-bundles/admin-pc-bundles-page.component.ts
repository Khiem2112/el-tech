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
import { RouterModule } from '@angular/router';
import { handleProductImageError } from '../../../core/constants/product.constants';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { AdminBranchService } from '../branches/services/admin-branch.service';
import { ProductLifecycle } from '../variants/services/admin-variant.service';
import { PcBundleSheetComponent } from './components/pc-bundle-sheet.component';
import {
  AdminPcBundle,
  AdminPcBundleService,
  BranchAvailability,
} from './services/admin-pc-bundle.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

@Component({
  selector: 'app-admin-pc-bundles-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonDirective,
    SelectComponent,
    PcBundleSheetComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Bộ Máy Tính Dựng Sẵn (Virtual BOM)
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Quản lý danh mục cấu hình máy tính lắp sẵn theo định mức linh kiện ảo và tính tồn khả dụng
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center bg-surface-alt border border-line rounded p-0.5 text-xs">
            <button
              type="button"
              (click)="currentView.set('list')"
              [class.bg-primary]="currentView() === 'list'"
              [class.text-primary-foreground]="currentView() === 'list'"
              [class.font-bold]="currentView() === 'list'"
              [class.text-muted]="currentView() !== 'list'"
              class="px-2.5 py-1 rounded transition-all"
              title="Chế độ xem bảng chi tiết"
            >
              Bảng
            </button>
            <button
              type="button"
              (click)="currentView.set('cards')"
              [class.bg-primary]="currentView() === 'cards'"
              [class.text-primary-foreground]="currentView() === 'cards'"
              [class.font-bold]="currentView() === 'cards'"
              [class.text-muted]="currentView() !== 'cards'"
              class="px-2.5 py-1 rounded transition-all"
              title="Chế độ xem thẻ trực quan"
            >
              Thẻ
            </button>
          </div>

          <button
            type="button"
            appButton
            variant="primary"
            size="sm"
            (click)="openCreateSheet()"
            class="inline-flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Bộ Máy</span>
          </button>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 shadow-xs space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-line gap-4 flex-wrap text-xs">
          <div class="text-muted">
            Hiển thị <strong class="text-foreground font-bold tabular-nums">{{ bundleService.bundles().length }}</strong> / <span class="tabular-nums">{{ bundleService.total() }}</span> cấu hình PC Bundle
          </div>

          <button
            type="button"
            appButton
            variant="outline"
            size="sm"
            (click)="onResetFilters()"
          >
            Đặt Lại
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div class="md:col-span-5">
            <label for="bundle-search-query" class="block font-semibold text-muted text-xs uppercase mb-1">
              Tìm Theo Tên Hoặc Mã Slug
            </label>
            <div class="flex items-center gap-1.5">
              <input
                id="bundle-search-query"
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchQueryChange($event)"
                (keydown.enter)="applyFilters()"
                placeholder="Nhập tên bộ máy, cấu hình hoặc slug..."
                class="flex-1 px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                appButton
                variant="outline"
                size="sm"
                (click)="applyFilters()"
              >
                Tìm
              </button>
            </div>
          </div>

          <div class="md:col-span-3">
            <label class="block font-semibold text-muted text-xs uppercase mb-1">
              Trạng Thái Vòng Đời
            </label>
            <app-select
              [options]="lifecycleOptions"
              [value]="lifecycleFilter()"
              (valueChange)="onLifecycleFilterChange($event)"
              placeholder="Trạng thái vòng đời"
            />
          </div>

          <div class="md:col-span-4">
            <label class="block font-semibold text-muted text-xs uppercase mb-1">
              Chi Nhánh Tra Cứu Tồn Kho
            </label>
            <app-select
              [options]="branchOptions()"
              [value]="selectedBranchId() !== null ? String(selectedBranchId()) : ''"
              (valueChange)="onBranchFilterChange($event)"
              placeholder="Toàn bộ chi nhánh"
            />
          </div>
        </div>
      </div>

      @if (bundleService.isLoading()) {
        <div class="p-12 text-center bg-surface border border-line rounded-lg space-y-3">
          <div class="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs text-muted">Đang nạp danh sách cấu hình Virtual BOM...</p>
        </div>
      } @else if (bundleService.error()) {
        <div class="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs flex items-center justify-between">
          <span>{{ bundleService.error() }}</span>
          <button
            type="button"
            appButton
            variant="outline"
            size="sm"
            (click)="loadBundles()"
          >
            Thử lại
          </button>
        </div>
      } @else if (bundleService.bundles().length === 0) {
        <div class="p-12 text-center bg-surface border border-line rounded-lg space-y-3">
          <svg class="w-10 h-10 text-muted mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div class="text-sm font-bold text-foreground">Chưa có bộ máy tính dựng sẵn nào</div>
          <p class="text-xs text-muted max-w-sm mx-auto">
            Không tìm thấy cấu hình PC nào khớp với bộ lọc. Hãy điều chỉnh điều kiện tìm kiếm hoặc bấm nút "Thêm Bộ Máy" để tạo cấu hình mới.
          </p>
          <button
            type="button"
            appButton
            variant="primary"
            size="sm"
            (click)="openCreateSheet()"
            class="inline-flex items-center gap-1.5"
          >
            + Thêm Bộ Máy
          </button>
        </div>
      } @else {
        @if (currentView() === 'list') {
          <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full min-w-[1000px] text-left text-xs">
                <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th class="py-3 px-4 w-14 text-center">Ảnh</th>
                    <th class="py-3 px-4 min-w-[220px]">Tên Bộ Máy</th>
                    <th class="py-3 px-4">Đường Dẫn Slug</th>
                    <th class="py-3 px-4 text-center whitespace-nowrap">Linh Kiện</th>
                    <th class="py-3 px-4 min-w-[200px]">Tồn Khả Dụng</th>
                    <th class="py-3 px-4 text-right whitespace-nowrap">Giá Gốc</th>
                    <th class="py-3 px-4 text-right whitespace-nowrap">Giảm Giá</th>
                    <th class="py-3 px-4 text-right whitespace-nowrap">Giá Bán</th>
                    <th class="py-3 px-4 text-center">Trạng Thái</th>
                    <th class="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line">
                  @for (bundle of bundleService.bundles(); track bundle.id) {
                    <tr class="hover:bg-surface-alt/50 transition-colors">
                      <td class="py-3 px-4 text-center">
                        <div class="w-10 h-10 rounded border border-line bg-surface-alt flex items-center justify-center overflow-hidden mx-auto">
                          @if (bundle.primaryImage) {
                            <img
                              src="/images/products/placeholder.webp"
                              [src]="bundle.primaryImage || '/images/products/placeholder.webp'"
                              [alt]="bundle.name || 'Bộ máy PC'"
                              class="w-full h-full object-contain p-0.5"
                              (error)="onImageError($event)"
                            />
                          } @else {
                            <svg class="w-5 h-5 text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                              <line x1="8" y1="21" x2="16" y2="21"/>
                              <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                          }
                        </div>
                      </td>

                      <td class="py-3 px-4">
                        <div class="font-bold text-foreground text-sm">{{ bundle.name }}</div>
                        @if (bundle.description) {
                          <div class="text-xs text-muted mt-0.5 line-clamp-1">{{ bundle.description }}</div>
                        }
                      </td>

                      <td class="py-3 px-4 font-mono text-muted text-xs whitespace-nowrap">
                        {{ bundle.slug }}
                      </td>

                      <td class="py-3 px-4 text-center tabular tabular-nums font-semibold whitespace-nowrap text-foreground">
                        {{ bundle.totalItemsCount }} món
                      </td>

                      <td class="py-3 px-4">
                        <div class="space-y-0.5">
                          @for (branch of getDisplayBranches(bundle); track branch.branchId) {
                            <div class="flex items-center gap-1.5 text-xs">
                              <span class="text-muted font-medium">{{ branch.branchCode }}:</span>
                              <strong
                                [class.text-emerald-600]="branch.buildableCount > 0"
                                [class.text-destructive]="branch.buildableCount === 0"
                                class="tabular tabular-nums font-bold"
                              >
                                {{ branch.buildableCount }} bộ
                              </strong>
                              @if (branch.bottleneckSku) {
                                <span class="text-muted text-xs truncate max-w-[120px]" title="Giới hạn bởi: {{ branch.bottleneckSku }}">
                                  (hạn chế: {{ branch.bottleneckSku }})
                                </span>
                              }
                            </div>
                          }
                        </div>
                      </td>

                      <td class="py-3 px-4 text-right tabular tabular-nums text-muted font-mono whitespace-nowrap">
                        {{ formatCurrency(bundle.grossTotal) }}
                      </td>

                      <td class="py-3 px-4 text-right tabular tabular-nums font-semibold font-mono whitespace-nowrap text-destructive">
                        {{ bundle.discountAmount > 0 ? ('- ' + formatCurrency(bundle.discountAmount)) : '0 đ' }}
                      </td>

                      <td class="py-3 px-4 text-right font-bold tabular tabular-nums font-mono text-foreground whitespace-nowrap">
                        {{ formatCurrency(bundle.finalPrice) }}
                      </td>

                      <td class="py-3 px-4 text-center whitespace-nowrap">
                        @switch (bundle.lifecycleState) {
                          @case ('ACTIVE') {
                            <span class="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 border border-primary/20 text-primary">
                              Đang Bán
                            </span>
                          }
                          @case ('DRAFT') {
                            <span class="px-2 py-0.5 rounded text-xs font-bold bg-surface-alt border border-line text-muted">
                              Bản Nháp
                            </span>
                          }
                          @case ('PAUSED') {
                            <span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-700">
                              Tạm Dừng
                            </span>
                          }
                          @case ('DISCONTINUED') {
                            <span class="px-2 py-0.5 rounded text-xs font-bold bg-destructive/10 border border-destructive/20 text-destructive">
                              Ngừng Bán
                            </span>
                          }
                        }
                      </td>

                      <td class="py-3 px-4 text-right whitespace-nowrap">
                        <div class="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            (click)="openEditSheet(bundle)"
                            class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
                            title="Sửa cấu hình định mức BOM"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            (click)="onDeleteBundle(bundle)"
                            class="p-1.5 rounded hover:bg-surface-alt text-destructive hover:opacity-80 transition-colors"
                            title="Xóa bộ máy"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
        }

        @if (currentView() === 'cards') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (bundle of bundleService.bundles(); track bundle.id) {
              <div class="bg-surface border border-line rounded-lg overflow-hidden shadow-xs flex flex-col justify-between hover:border-primary/50 transition-all group">
                <div>
                  <div class="h-44 bg-surface-alt relative flex items-center justify-center p-3 border-b border-line">
                    @if (bundle.primaryImage) {
                      <img
                        src="/images/products/placeholder.webp"
                        [src]="bundle.primaryImage || '/images/products/placeholder.webp'"
                        [alt]="bundle.name || 'Bộ máy PC'"
                        class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        (error)="onImageError($event)"
                      />
                    } @else {
                      <svg class="w-14 h-14 text-muted" fill="none" stroke="currentColor" stroke-width="1.25" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    }

                    <div class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-xs font-bold bg-primary text-primary-foreground">
                      {{ bundle.totalItemsCount }} LINH KIỆN
                    </div>

                    <div class="absolute top-2.5 right-2.5">
                      @switch (bundle.lifecycleState) {
                        @case ('ACTIVE') {
                          <span class="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 border border-primary/20 text-primary">
                            Đang Bán
                          </span>
                        }
                        @case ('DRAFT') {
                          <span class="px-2 py-0.5 rounded text-xs font-bold bg-surface-alt border border-line text-muted">
                            Bản Nháp
                          </span>
                        }
                        @case ('PAUSED') {
                          <span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-700">
                            Tạm Dừng
                          </span>
                        }
                        @case ('DISCONTINUED') {
                          <span class="px-2 py-0.5 rounded text-xs font-bold bg-destructive/10 border border-destructive/20 text-destructive">
                            Ngừng Bán
                          </span>
                        }
                      }
                    </div>
                  </div>

                  <div class="p-4 space-y-3">
                    <div>
                      <h3 class="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {{ bundle.name }}
                      </h3>
                      <p class="text-xs text-muted mt-1 line-clamp-2 min-h-[32px]">
                        {{ bundle.description || 'Chưa có mô tả tóm tắt cho cấu hình máy tính này.' }}
                      </p>

                      <div class="mt-3 flex items-baseline gap-2 flex-wrap">
                        <span class="text-base font-bold text-foreground font-mono tabular tabular-nums">
                          {{ formatCurrency(bundle.finalPrice) }}
                        </span>
                        @if (bundle.discountAmount > 0) {
                          <span class="text-xs text-muted line-through font-mono tabular tabular-nums">
                            {{ formatCurrency(bundle.grossTotal) }}
                          </span>
                          <span class="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded font-mono tabular">
                            -{{ formatCurrency(bundle.discountAmount) }}
                          </span>
                        }
                      </div>
                    </div>

                    <div class="p-2.5 bg-surface-alt rounded border border-line space-y-1 text-xs">
                      <div class="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                        Tồn Khả Dụng Toàn Hệ Thống:
                      </div>
                      @for (branch of getDisplayBranches(bundle); track branch.branchId) {
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-muted">{{ branch.branchName }}:</span>
                          <span
                            [class.text-emerald-600]="branch.buildableCount > 0"
                            [class.text-destructive]="branch.buildableCount === 0"
                            class="font-bold tabular tabular-nums"
                          >
                            {{ branch.buildableCount }} bộ
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div class="p-4 pt-0 border-t border-line mt-2 pt-3 flex items-center justify-between">
                  <span class="text-xs font-mono text-muted truncate max-w-[140px]">
                    {{ bundle.slug }}
                  </span>

                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      (click)="onDeleteBundle(bundle)"
                      class="p-1.5 rounded hover:bg-surface-alt text-destructive hover:opacity-80 transition-colors"
                      title="Xóa bộ máy"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      appButton
                      variant="outline"
                      size="sm"
                      (click)="openEditSheet(bundle)"
                      class="inline-flex items-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Sửa BOM</span>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }

      <app-pc-bundle-sheet
        [isOpen]="isSheetOpen()"
        [bundle]="selectedBundle()"
        (closed)="onSheetClosed()"
        (saved)="onSheetSaved($event)"
      />

      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        @for (toast of toasts(); track toast.id) {
          <div
            [class.bg-surface]="true"
            [class.border-emerald-300]="toast.type === 'success'"
            [class.text-emerald-800]="toast.type === 'success'"
            [class.border-destructive]="toast.type === 'error'"
            [class.text-destructive]="toast.type === 'error'"
            [class.border-blue-300]="toast.type === 'info'"
            [class.text-foreground]="toast.type === 'info'"
            class="pointer-events-auto p-3 rounded-lg border shadow-xl text-xs flex items-center justify-between gap-3 animate-fade-in"
          >
            <span>{{ toast.message }}</span>
            <button type="button" (click)="dismissToast(toast.id)" class="text-muted hover:text-foreground">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminPcBundlesPageComponent implements OnInit {
  protected readonly String = String;
  protected readonly onImageError = handleProductImageError;

  readonly bundleService = inject(AdminPcBundleService);
  readonly branchService = inject(AdminBranchService);

  readonly currentView = signal<'list' | 'cards'>('list');
  readonly searchQuery = signal<string>('');
  readonly lifecycleFilter = signal<string>('ALL');
  readonly selectedBranchId = signal<number | null>(null);

  readonly isSheetOpen = signal<boolean>(false);
  readonly selectedBundle = signal<AdminPcBundle | null>(null);
  readonly toasts = signal<readonly ToastNotification[]>([]);

  readonly lifecycleOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang bán (ACTIVE)' },
    { value: 'DRAFT', label: 'Bản nháp (DRAFT)' },
    { value: 'PAUSED', label: 'Tạm dừng (PAUSED)' },
    { value: 'DISCONTINUED', label: 'Ngừng kinh doanh (DISCONTINUED)' },
  ];

  readonly branchOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Toàn bộ chi nhánh' },
    ...this.branchService.branches().map((b) => ({ value: String(b.id), label: `${b.name} (${b.code})` })),
  ]);

  ngOnInit(): void {
    this.loadBundles();
    if (this.branchService.branches().length === 0) {
      this.branchService.loadBranches().catch(() => {});
    }
  }

  loadBundles(): void {
    const lifecycle = this.lifecycleFilter();
    this.bundleService.loadBundles({
      search: this.searchQuery(),
      lifecycleState: lifecycle === 'ALL' ? undefined : (lifecycle as ProductLifecycle),
      branchId: this.selectedBranchId() ?? undefined,
    });
  }

  onSearchQueryChange(val: string): void {
    this.searchQuery.set(val);
  }

  onLifecycleFilterChange(val: string | number): void {
    this.lifecycleFilter.set(String(val));
    this.applyFilters();
  }

  onBranchFilterChange(val: string | number): void {
    const branchId = val ? Number(val) : null;
    this.selectedBranchId.set(branchId);
    this.applyFilters();
  }

  applyFilters(): void {
    this.loadBundles();
  }

  onResetFilters(): void {
    this.searchQuery.set('');
    this.lifecycleFilter.set('ALL');
    this.selectedBranchId.set(null);
    this.loadBundles();
  }

  openCreateSheet(): void {
    this.selectedBundle.set(null);
    this.isSheetOpen.set(true);
  }

  openEditSheet(bundle: AdminPcBundle): void {
    this.selectedBundle.set(bundle);
    this.isSheetOpen.set(true);
  }

  onSheetClosed(): void {
    this.isSheetOpen.set(false);
    this.selectedBundle.set(null);
  }

  onSheetSaved(bundle: AdminPcBundle): void {
    this.showToast(`Đã lưu thành công cấu hình bộ máy "${bundle.name}"`, 'success');
    this.loadBundles();
  }

  async onDeleteBundle(bundle: AdminPcBundle): Promise<void> {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa/ngừng bán bộ máy "${bundle.name}"?`);
    if (!confirmed) return;

    try {
      await this.bundleService.deleteBundle(bundle.id);
      this.showToast(`Đã xóa/ngừng bán bộ máy "${bundle.name}"`, 'success');
      this.loadBundles();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa bộ máy tính';
      this.showToast(msg, 'error');
    }
  }

  getDisplayBranches(bundle: AdminPcBundle): readonly BranchAvailability[] {
    const selected = this.selectedBranchId();
    if (selected) {
      const found = bundle.branchAvailability.find((b: BranchAvailability) => b.branchId === selected);
      return found ? [found] : [];
    }
    return bundle.branchAvailability;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = Date.now();
    const newToast: ToastNotification = { id, message, type };
    this.toasts.set([...this.toasts(), newToast]);

    setTimeout(() => {
      this.dismissToast(id);
    }, 4000);
  }

  dismissToast(id: number): void {
    this.toasts.set(this.toasts().filter((t) => t.id !== id));
  }
}
