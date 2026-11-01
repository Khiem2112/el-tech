import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BadgeDirective, BadgeVariant } from '../../../components/atoms/badge/badge.directive';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import {
  AdminStockMoveService,
  StockMoveListItem,
  StockMoveStatus,
  StockMoveType,
} from './services/admin-stock-move.service';

@Component({
  selector: 'app-admin-stock-moves-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BadgeDirective,
    ButtonDirective,
    SelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Quản Lý Phiếu Kho
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Quản lý tập trung toàn bộ phiếu nhập xuất luân chuyển kho kèm mở rộng dòng dịch chuyển linh kiện
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <a
            routerLink="/admin/inventory/balances"
            appButton
            variant="secondary"
            size="sm"
            class="uppercase tracking-wide"
          >
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span>Ma Trận Tồn Kho</span>
          </a>

          <a
            routerLink="/admin/inventory/ledger"
            appButton
            variant="secondary"
            size="sm"
            class="uppercase tracking-wide"
          >
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span>Sổ Kho Bất Biến</span>
          </a>

          <button
            type="button"
            (click)="toggleAllExpansion()"
            appButton
            variant="outline"
            size="sm"
            class="uppercase tracking-wide"
          >
            <span>{{ isAllExpanded() ? 'Thu Gọn Tất Cả' : 'Mở Rộng Tất Cả' }}</span>
          </button>
        </div>
      </div>

      <div class="p-3 bg-surface border border-line rounded-lg text-xs text-foreground flex items-center justify-between flex-wrap gap-2 shadow-card">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
          <span>Nhấp vào nút mũi tên đầu mỗi hàng phiếu kho để xem chi tiết danh sách linh kiện và số sê-ri luân chuyển.</span>
        </div>
        <span class="px-2 py-0.5 rounded bg-surface-alt text-muted text-xs border border-line tabular">
          Tổng số phiếu kho: <strong class="text-foreground">{{ stockMoveService.total() }}</strong>
        </span>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 space-y-3 shadow-card">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div class="relative lg:col-span-2">
            <label for="stock-move-search" class="block text-xs font-semibold text-muted uppercase mb-1">
              Tìm kiếm
            </label>
            <div class="relative">
              <input
                id="stock-move-search"
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Tìm mã phiếu, mã đơn, PO, lý do..."
                class="w-full h-9 pl-9 pr-3 bg-surface border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <svg class="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <span class="block text-xs font-semibold text-muted uppercase mb-1">Loại phiếu</span>
            <app-select
              [options]="moveTypeOptions"
              [value]="selectedMoveType()"
              (valueChange)="onMoveTypeChange($event)"
              size="md"
            />
          </div>

          <div>
            <span class="block text-xs font-semibold text-muted uppercase mb-1">Trạng thái</span>
            <app-select
              [options]="statusOptions"
              [value]="selectedStatus()"
              (valueChange)="onStatusChange($event)"
              size="md"
            />
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-card overflow-hidden">
        @if (stockMoveService.isLoading()) {
          <div class="p-12 text-center text-muted space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải danh sách phiếu kho...</p>
          </div>
        } @else if (stockMoveService.error(); as error) {
          <div class="p-8 text-center text-danger space-y-3">
            <p class="text-xs">{{ error }}</p>
            <button
              type="button"
              (click)="loadMoves()"
              appButton
              variant="secondary"
              size="sm"
            >
              Tải lại dữ liệu
            </button>
          </div>
        } @else if (stockMoveService.moves().length === 0) {
          <div class="p-12 text-center text-muted space-y-2">
            <svg class="w-12 h-12 mx-auto text-muted/60" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p class="text-sm font-semibold text-foreground">Không tìm thấy phiếu kho nào</p>
            <p class="text-xs text-muted">Thử điều chỉnh từ khóa tìm kiếm hoặc các tiêu chí bộ lọc.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left min-w-[1050px] border-collapse">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-3 px-3 w-10 text-center"></th>
                  <th class="py-3 px-4 whitespace-nowrap">Mã Phiếu Kho</th>
                  <th class="py-3 px-4 whitespace-nowrap">Loại Phiếu</th>
                  <th class="py-3 px-4 whitespace-nowrap">Trạng Thái</th>
                  <th class="py-3 px-4">Chứng Từ Liên Kết</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Quy Mô</th>
                  <th class="py-3 px-4 whitespace-nowrap">Ngày Tạo</th>
                  <th class="py-3 px-4">Lý Do / Ghi Chú</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-sm text-foreground">
                @for (move of stockMoveService.moves(); track move.id) {
                  <tr
                    class="hover:bg-surface-alt/70 transition-colors cursor-pointer select-none"
                    [class.bg-surface-alt/30]="stockMoveService.isExpanded(move.id)"
                    (click)="stockMoveService.toggleExpand(move.id)"
                  >
                    <td class="py-3 px-3 text-center" (click)="$event.stopPropagation()">
                      <button
                        type="button"
                        (click)="stockMoveService.toggleExpand(move.id)"
                        class="p-1 rounded hover:bg-surface border border-transparent hover:border-line text-muted hover:text-foreground transition-all duration-200"
                        [attr.aria-label]="stockMoveService.isExpanded(move.id) ? 'Thu gon dong chi tiet' : 'Mo rong dong chi tiet'"
                      >
                        <svg
                          class="w-4 h-4 transition-transform duration-200"
                          [class.rotate-90]="stockMoveService.isExpanded(move.id)"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </td>

                    <td class="py-3 px-4 font-bold text-foreground tabular whitespace-nowrap">
                      {{ move.code }}
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <span appBadge [variant]="getMoveTypeBadgeVariant(move.moveType)" size="sm">
                        {{ getMoveTypeLabel(move.moveType) }}
                      </span>
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <span appBadge [variant]="getStatusBadgeVariant(move.status)" size="sm">
                        {{ getStatusLabel(move.status) }}
                      </span>
                    </td>

                    <td class="py-3 px-4" (click)="$event.stopPropagation()">
                      @if (move.purchaseOrder) {
                        <div>
                          <a
                            routerLink="/admin/procurement/purchase-orders"
                            class="font-semibold text-primary hover:underline tabular"
                          >
                            PO: {{ move.purchaseOrder.code }}
                          </a>
                          <div class="text-xs text-muted truncate max-w-xs">
                            NCC: {{ move.purchaseOrder.supplier.name }}
                          </div>
                        </div>
                      } @else if (move.order) {
                        <div>
                          <a
                            [routerLink]="['/admin/orders', move.order.id]"
                            class="font-semibold text-primary hover:underline tabular"
                          >
                            Đơn: {{ move.order.code }}
                          </a>
                          <div class="text-xs text-muted truncate max-w-xs">
                            Người nhận: {{ move.order.receiverName }} ({{ move.order.receiverPhone }})
                          </div>
                        </div>
                      } @else {
                        <span class="text-muted text-xs">-</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-center tabular whitespace-nowrap">
                      <div class="font-bold text-foreground">{{ move.totalQuantity }} sp</div>
                      <div class="text-xs text-muted">{{ move.totalLines }} dòng SKU</div>
                    </td>

                    <td class="py-3 px-4 text-muted tabular whitespace-nowrap">
                      <div>{{ formatDate(move.createdAt) }}</div>
                      @if (move.validatedAt) {
                        <div class="text-[11px] text-emerald-600">Đã duyệt: {{ formatDate(move.validatedAt) }}</div>
                      } @else if (move.cancelledAt) {
                        <div class="text-[11px] text-rose-600">Đã hủy: {{ formatDate(move.cancelledAt) }}</div>
                      }
                    </td>

                    <td class="py-3 px-4 text-xs text-muted max-w-xs truncate" [title]="move.reason ?? ''">
                      {{ move.reason || '-' }}
                    </td>
                  </tr>

                  @if (stockMoveService.isExpanded(move.id)) {
                    <tr class="bg-surface-alt/40 border-b border-line">
                      <td colspan="8" class="p-4 pl-12">
                        <div class="bg-surface border border-line rounded-lg p-4 space-y-3 shadow-inner">
                          <div class="flex items-center justify-between flex-wrap gap-2">
                            <div class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                              <span>Chi Tiết Dòng Dịch Chuyển (StockMoveLine)</span>
                              <span class="px-2 py-0.5 rounded-full bg-surface-alt border border-line text-[11px] text-foreground font-semibold">
                                {{ move.lines.length }} dòng linh kiện
                              </span>
                            </div>
                            <div class="text-xs text-muted">
                              Tổng số lượng: <strong class="text-foreground tabular">{{ move.totalQuantity }}</strong>
                            </div>
                          </div>

                          @if (move.lines.length === 0) {
                            <p class="text-xs text-muted italic py-2">
                              Không có dòng linh kiện nào được ghi nhận trong phiếu này.
                            </p>
                          } @else {
                            <div class="overflow-x-auto border border-line rounded">
                              <table class="w-full text-xs text-left border-collapse">
                                <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase">
                                  <tr>
                                    <th class="py-2.5 px-3 whitespace-nowrap">Mã SKU</th>
                                    <th class="py-2.5 px-3">Tên Linh Kiện & Biến Thể</th>
                                    <th class="py-2.5 px-3 text-right whitespace-nowrap">Số Lượng</th>
                                    <th class="py-2.5 px-3 text-right whitespace-nowrap">Giá Vốn</th>
                                    <th class="py-2.5 px-3">Mã Sê-ri Liên Kết</th>
                                  </tr>
                                </thead>
                                <tbody class="divide-y divide-line text-foreground">
                                  @for (line of move.lines; track line.id) {
                                    <tr class="hover:bg-surface-alt/50 transition-colors">
                                      <td class="py-2.5 px-3 font-semibold tabular whitespace-nowrap">
                                        <div class="text-foreground font-bold">{{ line.sku.sku }}</div>
                                        @if (line.sku.barcode) {
                                          <div class="text-[11px] text-muted font-mono">{{ line.sku.barcode }}</div>
                                        }
                                      </td>

                                      <td class="py-2.5 px-3">
                                        <div class="font-medium text-foreground">{{ line.sku.template.name }}</div>
                                        @if (line.sku.variationLabel) {
                                          <div class="text-[11px] text-muted font-normal mt-0.5">
                                            Phân loại: <span class="text-foreground font-medium">{{ line.sku.variationLabel }}</span>
                                          </div>
                                        }
                                      </td>

                                      <td class="py-2.5 px-3 text-right font-bold tabular whitespace-nowrap">
                                        {{ line.quantity }}
                                      </td>

                                      <td class="py-2.5 px-3 text-right tabular text-muted whitespace-nowrap">
                                        {{ formatCurrency(line.unitCost) }}
                                      </td>

                                      <td class="py-2.5 px-3">
                                        @if (line.serials && line.serials.length > 0) {
                                          <div class="flex flex-wrap gap-1 max-w-md">
                                            @for (serial of line.serials; track serial) {
                                              <span class="px-1.5 py-0.5 rounded bg-surface-alt border border-line text-[11px] font-mono text-foreground">
                                                {{ serial }}
                                              </span>
                                            }
                                          </div>
                                        } @else {
                                          <span class="text-muted text-[11px]">Không quản lý sê-ri</span>
                                        }
                                      </td>
                                    </tr>
                                  }
                                </tbody>
                              </table>
                            </div>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-sm bg-surface-alt">
            <div class="text-muted">
              Hiển thị <strong class="text-foreground">{{ (stockMoveService.page() - 1) * stockMoveService.limit() + 1 }}</strong>
              - <strong class="text-foreground">{{ getEndIndex() }}</strong>
              trong tổng số <strong class="text-foreground">{{ stockMoveService.total() }}</strong> phiếu kho
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="stockMoveService.page() <= 1"
                (click)="onPageChange(stockMoveService.page() - 1)"
                appButton
                variant="outline"
                size="sm"
              >
                Trước
              </button>

              <span class="px-2 text-foreground font-semibold tabular tabular-nums">
                Trang {{ stockMoveService.page() }} / {{ stockMoveService.totalPages() }}
              </span>

              <button
                type="button"
                [disabled]="stockMoveService.page() >= stockMoveService.totalPages()"
                (click)="onPageChange(stockMoveService.page() + 1)"
                appButton
                variant="outline"
                size="sm"
              >
                Sau
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminStockMovesPageComponent implements OnInit {
  readonly stockMoveService = inject(AdminStockMoveService);

  readonly searchQuery = signal<string>('');
  readonly selectedMoveType = signal<string>('ALL');
  readonly selectedStatus = signal<string>('ALL');

  readonly moveTypeOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả loại phiếu' },
    { value: 'PURCHASE_RECEIPT', label: 'Nhập hàng NCC (PURCHASE_RECEIPT)' },
    { value: 'ORDER_ISSUE', label: 'Xuất kho bán hàng (ORDER_ISSUE)' },
  ];

  readonly statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'DRAFT', label: 'Nháp (DRAFT)' },
    { value: 'RESERVED', label: 'Giữ chỗ (RESERVED)' },
    { value: 'VALIDATED', label: 'Đã xác thực (VALIDATED)' },
    { value: 'CANCELLED', label: 'Đã hủy (CANCELLED)' },
  ];

  ngOnInit(): void {
    this.loadMoves();
  }

  loadMoves(): void {
    this.stockMoveService.loadStockMoves({
      search: this.searchQuery(),
      moveType: this.selectedMoveType(),
      status: this.selectedStatus(),
      page: this.stockMoveService.page(),
      limit: this.stockMoveService.limit(),
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.stockMoveService.page.set(1);
    this.loadMoves();
  }

  onMoveTypeChange(type: string): void {
    this.selectedMoveType.set(type);
    this.stockMoveService.page.set(1);
    this.loadMoves();
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.stockMoveService.page.set(1);
    this.loadMoves();
  }

  onPageChange(page: number): void {
    this.stockMoveService.page.set(page);
    this.loadMoves();
  }

  getEndIndex(): number {
    const end = this.stockMoveService.page() * this.stockMoveService.limit();
    const total = this.stockMoveService.total();
    return end > total ? total : end;
  }

  isAllExpanded(): boolean {
    const moves = this.stockMoveService.moves();
    if (moves.length === 0) return false;
    return moves.every((m: StockMoveListItem) => this.stockMoveService.isExpanded(m.id));
  }

  toggleAllExpansion(): void {
    if (this.isAllExpanded()) {
      this.stockMoveService.collapseAll();
    } else {
      this.stockMoveService.expandAll();
    }
  }

  getMoveTypeLabel(type: StockMoveType): string {
    switch (type) {
      case 'PURCHASE_RECEIPT':
        return 'Nhập hàng NCC';
      case 'ORDER_ISSUE':
        return 'Xuất kho bán hàng';
      default:
        return type;
    }
  }

  getMoveTypeBadgeVariant(type: StockMoveType): BadgeVariant {
    switch (type) {
      case 'PURCHASE_RECEIPT':
        return 'primary';
      case 'ORDER_ISSUE':
        return 'info';
      default:
        return 'muted';
    }
  }

  getStatusLabel(status: StockMoveStatus): string {
    switch (status) {
      case 'DRAFT':
        return 'Nháp';
      case 'RESERVED':
        return 'Giữ chỗ';
      case 'VALIDATED':
        return 'Đã xác thực';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  getStatusBadgeVariant(status: StockMoveStatus): BadgeVariant {
    switch (status) {
      case 'DRAFT':
        return 'muted';
      case 'RESERVED':
        return 'warning';
      case 'VALIDATED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'muted';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(amountStr: string | number): string {
    const num = typeof amountStr === 'number' ? amountStr : parseFloat(amountStr) || 0;
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  }
}
