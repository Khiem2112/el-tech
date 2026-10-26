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
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
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
    ButtonDirective,
    SelectComponent,
    DynamicSpecRendererComponent,
    VariantFormDialogComponent,
    LifecycleTransitionDialogComponent,
  ],
  template: `
    <div class="space-y-0 text-sm text-foreground">
      <div class="h-9 bg-surface-alt border-b border-line px-4 lg:px-6 flex items-center justify-between text-xs flex-shrink-0">
        <nav class="flex items-center gap-1.5 text-muted">
          <a routerLink="/admin/catalog/templates" class="hover:text-primary transition-colors">Sản phẩm</a>
          <span>/</span>
          <span>{{ currentCategoryName() }}</span>
          <span>/</span>
          <span>{{ currentBrandName() }}</span>
          <span>/</span>
          <span class="font-bold text-foreground">{{ isNew() ? 'Thêm mới mẫu sản phẩm' : templateName() }}</span>
        </nav>
      </div>

      <header class="bg-surface border-b border-line px-4 lg:px-6 py-3 flex items-center justify-between flex-wrap gap-4 flex-shrink-0 shadow-xs">
        <div class="flex items-center gap-3">
          <button
            type="button"
            appButton
            variant="primary"
            size="sm"
            [disabled]="isSaving()"
            (click)="saveTemplate()"
            class="disabled:opacity-50"
          >
            {{ isSaving() ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
          </button>

          <a
            routerLink="/admin/catalog/templates"
            appButton
            variant="outline"
            size="sm"
          >
            Quay lại
          </a>

          @if (!isNew() && detailData(); as tpl) {
            <a
              [routerLink]="['/admin/inventory/transfers']"
              [queryParams]="{ search: tpl.name }"
              appButton
              variant="outline"
              size="sm"
              class="inline-flex items-center gap-1.5"
              title="Tạo lệnh điều chuyển kho giữa các chi nhánh cho sản phẩm này"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Chuyển Kho Nhanh</span>
            </a>
          }

          @if (!isNew()) {
            <div class="flex items-center gap-1 bg-surface-alt p-1 rounded border border-line">
              <span class="text-xs font-bold uppercase text-muted px-1.5">Trạng thái:</span>
              <button
                type="button"
                (click)="openTransitionModal('DRAFT')"
                [class.bg-surface]="lifecycleState() === 'DRAFT'"
                [class.text-foreground]="lifecycleState() === 'DRAFT'"
                [class.border]="lifecycleState() === 'DRAFT'"
                [class.border-line]="lifecycleState() === 'DRAFT'"
                class="px-2 py-0.5 rounded text-xs font-semibold text-muted hover:text-foreground"
              >
                Bản thảo
              </button>
              <button
                type="button"
                (click)="openTransitionModal('ACTIVE')"
                [class.bg-primary]="lifecycleState() === 'ACTIVE'"
                [class.text-primary-foreground]="lifecycleState() === 'ACTIVE'"
                [class.font-bold]="lifecycleState() === 'ACTIVE'"
                class="px-2.5 py-0.5 rounded text-xs font-semibold text-muted hover:text-foreground transition-colors"
              >
                Đang bán
              </button>
              <button
                type="button"
                (click)="openTransitionModal('PAUSED')"
                [class.bg-amber-500/10]="lifecycleState() === 'PAUSED'"
                [class.text-amber-700]="lifecycleState() === 'PAUSED'"
                [class.border]="lifecycleState() === 'PAUSED'"
                [class.border-amber-500/30]="lifecycleState() === 'PAUSED'"
                class="px-2 py-0.5 rounded text-xs font-semibold text-muted hover:text-foreground"
              >
                Tạm dừng
              </button>
              <button
                type="button"
                (click)="openTransitionModal('DISCONTINUED')"
                [class.bg-destructive/10]="lifecycleState() === 'DISCONTINUED'"
                [class.text-destructive]="lifecycleState() === 'DISCONTINUED'"
                [class.border]="lifecycleState() === 'DISCONTINUED'"
                [class.border-destructive/30]="lifecycleState() === 'DISCONTINUED'"
                class="px-2 py-0.5 rounded text-xs font-semibold text-muted hover:text-foreground"
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
              [class.bg-surface-alt]="lifecycleState() === 'DRAFT'"
              [class.text-foreground]="lifecycleState() === 'DRAFT'"
              [class.text-muted]="lifecycleState() !== 'DRAFT'"
            >
              Bản thảo
            </span>
            <span class="text-muted">&gt;</span>
            <span
              class="px-3 py-1 rounded"
              [class.bg-primary]="lifecycleState() === 'ACTIVE'"
              [class.text-primary-foreground]="lifecycleState() === 'ACTIVE'"
              [class.font-bold]="lifecycleState() === 'ACTIVE'"
              [class.text-muted]="lifecycleState() !== 'ACTIVE'"
            >
              Đang bán
            </span>
            <span class="text-muted">&gt;</span>
            <span
              class="px-3 py-1 rounded"
              [class.bg-amber-500/10]="lifecycleState() === 'PAUSED'"
              [class.text-amber-700]="lifecycleState() === 'PAUSED'"
              [class.text-muted]="lifecycleState() !== 'PAUSED'"
            >
              Tạm dừng
            </span>
            <span class="text-muted">&gt;</span>
            <span
              class="px-3 py-1 rounded"
              [class.bg-destructive/10]="lifecycleState() === 'DISCONTINUED'"
              [class.text-destructive]="lifecycleState() === 'DISCONTINUED'"
              [class.text-muted]="lifecycleState() !== 'DISCONTINUED'"
            >
              Ngừng bán
            </span>
          </div>
        }
      </header>

      <div class="bg-surface border-b border-line px-4 lg:px-6 py-4 flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-md bg-surface-alt border border-line p-1 flex items-center justify-center overflow-hidden">
            @if (firstCoverMedia()) {
              <img
                src="/images/products/placeholder.webp"
                [src]="firstCoverMedia() || '/images/products/placeholder.webp'"
                [alt]="templateName() || 'Mẫu sản phẩm'"
                class="w-full h-full object-contain"
                (error)="onImageError($event)"
              />
            } @else {
              <span class="text-xs text-muted font-mono">NO IMG</span>
            }
          </div>

          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                {{ isNew() ? 'Tạo Mới Mẫu Sản Phẩm Phần Cứng' : templateName() }}
              </h1>
              @if (!isNew()) {
                <span [class]="getLifecycleBadgeClass(lifecycleState())">
                  {{ getLifecycleLabel(lifecycleState()) }}
                </span>
              }
            </div>
            <div class="text-xs text-muted mt-1 flex items-center gap-3">
              <span>Model: <strong class="font-mono text-foreground">{{ modelCode() || 'Chưa nhập' }}</strong></span>
              <span>|</span>
              <span>Thương hiệu: <strong class="text-foreground">{{ currentBrandName() }}</strong></span>
              <span>|</span>
              <span>Danh mục: <strong class="text-foreground">{{ currentCategoryName() }}</strong></span>
            </div>
          </div>
        </div>

        @if (!isNew() && detailData(); as tpl) {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <a
              [routerLink]="['/admin/catalog/variants']"
              [queryParams]="{ productTemplateId: tpl.id, search: tpl.name }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Nhấp để lọc danh sách biến thể SKU của mẫu sản phẩm này"
            >
              <div class="text-base font-bold text-primary tabular tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.skuCount ?? tpl.variants.length }}
              </div>
              <div class="text-xs text-muted font-medium">Biến thể SKU</div>
            </a>

            <a
              [routerLink]="['/admin/inventory/balances']"
              [queryParams]="{ search: tpl.name }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Nhấp để kiểm tra tồn kho thực tế tại các chi nhánh"
            >
              <div class="text-base font-bold text-foreground tabular tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.totalOnHand ?? 0 }}
              </div>
              <div class="text-xs text-muted font-medium">Tồn thực tế</div>
            </a>

            <a
              [routerLink]="['/admin/inventory/balances']"
              [queryParams]="{ search: tpl.name, stockStatus: 'IN_STOCK' }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              [title]="getAvailableBranchTooltip()"
            >
              <div class="text-base font-bold text-emerald-600 tabular tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.totalAvailable ?? 0 }}
              </div>
              <div class="text-xs text-muted font-medium">Khả dụng</div>
            </a>

            <a
              [routerLink]="['/admin/inventory/ledger']"
              [queryParams]="{ search: tpl.name }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Nhấp để tra cứu toàn bộ biến động nhập xuất trong sổ kho bất biến"
            >
              <div class="text-base font-bold text-muted tabular tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.stockMoveCount ?? 0 }}
              </div>
              <div class="text-xs text-muted font-medium">Biến động kho</div>
            </a>

            <a
              [routerLink]="['/admin/procurement/purchase-orders']"
              [queryParams]="{ search: tpl.name }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Nhấp để xem lịch sử các đơn mua hàng PO chứa sản phẩm này"
            >
              <div class="text-base font-bold text-muted tabular tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.poCount ?? 0 }}
              </div>
              <div class="text-xs text-muted font-medium">Lịch sử mua PO</div>
            </a>

            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="{ search: tpl.name }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Nhấp để xem các đơn hàng khách hàng đã đặt có chứa sản phẩm này"
            >
              <div class="text-base font-bold text-emerald-600 tabular tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.orderCount ?? 0 }}
              </div>
              <div class="text-xs text-muted font-medium">Lịch sử bán hàng</div>
            </a>
          </div>
        }
      </div>

      <div class="w-full p-4 lg:p-6 space-y-6">
        @if (formError()) {
          <div class="p-3.5 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
            {{ formError() }}
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div class="lg:col-span-5 space-y-6">
            <div class="bg-surface border border-line rounded-lg p-5 shadow-xs space-y-4">
              <div class="border-b border-line pb-2">
                <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
                  Thông Tin Chung
                </h2>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block font-semibold text-muted text-xs uppercase mb-1">
                    Tên Sản Phẩm <span class="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    [value]="templateName()"
                    (input)="onNameInput($event)"
                    placeholder="VD: ASUS ROG Strix GeForce RTX 5090"
                    class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground focus:outline-none focus:border-primary font-semibold text-sm"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold text-muted text-xs uppercase mb-1">
                      Đường Dẫn Slug <span class="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      [value]="slug()"
                      (input)="slug.set($any($event.target).value)"
                      placeholder="asus-rog-strix-geforce-rtx-5090"
                      class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-mono focus:outline-none focus:border-primary text-sm"
                    />
                  </div>

                  <div>
                    <label class="block font-semibold text-muted text-xs uppercase mb-1">
                      Thương Hiệu <span class="text-destructive">*</span>
                    </label>
                    <app-select
                      [options]="brandOptions()"
                      [value]="brandId() !== null ? String(brandId()) : ''"
                      (valueChange)="onBrandSelectChange($event)"
                      placeholder="-- Chọn thương hiệu --"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold text-muted text-xs uppercase mb-1">
                      Danh Mục <span class="text-destructive">*</span>
                    </label>
                    <app-select
                      [options]="categoryOptions()"
                      [value]="categoryId() !== null ? String(categoryId()) : ''"
                      (valueChange)="onCategorySelectChange($event)"
                      placeholder="-- Chọn danh mục --"
                    />
                  </div>

                  <div>
                    <label class="block font-semibold text-muted text-xs uppercase mb-1">
                      Model <span class="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      [value]="modelCode()"
                      (input)="modelCode.set($any($event.target).value)"
                      placeholder="ROG-STRIX-RTX5090"
                      class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-mono focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label class="block font-semibold text-muted text-xs uppercase mb-1">
                    Dòng Chip / Vi Kiến Trúc (Chipset Family)
                  </label>
                  <input
                    type="text"
                    [value]="chipsetFamily()"
                    (input)="chipsetFamily.set($any($event.target).value)"
                    placeholder="VD: NVIDIA Blackwell Architecture, Intel Arrow Lake"
                    class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-muted text-xs uppercase mb-1">
                    Mô Tả Tóm Tắt
                  </label>
                  <textarea
                    [value]="description()"
                    (input)="description.set($any($event.target).value)"
                    rows="3"
                    placeholder="Nhập thông tin giới thiệu, tính năng nổi bật..."
                    class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground focus:outline-none focus:border-primary text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="bg-surface border border-line rounded-lg p-5 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-line pb-2">
                <div>
                  <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
                    Thư Viện Hình Ảnh Media
                  </h2>
                  <p class="text-xs text-muted">Ảnh đại diện và các góc chụp sản phẩm</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    [value]="newImageUrl()"
                    (input)="newImageUrl.set($any($event.target).value)"
                    placeholder="Dán URL hình ảnh..."
                    class="flex-1 px-3 py-1.5 bg-surface border border-line rounded text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    appButton
                    variant="outline"
                    size="sm"
                    (click)="addMediaUrl()"
                  >
                    + Thêm
                  </button>
                </div>

                @if (mediaList().length === 0) {
                  <div class="p-4 bg-surface-alt border border-dashed border-line rounded text-center text-xs text-muted">
                    Chưa có ảnh nào được thêm. Vui lòng nhập URL ảnh vào ô phía trên.
                  </div>
                } @else {
                  <div class="grid grid-cols-3 gap-3">
                    @for (imgUrl of mediaList(); track imgUrl; let i = $index) {
                      <div class="relative group border border-line rounded-md bg-surface-alt p-1 flex items-center justify-center h-24 overflow-hidden">
                        <img
                          src="/images/products/placeholder.webp"
                          [src]="imgUrl || '/images/products/placeholder.webp'"
                          [alt]="templateName() ? templateName() + ' - Ảnh ' + (i + 1) : 'Ảnh mẫu sản phẩm ' + (i + 1)"
                          class="max-h-full max-w-full object-contain"
                          (error)="onImageError($event)"
                        />
                        @if (i === 0) {
                          <span class="absolute top-1 left-1 bg-primary text-primary-foreground font-extrabold text-xs px-1.5 py-0.5 rounded">
                            ẢNH CHÍNH
                          </span>
                        }
                        <button
                          type="button"
                          (click)="removeMediaUrl(i)"
                          class="absolute top-1 right-1 p-1 bg-surface/90 hover:bg-destructive text-destructive hover:text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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

          <div class="lg:col-span-7 space-y-6">
            <div class="bg-surface border border-line rounded-lg p-5 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-line pb-2">
                <div>
                  <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
                    Thông Số Kỹ Thuật Động (Dynamic Specification Form)
                  </h2>
                  <p class="text-xs text-muted">
                    Tự động kết xuất theo schema của danh mục đã chọn
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

        @if (!isNew()) {
          <div id="section-variants" class="bg-surface border border-line rounded-lg shadow-xs">
            <div class="p-4 border-b border-line flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
                  Danh Sách Biến Thể SKU
                </h2>
                <p class="text-xs text-muted">
                  Mỗi biến thể có mã SKU duy nhất, giá bán niêm yết và quy định serial
                </p>
              </div>

              <button
                type="button"
                appButton
                variant="primary"
                size="sm"
                (click)="openCreateVariantModal()"
                class="inline-flex items-center gap-1.5 uppercase tracking-wide"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Thêm SKU</span>
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[1000px] text-left text-xs">
                <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider">
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
                <tbody class="divide-y divide-line">
                  @if (variants().length === 0) {
                    <tr>
                      <td colspan="8" class="p-6 text-center text-muted">
                        Chưa có biến thể SKU nào. Vui lòng bấm "+ Thêm SKU" để tạo biến thể đầu tiên.
                      </td>
                    </tr>
                  } @else {
                    @for (v of variants(); track v.id) {
                      <tr class="hover:bg-surface-alt/50 transition-colors">
                        <td class="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                          {{ v.sku }}
                        </td>
                        <td class="py-3 px-4 font-mono text-muted whitespace-nowrap">
                          {{ v.barcode || '—' }}
                        </td>
                        <td class="py-3 px-4 font-medium text-foreground">
                          {{ v.variationLabel || 'Mặc định' }}
                        </td>
                        <td class="py-3 px-4 text-right font-bold font-mono tabular tabular-nums text-foreground whitespace-nowrap">
                          {{ formatCurrency(v.sellingPrice) }}
                        </td>
                        <td class="py-3 px-4 text-center whitespace-nowrap">
                          @if (v.serialRequired) {
                            <span class="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                              Có Serial
                            </span>
                          } @else {
                            <span class="px-2 py-0.5 rounded text-xs font-medium bg-surface-alt text-muted border border-line">
                              Không
                            </span>
                          }
                        </td>
                        <td class="py-3 px-4 text-right tabular tabular-nums font-bold whitespace-nowrap" [class.text-emerald-600]="v.totalAvailable > 0" [class.text-destructive]="v.totalAvailable <= 0">
                          {{ v.totalAvailable }} chiếc
                        </td>
                        <td class="py-3 px-4 text-center whitespace-nowrap">
                          <span [class]="getLifecycleBadgeClass(v.lifecycleState)">
                            {{ getLifecycleLabel(v.lifecycleState) }}
                          </span>
                        </td>
                        <td class="py-3 px-4 text-right whitespace-nowrap">
                          <div class="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              (click)="openEditVariantModal(v)"
                              class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
                              title="Sửa biến thể"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              (click)="deleteVariant(v)"
                              class="p-1.5 rounded hover:bg-surface-alt text-destructive hover:opacity-80 transition-colors"
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

      <app-variant-form-dialog
        [isOpen]="isVariantModalOpen()"
        [variant]="selectedVariant()"
        [productTemplateId]="templateId()"
        (close)="isVariantModalOpen.set(false)"
        (saved)="onVariantSaved()"
      />

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
export class AdminProductTemplateDetailPageComponent implements OnInit {
  protected readonly String = String;
  protected readonly onImageError = handleProductImageError;

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

  readonly categoryOptions = computed<SelectOption[]>(() => [
    { value: '', label: '-- Chọn danh mục --' },
    ...this.categoryList().map((c) => ({ value: String(c.id), label: c.name })),
  ]);

  readonly brandOptions = computed<SelectOption[]>(() => [
    { value: '', label: '-- Chọn thương hiệu --' },
    ...this.brandList().map((b) => ({ value: String(b.id), label: b.name })),
  ]);

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

  onBrandSelectChange(val: string | number): void {
    const brandId = val ? Number(val) : null;
    this.brandId.set(brandId);
  }

  async onCategorySelectChange(val: string | number): Promise<void> {
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
      `Bạn có chắc chắn muốn xóa biến thể "${variant.sku}"? Thao tác này sẽ bị chặn nếu SKU đã phát sinh đơn hàng hoặc tồn kho.`,
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
        return 'px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20';
      case 'DRAFT':
        return 'px-2 py-0.5 rounded text-xs font-bold bg-surface-alt text-muted border border-line';
      case 'PAUSED':
        return 'px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30';
      case 'DISCONTINUED':
        return 'px-2 py-0.5 rounded text-xs font-bold bg-destructive/10 text-destructive border border-destructive/30';
    }
  }

  getAvailableBranchTooltip(): string {
    const detail = this.detailData();
    if (!detail || !detail.variants) {
      return 'Tồn khả dụng toàn hệ thống';
    }
    const branchMap = new Map<string, number>();
    for (const v of detail.variants) {
      if (v.stockQuants) {
        for (const q of v.stockQuants) {
          const bName = q.branchName || `Chi nhánh ${q.branchId}`;
          branchMap.set(bName, (branchMap.get(bName) ?? 0) + (q.available ?? 0));
        }
      }
    }
    if (branchMap.size === 0) {
      return 'Tồn khả dụng: 0';
    }
    const parts: string[] = [];
    branchMap.forEach((qty, name) => {
      parts.push(`${name}: ${qty}`);
    });
    return `Phân bổ khả dụng: ${parts.join(', ')}`;
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
