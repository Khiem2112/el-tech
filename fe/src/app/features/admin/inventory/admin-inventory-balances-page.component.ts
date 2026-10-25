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
import { StockLedgerSheetComponent } from './components/stock-ledger-sheet.component';
import {
  AdminInventoryService,
  InventoryBalanceItem,
} from './services/admin-inventory.service';

@Component({
  selector: 'app-admin-inventory-balances-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StockLedgerSheetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-15
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Tồn Kho Chi Nhánh
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Giám sát số dư tồn kho đa trạng thái và giá vốn WAC theo từng chi nhánh (INV-001, INV-002, INV-004)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/inventory/ledger"
            class="px-3.5 py-2 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs rounded transition-colors inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-4 h-4 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span>Sổ Kho Bất Biến</span>
          </a>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tổng cặp SKU-Kho</div>
          <div class="text-lg font-bold font-mono text-white mt-1">{{ summary().totalQuants }}</div>
        </div>

        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tồn thực tế</div>
          <div class="text-lg font-bold font-mono text-white mt-1">{{ summary().totalOnHand }}</div>
        </div>

        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Đang giữ đơn</div>
          <div class="text-lg font-bold font-mono text-amber-400 mt-1">{{ summary().totalReserved }}</div>
        </div>

        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cách ly lỗi</div>
          <div class="text-lg font-bold font-mono text-rose-400 mt-1">{{ summary().totalQuarantine }}</div>
        </div>

        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Khả dụng bán</div>
          <div class="text-lg font-bold font-mono text-[#76b900] mt-1">{{ summary().totalAvailable }}</div>
        </div>

        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Giá trị tồn kho</div>
          <div class="text-xs font-bold font-mono text-white mt-2 truncate" [title]="summary().totalInventoryValue + ' ₫'">
            {{ summary().totalInventoryValue }} ₫
          </div>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 space-y-3 shadow-sm">
        <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="text-slate-400">
            Công thức chuẩn: <strong class="text-slate-200">Khả dụng = Thực tế - Đang giữ - Cách ly lỗi</strong>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Còn hàng (>5)
            </span>
            <span class="inline-flex items-center gap-1.5 text-xs text-slate-400 ml-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Sắp hết (1-5)
            </span>
            <span class="inline-flex items-center gap-1.5 text-xs text-slate-400 ml-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Hết hàng (0)
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="relative">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm SKU, tên linh kiện, mã vạch..."
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
              [ngModel]="selectedCategoryId()"
              (ngModelChange)="onCategoryChange($event)"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
            >
              <option [ngValue]="null">Tất cả danh mục</option>
              @for (cat of inventoryService.categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <div>
            <select
              [ngModel]="selectedStockStatus()"
              (ngModelChange)="onStockStatusChange($event)"
              class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
            >
              <option value="ALL">Tất cả mức tồn</option>
              <option value="IN_STOCK">Còn hàng dồi dào (>5)</option>
              <option value="LOW_STOCK">Sắp hết hàng (1-5)</option>
              <option value="OUT_OF_STOCK">Hết hàng (0)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        @if (inventoryService.isBalancesLoading()) {
          <div class="p-12 text-center text-slate-400 space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-[#76b900] border-r-transparent border-b-[#76b900] border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải ma trận tồn kho...</p>
          </div>
        } @else if (inventoryService.balancesError(); as error) {
          <div class="p-8 text-center text-rose-400 space-y-3">
            <p class="text-xs">{{ error }}</p>
            <button
              type="button"
              (click)="loadBalances()"
              class="px-3.5 py-1.5 bg-[#272f3d] hover:bg-[#384252] text-white rounded text-xs font-semibold"
            >
              Tải lại dữ liệu
            </button>
          </div>
        } @else if (inventoryService.balances().length === 0) {
          <div class="p-12 text-center text-slate-400 space-y-2">
            <svg class="w-12 h-12 mx-auto text-slate-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p class="text-sm font-semibold text-slate-300">Không tìm thấy bản ghi tồn kho phù hợp</p>
            <p class="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4">Mã SKU</th>
                  <th class="py-3 px-4">Tên linh kiện</th>
                  <th class="py-3 px-4">Chi nhánh</th>
                  <th class="py-3 px-4 text-right">Thực tế</th>
                  <th class="py-3 px-4 text-right">Đang giữ</th>
                  <th class="py-3 px-4 text-right">Cách ly</th>
                  <th class="py-3 px-4 text-right">Khả dụng</th>
                  <th class="py-3 px-4 text-right">Giá vốn WAC</th>
                  <th class="py-3 px-4 text-right">Giá bán</th>
                  <th class="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d] text-xs">
                @for (item of inventoryService.balances(); track item.id) {
                  <tr class="hover:bg-[#1f2634] transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {{ item.sku }}
                      @if (item.serialRequired) {
                        <span class="ml-1.5 px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] uppercase font-mono">
                          SN
                        </span>
                      }
                    </td>

                    <td class="py-3 px-4 max-w-xs">
                      <div class="font-semibold text-white truncate" [title]="item.productName">
                        {{ item.productName }}
                      </div>
                      <div class="text-[11px] text-slate-400 truncate">
                        {{ item.categoryName }} &bull; {{ item.brandName }}
                        @if (item.variationLabel) {
                          &bull; <span class="text-slate-300">{{ item.variationLabel }}</span>
                        }
                      </div>
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="font-semibold text-slate-200">{{ item.branchName }}</div>
                      <div class="text-[11px] font-mono text-slate-400">{{ item.branchCode }}</div>
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                      {{ item.onHand }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-semibold text-amber-400 tabular-nums">
                      {{ item.reserved }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-semibold text-rose-400 tabular-nums">
                      {{ item.quarantineDamaged }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-black tabular-nums">
                      <span [class]="getAvailableBadgeClass(item.available)">
                        {{ item.available }}
                      </span>
                    </td>

                    <td class="py-3 px-4 text-right font-mono text-slate-300 tabular-nums whitespace-nowrap">
                      {{ formatCurrency(item.weightedAverageCost) }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {{ formatCurrency(item.sellingPrice) }}
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="openSheet(item)"
                          class="px-2.5 py-1 bg-[#272f3d] hover:bg-[#384252] text-white rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                          title="Xem nhanh sổ kho của SKU"
                        >
                          <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Biến động</span>
                        </button>

                        <a
                          [routerLink]="['/admin/inventory/ledger']"
                          [queryParams]="{ search: item.sku, branchId: item.branchId }"
                          class="p-1 rounded bg-[#161b26] hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
                          title="Mở trong Sổ kho"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-[#272f3d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-[#090d16]">
            <div class="text-slate-400">
              Hiển thị <strong class="text-white">{{ (inventoryService.balancesPage() - 1) * inventoryService.balancesLimit() + 1 }}</strong>
              - <strong class="text-white">{{ getEndIndex() }}</strong>
              trong tổng số <strong class="text-white">{{ inventoryService.balancesTotal() }}</strong> bản ghi
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="inventoryService.balancesPage() <= 1"
                (click)="onPageChange(inventoryService.balancesPage() - 1)"
                class="px-3 py-1.5 bg-[#161b26] hover:bg-[#272f3d] disabled:opacity-40 disabled:cursor-not-allowed border border-[#272f3d] rounded text-white font-medium transition-colors"
              >
                Trước
              </button>

              <span class="px-2 font-mono text-slate-300">
                Trang {{ inventoryService.balancesPage() }} / {{ inventoryService.balancesTotalPages() }}
              </span>

              <button
                type="button"
                [disabled]="inventoryService.balancesPage() >= inventoryService.balancesTotalPages()"
                (click)="onPageChange(inventoryService.balancesPage() + 1)"
                class="px-3 py-1.5 bg-[#161b26] hover:bg-[#272f3d] disabled:opacity-40 disabled:cursor-not-allowed border border-[#272f3d] rounded text-white font-medium transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <app-stock-ledger-sheet
      [isOpen]="isSheetOpen()"
      [detail]="inventoryService.selectedQuantLedger()"
      [isLoading]="inventoryService.isSheetLoading()"
      [error]="inventoryService.sheetError()"
      (closeSheet)="closeSheet()"
      (retryRequested)="retryLoadSheet()"
    />
  `,
})
export class AdminInventoryBalancesPageComponent implements OnInit {
  readonly inventoryService = inject(AdminInventoryService);
  private readonly route = inject(ActivatedRoute);

  readonly searchQuery = signal<string>('');
  readonly selectedBranchId = signal<number | null>(null);
  readonly selectedCategoryId = signal<number | null>(null);
  readonly selectedStockStatus = signal<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  readonly isSheetOpen = signal<boolean>(false);
  readonly activeQuantId = signal<string | null>(null);

  readonly summary = computed(() => this.inventoryService.balancesSummary());

  ngOnInit(): void {
    const stockStatusParam =
      this.route.snapshot.queryParams['stockStatus'] ||
      (this.route.snapshot.queryParams['filter'] === 'zero' ? 'OUT_OF_STOCK' : null);
    const branchIdParam = this.route.snapshot.queryParams['branchId'];
    if (
      stockStatusParam === 'OUT_OF_STOCK' ||
      stockStatusParam === 'LOW_STOCK' ||
      stockStatusParam === 'IN_STOCK'
    ) {
      this.selectedStockStatus.set(stockStatusParam);
    }
    if (branchIdParam) {
      const branchId = Number(branchIdParam);
      if (!Number.isNaN(branchId) && branchId > 0) {
        this.selectedBranchId.set(branchId);
      }
    }

    void this.inventoryService.loadBranches();
    void this.inventoryService.loadCategories();
    void this.loadBalances();
  }

  async loadBalances(page = 1): Promise<void> {
    await this.inventoryService.loadBalances({
      search: this.searchQuery(),
      branchId: this.selectedBranchId() ?? undefined,
      categoryId: this.selectedCategoryId() ?? undefined,
      stockStatus: this.selectedStockStatus(),
      page,
      limit: 50,
    });
  }

  onSearchChange(term: string): void {
    this.searchQuery.set(term);
    void this.loadBalances(1);
  }

  onBranchChange(branchId: number | null): void {
    this.selectedBranchId.set(branchId);
    void this.loadBalances(1);
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    void this.loadBalances(1);
  }

  onStockStatusChange(status: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'): void {
    this.selectedStockStatus.set(status);
    void this.loadBalances(1);
  }

  onPageChange(page: number): void {
    void this.loadBalances(page);
  }

  openSheet(quant: InventoryBalanceItem): void {
    this.activeQuantId.set(quant.id);
    this.isSheetOpen.set(true);
    void this.inventoryService.loadQuantLedger(quant.id);
  }

  closeSheet(): void {
    this.isSheetOpen.set(false);
    this.activeQuantId.set(null);
  }

  retryLoadSheet(): void {
    const quantId = this.activeQuantId();
    if (quantId) {
      void this.inventoryService.loadQuantLedger(quantId);
    }
  }

  getEndIndex(): number {
    const page = this.inventoryService.balancesPage();
    const limit = this.inventoryService.balancesLimit();
    const total = this.inventoryService.balancesTotal();
    return Math.min(page * limit, total);
  }

  formatCurrency(value: string | number): string {
    const num = Number(value) || 0;
    return `${num.toLocaleString('vi-VN')} ₫`;
  }

  getAvailableBadgeClass(available: number): string {
    if (available > 5) {
      return 'text-emerald-400';
    }
    if (available > 0) {
      return 'text-amber-400';
    }
    return 'text-rose-500';
  }
}
