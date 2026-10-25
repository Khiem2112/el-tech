import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import {
  AdminNotificationItem,
  AdminNotificationService,
} from '../services/admin-notification.service';

@Component({
  selector: 'app-notification-detail-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        (click)="onClose()"
        class="fixed inset-0 bg-[#090d16]/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      ></div>

      <div
        class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-sm overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-[#272f3d] px-6 py-4 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-white uppercase tracking-wide">
                Chi Tiết Thông Báo Outbox
              </h3>
              <span class="text-[10px] font-mono bg-[#090d16] text-[#76b900] border border-[#272f3d] px-2 py-0.5 rounded">
                SCR-30
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              Theo dõi dữ liệu phát hành thông báo giao dịch transactional
            </p>
          </div>

          <button
            type="button"
            (click)="onClose()"
            class="p-1.5 rounded-md hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
            title="Đóng hộp thoại"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded-lg space-y-3">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Sự kiện: {{ notification.eventType }}
                </div>
                <div class="font-bold text-white text-base mt-0.5">
                  {{ notification.title }}
                </div>
              </div>

              <div>
                @if (notification.status === 'SENT') {
                  <span class="inline-block px-2.5 py-1 rounded text-xs font-bold bg-[#76b900]/20 text-[#88d400] border border-[#76b900]/30 uppercase">
                    ĐÃ GỬI
                  </span>
                } @else if (notification.status === 'PENDING') {
                  <span class="inline-block px-2.5 py-1 rounded text-xs font-bold bg-amber-950/40 text-amber-300 border border-amber-800/40 uppercase">
                    CHỜ GỬI
                  </span>
                } @else {
                  <span class="inline-block px-2.5 py-1 rounded text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-800/40 uppercase">
                    THẤT BẠI
                  </span>
                }
              </div>
            </div>

            <div class="pt-2">
              <div class="text-xs text-slate-400 uppercase mb-1 font-semibold">Nội dung thông báo</div>
              <p class="text-slate-100 p-3 bg-[#161b26] rounded border border-[#272f3d] text-xs whitespace-pre-wrap leading-relaxed">
                {{ notification.body }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#272f3d]/60 text-xs">
              <div>
                <span class="text-slate-400">Người nhận:</span>
                <span class="font-semibold text-slate-200 ml-1">{{ notification.customer.name }}</span>
                <div class="text-slate-400 text-[11px] mt-0.5">
                  {{ notification.customer.email }} - {{ notification.customer.phone }}
                </div>
              </div>

              <div>
                <span class="text-slate-400">Mã đơn hàng:</span>
                @if (notification.order) {
                  <span class="font-mono font-bold text-[#76b900] ml-1">{{ notification.order.code }}</span>
                } @else {
                  <span class="text-slate-500 ml-1">Không gắn đơn hàng</span>
                }
                <div class="text-slate-400 text-[11px] mt-0.5">
                  Khóa trùng lặp: <span class="font-mono text-slate-300">{{ notification.deduplicationKey }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-2 border-t border-[#272f3d]/60 text-xs">
              <span class="text-slate-400">Kênh phát:</span>
              <div class="flex items-center gap-1.5">
                @for (ch of notification.channels; track ch) {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#161b26] border border-[#272f3d] text-slate-200 uppercase">
                    {{ ch }}
                  </span>
                }
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded">
              <div class="text-slate-400 text-[11px]">Thời điểm tạo</div>
              <div class="text-slate-200 font-semibold tabular-nums mt-0.5">
                {{ notification.createdAt | date: 'dd/MM/yyyy HH:mm:ss' }}
              </div>
            </div>

            <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded">
              <div class="text-slate-400 text-[11px]">Thời điểm xuất bản</div>
              <div class="text-slate-200 font-semibold tabular-nums mt-0.5">
                {{ notification.publishedAt ? (notification.publishedAt | date: 'dd/MM/yyyy HH:mm:ss') : 'Chưa xuất bản' }}
              </div>
            </div>

            <div class="p-2.5 bg-[#090d16] border border-[#272f3d] rounded">
              <div class="text-slate-400 text-[11px]">Lần gửi cuối cùng</div>
              <div class="text-slate-200 font-semibold tabular-nums mt-0.5">
                {{ notification.lastDeliveryAt ? (notification.lastDeliveryAt | date: 'dd/MM/yyyy HH:mm:ss') : 'Chưa thực hiện' }}
              </div>
            </div>
          </div>

          @if (notification.lastDeliveryError) {
            <div class="p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-rose-300 text-xs">
              <div class="font-bold text-rose-200 uppercase mb-1">Chi tiết lỗi phát hành</div>
              <div class="font-mono text-[11px] whitespace-pre-wrap">{{ notification.lastDeliveryError }}</div>
            </div>
          }

          @if (notification.deliveryAttempts && notification.deliveryAttempts.length > 0) {
            <div>
              <div class="text-xs font-semibold text-slate-400 uppercase mb-2">
                Lịch sử lần thử gửi ({{ notification.deliveryAttempts.length }} lần)
              </div>
              <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                @for (attempt of notification.deliveryAttempts; track $index) {
                  <div class="p-2 bg-[#090d16] border border-[#272f3d] rounded text-xs flex items-center justify-between">
                    <div>
                      <span class="font-bold text-slate-200">{{ attempt.status || 'ATTEMPT' }}</span>
                      @if (attempt.channel) {
                        <span class="text-slate-400 ml-2">qua {{ attempt.channel }}</span>
                      }
                      @if (attempt.error) {
                        <span class="text-rose-400 block text-[11px] mt-0.5">Lỗi: {{ attempt.error }}</span>
                      }
                    </div>
                    <span class="text-slate-500 tabular-nums text-[11px]">
                      {{ attempt.attemptedAt ? (attempt.attemptedAt | date: 'dd/MM/yyyy HH:mm:ss') : '' }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          <div>
            <div class="text-xs font-semibold text-slate-400 uppercase mb-1.5">Payload dữ liệu gốc</div>
            <pre class="p-3 bg-[#090d16] border border-[#272f3d] rounded-md text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">{{ formattedPayload() }}</pre>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#272f3d] bg-[#090d16] flex-shrink-0">
          <button
            type="button"
            (click)="onClose()"
            class="px-4 py-2 bg-[#161b26] border border-[#272f3d] hover:bg-[#272f3d] text-slate-300 hover:text-white rounded-md font-semibold text-xs transition-colors"
          >
            Đóng
          </button>

          <button
            type="button"
            (click)="onRetry()"
            [disabled]="isRetrying()"
            class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:opacity-50 text-[#090d16] font-bold rounded-md text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            @if (isRetrying()) {
              <span>Đang gửi lại...</span>
            } @else {
              <span>Thử Lại Gửi Thông Báo</span>
            }
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDetailDialogComponent {
  @Input({ required: true }) notification!: AdminNotificationItem;
  @Output() closed = new EventEmitter<void>();
  @Output() retried = new EventEmitter<AdminNotificationItem>();

  private readonly notificationService = inject(AdminNotificationService);
  readonly isRetrying = signal<boolean>(false);

  formattedPayload(): string {
    return JSON.stringify(this.notification.payload, null, 2);
  }

  onClose(): void {
    this.closed.emit();
  }

  async onRetry(): Promise<void> {
    this.isRetrying.set(true);
    try {
      const updated = await this.notificationService.retryNotification(this.notification.id);
      this.retried.emit(updated);
    } catch {
      // Handled in parent
    } finally {
      this.isRetrying.set(false);
    }
  }
}
