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
import { Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <!-- Tieu de trang va thong so tong quan -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-07
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Danh Mục Biến Thể SKU Toàn Hệ Thống
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Tra cứu nhanh theo mã vạch barcode, mã SKU hoặc nhãn biến thể phục vụ kho vận và bán hàng
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-3 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-xs flex items-center gap-2">
            <span class="text-slate-400">Tổng số:</span>
            <strong class="text-[#76b900] font-bold tabular-nums">{{ total() }}</strong>
            <span class="text-slate-400">SKU</span>
          </div>

          <button
            type="button"
            (click)="focusBarcodeInput()"
            class="px-3.5 py-1.5 bg-[#272f3d] hover:bg-[#343e50] text-white font-medium text-xs rounded transition-colors inline-flex items-center gap-1.5"
            title="Lấy nét ô quét mã vạch (Phím tắt: /)"
          >
            <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Quét Mã ( / )</span>
          </button>
        </div>
      </div>

      <!-- Khu vuc tim kiem va bo loc -->
      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 shadow-sm space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#272f3d] gap-4 flex-wrap">
          <div class="flex items-center gap-2 text-xs">
            <span class="w-2 h-2 rounded-full bg-[#76b900]"></span>
            <span class="font-bold text-white uppercase tracking-wide">Bộ Lọc Tra Cứu</span>
            <span class="text-slate-400">
              | Đang hiển thị <strong class="text-[#76b900] tabular-nums">{{ variants().length }}</strong> / {{ total() }} SKU
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="onResetFilters()"
              class="px-3 py-1 text-xs font-semibold bg-[#272f3d] hover:bg-[#343e50] text-slate-200 rounded transition-colors"
            >
              Đặt Lại
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <!-- O nhap tim kiem / Quet barcode -->
          <div class="md:col-span-5">
            <label for="barcode-search-input" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
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
                  class="w-full px-3.5 py-2 pl-9 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white font-mono placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:border-[#76b900] transition-colors"
                  autocomplete="off"
                />
                <svg
                  class="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
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
                (click)="onSearchSubmit()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors whitespace-nowrap uppercase tracking-wider"
              >
                Tìm Kiếm
              </button>
            </div>
          </div>

          <!-- Loc theo Serial -->
          <div class="md:col-span-2">
            <label for="serial-filter-select" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Lọc Theo Serial
            </label>
            <select
              id="serial-filter-select"
              [value]="serialFilterString()"
              (change)="onSerialFilterChange($event)"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white focus:outline-none focus:border-[#76b900]"
            >
              <option value="all">Tất cả</option>
              <option value="true">Bắt buộc Serial</option>
              <option value="false">Không bắt buộc</option>
            </select>
          </div>

          <!-- Loc theo tinh trang ton kho -->
          <div class="md:col-span-3">
            <label for="stock-status-select" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Tình Trạng Tồn Kho
            </label>
            <select
              id="stock-status-select"
              [value]="stockStatusFilter()"
              (change)="onStockStatusChange($event)"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white focus:outline-none focus:border-[#76b900]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="in-stock">Còn hàng (khả dụng > 5 chiếc)</option>
              <option value="low-stock">Sắp hết hàng (1 - 5 chiếc)</option>
              <option value="out-of-stock">Hết hàng (0 chiếc)</option>
              <option value="reserved">Có hàng đang giữ chỗ</option>
            </select>
          </div>

          <!-- Loc theo trang thai vong doi -->
          <div class="md:col-span-2">
            <label for="lifecycle-filter-select" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Vòng Đời
            </label>
            <select
              id="lifecycle-filter-select"
              [value]="lifecycleFilter()"
              (change)="onLifecycleChange($event)"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white focus:outline-none focus:border-[#76b900]"
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Đang bán (ACTIVE)</option>
              <option value="DRAFT">Bản nháp (DRAFT)</option>
              <option value="PAUSED">Tạm ngưng (PAUSED)</option>
              <option value="DISCONTINUED">Ngừng KD (DISCONTINUED)</option>
            </select>
          </div>
        </div>

        <!-- Bo loc nang cao theo nganh hang va thuong hieu -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#272f3d]/50">
          <div>
            <label for="category-filter-select" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Ngành Hàng
            </label>
            <select
              id="category-filter-select"
              [value]="categoryFilter() ?? ''"
              (change)="onCategoryChange($event)"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white focus:outline-none focus:border-[#76b900]"
            >
              <option value="">Tất cả ngành hàng</option>
              @for (category of categoryList(); track category.id) {
                <option [value]="category.id">{{ category.name }}</option>
              }
            </select>
          </div>

          <div>
            <label for="brand-filter-select" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Thương Hiệu
            </label>
            <select
              id="brand-filter-select"
              [value]="brandFilter() ?? ''"
              (change)="onBrandChange($event)"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white focus:outline-none focus:border-[#76b900]"
            >
              <option value="">Tất cả thương hiệu</option>
              @for (brand of brandList(); track brand.id) {
                <option [value]="brand.id">{{ brand.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Bang danh sach bien the SKU -->
      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        @if (isLoading()) {
          <div class="p-8 text-center space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-slate-400">Đang tra cứu dữ liệu biến thể SKU...</p>
          </div>
        } @else if (variants().length === 0) {
          <div class="p-12 text-center space-y-3">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#272f3d]/50 flex items-center justify-center text-slate-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-white">Không tìm thấy biến thể SKU nào</h3>
            <p class="text-xs text-slate-400 max-w-md mx-auto">
              Không có biến thể SKU nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại. Hãy thử quét mã vạch khác hoặc bấm đặt lại bộ lọc.
            </p>
            <button
              type="button"
              (click)="onResetFilters()"
              class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors inline-block"
            >
              Đặt Lại Bộ Lọc
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-3 px-4 w-16 text-center">Ảnh</th>
                  <th class="py-3 px-4 cursor-pointer hover:text-white" (click)="toggleSort('sku')">
                    Mã SKU
                    @if (sortBy() === 'sku') {
                      <span class="text-[#76b900] font-bold">{{ sortOrder() === 'asc' ? '^' : 'v' }}</span>
                    }
                  </th>
                  <th class="py-3 px-4">Mã Vạch</th>
                  <th class="py-3 px-4">Mẫu Sản Phẩm</th>
                  <th class="py-3 px-4">Biến Thể</th>
                  <th class="py-3 px-4 text-right cursor-pointer hover:text-white" (click)="toggleSort('sellingPrice')">
                    Giá Niêm Yết
                    @if (sortBy() === 'sellingPrice') {
                      <span class="text-[#76b900] font-bold">{{ sortOrder() === 'asc' ? '^' : 'v' }}</span>
                    }
                  </th>
                  <th class="py-3 px-4 text-center">Serial</th>
                  <th class="py-3 px-4 cursor-pointer hover:text-white" (click)="toggleSort('totalAvailable')">
                    Tồn Kho Khả Dụng
                    @if (sortBy() === 'totalAvailable') {
                      <span class="text-[#76b900] font-bold">{{ sortOrder() === 'asc' ? '^' : 'v' }}</span>
                    }
                  </th>
                  <th class="py-3 px-4 text-center">Trạng Thái</th>
                  <th class="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d]">
                @for (item of variants(); track item.id) {
                  <tr
                    (click)="navigateToTemplate(item.productTemplateId)"
                    class="hover:bg-[#1f2636] transition-colors cursor-pointer group"
                  >
                    <!-- Hinh anh -->
                    <td class="py-3 px-4 text-center" (click)="$event.stopPropagation()">
                      <div
                        (click)="openImageModal(item)"
                        class="w-10 h-10 rounded border border-[#272f3d] bg-[#090d16] overflow-hidden cursor-pointer hover:border-[#76b900] transition-all group-hover:scale-105 relative mx-auto flex items-center justify-center"
                        title="Bấm để xem ảnh phóng to"
                      >
                        @if (item.imageUrl) {
                          <img [src]="item.imageUrl" [alt]="item.sku" class="w-full h-full object-contain p-0.5" />
                        } @else {
                          <span class="text-[9px] font-mono text-slate-500 uppercase">NO IMG</span>
                        }
                      </div>
                    </td>

                    <!-- Ma SKU -->
                    <td class="py-3 px-4 font-mono font-bold text-white group-hover:text-[#76b900] transition-colors">
                      {{ item.sku }}
                    </td>

                    <!-- Ma vach barcode -->
                    <td class="py-3 px-4 font-mono text-slate-400 text-xs">
                      {{ item.barcode || 'Chưa thiết lập' }}
                    </td>

                    <!-- Mau san pham cha -->
                    <td class="py-3 px-4">
                      <div class="font-semibold text-white">
                        {{ item.productTemplate.name }}
                      </div>
                      <div class="text-xs text-slate-400 font-mono">
                        {{ item.productTemplate.brand.name }} | Model: {{ item.productTemplate.model }}
                      </div>
                    </td>

                    <!-- Nhan bien the -->
                    <td class="py-3 px-4 text-slate-300">
                      {{ item.variationLabel || 'Biến thể mặc định' }}
                    </td>

                    <!-- Gia niem yet -->
                    <td class="py-3 px-4 text-right font-bold tabular-nums text-white">
                      {{ formatPrice(item.sellingPrice) }}
                    </td>

                    <!-- Cờ bắt buộc Serial -->
                    <td class="py-3 px-4 text-center">
                      @if (item.serialRequired) {
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                          Bắt buộc
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#272f3d] text-slate-400 border border-[#343e50]">
                          Tùy chọn
                        </span>
                      }
                    </td>

                    <!-- Ton kho tong hop -->
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-1.5">
                        @if (item.totalAvailable > 5) {
                          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Khả dụng: {{ item.totalAvailable }}
                          </span>
                        } @else if (item.totalAvailable > 0) {
                          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Khả dụng: {{ item.totalAvailable }}
                          </span>
                        } @else {
                          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            Hết hàng (0)
                          </span>
                        }
                      </div>
                      <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                        Thực tế: {{ item.totalOnHand }} | Giữ chỗ: {{ item.totalReserved }} | Lỗi: {{ item.totalQuarantineDamaged }}
                      </div>
                    </td>

                    <!-- Trang thai vong doi -->
                    <td class="py-3 px-4 text-center">
                      @if (item.lifecycleState === 'ACTIVE') {
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Đang bán
                        </span>
                      } @else if (item.lifecycleState === 'DRAFT') {
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#272f3d] text-slate-300 border border-[#343e50]">
                          Bản nháp
                        </span>
                      } @else if (item.lifecycleState === 'PAUSED') {
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                          Tạm ngưng
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                          Ngừng KD
                        </span>
                      }
                    </td>

                    <!-- Thao tac -->
                    <td class="py-3 px-4 text-right" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="openBranchStockSheet(item)"
                          class="p-1.5 rounded bg-[#272f3d] hover:bg-[#343e50] text-[#76b900] border border-[#343e50] transition-colors"
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
                          class="p-1.5 rounded bg-[#272f3d] hover:bg-[#343e50] text-slate-200 border border-[#343e50] transition-colors inline-flex items-center justify-center"
                          title="Đến trang chi tiết mẫu sản phẩm (SCR-06)"
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

          <!-- Phan trang -->
          <div class="p-4 border-t border-[#272f3d] flex items-center justify-between flex-wrap gap-3 text-xs text-slate-400">
            <div>
              Hiển thị <strong class="text-white tabular-nums">{{ pageStartIndex() }}</strong> -
              <strong class="text-white tabular-nums">{{ pageEndIndex() }}</strong> trong tổng số
              <strong class="text-[#76b900] tabular-nums">{{ total() }}</strong> biến thể SKU
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="prevPage()"
                [disabled]="page() <= 1"
                class="px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded hover:border-[#76b900] disabled:opacity-40 disabled:hover:border-[#272f3d] text-white font-medium transition-colors"
              >
                Trang Trước
              </button>

              <span class="px-2 font-mono text-white">
                Trang {{ page() }} / {{ totalPages() }}
              </span>

              <button
                type="button"
                (click)="nextPage()"
                [disabled]="page() >= totalPages()"
                class="px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded hover:border-[#76b900] disabled:opacity-40 disabled:hover:border-[#272f3d] text-white font-medium transition-colors"
              >
                Trang Kế
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Side Sheet: Chi tiet phan bo ton kho theo chi nhanh -->
      @if (isStockSheetOpen() && selectedVariantForStock(); as variant) {
        <div class="fixed inset-0 z-50 flex justify-end animate-fade-in">
          <div
            (click)="closeBranchStockSheet()"
            class="fixed inset-0 bg-[#090d16]/75 backdrop-blur-sm transition-opacity"
          ></div>
          <div class="relative bg-[#161b26] border-l border-[#272f3d] shadow-2xl w-full max-w-lg h-full flex flex-col z-10 text-sm">
            <!-- Sheet Header -->
            <div class="h-16 px-6 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
              <div>
                <h3 class="font-bold text-white text-base">Phân Bổ Tồn Kho Theo Chi Nhánh</h3>
                <p class="text-xs text-slate-400 font-mono">
                  SKU: <strong class="text-[#76b900]">{{ variant.sku }}</strong>
                  @if (variant.barcode) {
                    | Barcode: {{ variant.barcode }}
                  }
                </p>
              </div>
              <button
                type="button"
                (click)="closeBranchStockSheet()"
                class="p-1.5 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
                title="Đóng"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Cong thuc tinh toan ton kho -->
            <div class="p-3.5 bg-blue-950/40 border-b border-blue-900/50 text-blue-200 text-xs">
              Tồn khả dụng = Thực tế - Đang giữ chỗ - Cách ly lỗi. Hàng giữ chỗ liên kết trực tiếp với các đơn hàng đang xử lý.
            </div>

            <!-- Danh sach chi nhanh -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              @if (variant.stockQuants.length === 0) {
                <div class="p-8 text-center text-slate-400 text-xs">
                  Chưa có bản ghi phân bổ tồn kho nào cho biến thể này tại các chi nhánh.
                </div>
              } @else {
                @for (quant of variant.stockQuants; track quant.id) {
                  <div class="bg-[#090d16] border border-[#272f3d] rounded-lg p-4 space-y-3">
                    <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
                      <div>
                        <span class="font-bold text-white text-sm">
                          {{ quant.branchName }} ({{ quant.branchCode }})
                        </span>
                        <p class="text-xs text-slate-400 mt-0.5">{{ quant.branchAddress }}</p>
                      </div>
                      @if (quant.available > 0) {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Khả dụng: {{ quant.available }}
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          Hết hàng
                        </span>
                      }
                    </div>

                    <div class="grid grid-cols-3 gap-2 text-center text-xs">
                      <div class="p-2 bg-[#161b26] border border-[#272f3d] rounded">
                        <span class="text-[11px] text-slate-400 block uppercase">Thực Tế</span>
                        <strong class="text-white text-sm font-bold">{{ quant.onHand }}</strong>
                      </div>
                      <div class="p-2 bg-amber-950/30 border border-amber-900/50 rounded">
                        <span class="text-[11px] text-amber-400 block uppercase">Giữ Chỗ</span>
                        <strong class="text-amber-300 text-sm font-bold">{{ quant.reserved }}</strong>
                      </div>
                      <div class="p-2 bg-rose-950/30 border border-rose-900/50 rounded">
                        <span class="text-[11px] text-rose-400 block uppercase">Lỗi / Hỏng</span>
                        <strong class="text-rose-300 text-sm font-bold">{{ quant.quarantineDamaged }}</strong>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Sheet Footer -->
            <div class="h-16 px-6 border-t border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
              <span class="text-xs text-slate-400">
                Tổng khả dụng: <strong class="text-[#76b900]">{{ variant.totalAvailable }}</strong> chiếc
              </span>
              <button
                type="button"
                (click)="closeBranchStockSheet()"
                class="px-4 py-2 bg-[#272f3d] hover:bg-[#343e50] text-white font-bold rounded text-xs transition-colors"
              >
                Đóng Bảng
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Phong To Hinh Anh -->
      @if (imagePreviewItem(); as preview) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/80 backdrop-blur-sm animate-fade-in">
          <div class="relative bg-[#161b26] border border-[#272f3d] rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
            <div class="p-4 border-b border-[#272f3d] flex items-center justify-between">
              <div>
                <h4 class="font-bold text-white text-sm">{{ preview.sku }}</h4>
                <p class="text-xs text-slate-400">{{ preview.variationLabel || preview.productTemplate.name }}</p>
              </div>
              <button
                type="button"
                (click)="closeImageModal()"
                class="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f3d] transition-colors"
                title="Đóng"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-6 bg-[#090d16] flex items-center justify-center min-h-[260px]">
              @if (preview.imageUrl) {
                <img [src]="preview.imageUrl" [alt]="preview.sku" class="max-h-72 max-w-full object-contain" />
              } @else {
                <span class="text-slate-500 text-xs">Không có hình ảnh</span>
              }
            </div>
          </div>
        </div>
      }

      <!-- Toast thong bao -->
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
export class AdminVariantsPageComponent implements OnInit, AfterViewInit {
  @ViewChild('barcodeInput') barcodeInputRef?: ElementRef<HTMLInputElement>;

  private readonly variantService = inject(AdminVariantService);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly brandService = inject(AdminBrandService);
  private readonly router = inject(Router);

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
    await Promise.all([
      this.variantService.loadVariants(),
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

  onSerialFilterChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
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

  onStockStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.variantService.stockStatusFilter.set(val);
    this.variantService.page.set(1);
    void this.variantService.loadVariants();
  }

  onLifecycleChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.variantService.lifecycleFilter.set(val);
    this.variantService.page.set(1);
    void this.variantService.loadVariants();
  }

  onCategoryChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.variantService.categoryFilter.set(val ? Number(val) : null);
    this.variantService.page.set(1);
    void this.variantService.loadVariants();
  }

  onBrandChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
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
    if (isNaN(num)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
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
