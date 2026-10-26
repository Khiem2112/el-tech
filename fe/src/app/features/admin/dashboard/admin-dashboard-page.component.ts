import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { LowStockAlertCardComponent } from './components/low-stock-alert-card.component';
import { OrderStatusDistributionComponent } from './components/order-status-distribution.component';
import { UrgentQueuesGridComponent } from './components/urgent-queues-grid.component';
import { AdminDashboardService } from './services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UrgentQueuesGridComponent,
    OrderStatusDistributionComponent,
    LowStockAlertCardComponent,
    SelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full min-h-full p-4 lg:p-6 space-y-6 text-sm text-foreground bg-white">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary-strong font-mono text-xs font-bold">
              SCR-02
            </span>
            <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
              Trung Tâm Vận Hành
            </h1>
          </div>
          <p class="text-[13px] text-muted mt-1">
            Giám sát trạng thái vận hành tức thời và các hàng đợi tác vụ khẩn cấp trong ngày
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2 text-[13px]">
            <span class="text-muted font-medium whitespace-nowrap">Chi nhánh:</span>
            <app-select
              [options]="branchOptions()"
              [value]="selectedBranchValue()"
              (valueChange)="onBranchSelect($event)"
              size="sm"
              class="w-60"
              ariaLabel="Lọc theo chi nhánh"
            />
          </div>

          <button
            type="button"
            (click)="onRefresh()"
            [disabled]="dashboardService.isLoading()"
            class="px-3.5 py-1.5 text-[13px] bg-white hover:bg-surface-alt border border-line text-foreground font-medium rounded transition-colors shadow-xs disabled:opacity-50"
          >
            Làm mới
          </button>
        </div>
      </div>

      @if (dashboardService.error()) {
        <div class="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-center justify-between">
          <span>{{ dashboardService.error() }}</span>
          <button
            type="button"
            (click)="onRefresh()"
            class="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold text-xs"
          >
            Thử lại
          </button>
        </div>
      }

      @if (dashboardService.isLoading() && !dashboardService.summary()) {
        <div class="p-16 text-center text-muted space-y-3">
          <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
          <p class="text-[13px]">Đang tải dữ liệu trung tâm vận hành...</p>
        </div>
      } @else {
        <app-urgent-queues-grid
          [urgentQueues]="dashboardService.urgentQueues()"
          [selectedBranchId]="dashboardService.selectedBranchId()"
        />

        <app-order-status-distribution
          [distribution]="dashboardService.orderDistribution()"
          [selectedBranchId]="dashboardService.selectedBranchId()"
        />

        <app-low-stock-alert-card
          [alerts]="dashboardService.lowStockAlerts()"
          [selectedBranchId]="dashboardService.selectedBranchId()"
        />

        <div class="p-5 bg-white border border-line rounded-lg shadow-xs">
          <h2 class="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Lối Tắt Thao Tác Nhanh
          </h2>
          <div class="flex flex-wrap gap-2 text-[13px]">
            <a
              routerLink="/admin/orders"
              class="px-3.5 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-medium text-foreground transition-colors shadow-xs hover:border-primary/50"
            >
              Quản Lý Đơn Hàng
            </a>
            <a
              routerLink="/admin/inventory/balances"
              class="px-3.5 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-medium text-foreground transition-colors shadow-xs hover:border-primary/50"
            >
              Tra Cứu Tồn Kho
            </a>
            <a
              routerLink="/admin/inventory/transfers"
              class="px-3.5 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-medium text-foreground transition-colors shadow-xs hover:border-primary/50"
            >
              Lập Lệnh Điều Chuyển
            </a>
            <a
              routerLink="/admin/procurement/purchase-orders"
              class="px-3.5 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-medium text-foreground transition-colors shadow-xs hover:border-primary/50"
            >
              Đơn Mua Hàng PO
            </a>
            <a
              routerLink="/admin/catalog/templates"
              class="px-3.5 py-2 bg-surface hover:bg-surface-alt border border-line rounded font-medium text-foreground transition-colors shadow-xs hover:border-primary/50"
            >
              Danh Mục Mẫu Sản Phẩm
            </a>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminDashboardPageComponent implements OnInit {
  readonly dashboardService = inject(AdminDashboardService);

  readonly branchOptions = computed<SelectOption[]>(() => [
    { value: 'ALL', label: 'Toàn hệ thống' },
    ...this.dashboardService.branches().map((branch) => ({
      value: branch.id.toString(),
      label: `${branch.code}: ${branch.name}`,
    })),
  ]);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.dashboardService.loadBranches(),
      this.dashboardService.loadDashboard(),
    ]);
  }

  selectedBranchValue(): string {
    const id = this.dashboardService.selectedBranchId();
    return id !== null ? id.toString() : 'ALL';
  }

  onBranchSelect(value: string): void {
    const branchId = value === 'ALL' ? null : Number(value);
    void this.dashboardService.setSelectedBranch(branchId);
  }

  onRefresh(): void {
    void this.dashboardService.refresh();
  }
}
