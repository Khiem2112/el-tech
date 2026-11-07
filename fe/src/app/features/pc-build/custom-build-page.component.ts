import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppIconModule, ButtonDirective } from '../../components/atoms';
import { VndPipe } from '../../lib/vnd.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';
import { CartService } from '../../services/cart.service';
import { PcBuildService, BundleResponse } from '../../services/pc-build.service';
import { ComponentSwapModalComponent, SwapItem, SwapSlotItem } from './component-swap-modal.component';

export type BomCategory =
  | 'cpu'
  | 'mainboard'
  | 'ram'
  | 'ssd'
  | 'vga'
  | 'psu'
  | 'cooling'
  | 'case'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'headphone';

export type BomSection = 'core' | 'gear';

export type BomSlot = {
  readonly key: BomCategory;
  readonly number: string;
  readonly categoryName: string;
  readonly defaultSpecTag: string;
  readonly isRequired: boolean;
  readonly section: BomSection;
  item: SwapItem | null;
};

const DRAFT_STORAGE_KEY = 'el-tech.pc-builder-active-draft';

type ActiveDraftState = {
  readonly slots: Partial<Record<BomCategory, SwapItem | null>>;
  readonly currentBundleIndex?: number;
  readonly serviceAssembly?: boolean;
  readonly serviceStressTest?: boolean;
};

const DEFAULT_BOM_SLOTS: readonly Omit<BomSlot, 'item'>[] = [
  { key: 'cpu', number: '01', categoryName: 'Vi xử lý / CPU', defaultSpecTag: 'LGA1700 / AM5', isRequired: true, section: 'core' },
  { key: 'mainboard', number: '02', categoryName: 'Bo mạch chủ / Mainboard', defaultSpecTag: 'Socket LGA1700 / AM5', isRequired: true, section: 'core' },
  { key: 'ram', number: '03', categoryName: 'Bộ nhớ trong / RAM', defaultSpecTag: 'DDR4 / DDR5', isRequired: true, section: 'core' },
  { key: 'ssd', number: '04', categoryName: 'Ổ cứng thể rắn / SSD', defaultSpecTag: 'Gen 4.0 / 5.0 NVMe', isRequired: true, section: 'core' },
  { key: 'psu', number: '05', categoryName: 'Nguồn máy tính / PSU', defaultSpecTag: '80 Plus Bronze / Gold', isRequired: true, section: 'core' },
  { key: 'vga', number: '06', categoryName: 'Card đồ họa / VGA', defaultSpecTag: 'PCIe 4.0 / 5.0', isRequired: false, section: 'core' },
  { key: 'cooling', number: '07', categoryName: 'Tản nhiệt CPU / Cooling', defaultSpecTag: 'Air / AIO 240-360mm', isRequired: false, section: 'core' },
  { key: 'case', number: '08', categoryName: 'Vỏ máy tính / Case', defaultSpecTag: 'Mid Tower ATX / MATX', isRequired: false, section: 'core' },
  { key: 'monitor', number: '09', categoryName: 'Màn hình máy tính', defaultSpecTag: 'FHD / 2K / 4K Gaming', isRequired: false, section: 'gear' },
  { key: 'keyboard', number: '10', categoryName: 'Bàn phím cơ', defaultSpecTag: 'Mechanical / Wireless', isRequired: false, section: 'gear' },
  { key: 'mouse', number: '11', categoryName: 'Chuột máy tính', defaultSpecTag: 'Gaming / Ergonomic', isRequired: false, section: 'gear' },
  { key: 'headphone', number: '12', categoryName: 'Tai nghe gaming', defaultSpecTag: 'Over-ear / Surround', isRequired: false, section: 'gear' },
];

@Component({
  selector: 'app-custom-build-page',
  imports: [VndPipe, AppIconModule, ButtonDirective, ComponentSwapModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="w-full bg-canvas min-h-screen pb-16">
      <!-- Status & Utility Bar -->
      <header class="w-full px-4 sm:px-6 lg:px-8 py-4 bg-surface border-b border-line shadow-xs">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-surface-alt flex items-center justify-center text-foreground font-bold border border-line">
              <lucide-icon name="cpu" class="size-5 text-primary" aria-hidden="true"></lucide-icon>
            </div>
            <div>
              <h1 class="text-base sm:text-lg font-bold text-foreground">Tùy chỉnh cấu hình PC</h1>
              <p class="text-xs text-muted mt-0.5">Kiểm tra tương thích socket, công suất nguồn và kích thước linh kiện theo thời gian thực.</p>
            </div>
          </div>

          <!-- Action Toolbar -->
          <div class="flex items-center flex-wrap gap-2 text-xs">
            <button
              type="button"
              (click)="resetBuild()"
              class="h-9 px-3.5 rounded-lg bg-surface-alt hover:bg-border text-foreground font-bold flex items-center gap-1.5 transition-colors border border-line cursor-pointer"
              title="Đặt lại toàn bộ danh sách linh kiện"
            >
              <lucide-icon name="rotate-ccw" class="size-3.5 text-muted" aria-hidden="true"></lucide-icon>
              <span>Làm mới</span>
            </button>

            <button
              type="button"
              (click)="shareLink()"
              class="h-9 px-3.5 rounded-lg bg-surface-alt hover:bg-border text-foreground font-bold flex items-center gap-1.5 transition-colors border border-line cursor-pointer relative"
              title="Sao chép liên kết cấu hình"
            >
              <lucide-icon name="share-2" class="size-3.5 text-muted" aria-hidden="true"></lucide-icon>
              <span>{{ linkCopied() ? 'Đã sao chép link' : 'Chia sẻ' }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Action & Notification Toast Banner -->
      @if (actionNotification(); as notif) {
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div class="rounded-xl p-3.5 bg-primary/10 border border-primary/25 text-foreground flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div class="flex items-center gap-2.5">
              <lucide-icon name="check" class="size-4 text-primary shrink-0" aria-hidden="true"></lucide-icon>
              <span class="font-medium">{{ notif }}</span>
            </div>
            <button
              type="button"
              (click)="dismissNotification()"
              class="text-muted hover:text-foreground p-1 transition-colors cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <lucide-icon name="x" class="size-3.5" aria-hidden="true"></lucide-icon>
            </button>
          </div>
        </div>
      }

      <!-- Main Workspace (8 Cols BOM / 4 Cols Summary) -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left Section: BOM Slots & Diagnostics (8 cols) -->
          <div class="lg:col-span-8 space-y-4">
            <!-- Compatibility & Wattage Metric Panel -->
            <div class="rounded-xl p-4 sm:p-5 bg-surface shadow-xs border border-line space-y-3">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-line">
                <div class="flex items-center gap-2.5">
                  <lucide-icon name="shield-check" class="size-5 text-primary shrink-0" aria-hidden="true"></lucide-icon>
                  <div>
                    <span class="text-xs sm:text-sm font-bold text-foreground block">Độ Tương Thích &amp; Công Suất Nguồn</span>
                    <p class="text-xs text-muted">
                      {{ currentSocket() ? 'Socket ' + currentSocket() : 'Chưa chọn CPU' }} ·
                      {{ currentRamType() ? 'RAM ' + currentRamType() : 'Chưa chọn RAM' }} ·
                      <span [class.text-primary]="requiredSlotsFilledCount() === totalRequiredSlotsCount()" [class.text-amber-500]="requiredSlotsFilledCount() < totalRequiredSlotsCount()" class="font-semibold">
                        Linh kiện bắt buộc: {{ requiredSlotsFilledCount() }}/{{ totalRequiredSlotsCount() }}
                      </span>
                    </p>
                  </div>
                </div>
                <div class="text-xs text-muted">
                  Nguồn đề xuất:
                  <strong class="text-foreground font-bold tabular">
                    {{ minPsuRecommended() > 0 ? minPsuRecommended() + 'W' : '---' }}
                  </strong>
                </div>
              </div>

              <!-- Wattage Bar -->
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-muted">Tiêu thụ ước tính linh kiện PC: <strong class="text-foreground tabular">{{ fullLoadTdp() }}W</strong></span>
                  <span class="text-muted">
                    Công suất PSU đã chọn:
                    <strong class="text-primary font-bold tabular">
                      {{ currentPsuWattage() > 0 ? currentPsuWattage() + 'W' : 'Chưa chọn' }}
                    </strong>
                  </span>
                </div>

                <!-- Progress Bar Graphic -->
                <div class="w-full h-2.5 bg-surface-alt rounded-full overflow-hidden flex border border-line">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [class.bg-primary]="currentPsuWattage() === 0 || (wattagePercent() <= 80 && fullLoadTdp() <= currentPsuWattage())"
                    [class.bg-amber-400]="currentPsuWattage() > 0 && wattagePercent() > 80 && fullLoadTdp() <= currentPsuWattage()"
                    [class.bg-danger]="currentPsuWattage() > 0 && fullLoadTdp() > currentPsuWattage()"
                    [style.width.%]="wattagePercent()"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Group 1: Core PC Components (Must-have components for a desktop build) -->
            <div class="space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-line">
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-sm font-bold text-foreground">Linh Kiện Thùng Máy (Cốt Lõi)</h2>
                    <span class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      5 linh kiện bắt buộc
                    </span>
                  </div>
                  <p class="text-xs text-muted mt-0.5">Các bộ phận thiết yếu để một hệ thống PC hoàn chỉnh có thể vận hành và khởi động.</p>
                </div>
                <div class="text-right shrink-0">
                  <span
                    class="px-2.5 py-1 rounded-lg text-xs font-bold border inline-block"
                    [class.bg-primary/10]="requiredSlotsFilledCount() === totalRequiredSlotsCount()"
                    [class.text-primary]="requiredSlotsFilledCount() === totalRequiredSlotsCount()"
                    [class.border-primary/30]="requiredSlotsFilledCount() === totalRequiredSlotsCount()"
                    [class.bg-amber-500/10]="requiredSlotsFilledCount() < totalRequiredSlotsCount()"
                    [class.text-amber-500]="requiredSlotsFilledCount() < totalRequiredSlotsCount()"
                    [class.border-amber-500/30]="requiredSlotsFilledCount() < totalRequiredSlotsCount()"
                  >
                    Đã chọn: {{ requiredSlotsFilledCount() }}/{{ totalRequiredSlotsCount() }}
                  </span>
                </div>
              </div>

              @for (slot of coreSlots(); track slot.key) {
                @if (slot.item; as item) {
                  <!-- Configured Slot -->
                  <div class="rounded-xl bg-surface shadow-xs border border-line p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/50 transition-colors">
                    <div class="flex items-start md:items-center gap-3.5 flex-1 min-w-0">
                      <div class="size-16 sm:size-20 rounded-xl bg-surface-alt border border-line shrink-0 p-1.5 flex items-center justify-center overflow-hidden">
                        <img
                          [src]="item.imageUrl || '/images/products/placeholder.webp'"
                          [alt]="item.name"
                          class="size-full object-contain"
                          (error)="onImageError($event)"
                        >
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-xs font-bold uppercase tracking-wider text-primary">
                            {{ slot.categoryName }}
                          </span>
                          @if (slot.isRequired) {
                            <span class="px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              Bắt buộc
                            </span>
                          } @else {
                            <span class="px-1.5 py-0.5 rounded text-xs text-muted bg-surface-alt border border-line">
                              Tùy chọn
                            </span>
                          }
                          @if (slot.key === 'psu' && (item.wattage || item.tdp)) {
                            <span class="px-1.5 py-0.5 rounded text-xs text-primary font-bold bg-primary/10 border border-primary/20">
                              {{ item.wattage || item.tdp }}W
                            </span>
                          }
                          @if (item.tag) {
                            <span class="px-1.5 py-0.5 rounded text-xs text-muted bg-surface-alt border border-line">
                              {{ item.tag }}
                            </span>
                          }
                        </div>

                        <h2 class="text-sm font-bold text-foreground truncate mt-1">{{ item.name }}</h2>
                        <p class="text-xs text-muted truncate mt-0.5">{{ item.specs }}</p>
                      </div>
                    </div>

                    <!-- Slot Price & Actions -->
                    <div class="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-line">
                      <div class="text-left md:text-right">
                        <div class="text-sm font-bold text-foreground tabular">{{ item.price | vnd }}</div>
                        <div class="text-xs text-muted">Bảo hành chính hãng</div>
                      </div>

                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="openSwapModal(slot)"
                          class="h-8 px-2.5 rounded-lg bg-surface-alt hover:bg-border text-foreground text-xs font-bold flex items-center gap-1 transition-colors border border-line cursor-pointer"
                          title="Thay đổi linh kiện"
                        >
                          <lucide-icon name="arrow-up-down" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                          <span>Đổi</span>
                        </button>

                        <button
                          type="button"
                          (click)="clearSlot(slot.key)"
                          class="size-8 rounded-lg bg-surface-alt hover:bg-danger/20 text-muted hover:text-danger flex items-center justify-center transition-colors border border-line cursor-pointer"
                          title="Xóa linh kiện này"
                          aria-label="Xóa linh kiện"
                        >
                          <lucide-icon name="trash-2" class="size-3.5" aria-hidden="true"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                } @else {
                  <!-- Empty Dashed Slot -->
                  <div
                    class="rounded-xl border border-dashed p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
                    [class.border-amber-500/40]="slot.isRequired"
                    [class.bg-amber-500/5]="slot.isRequired"
                    [class.border-line]="!slot.isRequired"
                    [class.bg-surface/50]="!slot.isRequired"
                    [class.hover:border-primary/60]="true"
                  >
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                      <div class="min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-xs font-bold uppercase tracking-wider text-foreground">
                            {{ slot.categoryName }}
                          </span>
                          @if (slot.isRequired) {
                            <span class="px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              Bắt buộc
                            </span>
                          } @else {
                            <span class="px-1.5 py-0.5 rounded text-xs text-muted bg-surface-alt border border-line">
                              Tùy chọn
                            </span>
                          }
                          <span class="text-xs text-muted">({{ slot.defaultSpecTag }})</span>
                        </div>
                        <p class="text-xs text-muted mt-0.5">
                          {{ slot.isRequired ? 'Chưa chọn linh kiện bắt buộc này cho bộ PC' : 'Chưa chọn linh kiện cho vị trí này' }}
                        </p>
                      </div>
                    </div>

                    <div class="shrink-0 w-full md:w-auto text-right">
                      <button
                        type="button"
                        (click)="openSwapModal(slot)"
                        class="w-full md:w-auto h-8 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        [class.bg-amber-500/10]="slot.isRequired"
                        [class.hover:bg-amber-500/20]="slot.isRequired"
                        [class.text-amber-500]="slot.isRequired"
                        [class.border]="slot.isRequired"
                        [class.border-amber-500/30]="slot.isRequired"
                        [class.bg-primary/10]="!slot.isRequired"
                        [class.hover:bg-primary/20]="!slot.isRequired"
                        [class.text-primary]="!slot.isRequired"
                        [class.border-primary/30]="!slot.isRequired"
                        title="Chọn linh kiện cho ô này"
                      >
                        <lucide-icon name="plus" class="size-3.5" aria-hidden="true"></lucide-icon>
                        <span>Chọn {{ slot.categoryName }}</span>
                      </button>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Group 2: Gear & Peripherals (Optional additions for PC setup) -->
            <div class="space-y-3 pt-4">
              <div class="flex items-center justify-between pb-2 border-b border-line">
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-sm font-bold text-foreground">Màn Hình &amp; Phụ Kiện Gaming Gear</h2>
                    <span class="px-2 py-0.5 rounded text-xs font-medium bg-surface-alt text-muted border border-line">
                      Tùy chọn ngoại vi
                    </span>
                  </div>
                  <p class="text-xs text-muted mt-0.5">Trang bị thêm màn hình hiển thị, bàn phím, chuột và tai nghe đồng bộ (không bắt buộc có trong thùng máy).</p>
                </div>
              </div>

              @for (slot of gearSlots(); track slot.key) {
                @if (slot.item; as item) {
                  <!-- Configured Gear Slot -->
                  <div class="rounded-xl bg-surface shadow-xs border border-line p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/50 transition-colors">
                    <div class="flex items-start md:items-center gap-3.5 flex-1 min-w-0">
                      <div class="size-16 sm:size-20 rounded-xl bg-surface-alt border border-line shrink-0 p-1.5 flex items-center justify-center overflow-hidden">
                        <img
                          [src]="item.imageUrl || '/images/products/placeholder.webp'"
                          [alt]="item.name"
                          class="size-full object-contain"
                          (error)="onImageError($event)"
                        >
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-xs font-bold uppercase tracking-wider text-primary">
                            {{ slot.categoryName }}
                          </span>
                          <span class="px-1.5 py-0.5 rounded text-xs text-muted bg-surface-alt border border-line">
                            Ngoại vi
                          </span>
                          @if (item.tag) {
                            <span class="px-1.5 py-0.5 rounded text-xs text-muted bg-surface-alt border border-line">
                              {{ item.tag }}
                            </span>
                          }
                        </div>

                        <h2 class="text-sm font-bold text-foreground truncate mt-1">{{ item.name }}</h2>
                        <p class="text-xs text-muted truncate mt-0.5">{{ item.specs }}</p>
                      </div>
                    </div>

                    <div class="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-line">
                      <div class="text-left md:text-right">
                        <div class="text-sm font-bold text-foreground tabular">{{ item.price | vnd }}</div>
                        <div class="text-xs text-muted">Bảo hành chính hãng</div>
                      </div>

                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="openSwapModal(slot)"
                          class="h-8 px-2.5 rounded-lg bg-surface-alt hover:bg-border text-foreground text-xs font-bold flex items-center gap-1 transition-colors border border-line cursor-pointer"
                          title="Thay đổi thiết bị"
                        >
                          <lucide-icon name="arrow-up-down" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                          <span>Đổi</span>
                        </button>

                        <button
                          type="button"
                          (click)="clearSlot(slot.key)"
                          class="size-8 rounded-lg bg-surface-alt hover:bg-danger/20 text-muted hover:text-danger flex items-center justify-center transition-colors border border-line cursor-pointer"
                          title="Xóa món này"
                          aria-label="Xóa món ngoại vi"
                        >
                          <lucide-icon name="trash-2" class="size-3.5" aria-hidden="true"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                } @else {
                  <!-- Empty Gear Slot -->
                  <div class="rounded-xl border border-dashed border-line hover:border-primary/60 bg-surface/50 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold uppercase tracking-wider text-foreground">
                            {{ slot.categoryName }}
                          </span>
                          <span class="text-xs text-muted">({{ slot.defaultSpecTag }})</span>
                        </div>
                        <p class="text-xs text-muted mt-0.5">Chưa thêm thiết bị ngoại vi cho ô này (Tùy chọn)</p>
                      </div>
                    </div>

                    <div class="shrink-0 w-full md:w-auto text-right">
                      <button
                        type="button"
                        (click)="openSwapModal(slot)"
                        class="w-full md:w-auto h-8 px-3 rounded-lg bg-surface-alt hover:bg-border text-foreground border border-line text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        title="Chọn thiết bị cho ô này"
                      >
                        <lucide-icon name="plus" class="size-3.5" aria-hidden="true"></lucide-icon>
                        <span>Thêm {{ slot.categoryName }}</span>
                      </button>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Free Technical Services Pack (PB-03) -->
            <div class="rounded-xl p-4 bg-surface shadow-sm border border-line space-y-3 text-xs text-muted">
              <div class="flex items-center justify-between font-bold text-foreground">
                <div class="flex items-center gap-2">
                  <lucide-icon name="wrench" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Gói Dịch Vụ Kỹ Thuật Đính Kèm Tự Chọn (Miễn Phí 0 đ)</span>
                </div>
                <span class="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">MIỄN PHÍ</span>
              </div>
              <div class="grid sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                <label class="p-3 rounded-lg bg-surface-alt border border-line flex items-start gap-3 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    [checked]="serviceAssembly()"
                    (change)="toggleServiceAssembly()"
                    class="mt-0.5 size-4 rounded border-line text-primary focus:ring-primary accent-primary cursor-pointer"
                  >
                  <div class="space-y-0.5 min-w-0">
                    <div class="font-bold text-foreground flex items-center justify-between">
                      <span>Lắp đặt và nối dây</span>
                      <span class="text-primary font-bold">0 đ</span>
                    </div>
                    <p class="text-muted text-xs leading-relaxed">Kỹ thuật viên bóc seal, đi dây nẹp thẩm mỹ, luồn dây âm thân case.</p>
                  </div>
                </label>

                <label class="p-3 rounded-lg bg-surface-alt border border-line flex items-start gap-3 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    [checked]="serviceStressTest()"
                    (change)="toggleServiceStressTest()"
                    class="mt-0.5 size-4 rounded border-line text-primary focus:ring-primary accent-primary cursor-pointer"
                  >
                  <div class="space-y-0.5 min-w-0">
                    <div class="font-bold text-foreground flex items-center justify-between">
                      <span>Cài đặt HĐH &amp; Stress Test 24h</span>
                      <span class="text-primary font-bold">0 đ</span>
                    </div>
                    <p class="text-muted text-xs leading-relaxed">Kiểm tra tải FurMark, Cinebench R23 và cập nhật BIOS bo mạch mới nhất.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Right Section: Sticky Summary & Checkout Drawer (4 cols) -->
          <div class="lg:col-span-4 sticky top-24 space-y-4">
            <div class="rounded-xl p-5 bg-surface shadow-sm border border-line space-y-4">
              <div class="border-b border-line pb-3">
                <span class="text-xs font-bold uppercase tracking-wider text-muted">TỔNG KẾT BẢO TOÀN DÀN MÁY</span>
                <h3 class="text-sm font-bold text-foreground mt-0.5">Báo Giá Chi Tiết PC Tự Ráp</h3>
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-2 text-xs">
                <div class="flex items-center justify-between text-muted">
                  <span>Tổng linh kiện đã chọn:</span>
                  <span class="text-foreground font-bold tabular">{{ activeItemCount() }} món</span>
                </div>
                <div class="flex items-center justify-between text-muted">
                  <span>Linh kiện cốt lõi (Bắt buộc):</span>
                  @if (requiredSlotsFilledCount() === totalRequiredSlotsCount()) {
                    <span class="text-primary font-bold">Đủ 5/5 món</span>
                  } @else {
                    <span class="text-amber-500 font-bold">{{ requiredSlotsFilledCount() }}/{{ totalRequiredSlotsCount() }} món</span>
                  }
                </div>
                @if (missingRequiredSlotNames().length > 0) {
                  <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 leading-relaxed">
                    Còn thiếu: {{ missingRequiredSlotNames().join(', ') }} để bộ PC hoàn chỉnh.
                  </div>
                }
                <div class="flex items-center justify-between text-muted">
                  <span>Tổng giá trị linh kiện:</span>
                  <span class="text-foreground font-bold tabular">{{ totalHardwarePrice() | vnd }}</span>
                </div>
                <div class="flex items-center justify-between text-muted">
                  <span>Chi phí lắp đặt và test:</span>
                  @if (activeItemCount() === 0) {
                    <span class="text-foreground font-bold tabular">0 đ</span>
                  } @else {
                    <span class="text-primary font-bold">0 đ (Miễn phí)</span>
                  }
                </div>
                <div class="flex items-center justify-between text-muted">
                  <span>Chi phí vận chuyển:</span>
                  @if (activeItemCount() === 0) {
                    <span class="text-foreground font-bold tabular">0 đ</span>
                  } @else {
                    <span class="text-primary font-bold">MIỄN PHÍ</span>
                  }
                </div>
                <div class="w-full h-px bg-border my-1"></div>
                <div class="flex items-baseline justify-between pt-1">
                  <div>
                    <div class="text-xs font-black uppercase text-foreground">TỔNG THANH TOÁN</div>
                    <div class="text-xs text-muted">Bao gồm VAT 10% &amp; Hóa đơn GTGT</div>
                  </div>
                  <div class="text-right">
                    <div class="text-xl sm:text-2xl font-black text-primary tabular">{{ totalHardwarePrice() | vnd }}</div>
                    @if (activeItemCount() > 0) {
                      <div class="text-xs text-primary font-bold tabular">Tiết kiệm trọn gói 1.800.000 đ</div>
                    }
                  </div>
                </div>
              </div>

              <!-- Main CTA Buttons -->
              <div class="space-y-2 pt-1">
                <button
                  type="button"
                  appButton
                  variant="primary"
                  size="lg"
                  class="w-full font-bold uppercase tracking-wider"
                  [disabled]="activeItemCount() === 0 || adding()"
                  (click)="proceedToCheckout()"
                >
                  <lucide-icon name="shopping-cart" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>{{ adding() ? 'Đang chuẩn bị...' : 'Đặt hàng ngay' }}</span>
                </button>

                <button
                  type="button"
                  appButton
                  variant="secondary"
                  size="md"
                  class="w-full font-bold"
                  [disabled]="activeItemCount() === 0 || adding()"
                  (click)="addToCartWhole()"
                >
                  <lucide-icon name="plus" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>Thêm trọn bộ vào giỏ hàng</span>
                </button>
              </div>

              <!-- Assurance Micro Badges -->
              <div class="pt-2 flex items-center justify-between text-xs text-muted border-t border-line">
                <span class="flex items-center gap-1">
                  <lucide-icon name="rotate-ccw" class="size-3 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Đổi mới 30 ngày</span>
                </span>
                <span class="size-1 rounded-full bg-border"></span>
                <span class="flex items-center gap-1">
                  <lucide-icon name="shield-check" class="size-3 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Bảo hành tận nơi 12T</span>
                </span>
                <span class="size-1 rounded-full bg-border"></span>
                <span class="flex items-center gap-1">
                  <lucide-icon name="file-text" class="size-3 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Hóa đơn VAT</span>
                </span>
              </div>
            </div>

            <!-- Diagnostics Card -->
            <div class="rounded-xl p-4 bg-surface shadow-sm border border-line space-y-1.5 text-xs text-muted">
              <div class="flex items-center justify-between text-foreground font-bold text-xs">
                <span class="flex items-center gap-1.5">
                  <lucide-icon name="cpu" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Kiến trúc hệ thống</span>
                </span>
                <span class="text-primary font-bold tabular">x86-64 / PCIe 5.0</span>
              </div>
              <p class="text-xs leading-relaxed">
                Cấu hình tương thích các chuẩn tản nhiệt Radiator 360mm và khoảng không thông thoáng cho card đồ họa thế hệ mới nhất.
              </p>
            </div>
          </div>
        </div>
      </main>

      <!-- Interactive Hardware Swap Modal -->
      <app-component-swap-modal
        [isOpen]="swapModalOpen()"
        [categoryKey]="currentModalCategoryKey()"
        [categoryName]="currentModalCategoryName()"
        [currentSlot]="currentModalSlot()"
        [availableItems]="currentModalAvailableItems()"
        [currentSocket]="currentSocket()"
        [currentRamType]="currentRamType()"
        [minPsuWattage]="minPsuRecommended()"
        [currentPsuWattage]="currentPsuWattage()"
        [isLoading]="isModalLoading()"
        (closeModal)="swapModalOpen.set(false)"
        (selectItem)="onComponentSelected($event)"
      ></app-component-swap-modal>

      <!-- Overwrite Confirmation Modal -->
      @if (overwriteModalOpen() && pendingBundleToApply(); as bundle) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div class="w-full max-w-md rounded-2xl bg-surface border border-line p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div class="flex items-start gap-3">
              <div class="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                <lucide-icon name="alert-triangle" class="size-5" aria-hidden="true"></lucide-icon>
              </div>
              <div class="space-y-1">
                <h2 class="text-base font-bold text-foreground">Ghi đè cấu hình PC hiện tại?</h2>
                <p class="text-xs text-muted leading-relaxed">
                  Bạn đang có một cấu hình PC đang lắp ráp dở dang. Bạn có muốn thay thế bằng cấu hình mẫu
                  <strong class="text-foreground">{{ bundle.name }}</strong> không?
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                (click)="cancelPendingBundle()"
                class="h-9 px-4 rounded-lg bg-surface-alt hover:bg-border text-foreground text-xs font-bold transition-colors border border-line cursor-pointer"
              >
                Giữ cấu hình đang ráp
              </button>
              <button
                type="button"
                (click)="confirmApplyPendingBundle()"
                class="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors cursor-pointer"
              >
                Ghi đè cấu hình mới
              </button>
            </div>
          </div>
        </div>
      }
    </section>
  `,
})
export class CustomBuildPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cart = inject(CartService);
  private readonly pcBuildService = inject(PcBuildService);

  protected readonly onImageError = handleProductImageError;
  protected readonly serviceAssembly = signal(true);
  protected readonly serviceStressTest = signal(true);

  protected readonly bundles = signal<readonly BundleResponse[]>([]);
  protected readonly liveCatalog = signal<Record<string, readonly SwapItem[]>>({});
  protected readonly currentBundleIndex = signal<number>(0);
  protected readonly linkCopied = signal(false);
  protected readonly adding = signal(false);

  protected readonly actionNotification = signal<string | null>(null);
  protected readonly overwriteModalOpen = signal(false);
  protected readonly pendingBundleToApply = signal<BundleResponse | null>(null);
  private notificationTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly activePresetLabel = computed<string>(() => {
    const list = this.bundles();
    if (list.length === 0) return 'Đổi cấu hình mẫu';
    const current = list[this.currentBundleIndex() % list.length];
    return current ? current.name : 'Đổi cấu hình mẫu';
  });

  protected readonly swapModalOpen = signal(false);
  protected readonly currentModalCategoryKey = signal<string>('vga');
  protected readonly currentModalCategoryName = signal<string>('Card đồ họa / VGA');
  protected readonly currentModalSlot = signal<SwapSlotItem | null>(null);
  protected readonly currentModalAvailableItems = signal<readonly SwapItem[]>([]);
  protected readonly isModalLoading = signal(false);

  protected readonly bomSlots = signal<readonly BomSlot[]>(
    DEFAULT_BOM_SLOTS.map((s) => ({ ...s, item: null }))
  );

  protected readonly coreSlots = computed<readonly BomSlot[]>(() => {
    return this.bomSlots().filter((s) => s.section === 'core');
  });

  protected readonly gearSlots = computed<readonly BomSlot[]>(() => {
    return this.bomSlots().filter((s) => s.section === 'gear');
  });

  protected readonly requiredSlotsFilledCount = computed<number>(() => {
    return this.bomSlots().filter((s) => s.isRequired && s.item !== null).length;
  });

  protected readonly totalRequiredSlotsCount = computed<number>(() => {
    return this.bomSlots().filter((s) => s.isRequired).length;
  });

  protected readonly missingRequiredSlotNames = computed<readonly string[]>(() => {
    return this.bomSlots()
      .filter((s) => s.isRequired && s.item === null)
      .map((s) => s.categoryName.split('/')[0].trim());
  });

  async ngOnInit(): Promise<void> {
    this.loadDraftFromStorage();
    await this.loadCatalogAndBundles();
    this.checkPendingBuildItem();
    this.checkSwapSlotQueryParam();
  }

  protected showNotification(message: string): void {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }
    this.actionNotification.set(message);
    this.notificationTimer = setTimeout(() => {
      this.actionNotification.set(null);
      this.notificationTimer = null;
    }, 4500);
  }

  protected dismissNotification(): void {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
      this.notificationTimer = null;
    }
    this.actionNotification.set(null);
  }

  protected toggleServiceAssembly(): void {
    this.serviceAssembly.set(!this.serviceAssembly());
    this.saveDraftToStorage();
  }

  protected toggleServiceStressTest(): void {
    this.serviceStressTest.set(!this.serviceStressTest());
    this.saveDraftToStorage();
  }

  protected confirmApplyPendingBundle(): void {
    const bundle = this.pendingBundleToApply();
    if (bundle) {
      const list = this.bundles();
      const idx = list.indexOf(bundle);
      this.currentBundleIndex.set(idx >= 0 ? idx : 0);
      this.applyBundle(bundle);
      this.saveDraftToStorage();
      this.showNotification(`Đã nạp cấu hình mẫu "${bundle.name}".`);
    }
    this.pendingBundleToApply.set(null);
    this.overwriteModalOpen.set(false);
  }

  protected cancelPendingBundle(): void {
    this.pendingBundleToApply.set(null);
    this.overwriteModalOpen.set(false);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { bundle: null, bundleId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private saveDraftToStorage(): void {
    try {
      const slotsMap: Partial<Record<BomCategory, SwapItem | null>> = {};
      for (const slot of this.bomSlots()) {
        slotsMap[slot.key] = slot.item;
      }
      const data: ActiveDraftState = {
        slots: slotsMap,
        currentBundleIndex: this.currentBundleIndex(),
        serviceAssembly: this.serviceAssembly(),
        serviceStressTest: this.serviceStressTest(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch (_err) {
      void _err;
    }
  }

  private loadDraftFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as Partial<ActiveDraftState>;
      if (parsed && typeof parsed === 'object') {
        const slotsMap = (parsed.slots || {}) as Partial<Record<BomCategory, SwapItem | null>>;
        let hasItem = false;
        this.bomSlots.set(
          DEFAULT_BOM_SLOTS.map((slot) => {
            const item = slotsMap[slot.key] ?? null;
            if (item) hasItem = true;
            return { ...slot, item };
          })
        );
        if (typeof parsed.currentBundleIndex === 'number') {
          this.currentBundleIndex.set(parsed.currentBundleIndex);
        }
        if (typeof parsed.serviceAssembly === 'boolean') {
          this.serviceAssembly.set(parsed.serviceAssembly);
        }
        if (typeof parsed.serviceStressTest === 'boolean') {
          this.serviceStressTest.set(parsed.serviceStressTest);
        }
        return hasItem;
      }
    } catch (_err) {
      void _err;
    }
    return false;
  }

  private clearDraftStorage(): void {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (_err) {
      void _err;
    }
  }

  private mapCategorySlugToBomCategory(rawCat: string): BomCategory | null {
    const normalized = rawCat.trim().toLowerCase();
    if (normalized === 'cpu' || normalized.includes('cpu') || normalized.includes('vi-xu-ly')) return 'cpu';
    if (normalized === 'mainboard' || normalized.includes('mainboard') || normalized.includes('bo-mach')) return 'mainboard';
    if (normalized === 'ram' || normalized.includes('ram') || normalized.includes('bo-nho')) return 'ram';
    if (normalized === 'ssd' || normalized.includes('ssd') || normalized.includes('storage') || normalized.includes('o-cung') || normalized.includes('hdd')) return 'ssd';
    if (normalized === 'vga' || normalized.includes('vga') || normalized.includes('gpu') || normalized.includes('card-man-hinh')) return 'vga';
    if (normalized === 'psu' || normalized.includes('psu') || normalized.includes('nguon')) return 'psu';
    if (normalized === 'cooling' || normalized.includes('cooling') || normalized.includes('tan-nhiet')) return 'cooling';
    if (normalized === 'case' || normalized.includes('case') || normalized.includes('vo-may-tinh')) return 'case';
    if (normalized === 'monitor' || normalized.includes('monitor') || normalized.includes('man-hinh')) return 'monitor';
    if (normalized === 'keyboard' || normalized.includes('keyboard') || normalized.includes('ban-phim')) return 'keyboard';
    if (normalized === 'mouse' || normalized.includes('mouse') || normalized.includes('chuot')) return 'mouse';
    if (normalized === 'headphone' || normalized.includes('headphone') || normalized.includes('headset') || normalized.includes('tai-nghe')) return 'headphone';
    return null;
  }

  private checkPendingBuildItem(): void {
    try {
      const raw = sessionStorage.getItem('el-tech.pending-pc-build-item');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      sessionStorage.removeItem('el-tech.pending-pc-build-item');
      if (!parsed) return;

      const rawCat = String(parsed.category || parsed.categorySlug || '');
      const mappedCat = this.mapCategorySlugToBomCategory(rawCat);
      if (!mappedCat) return;

      const common = (parsed.commonSpec || {}) as Record<string, unknown>;
      const rawWattage = common['wattage'] ?? common['power_consumption'] ?? parsed.wattage;
      let configuredWattage: number | undefined;
      if (typeof rawWattage === 'number' && !Number.isNaN(rawWattage)) {
        configuredWattage = rawWattage;
      } else if (typeof rawWattage === 'string' && !Number.isNaN(Number(rawWattage))) {
        configuredWattage = Number(rawWattage);
      }

      const rawParsedTdp = parsed.tdp;
      const parsedTdp = typeof rawParsedTdp === 'number' && !Number.isNaN(rawParsedTdp) ? rawParsedTdp
        : (typeof rawParsedTdp === 'string' && !Number.isNaN(Number(rawParsedTdp))) ? Number(rawParsedTdp)
        : undefined;

      const item: SwapItem = {
        id: parsed.id || `sku-${parsed.skuId || parsed.productId}`,
        skuId: Number(parsed.skuId || parsed.productId) || 0,
        name: parsed.name || 'Linh kiện PC',
        brand: parsed.brand || 'EL-TECH',
        category: mappedCat,
        price: Number(parsed.price) || 0,
        tdp: mappedCat === 'psu' ? (configuredWattage ?? parsedTdp ?? 650) : (configuredWattage ?? parsedTdp ?? 45),
        wattage: configuredWattage,
        specs: parsed.specs || parsed.model || '',
        tag: parsed.tag || undefined,
        imageUrl: parsed.imageUrl || (parsed.media && parsed.media[0]?.url) || '/images/products/placeholder.webp',
        socket: parsed.socket,
        memoryType: parsed.memoryType,
        stockStatus: 'Sẵn hàng tại kho',
        commonSpec: parsed.commonSpec,
      };

      const previousItem = this.bomSlots().find((s) => s.key === mappedCat)?.item;
      this.bomSlots.update((slots) =>
        slots.map((s) => (s.key === mappedCat ? { ...s, item } : s))
      );
      this.saveDraftToStorage();

      if (previousItem && previousItem.skuId !== item.skuId) {
        this.showNotification(`Đã thay thế "${previousItem.name}" bằng "${item.name}" trong cấu hình PC.`);
      } else {
        this.showNotification(`Đã thêm "${item.name}" vào cấu hình PC.`);
      }
    } catch (_error) {
      void _error;
    }
  }

  private checkSwapSlotQueryParam(): void {
    const swapSlot = this.route.snapshot.queryParamMap.get('swapSlot');
    if (swapSlot) {
      const matched = this.bomSlots().find((s) => s.key === swapSlot);
      if (matched) {
        void this.openSwapModal(matched);
      }
    }
  }

  private async loadCatalogAndBundles(): Promise<void> {
    try {
      const [bundles, components] = await Promise.all([
        this.pcBuildService.getBundles(),
        this.pcBuildService.getComponents(),
      ]);
      this.bundles.set(bundles);

      const catalogMap: Record<string, SwapItem[]> = {};
      for (const comp of components) {
        if (!catalogMap[comp.category]) {
          catalogMap[comp.category] = [];
        }
        const common = (comp.commonSpec || {}) as Record<string, unknown>;
        const rawWattage = common['wattage'] ?? common['power_consumption'] ?? comp.wattage;
        let configuredWattage: number | undefined;
        if (typeof rawWattage === 'number' && !Number.isNaN(rawWattage)) {
          configuredWattage = rawWattage;
        } else if (typeof rawWattage === 'string' && !Number.isNaN(Number(rawWattage))) {
          configuredWattage = Number(rawWattage);
        }
        catalogMap[comp.category].push({
          ...comp,
          wattage: configuredWattage ?? comp.wattage,
          tdp: comp.category === 'psu'
            ? (configuredWattage ?? comp.wattage ?? comp.tdp ?? 650)
            : (configuredWattage ?? comp.tdp),
        });
      }
      this.liveCatalog.set(catalogMap);

      const bundleParam = this.route.snapshot.queryParamMap.get('bundle') || this.route.snapshot.queryParamMap.get('bundleId');
      if (bundleParam && bundles.length > 0) {
        const matched = bundles.find(
          (b) => String(b.id) === bundleParam || b.slug === bundleParam
        );
        if (matched) {
          const hasItems = this.bomSlots().some((s) => s.item !== null);
          if (hasItems) {
            const isDifferent = DEFAULT_BOM_SLOTS.some((slot) => {
              const currentItem = this.bomSlots().find((s) => s.key === slot.key)?.item;
              const bundleLine = matched.build.lines.find((l) => l.category === slot.key);
              if (!currentItem && !bundleLine) return false;
              if (!currentItem || !bundleLine) return true;
              return currentItem.skuId !== bundleLine.skuId;
            });

            if (isDifferent) {
              this.pendingBundleToApply.set(matched);
              this.overwriteModalOpen.set(true);
            } else {
              const matchedIndex = bundles.indexOf(matched);
              this.currentBundleIndex.set(matchedIndex >= 0 ? matchedIndex : 0);
            }
          } else {
            const matchedIndex = bundles.indexOf(matched);
            this.currentBundleIndex.set(matchedIndex >= 0 ? matchedIndex : 0);
            this.applyBundle(matched, components);
            this.saveDraftToStorage();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load PC builder data from backend API', error);
    }
  }

  private applyBundle(bundle: BundleResponse, allComponents?: readonly SwapItem[]): void {
    const components = allComponents ?? Object.values(this.liveCatalog()).flat();
    const componentBySkuId = new Map(components.map((c) => [c.skuId, c]));

    this.bomSlots.set(
      DEFAULT_BOM_SLOTS.map((slot) => {
        const line = bundle.build.lines.find((l) => l.category === slot.key);
        if (!line) {
          return { ...slot, item: null };
        }
        const existing = componentBySkuId.get(line.skuId);
        if (existing) {
          const common = (existing.commonSpec || {}) as Record<string, unknown>;
          const rawWattage = common['wattage'] ?? common['power_consumption'] ?? existing.wattage ?? line.wattage;
          const wattage = typeof rawWattage === 'number' ? rawWattage : (!Number.isNaN(Number(rawWattage)) ? Number(rawWattage) : undefined);
          return {
            ...slot,
            item: {
              ...existing,
              wattage: wattage ?? existing.wattage,
              tdp: slot.key === 'psu' ? (wattage ?? existing.tdp ?? 650) : (wattage ?? existing.tdp),
            },
          };
        }
        const rawWattage = line.wattage;
        const wattage = typeof rawWattage === 'number' ? rawWattage : (!Number.isNaN(Number(rawWattage)) ? Number(rawWattage) : undefined);
        const fallbackItem: SwapItem = {
          id: `sku-${line.skuId}`,
          skuId: line.skuId,
          name: line.name,
          brand: 'EL-TECH',
          category: line.category,
          price: Number(line.unitPrice),
          tdp: slot.key === 'psu' ? (wattage ?? line.tdp ?? 650) : (line.tdp ?? wattage ?? 45),
          wattage,
          specs: line.specs,
          tag: line.socket ? `Socket ${line.socket}` : line.memoryType ? line.memoryType : undefined,
          imageUrl: line.imageUrl || '/images/products/placeholder.webp',
          socket: line.socket,
          memoryType: line.memoryType,
          stockStatus: 'Sẵn hàng tại kho',
        };
        return { ...slot, item: fallbackItem };
      })
    );
    this.saveDraftToStorage();
  }

  protected readonly activeItemCount = computed<number>(() => {
    return this.bomSlots().filter((slot) => slot.item !== null).length;
  });

  protected readonly totalHardwarePrice = computed<number>(() => {
    return this.bomSlots().reduce((acc, slot) => acc + (slot.item?.price ?? 0), 0);
  });

  protected readonly currentSocket = computed<string>(() => {
    const cpu = this.bomSlots().find((s) => s.key === 'cpu')?.item;
    return cpu?.socket || '';
  });

  protected readonly currentRamType = computed<string>(() => {
    const ram = this.bomSlots().find((s) => s.key === 'ram')?.item;
    return ram?.memoryType || '';
  });

  protected readonly currentPsuWattage = computed<number>(() => {
    const psu = this.bomSlots().find((s) => s.key === 'psu')?.item;
    return psu?.wattage || psu?.tdp || 0;
  });

  protected readonly fullLoadTdp = computed<number>(() => {
    const slots = this.bomSlots();
    const consumingSlots = slots.filter((s) => s.section === 'core' && s.key !== 'psu' && s.item !== null);
    if (consumingSlots.length === 0) {
      return 0;
    }

    const totalComponentTdp = consumingSlots.reduce(
      (acc, s) => acc + (typeof s.item?.tdp === 'number' && !Number.isNaN(s.item.tdp) ? s.item.tdp : 0),
      0
    );
    const hasCoreComponent = consumingSlots.some(
      (s) => s.key === 'cpu' || s.key === 'vga' || s.key === 'mainboard'
    );

    if (totalComponentTdp === 0 && !hasCoreComponent) {
      return 0;
    }

    const baseSystemPower = hasCoreComponent ? 50 : 0;
    return totalComponentTdp + baseSystemPower;
  });

  protected readonly minPsuRecommended = computed<number>(() => {
    const load = this.fullLoadTdp();
    if (load === 0) {
      return 0;
    }
    const minCalculated = Math.ceil((load * 1.25) / 50) * 50;
    return Math.max(450, minCalculated);
  });

  protected readonly marginPercent = computed<number>(() => {
    const chosen = this.currentPsuWattage();
    const load = this.fullLoadTdp();
    if (load <= 0 || chosen <= 0) {
      return 0;
    }
    return Math.round(((chosen - load) / load) * 100);
  });

  protected readonly wattagePercent = computed<number>(() => {
    const chosen = this.currentPsuWattage();
    const load = this.fullLoadTdp();
    if (chosen <= 0 || load <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((load / chosen) * 100));
  });

  protected resetBuild(): void {
    this.currentBundleIndex.set(0);
    this.bomSlots.set(DEFAULT_BOM_SLOTS.map((s) => ({ ...s, item: null })));
    this.clearDraftStorage();
    this.showNotification('Đã làm mới và xóa toàn bộ linh kiện trong cấu hình PC.');
  }

  protected togglePreset(): void {
    const list = this.bundles();
    if (list.length === 0) return;
    const nextIndex = (this.currentBundleIndex() + 1) % list.length;
    this.currentBundleIndex.set(nextIndex);
    this.applyBundle(list[nextIndex]);
    this.showNotification(`Đã chuyển sang cấu hình mẫu "${list[nextIndex].name}".`);
  }

  protected clearSlot(key: BomCategory): void {
    const slot = this.bomSlots().find((s) => s.key === key);
    this.bomSlots.update((slots) =>
      slots.map((s) => (s.key === key ? { ...s, item: null } : s))
    );
    this.saveDraftToStorage();
    if (slot?.item) {
      this.showNotification(`Đã bỏ ${slot.categoryName} khỏi cấu hình.`);
    }
  }

  protected async openSwapModal(slot: BomSlot): Promise<void> {
    this.currentModalCategoryKey.set(slot.key);
    this.currentModalCategoryName.set(slot.categoryName);
    this.currentModalSlot.set({
      slotKey: slot.key,
      slotName: slot.categoryName,
      item: slot.item,
    });
    this.swapModalOpen.set(true);

    const cached = this.liveCatalog()[slot.key];
    if (cached && cached.length > 0) {
      this.currentModalAvailableItems.set(cached);
    } else {
      this.currentModalAvailableItems.set([]);
    }

    this.isModalLoading.set(true);
    try {
      const items = await this.pcBuildService.getComponents(slot.key);
      const mappedItems = items.map((it) => {
        const common = (it.commonSpec || {}) as Record<string, unknown>;
        const rawWattage = common['wattage'] ?? common['power_consumption'] ?? it.wattage;
        let configuredWattage: number | undefined;
        if (typeof rawWattage === 'number' && !Number.isNaN(rawWattage)) {
          configuredWattage = rawWattage;
        } else if (typeof rawWattage === 'string' && !Number.isNaN(Number(rawWattage))) {
          configuredWattage = Number(rawWattage);
        }
        return {
          ...it,
          wattage: configuredWattage ?? it.wattage,
          tdp: slot.key === 'psu'
            ? (configuredWattage ?? it.wattage ?? it.tdp ?? 650)
            : (configuredWattage ?? it.tdp),
        };
      });
      this.currentModalAvailableItems.set(mappedItems);
      this.liveCatalog.update((map) => ({ ...map, [slot.key]: mappedItems }));
    } catch (error) {
      console.error('Failed to load components for slot', slot.key, error);
    } finally {
      this.isModalLoading.set(false);
    }
  }

  protected onComponentSelected(item: SwapItem): void {
    const categoryKey = this.currentModalCategoryKey() as BomCategory;
    const previousItem = this.bomSlots().find((s) => s.key === categoryKey)?.item;

    const common = (item.commonSpec || {}) as Record<string, unknown>;
    const rawWattage = common['wattage'] ?? common['power_consumption'] ?? item.wattage;
    let configuredWattage: number | undefined;
    if (typeof rawWattage === 'number' && !Number.isNaN(rawWattage)) {
      configuredWattage = rawWattage;
    } else if (typeof rawWattage === 'string' && !Number.isNaN(Number(rawWattage))) {
      configuredWattage = Number(rawWattage);
    }

    const itemWithWattage: SwapItem = {
      ...item,
      wattage: configuredWattage ?? item.wattage,
      tdp: categoryKey === 'psu'
        ? (configuredWattage ?? item.wattage ?? item.tdp ?? 650)
        : (configuredWattage ?? item.tdp),
    };

    this.bomSlots.update((slots) =>
      slots.map((s) => (s.key === categoryKey ? { ...s, item: itemWithWattage } : s))
    );
    this.saveDraftToStorage();
    if (previousItem && previousItem.skuId !== item.skuId) {
      this.showNotification(`Đã thay thế "${previousItem.name}" bằng "${item.name}" trong cấu hình PC.`);
    } else {
      this.showNotification(`Đã thêm "${item.name}" vào cấu hình PC.`);
    }
  }

  protected printQuotation(): void {
    window.print();
  }

  protected shareLink(): void {
    const url = window.location.href;
    void navigator.clipboard.writeText(url);
    this.linkCopied.set(true);
    setTimeout(() => this.linkCopied.set(false), 3000);
  }

  protected async proceedToCheckout(): Promise<void> {
    await this.packageAndSendToCart();
    void this.router.navigate(['/checkout']);
  }

  protected async addToCartWhole(): Promise<void> {
    await this.packageAndSendToCart();
    this.cart.openDrawer();
  }

  private async packageAndSendToCart(): Promise<void> {
    const activeSlots = this.bomSlots().filter((s) => s.item !== null);
    if (activeSlots.length === 0) return;

    this.adding.set(true);
    try {
      const items = activeSlots.map((s) => ({
        skuId: s.item!.skuId,
        quantity: 1,
      }));

      const list = this.bundles();
      const currentBundle = list[this.currentBundleIndex() % list.length];
      const buildName = currentBundle
        ? `EL-TECH PC (${currentBundle.name})`
        : 'EL-TECH Custom PC Builder';

      await this.cart.addBuild({
        buildName,
        buildType: 'CUSTOM',
        items,
        hasAssemblyService: this.serviceAssembly(),
      });

      this.clearDraftStorage();
      this.bomSlots.set(DEFAULT_BOM_SLOTS.map((s) => ({ ...s, item: null })));
      this.currentBundleIndex.set(0);
    } finally {
      this.adding.set(false);
    }
  }
}
