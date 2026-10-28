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
  ValidateReceiptPayload,
} from '../services/admin-purchase-order.service';

type ReceiptLineState = {
  skuId: number;
  sku: string;
  name: string;
  expectedQuantity: number;
  receivedQuantity: number;
  serialRequired: boolean;
  serialText: string;
  parsedSerials: string[];
  duplicateSerials: string[];
  error: string | null;
};

@Component({
  selector: 'app-validate-po-receipt-dialog',
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
          class="relative bg-white border border-line rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-xs text-foreground"
        >
          <div class="p-4 border-b border-line flex items-center justify-between flex-shrink-0">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Đối Soát Nhập Kho PO #{{ po.code }}
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Kho nhận hàng: <strong class="text-foreground">{{ po.receivingBranch.name }}</strong>
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
            <div class="space-y-3">
              @for (line of linesState(); track line.skuId) {
                <div class="p-3 bg-surface border border-line rounded-lg space-y-2.5">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="tabular font-bold text-foreground text-xs">{{ line.sku }}</span>
                        @if (line.serialRequired) {
                          <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                            Cần Serial
                          </span>
                        }
                      </div>
                      <div class="text-muted text-xs mt-0.5">{{ line.name }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-xs text-muted">Số lượng cần nhập:</div>
                      <div class="text-foreground font-bold text-xs tabular-nums">{{ line.expectedQuantity }} chiếc</div>
                    </div>
                  </div>

                  @if (line.serialRequired) {
                    <div class="space-y-1.5 pt-2 border-t border-line">
                      <div class="flex items-center justify-between text-xs">
                        <label class="text-muted font-medium">
                          Quét hoặc dán danh sách số sê-ri:
                        </label>
                        <span
                          class="tabular text-xs font-bold tabular-nums"
                          [class.text-emerald-700]="line.parsedSerials.length === line.expectedQuantity && line.duplicateSerials.length === 0"
                          [class.text-amber-700]="line.parsedSerials.length !== line.expectedQuantity || line.duplicateSerials.length > 0"
                        >
                          Đã quét: {{ line.parsedSerials.length }} / {{ line.expectedQuantity }}
                        </span>
                      </div>

                      <textarea
                        rows="2"
                        [ngModel]="line.serialText"
                        (ngModelChange)="onSerialTextChange(line.skuId, $event)"
                        placeholder="Nhập hoặc quét mã vạch (phân tách bởi dấu phẩy, khoảng trắng hoặc xuống dòng)..."
                        class="w-full px-2.5 py-1.5 bg-white border rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                        [class.border-line]="line.duplicateSerials.length === 0 && line.parsedSerials.length === line.expectedQuantity"
                        [class.border-amber-500]="line.parsedSerials.length !== line.expectedQuantity || line.duplicateSerials.length > 0"
                      ></textarea>

                      @if (line.duplicateSerials.length > 0) {
                        <p class="text-rose-600 text-xs font-semibold">
                          Trùng lặp: {{ line.duplicateSerials.join(', ') }}
                        </p>
                      } @else if (line.parsedSerials.length > line.expectedQuantity) {
                        <p class="text-amber-700 text-xs">
                          Vượt quá số lượng: {{ line.parsedSerials.length }} / {{ line.expectedQuantity }}
                        </p>
                      } @else if (line.parsedSerials.length < line.expectedQuantity) {
                        <p class="text-muted text-xs">
                          Còn thiếu {{ line.expectedQuantity - line.parsedSerials.length }} mã sê-ri.
                        </p>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <div class="p-3.5 border-t border-line flex items-center justify-between flex-shrink-0 bg-surface-alt/40">
            <div class="text-xs">
              @if (!isFormValid()) {
                <span class="text-amber-700 font-semibold">Chưa đủ điều kiện: Cần nhập đủ sê-ri hợp lệ.</span>
              } @else {
                <span class="text-emerald-700 font-semibold">Đã đủ điều kiện xác thực nhập kho 100%.</span>
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
                [disabled]="!isFormValid() || isSubmitting"
                class="px-4 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded text-xs transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                @if (isSubmitting) {
                  <div class="w-3 h-3 border-2 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full animate-spin"></div>
                  <span>Đang nhập kho...</span>
                } @else {
                  <span>Xác Nhận Nhập Kho 100%</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ValidatePOReceiptDialogComponent implements OnChanges {
  @Input() po: PurchaseOrderDetail | null = null;
  @Input() isOpen = false;
  @Input() isSubmitting = false;

  @Output() readonly validated = new EventEmitter<ValidateReceiptPayload>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly linesState = signal<ReceiptLineState[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['po'] || changes['isOpen']) {
      if (this.isOpen && this.po) {
        this.initializeState(this.po);
      }
    }
  }

  private initializeState(po: PurchaseOrderDetail): void {
    const state: ReceiptLineState[] = po.lines.map((line) => ({
      skuId: line.skuId,
      sku: line.sku.sku,
      name: line.sku.templateName,
      expectedQuantity: line.quantity,
      receivedQuantity: line.quantity,
      serialRequired: line.sku.serialRequired,
      serialText: '',
      parsedSerials: [],
      duplicateSerials: [],
      error: null,
    }));
    this.linesState.set(state);
  }

  onSerialTextChange(skuId: number, text: string): void {
    const current = this.linesState();
    const updated = current.map((line) => {
      if (line.skuId !== skuId) {
        return line;
      }

      const tokens = text
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const seen = new Set<string>();
      const duplicates: string[] = [];
      for (const token of tokens) {
        const upper = token.toUpperCase();
        if (seen.has(upper)) {
          duplicates.push(token);
        }
        seen.add(upper);
      }

      return {
        ...line,
        serialText: text,
        parsedSerials: tokens,
        duplicateSerials: duplicates,
      };
    });

    this.linesState.set(updated);
  }

  isFormValid(): boolean {
    const lines = this.linesState();
    if (lines.length === 0) {
      return false;
    }

    for (const line of lines) {
      if (line.serialRequired) {
        if (line.parsedSerials.length !== line.expectedQuantity) {
          return false;
        }
        if (line.duplicateSerials.length > 0) {
          return false;
        }
      }
    }

    return true;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    const payload: ValidateReceiptPayload = {
      lines: this.linesState().map((line) => ({
        skuId: line.skuId,
        receivedQuantity: line.expectedQuantity,
        serialNumbers: line.serialRequired ? line.parsedSerials : [],
      })),
    };

    this.validated.emit(payload);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
