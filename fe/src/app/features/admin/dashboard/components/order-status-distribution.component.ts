import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OrderStatusDistributionData } from '../services/admin-dashboard.service';

@Component({
  selector: 'app-order-status-distribution',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white border border-line rounded-lg shadow-xs overflow-hidden">
      <div class="p-5 border-b border-line flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 class="text-sm font-bold uppercase tracking-wider text-foreground">
            Tiến Độ Vận Hành Đơn Hàng Theo Chi Nhánh
          </h2>
          <p class="text-[13px] text-muted mt-0.5">
            Theo dõi số lượng đơn đang xử lý tại từng chi nhánh kho kiêm showroom
          </p>
        </div>
        <a
          [routerLink]="['/admin/orders']"
          class="text-[13px] font-semibold text-primary-strong hover:underline"
        >
          Quản lý tất cả đơn hàng
        </a>
      </div>

      <div class="p-5 border-b border-line bg-surface-alt/40">
        <div class="flex items-center justify-between text-[13px] mb-2">
          <span class="text-muted font-medium">Phân Bổ Trạng Thái Đang Xử Lý:</span>
          <span class="font-bold text-foreground font-mono text-sm">{{ activeTotal() }} đơn</span>
        </div>
        <div class="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
          @if (activeTotal() > 0) {
            <div
              class="bg-slate-400 transition-all duration-300"
              [style.width.%]="(activeStats().confirmed / activeTotal()) * 100"
              [title]="'Đã xác nhận: ' + activeStats().confirmed"
            ></div>
            <div
              class="bg-blue-500 transition-all duration-300"
              [style.width.%]="(activeStats().preparingComponents / activeTotal()) * 100"
              [title]="'Đang soạn hàng: ' + activeStats().preparingComponents"
            ></div>
            <div
              class="bg-primary transition-all duration-300"
              [style.width.%]="(activeStats().assembling / activeTotal()) * 100"
              [title]="'Đang lắp ráp: ' + activeStats().assembling"
            ></div>
            <div
              class="bg-teal-500 transition-all duration-300"
              [style.width.%]="(activeStats().readyForPickup / activeTotal()) * 100"
              [title]="'Sẵn sàng nhận: ' + activeStats().readyForPickup"
            ></div>
            <div
              class="bg-emerald-500 transition-all duration-300"
              [style.width.%]="(activeStats().shipping / activeTotal()) * 100"
              [title]="'Đang giao hàng: ' + activeStats().shipping"
            ></div>
            <div
              class="bg-rose-500 transition-all duration-300"
              [style.width.%]="(activeStats().onHold / activeTotal()) * 100"
              [title]="'Tạm giữ: ' + activeStats().onHold"
            ></div>
          }
        </div>

        <div class="flex flex-wrap items-center gap-4 mt-3 text-[13px]">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span class="text-muted">Đã xác nhận:</span>
            <span class="font-bold text-foreground font-mono">{{ activeStats().confirmed }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span class="text-muted">Đang soạn hàng:</span>
            <span class="font-bold text-blue-700 font-mono">{{ activeStats().preparingComponents }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span class="text-muted">Đang lắp ráp:</span>
            <span class="font-bold text-primary-strong font-mono">{{ activeStats().assembling }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span class="text-muted">Sẵn sàng nhận:</span>
            <span class="font-bold text-teal-700 font-mono">{{ activeStats().readyForPickup }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-muted">Đang giao:</span>
            <span class="font-bold text-emerald-700 font-mono">{{ activeStats().shipping }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span class="text-muted">Tạm giữ:</span>
            <span class="font-bold text-rose-700 font-mono">{{ activeStats().onHold }}</span>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13px]">
          <thead class="bg-surface-alt/80 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th class="py-3 px-4">Chi nhánh</th>
              <th class="py-3 px-4 text-center">Đã xác nhận</th>
              <th class="py-3 px-4 text-center">Đang soạn hàng</th>
              <th class="py-3 px-4 text-center">Đang lắp ráp</th>
              <th class="py-3 px-4 text-center">Sẵn sàng nhận</th>
              <th class="py-3 px-4 text-center">Đang giao hàng</th>
              <th class="py-3 px-4 text-center">Tạm giữ</th>
              <th class="py-3 px-4 text-right">Tổng đang xử lý</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            @for (branch of distribution()?.byBranch ?? []; track branch.branchId) {
              <tr
                class="hover:bg-surface-alt/50 transition-colors"
                [class.bg-primary/5]="selectedBranchId() === branch.branchId"
                [class.border-l-4]="selectedBranchId() === branch.branchId"
                [class.border-l-primary]="selectedBranchId() === branch.branchId"
              >
                <td class="py-3 px-4 font-semibold text-foreground">
                  <div>{{ branch.branchCode }}: {{ branch.branchName }}</div>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'CONFIRMED', status: 'CONFIRMED', branchId: branch.branchId }"
                    class="hover:underline text-foreground"
                  >
                    {{ branch.confirmed }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-blue-700 bg-blue-50/50">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'PREPARING_COMPONENTS', status: 'PREPARING_COMPONENTS', branchId: branch.branchId }"
                    class="hover:underline text-blue-700"
                  >
                    {{ branch.preparingComponents }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-primary-strong bg-primary/10">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'ASSEMBLING', status: 'ASSEMBLING', branchId: branch.branchId }"
                    class="hover:underline text-primary-strong"
                  >
                    {{ branch.assembling }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-teal-700 bg-teal-50/50">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'READY_FOR_PICKUP', status: 'READY_FOR_PICKUP', branchId: branch.branchId }"
                    class="hover:underline text-teal-700"
                  >
                    {{ branch.readyForPickup }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-emerald-700 bg-emerald-50/50">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'SHIPPING', status: 'SHIPPING', branchId: branch.branchId }"
                    class="hover:underline text-emerald-700"
                  >
                    {{ branch.shipping }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-rose-700 bg-rose-50/50">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'ON_HOLD', status: 'ON_HOLD', branchId: branch.branchId }"
                    class="hover:underline text-rose-700"
                  >
                    {{ branch.onHold }}
                  </a>
                </td>
                <td class="py-3 px-4 text-right font-black tabular-nums text-foreground">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ branchId: branch.branchId }"
                    class="hover:underline text-primary-strong"
                  >
                    {{ branch.total }}
                  </a>
                </td>
              </tr>
            }
          </tbody>
          <tfoot class="bg-surface-alt font-bold text-foreground border-t-2 border-line text-[13px]">
            <tr>
              <td class="py-3 px-4 uppercase text-foreground">Tổng cộng toàn hệ thống</td>
              <td class="py-3 px-4 text-center tabular-nums text-foreground">
                {{ distribution()?.systemTotal?.confirmed ?? 0 }}
              </td>
              <td class="py-3 px-4 text-center tabular-nums text-blue-700 bg-blue-50/50">
                {{ distribution()?.systemTotal?.preparingComponents ?? 0 }}
              </td>
              <td class="py-3 px-4 text-center tabular-nums text-primary-strong bg-primary/10">
                {{ distribution()?.systemTotal?.assembling ?? 0 }}
              </td>
              <td class="py-3 px-4 text-center tabular-nums text-teal-700 bg-teal-50/50">
                {{ distribution()?.systemTotal?.readyForPickup ?? 0 }}
              </td>
              <td class="py-3 px-4 text-center tabular-nums text-emerald-700 bg-emerald-50/50">
                {{ distribution()?.systemTotal?.shipping ?? 0 }}
              </td>
              <td class="py-3 px-4 text-center tabular-nums text-rose-700 bg-rose-50/50">
                {{ distribution()?.systemTotal?.onHold ?? 0 }}
              </td>
              <td class="py-3 px-4 text-right tabular-nums text-primary-strong font-black">
                {{ distribution()?.systemTotal?.total ?? 0 }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
})
export class OrderStatusDistributionComponent {
  readonly distribution = input<OrderStatusDistributionData | null>(null);
  readonly selectedBranchId = input<number | null>(null);

  readonly activeStats = computed(() => {
    const dist = this.distribution();
    const branchId = this.selectedBranchId();

    if (dist && branchId !== null) {
      const branch = dist.byBranch.find((b) => b.branchId === branchId);
      if (branch) {
        return {
          confirmed: branch.confirmed,
          preparingComponents: branch.preparingComponents,
          assembling: branch.assembling,
          readyForPickup: branch.readyForPickup,
          shipping: branch.shipping,
          onHold: branch.onHold,
        };
      }
    }

    return {
      confirmed: dist?.systemTotal?.confirmed ?? 0,
      preparingComponents: dist?.systemTotal?.preparingComponents ?? 0,
      assembling: dist?.systemTotal?.assembling ?? 0,
      readyForPickup: dist?.systemTotal?.readyForPickup ?? 0,
      shipping: dist?.systemTotal?.shipping ?? 0,
      onHold: dist?.systemTotal?.onHold ?? 0,
    };
  });

  readonly activeTotal = computed(() => {
    const stats = this.activeStats();
    return (
      stats.confirmed +
      stats.preparingComponents +
      stats.assembling +
      stats.readyForPickup +
      stats.shipping +
      stats.onHold
    );
  });
}
