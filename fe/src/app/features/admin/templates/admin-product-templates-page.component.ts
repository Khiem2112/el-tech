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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { handleProductImageError } from '../../../core/constants/product.constants';
import { AppIconModule } from '../../../components/atoms/icon/icon.module';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
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
    ButtonDirective,
    SelectComponent,
    LifecycleTransitionDialogComponent,
    AppIconModule,
  ],
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Mẫu Sản Phẩm
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Quản lý danh mục mẫu phần cứng độc lập, bộ lọc đa chiều và biến thể sản phẩm
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center bg-surface-alt border border-line rounded p-0.5 text-xs">
            <button
              type="button"
              (click)="setViewMode('list')"
              [class.bg-primary]="viewMode() === 'list'"
              [class.text-primary-foreground]="viewMode() === 'list'"
              [class.font-bold]="viewMode() === 'list'"
              [class.text-muted]="viewMode() !== 'list'"
              class="px-3 py-1.5 rounded transition-all"
              title="Chế độ xem bảng"
            >
              Dạng bảng
            </button>
            <button
              type="button"
              (click)="setViewMode('kanban')"
              [class.bg-primary]="viewMode() === 'kanban'"
              [class.text-primary-foreground]="viewMode() === 'kanban'"
              [class.font-bold]="viewMode() === 'kanban'"
              [class.text-muted]="viewMode() !== 'kanban'"
              class="px-3 py-1.5 rounded transition-all"
              title="Chế độ xem thẻ trực quan"
            >
              Dạng thẻ
            </button>
          </div>

          <a
            routerLink="/admin/catalog/templates/new"
            appButton
            variant="primary"
            size="sm"
            class="uppercase tracking-wide inline-flex items-center gap-1.5"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Mẫu Mới</span>
          </a>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 shadow-xs space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-line gap-4 flex-wrap text-xs">
          <div class="text-muted">
            Tổng cộng: <strong class="text-foreground font-bold tabular-nums">{{ total() }}</strong> mẫu sản phẩm
          </div>

          <div class="flex items-center gap-2">
            @if (viewMode() === 'list') {
              <button
                type="button"
                (click)="toggleAllExpansion()"
                appButton
                variant="outline"
                size="sm"
              >
                <span>{{ isAllExpanded() ? 'Thu Gọn Tất Cả' : 'Mở Rộng Tất Cả' }}</span>
              </button>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label class="block font-semibold text-muted text-xs uppercase mb-1">Tìm Kiếm</label>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Tên mẫu, model hoặc slug..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block font-semibold text-muted text-xs uppercase mb-1">Danh Mục</label>
            <app-select
              [options]="categoryOptions()"
              [value]="categoryFilter() !== null && categoryFilter() !== undefined ? String(categoryFilter()) : ''"
              (valueChange)="onCategoryChange($event)"
              size="sm"
            />
          </div>

          <div>
            <label class="block font-semibold text-muted text-xs uppercase mb-1">Thương Hiệu</label>
            <app-select
              [options]="brandOptions()"
              [value]="brandFilter() !== null && brandFilter() !== undefined ? String(brandFilter()) : ''"
              (valueChange)="onBrandChange($event)"
              size="sm"
            />
          </div>

          <div>
            <label class="block font-semibold text-muted text-xs uppercase mb-1">Trạng Thái</label>
            <app-select
              [options]="statusOptions"
              [value]="statusFilter()"
              (valueChange)="onStatusChange($event)"
              size="sm"
            />
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="p-12 text-center text-muted">
          Đang tải dữ liệu mẫu sản phẩm...
        </div>
      } @else if (templates().length === 0) {
        <div class="bg-surface border border-line rounded-lg p-12 text-center space-y-3">
          <p class="text-foreground font-medium">Không tìm thấy mẫu sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
          <button
            type="button"
            appButton
            variant="secondary"
            size="sm"
            (click)="resetFilters()"
          >
            Xóa bộ lọc
          </button>
        </div>
      } @else {
        @if (viewMode() === 'list') {
          <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse min-w-[1000px]">
                <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th class="py-3 px-3 w-12 text-center whitespace-nowrap">
                      <button
                        type="button"
                        (click)="templates().length > 0 && expandedTemplateIds().size === templates().length ? collapseAll() : expandAll()"
                        class="p-1 rounded hover:bg-surface text-muted hover:text-foreground transition-colors inline-flex items-center justify-center"
                        [title]="templates().length > 0 && expandedTemplateIds().size === templates().length ? 'Thu gọn tất cả' : 'Mở rộng tất cả'"
                        aria-label="Đổi trạng thái mở rộng tất cả dòng"
                      >
                        <lucide-icon
                          [name]="templates().length > 0 && expandedTemplateIds().size === templates().length ? 'chevron-down' : 'chevron-right'"
                          class="w-4 h-4"
                        ></lucide-icon>
                      </button>
                    </th>
                    <th class="py-3 px-4 w-16 text-center whitespace-nowrap">Ảnh</th>
                    <th class="py-3 px-4 whitespace-nowrap">Thông Tin Mẫu Sản Phẩm</th>
                    <th class="py-3 px-4 text-right whitespace-nowrap">Khoảng Giá</th>
                    <th class="py-3 px-4 text-right whitespace-nowrap">Tồn Kho</th>
                    <th class="py-3 px-4 text-right whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line">
                  @for (tpl of templates(); track tpl.id) {
                    <tr class="hover:bg-surface-alt/70 transition-colors">
                      <td class="py-3 px-3 text-center">
                        <button
                          type="button"
                          (click)="toggleExpand(tpl.id)"
                          class="p-1.5 rounded hover:bg-surface text-muted hover:text-foreground transition-colors inline-flex items-center justify-center"
                          [attr.aria-expanded]="isExpanded(tpl.id)"
                          aria-label="Mở rộng hoặc thu gọn danh sách biến thể"
                        >
                          <lucide-icon
                            [name]="isExpanded(tpl.id) ? 'chevron-down' : 'chevron-right'"
                            class="w-4 h-4 text-foreground transition-transform"
                          ></lucide-icon>
                        </button>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <div class="w-11 h-11 rounded border border-line bg-surface-alt overflow-hidden flex items-center justify-center mx-auto">
                          @if (getFirstMedia(tpl)) {
                            <img
                              src="/images/products/placeholder.webp"
                              [src]="getFirstMedia(tpl) || '/images/products/placeholder.webp'"
                              [alt]="tpl.name || 'Mẫu sản phẩm'"
                              class="w-full h-full object-contain p-0.5"
                              (error)="onImageError($event)"
                            />
                          } @else {
                            <span class="text-xs text-muted">NO IMG</span>
                          }
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="space-y-1">
                          <a
                            [routerLink]="['/admin/catalog/templates', tpl.id]"
                            class="font-bold text-foreground hover:text-primary-strong transition-colors line-clamp-1 block"
                          >
                            {{ tpl.name }}
                          </a>
                          <div class="flex items-center gap-2 flex-wrap">
                            <span [class]="getLifecycleBadgeClass(tpl.lifecycleState)">
                              {{ getLifecycleLabel(tpl.lifecycleState) }}
                            </span>
                            <span class="px-2 py-0.5 rounded text-xs font-semibold bg-surface-alt text-foreground border border-line tabular-nums whitespace-nowrap">
                              {{ tpl.variantsCount ?? tpl.variantCount }} biến thể
                            </span>
                          </div>
                          <div class="text-xs text-muted flex items-center gap-2 flex-wrap">
                            <span class="font-medium text-foreground">{{ tpl.brand.name }}</span>
                            <span>&bull;</span>
                            <span>{{ tpl.category.name }}</span>
                            @if (tpl.model) {
                              <span>&bull;</span>
                              <span>Model: {{ tpl.model }}</span>
                            }
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-right tabular-nums whitespace-nowrap">
                        <div class="font-bold text-foreground">
                          {{ formatPriceRange(tpl.minPrice ?? tpl.minSellingPrice, tpl.maxPrice ?? tpl.maxSellingPrice) }}
                        </div>
                      </td>
                      <td class="py-3 px-4 text-right tabular-nums whitespace-nowrap">
                        <div class="font-bold" [class.text-emerald-700]="tpl.totalAvailable > 0" [class.text-rose-600]="tpl.totalAvailable <= 0">
                          {{ tpl.totalAvailable }} khả dụng
                        </div>
                        <div class="text-xs text-muted mt-0.5">
                          Tổng tồn: {{ tpl.totalOnHand }}
                        </div>
                      </td>
                      <td class="py-3 px-4 text-right whitespace-nowrap">
                        <div class="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            (click)="openTransitionModal(tpl)"
                            class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
                            title="Đổi trạng thái vòng đời"
                            aria-label="Đổi trạng thái vòng đời"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <a
                            [routerLink]="['/admin/catalog/templates', tpl.id]"
                            class="p-1.5 rounded hover:bg-surface-alt text-primary-strong hover:opacity-80 transition-colors"
                            title="Chi tiết"
                            aria-label="Chi tiết"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                          <button
                            type="button"
                            (click)="deleteTemplate(tpl)"
                            class="p-1.5 rounded hover:bg-surface-alt text-rose-600 hover:text-rose-700 transition-colors"
                            title="Xóa mẫu sản phẩm"
                            aria-label="Xóa mẫu sản phẩm"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    @if (isExpanded(tpl.id)) {
                      <tr class="bg-surface-alt/40 border-b border-line">
                        <td colspan="6" class="p-0">
                          <div class="p-4 pl-12 space-y-3 bg-surface-alt/25">
                            <div class="flex items-center justify-between">
                              <div class="flex items-center gap-2">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-muted">
                                  Danh Sách Biến Thể
                                </h4>
                                <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary tabular-nums">
                                  {{ tpl.variants?.length ?? 0 }} biến thể
                                </span>
                              </div>
                              <a
                                [routerLink]="['/admin/catalog/templates', tpl.id]"
                                class="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <span>Quản lý biến thể</span>
                                <lucide-icon name="arrow-right" class="w-3.5 h-3.5"></lucide-icon>
                              </a>
                            </div>

                            @if (!tpl.variants || tpl.variants.length === 0) {
                              <div class="py-6 px-4 bg-surface border border-line rounded text-center text-xs text-muted space-y-1">
                                <p>Mẫu sản phẩm này hiện chưa có biến thể nào.</p>
                                <a
                                  [routerLink]="['/admin/catalog/templates', tpl.id]"
                                  [fragment]="'section-variants'"
                                  class="text-primary font-semibold hover:underline inline-block"
                                >
                                  Thêm biến thể đầu tiên cho mẫu này
                                </a>
                              </div>
                            } @else {
                              <div class="bg-surface border border-line rounded overflow-hidden shadow-xs">
                                <div class="overflow-x-auto">
                                  <table class="w-full text-left text-xs border-collapse min-w-[750px]">
                                    <thead class="bg-surface-alt/70 border-b border-line text-muted font-semibold uppercase tracking-wider">
                                      <tr>
                                        <th class="py-2.5 px-3 whitespace-nowrap">Mã linh kiện</th>
                                        <th class="py-2.5 px-3 whitespace-nowrap">Nhãn Phân Loại</th>
                                        <th class="py-2.5 px-3 whitespace-nowrap">Mã Vạch</th>
                                        <th class="py-2.5 px-3 text-right whitespace-nowrap">Giá Niêm Yết</th>
                                        <th class="py-2.5 px-3 text-right whitespace-nowrap">Giá Bán</th>
                                        <th class="py-2.5 px-3 text-right whitespace-nowrap">Tồn Thực Tế</th>
                                        <th class="py-2.5 px-3 text-right whitespace-nowrap">Tồn Khả Dụng</th>
                                        <th class="py-2.5 px-3 text-center whitespace-nowrap">Trạng Thái</th>
                                        <th class="py-2.5 px-3 text-right whitespace-nowrap">Thao Tác</th>
                                      </tr>
                                    </thead>
                                    <tbody class="divide-y divide-line/60">
                                      @for (v of tpl.variants; track v.id) {
                                        <tr class="hover:bg-surface-alt/50 transition-colors">
                                          <td class="py-2 px-3 font-mono font-bold text-foreground whitespace-nowrap">
                                            {{ v.sku }}
                                          </td>
                                          <td class="py-2 px-3 text-foreground whitespace-nowrap">
                                            {{ v.variationLabel || 'Mặc định' }}
                                          </td>
                                          <td class="py-2 px-3 font-mono text-muted whitespace-nowrap">
                                            {{ v.barcode || '-' }}
                                          </td>
                                          <td class="py-2 px-3 text-right text-muted tabular-nums whitespace-nowrap">
                                            {{ formatPrice(v.retailPrice || v.sellingPrice) }}
                                          </td>
                                          <td class="py-2 px-3 text-right font-bold text-foreground tabular-nums whitespace-nowrap">
                                            {{ formatPrice(v.sellingPrice) }}
                                          </td>
                                          <td class="py-2 px-3 text-right tabular-nums text-foreground whitespace-nowrap">
                                            {{ v.stockQuant?.onHand ?? 0 }}
                                          </td>
                                          <td
                                            class="py-2 px-3 text-right tabular-nums font-semibold whitespace-nowrap"
                                            [class.text-emerald-700]="(v.stockQuant?.available ?? 0) > 0"
                                            [class.text-rose-600]="(v.stockQuant?.available ?? 0) <= 0"
                                          >
                                            {{ v.stockQuant?.available ?? 0 }}
                                          </td>
                                          <td class="py-2 px-3 text-center whitespace-nowrap">
                                            @if (v.isActive) {
                                              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Đang bán
                                              </span>
                                            } @else {
                                              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                Dừng kinh doanh
                                              </span>
                                            }
                                          </td>
                                          <td class="py-2 px-3 text-right whitespace-nowrap">
                                            <a
                                              [routerLink]="['/admin/catalog/templates', tpl.id]"
                                              [fragment]="'section-variants'"
                                              [queryParams]="{ variantId: v.id }"
                                              class="px-2 py-1 bg-surface-alt hover:bg-surface border border-line text-[11px] font-semibold rounded text-primary hover:text-primary-strong transition-colors"
                                              title="Xem hoặc chỉnh sửa biến thể này trên trang chi tiết"
                                            >
                                              Chi tiết
                                            </a>
                                          </td>
                                        </tr>
                                      }
                                    </tbody>
                                  </table>
                                </div>
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
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (tpl of templates(); track tpl.id) {
              <div class="bg-surface border border-line rounded-lg overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs text-foreground">
                <div class="relative h-44 bg-surface-alt flex items-center justify-center p-3 border-b border-line">
                  @if (getFirstMedia(tpl)) {
                    <img
                      src="/images/products/placeholder.webp"
                      [src]="getFirstMedia(tpl) || '/images/products/placeholder.webp'"
                      [alt]="tpl.name || 'Mẫu sản phẩm'"
                      class="max-h-full max-w-full object-contain"
                      (error)="onImageError($event)"
                    />
                  } @else {
                    <div class="text-muted text-xs">NO COVER IMAGE</div>
                  }
                  <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-xs font-bold bg-surface/90 text-foreground border border-line">
                    {{ tpl.brand.name }}
                  </span>
                  <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-xs font-bold" [class]="getLifecycleBadgeClass(tpl.lifecycleState)">
                    {{ getLifecycleLabel(tpl.lifecycleState) }}
                  </span>
                </div>

                <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div class="text-xs text-muted uppercase font-semibold">
                      {{ tpl.category.name }} | {{ tpl.model }}
                    </div>
                    <a
                      [routerLink]="['/admin/catalog/templates', tpl.id]"
                      class="font-bold text-foreground text-sm hover:text-primary-strong block mt-1 line-clamp-1"
                    >
                      {{ tpl.name }}
                    </a>
                    <div class="text-sm font-bold text-primary-strong mt-1.5 tabular-nums">
                      {{ formatPriceRange(tpl.minSellingPrice, tpl.maxSellingPrice) }}
                    </div>
                  </div>

                  <div class="p-2.5 bg-surface-alt rounded border border-line space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-muted">Biến thể:</span>
                      <button
                        type="button"
                        (click)="toggleExpand(tpl.id)"
                        class="font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                        title="Xem danh sách biến thể"
                      >
                        <span>{{ tpl.variantCount }} biến thể</span>
                        <lucide-icon [name]="isExpanded(tpl.id) ? 'chevron-up' : 'chevron-down'" class="w-3.5 h-3.5"></lucide-icon>
                      </button>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-muted">Tồn khả dụng:</span>
                      <span class="font-bold" [class.text-emerald-700]="tpl.totalAvailable > 0" [class.text-rose-600]="tpl.totalAvailable <= 0">
                        {{ tpl.totalAvailable }} chiếc
                      </span>
                    </div>
                    <div class="w-full bg-line rounded-full h-1.5 overflow-hidden">
                      <div
                        class="bg-primary h-full rounded-full transition-all"
                        [style.width.%]="tpl.totalAvailable > 0 ? 70 : 0"
                      ></div>
                    </div>

                    @if (isExpanded(tpl.id) && tpl.variants && tpl.variants.length > 0) {
                      <div class="pt-2 border-t border-line space-y-1.5 max-h-36 overflow-y-auto">
                        @for (v of tpl.variants; track v.id) {
                          <div class="flex items-center justify-between text-xs bg-surface p-1.5 rounded border border-line">
                            <div class="truncate mr-2">
                              <span class="font-mono font-bold">{{ v.sku }}</span>
                              @if (v.variationLabel) {
                                <span class="text-muted ml-1 text-[11px]">({{ v.variationLabel }})</span>
                              }
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                              <span class="font-bold tabular">{{ formatPrice(v.sellingPrice) }}</span>
                              <a
                                [routerLink]="['/admin/catalog/templates', tpl.id]"
                                [fragment]="'section-variants'"
                                [queryParams]="{ variantId: v.id }"
                                class="text-[11px] text-primary hover:underline font-semibold"
                              >
                                Chi tiết
                              </a>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>

                  <div class="flex items-center justify-end gap-2 pt-2 border-t border-line">
                    <button
                      type="button"
                      (click)="openTransitionModal(tpl)"
                      class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
                      title="Đổi trạng thái"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <a
                      [routerLink]="['/admin/catalog/templates', tpl.id]"
                      class="px-3 py-1 bg-surface-alt hover:bg-surface text-primary-strong border border-line text-xs font-semibold rounded transition-colors"
                    >
                      Chi tiết
                    </a>
                    <button
                      type="button"
                      (click)="deleteTemplate(tpl)"
                      class="p-1.5 rounded hover:bg-surface-alt text-rose-600 hover:text-rose-700 transition-colors"
                      title="Xóa mẫu sản phẩm"
                      aria-label="Xóa mẫu sản phẩm"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-line text-xs text-muted">
          <div>
            Trang {{ page() }} / {{ totalPages() }} (Tổng số {{ total() }} mẫu sản phẩm)
          </div>

          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              appButton
              variant="secondary"
              size="sm"
              [disabled]="page() <= 1"
              (click)="onPageChange(page() - 1)"
            >
              Trang trước
            </button>

            @for (p of pageList(); track $index) {
              @if (p === 'ellipsis') {
                <span class="px-2 py-1 text-xs text-muted select-none">...</span>
              } @else {
                <button
                  type="button"
                  (click)="onPageChange(p)"
                  class="min-w-8 h-8 px-2 rounded border text-xs font-bold transition-colors cursor-pointer tabular"
                  [class.border-primary]="page() === p"
                  [class.bg-primary]="page() === p"
                  [class.text-primary-foreground]="page() === p"
                  [class.border-line]="page() !== p"
                  [class.bg-surface]="page() !== p"
                  [class.text-foreground]="page() !== p"
                  [attr.aria-current]="page() === p ? 'page' : null"
                >
                  {{ p }}
                </button>
              }
            }

            <button
              type="button"
              appButton
              variant="secondary"
              size="sm"
              [disabled]="page() >= totalPages()"
              (click)="onPageChange(page() + 1)"
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
              [class.bg-surface]="true"
              [class.border-emerald-400]="toast.type === 'success'"
              [class.text-emerald-800]="toast.type === 'success'"
              [class.border-rose-400]="toast.type === 'error'"
              [class.text-rose-800]="toast.type === 'error'"
              [class.border-blue-400]="toast.type === 'info'"
              [class.text-blue-800]="toast.type === 'info'"
              class="p-3 border rounded shadow-lg text-xs flex items-center justify-between gap-3 animate-fade-in"
            >
              <span>{{ toast.message }}</span>
              <button
                type="button"
                (click)="removeToast(toast.id)"
                class="text-muted hover:text-foreground text-xs font-bold"
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
  protected readonly String = String;
  protected readonly onImageError = handleProductImageError;

  private readonly templateService = inject(AdminProductTemplateService);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly brandService = inject(AdminBrandService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
  readonly expandedTemplateIds = signal<Set<number>>(new Set());

  readonly toasts = signal<ToastNotification[]>([]);
  private toastIdCounter = 0;

  readonly totalPages = computed(() => {
    const l = this.limit();
    const t = this.total();
    return l > 0 ? Math.ceil(t / l) : 1;
  });

  readonly isAllExpanded = computed(() => {
    const list = this.templates();
    if (list.length === 0) return false;
    return this.expandedTemplateIds().size === list.length;
  });

  readonly pageList = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 6) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = new Set<number>();
    pages.add(1);
    pages.add(2);
    if (current > 1 && current < total) {
      pages.add(current);
    }
    pages.add(total - 1);
    pages.add(total);

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result: (number | 'ellipsis')[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push('ellipsis');
      }
      result.push(sorted[i]);
    }
    return result;
  });

  readonly categoryOptions = computed<SelectOption[]>(() => {
    return [
      { value: '', label: 'Tất cả danh mục' },
      ...this.categoryList().map((c) => ({ value: String(c.id), label: c.name })),
    ];
  });

  readonly brandOptions = computed<SelectOption[]>(() => {
    return [
      { value: '', label: 'Tất cả thương hiệu' },
      ...this.brandList().map((b) => ({ value: String(b.id), label: b.name })),
    ];
  });

  readonly statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang bán' },
    { value: 'DRAFT', label: 'Bản thảo' },
    { value: 'PAUSED', label: 'Tạm dừng' },
    { value: 'DISCONTINUED', label: 'Ngừng kinh doanh' },
  ];

  async ngOnInit(): Promise<void> {
    const categoryIdParam = this.route.snapshot.queryParams['categoryId'];
    const searchParam = this.route.snapshot.queryParams['search'];
    if (categoryIdParam) {
      const catId = Number(categoryIdParam);
      if (!Number.isNaN(catId) && catId > 0) {
        this.templateService.categoryFilter.set(catId);
      }
    }
    if (searchParam) {
      this.templateService.searchQuery.set(searchParam);
    }

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

  onCategoryChange(val: string): void {
    this.templateService.categoryFilter.set(val ? Number(val) : null);
    this.templateService.page.set(1);
    void this.templateService.loadTemplates();
  }

  onBrandChange(val: string): void {
    this.templateService.brandFilter.set(val ? Number(val) : null);
    this.templateService.page.set(1);
    void this.templateService.loadTemplates();
  }

  onStatusChange(val: string): void {
    this.templateService.statusFilter.set(val as ProductLifecycle | 'ALL');
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
      return (tpl.media[0] as { url?: string })?.url ?? null;
    }
    return null;
  }

  toggleExpand(templateId: number): void {
    this.expandedTemplateIds.update((current) => {
      const next = new Set(current);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  }

  isExpanded(templateId: number): boolean {
    return this.expandedTemplateIds().has(templateId);
  }

  expandAll(): void {
    const ids = this.templates().map((t) => t.id);
    this.expandedTemplateIds.set(new Set(ids));
  }

  collapseAll(): void {
    this.expandedTemplateIds.set(new Set());
  }

  toggleAllExpansion(): void {
    if (this.isAllExpanded()) {
      this.collapseAll();
    } else {
      this.expandAll();
    }
  }

  formatPrice(value: number | string | null | undefined): string {
    if (value === null || value === undefined) {
      return '0 đ';
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) {
      return '0 đ';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  }

  formatPriceRange(min: number | string | null, max: number | string | null): string {
    const numMin = min !== null && min !== undefined ? Number(min) : 0;
    const numMax = max !== null && max !== undefined ? Number(max) : 0;
    const validMin = Number.isNaN(numMin) ? 0 : numMin;
    const validMax = Number.isNaN(numMax) ? 0 : numMax;
    if (validMin === validMax) {
      return this.formatPrice(validMin);
    }
    return `${this.formatPrice(validMin)} - ${this.formatPrice(validMax)}`;
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
        return 'px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap';
      case 'DRAFT':
        return 'px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap';
      case 'PAUSED':
        return 'px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap';
      case 'DISCONTINUED':
        return 'px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap';
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
      `Bạn có chắc chắn muốn xóa mẫu sản phẩm "${tpl.name}"? Hành động này sẽ thất bại nếu mẫu đã có giao dịch hoặc tồn kho.`,
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
