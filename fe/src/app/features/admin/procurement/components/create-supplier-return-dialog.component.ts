import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
import {
  AdminSupplierReturnService,
  CreateSupplierReturnPayload,
  EligibleReceipt,
  EligibleReceiptSkuInfo,
} from '../services/admin-supplier-return.service';

@Component({
  selector: 'app-create-supplier-return-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconModule, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-white border border-line rounded-lg shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col z-10 text-[13px] text-foreground"
        >
          <div class="p-5 border-b border-line flex items-center justify-between flex-shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                  Tạo Phiếu Xuất Trả Nhà Cung Cấp
                </h3>
              </div>
              <p class="text-xs text-muted mt-0.5">
                Lập phiếu xuất trả linh kiện lỗi hoặc đổi trả đối chiếu phiếu nhập kho gốc (PUR-011, PUR-012, PUR-013)
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-muted/10 text-muted hover:text-foreground transition-colors"
              title="Đóng"
              aria-label="Đóng hộp thoại"
            >
              <lucide-icon name="x" class="size-5" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              <div class="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs leading-relaxed">
                Số lượng trả không được vượt quá số lượng đã nhận của đơn PO gốc trừ các lần trả trước đó. Kho sẽ tự động giảm tồn thực tế hoặc kho cách ly lỗi.
              </div>

              @if (errorMessage()) {
                <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs">
                  {{ errorMessage() }}
                </div>
              }

              <div>
                <label for="receipt-select" class="block font-semibold text-muted text-xs uppercase mb-1">
                  Đơn Mua Hàng PO Gốc Đã Nhập Kho
                </label>
                @if (isLoadingReceipts()) {
                  <div class="p-2 text-muted italic">Đang tải danh sách phiếu nhập kho...</div>
                } @else if (eligibleReceipts().length === 0) {
                  <div class="p-3 bg-surface border border-line rounded text-muted">
                    Không có phiếu nhập kho nào khả dụng hoặc toàn bộ đã được xuất trả tối đa.
                  </div>
                } @else {
                  <app-select
                    [options]="receiptOptions()"
                    [value]="selectedReceiptId() ? selectedReceiptId()!.toString() : ''"
                    (valueChange)="onReceiptChange($event)"
                    size="sm"
                    ariaLabel="Chọn phiếu nhập kho gốc"
                  />
                }
              </div>

              @if (currentReceipt()) {
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold text-muted text-xs uppercase mb-1">
                      Phiếu Nhập Kho Gốc
                    </label>
                    <input
                      type="text"
                      readonly
                      [value]="currentReceipt()!.inboundMoveCode"
                      class="w-full px-3 py-2 bg-surface border border-line rounded font-mono font-bold text-foreground text-[13px]"
                    />
                  </div>
                  <div>
                    <label class="block font-semibold text-muted text-xs uppercase mb-1">
                      Nguồn Xuất Trả
                    </label>
                    <app-select
                      [options]="returnSourceOptions"
                      [value]="returnSource()"
                      (valueChange)="onReturnSourceChange($event)"
                      size="sm"
                      ariaLabel="Nguồn Xuất Trả"
                    />
                  </div>
                </div>

                @if (currentReceipt()!.skus.length > 1) {
                  <div>
                    <label class="block font-semibold text-muted text-xs uppercase mb-1">
                      Chọn Linh Kiện Cần Xuất Trả
                    </label>
                    <app-select
                      [options]="skuOptions()"
                      [value]="selectedSkuId() ? selectedSkuId()!.toString() : ''"
                      (valueChange)="onSkuChange($event)"
                      size="sm"
                      ariaLabel="Chọn Linh Kiện Cần Xuất Trả"
                    />
                  </div>
                }

                @if (currentSku()) {
                  <div class="p-3 bg-surface rounded border border-line text-[13px] space-y-1.5">
                    <div class="flex justify-between">
                      <span class="text-muted">Linh kiện:</span>
                      <strong class="text-foreground">{{ currentSku()!.skuCode }} - {{ currentSku()!.skuName }}</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted">Tổng số lượng thực nhận từ phiếu nhập:</span>
                      <strong class="tabular-nums text-foreground">{{ currentSku()!.receivedQuantity }} chiếc</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted">Đã xuất trả các đợt trước:</span>
                      <strong class="tabular-nums text-foreground">{{ currentSku()!.alreadyReturnedQuantity }} chiếc</strong>
                    </div>
                    <div class="flex justify-between border-t border-line pt-1.5">
                      <span class="font-bold text-foreground">Hạn mức tối đa cho phép trả:</span>
                      <strong class="tabular-nums text-primary font-bold">
                        Tối đa {{ currentSku()!.maxReturnableQuantity }} chiếc
                      </strong>
                    </div>
                    <div class="flex justify-between border-t border-line pt-1.5">
                      <span class="text-muted">
                        {{ returnSource() === 'quarantineDamaged' ? 'Tồn kho cách ly lỗi hiện tại:' : 'Tồn khả dụng hiện tại (OnHand):' }}
                      </span>
                      <strong class="tabular-nums text-amber-700 font-bold">
                        {{ availableSourceStock() }} chiếc
                      </strong>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label for="return-quantity-input" class="block font-semibold text-muted text-xs uppercase">
                        Số Lượng Xuất Trả
                      </label>
                      <span class="text-xs text-muted">
                        Trần cho phép: <strong class="text-primary">{{ currentSku()!.maxReturnableQuantity }}</strong> chiếc
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="text"
                        readonly
                        [value]="currentSku()!.skuCode"
                        class="flex-1 px-3 py-2 bg-surface border border-line rounded font-mono font-bold text-foreground text-[13px]"
                      />
                      <input
                        id="return-quantity-input"
                        type="number"
                        min="1"
                        [max]="currentSku()!.maxReturnableQuantity"
                        [ngModel]="returnQuantity()"
                        (ngModelChange)="onQuantityChange($event)"
                        name="quantity"
                        class="w-28 px-3 py-2 bg-white border rounded text-center font-bold tabular-nums text-foreground focus:outline-none focus:border-primary text-[13px]"
                        [ngClass]="{
                          'border-rose-600 text-rose-600': quantityError(),
                          'border-line': !quantityError()
                        }"
                      />
                    </div>

                    @if (quantityError()) {
                      <div class="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-semibold">
                        {{ quantityError() }}
                      </div>
                    }
                  </div>

                  @if (currentSku()!.serialRequired || eligibleSerials().length > 0) {
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="block font-semibold text-muted text-xs uppercase">
                          Chọn Số Serial Xuất Trả
                        </label>
                        <span class="text-xs" [ngClass]="selectedSerials().length === returnQuantity() ? 'text-primary' : 'text-amber-600'">
                          Đã chọn: <strong>{{ selectedSerials().length }}</strong> / {{ returnQuantity() }} serial
                        </span>
                      </div>

                      @if (eligibleSerials().length === 0) {
                        <div class="p-2.5 bg-surface border border-line rounded text-muted text-[13px]">
                          Không tìm thấy số serial hợp lệ cho nguồn kho đã chọn.
                        </div>
                      } @else {
                        <div class="max-h-36 overflow-y-auto p-2 bg-surface border border-line rounded space-y-1">
                          @for (serial of eligibleSerials(); track serial) {
                            <label class="flex items-center gap-2 p-1.5 hover:bg-muted/10 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                [checked]="isSerialSelected(serial)"
                                (change)="toggleSerial(serial)"
                                class="rounded border-line text-primary focus:ring-0"
                              />
                              <span class="font-mono text-[13px] text-foreground">{{ serial }}</span>
                            </label>
                          }
                        </div>
                      }

                      @if (serialError()) {
                        <div class="mt-1.5 text-xs text-rose-600">
                          {{ serialError() }}
                        </div>
                      }
                    </div>
                  }

                  <div>
                    <label for="return-reason" class="block font-semibold text-muted text-xs uppercase mb-1">
                      Lý Do Xuất Trả
                    </label>
                    <textarea
                      id="return-reason"
                      rows="2"
                      [ngModel]="returnReason()"
                      (ngModelChange)="returnReason.set($event)"
                      name="reason"
                      placeholder="Ghi nhận lỗi linh kiện hoặc lý do xuất trả cho nhà cung cấp..."
                      class="w-full px-3 py-2 bg-white border border-line rounded text-foreground text-[13px] placeholder:text-muted focus:outline-none focus:border-primary"
                    ></textarea>
                  </div>
                }
              }
            </div>

            <div class="flex items-center justify-end gap-2 p-4 border-t border-line flex-shrink-0">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 bg-surface hover:bg-muted/10 border border-line text-foreground font-semibold rounded text-[13px] transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                [disabled]="isSubmitDisabled()"
                class="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold rounded shadow-sm text-[13px] transition-colors uppercase tracking-wide"
              >
                @if (isSubmitting()) {
                  Đang Tạo...
                } @else {
                  Tạo Phiếu Xuất Trả
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CreateSupplierReturnDialogComponent implements OnChanges {
  private readonly returnService = inject(AdminSupplierReturnService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  readonly eligibleReceipts = signal<EligibleReceipt[]>([]);
  readonly isLoadingReceipts = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedReceiptId = signal<string>('');
  readonly selectedSkuId = signal<number>(0);
  readonly returnSource = signal<'quarantineDamaged' | 'onHand'>('quarantineDamaged');
  readonly returnQuantity = signal<number>(1);
  readonly selectedSerials = signal<string[]>([]);
  readonly returnReason = signal<string>('');

  readonly receiptOptions = computed<SelectOption[]>(() =>
    this.eligibleReceipts().map((receipt) => ({
      value: receipt.inboundMoveId,
      label: `${receipt.purchaseOrderCode} (${receipt.supplierName} - Kho ${receipt.receivingBranchName})`,
    }))
  );

  readonly returnSourceOptions: readonly SelectOption[] = [
    { value: 'quarantineDamaged', label: 'Kho cách ly hàng lỗi (QuarantineDamaged)' },
    { value: 'onHand', label: 'Kho tồn thực tế khả dụng (OnHand)' },
  ];

  readonly skuOptions = computed<SelectOption[]>(() => {
    const r = this.currentReceipt();
    if (!r) return [];
    return r.skus.map((sku) => ({
      value: sku.skuId.toString(),
      label: `${sku.skuCode} - ${sku.skuName} (Còn được trả: ${sku.maxReturnableQuantity})`,
    }));
  });

  readonly currentReceipt = computed<EligibleReceipt | null>(() => {
    const receipts = this.eligibleReceipts();
    const id = this.selectedReceiptId();
    return receipts.find((r) => r.inboundMoveId === id) ?? null;
  });

  readonly currentSku = computed<EligibleReceiptSkuInfo | null>(() => {
    const receipt = this.currentReceipt();
    if (!receipt || receipt.skus.length === 0) return null;
    const skuId = this.selectedSkuId();
    return receipt.skus.find((s) => s.skuId === skuId) ?? receipt.skus[0] ?? null;
  });

  readonly availableSourceStock = computed<number>(() => {
    const sku = this.currentSku();
    if (!sku) return 0;
    return this.returnSource() === 'quarantineDamaged'
      ? sku.currentQuarantineDamaged
      : sku.currentOnHand;
  });

  readonly eligibleSerials = computed<string[]>(() => {
    const sku = this.currentSku();
    if (!sku) return [];
    return this.returnSource() === 'quarantineDamaged'
      ? sku.quarantinedSerials.length > 0
        ? sku.quarantinedSerials
        : sku.availableSerials
      : sku.availableSerials;
  });

  readonly quantityError = computed<string | null>(() => {
    const sku = this.currentSku();
    if (!sku) return null;

    const qty = this.returnQuantity();
    if (!qty || isNaN(qty) || qty <= 0) {
      return 'Số lượng xuất trả phải lớn hơn 0';
    }

    if (qty > sku.maxReturnableQuantity) {
      return `Cảnh báo: Số lượng xuất trả vượt quá số lượng trần tối đa (${sku.maxReturnableQuantity} chiếc) của phiếu nhập kho gốc. Không được phép xuất trả vượt số lượng đã nhận thực tế.`;
    }

    const availableStock = this.availableSourceStock();
    if (qty > availableStock) {
      return `Cảnh báo: Số lượng xuất trả vượt quá tồn kho khả dụng hiện tại (${availableStock} chiếc) trong kho đã chọn.`;
    }

    return null;
  });

  readonly serialError = computed<string | null>(() => {
    const sku = this.currentSku();
    if (!sku) return null;

    if (sku.serialRequired || this.eligibleSerials().length > 0) {
      const needed = this.returnQuantity();
      const count = this.selectedSerials().length;
      if (count !== needed) {
        return `Vui lòng chọn đúng ${needed} số serial (hiện đã chọn ${count})`;
      }
    }
    return null;
  });

  readonly isSubmitDisabled = computed<boolean>(() => {
    if (this.isSubmitting()) return true;
    if (!this.currentReceipt() || !this.currentSku()) return true;
    if (this.quantityError() !== null) return true;
    if (this.serialError() !== null) return true;
    if (!this.returnReason().trim() || this.returnReason().trim().length < 3) return true;
    return false;
  });

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['isOpen'] && this.isOpen) {
      await this.initDialog();
    }
  }

  private async initDialog(): Promise<void> {
    this.errorMessage.set(null);
    this.isLoadingReceipts.set(true);
    this.selectedSerials.set([]);
    this.returnReason.set('');
    this.returnQuantity.set(1);

    try {
      const receipts = await this.returnService.loadEligibleReceipts();
      this.eligibleReceipts.set(receipts);

      if (receipts.length > 0) {
        const first = receipts[0];
        this.selectedReceiptId.set(first.inboundMoveId);
        if (first.skus.length > 0) {
          this.selectedSkuId.set(first.skus[0].skuId);
        }
      } else {
        this.selectedReceiptId.set('');
        this.selectedSkuId.set(0);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải danh sách phiếu nhập kho';
      this.errorMessage.set(msg);
    } finally {
      this.isLoadingReceipts.set(false);
    }
  }

  onReceiptChange(receiptId: string): void {
    this.selectedReceiptId.set(receiptId);
    this.selectedSerials.set([]);
    const receipt = this.eligibleReceipts().find((r) => r.inboundMoveId === receiptId);
    if (receipt && receipt.skus.length > 0) {
      this.selectedSkuId.set(receipt.skus[0].skuId);
    }
    this.returnQuantity.set(1);
  }

  onSkuChange(skuIdRaw: string | number): void {
    const skuId = typeof skuIdRaw === 'string' ? parseInt(skuIdRaw, 10) : skuIdRaw;
    this.selectedSkuId.set(skuId);
    this.selectedSerials.set([]);
    this.returnQuantity.set(1);
  }

  onReturnSourceChange(source: string): void {
    this.returnSource.set(source as 'quarantineDamaged' | 'onHand');
    this.selectedSerials.set([]);
  }

  onQuantityChange(qtyRaw: string | number): void {
    const qty = typeof qtyRaw === 'string' ? parseInt(qtyRaw, 10) : qtyRaw;
    this.returnQuantity.set(isNaN(qty) ? 0 : qty);
  }

  isSerialSelected(serial: string): boolean {
    return this.selectedSerials().includes(serial);
  }

  toggleSerial(serial: string): void {
    const current = [...this.selectedSerials()];
    const index = current.indexOf(serial);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      if (current.length < this.returnQuantity()) {
        current.push(serial);
      }
    }
    this.selectedSerials.set(current);
  }

  onCancel(): void {
    this.close.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitDisabled()) return;

    const receipt = this.currentReceipt();
    const sku = this.currentSku();
    if (!receipt || !sku) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload: CreateSupplierReturnPayload = {
      inboundStockMoveId: receipt.inboundMoveId,
      reason: this.returnReason().trim(),
      lines: [
        {
          skuId: sku.skuId,
          quantity: this.returnQuantity(),
          returnSource: this.returnSource(),
          serialNumbers: this.selectedSerials(),
        },
      ],
    };

    try {
      await this.returnService.createSupplierReturn(payload);
      this.created.emit();
      this.close.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo phiếu xuất trả';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
