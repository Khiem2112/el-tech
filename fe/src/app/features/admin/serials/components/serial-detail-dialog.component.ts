import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
import {
  AdminSerialService,
  SerialDetailResponse,
  SimpleBranchOption,
} from '../services/admin-serial.service';

@Component({
  selector: 'app-serial-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonDirective, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          (click)="onClose()"
          tabindex="-1"
          aria-hidden="true"
        ></div>

        <div
          class="relative bg-surface border border-line shadow-2xl rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-sm text-foreground overflow-hidden"
        >
          <div class="h-16 px-6 border-b border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            <div class="flex items-center gap-3 min-w-0">
              <div class="min-w-0">
                <h2 class="font-bold text-foreground text-base truncate">
                  Vòng Đời & Lịch Sử Di Chuyển Serial
                </h2>
                @if (detail; as d) {
                  <p class="text-xs text-muted tabular truncate">
                    SN: <strong class="text-foreground">{{ d.serialNumber }}</strong> | SKU: {{ d.sku }}
                  </p>
                }
              </div>
            </div>

            <button
              type="button"
              (click)="onClose()"
              class="p-2 rounded bg-surface hover:bg-surface-alt text-muted hover:text-foreground transition-colors border border-line"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6 flex-1">
            @if (isLoading) {
              <div class="py-12 flex flex-col items-center justify-center gap-3 text-muted">
                <svg class="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Đang tải thông tin vòng đời serial...</span>
              </div>
            } @else if (detail; as d) {
              <div class="p-4 bg-surface-alt border border-line rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="min-w-0 space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-foreground text-base">{{ d.productTemplate.name }}</span>
                    <span class="text-xs px-2 py-0.5 rounded font-bold uppercase" [ngClass]="getStatusBadgeClass(d.status)">
                      {{ getStatusLabel(d.status) }}
                    </span>
                  </div>
                  <div class="text-xs text-muted tabular flex items-center gap-3 flex-wrap">
                    <span>Thương hiệu: <strong class="text-foreground">{{ d.productTemplate.brandName }}</strong></span>
                    <span>Nhóm: <strong class="text-foreground">{{ d.productTemplate.categoryName }}</strong></span>
                    <span>Giá niêm yết: <strong class="text-primary-strong tabular-nums">{{ formatCurrency(d.sellingPrice) }}</strong></span>
                  </div>
                </div>

                <div class="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-line">
                  <span class="text-xs uppercase tracking-wider text-muted block font-semibold">Kho hiện tại</span>
                  <span class="font-bold text-foreground text-sm">
                    {{ d.currentBranch?.name ?? 'Chưa phân bổ chi nhánh' }}
                  </span>
                  @if (d.currentBranch) {
                    <span class="text-xs text-muted tabular block">({{ d.currentBranch.code }})</span>
                  }
                </div>
              </div>

              @if (isAdjustingStatus()) {
                <div class="p-4 bg-surface-alt border border-warning/50 rounded-lg space-y-3">
                  <div class="flex items-center justify-between border-b border-line pb-2">
                    <span class="text-xs font-bold text-warning uppercase tracking-wider">Điều chỉnh trạng thái serial</span>
                    <button
                      type="button"
                      (click)="isAdjustingStatus.set(false)"
                      class="text-xs text-muted hover:text-foreground"
                    >
                      Hủy
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span class="block text-muted mb-1 font-semibold">Trạng thái mới</span>
                      <app-select
                        [options]="statusAdjustmentOptions"
                        [value]="newStatus"
                        (valueChange)="newStatus = $event"
                        size="md"
                      />
                    </div>

                    <div>
                      <span class="block text-muted mb-1 font-semibold">Chi nhánh phân bổ</span>
                      <app-select
                        [options]="branchOptions()"
                        [value]="selectedBranchFilterId()"
                        (valueChange)="onBranchChange($event)"
                        [searchable]="true"
                        searchPlaceholder="Tìm chi nhánh..."
                        size="md"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="adjust-reason" class="block text-muted mb-1 font-semibold">Lý do điều chỉnh</label>
                    <input
                      id="adjust-reason"
                      type="text"
                      [(ngModel)]="adjustmentReason"
                      placeholder="Nhập lý do can thiệp trạng thái serial..."
                      class="w-full h-9 bg-surface border border-line rounded px-3 py-2 text-foreground text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  @if (adjustmentError()) {
                    <p class="text-xs text-danger font-semibold">{{ adjustmentError() }}</p>
                  }

                  <div class="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      (click)="isAdjustingStatus.set(false)"
                      appButton
                      variant="secondary"
                      size="sm"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      [disabled]="isSubmittingAdjustment()"
                      (click)="saveStatusAdjustment(d.id)"
                      appButton
                      variant="primary"
                      size="sm"
                    >
                      {{ isSubmittingAdjustment() ? 'Đang lưu...' : 'Xác nhận cập nhật' }}
                    </button>
                  </div>
                </div>
              } @else {
                <div class="space-y-4">
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div class="p-2.5 rounded bg-surface-alt border border-line">
                      <span class="text-xs uppercase font-semibold text-muted block">Thời hạn BH</span>
                      <strong class="text-foreground text-sm font-bold">{{ d.warranty.durationMonths }} Tháng</strong>
                    </div>
                    <div class="p-2.5 rounded bg-surface-alt border border-line">
                      <span class="text-xs uppercase font-semibold text-muted block">Bắt đầu BH</span>
                      <strong class="text-foreground text-xs font-bold tabular">{{ formatDate(d.warranty.startDate) }}</strong>
                    </div>
                    <div class="p-2.5 rounded bg-surface-alt border border-line">
                      <span class="text-xs uppercase font-semibold text-muted block">Hết hạn BH</span>
                      <strong class="text-primary-strong text-xs font-bold tabular">{{ formatDate(d.warranty.endDate) }}</strong>
                    </div>
                    <div class="p-2.5 rounded bg-surface-alt border border-line">
                      <span class="text-xs uppercase font-semibold text-muted block">Số lần BH</span>
                      <strong class="text-foreground text-sm font-bold">{{ d.warranty.warrantyClaimCount }} lần</strong>
                    </div>
                  </div>

                  <div class="space-y-3 pt-2">
                    <div class="flex items-center justify-between border-b border-line pb-1.5">
                      <span class="font-bold text-foreground uppercase tracking-wider text-xs">Lộ trình luân chuyển</span>
                      <span class="text-xs text-muted tabular">{{ d.movements.length }} trạm</span>
                    </div>

                    @if (d.movements.length === 0) {
                      <div class="py-6 text-center text-xs text-muted">Chưa có lịch sử di chuyển</div>
                    } @else {
                      <div class="border-l border-line ml-2 pl-4 space-y-3 text-xs">
                        @for (mov of d.movements; track mov.id) {
                          <div class="relative">
                            <span class="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full ring-2 ring-surface" [ngClass]="getMovementDotClass(mov.resultingStatus)"></span>
                            <div class="font-bold text-foreground">{{ mov.summaryText }}</div>
                            <div class="text-xs text-muted flex items-center gap-2 flex-wrap mt-0.5 tabular">
                              <span>{{ formatDateTime(mov.occurredAt) }}</span>
                              <span>| Phiếu: <strong class="text-primary-strong">{{ mov.stockMoveCode }}</strong></span>
                              @if (mov.orderCode) {
                                <span>| Đơn: <strong class="text-foreground">{{ mov.orderCode }}</strong></span>
                              }
                            </div>
                            <div class="text-xs font-semibold mt-0.5" [ngClass]="getStatusTextClass(mov.resultingStatus)">
                              Trạng thái: {{ getStatusLabel(mov.resultingStatus) }}
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>

          <div class="h-14 px-6 border-t border-line flex items-center justify-between flex-shrink-0 bg-surface-alt">
            <div>
              @if (detail && !isAdjustingStatus()) {
                <button
                  type="button"
                  (click)="openAdjustStatus()"
                  appButton
                  variant="secondary"
                  size="sm"
                  class="flex items-center gap-1.5"
                >
                  <svg class="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Điều Chỉnh Trạng Thái</span>
                </button>
              }
            </div>

            <button
              type="button"
              (click)="onClose()"
              appButton
              variant="outline"
              size="sm"
              class="uppercase tracking-wide"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SerialDetailDialogComponent {
  private readonly serialService = inject(AdminSerialService);

  @Input() isOpen = false;
  @Input() detail: SerialDetailResponse | null = null;
  @Input() isLoading = false;
  @Input() branches: SimpleBranchOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  readonly isAdjustingStatus = signal<boolean>(false);
  readonly isSubmittingAdjustment = signal<boolean>(false);
  readonly adjustmentError = signal<string | null>(null);
  readonly selectedBranchFilterId = signal<string>('');

  newStatus: string = 'AVAILABLE';
  selectedBranchId: number | null = null;
  adjustmentReason: string = '';

  readonly statusAdjustmentOptions: SelectOption[] = [
    { value: 'AVAILABLE', label: 'Trong kho (Khả dụng)' },
    { value: 'RESERVED', label: 'Đã gán xuất kho' },
    { value: 'IN_TRANSIT', label: 'Đang điều chuyển' },
    { value: 'ISSUED', label: 'Đã xuất bán' },
    { value: 'QUARANTINED', label: 'Cách ly lỗi' },
    { value: 'RETURNED_TO_SUPPLIER', label: 'Xuất trả nhà cung cấp' },
  ];

  readonly branchOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Giữ nguyên chi nhánh' },
    ...this.branches.map((b) => ({
      value: String(b.id),
      label: `${b.name} (${b.code})`,
    })),
  ]);

  onClose(): void {
    this.isAdjustingStatus.set(false);
    this.close.emit();
  }

  openAdjustStatus(): void {
    if (this.detail) {
      this.newStatus = this.detail.status;
      this.selectedBranchId = this.detail.currentBranch?.id ?? null;
      this.selectedBranchFilterId.set(this.selectedBranchId ? String(this.selectedBranchId) : '');
      this.adjustmentReason = '';
      this.adjustmentError.set(null);
      this.isAdjustingStatus.set(true);
    }
  }

  onBranchChange(val: string): void {
    this.selectedBranchFilterId.set(val);
    this.selectedBranchId = val ? Number(val) : null;
  }

  async saveStatusAdjustment(serialId: string): Promise<void> {
    this.isSubmittingAdjustment.set(true);
    this.adjustmentError.set(null);

    try {
      await this.serialService.updateStatus(
        serialId,
        this.newStatus,
        this.selectedBranchId ?? undefined,
        this.adjustmentReason.trim() || undefined,
      );
      this.isAdjustingStatus.set(false);
      this.updated.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái';
      this.adjustmentError.set(msg);
    } finally {
      this.isSubmittingAdjustment.set(false);
    }
  }

  formatCurrency(value: string | number): string {
    const num = Number(value);
    if (isNaN(num)) {
      return '0 đ';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'RESERVED':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'IN_TRANSIT':
        return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'ISSUED':
        return 'bg-surface-alt text-foreground border border-line';
      case 'QUARANTINED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'RETURNED_TO_SUPPLIER':
        return 'bg-surface-alt text-muted border border-line';
      default:
        return 'bg-surface-alt text-muted border border-line';
    }
  }

  formatDate(isoDate: string | null): string {
    if (!isoDate) {
      return '-';
    }
    const d = new Date(isoDate);
    return d.toLocaleDateString('vi-VN');
  }

  formatDateTime(isoDate: string | null): string {
    if (!isoDate) {
      return '-';
    }
    const d = new Date(isoDate);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  getMovementDotClass(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500';
      case 'RESERVED':
        return 'bg-amber-500';
      case 'IN_TRANSIT':
        return 'bg-sky-500';
      case 'ISSUED':
        return 'bg-primary';
      case 'QUARANTINED':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }

  getStatusTextClass(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'text-emerald-700';
      case 'RESERVED':
        return 'text-amber-700';
      case 'IN_TRANSIT':
        return 'text-sky-700';
      case 'ISSUED':
        return 'text-foreground';
      case 'QUARANTINED':
        return 'text-rose-700';
      default:
        return 'text-muted';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'Trong kho (Khả dụng)';
      case 'RESERVED':
        return 'Đã gán xuất kho';
      case 'IN_TRANSIT':
        return 'Đang chuyển';
      case 'ISSUED':
        return 'Đã xuất bán';
      case 'QUARANTINED':
        return 'Cách ly lỗi';
      case 'RETURNED_TO_SUPPLIER':
        return 'Trả nhà cung cấp';
      default:
        return status;
    }
  }
}
