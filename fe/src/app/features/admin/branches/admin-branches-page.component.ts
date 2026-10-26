import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BranchFormDialogComponent } from './components/branch-form-dialog.component';
import { AppIconModule } from '../../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import {
  AdminBranch,
  AdminBranchService,
} from './services/admin-branch.service';

type ConfirmDialogState = {
  isOpen: boolean;
  branch: AdminBranch | null;
  isProcessing: boolean;
};

type ToastNotification = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

@Component({
  selector: 'app-admin-branches-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BranchFormDialogComponent, AppIconModule, SelectComponent],
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary-strong font-mono text-xs font-bold">
            SCR-29
          </span>
          <div>
            <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
              Chi Nhánh & Khu Vực
            </h1>
            <p class="text-[13px] text-muted mt-0.5">
              Quản lý các chi nhánh kho kiêm showroom và cấu hình ưu tiên phục vụ giao hàng
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="openCreateModal()"
            class="px-3.5 py-2 bg-primary hover:bg-primary-strong text-primary-foreground font-bold text-xs rounded transition-colors shadow-xs inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <lucide-icon name="plus" class="size-4" aria-hidden="true"></lucide-icon>
            <span>Thêm chi nhánh</span>
          </button>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative flex-1">
            <input
              type="text"
              [ngModel]="branchService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm kiếm theo mã, tên hoặc địa chỉ..."
              class="w-full pl-9 pr-4 py-2 bg-surface-alt border border-line rounded text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
            />
            <lucide-icon
              name="search"
              class="size-4 text-muted absolute left-3 top-2.5 pointer-events-none"
              aria-hidden="true"
            ></lucide-icon>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[13px] text-muted font-medium whitespace-nowrap">Trạng thái:</span>
            <app-select
              [options]="statusOptions"
              [value]="branchService.statusFilter()"
              (valueChange)="onStatusFilterChange($event)"
              size="sm"
              class="w-48"
              ariaLabel="Lọc theo trạng thái chi nhánh"
            />
          </div>
        </div>

        <div class="text-[13px] text-muted text-right">
          Tổng số: <strong class="text-foreground">{{ branchService.total() }}</strong> chi nhánh
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-[13px]">
            <thead class="bg-surface-alt/80 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th class="py-3 px-4">Mã chi nhánh</th>
                <th class="py-3 px-4">Tên chi nhánh</th>
                <th class="py-3 px-4">Địa chỉ</th>
                <th class="py-3 px-4">Giờ mở cửa</th>
                <th class="py-3 px-4 text-center">Ưu tiên giao</th>
                <th class="py-3 px-4">Khu vực phục vụ</th>
                <th class="py-3 px-4 text-center">Trạng thái</th>
                <th class="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              @if (branchService.isLoading()) {
                @for (placeholder of [1, 2, 3]; track placeholder) {
                  <tr class="animate-pulse">
                    <td class="py-3.5 px-4"><div class="h-4 w-16 bg-surface-alt rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-40 bg-surface-alt rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-60 bg-surface-alt rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-24 bg-surface-alt rounded"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-4 w-8 bg-surface-alt rounded mx-auto"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-32 bg-surface-alt rounded"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-5 w-20 bg-surface-alt rounded-full mx-auto"></div></td>
                    <td class="py-3.5 px-4 text-right"><div class="h-6 w-16 bg-surface-alt rounded ml-auto"></div></td>
                  </tr>
                }
              } @else if (branchService.branches().length === 0) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-muted">
                    <p class="font-medium text-sm">Không tìm thấy chi nhánh nào</p>
                    <p class="text-[13px] text-muted mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc tạo thêm chi nhánh mới.</p>
                  </td>
                </tr>
              } @else {
                @for (item of branchService.branches(); track item.id) {
                  <tr class="hover:bg-surface-alt/50 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-primary-strong whitespace-nowrap">
                      {{ item.code }}
                    </td>
                    <td class="py-3.5 px-4 font-bold text-foreground whitespace-nowrap">
                      {{ item.name }}
                    </td>
                    <td class="py-3.5 px-4 text-muted max-w-xs truncate" [title]="item.address">
                      {{ item.address }}
                    </td>
                    <td class="py-3.5 px-4 text-muted whitespace-nowrap">
                      {{ formatOpeningHour(item.openingHour) }}
                    </td>
                    <td class="py-3.5 px-4 text-center tabular-nums font-bold text-foreground">
                      {{ item.deliveryPriority }}
                    </td>
                    <td class="py-3.5 px-4">
                      @if (item.deliveryAreaCodes && item.deliveryAreaCodes.length > 0) {
                        <div class="flex flex-wrap gap-1 max-w-xs">
                          @for (area of item.deliveryAreaCodes; track area) {
                            <span class="px-1.5 py-0.5 rounded bg-surface-alt border border-line font-mono text-[11px] text-foreground">
                              {{ area }}
                            </span>
                          }
                        </div>
                      } @else {
                        <span class="text-muted italic">Toàn quốc</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                      @if (item.isActive) {
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                          Hoạt Động
                        </span>
                      } @else {
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-muted border border-line uppercase tracking-wide">
                          Tạm Dừng
                        </span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="openEditModal(item)"
                          class="p-1.5 rounded bg-surface hover:bg-surface-alt text-muted hover:text-foreground border border-line transition-colors shadow-xs"
                          title="Chỉnh sửa thông tin chi nhánh"
                          aria-label="Chỉnh sửa chi nhánh"
                        >
                          <lucide-icon name="square-pen" class="size-3.5" aria-hidden="true"></lucide-icon>
                        </button>

                        <button
                          type="button"
                          (click)="confirmToggleStatus(item)"
                          class="p-1.5 rounded bg-surface hover:bg-surface-alt border border-line transition-colors shadow-xs"
                          [ngClass]="item.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-primary-strong hover:text-primary'"
                          [title]="item.isActive ? 'Tạm dừng chi nhánh' : 'Kích hoạt lại chi nhánh'"
                          [attr.aria-label]="item.isActive ? 'Tạm dừng chi nhánh' : 'Kích hoạt lại chi nhánh'"
                        >
                          <lucide-icon [name]="item.isActive ? 'ban' : 'check'" class="size-3.5" aria-hidden="true"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        @if (branchService.totalPages() > 1) {
          <div class="p-4 border-t border-line flex items-center justify-between text-[13px] text-muted">
            <div>
              Trang <strong class="text-foreground">{{ branchService.page() }}</strong> trên <strong class="text-foreground">{{ branchService.totalPages() }}</strong>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="branchService.page() <= 1"
                (click)="onPageChange(branchService.page() - 1)"
                class="px-3 py-1.5 bg-surface border border-line rounded text-foreground disabled:opacity-40 hover:bg-surface-alt transition-colors shadow-xs"
              >
                Trước
              </button>
              <button
                type="button"
                [disabled]="branchService.page() >= branchService.totalPages()"
                (click)="onPageChange(branchService.page() + 1)"
                class="px-3 py-1.5 bg-surface border border-line rounded text-foreground disabled:opacity-40 hover:bg-surface-alt transition-colors shadow-xs"
              >
                Sau
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- MOD-39 Modal -->
    <app-branch-form-dialog
      [isOpen]="isFormModalOpen()"
      [branch]="selectedBranch()"
      (closeDialog)="closeFormModal()"
      (branchSaved)="onBranchSaved($event)"
    />

    <!-- Status Change Confirm Dialog -->
    @if (confirmDialog().isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        role="alertdialog"
        aria-modal="true"
      >
        <div class="bg-surface border border-line rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 text-foreground">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
              <lucide-icon name="alert-triangle" class="size-5" aria-hidden="true"></lucide-icon>
            </div>
            <div>
              <h3 class="font-bold text-foreground text-base">
                {{ confirmDialog().branch?.isActive ? 'Xác Nhận Tạm Dừng Chi Nhánh' : 'Xác Nhận Kích Hoạt Chi Nhánh' }}
              </h3>
              <p class="text-[13px] text-muted mt-1 leading-relaxed">
                Bạn có chắc chắn muốn {{ confirmDialog().branch?.isActive ? 'tạm dừng hoạt động' : 'kích hoạt lại hoạt động' }} của chi nhánh
                <strong class="text-foreground">[{{ confirmDialog().branch?.code }}] {{ confirmDialog().branch?.name }}</strong>?
              </p>
              @if (confirmDialog().branch?.isActive) {
                <p class="text-xs text-amber-600 mt-2">
                  Lưu ý: Khi tạm dừng, chi nhánh này sẽ không thể tiếp nhận xử lý đơn hàng mới và không tham gia điều phối giao hàng.
                </p>
              }
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              (click)="closeConfirmDialog()"
              [disabled]="confirmDialog().isProcessing"
              class="px-4 py-2 bg-surface hover:bg-surface-alt text-foreground font-semibold rounded text-[13px] border border-line transition-colors shadow-xs"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="executeToggleStatus()"
              [disabled]="confirmDialog().isProcessing"
              class="px-4 py-2 bg-primary hover:bg-primary-strong disabled:opacity-50 text-primary-foreground font-bold rounded text-[13px] transition-colors shadow-xs"
            >
              {{ confirmDialog().isProcessing ? 'Đang cập nhật...' : 'Xác Nhận Thay Đổi' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Toast Notifications -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-[13px] font-semibold border flex items-center justify-between gap-3 animate-fade-in bg-surface border-line"
          [ngClass]="toast.type === 'success' ? 'text-primary-strong border-primary/30' : 'text-rose-600 border-rose-200'"
        >
          <span>{{ toast.message }}</span>
          <button
            type="button"
            (click)="dismissToast(toast.id)"
            class="text-slate-400 hover:text-white"
            aria-label="Đóng thông báo"
          >
            <lucide-icon name="x" class="size-3.5" aria-hidden="true"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBranchesPageComponent implements OnInit {
  readonly branchService = inject(AdminBranchService);

  readonly statusOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả chi nhánh' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Tạm dừng hoạt động' },
  ];

  readonly isFormModalOpen = signal<boolean>(false);
  readonly selectedBranch = signal<AdminBranch | null>(null);

  readonly confirmDialog = signal<ConfirmDialogState>({
    isOpen: false,
    branch: null,
    isProcessing: false,
  });

  readonly toasts = signal<ToastNotification[]>([]);
  private toastCounter = 0;

  ngOnInit(): void {
    void this.branchService.loadBranches();
  }

  onSearchChange(term: string): void {
    this.branchService.setSearchQuery(term);
    void this.branchService.loadBranches({ search: term, page: 1 });
  }

  onStatusFilterChange(filter: string): void {
    this.branchService.setStatusFilter(filter as 'ALL' | 'ACTIVE' | 'INACTIVE');
    void this.branchService.loadBranches({ page: 1 });
  }

  onPageChange(newPage: number): void {
    this.branchService.setPage(newPage);
    void this.branchService.loadBranches({ page: newPage });
  }

  openCreateModal(): void {
    this.selectedBranch.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(branch: AdminBranch): void {
    this.selectedBranch.set(branch);
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.selectedBranch.set(null);
  }

  onBranchSaved(branch: AdminBranch): void {
    this.showToast(`Lưu chi nhánh "${branch.name}" thành công`, 'success');
  }

  confirmToggleStatus(branch: AdminBranch): void {
    this.confirmDialog.set({
      isOpen: true,
      branch,
      isProcessing: false,
    });
  }

  closeConfirmDialog(): void {
    this.confirmDialog.set({
      isOpen: false,
      branch: null,
      isProcessing: false,
    });
  }

  async executeToggleStatus(): Promise<void> {
    const branch = this.confirmDialog().branch;
    if (!branch) {
      return;
    }

    this.confirmDialog.update((state) => ({ ...state, isProcessing: true }));

    try {
      const updated = await this.branchService.toggleStatus(branch.id);
      const actionText = updated.isActive ? 'Kích hoạt' : 'Tạm dừng';
      this.showToast(`${actionText} chi nhánh "${updated.name}" thành công`, 'success');
      this.closeConfirmDialog();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái chi nhánh';
      this.showToast(msg, 'error');
      this.confirmDialog.update((state) => ({ ...state, isProcessing: false }));
    }
  }

  formatOpeningHour(raw: unknown): string {
    if (typeof raw === 'string') {
      return raw;
    }
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      if (typeof obj['display'] === 'string') {
        return obj['display'];
      }
      if (typeof obj['mon_fri'] === 'string') {
        return obj['mon_fri'];
      }
    }
    return '08:00 - 21:30';
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const id = ++this.toastCounter;
    this.toasts.update((current) => [...current, { id, message, type }]);

    setTimeout(() => {
      this.dismissToast(id);
    }, 4000);
  }

  dismissToast(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
