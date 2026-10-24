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
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen && transfer) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-[#090d16]/75 backdrop-blur-sm transition-opacity"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col z-10 text-xs text-slate-200"
        >
          <div class="p-5 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded bg-[#090d16] border border-[#272f3d] text-[#76b900] font-mono text-[10px] font-bold">
                  MOD-25
                </span>
                <h3 class="font-bold text-white uppercase text-sm tracking-wide">
                  Xuất Kho Điều Chuyển (Dispatch)
                </h3>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Phiếu: <strong class="text-white font-mono">{{ transfer.code }}</strong> - Xuất từ {{ transfer.sourceBranchName }} đi {{ transfer.destinationBranchName }}
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
              <div class="p-3 bg-blue-950/30 border border-blue-800/60 rounded text-blue-200 text-xs leading-relaxed">
                Giảm tồn kho thực tế tại kho xuất, ghi nhận nhật ký TRANSFER_OUT, chuyển sê-ri sang trạng thái đang vận chuyển (IN_TRANSIT) và cập nhật phiếu sang Đang chuyển.
              </div>

              @if (errorMessage()) {
                <div class="p-3 bg-rose-950/40 border border-rose-800/80 rounded text-rose-300 text-xs">
                  {{ errorMessage() }}
                </div>
              }

              <div class="space-y-4">
                @for (item of serialGroups(); track item.skuId) {
                  <div class="p-3.5 bg-[#090d16] border border-[#272f3d] rounded space-y-2.5">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="font-bold text-white">{{ item.productName }}</div>
                        <div class="text-[11px] font-mono text-slate-400">SKU: {{ item.skuCode }} - Số lượng xuất: {{ item.quantity }} chiếc</div>
                      </div>
                      @if (item.serialRequired) {
                        <span class="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 font-mono text-[10px]">
                          Cần {{ item.quantity }} Sê-ri (Đã chọn: {{ item.selectedSerials.length }})
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">
                          Không quản lý sê-ri
                        </span>
                      }
                    </div>

                    @if (item.serialRequired) {
                      @if (item.isLoadingSerials) {
                        <div class="text-slate-400 italic py-1">Đang nạp danh sách mã sê-ri khả dụng tại kho...</div>
                      } @else if (item.availableSerials.length === 0) {
                        <div class="p-2.5 bg-rose-950/30 border border-rose-900 rounded text-rose-300 text-xs">
                          Cảnh báo: Không tìm thấy sê-ri nào ở trạng thái khả dụng tại kho xuất.
                        </div>
                      } @else {
                        <div class="space-y-1.5 pt-1">
                          <label class="block text-slate-400 text-[11px] font-semibold uppercase">
                            Chọn danh sách sê-ri xuất kho:
                          </label>
                          <div class="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-[#161b26] border border-[#272f3d] rounded">
                            @for (serial of item.availableSerials; track serial) {
                              <label class="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-[#090d16] text-slate-300">
                                <input
                                  type="checkbox"
                                  [checked]="item.selectedSerials.includes(serial)"
                                  (change)="toggleSerial(item.skuId, serial)"
                                  class="accent-[#76b900] rounded"
                                />
                                <span class="font-mono text-[11px] font-bold text-white">{{ serial }}</span>
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
                [disabled]="isSubmitting() || !isReadyToDispatch()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold text-xs rounded transition-colors shadow-sm"
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

    for (const group of groups) {
      if (group.serialRequired) {
        try {
          const serials = await this.transferService.loadAvailableSerials(this.transfer.id, group.skuId);
          const autoSelected = serials.slice(0, group.quantity);
          this.serialGroups.update((current) =>
            current.map((g) => {
              if (g.skuId !== group.skuId) {
                return g;
              }
              return {
                ...g,
                availableSerials: serials,
                selectedSerials: autoSelected,
                isLoadingSerials: false,
              };
            }),
          );
        } catch {
          this.serialGroups.update((current) =>
            current.map((g) => (g.skuId === group.skuId ? { ...g, isLoadingSerials: false } : g)),
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

        return {
          ...g,
          selectedSerials: updated,
        };
      }),
    );
  }

  isReadyToDispatch(): boolean {
    const groups = this.serialGroups();
    for (const g of groups) {
      if (g.serialRequired && g.selectedSerials.length !== g.quantity) {
        return false;
      }
    }
    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.transfer) {
      return;
    }

    if (!this.isReadyToDispatch()) {
      this.errorMessage.set('Vui lòng chọn đủ số lượng sê-ri yêu cầu cho từng dòng linh kiện');
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
      const msg = err instanceof Error ? err.message : 'Lỗi khi xuất kho điều chuyển';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.closed.emit();
  }
}
