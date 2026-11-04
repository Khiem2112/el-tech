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
import {
  AdminProductTemplateService,
  CreateProductTemplatePayload,
  CreateProductVariantPayload,
  ProductLifecycle,
  ProductTemplateDetail,
  ProductVariantItem,
  UpdateProductTemplatePayload,
  UpdateProductVariantPayload,
} from './services/admin-product-template.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

type VariantSpecPair = {
  key: string;
  value: string;
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
    LifecycleTransitionDialogComponent,
  ],
  template: `
    <div class="space-y-0 text-sm text-foreground">
      <div class="h-9 bg-surface-alt border-b border-line px-4 lg:px-6 flex items-center justify-between text-xs flex-shrink-0">
        <nav class="flex items-center gap-1.5 text-muted">
          <a routerLink="/admin/catalog/templates" class="hover:text-primary transition-colors">Mẫu sản phẩm</a>
          <span>/</span>
          <span class="font-semibold text-foreground">{{ isNew() ? 'Thêm mới' : templateName() }}</span>
        </nav>
      </div>

      <header class="bg-surface border-b border-line px-4 lg:px-6 py-3 flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
        <div class="flex items-center gap-2.5">
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
        </div>

        @if (!isNew()) {
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="openTransitionModal()"
              [class]="getLifecycleBadgeClass(lifecycleState()) + ' hover:opacity-85 transition-opacity cursor-pointer inline-flex items-center gap-1.5 py-1 px-3 text-xs'"
              title="Nhấp để thay đổi trạng thái vòng đời"
            >
              <span class="font-normal opacity-75">Trạng thái:</span>
              <span class="font-bold">{{ getLifecycleLabel(lifecycleState()) }}</span>
              <svg class="w-3 h-3 opacity-60 ml-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        }
      </header>

      <div class="bg-surface border-b border-line px-4 lg:px-6 py-4 flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-md bg-surface-alt border border-line p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
            @if (firstCoverMedia()) {
              <img
                src="/images/products/placeholder.webp"
                [src]="firstCoverMedia() || '/images/products/placeholder.webp'"
                [alt]="templateName() || 'Mẫu sản phẩm'"
                class="w-full h-full object-contain"
                (error)="onImageError($event)"
              />
            } @else {
              <span class="text-xs text-muted">NO IMG</span>
            }
          </div>

          <div>
            <h1 class="text-lg lg:text-xl font-bold tracking-tight text-foreground">
              {{ isNew() ? 'Tạo Mới Mẫu Sản Phẩm' : templateName() }}
            </h1>
            @if (!isNew() && (modelCode() || chipsetFamily())) {
              <div class="text-xs text-muted mt-0.5 flex items-center gap-2 flex-wrap">
                @if (modelCode()) {
                  <span>Model: <strong class="text-foreground">{{ modelCode() }}</strong></span>
                }
                @if (modelCode() && chipsetFamily()) {
                  <span class="text-muted/60">•</span>
                }
                @if (chipsetFamily()) {
                  <span>Kiến trúc: <strong class="text-foreground">{{ chipsetFamily() }}</strong></span>
                }
              </div>
            }
          </div>
        </div>

        @if (!isNew() && detailData(); as tpl) {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              type="button"
              (click)="onVariantsTabClick()"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Nhấp để xem danh sách biến thể của mẫu sản phẩm"
            >
              <div class="text-base font-bold text-primary tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.skuCount ?? tpl.variants.length }}
              </div>
              <div class="text-xs text-muted font-medium">Biến thể sản phẩm</div>
            </button>

            <a
              [routerLink]="['/admin/inventory/balances']"
              [queryParams]="{ search: tpl.name }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Nhấp để kiểm tra tồn kho thực tế tại Showroom EL-TECH"
            >
              <div class="text-base font-bold text-foreground tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.totalOnHand ?? 0 }}
              </div>
              <div class="text-xs text-muted font-medium">Tồn thực tế</div>
            </a>

            <a
              [routerLink]="['/admin/inventory/balances']"
              [queryParams]="{ search: tpl.name, stockStatus: 'IN_STOCK' }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Tồn khả dụng tại Showroom EL-TECH"
            >
              <div class="text-base font-bold text-emerald-600 tabular-nums group-hover:scale-105 transition-transform">
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
              <div class="text-base font-bold text-muted tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.stockMoveCount ?? 0 }}
              </div>
              <div class="text-xs text-muted font-medium">Biến động kho</div>
            </a>

            <a
              [routerLink]="['/admin/procurement/purchase-orders']"
              [queryParams]="{ search: tpl.name }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Nhấp để xem lịch sử các đơn mua linh kiện chứa sản phẩm này"
            >
              <div class="text-base font-bold text-muted tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.poCount ?? 0 }}
              </div>
              <div class="text-xs text-muted font-medium">Lịch sử đơn mua</div>
            </a>

            <a
              [routerLink]="['/admin/orders']"
              [queryParams]="{ search: tpl.name }"
              class="p-2.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
              title="Nhấp để xem các đơn hàng khách hàng đã đặt có chứa sản phẩm này"
            >
              <div class="text-base font-bold text-emerald-600 tabular-nums group-hover:scale-105 transition-transform">
                {{ tpl.smartMetrics?.orderCount ?? 0 }}
              </div>
              <div class="text-xs text-muted font-medium">Lịch sử bán hàng</div>
            </a>
          </div>
        }
      </div>

      <!-- Tab Navigation Bar -->
      <div class="border-b border-line px-4 lg:px-6 bg-surface flex items-center gap-6">
        <button
          type="button"
          (click)="activeTab.set('general')"
          class="py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer"
          [class.border-primary]="activeTab() === 'general'"
          [class.text-primary]="activeTab() === 'general'"
          [class.border-transparent]="activeTab() !== 'general'"
          [class.text-muted]="activeTab() !== 'general'"
          [class.hover:text-foreground]="activeTab() !== 'general'"
        >
          Thông Tin Chung
        </button>
        <button
          type="button"
          [disabled]="isNew()"
          (click)="onVariantsTabClick()"
          class="py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors inline-flex items-center gap-2"
          [class.border-primary]="activeTab() === 'variants'"
          [class.text-primary]="activeTab() === 'variants'"
          [class.border-transparent]="activeTab() !== 'variants'"
          [class.text-muted]="activeTab() !== 'variants'"
          [class.hover:text-foreground]="activeTab() !== 'variants' && !isNew()"
          [class.cursor-pointer]="!isNew()"
          [class.opacity-50]="isNew()"
          [class.cursor-not-allowed]="isNew()"
          [title]="isNew() ? 'Vui lòng lưu thông tin chung trước khi quản lý biến thể' : 'Cấu hình chi tiết biến thể'"
        >
          <span>Cấu Hình Chi Tiết (Biến Thể)</span>
          @if (!isNew()) {
            <span
              class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              [class.bg-primary/20]="activeTab() === 'variants'"
              [class.text-primary]="activeTab() === 'variants'"
              [class.bg-surface-alt]="activeTab() !== 'variants'"
              [class.text-muted]="activeTab() !== 'variants'"
            >
              {{ variants().length }}
            </span>
          }
        </button>
      </div>

      <!-- Tab 1: Thông Tin Chung (General Info, Media, Dynamic Specs) -->
      <div [class.hidden]="activeTab() !== 'general'" class="w-full p-4 lg:p-6 space-y-6">
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
                  Thông Tin Cơ Bản Mẫu Sản Phẩm
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
                    (input)="onNameInput($event); clearFieldError('templateName')"
                    placeholder="VD: ASUS ROG Strix GeForce RTX 5090"
                    class="w-full px-3 py-2 bg-surface border rounded text-foreground focus:outline-none font-semibold text-sm transition-colors"
                    [class.border-destructive]="fieldErrors()['templateName']"
                    [class.focus:border-destructive]="fieldErrors()['templateName']"
                    [class.border-line]="!fieldErrors()['templateName']"
                    [class.focus:border-primary]="!fieldErrors()['templateName']"
                  />
                  @if (fieldErrors()['templateName']) {
                    <p class="text-xs text-destructive mt-1 font-medium">{{ fieldErrors()['templateName'] }}</p>
                  }
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
                      (input)="slug.set($any($event.target).value); clearFieldError('slug')"
                      placeholder="asus-rog-strix-geforce-rtx-5090"
                      class="w-full px-3 py-2 bg-surface border rounded text-foreground focus:outline-none text-sm font-medium transition-colors"
                      [class.border-destructive]="fieldErrors()['slug']"
                      [class.focus:border-destructive]="fieldErrors()['slug']"
                      [class.border-line]="!fieldErrors()['slug']"
                      [class.focus:border-primary]="!fieldErrors()['slug']"
                    />
                    @if (fieldErrors()['slug']) {
                      <p class="text-xs text-destructive mt-1 font-medium">{{ fieldErrors()['slug'] }}</p>
                    }
                  </div>

                  <div>
                    <label class="block font-semibold text-muted text-xs uppercase mb-1">
                      Thương Hiệu <span class="text-destructive">*</span>
                    </label>
                    <app-select
                      [options]="brandOptions()"
                      [value]="brandId() !== null ? String(brandId()) : ''"
                      (valueChange)="onBrandSelectChange($event); clearFieldError('brandId')"
                      [class]="fieldErrors()['brandId'] ? 'border-destructive ring-1 ring-destructive' : ''"
                      placeholder="-- Chọn thương hiệu --"
                    />
                    @if (fieldErrors()['brandId']) {
                      <p class="text-xs text-destructive mt-1 font-medium">{{ fieldErrors()['brandId'] }}</p>
                    }
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
                      (valueChange)="onCategorySelectChange($event); clearFieldError('categoryId')"
                      [class]="fieldErrors()['categoryId'] ? 'border-destructive ring-1 ring-destructive' : ''"
                      placeholder="-- Chọn danh mục --"
                    />
                    @if (fieldErrors()['categoryId']) {
                      <p class="text-xs text-destructive mt-1 font-medium">{{ fieldErrors()['categoryId'] }}</p>
                    }
                  </div>

                  <div>
                    <label class="block font-semibold text-muted text-xs uppercase mb-1">
                      Model <span class="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      [value]="modelCode()"
                      (input)="modelCode.set($any($event.target).value); clearFieldError('modelCode')"
                      placeholder="ROG-STRIX-RTX5090"
                      class="w-full px-3 py-2 bg-surface border rounded text-foreground focus:outline-none text-sm font-medium transition-colors"
                      [class.border-destructive]="fieldErrors()['modelCode']"
                      [class.focus:border-destructive]="fieldErrors()['modelCode']"
                      [class.border-line]="!fieldErrors()['modelCode']"
                      [class.focus:border-primary]="!fieldErrors()['modelCode']"
                    />
                    @if (fieldErrors()['modelCode']) {
                      <p class="text-xs text-destructive mt-1 font-medium">{{ fieldErrors()['modelCode'] }}</p>
                    }
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
                <label class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-line hover:border-primary/60 rounded-lg bg-surface-alt/40 cursor-pointer transition-colors group">
                  <div class="flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Tải ảnh lên từ máy tính</span>
                  </div>
                  <p class="text-[11px] text-muted mt-1">Định dạng hỗ trợ: JPG, PNG, WEBP, GIF (Tối đa 5MB mỗi ảnh)</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    (change)="onFileSelected($event)"
                    class="hidden"
                  />
                </label>

                @if (mediaList().length === 0) {
                  <div class="p-4 bg-surface-alt border border-dashed border-line rounded text-center text-xs text-muted">
                    Chưa có ảnh nào được thêm. Vui lòng tải ảnh từ máy tính bằng khung phía trên.
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
                          <span class="absolute top-1 left-1 bg-primary text-primary-foreground font-extrabold text-[10px] px-1.5 py-0.5 rounded">
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
      </div>

      <!-- Tab 2: Cấu Hình Chi Tiết (Biến Thể SKU) - 2-Column Master-Detail Layout -->
      <div [class.hidden]="activeTab() !== 'variants'" class="w-full p-4 lg:p-6 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Column 1: Master List of SKU Variants -->
          <div class="lg:col-span-5 xl:col-span-4 space-y-4">
            <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
              <div class="p-4 border-b border-line space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
                      Danh Sách Biến Thể SKU
                    </h2>
                    <p class="text-xs text-muted">
                      {{ filteredVariants().length }} / {{ variants().length }} biến thể
                    </p>
                  </div>
                  @if (!isCreatingNewVariant()) {
                    <button
                      type="button"
                      appButton
                      variant="primary"
                      size="sm"
                      (click)="startCreateVariant()"
                      class="inline-flex items-center gap-1.5"
                      title="Thêm biến thể mới"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>+ Thêm SKU</span>
                    </button>
                  }
                </div>

                <div class="relative">
                  <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    [value]="variantSearchQuery()"
                    (input)="variantSearchQuery.set($any($event.target).value)"
                    placeholder="Tìm SKU, barcode, nhãn..."
                    class="w-full pl-9 pr-3 py-1.5 bg-surface-alt border border-line rounded text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div class="p-3 space-y-2 max-h-[750px] overflow-y-auto">
                @if (filteredVariants().length === 0) {
                  <div class="p-6 text-center text-xs text-muted space-y-2">
                    @if (variants().length === 0) {
                      <p>Mẫu sản phẩm này chưa có biến thể SKU nào.</p>
                      @if (!isCreatingNewVariant()) {
                        <button
                          type="button"
                          appButton
                          variant="outline"
                          size="sm"
                          (click)="startCreateVariant()"
                        >
                          + Thêm biến thể đầu tiên
                        </button>
                      }
                    } @else {
                      <p>Không tìm thấy biến thể phù hợp với từ khóa.</p>
                    }
                  </div>
                } @else {
                  @for (v of filteredVariants(); track v.id) {
                    <div
                      (click)="selectVariant(v)"
                      class="p-3 rounded-lg border transition-all cursor-pointer relative"
                      [class.border-primary]="!isCreatingNewVariant() && selectedVariantId() === v.id"
                      [class.bg-primary/5]="!isCreatingNewVariant() && selectedVariantId() === v.id"
                      [class.ring-1]="!isCreatingNewVariant() && selectedVariantId() === v.id"
                      [class.ring-primary/40]="!isCreatingNewVariant() && selectedVariantId() === v.id"
                      [class.border-line]="isCreatingNewVariant() || selectedVariantId() !== v.id"
                      [class.bg-surface]="isCreatingNewVariant() || selectedVariantId() !== v.id"
                      [class.hover:bg-surface-alt/70]="isCreatingNewVariant() || selectedVariantId() !== v.id"
                    >
                      @if (!isCreatingNewVariant() && selectedVariantId() === v.id) {
                        <div class="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r"></div>
                      }
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <span class="font-bold text-xs tabular text-foreground tracking-wide block">
                            {{ v.sku }}
                          </span>
                          <span class="text-xs text-muted line-clamp-1">
                            {{ v.variationLabel || 'Phiên bản mặc định' }}
                          </span>
                        </div>
                        <span [class]="getLifecycleBadgeClass(v.lifecycleState)">
                          {{ getLifecycleLabel(v.lifecycleState) }}
                        </span>
                      </div>

                      <div class="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-line/50 text-xs">
                        <span class="font-bold tabular tabular-nums text-foreground">
                          {{ formatCurrency(v.sellingPrice) }}
                        </span>
                        <span
                          class="font-semibold tabular tabular-nums"
                          [class.text-emerald-600]="v.totalAvailable > 0"
                          [class.text-destructive]="v.totalAvailable <= 0"
                        >
                          {{ v.totalAvailable }} khả dụng
                        </span>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          </div>

          <!-- Column 2: Detail Form for Selected or New Variant -->
          <div class="lg:col-span-7 xl:col-span-8 space-y-5">
            @if (isCreatingNewVariant() || selectedVariant(); as currentV) {
              <div class="bg-surface border border-line rounded-lg shadow-xs p-5 space-y-5">
                <div class="flex items-center justify-between border-b border-line pb-3 flex-wrap gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-sm font-bold uppercase tracking-wider text-foreground">
                        {{ isCreatingNewVariant() ? 'Thêm Mới Biến Thể SKU' : 'Chi Tiết Biến Thể: ' + (vFormSku() || 'SKU') }}
                      </h2>
                      @if (!isCreatingNewVariant()) {
                        <span [class]="getLifecycleBadgeClass(vFormLifecycleState())">
                          {{ getLifecycleLabel(vFormLifecycleState()) }}
                        </span>
                      }
                    </div>
                    <p class="text-xs text-muted mt-0.5">
                      {{ isCreatingNewVariant() ? 'Điền thông tin thương mại và thông số kỹ thuật riêng cho SKU mới' : 'Chỉnh sửa thông số thương mại, tồn kho và cấu hình riêng của SKU' }}
                    </p>
                  </div>

                  <div class="flex items-center gap-2">
                    @if (!isCreatingNewVariant()) {
                      <button
                        type="button"
                        appButton
                        variant="outline"
                        size="sm"
                        (click)="deleteCurrentVariant()"
                        class="text-destructive hover:bg-destructive/10"
                        title="Xóa biến thể này"
                      >
                        Xóa SKU
                      </button>
                    }
                  </div>
                </div>

                @if (variantFormError()) {
                  <div class="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
                    {{ variantFormError() }}
                  </div>
                }

                <div class="space-y-4">
                  <div class="border-b border-line/60 pb-1">
                    <span class="font-bold text-foreground text-xs uppercase tracking-wider">Thông Tin Thương Mại & Nhận Diện</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-semibold text-muted text-xs uppercase mb-1">
                        Mã SKU <span class="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        [value]="vFormSku()"
                        (input)="onSkuInput($event); clearVariantFieldError('sku')"
                        placeholder="VD: VGA-RTX5090-O24G-BLACK"
                        class="w-full px-3 py-2 bg-surface border rounded text-foreground font-bold tabular focus:outline-none text-sm uppercase transition-colors"
                        [class.border-destructive]="variantFieldErrors()['sku']"
                        [class.focus:border-destructive]="variantFieldErrors()['sku']"
                        [class.border-line]="!variantFieldErrors()['sku']"
                        [class.focus:border-primary]="!variantFieldErrors()['sku']"
                      />
                      @if (variantFieldErrors()['sku']) {
                        <p class="text-xs text-destructive mt-1 font-medium">{{ variantFieldErrors()['sku'] }}</p>
                      }
                    </div>

                    <div>
                      <label class="block font-semibold text-muted text-xs uppercase mb-1">
                        Mã Vạch Barcode
                      </label>
                      <input
                        type="text"
                        [value]="vFormBarcode()"
                        (input)="vFormBarcode.set($any($event.target).value)"
                        placeholder="VD: 4711081992011"
                        class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-medium tabular focus:outline-none focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-semibold text-muted text-xs uppercase mb-1">
                        Nhãn Phân Loại / Phiên Bản
                      </label>
                      <input
                        type="text"
                        [value]="vFormVariationLabel()"
                        (input)="vFormVariationLabel.set($any($event.target).value)"
                        placeholder="VD: Bản OC Edition - Màu Đen"
                        class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-semibold focus:outline-none focus:border-primary text-sm"
                      />
                    </div>

                    <div>
                      <label class="block font-semibold text-muted text-xs uppercase mb-1">
                        Giá Bán Niêm Yết (VND) <span class="text-destructive">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="1"
                        [value]="vFormSellingPrice()"
                        (input)="vFormSellingPrice.set(+$any($event.target).value); clearVariantFieldError('sellingPrice')"
                        placeholder="59990000"
                        class="w-full px-3 py-2 bg-surface border rounded text-foreground font-bold tabular focus:outline-none text-sm transition-colors"
                        [class.border-destructive]="variantFieldErrors()['sellingPrice']"
                        [class.focus:border-destructive]="variantFieldErrors()['sellingPrice']"
                        [class.border-line]="!variantFieldErrors()['sellingPrice']"
                        [class.focus:border-primary]="!variantFieldErrors()['sellingPrice']"
                      />
                      @if (variantFieldErrors()['sellingPrice']) {
                        <p class="text-xs text-destructive mt-1 font-medium">{{ variantFieldErrors()['sellingPrice'] }}</p>
                      }
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-semibold text-muted text-xs uppercase mb-1">
                        Trạng Thái Vòng Đời
                      </label>
                      <app-select
                        [options]="variantLifecycleOptions"
                        [value]="vFormLifecycleState()"
                        (valueChange)="onVariantLifecycleChange($event)"
                        placeholder="Chọn trạng thái"
                      />
                    </div>

                    <div class="flex flex-col justify-end gap-2 pt-1">
                      <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          [checked]="vFormSerialRequired()"
                          (change)="vFormSerialRequired.set($any($event.target).checked)"
                          class="rounded text-primary focus:ring-0 w-4 h-4 bg-surface border-line"
                        />
                        <span class="font-medium text-foreground text-xs">Quản lý theo dõi sê-ri từng chiếc (Serial Required)</span>
                      </label>

                      <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          [checked]="vFormIsActive()"
                          (change)="vFormIsActive.set($any($event.target).checked)"
                          class="rounded text-primary focus:ring-0 w-4 h-4 bg-surface border-line"
                        />
                        <span class="font-medium text-foreground text-xs">Kích hoạt hiển thị kinh doanh (isActive)</span>
                      </label>
                    </div>
                  </div>
                </div>

                @if (!isCreatingNewVariant() && selectedVariant(); as selV) {
                  <div class="space-y-2 pt-2 border-t border-line">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-foreground text-xs uppercase tracking-wider">Tồn Kho Tại Showroom</span>
                      <a
                        [routerLink]="['/admin/inventory/balances']"
                        [queryParams]="{ search: selV.sku }"
                        class="text-xs text-primary hover:underline font-medium"
                      >
                        Xem chi tiết số dư kho
                      </a>
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                      <div class="p-3 bg-surface-alt rounded border border-line text-center">
                        <div class="text-lg font-bold text-foreground tabular tabular-nums">{{ selV.totalOnHand }}</div>
                        <div class="text-[11px] text-muted font-medium">Tồn thực tế</div>
                      </div>
                      <div class="p-3 bg-surface-alt rounded border border-line text-center">
                        <div class="text-lg font-bold text-muted tabular tabular-nums">{{ selV.totalReserved }}</div>
                        <div class="text-[11px] text-muted font-medium">Đang giữ</div>
                      </div>
                      <div class="p-3 bg-surface-alt rounded border border-line text-center">
                        <div
                          class="text-lg font-bold tabular tabular-nums"
                          [class.text-emerald-600]="selV.totalAvailable > 0"
                          [class.text-destructive]="selV.totalAvailable <= 0"
                        >
                          {{ selV.totalAvailable }}
                        </div>
                        <div class="text-[11px] text-muted font-medium">Khả dụng</div>
                      </div>
                    </div>
                  </div>
                }

                <!-- VARIANT SPEC EDITING SECTION -->
                <div class="space-y-3 pt-2 border-t border-line">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 class="font-bold text-foreground text-xs uppercase tracking-wider">
                        Thông Số Kỹ Thuật Riêng Của Biến Thể (Variant Spec)
                      </h3>
                      <p class="text-xs text-muted">
                        Các thuộc tính đặc thù cho riêng SKU này (màu sắc, dung lượng, xung nhịp, phụ kiện...)
                      </p>
                    </div>

                    <button
                      type="button"
                      appButton
                      variant="outline"
                      size="sm"
                      (click)="addSpecPair()"
                      class="inline-flex items-center gap-1 text-xs"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>+ Thêm thông số riêng</span>
                    </button>
                  </div>

                  <!-- Quick preset suggestions -->
                  <div class="flex items-center gap-1.5 flex-wrap text-xs">
                    <span class="text-muted text-[11px] font-medium mr-1">Gợi ý nhanh:</span>
                    <button
                      type="button"
                      (click)="addPresetSpec('Màu sắc', 'Màu đen')"
                      class="px-2 py-0.5 rounded bg-surface-alt hover:bg-surface border border-line text-foreground text-xs cursor-pointer transition-colors"
                    >
                      + Màu sắc
                    </button>
                    <button
                      type="button"
                      (click)="addPresetSpec('Dung lượng', '16GB')"
                      class="px-2 py-0.5 rounded bg-surface-alt hover:bg-surface border border-line text-foreground text-xs cursor-pointer transition-colors"
                    >
                      + Dung lượng
                    </button>
                    <button
                      type="button"
                      (click)="addPresetSpec('Xung nhịp', 'Base 2235 MHz / Boost 2520 MHz')"
                      class="px-2 py-0.5 rounded bg-surface-alt hover:bg-surface border border-line text-foreground text-xs cursor-pointer transition-colors"
                    >
                      + Xung nhịp
                    </button>
                    <button
                      type="button"
                      (click)="addPresetSpec('Phiên bản', 'OC Edition')"
                      class="px-2 py-0.5 rounded bg-surface-alt hover:bg-surface border border-line text-foreground text-xs cursor-pointer transition-colors"
                    >
                      + Phiên bản
                    </button>
                    <button
                      type="button"
                      (click)="addPresetSpec('Phụ kiện', 'Cáp nguồn 16-pin, giá đỡ VGA')"
                      class="px-2 py-0.5 rounded bg-surface-alt hover:bg-surface border border-line text-foreground text-xs cursor-pointer transition-colors"
                    >
                      + Phụ kiện
                    </button>
                  </div>

                  <!-- Key-Value pairs list -->
                  <div class="space-y-2">
                    @if (vFormSpecPairs().length === 0) {
                      <div class="p-4 bg-surface-alt border border-dashed border-line rounded text-center text-xs text-muted">
                        Chưa có thông số kỹ thuật riêng cho SKU này. Nhấn vào các gợi ý phía trên hoặc nút "+ Thêm thông số riêng" để thêm.
                      </div>
                    } @else {
                      <div class="space-y-2">
                        @for (pair of vFormSpecPairs(); track $index; let idx = $index) {
                          <div class="flex items-center gap-2">
                            <div class="w-1/3">
                              <input
                                type="text"
                                [value]="pair.key"
                                (input)="updateSpecKey(idx, $any($event.target).value)"
                                placeholder="Tên thuộc tính (VD: Màu sắc)"
                                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
                              />
                            </div>
                            <div class="flex-1">
                              <input
                                type="text"
                                [value]="pair.value"
                                (input)="updateSpecValue(idx, $any($event.target).value)"
                                placeholder="Giá trị (VD: Đen nhám)"
                                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-xs text-foreground focus:outline-none focus:border-primary"
                              />
                            </div>
                            <button
                              type="button"
                              (click)="removeSpecPair(idx)"
                              class="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                              title="Xóa thuộc tính này"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-line">
                  <button
                    type="button"
                    appButton
                    variant="primary"
                    size="sm"
                    [disabled]="isSavingVariant()"
                    (click)="saveVariant()"
                    class="disabled:opacity-50"
                  >
                    {{ isSavingVariant() ? 'Đang lưu...' : (isCreatingNewVariant() ? 'Tạo Biến Thể' : 'Lưu Thay Đổi Biến Thể') }}
                  </button>
                </div>
              </div>
            } @else {
              <div class="p-12 bg-surface border border-line rounded-lg text-center space-y-3">
                <div class="text-sm font-semibold text-foreground">Chưa chọn biến thể</div>
                <p class="text-xs text-muted max-w-sm mx-auto">
                  Vui lòng chọn một biến thể từ danh sách bên trái để xem và chỉnh sửa thông số chi tiết, hoặc tạo mới biến thể.
                </p>
                <button
                  type="button"
                  appButton
                  variant="primary"
                  size="sm"
                  (click)="startCreateVariant()"
                >
                  + Thêm biến thể mới
                </button>
              </div>
            }
          </div>
        </div>
      </div>

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
  readonly fieldErrors = signal<Record<string, string>>({});

  readonly activeTab = signal<'general' | 'variants'>('general');

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

  readonly isTransitionModalOpen = signal<boolean>(false);

  readonly selectedVariantId = signal<number | null>(null);
  readonly isCreatingNewVariant = signal<boolean>(false);
  readonly variantSearchQuery = signal<string>('');
  readonly isSavingVariant = signal<boolean>(false);
  readonly variantFormError = signal<string | null>(null);
  readonly variantFieldErrors = signal<Record<string, string>>({});

  readonly vFormSku = signal<string>('');
  readonly vFormBarcode = signal<string>('');
  readonly vFormVariationLabel = signal<string>('');
  readonly vFormSellingPrice = signal<number>(0);
  readonly vFormLifecycleState = signal<ProductLifecycle>('DRAFT');
  readonly vFormSerialRequired = signal<boolean>(false);
  readonly vFormIsActive = signal<boolean>(true);
  readonly vFormSpecPairs = signal<VariantSpecPair[]>([]);

  clearFieldError(field: string): void {
    this.fieldErrors.update((cur) => {
      if (!cur[field]) return cur;
      const next = { ...cur };
      delete next[field];
      return next;
    });
  }

  clearVariantFieldError(field: string): void {
    this.variantFieldErrors.update((cur) => {
      if (!cur[field]) return cur;
      const next = { ...cur };
      delete next[field];
      return next;
    });
  }

  onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = inputEl.files;
    if (!files || files.length === 0) {
      return;
    }

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        this.showToast(`Tệp "${file.name}" không phải định dạng hình ảnh hợp lệ`, 'error');
        continue;
      }
      if (file.size === 0) {
        this.showToast(`Tệp "${file.name}" rỗng, vui lòng chọn hình ảnh khác`, 'error');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showToast(`Tệp "${file.name}" vượt quá dung lượng tối đa 5MB`, 'error');
        continue;
      }
      validFiles.push(file);
    }

    for (const file of validFiles) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === 'string' && result) {
          this.mediaList.update((list) => [...list, result]);
        }
      };
      reader.onerror = () => {
        this.showToast(`Lỗi khi đọc tệp "${file.name}"`, 'error');
      };
      reader.readAsDataURL(file);
    }

    inputEl.value = '';
  }

  readonly variantLifecycleOptions: SelectOption[] = [
    { value: 'DRAFT', label: 'Bản thảo nội bộ' },
    { value: 'ACTIVE', label: 'Đang kinh doanh' },
    { value: 'PAUSED', label: 'Tạm dừng kinh doanh' },
    { value: 'DISCONTINUED', label: 'Ngừng kinh doanh' },
  ];

  readonly toasts = signal<ToastNotification[]>([]);
  private toastIdCounter = 0;

  readonly variants = computed<ProductVariantItem[]>(() => this.detailData()?.variants ?? []);

  readonly filteredVariants = computed<ProductVariantItem[]>(() => {
    const list = this.variants();
    const query = this.variantSearchQuery().trim().toLowerCase();
    if (!query) {
      return list;
    }
    return list.filter((v) => {
      const matchSku = v.sku.toLowerCase().includes(query);
      const matchBarcode = v.barcode ? v.barcode.toLowerCase().includes(query) : false;
      const matchLabel = v.variationLabel ? v.variationLabel.toLowerCase().includes(query) : false;
      return matchSku || matchBarcode || matchLabel;
    });
  });

  readonly selectedVariant = computed<ProductVariantItem | null>(() => {
    const id = this.selectedVariantId();
    if (!id) {
      return null;
    }
    return this.variants().find((v) => v.id === id) ?? null;
  });

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

    const initialFragment = this.route.snapshot.fragment;
    if (initialFragment === 'section-variants') {
      this.activeTab.set('variants');
    }
    this.route.fragment.subscribe((frag) => {
      if (frag === 'section-variants') {
        this.activeTab.set('variants');
      }
    });

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

    const variantIdParam = this.route.snapshot.queryParams['variantId'];
    if (variantIdParam) {
      const vId = Number(variantIdParam);
      const vMatch = this.variants().find((v) => v.id === vId);
      if (vMatch) {
        this.selectVariant(vMatch);
      }
    }
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

      if (data.variants && data.variants.length > 0) {
        const currentId = this.selectedVariantId();
        const found = currentId ? data.variants.find((v) => v.id === currentId) : null;
        if (found) {
          this.selectVariant(found);
        } else if (!this.isCreatingNewVariant()) {
          this.selectVariant(data.variants[0]);
        }
      } else {
        if (!this.isCreatingNewVariant()) {
          this.startCreateVariant();
        }
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
    const errors: Record<string, string> = {};
    const name = this.templateName().trim();
    const slug = this.slug().trim();
    const brandId = this.brandId();
    const categoryId = this.categoryId();
    const model = this.modelCode().trim();

    if (!name) {
      errors['templateName'] = 'Tên sản phẩm không được để trống';
    }
    if (!slug) {
      errors['slug'] = 'Đường dẫn slug không được để trống';
    }
    if (!brandId) {
      errors['brandId'] = 'Vui lòng chọn thương hiệu';
    }
    if (!categoryId) {
      errors['categoryId'] = 'Vui lòng chọn danh mục';
    }
    if (!model) {
      errors['modelCode'] = 'Mã model không được để trống';
    }

    this.fieldErrors.set(errors);
    if (Object.keys(errors).length > 0 || brandId === null || categoryId === null) {
      this.formError.set('Vui lòng điền đầy đủ các thông tin bắt buộc được đánh dấu đỏ');
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

  onVariantsTabClick(): void {
    if (this.isNew()) {
      return;
    }
    this.activeTab.set('variants');
    if (!this.isCreatingNewVariant() && this.selectedVariantId() === null) {
      const list = this.variants();
      if (list.length > 0) {
        this.selectVariant(list[0]);
      } else {
        this.startCreateVariant();
      }
    }
  }

  selectVariant(v: ProductVariantItem): void {
    this.isCreatingNewVariant.set(false);
    this.selectedVariantId.set(v.id);
    this.vFormSku.set(v.sku);
    this.vFormBarcode.set(v.barcode ?? '');
    this.vFormVariationLabel.set(v.variationLabel ?? '');
    this.vFormSellingPrice.set(Number(v.sellingPrice) || 0);
    this.vFormLifecycleState.set(v.lifecycleState);
    this.vFormSerialRequired.set(v.serialRequired);
    this.vFormIsActive.set(v.isActive);

    const pairs: VariantSpecPair[] = [];
    if (v.variantSpec && typeof v.variantSpec === 'object') {
      for (const [key, val] of Object.entries(v.variantSpec)) {
        pairs.push({ key, value: val !== null && val !== undefined ? String(val) : '' });
      }
    }
    this.vFormSpecPairs.set(pairs);
    this.variantFormError.set(null);
    this.variantFieldErrors.set({});
  }

  startCreateVariant(): void {
    this.isCreatingNewVariant.set(true);
    this.selectedVariantId.set(null);
    this.vFormSku.set('');
    this.vFormBarcode.set('');
    this.vFormVariationLabel.set('');
    this.vFormSellingPrice.set(0);
    this.vFormLifecycleState.set('DRAFT');
    this.vFormSerialRequired.set(false);
    this.vFormIsActive.set(true);
    this.vFormSpecPairs.set([]);
    this.variantFormError.set(null);
    this.variantFieldErrors.set({});
  }

  cancelCreateVariant(): void {
    const list = this.variants();
    if (list.length > 0) {
      this.selectVariant(list[0]);
    } else {
      this.startCreateVariant();
    }
  }

  onSkuInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.vFormSku.set(val.toUpperCase());
  }

  onVariantLifecycleChange(val: string | number): void {
    this.vFormLifecycleState.set(val as ProductLifecycle);
  }

  addSpecPair(key = '', value = ''): void {
    this.vFormSpecPairs.update((pairs) => [...pairs, { key, value }]);
  }

  removeSpecPair(index: number): void {
    this.vFormSpecPairs.update((pairs) => pairs.filter((_, i) => i !== index));
  }

  updateSpecKey(index: number, key: string): void {
    this.vFormSpecPairs.update((pairs) =>
      pairs.map((p, i) => (i === index ? { ...p, key } : p)),
    );
  }

  updateSpecValue(index: number, value: string): void {
    this.vFormSpecPairs.update((pairs) =>
      pairs.map((p, i) => (i === index ? { ...p, value } : p)),
    );
  }

  addPresetSpec(key: string, defaultVal = ''): void {
    const existing = this.vFormSpecPairs().find((p) => p.key === key);
    if (!existing) {
      this.addSpecPair(key, defaultVal);
    }
  }

  async saveVariant(): Promise<void> {
    const errors: Record<string, string> = {};
    const trimmedSku = this.vFormSku().trim().toUpperCase();
    if (!trimmedSku) {
      errors['sku'] = 'Mã SKU không được để trống';
    }

    const price = Number(this.vFormSellingPrice());
    if (isNaN(price) || price <= 0) {
      errors['sellingPrice'] = 'Giá bán phải lớn hơn 0 VND';
    } else if (!Number.isInteger(price)) {
      errors['sellingPrice'] = 'Giá bán phải là số nguyên VND';
    }

    this.variantFieldErrors.set(errors);
    if (Object.keys(errors).length > 0) {
      this.variantFormError.set('Vui lòng kiểm tra và hoàn thiện các trường bắt buộc được đánh dấu đỏ');
      return;
    }

    const templateId = this.templateId();
    if (!templateId) {
      this.variantFormError.set('Không xác định được mẫu sản phẩm');
      return;
    }

    this.isSavingVariant.set(true);
    this.variantFormError.set(null);

    const specObj: Record<string, unknown> = {};
    for (const pair of this.vFormSpecPairs()) {
      const k = pair.key.trim();
      if (k) {
        specObj[k] = pair.value.trim();
      }
    }

    try {
      if (this.isCreatingNewVariant()) {
        const payload: CreateProductVariantPayload = {
          productTemplateId: templateId,
          sku: trimmedSku,
          barcode: this.vFormBarcode().trim() || null,
          variationLabel: this.vFormVariationLabel().trim() || null,
          sellingPrice: price,
          serialRequired: this.vFormSerialRequired(),
          lifecycleState: this.vFormLifecycleState(),
          isActive: this.vFormIsActive(),
          variantSpec: specObj,
        };
        const created = await this.templateService.createVariant(payload);
        this.showToast('Tạo mới biến thể SKU thành công', 'success');
        await this.loadExistingTemplate(templateId);
        const match = this.variants().find((v) => v.id === created.id || v.sku === trimmedSku);
        if (match) {
          this.selectVariant(match);
        } else if (this.variants().length > 0) {
          this.selectVariant(this.variants()[this.variants().length - 1]);
        }
      } else {
        const currentVariant = this.selectedVariant();
        if (!currentVariant) {
          throw new Error('Không tìm thấy thông tin biến thể cần cập nhật');
        }
        const payload: UpdateProductVariantPayload = {
          sku: trimmedSku,
          barcode: this.vFormBarcode().trim() || null,
          variationLabel: this.vFormVariationLabel().trim() || null,
          sellingPrice: price,
          serialRequired: this.vFormSerialRequired(),
          lifecycleState: this.vFormLifecycleState(),
          isActive: this.vFormIsActive(),
          variantSpec: specObj,
        };
        await this.templateService.updateVariant(currentVariant.id, payload);
        this.showToast('Lưu biến thể SKU thành công', 'success');
        await this.loadExistingTemplate(templateId);
        const match = this.variants().find((v) => v.id === currentVariant.id);
        if (match) {
          this.selectVariant(match);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu biến thể SKU';
      this.variantFormError.set(msg);
      this.showToast(msg, 'error');
    } finally {
      this.isSavingVariant.set(false);
    }
  }

  async deleteCurrentVariant(): Promise<void> {
    const v = this.selectedVariant();
    if (!v) {
      return;
    }
    const confirmed = confirm(
      `Bạn có chắc chắn muốn xóa biến thể "${v.sku}"? Thao tác này sẽ bị chặn nếu SKU đã phát sinh đơn hàng hoặc tồn kho.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await this.templateService.deleteVariant(v.id);
      this.showToast('Đã xóa biến thể SKU', 'success');
      await this.loadExistingTemplate(this.templateId());
      const remaining = this.variants();
      if (remaining.length > 0) {
        this.selectVariant(remaining[0]);
      } else {
        this.startCreateVariant();
      }
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

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    const id = ++this.toastIdCounter;
    this.toasts.update((current) => [...current, { id, message, type }]);
    setTimeout(() => this.removeToast(id), 5000);
  }

  removeToast(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
