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
        <span class="px-2 py-0.5 rounded bg-surface-alt text-muted text-xs border border-line tabular">
          Tổng số giao dịch: <strong class="text-foreground">{{ inventoryService.ledgerTotal() }}</strong>
        </span>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 space-y-3 shadow-card">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div class="relative lg:col-span-1">
            <label for="ledger-search" class="block text-xs font-semibold text-muted uppercase mb-1">Tìm kiếm</label>
            <div class="relative">
              <input
                id="ledger-search"
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Mã linh kiện, chứng từ, mã..."
                class="w-full h-9 pl-9 pr-3 bg-surface border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <svg class="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <span class="block text-xs font-semibold text-muted uppercase mb-1">Nguồn chứng từ</span>
            <app-select
              [options]="originTypeOptions"
              [value]="selectedOriginType()"
              (valueChange)="onOriginTypeChange($event)"
              size="md"
            />
          </div>

          <div>
            <span class="block text-xs font-semibold text-muted uppercase mb-1">Loại giao dịch</span>
            <app-select
              [options]="entryTypeOptions"
              [value]="selectedEntryType()"
              (valueChange)="onEntryTypeChange($event)"
              size="md"
            />
          </div>

          <div>
            <label for="start-date" class="block text-xs font-semibold text-muted uppercase mb-1">Từ ngày</label>
            <input
              id="start-date"
              type="date"
              [ngModel]="startDate()"
              (ngModelChange)="onStartDateChange($event)"
              class="w-full h-9 px-3 bg-surface border border-line rounded text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label for="end-date" class="block text-xs font-semibold text-muted uppercase mb-1">Đến ngày</label>
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
            <p class="text-xs text-muted">Thử mở rộng khoảng thời gian hoặc thay đổi bộ lọc tìm kiếm.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-3 px-4 whitespace-nowrap">Thời gian</th>
                  <th class="py-3 px-4">Mã linh kiện & Tên linh kiện</th>
                  <th class="py-3 px-4 whitespace-nowrap">Loại biến động</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Thực / Lỗi / Giữ</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Tồn sau GD</th>
                  <th class="py-3 px-4 max-w-[180px] whitespace-nowrap">Chứng từ & Nguồn gốc</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-sm text-foreground">
                @for (entry of inventoryService.ledgerEntries(); track entry.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors">
                    <td class="py-3 px-4 text-muted tabular tabular-nums whitespace-nowrap">
                      {{ formatDate(entry.occurredAt) }}
                    </td>

                    <td class="py-3 px-4 min-w-[200px] max-w-xs">
                      <div class="font-bold text-foreground tabular">{{ entry.sku }}</div>
                      <div class="text-xs text-muted truncate" [title]="entry.productName">
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

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      <div
                        class="inline-flex items-center gap-1.5 tabular tabular-nums text-xs"
                        [title]="'Thực: ' + formatDelta(entry.deltaOnHand) + ' | Lỗi: ' + formatDelta(entry.deltaQuarantine) + ' | Giữ: ' + formatDelta(entry.deltaReserved)"
                      >
                        <span
                          class="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded text-[11px] font-bold border"
                          [class]="entry.deltaOnHand !== 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-surface-alt text-muted border-line'"
                        >
                          {{ formatDelta(entry.deltaOnHand) }}
                        </span>

                        <span class="text-muted/40 font-semibold select-none">/</span>

                        <span
                          class="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded text-[11px] font-bold border"
                          [class]="entry.deltaQuarantine !== 0
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-surface-alt text-muted border-line'"
                        >
                          {{ formatDelta(entry.deltaQuarantine) }}
                        </span>

                        <span class="text-muted/40 font-semibold select-none">/</span>

                        <span
                          class="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded text-[11px] font-bold border"
                          [class]="entry.deltaReserved !== 0
                            ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            : 'bg-surface-alt text-muted border-line'"
                        >
                          {{ formatDelta(entry.deltaReserved) }}
                        </span>
                      </div>
                    </td>

                    <td class="py-3 px-4 text-right text-muted tabular tabular-nums whitespace-nowrap">
                      Thực: <strong class="text-foreground">{{ entry.onHandAfter }}</strong> | Giữ: <strong class="text-amber-600">{{ entry.reservedAfter }}</strong>
                    </td>

                    <td class="py-3 px-4 max-w-[180px]">
                      <div class="flex flex-col gap-1 items-start max-w-full">
                        <span [class]="getOriginBadgeClass(entry.originType)">
                          {{ getOriginLabel(entry.originType) }}
                        </span>
                        @if (entry.originUrl) {
                          <a
                            [routerLink]="entry.originUrl"
                            class="text-xs font-bold text-primary hover:text-primary-focus hover:underline tabular tabular-nums tracking-wide inline-flex items-center gap-1 max-w-full truncate"
                            [title]="'Xem chi tiết ' + (entry.originCode || entry.documentCode)"
                          >
                            <span class="truncate">{{ entry.originCode || entry.documentCode }}</span>
                          </a>
                        } @else {
                          <span
                            class="text-xs font-medium text-foreground tabular tabular-nums max-w-full truncate"
                            [title]="entry.documentCode"
                          >
                            {{ entry.documentCode }}
                          </span>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-sm bg-surface-alt">
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

              <span class="px-2 text-foreground font-semibold tabular tabular-nums">
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
  readonly selectedEntryType = signal<string>('');
  readonly selectedOriginType = signal<'ALL' | 'ORDER' | 'PURCHASE_ORDER' | 'QUARANTINE'>('ALL');
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');

  readonly originTypeOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả nguồn chứng từ' },
    { value: 'ORDER', label: 'Đơn bán hàng' },
    { value: 'PURCHASE_ORDER', label: 'Đơn mua nhà cung cấp' },
    { value: 'QUARANTINE', label: 'Kiểm định kho nội bộ' },
  ];

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
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
      }
      if (params['entryType']) {
        this.selectedEntryType.set(params['entryType']);
      }
      if (params['originType']) {
        this.selectedOriginType.set(params['originType'] as 'ALL' | 'ORDER' | 'PURCHASE_ORDER' | 'QUARANTINE');
      }
      void this.loadLedger(1);
    });
  }

  async loadLedger(page = 1): Promise<void> {
    await this.inventoryService.loadLedger({
      search: this.searchQuery(),
      entryType: this.selectedEntryType() || undefined,
      originType: this.selectedOriginType(),
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

  onOriginTypeChange(type: string): void {
    this.selectedOriginType.set(type as 'ALL' | 'ORDER' | 'PURCHASE_ORDER' | 'QUARANTINE');
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

  formatDelta(value: number): string {
    if (value > 0) {
      return `+${value}`;
    }
    return `${value}`;
  }

  getEntryLabel(entryType: string): string {
    switch (entryType) {
      case 'RESERVE':
        return 'GIỮ TỒN';
      case 'RELEASE_RESERVATION':
        return 'GIẢI PHÓNG GIỮ';
      case 'PURCHASE_RECEIPT':
        return 'NHẬP KHO ĐƠN MUA';
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
    const base = 'px-2 py-0.5 rounded text-xs font-semibold tracking-wider uppercase whitespace-nowrap border';
    switch (entryType) {
      case 'QUARANTINE':
        return `${base} bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20`;
      case 'RESERVE':
        return `${base} bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20`;
      default:
        return `${base} bg-surface-alt text-foreground border-line`;
    }
  }

  getOriginLabel(originType?: string): string {
    switch (originType) {
      case 'ORDER':
        return 'ĐƠN BÁN';
      case 'PURCHASE_ORDER':
        return 'ĐƠN MUA LINH KIỆN';
      case 'QUARANTINE':
        return 'KIỂM ĐỊNH';
      case 'INTERNAL':
        return 'NỘI BỘ';
      default:
        return originType || 'NỘI BỘ';
    }
  }

  getOriginBadgeClass(originType?: string): string {
    const base = 'px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap border';
    switch (originType) {
      case 'ORDER':
        return `${base} bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800`;
      case 'PURCHASE_ORDER':
        return `${base} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800`;
      case 'QUARANTINE':
        return `${base} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800`;
      case 'INTERNAL':
      default:
        return `${base} bg-surface-alt text-muted border-line`;
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
      'Ma linh kien',
      'Ten linh kien',
      'Loai bien dong',
      'Nguon chung tu',
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
      `"${e.originType ?? 'INTERNAL'}"`,
      e.deltaOnHand,
      e.deltaReserved,
      e.deltaQuarantine,
      e.onHandAfter,
      e.reservedAfter,
      `"${e.originCode || e.documentCode}"`,
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
