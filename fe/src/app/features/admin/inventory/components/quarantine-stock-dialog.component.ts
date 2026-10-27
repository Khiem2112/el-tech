import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminInventoryService,
  InventoryBalanceItem,
  SimpleOption,
} from '../services/admin-inventory.service';

@Component({
  selector: 'app-quarantine-stock-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col z-10 text-xs text-foreground"
        >
          <div class="p-5 border-b border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            <div>
              <h3 class="font-bold text-danger uppercase text-sm tracking-wide">
                Cách Ly Linh Kiện Lỗi & Móp Hộp
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Chuyển linh kiện vào trạng thái cách ly kiểm toán kho
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-surface text-muted hover:text-foreground transition-colors border border-transparent hover:border-line"
              title="Đóng hộp thoại"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              @if (errorMessage()) {
                <div class="p-3 bg-danger/10 border border-danger/30 rounded text-danger text-xs font-semibold">
                  {{ errorMessage() }}
                </div>
              }

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-muted text-xs uppercase mb-1">
                    Kho phát hiện lỗi
                  </label>
                  <select
                    [ngModel]="selectedBranchId"
                    (ngModelChange)="onBranchChange($event)"
                    name="selectedBranchId"
                    [disabled]="!!quant"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded text-foreground font-semibold focus:outline-none focus:border-primary text-xs disabled:opacity-60"
                  >
                    @for (b of branches; track b.id) {
                      <option [value]="b.id">{{ b.name }} ({{ b.code }})</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block font-semibold text-muted text-xs uppercase mb-1">
                    Mã SKU linh kiện
                  </label>
                  @if (quant) {
                    <input
                      type="text"
                      [value]="quant.sku"
                      readonly
                      class="w-full px-3 py-2 bg-surface-alt border border-line rounded font-mono font-bold text-foreground text-xs"
                    />
                  } @else {
                    <select
                      [(ngModel)]="selectedSkuId"
                      (ngModelChange)="onSkuChange($event)"
                      name="selectedSkuId"
                      class="w-full px-3 py-2 bg-surface-alt border border-line rounded text-foreground font-semibold focus:outline-none focus:border-primary text-xs"
                    >
                      <option [value]="0">-- Chọn SKU --</option>
                      @for (s of skus; track s.id) {
                        <option [value]="s.skuId">{{ s.sku }} - {{ s.productName }}</option>
                      }
                    </select>
                  }
                </div>
              </div>

              @if (currentQuant()) {
                <div class="p-3 bg-surface-alt rounded border border-line flex items-center justify-between text-xs">
                  <div>
                    <span class="text-muted">Tên linh kiện:</span>
                    <strong class="text-foreground ml-1">{{ currentQuant()?.productName }}</strong>
                  </div>
                  <div>
                    <span class="text-muted">Khả dụng tối đa:</span>
                    <strong class="text-emerald-700 ml-1 font-mono font-bold">
                      {{ currentQuant()?.available }} chiếc
                    </strong>
                  </div>
                </div>
              }

              <div class="space-y-1.5">
                <label class="block font-semibold text-muted text-xs uppercase">
                  Lý do cách ly nhanh
                </label>
                <div class="flex flex-wrap gap-1.5">
                  @for (opt of defectOptions; track opt.value) {
                    <button
                      type="button"
                      (click)="defectClassification = opt.value"
                      class="px-2.5 py-1.5 rounded text-xs font-semibold border transition-colors"
                      [ngClass]="defectClassification === opt.value ? 'bg-danger text-white border-danger' : 'bg-surface border-line text-foreground hover:bg-surface-alt'"
                    >
                      {{ opt.label }}
                    </button>
                  }
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-semibold text-muted text-xs uppercase">
                    Số lượng cách ly
                  </label>
                  <span class="text-[11px] text-muted font-mono">
                    Khả dụng: <strong class="text-foreground">{{ maxAvailable() }} chiếc</strong>
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    [(ngModel)]="quantity"
                    name="quantity"
                    min="1"
                    [max]="maxAvailable()"
                    class="flex-1 px-3 py-2 bg-surface-alt border border-line rounded font-bold text-danger tabular-nums focus:outline-none focus:border-danger text-xs"
                  />
                  <button
                    type="button"
                    (click)="quantity = maxAvailable()"
                    [disabled]="maxAvailable() <= 0"
                    class="px-3 py-2 bg-surface border border-line hover:bg-surface-alt text-xs font-semibold rounded text-muted hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    Tất cả
                  </button>
                </div>
              </div>

              @if (isSerialRequired()) {
                <div class="space-y-1.5 border-t border-line pt-3">
                  <label class="block font-semibold text-muted text-xs uppercase">
                    Quét hoặc nhập số Serial linh kiện (cách nhau dấu phẩy):
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="serialInput"
                    name="serialInput"
                    placeholder="VD: SN-RTX5090-00105, SN-RTX5090-00106..."
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded font-mono text-xs focus:outline-none focus:border-danger"
                  />
                  <p class="text-[11px] text-muted">
                    Linh kiện có quản lý sê-ri bắt buộc nhập chính xác {{ quantity }} số serial
                  </p>
                </div>
              }

              <div>
                <label class="block font-semibold text-muted text-xs uppercase mb-1">
                  Ghi chú kiểm định kho (tùy chọn)
                </label>
                <textarea
                  [(ngModel)]="auditNote"
                  name="auditNote"
                  rows="2"
                  placeholder="Mô tả chi tiết tình trạng linh kiện hoặc số biên bản kiểm định..."
                  class="w-full px-3 py-2 bg-surface-alt border border-line rounded text-foreground focus:outline-none focus:border-danger text-xs"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 p-4 bg-surface-alt border-t border-line flex-shrink-0">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 bg-surface border border-line rounded font-semibold text-xs hover:bg-surface-alt transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting() || maxAvailable() <= 0"
                class="px-4 py-2 bg-danger hover:bg-rose-700 text-white font-bold rounded shadow-xs text-xs transition-colors disabled:opacity-50"
              >
                @if (isSubmitting()) {
                  <span>Đang xử lý...</span>
                } @else {
                  <span>Xác Nhận Cách Ly</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class QuarantineStockDialogComponent implements OnChanges {
  private readonly inventoryService = inject(AdminInventoryService);

  @Input() isOpen = false;
  @Input() quant: InventoryBalanceItem | null = null;
  @Input() branches: readonly SimpleOption[] = [];
  @Input() skus: readonly InventoryBalanceItem[] = [];

  @Output() closeDialog = new EventEmitter<void>();
  @Output() quarantineSuccess = new EventEmitter<{ message: string }>();

  selectedBranchId = 0;
  selectedSkuId = 0;
  quantity = 1;
  defectClassification = 'PHYSICAL_DAMAGE';
  auditNote = '';
  serialInput = '';

  readonly defectOptions = [
    { value: 'PHYSICAL_DAMAGE', label: 'Móp vỏ hộp / trầy xước' },
    { value: 'DEFECTIVE_FAN', label: 'Lỗi quạt tản nhiệt' },
    { value: 'NO_DISPLAY', label: 'Không xuất hình' },
    { value: 'DOA', label: 'Lỗi DOA' },
    { value: 'OTHER', label: 'Lý do khác' },
  ];

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
    }
    if (changes['quant'] && this.quant) {
      this.selectedBranchId = this.quant.branchId;
      this.selectedSkuId = this.quant.skuId;
      this.quantity = 1;
    }
  }

  resetForm(): void {
    this.errorMessage.set(null);
    this.isSubmitting.set(false);
    if (this.quant) {
      this.selectedBranchId = this.quant.branchId;
      this.selectedSkuId = this.quant.skuId;
    } else {
      this.selectedBranchId = this.branches.length > 0 ? this.branches[0].id : 0;
      this.selectedSkuId = this.skus.length > 0 ? this.skus[0].skuId : 0;
    }
    this.quantity = 1;
    this.defectClassification = 'PHYSICAL_DAMAGE';
    this.auditNote = '';
    this.serialInput = '';
  }

  currentQuant(): InventoryBalanceItem | null {
    if (this.quant) {
      return this.quant;
    }
    return (
      this.skus.find(
        (s) => s.branchId === this.selectedBranchId && s.skuId === this.selectedSkuId,
      ) ?? null
    );
  }

  maxAvailable(): number {
    const q = this.currentQuant();
    return q ? Math.max(0, q.available) : 0;
  }

  isSerialRequired(): boolean {
    const q = this.currentQuant();
    return q ? q.serialRequired : false;
  }

  onBranchChange(branchId: number): void {
    this.selectedBranchId = Number(branchId);
    this.errorMessage.set(null);
  }

  onSkuChange(skuId: number): void {
    this.selectedSkuId = Number(skuId);
    this.errorMessage.set(null);
  }

  onCancel(): void {
    this.closeDialog.emit();
  }

  async onSubmit(): Promise<void> {
    const q = this.currentQuant();
    if (!q) {
      this.errorMessage.set('Vui lòng chọn thông tin kho và mã SKU hợp lệ');
      return;
    }

    if (this.quantity < 1) {
      this.errorMessage.set('Số lượng cách ly tối thiểu là 1');
      return;
    }

    if (this.quantity > q.available) {
      this.errorMessage.set(
        `Số lượng yêu cầu (${this.quantity}) vượt quá tồn khả dụng (${q.available})`,
      );
      return;
    }

    const serialIds = this.serialInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (q.serialRequired && serialIds.length !== this.quantity) {
      this.errorMessage.set(
        `Sản phẩm quản lý theo sê-ri yêu cầu nhập đủ ${this.quantity} số serial (hiện có ${serialIds.length})`,
      );
      return;
    }

    const reason = `[${this.defectClassification}] ${this.auditNote.trim() || 'Cách ly theo biên bản kiểm định kho'}`;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const response = await this.inventoryService.quarantineStock({
        branchId: q.branchId,
        skuId: q.skuId,
        quantity: this.quantity,
        serialIds: q.serialRequired ? serialIds : undefined,
        reason,
      });

      if (response.success) {
        this.quarantineSuccess.emit({
          message: `Đã cách ly thành công ${this.quantity} đơn vị SKU ${q.sku}`,
        });
        this.closeDialog.emit();
      } else {
        this.errorMessage.set(response.error?.messageKey ?? 'Không thể thực hiện cách ly linh kiện');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ khi thực hiện cách ly';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
