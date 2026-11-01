import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import {
  PurchaseOrderDetail,
  PurchaseOrderReceiptMove,
} from '../services/admin-purchase-order.service';

@Component({
  selector: 'app-po-stock-move-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen() && receiptMove()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
        (click)="onBackdropClick($event)"
        role="dialog"
        aria-modal="true"
        aria-labelledby="po-stock-move-modal-title"
      >
        <div
          class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col z-10 text-xs text-foreground my-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="p-4 border-b border-line flex items-center justify-between flex-shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <h3 id="po-stock-move-modal-title" class="font-bold text-foreground uppercase text-sm tracking-wide">
                  Phiếu Nhập Kho #{{ receiptMove()!.code }}
                </h3>
                <span class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                  {{ getStatusLabel(receiptMove()!.status) }}
                </span>
              </div>
              <p class="text-xs text-muted mt-0.5">
                Đơn Mua Hàng: <strong class="text-foreground">#{{ po()?.code }}</strong>
                @if (po()?.supplier?.name) {
                  | NCC: <span class="text-foreground font-medium">{{ po()?.supplier?.name }}</span>
                }
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors cursor-pointer"
              title="Đóng hộp thoại"
              aria-label="Đóng hộp thoại"
            >
              <lucide-icon name="x" class="size-4" aria-hidden="true"></lucide-icon>
            </button>
          </div>

          <div class="p-4 overflow-y-auto space-y-4 flex-1">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface-alt/50 border border-line rounded-lg text-xs">
              <div>
                <span class="block text-muted text-[11px] uppercase font-semibold">Mã Chứng Từ Kho</span>
                <span class="font-bold font-mono text-foreground tabular-nums block mt-0.5">
                  {{ receiptMove()!.code }}
                </span>
              </div>

              <div>
                <span class="block text-muted text-[11px] uppercase font-semibold">Kho Nhận Hàng</span>
                <span class="font-medium text-foreground block truncate mt-0.5">
                  {{ po()?.receivingBranch?.name || 'Showroom EL-TECH' }}
                </span>
              </div>

              <div>
                <span class="block text-muted text-[11px] uppercase font-semibold">Thời Điểm Nhập Kho</span>
                <span class="font-medium text-foreground tabular-nums block mt-0.5">
                  {{ formatDate(receiptMove()!.validatedAt || receiptMove()!.createdAt) }}
                </span>
              </div>

              <div>
                <span class="block text-muted text-[11px] uppercase font-semibold">Người Xác Nhận</span>
                <span class="font-medium text-foreground block truncate mt-0.5">
                  {{ receiptMove()!.validatorName || 'Quản trị viên kho' }}
                </span>
              </div>
            </div>

            @if (receiptMove()!.reason) {
              <div class="p-2.5 bg-surface-alt/70 border border-line rounded text-xs text-muted">
                Ghi chú / Lý do chứng từ: <span class="text-foreground font-medium">{{ receiptMove()!.reason }}</span>
              </div>
            }

            <div class="bg-surface border border-line rounded-lg overflow-hidden shadow-xs">
              <div class="px-4 py-2.5 bg-surface-alt/60 border-b border-line flex items-center justify-between">
                <span class="font-bold uppercase tracking-wider text-xs text-foreground">
                  Danh Sách Linh Kiện Thực Nhập
                </span>
                <span class="text-xs text-muted tabular-nums">
                  {{ receiptMove()!.lines?.length || 0 }} dòng sản phẩm
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-line text-muted uppercase text-[11px] font-semibold bg-surface-alt/30">
                      <th class="py-2.5 px-3 text-center w-10">STT</th>
                      <th class="py-2.5 px-3">Mã SKU</th>
                      <th class="py-2.5 px-3">Tên Linh Kiện</th>
                      <th class="py-2.5 px-3 text-right">Số Lượng Thực Nhận</th>
                      <th class="py-2.5 px-3 text-right">Đơn Giá Vốn Nhập</th>
                      <th class="py-2.5 px-3 text-right">Thành Tiền Vốn</th>
                      <th class="py-2.5 px-3">Mã Sê-ri Tiếp Nhận</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-line">
                    @if (!receiptMove()!.lines || receiptMove()!.lines.length === 0) {
                      <tr>
                        <td colspan="7" class="py-4 text-center text-muted">
                          Chưa có thông tin dòng linh kiện trong phiếu kho
                        </td>
                      </tr>
                    } @else {
                      @for (line of receiptMove()!.lines; track line.id; let idx = $index) {
                        <tr class="hover:bg-surface-alt/40 transition-colors">
                          <td class="py-2.5 px-3 text-center text-muted tabular-nums">
                            {{ idx + 1 }}
                          </td>
                          <td class="py-2.5 px-3 font-mono font-bold text-foreground">
                            {{ line.sku.sku }}
                          </td>
                          <td class="py-2.5 px-3">
                            <div class="font-medium text-foreground">
                              {{ line.productName }}
                            </div>
                            @if (line.variationLabel) {
                              <div class="text-[11px] text-muted">
                                {{ line.variationLabel }}
                              </div>
                            }
                          </td>
                          <td class="py-2.5 px-3 text-right font-bold tabular-nums text-foreground">
                            {{ line.quantity }}
                          </td>
                          <td class="py-2.5 px-3 text-right tabular-nums text-muted">
                            {{ formatCurrency(line.unitCost) }}
                          </td>
                          <td class="py-2.5 px-3 text-right font-medium tabular-nums text-foreground">
                            {{ formatCurrency(calculateLineTotal(line.quantity, line.unitCost)) }}
                          </td>
                          <td class="py-2.5 px-3">
                            @if (line.serials && line.serials.length > 0) {
                              <div class="flex flex-wrap gap-1 max-w-xs">
                                @for (sn of line.serials; track sn) {
                                  <span class="px-1.5 py-0.5 rounded text-[11px] bg-surface-alt border border-line font-mono font-medium text-foreground tabular-nums">
                                    {{ sn }}
                                  </span>
                                }
                              </div>
                            } @else {
                              <span class="text-muted text-[11px]">Không có sê-ri</span>
                            }
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                  @if (receiptMove()!.lines && receiptMove()!.lines.length > 0) {
                    <tfoot>
                      <tr class="bg-surface-alt/40 border-t border-line font-bold">
                        <td colspan="3" class="py-2.5 px-3 text-right text-muted uppercase text-[11px]">
                          Tổng Cộng:
                        </td>
                        <td class="py-2.5 px-3 text-right tabular-nums text-foreground">
                          {{ totalQuantity() }}
                        </td>
                        <td></td>
                        <td class="py-2.5 px-3 text-right tabular-nums text-foreground">
                          {{ formatCurrency(totalCost()) }}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  }
                </table>
              </div>
            </div>
          </div>

          <div class="p-3 border-t border-line flex items-center justify-between flex-wrap gap-2 flex-shrink-0 bg-surface-alt/30">
            <a
              [routerLink]="['/admin/inventory/ledger']"
              [queryParams]="{ search: po()?.code }"
              class="px-3 py-1.5 bg-surface hover:bg-surface-alt border border-line rounded text-xs font-semibold text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <span>Xem Tại Sổ Kho</span>
            </a>

            <button
              type="button"
              (click)="onClose()"
              class="px-4 py-1.5 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded text-xs transition-opacity cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PoStockMoveModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly po = input<PurchaseOrderDetail | null>(null);

  readonly closed = output<void>();

  readonly receiptMove = computed<PurchaseOrderReceiptMove | null>(() => {
    return this.po()?.receiptMove ?? null;
  });

  readonly totalQuantity = computed<number>(() => {
    const lines = this.receiptMove()?.lines ?? [];
    return lines.reduce((acc, curr) => acc + curr.quantity, 0);
  });

  readonly totalCost = computed<number>(() => {
    const lines = this.receiptMove()?.lines ?? [];
    return lines.reduce((acc, curr) => {
      const cost = parseFloat(curr.unitCost);
      const val = isNaN(cost) ? 0 : cost;
      return acc + curr.quantity * val;
    }, 0);
  });

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  calculateLineTotal(quantity: number, unitCost: string): number {
    const cost = parseFloat(unitCost);
    return isNaN(cost) ? 0 : quantity * cost;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'VALIDATED':
        return 'Đã Nhập Kho (Hoàn tất)';
      case 'DRAFT':
        return 'Bản Thảo';
      case 'CANCELLED':
        return 'Đã Hủy';
      default:
        return status;
    }
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  formatCurrency(value?: string | number | null): string {
    if (value === null || value === undefined || value === '') return '0 đ';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(num);
  }
}
