import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppIconModule } from '../../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { AdminPaginationComponent } from '../components/admin-pagination.component';
import { ComplaintDeleteDialogComponent } from './components/complaint-delete-dialog.component';
import { ComplaintDetailDialogComponent } from './components/complaint-detail-dialog.component';
import {
  ComplaintStatusChangePayload,
  ComplaintStatusDialogComponent,
} from './components/complaint-status-dialog.component';
import {
  AdminComplaintItem,
  AdminComplaintService,
  ComplaintStatus,
} from './services/admin-complaint.service';

type ToastNotification = {
  readonly id: string;
  readonly message: string;
  readonly type: 'success' | 'error' | 'warning';
};

@Component({
  selector: 'app-admin-complaints-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppIconModule,
    SelectComponent,
    AdminPaginationComponent,
    ComplaintDetailDialogComponent,
    ComplaintStatusDialogComponent,
    ComplaintDeleteDialogComponent,
  ],
  template: `
    <div class="p-4 lg:p-6 space-y-4 w-full text-xs text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold tracking-tight uppercase text-foreground">
            Quản Lý Đơn Khiếu Nại & Hỗ Trợ
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Theo dõi, xử lý và phân loại các yêu cầu đổi trả, bảo hành và phản ánh chất lượng từ khách hàng
          </p>
        </div>

        <button
          type="button"
          (click)="onRefresh()"
          [disabled]="complaintService.isLoading()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-alt border border-line rounded text-xs font-semibold text-foreground transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <lucide-icon
            name="refresh-cw"
            class="w-3.5 h-3.5"
            [class.animate-spin]="complaintService.isLoading()"
            aria-hidden="true"
          ></lucide-icon>
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      <!-- Quick KPI Cards with Filter Triggers -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          type="button"
          (click)="onFilterByStatus('ALL')"
          class="p-3 rounded-lg border text-left transition-all cursor-pointer"
          [class]="selectedStatus === 'ALL' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-surface border-line hover:border-line-hover'"
        >
          <div class="text-muted text-xs font-medium">Tổng khiếu nại</div>
          <div class="text-xl font-bold text-foreground tabular-nums mt-1">
            {{ complaintService.stats().total }}
          </div>
          <div class="text-xs text-muted mt-0.5">Tất cả các phiếu</div>
        </button>

        <button
          type="button"
          (click)="onFilterByStatus('RECEIVED')"
          class="p-3 rounded-lg border text-left transition-all cursor-pointer"
          [class]="selectedStatus === 'RECEIVED' ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500' : 'bg-surface border-line hover:border-line-hover'"
        >
          <div class="text-amber-600 text-xs font-medium">Đã tiếp nhận</div>
          <div class="text-xl font-bold text-amber-600 tabular-nums mt-1">
            {{ complaintService.stats().received }}
          </div>
          <div class="text-xs text-muted mt-0.5">Chờ thẩm định</div>
        </button>

        <button
          type="button"
          (click)="onFilterByStatus('PROCESSING')"
          class="p-3 rounded-lg border text-left transition-all cursor-pointer"
          [class]="selectedStatus === 'PROCESSING' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-surface border-line hover:border-line-hover'"
        >
          <div class="text-primary text-xs font-medium">Đang xử lý</div>
          <div class="text-xl font-bold text-primary tabular-nums mt-1">
            {{ complaintService.stats().processing }}
          </div>
          <div class="text-xs text-muted mt-0.5">Đang test/liên hệ</div>
        </button>

        <button
          type="button"
          (click)="onFilterByStatus('RESOLVED')"
          class="p-3 rounded-lg border text-left transition-all cursor-pointer"
          [class]="selectedStatus === 'RESOLVED' ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500' : 'bg-surface border-line hover:border-line-hover'"
        >
          <div class="text-emerald-600 text-xs font-medium">Đã xử lý</div>
          <div class="text-xl font-bold text-emerald-600 tabular-nums mt-1">
            {{ complaintService.stats().resolved }}
          </div>
          <div class="text-xs text-muted mt-0.5">Đã hoàn tất</div>
        </button>

        <button
          type="button"
          (click)="onFilterByStatus('DISMISSED')"
          class="p-3 rounded-lg border text-left transition-all cursor-pointer col-span-2 sm:col-span-1"
          [class]="selectedStatus === 'DISMISSED' ? 'bg-rose-500/10 border-rose-500 ring-1 ring-rose-500' : 'bg-surface border-line hover:border-line-hover'"
        >
          <div class="text-rose-600 text-xs font-medium">Không xử lý</div>
          <div class="text-xl font-bold text-rose-600 tabular-nums mt-1">
            {{ complaintService.stats().dismissed }}
          </div>
          <div class="text-xs text-muted mt-0.5">Từ chối giải quyết</div>
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-surface border border-line rounded-lg overflow-hidden">
        <div class="p-3 border-b border-line flex items-center justify-between flex-wrap gap-2.5 bg-surface">
          <div class="flex items-center flex-wrap gap-2.5 flex-1">
            <div class="relative min-w-[220px] max-w-sm flex-1">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
                placeholder="Tìm mã phiếu KN-..., tên khách, SĐT, mã đơn..."
                class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground placeholder-muted focus:outline-none focus:border-primary text-xs"
              />
              @if (searchQuery) {
                <button
                  type="button"
                  (click)="searchQuery = ''; onSearch()"
                  class="absolute right-2 top-2 text-muted hover:text-foreground cursor-pointer"
                  title="Xóa tìm kiếm"
                  aria-label="Xóa tìm kiếm"
                >
                  <lucide-icon name="x" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
                </button>
              }
            </div>

            <app-select
              [options]="statusOptions"
              [value]="selectedStatus"
              (valueChange)="onStatusChange($event)"
              size="sm"
              class="w-44"
              ariaLabel="Lọc theo trạng thái"
            />

            <app-select
              [options]="categoryOptions"
              [value]="selectedCategory"
              (valueChange)="onCategoryChange($event)"
              size="sm"
              class="w-56"
              ariaLabel="Lọc theo phân loại khiếu nại"
            />

            <button
              type="button"
              (click)="onSearch()"
              class="px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <lucide-icon name="search" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
              <span>Lọc dữ liệu</span>
            </button>

            @if (isFiltered()) {
              <button
                type="button"
                (click)="onResetFilters()"
                class="px-2.5 py-1.5 text-xs text-muted hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            }
          </div>
        </div>

        <!-- Complaints Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-alt/70 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th class="py-3 px-4">Mã Phiếu</th>
                <th class="py-3 px-4">Khách Hàng</th>
                <th class="py-3 px-4">Đơn Hàng / Serial</th>
                <th class="py-3 px-4">Phân Loại Khiếu Nại</th>
                <th class="py-3 px-4 text-center">Trạng Thái</th>
                <th class="py-3 px-4 text-center">Ngày Tiếp Nhận</th>
                <th class="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line text-xs font-medium">
              @if (complaintService.isLoading()) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-muted">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <lucide-icon name="loader-circle" class="w-6 h-6 animate-spin text-primary" aria-hidden="true"></lucide-icon>
                      <span>Đang tải danh sách khiếu nại...</span>
                    </div>
                  </td>
                </tr>
              } @else if (complaintService.complaints().length === 0) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-muted">
                    <div class="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <lucide-icon name="file-text" class="w-8 h-8 text-muted" aria-hidden="true"></lucide-icon>
                      <span class="font-bold text-foreground">Không tìm thấy phiếu khiếu nại nào</span>
                      <p class="text-xs text-muted leading-relaxed">
                        Hiện tại không có đơn khiếu nại nào khớp với điều kiện lọc hoặc từ khóa tìm kiếm đã chọn.
                      </p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (item of complaintService.complaints(); track item.id) {
                  <tr class="hover:bg-surface-alt/50 transition-colors">
                    <td class="py-3 px-4">
                      <div class="font-mono font-bold text-foreground tabular-nums">
                        #{{ item.code }}
                      </div>
                      @if (item.title) {
                        <div class="text-xs text-muted truncate max-w-[200px]" [title]="item.title">
                          {{ item.title }}
                        </div>
                      }
                    </td>

                    <td class="py-3 px-4">
                      <div class="font-bold text-foreground">{{ item.customerName }}</div>
                      <div class="text-muted tabular-nums">{{ item.customerPhone }}</div>
                      @if (item.customerEmail) {
                        <div class="text-muted text-xs truncate max-w-[180px]">{{ item.customerEmail }}</div>
                      }
                    </td>

                    <td class="py-3 px-4 font-mono text-xs">
                      @if (item.orderCode) {
                        <div>
                          <a
                            [routerLink]="['/admin/orders', item.orderId || item.orderCode]"
                            class="text-primary font-bold hover:underline"
                            title="Xem chi tiết đơn hàng"
                          >
                            {{ item.orderCode }}
                          </a>
                        </div>
                      } @else {
                        <span class="text-muted">Không kèm đơn</span>
                      }
                      @if (item.serialNumber) {
                        <div class="text-muted text-xs tabular-nums">
                          S/N: {{ item.serialNumber }}
                        </div>
                      }
                    </td>

                    <td class="py-3 px-4">
                      <span class="inline-block px-2 py-0.5 rounded bg-surface-alt border border-line text-foreground text-xs font-medium">
                        {{ item.category }}
                      </span>
                    </td>

                    <td class="py-3 px-4 text-center">
                      <span
                        class="inline-block px-2.5 py-0.5 rounded text-xs font-bold whitespace-nowrap"
                        [class]="getStatusBadgeClass(item.status)"
                      >
                        {{ getStatusLabel(item.status) }}
                      </span>
                    </td>

                    <td class="py-3 px-4 text-center tabular-nums text-muted whitespace-nowrap">
                      {{ item.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <div class="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          (click)="onOpenDetail(item)"
                          class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors cursor-pointer"
                          title="Xem chi tiết khiếu nại"
                          aria-label="Xem chi tiết khiếu nại"
                        >
                          <lucide-icon name="eye" class="w-4 h-4" aria-hidden="true"></lucide-icon>
                        </button>

                        <button
                          type="button"
                          (click)="onOpenStatusDialog(item)"
                          class="p-1.5 rounded hover:bg-surface-alt text-primary hover:text-primary-hover transition-colors cursor-pointer"
                          title="Chuyển trạng thái"
                          aria-label="Chuyển trạng thái"
                        >
                          <lucide-icon name="pencil" class="w-4 h-4" aria-hidden="true"></lucide-icon>
                        </button>

                        <button
                          type="button"
                          (click)="onOpenDeleteDialog(item)"
                          class="p-1.5 rounded hover:bg-rose-500/10 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Xóa phiếu khiếu nại"
                          aria-label="Xóa phiếu khiếu nại"
                        >
                          <lucide-icon name="trash-2" class="w-4 h-4" aria-hidden="true"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <app-admin-pagination
          [page]="complaintService.page()"
          [limit]="complaintService.limit()"
          [total]="complaintService.total()"
          [isLoading]="complaintService.isLoading()"
          itemName="phiếu khiếu nại"
          (pageChange)="onPageChange($event)"
        />
      </div>
    </div>

    <!-- Modals -->
    @if (selectedComplaintForDetail()) {
      <app-complaint-detail-dialog
        [complaint]="selectedComplaintForDetail()!"
        (close)="selectedComplaintForDetail.set(null)"
        (changeStatus)="onOpenStatusDialogFromDetail($event)"
      />
    }

    @if (selectedComplaintForStatus()) {
      <app-complaint-status-dialog
        [complaint]="selectedComplaintForStatus()!"
        [isSaving]="isStatusSaving"
        (cancel)="selectedComplaintForStatus.set(null)"
        (save)="onSaveStatus($event)"
      />
    }

    @if (selectedComplaintForDelete()) {
      <app-complaint-delete-dialog
        [complaint]="selectedComplaintForDelete()!"
        [isDeleting]="isDeleting"
        (cancel)="selectedComplaintForDelete.set(null)"
        (confirm)="onConfirmDelete()"
      />
    }

    <!-- Toast Notifications -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg border text-xs font-semibold flex items-center gap-2 max-w-sm transition-all"
          [class]="getToastClass(toast.type)"
        >
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComplaintsPageComponent implements OnInit {
  readonly complaintService = inject(AdminComplaintService);

  searchQuery = '';
  selectedStatus = 'ALL';
  selectedCategory = 'ALL';

  readonly selectedComplaintForDetail = signal<AdminComplaintItem | null>(null);
  readonly selectedComplaintForStatus = signal<AdminComplaintItem | null>(null);
  readonly selectedComplaintForDelete = signal<AdminComplaintItem | null>(null);

  readonly isStatusSaving = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  readonly toasts = signal<readonly ToastNotification[]>([]);

  readonly statusOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'RECEIVED', label: 'Đã tiếp nhận' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'RESOLVED', label: 'Đã xử lý' },
    { value: 'DISMISSED', label: 'Không xử lý' },
  ];

  readonly categoryOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả phân loại' },
    { value: 'Đổi trả linh kiện lỗi (Bảo hành)', label: 'Đổi trả linh kiện lỗi (Bảo hành)' },
    { value: 'Giao nhận & Vận chuyển', label: 'Giao nhận & Vận chuyển' },
    { value: 'Yêu cầu hoàn tiền', label: 'Yêu cầu hoàn tiền' },
    { value: 'Tư vấn kỹ thuật / Lắp ráp', label: 'Tư vấn kỹ thuật / Lắp ráp' },
    { value: 'Khác', label: 'Khác' },
  ];

  ngOnInit(): void {
    void this.complaintService.loadComplaints();
  }

  isFiltered(): boolean {
    return (
      Boolean(this.searchQuery.trim()) ||
      this.selectedStatus !== 'ALL' ||
      this.selectedCategory !== 'ALL'
    );
  }

  onFilterByStatus(status: string): void {
    this.selectedStatus = status;
    this.complaintService.statusFilter.set(status);
    void this.complaintService.loadComplaints({ page: 1, status });
  }

  onStatusChange(value: string): void {
    this.selectedStatus = value;
    this.complaintService.statusFilter.set(value);
    void this.complaintService.loadComplaints({ page: 1, status: value });
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.complaintService.categoryFilter.set(value);
    void this.complaintService.loadComplaints({ page: 1, category: value });
  }

  onSearch(): void {
    this.complaintService.searchQuery.set(this.searchQuery);
    void this.complaintService.loadComplaints({
      page: 1,
      search: this.searchQuery,
      status: this.selectedStatus,
      category: this.selectedCategory,
    });
  }

  onResetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedCategory = 'ALL';
    this.complaintService.searchQuery.set('');
    this.complaintService.statusFilter.set('ALL');
    this.complaintService.categoryFilter.set('ALL');
    void this.complaintService.loadComplaints({
      page: 1,
      search: '',
      status: 'ALL',
      category: 'ALL',
    });
  }

  onRefresh(): void {
    void this.complaintService.loadComplaints();
  }

  onPageChange(newPage: number): void {
    void this.complaintService.loadComplaints({ page: newPage });
  }

  onOpenDetail(item: AdminComplaintItem): void {
    this.selectedComplaintForDetail.set(item);
  }

  onOpenStatusDialog(item: AdminComplaintItem): void {
    this.selectedComplaintForStatus.set(item);
  }

  onOpenStatusDialogFromDetail(item: AdminComplaintItem): void {
    this.selectedComplaintForDetail.set(null);
    this.selectedComplaintForStatus.set(item);
  }

  onOpenDeleteDialog(item: AdminComplaintItem): void {
    this.selectedComplaintForDelete.set(item);
  }

  async onSaveStatus(payload: ComplaintStatusChangePayload): Promise<void> {
    const item = this.selectedComplaintForStatus();
    if (!item) return;

    this.isStatusSaving.set(true);
    try {
      await this.complaintService.updateStatus(item.id, payload.status, payload.resolutionNote);
      this.selectedComplaintForStatus.set(null);
      this.showToast('Cập nhật trạng thái khiếu nại thành công.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái';
      this.showToast(msg, 'error');
    } finally {
      this.isStatusSaving.set(false);
    }
  }

  async onConfirmDelete(): Promise<void> {
    const item = this.selectedComplaintForDelete();
    if (!item) return;

    this.isDeleting.set(true);
    try {
      await this.complaintService.deleteComplaint(item.id);
      this.selectedComplaintForDelete.set(null);
      this.showToast(`Đã xóa phiếu khiếu nại #${item.code} thành công.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xóa phiếu khiếu nại';
      this.showToast(msg, 'error');
    } finally {
      this.isDeleting.set(false);
    }
  }

  getStatusLabel(status: ComplaintStatus): string {
    switch (status) {
      case 'RECEIVED':
        return 'Đã tiếp nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'RESOLVED':
        return 'Đã xử lý';
      case 'DISMISSED':
        return 'Không xử lý';
      default:
        return status;
    }
  }

  getStatusBadgeClass(status: ComplaintStatus): string {
    switch (status) {
      case 'RECEIVED':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'PROCESSING':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'DISMISSED':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      default:
        return 'bg-surface-alt text-muted border border-line';
    }
  }

  getToastClass(type: 'success' | 'error' | 'warning'): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200';
      case 'error':
        return 'bg-rose-950/90 border-rose-500/40 text-rose-200';
      case 'warning':
        return 'bg-amber-950/90 border-amber-500/40 text-amber-200';
    }
  }

  private showToast(message: string, type: 'success' | 'error' | 'warning'): void {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const toast: ToastNotification = { id, message, type };
    this.toasts.update((current) => [...current, toast]);
    setTimeout(() => {
      this.toasts.update((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }
}

