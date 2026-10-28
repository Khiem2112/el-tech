import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
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
  imports: [CommonModule, FormsModule, ButtonDirective, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col z-10 text-xs text-foreground"
        >
          <div class="p-5 border-b border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Tạo Yêu Cầu Điều Chuyển Kho
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Điều chuyển linh kiện giữa các chi nhánh để cân bằng định mức tồn kho hoặc gom hàng
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1 rounded hover:bg-surface text-muted hover:text-foreground transition-colors border border-transparent hover:border-line"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              @if (errorMessage()) {
                <div class="p-3 bg-danger/10 border border-danger/30 rounded text-danger text-xs font-semibold">
                  {{ errorMessage() }}
                </div>
              }

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span class="block font-semibold text-muted text-xs uppercase mb-1">
                    Kho Xuất Hàng
                  </span>
                  <app-select
                    [options]="sourceBranchOptions()"
                    [value]="sourceBranchFilterId()"
                    (valueChange)="onSourceBranchSelect($event)"
                    [searchable]="true"
                    searchPlaceholder="Tìm kho xuất..."
                    size="md"
                  />
                </div>

                <div>
                  <span class="block font-semibold text-muted text-xs uppercase mb-1">
                    Kho Nhận Hàng
                  </span>
                  <app-select
                    [options]="destBranchOptions()"
                    [value]="destBranchFilterId()"
                    (valueChange)="onDestBranchSelect($event)"
                    [searchable]="true"
                    searchPlaceholder="Tìm kho nhận..."
                    size="md"
                  />
                </div>
              </div>

              <div>
                <label for="transfer-reason" class="block font-semibold text-muted text-xs uppercase mb-1">
                  Mục Đích / Ghi Chú Điều Chuyển
                </label>
                <input
                  id="transfer-reason"
                  type="text"
                  [ngModel]="reason()"
                  (ngModelChange)="reason.set($event)"
                  name="reason"
                  placeholder="Ví dụ: Bổ sung hàng cho chi nhánh phục vụ đơn Custom PC"
                  class="w-full h-9 px-3 bg-surface border border-line rounded text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-muted text-xs uppercase">
                      Danh Sách Linh Kiện Cần Chuyển
                    </span>
                    @if (draftLines().length > 0) {
                      <span class="px-2 py-0.5 rounded bg-surface-alt text-xs font-semibold text-foreground border border-line tabular">
                        {{ totalDraftUnits() }} chiếc ({{ draftLines().length }} SKU)
                      </span>
                    }
                  </div>
                  @if (eligibleSkus().length > 0) {
                    <button
                      type="button"
                      (click)="addLine()"
                      appButton
                      variant="secondary"
                      size="sm"
                      class="text-xs font-bold"
                    >
                      + Thêm linh kiện
                    </button>
                  }
                </div>

                @if (isLoadingSkus()) {
                  <div class="p-3 text-muted italic">Đang tải danh sách tồn kho khả dụng tại kho xuất...</div>
                } @else if (eligibleSkus().length === 0) {
                  <div class="p-4 bg-surface-alt border border-line rounded text-muted text-center">
                    Kho xuất hiện tại không có linh kiện nào có số lượng khả dụng dương.
                  </div>
                } @else if (draftLines().length === 0) {
                  <div class="p-4 bg-surface-alt border border-line rounded text-muted text-center">
                    Chưa có linh kiện nào được chọn. Nhấp "+ Thêm linh kiện" để chọn mặt hàng cần điều chuyển.
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (line of draftLines(); track $index) {
                      <div class="p-3 bg-surface-alt border border-line rounded flex items-center gap-3">
                        <div class="flex-1 min-w-0">
                          <app-select
                            [options]="skuOptions()"
                            [value]="String(line.skuId)"
                            (valueChange)="onLineSkuChange($index, +$event)"
                            [searchable]="true"
                            searchPlaceholder="Tìm linh kiện..."
                            size="sm"
                          />
                        </div>

                        <div class="w-28 flex-shrink-0">
                          <div class="flex items-center gap-1.5">
                            <span class="text-muted text-xs font-semibold">SL:</span>
                            <input
                              type="number"
                              min="1"
                              [max]="line.availableQuantity"
                              [ngModel]="line.quantity"
                              (ngModelChange)="onLineQuantityChange($index, $event)"
                              [name]="'lineQty_' + $index"
                              class="w-full h-8 px-2 bg-surface border border-line rounded text-center font-bold text-foreground text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          (click)="removeLine($index)"
                          appButton
                          variant="danger"
                          size="sm"
                          class="h-8 w-8 p-0"
                          title="Xóa dòng này"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2.25 2.25 0 0116.138 21H7.862a2.25 2.25 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <div class="p-4 border-t border-line flex items-center justify-between gap-3 flex-shrink-0 bg-surface-alt">
              <div class="text-sm text-muted tabular">
                @if (draftLines().length > 0) {
                  Tổng chuyển: <strong class="text-foreground font-bold">{{ totalDraftUnits() }} chiếc</strong>
                }
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="onCancel()"
                  appButton
                  variant="secondary"
                  size="sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  [disabled]="isSubmitting() || draftLines().length === 0"
                  appButton
                  variant="primary"
                  size="sm"
                >
                  @if (isSubmitting()) {
                    Đang lập phiếu...
                  } @else {
                    Xác nhận lập phiếu
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CreateTransferDialogComponent implements OnChanges {
  protected readonly String = String;
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

  readonly totalDraftUnits = computed(() =>
    this.draftLines().reduce((acc, line) => acc + (line.quantity || 0), 0),
  );

  readonly sourceBranchOptions = computed<SelectOption[]>(() =>
    this.branches().map((b) => ({
      value: String(b.id),
      label: `${b.code} - ${b.name}`,
    })),
  );

  readonly destBranchOptions = computed<SelectOption[]>(() =>
    this.branches().map((b) => ({
      value: String(b.id),
      label: `${b.code} - ${b.name}`,
    })),
  );

  readonly skuOptions = computed<SelectOption[]>(() =>
    this.eligibleSkus().map((item) => ({
      value: String(item.skuId),
      label: `${item.skuCode} - ${item.productName} (Khả dụng: ${item.availableQuantity})`,
    })),
  );

  readonly sourceBranchFilterId = computed(() =>
    this.sourceBranchId() ? String(this.sourceBranchId()) : '',
  );

  readonly destBranchFilterId = computed(() =>
    this.destinationBranchId() ? String(this.destinationBranchId()) : '',
  );

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

  onSourceBranchSelect(val: string): void {
    const id = Number(val);
    if (!isNaN(id) && id > 0) {
      void this.onSourceBranchChange(id);
    }
  }

  onDestBranchSelect(val: string): void {
    const id = Number(val);
    if (!isNaN(id) && id > 0) {
      this.destinationBranchId.set(id);
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
