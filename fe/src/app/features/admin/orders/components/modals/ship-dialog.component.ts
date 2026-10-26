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
  ShippingRequirementsResult,
} from '../../services/admin-order-detail.service';

type SelectedSerialEntry = {
  skuId: number;
  serialNumber: string;
};

@Component({
  selector: 'app-ship-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-11" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-xl p-5 sm:p-6 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Xuất Kho Giao Hàng
              </h3>
              <p class="text-xs text-muted">
                Quy trình: Sẵn sàng xuất kho sang Bàn giao vận chuyển
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-surface hover:bg-surface-alt text-muted hover:text-foreground border border-line text-xs transition-colors"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          @if (requirements()?.hasUnpaidAmendments) {
            <div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-700 dark:text-rose-300 text-xs space-y-1.5">
              <div class="font-bold uppercase tracking-wider text-rose-800 dark:text-rose-200">
                Chặn xuất kho: Phụ phí chưa thanh toán (PRC-008, PAY-019)
              </div>
              <p class="leading-relaxed">
                Đơn hàng tồn tại phụ lục điều chỉnh chưa thanh toán hoặc chưa được khách hàng xác nhận. Bắt buộc toàn bộ các khoản phụ phí phát sinh từ phụ lục phải được thanh toán đủ trước khi cho phép xuất kho.
              </p>
              @if (requirements()?.pendingAmendments; as amendments) {
                <div class="space-y-1 pt-1">
                  @for (a of amendments; track a.id) {
                    <div class="p-1.5 bg-surface-alt rounded border border-rose-500/20 flex items-center justify-between font-mono text-xs">
                      <span>Phụ lục {{ a.type }}: {{ a.reason }}</span>
                      <span class="font-bold text-amber-700 dark:text-amber-400">{{ a.fee }} VND (Trạng thái: {{ a.status }})</span>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
              Bắt buộc toàn bộ các khoản phụ phí điều chỉnh nếu có phải được thanh toán trước khi xuất kho. Đối với đơn linh kiện lẻ chưa qua lắp ráp, thao tác này sẽ tự động trừ tồn kho thực tế (onHand) và giải phóng tồn giữ chỗ (reserved).
            </div>
          }

          <div class="space-y-3">
            <div>
              <label class="block font-semibold text-muted text-xs uppercase mb-1">
                Đơn vị vận chuyển
              </label>
              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="carrier"
                  placeholder="Nhập hoặc chọn đơn vị giao nhận (GHTK, ViettelPost, GHN, Ahamove...)"
                  class="flex-1 px-3 py-2 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div class="flex flex-wrap gap-1.5 mt-1.5">
                @for (c of presetCarriers; track c) {
                  <button
                    type="button"
                    (click)="carrier = c"
                    class="px-2 py-0.5 bg-surface hover:bg-surface-alt border border-line rounded text-xs text-foreground transition-colors"
                  >
                    {{ c }}
                  </button>
                }
              </div>
            </div>

            <div>
              <label class="block font-semibold text-muted text-xs uppercase mb-1">
                Mã vận đơn đối soát
              </label>
              <input
                type="text"
                [(ngModel)]="trackingCode"
                placeholder="Nhập mã vận đơn của hãng giao nhận (VD: GHN-HN-8849201)..."
                class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-mono text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="block font-semibold text-muted text-xs uppercase mb-1">
                Ghi chú xuất kho giao hàng (Tùy chọn)
              </label>
              <input
                type="text"
                [(ngModel)]="note"
                placeholder="Ghi chú đóng gói, tình trạng kiện hàng bàn giao..."
                class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          @if (requirements()?.standaloneSerialRequirements?.length) {
            <div class="flex-1 overflow-y-auto space-y-3 pr-1 border-t border-line pt-3">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-foreground uppercase">
                  Quét / Xác Nhận Serial Linh Kiện Bán Lẻ:
                </span>
                <span class="text-xs font-mono font-bold" [class.text-emerald-600]="isAllSerialsProvided()" [class.dark:text-emerald-400]="isAllSerialsProvided()" [class.text-amber-600]="!isAllSerialsProvided()" [class.dark:text-amber-400]="!isAllSerialsProvided()">
                  Đã gán {{ selectedSerialsCount() }}/{{ requiredSerialsCount() }} Serial
                </span>
              </div>

              <div class="space-y-2">
                @for (item of requirements()!.standaloneSerialRequirements; track item.skuId) {
                  <div class="p-2.5 bg-surface-alt border border-line rounded space-y-2">
                    <div class="flex items-center justify-between gap-2">
                      <div>
                        <div class="font-mono font-bold text-foreground">{{ item.skuCode }}</div>
                        <div class="text-xs text-muted">{{ item.name }}</div>
                      </div>
                      <div class="text-right">
                        <span class="text-xs font-bold text-foreground">SL: {{ item.quantity }}</span>
                      </div>
                    </div>

                    <div class="border-t border-line pt-2 space-y-1.5">
                      @if (getItemAssignedSerials(item.skuId).length > 0) {
                        <div class="flex flex-wrap gap-1.5">
                          @for (s of getItemAssignedSerials(item.skuId); track s) {
                            <span class="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800/40 dark:text-blue-300 rounded font-mono text-xs flex items-center gap-1.5">
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
                              Xác Nhận
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
                                    [class.bg-blue-50]="isSerialSelected(item.skuId, avail.serialNumber)"
                                    [class.border-blue-300]="isSerialSelected(item.skuId, avail.serialNumber)"
                                    [class.text-blue-700]="isSerialSelected(item.skuId, avail.serialNumber)"
                                    [class.dark:bg-blue-950/60]="isSerialSelected(item.skuId, avail.serialNumber)"
                                    [class.dark:text-blue-300]="isSerialSelected(item.skuId, avail.serialNumber)"
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
                  </div>
                }
              </div>
            </div>
          }

          @if (errorMessage()) {
            <div class="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded text-rose-700 dark:text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground font-semibold text-xs rounded transition-colors disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || isLoadingRequirements() || !canSubmit()"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs rounded transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              @if (isSubmitting()) {
                <span>Đang xử lý xuất kho...</span>
              } @else {
                <span>Xác Nhận Xuất Kho Giao</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ShipDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input.required<boolean>();

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly presetCarriers = [
    'Giao Hàng Nhanh',
    'Viettel Post',
    'Giao Hàng Tiết Kiệm',
    'Ahamove',
    'VNPost',
  ];

  carrier = 'Giao Hàng Nhanh';
  trackingCode = '';
  note = '';

  readonly requirements = signal<ShippingRequirementsResult | null>(null);
  readonly isLoadingRequirements = signal<boolean>(false);
  readonly selectedSerials = signal<SelectedSerialEntry[]>([]);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly requiredSerialsCount = computed<number>(() => {
    const req = this.requirements();
    if (!req || !req.standaloneSerialRequirements) return 0;
    return req.standaloneSerialRequirements.reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly selectedSerialsCount = computed<number>(() => {
    return this.selectedSerials().length;
  });

  readonly isAllSerialsProvided = computed<boolean>(() => {
    const req = this.requirements();
    if (!req || !req.standaloneSerialRequirements || req.standaloneSerialRequirements.length === 0) {
      return true;
    }
    return req.standaloneSerialRequirements.every(
      (item) => this.getItemAssignedCount(item.skuId) === item.quantity,
    );
  });

  readonly canSubmit = computed<boolean>(() => {
    if (this.requirements()?.hasUnpaidAmendments) {
      return false;
    }
    if (!this.carrier.trim() || !this.trackingCode.trim()) {
      return false;
    }
    return this.isAllSerialsProvided();
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.resetState();
        this.loadRequirements();
      }
    });
  }

  resetState(): void {
    this.carrier = this.order().shippingCarrier || 'Giao Hàng Nhanh';
    this.trackingCode = this.order().trackingCode || '';
    this.note = '';
    this.errorMessage.set(null);
    this.selectedSerials.set([]);
  }

  async loadRequirements(): Promise<void> {
    this.isLoadingRequirements.set(true);
    try {
      const result = await this.detailService.getShippingRequirements(this.order().id);
      this.requirements.set(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi kiem tra dieu kien xuat kho';
      this.errorMessage.set(msg);
    } finally {
      this.isLoadingRequirements.set(false);
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
    if (!this.carrier.trim()) {
      this.errorMessage.set('Vui lòng chọn hoặc nhập đơn vị giao vận.');
      return;
    }

    if (!this.trackingCode.trim()) {
      this.errorMessage.set('Vui lòng nhập mã vận đơn đối soát.');
      return;
    }

    if (!this.isAllSerialsProvided()) {
      this.errorMessage.set('Vui lòng quét hoặc nhập đủ số sê-ri cho các linh kiện bán lẻ bắt buộc.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.shipOrder(this.order().id, {
        carrier: this.carrier.trim(),
        trackingCode: this.trackingCode.trim(),
        note: this.note.trim() || undefined,
        serialAssignments: this.selectedSerials(),
      });
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the xuat kho ban giao giao van';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}