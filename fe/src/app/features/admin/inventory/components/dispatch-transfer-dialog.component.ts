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
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
import {
  AdminTransferService,
  DispatchTransferPayload,
  TransferDetail,
  TransferListItem,
} from '../services/admin-transfer.service';

type SkuSerialSelection = {
  skuId: number;
  skuCode: string;
  productName: string;
  quantity: number;
  serialRequired: boolean;
  availableSerials: string[];
  selectedSerials: string[];
  isLoadingSerials: boolean;
};

@Component({
  selector: 'app-dispatch-transfer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen && transfer) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col z-10 text-xs text-foreground"
        >
          <div class="p-5 border-b border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            <div>
              <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                Xuất Kho Điều Chuyển
              </h3>
              <p class="text-xs text-muted mt-0.5">
                Phiếu: <strong class="text-foreground font-mono">{{ transfer.code }}</strong> - Xuất từ {{ transfer.sourceBranchName }} đi {{ transfer.destinationBranchName }}
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

              <div class="space-y-4">
                @for (item of serialGroups(); track item.skuId) {
                  <div class="p-3.5 bg-surface-alt border border-line rounded space-y-2.5">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="font-bold text-foreground">{{ item.productName }}</div>
                        <div class="text-[11px] font-mono text-muted">SKU: {{ item.skuCode }} - Số lượng xuất: <strong class="text-foreground">{{ item.quantity }} chiếc</strong></div>
                      </div>
                      @if (item.serialRequired) {
                        <span class="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-warning font-mono text-[10px] font-bold">
                          Đã chọn: {{ item.selectedSerials.length }} / {{ item.quantity }}
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded bg-surface border border-line text-muted text-[10px]">
                          Không quản lý sê-ri
                        </span>
                      }
                    </div>

                    @if (item.serialRequired) {
                      @if (item.isLoadingSerials) {
                        <div class="text-muted italic py-1">Đang nạp danh sách mã sê-ri khả dụng tại kho...</div>
                      } @else if (item.availableSerials.length === 0) {
                        <div class="p-2.5 bg-danger/10 border border-danger/30 rounded text-danger text-xs font-semibold">
                          Cảnh báo: Không tìm thấy sê-ri nào ở trạng thái khả dụng tại kho xuất.
                        </div>
                      } @else {
                        <div class="space-y-1.5 pt-1">
                          <div class="flex items-center justify-between">
                            <label class="block text-muted text-[11px] font-semibold uppercase">
                              Chọn danh sách sê-ri xuất kho:
                            </label>
                            <button
                              type="button"
                              (click)="autoSelectSerials(item.skuId)"
                              class="text-[11px] text-primary-strong hover:underline font-semibold"
                            >
                              Chọn đủ {{ item.quantity }} sê-ri
                            </button>
                          </div>
                          <div class="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-surface border border-line rounded">
                            @for (serial of item.availableSerials; track serial) {
                              <label class="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-surface-alt text-foreground">
                                <input
                                  type="checkbox"
                                  [checked]="item.selectedSerials.includes(serial)"
                                  (change)="toggleSerial(item.skuId, serial)"
                                  class="accent-primary rounded"
                                />
                                <span class="font-mono text-[11px] font-bold text-foreground">{{ serial }}</span>
                              </label>
                            }
                          </div>
                        </div>
                      }
                    }
                  </div>
                }
              </div>
            </div>

            <div class="p-4 border-t border-line flex items-center justify-end gap-3 flex-shrink-0 bg-surface-alt">
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
                [disabled]="isSubmitting() || !isReadyToDispatch()"
                appButton
                variant="primary"
                size="sm"
              >
                @if (isSubmitting()) {
                  Đang xuất kho...
                } @else {
                  Xác nhận xuất kho
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class DispatchTransferDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() transfer: TransferListItem | null = null;
  @Output() dispatched = new EventEmitter<TransferDetail>();
  @Output() closed = new EventEmitter<void>();

  private readonly transferService = inject(AdminTransferService);

  readonly serialGroups = signal<SkuSerialSelection[]>([]);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.transfer) {
      this.initializeGroups();
    }
  }

  private async initializeGroups(): Promise<void> {
    if (!this.transfer) {
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(false);

    const groups: SkuSerialSelection[] = this.transfer.lines.map((l) => ({
      skuId: l.skuId,
      skuCode: l.skuCode,
      productName: l.productName,
      quantity: l.quantity,
      serialRequired: l.serialRequired,
      availableSerials: [],
      selectedSerials: [],
      isLoadingSerials: l.serialRequired,
    }));

    this.serialGroups.set(groups);

    for (const grp of groups) {
      if (grp.serialRequired) {
        try {
          const serials = await this.transferService.loadAvailableSerials(
            this.transfer.id,
            grp.skuId,
          );
          this.serialGroups.update((current) =>
            current.map((item) =>
              item.skuId === grp.skuId
                ? {
                    ...item,
                    availableSerials: serials,
                    selectedSerials: serials.slice(0, item.quantity),
                    isLoadingSerials: false,
                  }
                : item,
            ),
          );
        } catch {
          this.serialGroups.update((current) =>
            current.map((item) =>
              item.skuId === grp.skuId
                ? {
                    ...item,
                    availableSerials: [],
                    selectedSerials: [],
                    isLoadingSerials: false,
                  }
                : item,
            ),
          );
        }
      }
    }
  }

  toggleSerial(skuId: number, serial: string): void {
    this.serialGroups.update((groups) =>
      groups.map((g) => {
        if (g.skuId !== skuId) {
          return g;
        }
        const exists = g.selectedSerials.includes(serial);
        let updated: string[];
        if (exists) {
          updated = g.selectedSerials.filter((s) => s !== serial);
        } else {
          if (g.selectedSerials.length >= g.quantity) {
            return g;
          }
          updated = [...g.selectedSerials, serial];
        }
        return { ...g, selectedSerials: updated };
      }),
    );
  }

  autoSelectSerials(skuId: number): void {
    this.serialGroups.update((groups) =>
      groups.map((g) => {
        if (g.skuId !== skuId) {
          return g;
        }
        return {
          ...g,
          selectedSerials: g.availableSerials.slice(0, g.quantity),
        };
      }),
    );
  }

  isReadyToDispatch(): boolean {
    const groups = this.serialGroups();
    if (!groups.length) {
      return false;
    }
    return groups.every((g) => {
      if (!g.serialRequired) {
        return true;
      }
      return g.selectedSerials.length === g.quantity;
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.transfer || !this.isReadyToDispatch()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload: DispatchTransferPayload = {
      lines: this.serialGroups().map((g) => ({
        skuId: g.skuId,
        serialNumbers: g.serialRequired ? g.selectedSerials : undefined,
      })),
    };

    try {
      const updated = await this.transferService.dispatchTransfer(this.transfer.id, payload);
      this.dispatched.emit(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xuất kho thất bại';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.closed.emit();
  }
}
