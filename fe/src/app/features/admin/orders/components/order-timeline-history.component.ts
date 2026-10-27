import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AdminOrderDetail } from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-timeline-history',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
      <div class="bg-surface border border-line rounded-lg p-4 text-foreground space-y-4">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-muted">
            Chứng Từ & Bút Toán Liên Quan
          </h2>
          <span class="px-2 py-0.5 rounded bg-surface-alt border border-line text-muted font-mono text-[11px]">
            Hồ sơ kiểm toán
          </span>
        </div>

        <div class="space-y-3">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-foreground">Phiếu Di Chuyển Kho (Stock Moves):</span>
              <span class="font-mono text-[11px] text-muted">{{ order().stockMoves.length }} phiếu</span>
            </div>
            @if (order().stockMoves.length === 0) {
              <div class="text-muted text-[11px] py-1">Chưa phát sinh phiếu kho liên kết</div>
            } @else {
              <div class="space-y-1">
                @for (move of order().stockMoves; track move.id) {
                  <div class="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface-alt border border-line">
                    <div>
                      <div class="font-mono font-semibold text-foreground text-xs">{{ move.code }}</div>
                      <div class="text-[11px] text-muted">Loại: {{ move.moveType }}</div>
                    </div>
                    <div class="text-right">
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-surface border border-line text-foreground">
                        {{ move.status }}
                      </span>
                      <div class="text-[11px] text-muted font-mono tabular-nums mt-0.5">
                        {{ formatDate(move.createdAt) }}
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="space-y-1.5 pt-2 border-t border-line">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-foreground">Giao Dịch Thanh Toán & Cọc:</span>
              <span class="font-mono text-[11px] text-muted">{{ paymentCharges().length }} khoản</span>
            </div>
            @if (paymentCharges().length === 0) {
              <div class="text-muted text-[11px] py-1">Chưa có bản ghi giao dịch thu tiền</div>
            } @else {
              <div class="space-y-1">
                @for (charge of paymentCharges(); track charge.id) {
                  <div class="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface-alt border border-line">
                    <div>
                      <div class="font-mono font-semibold text-foreground text-xs">
                        {{ charge.providerReference || charge.id }}
                      </div>
                      <div class="text-[11px] text-muted">
                        {{ charge.chargeType }} | GD NH: {{ charge.providerTransactionId || '-' }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-medium font-mono tabular-nums text-foreground">{{ formatVnd(charge.expectedAmount) }}</div>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-surface border border-line text-foreground">
                        {{ charge.status }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="space-y-1.5 pt-2 border-t border-line">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-foreground">Phụ Lục Đơn Hàng (Amendments):</span>
              <span class="font-mono text-[11px] text-muted">{{ order().amendments.length }} phụ lục</span>
            </div>
            @if (order().amendments.length === 0) {
              <div class="text-muted text-[11px] py-1">Không có phụ lục điều chỉnh</div>
            } @else {
              <div class="space-y-1">
                @for (am of order().amendments; track am.id) {
                  <div class="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface-alt border border-line">
                    <div>
                      <div class="font-medium text-foreground text-xs">{{ am.type }}</div>
                      <div class="text-[11px] text-muted truncate max-w-[200px]">{{ am.reason }}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-mono tabular-nums font-medium text-foreground">{{ formatVnd(am.fee) }}</div>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-surface border border-line text-muted">
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

      <div class="bg-surface border border-line rounded-lg p-4 text-foreground space-y-4">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-muted">
            Nhật Ký Tiến Trình Đơn Hàng
          </h2>
          <span class="px-2 py-0.5 rounded bg-surface-alt border border-line text-muted font-mono text-[11px] tabular-nums">
            {{ order().statusHistories.length }} sự kiện
          </span>
        </div>

        @if (order().statusHistories.length === 0) {
          <div class="text-muted italic text-center py-6 text-xs">
            Chưa có sự kiện chuyển trạng thái nào được ghi nhận.
          </div>
        } @else {
          <div class="space-y-2.5 pl-3 border-l border-line max-h-[420px] overflow-y-auto pr-1">
            @for (event of order().statusHistories; track event.id) {
              <div class="relative pl-3 pb-1">
                <div class="absolute -left-[16px] top-1.5 w-1.5 h-1.5 rounded-full bg-primary"></div>
                <div class="text-[11px] text-muted font-mono tabular-nums">
                  {{ formatDate(event.occurredAt) }} &bull; {{ event.actorName }}
                </div>
                <div class="font-medium text-foreground mt-0.5 flex items-center gap-1.5 flex-wrap text-xs">
                  <span class="font-mono text-[11px] text-muted">{{ event.previousStatus }}</span>
                  <span class="text-muted/60">&rarr;</span>
                  <span class="font-mono text-[11px] text-foreground font-semibold">{{ event.nextStatus }}</span>
                </div>
                @if (event.reason) {
                  <div class="text-muted mt-0.5 text-[11px] italic">
                    {{ event.reason }}
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
