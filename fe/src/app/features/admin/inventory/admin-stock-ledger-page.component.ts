import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  AdminInventoryService,
} from './services/admin-inventory.service';

@Component({
  selector: 'app-admin-stock-ledger-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-16
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Sổ Kho Bất Biến
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Nhật ký kiểm toán toàn diện mọi biến động tăng giảm tồn kho và giữ chỗ (INV-005)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/inventory/balances"
            class="px-3.5 py-2 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs rounded transition-colors inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-4 h-4 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span>Ma Trận Tồn Kho</span>
          </a>

          <button
            type="button"
            (click)="exportCsv()"
            class="px-3.5 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors inline-flex items-center gap-1.5 uppercase tracking-wide shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded-lg text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#76b900]"></span>
          <span>Toàn bộ biến động tăng giảm tồn kho đều được ghi nhận vĩnh viễn vào nhật ký kiểm toán. Hệ thống không cho phép sửa hoặc xóa trực tiếp số tồn kho.</span>
        </div>
        <span class="px-2 py-0.5 rounded bg-[#161b26] text-slate-400 font-mono text-[11px]">
          Tổng số giao dịch: <strong class="text-white">{{ inventoryService.ledgerTotal() }}</strong>
        </span>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 space-y-3 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div class="relative lg:col-span-1">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="SKU, chứng từ, mã..."
              class="w-full pl-9 pr-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
            />
            <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div>
            <select
              [ngModel]="selectedBranchId()"
              (ngModelChange)="onBranchChange($event)"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
            >
              <option [ngValue]="null">Tất cả chi nhánh</option>
              @for (branch of inventoryService.branches(); track branch.id) {
                <option [ngValue]="branch.id">{{ branch.name }} ({{ branch.code }})</option>
              }
            </select>
          </div>

          <div>
            <select
              [ngModel]="selectedEntryType()"
              (ngModelChange)="onEntryTypeChange($event)"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
            >
              <option value="">Tất cả loại giao dịch</option>
              <option value="RESERVE">Giữ tồn đơn hàng (RESERVE)</option>
              <option value="RELEASE_RESERVATION">Giải phóng giữ tồn (RELEASE)</option>
              <option value="PURCHASE_RECEIPT">Nhập kho đơn mua (PO)</option>
              <option value="ORDER_ISSUE">Xuất kho giao khách (ISSUE)</option>
              <option value="TRANSFER_OUT">Xuất chuyển kho (TRANSFER_OUT)</option>
              <option value="TRANSFER_IN">Nhập chuyển kho (TRANSFER_IN)</option>
              <option value="SUPPLIER_RETURN">Xuất trả nhà cung cấp (RETURN)</option>
              <option value="QUARANTINE">Cách ly linh kiện lỗi (QUARANTINE)</option>
              <option value="RELEASE_QUARANTINE">Giải phóng cách ly</option>
              <option value="REVERSAL">Đảo ngược giao dịch (REVERSAL)</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              [ngModel]="startDate()"
              (ngModelChange)="onStartDateChange($event)"
              placeholder="Từ ngày"
              title="Từ ngày"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
            />
          </div>

          <div>
            <input
              type="date"
              [ngModel]="endDate()"
              (ngModelChange)="onEndDateChange($event)"
              placeholder="Đến ngày"
              title="Đến ngày"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
            />
          </div>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        @if (inventoryService.isLedgerLoading()) {
          <div class="p-12 text-center text-slate-400 space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-[#76b900] border-r-transparent border-b-[#76b900] border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải nhật ký sổ kho bất biến...</p>
          </div>
        } @else if (inventoryService.ledgerError(); as error) {
          <div class="p-8 text-center text-rose-400 space-y-3">
            <p class="text-xs">{{ error }}</p>
            <button
              type="button"
              (click)="loadLedger()"
              class="px-3.5 py-1.5 bg-[#272f3d] hover:bg-[#384252] text-white rounded text-xs font-semibold"
            >
              Tải lại dữ liệu
            </button>
          </div>
        } @else if (inventoryService.ledgerEntries().length === 0) {
          <div class="p-12 text-center text-slate-400 space-y-2">
            <svg class="w-12 h-12 mx-auto text-slate-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p class="text-sm font-semibold text-slate-300">Không có bản ghi biến động sổ kho nào</p>
            <p class="text-xs text-slate-500">Thử mở rộng khoảng thời gian hoặc chọn lại bộ lọc chi nhánh.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4">Thời gian</th>
                  <th class="py-3 px-4">Chi nhánh</th>
                  <th class="py-3 px-4">Mã SKU & Linh kiện</th>
                  <th class="py-3 px-4">Loại biến động</th>
                  <th class="py-3 px-4 text-right">Biến động thực</th>
                  <th class="py-3 px-4 text-right">Biến động giữ</th>
                  <th class="py-3 px-4 text-right">Biến động lỗi</th>
                  <th class="py-3 px-4 text-right">Tồn sau GD</th>
                  <th class="py-3 px-4">Mã chứng từ</th>
                  <th class="py-3 px-4">Tác nhân</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d] text-xs">
                @for (entry of inventoryService.ledgerEntries(); track entry.id) {
                  <tr class="hover:bg-[#1f2634] transition-colors">
                    <td class="py-3 px-4 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {{ formatDate(entry.occurredAt) }}
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="font-semibold text-slate-200">{{ entry.branchName }}</div>
                      <div class="text-[11px] font-mono text-slate-400">{{ entry.branchCode }}</div>
                    </td>

                    <td class="py-3 px-4 max-w-xs">
                      <div class="font-mono font-bold text-white">{{ entry.sku }}</div>
                      <div class="text-[11px] text-slate-400 truncate" [title]="entry.productName">
                        {{ entry.productName }}
                        @if (entry.variationLabel) {
                          &bull; <span class="text-slate-300">{{ entry.variationLabel }}</span>
                        }
                      </div>
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <span [class]="getEntryBadgeClass(entry.entryType)">
                        {{ getEntryLabel(entry.entryType) }}
                      </span>
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                      @if (entry.deltaOnHand > 0) {
                        <span class="text-emerald-400">+{{ entry.deltaOnHand }}</span>
                      } @else if (entry.deltaOnHand < 0) {
                        <span class="text-rose-400">{{ entry.deltaOnHand }}</span>
                      } @else {
                        <span class="text-slate-500">0</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                      @if (entry.deltaReserved > 0) {
                        <span class="text-amber-400">+{{ entry.deltaReserved }}</span>
                      } @else if (entry.deltaReserved < 0) {
                        <span class="text-sky-400">{{ entry.deltaReserved }}</span>
                      } @else {
                        <span class="text-slate-500">0</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                      @if (entry.deltaQuarantine > 0) {
                        <span class="text-rose-400">+{{ entry.deltaQuarantine }}</span>
                      } @else if (entry.deltaQuarantine < 0) {
                        <span class="text-teal-400">{{ entry.deltaQuarantine }}</span>
                      } @else {
                        <span class="text-slate-500">0</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right font-mono text-slate-300 tabular-nums whitespace-nowrap">
                      Thực: <strong>{{ entry.onHandAfter }}</strong> | Giữ: <strong class="text-amber-400">{{ entry.reservedAfter }}</strong>
                    </td>

                    <td class="py-3 px-4 font-mono font-semibold text-[#76b900] whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        <span>{{ entry.documentCode }}</span>
                      </div>
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="font-mono text-[11px] text-slate-300">{{ entry.actorType }}</div>
                      @if (entry.reason) {
                        <div class="text-[10px] text-slate-500 truncate max-w-[120px]" [title]="entry.reason">
                          {{ entry.reason }}
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-[#272f3d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-[#090d16]">
            <div class="text-slate-400">
              Hiển thị <strong class="text-white">{{ (inventoryService.ledgerPage() - 1) * inventoryService.ledgerLimit() + 1 }}</strong>
              - <strong class="text-white">{{ getEndIndex() }}</strong>
              trong tổng số <strong class="text-white">{{ inventoryService.ledgerTotal() }}</strong> bản ghi
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="inventoryService.ledgerPage() <= 1"
                (click)="onPageChange(inventoryService.ledgerPage() - 1)"
                class="px-3 py-1.5 bg-[#161b26] hover:bg-[#272f3d] disabled:opacity-40 disabled:cursor-not-allowed border border-[#272f3d] rounded text-white font-medium transition-colors"
              >
                Trước
              </button>

              <span class="px-2 font-mono text-slate-300">
                Trang {{ inventoryService.ledgerPage() }} / {{ inventoryService.ledgerTotalPages() }}
              </span>

              <button
                type="button"
                [disabled]="inventoryService.ledgerPage() >= inventoryService.ledgerTotalPages()"
                (click)="onPageChange(inventoryService.ledgerPage() + 1)"
                class="px-3 py-1.5 bg-[#161b26] hover:bg-[#272f3d] disabled:opacity-40 disabled:cursor-not-allowed border border-[#272f3d] rounded text-white font-medium transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminStockLedgerPageComponent implements OnInit {
  readonly inventoryService = inject(AdminInventoryService);
  private readonly route = inject(ActivatedRoute);

  readonly searchQuery = signal<string>('');
  readonly selectedBranchId = signal<number | null>(null);
  readonly selectedEntryType = signal<string>('');
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');

  ngOnInit(): void {
    void this.inventoryService.loadBranches();

    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
      }
      if (params['branchId']) {
        this.selectedBranchId.set(Number(params['branchId']));
      }
      if (params['entryType']) {
        this.selectedEntryType.set(params['entryType']);
      }
      void this.loadLedger(1);
    });
  }

  async loadLedger(page = 1): Promise<void> {
    await this.inventoryService.loadLedger({
      search: this.searchQuery(),
      branchId: this.selectedBranchId() ?? undefined,
      entryType: this.selectedEntryType() || undefined,
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined,
      page,
      limit: 50,
    });
  }

  onSearchChange(term: string): void {
    this.searchQuery.set(term);
    void this.loadLedger(1);
  }

  onBranchChange(branchId: number | null): void {
    this.selectedBranchId.set(branchId);
    void this.loadLedger(1);
  }

  onEntryTypeChange(type: string): void {
    this.selectedEntryType.set(type);
    void this.loadLedger(1);
  }

  onStartDateChange(date: string): void {
    this.startDate.set(date);
    void this.loadLedger(1);
  }

  onEndDateChange(date: string): void {
    this.endDate.set(date);
    void this.loadLedger(1);
  }

  onPageChange(page: number): void {
    void this.loadLedger(page);
  }

  getEndIndex(): number {
    const page = this.inventoryService.ledgerPage();
    const limit = this.inventoryService.ledgerLimit();
    const total = this.inventoryService.ledgerTotal();
    return Math.min(page * limit, total);
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

  exportCsv(): void {
    const entries = this.inventoryService.ledgerEntries();
    if (!entries.length) {
      return;
    }

    const headers = [
      'Thoi gian',
      'Chi nhanh',
      'Ma chi nhanh',
      'Ma SKU',
      'Ten linh kien',
      'Loai bien dong',
      'Bien dong thuc te',
      'Bien dong giu ton',
      'Bien dong cach ly',
      'Ton sau GD',
      'Giu sau GD',
      'Ma chung tu',
      'Tac nhan',
    ];

    const rows = entries.map((e) => [
      `"${this.formatDate(e.occurredAt)}"`,
      `"${e.branchName.replace(/"/g, '""')}"`,
      `"${e.branchCode}"`,
      `"${e.sku}"`,
      `"${e.productName.replace(/"/g, '""')}"`,
      `"${e.entryType}"`,
      e.deltaOnHand,
      e.deltaReserved,
      e.deltaQuarantine,
      e.onHandAfter,
      e.reservedAfter,
      `"${e.documentCode}"`,
      `"${e.actorType}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `so-kho-kiem-toan-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
