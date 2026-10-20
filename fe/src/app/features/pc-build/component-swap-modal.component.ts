import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconModule, ButtonDirective, InputDirective } from '../../components/atoms';
import { VndPipe } from '../../lib/vnd.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';

export type SwapItem = {
  readonly id: string;
  readonly skuId: number;
  readonly name: string;
  readonly brand: string;
  readonly category: string;
  readonly price: number;
  readonly tdp: number;
  readonly specs: string;
  readonly tag?: string;
  readonly imageUrl?: string;
  readonly socket?: string;
  readonly memoryType?: string;
  readonly lengthMm?: number;
  readonly stockStatus?: string;
  readonly commonSpec?: Record<string, unknown>;
};

export type SwapSlotItem = {
  readonly slotKey: string;
  readonly slotName: string;
  readonly item: SwapItem | null;
};

type PriceFilterOption = 'all' | 'under5m' | '5m-15m' | 'above15m';

type SpecFieldDefinition = {
  readonly key: string;
  readonly label: string;
  readonly unit?: string;
  readonly formatValue?: (val: unknown) => string;
};

const CATEGORY_SPEC_CONFIG: Record<string, readonly SpecFieldDefinition[]> = {
  cpu: [
    { key: 'socket', label: 'Chuẩn Socket' },
    { key: 'core_count', label: 'Số nhân', unit: 'nhân' },
    { key: 'thread_count', label: 'Số luồng', unit: 'luồng' },
    {
      key: 'integrated_gpu',
      label: 'Đồ họa tích hợp',
      formatValue: (v) => (String(v).toLowerCase() === 'true' || v === true ? 'Có iGPU' : 'Không có iGPU'),
    },
  ],
  mainboard: [
    { key: 'socket', label: 'Chuẩn Socket' },
    { key: 'chipset', label: 'Chipset' },
    { key: 'ram_type', label: 'Chuẩn RAM' },
    { key: 'form_factor', label: 'Kích thước' },
    {
      key: 'wifi_included',
      label: 'Wi-Fi tích hợp',
      formatValue: (v) => (String(v).toLowerCase() === 'true' || v === true ? 'Có Wi-Fi' : 'Không có Wi-Fi'),
    },
  ],
  ram: [
    { key: 'memory_type', label: 'Chuẩn RAM' },
    { key: 'capacity', label: 'Dung lượng', unit: 'GB' },
    { key: 'bus_speed', label: 'Tốc độ Bus', unit: 'MHz' },
    { key: 'kit_configuration', label: 'Quy cách' },
    {
      key: 'rgb',
      label: 'Đèn LED RGB',
      formatValue: (v) => (String(v).toLowerCase() === 'true' || v === true ? 'Có LED RGB' : 'Không LED'),
    },
  ],
  vga: [
    { key: 'gpu_chipset', label: 'Dòng GPU' },
    { key: 'vram_capacity', label: 'Dung lượng VRAM', unit: 'GB' },
    { key: 'cooling_fans', label: 'Số lượng quạt', unit: 'quạt' },
  ],
  ssd: [
    { key: 'form_factor', label: 'Chuẩn kích thước' },
    { key: 'pcie_generation', label: 'Giao tiếp kết nối' },
    { key: 'capacity', label: 'Dung lượng', unit: 'GB' },
  ],
  psu: [
    { key: 'wattage', label: 'Công suất', unit: 'W' },
    { key: 'efficiency_rating', label: 'Chuẩn 80 Plus' },
    { key: 'modular_cabling', label: 'Kiểu dây cáp' },
  ],
  cooling: [
    { key: 'cooler_type', label: 'Loại tản nhiệt' },
    { key: 'rgb', label: 'Đèn LED' },
    { key: 'tdp_support', label: 'Hỗ trợ TDP', unit: 'W' },
  ],
  'tan-nhiet': [
    { key: 'cooler_type', label: 'Loại tản nhiệt' },
    { key: 'rgb', label: 'Đèn LED' },
    { key: 'tdp_support', label: 'Hỗ trợ TDP', unit: 'W' },
  ],
  case: [
    { key: 'form_factor_support', label: 'Hỗ trợ Mainboard' },
    { key: 'fan_included_count', label: 'Số quạt sẵn', unit: 'quạt' },
  ],
};

function extractItemSpec(item: SwapItem, key: string): string | undefined {
  const common = item.commonSpec;
  let raw: unknown = common?.[key];

  if (raw === undefined || raw === null || raw === '') {
    if (key === 'socket') raw = item.socket;
    else if (key === 'memory_type' || key === 'ram_type') raw = item.memoryType || common?.['ram_type'] || common?.['memory_type'];
    else if (key === 'wattage' && (item.category === 'psu' || item.category === 'nguon')) raw = item.tdp || common?.['wattage'];
    else if (key === 'tdp' || key === 'tdp_support') raw = item.tdp || common?.['tdp'] || common?.['tdp_support'];
  }

  if (raw === undefined || raw === null || raw === '') return undefined;
  return String(raw);
}

@Component({
  selector: 'app-component-swap-modal',
  imports: [FormsModule, AppIconModule, ButtonDirective, InputDirective, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
        (click)="onBackdropClick($event)"
      >
        <div
          class="bg-surface rounded-2xl shadow-2xl border border-line w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header -->
          <div class="p-4 sm:p-5 bg-surface border-b border-line flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <lucide-icon name="arrow-up-down" class="size-5" aria-hidden="true"></lucide-icon>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base sm:text-lg font-bold text-foreground">Đổi linh kiện: {{ categoryName }}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
                    BẢO HÀNH CHÍNH HÃNG 36T
                  </span>
                </div>
                <p class="text-xs text-muted mt-0.5">
                  Bộ kiểm tra tự động đối chiếu Socket {{ currentSocket }}, chuẩn RAM {{ currentRamType }} và công suất nguồn tối thiểu {{ minPsuWattage }}W.
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="close()"
              class="size-8 rounded-lg bg-surface-alt hover:bg-border text-muted hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-line"
              aria-label="Đóng cửa sổ thay đổi linh kiện"
            >
              <lucide-icon name="x" class="size-4" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          <!-- Realtime Diagnostic Context Bar -->
          <div class="bg-surface-alt px-4 sm:px-5 py-2.5 border-b border-line flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-1.5 text-primary font-semibold">
                <lucide-icon name="shield-check" class="size-4" aria-hidden="true"></lucide-icon>
                <span>Nguồn hiện tại: {{ currentPsuWattage }}W (Yêu cầu tối thiểu {{ minPsuWattage }}W)</span>
              </div>
              <div class="w-px h-3.5 bg-border hidden sm:block"></div>
              <div class="flex items-center gap-1.5 text-foreground font-medium">
                <lucide-icon name="cpu" class="size-4 text-muted" aria-hidden="true"></lucide-icon>
                <span>Hệ thống: Socket {{ currentSocket }} / RAM {{ currentRamType }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-muted text-[11px]">
              <span class="size-2 rounded-full bg-primary inline-block"></span>
              <span>Cập nhật kho hàng trực tiếp</span>
            </div>
          </div>

          <!-- Filter & Search Controls -->
          <div class="p-4 border-b border-line bg-surface space-y-3 shrink-0">
            <!-- Row 1: Search, Price, Branch -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div class="sm:col-span-6 relative">
                <lucide-icon name="search" class="size-4 absolute left-3 top-3 text-muted pointer-events-none" aria-hidden="true"></lucide-icon>
                <input
                  appInput
                  type="text"
                  class="w-full pl-9 text-xs"
                  placeholder="Tìm theo tên linh kiện, mã model, thương hiệu..."
                  [ngModel]="searchQuery()"
                  (ngModelChange)="searchQuery.set($event)"
                >
              </div>

              <div class="sm:col-span-3">
                <select
                  appInput
                  class="w-full text-xs h-9"
                  [ngModel]="selectedPriceRange()"
                  (ngModelChange)="selectedPriceRange.set($event)"
                >
                  <option value="all">Mức giá: Tất cả</option>
                  <option value="under5m">Dưới 5.000.000 đ</option>
                  <option value="5m-15m">5.000.000 đ - 15.000.000 đ</option>
                  <option value="above15m">Trên 15.000.000 đ</option>
                </select>
              </div>

              <div class="sm:col-span-3">
                <select
                  appInput
                  class="w-full text-xs h-9"
                  [ngModel]="selectedBranch()"
                  (ngModelChange)="selectedBranch.set($event)"
                >
                  <option value="all">Kho: Toàn quốc (HN & HCM)</option>
                  <option value="hn">Kho Hà Nội</option>
                  <option value="hcm">Kho TP. Hồ Chí Minh</option>
                </select>
              </div>
            </div>

            <!-- Quick Brand Filter Chips -->
            @if (brands().length > 0) {
              <div class="flex items-center gap-1.5 flex-wrap text-xs">
                <span class="text-muted font-medium text-[11px] mr-1">Thương hiệu:</span>
                <button
                  type="button"
                  (click)="selectedBrand.set('')"
                  class="px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-colors cursor-pointer"
                  [class.bg-primary]="!selectedBrand()"
                  [class.text-primary-foreground]="!selectedBrand()"
                  [class.border-primary]="!selectedBrand()"
                  [class.bg-surface-alt]="selectedBrand()"
                  [class.border-line]="selectedBrand()"
                  [class.text-foreground]="selectedBrand()"
                >
                  Tất cả
                </button>
                @for (brand of brands(); track brand) {
                  <button
                    type="button"
                    (click)="selectedBrand.set(brand)"
                    class="px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-colors cursor-pointer"
                    [class.bg-primary]="selectedBrand() === brand"
                    [class.text-primary-foreground]="selectedBrand() === brand"
                    [class.border-primary]="selectedBrand() === brand"
                    [class.bg-surface-alt]="selectedBrand() !== brand"
                    [class.border-line]="selectedBrand() !== brand"
                    [class.text-foreground]="selectedBrand() !== brand"
                  >
                    {{ brand }}
                  </button>
                }
              </div>
            }

            <!-- Detailed Technical Specification Filters -->
            @if (availableSpecFilters().length > 0) {
              <div class="pt-2.5 border-t border-line space-y-2">
                <div class="flex items-center justify-between text-xs flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <lucide-icon name="sliders-horizontal" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                      <span>Thông số kỹ thuật chi tiết:</span>
                    </span>
                    @if (quickCompatibilityChip(); as chip) {
                      <button
                        type="button"
                        (click)="applyCompatibilityFilter(chip.key, chip.value)"
                        class="px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1"
                        [class.bg-primary]="isCompatibilityFilterActive(chip.key, chip.value)"
                        [class.text-primary-foreground]="isCompatibilityFilterActive(chip.key, chip.value)"
                        [class.border-primary]="isCompatibilityFilterActive(chip.key, chip.value)"
                        [class.bg-surface-alt]="!isCompatibilityFilterActive(chip.key, chip.value)"
                        [class.text-primary]="!isCompatibilityFilterActive(chip.key, chip.value)"
                        [class.border-primary/30]="!isCompatibilityFilterActive(chip.key, chip.value)"
                      >
                        <lucide-icon name="shield-check" class="size-3" aria-hidden="true"></lucide-icon>
                        <span>{{ chip.label }}</span>
                      </button>
                    }
                  </div>
                  @if (hasActiveSpecFilters()) {
                    <button
                      type="button"
                      (click)="clearAllSpecFilters()"
                      class="text-[11px] text-muted hover:text-danger font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <lucide-icon name="rotate-ccw" class="size-3" aria-hidden="true"></lucide-icon>
                      <span>Đặt lại thông số</span>
                    </button>
                  }
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  @for (spec of availableSpecFilters(); track spec.key) {
                    <div>
                      <label class="block text-[11px] font-medium text-muted mb-1 truncate" [title]="spec.label">
                        {{ spec.label }}
                        @if (spec.unit) {
                          <span class="text-[10px]">({{ spec.unit }})</span>
                        }
                      </label>
                      <select
                        appInput
                        class="w-full text-xs h-8 px-2 bg-surface-alt"
                        [ngModel]="selectedSpecs()[spec.key] || ''"
                        (ngModelChange)="onSpecFilterChange(spec.key, $event)"
                      >
                        <option value="">Tất cả</option>
                        @for (opt of spec.options; track opt.value) {
                          <option [value]="opt.value">{{ opt.label }}</option>
                        }
                      </select>
                    </div>
                  }
                </div>

                @if (selectedSpecChips().length > 0) {
                  <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span class="text-[10px] text-muted font-medium">Đang lọc:</span>
                    @for (chip of selectedSpecChips(); track chip.key) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        <span>{{ chip.label }}: {{ chip.displayValue }}</span>
                        <button
                          type="button"
                          (click)="onSpecFilterChange(chip.key, '')"
                          class="hover:text-danger cursor-pointer ml-0.5"
                          title="Gỡ tiêu chí này"
                        >
                          <lucide-icon name="x" class="size-3" aria-hidden="true"></lucide-icon>
                        </button>
                      </span>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Modal Body Content -->
          <div class="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            <!-- Currently Selected Reference Card -->
            @if (currentSlot?.item; as current) {
              <div class="p-3.5 rounded-xl bg-surface-alt border border-line space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <span class="size-2 rounded-full bg-primary inline-block"></span>
                    Linh kiện đang có trong cấu hình:
                  </span>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-surface border border-line font-bold text-primary">
                    Đang chọn
                  </span>
                </div>
                <div class="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="size-12 rounded-lg bg-surface border border-line shrink-0 p-1 flex items-center justify-center overflow-hidden">
                      <img
                        [src]="current.imageUrl || '/images/products/placeholder.webp'"
                        [alt]="current.name"
                        class="size-full object-contain"
                        (error)="onImageError($event)"
                      >
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-xs font-bold text-foreground truncate">{{ current.name }}</div>
                      <p class="text-[11px] text-muted truncate mt-0.5">{{ current.specs }}</p>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <div class="text-xs font-bold text-foreground tabular">{{ current.price | vnd }}</div>
                    <span class="text-[10px] text-muted">Giá đang tính</span>
                  </div>
                </div>
              </div>
            }

            <!-- Candidate Replacement List -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <lucide-icon name="sliders-horizontal" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Danh sách linh kiện khả dụng ({{ filteredItems().length }} sản phẩm)</span>
                </h4>
                <span class="text-[11px] text-muted">Hiển thị chênh lệch giá tự động</span>
              </div>

              @if (isLoading) {
                <div class="rounded-xl border border-line p-8 text-center bg-surface space-y-2">
                  <div class="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p class="text-xs font-bold text-foreground">Đang tải danh mục linh kiện tương thích...</p>
                </div>
              } @else if (filteredItems().length === 0) {
                <div class="rounded-xl border border-dashed border-line p-8 text-center bg-surface space-y-3">
                  <p class="text-xs font-bold text-foreground">Không tìm thấy linh kiện phù hợp với bộ lọc hiện tại</p>
                  <p class="text-[11px] text-muted">Vui lòng xóa từ khóa tìm kiếm hoặc điều chỉnh lại các tiêu chí lọc thông số kỹ thuật.</p>
                  <button
                    type="button"
                    appButton
                    variant="outline"
                    size="sm"
                    class="cursor-pointer"
                    (click)="resetAllFilters()"
                  >
                    Xóa toàn bộ bộ lọc
                  </button>
                </div>
              } @else {
                <div class="space-y-2">
                  @for (item of filteredItems(); track item.id) {
                    <div class="p-3.5 rounded-xl bg-surface border border-line hover:border-primary/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                      <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="size-14 rounded-lg bg-surface-alt border border-line shrink-0 p-1 flex items-center justify-center overflow-hidden">
                          <img
                            [src]="item.imageUrl || '/images/products/placeholder.webp'"
                            [alt]="item.name"
                            class="size-full object-contain"
                            (error)="onImageError($event)"
                          >
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-alt text-foreground border border-line">
                              {{ item.brand }}
                            </span>
                            @if (item.tag) {
                              <span class="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold">
                                {{ item.tag }}
                              </span>
                            }
                            @if (checkCompatibility(item); as comp) {
                              <span
                                class="px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1"
                                [class.bg-primary-subtle]="comp.isCompatible"
                                [class.text-primary]="comp.isCompatible"
                                [class.border-primary-subtle]="comp.isCompatible"
                                [class.bg-warning-subtle]="!comp.isCompatible"
                                [class.text-warning]="!comp.isCompatible"
                                [class.border-warning-subtle]="!comp.isCompatible"
                              >
                                <lucide-icon [name]="comp.isCompatible ? 'shield-check' : 'alert-triangle'" class="size-3" aria-hidden="true"></lucide-icon>
                                <span>{{ comp.label }}</span>
                              </span>
                            }
                            <span class="text-[11px] text-muted font-medium flex items-center gap-1">
                              <lucide-icon name="store" class="size-3 text-primary" aria-hidden="true"></lucide-icon>
                              <span>{{ item.stockStatus || 'Sẵn hàng tại HN & HCM' }}</span>
                            </span>
                          </div>
                          <h5 class="text-xs font-bold text-foreground truncate mt-1">{{ item.name }}</h5>
                          <p class="text-[11px] text-muted truncate mt-0.5">{{ item.specs }}</p>
                        </div>
                      </div>

                      <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-line">
                        <div class="text-left sm:text-right">
                          <div class="text-xs font-bold text-foreground tabular">{{ item.price | vnd }}</div>
                          @if (getPriceDifference(item.price); as diff) {
                            @if (diff > 0) {
                              <div class="text-[11px] font-bold text-warning font-mono">+{{ diff | vnd }}</div>
                            } @else if (diff < 0) {
                              <div class="text-[11px] font-bold text-primary font-mono">-{{ (-diff) | vnd }}</div>
                            } @else {
                              <div class="text-[10px] text-muted">Bằng giá (0 đ)</div>
                            }
                          }
                        </div>
                        <button
                          type="button"
                          appButton
                          variant="primary"
                          size="sm"
                          (click)="chooseItem(item)"
                          class="shrink-0 cursor-pointer"
                        >
                          <lucide-icon name="check" class="size-3.5" aria-hidden="true"></lucide-icon>
                          <span>Chọn linh kiện này</span>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-3.5 bg-surface-alt border-t border-line flex items-center justify-between text-xs text-muted">
            <div class="flex items-center gap-1.5">
              <lucide-icon name="shield-check" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
              <span>Cam kết đổi trả trong 30 ngày và bảo hành chính hãng toàn diện</span>
            </div>
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              (click)="close()"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ComponentSwapModalComponent {
  private _isOpen = false;
  private _categoryKey = '';

  @Input()
  set isOpen(value: boolean) {
    this._isOpen = value;
    if (!value) {
      this.resetAllFilters();
    }
  }
  get isOpen(): boolean {
    return this._isOpen;
  }

  @Input()
  set categoryKey(value: string) {
    if (this._categoryKey !== value) {
      this._categoryKey = value;
      this.selectedSpecs.set({});
      this.selectedBrand.set('');
      this.searchQuery.set('');
    }
  }
  get categoryKey(): string {
    return this._categoryKey;
  }

  @Input() categoryName = '';
  @Input() currentSlot: SwapSlotItem | null = null;
  @Input() availableItems: readonly SwapItem[] = [];
  @Input() currentSocket = 'LGA1700';
  @Input() currentRamType = 'DDR5';
  @Input() minPsuWattage = 650;
  @Input() currentPsuWattage = 850;
  @Input() isLoading = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() selectItem = new EventEmitter<SwapItem>();

  protected readonly onImageError = handleProductImageError;
  protected readonly searchQuery = signal('');
  protected readonly selectedBrand = signal('');
  protected readonly selectedPriceRange = signal<PriceFilterOption>('all');
  protected readonly selectedBranch = signal<'all' | 'hn' | 'hcm'>('all');
  protected readonly selectedSpecs = signal<Record<string, string>>({});

  protected readonly brands = computed<readonly string[]>(() => {
    const set = new Set<string>();
    for (const item of this.availableItems) {
      if (item.brand) set.add(item.brand);
    }
    return Array.from(set).sort();
  });

  protected readonly availableSpecFilters = computed<readonly {
    key: string;
    label: string;
    unit?: string;
    options: readonly { value: string; label: string }[];
  }[]>(() => {
    const cat = this.categoryKey.toLowerCase();
    const defs = CATEGORY_SPEC_CONFIG[cat] || [];
    const items = this.availableItems;

    const result: {
      key: string;
      label: string;
      unit?: string;
      options: { value: string; label: string }[];
    }[] = [];

    for (const def of defs) {
      const valSet = new Set<string>();
      for (const item of items) {
        const val = extractItemSpec(item, def.key);
        if (val !== undefined && val.trim() !== '') {
          valSet.add(val.trim());
        }
      }

      if (valSet.size > 0) {
        const sortedVals = Array.from(valSet).sort((a, b) => {
          const numA = Number(a);
          const numB = Number(b);
          if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
            return numA - numB;
          }
          return a.localeCompare(b);
        });

        const options = sortedVals.map((val) => {
          let label = val;
          if (def.formatValue) {
            label = def.formatValue(val);
          } else if (def.unit) {
            label = `${val} ${def.unit}`;
          }
          return { value: val, label };
        });

        result.push({
          key: def.key,
          label: def.label,
          unit: def.unit,
          options,
        });
      }
    }

    return result;
  });

  protected readonly quickCompatibilityChip = computed<{ key: string; value: string; label: string } | null>(() => {
    const cat = this.categoryKey.toLowerCase();
    if ((cat === 'cpu' || cat === 'mainboard') && this.currentSocket) {
      return {
        key: 'socket',
        value: this.currentSocket,
        label: `Socket ${this.currentSocket} (Khớp hệ thống)`,
      };
    }
    if ((cat === 'ram' || cat === 'mainboard') && this.currentRamType) {
      const key = cat === 'ram' ? 'memory_type' : 'ram_type';
      return {
        key,
        value: this.currentRamType,
        label: `RAM ${this.currentRamType} (Khớp hệ thống)`,
      };
    }
    return null;
  });

  protected readonly selectedSpecChips = computed(() => {
    const specs = this.selectedSpecs();
    const filterDefs = this.availableSpecFilters();
    return Object.entries(specs)
      .filter(([_, val]) => Boolean(val))
      .map(([key, val]) => {
        const def = filterDefs.find((d) => d.key === key);
        const opt = def?.options.find((o) => o.value === val);
        return {
          key,
          label: def?.label || key,
          displayValue: opt?.label || val,
        };
      });
  });

  protected readonly hasActiveSpecFilters = computed(() => {
    return Object.keys(this.selectedSpecs()).length > 0;
  });

  protected readonly filteredItems = computed<readonly SwapItem[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const brand = this.selectedBrand();
    const priceRange = this.selectedPriceRange();
    const branch = this.selectedBranch();
    const activeSpecs = this.selectedSpecs();

    return this.availableItems.filter((item) => {
      if (brand && item.brand !== brand) return false;

      if (priceRange === 'under5m' && item.price >= 5000000) return false;
      if (priceRange === '5m-15m' && (item.price < 5000000 || item.price > 15000000)) return false;
      if (priceRange === 'above15m' && item.price <= 15000000) return false;

      if (branch === 'hn' && item.stockStatus && !item.stockStatus.toLowerCase().includes('hn')) return false;
      if (branch === 'hcm' && item.stockStatus && !item.stockStatus.toLowerCase().includes('hcm')) return false;

      if (query && !item.name.toLowerCase().includes(query) && !item.specs.toLowerCase().includes(query)) {
        return false;
      }

      for (const [key, filterValue] of Object.entries(activeSpecs)) {
        if (!filterValue) continue;
        const itemVal = extractItemSpec(item, key);
        if (itemVal === undefined) return false;
        if (itemVal.toLowerCase() !== filterValue.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected close(): void {
    this.closeModal.emit();
  }

  protected chooseItem(item: SwapItem): void {
    this.selectItem.emit(item);
    this.close();
  }

  protected onSpecFilterChange(key: string, value: string): void {
    this.selectedSpecs.update((current) => {
      const updated = { ...current };
      if (value && value.trim() !== '') {
        updated[key] = value.trim();
      } else {
        delete updated[key];
      }
      return updated;
    });
  }

  protected clearAllSpecFilters(): void {
    this.selectedSpecs.set({});
  }

  protected resetAllFilters(): void {
    this.searchQuery.set('');
    this.selectedBrand.set('');
    this.selectedPriceRange.set('all');
    this.selectedBranch.set('all');
    this.selectedSpecs.set({});
  }

  protected applyCompatibilityFilter(key: string, value: string): void {
    this.selectedSpecs.update((current) => {
      const next = { ...current };
      if (next[key]?.toLowerCase() === value.toLowerCase()) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }

  protected isCompatibilityFilterActive(key: string, value: string): boolean {
    return this.selectedSpecs()[key]?.toLowerCase() === value.toLowerCase();
  }

  protected getPriceDifference(targetPrice: number): number {
    const base = this.currentSlot?.item?.price ?? 0;
    return targetPrice - base;
  }

  protected checkCompatibility(item: SwapItem): { isCompatible: boolean; label: string } {
    if (this.categoryKey === 'cpu' && item.socket && this.currentSocket) {
      if (item.socket.toLowerCase() !== this.currentSocket.toLowerCase()) {
        return { isCompatible: false, label: `Khác Socket (${item.socket})` };
      }
    }

    if (this.categoryKey === 'mainboard' && item.socket && this.currentSocket) {
      if (item.socket.toLowerCase() !== this.currentSocket.toLowerCase()) {
        return { isCompatible: false, label: `Khác Socket (${item.socket})` };
      }
    }

    if (this.categoryKey === 'ram' && item.memoryType && this.currentRamType) {
      if (item.memoryType.toLowerCase() !== this.currentRamType.toLowerCase()) {
        return { isCompatible: false, label: `Khác chuẩn RAM (${item.memoryType})` };
      }
    }

    if (this.categoryKey === 'psu' && typeof item.tdp === 'number' && this.minPsuWattage > 0) {
      if (item.tdp < this.minPsuWattage) {
        return { isCompatible: false, label: `Khuyến nghị tối thiểu ${this.minPsuWattage}W` };
      }
    }

    return { isCompatible: true, label: 'Tương thích' };
  }
}

