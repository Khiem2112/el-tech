import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  SelectComponent,
  SelectOption,
} from '../../../components/atoms/select/select.component';
import { AdminCustomerService } from './services/admin-customer.service';

@Component({
  selector: 'app-admin-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Danh Sách Khách Hàng
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Quản lý tập trung hồ sơ khách thành viên và khách mua hàng vãng lai
          </p>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-muted">
            Tổng hồ sơ: <strong class="text-foreground tabular-nums">{{ customerService.total() }}</strong> khách
          </span>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label for="customer-search" class="block font-semibold text-muted uppercase text-xs mb-1">
            Tìm Kiếm
          </label>
          <div class="relative">
            <input
              id="customer-search"
              type="text"
              [ngModel]="customerService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Họ tên, SĐT, Email..."
              class="w-full pl-9 pr-3 py-2 bg-surface-alt border border-line rounded text-foreground text-xs placeholder:text-muted focus:outline-none focus:border-primary"
            />
            <svg
              class="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-muted uppercase text-xs mb-1">
            Loại Tài Khoản
          </label>
          <app-select
            [options]="typeOptions"
            [value]="customerService.typeFilter()"
            (valueChange)="onTypeFilterChange($event)"
            size="md"
          />
        </div>

        <div>
          <label class="block font-semibold text-muted uppercase text-xs mb-1">
            Trạng Thái Hồ Sơ
          </label>
          <app-select
            [options]="statusOptions"
            [value]="customerService.statusFilter()"
            (valueChange)="onStatusFilterChange($event)"
            size="md"
          />
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1000px] text-xs">
            <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th class="py-3 px-4">Họ và tên</th>
                <th class="py-3 px-4 whitespace-nowrap">Số điện thoại</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4 text-center whitespace-nowrap">Loại tài khoản</th>
                <th class="py-3 px-4 text-center whitespace-nowrap">Đơn hàng</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Tổng chi tiêu</th>
                <th class="py-3 px-4 text-center w-28 whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line text-foreground text-xs">
              @if (customerService.isLoading()) {
                @for (placeholder of [1, 2, 3, 4]; track placeholder) {
                  <tr class="animate-pulse">
                    <td class="py-3.5 px-4"><div class="h-4 w-36 bg-surface-alt rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-24 bg-surface-alt rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-40 bg-surface-alt rounded"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-5 w-20 bg-surface-alt rounded-full mx-auto"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-4 w-12 bg-surface-alt rounded mx-auto"></div></td>
                    <td class="py-3.5 px-4 text-right"><div class="h-4 w-24 bg-surface-alt rounded ml-auto"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-6 w-16 bg-surface-alt rounded mx-auto"></div></td>
                  </tr>
                }
              } @else if (customerService.customers().length === 0) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-muted">
                    <p class="font-medium text-sm text-foreground">Không tìm thấy khách hàng nào</p>
                    <p class="text-xs text-muted mt-1">Hãy thử tìm kiếm với thông tin khác hoặc điều chỉnh bộ lọc.</p>
                  </td>
                </tr>
              } @else {
                @for (item of customerService.customers(); track item.id) {
                  <tr class="hover:bg-surface-alt/60 transition-colors">
                    <td class="py-3 px-4">
                      <a [routerLink]="['/admin/customers', item.id]" class="font-bold text-foreground hover:text-primary transition-colors text-xs">
                        {{ item.name }}
                      </a>
                      <div class="text-xs text-muted font-mono">
                        {{ item.id }}
                      </div>
                    </td>
                    <td class="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                      {{ item.phone }}
                    </td>
                    <td class="py-3 px-4 text-muted">
                      {{ item.email }}
                    </td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (item.mergedIntoCustomerId) {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wide whitespace-nowrap">
                          Đã Gộp
                        </span>
                      } @else if (item.isRegistered) {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary-strong border border-primary/30 uppercase tracking-wide whitespace-nowrap">
                          Thành Viên
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-surface-alt text-muted border border-line uppercase tracking-wide whitespace-nowrap">
                          Khách Vãng Lai
                        </span>
                      }
                    </td>
                    <td class="py-3 px-4 text-center tabular-nums font-bold text-foreground whitespace-nowrap">
                      {{ item.orderCount }} đơn
                    </td>
                    <td class="py-3 px-4 text-right font-bold tabular-nums text-primary font-mono whitespace-nowrap">
                      {{ formatCurrency(item.totalSpent) }}
                    </td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      <a
                        [routerLink]="['/admin/customers', item.id]"
                        class="px-2.5 py-1 bg-surface-alt hover:bg-surface text-foreground border border-line rounded text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Xem chi tiết hồ sơ"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Chi tiết</span>
                      </a>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <div class="px-4 py-3 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted bg-surface">
          <div>
            Hiển thị <span class="text-foreground font-medium">{{ customerService.customers().length }}</span> trên tổng số <span class="text-foreground font-medium">{{ customerService.total() }}</span> hồ sơ
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              [disabled]="customerService.page() <= 1 || customerService.isLoading()"
              (click)="changePage(customerService.page() - 1)"
              class="px-3 py-1.5 bg-surface-alt hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed border border-line rounded text-foreground font-semibold transition-colors cursor-pointer"
            >
              Trang trước
            </button>
            <span class="text-muted px-2 font-mono">
              Trang {{ customerService.page() }} / {{ customerService.totalPages() }}
            </span>
            <button
              type="button"
              [disabled]="customerService.page() >= customerService.totalPages() || customerService.isLoading()"
              (click)="changePage(customerService.page() + 1)"
              class="px-3 py-1.5 bg-surface-alt hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed border border-line rounded text-foreground font-semibold transition-colors cursor-pointer"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminCustomersPageComponent implements OnInit {
  readonly customerService = inject(AdminCustomerService);

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly typeOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả tài khoản' },
    { value: 'USER', label: 'Thành viên (Đã đăng ký)' },
    { value: 'GUEST', label: 'Khách vãng lai (Chưa đăng ký)' },
  ];

  readonly statusOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'MERGED', label: 'Đã hợp nhất' },
    { value: 'INACTIVE', label: 'Ngừng hoạt động' },
  ];

  ngOnInit(): void {
    void this.customerService.loadCustomers();
  }

  onSearchChange(value: string): void {
    this.customerService.searchQuery.set(value);
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      void this.customerService.loadCustomers({ page: 1, search: value });
    }, 300);
  }

  onTypeFilterChange(value: string): void {
    const validValue = value as 'ALL' | 'USER' | 'GUEST';
    this.customerService.typeFilter.set(validValue);
    void this.customerService.loadCustomers({ page: 1, type: validValue });
  }

  onStatusFilterChange(value: string): void {
    const validValue = value as 'ALL' | 'ACTIVE' | 'MERGED' | 'INACTIVE';
    this.customerService.statusFilter.set(validValue);
    void this.customerService.loadCustomers({ page: 1, status: validValue });
  }

  changePage(newPage: number): void {
    void this.customerService.loadCustomers({ page: newPage });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }
}
