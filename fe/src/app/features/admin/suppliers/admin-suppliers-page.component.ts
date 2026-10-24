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
import { SupplierFormDialogComponent } from './components/supplier-form-dialog.component';
import {
  AdminSupplier,
  AdminSupplierService,
} from './services/admin-supplier.service';

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

@Component({
  selector: 'app-admin-suppliers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SupplierFormDialogComponent],
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-19
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Nhà Cung Cấp
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Quản lý danh bạ đối tác và nhà phân phối linh kiện phần cứng chính hãng (PUR-001)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="openCreateModal()"
            class="px-3.5 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors shadow-sm inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Nhà Cung Cấp</span>
          </button>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative flex-1">
            <input
              type="text"
              [ngModel]="supplierService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm theo tên nhà cung cấp, mã đối tác, người liên hệ, SĐT..."
              class="w-full pl-9 pr-4 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
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

          <div class="flex items-center gap-2">
            <label for="supplier-status-filter" class="text-xs text-slate-400 font-medium whitespace-nowrap">Trạng thái:</label>
            <select
              id="supplier-status-filter"
              [ngModel]="supplierService.statusFilter()"
              (ngModelChange)="onStatusFilterChange($event)"
              class="px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hợp tác</option>
              <option value="INACTIVE">Tạm dừng hợp tác</option>
            </select>
          </div>
        </div>

        <div class="text-xs text-slate-400 text-right">
          Tổng số: <strong class="text-white">{{ visibleSuppliers().length }}</strong> đối tác
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        @if (supplierService.isLoading()) {
          <div class="p-8 text-center text-slate-400 space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-[#76b900] border-r-transparent border-b-[#76b900] border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải danh bạ nhà cung cấp...</p>
          </div>
        } @else if (visibleSuppliers().length === 0) {
          <div class="p-12 text-center text-slate-400 space-y-3">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#090d16] border border-[#272f3d] flex items-center justify-center text-slate-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-300">Không tìm thấy nhà cung cấp phù hợp</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Không có đối tác nào khớp với từ khóa tìm kiếm hoặc bộ lọc được chọn.
            </p>
            <button
              type="button"
              (click)="clearFilters()"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded text-xs text-slate-300 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4">Mã NCC</th>
                  <th class="py-3 px-4">Tên Nhà Cung Cấp</th>
                  <th class="py-3 px-4">Người Liên Hệ</th>
                  <th class="py-3 px-4">Số Điện Thoại</th>
                  <th class="py-3 px-4">Email</th>
                  <th class="py-3 px-4">Kho Xuất Hàng</th>
                  <th class="py-3 px-4 text-center">Đơn Mua Hàng</th>
                  <th class="py-3 px-4 text-center">Trạng Thái</th>
                  <th class="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d]">
                @for (supplier of visibleSuppliers(); track supplier.id) {
                  <tr class="hover:bg-[#1f2633] transition-colors group">
                    <td class="py-3 px-4 font-mono font-bold text-white text-xs whitespace-nowrap">
                      {{ supplier.code }}
                    </td>

                    <td class="py-3 px-4 font-semibold text-white">
                      <div class="flex items-center gap-2">
                        <span
                          class="w-2 h-2 rounded-full flex-shrink-0"
                          [class.bg-[#76b900]]="supplier.isActive"
                          [class.bg-slate-500]="!supplier.isActive"
                        ></span>
                        <span class="font-bold text-white">{{ supplier.name }}</span>
                      </div>
                    </td>

                    <td class="py-3 px-4 text-slate-300 whitespace-nowrap">
                      @if (supplier.contactName) {
                        <span>{{ supplier.contactName }}</span>
                      } @else {
                        <span class="text-xs text-slate-500 italic">Chưa cập nhật</span>
                      }
                    </td>

                    <td class="py-3 px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                      @if (supplier.phone) {
                        <span>{{ supplier.phone }}</span>
                      } @else {
                        <span class="text-xs text-slate-500 italic">Chưa cập nhật</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-slate-300 whitespace-nowrap">
                      @if (supplier.email) {
                        <a [href]="'mailto:' + supplier.email" class="hover:text-[#76b900] underline-offset-2 hover:underline">
                          {{ supplier.email }}
                        </a>
                      } @else {
                        <span class="text-xs text-slate-500 italic">Chưa cập nhật</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-xs text-slate-400 max-w-xs truncate" [title]="supplier.address || ''">
                      @if (supplier.address) {
                        <span>{{ supplier.address }}</span>
                      } @else {
                        <span class="text-slate-500 italic">Chưa cập nhật</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-center tabular-nums">
                      <div class="font-bold text-white">
                        {{ supplier.purchaseOrderCount }}
                      </div>
                      <div class="text-[11px] text-slate-400">đơn PO</div>
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (supplier.isActive) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#76b900]/10 text-[#76b900] border border-[#76b900]/30">
                          HOẠT ĐỘNG
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          TẠM DỪNG
                        </span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="openEditModal(supplier)"
                          title="Chỉnh sửa thông tin nhà cung cấp"
                          class="p-1.5 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          (click)="toggleSupplierStatus(supplier)"
                          [title]="supplier.isActive ? 'Tạm dừng hợp tác' : 'Kích hoạt hợp tác'"
                          class="p-1.5 rounded hover:bg-[#272f3d] transition-colors"
                          [class.text-amber-400]="supplier.isActive"
                          [class.text-[#76b900]]="!supplier.isActive"
                        >
                          @if (supplier.isActive) {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          } @else {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                        </button>

                        @if (supplier.purchaseOrderCount === 0) {
                          <button
                            type="button"
                            (click)="deleteSupplier(supplier)"
                            title="Xóa nhà cung cấp"
                            class="p-1.5 rounded hover:bg-[#272f3d] text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <app-supplier-form-dialog
        [isOpen]="isDialogOpen()"
        [supplier]="selectedSupplier()"
        (closeDialog)="closeDialog()"
        (saved)="onSupplierSaved($event)"
      />

      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        @for (toast of toasts(); track toast.id) {
          <div
            class="pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-xs font-semibold flex items-center justify-between gap-3 border transition-all"
            [class.bg-emerald-950]="toast.type === 'success'"
            [class.border-emerald-600]="toast.type === 'success'"
            [class.text-emerald-200]="toast.type === 'success'"
            [class.bg-rose-950]="toast.type === 'error'"
            [class.border-rose-600]="toast.type === 'error'"
            [class.text-rose-200]="toast.type === 'error'"
            [class.bg-[#161b26]]="toast.type === 'info'"
            [class.border-[#272f3d]]="toast.type === 'info'"
            [class.text-slate-200]="toast.type === 'info'"
          >
            <span>{{ toast.message }}</span>
            <button
              type="button"
              (click)="removeToast(toast.id)"
              class="text-slate-400 hover:text-white"
              title="Đóng thông báo"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSuppliersPageComponent implements OnInit {
  readonly supplierService = inject(AdminSupplierService);

  readonly isDialogOpen = signal<boolean>(false);
  readonly selectedSupplier = signal<AdminSupplier | null>(null);
  readonly toasts = signal<ToastNotification[]>([]);

  readonly visibleSuppliers = computed(() => {
    return this.supplierService.suppliers();
  });

  ngOnInit(): void {
    void this.supplierService.loadSuppliers();
  }

  onSearchChange(term: string): void {
    this.supplierService.setSearchQuery(term);
    void this.supplierService.loadSuppliers({ search: term });
  }

  onStatusFilterChange(filter: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.supplierService.setStatusFilter(filter);
    void this.supplierService.loadSuppliers();
  }

  clearFilters(): void {
    this.supplierService.setSearchQuery('');
    this.supplierService.setStatusFilter('ALL');
    void this.supplierService.loadSuppliers();
  }

  openCreateModal(): void {
    this.selectedSupplier.set(null);
    this.isDialogOpen.set(true);
  }

  openEditModal(supplier: AdminSupplier): void {
    this.selectedSupplier.set(supplier);
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.selectedSupplier.set(null);
  }

  onSupplierSaved(saved: AdminSupplier): void {
    const isEdit = this.selectedSupplier() !== null;
    const msg = isEdit
      ? `Cập nhật nhà cung cấp ${saved.name} thành công`
      : `Tạo mới nhà cung cấp ${saved.name} thành công`;
    this.showToast(msg, 'success');
  }

  async toggleSupplierStatus(supplier: AdminSupplier): Promise<void> {
    try {
      const updated = await this.supplierService.toggleSupplierStatus(supplier.id);
      const actionName = updated.isActive ? 'Kích hoạt' : 'Tạm dừng';
      this.showToast(`${actionName} nhà cung cấp ${updated.name} thành công`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
      this.showToast(message, 'error');
    }
  }

  async deleteSupplier(supplier: AdminSupplier): Promise<void> {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp "${supplier.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await this.supplierService.deleteSupplier(supplier.id);
      this.showToast(`Đã xóa nhà cung cấp ${supplier.name}`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xóa nhà cung cấp';
      this.showToast(message, 'error');
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    const id = Date.now();
    this.toasts.update((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
