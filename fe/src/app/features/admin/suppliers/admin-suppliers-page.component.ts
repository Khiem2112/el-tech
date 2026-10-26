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
import { BadgeDirective } from '../../../components/atoms/badge/badge.directive';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
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
  imports: [CommonModule, FormsModule, ButtonDirective, BadgeDirective, SelectComponent, SupplierFormDialogComponent],
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Nhà Cung Cấp
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Quản lý danh bạ đối tác và nhà phân phối linh kiện phần cứng chính hãng
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="openCreateModal()"
            appButton
            variant="primary"
            size="sm"
            class="uppercase tracking-wide shadow-sm inline-flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Nhà Cung Cấp</span>
          </button>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 flex flex-col md:flex-row md:items-end justify-between gap-4 shadow-card">
        <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div class="relative flex-1">
            <label for="supplier-search" class="block text-[11px] font-semibold text-muted uppercase mb-1">Tìm kiếm</label>
            <div class="relative">
              <input
                id="supplier-search"
                type="text"
                [ngModel]="supplierService.searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Tìm theo tên nhà cung cấp, mã đối tác, người liên hệ, SĐT..."
                class="w-full h-9 pl-9 pr-4 bg-surface border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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

          <div class="w-full sm:w-56">
            <span class="block text-[11px] font-semibold text-muted uppercase mb-1">Trạng thái</span>
            <app-select
              [options]="statusOptions"
              [value]="supplierService.statusFilter()"
              (valueChange)="onStatusFilterChange($event)"
              size="md"
            />
          </div>
        </div>

        <div class="text-xs text-muted text-right whitespace-nowrap">
          Tổng số: <strong class="text-foreground">{{ visibleSuppliers().length }}</strong> đối tác
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-card overflow-hidden">
        @if (supplierService.isLoading()) {
          <div class="p-8 text-center text-muted space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải danh bạ nhà cung cấp...</p>
          </div>
        } @else if (visibleSuppliers().length === 0) {
          <div class="p-12 text-center text-muted space-y-3">
            <div class="w-12 h-12 mx-auto rounded-full bg-surface-alt border border-line flex items-center justify-center text-muted">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-foreground">Không tìm thấy nhà cung cấp phù hợp</h3>
            <p class="text-xs text-muted max-w-sm mx-auto">
              Không có đối tác nào khớp với từ khóa tìm kiếm hoặc bộ lọc được chọn.
            </p>
            <button
              type="button"
              (click)="clearFilters()"
              appButton
              variant="secondary"
              size="sm"
            >
              Xóa bộ lọc
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left min-w-[1000px] border-collapse">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4 whitespace-nowrap">Mã NCC</th>
                  <th class="py-3 px-4 whitespace-nowrap">Tên Nhà Cung Cấp</th>
                  <th class="py-3 px-4 whitespace-nowrap">Người Liên Hệ</th>
                  <th class="py-3 px-4 whitespace-nowrap">Số Điện Thoại</th>
                  <th class="py-3 px-4 whitespace-nowrap">Email</th>
                  <th class="py-3 px-4">Kho Xuất Hàng</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Đơn Mua Hàng</th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Trạng Thái</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-xs text-foreground">
                @for (supplier of visibleSuppliers(); track supplier.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors group">
                    <td class="py-3 px-4 font-mono font-bold text-foreground text-xs whitespace-nowrap">
                      {{ supplier.code }}
                    </td>

                    <td class="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <span
                          class="w-2 h-2 rounded-full flex-shrink-0"
                          [class.bg-primary]="supplier.isActive"
                          [class.bg-muted]="!supplier.isActive"
                        ></span>
                        <span class="font-bold text-foreground">{{ supplier.name }}</span>
                      </div>
                    </td>

                    <td class="py-3 px-4 text-foreground whitespace-nowrap">
                      @if (supplier.contactName) {
                        <span>{{ supplier.contactName }}</span>
                      } @else {
                        <span class="text-xs text-muted italic">Chưa cập nhật</span>
                      }
                    </td>

                    <td class="py-3 px-4 font-mono text-xs text-foreground whitespace-nowrap">
                      @if (supplier.phone) {
                        <span>{{ supplier.phone }}</span>
                      } @else {
                        <span class="text-xs text-muted italic">Chưa cập nhật</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-foreground whitespace-nowrap">
                      @if (supplier.email) {
                        <a [href]="'mailto:' + supplier.email" class="hover:text-primary-strong underline-offset-2 hover:underline">
                          {{ supplier.email }}
                        </a>
                      } @else {
                        <span class="text-xs text-muted italic">Chưa cập nhật</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-xs text-muted max-w-xs truncate" [title]="supplier.address || ''">
                      @if (supplier.address) {
                        <span>{{ supplier.address }}</span>
                      } @else {
                        <span class="text-muted italic">Chưa cập nhật</span>
                      }
                    </td>

                    <td class="py-3 px-4 text-center tabular-nums whitespace-nowrap">
                      <div class="font-bold text-foreground">
                        {{ supplier.purchaseOrderCount }}
                      </div>
                      <div class="text-[11px] text-muted">đơn PO</div>
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @if (supplier.isActive) {
                        <span appBadge variant="success" class="whitespace-nowrap uppercase">
                          HOẠT ĐỘNG
                        </span>
                      } @else {
                        <span appBadge variant="muted" class="whitespace-nowrap uppercase">
                          TẠM DỪNG
                        </span>
                      }
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap shrink-0">
                      <div class="flex items-center justify-end gap-1.5 whitespace-nowrap shrink-0">
                        <button
                          type="button"
                          (click)="openEditModal(supplier)"
                          appButton
                          variant="secondary"
                          size="sm"
                          class="h-8 w-8 p-0"
                          title="Chỉnh sửa thông tin nhà cung cấp"
                        >
                          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          (click)="toggleSupplierStatus(supplier)"
                          appButton
                          variant="outline"
                          size="sm"
                          class="h-8 w-8 p-0"
                          [title]="supplier.isActive ? 'Tạm dừng hợp tác' : 'Kích hoạt hợp tác'"
                        >
                          @if (supplier.isActive) {
                            <svg class="w-4 h-4 text-warning" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          } @else {
                            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                        </button>

                        @if (supplier.purchaseOrderCount === 0) {
                          <button
                            type="button"
                            (click)="deleteSupplier(supplier)"
                            appButton
                            variant="danger"
                            size="sm"
                            class="h-8 w-8 p-0"
                            title="Xóa nhà cung cấp"
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
            class="pointer-events-auto px-4 py-3 rounded-lg shadow-card text-xs font-semibold flex items-center justify-between gap-3 border transition-all"
            [class.bg-surface]="true"
            [class.border-primary]="toast.type === 'success'"
            [class.text-primary-strong]="toast.type === 'success'"
            [class.border-danger]="toast.type === 'error'"
            [class.text-danger]="toast.type === 'error'"
            [class.border-line]="toast.type === 'info'"
            [class.text-foreground]="toast.type === 'info'"
          >
            <span>{{ toast.message }}</span>
            <button
              type="button"
              (click)="removeToast(toast.id)"
              class="text-muted hover:text-foreground"
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

  readonly statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang hợp tác' },
    { value: 'INACTIVE', label: 'Tạm dừng hợp tác' },
  ];

  ngOnInit(): void {
    void this.supplierService.loadSuppliers();
  }

  onSearchChange(term: string): void {
    this.supplierService.setSearchQuery(term);
    void this.supplierService.loadSuppliers({ search: term });
  }

  onStatusFilterChange(filter: string): void {
    const typed = filter as 'ALL' | 'ACTIVE' | 'INACTIVE';
    this.supplierService.setStatusFilter(typed);
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
