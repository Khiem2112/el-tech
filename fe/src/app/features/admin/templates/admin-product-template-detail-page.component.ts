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
import { AdminBrandService } from '../brands/services/admin-brand.service';
import {
  AdminCategoryService,
  SpecAttribute,
} from '../categories/services/admin-category.service';
import { DynamicSpecRendererComponent } from './components/dynamic-spec-renderer.component';
import { LifecycleTransitionDialogComponent } from './components/lifecycle-transition-dialog.component';
import { VariantFormDialogComponent } from './components/variant-form-dialog.component';
import {
  AdminProductTemplateService,
  CreateProductTemplatePayload,
  ProductLifecycle,
  ProductTemplateDetail,
  ProductVariantItem,
  UpdateProductTemplatePayload,
} from './services/admin-product-template.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

@Component({
  selector: 'app-admin-product-template-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DynamicSpecRendererComponent,
    VariantFormDialogComponent,
    LifecycleTransitionDialogComponent,
  ],
  template: `
    <div class="space-y-0 text-sm text-slate-200">
      <!-- Dynamic Breadcrumbs (SCR-06) -->
      <div class="h-9 bg-[#161b26] border-b border-[#272f3d] px-4 lg:px-6 flex items-center justify-between text-xs flex-shrink-0">
        <nav class="flex items-center gap-1.5 text-slate-400">
          <a routerLink="/admin/catalog/templates" class="hover:text-[#76b900] transition-colors">Sản phẩm</a>
          <span>/</span>
          <span>{{ currentCategoryName() }}</span>
          <span>/</span>
          <span>{{ currentBrandName() }}</span>
          <span>/</span>
          <span class="font-bold text-white">{{ isNew() ? 'Thêm mới mẫu sản phẩm' : templateName() }}</span>
        </nav>
        <span class="text-xs text-slate-500 font-mono">SCR-06</span>
      </div>

      <!-- Quick Action Header & Process Status Bar -->
      <header class="bg-[#161b26] border-b border-[#272f3d] px-4 lg:px-6 py-3 flex items-center justify-between flex-wrap gap-4 flex-shrink-0 shadow-xs">
        <div class="flex items-center gap-3">
          <button
            type="button"
            [disabled]="isSaving()"
            (click)="saveTemplate()"
            class="px-4 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors shadow-sm disabled:opacity-50"
          >
            {{ isSaving() ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
          </button>

          <a
            routerLink="/admin/catalog/templates"
            class="px-3 py-1.5 bg-[#272f3d] hover:bg-[#343e50] text-slate-200 rounded font-semibold text-xs transition-colors"
          >
            Quay lại
          </a>

          @if (!isNew()) {
            <div class="flex items-center gap-1 bg-[#090d16] p-1 rounded border border-[#272f3d]">
              <span class="text-[11px] font-bold uppercase text-slate-400 px-1.5">Trạng thái:</span>
              <button
                type="button"
                (click)="openTransitionModal('DRAFT')"
                [class.bg-slate-700]="lifecycleState() === 'DRAFT'"
                [class.text-white]="lifecycleState() === 'DRAFT'"
                class="px-2 py-0.5 rounded text-xs font-semibold text-slate-400 hover:text-white"
              >
                Bản thảo
              </button>
              <button
                type="button"
                (click)="openTransitionModal('ACTIVE')"
                [class.bg-[#76b900]]="lifecycleState() === 'ACTIVE'"
                [class.text-[#090d16]]="lifecycleState() === 'ACTIVE'"
                [class.font-bold]="lifecycleState() === 'ACTIVE'"
                class="px-2.5 py-0.5 rounded text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Đang bán
              </button>
              <button
                type="button"
                (click)="openTransitionModal('PAUSED')"
                [class.bg-amber-950]="lifecycleState() === 'PAUSED'"
                [class.text-amber-400]="lifecycleState() === 'PAUSED'"
                class="px-2 py-0.5 rounded text-xs font-semibold text-slate-400 hover:text-white"
              >
                Tạm dừng
              </button>
              <button
                type="button"
                (click)="openTransitionModal('DISCONTINUED')"
                [class.bg-rose-950]="lifecycleState() === 'DISCONTINUED'"
                [class.text-rose-400]="lifecycleState() === 'DISCONTINUED'"
                class="px-2 py-0.5 rounded text-xs font-semibold text-slate-400 hover:text-white"
              >
                Ngừng bán
              </button>
            </div>
          }
        </div>

        @if (!isNew()) {
          <div class="flex items-center gap-1 text-xs font-semibold">
            <span
              class="px-3 py-1 rounded"
              [class.bg-slate-800]="lifecycleState() === 'DRAFT'"
              [class.text-slate-200]="lifecycleState() === 'DRAFT'"
              [class.text-slate-500]="lifecycleState() !== 'DRAFT'"
            >
              Bản thảo
            </span>
            <span class="text-slate-600">&gt;</span>
            <span
              class="px-3 py-1 rounded"
              [class.bg-[#76b900]]="lifecycleState() === 'ACTIVE'"
              [class.text-[#090d16]]="lifecycleState() === 'ACTIVE'"
              [class.font-bold]="lifecycleState() === 'ACTIVE'"
              [class.text-slate-500]="lifecycleState() !== 'ACTIVE'"
            >
              Đang bán
            </span>
            <span class="text-slate-600">&gt;</span>
            <span
              class="px-3 py-1 rounded"
              [class.bg-amber-950]="lifecycleState() === 'PAUSED'"
              [class.text-amber-400]="lifecycleState() === 'PAUSED'"
              [class.text-slate-500]="lifecycleState() !== 'PAUSED'"
            >
              Tạm dừng
            </span>
            <span class="text-slate-600">&gt;</span>
            <span
              class="px-3 py-1 rounded"
              [class.bg-rose-950]="lifecycleState() === 'DISCONTINUED'"
              [class.text-rose-400]="lifecycleState() === 'DISCONTINUED'"
              [class.text-slate-500]="lifecycleState() !== 'DISCONTINUED'"
            >
              Ngừng bán
            </span>
          </div>
        }
      </header>

      <!-- Main Header Card & Smart Buttons (Odoo Style) -->
      <div class="bg-[#161b26] border-b border-[#272f3d] px-4 lg:px-6 py-4 flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-md bg-[#090d16] border border-[#272f3d] p-1 flex items-center justify-center overflow-hidden">
            @if (firstCoverMedia()) {
              <img [src]="firstCoverMedia()" [alt]="templateName()" class="w-full h-full object-contain" />
            } @else {
              <span class="text-[10px] text-slate-500 font-mono">NO IMG</span>
            }
          </div>

          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-xl font-bold tracking-tight text-white">
                {{ isNew() ? 'Tạo Mới Mẫu Sản Phẩm Phần Cứng' : templateName() }}
              </h1>
              @if (!isNew()) {
                <span [class]="getLifecycleBadgeClass(lifecycleState())">
                  {{ getLifecycleLabel(lifecycleState()) }}
                </span>
              }
            </div>
            <div class="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>Model: <strong class="font-mono text-white">{{ modelCode() || 'Chưa nhập' }}</strong></span>
              <span>|</span>
              <span>Thương hiệu: <strong class="text-white">{{ currentBrandName() }}</strong></span>
              <span>|</span>
              <span>Danh mục: <strong class="text-white">{{ currentCategoryName() }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Smart Buttons Block -->
        @if (!isNew() && detailData()) {
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <a href="#section-variants" class="p-2.5 bg-[#090d16] hover:bg-[#272f3d]/50 border border-[#272f3d] rounded text-center transition-colors">
              <div class="text-base font-bold text-[#76b900] tabular-nums">
                {{ detailData()?.smartMetrics?.skuCount ?? 0 }}
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Biến thể SKU</div>
            </a>

            <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded text-center">
              <div class="text-base font-bold text-white tabular-nums">
                {{ detailData()?.smartMetrics?.totalOnHand ?? 0 }}
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Tồn thực tế</div>
            </div>

            <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded text-center">
              <div class="text-base font-bold text-emerald-400 tabular-nums">
                {{ detailData()?.smartMetrics?.totalAvailable ?? 0 }}
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Khả dụng</div>
            </div>

            <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded text-center">
              <div class="text-base font-bold text-slate-300 tabular-nums">
                {{ detailData()?.smartMetrics?.stockMoveCount ?? 0 }}
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Biến động kho</div>
            </div>

            <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded text-center">
              <div class="text-base font-bold text-slate-300 tabular-nums">
                {{ detailData()?.smartMetrics?.poCount ?? 0 }}
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Đơn mua PO</div>
            </div>

            <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded text-center">
              <div class="text-base font-bold text-emerald-400 tabular-nums">
                {{ detailData()?.smartMetrics?.orderCount ?? 0 }}
              </div>
              <div class="text-[11px] text-slate-400 font-medium">Đã bán</div>
            </div>
          </div>
        }
      </div>

      <!-- Main Form Body: 2-Column Layout (5:7) -->
      <div class="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        @if (formError()) {
          <div class="p-3.5 bg-rose-950/60 border border-rose-800 rounded text-rose-300 text-xs">
            {{ formError() }}
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left Column (lg:col-span-5): General Info & Media -->
          <div class="lg:col-span-5 space-y-6">
            <!-- General Info Card -->
            <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-5 shadow-sm space-y-4">
              <div class="border-b border-[#272f3d] pb-2">
                <h2 class="text-xs font-bold uppercase tracking-wider text-white">
                  Thông Tin Chung
                </h2>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                    Tên Sản Phẩm <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    [value]="templateName()"
                    (input)="onNameInput($event)"
                    placeholder="VD: ASUS ROG Strix GeForce RTX 5090"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] font-semibold text-sm"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                      Đường Dẫn Slug <span class="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      [value]="slug()"
                      (input)="slug.set($any($event.target).value)"
                      placeholder="asus-rog-strix-geforce-rtx-5090"
                      class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white font-mono focus:outline-none focus:border-[#76b900] text-sm"
                    />
                  </div>

                  <div>
                    <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                      Thương Hiệu <span class="text-rose-500">*</span>
                    </label>
                    <select
                      [value]="brandId() ?? ''"
                      (change)="brandId.set(+$any($event.target).value)"
                      class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] font-medium text-sm"
                    >
                      <option value="">-- Chọn thương hiệu --</option>
                      @for (b of brandList(); track b.id) {
                        <option [value]="b.id">{{ b.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                      Danh Mục <span class="text-rose-500">*</span>
                    </label>
                    <select
                      [value]="categoryId() ?? ''"
                      (change)="onCategorySelectChange($event)"
                      class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] font-medium text-sm"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      @for (c of categoryList(); track c.id) {
                        <option [value]="c.id">{{ c.name }}</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                      Model <span class="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      [value]="modelCode()"
                      (input)="modelCode.set($any($event.target).value)"
                      placeholder="ROG-STRIX-RTX5090"
                      class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white font-mono focus:outline-none focus:border-[#76b900] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                    Dòng Chip / Vi Kiến Trúc (Chipset Family)
                  </label>
                  <input
                    type="text"
                    [value]="chipsetFamily()"
                    (input)="chipsetFamily.set($any($event.target).value)"
                    placeholder="VD: NVIDIA Blackwell Architecture, Intel Arrow Lake"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] text-sm"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                    Mô Tả Tóm Tắt
                  </label>
                  <textarea
                    [value]="description()"
                    (input)="description.set($any($event.target).value)"
                    rows="3"
                    placeholder="Nhập thông tin giới thiệu, tính năng nổi bật..."
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Media Library Card -->
            <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-5 shadow-sm space-y-4">
              <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
                <div>
                  <h2 class="text-xs font-bold uppercase tracking-wider text-white">
                    Thư Viện Hình Ảnh Media
                  </h2>
                  <p class="text-[11px] text-slate-400">Ảnh đại diện và các góc chụp sản phẩm</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    [value]="newImageUrl()"
                    (input)="newImageUrl.set($any($event.target).value)"
                    placeholder="Dán URL hình ảnh..."
                    class="flex-1 px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white focus:outline-none focus:border-[#76b900]"
                  />
                  <button
                    type="button"
                    (click)="addMediaUrl()"
                    class="px-3 py-1.5 bg-[#272f3d] hover:bg-[#343e50] text-[#76b900] font-bold text-xs rounded transition-colors"
                  >
                    + Thêm
                  </button>
                </div>

                @if (mediaList().length === 0) {
                  <div class="p-4 bg-[#090d16] border border-dashed border-[#272f3d] rounded text-center text-xs text-slate-500">
                    Chưa có ảnh nào được thêm. Vui lòng nhập URL ảnh vào ô phía trên.
                  </div>
                } @else {
                  <div class="grid grid-cols-3 gap-3">
                    @for (imgUrl of mediaList(); track imgUrl; let i = $index) {
                      <div class="relative group border border-[#272f3d] rounded-md bg-[#090d16] p-1 flex items-center justify-center h-24 overflow-hidden">
                        <img [src]="imgUrl" alt="Media" class="max-h-full max-w-full object-contain" />
                        @if (i === 0) {
                          <span class="absolute top-1 left-1 bg-[#76b900] text-[#090d16] font-extrabold text-[9px] px-1 py-0.2 rounded">
                            ẢNH CHÍNH
                          </span>
                        }
                        <button
                          type="button"
                          (click)="removeMediaUrl(i)"
                          class="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-900 text-rose-300 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa ảnh"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Right Column (lg:col-span-7): Dynamic Specification Form -->
          <div class="lg:col-span-7 space-y-6">
            <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-5 shadow-sm space-y-4">
              <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
                <div>
                  <h2 class="text-xs font-bold uppercase tracking-wider text-white">
                    Thông Số Kỹ Thuật Động (Dynamic Specification Form)
                  </h2>
                  <p class="text-[11px] text-slate-400">
                    Tự động kết xuất theo schema của danh mục đã chọn (CAT-001, CAT-007)
                  </p>
                </div>
              </div>

              <app-dynamic-spec-renderer
                [schema]="activeSpecSchema()"
                [(specValues)]="commonSpec"
              />
            </div>
          </div>
        </div>

        <!-- Bottom Section: Variant SKU List (MOD-04 integration) -->
        @if (!isNew()) {
          <div id="section-variants" class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm">
            <div class="p-4 border-b border-[#272f3d] flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 class="text-xs font-bold uppercase tracking-wider text-white">
                  Danh Sách Biến Thể SKU
                </h2>
                <p class="text-[11px] text-slate-400">
                  Mỗi biến thể có mã SKU duy nhất, giá bán niêm yết và quy định serial (MOD-04)
                </p>
              </div>

              <button
                type="button"
                (click)="openCreateVariantModal()"
                class="px-3.5 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors shadow-sm inline-flex items-center gap-1.5 uppercase tracking-wide"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Thêm SKU</span>
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th class="py-3 px-4">Mã SKU</th>
                    <th class="py-3 px-4">Mã Vạch Barcode</th>
                    <th class="py-3 px-4">Tên Biến Thể</th>
                    <th class="py-3 px-4 text-right">Giá Bán Niêm Yết</th>
                    <th class="py-3 px-4 text-center">Quản Lý Serial</th>
                    <th class="py-3 px-4 text-right">Tồn Khả Dụng</th>
                    <th class="py-3 px-4 text-center">Trạng Thái</th>
                    <th class="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#272f3d]">
                  @if (variants().length === 0) {
                    <tr>
                      <td colspan="8" class="p-6 text-center text-slate-400">
                        Chưa có biến thể SKU nào. Vui lòng bấm "+ Thêm SKU" để tạo biến thể đầu tiên.
                      </td>
                    </tr>
                  } @else {
                    @for (v of variants(); track v.id) {
                      <tr class="hover:bg-[#090d16]/50 transition-colors">
                        <td class="py-3 px-4 font-mono font-bold text-white">
                          {{ v.sku }}
                        </td>
                        <td class="py-3 px-4 font-mono text-slate-400">
                          {{ v.barcode || '—' }}
                        </td>
                        <td class="py-3 px-4 font-medium text-slate-200">
                          {{ v.variationLabel || 'Mặc định' }}
                        </td>
                        <td class="py-3 px-4 text-right font-black tabular-nums text-white">
                          {{ formatCurrency(v.sellingPrice) }}
                        </td>
                        <td class="py-3 px-4 text-center">
                          @if (v.serialRequired) {
                            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-[#76b900]/20 text-[#76b900] border border-[#76b900]/30">
                              Có Serial
                            </span>
                          } @else {
                            <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400">
                              Không
                            </span>
                          }
                        </td>
                        <td class="py-3 px-4 text-right tabular-nums font-bold" [class.text-emerald-400]="v.totalAvailable > 0" [class.text-rose-400]="v.totalAvailable <= 0">
                          {{ v.totalAvailable }} chiếc
                        </td>
                        <td class="py-3 px-4 text-center">
                          <span [class]="getLifecycleBadgeClass(v.lifecycleState)">
                            {{ getLifecycleLabel(v.lifecycleState) }}
                          </span>
                        </td>
                        <td class="py-3 px-4 text-right">
                          <div class="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              (click)="openEditVariantModal(v)"
                              class="p-1.5 rounded hover:bg-[#272f3d] text-slate-300 hover:text-white transition-colors"
                              title="Sửa biến thể"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              (click)="deleteVariant(v)"
                              class="p-1.5 rounded hover:bg-[#272f3d] text-rose-400 hover:text-rose-300 transition-colors"
                              title="Xóa biến thể"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <!-- Variant Dialog (MOD-04) -->
      <app-variant-form-dialog
        [isOpen]="isVariantModalOpen()"
        [variant]="selectedVariant()"
        [productTemplateId]="templateId()"
        (close)="isVariantModalOpen.set(false)"
        (saved)="onVariantSaved()"
      />

      <!-- Lifecycle Transition Dialog (MOD-05) -->
      <app-lifecycle-transition-dialog
        [isOpen]="isTransitionModalOpen()"
        targetType="template"
        [targetId]="templateId()"
        [targetName]="templateName()"
        [currentState]="lifecycleState()"
        [missingSpecKeys]="missingRequiredSpecKeys()"
        [activeVariantCount]="activeVariantCount()"
        (close)="isTransitionModalOpen.set(false)"
        (transitioned)="onLifecycleTransitioned()"
      />

      <!-- Toasts -->
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
export class AdminProductTemplateDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly templateService = inject(AdminProductTemplateService);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly brandService = inject(AdminBrandService);

  readonly templateId = signal<number>(0);
  readonly isNew = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly formError = signal<string | null>(null);

  readonly templateName = signal<string>('');
  readonly slug = signal<string>('');
  readonly brandId = signal<number | null>(null);
  readonly categoryId = signal<number | null>(null);
  readonly modelCode = signal<string>('');
  readonly chipsetFamily = signal<string>('');
  readonly description = signal<string>('');
  readonly lifecycleState = signal<ProductLifecycle>('DRAFT');
  readonly mediaList = signal<string[]>([]);
  readonly newImageUrl = signal<string>('');
  readonly commonSpec = signal<Record<string, unknown>>({});

  readonly detailData = signal<ProductTemplateDetail | null>(null);
  readonly activeSpecSchema = signal<SpecAttribute[]>([]);

  readonly categoryList = this.categoryService.categories;
  readonly brandList = this.brandService.brands;

  readonly isVariantModalOpen = signal<boolean>(false);
  readonly selectedVariant = signal<ProductVariantItem | null>(null);
  readonly isTransitionModalOpen = signal<boolean>(false);

  readonly toasts = signal<ToastNotification[]>([]);
  private toastIdCounter = 0;

  readonly variants = computed(() => this.detailData()?.variants ?? []);

  readonly activeVariantCount = computed(() => {
    const list = this.variants();
    return list.filter((v) => v.lifecycleState === 'ACTIVE').length;
  });

  readonly missingRequiredSpecKeys = computed(() => {
    const schema = this.activeSpecSchema();
    const specs = this.commonSpec();
    const missing: string[] = [];
    for (const attr of schema) {
      if (attr.required && !attr.isDeprecated) {
        const val = specs[attr.key];
        if (val === undefined || val === null || val === '') {
          missing.push(attr.label);
        }
      }
    }
    return missing;
  });

  readonly currentCategoryName = computed(() => {
    const id = this.categoryId();
    if (!id) {
      return 'Chưa chọn danh mục';
    }
    const cat = this.categoryList().find((c) => c.id === id);
    return cat ? cat.name : 'Danh mục';
  });

  readonly currentBrandName = computed(() => {
    const id = this.brandId();
    if (!id) {
      return 'Chưa chọn thương hiệu';
    }
    const b = this.brandList().find((item) => item.id === id);
    return b ? b.name : 'Thương hiệu';
  });

  readonly firstCoverMedia = computed(() => {
    const list = this.mediaList();
    return list.length > 0 ? list[0] : null;
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.categoryService.loadCategories({ tree: false }),
      this.brandService.loadBrands(),
    ]);

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || idParam === 'new') {
      this.isNew.set(true);
      return;
    }

    const id = Number(idParam);
    if (isNaN(id) || id <= 0) {
      this.isNew.set(true);
      return;
    }

    this.templateId.set(id);
    await this.loadExistingTemplate(id);
  }

  async loadExistingTemplate(id: number): Promise<void> {
    try {
      const data = await this.templateService.getTemplateById(id);
      this.detailData.set(data);
      this.templateName.set(data.name);
      this.slug.set(data.slug);
      this.brandId.set(data.brand.id);
      this.categoryId.set(data.category.id);
      this.modelCode.set(data.model);
      this.chipsetFamily.set(data.chipsetFamily ?? '');
      this.description.set(data.description ?? '');
      this.lifecycleState.set(data.lifecycleState);
      this.commonSpec.set((data.commonSpec as Record<string, unknown>) ?? {});

      if (Array.isArray(data.media)) {
        const urls = data.media.map((m) => (typeof m === 'string' ? m : (m as { url: string }).url));
        this.mediaList.set(urls.filter(Boolean));
      }

      if (Array.isArray(data.category.specificationSchema)) {
        this.activeSpecSchema.set(data.category.specificationSchema as SpecAttribute[]);
      } else {
        await this.syncCategorySchema(data.category.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải chi tiết mẫu sản phẩm';
      this.formError.set(msg);
    }
  }

  async syncCategorySchema(catId: number): Promise<void> {
    const cat = this.categoryList().find((c) => c.id === catId);
    if (cat && cat.specificationSchema) {
      this.activeSpecSchema.set(cat.specificationSchema);
    } else {
      try {
        const fullCat = await this.categoryService.getCategoryById(catId);
        this.activeSpecSchema.set(fullCat.specificationSchema ?? []);
      } catch {
        this.activeSpecSchema.set([]);
      }
    }
  }

  async onCategorySelectChange(event: Event): Promise<void> {
    const val = (event.target as HTMLSelectElement).value;
    const catId = val ? Number(val) : null;
    this.categoryId.set(catId);
    if (catId) {
      await this.syncCategorySchema(catId);
    } else {
      this.activeSpecSchema.set([]);
    }
  }

  onNameInput(event: Event): void {
    const nameVal = (event.target as HTMLInputElement).value;
    this.templateName.set(nameVal);
    if (this.isNew()) {
      const generatedSlug = nameVal
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.slug.set(generatedSlug);
    }
  }

  addMediaUrl(): void {
    const url = this.newImageUrl().trim();
    if (!url) {
      return;
    }
    this.mediaList.update((list) => [...list, url]);
    this.newImageUrl.set('');
  }

  removeMediaUrl(index: number): void {
    this.mediaList.update((list) => list.filter((_, i) => i !== index));
  }

  async saveTemplate(): Promise<void> {
    const name = this.templateName().trim();
    const slug = this.slug().trim();
    const brandId = this.brandId();
    const categoryId = this.categoryId();
    const model = this.modelCode().trim();

    if (!name || !slug || !brandId || !categoryId || !model) {
      this.formError.set('Vui lòng điền đầy đủ các trường bắt buộc (Tên, Slug, Thương hiệu, Danh mục, Model)');
      return;
    }

    this.isSaving.set(true);
    this.formError.set(null);

    const payload: CreateProductTemplatePayload = {
      name,
      slug,
      brandId,
      categoryId,
      model,
      chipsetFamily: this.chipsetFamily().trim() || null,
      description: this.description().trim() || null,
      commonSpec: this.commonSpec(),
      media: this.mediaList(),
    };

    try {
      if (this.isNew()) {
        const created = await this.templateService.createTemplate(payload);
        this.showToast('Tạo mới mẫu sản phẩm thành công', 'success');
        await this.router.navigate(['/admin/catalog/templates', created.id]);
      } else {
        const updated = await this.templateService.updateTemplate(this.templateId(), payload as UpdateProductTemplatePayload);
        this.detailData.set(updated);
        this.showToast('Lưu thay đổi thành công', 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu mẫu sản phẩm';
      this.formError.set(msg);
    } finally {
      this.isSaving.set(false);
    }
  }

  openCreateVariantModal(): void {
    this.selectedVariant.set(null);
    this.isVariantModalOpen.set(true);
  }

  openEditVariantModal(variant: ProductVariantItem): void {
    this.selectedVariant.set(variant);
    this.isVariantModalOpen.set(true);
  }

  async onVariantSaved(): Promise<void> {
    this.showToast('Lưu biến thể SKU thành công', 'success');
    if (this.templateId()) {
      await this.loadExistingTemplate(this.templateId());
    }
  }

  async deleteVariant(variant: ProductVariantItem): Promise<void> {
    const confirmed = confirm(
      `Bạn có chắc chắn muốn xóa biến thể "${variant.sku}"? Thao tác này sẽ bị chặn nếu SKU đã phát sinh đơn hàng hoặc tồn kho (CAT-010).`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await this.templateService.deleteVariant(variant.id);
      this.showToast('Đã xóa biến thể SKU', 'success');
      await this.loadExistingTemplate(this.templateId());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa biến thể';
      this.showToast(msg, 'error');
    }
  }

  openTransitionModal(_targetState?: ProductLifecycle): void {
    this.isTransitionModalOpen.set(true);
  }

  async onLifecycleTransitioned(): Promise<void> {
    this.showToast('Cập nhật trạng thái vòng đời thành công', 'success');
    if (this.templateId()) {
      await this.loadExistingTemplate(this.templateId());
    }
  }

  formatCurrency(val: string | number): string {
    const num = Number(val);
    if (isNaN(num)) {
      return '0 đ';
    }
    return num.toLocaleString('vi-VN') + ' đ';
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

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    const id = ++this.toastIdCounter;
    this.toasts.update((current) => [...current, { id, message, type }]);
    setTimeout(() => this.removeToast(id), 5000);
  }

  removeToast(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
