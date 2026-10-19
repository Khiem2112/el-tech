import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconModule, ButtonDirective, InputDirective } from '../../components/atoms';
import { VndPipe } from '../../lib/vnd.pipe';

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
};

export type SwapSlotItem = {
  readonly slotKey: string;
  readonly slotName: string;
  readonly item: SwapItem | null;
};

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
          class="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header -->
          <div class="p-4 sm:p-5 bg-surface border-b border-border flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <lucide-icon name="arrow-up-down" class="size-5" aria-hidden="true"></lucide-icon>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base sm:text-lg font-bold text-foreground">Đổi linh kiện: {{ categoryName }}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
                    TƯƠNG THÍCH 100%
                  </span>
                </div>
                <p class="text-xs text-muted mt-0.5">Hệ thống tự động lọc linh kiện tương thích với Nguồn và Bo mạch chủ hiện tại.</p>
              </div>
            </div>
            <button
              type="button"
              (click)="close()"
              class="size-8 rounded-lg bg-surface-alt hover:bg-border text-muted hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-border"
              aria-label="Đóng cửa sổ thay đổi linh kiện"
            >
              <lucide-icon name="x" class="size-4" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          <!-- Realtime Compatibility Diagnostic Bar -->
          <div class="bg-surface-alt px-4 sm:px-5 py-2.5 border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-1.5 text-primary font-semibold">
                <lucide-icon name="shield-check" class="size-4" aria-hidden="true"></lucide-icon>
                <span>PSU {{ currentPsuWattage }}W Gold: Đạt chuẩn công suất cấp điện</span>
              </div>
              <div class="w-px h-3.5 bg-border hidden sm:block"></div>
              <div class="flex items-center gap-1.5 text-foreground font-medium">
                <lucide-icon name="cpu" class="size-4 text-muted" aria-hidden="true"></lucide-icon>
                <span>Khoang Case: Chiều dài card tối đa &lt; 340mm</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-muted text-[11px]">
              <span class="size-2 rounded-full bg-primary inline-block"></span>
              <span>Cập nhật kho thời gian thực</span>
            </div>
          </div>

          <!-- Search & Filter Bar -->
          <div class="p-4 border-b border-border bg-surface space-y-3 shrink-0">
            <div class="flex items-center gap-2">
              <div class="flex-1 relative">
                <lucide-icon name="search" class="size-4 absolute left-3 top-3 text-muted pointer-events-none" aria-hidden="true"></lucide-icon>
                <input
                  appInput
                  type="text"
                  class="w-full pl-9 text-xs"
                  placeholder="Tìm theo tên linh kiện, mã model, hãng sản xuất..."
                  [ngModel]="searchQuery()"
                  (ngModelChange)="searchQuery.set($event)"
                >
              </div>
              @if (brands().length > 0) {
                <select
                  appInput
                  class="text-xs h-9"
                  [ngModel]="selectedBrand()"
                  (ngModelChange)="selectedBrand.set($event)"
                >
                  <option value="">Tất cả thương hiệu</option>
                  @for (brand of brands(); track brand) {
                    <option [value]="brand">{{ brand }}</option>
                  }
                </select>
              }
            </div>

            <!-- Quick Brand / Chip Filter Chips -->
            <div class="flex items-center gap-1.5 flex-wrap text-xs">
              <span class="text-muted font-medium text-[11px] mr-1">Lọc nhanh:</span>
              <button
                type="button"
                (click)="selectedBrand.set('')"
                class="px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-colors cursor-pointer"
                [class.bg-primary]="!selectedBrand()"
                [class.text-primary-foreground]="!selectedBrand()"
                [class.border-primary]="!selectedBrand()"
                [class.bg-surface-alt]="selectedBrand()"
                [class.border-border]="selectedBrand()"
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
                  [class.border-border]="selectedBrand() !== brand"
                  [class.text-foreground]="selectedBrand() !== brand"
                >
                  {{ brand }}
                </button>
              }
            </div>
          </div>

          <!-- Modal Body Content -->
          <div class="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            <!-- Currently Selected Reference Card -->
            @if (currentSlot?.item; as current) {
              <div class="p-3.5 rounded-xl bg-surface-alt border border-border space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <span class="size-2 rounded-full bg-primary inline-block"></span>
                    Linh kiện đang có trong cấu hình:
                  </span>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-surface border border-border font-bold text-primary">
                    Đang áp dụng
                  </span>
                </div>
                <div class="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-bold text-foreground truncate">{{ current.name }}</div>
                    <p class="text-[11px] text-muted truncate mt-0.5">{{ current.specs }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <div class="text-xs font-bold text-foreground tabular">{{ current.price | vnd }}</div>
                    <span class="text-[10px] text-muted">Giá hiện tại</span>
                  </div>
                </div>
              </div>
            }

            <!-- Candidate Replacement List -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <lucide-icon name="sliders-horizontal" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Danh sách linh kiện thay thế khả dụng ({{ filteredItems().length }} sản phẩm)</span>
                </h4>
                <span class="text-[11px] text-muted">Tự động tính chênh lệch</span>
              </div>

              @if (filteredItems().length === 0) {
                <div class="rounded-xl border border-dashed border-border p-8 text-center bg-surface">
                  <p class="text-xs font-bold text-foreground">Không tìm thấy linh kiện phù hợp với bộ lọc</p>
                  <p class="text-[11px] text-muted mt-1">Vui lòng thử xóa từ khóa tìm kiếm hoặc chọn thương hiệu khác.</p>
                </div>
              } @else {
                <div class="space-y-2">
                  @for (item of filteredItems(); track item.id) {
                    <div class="p-3.5 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-alt text-foreground border border-border">
                            {{ item.brand }}
                          </span>
                          @if (item.tag) {
                            <span class="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold">
                              {{ item.tag }}
                            </span>
                          }
                          <span class="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                            <lucide-icon name="store" class="size-3" aria-hidden="true"></lucide-icon>
                            <span>{{ item.stockStatus || 'Sẵn hàng HN & HCM' }}</span>
                          </span>
                        </div>
                        <h5 class="text-xs font-bold text-foreground truncate mt-1">{{ item.name }}</h5>
                        <p class="text-[11px] text-muted truncate mt-0.5">{{ item.specs }}</p>
                      </div>

                      <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                        <div class="text-left sm:text-right">
                          <div class="text-xs font-bold text-foreground tabular">{{ item.price | vnd }}</div>
                          @if (getPriceDifference(item.price); as diff) {
                            @if (diff > 0) {
                              <div class="text-[11px] font-bold text-amber-400 font-mono">+{{ diff | vnd }}</div>
                            } @else if (diff < 0) {
                              <div class="text-[11px] font-bold text-emerald-400 font-mono">-{{ (-diff) | vnd }}</div>
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
                          class="shrink-0"
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
          <div class="p-3.5 bg-surface-alt border-t border-border flex items-center justify-between text-xs text-muted">
            <div class="flex items-center gap-1.5">
              <lucide-icon name="shield-check" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
              <span>Cam kết bảo hành chính hãng 36 tháng cho mọi linh kiện thay thế</span>
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
  @Input() isOpen = false;
  @Input() categoryKey = '';
  @Input() categoryName = '';
  @Input() currentSlot: SwapSlotItem | null = null;
  @Input() availableItems: readonly SwapItem[] = [];
  @Input() currentPsuWattage = 850;

  @Output() closeModal = new EventEmitter<void>();
  @Output() selectItem = new EventEmitter<SwapItem>();

  protected readonly searchQuery = signal('');
  protected readonly selectedBrand = signal('');

  protected readonly brands = computed<readonly string[]>(() => {
    const set = new Set<string>();
    for (const item of this.availableItems) {
      if (item.brand) set.add(item.brand);
    }
    return Array.from(set).sort();
  });

  protected readonly filteredItems = computed<readonly SwapItem[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const brand = this.selectedBrand();
    return this.availableItems.filter((item) => {
      if (brand && item.brand !== brand) return false;
      if (query && !item.name.toLowerCase().includes(query) && !item.specs.toLowerCase().includes(query)) {
        return false;
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

  protected getPriceDifference(targetPrice: number): number {
    const base = this.currentSlot?.item?.price ?? 0;
    return targetPrice - base;
  }
}
