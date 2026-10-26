import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import {
  AdminInventoryService,
} from './services/admin-inventory.service';

@Component({
  selector: 'app-admin-stock-ledger-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonDirective, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Sổ Kho Bất Biến
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Nhật ký kiểm toán toàn diện mọi biến động tăng giảm tồn kho và giữ chỗ
          </p>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/inventory/balances"
            appButton
            variant="secondary"
            size="sm"
            class="uppercase tracking-wide"
          >
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span>Ma Trận Tồn Kho</span>
          </a>

          <button
            type="button"
            (click)="exportCsv()"
            appButton
            variant="primary"
            size="sm"
            class="uppercase tracking-wide shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      <div class="p-3 bg-surface border border-line rounded-lg text-xs text-foreground flex items-center justify-between flex-wrap gap-2 shadow-card">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
          <span>Toàn bộ biến động tăng giảm tồn kho đều được ghi nhận vĩnh viễn vào nhật ký kiểm toán. Hệ thống không cho phép sửa hoặc xóa trực tiếp số tồn kho.</span>
        </div>
        <span class="px-2 py-0.5 rounded bg-surface-alt text-muted font-mono text-[11px] border border-line">
          Tổng số giao dịch: <strong class="text-foreground">{{ inventoryService.ledgerTotal() }}</strong>
        </span>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 space-y-3 shadow-card">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div class="relative lg:col-span-1">
            <label for="ledger-search" class="block text-[11px] font-semibold text-muted uppercase mb-1">Tìm kiếm</label>
            <div class="relative">
              <input
                id="ledger-search"
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="SKU, chứng từ, mã..."
                class="w-full h-9 pl-9 pr-3 bg-surface border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <svg class="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <span class="block text-[11px] font-semibold text-muted uppercase mb-1">Chi nhánh</span>
            <app-select
              [options]="branchOptions()"
              [value]="selectedBranchFilterId()"
              (valueChange)="onBranchChange($event)"
              [searchable]="true"
              searchPlaceholder="Tìm chi nhánh..."
              size="md"
            />
          </div>

          <div>
            <span class="block text-[11px] font-semibold text-muted uppercase mb-1">Loại giao dịch</span>
            <app-select
              [options]="entryTypeOptions"
              [value]="selectedEntryType()"
              (valueChange)="onEntryTypeChange($event)"
              size="md"
            />
          </div>

          <div>
            <label for="start-date" class="block text-[11px] font-semibold text-muted uppercase mb-1">Từ ngày</label>
            <input
              id="start-date"
              type="date"
              [ngModel]="startDate()"
              (ngModelChange)="onStartDateChange($event)"
              class="w-full h-9 px-3 bg-surface border border-line rounded text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label for="end-date" class="block text-[11px] font-semibold text-muted uppercase mb-1">Đến ngày</label>
            <input
              id="end-date"
              type="date"
              [ngModel]="endDate()"
              (ngModelChange)="onEndDateChange($event)"
              class="w-full h-9 px-3 bg-surface border border-line rounded text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-card overflow-hidden">
        @if (inventoryService.isLedgerLoading()) {
          <div class="p-12 text-center text-muted space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải nhật ký sổ kho bất biến...</p>
          </div>
        } @else if (inventoryService.ledgerError(); as error) {
          <div class="p-8 text-center text-danger space-y-3">
            <p class="text-xs">{{ error }}</p>
            <button
              type="button"
              (click)="loadLedger()"
              appButton
              variant="secondary"
              size="sm"
            >
              Tải lại dữ liệu
            </button>
          </div>
        } @else if (inventoryService.ledgerEntries().length === 0) {
          <div class="p-12 text-center text-muted space-y-2">
            <svg class="w-12 h-12 mx-auto text-muted/60" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p class="text-sm font-semibold text-foreground">Không có bản ghi biến động sổ kho nào</p>
            <p class="text-xs text-muted">Thử mở rộng khoảng thời gian hoặc chọn lại bộ lọc chi nhánh.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left min-w-[1000px] border-collapse">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4 whitespace-nowrap">Thời gian</th>
                  <th class="py-3 px-4 whitespace-nowrap">Chi nhánh</th>
                  <th class="py-3 px-4">Mã SKU & Linh kiện</th>
                  <th class="py-3 px-4 whitespace-nowrap">Loại biến động</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Biến động thực</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Biến động giữ</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Biến động lỗi</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Tồn sau GD</th>
                  <th class="py-3 px-4 whitespace-nowrap">Mã chứng từ</th>
                  <th class="py-3 px-4 whitespace-nowrap">Tác nhân</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-xs text-foreground">
                @for (entry of inventoryService.ledgerEntries(); track entry.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors">
                    <td class="py-3 px-4 font-mono text-muted tabular tabular-nums whitespace-nowrap">
                      {{ formatDate(entry.occurredAt) }}
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="font-semibold text-foreground">{{ entry.branchName }}</div>
                      <div class="text-[11px] font-mono text-muted">{{ entry.branchCode }}</div>
                    </td>

                    <td class="py-3 px-4 max-w-xs">
                      <div class="font-mono font-bold text-foreground">{{ entry.sku }}</div>
                      <div class="text-[11px] text-muted truncate" [title]="entry.productName">
                        {{ entry.productName }}
                        @if (entry.variationLabel) {
                          &bull; <span class="text-foreground">{{ entry.variationLabel }}</span>
                        }
                      </div>
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <span [class]="getEntryBadgeClass(entry.entryType)">
                        {{ getEntryLabel(entry.entryType) }}
                      </span>
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-bold tabular tabular-nums whitespace-nowrap">
                      @if (entry.deltaOnHand > 0) {
                        <span class="text-emerald-600 font-bold">+{{ entry.deltaOnHand }}</span>
                      } @else if (entry.deltaOnHand < 0) {
                        <span class="text-rose-600 font-bold">{{ entry.deltaOnHand }}</span>
                      } @else {
                        <span class="text-muted">0</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-bold tabular tabular-nums whitespace-nowrap">
                      @if (entry.deltaReserved > 0) {
                        <span class="text-amber-600 font-bold">+{{ entry.deltaReserved }}</span>
                      } @else if (entry.deltaReserved < 0) {
                        <span class="text-sky-600 font-bold">{{ entry.deltaReserved }}</span>
                      } @else {
                        <span class="text-muted">0</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-bold tabular tabular-nums whitespace-nowrap">
                      @if (entry.deltaQuarantine > 0) {
                        <span class="text-rose-600 font-bold">+{{ entry.deltaQuarantine }}</span>
                      } @else if (entry.deltaQuarantine < 0) {
                        <span class="text-teal-600 font-bold">{{ entry.deltaQuarantine }}</span>
                      } @else {
                        <span class="text-muted">0</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right font-mono text-muted tabular tabular-nums whitespace-nowrap">
                      Thực: <strong class="text-foreground">{{ entry.onHandAfter }}</strong> | Giữ: <strong class="text-amber-600">{{ entry.reservedAfter }}</strong>
                    </td>

                    <td class="py-3 px-4 font-mono font-semibold text-primary-strong whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        <span>{{ entry.documentCode }}</span>
                      </div>
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="font-mono text-[11px] text-foreground">{{ entry.actorType }}</div>
                      @if (entry.reason) {
                        <div class="text-[10px] text-muted truncate max-w-[120px]" [title]="entry.reason">
                          {{ entry.reason }}
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-surface-alt">
            <div class="text-muted">
              Hiển thị <strong class="text-foreground">{{ (inventoryService.ledgerPage() - 1) * inventoryService.ledgerLimit() + 1 }}</strong>
              - <strong class="text-foreground">{{ getEndIndex() }}</strong>
              trong tổng số <strong class="text-foreground">{{ inventoryService.ledgerTotal() }}</strong> bản ghi
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="inventoryService.ledgerPage() <= 1"
                (click)="onPageChange(inventoryService.ledgerPage() - 1)"
                appButton
                variant="outline"
                size="sm"
              >
                Trước
              </button>

              <span class="px-2 font-mono text-foreground font-semibold">
                Trang {{ inventoryService.ledgerPage() }} / {{ inventoryService.ledgerTotalPages() }}
              </span>

              <button
                type="button"
                [disabled]="inventoryService.ledgerPage() >= inventoryService.ledgerTotalPages()"
                (click)="onPageChange(inventoryService.ledgerPage() + 1)"
                appButton
                variant="outline"
                size="sm"
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
  readonly selectedBranchFilterId = signal<string>('');
  readonly selectedEntryType = signal<string>('');
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');

  readonly branchOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả chi nhánh' },
    ...this.inventoryService.branches().map((b) => ({
      value: String(b.id),
      label: `${b.name} (${b.code})`,
    })),
  ]);

  readonly entryTypeOptions: SelectOption[] = [
    { value: '', label: 'Tất cả loại giao dịch' },
    { value: 'RESERVE', label: 'Giữ tồn đơn hàng' },
    { value: 'RELEASE_RESERVATION', label: 'Giải phóng giữ tồn' },
    { value: 'PURCHASE_RECEIPT', label: 'Nhập kho đơn mua' },
    { value: 'ORDER_ISSUE', label: 'Xuất kho giao khách' },
    { value: 'TRANSFER_OUT', label: 'Xuất chuyển kho' },
    { value: 'TRANSFER_IN', label: 'Nhập chuyển kho' },
    { value: 'SUPPLIER_RETURN', label: 'Xuất trả NCC' },
    { value: 'QUARANTINE', label: 'Cách ly linh kiện lỗi' },
    { value: 'RELEASE_QUARANTINE', label: 'Giải phóng cách ly' },
    { value: 'REVERSAL', label: 'Đảo ngược giao dịch' },
  ];

  ngOnInit(): void {
    void this.inventoryService.loadBranches();

    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
      }
      if (params['branchId']) {
        this.selectedBranchFilterId.set(String(params['branchId']));
      }
      if (params['entryType']) {
        this.selectedEntryType.set(params['entryType']);
      }
      void this.loadLedger(1);
    });
  }

  async loadLedger(page = 1): Promise<void> {
    const branchVal = this.selectedBranchFilterId();
    await this.inventoryService.loadLedger({
      search: this.searchQuery(),
      branchId: branchVal ? Number(branchVal) : undefined,
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

  onBranchChange(val: string): void {
    this.selectedBranchFilterId.set(val);
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
        return `${base} bg-surface-alt text-muted border border-line`;
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
