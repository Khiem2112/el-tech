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
      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-white">
            Chứng Từ Hệ Thống Liên Quan
          </h2>
          <span class="px-2 py-0.5 rounded bg-[#272f3d] text-slate-300 font-mono text-[11px]">
            Hồ sơ kiểm toán
          </span>
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-200">Phiếu Di Chuyển Kho (Stock Moves):</span>
              <span class="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono text-[11px]">
                {{ order().stockMoves.length }} phiếu
              </span>
            </div>
            @if (order().stockMoves.length === 0) {
              <div class="text-slate-500 italic text-[11px]">Chưa phát sinh phiếu kho liên kết</div>
            } @else {
              <div class="space-y-1.5 pt-1">
                @for (move of order().stockMoves; track move.id) {
                  <div class="flex items-center justify-between p-2 rounded bg-[#161b26] border border-[#272f3d]/60">
                    <div>
                      <div class="font-mono font-bold text-[#76b900]">{{ move.code }}</div>
                      <div class="text-[11px] text-slate-400">Loại: {{ move.moveType }}</div>
                    </div>
                    <div class="text-right">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#272f3d] text-slate-200">
                        {{ move.status }}
                      </span>
                      <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                        {{ formatDate(move.createdAt) }}
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-200">Giao Dịch Cọc & Thanh Toán:</span>
              <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[11px]">
                {{ paymentCharges().length }} khoản thu
              </span>
            </div>
            @if (paymentCharges().length === 0) {
              <div class="text-slate-500 italic text-[11px]">Chưa có bản ghi giao dịch thu cọc</div>
            } @else {
              <div class="space-y-1.5 pt-1">
                @for (charge of paymentCharges(); track charge.id) {
                  <div class="flex items-center justify-between p-2 rounded bg-[#161b26] border border-[#272f3d]/60">
                    <div>
                      <div class="font-mono font-bold text-emerald-400">
                        {{ charge.providerReference || charge.id }}
                      </div>
                      <div class="text-[11px] text-slate-400">
                        Loại: {{ charge.chargeType }} | GD NH: {{ charge.providerTransactionId || 'Chưa ghi nhận' }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold font-mono text-white">{{ formatVnd(charge.expectedAmount) }}</div>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        {{ charge.status }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-200">Phụ Lục Đơn Hàng (Amendments):</span>
              <span class="px-2 py-0.5 rounded bg-[#272f3d] text-slate-300 font-mono text-[11px]">
                {{ order().amendments.length }} phụ lục
              </span>
            </div>
            @if (order().amendments.length === 0) {
              <div class="text-slate-500 italic text-[11px]">Chưa phát sinh phụ lục điều chỉnh</div>
            } @else {
              <div class="space-y-1.5 pt-1">
                @for (am of order().amendments; track am.id) {
                  <div class="flex items-center justify-between p-2 rounded bg-[#161b26] border border-[#272f3d]/60">
                    <div>
                      <div class="font-semibold text-slate-200">{{ am.type }}</div>
                      <div class="text-[11px] text-slate-400">{{ am.reason }}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold font-mono text-white">{{ formatVnd(am.fee) }}</div>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#272f3d] text-slate-300">
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

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-white">
            Nhật Ký Kiểm Toán Tiến Trình
          </h2>
          <span class="px-2 py-0.5 rounded bg-[#76b900]/15 text-[#76b900] font-mono text-[11px]">
            {{ order().statusHistories.length }} sự kiện
          </span>
        </div>

        @if (order().statusHistories.length === 0) {
          <div class="text-slate-500 italic text-center py-8">
            Chưa có sự kiện chuyển trạng thái nào được ghi nhận.
          </div>
        } @else {
          <div class="space-y-4 pl-3 border-l-2 border-[#76b900]/40 max-h-[460px] overflow-y-auto pr-2">
            @for (event of order().statusHistories; track event.id) {
              <div class="relative pl-4 pb-2">
                <div class="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#76b900] border-2 border-[#161b26]"></div>
                <div class="text-[11px] text-slate-400 font-mono tabular-nums">
                  {{ formatDate(event.occurredAt) }} - Người thao tác: <strong class="text-slate-200">{{ event.actorName }}</strong>
                </div>
                <div class="font-bold text-white mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span class="px-1.5 py-0.2 rounded bg-[#090d16] border border-[#272f3d] text-slate-300 text-[10px]">
                    {{ event.previousStatus }}
                  </span>
                  <span class="text-slate-500">&rarr;</span>
                  <span class="px-1.5 py-0.2 rounded bg-[#76b900]/20 border border-[#76b900]/40 text-[#76b900] text-[10px] font-bold">
                    {{ event.nextStatus }}
                  </span>
                </div>
                @if (event.reason) {
                  <div class="text-slate-400 mt-1 text-[11px] bg-[#090d16] p-2 rounded border border-[#272f3d]/60">
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
