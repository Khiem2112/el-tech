import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminTransferService,
  BranchOption,
  CreateTransferPayload,
  TransferDetail,
  TransferEligibleSku,
} from '../services/admin-transfer.service';

type TransferItemDraft = {
  skuId: number;
  quantity: number;
  availableQuantity: number;
  skuCode: string;
  productName: string;
  serialRequired: boolean;
};

@Component({
  selector: 'app-create-transfer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-[#090d16]/75 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col z-10 text-xs text-slate-200"
        >
          <div class="p-5 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded bg-[#090d16] border border-[#272f3d] text-[#76b900] font-mono text-[10px] font-bold">
                  MOD-24
                </span>
                <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                  Tạo Yêu Cầu Điều Chuyển Kho
                </h3>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Điều chuyển linh kiện giữa các chi nhánh để cân bằng định mức tồn kho hoặc gom hàng (TRF-001, TRF-002)
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              <div class="p-3 bg-amber-950/30 border border-amber-800/60 rounded text-amber-200 text-xs leading-relaxed">
                Kho xuất và kho nhận phải khác nhau. Số lượng điều chuyển không được vượt quá tồn khả dụng thực tế tại kho xuất.
              </div>

              @if (errorMessage()) {
                <div class="p-3 bg-rose-950/40 border border-rose-800/80 rounded text-rose-300 text-xs">
                  {{ errorMessage() }}
                </div>
              }

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="source-branch" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                    Kho Xuất Hàng
                  </label>
                  <select
                    id="source-branch"
                    [ngModel]="sourceBranchId()"
                    (ngModelChange)="onSourceBranchChange($event)"
                    name="sourceBranchId"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                  >
                    @for (b of branches(); track b.id) {
                      <option [value]="b.id">{{ b.code }} - {{ b.name }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label for="dest-branch" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                    Kho Nhận Hàng
                  </label>
                  <select
                    id="dest-branch"
                    [ngModel]="destinationBranchId()"
                    (ngModelChange)="destinationBranchId.set($event)"
                    name="destinationBranchId"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                  >
                    @for (b of branches(); track b.id) {
                      <option [value]="b.id">{{ b.code }} - {{ b.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div>
                <label for="transfer-reason" class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                  Mục Đích / Ghi Chú Điều Chuyển
                </label>
                <input
                  id="transfer-reason"
                  type="text"
                  [ngModel]="reason()"
                  (ngModelChange)="reason.set($event)"
                  name="reason"
                  placeholder="Ví dụ: Bổ sung hàng cho chi nhánh Hà Nội phục vụ đơn Custom PC"
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold text-slate-400 text-xs uppercase">
                    Danh Sách Linh Kiện Cần Chuyển
                  </span>
                  @if (eligibleSkus().length > 0) {
                    <button
                      type="button"
                      (click)="addLine()"
                      class="px-2.5 py-1 bg-[#161b26] hover:bg-[#272f3d] border border-[#76b900] text-[#76b900] font-bold text-xs rounded transition-colors"
                    >
                      + Thêm linh kiện
                    </button>
                  }
                </div>

                @if (isLoadingSkus()) {
                  <div class="p-3 text-slate-400 italic">Đang tải danh sách tồn kho khả dụng tại kho xuất...</div>
                } @else if (eligibleSkus().length === 0) {
                  <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded text-slate-400 text-center">
                    Kho xuất hiện tại không có linh kiện nào có số lượng khả dụng dương.
                  </div>
                } @else if (draftLines().length === 0) {
                  <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded text-slate-400 text-center">
                    Chưa có linh kiện nào được chọn. Nhấp "+ Thêm linh kiện" để chọn mặt hàng cần điều chuyển.
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (line of draftLines(); track $index) {
                      <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded flex items-center gap-3">
                        <div class="flex-1 min-w-0">
                          <select
                            [ngModel]="line.skuId"
                            (ngModelChange)="onLineSkuChange($index, $event)"
                            [name]="'lineSku_' + $index"
                            class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
                          >
                            @for (item of eligibleSkus(); track item.skuId) {
                              <option [value]="item.skuId">
                                {{ item.skuCode }} - {{ item.productName }} (Khả dụng: {{ item.availableQuantity }})
                              </option>
                            }
                          </select>
                        </div>

                        <div class="w-28 flex-shrink-0">
                          <div class="flex items-center gap-1.5">
                            <span class="text-slate-400 text-[11px]">SL:</span>
                            <input
                              type="number"
                              min="1"
                              [max]="line.availableQuantity"
                              [ngModel]="line.quantity"
                              (ngModelChange)="onLineQuantityChange($index, $event)"
                              [name]="'lineQty_' + $index"
                              class="w-full px-2 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-center font-bold text-white text-xs focus:outline-none focus:border-[#76b900]"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          (click)="removeLine($index)"
                          class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#272f3d] rounded transition-colors"
                          title="Xóa dòng này"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <div class="p-4 border-t border-[#272f3d] flex items-center justify-end gap-3 flex-shrink-0 bg-[#161b26]">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold text-xs rounded transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting() || draftLines().length === 0"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold text-xs rounded transition-colors shadow-sm"
              >
                @if (isSubmitting()) {
                  Đang lập phiếu...
                } @else {
                  Xác nhận lập phiếu
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CreateTransferDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() saved = new EventEmitter<TransferDetail>();
  @Output() closed = new EventEmitter<void>();

  private readonly transferService = inject(AdminTransferService);

  readonly branches = signal<BranchOption[]>([]);
  readonly sourceBranchId = signal<number | null>(null);
  readonly destinationBranchId = signal<number | null>(null);
  readonly reason = signal<string>('');
  readonly eligibleSkus = signal<TransferEligibleSku[]>([]);
  readonly draftLines = signal<TransferItemDraft[]>([]);
  readonly isLoadingSkus = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetState();
      this.initializeData();
    }
  }

  private resetState(): void {
    this.reason.set('');
    this.draftLines.set([]);
    this.errorMessage.set(null);
    this.isSubmitting.set(false);
  }

  private async initializeData(): Promise<void> {
    const list = await this.transferService.loadBranches();
    this.branches.set(list);

    if (list.length >= 2) {
      this.sourceBranchId.set(list[0].id);
      this.destinationBranchId.set(list[1].id);
      await this.loadSkusForSourceBranch(list[0].id);
    } else if (list.length === 1) {
      this.sourceBranchId.set(list[0].id);
      await this.loadSkusForSourceBranch(list[0].id);
    }
  }

  async onSourceBranchChange(newBranchId: number): Promise<void> {
    this.sourceBranchId.set(newBranchId);
    this.draftLines.set([]);
    await this.loadSkusForSourceBranch(newBranchId);
  }

  private async loadSkusForSourceBranch(branchId: number): Promise<void> {
    this.isLoadingSkus.set(true);
    try {
      const skus = await this.transferService.loadEligibleSkus(branchId);
      this.eligibleSkus.set(skus);
      if (skus.length > 0 && this.draftLines().length === 0) {
        this.draftLines.set([
          {
            skuId: skus[0].skuId,
            quantity: 1,
            availableQuantity: skus[0].availableQuantity,
            skuCode: skus[0].skuCode,
            productName: skus[0].productName,
            serialRequired: skus[0].serialRequired,
          },
        ]);
      }
    } finally {
      this.isLoadingSkus.set(false);
    }
  }

  addLine(): void {
    const skus = this.eligibleSkus();
    if (skus.length === 0) {
      return;
    }

    const usedSkuIds = new Set(this.draftLines().map((l) => l.skuId));
    const nextAvailable = skus.find((s) => !usedSkuIds.has(s.skuId)) ?? skus[0];

    this.draftLines.update((lines) => [
      ...lines,
      {
        skuId: nextAvailable.skuId,
        quantity: 1,
        availableQuantity: nextAvailable.availableQuantity,
        skuCode: nextAvailable.skuCode,
        productName: nextAvailable.productName,
        serialRequired: nextAvailable.serialRequired,
      },
    ]);
  }

  removeLine(index: number): void {
    this.draftLines.update((lines) => lines.filter((_, i) => i !== index));
  }

  onLineSkuChange(index: number, skuId: number): void {
    const matched = this.eligibleSkus().find((s) => s.skuId === Number(skuId));
    if (!matched) {
      return;
    }

    this.draftLines.update((lines) =>
      lines.map((item, idx) => {
        if (idx !== index) {
          return item;
        }
        return {
          skuId: matched.skuId,
          quantity: 1,
          availableQuantity: matched.availableQuantity,
          skuCode: matched.skuCode,
          productName: matched.productName,
          serialRequired: matched.serialRequired,
        };
      }),
    );
  }

  onLineQuantityChange(index: number, rawQty: number): void {
    const qty = Math.max(1, Number(rawQty) || 1);
    this.draftLines.update((lines) =>
      lines.map((item, idx) => {
        if (idx !== index) {
          return item;
        }
        const clamped = Math.min(qty, item.availableQuantity);
        return {
          ...item,
          quantity: clamped,
        };
      }),
    );
  }

  async onSubmit(): Promise<void> {
    const srcId = this.sourceBranchId();
    const dstId = this.destinationBranchId();

    if (!srcId || !dstId) {
      this.errorMessage.set('Vui lòng chọn cả chi nhánh xuất và chi nhánh nhận');
      return;
    }

    if (srcId === dstId) {
      this.errorMessage.set('Kho xuất và kho nhận phải khác nhau');
      return;
    }

    const lines = this.draftLines();
    if (lines.length === 0) {
      this.errorMessage.set('Vui lòng chọn ít nhất một linh kiện để điều chuyển');
      return;
    }

    for (const l of lines) {
      if (l.quantity <= 0) {
        this.errorMessage.set(`Số lượng linh kiện ${l.skuCode} phải lớn hơn 0`);
        return;
      }
      if (l.quantity > l.availableQuantity) {
        this.errorMessage.set(
          `Số lượng chuyển của ${l.skuCode} vượt quá tồn khả dụng (${l.quantity} > ${l.availableQuantity})`,
        );
        return;
      }
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload: CreateTransferPayload = {
      sourceBranchId: srcId,
      destinationBranchId: dstId,
      reason: this.reason().trim() || undefined,
      lines: lines.map((l) => ({
        skuId: l.skuId,
        quantity: l.quantity,
      })),
    };

    try {
      const created = await this.transferService.createTransfer(payload);
      this.saved.emit(created);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tạo phiếu điều chuyển';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.closed.emit();
  }
}
