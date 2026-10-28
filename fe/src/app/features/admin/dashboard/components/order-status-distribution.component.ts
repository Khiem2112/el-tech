import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';
import { OrderStatusDistributionData } from '../services/admin-dashboard.service';

@Component({
  selector: 'app-order-status-distribution',
  standalone: true,
  imports: [CommonModule, RouterModule, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-line rounded-lg overflow-hidden">
      <div class="p-4 border-b border-line flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-muted">
            Tiến Độ Đơn Hàng Theo Chi Nhánh
          </h2>
        </div>
        <a
          [routerLink]="['/admin/orders']"
          class="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          <span>Quản lý đơn hàng</span>
          <lucide-icon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
        </a>
      </div>

      <div class="p-4 border-b border-line bg-surface-alt/20">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="text-muted font-medium">Phân bổ trạng thái đang xử lý:</span>
          <span class="font-bold text-foreground tabular-nums">{{ activeTotal() }} đơn</span>
        </div>
        <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
          @if (activeTotal() > 0) {
            <div
              class="bg-slate-400 transition-all duration-300"
              [style.width.%]="(activeStats().confirmed / activeTotal()) * 100"
              [title]="'Đã xác nhận: ' + activeStats().confirmed"
            ></div>
            <div
              class="bg-blue-500 transition-all duration-300"
              [style.width.%]="(activeStats().preparingComponents / activeTotal()) * 100"
              [title]="'Đang soạn: ' + activeStats().preparingComponents"
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
              [title]="'Đang giao: ' + activeStats().shipping"
            ></div>
            <div
              class="bg-rose-500 transition-all duration-300"
              [style.width.%]="(activeStats().onHold / activeTotal()) * 100"
              [title]="'Tạm giữ: ' + activeStats().onHold"
            ></div>
          }
        </div>

        <div class="flex flex-wrap items-center gap-3 mt-2.5 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-slate-400"></span>
            <span class="text-muted">Đã xác nhận:</span>
            <span class="font-semibold text-foreground tabular-nums">{{ activeStats().confirmed }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span class="text-muted">Đang soạn:</span>
            <span class="font-semibold text-foreground tabular-nums">{{ activeStats().preparingComponents }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span class="text-muted">Đang lắp ráp:</span>
            <span class="font-semibold text-foreground tabular-nums">{{ activeStats().assembling }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-teal-500"></span>
            <span class="text-muted">Sẵn sàng nhận:</span>
            <span class="font-semibold text-foreground tabular-nums">{{ activeStats().readyForPickup }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="text-muted">Đang giao:</span>
            <span class="font-semibold text-foreground tabular-nums">{{ activeStats().shipping }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            <span class="text-muted">Tạm giữ:</span>
            <span
              class="font-semibold tabular-nums"
              [class.text-rose-600]="activeStats().onHold > 0"
              [class.text-foreground]="activeStats().onHold === 0"
            >
              {{ activeStats().onHold }}
            </span>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-surface-alt/60 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th class="py-2.5 px-3">Chi nhánh</th>
              <th class="py-2.5 px-3 text-center">Đã xác nhận</th>
              <th class="py-2.5 px-3 text-center">Đang soạn</th>
              <th class="py-2.5 px-3 text-center">Đang lắp</th>
              <th class="py-2.5 px-3 text-center">Sẵn sàng nhận</th>
              <th class="py-2.5 px-3 text-center">Đang giao</th>
              <th class="py-2.5 px-3 text-center">Tạm giữ</th>
              <th class="py-2.5 px-3 text-right">Tổng xử lý</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            @for (branch of distribution()?.byBranch ?? []; track branch.branchId) {
              <tr
                class="hover:bg-surface-alt/40 transition-colors"
                [class.bg-primary/5]="selectedBranchId() === branch.branchId"
                [class.border-l-2]="selectedBranchId() === branch.branchId"
                [class.border-l-primary]="selectedBranchId() === branch.branchId"
              >
                <td class="py-2.5 px-3 font-medium text-foreground">
                  <div>{{ branch.branchCode }}: {{ branch.branchName }}</div>
                  <div class="text-xs text-muted font-normal">
                    {{ getPriorityRegion(branch.branchCode, branch.branchName) }}
                  </div>
                </td>
                <td class="py-2.5 px-3 text-center font-medium tabular-nums">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'CONFIRMED', status: 'CONFIRMED', branchId: branch.branchId }"
                    class="hover:underline text-foreground"
                  >
                    {{ branch.confirmed }}
                  </a>
                </td>
                <td class="py-2.5 px-3 text-center font-medium tabular-nums">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'PREPARING_COMPONENTS', status: 'PREPARING_COMPONENTS', branchId: branch.branchId }"
                    class="hover:underline text-foreground"
                  >
                    {{ branch.preparingComponents }}
                  </a>
                </td>
                <td class="py-2.5 px-3 text-center font-medium tabular-nums">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'ASSEMBLING', status: 'ASSEMBLING', branchId: branch.branchId }"
                    class="hover:underline text-foreground"
                  >
                    {{ branch.assembling }}
                  </a>
                </td>
                <td class="py-2.5 px-3 text-center font-medium tabular-nums">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'READY_FOR_PICKUP', status: 'READY_FOR_PICKUP', branchId: branch.branchId }"
                    class="hover:underline text-foreground"
                  >
                    {{ branch.readyForPickup }}
                  </a>
                </td>
                <td class="py-2.5 px-3 text-center font-medium tabular-nums">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'SHIPPING', status: 'SHIPPING', branchId: branch.branchId }"
                    class="hover:underline text-foreground"
                  >
                    {{ branch.shipping }}
                  </a>
                </td>
                <td class="py-2.5 px-3 text-center font-medium tabular-nums">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'ON_HOLD', status: 'ON_HOLD', branchId: branch.branchId }"
                    class="hover:underline"
                    [class.text-rose-600]="branch.onHold > 0"
                    [class.text-foreground]="branch.onHold === 0"
                  >
                    {{ branch.onHold }}
                  </a>
                </td>
                <td class="py-2.5 px-3 text-right font-bold tabular-nums text-foreground">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ branchId: branch.branchId }"
                    class="hover:underline text-primary"
                  >
                    {{ branch.total }}
                  </a>
                </td>
              </tr>
            }
          </tbody>
          <tfoot class="bg-surface-alt/60 font-semibold text-foreground border-t border-line text-xs">
            <tr>
              <td class="py-2.5 px-3 uppercase text-foreground">Toàn hệ thống</td>
              <td class="py-2.5 px-3 text-center tabular-nums text-foreground">
                {{ distribution()?.systemTotal?.confirmed ?? 0 }}
              </td>
              <td class="py-2.5 px-3 text-center tabular-nums text-foreground">
                {{ distribution()?.systemTotal?.preparingComponents ?? 0 }}
              </td>
              <td class="py-2.5 px-3 text-center tabular-nums text-foreground">
                {{ distribution()?.systemTotal?.assembling ?? 0 }}
              </td>
              <td class="py-2.5 px-3 text-center tabular-nums text-foreground">
                {{ distribution()?.systemTotal?.readyForPickup ?? 0 }}
              </td>
              <td class="py-2.5 px-3 text-center tabular-nums text-foreground">
                {{ distribution()?.systemTotal?.shipping ?? 0 }}
              </td>
              <td
                class="py-2.5 px-3 text-center tabular-nums"
                [class.text-rose-600]="(distribution()?.systemTotal?.onHold ?? 0) > 0"
                [class.text-foreground]="(distribution()?.systemTotal?.onHold ?? 0) === 0"
              >
                {{ distribution()?.systemTotal?.onHold ?? 0 }}
              </td>
              <td class="py-2.5 px-3 text-right tabular-nums text-primary font-bold">
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

  getPriorityRegion(code: string, name: string): string {
    const upper = `${code} ${name}`.toUpperCase();
    if (upper.includes('HN') || upper.includes('HÀ NỘI') || upper.includes('HA NOI')) {
      return 'Khu vực Miền Bắc';
    }
    if (upper.includes('DN') || upper.includes('ĐÀ NẴNG') || upper.includes('DA NANG')) {
      return 'Khu vực Miền Trung';
    }
    if (
      upper.includes('HCM') ||
      upper.includes('SG') ||
      upper.includes('HỒ CHÍ MINH') ||
      upper.includes('HO CHI MINH')
    ) {
      return 'Khu vực Miền Nam';
    }
    return 'Khu vực Nội vùng';
  }
}
