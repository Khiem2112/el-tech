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
  imports: [CommonModule, FormsModule, BranchFormDialogComponent],
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-29
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Chi Nhánh & Khu Vực
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Quản lý các chi nhánh kho kiêm showroom và cấu hình ưu tiên phục vụ giao hàng
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
            <span>Thêm chi nhánh</span>
          </button>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative flex-1">
            <input
              type="text"
              [ngModel]="branchService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm kiếm theo mã, tên hoặc địa chỉ..."
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
            <label for="status-filter" class="text-xs text-slate-400 font-medium whitespace-nowrap">Trạng thái:</label>
            <select
              id="status-filter"
              [ngModel]="branchService.statusFilter()"
              (ngModelChange)="onStatusFilterChange($event)"
              class="px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-slate-200 focus:outline-none focus:border-[#76b900]"
            >
              <option value="ALL">Tất cả chi nhánh</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm dừng hoạt động</option>
            </select>
          </div>
        </div>

        <div class="text-xs text-slate-400 text-right">
          Tổng số: <strong class="text-white">{{ branchService.total() }}</strong> chi nhánh
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#090d16]/70 border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
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
            <tbody class="divide-y divide-[#272f3d] text-xs">
              @if (branchService.isLoading()) {
                @for (placeholder of [1, 2, 3]; track placeholder) {
                  <tr class="animate-pulse">
                    <td class="py-3.5 px-4"><div class="h-4 w-16 bg-[#272f3d] rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-40 bg-[#272f3d] rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-60 bg-[#272f3d] rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-24 bg-[#272f3d] rounded"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-4 w-8 bg-[#272f3d] rounded mx-auto"></div></td>
                    <td class="py-3.5 px-4"><div class="h-4 w-32 bg-[#272f3d] rounded"></div></td>
                    <td class="py-3.5 px-4 text-center"><div class="h-5 w-20 bg-[#272f3d] rounded-full mx-auto"></div></td>
                    <td class="py-3.5 px-4 text-right"><div class="h-6 w-16 bg-[#272f3d] rounded ml-auto"></div></td>
                  </tr>
                }
              } @else if (branchService.branches().length === 0) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-slate-400">
                    <p class="font-medium text-sm">Không tìm thấy chi nhánh nào</p>
                    <p class="text-xs text-slate-500 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc tạo thêm chi nhánh mới.</p>
                  </td>
                </tr>
              } @else {
                @for (item of branchService.branches(); track item.id) {
                  <tr class="hover:bg-[#1a2130] transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-[#76b900] whitespace-nowrap">
                      {{ item.code }}
                    </td>
                    <td class="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {{ item.name }}
                    </td>
                    <td class="py-3.5 px-4 text-slate-300 max-w-xs truncate" [title]="item.address">
                      {{ item.address }}
                    </td>
                    <td class="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {{ formatOpeningHour(item.openingHour) }}
                    </td>
                    <td class="py-3.5 px-4 text-center tabular-nums font-bold text-white">
                      {{ item.deliveryPriority }}
                    </td>
                    <td class="py-3.5 px-4">
                      @if (item.deliveryAreaCodes && item.deliveryAreaCodes.length > 0) {
                        <div class="flex flex-wrap gap-1 max-w-xs">
                          @for (area of item.deliveryAreaCodes; track area) {
                            <span class="px-1.5 py-0.5 rounded bg-[#090d16] border border-[#272f3d] font-mono text-[10px] text-slate-300">
                              {{ area }}
                            </span>
                          }
                        </div>
                      } @else {
                        <span class="text-slate-500 italic">Toàn quốc</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                      @if (item.isActive) {
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#76b900]/15 text-[#76b900] border border-[#76b900]/30 uppercase tracking-wide">
                          Hoạt Động
                        </span>
                      } @else {
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30 uppercase tracking-wide">
                          Tạm Dừng
                        </span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="openEditModal(item)"
                          class="p-1.5 rounded bg-[#090d16] hover:bg-[#272f3d] text-slate-300 hover:text-white border border-[#272f3d] transition-colors"
                          title="Chỉnh sửa thông tin chi nhánh"
                          aria-label="Chỉnh sửa chi nhánh"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          (click)="confirmToggleStatus(item)"
                          class="p-1.5 rounded bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] transition-colors"
                          [ngClass]="item.isActive ? 'text-amber-400 hover:text-amber-300' : 'text-[#76b900] hover:text-[#88d400]'"
                          [title]="item.isActive ? 'Tạm dừng chi nhánh' : 'Kích hoạt lại chi nhánh'"
                          [attr.aria-label]="item.isActive ? 'Tạm dừng chi nhánh' : 'Kích hoạt lại chi nhánh'"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
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
          <div class="p-4 border-t border-[#272f3d] flex items-center justify-between text-xs text-slate-400">
            <div>
              Trang <strong class="text-white">{{ branchService.page() }}</strong> trên <strong class="text-white">{{ branchService.totalPages() }}</strong>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="branchService.page() <= 1"
                (click)="onPageChange(branchService.page() - 1)"
                class="px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-slate-300 disabled:opacity-40 hover:bg-[#272f3d] transition-colors"
              >
                Trước
              </button>
              <button
                type="button"
                [disabled]="branchService.page() >= branchService.totalPages()"
                (click)="onPageChange(branchService.page() + 1)"
                class="px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-slate-300 disabled:opacity-40 hover:bg-[#272f3d] transition-colors"
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
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="alertdialog"
        aria-modal="true"
      >
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 text-white">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-white text-base">
                {{ confirmDialog().branch?.isActive ? 'Xác Nhận Tạm Dừng Chi Nhánh' : 'Xác Nhận Kích Hoạt Chi Nhánh' }}
              </h3>
              <p class="text-xs text-slate-300 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn {{ confirmDialog().branch?.isActive ? 'tạm dừng hoạt động' : 'kích hoạt lại hoạt động' }} của chi nhánh
                <strong class="text-white">[{{ confirmDialog().branch?.code }}] {{ confirmDialog().branch?.name }}</strong>?
              </p>
              @if (confirmDialog().branch?.isActive) {
                <p class="text-[11px] text-amber-400/90 mt-2">
                  Lưu ý: Khi tạm dừng, chi nhánh này sẽ không thể tiếp nhận xử lý đơn hàng mới và không tham gia điều phối giao hàng.
                </p>
              }
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#272f3d]">
            <button
              type="button"
              (click)="closeConfirmDialog()"
              [disabled]="confirmDialog().isProcessing"
              class="px-4 py-2 bg-[#1e2533] hover:bg-[#272f3d] text-slate-300 font-semibold rounded text-xs border border-[#272f3d] transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              (click)="executeToggleStatus()"
              [disabled]="confirmDialog().isProcessing"
              class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:opacity-50 text-[#090d16] font-bold rounded text-xs transition-colors shadow-sm"
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
          class="pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-xs font-semibold border flex items-center justify-between gap-3 animate-fade-in"
          [ngClass]="toast.type === 'success' ? 'bg-[#161b26] text-[#76b900] border-[#76b900]/40' : 'bg-[#161b26] text-rose-400 border-rose-500/40'"
        >
          <span>{{ toast.message }}</span>
          <button
            type="button"
            (click)="dismissToast(toast.id)"
            class="text-slate-400 hover:text-white"
            aria-label="Đóng thông báo"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBranchesPageComponent implements OnInit {
  readonly branchService = inject(AdminBranchService);

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

  onStatusFilterChange(filter: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.branchService.setStatusFilter(filter);
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
