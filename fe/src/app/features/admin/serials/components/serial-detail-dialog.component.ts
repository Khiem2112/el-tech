import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminSerialService,
  SerialDetailResponse,
  SimpleBranchOption,
} from '../services/admin-serial.service';

@Component({
  selector: 'app-serial-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          (click)="onClose()"
          tabindex="-1"
          aria-hidden="true"
        ></div>

        <div
          class="relative bg-[#161b26] border border-[#272f3d] shadow-2xl rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-sm text-slate-200 overflow-hidden"
        >
          <div class="h-16 px-6 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
            <div class="flex items-center gap-3 min-w-0">
              <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold shrink-0">
                MOD-23
              </span>
              <div class="min-w-0">
                <h2 class="font-bold text-white text-base truncate">
                  Vòng Đời & Lịch Sử Di Chuyển Serial
                </h2>
                @if (detail; as d) {
                  <p class="text-xs text-slate-400 font-mono truncate">
                    SN: <strong class="text-white">{{ d.serialNumber }}</strong> | SKU: {{ d.sku }}
                  </p>
                }
              </div>
            </div>

            <button
              type="button"
              (click)="onClose()"
              class="p-2 rounded bg-[#161b26] hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Dong"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6 flex-1">
            @if (isLoading) {
              <div class="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <svg class="w-8 h-8 animate-spin text-[#76b900]" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Dang tai thong tin vong doi serial...</span>
              </div>
            } @else if (detail; as d) {
              <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="min-w-0 space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-white text-base">{{ d.productTemplate.name }}</span>
                    <span class="text-xs px-2 py-0.5 rounded font-bold uppercase" [ngClass]="getStatusBadgeClass(d.status)">
                      {{ getStatusLabel(d.status) }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-400 font-mono flex items-center gap-3 flex-wrap">
                    <span>Thuong hieu: <strong class="text-slate-300">{{ d.productTemplate.brandName }}</strong></span>
                    <span>Nhom: <strong class="text-slate-300">{{ d.productTemplate.categoryName }}</strong></span>
                    <span>Gia niem yet: <strong class="text-[#76b900]">{{ formatCurrency(d.sellingPrice) }}</strong></span>
                  </div>
                </div>

                <div class="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#272f3d]">
                  <span class="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Kho hien tai</span>
                  <span class="font-bold text-white text-sm">
                    {{ d.currentBranch?.name ?? 'Chua phan bo chi nhanh' }}
                  </span>
                  @if (d.currentBranch) {
                    <span class="text-xs text-slate-400 font-mono block">({{ d.currentBranch.code }})</span>
                  }
                </div>
              </div>

              <div class="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-emerald-300 text-xs">
                So Serial linh kien duoc quan ly bat bien theo tung lan chuyen trang thai kho. Quy tac INV-014 dam bao moi serial vat ly chi ton tai o duy nhat mot chi nhanh tai mot thoi diem.
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded-lg space-y-2">
                  <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
                    <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Chinh sach bao hanh</span>
                    <span class="text-[11px] px-2 py-0.5 rounded font-mono font-bold" [ngClass]="d.warranty.isExpired ? 'bg-rose-950/60 text-rose-300 border border-rose-800' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'">
                      {{ d.warranty.isExpired ? 'Het han bao hanh' : 'Chinh hang con han' }}
                    </span>
                  </div>
                  <div class="space-y-1.5 text-xs text-slate-300">
                    <div class="flex justify-between">
                      <span class="text-slate-400">Thoi han tieu chuan:</span>
                      <strong class="font-bold text-white">{{ d.warranty.durationMonths }} Thang</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">Trung tam bao hanh:</span>
                      <strong class="font-bold text-white">{{ d.warranty.serviceProvider }}</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">Bat dau bao hanh:</span>
                      <span class="font-mono text-slate-200">{{ formatDate(d.warranty.startDate) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">Du kien het han:</span>
                      <span class="font-mono text-emerald-400 font-bold">{{ formatDate(d.warranty.endDate) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">So lan tiep nhan BH/Loi:</span>
                      <strong class="font-bold" [ngClass]="d.warranty.warrantyClaimCount > 0 ? 'text-amber-400' : 'text-slate-300'">
                        {{ d.warranty.warrantyClaimCount }} lan
                      </strong>
                    </div>
                  </div>
                </div>

                <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded-lg space-y-2">
                  <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
                    <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Nguon goc nhap kho</span>
                    <span class="text-[11px] text-slate-400 font-mono">Dau ky PO</span>
                  </div>
                  @if (d.origin; as orig) {
                    <div class="space-y-1.5 text-xs text-slate-300">
                      <div class="flex justify-between">
                        <span class="text-slate-400">Chung tu kho:</span>
                        <span class="font-mono text-[#76b900] font-bold">{{ orig.stockMoveCode }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Don mua PO:</span>
                        <span class="font-mono text-white font-bold">{{ orig.purchaseOrderCode ?? 'Nhap truc tiep' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Nha cung cap:</span>
                        <strong class="text-white">{{ orig.supplierName ?? 'Khong xac dinh' }}</strong>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Thoi gian nhan:</span>
                        <span class="font-mono text-slate-300">{{ formatDate(orig.receivedAt) }}</span>
                      </div>
                    </div>
                  } @else {
                    <p class="text-xs text-slate-500 py-3 text-center">Khong co chung tu nhap goc</p>
                  }
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
                  <span class="text-xs font-bold text-white uppercase tracking-wider">
                    Lich Su Di Chuyen & Nhat Ky Bien Dong ({{ d.movements.length }})
                  </span>
                  <span class="text-[11px] text-slate-400 font-mono">Theo thu tu thoi gian</span>
                </div>

                @if (d.movements.length === 0) {
                  <div class="p-6 bg-[#090d16] border border-[#272f3d] rounded-lg text-center text-xs text-slate-500">
                    Chua ghi nhan nhat ky di chuyen cho serial nay
                  </div>
                } @else {
                  <div class="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#272f3d]">
                    @for (mov of d.movements; track mov.id) {
                      <div class="relative group">
                        <span
                          class="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-[#161b26] transition-transform group-hover:scale-120"
                          [ngClass]="getMovementDotClass(mov.resultingStatus)"
                        ></span>

                        <div class="bg-[#090d16] border border-[#272f3d] hover:border-slate-600 rounded-lg p-3 space-y-1.5 transition-colors">
                          <div class="flex items-center justify-between gap-2 flex-wrap">
                            <span class="font-bold text-white text-xs">
                              {{ mov.summaryText }}
                            </span>
                            <span class="text-[11px] px-2 py-0.5 rounded font-bold uppercase" [ngClass]="getStatusBadgeClass(mov.resultingStatus)">
                              {{ getStatusLabel(mov.resultingStatus) }}
                            </span>
                          </div>

                          <div class="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                            <span class="font-mono text-slate-300">{{ formatDateTime(mov.occurredAt) }}</span>
                            @if (mov.stockMoveCode) {
                              <span>Phieu: <strong class="text-[#76b900] font-mono">{{ mov.stockMoveCode }}</strong></span>
                            }
                            @if (mov.actorName) {
                              <span>Nguoi thuc hien: <strong class="text-slate-200">{{ mov.actorName }}</strong></span>
                            }
                          </div>

                          <div class="text-[11px] text-slate-400 font-mono flex items-center gap-2 flex-wrap pt-0.5">
                            @if (mov.fromBranchName) {
                              <span>Tu: <strong class="text-slate-300">{{ mov.fromBranchName }}</strong> ({{ mov.fromBranchCode }})</span>
                            }
                            @if (mov.toBranchName) {
                              <span>Den: <strong class="text-slate-300">{{ mov.toBranchName }}</strong> ({{ mov.toBranchCode }})</span>
                            }
                            @if (mov.reason) {
                              <span class="text-slate-300 italic">Ghi chu: {{ mov.reason }}</span>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              @if (isAdjustingStatus()) {
                <div class="p-4 bg-[#090d16] border border-amber-800/60 rounded-lg space-y-3">
                  <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
                    <span class="text-xs font-bold text-amber-300 uppercase tracking-wider">Dieu chinh trang thai serial</span>
                    <button
                      type="button"
                      (click)="isAdjustingStatus.set(false)"
                      class="text-xs text-slate-400 hover:text-white"
                    >
                      Huy
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label class="block text-slate-400 mb-1 font-semibold">Trang thai moi</label>
                      <select
                        [(ngModel)]="newStatus"
                        class="w-full bg-[#161b26] border border-[#272f3d] rounded px-3 py-2 text-white focus:outline-none focus:border-[#76b900]"
                      >
                        <option value="AVAILABLE">AVAILABLE - San sang trong kho</option>
                        <option value="RESERVED">RESERVED - Da khoa don hang</option>
                        <option value="IN_TRANSIT">IN_TRANSIT - Dang dieu chuyen</option>
                        <option value="ISSUED">ISSUED - Da ban giao / xuat ban</option>
                        <option value="QUARANTINED">QUARANTINED - Cach ly / Bao hanh loi</option>
                        <option value="RETURNED_TO_SUPPLIER">RETURNED_TO_SUPPLIER - Xuat tra NCC</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-slate-400 mb-1 font-semibold">Chi nhanh phan bo</label>
                      <select
                        [(ngModel)]="selectedBranchId"
                        class="w-full bg-[#161b26] border border-[#272f3d] rounded px-3 py-2 text-white focus:outline-none focus:border-[#76b900]"
                      >
                        <option [ngValue]="null">Giu nguyen chi nhanh</option>
                        @for (b of branches; track b.id) {
                          <option [ngValue]="b.id">{{ b.name }} ({{ b.code }})</option>
                        }
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Ly do dieu chinh</label>
                    <input
                      type="text"
                      [(ngModel)]="adjustmentReason"
                      placeholder="Nhap ly do can thiep trang thai serial..."
                      class="w-full bg-[#161b26] border border-[#272f3d] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#76b900]"
                    />
                  </div>

                  @if (adjustmentError()) {
                    <p class="text-xs text-rose-400">{{ adjustmentError() }}</p>
                  }

                  <div class="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      (click)="isAdjustingStatus.set(false)"
                      class="px-3 py-1.5 rounded bg-[#161b26] hover:bg-[#272f3d] text-slate-300 text-xs font-semibold"
                    >
                      Dong
                    </button>
                    <button
                      type="button"
                      [disabled]="isSubmittingAdjustment()"
                      (click)="saveStatusAdjustment(d.id)"
                      class="px-4 py-1.5 rounded bg-[#76b900] hover:bg-[#5a8d00] text-black font-bold text-xs disabled:opacity-50"
                    >
                      {{ isSubmittingAdjustment() ? 'Dang luu...' : 'Xac nhan cap nhat' }}
                    </button>
                  </div>
                </div>
              }
            }
          </div>

          <div class="h-14 px-6 border-t border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
            <div>
              @if (detail && !isAdjustingStatus()) {
                <button
                  type="button"
                  (click)="openAdjustStatus()"
                  class="px-3 py-1.5 rounded bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Dieu Chinh Trang Thai</span>
                </button>
              }
            </div>

            <button
              type="button"
              (click)="onClose()"
              class="px-5 py-2 rounded bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs uppercase tracking-wide"
            >
              Dong
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

  newStatus: string = 'AVAILABLE';
  selectedBranchId: number | null = null;
  adjustmentReason: string = '';

  onClose(): void {
    this.isAdjustingStatus.set(false);
    this.close.emit();
  }

  openAdjustStatus(): void {
    if (this.detail) {
      this.newStatus = this.detail.status;
      this.selectedBranchId = this.detail.currentBranch?.id ?? null;
      this.adjustmentReason = '';
      this.adjustmentError.set(null);
      this.isAdjustingStatus.set(true);
    }
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
      const msg = err instanceof Error ? err.message : 'Loi khi cap nhat trang thai';
      this.adjustmentError.set(msg);
    } finally {
      this.isSubmittingAdjustment.set(false);
    }
  }

  formatCurrency(value: string | number): string {
    const num = Number(value);
    if (isNaN(num)) {
      return '0 d';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' d';
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-800';
      case 'RESERVED':
        return 'bg-amber-950/80 text-amber-300 border border-amber-800';
      case 'IN_TRANSIT':
        return 'bg-blue-950/80 text-blue-300 border border-blue-800';
      case 'ISSUED':
        return 'bg-purple-950/80 text-purple-300 border border-purple-800';
      case 'QUARANTINED':
        return 'bg-rose-950/80 text-rose-300 border border-rose-800';
      case 'RETURNED_TO_SUPPLIER':
        return 'bg-slate-800 text-slate-300 border border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'Trong kho';
      case 'RESERVED':
        return 'Da dat truoc';
      case 'IN_TRANSIT':
        return 'Dang chuyen';
      case 'ISSUED':
        return 'Da xuat ban';
      case 'QUARANTINED':
        return 'Cach ly loi';
      case 'RETURNED_TO_SUPPLIER':
        return 'Tra nha cung cap';
      default:
        return status;
    }
  }

  getMovementDotClass(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500';
      case 'RESERVED':
        return 'bg-amber-500';
      case 'IN_TRANSIT':
        return 'bg-blue-500';
      case 'ISSUED':
        return 'bg-purple-500';
      case 'QUARANTINED':
        return 'bg-rose-500';
      case 'RETURNED_TO_SUPPLIER':
        return 'bg-slate-400';
      default:
        return 'bg-slate-500';
    }
  }
}
