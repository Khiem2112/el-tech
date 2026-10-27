import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminOrderDetail,
  AdminOrderDetailService,
  AssemblyRequirementsResult,
} from '../../services/admin-order-detail.service';

type SelectedSerialEntry = {
  skuId: number;
  serialNumber: string;
};

@Component({
  selector: 'app-assemble-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-09" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-xl p-5 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Bàn Giao Lắp Ráp PC
              </h3>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-surface hover:bg-surface-alt text-muted hover:text-foreground border border-line text-xs transition-colors cursor-pointer"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          <div class="space-y-1">
            <label class="block font-medium text-muted text-xs">
              Kỹ thuật viên phụ trách:
            </label>
            <input
              type="text"
              [(ngModel)]="technicianName"
              placeholder="Nhập tên hoặc mã kỹ thuật viên..."
              class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-foreground uppercase">
                Danh sách linh kiện lắp ráp & Gán số Sê-ri:
              </span>
              <span class="text-xs font-mono font-bold" [class.text-emerald-600]="isAllSerialsProvided()" [class.dark:text-emerald-400]="isAllSerialsProvided()" [class.text-amber-600]="!isAllSerialsProvided()" [class.dark:text-amber-400]="!isAllSerialsProvided()">
                Đã gán {{ selectedSerialsCount() }}/{{ requiredSerialsCount() }} Serial
              </span>
            </div>

            @if (isLoading()) {
              <div class="p-6 text-center bg-surface-alt border border-line rounded text-muted">
                Đang tải danh sách linh kiện và kiểm tra số sê-ri khả dụng...
              </div>
            } @else if (requirements(); as req) {
              <div class="space-y-2">
                @for (item of req.items; track item.skuId) {
                  <div class="p-3 bg-surface-alt border border-line rounded space-y-2">
                    <div class="flex items-center justify-between gap-2">
                      <div>
                        <div class="font-mono font-bold text-foreground">{{ item.skuCode }}</div>
                        <div class="text-xs text-muted">{{ item.name }}</div>
                      </div>
                      <div class="text-right">
                        <span class="text-xs font-bold text-foreground">SL: {{ item.quantity }}</span>
                        <div>
                          <span
                            class="inline-block px-1.5 py-0.5 rounded text-xs font-semibold mt-0.5"
                            [class.bg-primary/10]="item.serialRequired"
                            [class.text-primary-strong]="item.serialRequired"
                            [class.border]="item.serialRequired"
                            [class.border-primary/30]="item.serialRequired"
                            [class.bg-surface]="!item.serialRequired"
                            [class.text-muted]="!item.serialRequired"
                          >
                            {{ item.serialRequired ? 'Bắt buộc Serial' : 'Không quản lý Serial' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    @if (item.serialRequired) {
                      <div class="border-t border-line pt-2 space-y-2">
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-muted">Số sê-ri đã gán cho linh kiện này:</span>
                          <span class="font-mono font-bold" [class.text-emerald-600]="getItemAssignedCount(item.skuId) === item.quantity" [class.dark:text-emerald-400]="getItemAssignedCount(item.skuId) === item.quantity" [class.text-amber-600]="getItemAssignedCount(item.skuId) !== item.quantity" [class.dark:text-amber-400]="getItemAssignedCount(item.skuId) !== item.quantity">
                            {{ getItemAssignedCount(item.skuId) }} / {{ item.quantity }}
                          </span>
                        </div>

                        @if (getItemAssignedSerials(item.skuId).length > 0) {
                          <div class="flex flex-wrap gap-1.5">
                            @for (s of getItemAssignedSerials(item.skuId); track s) {
                              <span class="px-2 py-0.5 bg-surface-alt border border-line text-foreground rounded font-mono text-xs flex items-center gap-1.5">
                                <span>{{ s }}</span>
                                <button
                                  type="button"
                                  (click)="removeSerial(item.skuId, s)"
                                  class="text-rose-600 dark:text-rose-400 hover:text-rose-800 px-1 text-xs font-bold cursor-pointer"
                                  title="Gỡ số sê-ri này"
                                >
                                  x
                                </button>
                              </span>
                            }
                          </div>
                        }

                        @if (getItemAssignedCount(item.skuId) < item.quantity) {
                          <div class="space-y-1.5">
                            <div class="flex gap-1.5">
                              <input
                                type="text"
                                #barcodeInput
                                placeholder="Quét mã vạch barcode hoặc gõ số sê-ri..."
                                (keydown.enter)="addCustomSerial(item.skuId, barcodeInput.value); barcodeInput.value = ''"
                                class="flex-1 px-2.5 py-1.5 bg-surface border border-line rounded text-foreground font-mono text-xs focus:outline-none focus:border-primary"
                              />
                              <button
                                type="button"
                                (click)="addCustomSerial(item.skuId, barcodeInput.value); barcodeInput.value = ''"
                                class="px-3 py-1.5 bg-surface hover:bg-surface-alt border border-line rounded font-semibold text-xs text-foreground cursor-pointer transition-colors"
                              >
                                Gán
                              </button>
                            </div>

                            @if (item.availableSerials.length > 0) {
                              <div class="bg-surface p-2 rounded border border-line space-y-1 max-h-28 overflow-y-auto">
                                <div class="text-xs uppercase font-bold text-muted">
                                  Serial khả dụng tại kho ({{ item.availableSerials.length }}):
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                  @for (avail of item.availableSerials; track avail.id) {
                                    <button
                                      type="button"
                                      (click)="toggleSerialSelection(item.skuId, avail.serialNumber)"
                                      [disabled]="isSerialSelectedElsewhere(avail.serialNumber, item.skuId) || (getItemAssignedCount(item.skuId) >= item.quantity && !isSerialSelected(item.skuId, avail.serialNumber))"
                                      class="text-left px-2 py-1 rounded border text-xs font-mono flex items-center justify-between cursor-pointer disabled:opacity-40 transition-colors"
                                      [class.bg-primary/10]="isSerialSelected(item.skuId, avail.serialNumber)"
                                      [class.border-primary]="isSerialSelected(item.skuId, avail.serialNumber)"
                                      [class.text-primary-strong]="isSerialSelected(item.skuId, avail.serialNumber)"
                                      [class.bg-surface-alt]="!isSerialSelected(item.skuId, avail.serialNumber)"
                                      [class.border-line]="!isSerialSelected(item.skuId, avail.serialNumber)"
                                      [class.text-foreground]="!isSerialSelected(item.skuId, avail.serialNumber)"
                                    >
                                      <span class="truncate">{{ avail.serialNumber }}</span>
                                      <span class="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Sẵn sàng</span>
                                    </button>
                                  }
                                </div>
                              </div>
                            } @else {
                              <div class="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                                Không tìm thấy serial sẵn sàng tại chi nhánh này. Bạn có thể quét mã vạch trực tiếp từ vỏ hộp.
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          @if (errorMessage()) {
            <div class="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-700 dark:text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-medium text-xs text-foreground cursor-pointer disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !isAllSerialsProvided()"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded text-xs transition-opacity cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang Chuyển...' : 'Xác Nhận Chuyển Bàn Lắp Ráp' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AssembleDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly requirements = signal<AssemblyRequirementsResult | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedSerials = signal<SelectedSerialEntry[]>([]);

  technicianName = 'Nguyễn Văn Kỹ Thuật (KTV-08)';

  readonly requiredSerialsCount = computed<number>(() => {
    const req = this.requirements();
    if (!req) return 0;
    return req.items
      .filter((i) => i.serialRequired)
      .reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly selectedSerialsCount = computed<number>(() => {
    return this.selectedSerials().length;
  });

  readonly isAllSerialsProvided = computed<boolean>(() => {
    const req = this.requirements();
    if (!req) return false;
    for (const item of req.items) {
      if (item.serialRequired) {
        const count = this.selectedSerials().filter((s) => s.skuId === item.skuId).length;
        if (count !== item.quantity) {
          return false;
        }
      }
    }
    return true;
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadRequirements();
        this.selectedSerials.set([]);
        this.errorMessage.set(null);
      }
    });
  }

  async loadRequirements(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const res = await this.detailService.fetchAssemblyRequirements(this.order().id);
      this.requirements.set(res);

      if (res) {
        const autoSelected: SelectedSerialEntry[] = [];
        for (const item of res.items) {
          if (item.serialRequired && item.availableSerials.length > 0) {
            const needed = item.quantity;
            for (let i = 0; i < Math.min(needed, item.availableSerials.length); i++) {
              autoSelected.push({
                skuId: item.skuId,
                serialNumber: item.availableSerials[i].serialNumber,
              });
            }
          }
        }
        if (autoSelected.length > 0) {
          this.selectedSerials.set(autoSelected);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi tai linh kien lap rap';
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  getItemAssignedSerials(skuId: number): string[] {
    return this.selectedSerials()
      .filter((s) => s.skuId === skuId)
      .map((s) => s.serialNumber);
  }

  getItemAssignedCount(skuId: number): number {
    return this.selectedSerials().filter((s) => s.skuId === skuId).length;
  }

  isSerialSelected(skuId: number, serialNumber: string): boolean {
    return this.selectedSerials().some(
      (s) => s.skuId === skuId && s.serialNumber === serialNumber,
    );
  }

  isSerialSelectedElsewhere(serialNumber: string, currentSkuId: number): boolean {
    return this.selectedSerials().some(
      (s) => s.skuId !== currentSkuId && s.serialNumber === serialNumber,
    );
  }

  toggleSerialSelection(skuId: number, serialNumber: string): void {
    const list = this.selectedSerials();
    const existingIndex = list.findIndex(
      (s) => s.skuId === skuId && s.serialNumber === serialNumber,
    );
    if (existingIndex >= 0) {
      this.selectedSerials.set(list.filter((_, idx) => idx !== existingIndex));
    } else {
      this.selectedSerials.set([...list, { skuId, serialNumber }]);
    }
  }

  addCustomSerial(skuId: number, inputSerial: string): void {
    const trimmed = inputSerial.trim();
    if (!trimmed) return;

    if (this.selectedSerials().some((s) => s.serialNumber === trimmed)) {
      this.errorMessage.set(`Số sê-ri ${trimmed} đã được chọn.`);
      return;
    }

    this.selectedSerials.set([...this.selectedSerials(), { skuId, serialNumber: trimmed }]);
    this.errorMessage.set(null);
  }

  removeSerial(skuId: number, serialNumber: string): void {
    this.selectedSerials.set(
      this.selectedSerials().filter(
        (s) => !(s.skuId === skuId && s.serialNumber === serialNumber),
      ),
    );
  }

  onClose(): void {
    if (!this.isSubmitting()) {
      this.closed.emit();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.isAllSerialsProvided()) {
      this.errorMessage.set('Vui lòng quét hoặc chọn đầy đủ số sê-ri cho các linh kiện bắt buộc.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.assembleOrder(this.order().id, {
        technicianName: this.technicianName.trim() || undefined,
        serialAssignments: this.selectedSerials(),
      });
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the chuyen ban lap rap PC';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
