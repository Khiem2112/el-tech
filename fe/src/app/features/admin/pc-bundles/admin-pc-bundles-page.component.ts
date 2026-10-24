import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterModule, PcBundleSheetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <!-- Topbar Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-08
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Bộ Máy Tính Dựng Sẵn (Virtual BOM)
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Quản lý danh mục cấu hình máy tính lắp sẵn theo định mức linh kiện ảo và tính tồn khả dụng
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- View Switcher (List vs Cards) -->
          <div class="flex items-center bg-[#090d16] border border-[#272f3d] rounded p-0.5 text-xs">
            <button
              type="button"
              (click)="currentView.set('list')"
              [class.bg-[#76b900]]="currentView() === 'list'"
              [class.text-[#090d16]]="currentView() === 'list'"
              [class.font-bold]="currentView() === 'list'"
              [class.text-slate-400]="currentView() !== 'list'"
              class="px-2.5 py-1 rounded transition-all"
              title="Chế độ xem bảng chi tiết"
            >
              Bảng
            </button>
            <button
              type="button"
              (click)="currentView.set('cards')"
              [class.bg-[#76b900]]="currentView() === 'cards'"
              [class.text-[#090d16]]="currentView() === 'cards'"
              [class.font-bold]="currentView() === 'cards'"
              [class.text-slate-400]="currentView() !== 'cards'"
              class="px-2.5 py-1 rounded transition-all"
              title="Chế độ xem thẻ trực quan"
            >
              Thẻ
            </button>
          </div>

          <button
            type="button"
            (click)="openCreateSheet()"
            class="px-3.5 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Bộ Máy</span>
          </button>
        </div>
      </div>

      <!-- Thong bao huong dan quy tac nghiep vu -->
      <div class="p-3.5 bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-[#76b900] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Bộ máy tính dựng sẵn tính theo định mức linh kiện (BOM). Hệ thống tự động kiểm tra tồn kho khả dụng của từng linh kiện thành phần tại chi nhánh phụ trách theo nguyên lý thắt cổ chai (PCB-001, INV-015).
          </span>
        </div>
        <span class="text-white font-bold tabular-nums">Tổng số: {{ bundleService.total() }} cấu hình</span>
      </div>

      <!-- Khu vuc tim kiem va bo loc -->
      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 shadow-sm space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#272f3d] gap-4 flex-wrap">
          <div class="flex items-center gap-2 text-xs">
            <span class="w-2 h-2 rounded-full bg-[#76b900]"></span>
            <span class="font-bold text-white uppercase tracking-wide">Bộ Lọc Danh Mục Cấu Hình</span>
            <span class="text-slate-400">
              | Đang hiển thị <strong class="text-[#76b900] tabular-nums">{{ bundleService.bundles().length }}</strong> / {{ bundleService.total() }} bộ
            </span>
          </div>

          <button
            type="button"
            (click)="onResetFilters()"
            class="px-3 py-1 text-xs font-semibold bg-[#272f3d] hover:bg-[#343e50] text-slate-200 rounded transition-colors"
          >
            Đặt Lại
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <!-- Tim kiem theo tu khoa -->
          <div class="md:col-span-5">
            <label for="bundle-search-query" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
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
                class="flex-1 px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
              />
              <button
                type="button"
                (click)="applyFilters()"
                class="px-3 py-1.5 bg-[#272f3d] hover:bg-[#343e50] text-white font-semibold text-xs rounded transition-colors"
              >
                Tìm
              </button>
            </div>
          </div>

          <!-- Loc theo trang thai vong doi -->
          <div class="md:col-span-3">
            <label for="bundle-status-filter" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Trạng Thái Vòng Đời
            </label>
            <select
              id="bundle-status-filter"
              [ngModel]="lifecycleFilter()"
              (ngModelChange)="onLifecycleFilterChange($event)"
              class="w-full px-2.5 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang bán (ACTIVE)</option>
              <option value="DRAFT">Bản nháp (DRAFT)</option>
              <option value="PAUSED">Tạm dừng (PAUSED)</option>
              <option value="DISCONTINUED">Ngừng kinh doanh (DISCONTINUED)</option>
            </select>
          </div>

          <!-- Loc theo chi nhanh kiem tra ton kho -->
          <div class="md:col-span-4">
            <label for="bundle-branch-filter" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Chi Nhánh Tra Cứu Tồn Kho
            </label>
            <select
              id="bundle-branch-filter"
              [ngModel]="selectedBranchId()"
              (ngModelChange)="onBranchFilterChange($event)"
              class="w-full px-2.5 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
            >
              <option [ngValue]="null">Toàn bộ chi nhánh</option>
              @for (branch of branchService.branches(); track branch.id) {
                <option [ngValue]="branch.id">{{ branch.name }} ({{ branch.code }})</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (bundleService.isLoading()) {
        <div class="p-12 text-center bg-[#161b26] border border-[#272f3d] rounded-lg space-y-3">
          <div class="inline-block w-8 h-8 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs text-slate-400">Đang nạp danh sách cấu hình Virtual BOM...</p>
        </div>
      } @else if (bundleService.error()) {
        <div class="p-6 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center justify-between">
          <span>{{ bundleService.error() }}</span>
          <button
            type="button"
            (click)="loadBundles()"
            class="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold rounded text-xs transition-colors"
          >
            Thử lại
          </button>
        </div>
      } @else if (bundleService.bundles().length === 0) {
        <div class="p-12 text-center bg-[#161b26] border border-[#272f3d] rounded-lg space-y-3">
          <svg class="w-10 h-10 text-slate-500 mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div class="text-sm font-bold text-white">Chưa có bộ máy tính dựng sẵn nào</div>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            Không tìm thấy cấu hình PC nào khớp với bộ lọc. Hãy điều chỉnh điều kiện tìm kiếm hoặc bấm nút "Thêm Bộ Máy" để tạo cấu hình mới.
          </p>
          <button
            type="button"
            (click)="openCreateSheet()"
            class="px-3.5 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            + Thêm Bộ Máy
          </button>
        </div>
      } @else {
        <!-- VIEW 1: Bang Danh Sach Bo PC (Table View) -->
        @if (currentView() === 'list') {
          <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-xs">
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
                <tbody class="divide-y divide-[#272f3d]">
                  @for (bundle of bundleService.bundles(); track bundle.id) {
                    <tr class="hover:bg-[#090d16]/50 transition-colors">
                      <!-- Anh dai dien -->
                      <td class="py-3 px-4 text-center">
                        <div class="w-10 h-10 rounded border border-[#272f3d] bg-[#090d16] flex items-center justify-center overflow-hidden mx-auto">
                          @if (bundle.primaryImage) {
                            <img [src]="bundle.primaryImage" [alt]="bundle.name" class="w-full h-full object-contain p-0.5" />
                          } @else {
                            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                              <line x1="8" y1="21" x2="16" y2="21"/>
                              <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                          }
                        </div>
                      </td>

                      <!-- Ten va mo ta -->
                      <td class="py-3 px-4">
                        <div class="font-bold text-white text-sm">{{ bundle.name }}</div>
                        @if (bundle.description) {
                          <div class="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{{ bundle.description }}</div>
                        }
                      </td>

                      <!-- Slug -->
                      <td class="py-3 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">
                        {{ bundle.slug }}
                      </td>

                      <!-- So luong linh kien BOM -->
                      <td class="py-3 px-4 text-center tabular-nums font-semibold whitespace-nowrap text-white">
                        {{ bundle.totalItemsCount }} món
                      </td>

                      <!-- Ton kha dung & linh kien that co chai -->
                      <td class="py-3 px-4">
                        <div class="space-y-0.5">
                          @for (branch of getDisplayBranches(bundle); track branch.branchId) {
                            <div class="flex items-center gap-1.5 text-[11px]">
                              <span class="text-slate-400 font-medium">{{ branch.branchCode }}:</span>
                              <strong
                                [class.text-[#76b900]]="branch.buildableCount > 0"
                                [class.text-rose-400]="branch.buildableCount === 0"
                                class="tabular-nums font-bold"
                              >
                                {{ branch.buildableCount }} bộ
                              </strong>
                              @if (branch.bottleneckSku) {
                                <span class="text-slate-500 text-[10px] truncate max-w-[120px]" title="Giới hạn bởi: {{ branch.bottleneckSku }}">
                                  (hạn chế: {{ branch.bottleneckSku }})
                                </span>
                              }
                            </div>
                          }
                        </div>
                      </td>

                      <!-- Gia goc -->
                      <td class="py-3 px-4 text-right tabular-nums text-slate-400 whitespace-nowrap">
                        {{ formatCurrency(bundle.grossTotal) }}
                      </td>

                      <!-- Giam gia -->
                      <td class="py-3 px-4 text-right tabular-nums font-semibold whitespace-nowrap text-rose-400">
                        {{ bundle.discountAmount > 0 ? ('- ' + formatCurrency(bundle.discountAmount)) : '0 ₫' }}
                      </td>

                      <!-- Gia ban cuoi cung -->
                      <td class="py-3 px-4 text-right font-black tabular-nums text-white whitespace-nowrap">
                        {{ formatCurrency(bundle.finalPrice) }}
                      </td>

                      <!-- Trang thai -->
                      <td class="py-3 px-4 text-center whitespace-nowrap">
                        @switch (bundle.lifecycleState) {
                          @case ('ACTIVE') {
                            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-[#76b900]/20 border border-[#76b900]/40 text-[#76b900]">
                              Đang Bán
                            </span>
                          }
                          @case ('DRAFT') {
                            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/20 border border-slate-500/40 text-slate-300">
                              Bản Nháp
                            </span>
                          }
                          @case ('PAUSED') {
                            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                              Tạm Dừng
                            </span>
                          }
                          @case ('DISCONTINUED') {
                            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">
                              Ngừng Bán
                            </span>
                          }
                        }
                      </td>

                      <!-- Thao tac -->
                      <td class="py-3 px-4 text-right whitespace-nowrap">
                        <div class="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            (click)="openEditSheet(bundle)"
                            class="p-1.5 rounded hover:bg-[#272f3d] text-slate-300 hover:text-white transition-colors"
                            title="Sửa cấu hình định mức BOM"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            (click)="onDeleteBundle(bundle)"
                            class="p-1.5 rounded hover:bg-[#272f3d] text-slate-400 hover:text-rose-400 transition-colors"
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

        <!-- VIEW 2: Danh Sach The Truc Quan (Card / Kanban View) -->
        @if (currentView() === 'cards') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (bundle of bundleService.bundles(); track bundle.id) {
              <div class="bg-[#161b26] border border-[#272f3d] rounded-lg overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#76b900]/50 transition-all group">
                <div>
                  <!-- Card Header Banner -->
                  <div class="h-44 bg-[#090d16] relative flex items-center justify-center p-3 border-b border-[#272f3d]">
                    @if (bundle.primaryImage) {
                      <img [src]="bundle.primaryImage" [alt]="bundle.name" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    } @else {
                      <svg class="w-14 h-14 text-slate-600" fill="none" stroke="currentColor" stroke-width="1.25" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    }

                    <!-- Badges -->
                    <div class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#76b900] text-[#090d16]">
                      {{ bundle.totalItemsCount }} LINH KIỆN
                    </div>

                    <div class="absolute top-2.5 right-2.5">
                      @switch (bundle.lifecycleState) {
                        @case ('ACTIVE') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#76b900]/20 border border-[#76b900]/40 text-[#76b900]">
                            Đang Bán
                          </span>
                        }
                        @case ('DRAFT') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 border border-slate-500/40 text-slate-300">
                            Bản Nháp
                          </span>
                        }
                        @case ('PAUSED') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                            Tạm Dừng
                          </span>
                        }
                        @case ('DISCONTINUED') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">
                            Ngừng Bán
                          </span>
                        }
                      }
                    </div>
                  </div>

                  <!-- Card Body -->
                  <div class="p-4 space-y-3">
                    <div>
                      <h3 class="font-extrabold text-white text-sm line-clamp-1 group-hover:text-[#76b900] transition-colors">
                        {{ bundle.name }}
                      </h3>
                      <p class="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                        {{ bundle.description || 'Chưa có mô tả tóm tắt cho cấu hình máy tính này.' }}
                      </p>

                      <!-- Pricing Row -->
                      <div class="mt-3 flex items-baseline gap-2 flex-wrap">
                        <span class="text-base font-black text-white tabular-nums">
                          {{ formatCurrency(bundle.finalPrice) }}
                        </span>
                        @if (bundle.discountAmount > 0) {
                          <span class="text-xs text-slate-500 line-through tabular-nums">
                            {{ formatCurrency(bundle.grossTotal) }}
                          </span>
                          <span class="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.2 rounded">
                            -{{ formatCurrency(bundle.discountAmount) }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Ton kho kha dung theo chi nhanh -->
                    <div class="p-2.5 bg-[#090d16] rounded border border-[#272f3d] space-y-1 text-xs">
                      <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Tồn Khả Dụng Toàn Hệ Thống:
                      </div>
                      @for (branch of getDisplayBranches(bundle); track branch.branchId) {
                        <div class="flex items-center justify-between text-[11px]">
                          <span class="text-slate-400">{{ branch.branchName }}:</span>
                          <span
                            [class.text-[#76b900]]="branch.buildableCount > 0"
                            [class.text-rose-400]="branch.buildableCount === 0"
                            class="font-bold tabular-nums"
                          >
                            {{ branch.buildableCount }} bộ
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Card Footer Actions -->
                <div class="p-4 pt-0 border-t border-[#272f3d] mt-2 pt-3 flex items-center justify-between">
                  <span class="text-[11px] font-mono text-slate-500 truncate max-w-[140px]">
                    {{ bundle.slug }}
                  </span>

                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      (click)="onDeleteBundle(bundle)"
                      class="p-1.5 rounded hover:bg-[#272f3d] text-slate-400 hover:text-rose-400 transition-colors"
                      title="Xóa bộ máy"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="openEditSheet(bundle)"
                      class="px-3 py-1 bg-[#272f3d] hover:bg-[#343e50] text-white font-semibold text-xs rounded transition-colors inline-flex items-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
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

      <!-- MOD-06: Sheet Cau Hinh BOM Virtual Bill of Materials -->
      <app-pc-bundle-sheet
        [isOpen]="isSheetOpen()"
        [bundle]="selectedBundle()"
        (closed)="onSheetClosed()"
        (saved)="onSheetSaved($event)"
      />

      <!-- Toasts Container -->
      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        @for (toast of toasts(); track toast.id) {
          <div
            [class.bg-[#090d16]]="true"
            [class.border-[#76b900]]="toast.type === 'success'"
            [class.border-rose-500]="toast.type === 'error'"
            [class.border-blue-500]="toast.type === 'info'"
            class="pointer-events-auto p-3 rounded-lg border shadow-xl text-xs text-white flex items-center justify-between gap-3 animate-fade-in"
          >
            <span>{{ toast.message }}</span>
            <button type="button" (click)="dismissToast(toast.id)" class="text-slate-400 hover:text-white">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminPcBundlesPageComponent implements OnInit {
  readonly bundleService = inject(AdminPcBundleService);
  readonly branchService = inject(AdminBranchService);

  readonly currentView = signal<'list' | 'cards'>('list');
  readonly searchQuery = signal<string>('');
  readonly lifecycleFilter = signal<string>('ALL');
  readonly selectedBranchId = signal<number | null>(null);

  readonly isSheetOpen = signal<boolean>(false);
  readonly selectedBundle = signal<AdminPcBundle | null>(null);
  readonly toasts = signal<readonly ToastNotification[]>([]);

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

  onLifecycleFilterChange(val: string): void {
    this.lifecycleFilter.set(val);
    this.applyFilters();
  }

  onBranchFilterChange(branchId: number | null): void {
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
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
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
