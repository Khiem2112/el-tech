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
import { StockLedgerSheetComponent } from './components/stock-ledger-sheet.component';
import {
  AdminInventoryService,
  InventoryBalanceItem,
} from './services/admin-inventory.service';

@Component({
  selector: 'app-admin-inventory-balances-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonDirective,
    SelectComponent,
    StockLedgerSheetComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Tồn Kho Chi Nhánh
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Giám sát số dư tồn kho đa trạng thái và giá vốn WAC theo từng chi nhánh
          </p>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/inventory/ledger"
            appButton
            variant="secondary"
            size="sm"
            class="uppercase tracking-wide"
          >
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span>Sổ Kho Bất Biến</span>
          </a>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="p-3 bg-surface border border-line rounded-lg shadow-card">
          <div class="text-[11px] font-semibold text-muted uppercase tracking-wider">Tổng cặp SKU-Kho</div>
          <div class="text-lg font-bold font-mono text-foreground mt-1 tabular">{{ summary().totalQuants }}</div>
        </div>

        <div class="p-3 bg-surface border border-line rounded-lg shadow-card">
          <div class="text-[11px] font-semibold text-muted uppercase tracking-wider">Tồn thực tế</div>
          <div class="text-lg font-bold font-mono text-foreground mt-1 tabular">{{ summary().totalOnHand }}</div>
        </div>

        <div class="p-3 bg-surface border border-line rounded-lg shadow-card">
          <div class="text-[11px] font-semibold text-muted uppercase tracking-wider">Đang giữ đơn</div>
          <div class="text-lg font-bold font-mono text-warning mt-1 tabular">{{ summary().totalReserved }}</div>
        </div>

        <div class="p-3 bg-surface border border-line rounded-lg shadow-card">
          <div class="text-[11px] font-semibold text-muted uppercase tracking-wider">Cách ly lỗi</div>
          <div class="text-lg font-bold font-mono text-danger mt-1 tabular">{{ summary().totalQuarantine }}</div>
        </div>

        <div class="p-3 bg-surface border border-line rounded-lg shadow-card">
          <div class="text-[11px] font-semibold text-muted uppercase tracking-wider">Khả dụng bán</div>
          <div class="text-lg font-bold font-mono text-primary-strong mt-1 tabular">{{ summary().totalAvailable }}</div>
        </div>

        <div class="p-3 bg-surface border border-line rounded-lg shadow-card">
          <div class="text-[11px] font-semibold text-muted uppercase tracking-wider">Giá trị tồn kho</div>
          <div class="text-xs font-bold font-mono text-foreground mt-2 truncate tabular" [title]="summary().totalInventoryValue + ' đ'">
            {{ summary().totalInventoryValue }} đ
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 space-y-3 shadow-card">
        <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="text-muted">
            Công thức chuẩn: <strong class="text-foreground">Khả dụng = Thực tế - Đang giữ - Cách ly lỗi</strong>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 text-xs text-muted">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Còn hàng (>5)
            </span>
            <span class="inline-flex items-center gap-1.5 text-xs text-muted ml-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Sắp hết (1-5)
            </span>
            <span class="inline-flex items-center gap-1.5 text-xs text-muted ml-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Hết hàng (0)
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div class="relative">
            <label for="search-input" class="block text-[11px] font-semibold text-muted uppercase mb-1">Tìm kiếm</label>
            <div class="relative">
              <input
                id="search-input"
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Tìm SKU, tên linh kiện, mã vạch..."
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
              (valueChange)="onBranchFilterChange($event)"
              [searchable]="true"
              searchPlaceholder="Tìm chi nhánh..."
              size="md"
            />
          </div>

          <div>
            <span class="block text-[11px] font-semibold text-muted uppercase mb-1">Danh mục</span>
            <app-select
              [options]="categoryOptions()"
              [value]="selectedCategoryFilterId()"
              (valueChange)="onCategoryFilterChange($event)"
              [searchable]="true"
              searchPlaceholder="Tìm danh mục..."
              size="md"
            />
          </div>

          <div>
            <span class="block text-[11px] font-semibold text-muted uppercase mb-1">Mức tồn</span>
            <app-select
              [options]="stockStatusOptions"
              [value]="selectedStockStatus()"
              (valueChange)="onStockStatusChange($event)"
              size="md"
            />
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-card overflow-hidden">
        @if (inventoryService.isBalancesLoading()) {
          <div class="p-12 text-center text-muted space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải ma trận tồn kho...</p>
          </div>
        } @else if (inventoryService.balancesError(); as error) {
          <div class="p-8 text-center text-danger space-y-3">
            <p class="text-xs">{{ error }}</p>
            <button
              type="button"
              (click)="loadBalances()"
              appButton
              variant="secondary"
              size="sm"
            >
              Tải lại dữ liệu
            </button>
          </div>
        } @else if (inventoryService.balances().length === 0) {
          <div class="p-12 text-center text-muted space-y-2">
            <svg class="w-12 h-12 mx-auto text-muted/60" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p class="text-sm font-semibold text-foreground">Không tìm thấy bản ghi tồn kho phù hợp</p>
            <p class="text-xs text-muted">Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left min-w-[1000px] border-collapse">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4 whitespace-nowrap">Mã SKU</th>
                  <th class="py-3 px-4">Tên linh kiện</th>
                  <th class="py-3 px-4 whitespace-nowrap">Chi nhánh</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Thực tế</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Đang giữ</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Cách ly</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Khả dụng</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Giá vốn WAC</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Giá bán</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-xs text-foreground">
                @for (item of inventoryService.balances(); track item.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                      {{ item.sku }}
                      @if (item.serialRequired) {
                        <span class="ml-1.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary-strong border border-primary/20 text-xs font-semibold uppercase font-mono">
                          SN
                        </span>
                      }
                    </td>

                    <td class="py-3 px-4 max-w-xs">
                      <div class="font-semibold text-foreground truncate" [title]="item.productName">
                        {{ item.productName }}
                      </div>
                      <div class="text-[11px] text-muted truncate">
                        {{ item.categoryName }} &bull; {{ item.brandName }}
                        @if (item.variationLabel) {
                          &bull; <span class="text-foreground">{{ item.variationLabel }}</span>
                        }
                      </div>
                    </td>

                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="font-semibold text-foreground">{{ item.branchName }}</div>
                      <div class="text-[11px] font-mono text-muted">{{ item.branchCode }}</div>
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-bold text-foreground tabular tabular-nums whitespace-nowrap">
                      {{ item.onHand }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-semibold text-warning tabular tabular-nums whitespace-nowrap">
                      {{ item.reserved }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-semibold text-danger tabular tabular-nums whitespace-nowrap">
                      {{ item.quarantineDamaged }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono font-black tabular tabular-nums whitespace-nowrap">
                      <span [class]="getAvailableBadgeClass(item.available)">
                        {{ item.available }}
                      </span>
                    </td>

                    <td class="py-3 px-4 text-right font-mono text-muted tabular tabular-nums whitespace-nowrap">
                      {{ formatCurrency(item.weightedAverageCost) }}
                    </td>

                    <td class="py-3 px-4 text-right font-mono text-foreground font-semibold tabular tabular-nums whitespace-nowrap">
                      {{ formatCurrency(item.sellingPrice) }}
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap shrink-0">
                      <div class="flex items-center justify-end gap-1.5 whitespace-nowrap shrink-0">
                        <button
                          type="button"
                          (click)="openSheet(item)"
                          appButton
                          variant="secondary"
                          size="sm"
                          class="h-8 px-2.5 text-xs font-semibold inline-flex items-center gap-1"
                          title="Xem nhanh sổ kho của SKU"
                        >
                          <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Biến động</span>
                        </button>

                        <a
                          [routerLink]="['/admin/inventory/ledger']"
                          [queryParams]="{ search: item.sku, branchId: item.branchId }"
                          appButton
                          variant="outline"
                          size="sm"
                          class="h-8 w-8 p-0"
                          title="Mở trong Sổ kho"
                        >
                          <svg class="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
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

          <div class="p-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-surface-alt">
            <div class="text-muted">
              Hiển thị <strong class="text-foreground">{{ (inventoryService.balancesPage() - 1) * inventoryService.balancesLimit() + 1 }}</strong>
              - <strong class="text-foreground">{{ getEndIndex() }}</strong>
              trong tổng số <strong class="text-foreground">{{ inventoryService.balancesTotal() }}</strong> bản ghi
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="inventoryService.balancesPage() <= 1"
                (click)="onPageChange(inventoryService.balancesPage() - 1)"
                appButton
                variant="outline"
                size="sm"
              >
                Trước
              </button>

              <span class="px-2 font-mono text-foreground font-semibold">
                Trang {{ inventoryService.balancesPage() }} / {{ inventoryService.balancesTotalPages() }}
              </span>

              <button
                type="button"
                [disabled]="inventoryService.balancesPage() >= inventoryService.balancesTotalPages()"
                (click)="onPageChange(inventoryService.balancesPage() + 1)"
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
  readonly selectedBranchFilterId = signal<string>('');
  readonly selectedCategoryFilterId = signal<string>('');
  readonly selectedStockStatus = signal<string>('ALL');

  readonly isSheetOpen = signal<boolean>(false);
  readonly activeQuantId = signal<string | null>(null);

  readonly summary = computed(() => this.inventoryService.balancesSummary());

  readonly branchOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả chi nhánh' },
    ...this.inventoryService.branches().map((b) => ({
      value: String(b.id),
      label: `${b.name} (${b.code})`,
    })),
  ]);

  readonly categoryOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả danh mục' },
    ...this.inventoryService.categories().map((c) => ({
      value: String(c.id),
      label: c.name,
    })),
  ]);

  readonly stockStatusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả mức tồn' },
    { value: 'IN_STOCK', label: 'Còn hàng dồi dào (>5)' },
    { value: 'LOW_STOCK', label: 'Sắp hết hàng (1-5)' },
    { value: 'OUT_OF_STOCK', label: 'Hết hàng (0)' },
  ];

  ngOnInit(): void {
    const stockStatusParam =
      this.route.snapshot.queryParams['stockStatus'] ||
      (this.route.snapshot.queryParams['filter'] === 'zero' ? 'OUT_OF_STOCK' : null);
    const branchIdParam = this.route.snapshot.queryParams['branchId'];
    const categoryIdParam = this.route.snapshot.queryParams['categoryId'];
    const searchParam = this.route.snapshot.queryParams['search'];
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
        this.selectedBranchFilterId.set(String(branchId));
      }
    }
    if (categoryIdParam) {
      const categoryId = Number(categoryIdParam);
      if (!Number.isNaN(categoryId) && categoryId > 0) {
        this.selectedCategoryFilterId.set(String(categoryId));
      }
    }
    if (searchParam) {
      this.searchQuery.set(searchParam);
    }

    void this.inventoryService.loadBranches();
    void this.inventoryService.loadCategories();
    void this.loadBalances();
  }

  async loadBalances(page = 1): Promise<void> {
    const branchVal = this.selectedBranchFilterId();
    const categoryVal = this.selectedCategoryFilterId();
    await this.inventoryService.loadBalances({
      search: this.searchQuery(),
      branchId: branchVal ? Number(branchVal) : undefined,
      categoryId: categoryVal ? Number(categoryVal) : undefined,
      stockStatus: this.selectedStockStatus() as 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK',
      page,
      limit: 50,
    });
  }

  onSearchChange(term: string): void {
    this.searchQuery.set(term);
    void this.loadBalances(1);
  }

  onBranchFilterChange(val: string): void {
    this.selectedBranchFilterId.set(val);
    void this.loadBalances(1);
  }

  onCategoryFilterChange(val: string): void {
    this.selectedCategoryFilterId.set(val);
    void this.loadBalances(1);
  }

  onStockStatusChange(status: string): void {
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
    return `${num.toLocaleString('vi-VN')} đ`;
  }

  getAvailableBadgeClass(available: number): string {
    if (available > 5) {
      return 'text-primary-strong font-bold';
    }
    if (available > 0) {
      return 'text-warning font-bold';
    }
    return 'text-danger font-bold';
  }
}
