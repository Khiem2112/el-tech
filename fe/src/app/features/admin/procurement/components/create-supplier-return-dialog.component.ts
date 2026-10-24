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
import {
  AdminSupplierReturnService,
  CreateSupplierReturnPayload,
  EligibleReceipt,
  EligibleReceiptSkuInfo,
} from '../services/admin-supplier-return.service';

@Component({
  selector: 'app-create-supplier-return-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-[#090d16]/75 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col z-10 text-xs text-slate-200"
        >
          <div class="p-5 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded bg-[#090d16] border border-[#272f3d] text-[#76b900] font-mono text-[10px] font-bold">
                  MOD-32
                </span>
                <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                  Tạo Phiếu Xuất Trả Nhà Cung Cấp
                </h3>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Lập phiếu xuất trả linh kiện lỗi hoặc đổi trả đối chiếu phiếu nhập kho gốc (PUR-011, PUR-012, PUR-013)
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              <div class="p-3 bg-amber-950/30 border border-amber-800/60 rounded text-amber-200 text-xs leading-relaxed">
                Số lượng trả không được vượt quá số lượng đã nhận của đơn PO gốc trừ các lần trả trước đó. Kho sẽ tự động giảm tồn thực tế hoặc kho cách ly lỗi.
              </div>

              @if (errorMessage()) {
                <div class="p-3 bg-rose-950/40 border border-rose-800/80 rounded text-rose-300 text-xs">
                  {{ errorMessage() }}
                </div>
              }

              <div>
                <label for="receipt-select" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                  Đơn Mua Hàng PO Gốc Đã Nhập Kho
                </label>
                @if (isLoadingReceipts()) {
                  <div class="p-2 text-slate-500 italic">Đang tải danh sách phiếu nhập kho...</div>
                } @else if (eligibleReceipts().length === 0) {
                  <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded text-slate-400">
                    Không có phiếu nhập kho nào khả dụng hoặc toàn bộ đã được xuất trả tối đa.
                  </div>
                } @else {
                  <select
                    id="receipt-select"
                    [ngModel]="selectedReceiptId()"
                    (ngModelChange)="onReceiptChange($event)"
                    name="receiptId"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                  >
                    @for (receipt of eligibleReceipts(); track receipt.inboundMoveId) {
                      <option [value]="receipt.inboundMoveId">
                        {{ receipt.purchaseOrderCode }} ({{ receipt.supplierName }} - Kho {{ receipt.receivingBranchName }})
                      </option>
                    }
                  </select>
                }
              </div>

              @if (currentReceipt()) {
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                      Phiếu Nhập Kho Gốc
                    </label>
                    <input
                      type="text"
                      readonly
                      [value]="currentReceipt()!.inboundMoveCode"
                      class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded font-mono font-bold text-white text-xs"
                    />
                  </div>
                  <div>
                    <label for="return-source-select" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                      Nguồn Xuất Trả
                    </label>
                    <select
                      id="return-source-select"
                      [ngModel]="returnSource()"
                      (ngModelChange)="onReturnSourceChange($event)"
                      name="returnSource"
                      class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                    >
                      <option value="quarantineDamaged">Kho cách ly hàng lỗi (QuarantineDamaged)</option>
                      <option value="onHand">Kho tồn thực tế khả dụng (OnHand)</option>
                    </select>
                  </div>
                </div>

                @if (currentReceipt()!.skus.length > 1) {
                  <div>
                    <label for="sku-select" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                      Chọn Linh Kiện Cần Xuất Trả
                    </label>
                    <select
                      id="sku-select"
                      [ngModel]="selectedSkuId()"
                      (ngModelChange)="onSkuChange($event)"
                      name="skuId"
                      class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                    >
                      @for (sku of currentReceipt()!.skus; track sku.skuId) {
                        <option [value]="sku.skuId">
                          {{ sku.skuCode }} - {{ sku.skuName }} (Còn được trả: {{ sku.maxReturnableQuantity }})
                        </option>
                      }
                    </select>
                  </div>
                }

                @if (currentSku()) {
                  <div class="p-3 bg-[#090d16] rounded border border-[#272f3d] text-xs space-y-1.5">
                    <div class="flex justify-between">
                      <span class="text-slate-400">Linh kiện:</span>
                      <strong class="text-white">{{ currentSku()!.skuCode }} - {{ currentSku()!.skuName }}</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">Tổng số lượng thực nhận từ phiếu nhập:</span>
                      <strong class="tabular-nums text-white">{{ currentSku()!.receivedQuantity }} chiếc</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">Đã xuất trả các đợt trước:</span>
                      <strong class="tabular-nums text-white">{{ currentSku()!.alreadyReturnedQuantity }} chiếc</strong>
                    </div>
                    <div class="flex justify-between border-t border-[#272f3d] pt-1.5">
                      <span class="font-bold text-slate-300">Hạn mức tối đa cho phép trả:</span>
                      <strong class="tabular-nums text-[#76b900] font-bold">
                        Tối đa {{ currentSku()!.maxReturnableQuantity }} chiếc
                      </strong>
                    </div>
                    <div class="flex justify-between border-t border-[#272f3d] pt-1.5">
                      <span class="text-slate-400">
                        {{ returnSource() === 'quarantineDamaged' ? 'Tồn kho cách ly lỗi hiện tại:' : 'Tồn khả dụng hiện tại (OnHand):' }}
                      </span>
                      <strong class="tabular-nums text-amber-400 font-bold">
                        {{ availableSourceStock() }} chiếc
                      </strong>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label for="return-quantity-input" class="block font-semibold text-slate-400 text-xs uppercase">
                        Số Lượng Xuất Trả
                      </label>
                      <span class="text-xs text-slate-400">
                        Trần cho phép: <strong class="text-[#76b900]">{{ currentSku()!.maxReturnableQuantity }}</strong> chiếc
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="text"
                        readonly
                        [value]="currentSku()!.skuCode"
                        class="flex-1 px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded font-mono font-bold text-white text-xs"
                      />
                      <input
                        id="return-quantity-input"
                        type="number"
                        min="1"
                        [max]="currentSku()!.maxReturnableQuantity"
                        [ngModel]="returnQuantity()"
                        (ngModelChange)="onQuantityChange($event)"
                        name="quantity"
                        class="w-28 px-3 py-2 bg-[#090d16] border rounded text-center font-bold tabular-nums text-white focus:outline-none focus:border-[#76b900] text-xs"
                        [ngClass]="{
                          'border-rose-600 text-rose-300': quantityError(),
                          'border-[#272f3d]': !quantityError()
                        }"
                      />
                    </div>

                    @if (quantityError()) {
                      <div class="mt-2 p-2 bg-rose-950/40 border border-rose-800 rounded text-rose-300 text-xs font-semibold">
                        {{ quantityError() }}
                      </div>
                    }
                  </div>

                  @if (currentSku()!.serialRequired || eligibleSerials().length > 0) {
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="block font-semibold text-slate-400 text-xs uppercase">
                          Chọn Số Serial Xuất Trả
                        </label>
                        <span class="text-xs" [ngClass]="selectedSerials().length === returnQuantity() ? 'text-[#76b900]' : 'text-amber-400'">
                          Đã chọn: <strong>{{ selectedSerials().length }}</strong> / {{ returnQuantity() }} serial
                        </span>
                      </div>

                      @if (eligibleSerials().length === 0) {
                        <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded text-slate-400 text-xs">
                          Không tìm thấy số serial hợp lệ cho nguồn kho đã chọn.
                        </div>
                      } @else {
                        <div class="max-h-36 overflow-y-auto p-2 bg-[#090d16] border border-[#272f3d] rounded space-y-1">
                          @for (serial of eligibleSerials(); track serial) {
                            <label class="flex items-center gap-2 p-1.5 hover:bg-[#161b26] rounded cursor-pointer">
                              <input
                                type="checkbox"
                                [checked]="isSerialSelected(serial)"
                                (change)="toggleSerial(serial)"
                                class="rounded border-[#272f3d] text-[#76b900] focus:ring-0"
                              />
                              <span class="font-mono text-xs text-white">{{ serial }}</span>
                            </label>
                          }
                        </div>
                      }

                      @if (serialError()) {
                        <div class="mt-1.5 text-xs text-rose-400">
                          {{ serialError() }}
                        </div>
                      }
                    </div>
                  }

                  <div>
                    <label for="return-reason" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                      Lý Do Xuất Trả
                    </label>
                    <textarea
                      id="return-reason"
                      rows="2"
                      [ngModel]="returnReason()"
                      (ngModelChange)="returnReason.set($event)"
                      name="reason"
                      placeholder="Ghi nhận lỗi linh kiện hoặc lý do xuất trả cho nhà cung cấp..."
                      class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                    ></textarea>
                  </div>
                }
              }
            </div>

            <div class="flex items-center justify-end gap-2 p-4 border-t border-[#272f3d] flex-shrink-0">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-slate-200 font-semibold rounded text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                [disabled]="isSubmitDisabled()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-[#090d16] font-bold rounded shadow-sm text-xs transition-colors uppercase tracking-wide"
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

  onReturnSourceChange(source: 'quarantineDamaged' | 'onHand'): void {
    this.returnSource.set(source);
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
