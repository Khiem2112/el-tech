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
    <div class="w-full space-y-6 p-4 lg:p-6 text-sm text-foreground">
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight uppercase text-foreground">
            Biểu Phí Giao Hàng
          </h1>
          <p class="text-xs text-muted mt-1">
            Cấu hình mức phí giao hàng tiêu chuẩn và ngưỡng miễn phí vận chuyển toàn hệ thống
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="onOpenCreateDialog()"
            class="px-4 py-2 bg-primary hover:bg-primary-strong text-primary-foreground font-bold text-xs rounded transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Cập Nhật Biểu Phí</span>
          </button>
        </div>
      </header>

      <nav class="flex items-center gap-2 border-b border-line overflow-x-auto text-xs" aria-label="Phân hệ khuyến mãi và biểu phí">
        <a
          routerLink="/admin/promotions"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-muted hover:text-foreground"
        >
          <span>Chương Trình Khuyến Mãi</span>
        </a>

        <a
          routerLink="/admin/promotions/coupons"
          class="px-4 py-2.5 border-b-2 font-semibold whitespace-nowrap flex items-center gap-2 transition-colors border-transparent text-muted hover:text-foreground"
        >
          <span>Mã Giảm Giá (Coupons)</span>
        </a>

        <a
          routerLink="/admin/promotions/shipping-fee"
          class="px-4 py-2.5 border-b-2 font-bold whitespace-nowrap flex items-center gap-2 transition-colors border-primary text-primary"
        >
          <span>Biểu Phí Giao Hàng</span>
        </a>
      </nav>

      <section aria-labelledby="active-fee-title" class="space-y-2">
        <div class="bg-surface border border-line rounded p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-line pb-2.5">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary"></span>
              <h2 id="active-fee-title" class="text-xs font-bold uppercase tracking-wider text-foreground">
                Biểu Phí Vận Chuyển Đang Áp Dụng
              </h2>
            </div>
            <span class="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-wide whitespace-nowrap">
              Đang Áp Dụng
            </span>
          </div>

          @if (shippingFeeService.isLoading() && !activeConfig()) {
            <div class="py-8 text-center text-muted text-xs">
              <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mb-2"></div>
              <p>Đang tải cấu hình biểu phí hiện hành...</p>
            </div>
          } @else if (activeConfig()) {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div class="p-3 bg-surface-alt rounded border border-line space-y-1">
                <span class="text-muted text-xs uppercase font-semibold block">
                  Phí giao hàng cố định toàn quốc
                </span>
                <div class="text-2xl font-bold text-foreground tabular tabular-nums tracking-tight whitespace-nowrap">
                  {{ formatVnd(activeConfig()?.fixedFee) }}
                </div>
              </div>

              <div class="p-3 bg-surface-alt rounded border border-line space-y-1">
                <span class="text-muted text-xs uppercase font-semibold block">
                  Ngưỡng miễn phí vận chuyển
                </span>
                <div class="text-2xl font-bold text-primary tabular tabular-nums tracking-tight whitespace-nowrap">
                  {{ formatVnd(activeConfig()?.freeShippingThreshold) }}
                </div>
              </div>

              <div class="p-3 bg-surface-alt rounded border border-line space-y-1">
                <span class="text-muted text-xs uppercase font-semibold block">
                  Thời điểm hiệu lực
                </span>
                <div class="text-sm font-bold text-foreground tabular tabular-nums mt-1 whitespace-nowrap">
                  {{ formatDateTime(activeConfig()?.effectiveFrom) }}
                </div>
                <div class="text-xs text-muted">
                  Người cập nhật: <span class="text-foreground font-semibold">{{ activeConfig()?.createdBy }}</span>
                </div>
              </div>
            </div>
          } @else {
            <div class="py-6 text-center text-muted text-xs">
              <p>Chưa có cấu hình biểu phí đang hoạt động.</p>
              <button
                type="button"
                (click)="onOpenCreateDialog()"
                class="mt-2 text-primary hover:underline font-semibold cursor-pointer text-sm"
              >
                Nhấn vào đây để thiết lập biểu phí mới
              </button>
            </div>
          }
        </div>
      </section>

      <section aria-labelledby="history-table-title" class="bg-surface border border-line rounded overflow-hidden">
        <div class="p-4 border-b border-line flex items-center justify-between bg-surface">
          <div class="flex items-center gap-2">
            <h2 id="history-table-title" class="text-xs font-bold uppercase tracking-wider text-foreground">
              Lịch Sử Cấu Hình Biểu Phí Vận Chuyển
            </h2>
            <span class="text-xs bg-surface-alt border border-line text-muted px-2 py-0.5 rounded font-semibold tabular">
              {{ history().length }} phiên bản
            </span>
          </div>

          <button
            type="button"
            (click)="onRefresh()"
            [disabled]="shippingFeeService.isLoading()"
            class="px-3 py-1.5 bg-surface-alt hover:bg-surface border border-line text-foreground text-sm font-medium rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
          <div class="p-8 text-center text-muted text-xs">
            <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mb-2"></div>
            <p>Đang tải lịch sử biểu phí...</p>
          </div>
        } @else if (history().length === 0) {
          <div class="p-8 text-center text-muted text-xs space-y-2">
            <p>Chưa có dữ liệu lịch sử cấu hình biểu phí.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm min-w-[1000px] border-collapse">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-3 px-4 whitespace-nowrap">Thời Điểm Hiệu Lực</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Phí Giao Hàng Cố Định</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Ngưỡng Miễn Phí</th>
                  <th class="py-3 px-4 whitespace-nowrap">Người Cấu Hình</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Trạng Thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-foreground">
                @for (item of history(); track item.id) {
                  <tr class="hover:bg-surface-alt/60 transition-colors">
                    <td class="py-3 px-4 tabular tabular-nums whitespace-nowrap">
                      <div class="font-bold text-foreground">
                        {{ formatDateTime(item.effectiveFrom) }}
                      </div>
                      @if (item.effectiveTo) {
                        <div class="text-xs text-muted mt-0.5">
                          Đến {{ formatDateTime(item.effectiveTo) }}
                        </div>
                      }
                    </td>

                    <td class="py-3 px-4 text-right tabular-nums font-bold text-foreground text-sm whitespace-nowrap">
                      {{ formatVnd(item.fixedFee) }}
                    </td>

                    <td class="py-3 px-4 text-right tabular-nums font-bold text-primary text-sm whitespace-nowrap">
                      {{ formatVnd(item.freeShippingThreshold) }}
                    </td>

                    <td class="py-3 px-4 text-muted font-medium whitespace-nowrap">
                      {{ item.createdBy }}
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (item.status === 'ACTIVE') {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wide whitespace-nowrap">
                          Đang Áp Dụng
                        </span>
                      } @else if (item.status === 'UPCOMING') {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wide whitespace-nowrap">
                          Sắp Áp Dụng
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-surface-alt text-muted border border-line uppercase tracking-wide whitespace-nowrap">
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

      <div
        class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
        aria-live="polite"
      >
        @for (toast of toasts(); track toast.id) {
          <div
            class="pointer-events-auto p-3.5 rounded-lg shadow-xl text-sm font-semibold flex items-center justify-between gap-3 border transition-all bg-surface border-line"
            [class.border-emerald-500]="toast.type === 'success'"
            [class.text-emerald-700]="toast.type === 'success'"
            [class.dark:text-emerald-400]="toast.type === 'success'"
            [class.border-rose-500]="toast.type === 'error'"
            [class.text-rose-700]="toast.type === 'error'"
            [class.dark:text-rose-400]="toast.type === 'error'"
            [class.border-sky-500]="toast.type === 'info'"
            [class.text-sky-700]="toast.type === 'info'"
            [class.dark:text-sky-400]="toast.type === 'info'"
          >
            <span>{{ toast.message }}</span>
            <button
              type="button"
              (click)="removeToast(toast.id)"
              class="text-muted hover:text-foreground p-1 cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        }
      </div>

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
