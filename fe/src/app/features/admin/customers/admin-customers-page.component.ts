import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminCustomerService } from './services/admin-customer.service';

@Component({
  selector: 'app-admin-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-26
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Danh Sách Khách Hàng
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Quản lý tập trung hồ sơ khách thành viên và khách mua hàng vãng lai
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400">
            Tổng hồ sơ: <strong class="text-white tabular-nums">{{ customerService.total() }}</strong> khách
          </span>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label for="customer-search" class="block font-semibold text-slate-400 uppercase text-[11px] mb-1">
            Tìm Kiếm
          </label>
          <div class="relative">
            <input
              id="customer-search"
              type="text"
              [ngModel]="customerService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Họ tên, SĐT, Email..."
              class="w-full pl-9 pr-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
            />
            <svg
              class="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none"
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
          <label for="account-type-filter" class="block font-semibold text-slate-400 uppercase text-[11px] mb-1">
            Loại Tài Khoản
          </label>
          <select
            id="account-type-filter"
            [ngModel]="customerService.typeFilter()"
            (ngModelChange)="onTypeFilterChange($event)"
            class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-slate-200 text-xs focus:outline-none focus:border-[#76b900]"
          >
            <option value="ALL">Tất cả tài khoản</option>
            <option value="USER">Thành viên (Đã đăng ký)</option>
            <option value="GUEST">Khách vãng lai (Chưa đăng ký)</option>
          </select>
        </div>

        <div>
          <label for="status-filter" class="block font-semibold text-slate-400 uppercase text-[11px] mb-1">
            Trạng Thái Hồ Sơ
          </label>
          <select
            id="status-filter"
            [ngModel]="customerService.statusFilter()"
            (ngModelChange)="onStatusFilterChange($event)"
            class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-slate-200 text-xs focus:outline-none focus:border-[#76b900]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="MERGED">Đã hợp nhất</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#090d16]/70 border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="py-3 px-4">Họ và tên</th>
                <th class="py-3 px-4">Số điện thoại</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4 text-center">Loại tài khoản</th>
                <th class="py-3 px-4 text-center">Đơn hàng</th>
                <th class="py-3 px-4 text-right">Tổng chi tiêu</th>
                <th class="py-3 px-4 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#272f3d] text-xs">
              @if (customerService.isLoading()) {
                @for (placeholder of [1, 2, 3, 4]; track placeholder) {
                  <tr class="animate-pulse">
                    <td class="py-3.5 px-4"><div class="h-4 w-36 bg-[#272f3d] rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-24 bg-[#272f3d] rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-40 bg-[#272f3d] rounded"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-5 w-20 bg-[#272f3d] rounded-full mx-auto"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-4 w-12 bg-[#272f3d] rounded mx-auto"></div></td>
                    <td class="py-3.5 px-4 text-right"><div class="h-4 w-24 bg-[#272f3d] rounded ml-auto"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-6 w-16 bg-[#272f3d] rounded mx-auto"></div></td>
                  </tr>
                }
              } @else if (customerService.customers().length === 0) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-400">
                    <p class="font-medium text-sm">Không tìm thấy khách hàng nào</p>
                    <p class="text-xs text-slate-500 mt-1">Hãy thử tìm kiếm với thông tin khác hoặc điều chỉnh bộ lọc.</p>
                  </td>
                </tr>
              } @else {
                @for (item of customerService.customers(); track item.id) {
                  <tr class="hover:bg-[#1a2130] transition-colors">
                    <td class="py-3 px-4">
                      <a [routerLink]="['/admin/customers', item.id]" class="font-bold text-white hover:text-[#76b900] transition-colors">
                        {{ item.name }}
                      </a>
                      <div class="text-[10px] text-slate-500 font-mono">
                        {{ item.id }}
                      </div>
                    </td>
                    <td class="py-3 px-4 font-mono font-semibold text-slate-200">
                      {{ item.phone }}
                    </td>
                    <td class="py-3 px-4 text-slate-400">
                      {{ item.email }}
                    </td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (item.mergedIntoCustomerId) {
                        <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                          Đã Gộp
                        </span>
                      } @else if (item.isRegistered) {
                        <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase tracking-wide">
                          Thành Viên
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30 uppercase tracking-wide">
                          Khách Vãng Lai
                        </span>
                      }
                    </td>
                    <td class="py-3 px-4 text-center tabular-nums font-bold text-white">
                      {{ item.orderCount }} đơn
                    </td>
                    <td class="py-3 px-4 text-right font-bold tabular-nums text-[#76b900]">
                      {{ formatCurrency(item.totalSpent) }}
                    </td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      <a
                        [routerLink]="['/admin/customers', item.id]"
                        class="px-2.5 py-1 bg-[#090d16] hover:bg-[#272f3d] text-slate-200 hover:text-white border border-[#272f3d] rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
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

        <div class="px-4 py-3 border-t border-[#272f3d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Hiển thị <span class="text-white font-medium">{{ customerService.customers().length }}</span> trên tổng số <span class="text-white font-medium">{{ customerService.total() }}</span> hồ sơ
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              [disabled]="customerService.page() <= 1 || customerService.isLoading()"
              (click)="changePage(customerService.page() - 1)"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] disabled:opacity-40 disabled:cursor-not-allowed border border-[#272f3d] rounded text-slate-300 font-semibold transition-colors"
            >
              Trang trước
            </button>
            <span class="text-slate-300 px-2 font-mono">
              Trang {{ customerService.page() }} / {{ customerService.totalPages() }}
            </span>
            <button
              type="button"
              [disabled]="customerService.page() >= customerService.totalPages() || customerService.isLoading()"
              (click)="changePage(customerService.page() + 1)"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] disabled:opacity-40 disabled:cursor-not-allowed border border-[#272f3d] rounded text-slate-300 font-semibold transition-colors"
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

  onTypeFilterChange(value: 'ALL' | 'USER' | 'GUEST'): void {
    this.customerService.typeFilter.set(value);
    void this.customerService.loadCustomers({ page: 1, type: value });
  }

  onStatusFilterChange(value: 'ALL' | 'ACTIVE' | 'MERGED' | 'INACTIVE'): void {
    this.customerService.statusFilter.set(value);
    void this.customerService.loadCustomers({ page: 1, status: value });
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
