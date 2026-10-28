import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, SelectOption } from '../../../../../components/atoms/select/select.component';
import {
  AdminOrderDetail,
  AdminOrderDetailService,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-delivery-failed-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-12" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-5 space-y-4 text-sm text-foreground flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Ghi Nhận Giao Hàng Thất Bại
              </h3>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-surface hover:bg-surface-alt text-muted hover:text-foreground border border-line text-xs transition-colors cursor-pointer"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block font-medium text-muted text-xs mb-1">
                Lý do giao thất bại:
              </label>
              <app-select
                [options]="reasonOptions"
                [value]="selectedReason"
                (valueChange)="selectedReason = $event"
                size="md"
                ariaLabel="Lý do giao hàng thất bại"
              />
            </div>

            @if (selectedReason === 'CUSTOM') {
              <div>
                <label class="block font-medium text-muted text-xs mb-1">
                  Nhập lý do cụ thể:
                </label>
                <input
                  type="text"
                  [(ngModel)]="customReason"
                  placeholder="Mô tả chi tiết lý do..."
                  class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary"
                />
              </div>
            }

            <div>
              <label class="block font-medium text-muted text-xs mb-1">
                Ghi chú từ shipper / hãng giao nhận:
              </label>
              <textarea
                [(ngModel)]="note"
                rows="2"
                placeholder="Ghi chú thời gian liên hệ, phản hồi của người nhận..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary resize-none"
              ></textarea>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground font-medium text-sm rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !effectiveReason()"
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ isSubmitting() ? 'Đang Ghi Nhận...' : 'Ghi Nhận Thất Bại' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DeliveryFailedDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input.required<boolean>();

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly reasonOptions: readonly SelectOption[] = [
    { value: 'Khách hàng không bắt máy sau 3 cuộc gọi', label: 'Khách hàng không bắt máy sau 3 cuộc gọi' },
    { value: 'Sai thông tin địa chỉ hoặc số điện thoại người nhận', label: 'Sai thông tin địa chỉ hoặc số điện thoại người nhận' },
    { value: 'Khách hàng từ chối nhận hàng tại thời điểm giao', label: 'Khách hàng từ chối nhận hàng tại thời điểm giao' },
    { value: 'Khách bận, xin hẹn lại ngày giao khác', label: 'Khách bận, xin hẹn lại ngày giao khác' },
    { value: 'CUSTOM', label: 'Lý do khác (nhập mô tả bên dưới)' },
  ];

  selectedReason = 'Khách hàng không bắt máy sau 3 cuộc gọi';
  customReason = '';
  note = '';

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.selectedReason = 'Khách hàng không bắt máy sau 3 cuộc gọi';
        this.customReason = '';
        this.note = '';
        this.errorMessage.set(null);
      }
    });
  }

  effectiveReason(): string {
    if (this.selectedReason === 'CUSTOM') {
      return this.customReason.trim();
    }
    return this.selectedReason;
  }

  onClose(): void {
    if (!this.isSubmitting()) {
      this.closed.emit();
    }
  }

  async onSubmit(): Promise<void> {
    const reason = this.effectiveReason();
    if (!reason) {
      this.errorMessage.set('Vui lòng chọn hoặc nhập lý do giao hàng không thành công.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.deliveryFailed(this.order().id, {
        reason,
        note: this.note.trim() || undefined,
      });
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the ghi nhan giao hang that bai';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}