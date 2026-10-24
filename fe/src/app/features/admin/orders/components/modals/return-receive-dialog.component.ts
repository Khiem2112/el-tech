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
        <div class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs text-slate-200 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                Đối Soát & Nhập Lại Hàng Hoàn Vào Kho (MOD-15)
              </h3>
              <p class="text-xs text-slate-400">
                Quy trình: Đang chuyển hoàn sang Đã nhận hàng hoàn về kho
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="px-2 py-1 rounded bg-[#090d16] hover:bg-[#272f3d] text-slate-400 hover:text-white border border-[#272f3d] text-xs"
              title="Đóng hộp thoại"
            >
              Đóng
            </button>
          </div>

          <div class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 text-xs leading-relaxed space-y-1">
            <div class="font-bold text-emerald-200 uppercase tracking-wider">
              Khôi phục tồn kho thực tế (INV-022, ORD-025)
            </div>
            <p>
              Nhân viên kho xác nhận kiểm đếm đủ 100% linh kiện và số sê-ri còn nguyên vẹn. Hệ thống sẽ tự động tạo phiếu kho đảo ngược (ORDER_REVERSAL), cộng lại số lượng vào tồn thực tế onHand tại chi nhánh {{ order().fulfillmentBranch.name }} và chuyển trạng thái Serial sang AVAILABLE.
            </p>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            @if (isLoading()) {
              <div class="p-6 text-center bg-[#090d16] border border-[#272f3d] rounded text-slate-400">
                Đang tải danh sách linh kiện và số sê-ri đối soát hoàn kho...
              </div>
            } @else if (requirements(); as req) {
              <div class="space-y-1.5">
                <div class="font-semibold text-slate-300 uppercase">
                  Bảng kiểm đếm số lượng thực nhận lại theo SKU:
                </div>
                <div class="p-2.5 bg-[#090d16] rounded border border-[#272f3d] space-y-2">
                  @for (item of req.items; track item.skuId) {
                    <div class="flex items-center justify-between p-2 bg-[#161b26] rounded border border-[#272f3d]">
                      <div>
                        <div class="font-mono font-bold text-white">{{ item.skuCode }}</div>
                        <div class="text-[11px] text-slate-400">{{ item.name }}</div>
                      </div>
                      <div class="text-right">
                        <span class="font-mono font-bold text-emerald-400 text-xs">
                          Khớp {{ item.quantity }}/{{ item.quantity }}
                        </span>
                        <div class="text-[10px] text-slate-400">Đủ 100%</div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              @if (req.issuedSerials.length > 0) {
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-slate-300 uppercase">
                      Danh sách số Serial vật lý cần khôi phục:
                    </span>
                    <span class="font-mono text-[11px] text-emerald-400 font-bold">
                      {{ req.issuedSerials.length }} Serial
                    </span>
                  </div>

                  <div class="p-2.5 bg-[#090d16] rounded border border-[#272f3d] space-y-1.5">
                    @for (s of req.issuedSerials; track s.id) {
                      <div class="flex items-center justify-between p-2 bg-[#161b26] rounded border border-[#272f3d]">
                        <div class="flex items-center gap-2">
                          <span class="font-mono font-bold text-white">{{ s.serialNumber }}</span>
                          <span class="text-[10px] text-slate-400">({{ s.skuCode }})</span>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Khôi phục AVAILABLE
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }

              <div>
                <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                  Ghi chú biên bản kiểm đếm nhận hàng hoàn
                </label>
                <textarea
                  [(ngModel)]="note"
                  rows="2"
                  placeholder="Ghi nhận tình trạng niêm phong, ngoại quan kiện hàng khi nhận lại..."
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-emerald-400 resize-none"
                ></textarea>
              </div>
            }
          </div>

          @if (errorMessage()) {
            <div class="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#272f3d]">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSubmitting()"
              class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold text-xs rounded transition-colors disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || isLoading()"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              @if (isSubmitting()) {
                <span>Đang tạo phiếu đảo ngược kho...</span>
              } @else {
                <span>Xác Nhận Hàng Đã Về Kho (Cộng Tồn onHand)</span>
              }
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