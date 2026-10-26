import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AdminCoupon,
  AdminCouponService,
  CouponRedemptionHistoryResponse,
  CouponRedemptionStatus,
} from '../services/admin-coupon.service';

@Component({
  selector: 'app-coupon-redemption-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-redemption-title"
      >
        <div
          data-modal-id="MOD-35"
          class="relative bg-surface border-l border-line shadow-2xl w-full max-w-2xl h-full flex flex-col text-sm text-foreground"
          (click)="$event.stopPropagation()"
        >
          <header class="h-16 px-6 border-b border-line flex items-center justify-between shrink-0 bg-surface">
            <div>
              <h2 id="sheet-redemption-title" class="font-bold text-foreground uppercase text-base tracking-wide">
                Lịch Sử Sử Dụng Mã Giảm Giá
              </h2>
              <p class="text-xs text-muted mt-0.5">
                Mã: <strong class="font-mono text-primary">{{ coupon()?.code }}</strong>
                — {{ coupon()?.name }}
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-alt transition-colors cursor-pointer"
              title="Đóng bảng trượt"
              aria-label="Đóng bảng trượt"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="p-4 bg-surface-alt border-b border-line grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div class="p-2.5 bg-surface rounded border border-line">
              <span class="text-muted block text-xs">Hạn mức quota:</span>
              <strong class="text-foreground tabular-nums text-sm font-bold">
                {{ coupon()?.globalQuota ? coupon()?.globalQuota + ' lượt' : 'Không giới hạn' }}
              </strong>
            </div>

            <div class="p-2.5 bg-surface rounded border border-line">
              <span class="text-emerald-700 dark:text-emerald-400 block text-xs font-semibold">Đã tiêu thụ:</span>
              <strong class="text-emerald-600 dark:text-emerald-400 tabular-nums text-sm font-bold">
                {{ historyData()?.summary?.consumedCount ?? 0 }} đơn
              </strong>
            </div>

            <div class="p-2.5 bg-surface rounded border border-line">
              <span class="text-amber-700 dark:text-amber-400 block text-xs font-semibold">Đang giữ tạm:</span>
              <strong class="text-amber-600 dark:text-amber-400 tabular-nums text-sm font-bold">
                {{ historyData()?.summary?.reservedCount ?? 0 }} đơn
              </strong>
            </div>

            <div class="p-2.5 bg-surface rounded border border-line">
              <span class="text-muted block text-xs">Đã hoàn/hủy:</span>
              <strong class="text-muted tabular-nums text-sm font-bold">
                {{ historyData()?.summary?.releasedCount ?? 0 }} đơn
              </strong>
            </div>
          </div>

          <div class="px-6 py-2.5 border-b border-line flex items-center justify-between text-xs bg-surface">
            <div class="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                (click)="onFilterChange('ALL')"
                class="px-2.5 py-1 rounded transition-colors font-semibold cursor-pointer text-xs"
                [class.bg-primary]="selectedStatus() === 'ALL'"
                [class.text-primary-foreground]="selectedStatus() === 'ALL'"
                [class.bg-surface-alt]="selectedStatus() !== 'ALL'"
                [class.text-muted]="selectedStatus() !== 'ALL'"
              >
                Tất cả ({{ historyData()?.summary?.totalRedemptions ?? 0 }})
              </button>
              <button
                type="button"
                (click)="onFilterChange('CONSUMED')"
                class="px-2.5 py-1 rounded transition-colors font-semibold cursor-pointer text-xs"
                [class.bg-emerald-600]="selectedStatus() === 'CONSUMED'"
                [class.text-white]="selectedStatus() === 'CONSUMED'"
                [class.bg-surface-alt]="selectedStatus() !== 'CONSUMED'"
                [class.text-muted]="selectedStatus() !== 'CONSUMED'"
              >
                Đã dùng
              </button>
              <button
                type="button"
                (click)="onFilterChange('RESERVED')"
                class="px-2.5 py-1 rounded transition-colors font-semibold cursor-pointer text-xs"
                [class.bg-amber-600]="selectedStatus() === 'RESERVED'"
                [class.text-white]="selectedStatus() === 'RESERVED'"
                [class.bg-surface-alt]="selectedStatus() !== 'RESERVED'"
                [class.text-muted]="selectedStatus() !== 'RESERVED'"
              >
                Đang giữ
              </button>
              <button
                type="button"
                (click)="onFilterChange('RELEASED')"
                class="px-2.5 py-1 rounded transition-colors font-semibold cursor-pointer text-xs"
                [class.bg-surface-alt]="selectedStatus() !== 'RELEASED'"
                [class.text-foreground]="selectedStatus() === 'RELEASED'"
                [class.border]="true"
                [class.border-line]="true"
              >
                Đã hủy/hoàn
              </button>
            </div>

            <button
              type="button"
              (click)="loadData()"
              class="p-1 rounded text-muted hover:text-foreground transition-colors cursor-pointer border border-line"
              title="Làm mới lịch sử"
              aria-label="Làm mới lịch sử"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-3">
            @if (isLoading()) {
              <div class="py-12 flex flex-col items-center justify-center gap-2 text-muted">
                <span class="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                <span class="text-xs">Đang tải lịch sử sử dụng...</span>
              </div>
            } @else if (errorMessage()) {
              <div class="p-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs">
                {{ errorMessage() }}
              </div>
            } @else if (!historyData()?.items?.length) {
              <div class="py-16 text-center space-y-2">
                <p class="text-sm font-semibold text-foreground">Chưa có lượt sử dụng nào</p>
                <p class="text-xs text-muted">
                  Mã coupon này chưa được áp dụng vào đơn hàng nào theo điều kiện lọc hiện tại.
                </p>
              </div>
            } @else {
              @for (item of historyData()?.items; track item.id) {
                <div class="p-3.5 bg-surface border border-line rounded-lg space-y-2 hover:border-line-strong transition-colors shadow-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold text-primary text-sm whitespace-nowrap">{{ item.order.code }}</span>
                      <span class="text-muted text-xs font-mono">•</span>
                      <span class="text-muted text-xs whitespace-nowrap">Trạng thái ĐH: {{ item.order.status }}</span>
                    </div>

                    @if (item.status === 'CONSUMED') {
                      <span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        ĐÃ DÙNG
                      </span>
                    } @else if (item.status === 'RESERVED') {
                      <span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                        ĐANG GIỮ
                      </span>
                    } @else if (item.status === 'RELEASED') {
                      <span class="px-2 py-0.5 rounded text-xs font-bold bg-surface-alt text-muted border border-line whitespace-nowrap">
                        ĐÃ GIẢI PHÓNG
                      </span>
                    }
                  </div>

                  <div class="text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      Khách hàng: <strong class="text-foreground">{{ item.customer.name }}</strong>
                      <span class="text-muted"> ({{ item.customer.phone || item.customer.email }})</span>
                    </div>
                    <div class="tabular-nums font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      Giảm: {{ item.order.couponDiscount | number:'1.0-0' }} ₫
                    </div>
                  </div>

                  <div class="pt-1.5 border-t border-line flex items-center justify-between text-xs text-muted">
                    <div class="whitespace-nowrap">
                      Tổng đơn: <strong class="text-foreground tabular-nums">{{ item.order.grandTotal | number:'1.0-0' }} ₫</strong>
                    </div>
                    <div class="tabular-nums whitespace-nowrap">
                      Thời điểm: {{ item.createdAt | date:'HH:mm dd/MM/yyyy' }}
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <footer class="h-16 px-6 border-t border-line flex items-center justify-between shrink-0 bg-surface">
            <div class="text-xs text-muted">
              Tổng số bản ghi: <strong class="text-foreground tabular-nums">{{ historyData()?.meta?.total ?? 0 }}</strong>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-5 py-2 bg-surface-alt hover:bg-surface text-foreground font-semibold text-xs rounded-md transition-colors border border-line cursor-pointer"
            >
              Đóng
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponRedemptionSheetComponent {
  private readonly couponService = inject(AdminCouponService);

  readonly isOpen = input<boolean>(false);
  readonly coupon = input<AdminCoupon | null>(null);

  readonly closeSheet = output<void>();

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly historyData = signal<CouponRedemptionHistoryResponse | null>(null);
  readonly selectedStatus = signal<'ALL' | CouponRedemptionStatus>('ALL');

  constructor() {
    effect(() => {
      if (this.isOpen() && this.coupon()) {
        this.selectedStatus.set('ALL');
        this.loadData();
      }
    });
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }

  async loadData(): Promise<void> {
    const current = this.coupon();
    if (!current) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const data = await this.couponService.loadRedemptions(current.id, {
        status: this.selectedStatus(),
        limit: 100,
      });
      this.historyData.set(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải lịch sử sử dụng';
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  onFilterChange(status: 'ALL' | CouponRedemptionStatus): void {
    this.selectedStatus.set(status);
    this.loadData();
  }

  onClose(): void {
    this.closeSheet.emit();
  }
}
