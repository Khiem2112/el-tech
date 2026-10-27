import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminOrderDetail, AdminOrderDetailService } from '../services/admin-order-detail.service';

@Component({
  selector: 'app-order-buyer-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-surface border border-line rounded-lg p-4 text-foreground space-y-3">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-muted">
            Người Nhận & Địa Chỉ Giao Hàng
          </h2>
          <span class="px-2 py-0.5 rounded bg-surface-alt border border-line text-muted font-mono text-[11px]">
            Thông tin đơn
          </span>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-muted">Họ tên:</span>
            <span class="font-medium text-foreground">{{ order().receiverName }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-muted">Số điện thoại:</span>
            <div class="flex items-center gap-2">
              <span class="font-mono text-foreground font-medium tabular-nums">{{ order().receiverPhone }}</span>
              <a
                [href]="'tel:' + order().receiverPhone"
                class="px-2 py-0.5 bg-surface-alt border border-line hover:bg-surface text-foreground rounded text-[11px] transition-colors"
              >
                Gọi
              </a>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-muted">Email:</span>
            <span class="font-mono text-foreground text-xs truncate max-w-[240px]">{{ order().receiverEmail }}</span>
          </div>

          <div class="pt-1 border-t border-line">
            <span class="text-muted block mb-0.5">Địa chỉ nhận hàng:</span>
            <div class="text-foreground leading-relaxed">{{ order().receiverAddress }}</div>
          </div>

          @if (order().customerNotes) {
            <div class="pt-1 border-t border-line">
              <span class="text-muted block mb-0.5">Ghi chú của khách:</span>
              <div class="text-foreground italic bg-surface-alt/50 p-2 rounded border border-line">{{ order().customerNotes }}</div>
            </div>
          }
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 text-foreground space-y-3">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-muted">
            Vận Chuyển & Ghi Chú Nội Bộ
          </h2>
          <span class="px-2 py-0.5 rounded text-[11px] font-mono border"
            [class.bg-surface-elevated]="order().fulfillmentMethod === 'DELIVERY'"
            [class.text-primary]="order().fulfillmentMethod === 'DELIVERY'"
            [class.border-primary/20]="order().fulfillmentMethod === 'DELIVERY'"
            [class.bg-surface-alt]="order().fulfillmentMethod === 'PICKUP'"
            [class.text-foreground]="order().fulfillmentMethod === 'PICKUP'"
            [class.border-line]="order().fulfillmentMethod === 'PICKUP'"
          >
            {{ order().fulfillmentMethod === 'DELIVERY' ? 'GIAO TẬN NƠI' : 'NHẬN TẠI QUẦY' }}
          </span>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-muted">Chi nhánh xuất hàng:</span>
            <span class="font-medium text-foreground">{{ order().fulfillmentBranch.name }} ({{ order().fulfillmentBranch.code }})</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-muted">Đơn vị vận chuyển:</span>
            <span class="text-foreground">{{ order().shippingCarrier || 'Đội xe nội bộ / GHN' }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-muted">Mã vận đơn:</span>
            <span class="font-mono text-foreground font-medium tabular-nums">{{ order().trackingCode || ('TRACK-' + order().code) }}</span>
          </div>

          @if (order().redeliveryAttemptCount > 0) {
            <div class="flex items-center justify-between">
              <span class="text-muted">Lần hẹn giao lại:</span>
              <span class="font-mono font-medium text-foreground tabular-nums">{{ order().redeliveryAttemptCount }} / 2</span>
            </div>
          }

          <div class="pt-2 border-t border-line space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="admin-internal-note-input" class="text-muted font-medium">Ghi chú nội bộ admin:</label>
              <button
                type="button"
                (click)="onSaveInternalNotes()"
                [disabled]="detailService.isSavingNotes()"
                class="text-[11px] px-2 py-0.5 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity"
              >
                {{ detailService.isSavingNotes() ? 'Đang lưu...' : 'Lưu ghi chú' }}
              </button>
            </div>
            <textarea
              id="admin-internal-note-input"
              rows="2"
              [(ngModel)]="internalNotesInput"
              placeholder="Ghi chú nội bộ cho kỹ thuật và điều phối viên..."
              class="w-full px-2.5 py-1.5 bg-surface border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary resize-none"
            ></textarea>
            @if (saveSuccessMessage()) {
              <div class="text-[11px] text-primary font-medium">{{ saveSuccessMessage() }}</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrderBuyerSectionComponent {
  readonly order = input.required<AdminOrderDetail>();

  readonly detailService = inject(AdminOrderDetailService);

  internalNotesInput = '';
  readonly saveSuccessMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.internalNotesInput = this.order().internalNotes || '';
    });
  }

  async onSaveInternalNotes(): Promise<void> {
    const success = await this.detailService.updateNotes(this.order().id, {
      internalNotes: this.internalNotesInput,
    });
    if (success) {
      this.saveSuccessMessage.set('Đã lưu ghi chú nội bộ thành công');
      setTimeout(() => this.saveSuccessMessage.set(null), 3000);
    }
  }
}
