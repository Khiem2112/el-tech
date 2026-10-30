import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductImagePipe } from '../../lib/product-image.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';
import { VndPipe } from '../../lib/vnd.pipe';
import { CatalogService, ProductDetail, ProductReviewItem } from './catalog.service';
import { CartService } from '../../services/cart.service';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';
import { ReviewModalComponent } from './review-modal.component';

type SpecRow = { label: string; value: string };

const SPEC_LABEL_MAP: Record<string, string> = {
  socket: 'Chuẩn chân cắm Socket',
  core_count: 'Số nhân xử lý',
  thread_count: 'Số luồng xử lý',
  base_clock: 'Xung nhịp cơ bản (GHz)',
  boost_clock: 'Xung nhịp tối đa (GHz)',
  tdp: 'Công suất tiêu thụ TDP (W)',
  integrated_gpu: 'Đồ họa tích hợp iGPU',
  cache_l3: 'Bộ nhớ đệm L3 (MB)',
  memory_type: 'Chuẩn bộ nhớ hỗ trợ',
  chipset: 'Chipset bo mạch hỗ trợ',
  form_factor: 'Kích thước Form Factor',
  vram: 'Dung lượng bộ nhớ VRAM',
  bus_width: 'Băng thông bộ nhớ (bit)',
  recommended_psu: 'Công suất nguồn đề xuất (W)',
  capacity: 'Dung lượng lưu trữ',
  read_speed: 'Tốc độ đọc tuần tự (MB/s)',
  write_speed: 'Tốc độ ghi tuần tự (MB/s)',
  wattage: 'Công suất định mức (W)',
  efficiency: 'Chứng nhận hiệu suất 80 Plus',
};

@Component({
  selector: 'app-product-detail-page',
  imports: [
    DatePipe,
    RouterLink,
    VndPipe,
    ProductImagePipe,
    ButtonDirective,
    BadgeDirective,
    AppIconModule,
    ReviewModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      @if (loading()) {
        <div class="grid gap-8 lg:grid-cols-12">
          <div class="lg:col-span-5 aspect-square animate-pulse rounded-xl bg-surface-alt border border-line"></div>
          <div class="lg:col-span-7 space-y-4">
            <div class="h-8 w-2/3 animate-pulse rounded-md bg-surface-alt"></div>
            <div class="h-24 animate-pulse rounded-lg bg-surface-alt"></div>
            <div class="h-48 animate-pulse rounded-lg bg-surface-alt"></div>
          </div>
        </div>
      } @else if (product(); as item) {
        <!-- Breadcrumbs Navigation -->
        <nav class="text-xs text-muted mb-6 flex items-center gap-1.5 flex-wrap">
          <a routerLink="/" class="hover:text-foreground">Trang chủ</a>
          <span class="text-border">/</span>
          <a routerLink="/san-pham" class="hover:text-foreground">Linh kiện PC</a>
          <span class="text-border">/</span>
          <a [routerLink]="['/san-pham']" [queryParams]="{ category: item.category.slug }" class="hover:text-foreground">{{ item.category.name }}</a>
          <span class="text-border">/</span>
          <span class="text-foreground font-bold truncate max-w-xs sm:max-w-md">{{ item.name }}</span>
        </nav>

        <div class="grid gap-8 lg:grid-cols-12">
          <!-- Left Column: Media Gallery (Col 5) -->
          <div class="lg:col-span-5 space-y-4">
            <div class="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface p-6 flex items-center justify-center shadow-sm">
              <span appBadge variant="primary" class="absolute top-4 left-4 text-xs font-bold">CHÍNH HÃNG 100%</span>
              <span appBadge variant="outline" class="absolute top-4 right-4 text-xs font-semibold bg-surface/90">BẢO HÀNH 36T</span>
              
              <img
                [src]="galleryImages()[selectedImageIndex()] | productImage"
                [alt]="item.name"
                class="max-h-full max-w-full object-contain transition-all duration-300"
                (error)="onImageError($event)"
              >
            </div>

            <!-- Multi-angle thumbnail strip -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              @for (img of galleryImages(); track $index) {
                <button
                  type="button"
                  (click)="selectedImageIndex.set($index)"
                  class="size-16 rounded-lg border p-1 bg-surface shrink-0 cursor-pointer transition-all overflow-hidden"
                  [class.border-primary]="selectedImageIndex() === $index"
                  [class.ring-2]="selectedImageIndex() === $index"
                  [class.ring-primary/20]="selectedImageIndex() === $index"
                  [class.border-line]="selectedImageIndex() !== $index"
                >
                  <img
                    [src]="img | productImage"
                    [alt]="item.name + ' - góc nhìn ' + ($index + 1)"
                    class="size-full object-contain"
                    (error)="onImageError($event)"
                  >
                </button>
              }
            </div>

            <!-- Trust Policy Box -->
            <div class="bg-surface-alt rounded-lg p-4 border border-line space-y-2.5 text-xs text-muted">
              <div class="flex items-center gap-2 font-bold text-foreground">
                <lucide-icon name="ShieldCheck" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                <span>Chính Sách Cam Kết Tại EL-TECH</span>
              </div>
              <div class="flex items-start gap-2">
                <lucide-icon name="Truck" class="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true"></lucide-icon>
                <p>Miễn phí giao hàng toàn quốc và bảo hiểm rơi vỡ linh kiện trong quá trình vận chuyển</p>
              </div>
              <div class="flex items-start gap-2">
                <lucide-icon name="Wrench" class="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true"></lucide-icon>
                <p>Hỗ trợ test stress FurMark / Cinebench ổn định trước khi đóng gói xuất kho</p>
              </div>
              <div class="flex items-start gap-2">
                <lucide-icon name="RotateCcw" class="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true"></lucide-icon>
                <p>Bảo hành điện tử theo Serial Number, đổi mới 1-đổi-1 trong 30 ngày nếu phát sinh lỗi NSX</p>
              </div>
            </div>
          </div>

          <!-- Right Column: Product Info & Buy Box (Col 7) -->
          <div class="lg:col-span-7 space-y-5">
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <span appBadge variant="outline" class="text-xs font-bold uppercase">{{ item.brand.name }}</span>
                <span class="text-xs text-muted">Model: {{ item.model }}</span>
              </div>
              <h1 class="mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight">{{ item.name }}</h1>
              
              <div class="mt-2.5 flex items-center gap-3 text-xs flex-wrap">
                <span class="font-bold text-warning">5/5 Sao ({{ reviews().length }} đánh giá từ khách hàng)</span>
                <span class="text-border">|</span>
                <span appBadge variant="success">Có thể đặt hàng ngay</span>
              </div>

              <!-- 3 Key Quick Spec Pills -->
              @if (quickSpecs().length > 0) {
                <div class="grid grid-cols-3 gap-2.5 pt-1">
                  @for (qs of quickSpecs(); track qs.label) {
                    <div class="p-2.5 rounded-lg border border-line bg-surface-alt">
                      <div class="text-xs uppercase font-bold text-muted truncate">{{ qs.label }}</div>
                      <div class="text-sm font-black text-foreground truncate mt-0.5">{{ qs.value }}</div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Price Highlight Box -->
            @if (selected(); as variant) {
              <div class="bg-surface-alt p-4 rounded-lg border border-line space-y-1.5">
                <div class="flex items-baseline gap-3 flex-wrap">
                  <span class="text-2xl sm:text-3xl font-black text-foreground tabular">{{ variant.sellingPrice | vnd }}</span>
                  <span class="text-xs text-muted">Mã SKU: <span class="font-bold tabular text-foreground">{{ variant.sku }}</span></span>
                </div>
                <p class="text-xs text-muted">Giá đã bao gồm thuế VAT. Tồn kho và giá bán sẽ được xác nhận lại khi bạn tạo báo giá ở bước checkout.</p>
              </div>
            }

            <!-- Case Clearance Alert Box -->
            @if (isCaseClearanceApplicable()) {
              <div class="rounded-lg border border-warning/40 bg-warning/10 p-3.5 space-y-1.5 text-xs text-foreground">
                <div class="flex items-center gap-2 font-bold text-warning">
                  <lucide-icon name="AlertTriangle" class="size-4 shrink-0 text-warning" aria-hidden="true"></lucide-icon>
                  <span>Lưu ý khoảng trống lắp đặt thùng máy (Case Clearance)</span>
                </div>
                <p class="text-muted leading-relaxed">
                  Sản phẩm có kích thước lớn (~336mm card VGA / Radiator 360mm). Yêu cầu vỏ case hỗ trợ chiều dài VGA tối thiểu 350mm hoặc khoang nóc hỗ trợ Radiator 360mm để đảm bảo không bị cấn quạt tản nhiệt.
                </p>
                <div class="flex items-center gap-1.5 text-xs font-semibold text-primary pt-0.5">
                  <lucide-icon name="Check" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Tương thích hoàn hảo với các mẫu case ATX Mid-Tower và Full-Tower tại EL-TECH</span>
                </div>
              </div>
            }

            <!-- Variant Selector -->
            <div>
              <label class="block text-xs font-bold text-foreground uppercase mb-2">Chọn phiên bản linh kiện</label>
              <div class="flex flex-wrap gap-2">
                @for (variant of item.variants; track variant.id) {
                  <button
                    class="rounded-md border px-3.5 py-2 text-xs font-bold transition-all text-left"
                    [class.border-primary]="selected()?.id === variant.id"
                    [class.bg-primary/10]="selected()?.id === variant.id"
                    [class.text-primary]="selected()?.id === variant.id"
                    [class.border-line]="selected()?.id !== variant.id"
                    [class.bg-surface]="selected()?.id !== variant.id"
                    [class.text-foreground]="selected()?.id !== variant.id"
                    type="button"
                    (click)="selected.set(variant)"
                  >
                    <div>{{ variant.variationLabel ?? variant.sku }}</div>
                    <div class="text-xs opacity-80 mt-0.5 tabular">{{ variant.sellingPrice | vnd }}</div>
                  </button>
                }
              </div>
            </div>

            <!-- Quantity & Actions -->
            <div class="space-y-4 pt-1">
              <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-foreground">Số lượng mua:</span>
                <div class="flex items-center border border-line rounded-md bg-surface overflow-hidden">
                  <button
                    type="button"
                    appButton
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 rounded-none border-0"
                    (click)="changeQty(-1)"
                    aria-label="Giảm số lượng"
                  >
                    <lucide-icon name="Minus" class="size-3.5" aria-hidden="true"></lucide-icon>
                  </button>
                  <span class="px-3 py-1 text-xs font-bold text-foreground min-w-[2.5rem] text-center tabular">{{ quantity() }}</span>
                  <button
                    type="button"
                    appButton
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 rounded-none border-0"
                    (click)="changeQty(1)"
                    aria-label="Tăng số lượng"
                  >
                    <lucide-icon name="Plus" class="size-3.5" aria-hidden="true"></lucide-icon>
                  </button>
                </div>
              </div>

              <div class="grid sm:grid-cols-3 gap-3">
                <button
                  appButton
                  variant="primary"
                  size="lg"
                  type="button"
                  [disabled]="adding()"
                  (click)="addToCart()"
                >
                  <lucide-icon name="ShoppingCart" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>{{ adding() ? 'Đang thêm…' : 'Thêm vào giỏ hàng' }}</span>
                </button>
                <button
                  appButton
                  variant="secondary"
                  size="lg"
                  type="button"
                  [disabled]="adding()"
                  (click)="buyNow()"
                >
                  <span>Mua ngay</span>
                  <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
                </button>
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="lg"
                  class="border-primary/50 text-primary hover:bg-primary/10"
                  (click)="openBomModal()"
                >
                  <lucide-icon name="Wrench" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>Thêm vào PC Builder</span>
                </button>
              </div>

              @if (addSuccess()) {
                <p class="text-xs font-bold text-primary bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-md">
                  Đã thêm sản phẩm vào giỏ hàng thành công.
                </p>
              }
              @if (addError()) {
                <p class="text-xs text-danger font-medium" role="alert">Không thể thêm sản phẩm. Vui lòng thử lại.</p>
              }
            </div>

            <!-- Store Branch Stock Status -->
            <div class="border-t border-line pt-4">
              <div class="p-3 rounded-lg border border-line bg-surface-alt flex items-center gap-2.5 text-xs text-foreground">
                <lucide-icon name="Store" class="size-4 text-primary shrink-0" aria-hidden="true"></lucide-icon>
                <div>
                  <span class="font-bold">Showroom EL-TECH:</span>
                  <span class="text-primary font-semibold ml-1">Sẵn hàng - Giao nhanh toàn quốc</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Technical Specification & Customer Reviews Tabs -->
        <div class="mt-12 border-t border-line pt-6">
          <div class="flex items-center gap-6 border-b border-line pb-3 text-xs sm:text-sm font-bold overflow-x-auto">
            <button
              type="button"
              (click)="activeTab.set('specs')"
              class="pb-2.5 whitespace-nowrap transition-colors"
              [class.border-b-2]="activeTab() === 'specs'"
              [class.border-primary]="activeTab() === 'specs'"
              [class.text-primary]="activeTab() === 'specs'"
              [class.text-muted]="activeTab() !== 'specs'"
            >
              Thông Số Kỹ Thuật Chi Tiết
            </button>
            <button
              type="button"
              (click)="activeTab.set('desc')"
              class="pb-2.5 whitespace-nowrap transition-colors"
              [class.border-b-2]="activeTab() === 'desc'"
              [class.border-primary]="activeTab() === 'desc'"
              [class.text-primary]="activeTab() === 'desc'"
              [class.text-muted]="activeTab() !== 'desc'"
            >
              Mô Tả Sản Phẩm
            </button>
            <button
              type="button"
              (click)="activeTab.set('reviews')"
              class="pb-2.5 whitespace-nowrap transition-colors"
              [class.border-b-2]="activeTab() === 'reviews'"
              [class.border-primary]="activeTab() === 'reviews'"
              [class.text-primary]="activeTab() === 'reviews'"
              [class.text-muted]="activeTab() !== 'reviews'"
            >
              Đánh Giá Từ Khách Hàng ({{ reviews().length }})
            </button>
            <button
              type="button"
              (click)="activeTab.set('policy')"
              class="pb-2.5 whitespace-nowrap transition-colors"
              [class.border-b-2]="activeTab() === 'policy'"
              [class.border-primary]="activeTab() === 'policy'"
              [class.text-primary]="activeTab() === 'policy'"
              [class.text-muted]="activeTab() !== 'policy'"
            >
              Chính Sách Bảo Hành & Đổi Trả
            </button>
          </div>

          <!-- Specs Content Tab (Structured Clean 2-Column Table) -->
          @if (activeTab() === 'specs') {
            <div class="py-5 max-w-4xl">
              <div class="bg-surface border border-line rounded-lg overflow-hidden shadow-sm">
                <div class="bg-surface-alt px-4 py-2.5 border-b border-line text-xs font-bold text-foreground uppercase">
                  BẢNG THÔNG SỐ KỸ THUẬT PHẦN CỨNG CHUẨN XÁC
                </div>
                @if (formattedSpecs().length === 0) {
                  <p class="p-4 text-xs text-muted">Thông số kỹ thuật chi tiết đang được cập nhật từ nhà phân phối.</p>
                } @else {
                  <table class="w-full text-xs text-left">
                    <tbody class="divide-y divide-border">
                      @for (row of formattedSpecs(); track row.label) {
                        <tr class="hover:bg-surface-alt/50 transition-colors">
                          <td class="px-4 py-2.5 font-semibold text-muted w-1/3">{{ row.label }}</td>
                          <td class="px-4 py-2.5 font-bold text-foreground tabular">{{ row.value }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            </div>
          }

          <!-- Description Content Tab -->
          @if (activeTab() === 'desc') {
            <div class="py-5 max-w-4xl text-sm leading-relaxed text-foreground space-y-3">
              @if (item.description) {
                <p>{{ item.description }}</p>
              } @else {
                <p>Sản phẩm {{ item.name }} chính hãng từ thương hiệu {{ item.brand.name }}, đáp ứng tiêu chuẩn phần cứng chất lượng cao và độ ổn định lâu dài.</p>
              }
            </div>
          }

          <!-- Reviews Content Tab -->
          @if (activeTab() === 'reviews') {
            <div class="py-5 max-w-4xl space-y-6">
              <!-- Star Rating Summary & Histogram -->
              <div class="grid sm:grid-cols-12 gap-6 p-5 rounded-xl border border-line bg-surface-alt">
                <div class="sm:col-span-4 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-line pb-4 sm:pb-0 sm:pr-4 text-center">
                  <div class="text-4xl font-black text-foreground">{{ ratingStats().average }}</div>
                  <div class="flex items-center gap-1 text-warning my-1.5">
                    @for (s of [1, 2, 3, 4, 5]; track s) {
                      <lucide-icon name="Star" class="size-4 fill-current"></lucide-icon>
                    }
                  </div>
                  <div class="text-xs text-muted">Dựa trên {{ ratingStats().total }} đánh giá đã mua hàng</div>
                </div>

                <div class="sm:col-span-8 space-y-2">
                  @for (row of ratingStats().histogram; track row.star) {
                    <div class="flex items-center gap-3 text-xs">
                      <span class="w-12 font-medium text-muted shrink-0">{{ row.star }} sao</span>
                      <div class="h-2 rounded-full bg-surface overflow-hidden flex-1 border border-line">
                        <div class="h-full bg-warning rounded-full transition-all duration-500" [style.width.%]="row.percentage"></div>
                      </div>
                      <span class="w-16 text-right tabular text-muted shrink-0">{{ row.count }} ({{ row.percentage }}%)</span>
                    </div>
                  }
                </div>
              </div>

              <div class="flex items-center justify-between flex-wrap gap-3 p-4 rounded-lg border border-line bg-surface-alt">
                <div>
                  <h3 class="text-sm font-bold text-foreground">Đánh giá thực tế từ khách hàng đã mua</h3>
                  <p class="text-xs text-muted">Đánh giá được kiểm định qua hóa đơn và Serial Number linh kiện (REV-004).</p>
                </div>
                <button
                  appButton
                  variant="primary"
                  size="sm"
                  type="button"
                  (click)="reviewModalOpen.set(true)"
                >
                  <lucide-icon name="Star" class="size-3.5" aria-hidden="true"></lucide-icon>
                  <span>Viết Đánh Giá</span>
                </button>
              </div>

              @if (reviews().length === 0) {
                <div class="rounded-lg border border-dashed border-line p-8 text-center bg-surface">
                  <p class="text-sm font-bold text-foreground">Chưa có đánh giá nào cho sản phẩm này</p>
                  <p class="mt-1 text-xs text-muted">Khách hàng đã hoàn tất đơn hàng có thể gửi đánh giá từ trang tra cứu đơn hàng hoặc bấm Viết Đánh Giá ở trên.</p>
                </div>
              } @else {
                <div class="divide-y divide-border rounded-lg border border-line bg-surface p-4">
                  @for (review of reviews(); track review.id) {
                    <div class="py-3 first:pt-0 last:pb-0">
                      <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-primary">Điểm đánh giá: {{ review.rating }}/5 Sao</span>
                        <span class="text-muted">{{ review.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                      <p class="mt-1.5 text-xs text-foreground">{{ review.text }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Policy Content Tab -->
          @if (activeTab() === 'policy') {
            <div class="py-5 max-w-4xl text-xs space-y-3 text-muted leading-relaxed">
              <div class="p-3.5 rounded-lg border border-line bg-surface-alt space-y-1">
                <span class="font-bold text-foreground block">Quy định bảo hành chính hãng</span>
                <p>Sản phẩm được bảo hành 36 tháng theo tiêu chuẩn nhà phân phối. Bảo hành điện tử kích hoạt qua số serial dán trên thân sản phẩm.</p>
              </div>
              <div class="p-3.5 rounded-lg border border-line bg-surface-alt space-y-1">
                <span class="font-bold text-foreground block">Điều kiện đổi mới 1 đổi 1</span>
                <p>Đổi sản phẩm mới 100% trong vòng 30 ngày đầu tiên nếu phát sinh lỗi kỹ thuật từ phía nhà sản xuất.</p>
              </div>
              <div class="p-3.5 rounded-lg border border-line bg-surface-alt space-y-1">
                <span class="font-bold text-foreground block">Hỗ trợ kỹ thuật</span>
                <p>Khách hàng mua linh kiện tại EL-TECH được hỗ trợ vệ sinh, tra keo tản nhiệt và kiểm tra phần cứng trọn đời máy tại tất cả chi nhánh.</p>
              </div>
            </div>
          }
        </div>

        <!-- Verified Purchase Review Modal -->
        <app-review-modal
          [isOpen]="reviewModalOpen()"
          [productName]="item.name"
          (closeModal)="reviewModalOpen.set(false)"
          (submitted)="onReviewSubmitted($event)"
        ></app-review-modal>

        <!-- BOM Modal -->
        @if (bomModalOpen()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div class="relative w-full max-w-xl rounded-xl border border-line bg-surface p-6 shadow-2xl space-y-5">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <div class="flex items-center gap-2">
                  <lucide-icon name="Wrench" class="size-5 text-primary" aria-hidden="true"></lucide-icon>
                  <h2 class="text-base font-bold text-foreground">Đưa Linh Kiện Vào Cấu Hình PC Builder</h2>
                </div>
                <button
                  type="button"
                  (click)="bomModalOpen.set(false)"
                  class="p-1 text-muted hover:text-foreground rounded transition-colors cursor-pointer"
                  aria-label="Đóng cửa sổ"
                >
                  <lucide-icon name="X" class="size-5" aria-hidden="true"></lucide-icon>
                </button>
              </div>

              <div class="space-y-3 text-xs">
                <div class="p-3 rounded-lg border border-line bg-surface-alt flex items-center gap-3">
                  <img
                    [src]="galleryImages()[selectedImageIndex()] | productImage"
                    [alt]="item.name"
                    class="size-14 rounded object-contain bg-surface border border-line p-1"
                    (error)="onImageError($event)"
                  >
                  <div class="min-w-0 flex-1">
                    <span class="text-xs font-bold text-primary uppercase">{{ item.category.name }}</span>
                    <div class="font-bold text-foreground truncate">{{ item.name }}</div>
                    <div class="font-black text-foreground tabular mt-0.5">{{ (selected()?.sellingPrice || '0') | vnd }}</div>
                  </div>
                </div>

                <div class="border border-line rounded-lg p-3.5 bg-surface space-y-2">
                  <div class="font-bold text-foreground">Kiểm tra tương thích tự động:</div>
                  <div class="space-y-1.5 text-muted">
                    <div class="flex items-center gap-2">
                      <lucide-icon name="Check" class="size-4 text-primary shrink-0" aria-hidden="true"></lucide-icon>
                      <span>Vị trí slot mục tiêu: <strong class="text-foreground font-semibold">{{ item.category.name }}</strong> trong bộ dựng PC</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <lucide-icon name="Check" class="size-4 text-primary shrink-0" aria-hidden="true"></lucide-icon>
                      <span>Kiểm tra giao tiếp phần cứng: Đạt chuẩn chân cắm và điện áp cấp nguồn</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <lucide-icon name="Check" class="size-4 text-primary shrink-0" aria-hidden="true"></lucide-icon>
                      <span>Ước tính tải điện: Tự động cộng dồn công suất nguồn yêu cầu</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="sm"
                  (click)="bomModalOpen.set(false)"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  appButton
                  variant="primary"
                  size="sm"
                  (click)="confirmAddToPcBuild()"
                >
                  <lucide-icon name="Wrench" class="size-4 mr-1.5" aria-hidden="true"></lucide-icon>
                  <span>Xác nhận &amp; Mở PC Builder</span>
                </button>
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="rounded-lg border border-danger/30 bg-danger/10 p-8 text-center" role="alert">
          <h2 class="font-bold text-foreground text-base">Không thể tải thông tin sản phẩm</h2>
          <p class="mt-1 text-xs text-muted">Linh kiện có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.</p>
          <a class="mt-4 inline-block font-bold text-xs text-primary underline" routerLink="/san-pham">Quay lại danh mục sản phẩm</a>
        </div>
      }
    </section>
  `,
})
export class ProductDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);

  protected readonly onImageError = handleProductImageError;
  protected readonly product = signal<ProductDetail | null>(null);
  protected readonly selected = signal<ProductDetail['variants'][number] | null>(null);
  protected readonly reviews = signal<readonly ProductReviewItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly adding = signal(false);
  protected readonly addError = signal(false);
  protected readonly addSuccess = signal(false);
  protected readonly quantity = signal(1);
  protected readonly activeTab = signal<'specs' | 'desc' | 'reviews' | 'policy'>('specs');
  protected readonly reviewModalOpen = signal(false);
  protected readonly bomModalOpen = signal(false);
  protected readonly selectedImageIndex = signal(0);

  protected readonly galleryImages = computed<readonly string[]>(() => {
    const item = this.product();
    if (!item) return [];
    const primaryMedia = item.media;
    let primaryUrl = '';
    if (typeof primaryMedia === 'string' && primaryMedia) {
      primaryUrl = primaryMedia;
    } else if (Array.isArray(primaryMedia) && primaryMedia[0]) {
      primaryUrl = String(primaryMedia[0]);
    } else if (typeof primaryMedia === 'object' && primaryMedia !== null) {
      const obj = primaryMedia as { url?: string; thumbnail?: string };
      primaryUrl = obj.url || obj.thumbnail || '';
    }
    if (!primaryUrl) {
      primaryUrl = '/images/products/placeholder.webp';
    }
    return [primaryUrl, primaryUrl, primaryUrl, primaryUrl];
  });

  protected readonly quickSpecs = computed<readonly { label: string; value: string }[]>(() => {
    const item = this.product();
    if (!item) return [];
    const specs = (typeof item.commonSpec === 'object' && item.commonSpec !== null)
      ? (item.commonSpec as Record<string, unknown>)
      : {};
    const catSlug = item.category.slug.toLowerCase();

    if (catSlug.includes('cpu')) {
      return [
        { label: 'Kiến trúc / Thế hệ', value: String(specs['architecture'] || specs['generation'] || 'Thế hệ mới') },
        { label: 'Chuẩn chân cắm Socket', value: String(specs['socket'] || 'LGA1700 / AM5') },
        { label: 'Công suất tiêu thụ TDP', value: specs['tdp'] ? `${specs['tdp']}W` : '125W' },
      ];
    } else if (catSlug.includes('vga') || catSlug.includes('gpu')) {
      return [
        { label: 'Kiến trúc GPU', value: String(specs['chipset'] || 'Ada Lovelace / RDNA 3') },
        { label: 'Chuẩn khe cắm giao tiếp', value: 'PCIe 4.0 x16' },
        { label: 'Nguồn khuyến nghị', value: specs['recommended_psu'] ? `${specs['recommended_psu']}W` : '750W trở lên' },
      ];
    } else if (catSlug.includes('ram')) {
      return [
        { label: 'Chuẩn bộ nhớ', value: String(specs['memory_type'] || 'DDR5') },
        { label: 'Tốc độ Bus RAM', value: specs['bus_speed'] ? `${specs['bus_speed']}MHz` : '6000MHz' },
        { label: 'Dung lượng Kit', value: String(specs['capacity'] || '32GB (2x16GB)') },
      ];
    } else if (catSlug.includes('main') || catSlug.includes('bo-mach')) {
      return [
        { label: 'Chipset bo mạch', value: String(specs['chipset'] || 'Z790 / B760') },
        { label: 'Form Factor', value: String(specs['form_factor'] || 'ATX tiêu chuẩn') },
        { label: 'Khe cắm mở rộng', value: 'PCIe 5.0 x16 & M.2 Gen 4' },
      ];
    } else if (catSlug.includes('psu') || catSlug.includes('nguon')) {
      return [
        { label: 'Công suất định mức', value: specs['wattage'] ? `${specs['wattage']}W` : '850W' },
        { label: 'Chứng nhận hiệu suất', value: String(specs['efficiency'] || '80 Plus Gold') },
        { label: 'Dạng cáp nguồn', value: 'Full Modular' },
      ];
    }

    return [
      { label: 'Thương hiệu chính hãng', value: item.brand.name },
      { label: 'Bảo hành điện tử', value: '36 Tháng 1-đổi-1' },
      { label: 'Tương thích PC', value: 'Đã kiểm tra chứng nhận' },
    ];
  });

  protected readonly isCaseClearanceApplicable = computed(() => {
    const item = this.product();
    if (!item) return false;
    const slug = item.category.slug.toLowerCase();
    return slug.includes('vga') || slug.includes('gpu') || slug.includes('tan') || slug.includes('cooling');
  });

  protected readonly ratingStats = computed(() => {
    const revs = this.reviews();
    const total = revs.length;
    if (total === 0) {
      return {
        average: '5.0',
        total: 0,
        histogram: [
          { star: 5, count: 0, percentage: 0 },
          { star: 4, count: 0, percentage: 0 },
          { star: 3, count: 0, percentage: 0 },
          { star: 2, count: 0, percentage: 0 },
          { star: 1, count: 0, percentage: 0 },
        ],
      };
    }
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    for (const r of revs) {
      const s = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[s] = (counts[s] || 0) + 1;
      sum += r.rating;
    }
    const avg = (sum / total).toFixed(1);
    const histogram = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star] || 0,
      percentage: Math.round(((counts[star] || 0) / total) * 100),
    }));
    return { average: avg, total, histogram };
  });

  protected readonly formattedSpecs = computed<SpecRow[]>(() => {
    const item = this.product();
    if (!item || !item.commonSpec) return [];
    let specObj: Record<string, unknown> = {};
    if (typeof item.commonSpec === 'string') {
      try {
        specObj = JSON.parse(item.commonSpec) as Record<string, unknown>;
      } catch {
        return [];
      }
    } else if (typeof item.commonSpec === 'object' && item.commonSpec !== null) {
      specObj = item.commonSpec as Record<string, unknown>;
    }

    const rows: SpecRow[] = [];
    for (const [key, val] of Object.entries(specObj)) {
      if (val === null || val === undefined) continue;
      const label = SPEC_LABEL_MAP[key] ?? key.replace(/_/g, ' ').toUpperCase();
      let valueStr = String(val);
      if (typeof val === 'boolean') {
        valueStr = val ? 'Có hỗ trợ' : 'Không hỗ trợ';
      }
      rows.push({ label, value: valueStr });
    }
    return rows;
  });

  constructor() {
    void this.load();
  }

  protected changeQty(delta: number): void {
    this.quantity.update((q) => Math.max(1, q + delta));
  }

  protected async addToCart(): Promise<void> {
    const variant = this.selected();
    if (!variant) return;
    this.adding.set(true);
    this.addError.set(false);
    this.addSuccess.set(false);
    try {
      await this.cart.add(variant.id, this.quantity());
      this.addSuccess.set(true);
      this.cart.openDrawer();
      setTimeout(() => this.addSuccess.set(false), 3000);
    } catch {
      this.addError.set(true);
    } finally {
      this.adding.set(false);
    }
  }

  protected async onReviewSubmitted(data: { rating: number; content: string; authorName?: string }): Promise<void> {
    const item = this.product();
    if (!item) return;
    try {
      await this.catalog.submitReview({
        productSlug: item.slug,
        rating: data.rating,
        text: data.content,
        authorName: data.authorName,
      });
      const newReview: ProductReviewItem = {
        id: `rev-${Date.now()}`,
        authorName: data.authorName || 'Khách hàng',
        rating: data.rating,
        text: data.content,
        createdAt: new Date().toISOString(),
      };
      this.reviews.update((list) => [newReview, ...list]);
    } catch (e) {
      console.error('Lỗi khi gửi đánh giá:', e);
    }
    this.reviewModalOpen.set(false);
  }

  protected async buyNow(): Promise<void> {
    const variant = this.selected();
    if (!variant) return;
    this.adding.set(true);
    this.addError.set(false);
    try {
      await this.cart.add(variant.id, this.quantity());
      void this.router.navigate(['/checkout']);
    } catch {
      this.addError.set(true);
    } finally {
      this.adding.set(false);
    }
  }

  protected openBomModal(): void {
    this.bomModalOpen.set(true);
  }

  protected confirmAddToPcBuild(): void {
    const item = this.product();
    if (!item) return;
    const variant = this.selected();
    const pcItem = {
      productId: item.id,
      name: item.name,
      categorySlug: item.category.slug,
      categoryName: item.category.name,
      price: variant?.sellingPrice || '0',
      skuId: variant?.id || 0,
      media: item.media,
      model: item.model,
    };
    try {
      sessionStorage.setItem('el-tech.pending-pc-build-item', JSON.stringify(pcItem));
    } catch (_err) {
      void _err;
    }
    this.bomModalOpen.set(false);
    void this.router.navigate(['/xay-dung-pc']);
  }

  private async load(): Promise<void> {
    try {
      const categorySlug = this.route.snapshot.paramMap.get('categorySlug') ?? '';
      const productSlug = this.route.snapshot.paramMap.get('productSlug') ?? '';
      const product = await this.catalog.detail(categorySlug, productSlug);
      this.product.set(product);
      this.selected.set(product.variants[0] ?? null);

      try {
        const reviews = await this.catalog.reviews(productSlug);
        this.reviews.set(reviews);
      } catch {
        this.reviews.set([]);
      }
    } finally {
      this.loading.set(false);
    }
  }
}
