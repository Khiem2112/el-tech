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
import { AppIconModule } from '../../../components/atoms/icon/icon.module';
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
  imports: [CommonModule, FormsModule, ButtonDirective, BadgeDirective, SelectComponent, SupplierFormDialogComponent, AppIconModule],
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-xs text-foreground">
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
            class="uppercase tracking-wide shadow-xs inline-flex items-center gap-1.5"
          >
            <lucide-icon name="plus" class="size-4" aria-hidden="true"></lucide-icon>
            <span>Thêm Nhà Cung Cấp</span>
          </button>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-3.5 flex flex-col md:flex-row md:items-end justify-between gap-3 shadow-xs">
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
                class="w-full h-8 pl-8 pr-3 bg-white border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
              />
              <lucide-icon
                name="search"
                class="size-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none"
                aria-hidden="true"
              ></lucide-icon>
            </div>
          </div>

          <div class="w-full sm:w-56">
            <span class="block text-[11px] font-semibold text-muted uppercase mb-1">Trạng thái</span>
            <app-select
              [options]="statusOptions"
              [value]="supplierService.statusFilter()"
              (valueChange)="onStatusFilterChange($event)"
              size="sm"
            />
          </div>
        </div>

        <div class="text-xs text-muted text-right whitespace-nowrap">
          Tổng số: <strong class="text-foreground tabular tabular-nums">{{ visibleSuppliers().length }}</strong> đối tác
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
        @if (supplierService.isLoading()) {
          <div class="p-8 text-center text-muted space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải danh bạ nhà cung cấp...</p>
          </div>
        } @else if (visibleSuppliers().length === 0) {
          <div class="p-12 text-center text-muted space-y-3">
            <div class="w-10 h-10 mx-auto rounded-full bg-surface-alt border border-line flex items-center justify-center text-muted">
              <lucide-icon name="store" class="size-5" aria-hidden="true"></lucide-icon>
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
            <table class="w-full text-left min-w-[900px] border-collapse text-sm">
              <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-2.5 px-4 whitespace-nowrap">Nhà Cung Cấp</th>
                  <th class="py-2.5 px-4 whitespace-nowrap">Thông Tin Liên Hệ</th>
                  <th class="py-2.5 px-4">Kho / Địa Chỉ</th>
                  <th class="py-2.5 px-4 text-center whitespace-nowrap">Đơn PO</th>
                  <th class="py-2.5 px-4 text-center whitespace-nowrap">Trạng Thái</th>
                  <th class="py-2.5 px-4 text-right whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-sm text-foreground">
                @for (supplier of visibleSuppliers(); track supplier.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors group">
                    <td class="py-2.5 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <span
                          class="w-2 h-2 rounded-full flex-shrink-0"
                          [class.bg-primary]="supplier.isActive"
                          [class.bg-muted]="!supplier.isActive"
                        ></span>
                        <div>
                          <div class="font-bold text-foreground text-sm">{{ supplier.name }}</div>
                          <div class="tabular text-xs text-muted">{{ supplier.code }}</div>
                        </div>
                      </div>
                    </td>

                    <td class="py-2.5 px-4 whitespace-nowrap">
                      @if (supplier.contactName) {
                        <div class="font-medium text-foreground">{{ supplier.contactName }}</div>
                      }
                      <div class="flex items-center gap-2 text-xs text-muted">
                        @if (supplier.phone) {
                          <span class="tabular">{{ supplier.phone }}</span>
                        }
                        @if (supplier.phone && supplier.email) {
                          <span>&bull;</span>
                        }
                        @if (supplier.email) {
                          <a [href]="'mailto:' + supplier.email" class="hover:text-primary hover:underline">
                            {{ supplier.email }}
                          </a>
                        }
                        @if (!supplier.contactName && !supplier.phone && !supplier.email) {
                          <span class="italic">Chưa cập nhật</span>
                        }
                      </div>
                    </td>

                    <td class="py-2.5 px-4 text-xs text-muted max-w-xs truncate" [title]="supplier.address || ''">
                      @if (supplier.address) {
                        <span>{{ supplier.address }}</span>
                      } @else {
                        <span class="italic">Chưa cập nhật</span>
                      }
                    </td>

                    <td class="py-2.5 px-4 text-center tabular-nums whitespace-nowrap">
                      <strong class="text-foreground tabular">{{ supplier.purchaseOrderCount }}</strong>
                      <span class="text-xs text-muted ml-1">đơn</span>
                    </td>

                    <td class="py-2.5 px-4 text-center whitespace-nowrap">
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

                    <td class="py-2.5 px-4 text-right whitespace-nowrap shrink-0">
                      <div class="flex items-center justify-end gap-1.5 whitespace-nowrap shrink-0">
                        <button
                          type="button"
                          (click)="openEditModal(supplier)"
                          appButton
                          variant="secondary"
                          size="sm"
                          class="h-7 w-7 p-0"
                          title="Chỉnh sửa thông tin nhà cung cấp"
                          aria-label="Chỉnh sửa nhà cung cấp"
                        >
                          <lucide-icon name="pencil" class="size-3.5 text-muted" aria-hidden="true"></lucide-icon>
                        </button>

                        <button
                          type="button"
                          (click)="toggleSupplierStatus(supplier)"
                          appButton
                          variant="outline"
                          size="sm"
                          class="h-7 w-7 p-0"
                          [title]="supplier.isActive ? 'Tạm dừng hợp tác' : 'Kích hoạt hợp tác'"
                          [attr.aria-label]="supplier.isActive ? 'Tạm dừng hợp tác' : 'Kích hoạt hợp tác'"
                        >
                          @if (supplier.isActive) {
                            <lucide-icon name="ban" class="size-3.5 text-amber-600" aria-hidden="true"></lucide-icon>
                          } @else {
                            <lucide-icon name="check" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                          }
                        </button>

                        @if (supplier.purchaseOrderCount === 0) {
                          <button
                            type="button"
                            (click)="deleteSupplier(supplier)"
                            appButton
                            variant="danger"
                            size="sm"
                            class="h-7 w-7 p-0"
                            title="Xóa nhà cung cấp"
                            aria-label="Xóa nhà cung cấp"
                          >
                            <lucide-icon name="trash-2" class="size-3.5" aria-hidden="true"></lucide-icon>
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
            class="pointer-events-auto px-3.5 py-2.5 rounded-lg shadow-card text-xs font-semibold flex items-center justify-between gap-3 border transition-all"
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
              aria-label="Đóng thông báo"
            >
              <lucide-icon name="x" class="size-3.5" aria-hidden="true"></lucide-icon>
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
