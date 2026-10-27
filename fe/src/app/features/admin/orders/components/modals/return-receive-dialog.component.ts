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
import {
  AdminOrderDetail,
  AdminOrderDetailService,
  ReturnRequirementsResult,
} from '../../services/admin-order-detail.service';

@Component({
  selector: 'app-return-receive-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div data-modal-id="MOD-15" class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-lg p-5 space-y-4 text-xs text-foreground max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Nhập Lại Hàng Hoàn Vào Kho
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

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            @if (isLoading()) {
              <div class="p-4 text-center bg-surface-alt border border-line rounded text-muted">
                Đang tải danh sách linh kiện và số sê-ri đối soát hoàn kho...
              </div>
            } @else if (requirements(); as req) {
              <div class="space-y-1.5">
                <div class="font-medium text-foreground">
                  Kiểm đếm thực nhận lại theo SKU:
                </div>
                <div class="p-2 bg-surface-alt rounded border border-line space-y-1.5">
                  @for (item of req.items; track item.skuId) {
                    <div class="flex items-center justify-between p-2 bg-surface rounded border border-line">
                      <div>
                        <div class="font-mono font-medium text-foreground text-xs">{{ item.skuCode }}</div>
                        <div class="text-[11px] text-muted">{{ item.name }}</div>
                      </div>
                      <div class="text-right">
                        <span class="font-mono font-medium text-emerald-600 dark:text-emerald-400 text-xs tabular-nums">
                          Khớp {{ item.quantity }}/{{ item.quantity }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              @if (req.issuedSerials.length > 0) {
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-foreground">
                      Số Serial khôi phục về kho:
                    </span>
                    <span class="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                      {{ req.issuedSerials.length }} Serial
                    </span>
                  </div>

                  <div class="p-2 bg-surface-alt rounded border border-line space-y-1">
                    @for (s of req.issuedSerials; track s.id) {
                      <div class="flex items-center justify-between p-1.5 bg-surface rounded border border-line text-xs">
                        <div class="flex items-center gap-2">
                          <span class="font-mono font-medium text-foreground">{{ s.serialNumber }}</span>
                          <span class="text-[11px] text-muted">({{ s.skuCode }})</span>
                        </div>
                        <span class="px-1.5 py-0.2 rounded text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          Khôi phục
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }

              <div>
                <label class="block font-medium text-muted text-xs mb-1">
                  Ghi chú kiểm đếm hoàn kho:
                </label>
                <textarea
                  [(ngModel)]="note"
                  rows="2"
                  placeholder="Ghi nhận tình trạng ngoại quan kiện hàng..."
                  class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>
            }
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
              class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground font-medium text-xs rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || isLoading()"
              class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs rounded transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ isSubmitting() ? 'Đang Xử Lý...' : 'Xác Nhận Hàng Đã Về Kho' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ReturnReceiveDialogComponent {
  private readonly detailService = inject(AdminOrderDetailService);

  readonly order = input.required<AdminOrderDetail>();
  readonly isOpen = input.required<boolean>();

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  note = '';

  readonly requirements = signal<ReturnRequirementsResult | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.note = '';
        this.errorMessage.set(null);
        this.loadRequirements();
      }
    });
  }

  async loadRequirements(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await this.detailService.getReturnRequirements(this.order().id);
      this.requirements.set(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Loi khi tai danh sach hang doi soat';
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  onClose(): void {
    if (!this.isSubmitting()) {
      this.closed.emit();
    }
  }

  async onSubmit(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.detailService.receiveReturn(this.order().id, {
        note: this.note.trim() || undefined,
      });
      this.confirmed.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khong the xac nhan nhan hang hoan ve kho';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}