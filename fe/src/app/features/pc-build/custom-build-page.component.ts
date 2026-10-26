import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppIconModule, ButtonDirective, SelectComponent, SelectOption } from '../../components/atoms';
import { VndPipe } from '../../lib/vnd.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';
import { CartService } from '../../services/cart.service';
import { PcBuildService, BundleResponse } from '../../services/pc-build.service';
import { ComponentSwapModalComponent, SwapItem, SwapSlotItem } from './component-swap-modal.component';

export type BomCategory = 'cpu' | 'mainboard' | 'ram' | 'ssd' | 'vga' | 'psu' | 'cooling' | 'case';

export type BomSlot = {
  readonly key: BomCategory;
  readonly number: string;
  readonly categoryName: string;
  readonly defaultSpecTag: string;
  item: SwapItem | null;
};

const DEFAULT_BOM_SLOTS: readonly Omit<BomSlot, 'item'>[] = [
  { key: 'cpu', number: '01', categoryName: 'Vi xử lý / CPU', defaultSpecTag: 'LGA1700 / AM5' },
  { key: 'mainboard', number: '02', categoryName: 'Bo mạch chủ / Mainboard', defaultSpecTag: 'Socket LGA1700 / AM5' },
  { key: 'ram', number: '03', categoryName: 'Bộ nhớ trong / RAM', defaultSpecTag: 'DDR5 Dual Channel' },
  { key: 'ssd', number: '04', categoryName: 'Ổ cứng thể rắn / SSD', defaultSpecTag: 'Gen 4.0 x4' },
  { key: 'vga', number: '05', categoryName: 'Card đồ họa / VGA', defaultSpecTag: 'PCIe 4.0 / 5.0' },
  { key: 'psu', number: '06', categoryName: 'Nguồn máy tính / PSU', defaultSpecTag: '80 Plus Gold ATX3.0' },
  { key: 'cooling', number: '07', categoryName: 'Tản nhiệt CPU / Cooling', defaultSpecTag: 'Radiator 360mm / Air' },
  { key: 'case', number: '08', categoryName: 'Vỏ máy tính / Case', defaultSpecTag: 'Mid Tower ATX' },
];

@Component({
  selector: 'app-custom-build-page',
  imports: [VndPipe, AppIconModule, ButtonDirective, SelectComponent, ComponentSwapModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="w-full bg-canvas min-h-screen pb-16">
      <!-- Status & Utility Bar -->
      <header class="w-full px-4 sm:px-6 lg:px-8 py-4 bg-surface border-b border-line shadow-sm">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-surface-alt flex items-center justify-center text-foreground font-bold border border-line">
              <lucide-icon name="cpu" class="size-5 text-primary" aria-hidden="true"></lucide-icon>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-base sm:text-lg font-bold text-foreground">Xây Dựng Cấu Hình PC Builder</h1>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary tracking-wide border border-primary/20">
                  TƯƠNG THÍCH HOÀN TOÀN
                </span>
              </div>
              <p class="text-xs text-muted mt-0.5">Hệ thống kiểm tra điện áp nguồn, chuẩn socket LGA1700 / AM5 và kích thước vỏ case theo thời gian thực.</p>
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
              <span>Tạo mới</span>
            </button>

            <button
              type="button"
              (click)="togglePreset()"
              class="h-9 px-3.5 rounded-lg bg-surface-alt hover:bg-border text-foreground font-bold flex items-center gap-1.5 transition-colors border border-line cursor-pointer"
              title="Đổi giữa các cấu hình PC mẫu"
            >
              <lucide-icon name="refresh-cw" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
              <span>{{ activePresetLabel() }}</span>
            </button>

            <button
              type="button"
              (click)="printQuotation()"
              class="h-9 px-3.5 rounded-lg bg-surface-alt hover:bg-border text-foreground font-bold flex items-center gap-1.5 transition-colors border border-line cursor-pointer"
              title="In báo giá cấu hình chi tiết"
            >
              <lucide-icon name="printer" class="size-3.5 text-muted" aria-hidden="true"></lucide-icon>
              <span>Xuất báo giá</span>
            </button>

            <button
              type="button"
              (click)="shareLink()"
              class="h-9 px-3.5 rounded-lg bg-surface-alt hover:bg-border text-foreground font-bold flex items-center gap-1.5 transition-colors border border-line cursor-pointer relative"
              title="Sao chép liên kết cấu hình"
            >
              <lucide-icon name="share-2" class="size-3.5 text-muted" aria-hidden="true"></lucide-icon>
              <span>{{ linkCopied() ? 'Đã sao chép link' : 'Chia sẻ link' }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Workspace (8 Cols BOM / 4 Cols Summary) -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left Section: BOM Slots & Diagnostics (8 cols) -->
          <div class="lg:col-span-8 space-y-4">
            <!-- Compatibility & Wattage Metric Panel (PCB-006) -->
            <div class="rounded-xl p-4 sm:p-5 bg-surface shadow-sm border border-line space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-line">
                <div class="flex items-center gap-2.5">
                  <lucide-icon name="shield-check" class="size-6 text-primary shrink-0" aria-hidden="true"></lucide-icon>
                  <div>
                    <span class="text-xs sm:text-sm font-bold text-foreground block">Kiểm tra tương thích & Công suất nguồn</span>
                    <p class="text-xs text-muted">
                      Socket {{ currentSocket() }} khớp với Bo mạch chủ, RAM {{ currentRamType() }} tương thích cấu hình XMP / EXPO.
                    </p>
                  </div>
                </div>
                <div class="px-2.5 py-1 rounded bg-surface-alt border border-line text-[11px] font-mono text-foreground whitespace-nowrap">
                  <span>PCIe Bandwidth: </span>
                  <strong class="text-primary font-bold">Gen 5.0 READY</strong>
                </div>
              </div>

              <!-- Wattage Bar -->
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono flex-wrap gap-2">
                  <span class="text-muted">Ước tính tiêu thụ tối đa: <strong class="text-foreground">{{ fullLoadTdp() }}W</strong></span>
                  <span class="text-muted">
                    PSU đề xuất: <strong class="text-foreground">{{ minPsuRecommended() }}W</strong> | PSU đã chọn:
                    <strong class="text-primary font-bold">{{ currentPsuWattage() }}W (Margin {{ marginPercent() >= 0 ? '+' : '' }}{{ marginPercent() }}%)</strong>
                  </span>
                </div>

                <!-- Progress Bar Graphic -->
                <div class="w-full h-3 bg-surface-alt rounded-full overflow-hidden flex p-0.5 border border-line">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [class.bg-primary]="wattagePercent() <= 80"
                    [class.bg-amber-400]="wattagePercent() > 80 && wattagePercent() <= 100"
                    [class.bg-danger]="wattagePercent() > 100"
                    [style.width.%]="wattagePercent()"
                  ></div>
                </div>

                <div class="flex justify-between items-center text-[10px] text-muted font-mono pt-0.5 flex-wrap gap-1">
                  <span>0W (Idle 48W)</span>
                  <span>{{ fullLoadTdp() }}W (TDP Full Load)</span>
                  <span>{{ minPsuRecommended() }}W (Min Spec)</span>
                  <span class="text-primary font-bold">{{ currentPsuWattage() }}W Gold ({{ marginPercent() >= 20 ? 'Đạt chuẩn an toàn' : 'Cần chú ý công suất' }})</span>
                </div>
              </div>
            </div>

            <!-- BOM Hardware Rows List (8 Core Slots) -->
            <div class="space-y-3">
              @for (slot of bomSlots(); track slot.key) {
                @if (slot.item; as item) {
                  <!-- Configured Slot -->
                  <div class="rounded-xl bg-surface shadow-sm border border-line p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/50 transition-colors">
                    <!-- Slot Identity & Hardware Info -->
                    <div class="flex items-start md:items-center gap-3 flex-1 min-w-0">
                      <div class="size-8 rounded-lg bg-surface-alt flex items-center justify-center shrink-0 border border-line font-bold text-xs text-muted">
                        {{ slot.number }}
                      </div>

                      <div class="size-12 rounded-lg bg-surface-alt border border-line shrink-0 p-1 flex items-center justify-center overflow-hidden">
                        <img
                          [src]="item.imageUrl || '/images/products/placeholder.webp'"
                          [alt]="item.name"
                          class="size-full object-contain"
                          (error)="onImageError($event)"
                        >
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-alt text-muted border border-line">
                            {{ slot.categoryName }}
                          </span>
                          @if (item.tag) {
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono text-primary font-bold bg-primary/10">
                              {{ item.tag }}
                            </span>
                          }
                        </div>

                        <h2 class="text-xs sm:text-sm font-bold text-foreground truncate mt-1">{{ item.name }}</h2>
                        <p class="text-[11px] text-muted truncate mt-0.5">{{ item.specs }}</p>
                      </div>
                    </div>

                    <!-- Slot Price & Actions -->
                    <div class="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-line">
                      <div class="text-left md:text-right">
                        <div class="text-xs sm:text-sm font-bold text-foreground tabular">{{ item.price | vnd }}</div>
                        <div class="text-[10px] text-muted">Bảo hành 36T</div>
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
                  <!-- Empty Dashed Slot (PB-02) -->
                  <div class="rounded-xl border-2 border-dashed border-line hover:border-primary/60 bg-surface-alt/10 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                      <div class="size-8 rounded-lg bg-surface border border-dashed border-line flex items-center justify-center shrink-0 font-bold text-xs text-muted">
                        {{ slot.number }}
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface text-muted border border-line">
                            {{ slot.categoryName }}
                          </span>
                          <span class="text-[10px] text-muted font-mono">{{ slot.defaultSpecTag }}</span>
                        </div>
                        <p class="text-xs text-muted italic mt-1">Chưa chọn linh kiện cho vị trí này (Tùy chọn tương thích chuẩn)</p>
                      </div>
                    </div>

                    <div class="shrink-0 w-full md:w-auto text-right">
                      <button
                        type="button"
                        (click)="openSwapModal(slot)"
                        class="w-full md:w-auto h-8 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        title="Chọn linh kiện cho ô này"
                      >
                        <lucide-icon name="plus" class="size-3.5" aria-hidden="true"></lucide-icon>
                        <span>+ Chọn {{ slot.categoryName }}</span>
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
                <span class="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">MIỄN PHÍ</span>
              </div>
              <div class="grid sm:grid-cols-2 gap-2.5 pt-1 text-[11px]">
                <label class="p-3 rounded-lg bg-surface-alt border border-line flex items-start gap-3 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    [checked]="serviceAssembly()"
                    (change)="serviceAssembly.set(!serviceAssembly())"
                    class="mt-0.5 size-4 rounded border-line text-primary focus:ring-primary accent-primary cursor-pointer"
                  >
                  <div class="space-y-0.5 min-w-0">
                    <div class="font-bold text-foreground flex items-center justify-between">
                      <span>Lắp ráp &amp; đi dây chuyên nghiệp</span>
                      <span class="text-primary font-bold">0 đ</span>
                    </div>
                    <p class="text-muted text-[11px] leading-relaxed">Kỹ thuật viên bóc seal, đi dây nẹp thẩm mỹ, luồn dây âm thân case.</p>
                  </div>
                </label>

                <label class="p-3 rounded-lg bg-surface-alt border border-line flex items-start gap-3 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    [checked]="serviceStressTest()"
                    (change)="serviceStressTest.set(!serviceStressTest())"
                    class="mt-0.5 size-4 rounded border-line text-primary focus:ring-primary accent-primary cursor-pointer"
                  >
                  <div class="space-y-0.5 min-w-0">
                    <div class="font-bold text-foreground flex items-center justify-between">
                      <span>Cài đặt HĐH &amp; Stress Test 24h</span>
                      <span class="text-primary font-bold">0 đ</span>
                    </div>
                    <p class="text-muted text-[11px] leading-relaxed">Kiểm tra tải FurMark, Cinebench R23 và cập nhật BIOS bo mạch mới nhất.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Right Section: Sticky Summary & Checkout Drawer (4 cols) -->
          <div class="lg:col-span-4 sticky top-24 space-y-4">
            <div class="rounded-xl p-5 bg-surface shadow-sm border border-line space-y-4">
              <div class="border-b border-line pb-3">
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted">TỔNG KẾT BẢO TOÀN DÀN MÁY</span>
                <h3 class="text-sm font-bold text-foreground mt-0.5">Báo Giá Chi Tiết PC Tự Ráp</h3>
              </div>

              <!-- Showroom Branch Selector & Inventory Telemetry (PB-01) -->
              <div class="space-y-2 pb-2 border-b border-line">
                <label for="branch-selector" class="block text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Chi nhánh lắp ráp / nhận máy
                </label>
                <app-select
                  [options]="branchOptions"
                  [value]="selectedBranch()"
                  (valueChange)="onBranchSelect($event)"
                  size="sm"
                  ariaLabel="Chi nhánh lắp ráp / nhận máy"
                />

                <!-- Stock readiness badge -->
                <div class="p-2.5 rounded-lg bg-surface-alt border border-line flex items-center gap-2 text-xs">
                  @if (isAllInStockAtBranch()) {
                    <span class="size-2 rounded-full bg-primary shrink-0 inline-block"></span>
                    <div class="min-w-0">
                      <span class="text-primary font-bold block text-[11px]">Đủ linh kiện tại chi nhánh</span>
                      <p class="text-[10px] text-muted">Sẵn sàng lắp ráp ngay trong 120 phút.</p>
                    </div>
                  } @else {
                    <span class="size-2 rounded-full bg-amber-400 shrink-0 inline-block"></span>
                    <div class="min-w-0">
                      <span class="text-amber-400 font-bold block text-[11px]">Cần điều chuyển 1-2 món từ kho tổng</span>
                      <p class="text-[10px] text-muted">Thời gian lắp ráp và kiểm tra dự kiến 24h.</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-2 text-xs">
                <div class="flex items-center justify-between text-muted">
                  <span>Tổng tiền linh kiện ({{ activeItemCount() }} món):</span>
                  <span class="text-foreground font-bold tabular">{{ totalHardwarePrice() | vnd }}</span>
                </div>
                <div class="flex items-center justify-between text-muted">
                  <span>Công lắp ráp &amp; stress test:</span>
                  <span class="text-primary font-bold">0 đ (Miễn phí)</span>
                </div>
                <div class="flex items-center justify-between text-muted">
                  <span>Phí vận chuyển bọc xốp cẩn thận:</span>
                  <span class="text-primary font-bold">MIỄN PHÍ</span>
                </div>
                <div class="w-full h-px bg-border my-1"></div>
                <div class="flex items-baseline justify-between pt-1">
                  <div>
                    <div class="text-xs font-black uppercase text-foreground">TỔNG THANH TOÁN</div>
                    <div class="text-[10px] text-muted">Bao gồm VAT 10% &amp; Hóa đơn GTGT</div>
                  </div>
                  <div class="text-right">
                    <div class="text-xl sm:text-2xl font-black text-primary tabular">{{ totalHardwarePrice() | vnd }}</div>
                    <div class="text-[10px] text-primary font-bold">Tiết kiệm trọn gói 1.800.000 đ</div>
                  </div>
                </div>
              </div>

              <!-- Custom COD Regulations Policy (PAY-011) -->
              <div class="p-3 rounded-lg bg-surface-alt border border-line space-y-1.5 text-xs text-muted">
                <div class="flex items-center gap-1.5 text-foreground font-bold text-[11px]">
                  <lucide-icon name="shield-check" class="size-4 text-warning" aria-hidden="true"></lucide-icon>
                  <span>Quy định đặt cọc máy ráp (COD - PAY-011)</span>
                </div>
                <p class="text-[11px] leading-relaxed">
                  Máy tính ráp theo yêu cầu áp dụng quy tắc đặt cọc: Tối thiểu <strong class="text-foreground">10%</strong> để kỹ thuật bóc seal và lắp đặt an toàn.
                </p>
                <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div class="bg-surface p-2 rounded border border-line">
                    <div class="text-muted text-[10px]">Cọc trước (VietQR):</div>
                    <div class="font-bold text-primary tabular text-xs mt-0.5">{{ depositAmount() | vnd }}</div>
                  </div>
                  <div class="bg-surface p-2 rounded border border-line">
                    <div class="text-muted text-[10px]">Còn lại COD khi nhận:</div>
                    <div class="font-bold text-foreground tabular text-xs mt-0.5">{{ remainingCodAmount() | vnd }}</div>
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
                  class="w-full text-xs font-bold uppercase tracking-wider"
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
                  class="w-full text-xs font-bold"
                  [disabled]="activeItemCount() === 0 || adding()"
                  (click)="addToCartWhole()"
                >
                  <lucide-icon name="plus" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>Thêm trọn bộ vào giỏ hàng</span>
                </button>
              </div>

              <!-- Assurance Micro Badges -->
              <div class="pt-2 flex items-center justify-between text-[11px] text-muted border-t border-line">
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
              <div class="flex items-center justify-between text-foreground font-bold text-[11px]">
                <span class="flex items-center gap-1.5">
                  <lucide-icon name="cpu" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Kiến trúc hệ thống</span>
                </span>
                <span class="font-mono text-primary font-bold">x86-64 / PCIe 5.0</span>
              </div>
              <p class="text-[11px] leading-relaxed">
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
    </section>
  `,
})
export class CustomBuildPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cart = inject(CartService);
  private readonly pcBuildService = inject(PcBuildService);

  protected readonly onImageError = handleProductImageError;
  protected readonly selectedBranch = signal<'hcm' | 'hanoi' | 'danang'>('hcm');
  protected readonly serviceAssembly = signal(true);
  protected readonly serviceStressTest = signal(true);

  protected readonly bundles = signal<readonly BundleResponse[]>([]);
  protected readonly liveCatalog = signal<Record<string, readonly SwapItem[]>>({});
  protected readonly currentBundleIndex = signal<number>(0);
  protected readonly linkCopied = signal(false);
  protected readonly adding = signal(false);

  protected readonly isAllInStockAtBranch = computed<boolean>(() => {
    const branch = this.selectedBranch();
    if (branch === 'danang') {
      return this.activeItemCount() <= 4;
    }
    return true;
  });

  protected readonly branchOptions: readonly SelectOption[] = [
    { value: 'hcm', label: 'TP.HCM - 280 Ba Tháng Hai, Quận 10' },
    { value: 'hanoi', label: 'Hà Nội - 45 Thái Hà, Đống Đa' },
    { value: 'danang', label: 'Đà Nẵng - 112 Hàm Nghi, Thanh Khê' },
  ];

  protected onBranchSelect(value: string): void {
    this.selectedBranch.set(value as 'hcm' | 'hanoi' | 'danang');
  }

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

  async ngOnInit(): Promise<void> {
    await this.loadCatalogAndBundles();
    this.checkPendingBuildItem();
    this.checkSwapSlotQueryParam();
  }

  private checkPendingBuildItem(): void {
    try {
      const raw = sessionStorage.getItem('el-tech.pending-pc-build-item');
      if (raw) {
        const item = JSON.parse(raw) as SwapItem;
        if (item && item.category) {
          const categoryKey = item.category as BomCategory;
          this.bomSlots.update((slots) =>
            slots.map((s) => (s.key === categoryKey ? { ...s, item } : s))
          );
          sessionStorage.removeItem('el-tech.pending-pc-build-item');
        }
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
        catalogMap[comp.category].push(comp);
      }
      this.liveCatalog.set(catalogMap);

      if (bundles.length > 0) {
        this.applyBundle(bundles[0], components);
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
          return { ...slot, item: existing };
        }
        const fallbackItem: SwapItem = {
          id: `sku-${line.skuId}`,
          skuId: line.skuId,
          name: line.name,
          brand: 'EL-TECH',
          category: line.category,
          price: Number(line.unitPrice),
          tdp: line.tdp ?? line.wattage ?? 45,
          specs: line.specs,
          tag: line.socket ? `Socket ${line.socket}` : line.memoryType ? line.memoryType : undefined,
          socket: line.socket,
          memoryType: line.memoryType,
          stockStatus: 'Sẵn hàng tại HN & HCM',
        };
        return { ...slot, item: fallbackItem };
      })
    );
  }

  protected readonly activeItemCount = computed<number>(() => {
    return this.bomSlots().filter((slot) => slot.item !== null).length;
  });

  protected readonly totalHardwarePrice = computed<number>(() => {
    return this.bomSlots().reduce((acc, slot) => acc + (slot.item?.price ?? 0), 0);
  });

  protected readonly depositAmount = computed<number>(() => {
    return Math.round(this.totalHardwarePrice() * 0.1);
  });

  protected readonly remainingCodAmount = computed<number>(() => {
    return this.totalHardwarePrice() - this.depositAmount();
  });

  protected readonly currentSocket = computed<string>(() => {
    const cpu = this.bomSlots().find((s) => s.key === 'cpu')?.item;
    return cpu?.socket || 'LGA1700';
  });

  protected readonly currentRamType = computed<string>(() => {
    const ram = this.bomSlots().find((s) => s.key === 'ram')?.item;
    return ram?.memoryType || 'DDR5';
  });

  protected readonly currentPsuWattage = computed<number>(() => {
    const psu = this.bomSlots().find((s) => s.key === 'psu')?.item;
    return psu?.tdp || 850;
  });

  protected readonly fullLoadTdp = computed<number>(() => {
    const cpuTdp = this.bomSlots().find((s) => s.key === 'cpu')?.item?.tdp || 253;
    const vgaTdp = this.bomSlots().find((s) => s.key === 'vga')?.item?.tdp || 285;
    const otherTdp = 100;
    return cpuTdp + vgaTdp + otherTdp;
  });

  protected readonly minPsuRecommended = computed<number>(() => {
    const minCalculated = Math.ceil((this.fullLoadTdp() * 1.25) / 50) * 50;
    return Math.max(650, minCalculated);
  });

  protected readonly marginPercent = computed<number>(() => {
    const chosen = this.currentPsuWattage();
    const load = this.fullLoadTdp();
    if (load <= 0) return 0;
    return Math.round(((chosen - load) / load) * 100);
  });

  protected readonly wattagePercent = computed<number>(() => {
    const chosen = this.currentPsuWattage();
    const load = this.fullLoadTdp();
    if (chosen <= 0) return 100;
    return Math.min(100, Math.round((load / chosen) * 100));
  });

  protected resetBuild(): void {
    this.currentBundleIndex.set(0);
    const list = this.bundles();
    if (list.length > 0) {
      this.applyBundle(list[0]);
    } else {
      this.bomSlots.set(DEFAULT_BOM_SLOTS.map((s) => ({ ...s, item: null })));
    }
  }

  protected togglePreset(): void {
    const list = this.bundles();
    if (list.length === 0) return;
    const nextIndex = (this.currentBundleIndex() + 1) % list.length;
    this.currentBundleIndex.set(nextIndex);
    this.applyBundle(list[nextIndex]);
  }

  protected clearSlot(key: BomCategory): void {
    this.bomSlots.update((slots) =>
      slots.map((s) => (s.key === key ? { ...s, item: null } : s))
    );
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
      this.currentModalAvailableItems.set(items);
      this.liveCatalog.update((map) => ({ ...map, [slot.key]: items }));
    } catch (error) {
      console.error('Failed to load components for slot', slot.key, error);
    } finally {
      this.isModalLoading.set(false);
    }
  }

  protected onComponentSelected(item: SwapItem): void {
    const categoryKey = this.currentModalCategoryKey() as BomCategory;
    this.bomSlots.update((slots) =>
      slots.map((s) => (s.key === categoryKey ? { ...s, item } : s))
    );
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
    } finally {
      this.adding.set(false);
    }
  }
}
