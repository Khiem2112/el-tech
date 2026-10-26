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
    <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm">
      <div class="p-4 border-b border-[#272f3d] flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-white">
            Tiến Độ Vận Hành Đơn Hàng Theo Chi Nhánh
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Theo dõi số lượng đơn đang xử lý tại từng chi nhánh kho kiêm showroom
          </p>
        </div>
        <a
          [routerLink]="['/admin/orders']"
          class="text-xs font-semibold text-[#76b900] hover:underline"
        >
          Quản lý tất cả đơn hàng
        </a>
      </div>

      <div class="p-4 border-b border-[#272f3d]/60 bg-[#090d16]/40">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="text-slate-400 font-medium">Phân Bổ Trạng Thái Đang Xử Lý:</span>
          <span class="font-bold text-white font-mono">{{ activeTotal() }} đơn</span>
        </div>
        <div class="h-3 w-full bg-[#272f3d] rounded-full overflow-hidden flex">
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

        <div class="flex flex-wrap items-center gap-4 mt-3 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span class="text-slate-400">Đã xác nhận:</span>
            <span class="font-bold text-white font-mono">{{ activeStats().confirmed }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span class="text-slate-400">Đang soạn hàng:</span>
            <span class="font-bold text-blue-400 font-mono">{{ activeStats().preparingComponents }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span class="text-slate-400">Đang lắp ráp:</span>
            <span class="font-bold text-primary font-mono">{{ activeStats().assembling }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span class="text-slate-400">Sẵn sàng nhận:</span>
            <span class="font-bold text-teal-400 font-mono">{{ activeStats().readyForPickup }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-slate-400">Đang giao:</span>
            <span class="font-bold text-emerald-400 font-mono">{{ activeStats().shipping }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span class="text-slate-400">Tạm giữ:</span>
            <span class="font-bold text-rose-400 font-mono">{{ activeStats().onHold }}</span>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th class="py-2.5 px-4">Chi nhánh</th>
              <th class="py-2.5 px-4 text-center">Đã xác nhận</th>
              <th class="py-2.5 px-4 text-center">Đang soạn hàng</th>
              <th class="py-2.5 px-4 text-center">Đang lắp ráp</th>
              <th class="py-2.5 px-4 text-center">Sẵn sàng nhận</th>
              <th class="py-2.5 px-4 text-center">Đang giao hàng</th>
              <th class="py-2.5 px-4 text-center">Tạm giữ</th>
              <th class="py-2.5 px-4 text-right">Tổng đang xử lý</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#272f3d]">
            @for (branch of distribution()?.byBranch ?? []; track branch.branchId) {
              <tr
                class="hover:bg-[#090d16]/30 transition-colors"
                [class.bg-[#76b900]/5]="selectedBranchId() === branch.branchId"
                [class.border-l-2]="selectedBranchId() === branch.branchId"
                [class.border-l-[#76b900]]="selectedBranchId() === branch.branchId"
              >
                <td class="py-3 px-4 font-semibold text-white">
                  <div>{{ branch.branchCode }}: {{ branch.branchName }}</div>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'CONFIRMED', status: 'CONFIRMED', branchId: branch.branchId }"
                    class="hover:underline text-slate-300"
                  >
                    {{ branch.confirmed }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-blue-400 bg-blue-950/20">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'PREPARING_COMPONENTS', status: 'PREPARING_COMPONENTS', branchId: branch.branchId }"
                    class="hover:underline text-blue-400"
                  >
                    {{ branch.preparingComponents }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-primary bg-primary/10">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'ASSEMBLING', status: 'ASSEMBLING', branchId: branch.branchId }"
                    class="hover:underline text-primary"
                  >
                    {{ branch.assembling }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-teal-400">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'READY_FOR_PICKUP', status: 'READY_FOR_PICKUP', branchId: branch.branchId }"
                    class="hover:underline text-teal-400"
                  >
                    {{ branch.readyForPickup }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-emerald-400">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'SHIPPING', status: 'SHIPPING', branchId: branch.branchId }"
                    class="hover:underline text-emerald-400"
                  >
                    {{ branch.shipping }}
                  </a>
                </td>
                <td class="py-3 px-4 text-center font-semibold tabular-nums text-rose-400 bg-rose-950/20">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ tab: 'ON_HOLD', status: 'ON_HOLD', branchId: branch.branchId }"
                    class="hover:underline text-rose-400"
                  >
                    {{ branch.onHold }}
                  </a>
                </td>
                <td class="py-3 px-4 text-right font-black tabular-nums text-white">
                  <a
                    [routerLink]="['/admin/orders']"
                    [queryParams]="{ branchId: branch.branchId }"
                    class="hover:underline text-[#76b900]"
                  >
                    {{ branch.total }}
                  </a>
                </td>
              </tr>
            }
          </tbody>
          <tfoot class="bg-[#090d16] font-bold text-white border-t border-[#272f3d] text-xs">
            <tr>
              <td class="py-2.5 px-4 uppercase text-slate-300">Tổng cộng toàn hệ thống</td>
              <td class="py-2.5 px-4 text-center tabular-nums text-slate-200">
                {{ distribution()?.systemTotal?.confirmed ?? 0 }}
              </td>
              <td class="py-2.5 px-4 text-center tabular-nums text-blue-400">
                {{ distribution()?.systemTotal?.preparingComponents ?? 0 }}
              </td>
              <td class="py-2.5 px-4 text-center tabular-nums text-primary">
                {{ distribution()?.systemTotal?.assembling ?? 0 }}
              </td>
              <td class="py-2.5 px-4 text-center tabular-nums text-teal-400">
                {{ distribution()?.systemTotal?.readyForPickup ?? 0 }}
              </td>
              <td class="py-2.5 px-4 text-center tabular-nums text-emerald-400">
                {{ distribution()?.systemTotal?.shipping ?? 0 }}
              </td>
              <td class="py-2.5 px-4 text-center tabular-nums text-rose-400">
                {{ distribution()?.systemTotal?.onHold ?? 0 }}
              </td>
              <td class="py-2.5 px-4 text-right tabular-nums text-[#76b900] font-black">
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
