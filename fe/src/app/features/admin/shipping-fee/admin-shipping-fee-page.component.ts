import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DeliveryFeeFormDialogComponent } from './components/delivery-fee-form-dialog.component';
import {
  AdminDeliveryFeeConfig,
  AdminShippingFeeService,
} from './services/admin-shipping-fee.service';

type ToastNotification = {
  readonly id: string;
  readonly type: 'success' | 'error' | 'info';
  readonly message: string;
};

@Component({
  selector: 'app-admin-shipping-fee-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DeliveryFeeFormDialogComponent],
  template: `
    <div class="space-y-6 p-6">
      <!-- Header SCR-25 -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272f3d] pb-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-bold tracking-tight uppercase text-white">
              Biểu Phí Giao Hàng
            </h1>
            <span class="text-xs text-slate-400 border-l border-[#272f3d] pl-3 font-mono">
              SCR-25
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Cấu hình mức phí giao hàng tiêu chuẩn và ngưỡng miễn phí vận chuyển toàn hệ thống
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="onOpenCreateDialog()"
            class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Cập Nhật Biểu Phí</span>
          </button>
        </div>
      </header>

      <!-- Navigation Tabs SCR-23, SCR-24, SCR-25 -->
      <nav class="flex items-center gap-2 border-b border-[#272f3d] overflow-x-auto text-xs" aria-label="Phân hệ khuyến mãi và biểu phí">
        <a
          routerLink="/admin/promotions"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-slate-400 hover:text-white"
        >
          <span>Khuyến mãi sản phẩm</span>
          <span class="text-[10px] bg-[#161b26] border border-[#272f3d] px-1.5 py-0.5 rounded text-slate-400 font-mono">
            SCR-23
          </span>
        </a>

        <a
          routerLink="/admin/promotions/coupons"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-slate-400 hover:text-white"
        >
          <span>Mã giảm giá (Coupon)</span>
          <span class="text-[10px] bg-[#161b26] border border-[#272f3d] px-1.5 py-0.5 rounded text-slate-400 font-mono">
            SCR-24
          </span>
        </a>

        <a
          routerLink="/admin/promotions/shipping-fee"
          class="px-4 py-2.5 border-b-2 font-bold whitespace-nowrap flex items-center gap-2 transition-colors border-[#76b900] text-[#76b900]"
        >
          <span>Biểu phí giao hàng & Freeship</span>
          <span class="text-[10px] bg-[#161b26] border border-[#76b900]/40 px-1.5 py-0.5 rounded text-[#76b900] font-mono">
            SCR-25
          </span>
        </a>
      </nav>

      <!-- Summary Info Banner -->
      <div class="p-4 bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm text-xs text-slate-300 flex items-start gap-3">
        <div class="w-2 h-2 rounded-full bg-[#76b900] mt-1 flex-shrink-0"></div>
        <div>
          <strong class="text-white text-xs uppercase tracking-wider block mb-0.5">
            Chính sách giao hàng toàn quốc
          </strong>
          <p class="text-slate-400">
            Áp dụng mức phí giao hàng cố định cho các đơn giao tận nơi. Các đơn hàng có tổng giá trị hàng ròng đạt hoặc vượt ngưỡng miễn phí sẽ được tự động miễn phí vận chuyển 100%.
          </p>
        </div>
      </div>

      <!-- Active Delivery Fee Card -->
      <section aria-labelledby="active-fee-title" class="space-y-2">
        <div class="bg-[#161b26] border border-[#76b900]/30 rounded-lg p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#76b900] ring-4 ring-[#76b900]/20"></span>
              <h2 id="active-fee-title" class="text-xs font-bold uppercase tracking-wider text-white">
                Biểu Phí Vận Chuyển Đang Áp Dụng
              </h2>
            </div>
            <span class="px-2.5 py-1 rounded text-[11px] font-bold bg-[#76b900]/20 text-[#76b900] border border-[#76b900]/40 uppercase tracking-wide">
              Đang Áp Dụng
            </span>
          </div>

          @if (shippingFeeService.isLoading() && !activeConfig()) {
            <div class="py-8 text-center text-slate-400 text-xs">
              <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#76b900] border-t-transparent mb-2"></div>
              <p>Đang tải cấu hình biểu phí hiện hành...</p>
            </div>
          } @else if (activeConfig()) {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              <div class="space-y-1">
                <span class="text-slate-400 text-xs uppercase font-semibold block">
                  Phí giao hàng cố định toàn quốc
                </span>
                <div class="text-2xl font-black text-white tabular-nums tracking-tight">
                  {{ formatVnd(activeConfig()?.fixedFee) }}
                </div>
                <p class="text-[11px] text-slate-400">
                  Đồng giá cho mọi đơn giao tận nơi dưới ngưỡng miễn phí
                </p>
              </div>

              <div class="space-y-1">
                <span class="text-slate-400 text-xs uppercase font-semibold block">
                  Ngưỡng đơn hàng miễn phí giao hàng
                </span>
                <div class="text-2xl font-black text-[#76b900] tabular-nums tracking-tight">
                  {{ formatVnd(activeConfig()?.freeShippingThreshold) }}
                </div>
                <p class="text-[11px] text-slate-400">
                  Đơn từ {{ formatVnd(activeConfig()?.freeShippingThreshold) }} trở lên tự động miễn phí ship 100%
                </p>
              </div>

              <div class="space-y-1">
                <span class="text-slate-400 text-xs uppercase font-semibold block">
                  Thời điểm bắt đầu hiệu lực
                </span>
                <div class="text-sm font-bold text-white tabular-nums mt-1 font-mono">
                  {{ formatDateTime(activeConfig()?.effectiveFrom) }}
                </div>
                <p class="text-[11px] text-slate-400 mt-1">
                  Người cập nhật: <span class="text-slate-300 font-semibold">{{ activeConfig()?.createdBy }}</span>
                </p>
              </div>
            </div>
          } @else {
            <div class="py-6 text-center text-slate-400 text-xs">
              <p>Chưa có cấu hình biểu phí đang hoạt động.</p>
              <button
                type="button"
                (click)="onOpenCreateDialog()"
                class="mt-2 text-[#76b900] hover:underline font-semibold"
              >
                Nhấn vào đây để thiết lập biểu phí mới
              </button>
            </div>
          }
        </div>
      </section>

      <!-- History Table Section -->
      <section aria-labelledby="history-table-title" class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        <div class="p-4 border-b border-[#272f3d] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 id="history-table-title" class="text-xs font-bold uppercase tracking-wider text-white">
              Lịch Sử Cấu Hình Biểu Phí Vận Chuyển
            </h2>
            <span class="text-[11px] bg-[#090d16] border border-[#272f3d] text-slate-400 px-2 py-0.5 rounded font-mono font-semibold">
              {{ history().length }} phiên bản
            </span>
          </div>

          <button
            type="button"
            (click)="onRefresh()"
            [disabled]="shippingFeeService.isLoading()"
            class="px-2.5 py-1 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 text-xs rounded transition-colors inline-flex items-center gap-1.5"
            title="Làm mới danh sách"
          >
            <svg
              class="w-3.5 h-3.5"
              [class.animate-spin]="shippingFeeService.isLoading()"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Làm mới</span>
          </button>
        </div>

        @if (shippingFeeService.isLoading() && history().length === 0) {
          <div class="p-8 text-center text-slate-400 text-xs">
            <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#76b900] border-t-transparent mb-2"></div>
            <p>Đang tải lịch sử biểu phí...</p>
          </div>
        } @else if (history().length === 0) {
          <div class="p-8 text-center text-slate-400 text-xs space-y-2">
            <p>Chưa có dữ liệu lịch sử cấu hình biểu phí.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4">Thời Điểm Hiệu Lực</th>
                  <th class="py-3 px-4 text-right">Phí Giao Hàng Cố Định</th>
                  <th class="py-3 px-4 text-right">Ngưỡng Miễn Phí</th>
                  <th class="py-3 px-4">Người Cấu Hình</th>
                  <th class="py-3 px-4 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d]">
                @for (item of history(); track item.id) {
                  <tr class="hover:bg-[#090d16]/50 transition-colors">
                    <td class="py-3 px-4 tabular-nums font-mono">
                      <div class="font-bold text-white">
                        {{ formatDateTime(item.effectiveFrom) }}
                      </div>
                      @if (item.effectiveTo) {
                        <div class="text-[10px] text-slate-400 mt-0.5">
                          Đến {{ formatDateTime(item.effectiveTo) }}
                        </div>
                      }
                    </td>

                    <td class="py-3 px-4 text-right tabular-nums font-bold text-white text-sm">
                      {{ formatVnd(item.fixedFee) }}
                    </td>

                    <td class="py-3 px-4 text-right tabular-nums font-bold text-[#76b900] text-sm">
                      {{ formatVnd(item.freeShippingThreshold) }}
                    </td>

                    <td class="py-3 px-4 text-slate-300 font-medium">
                      {{ item.createdBy }}
                    </td>

                    <td class="py-3 px-4 text-center">
                      @if (item.status === 'ACTIVE') {
                        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#76b900]/20 text-[#76b900] border border-[#76b900]/40 uppercase tracking-wide">
                          Đang Áp Dụng
                        </span>
                      } @else if (item.status === 'UPCOMING') {
                        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wide">
                          Sắp Áp Dụng
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/30 text-slate-400 border border-slate-700 uppercase tracking-wide">
                          Hết Hạn
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <!-- Toast Container -->
      <div
        class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
        aria-live="polite"
      >
        @for (toast of toasts(); track toast.id) {
          <div
            class="pointer-events-auto p-3.5 rounded-lg shadow-xl text-xs font-semibold flex items-center justify-between gap-3 border transition-all"
            [class.bg-[#161b26]]="true"
            [class.border-[#76b900]]="toast.type === 'success'"
            [class.text-[#76b900]]="toast.type === 'success'"
            [class.border-rose-500]="toast.type === 'error'"
            [class.text-rose-400]="toast.type === 'error'"
            [class.border-sky-500]="toast.type === 'info'"
            [class.text-sky-300]="toast.type === 'info'"
          >
            <span>{{ toast.message }}</span>
            <button
              type="button"
              (click)="removeToast(toast.id)"
              class="text-slate-400 hover:text-white p-1"
              aria-label="Đóng thông báo"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        }
      </div>

      <!-- MOD-36 Dialog Component -->
      <app-delivery-fee-form-dialog
        [isOpen]="isDialogOpen()"
        [currentConfig]="activeConfig()"
        (closeDialog)="onCloseDialog()"
        (saveSuccess)="onSaveSuccess($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShippingFeePageComponent implements OnInit {
  readonly shippingFeeService = inject(AdminShippingFeeService);

  readonly isDialogOpen = signal<boolean>(false);
  readonly toasts = signal<readonly ToastNotification[]>([]);

  readonly activeConfig = computed(() => this.shippingFeeService.activeConfig());
  readonly history = computed(() => this.shippingFeeService.history());

  ngOnInit(): void {
    void this.shippingFeeService.loadDeliveryFees();
  }

  onOpenCreateDialog(): void {
    this.isDialogOpen.set(true);
  }

  onCloseDialog(): void {
    this.isDialogOpen.set(false);
  }

  onSaveSuccess(_config: AdminDeliveryFeeConfig): void {
    this.showToast('Đã lưu và kích hoạt biểu phí vận chuyển mới', 'success');
  }

  onRefresh(): void {
    void this.shippingFeeService.loadDeliveryFees();
  }

  formatVnd(value: unknown): string {
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
  }

  formatDateTime(isoString: string | null | undefined): string {
    if (!isoString) {
      return 'Chưa xác định';
    }
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return isoString;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = Date.now().toString() + Math.random().toString();
    const toast: ToastNotification = { id, message, type };
    this.toasts.update((items) => [...items, toast]);
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: string): void {
    this.toasts.update((items) => items.filter((t) => t.id !== id));
  }
}
