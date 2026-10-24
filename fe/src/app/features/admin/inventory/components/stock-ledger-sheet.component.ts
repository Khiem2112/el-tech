import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  StockQuantLedgerDetail,
} from '../services/admin-inventory.service';

@Component({
  selector: 'app-stock-ledger-sheet',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex justify-end">
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          (click)="onClose()"
          tabindex="-1"
          aria-hidden="true"
        ></div>

        <div
          class="relative bg-[#161b26] border-l border-[#272f3d] shadow-2xl w-full max-w-2xl h-full flex flex-col z-10 text-sm text-slate-200"
        >
          <div class="h-16 px-6 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
            <div class="flex items-center gap-3 min-w-0">
              <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold shrink-0">
                MOD-22
              </span>
              <div class="min-w-0">
                <h2 class="font-bold text-white text-base truncate">
                  Lịch Sử Biến Động Kho SKU
                </h2>
                @if (detail?.quant; as quant) {
                  <p class="text-xs text-slate-400 font-mono truncate">
                    {{ quant.sku }} - {{ quant.branchName }} ({{ quant.branchCode }})
                  </p>
                }
              </div>
            </div>

            <button
              type="button"
              (click)="onClose()"
              class="p-2 rounded bg-[#161b26] hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Dong"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          @if (detail?.quant; as quant) {
            <div class="p-4 bg-[#0d121c] border-b border-[#272f3d] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="space-y-0.5">
                <div class="text-slate-400 font-medium">Linh kien:</div>
                <div class="text-white font-semibold truncate max-w-xs">{{ quant.productName }}</div>
              </div>

              <div class="flex items-center gap-4 font-mono">
                <div class="text-center px-2 py-1 rounded bg-[#161b26] border border-[#272f3d]">
                  <div class="text-slate-400 text-[10px] uppercase">Thuc te</div>
                  <div class="text-white font-bold text-sm">{{ quant.onHand }}</div>
                </div>

                <div class="text-center px-2 py-1 rounded bg-[#161b26] border border-[#272f3d]">
                  <div class="text-slate-400 text-[10px] uppercase">Dang giu</div>
                  <div class="text-amber-400 font-bold text-sm">{{ quant.reserved }}</div>
                </div>

                <div class="text-center px-2 py-1 rounded bg-[#161b26] border border-[#272f3d]">
                  <div class="text-slate-400 text-[10px] uppercase">Cach ly</div>
                  <div class="text-rose-400 font-bold text-sm">{{ quant.quarantineDamaged }}</div>
                </div>

                <div class="text-center px-2 py-1 rounded bg-[#161b26] border border-[#272f3d]">
                  <div class="text-slate-400 text-[10px] uppercase">Kha dung</div>
                  <div class="text-[#76b900] font-bold text-sm">{{ quant.available }}</div>
                </div>
              </div>
            </div>
          }

          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            @if (isLoading) {
              <div class="py-12 text-center text-slate-400 space-y-3">
                <div class="inline-block w-8 h-8 border-2 border-t-[#76b900] border-r-transparent border-b-[#76b900] border-l-transparent rounded-full animate-spin"></div>
                <p class="text-xs">Dang tai lich su bien dong...</p>
              </div>
            } @else if (error) {
              <div class="p-4 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center justify-between">
                <span>{{ error }}</span>
                <button
                  type="button"
                  (click)="retryRequested.emit()"
                  class="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded font-medium"
                >
                  Thu lai
                </button>
              </div>
            } @else if (!detail?.entries || detail?.entries?.length === 0) {
              <div class="py-12 text-center text-slate-400 space-y-2">
                <svg class="w-10 h-10 mx-auto text-slate-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p class="text-xs">Chua co ban ghi bien dong so kho nao cho linh kien nay tai chi nhanh.</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (entry of detail?.entries; track entry.id) {
                  <div class="p-3.5 bg-[#0d121c] border border-[#272f3d] rounded-lg space-y-2 hover:border-[#384252] transition-colors">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <div class="flex items-center gap-2">
                        <span [class]="getEntryBadgeClass(entry.entryType)">
                          {{ getEntryLabel(entry.entryType) }}
                        </span>
                        <span class="text-xs font-mono font-semibold text-[#76b900]">
                          {{ entry.documentCode }}
                        </span>
                      </div>
                      <span class="text-xs text-slate-400 font-mono">
                        {{ formatDate(entry.occurredAt) }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-[#1e2430]">
                      <div>
                        <span class="text-slate-400">Bien dong:</span>
                        <div class="font-mono font-bold mt-0.5">
                          @if (entry.deltaOnHand !== 0) {
                            <span [class]="entry.deltaOnHand > 0 ? 'text-emerald-400' : 'text-rose-400'">
                              {{ entry.deltaOnHand > 0 ? '+' : '' }}{{ entry.deltaOnHand }} Thuc te
                            </span>
                          }
                          @if (entry.deltaReserved !== 0) {
                            <span class="text-amber-400 ml-1">
                              {{ entry.deltaReserved > 0 ? '+' : '' }}{{ entry.deltaReserved }} Giu
                            </span>
                          }
                          @if (entry.deltaQuarantine !== 0) {
                            <span class="text-rose-400 ml-1">
                              {{ entry.deltaQuarantine > 0 ? '+' : '' }}{{ entry.deltaQuarantine }} Cach ly
                            </span>
                          }
                          @if (entry.deltaOnHand === 0 && entry.deltaReserved === 0 && entry.deltaQuarantine === 0) {
                            <span class="text-slate-500">Khong doi</span>
                          }
                        </div>
                      </div>

                      <div>
                        <span class="text-slate-400">Ton sau giao dich:</span>
                        <div class="font-mono text-slate-200 mt-0.5">
                          Thuc: <strong>{{ entry.onHandAfter }}</strong> | Giu: <strong>{{ entry.reservedAfter }}</strong>
                        </div>
                      </div>

                      <div class="col-span-2 sm:col-span-1">
                        <span class="text-slate-400">Tac nhan:</span>
                        <div class="text-slate-300 truncate mt-0.5 font-mono text-[11px]">
                          {{ entry.actorType }}
                        </div>
                      </div>
                    </div>

                    @if (entry.reason) {
                      <div class="text-[11px] text-slate-400 italic bg-[#161b26] px-2 py-1 rounded">
                        Ghi chu: {{ entry.reason }}
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div class="h-16 px-6 border-t border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
            @if (detail?.quant; as quant) {
              <a
                [routerLink]="['/admin/inventory/ledger']"
                [queryParams]="{ search: quant.sku, branchId: quant.branchId }"
                (click)="onClose()"
                class="text-xs text-[#76b900] hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Xem tat ca trong So kho toan dien</span>
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
              class="px-4 py-2 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-slate-200 rounded text-xs font-semibold transition-colors"
            >
              Dong
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
      second: '2-digit',
    });
  }

  getEntryLabel(entryType: string): string {
    switch (entryType) {
      case 'RESERVE':
        return 'GIU TON';
      case 'RELEASE_RESERVATION':
        return 'GIAI PHONG GIU';
      case 'PURCHASE_RECEIPT':
        return 'NHAP KHO PO';
      case 'ORDER_ISSUE':
        return 'XUAT KHO';
      case 'TRANSFER_OUT':
        return 'CHUYEN DI';
      case 'TRANSFER_IN':
        return 'CHUYEN DEN';
      case 'SUPPLIER_RETURN':
        return 'TRA NCC';
      case 'QUARANTINE':
        return 'CACH LY LOI';
      case 'RELEASE_QUARANTINE':
        return 'GIAI PHONG CACH LY';
      case 'REVERSAL':
        return 'DAO NGUOC';
      default:
        return entryType;
    }
  }

  getEntryBadgeClass(entryType: string): string {
    const base = 'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase';
    switch (entryType) {
      case 'RESERVE':
        return `${base} bg-amber-950/60 text-amber-300 border border-amber-800`;
      case 'RELEASE_RESERVATION':
        return `${base} bg-sky-950/60 text-sky-300 border border-sky-800`;
      case 'PURCHASE_RECEIPT':
        return `${base} bg-emerald-950/60 text-emerald-300 border border-emerald-800`;
      case 'ORDER_ISSUE':
        return `${base} bg-rose-950/60 text-rose-300 border border-rose-800`;
      case 'TRANSFER_OUT':
        return `${base} bg-orange-950/60 text-orange-300 border border-orange-800`;
      case 'TRANSFER_IN':
        return `${base} bg-indigo-950/60 text-indigo-300 border border-indigo-800`;
      case 'SUPPLIER_RETURN':
        return `${base} bg-purple-950/60 text-purple-300 border border-purple-800`;
      case 'QUARANTINE':
        return `${base} bg-red-950/60 text-red-300 border border-red-800`;
      case 'RELEASE_QUARANTINE':
        return `${base} bg-teal-950/60 text-teal-300 border border-teal-800`;
      case 'REVERSAL':
        return `${base} bg-yellow-950/60 text-yellow-300 border border-yellow-800`;
      default:
        return `${base} bg-slate-800 text-slate-300 border border-slate-700`;
    }
  }
}
