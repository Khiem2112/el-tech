import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AdminOrderDetail } from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-timeline-history',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
      <div class="bg-surface border border-line rounded-lg p-4 sm:p-5 shadow-card text-foreground space-y-4">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
            Chứng Từ Hệ Thống Liên Quan
          </h2>
          <span class="px-2 py-0.5 rounded bg-surface-alt border border-line text-muted font-mono text-xs">
            Hồ sơ kiểm toán
          </span>
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-surface-alt border border-line rounded space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-foreground">Phiếu Di Chuyển Kho (Stock Moves):</span>
              <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-mono text-xs font-semibold">
                {{ order().stockMoves.length }} phiếu
              </span>
            </div>
            @if (order().stockMoves.length === 0) {
              <div class="text-muted italic text-xs">Chưa phát sinh phiếu kho liên kết</div>
            } @else {
              <div class="space-y-1.5 pt-1">
                @for (move of order().stockMoves; track move.id) {
                  <div class="flex items-center justify-between p-2 rounded bg-surface border border-line">
                    <div>
                      <div class="font-mono font-bold text-primary">{{ move.code }}</div>
                      <div class="text-xs text-muted">Loại: {{ move.moveType }}</div>
                    </div>
                    <div class="text-right">
                      <span class="px-2 py-0.5 rounded text-xs font-bold bg-surface-alt border border-line text-foreground">
                        {{ move.status }}
                      </span>
                      <div class="text-xs text-muted font-mono mt-0.5">
                        {{ formatDate(move.createdAt) }}
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="p-3 bg-surface-alt border border-line rounded space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-foreground">Giao Dịch Cọc & Thanh Toán:</span>
              <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-mono text-xs font-semibold">
                {{ paymentCharges().length }} khoản thu
              </span>
            </div>
            @if (paymentCharges().length === 0) {
              <div class="text-muted italic text-xs">Chưa có bản ghi giao dịch thu cọc</div>
            } @else {
              <div class="space-y-1.5 pt-1">
                @for (charge of paymentCharges(); track charge.id) {
                  <div class="flex items-center justify-between p-2 rounded bg-surface border border-line">
                    <div>
                      <div class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {{ charge.providerReference || charge.id }}
                      </div>
                      <div class="text-xs text-muted">
                        Loại: {{ charge.chargeType }} | GD NH: {{ charge.providerTransactionId || 'Chưa ghi nhận' }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold font-mono text-foreground">{{ formatVnd(charge.expectedAmount) }}</div>
                      <span class="px-1.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        {{ charge.status }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="p-3 bg-surface-alt border border-line rounded space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-foreground">Phụ Lục Đơn Hàng (Amendments):</span>
              <span class="px-2 py-0.5 rounded bg-surface border border-line text-muted font-mono text-xs">
                {{ order().amendments.length }} phụ lục
              </span>
            </div>
            @if (order().amendments.length === 0) {
              <div class="text-muted italic text-xs">Chưa phát sinh phụ lục điều chỉnh</div>
            } @else {
              <div class="space-y-1.5 pt-1">
                @for (am of order().amendments; track am.id) {
                  <div class="flex items-center justify-between p-2 rounded bg-surface border border-line">
                    <div>
                      <div class="font-semibold text-foreground">{{ am.type }}</div>
                      <div class="text-xs text-muted">{{ am.reason }}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold font-mono text-foreground">{{ formatVnd(am.fee) }}</div>
                      <span class="px-1.5 py-0.5 rounded text-xs font-bold bg-surface-alt border border-line text-muted">
                        {{ am.status }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 sm:p-5 shadow-card text-foreground space-y-4">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
            Nhật Ký Kiểm Toán Tiến Trình
          </h2>
          <span class="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-mono text-xs font-bold">
            {{ order().statusHistories.length }} sự kiện
          </span>
        </div>

        @if (order().statusHistories.length === 0) {
          <div class="text-muted italic text-center py-8">
            Chưa có sự kiện chuyển trạng thái nào được ghi nhận.
          </div>
        } @else {
          <div class="space-y-4 pl-3 border-l-2 border-primary/40 max-h-[460px] overflow-y-auto pr-2">
            @for (event of order().statusHistories; track event.id) {
              <div class="relative pl-4 pb-2">
                <div class="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface"></div>
                <div class="text-xs text-muted font-mono tabular-nums">
                  {{ formatDate(event.occurredAt) }} - Người thao tác: <strong class="text-foreground">{{ event.actorName }}</strong>
                </div>
                <div class="font-bold text-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span class="px-1.5 py-0.5 rounded bg-surface-alt border border-line text-foreground text-xs">
                    {{ event.previousStatus }}
                  </span>
                  <span class="text-muted">&rarr;</span>
                  <span class="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary text-xs font-bold">
                    {{ event.nextStatus }}
                  </span>
                </div>
                @if (event.reason) {
                  <div class="text-muted mt-1 text-xs bg-surface-alt p-2 rounded border border-line">
                    Lý do / Nội dung: {{ event.reason }}
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class OrderTimelineHistoryComponent {
  readonly order = input.required<AdminOrderDetail>();

  paymentCharges(): NonNullable<AdminOrderDetail['payment']>['charges'] {
    return this.order().payment?.charges || [];
  }

  formatDate(dateInput: string | Date | undefined): string {
    if (!dateInput) {
      return '';
    }
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  formatVnd(amount: string | number | undefined | null): string {
    if (amount === undefined || amount === null) {
      return '0 ₫';
    }
    const num = typeof amount === 'number' ? amount : Number(amount);
    if (Number.isNaN(num)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
  }
}
