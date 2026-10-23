import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

type StatCard = {
  readonly title: string;
  readonly value: string;
  readonly subtitle: string;
};

type UrgentQueueItem = {
  readonly title: string;
  readonly count: number;
  readonly unit: string;
  readonly description: string;
  readonly link: string;
  readonly badgeColor: string;
};

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
              SCR-02
            </span>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">Trung Tâm Vận Hành</h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">Giám sát trạng thái vận hành tức thời và các hàng đợi khẩn cấp</p>
        </div>

        <div class="flex items-center gap-2">
          <label for="branch-select" class="text-xs text-slate-400 font-medium">Chi nhánh:</label>
          <select
            id="branch-select"
            [value]="selectedBranch()"
            (change)="onBranchChange($event)"
            class="px-3 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
          >
            <option value="ALL">Toàn hệ thống (3 chi nhánh)</option>
            <option value="HN-01">HN-01: Cầu Giấy (Hà Nội)</option>
            <option value="DN-01">DN-01: Hải Châu (Đà Nẵng)</option>
            <option value="HCM-01">HCM-01: Quận 10 (TP.HCM)</option>
          </select>
        </div>
      </div>

      <div>
        <div class="flex items-center gap-2 mb-3">
          <span class="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-200">
            Hàng Đợi Khẩn Cấp Cần Xử Lý Trong Ngày
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (item of urgentQueues(); track item.title) {
            <a
              [routerLink]="item.link"
              class="block p-4 bg-[#161b26] border border-[#272f3d] hover:border-[#76b900]/60 rounded-lg transition-all shadow-sm group"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-medium">{{ item.title }}</span>
                <span
                  class="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
                  [ngClass]="item.badgeColor"
                >
                  {{ item.count }} {{ item.unit }}
                </span>
              </div>
              <div class="text-2xl font-black text-white mt-2 group-hover:text-[#76b900] transition-colors tabular-nums">
                {{ item.count }}
              </div>
              <div class="text-[11px] text-slate-400 mt-1">
                {{ item.description }}
              </div>
            </a>
          }
        </div>
      </div>

      <div>
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Chỉ Số Vận Hành Hôm Nay
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (card of stats(); track card.title) {
            <div class="p-4 bg-[#161b26] border border-[#272f3d] rounded-lg">
              <div class="text-xs text-slate-400 font-medium">{{ card.title }}</div>
              <div class="text-xl font-bold text-white mt-1 tabular-nums">{{ card.value }}</div>
              <div class="text-[11px] text-[#76b900] mt-1">{{ card.subtitle }}</div>
            </div>
          }
        </div>
      </div>

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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPageComponent {
  readonly selectedBranch = signal<string>('ALL');

  readonly urgentQueues = signal<readonly UrgentQueueItem[]>([
    {
      title: 'Đơn Chờ Xác Nhận COD',
      count: 2,
      unit: 'đơn',
      description: 'Cần liên hệ khách xác nhận trước khi điều phối kho',
      link: '/admin/orders',
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800',
    },
    {
      title: 'Đơn PC Cần Lắp Ráp',
      count: 1,
      unit: 'bộ',
      description: 'Linh kiện đã đủ, chờ kỹ thuật viên lắp ráp',
      link: '/admin/orders',
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-800',
    },
    {
      title: 'Điều Chuyển Chờ Xuất',
      count: 3,
      unit: 'phiếu',
      description: 'Chi nhánh nguồn cần đóng gói xuất hàng chuyển đi',
      link: '/admin/inventory/transfers',
      badgeColor: 'bg-indigo-950 text-indigo-300 border border-indigo-800',
    },
    {
      title: 'Cảnh Báo Chạm Ngưỡng Tồn',
      count: 5,
      unit: 'SKU',
      description: 'Tồn kho khả dụng dưới định mức tối thiểu',
      link: '/admin/inventory/balances',
      badgeColor: 'bg-rose-950 text-rose-300 border border-rose-800',
    },
  ]);

  readonly stats = signal<readonly StatCard[]>([
    {
      title: 'Doanh Thu Tạm Tính (Hôm Nay)',
      value: '148.500.000 đ',
      subtitle: '+12% so với cùng kỳ',
    },
    {
      title: 'Đơn Hàng Mới',
      value: '6 đơn',
      subtitle: '100% trong hạn cam kết SLA',
    },
    {
      title: 'Tỷ Lệ Hoàn Tất Giao Hàng',
      value: '98.5%',
      subtitle: 'Đạt chuẩn vận hành',
    },
    {
      title: 'Số Lượng SKU Đang Kinh Doanh',
      value: '52 SKU',
      subtitle: 'Đồng bộ 3 chi nhánh',
    },
  ]);

  onBranchChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedBranch.set(target.value);
  }
}
