import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { handleProductImageError } from '../../../core/constants/product.constants';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { AdminBrandService } from '../brands/services/admin-brand.service';
import { AdminCategoryService } from '../categories/services/admin-category.service';
import {
  AdminVariantCatalogItem,
  AdminVariantService,
} from './services/admin-variant.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

@Component({
  selector: 'app-admin-variants-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonDirective, SelectComponent],
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Danh Mục Biến Thể SKU Toàn Hệ Thống
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Tra cứu nhanh theo mã vạch barcode, mã SKU hoặc nhãn biến thể phục vụ kho vận và bán hàng
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-3 py-1.5 bg-surface border border-line rounded text-xs flex items-center gap-2">
            <span class="text-muted">Tổng số:</span>
            <strong class="text-primary font-bold tabular-nums">{{ total() }}</strong>
            <span class="text-muted">SKU</span>
          </div>

          <button
            type="button"
            appButton
            variant="outline"
            size="sm"
            (click)="focusBarcodeInput()"
            class="inline-flex items-center gap-1.5"
            title="Lấy nét ô quét mã vạch (Phím tắt: /)"
          >
            <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Quét Mã ( / )</span>
          </button>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 shadow-xs space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-line gap-4 flex-wrap">
          <div class="flex items-center gap-2 text-xs">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span class="font-bold text-foreground uppercase tracking-wide">Bộ Lọc Tra Cứu</span>
            <span class="text-muted">
              | Đang hiển thị <strong class="text-primary tabular-nums">{{ variants().length }}</strong> / {{ total() }} SKU
            </span>
          </div>

          <div class="flex items-center gap-2">
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
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div class="md:col-span-5">
            <label for="barcode-search-input" class="block font-semibold text-muted text-xs uppercase mb-1">
              Quét Mã Vạch Hoặc Nhập Mã SKU
            </label>
            <div class="flex items-center gap-1.5">
              <div class="relative flex-1">
                <input
                  #barcodeInput
                  id="barcode-search-input"
                  type="text"
                  [value]="searchQuery()"
                  (input)="onSearchInput($event)"
                  (keydown.enter)="onSearchSubmit()"
                  placeholder="Quét mã vạch hoặc nhập SKU, tên biến thể..."
                  class="w-full px-3.5 py-2 pl-9 bg-surface border border-line rounded text-sm text-foreground font-mono placeholder:font-sans placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                  autocomplete="off"
                />
                <svg
                  class="w-4 h-4 text-muted absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="button"
                appButton
                variant="primary"
                size="sm"
                (click)="onSearchSubmit()"
                class="whitespace-nowrap uppercase tracking-wider"
              >
                Tìm Kiếm
              </button>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block font-semibold text-muted text-xs uppercase mb-1">
              Lọc Theo Serial
            </label>
            <app-select
              [options]="serialOptions"
              [value]="serialFilterString()"
              (valueChange)="onSerialSelectChange($event)"
              placeholder="Lọc Serial"
            />
          </div>

          <div class="md:col-span-3">
            <label class="block font-semibold text-muted text-xs uppercase mb-1">
              Tình Trạng Tồn Kho
            </label>
            <app-select
              [options]="stockStatusOptions"
              [value]="stockStatusFilter()"
              (valueChange)="onStockStatusSelectChange($event)"
              placeholder="Tình trạng tồn"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block font-semibold text-muted text-xs uppercase mb-1">
              Vòng Đời
            </label>
            <app-select
              [options]="lifecycleOptions"
              [value]="lifecycleFilter()"
              (valueChange)="onLifecycleSelectChange($event)"
              placeholder="Vòng đời"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-line">
          <div>
            <label class="block font-semibold text-muted text-xs uppercase mb-1">
              Ngành Hàng
            </label>
            <app-select
              [options]="categoryOptions()"
              [value]="categoryFilter() !== null ? String(categoryFilter()) : ''"
              (valueChange)="onCategorySelectChange($event)"
              placeholder="Tất cả ngành hàng"
            />
          </div>

          <div>
            <label class="block font-semibold text-muted text-xs uppercase mb-1">
              Thương Hiệu
            </label>
            <app-select
              [options]="brandOptions()"
              [value]="brandFilter() !== null ? String(brandFilter()) : ''"
              (valueChange)="onBrandSelectChange($event)"
              placeholder="Tất cả thương hiệu"
            />
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
        @if (isLoading()) {
          <div class="p-8 text-center space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-muted">Đang tra cứu dữ liệu biến thể SKU...</p>
          </div>
        } @else if (variants().length === 0) {
          <div class="p-12 text-center space-y-3">
            <div class="w-12 h-12 mx-auto rounded-full bg-surface-alt flex items-center justify-center text-muted">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-foreground">Không tìm thấy biến thể SKU nào</h3>
            <p class="text-xs text-muted max-w-md mx-auto">
              Không có biến thể SKU nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại. Hãy thử quét mã vạch khác hoặc bấm đặt lại bộ lọc.
            </p>
            <button
              type="button"
              appButton
              variant="primary"
              size="sm"
              (click)="onResetFilters()"
            >
              Đặt Lại Bộ Lọc
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1000px] text-left text-sm">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-3 px-4 w-16 text-center">Ảnh</th>
                  <th class="py-3 px-4 cursor-pointer hover:text-foreground" (click)="toggleSort('sku')">
                    Mã SKU
                    @if (sortBy() === 'sku') {
                      <span class="text-primary font-bold">{{ sortOrder() === 'asc' ? '^' : 'v' }}</span>
                    }
                  </th>
                  <th class="py-3 px-4">Mã Vạch</th>
                  <th class="py-3 px-4">Mẫu Sản Phẩm</th>
                  <th class="py-3 px-4">Biến Thể</th>
                  <th class="py-3 px-4 text-right cursor-pointer hover:text-foreground" (click)="toggleSort('sellingPrice')">
                    Giá Niêm Yết
                    @if (sortBy() === 'sellingPrice') {
                      <span class="text-primary font-bold">{{ sortOrder() === 'asc' ? '^' : 'v' }}</span>
                    }
                  </th>
                  <th class="py-3 px-4 text-center">Serial</th>
                  <th class="py-3 px-4 cursor-pointer hover:text-foreground" (click)="toggleSort('totalAvailable')">
                    Tồn Kho Khả Dụng
                    @if (sortBy() === 'totalAvailable') {
                      <span class="text-primary font-bold">{{ sortOrder() === 'asc' ? '^' : 'v' }}</span>
                    }
                  </th>
                  <th class="py-3 px-4 text-center">Trạng Thái</th>
                  <th class="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                @for (item of variants(); track item.id) {
                  <tr
                    (click)="navigateToTemplate(item.productTemplateId)"
                    class="hover:bg-surface-alt/60 transition-colors cursor-pointer group"
                  >
                    <td class="py-3 px-4 text-center" (click)="$event.stopPropagation()">
                      <div
                        (click)="openImageModal(item)"
                        class="w-10 h-10 rounded border border-line bg-surface-alt overflow-hidden cursor-pointer hover:border-primary transition-all group-hover:scale-105 relative mx-auto flex items-center justify-center"
                        title="Bấm để xem ảnh phóng to"
                      >
                        @if (item.imageUrl) {
                          <img
                            src="/images/products/placeholder.webp"
                            [src]="item.imageUrl || '/images/products/placeholder.webp'"
                            [alt]="item.productTemplate?.name || item.sku || 'Biến thể sản phẩm'"
                            class="w-full h-full object-contain p-0.5"
                            (error)="onImageError($event)"
                          />
                        } @else {
                          <span class="text-xs font-mono text-muted uppercase">NO IMG</span>
                        }
                      </div>
                    </td>

                    <td class="py-3 px-4 font-mono font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                      {{ item.sku }}
                    </td>

                    <td class="py-3 px-4 font-mono text-muted text-xs whitespace-nowrap">
                      {{ item.barcode || 'Chưa thiết lập' }}
                    </td>

                    <td class="py-3 px-4">
                      <div class="font-semibold text-foreground">
                        {{ item.productTemplate.name }}
                      </div>
                      <div class="text-xs text-muted font-mono">
                        {{ item.productTemplate.brand.name }} | Model: {{ item.productTemplate.model }}
                      </div>
                    </td>

                    <td class="py-3 px-4 text-foreground">
                      {{ item.variationLabel || 'Biến thể mặc định' }}
                    </td>

                    <td class="py-3 px-4 text-right font-bold font-mono tabular-nums text-foreground whitespace-nowrap">
                      {{ formatPrice(item.sellingPrice) }}
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (item.serialRequired) {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/10 text-sky-700 border border-sky-500/20">
                          Bắt buộc
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-surface-alt text-muted border border-line">
                          Tùy chọn
                        </span>
                      }
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        @if (item.totalAvailable > 5) {
                          <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Khả dụng: {{ item.totalAvailable }}
                          </span>
                        } @else if (item.totalAvailable > 0) {
                          <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                            Khả dụng: {{ item.totalAvailable }}
                          </span>
                        } @else {
                          <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                            Hết hàng (0)
                          </span>
                        }
                      </div>
                      <div class="text-xs text-muted font-mono mt-0.5">
                        Thực tế: {{ item.totalOnHand }} | Giữ chỗ: {{ item.totalReserved }} | Lỗi: {{ item.totalQuarantineDamaged }}
                      </div>
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (item.lifecycleState === 'ACTIVE') {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Đang bán
                        </span>
                      } @else if (item.lifecycleState === 'DRAFT') {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-surface-alt text-muted border border-line">
                          Bản nháp
                        </span>
                      } @else if (item.lifecycleState === 'PAUSED') {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                          Tạm ngưng
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                          Ngừng KD
                        </span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="openBranchStockSheet(item)"
                          class="p-1.5 rounded bg-surface hover:bg-surface-alt text-primary border border-line transition-colors"
                          title="Xem chi tiết phân bổ tồn kho chi nhánh"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <line x1="10" y1="9" x2="8" y2="9" />
                          </svg>
                        </button>
                        <a
                          [routerLink]="['/admin/catalog/templates', item.productTemplateId]"
                          fragment="section-variants"
                          class="p-1.5 rounded bg-surface hover:bg-surface-alt text-foreground border border-line transition-colors inline-flex items-center justify-center"
                          title="Đến trang chi tiết mẫu sản phẩm"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-line flex items-center justify-between flex-wrap gap-3 text-xs text-muted">
            <div>
              Hiển thị <strong class="text-foreground tabular-nums">{{ pageStartIndex() }}</strong> -
              <strong class="text-foreground tabular-nums">{{ pageEndIndex() }}</strong> trong tổng số
              <strong class="text-primary tabular-nums">{{ total() }}</strong> biến thể SKU
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="prevPage()"
                [disabled]="page() <= 1"
                class="px-3 py-1.5 bg-surface border border-line rounded hover:border-primary disabled:opacity-40 disabled:hover:border-line text-foreground font-medium transition-colors"
              >
                Trang Trước
              </button>

              <span class="px-2 font-mono text-foreground">
                Trang {{ page() }} / {{ totalPages() }}
              </span>

              <button
                type="button"
                (click)="nextPage()"
                [disabled]="page() >= totalPages()"
                class="px-3 py-1.5 bg-surface border border-line rounded hover:border-primary disabled:opacity-40 disabled:hover:border-line text-foreground font-medium transition-colors"
              >
                Trang Kế
              </button>
            </div>
          </div>
        }
      </div>

      @if (isStockSheetOpen() && selectedVariantForStock(); as variant) {
        <div class="fixed inset-0 z-50 flex justify-end animate-fade-in">
          <div
            (click)="closeBranchStockSheet()"
            class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          ></div>
          <div class="relative bg-surface border-l border-line shadow-2xl w-full max-w-lg h-full flex flex-col z-10 text-sm">
            <div class="h-16 px-6 border-b border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
              <div>
                <h3 class="font-bold text-foreground text-base">Phân Bổ Tồn Kho Theo Chi Nhánh</h3>
                <p class="text-xs text-muted font-mono">
                  SKU: <strong class="text-primary">{{ variant.sku }}</strong>
                  @if (variant.barcode) {
                    | Barcode: {{ variant.barcode }}
                  }
                </p>
              </div>
              <button
                type="button"
                (click)="closeBranchStockSheet()"
                class="p-1.5 rounded hover:bg-surface text-muted hover:text-foreground transition-colors"
                title="Đóng"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-3.5 bg-blue-500/10 border-b border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs">
              Tồn khả dụng = Thực tế - Đang giữ chỗ - Cách ly lỗi. Hàng giữ chỗ liên kết trực tiếp với các đơn hàng đang xử lý.
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              @if (variant.stockQuants.length === 0) {
                <div class="p-8 text-center text-muted text-xs">
                  Chưa có bản ghi phân bổ tồn kho nào cho biến thể này tại các chi nhánh.
                </div>
              } @else {
                @for (quant of variant.stockQuants; track quant.id) {
                  <div class="bg-surface-alt border border-line rounded-lg p-4 space-y-3">
                    <div class="flex items-center justify-between border-b border-line pb-2">
                      <div>
                        <span class="font-bold text-foreground text-sm">
                          {{ quant.branchName }} ({{ quant.branchCode }})
                        </span>
                        <p class="text-xs text-muted mt-0.5">{{ quant.branchAddress }}</p>
                      </div>
                      @if (quant.available > 0) {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Khả dụng: {{ quant.available }}
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                          Hết hàng
                        </span>
                      }
                    </div>

                    <div class="grid grid-cols-3 gap-2 text-center text-xs">
                      <div class="p-2 bg-surface border border-line rounded">
                        <span class="text-xs text-muted block uppercase">Thực Tế</span>
                        <strong class="text-foreground text-sm font-bold">{{ quant.onHand }}</strong>
                      </div>
                      <div class="p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                        <span class="text-xs text-amber-700 block uppercase">Giữ Chỗ</span>
                        <strong class="text-amber-700 text-sm font-bold">{{ quant.reserved }}</strong>
                      </div>
                      <div class="p-2 bg-destructive/10 border border-destructive/20 rounded">
                        <span class="text-xs text-destructive block uppercase">Lỗi / Hỏng</span>
                        <strong class="text-destructive text-sm font-bold">{{ quant.quarantineDamaged }}</strong>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>

            <div class="h-16 px-6 border-t border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
              <span class="text-xs text-muted">
                Tổng khả dụng: <strong class="text-primary">{{ variant.totalAvailable }}</strong> chiếc
              </span>
              <button
                type="button"
                appButton
                variant="outline"
                size="sm"
                (click)="closeBranchStockSheet()"
              >
                Đóng Bảng
              </button>
            </div>
          </div>
        </div>
      }

      @if (imagePreviewItem(); as preview) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div class="relative bg-surface border border-line rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
            <div class="p-4 border-b border-line flex items-center justify-between">
              <div>
                <h4 class="font-bold text-foreground text-sm">{{ preview.sku }}</h4>
                <p class="text-xs text-muted">{{ preview.variationLabel || preview.productTemplate.name }}</p>
              </div>
              <button
                type="button"
                (click)="closeImageModal()"
                class="p-1 rounded text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
                title="Đóng"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-6 bg-surface-alt flex items-center justify-center min-h-[260px]">
              @if (preview.imageUrl) {
                <img
                  src="/images/products/placeholder.webp"
                  [src]="preview.imageUrl || '/images/products/placeholder.webp'"
                  [alt]="preview.productTemplate?.name || preview.sku || 'Xem trước biến thể'"
                  class="max-h-72 max-w-full object-contain"
                  (error)="onImageError($event)"
                />
              } @else {
                <span class="text-muted text-xs">Không có hình ảnh</span>
              }
            </div>
          </div>
        </div>
      }

      @if (toasts().length > 0) {
        <div class="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
          @for (toast of toasts(); track toast.id) {
            <div
              [class.bg-emerald-50]="toast.type === 'success'"
              [class.border-emerald-200]="toast.type === 'success'"
              [class.text-emerald-800]="toast.type === 'success'"
              [class.bg-rose-50]="toast.type === 'error'"
              [class.border-rose-200]="toast.type === 'error'"
              [class.text-rose-800]="toast.type === 'error'"
              [class.bg-surface]="toast.type === 'info'"
              [class.border-line]="toast.type === 'info'"
              [class.text-foreground]="toast.type === 'info'"
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
export class AdminVariantsPageComponent implements OnInit, AfterViewInit {
  protected readonly String = String;
  protected readonly onImageError = handleProductImageError;
  @ViewChild('barcodeInput') barcodeInputRef?: ElementRef<HTMLInputElement>;

  private readonly variantService = inject(AdminVariantService);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly brandService = inject(AdminBrandService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly variants = this.variantService.variants;
  readonly isLoading = this.variantService.isLoading;
  readonly total = this.variantService.total;
  readonly page = this.variantService.page;
  readonly limit = this.variantService.limit;

  readonly searchQuery = this.variantService.searchQuery;
  readonly serialFilter = this.variantService.serialFilter;
  readonly stockStatusFilter = this.variantService.stockStatusFilter;
  readonly lifecycleFilter = this.variantService.lifecycleFilter;
  readonly categoryFilter = this.variantService.categoryFilter;
  readonly brandFilter = this.variantService.brandFilter;
  readonly sortBy = this.variantService.sortBy;
  readonly sortOrder = this.variantService.sortOrder;

  readonly categoryList = this.categoryService.categories;
  readonly brandList = this.brandService.brands;

  readonly isStockSheetOpen = signal<boolean>(false);
  readonly selectedVariantForStock = signal<AdminVariantCatalogItem | null>(null);

  readonly imagePreviewItem = signal<AdminVariantCatalogItem | null>(null);

  readonly toasts = signal<ToastNotification[]>([]);
  private toastCounter = 0;

  readonly serialOptions: SelectOption[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'true', label: 'Bắt buộc Serial' },
    { value: 'false', label: 'Không bắt buộc' },
  ];

  readonly stockStatusOptions: SelectOption[] = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'in-stock', label: 'Còn hàng (> 5 chiếc)' },
    { value: 'low-stock', label: 'Sắp hết hàng (1 - 5 chiếc)' },
    { value: 'out-of-stock', label: 'Hết hàng (0 chiếc)' },
    { value: 'reserved', label: 'Có hàng đang giữ chỗ' },
  ];

  readonly lifecycleOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'ACTIVE', label: 'Đang bán (ACTIVE)' },
    { value: 'DRAFT', label: 'Bản nháp (DRAFT)' },
    { value: 'PAUSED', label: 'Tạm ngưng (PAUSED)' },
    { value: 'DISCONTINUED', label: 'Ngừng KD (DISCONTINUED)' },
  ];

  readonly categoryOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả ngành hàng' },
    ...this.categoryList().map((c) => ({ value: String(c.id), label: c.name })),
  ]);

  readonly brandOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả thương hiệu' },
    ...this.brandList().map((b) => ({ value: String(b.id), label: b.name })),
  ]);

  readonly totalPages = computed(() => {
    const l = this.limit();
    const t = this.total();
    return l > 0 ? Math.ceil(t / l) : 1;
  });

  readonly serialFilterString = computed(() => {
    const val = this.serialFilter();
    if (val === true) return 'true';
    if (val === false) return 'false';
    return 'all';
  });

  readonly pageStartIndex = computed(() => {
    if (this.total() === 0) return 0;
    return (this.page() - 1) * this.limit() + 1;
  });

  readonly pageEndIndex = computed(() => {
    const end = this.page() * this.limit();
    return Math.min(end, this.total());
  });

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if (event.key === '/' && (event.target as HTMLElement)?.tagName !== 'INPUT') {
      event.preventDefault();
      this.focusBarcodeInput();
    }
  }

  async ngOnInit(): Promise<void> {
    const productTemplateIdParam =
      this.route.snapshot.queryParams['productTemplateId'] ||
      this.route.snapshot.queryParams['templateId'];
    const searchParam = this.route.snapshot.queryParams['search'];

    let initialTemplateId: number | undefined;
    if (productTemplateIdParam) {
      const parsedId = Number(productTemplateIdParam);
      if (!Number.isNaN(parsedId) && parsedId > 0) {
        initialTemplateId = parsedId;
      }
    }

    if (searchParam) {
      this.variantService.searchQuery.set(searchParam);
    }

    await Promise.all([
      this.variantService.loadVariants(
        initialTemplateId ? { productTemplateId: initialTemplateId } : undefined,
      ),
      this.categoryService.loadCategories({ tree: false }),
      this.brandService.loadBrands(),
    ]);
  }

  ngAfterViewInit(): void {
    this.focusBarcodeInput();
  }

  focusBarcodeInput(): void {
    if (this.barcodeInputRef?.nativeElement) {
      this.barcodeInputRef.nativeElement.focus();
      this.barcodeInputRef.nativeElement.select();
    }
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.variantService.searchQuery.set(val);
  }

  async onSearchSubmit(): Promise<void> {
    this.variantService.page.set(1);
    try {
      await this.variantService.loadVariants();
      const count = this.variants().length;
      if (count === 1) {
        this.showToast(`Tìm thấy 1 kết quả: ${this.variants()[0].sku}`, 'success');
      } else if (count > 1) {
        this.showToast(`Tìm thấy ${count} biến thể phù hợp`, 'info');
      } else {
        this.showToast('Không tìm thấy biến thể nào với mã quét này', 'error');
      }
    } catch {
      this.showToast('Lỗi khi tra cứu biến thể', 'error');
    }
  }

  onSerialSelectChange(val: string | number): void {
    if (val === 'true') {
      this.variantService.serialFilter.set(true);
    } else if (val === 'false') {
      this.variantService.serialFilter.set(false);
    } else {
      this.variantService.serialFilter.set(null);
    }
    this.variantService.page.set(1);
    void this.variantService.loadVariants();
  }

  onStockStatusSelectChange(val: string | number): void {
    this.variantService.stockStatusFilter.set(String(val));
    this.variantService.page.set(1);
    void this.variantService.loadVariants();
  }

  onLifecycleSelectChange(val: string | number): void {
    this.variantService.lifecycleFilter.set(String(val));
    this.variantService.page.set(1);
    void this.variantService.loadVariants();
  }

  onCategorySelectChange(val: string | number): void {
    this.variantService.categoryFilter.set(val ? Number(val) : null);
    this.variantService.page.set(1);
    void this.variantService.loadVariants();
  }

  onBrandSelectChange(val: string | number): void {
    this.variantService.brandFilter.set(val ? Number(val) : null);
    this.variantService.page.set(1);
    void this.variantService.loadVariants();
  }

  toggleSort(column: string): void {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('desc');
    }
    this.variantService.page.set(1);
    void this.variantService.loadVariants();
  }

  onResetFilters(): void {
    this.variantService.resetFilters();
    void this.variantService.loadVariants();
    this.focusBarcodeInput();
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.variantService.page.set(this.page() - 1);
      void this.variantService.loadVariants();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.variantService.page.set(this.page() + 1);
      void this.variantService.loadVariants();
    }
  }

  openBranchStockSheet(item: AdminVariantCatalogItem): void {
    this.selectedVariantForStock.set(item);
    this.isStockSheetOpen.set(true);
  }

  closeBranchStockSheet(): void {
    this.isStockSheetOpen.set(false);
    this.selectedVariantForStock.set(null);
  }

  openImageModal(item: AdminVariantCatalogItem): void {
    this.imagePreviewItem.set(item);
  }

  closeImageModal(): void {
    this.imagePreviewItem.set(null);
  }

  navigateToTemplate(templateId: number): void {
    void this.router.navigate(['/admin/catalog/templates', templateId], {
      fragment: 'section-variants',
    });
  }

  formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? Number(price) : price;
    if (isNaN(num)) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  }

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    const id = ++this.toastCounter;
    this.toasts.update((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
