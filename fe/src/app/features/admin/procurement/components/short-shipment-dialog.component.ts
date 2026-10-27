import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import {
  PurchaseOrderDetail,
  ShortShipmentPayload,
} from '../services/admin-purchase-order.service';

type ShortShipmentLineState = {
  skuId: number;
  sku: string;
  name: string;
  orderedQuantity: number;
  actualQuantity: number;
};

@Component({
  selector: 'app-short-shipment-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen && po) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-white border border-line rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col z-10 text-xs text-foreground"
        >
          <div class="p-4 border-b border-line flex items-center justify-between flex-shrink-0">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Ghi Nhận Giao Thiếu Hàng PO #{{ po.code }}
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Tự động tạo đơn PO thay thế mới tương ứng với số lượng thực nhận
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
              title="Đóng"
              aria-label="Đóng"
            >
              <lucide-icon name="x" class="size-4" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          <div class="p-4 overflow-y-auto space-y-3 flex-1">
            <div class="space-y-2">
              <label class="block text-foreground font-semibold uppercase text-[11px] tracking-wider">
                Số lượng thực nhận từng linh kiện:
              </label>

              <div class="space-y-2">
                @for (line of linesState(); track line.skuId) {
                  <div class="p-3 bg-surface border border-line rounded-lg flex items-center justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="font-mono font-bold text-foreground text-xs truncate">{{ line.sku }}</div>
                      <div class="text-muted text-xs truncate">{{ line.name }}</div>
                      <div class="text-[11px] text-muted mt-0.5">
                        Đã đặt: <strong class="text-foreground font-mono tabular-nums">{{ line.orderedQuantity }}</strong> chiếc
                        @if (line.orderedQuantity > line.actualQuantity) {
                          <span class="text-amber-700 ml-2 font-semibold">
                            (Thiếu: {{ line.orderedQuantity - line.actualQuantity }} chiếc)
                          </span>
                        }
                      </div>
                    </div>

                    <div class="w-28 flex-shrink-0 text-right">
                      <label class="block text-[10px] text-muted uppercase mb-1">Thực nhận</label>
                      <input
                        type="number"
                        min="0"
                        [max]="line.orderedQuantity"
                        [ngModel]="line.actualQuantity"
                        (ngModelChange)="onActualQuantityChange(line.skuId, $event)"
                        class="w-full px-2.5 py-1.5 bg-white border border-line rounded text-right font-bold tabular-nums text-foreground text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-foreground font-semibold uppercase text-[11px] tracking-wider">
                Biên bản bàn giao / Lý do thiếu hàng:
              </label>
              <input
                type="text"
                [(ngModel)]="memoText"
                placeholder="Ví dụ: BB-THIEU-NCC hoặc Xe giao thiếu kiện hàng..."
                class="w-full px-3 py-1.5 bg-white border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div class="p-3.5 border-t border-line flex items-center justify-between flex-shrink-0 bg-surface-alt/40">
            <div class="text-xs">
              @if (!isValid()) {
                <span class="text-rose-600 font-semibold">{{ validationError() }}</span>
              } @else {
                <span class="text-amber-800 font-semibold">Tạo PO thay thế cho {{ totalActualQuantity() }} chiếc thực nhận.</span>
              }
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="onCancel()"
                [disabled]="isSubmitting"
                class="px-4 py-1.5 bg-surface-alt hover:bg-surface-alt/80 border border-line rounded font-semibold text-xs text-foreground transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                (click)="onSubmit()"
                [disabled]="!isValid() || isSubmitting"
                class="px-4 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded text-xs transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                @if (isSubmitting) {
                  <div class="w-3 h-3 border-2 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                } @else {
                  <span>Tạo PO Thay Thế Mới</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ShortShipmentDialogComponent implements OnChanges {
  @Input() po: PurchaseOrderDetail | null = null;
  @Input() isOpen = false;
  @Input() isSubmitting = false;

  @Output() readonly submitted = new EventEmitter<ShortShipmentPayload>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly linesState = signal<ShortShipmentLineState[]>([]);
  memoText = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['po'] || changes['isOpen']) {
      if (this.isOpen && this.po) {
        this.initializeState(this.po);
      }
    }
  }

  private initializeState(po: PurchaseOrderDetail): void {
    const state: ShortShipmentLineState[] = po.lines.map((line) => ({
      skuId: line.skuId,
      sku: line.sku.sku,
      name: line.sku.templateName,
      orderedQuantity: line.quantity,
      actualQuantity: line.quantity,
    }));
    this.linesState.set(state);
    this.memoText = '';
  }

  onActualQuantityChange(skuId: number, val: number): void {
    const safeVal = Math.max(0, Number(val) || 0);
    const updated = this.linesState().map((line) => {
      if (line.skuId === skuId) {
        return {
          ...line,
          actualQuantity: safeVal,
        };
      }
      return line;
    });
    this.linesState.set(updated);
  }

  totalActualQuantity(): number {
    return this.linesState().reduce((sum, line) => sum + line.actualQuantity, 0);
  }

  validationError(): string | null {
    const lines = this.linesState();
    if (lines.length === 0) {
      return 'Không có dòng linh kiện nào.';
    }

    let hasDeficit = false;
    let totalActual = 0;

    for (const line of lines) {
      if (line.actualQuantity > line.orderedQuantity) {
        return `Số lượng thực nhận SKU ${line.sku} không được lớn hơn số lượng đã đặt (${line.orderedQuantity}).`;
      }
      if (line.actualQuantity < line.orderedQuantity) {
        hasDeficit = true;
      }
      totalActual += line.actualQuantity;
    }

    if (!hasDeficit) {
      return 'Chưa có linh kiện nào bị thiếu. Vui lòng sử dụng chức năng Đối soát 100%.';
    }

    if (totalActual === 0) {
      return 'Tổng số lượng thực nhận bằng 0. Vui lòng hủy đơn thay vì báo thiếu.';
    }

    return null;
  }

  isValid(): boolean {
    return this.validationError() === null;
  }

  onSubmit(): void {
    if (!this.isValid()) {
      return;
    }

    const payload: ShortShipmentPayload = {
      reason: this.memoText.trim(),
      lines: this.linesState().map((line) => ({
        skuId: line.skuId,
        actualQuantity: line.actualQuantity,
      })),
    };

    this.submitted.emit(payload);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
