import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import {
  AdminOrderDetail,
} from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-stock-moves-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
        (click)="onBackdropClick($event)"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-moves-modal-title"
      >
        <div
          class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col z-10 text-xs text-foreground my-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="p-4 border-b border-line flex items-center justify-between flex-shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <h3 id="stock-moves-modal-title" class="font-bold text-foreground uppercase text-sm tracking-wide">
                  Phiếu Kho Đơn Hàng #{{ order()?.code }}
                </h3>
                <span class="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {{ order()?.stockMoves?.length || 0 }} Phiếu
                </span>
              </div>
              <p class="text-xs text-muted mt-0.5">
                Kho xuất: <strong class="text-foreground">{{ order()?.fulfillmentBranch?.name || 'Showroom EL-TECH' }}</strong>
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
            @if (!order() || order()!.stockMoves.length === 0) {
              <div class="p-8 text-center bg-surface-alt/50 border border-line rounded-lg space-y-2">
                <div class="text-muted font-bold text-sm">Chưa có phiếu kho liên kết</div>
                <p class="text-xs text-muted max-w-md mx-auto">
                  Phiếu giữ chỗ tồn kho (RESERVED) hoặc phiếu xuất kho bán hàng (ORDER_ISSUE) sẽ được tạo tự động khi xử lý đơn hàng.
                </p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (move of order()!.stockMoves; track move.id) {
                  <div class="bg-surface border border-line rounded-lg overflow-hidden shadow-xs">
                    <div class="px-4 py-3 bg-surface-alt/60 border-b border-line flex items-center justify-between flex-wrap gap-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-bold text-foreground tabular-nums text-xs font-mono">
                          {{ move.code }}
                        </span>
                        <span class="px-2 py-0.5 rounded text-xs font-semibold" [class]="getMoveTypeClass(move.moveType)">
                          {{ getMoveTypeLabel(move.moveType) }}
                        </span>
                        <span class="px-2 py-0.5 rounded text-xs font-semibold" [class]="getStatusClass(move.status)">
                          {{ getStatusLabel(move.status) }}
                        </span>
                      </div>

                      <div class="text-xs text-muted flex items-center gap-3 tabular-nums">
                        <span>Ngày tạo: <strong class="text-foreground">{{ formatDate(move.createdAt) }}</strong></span>
                        @if (move.validatedAt) {
                          <span>Xác nhận: <strong class="text-foreground">{{ formatDate(move.validatedAt) }}</strong></span>
                        }
                      </div>
                    </div>

                    @if (move.reason) {
                      <div class="px-4 py-2 bg-surface text-xs text-muted border-b border-line">
                        Lý do: <span class="text-foreground font-medium">{{ move.reason }}</span>
                      </div>
                    }

                    <div class="p-3 overflow-x-auto">
                      <table class="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr class="border-b border-line text-muted uppercase text-[11px] font-semibold">
                            <th class="py-2 px-2 text-center w-10">STT</th>
                            <th class="py-2 px-2">Mã SKU</th>
                            <th class="py-2 px-2">Tên Linh Kiện</th>
                            <th class="py-2 px-2 text-right">Số Lượng</th>
                            <th class="py-2 px-2 text-right">Đơn Giá Vốn</th>
                            <th class="py-2 px-2">Mã Sê-ri Đã Gán / Xuất</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-line">
                          @if (!move.lines || move.lines.length === 0) {
                            <tr>
                              <td colspan="6" class="py-3 px-2 text-center text-muted">
                                Không có dòng chi tiết linh kiện
                              </td>
                            </tr>
                          } @else {
                            @for (line of move.lines; track line.id; let idx = $index) {
                              <tr class="hover:bg-surface-alt/40 transition-colors">
                                <td class="py-2.5 px-2 text-center text-muted tabular-nums">
                                  {{ idx + 1 }}
                                </td>
                                <td class="py-2.5 px-2 font-mono font-bold text-foreground">
                                  {{ line.sku.sku }}
                                </td>
                                <td class="py-2.5 px-2">
                                  <div class="font-medium text-foreground">
                                    {{ line.productName }}
                                  </div>
                                  @if (line.variationLabel) {
                                    <div class="text-[11px] text-muted">
                                      {{ line.variationLabel }}
                                    </div>
                                  }
                                </td>
                                <td class="py-2.5 px-2 text-right font-bold tabular-nums text-foreground">
                                  {{ line.quantity }}
                                </td>
                                <td class="py-2.5 px-2 text-right tabular-nums text-muted">
                                  {{ formatCurrency(line.unitCost) }}
                                </td>
                                <td class="py-2.5 px-2">
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
                      </table>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="p-3 border-t border-line flex items-center justify-between flex-wrap gap-2 flex-shrink-0 bg-surface-alt/30">
            <a
              [routerLink]="['/admin/inventory/ledger']"
              [queryParams]="{ search: order()?.code }"
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
export class OrderStockMovesModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly order = input<AdminOrderDetail | null>(null);

  readonly closed = output<void>();

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

  getMoveTypeLabel(type: string): string {
    switch (type) {
      case 'ORDER_ISSUE':
        return 'Xuất kho bán hàng';
      case 'RESERVED':
        return 'Giữ chỗ tồn kho';
      case 'ORDER_REVERSAL':
        return 'Nhập hoàn đơn hàng';
      case 'INTERNAL_TRANSFER':
        return 'Điều chuyển nội bộ';
      case 'PURCHASE_RECEIPT':
        return 'Nhập kho mua hàng';
      default:
        return type;
    }
  }

  getMoveTypeClass(type: string): string {
    switch (type) {
      case 'ORDER_ISSUE':
        return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'RESERVED':
        return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'ORDER_REVERSAL':
        return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      case 'INTERNAL_TRANSFER':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800';
      case 'PURCHASE_RECEIPT':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-surface-alt text-muted border border-line';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'VALIDATED':
        return 'Đã xác nhận';
      case 'RESERVED':
        return 'Đang giữ chỗ';
      case 'DRAFT':
        return 'Bản thảo';
      case 'IN_TRANSIT':
        return 'Đang vận chuyển';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'VALIDATED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'RESERVED':
        return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'DRAFT':
        return 'bg-surface-alt text-muted border border-line';
      case 'IN_TRANSIT':
        return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-surface-alt text-muted border border-line';
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
