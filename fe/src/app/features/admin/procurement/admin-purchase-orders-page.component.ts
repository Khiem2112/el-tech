import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BadgeDirective } from '../../../components/atoms/badge/badge.directive';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import {
  AdminPurchaseOrderService,
  PurchaseOrderListItem,
  PurchaseOrderStatus,
} from './services/admin-purchase-order.service';

@Component({
  selector: 'app-admin-purchase-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonDirective, BadgeDirective, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Đơn Mua Hàng (PO)
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Theo dõi chuỗi cung ứng linh kiện phần cứng từ nhà cung cấp về các kho chi nhánh
          </p>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/procurement/purchase-orders/new"
            appButton
            variant="primary"
            size="sm"
            class="uppercase tracking-wide shadow-sm inline-flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Đơn PO</span>
          </a>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 flex flex-col md:flex-row md:items-end justify-between gap-4 shadow-card">
        <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div class="relative flex-1">
            <label for="po-search" class="block text-[11px] font-semibold text-muted uppercase mb-1">Tìm kiếm</label>
            <div class="relative">
              <input
                id="po-search"
                type="text"
                [ngModel]="poService.searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Tìm theo mã PO, nhà cung cấp, mã NCC..."
                class="w-full h-9 pl-9 pr-4 bg-surface border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <svg
                class="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div class="w-full sm:w-56">
            <span class="block text-[11px] font-semibold text-muted uppercase mb-1">Trạng thái</span>
            <app-select
              [options]="statusOptions"
              [value]="poService.statusFilter()"
              (valueChange)="onStatusFilterChange($event)"
              size="md"
            />
          </div>
        </div>

        <div class="text-xs text-muted text-right whitespace-nowrap">
          Tổng số: <strong class="text-foreground">{{ visibleOrders().length }}</strong> đơn mua hàng
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-card overflow-hidden">
        @if (poService.isLoading()) {
          <div class="p-8 text-center text-muted space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải danh sách đơn mua hàng PO...</p>
          </div>
        } @else if (visibleOrders().length === 0) {
          <div class="p-12 text-center text-muted space-y-3">
            <div class="w-12 h-12 mx-auto rounded-full bg-surface-alt border border-line flex items-center justify-center text-muted">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-foreground">Không tìm thấy đơn mua hàng nào</h3>
            <p class="text-xs text-muted max-w-sm mx-auto">
              Không có đơn PO nào khớp với từ khóa tìm kiếm hoặc bộ lọc trạng thái được chọn.
            </p>
            <button
              type="button"
              (click)="clearFilters()"
              appButton
              variant="secondary"
              size="sm"
            >
              Xóa bộ lọc
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left min-w-[1000px] border-collapse">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4 whitespace-nowrap">Mã PO</th>
                  <th class="py-3 px-4 whitespace-nowrap">Nhà Cung Cấp</th>
                  <th class="py-3 px-4 whitespace-nowrap">Kho Nhận</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Số Dòng</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Tổng Tiền</th>
                  <th class="py-3 px-4 whitespace-nowrap">Ngày Tạo</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Trạng Thái</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-xs text-foreground">
                @for (po of visibleOrders(); track po.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold whitespace-nowrap">
                      <a
                        [routerLink]="['/admin/procurement/purchase-orders', po.id]"
                        class="text-primary-strong hover:underline inline-flex items-center gap-1.5"
                      >
                        {{ po.code }}
                      </a>
                      @if (po.supersedesCode) {
                        <div class="text-[10px] text-warning font-mono mt-0.5 whitespace-nowrap">
                          Thay thế: {{ po.supersedesCode }}
                        </div>
                      }
                      @if (po.supersededByCode) {
                        <div class="text-[10px] text-danger font-mono mt-0.5 whitespace-nowrap">
                          Bị thay thế: {{ po.supersededByCode }}
                        </div>
                      }
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="font-bold text-foreground">{{ po.supplierName }}</div>
                      <div class="text-muted text-[11px] font-mono">{{ po.supplierCode }}</div>
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="font-medium text-foreground">{{ po.receivingBranchName }}</div>
                      <div class="text-muted text-[11px] font-mono">{{ po.receivingBranchCode }}</div>
                    </td>
                    <td class="py-3 px-4 text-center tabular tabular-nums text-foreground whitespace-nowrap">
                      {{ po.lineCount }} dòng ({{ po.totalQuantity }} chiếc)
                    </td>
                    <td class="py-3 px-4 text-right font-black tabular tabular-nums text-foreground font-mono whitespace-nowrap">
                      {{ formatCurrency(po.totalAmount) }} đ
                    </td>
                    <td class="py-3 px-4 text-muted tabular tabular-nums text-xs whitespace-nowrap">
                      {{ formatDate(po.createdAt) }}
                    </td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @switch (po.status) {
                        @case ('DRAFT') {
                          <span appBadge variant="muted" class="whitespace-nowrap uppercase">
                            Bản thảo
                          </span>
                        }
                        @case ('CONFIRMED') {
                          <span appBadge variant="info" class="whitespace-nowrap uppercase">
                            Đã xác nhận
                          </span>
                        }
                        @case ('RECEIVED') {
                          <span appBadge variant="success" class="whitespace-nowrap uppercase">
                            Đã nhập kho
                          </span>
                        }
                        @case ('CLOSED') {
                          <span appBadge variant="outline" class="whitespace-nowrap uppercase">
                            Đóng PO
                          </span>
                        }
                        @case ('CANCELLED') {
                          <span appBadge variant="danger" class="whitespace-nowrap uppercase">
                            Đã hủy
                          </span>
                        }
                      }
                    </td>
                    <td class="py-3 px-4 text-right whitespace-nowrap shrink-0">
                      <div class="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                        <a
                          [routerLink]="['/admin/procurement/purchase-orders', po.id]"
                          appButton
                          variant="secondary"
                          size="sm"
                          class="h-8 w-8 p-0"
                          [title]="po.status === 'CONFIRMED' ? 'Đối soát nhập kho' : 'Xem chi tiết'"
                        >
                          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <line x1="10" y1="9" x2="8" y2="9" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminPurchaseOrdersPageComponent implements OnInit {
  readonly poService = inject(AdminPurchaseOrderService);
  private readonly route = inject(ActivatedRoute);

  readonly visibleOrders = computed<PurchaseOrderListItem[]>(() => {
    return this.poService.purchaseOrders();
  });

  readonly statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'DRAFT', label: 'Bản thảo' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'RECEIVED', label: 'Đã nhập kho' },
    { value: 'CLOSED', label: 'Đóng PO' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  ngOnInit(): void {
    const searchParam = this.route.snapshot.queryParams['search'];
    if (searchParam) {
      this.poService.searchQuery.set(searchParam);
    }
    void this.poService.loadPurchaseOrders();
  }

  onSearchChange(term: string): void {
    this.poService.searchQuery.set(term);
    void this.poService.loadPurchaseOrders({ search: term });
  }

  onStatusFilterChange(status: string): void {
    const typedStatus = status as PurchaseOrderStatus | 'ALL';
    this.poService.statusFilter.set(typedStatus);
    void this.poService.loadPurchaseOrders({ status: typedStatus });
  }

  clearFilters(): void {
    this.poService.searchQuery.set('');
    this.poService.statusFilter.set('ALL');
    void this.poService.loadPurchaseOrders({ search: '', status: 'ALL' });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      return dateStr;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatCurrency(value: string | number): string {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) {
      return '0';
    }
    return num.toLocaleString('vi-VN');
  }
}
