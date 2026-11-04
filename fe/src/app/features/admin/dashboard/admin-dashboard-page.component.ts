import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LowStockAlertCardComponent } from './components/low-stock-alert-card.component';
import { OrderStatusDistributionComponent } from './components/order-status-distribution.component';
import { SmartBiAnalyticsCardsComponent } from './components/smart-bi-analytics-cards.component';
import { UrgentQueuesGridComponent } from './components/urgent-queues-grid.component';
import { AdminDashboardService } from './services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UrgentQueuesGridComponent,
    SmartBiAnalyticsCardsComponent,
    OrderStatusDistributionComponent,
    LowStockAlertCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full min-h-full p-4 lg:p-6 space-y-6 text-sm text-foreground bg-canvas">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Trung Tâm Vận Hành
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Tổng quan hiệu suất vận hành, xử lý đơn hàng và giám sát tồn kho tại STORE-MAIN
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <a
            routerLink="/admin/procurement/purchase-orders/new"
            class="px-3.5 py-1.5 bg-primary hover:bg-primary-strong text-primary-foreground rounded font-semibold text-xs transition-colors shadow-xs"
          >
            Tạo đơn mua hàng
          </a>
          <button
            type="button"
            (click)="onRefresh()"
            [disabled]="dashboardService.isLoading()"
            class="px-3.5 py-1.5 text-xs bg-surface hover:bg-surface-alt border border-line text-foreground font-medium rounded transition-colors shadow-xs disabled:opacity-50"
          >
            Làm mới
          </button>
        </div>
      </div>

      @if (dashboardService.error()) {
        <div class="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
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
          <p class="text-xs">Đang tải dữ liệu trung tâm vận hành...</p>
        </div>
      } @else {

        <app-urgent-queues-grid
          [urgentQueues]="dashboardService.urgentQueues()"
          [selectedBranchId]="dashboardService.selectedBranchId()"
        />

        <app-smart-bi-analytics-cards />

        <app-order-status-distribution
          [distribution]="dashboardService.orderDistribution()"
          [selectedBranchId]="dashboardService.selectedBranchId()"
        />

        <div class="grid grid-cols-1 gap-6">
          <app-low-stock-alert-card
            [alerts]="dashboardService.lowStockAlerts()"
            [selectedBranchId]="dashboardService.selectedBranchId()"
          />
        </div>
      }
    </div>
  `,
})
export class AdminDashboardPageComponent implements OnInit {
  readonly dashboardService = inject(AdminDashboardService);

  async ngOnInit(): Promise<void> {
    await this.dashboardService.loadDashboard();
  }

  onRefresh(): void {
    void this.dashboardService.refresh();
  }
}
