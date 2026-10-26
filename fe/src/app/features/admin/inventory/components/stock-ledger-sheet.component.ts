import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
import {
  StockQuantLedgerDetail,
} from '../services/admin-inventory.service';

@Component({
  selector: 'app-stock-ledger-sheet',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex justify-end">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          (click)="onClose()"
          tabindex="-1"
          aria-hidden="true"
        ></div>

        <div
          class="relative bg-surface border-l border-line shadow-2xl w-full max-w-2xl h-full flex flex-col z-10 text-sm text-foreground"
        >
          <div class="h-16 px-6 border-b border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            <div class="flex items-center gap-3 min-w-0">
              <div class="min-w-0">
                <h2 class="font-bold text-foreground text-base truncate">
                  Lịch Sử Biến Động Kho SKU
                </h2>
                @if (detail?.quant; as quant) {
                  <p class="text-xs text-muted font-mono truncate">
                    {{ quant.sku }} - {{ quant.branchName }} ({{ quant.branchCode }})
                  </p>
                }
              </div>
            </div>

            <button
              type="button"
              (click)="onClose()"
              class="p-2 rounded bg-surface hover:bg-surface-alt text-muted hover:text-foreground transition-colors border border-line"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          @if (detail?.quant; as quant) {
            <div class="p-4 bg-surface border-b border-line flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="space-y-0.5">
                <div class="text-muted font-medium">Linh kiện:</div>
                <div class="text-foreground font-semibold truncate max-w-xs">{{ quant.productName }}</div>
              </div>

              <div class="flex items-center gap-4 font-mono">
                <div class="text-center px-2 py-1 rounded bg-surface-alt border border-line">
                  <div class="text-muted text-[10px] uppercase font-semibold">Thực tế</div>
                  <div class="text-foreground font-bold text-sm">{{ quant.onHand }}</div>
                </div>

                <div class="text-center px-2 py-1 rounded bg-surface-alt border border-line">
                  <div class="text-muted text-[10px] uppercase font-semibold">Đang giữ</div>
                  <div class="text-warning font-bold text-sm">{{ quant.reserved }}</div>
                </div>

                <div class="text-center px-2 py-1 rounded bg-surface-alt border border-line">
                  <div class="text-muted text-[10px] uppercase font-semibold">Cách ly</div>
                  <div class="text-danger font-bold text-sm">{{ quant.quarantineDamaged }}</div>
                </div>

                <div class="text-center px-2 py-1 rounded bg-surface-alt border border-line">
                  <div class="text-muted text-[10px] uppercase font-semibold">Khả dụng</div>
                  <div class="text-primary-strong font-bold text-sm">{{ quant.available }}</div>
                </div>
              </div>
            </div>
          }

          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            @if (isLoading) {
              <div class="py-12 text-center text-muted space-y-3">
                <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
                <p class="text-xs">Đang tải lịch sử biến động...</p>
              </div>
            } @else if (error) {
              <div class="p-4 rounded bg-danger/10 border border-danger/30 text-danger text-xs flex items-center justify-between">
                <span>{{ error }}</span>
                <button
                  type="button"
                  (click)="retryRequested.emit()"
                  appButton
                  variant="danger"
                  size="sm"
                >
                  Thử lại
                </button>
              </div>
            } @else if (!detail?.entries || detail?.entries?.length === 0) {
              <div class="py-12 text-center text-muted space-y-2">
                <svg class="w-10 h-10 mx-auto text-muted/60" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p class="text-xs">Chưa có bản ghi biến động sổ kho nào cho linh kiện này tại chi nhánh.</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (entry of detail?.entries; track entry.id) {
                  <div class="p-3.5 bg-surface-alt border border-line rounded-lg space-y-2 hover:border-muted transition-colors">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <div class="flex items-center gap-2">
                        <span [class]="getEntryBadgeClass(entry.entryType)">
                          {{ getEntryLabel(entry.entryType) }}
                        </span>
                        <span class="text-xs font-mono font-semibold text-primary-strong">
                          {{ entry.documentCode }}
                        </span>
                      </div>
                      <span class="text-xs text-muted font-mono">
                        {{ formatDate(entry.occurredAt) }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-line">
                      <div>
                        <span class="text-muted">Biến động:</span>
                        <div class="font-mono font-bold mt-0.5">
                          @if (entry.deltaOnHand !== 0) {
                            <span [class]="entry.deltaOnHand > 0 ? 'text-emerald-600' : 'text-rose-600'">
                              {{ entry.deltaOnHand > 0 ? '+' : '' }}{{ entry.deltaOnHand }} Thực tế
                            </span>
                          }
                          @if (entry.deltaReserved !== 0) {
                            <span class="text-amber-600 ml-1">
                              {{ entry.deltaReserved > 0 ? '+' : '' }}{{ entry.deltaReserved }} Giữ
                            </span>
                          }
                          @if (entry.deltaQuarantine !== 0) {
                            <span class="text-rose-600 ml-1">
                              {{ entry.deltaQuarantine > 0 ? '+' : '' }}{{ entry.deltaQuarantine }} Cách ly
                            </span>
                          }
                          @if (entry.deltaOnHand === 0 && entry.deltaReserved === 0 && entry.deltaQuarantine === 0) {
                            <span class="text-muted">Không đổi</span>
                          }
                        </div>
                      </div>

                      <div>
                        <span class="text-muted">Tồn sau giao dịch:</span>
                        <div class="font-mono text-foreground mt-0.5">
                          Thực: <strong>{{ entry.onHandAfter }}</strong> | Giữ: <strong>{{ entry.reservedAfter }}</strong>
                        </div>
                      </div>

                      <div class="col-span-2 sm:col-span-1">
                        <span class="text-muted">Tác nhân:</span>
                        <div class="text-foreground truncate mt-0.5 font-mono text-[11px]">
                          {{ entry.actorType }}
                        </div>
                      </div>
                    </div>

                    @if (entry.reason) {
                      <div class="text-[11px] text-muted italic bg-surface px-2 py-1 rounded border border-line">
                        Ghi chú: {{ entry.reason }}
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div class="h-16 px-6 border-t border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            @if (detail?.quant; as quant) {
              <a
                [routerLink]="['/admin/inventory/ledger']"
                [queryParams]="{ search: quant.sku, branchId: quant.branchId }"
                (click)="onClose()"
                class="text-xs text-primary-strong hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Xem tất cả trong Sổ kho toàn diện</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            } @else {
              <div></div>
            }

            <button
              type="button"
              (click)="onClose()"
              appButton
              variant="outline"
              size="sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class StockLedgerSheetComponent {
  @Input() isOpen = false;
  @Input() detail: StockQuantLedgerDetail | null = null;
  @Input() isLoading = false;
  @Input() error: string | null = null;

  @Output() closeSheet = new EventEmitter<void>();
  @Output() retryRequested = new EventEmitter<void>();

  onClose(): void {
    this.closeSheet.emit();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getEntryLabel(entryType: string): string {
    switch (entryType) {
      case 'RESERVE':
        return 'GIỮ TỒN';
      case 'RELEASE_RESERVATION':
        return 'GIẢI PHÓNG GIỮ';
      case 'PURCHASE_RECEIPT':
        return 'NHẬP KHO PO';
      case 'ORDER_ISSUE':
        return 'XUẤT KHO';
      case 'TRANSFER_OUT':
        return 'CHUYỂN ĐI';
      case 'TRANSFER_IN':
        return 'CHUYỂN ĐẾN';
      case 'SUPPLIER_RETURN':
        return 'TRẢ NCC';
      case 'QUARANTINE':
        return 'CÁCH LY LỖI';
      case 'RELEASE_QUARANTINE':
        return 'GIẢI PHÓNG CÁCH LY';
      case 'REVERSAL':
        return 'ĐẢO NGƯỢC';
      default:
        return entryType;
    }
  }

  getEntryBadgeClass(entryType: string): string {
    const base = 'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase whitespace-nowrap';
    switch (entryType) {
      case 'RESERVE':
        return `${base} bg-amber-50 text-amber-700 border border-amber-200`;
      case 'RELEASE_RESERVATION':
        return `${base} bg-sky-50 text-sky-700 border border-sky-200`;
      case 'PURCHASE_RECEIPT':
        return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`;
      case 'ORDER_ISSUE':
        return `${base} bg-rose-50 text-rose-700 border border-rose-200`;
      case 'TRANSFER_OUT':
        return `${base} bg-orange-50 text-orange-700 border border-orange-200`;
      case 'TRANSFER_IN':
        return `${base} bg-surface-alt text-foreground border border-line`;
      case 'SUPPLIER_RETURN':
        return `${base} bg-surface-alt text-muted border border-line`;
      case 'QUARANTINE':
        return `${base} bg-red-50 text-red-700 border border-red-200`;
      case 'RELEASE_QUARANTINE':
        return `${base} bg-teal-50 text-teal-700 border border-teal-200`;
      case 'REVERSAL':
        return `${base} bg-yellow-50 text-yellow-800 border border-yellow-200`;
      default:
        return `${base} bg-surface border border-line text-muted`;
    }
  }
}
