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
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen && po) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-[#090d16]/75 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col z-10 text-xs text-slate-200"
        >
          <div class="p-5 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0">
            <div>
              <h3 class="font-bold text-amber-400 uppercase text-sm tracking-wide">
                Xử Lý Nhà Cung Cấp Giao Thiếu Hàng
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Quy trình hủy PO cũ và tự động tạo PO thay thế liên kết (PUR-015, PUR-016)
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

          <div class="p-5 overflow-y-auto space-y-4 flex-1">
            <div class="p-3.5 bg-amber-950/30 border border-amber-800/60 rounded text-amber-200 text-xs space-y-1.5 leading-relaxed">
              <div class="font-semibold text-amber-300">Cơ chế xử lý giao thiếu hàng chuẩn ERP:</div>
              <div>
                - Không sửa đổi dòng hàng trên PO đã chốt để bảo toàn chứng từ kiểm toán gốc.
              </div>
              <div>
                - Đơn PO hiện tại (<strong>#{{ po.code }}</strong>) sẽ bị hủy với lý do giao thiếu hàng.
              </div>
              <div>
                - Hệ thống tự động tạo mới một PO thay thế ở trạng thái ĐÃ XÁC NHẬN với số lượng thực tế nhận được và liên kết ngược qua trường supersedesPurchaseOrderId.
              </div>
            </div>

            <div class="space-y-3">
              <label class="block text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                Nhập số lượng thực nhận cho từng linh kiện:
              </label>

              <div class="space-y-2">
                @for (line of linesState(); track line.skuId) {
                  <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded flex items-center justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <div class="font-mono font-bold text-white text-xs truncate">{{ line.sku }}</div>
                      <div class="text-slate-400 text-xs truncate">{{ line.name }}</div>
                      <div class="text-[11px] text-slate-500 mt-0.5">
                        Đã đặt: <strong class="text-slate-300">{{ line.orderedQuantity }}</strong> chiếc
                        @if (line.orderedQuantity > line.actualQuantity) {
                          <span class="text-amber-400 ml-2 font-semibold">
                            (Thiếu: {{ line.orderedQuantity - line.actualQuantity }} chiếc)
                          </span>
                        }
                      </div>
                    </div>

                    <div class="w-28 flex-shrink-0 text-right">
                      <label class="block text-[10px] text-slate-400 uppercase mb-1">Thực nhận</label>
                      <input
                        type="number"
                        min="0"
                        [max]="line.orderedQuantity"
                        [ngModel]="line.actualQuantity"
                        (ngModelChange)="onActualQuantityChange(line.skuId, $event)"
                        class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-right font-black tabular-nums text-white text-xs focus:outline-none focus:border-[#76b900]"
                      />
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                Biên bản bàn giao thiếu hàng / Ghi chú lý do:
              </label>
              <input
                type="text"
                [(ngModel)]="memoText"
                placeholder="Ví dụ: BB-THIEU-ASUS-2210 hoặc Xe giao thiếu linh kiện"
                class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#76b900]"
              />
            </div>
          </div>

          <div class="p-4 border-t border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#161b26]">
            <div class="text-xs">
              @if (!isValid()) {
                <span class="text-rose-400 font-semibold">{{ validationError() }}</span>
              } @else {
                <span class="text-amber-400 font-semibold">Sẽ hủy PO cũ và tạo PO thay thế mới cho {{ totalActualQuantity() }} chiếc.</span>
              }
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="onCancel()"
                [disabled]="isSubmitting"
                class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded font-semibold text-xs text-slate-300 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                (click)="onSubmit()"
                [disabled]="!isValid() || isSubmitting"
                class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                @if (isSubmitting) {
                  <div class="w-3.5 h-3.5 border-2 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full animate-spin"></div>
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
