import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminPurchaseOrderService,
  PurchaseOrderListItem,
  PurchaseOrderStatus,
} from './services/admin-purchase-order.service';

@Component({
  selector: 'app-admin-purchase-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-20
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Đơn Mua Hàng (PO)
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Theo dõi chuỗi cung ứng linh kiện phần cứng từ nhà cung cấp về các kho chi nhánh (PUR-001, PUR-002)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/procurement/purchase-orders/new"
            class="px-3.5 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors shadow-sm inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Đơn PO</span>
          </a>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative flex-1">
            <input
              type="text"
              [ngModel]="poService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm theo mã PO, nhà cung cấp, mã NCC..."
              class="w-full pl-9 pr-4 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
            />
            <svg
              class="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div class="flex items-center gap-2">
            <label for="po-status-filter" class="text-xs text-slate-400 font-medium whitespace-nowrap">Trạng thái:</label>
            <select
              id="po-status-filter"
              [ngModel]="poService.statusFilter()"
              (ngModelChange)="onStatusFilterChange($event)"
              class="px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="DRAFT">Bản thảo</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="RECEIVED">Đã nhập kho</option>
              <option value="CLOSED">Đóng PO</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div class="text-xs text-slate-400 text-right">
          Tổng số: <strong class="text-white">{{ visibleOrders().length }}</strong> đơn mua hàng
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        @if (poService.isLoading()) {
          <div class="p-8 text-center text-slate-400 space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-[#76b900] border-r-transparent border-b-[#76b900] border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải danh sách đơn mua hàng PO...</p>
          </div>
        } @else if (visibleOrders().length === 0) {
          <div class="p-12 text-center text-slate-400 space-y-3">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#090d16] border border-[#272f3d] flex items-center justify-center text-slate-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-300">Không tìm thấy đơn mua hàng nào</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Không có đơn PO nào khớp với từ khóa tìm kiếm hoặc bộ lọc trạng thái được chọn.
            </p>
            <button
              type="button"
              (click)="clearFilters()"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded text-xs text-slate-300 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4">Mã PO</th>
                  <th class="py-3 px-4">Nhà Cung Cấp</th>
                  <th class="py-3 px-4">Kho Nhận</th>
                  <th class="py-3 px-4 text-center">Số Dòng</th>
                  <th class="py-3 px-4 text-right">Tổng Tiền</th>
                  <th class="py-3 px-4">Ngày Tạo</th>
                  <th class="py-3 px-4 text-center">Trạng Thái</th>
                  <th class="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d]">
                @for (po of visibleOrders(); track po.id) {
                  <tr class="hover:bg-[#1f2736] transition-colors">
                    <td class="py-3 px-4 font-mono font-bold">
                      <a
                        [routerLink]="['/admin/procurement/purchase-orders', po.id]"
                        class="text-[#76b900] hover:underline inline-flex items-center gap-1.5"
                      >
                        {{ po.code }}
                      </a>
                      @if (po.supersedesCode) {
                        <div class="text-[10px] text-amber-400 font-mono mt-0.5">
                          Thay thế: {{ po.supersedesCode }}
                        </div>
                      }
                      @if (po.supersededByCode) {
                        <div class="text-[10px] text-rose-400 font-mono mt-0.5">
                          Bị thay thế: {{ po.supersededByCode }}
                        </div>
                      }
                    </td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-white">{{ po.supplierName }}</div>
                      <div class="text-slate-400 text-[11px] font-mono">{{ po.supplierCode }}</div>
                    </td>
                    <td class="py-3 px-4">
                      <div class="text-slate-200">{{ po.receivingBranchName }}</div>
                      <div class="text-slate-400 text-[11px] font-mono">{{ po.receivingBranchCode }}</div>
                    </td>
                    <td class="py-3 px-4 text-center tabular-nums text-slate-300">
                      {{ po.lineCount }} dòng ({{ po.totalQuantity }} chiếc)
                    </td>
                    <td class="py-3 px-4 text-right font-black tabular-nums text-white font-mono">
                      {{ formatCurrency(po.totalAmount) }} ₫
                    </td>
                    <td class="py-3 px-4 text-slate-400 tabular-nums text-xs">
                      {{ formatDate(po.createdAt) }}
                    </td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @switch (po.status) {
                        @case ('DRAFT') {
                          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800">
                            Bản thảo
                          </span>
                        }
                        @case ('CONFIRMED') {
                          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800">
                            Đã xác nhận
                          </span>
                        }
                        @case ('RECEIVED') {
                          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                            Đã nhập kho
                          </span>
                        }
                        @case ('CLOSED') {
                          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            Đóng PO
                          </span>
                        }
                        @case ('CANCELLED') {
                          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-800">
                            Đã hủy
                          </span>
                        }
                      }
                    </td>
                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <div class="inline-flex items-center gap-1.5">
                        <a
                          [routerLink]="['/admin/procurement/purchase-orders', po.id]"
                          class="p-1.5 bg-[#090d16] hover:bg-[#272f3d] text-slate-300 hover:text-white rounded border border-[#272f3d] transition-colors"
                          [title]="po.status === 'CONFIRMED' ? 'Đối soát nhập kho' : 'Xem chi tiết'"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
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

  readonly visibleOrders = computed<PurchaseOrderListItem[]>(() => {
    return this.poService.purchaseOrders();
  });

  ngOnInit(): void {
    void this.poService.loadPurchaseOrders();
  }

  onSearchChange(term: string): void {
    this.poService.searchQuery.set(term);
    void this.poService.loadPurchaseOrders({ search: term });
  }

  onStatusFilterChange(status: PurchaseOrderStatus | 'ALL'): void {
    this.poService.statusFilter.set(status);
    void this.poService.loadPurchaseOrders({ status });
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
