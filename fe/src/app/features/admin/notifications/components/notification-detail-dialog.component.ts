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
        class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      ></div>

      <div
        class="relative bg-white border border-line rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-[13px] text-foreground overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-line px-6 py-4 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-foreground uppercase tracking-wide text-sm">
                Chi Tiết Thông Báo Outbox
              </h3>
            </div>
            <p class="text-xs text-muted mt-0.5">
              Theo dõi dữ liệu phát hành thông báo giao dịch transactional
            </p>
          </div>

          <button
            type="button"
            (click)="onClose()"
            class="p-1.5 rounded-md hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
            title="Đóng hộp thoại"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="p-4 bg-surface border border-line rounded-lg space-y-3">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-[11px] font-mono text-muted uppercase tracking-wider">
                  Sự kiện: {{ notification.eventType }}
                </div>
                <div class="font-bold text-foreground text-base mt-0.5">
                  {{ notification.title }}
                </div>
              </div>

              <div>
                @if (notification.status === 'SENT') {
                  <span class="inline-block px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    ĐÃ GỬI
                  </span>
                } @else if (notification.status === 'PENDING') {
                  <span class="inline-block px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                    CHỜ GỬI
                  </span>
                } @else {
                  <span class="inline-block px-2.5 py-1 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                    THẤT BẠI
                  </span>
                }
              </div>
            </div>

            <div class="pt-2">
              <div class="text-xs text-muted uppercase mb-1 font-semibold">Nội dung thông báo</div>
              <p class="text-foreground p-3 bg-white rounded border border-line text-[13px] whitespace-pre-wrap leading-relaxed">
                {{ notification.body }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-line text-xs">
              <div>
                <span class="text-muted">Người nhận:</span>
                <span class="font-semibold text-foreground ml-1">{{ notification.customer.name }}</span>
                <div class="text-muted text-[11px] mt-0.5">
                  {{ notification.customer.email }} - {{ notification.customer.phone }}
                </div>
              </div>

              <div>
                <span class="text-muted">Mã đơn hàng:</span>
                @if (notification.order) {
                  <span class="font-mono font-bold text-primary ml-1">{{ notification.order.code }}</span>
                } @else {
                  <span class="text-muted ml-1">Không gắn đơn hàng</span>
                }
                <div class="text-muted text-[11px] mt-0.5">
                  Khóa trùng lặp: <span class="font-mono text-foreground">{{ notification.deduplicationKey }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-2 border-t border-line text-xs">
              <span class="text-muted">Kênh phát:</span>
              <div class="flex items-center gap-1.5">
                @for (ch of notification.channels; track ch) {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-alt border border-line text-foreground uppercase">
                    {{ ch }}
                  </span>
                }
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div class="p-2.5 bg-surface border border-line rounded">
              <div class="text-muted text-[11px]">Thời điểm tạo</div>
              <div class="text-foreground font-semibold tabular-nums mt-0.5">
                {{ notification.createdAt | date: 'dd/MM/yyyy HH:mm:ss' }}
              </div>
            </div>

            <div class="p-2.5 bg-surface border border-line rounded">
              <div class="text-muted text-[11px]">Thời điểm xuất bản</div>
              <div class="text-foreground font-semibold tabular-nums mt-0.5">
                {{ notification.publishedAt ? (notification.publishedAt | date: 'dd/MM/yyyy HH:mm:ss') : 'Chưa xuất bản' }}
              </div>
            </div>

            <div class="p-2.5 bg-surface border border-line rounded">
              <div class="text-muted text-[11px]">Lần gửi cuối cùng</div>
              <div class="text-foreground font-semibold tabular-nums mt-0.5">
                {{ notification.lastDeliveryAt ? (notification.lastDeliveryAt | date: 'dd/MM/yyyy HH:mm:ss') : 'Chưa thực hiện' }}
              </div>
            </div>
          </div>

          @if (notification.lastDeliveryError) {
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              <div class="font-bold text-rose-800 uppercase mb-1">Chi tiết lỗi phát hành</div>
              <div class="font-mono text-[11px] whitespace-pre-wrap">{{ notification.lastDeliveryError }}</div>
            </div>
          }

          @if (notification.deliveryAttempts && notification.deliveryAttempts.length > 0) {
            <div>
              <div class="text-xs font-semibold text-muted uppercase mb-2">
                Lịch sử lần thử gửi ({{ notification.deliveryAttempts.length }} lần)
              </div>
              <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                @for (attempt of notification.deliveryAttempts; track $index) {
                  <div class="p-2 bg-surface border border-line rounded text-xs flex items-center justify-between">
                    <div>
                      <span class="font-bold text-foreground">{{ attempt.status || 'ATTEMPT' }}</span>
                      @if (attempt.channel) {
                        <span class="text-muted ml-2">qua {{ attempt.channel }}</span>
                      }
                      @if (attempt.error) {
                        <span class="text-rose-600 block text-[11px] mt-0.5">Lỗi: {{ attempt.error }}</span>
                      }
                    </div>
                    <span class="text-muted tabular-nums text-[11px]">
                      {{ attempt.attemptedAt ? (attempt.attemptedAt | date: 'dd/MM/yyyy HH:mm:ss') : '' }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          <div>
            <div class="text-xs font-semibold text-muted uppercase mb-1.5">Payload dữ liệu gốc</div>
            <pre class="p-3 bg-surface border border-line rounded-md text-[11px] font-mono text-foreground overflow-x-auto max-h-48">{{ formattedPayload() }}</pre>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-line bg-surface-alt/40 flex-shrink-0">
          <button
            type="button"
            (click)="onClose()"
            class="px-4 py-2 bg-surface-alt border border-line hover:bg-surface-alt/80 text-foreground rounded-md font-semibold text-[13px] transition-colors"
          >
            Đóng
          </button>

          <button
            type="button"
            (click)="onRetry()"
            [disabled]="isRetrying()"
            class="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-bold rounded-md text-[13px] shadow-xs transition-colors flex items-center gap-1.5"
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
