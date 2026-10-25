import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
              SCR-02
            </span>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Trung Tâm Vận Hành
            </h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Giám sát trạng thái vận hành tức thời và các hàng đợi tác vụ khẩn cấp trong ngày
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2 text-xs">
            <label for="branch-selector" class="text-slate-400 font-medium">Chi nhánh:</label>
            <select
              id="branch-selector"
              [value]="selectedBranchValue()"
              (change)="onBranchChange($event)"
              class="px-3 py-1.5 bg-[#161b26] border border-[#272f3d] rounded font-semibold text-xs text-white focus:outline-none focus:border-[#76b900]"
            >
              <option value="ALL">Toàn hệ thống</option>
              @for (branch of dashboardService.branches(); track branch.id) {
                <option [value]="branch.id">
                  {{ branch.code }}: {{ branch.name }}
                </option>
              }
            </select>
          </div>

          <button
            type="button"
            (click)="onRefresh()"
            [disabled]="dashboardService.isLoading()"
            class="px-3 py-1.5 text-xs bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white font-medium rounded transition-colors disabled:opacity-50"
          >
            Làm mới
          </button>
        </div>
      </div>

      @if (dashboardService.error()) {
        <div class="p-4 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center justify-between">
          <span>{{ dashboardService.error() }}</span>
          <button
            type="button"
            (click)="onRefresh()"
            class="px-2 py-1 bg-rose-900/60 hover:bg-rose-800 text-white rounded font-semibold"
          >
            Thử lại
          </button>
        </div>
      }

      @if (dashboardService.isLoading() && !dashboardService.summary()) {
        <div class="p-16 text-center text-slate-400 space-y-3">
          <div class="inline-block w-8 h-8 border-2 border-t-[#76b900] border-r-transparent border-b-[#76b900] border-l-transparent rounded-full animate-spin"></div>
          <p class="text-xs">Đang tải dữ liệu trung tâm vận hành...</p>
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

        <div class="p-4 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Lối Tắt Thao Tác Nhanh
          </h2>
          <div class="flex flex-wrap gap-2 text-xs">
            <a
              routerLink="/admin/orders"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded text-slate-200 transition-colors"
            >
              Quản Lý Đơn Hàng
            </a>
            <a
              routerLink="/admin/inventory/balances"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded text-slate-200 transition-colors"
            >
              Tra Cứu Tồn Kho
            </a>
            <a
              routerLink="/admin/inventory/transfers"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded text-slate-200 transition-colors"
            >
              Lập Lệnh Điều Chuyển
            </a>
            <a
              routerLink="/admin/procurement/purchase-orders"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded text-slate-200 transition-colors"
            >
              Đơn Mua Hàng PO
            </a>
            <a
              routerLink="/admin/catalog/templates"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded text-slate-200 transition-colors"
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

  onBranchChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    const branchId = value === 'ALL' ? null : Number(value);
    void this.dashboardService.setSelectedBranch(branchId);
  }

  onRefresh(): void {
    void this.dashboardService.refresh();
  }
}
