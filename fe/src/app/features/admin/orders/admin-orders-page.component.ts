import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminBranch, AdminBranchService } from '../branches/services/admin-branch.service';
import {
  AdminOrderListItem,
  AdminOrderStatus,
  AdminOrderService,
} from './services/admin-order.service';

type PipelineTab = {
  readonly key: string;
  readonly label: string;
  readonly isUrgent?: boolean;
};

type OrderGroup = {
  readonly key: string;
  readonly title: string;
  readonly items: AdminOrderListItem[];
};

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]"
      >
        <div class="flex items-center gap-3">
          <span
            class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold"
          >
            SCR-09
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Quản Lý Đơn Hàng
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Theo dõi và phân đoạn trạng thái toàn bộ chuỗi cung ứng đơn hàng phần cứng (ORD-001, ORD-003)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Tổng số đơn toàn hệ thống:
            <strong class="text-white font-mono font-bold">{{ orderService.total() }}</strong>
          </span>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        <div
          class="flex items-center overflow-x-auto border-b border-[#272f3d] px-3 py-2 text-xs gap-1.5 scrollbar-thin scrollbar-thumb-slate-700"
        >
          @for (tab of pipelineTabs; track tab.key) {
            <button
              type="button"
              (click)="onTabClick(tab.key)"
              class="px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 text-xs"
              [class.bg-[#76b900]]="orderService.selectedTab() === tab.key"
              [class.text-[#090d16]]="orderService.selectedTab() === tab.key"
              [class.font-bold]="orderService.selectedTab() === tab.key"
              [class.text-slate-400]="orderService.selectedTab() !== tab.key"
              [class.hover:text-white]="orderService.selectedTab() !== tab.key"
              [class.hover:bg-[#272f3d]]="orderService.selectedTab() !== tab.key"
            >
              <span>{{ tab.label }}</span>
              @if (getTabCount(tab.key) > 0) {
                <span
                  class="px-1.5 py-0.2 rounded-full font-mono text-[11px] font-bold"
                  [class.bg-black/25]="orderService.selectedTab() === tab.key"
                  [class.text-[#090d16]]="orderService.selectedTab() === tab.key"
                  [class.bg-amber-500/20]="orderService.selectedTab() !== tab.key && tab.isUrgent"
                  [class.text-amber-400]="orderService.selectedTab() !== tab.key && tab.isUrgent"
                  [class.bg-[#272f3d]]="orderService.selectedTab() !== tab.key && !tab.isUrgent"
                  [class.text-slate-300]="orderService.selectedTab() !== tab.key && !tab.isUrgent"
                >
                  {{ getTabCount(tab.key) }}
                </span>
              }
            </button>
          }
        </div>

        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-[#090d16]/50">
          <div class="lg:col-span-2">
            <label for="order-search-input" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Tìm kiếm
            </label>
            <div class="relative">
              <input
                id="order-search-input"
                type="text"
                [ngModel]="orderService.searchQuery()"
                (ngModelChange)="onSearchInput($event)"
                placeholder="Mã đơn ORD-, SĐT, email, tên..."
                class="w-full pl-8 pr-3 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900] text-xs font-sans"
              />
              <svg
                class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div>
            <label for="order-branch-filter" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Chi nhánh
            </label>
            <select
              id="order-branch-filter"
              [ngModel]="orderService.selectedBranchId()"
              (ngModelChange)="onBranchChange($event)"
              class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-slate-200 focus:outline-none focus:border-[#76b900] text-xs"
            >
              <option [ngValue]="null">Tất cả chi nhánh</option>
              @for (branch of branchList(); track branch.id) {
                <option [ngValue]="branch.id">{{ branch.code }}: {{ branch.name }}</option>
              }
            </select>
          </div>

          <div>
            <label for="order-fulfillment-filter" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Hình thức
            </label>
            <select
              id="order-fulfillment-filter"
              [ngModel]="orderService.selectedFulfillment()"
              (ngModelChange)="onFulfillmentChange($event)"
              class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-slate-200 focus:outline-none focus:border-[#76b900] text-xs"
            >
              <option value="">Tất cả hình thức</option>
              <option value="DELIVERY">Giao hàng tận nơi</option>
              <option value="PICKUP">Nhận tại cửa hàng</option>
            </select>
          </div>

          <div>
            <label for="order-payment-filter" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Thanh toán
            </label>
            <select
              id="order-payment-filter"
              [ngModel]="orderService.selectedPayment()"
              (ngModelChange)="onPaymentChange($event)"
              class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-slate-200 focus:outline-none focus:border-[#76b900] text-xs"
            >
              <option value="">Tất cả thanh toán</option>
              <option value="QR">Chuyển khoản QR</option>
              <option value="COD">Thu tiền COD</option>
            </select>
          </div>

          <div>
            <label for="order-assembly-filter" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Lắp ráp PC
            </label>
            <select
              id="order-assembly-filter"
              [ngModel]="orderService.selectedAssembly()"
              (ngModelChange)="onAssemblyChange($event)"
              class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-slate-200 focus:outline-none focus:border-[#76b900] text-xs"
            >
              <option value="">Tất cả</option>
              <option value="assembly">Có lắp ráp PC</option>
              <option value="retail">Chỉ mua lẻ</option>
            </select>
          </div>
        </div>

        <div
          class="px-4 py-2 bg-[#090d16] border-t border-[#272f3d] flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">Từ ngày:</span>
              <input
                type="date"
                [ngModel]="orderService.dateFrom()"
                (ngModelChange)="onDateFromChange($event)"
                class="px-2 py-1 bg-[#161b26] border border-[#272f3d] rounded text-slate-200 focus:outline-none focus:border-[#76b900] text-xs"
              />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">Đến ngày:</span>
              <input
                type="date"
                [ngModel]="orderService.dateTo()"
                (ngModelChange)="onDateToChange($event)"
                class="px-2 py-1 bg-[#161b26] border border-[#272f3d] rounded text-slate-200 focus:outline-none focus:border-[#76b900] text-xs"
              />
            </div>
            @if (hasActiveFilters()) {
              <button
                type="button"
                (click)="orderService.resetFilters()"
                class="px-2.5 py-1 bg-[#272f3d] hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
              >
                Xóa bộ lọc
              </button>
            }
          </div>

          <div class="flex items-center gap-2">
            <label for="order-group-select" class="text-slate-400 font-medium">Gom nhóm:</label>
            <select
              id="order-group-select"
              [ngModel]="groupMode()"
              (ngModelChange)="groupMode.set($event)"
              class="px-2.5 py-1 bg-[#161b26] border border-[#272f3d] rounded text-slate-200 focus:outline-none focus:border-[#76b900]"
            >
              <option value="flat">Bảng tiêu chuẩn</option>
              <option value="status">Theo trạng thái</option>
              <option value="branch">Theo chi nhánh</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-[#272f3d] flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white">Danh sách đơn hàng</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#272f3d] text-slate-300">
              {{ orderService.orders().length }} đơn trên trang này
            </span>
          </div>

          <div class="text-xs text-slate-400">
            Trang {{ orderService.page() }} / {{ orderService.totalPages() }} (Tổng cộng {{ orderService.total() }} đơn)
          </div>
        </div>

        @if (orderService.isLoading()) {
          <div class="p-12 text-center text-slate-400 space-y-3">
            <div
              class="inline-block w-8 h-8 border-2 border-t-[#76b900] border-r-transparent border-b-[#76b900] border-l-transparent rounded-full animate-spin"
            ></div>
            <p class="text-xs">Đang tải danh sách đơn hàng...</p>
          </div>
        } @else if (orderService.error()) {
          <div class="p-8 text-center text-rose-400 space-y-2">
            <p class="font-bold">{{ orderService.error() }}</p>
            <button
              type="button"
              (click)="orderService.loadOrders()"
              class="px-3 py-1.5 bg-[#272f3d] hover:bg-slate-700 text-white rounded text-xs"
            >
              Thử lại
            </button>
          </div>
        } @else if (orderService.orders().length === 0) {
          <div class="p-12 text-center text-slate-400 space-y-3">
            <p class="text-sm font-semibold text-slate-300">Không tìm thấy đơn hàng nào</p>
            <p class="text-xs text-slate-500">
              Không có đơn hàng nào khớp với điều kiện lọc hiện tại. Hãy thử thay đổi từ khóa hoặc bộ lọc.
            </p>
            @if (hasActiveFilters()) {
              <button
                type="button"
                (click)="orderService.resetFilters()"
                class="px-3 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors inline-block"
              >
                Xóa tất cả bộ lọc
              </button>
            }
          </div>
        } @else {
          <div class="overflow-x-auto">
            @for (group of groupedOrders(); track group.key) {
              @if (groupMode() !== 'flat') {
                <div
                  class="px-4 py-2 bg-[#090d16] border-y border-[#272f3d] font-bold text-xs text-[#76b900] uppercase tracking-wide flex items-center justify-between"
                >
                  <span>{{ group.title }}</span>
                  <span class="font-mono text-slate-400 font-normal">({{ group.items.length }} đơn)</span>
                </div>
              }

              <table class="w-full text-left text-xs">
                <thead
                  class="bg-[#090d16]/70 border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider"
                >
                  <tr>
                    <th class="py-2.5 px-4">Mã đơn</th>
                    <th class="py-2.5 px-4">Thời gian</th>
                    <th class="py-2.5 px-4">Khách hàng</th>
                    <th class="py-2.5 px-4">Chi nhánh</th>
                    <th class="py-2.5 px-4">Hình thức</th>
                    <th class="py-2.5 px-4">Thanh toán</th>
                    <th class="py-2.5 px-4 text-right">Tổng tiền</th>
                    <th class="py-2.5 px-4 text-center">Trạng thái</th>
                    <th class="py-2.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#272f3d]">
                  @for (order of group.items; track order.id) {
                    <tr
                      class="hover:bg-[#1f2633] transition-colors cursor-pointer"
                      (click)="onRowClick(order.id)"
                    >
                      <td class="py-3 px-4 font-mono font-bold text-white">
                        <a
                          [routerLink]="['/admin/orders', order.id]"
                          (click)="$event.stopPropagation()"
                          class="hover:text-[#76b900] transition-colors"
                        >
                          {{ order.code }}
                        </a>
                        <div class="mt-0.5">
                          @if (order.hasAssembly) {
                            <span
                              class="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-1 py-0.2 rounded"
                            >
                              Lắp ráp PC
                            </span>
                          } @else {
                            <span
                              class="text-[10px] font-mono text-slate-400 bg-slate-800/40 border border-slate-700/40 px-1 py-0.2 rounded"
                            >
                              Linh kiện lẻ
                            </span>
                          }
                        </div>
                      </td>

                      <td class="py-3 px-4 text-slate-400 text-xs">
                        <div>{{ formatDateTime(order.submittedAt) }}</div>
                      </td>

                      <td class="py-3 px-4">
                        <div class="font-bold text-white">{{ order.receiverName }}</div>
                        <div class="text-[11px] text-slate-400 font-mono">{{ order.receiverPhone }}</div>
                      </td>

                      <td class="py-3 px-4 text-slate-300">
                        <div class="font-semibold text-xs">{{ order.branch.code }}</div>
                        <div class="text-[11px] text-slate-400 truncate max-w-[140px]">{{ order.branch.name }}</div>
                      </td>

                      <td class="py-3 px-4">
                        @if (order.fulfillmentMethod === 'DELIVERY') {
                          <span
                            class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/40"
                          >
                            Giao tận nơi
                          </span>
                        } @else {
                          <span
                            class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                          >
                            Nhận tại shop
                          </span>
                        }
                      </td>

                      <td class="py-3 px-4">
                        @if (order.paymentMethod === 'QR') {
                          @if (order.payment?.state === 'PAID') {
                            <span
                              class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                            >
                              QR đã thanh toán
                            </span>
                          } @else {
                            <span
                              class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/40"
                            >
                              QR chờ thanh toán
                            </span>
                          }
                        } @else {
                          <span
                            class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800/60 text-slate-300 border border-slate-700/40"
                          >
                            Thu tiền COD
                          </span>
                        }
                      </td>

                      <td class="py-3 px-4 text-right font-black tabular-nums text-white">
                        {{ formatCurrency(order.grandTotal) }}
                      </td>

                      <td class="py-3 px-4 text-center">
                        <span
                          class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-block whitespace-nowrap"
                          [class]="getStatusBadgeClass(order.status)"
                        >
                          {{ getStatusLabel(order.status) }}
                        </span>
                      </td>

                      <td class="py-3 px-4 text-right">
                        <a
                          [routerLink]="['/admin/orders', order.id]"
                          (click)="$event.stopPropagation()"
                          class="p-1.5 bg-[#272f3d] hover:bg-[#76b900] text-slate-300 hover:text-[#090d16] rounded transition-colors inline-flex items-center justify-center"
                          title="Xem chi tiết đơn hàng"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <div
            class="px-4 py-3 bg-[#090d16] border-t border-[#272f3d] flex items-center justify-between flex-wrap gap-3 text-xs"
          >
            <div class="text-slate-400">
              Hiển thị {{ (orderService.page() - 1) * orderService.limit() + 1 }} -
              {{ Math.min(orderService.page() * orderService.limit(), orderService.total()) }}
              trong tổng số {{ orderService.total() }} đơn
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                [disabled]="orderService.page() <= 1"
                (click)="orderService.setPage(orderService.page() - 1)"
                class="px-3 py-1.5 bg-[#161b26] border border-[#272f3d] hover:bg-[#272f3d] disabled:opacity-40 disabled:cursor-not-allowed rounded text-slate-200 transition-colors font-medium"
              >
                Trước
              </button>
              <span class="px-2 font-mono text-slate-400">
                {{ orderService.page() }} / {{ orderService.totalPages() }}
              </span>
              <button
                type="button"
                [disabled]="orderService.page() >= orderService.totalPages()"
                (click)="orderService.setPage(orderService.page() + 1)"
                class="px-3 py-1.5 bg-[#161b26] border border-[#272f3d] hover:bg-[#272f3d] disabled:opacity-40 disabled:cursor-not-allowed rounded text-slate-200 transition-colors font-medium"
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
export class AdminOrdersPageComponent implements OnInit {
  readonly orderService = inject(AdminOrderService);
  private readonly branchService = inject(AdminBranchService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly branchList = signal<AdminBranch[]>([]);
  readonly groupMode = signal<'flat' | 'status' | 'branch'>('flat');

  readonly Math = Math;

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly pipelineTabs: readonly PipelineTab[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán QR', isUrgent: true },
    { key: 'PENDING_COD_CONFIRMATION', label: 'Chờ xác nhận COD', isUrgent: true },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'PREPARING_COMPONENTS', label: 'Đang soạn linh kiện' },
    { key: 'ASSEMBLING', label: 'Đang lắp ráp' },
    { key: 'READY_FOR_PICKUP', label: 'Sẵn sàng nhận tại shop' },
    { key: 'SHIPPING', label: 'Đang giao hàng' },
    { key: 'DELIVERY_FAILED', label: 'Giao thất bại', isUrgent: true },
    { key: 'RETURNING', label: 'Đang chuyển hoàn' },
    { key: 'RETURNED_TO_BRANCH', label: 'Đã hoàn kho' },
    { key: 'COMPLETED', label: 'Hoàn tất' },
    { key: 'ON_HOLD', label: 'Treo ngoại lệ ON_HOLD', isUrgent: true },
    { key: 'CANCELLED', label: 'Đã hủy' },
  ];

  readonly groupedOrders = computed<OrderGroup[]>(() => {
    const list = this.orderService.orders();
    const mode = this.groupMode();

    if (mode === 'flat') {
      return [{ key: 'all', title: 'Tất cả đơn hàng', items: list }];
    }

    if (mode === 'status') {
      const map = new Map<string, AdminOrderListItem[]>();
      for (const order of list) {
        const key = order.status;
        const current = map.get(key) ?? [];
        current.push(order);
        map.set(key, current);
      }
      return Array.from(map.entries()).map(([status, items]) => ({
        key: status,
        title: this.getStatusLabel(status as AdminOrderStatus),
        items,
      }));
    }

    if (mode === 'branch') {
      const map = new Map<string, AdminOrderListItem[]>();
      for (const order of list) {
        const key = order.branch.name;
        const current = map.get(key) ?? [];
        current.push(order);
        map.set(key, current);
      }
      return Array.from(map.entries()).map(([branchName, items]) => ({
        key: branchName,
        title: branchName,
        items,
      }));
    }

    return [{ key: 'all', title: 'Tất cả đơn hàng', items: list }];
  });

  async ngOnInit(): Promise<void> {
    const queryTab = this.route.snapshot.queryParams['tab'] || this.route.snapshot.queryParams['status'];
    const branchIdParam = this.route.snapshot.queryParams['branchId'];
    if (queryTab) {
      this.orderService.selectedTab.set(queryTab);
    }
    if (branchIdParam) {
      const branchId = Number(branchIdParam);
      if (!Number.isNaN(branchId) && branchId > 0) {
        this.orderService.selectedBranchId.set(branchId);
      }
    }

    await Promise.all([
      this.orderService.loadOrders(),
      this.loadBranches(),
    ]);
  }

  private async loadBranches(): Promise<void> {
    try {
      await this.branchService.loadBranches({ limit: 100 });
      this.branchList.set(this.branchService.branches());
    } catch {
      this.branchList.set([]);
    }
  }

  onTabClick(tabKey: string): void {
    this.orderService.setTab(tabKey);
  }

  getTabCount(tabKey: string): number {
    const counts = this.orderService.statusCounts();
    return counts[tabKey] ?? 0;
  }

  onSearchInput(value: string): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.orderService.setSearch(value);
    }, 250);
  }

  onBranchChange(branchId: number | null): void {
    this.orderService.setBranchFilter(branchId);
  }

  onFulfillmentChange(fulfillment: string): void {
    this.orderService.setFulfillmentFilter(fulfillment);
  }

  onPaymentChange(payment: string): void {
    this.orderService.setPaymentFilter(payment);
  }

  onAssemblyChange(assembly: string): void {
    this.orderService.setAssemblyFilter(assembly);
  }

  onDateFromChange(date: string): void {
    this.orderService.setDateRange(date, this.orderService.dateTo());
  }

  onDateToChange(date: string): void {
    this.orderService.setDateRange(this.orderService.dateFrom(), date);
  }

  hasActiveFilters(): boolean {
    return Boolean(
      this.orderService.searchQuery() ||
        this.orderService.selectedTab() !== 'ALL' ||
        this.orderService.selectedBranchId() !== null ||
        this.orderService.selectedFulfillment() ||
        this.orderService.selectedPayment() ||
        this.orderService.selectedAssembly() ||
        this.orderService.dateFrom() ||
        this.orderService.dateTo(),
    );
  }

  onRowClick(orderId: string): void {
    void this.router.navigate(['/admin/orders', orderId]);
  }

  formatDateTime(isoString: string): string {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(value: string | number): string {
    const num = Number(value) || 0;
    return `${num.toLocaleString('vi-VN')} ₫`;
  }

  getStatusBadgeClass(status: AdminOrderStatus): string {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'PENDING_COD_CONFIRMATION':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'CONFIRMED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'PREPARING_COMPONENTS':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'ASSEMBLING':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'READY_FOR_PICKUP':
        return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      case 'SHIPPING':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'DELIVERY_FAILED':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'RETURNING':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'RETURNED_TO_BRANCH':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      case 'COMPLETED':
        return 'bg-[#76b900]/10 text-[#76b900] border border-[#76b900]/30 font-bold';
      case 'ON_HOLD':
        return 'bg-red-500/10 text-red-400 border border-red-500/20 font-bold';
      case 'CANCELLED':
        return 'bg-slate-700/30 text-slate-400 border border-slate-600/30';
      default:
        return 'bg-slate-700/30 text-slate-300';
    }
  }

  getStatusLabel(status: AdminOrderStatus): string {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Chờ thanh toán QR';
      case 'PENDING_COD_CONFIRMATION':
        return 'Chờ xác nhận COD';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PREPARING_COMPONENTS':
        return 'Đang soạn linh kiện';
      case 'ASSEMBLING':
        return 'Đang lắp ráp';
      case 'READY_FOR_PICKUP':
        return 'Sẵn sàng nhận tại shop';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'DELIVERY_FAILED':
        return 'Giao thất bại';
      case 'RETURNING':
        return 'Đang chuyển hoàn';
      case 'RETURNED_TO_BRANCH':
        return 'Đã hoàn về kho';
      case 'COMPLETED':
        return 'Hoàn tất';
      case 'ON_HOLD':
        return 'Treo ngoại lệ ON_HOLD';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }
}
