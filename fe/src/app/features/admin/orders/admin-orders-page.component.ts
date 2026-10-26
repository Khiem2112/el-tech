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
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
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
  imports: [CommonModule, FormsModule, RouterModule, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-foreground">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line"
      >
        <div class="flex items-center gap-3">
          <div>
            <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
              Quản Lý Đơn Hàng
            </h1>
            <p class="text-xs text-muted mt-0.5">
              Theo dõi và phân đoạn trạng thái toàn bộ chuỗi cung ứng đơn hàng phần cứng
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs text-muted">
          <span>
            Tổng số đơn toàn hệ thống:
            <strong class="text-foreground font-mono font-bold">{{ orderService.total() }}</strong>
          </span>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-card overflow-hidden">
        <div
          class="flex items-center overflow-x-auto border-b border-line px-3 py-2 text-xs gap-1.5 scrollbar-thin"
        >
          @for (tab of pipelineTabs; track tab.key) {
            <button
              type="button"
              (click)="onTabClick(tab.key)"
              class="px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 text-xs font-semibold"
              [class.bg-primary]="orderService.selectedTab() === tab.key"
              [class.text-primary-foreground]="orderService.selectedTab() === tab.key"
              [class.font-bold]="orderService.selectedTab() === tab.key"
              [class.text-muted]="orderService.selectedTab() !== tab.key"
              [class.hover:text-foreground]="orderService.selectedTab() !== tab.key"
              [class.hover:bg-surface-alt]="orderService.selectedTab() !== tab.key"
            >
              <span>{{ tab.label }}</span>
              @if (getTabCount(tab.key) > 0) {
                <span
                  class="px-1.5 py-0.5 rounded-full font-mono text-xs font-semibold"
                  [class.bg-black/20]="orderService.selectedTab() === tab.key"
                  [class.text-primary-foreground]="orderService.selectedTab() === tab.key"
                  [class.bg-amber-500/20]="orderService.selectedTab() !== tab.key && tab.isUrgent"
                  [class.text-amber-700]="orderService.selectedTab() !== tab.key && tab.isUrgent"
                  [class.dark:text-amber-400]="orderService.selectedTab() !== tab.key && tab.isUrgent"
                  [class.bg-surface-alt]="orderService.selectedTab() !== tab.key && !tab.isUrgent"
                  [class.text-foreground]="orderService.selectedTab() !== tab.key && !tab.isUrgent"
                >
                  {{ getTabCount(tab.key) }}
                </span>
              }
            </button>
          }
        </div>

        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-surface-alt/40">
          <div class="lg:col-span-2">
            <label for="order-search-input" class="block font-semibold text-muted text-xs uppercase mb-1">
              Tìm kiếm
            </label>
            <div class="relative">
              <input
                id="order-search-input"
                type="text"
                [ngModel]="orderService.searchQuery()"
                (ngModelChange)="onSearchInput($event)"
                placeholder="Mã đơn ORD-, SĐT, email, tên..."
                class="w-full h-9 pl-8 pr-3 bg-surface border border-line rounded text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs font-sans"
              />
              <svg
                class="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none"
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
            <span class="block font-semibold text-muted text-xs uppercase mb-1">
              Chi nhánh
            </span>
            <app-select
              [options]="branchOptions()"
              [value]="orderService.selectedBranchId() !== null ? orderService.selectedBranchId()!.toString() : ''"
              (valueChange)="onBranchChange($event ? Number($event) : null)"
              size="sm"
            />
          </div>

          <div>
            <span class="block font-semibold text-muted text-xs uppercase mb-1">
              Hình thức
            </span>
            <app-select
              [options]="fulfillmentOptions"
              [value]="orderService.selectedFulfillment()"
              (valueChange)="onFulfillmentChange($event)"
              size="sm"
            />
          </div>

          <div>
            <span class="block font-semibold text-muted text-xs uppercase mb-1">
              Thanh toán
            </span>
            <app-select
              [options]="paymentOptions"
              [value]="orderService.selectedPayment()"
              (valueChange)="onPaymentChange($event)"
              size="sm"
            />
          </div>

          <div>
            <span class="block font-semibold text-muted text-xs uppercase mb-1">
              Lắp ráp PC
            </span>
            <app-select
              [options]="assemblyOptions"
              [value]="orderService.selectedAssembly()"
              (valueChange)="onAssemblyChange($event)"
              size="sm"
            />
          </div>
        </div>

        <div
          class="px-4 py-2 bg-surface-alt border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span class="text-muted">Từ ngày:</span>
              <input
                type="date"
                [ngModel]="orderService.dateFrom()"
                (ngModelChange)="onDateFromChange($event)"
                class="px-2 py-1 bg-surface border border-line rounded text-foreground focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-muted">Đến ngày:</span>
              <input
                type="date"
                [ngModel]="orderService.dateTo()"
                (ngModelChange)="onDateToChange($event)"
                class="px-2 py-1 bg-surface border border-line rounded text-foreground focus:outline-none focus:border-primary text-xs"
              />
            </div>
            @if (hasActiveFilters()) {
              <button
                type="button"
                (click)="orderService.resetFilters()"
                class="px-2.5 py-1 bg-surface hover:bg-surface-alt border border-line text-foreground rounded font-medium transition-colors"
              >
                Xóa bộ lọc
              </button>
            }
          </div>

          <div class="flex items-center gap-2">
            <span class="text-muted font-medium whitespace-nowrap">Gom nhóm:</span>
            <div class="w-40">
              <app-select
                [options]="groupModeOptions"
                [value]="groupMode()"
                (valueChange)="onGroupModeChange($event)"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-card overflow-hidden">
        <div class="px-4 py-3 border-b border-line flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-foreground">Danh sách đơn hàng</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-alt text-muted">
              {{ orderService.orders().length }} đơn trên trang này
            </span>
          </div>

          <div class="text-xs text-muted">
            Trang {{ orderService.page() }} / {{ orderService.totalPages() }} (Tổng cộng {{ orderService.total() }} đơn)
          </div>
        </div>

        @if (orderService.isLoading()) {
          <div class="p-12 text-center text-muted space-y-3">
            <div
              class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"
            ></div>
            <p class="text-xs">Đang tải danh sách đơn hàng...</p>
          </div>
        } @else if (orderService.error()) {
          <div class="p-8 text-center text-rose-600 dark:text-rose-400 space-y-2">
            <p class="font-bold">{{ orderService.error() }}</p>
            <button
              type="button"
              (click)="orderService.loadOrders()"
              class="px-3 py-1.5 bg-surface-alt hover:bg-surface border border-line text-foreground rounded text-xs"
            >
              Thử lại
            </button>
          </div>
        } @else if (orderService.orders().length === 0) {
          <div class="p-12 text-center text-muted space-y-3">
            <p class="text-sm font-semibold text-foreground">Không tìm thấy đơn hàng nào</p>
            <p class="text-xs text-muted">
              Không có đơn hàng nào khớp với điều kiện lọc hiện tại. Hãy thử thay đổi từ khóa hoặc bộ lọc.
            </p>
            @if (hasActiveFilters()) {
              <button
                type="button"
                (click)="orderService.resetFilters()"
                class="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded transition-colors inline-block"
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
                  class="px-4 py-2 bg-surface-alt border-y border-line font-bold text-xs text-primary uppercase tracking-wide flex items-center justify-between"
                >
                  <span>{{ group.title }}</span>
                  <span class="font-mono text-muted font-normal">({{ group.items.length }} đơn)</span>
                </div>
              }

              <table class="w-full text-left text-xs">
                <thead
                  class="bg-surface-alt/70 border-b border-line text-muted font-semibold uppercase tracking-wider"
                >
                  <tr>
                    <th class="py-2.5 px-4 whitespace-nowrap">Mã đơn</th>
                    <th class="py-2.5 px-4 whitespace-nowrap">Thời gian</th>
                    <th class="py-2.5 px-4 whitespace-nowrap">Khách hàng</th>
                    <th class="py-2.5 px-4 whitespace-nowrap">Chi nhánh</th>
                    <th class="py-2.5 px-4 whitespace-nowrap">Hình thức</th>
                    <th class="py-2.5 px-4 whitespace-nowrap">Thanh toán</th>
                    <th class="py-2.5 px-4 text-right whitespace-nowrap">Tổng tiền</th>
                    <th class="py-2.5 px-4 text-center whitespace-nowrap">Trạng thái</th>
                    <th class="py-2.5 px-4 text-right whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line">
                  @for (order of group.items; track order.id) {
                    <tr
                      class="hover:bg-surface-alt/60 transition-colors cursor-pointer"
                      (click)="onRowClick(order.id)"
                    >
                      <td class="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                        <a
                          [routerLink]="['/admin/orders', order.id]"
                          (click)="$event.stopPropagation()"
                          class="hover:text-primary transition-colors"
                        >
                          {{ order.code }}
                        </a>
                        <div class="mt-0.5">
                          @if (order.hasAssembly) {
                            <span
                              class="text-xs font-mono text-primary bg-surface-elevated border border-line px-1.5 py-0.5 rounded whitespace-nowrap inline-block"
                            >
                              Lắp ráp PC
                            </span>
                          } @else {
                            <span
                              class="text-xs font-mono text-muted bg-surface-alt border border-line px-1.5 py-0.5 rounded whitespace-nowrap inline-block"
                            >
                              Linh kiện lẻ
                            </span>
                          }
                        </div>
                      </td>

                      <td class="py-3 px-4 text-muted text-xs whitespace-nowrap">
                        <div>{{ formatDateTime(order.submittedAt) }}</div>
                      </td>

                      <td class="py-3 px-4 whitespace-nowrap">
                        <div class="font-bold text-foreground">{{ order.receiverName }}</div>
                        <div class="text-xs text-muted font-mono">{{ order.receiverPhone }}</div>
                      </td>

                      <td class="py-3 px-4 text-foreground whitespace-nowrap">
                        <div class="font-semibold text-xs">{{ order.branch.code }}</div>
                        <div class="text-xs text-muted truncate max-w-[140px]">{{ order.branch.name }}</div>
                      </td>

                      <td class="py-3 px-4 whitespace-nowrap">
                        @if (order.fulfillmentMethod === 'DELIVERY') {
                          <span
                            class="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 whitespace-nowrap"
                          >
                            Giao tận nơi
                          </span>
                        } @else {
                          <span
                            class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 whitespace-nowrap"
                          >
                            Nhận tại shop
                          </span>
                        }
                      </td>

                      <td class="py-3 px-4 whitespace-nowrap">
                        @if (order.paymentMethod === 'QR') {
                          @if (order.payment?.state === 'PAID') {
                            <span
                              class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 whitespace-nowrap"
                            >
                              QR đã thanh toán
                            </span>
                          } @else {
                            <span
                              class="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 whitespace-nowrap"
                            >
                              QR chờ thanh toán
                            </span>
                          }
                        } @else {
                          <span
                            class="px-2 py-0.5 rounded text-xs font-semibold bg-surface-alt text-foreground border border-line whitespace-nowrap"
                          >
                            Thu tiền COD
                          </span>
                        }
                      </td>

                      <td class="py-3 px-4 text-right font-bold tabular-nums text-foreground whitespace-nowrap">
                        {{ formatCurrency(order.grandTotal) }}
                      </td>

                      <td class="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          class="px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block whitespace-nowrap"
                          [class]="getStatusBadgeClass(order.status)"
                        >
                          {{ getStatusLabel(order.status) }}
                        </span>
                      </td>

                      <td class="py-3 px-4 text-right whitespace-nowrap">
                        <a
                          [routerLink]="['/admin/orders', order.id]"
                          (click)="$event.stopPropagation()"
                          class="p-1.5 bg-surface-alt hover:bg-primary text-foreground hover:text-primary-foreground border border-line rounded transition-colors inline-flex items-center justify-center"
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
            class="px-4 py-3 bg-surface-alt border-t border-line flex items-center justify-between flex-wrap gap-3 text-xs"
          >
            <div class="text-muted">
              Hiển thị {{ (orderService.page() - 1) * orderService.limit() + 1 }} -
              {{ Math.min(orderService.page() * orderService.limit(), orderService.total()) }}
              trong tổng số {{ orderService.total() }} đơn
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                [disabled]="orderService.page() <= 1"
                (click)="orderService.setPage(orderService.page() - 1)"
                class="px-3 py-1.5 bg-surface border border-line hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed rounded text-foreground transition-colors font-medium"
              >
                Trước
              </button>
              <span class="px-2 font-mono text-muted">
                {{ orderService.page() }} / {{ orderService.totalPages() }}
              </span>
              <button
                type="button"
                [disabled]="orderService.page() >= orderService.totalPages()"
                (click)="orderService.setPage(orderService.page() + 1)"
                class="px-3 py-1.5 bg-surface border border-line hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed rounded text-foreground transition-colors font-medium"
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
  readonly Number = Number;

  readonly branchOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả chi nhánh' },
    ...this.branchList().map((b) => ({
      value: b.id.toString(),
      label: `${b.code}: ${b.name}`,
    })),
  ]);

  readonly fulfillmentOptions: readonly SelectOption[] = [
    { value: '', label: 'Tất cả hình thức' },
    { value: 'DELIVERY', label: 'Giao hàng tận nơi' },
    { value: 'PICKUP', label: 'Nhận tại cửa hàng' },
  ];

  readonly paymentOptions: readonly SelectOption[] = [
    { value: '', label: 'Tất cả thanh toán' },
    { value: 'QR', label: 'Chuyển khoản QR' },
    { value: 'COD', label: 'Thu tiền COD' },
  ];

  readonly assemblyOptions: readonly SelectOption[] = [
    { value: '', label: 'Tất cả' },
    { value: 'assembly', label: 'Có lắp ráp PC' },
    { value: 'retail', label: 'Chỉ mua lẻ' },
  ];

  readonly groupModeOptions: readonly SelectOption[] = [
    { value: 'flat', label: 'Bảng tiêu chuẩn' },
    { value: 'status', label: 'Theo trạng thái' },
    { value: 'branch', label: 'Theo chi nhánh' },
  ];

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
    const searchParam = this.route.snapshot.queryParams['search'];
    if (queryTab) {
      this.orderService.selectedTab.set(queryTab);
    }
    if (branchIdParam) {
      const branchId = Number(branchIdParam);
      if (!Number.isNaN(branchId) && branchId > 0) {
        this.orderService.selectedBranchId.set(branchId);
      }
    }
    if (searchParam) {
      this.orderService.searchQuery.set(searchParam);
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

  onGroupModeChange(mode: string): void {
    this.groupMode.set(mode as 'flat' | 'status' | 'branch');
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
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30';
      case 'PENDING_COD_CONFIRMATION':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/30';
      case 'CONFIRMED':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30';
      case 'PREPARING_COMPONENTS':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30';
      case 'ASSEMBLING':
        return 'bg-surface-elevated text-primary border border-line';
      case 'READY_FOR_PICKUP':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/30';
      case 'SHIPPING':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30';
      case 'DELIVERY_FAILED':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30';
      case 'RETURNING':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30';
      case 'RETURNED_TO_BRANCH':
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/30';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 font-bold';
      case 'ON_HOLD':
        return 'bg-warning/10 text-warning border border-warning/30 font-bold';
      case 'CANCELLED':
        return 'bg-surface-alt text-muted border border-line';
      default:
        return 'bg-surface-alt text-foreground border border-line';
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
