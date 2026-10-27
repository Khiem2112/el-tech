import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { SerialDetailDialogComponent } from './components/serial-detail-dialog.component';
import { AdminSerialService, SerialDetailResponse } from './services/admin-serial.service';

@Component({
  selector: 'app-admin-serials-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonDirective, SelectComponent, SerialDetailDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-4 lg:p-6 space-y-6 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Tra Cứu Vòng Đời Sê-ri & Lịch Sử Bảo Hành
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Định danh đơn vị vật lý duy nhất, kiểm soát vị trí chi nhánh và truy vết bảo hành
          </p>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-muted">
            Tổng số: <strong class="text-foreground tabular tabular-nums">{{ summary().totalSerials }}</strong> sê-ri
          </span>
          <a
            routerLink="/admin/inventory/balances"
            appButton
            variant="secondary"
            size="sm"
            class="uppercase tracking-wide"
          >
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Tồn Kho Chi Nhánh</span>
          </a>
        </div>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          (click)="filterByStatus('ALL')"
          class="px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors"
          [ngClass]="activeStatus() === 'ALL' ? 'bg-primary text-primary-foreground border-primary font-bold' : 'bg-surface border-line text-foreground hover:bg-surface-alt'"
        >
          Tất cả ({{ summary().totalSerials }})
        </button>

        <button
          type="button"
          (click)="filterByStatus('AVAILABLE')"
          class="px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors"
          [ngClass]="activeStatus() === 'AVAILABLE' ? 'bg-emerald-700 text-white border-emerald-700 font-bold' : 'bg-surface border-line text-foreground hover:bg-surface-alt'"
        >
          Trong kho ({{ summary().availableCount }})
        </button>

        <button
          type="button"
          (click)="filterByStatus('RESERVED')"
          class="px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors"
          [ngClass]="activeStatus() === 'RESERVED' ? 'bg-amber-600 text-white border-amber-600 font-bold' : 'bg-surface border-line text-foreground hover:bg-surface-alt'"
        >
          Đã gán xuất ({{ summary().reservedCount }})
        </button>

        <button
          type="button"
          (click)="filterByStatus('IN_TRANSIT')"
          class="px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors"
          [ngClass]="activeStatus() === 'IN_TRANSIT' ? 'bg-sky-700 text-white border-sky-700 font-bold' : 'bg-surface border-line text-foreground hover:bg-surface-alt'"
        >
          Đang chuyển ({{ summary().inTransitCount }})
        </button>

        <button
          type="button"
          (click)="filterByStatus('ISSUED')"
          class="px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors"
          [ngClass]="activeStatus() === 'ISSUED' ? 'bg-surface-alt text-foreground border-line font-bold' : 'bg-surface border-line text-foreground hover:bg-surface-alt'"
        >
          Đã xuất bán ({{ summary().issuedCount }})
        </button>

        <button
          type="button"
          (click)="filterByStatus('QUARANTINED')"
          class="px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors"
          [ngClass]="activeStatus() === 'QUARANTINED' ? 'bg-danger text-white border-danger font-bold' : 'bg-surface border-line text-foreground hover:bg-surface-alt'"
        >
          Cách ly lỗi ({{ summary().quarantinedCount }})
        </button>
      </div>

      <div class="bg-surface border border-line rounded-lg p-4 space-y-3 max-w-4xl mx-auto">
        <form (ngSubmit)="onQuickScanSubmit()" class="flex items-center gap-2">
          <div class="relative flex-1">
            <input
              #scannerInput
              id="serial-scanner-input"
              autofocus
              type="text"
              [(ngModel)]="scannerQuery"
              name="scannerQuery"
              placeholder="Quét mã vạch hoặc gõ chuỗi Serial để tra cứu tức thì..."
              class="w-full pl-3 pr-20 py-2.5 bg-surface border border-line focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-bold text-foreground text-sm tabular focus:outline-none transition-colors"
            />
            <span class="absolute right-3 top-2.5 text-muted text-xs uppercase tracking-wider tabular">
              MÃ VẠCH
            </span>
          </div>

          <button
            type="submit"
            [disabled]="isQuickLookupLoading()"
            appButton
            variant="primary"
            size="md"
            class="whitespace-nowrap uppercase tracking-wide inline-flex items-center gap-2 text-sm font-bold"
          >
            @if (isQuickLookupLoading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            }
            <span>Tra Cứu</span>
          </button>
        </form>

        <div class="flex items-center justify-between text-xs text-muted flex-wrap gap-2 pt-1 border-t border-line">
          <div class="flex items-center gap-2 flex-wrap">
            <span>Gợi ý mẫu:</span>
            @for (sample of sampleSerials; track sample) {
              <button
                type="button"
                (click)="selectSampleSerial(sample)"
                class="px-2 py-0.5 bg-surface-alt hover:bg-surface border border-line rounded font-semibold text-foreground text-xs tabular transition-colors"
              >
                {{ sample }}
              </button>
            }
          </div>
          @if (quickLookupError()) {
            <span class="text-danger font-semibold">{{ quickLookupError() }}</span>
          }
        </div>
      </div>

      @if (quickLookupSerial(); as qk) {
        <div class="bg-surface border border-line rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto text-foreground">
          <div class="p-4 border-b border-line flex items-center justify-between flex-wrap gap-3 bg-surface-alt/50">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded border border-line bg-surface overflow-hidden flex items-center justify-center shrink-0">
                @if (getProductImage(qk.productTemplate.media)) {
                  <img
                    [src]="getProductImage(qk.productTemplate.media)!"
                    [alt]="qk.productTemplate.name"
                    class="w-full h-full object-contain p-1"
                  />
                } @else {
                  <div class="text-primary-strong font-bold text-sm">SN</div>
                }
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-sm font-bold text-foreground">{{ qk.productTemplate.name }}</h3>
                  <span class="text-xs px-2 py-0.5 rounded font-bold uppercase" [ngClass]="getStatusBadgeClass(qk.status)">
                    {{ getStatusLabel(qk.status) }}
                  </span>
                </div>
                <div class="text-xs text-muted tabular mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Serial: <strong class="text-foreground">{{ qk.serialNumber }}</strong></span>
                  <span>| SKU: <strong class="text-foreground">{{ qk.sku }}</strong></span>
                  @if (qk.barcode) {
                    <span>| Barcode: <strong class="text-foreground">{{ qk.barcode }}</strong></span>
                  }
                  @if (qk.productTemplate.brandName) {
                    <span>| Hãng: <strong class="text-foreground">{{ qk.productTemplate.brandName }}</strong></span>
                  }
                </div>
              </div>
            </div>

            <div class="text-left sm:text-right">
              <span class="text-xs uppercase font-semibold text-muted block">Vị trí hiện tại</span>
              <span class="font-bold text-foreground text-xs">
                {{ qk.currentBranch?.name ?? 'Chưa phân bổ' }}
              </span>
              @if (qk.currentBranch) {
                <span class="text-xs text-muted tabular block">({{ qk.currentBranch.code }})</span>
              }
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface border-b border-line text-xs divide-x divide-line">
            <div class="px-2">
              <span class="text-xs uppercase font-semibold text-muted block">Nhà cung cấp</span>
              <span class="font-bold text-foreground truncate block mt-0.5">
                {{ qk.origin?.supplierName ?? qk.productTemplate.brandName + ' Authorized Dist' }}
              </span>
            </div>
            <div class="px-2">
              <span class="text-xs uppercase font-semibold text-muted block">Đơn nhập PO</span>
              <span class="font-bold text-primary-strong tabular truncate block mt-0.5">
                {{ qk.origin?.purchaseOrderCode ?? 'PO-GỐC' }}
              </span>
            </div>
            <div class="px-2">
              <span class="text-xs uppercase font-semibold text-muted block">Đơn bán liên kết</span>
              <span class="font-bold text-foreground tabular truncate block mt-0.5">
                {{ getAssociatedOrderCode(qk) ?? 'Chưa gán đơn bán' }}
              </span>
            </div>
            <div class="px-2">
              <span class="text-xs uppercase font-semibold text-muted block">Hạn bảo hành</span>
              <span class="font-bold text-emerald-700 truncate block mt-0.5">
                {{ getRemainingWarranty(qk.warranty.endDate) }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between border-b border-line pb-1.5">
                <span class="font-bold text-foreground uppercase tracking-wider text-xs">Lộ trình luân chuyển</span>
                <span class="text-xs text-muted tabular">{{ qk.movements.length }} trạm</span>
              </div>

              @if (qk.movements.length === 0) {
                <div class="py-6 text-center text-xs text-muted">Chưa có lịch sử di chuyển</div>
              } @else {
                <div class="border-l border-line ml-2 pl-4 space-y-3 text-xs">
                  @for (mov of qk.movements; track mov.id) {
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

            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between border-b border-line pb-1.5">
                <span class="font-bold text-foreground uppercase tracking-wider text-xs">Thông tin bảo hành</span>
                <span class="text-xs font-bold text-primary-strong tabular">{{ qk.warranty.durationMonths }} Tháng</span>
              </div>

              <div class="space-y-2 text-xs">
                <div class="flex items-center justify-between py-1 border-b border-line">
                  <span class="text-muted">Đơn vị bảo hành:</span>
                  <span class="font-bold text-foreground truncate max-w-[200px]">{{ qk.warranty.serviceProvider }}</span>
                </div>
                <div class="flex items-center justify-between py-1 border-b border-line">
                  <span class="text-muted">Bắt đầu:</span>
                  <span class="font-bold text-foreground tabular">{{ formatDate(qk.warranty.startDate) }}</span>
                </div>
                <div class="flex items-center justify-between py-1 border-b border-line">
                  <span class="text-muted">Hết hạn:</span>
                  <span class="font-bold text-primary-strong tabular">{{ formatDate(qk.warranty.endDate) }}</span>
                </div>
                <div class="flex items-center justify-between py-1 border-b border-line">
                  <span class="text-muted">Số lần bảo hành:</span>
                  <span class="font-bold text-foreground">{{ qk.warranty.warrantyClaimCount }} lần</span>
                </div>

                <div class="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    (click)="openSerialModal(qk.id)"
                    appButton
                    variant="primary"
                    size="sm"
                    class="flex-1 uppercase tracking-wide text-xs font-bold"
                  >
                    Xem Chi Tiết Vòng Đời
                  </button>
                  <button
                    type="button"
                    (click)="clearQuickLookup()"
                    appButton
                    variant="secondary"
                    size="sm"
                    class="text-xs"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="bg-surface border border-line rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-end justify-between shadow-card">
        <div class="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div class="relative flex-1">
            <label for="serials-table-search" class="block text-xs font-semibold text-muted uppercase mb-1">Tìm kiếm</label>
            <input
              id="serials-table-search"
              type="text"
              [(ngModel)]="tableSearch"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Lọc theo Serial, SKU, Tên linh kiện..."
              class="w-full h-9 bg-surface border border-line rounded px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div class="w-full sm:w-56">
            <span class="block text-xs font-semibold text-muted uppercase mb-1">Chi nhánh</span>
            <app-select
              [options]="branchOptions()"
              [value]="selectedBranchFilterId()"
              (valueChange)="onBranchFilterChange($event)"
              [searchable]="true"
              searchPlaceholder="Tìm chi nhánh..."
              size="md"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 justify-end">
          <button
            type="button"
            (click)="refreshData()"
            appButton
            variant="secondary"
            size="md"
            class="text-xs font-semibold flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-xl overflow-hidden shadow-card">
        @if (isLoading()) {
          <div class="py-16 flex flex-col items-center justify-center gap-3 text-muted">
            <svg class="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span class="text-xs">Đang tải danh sách sê-ri linh kiện...</span>
          </div>
        } @else if (error()) {
          <div class="p-8 text-center text-danger text-xs font-semibold">
            {{ error() }}
          </div>
        } @else if (serials().length === 0) {
          <div class="py-16 text-center text-muted space-y-2">
            <svg class="w-12 h-12 mx-auto text-muted/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="text-sm font-semibold text-foreground">Không tìm thấy mã sê-ri nào phù hợp</p>
            <p class="text-xs text-muted">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc chi nhánh/trạng thái</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm min-w-[1000px] border-collapse">
              <thead>
                <tr class="bg-surface-alt border-b border-line text-muted uppercase tracking-wider font-semibold text-xs">
                  <th class="py-3 px-4 whitespace-nowrap">Mã Sê-Ri</th>
                  <th class="py-3 px-4">Linh Kiện & SKU</th>
                  <th class="py-3 px-4 whitespace-nowrap">Chi Nhánh Hiện Tại</th>
                  <th class="py-3 px-4 whitespace-nowrap">Trạng Thái</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Giá Niêm Yết</th>
                  <th class="py-3 px-4 whitespace-nowrap">Ngày Khởi Tạo</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Hành Động</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-foreground">
                @for (unit of serials(); track unit.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors">
                    <td class="py-3.5 px-4 font-bold text-foreground whitespace-nowrap tabular">
                      {{ unit.serialNumber }}
                    </td>
                    <td class="py-3.5 px-4 max-w-xs">
                      <div class="font-bold text-foreground truncate">{{ unit.productName }}</div>
                      <div class="text-xs text-muted tabular mt-0.5 truncate">
                        SKU: {{ unit.sku }}
                        @if (unit.barcode) {
                          <span> | Barcode: {{ unit.barcode }}</span>
                        }
                      </div>
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      @if (unit.currentBranchName) {
                        <span class="text-foreground font-semibold">{{ unit.currentBranchName }}</span>
                        <span class="text-xs text-muted tabular block">({{ unit.currentBranchCode }})</span>
                      } @else {
                        <span class="text-muted italic">Chưa xác định</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <span class="text-xs px-2 py-0.5 rounded font-bold uppercase whitespace-nowrap" [ngClass]="getStatusBadgeClass(unit.status)">
                        {{ getStatusLabel(unit.status) }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right font-bold text-primary-strong whitespace-nowrap tabular tabular-nums">
                      {{ formatCurrency(unit.sellingPrice) }}
                    </td>
                    <td class="py-3.5 px-4 text-muted tabular whitespace-nowrap">
                      {{ formatDate(unit.createdAt) }}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap shrink-0">
                      <button
                        type="button"
                        (click)="openSerialModal(unit.id)"
                        appButton
                        variant="secondary"
                        size="sm"
                        class="px-2.5 py-1 text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Vòng Đời</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="p-4 bg-surface-alt border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
            <div>
              Hiển thị <strong class="text-foreground">{{ (page() - 1) * limit() + 1 }}</strong> -
              <strong class="text-foreground">{{ getEndIndex() }}</strong> trong tổng số
              <strong class="text-foreground">{{ total() }}</strong> sê-ri
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="page() <= 1"
                (click)="goToPage(page() - 1)"
                appButton
                variant="outline"
                size="sm"
              >
                Trước
              </button>
              <span class="px-2 text-foreground font-semibold tabular tabular-nums">
                Trang {{ page() }} / {{ totalPages() }}
              </span>
              <button
                type="button"
                [disabled]="page() >= totalPages()"
                (click)="goToPage(page() + 1)"
                appButton
                variant="outline"
                size="sm"
              >
                Sau
              </button>
            </div>
          </div>
        }
      </div>

      <app-serial-detail-dialog
        [isOpen]="isModalOpen()"
        [detail]="selectedSerialDetail()"
        [isLoading]="isDetailLoading()"
        [branches]="branches()"
        (close)="closeSerialModal()"
        (updated)="onModalDataUpdated()"
      />
    </div>
  `,
})
export class AdminSerialsPageComponent implements OnInit, AfterViewInit {
  private readonly serialService = inject(AdminSerialService);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('scannerInput') scannerInputElement?: ElementRef<HTMLInputElement>;

  readonly serials = this.serialService.serials;
  readonly total = this.serialService.total;
  readonly page = this.serialService.page;
  readonly limit = this.serialService.limit;
  readonly totalPages = this.serialService.totalPages;
  readonly summary = this.serialService.summary;
  readonly isLoading = this.serialService.isLoading;
  readonly error = this.serialService.error;

  readonly selectedSerialDetail = this.serialService.selectedSerial;
  readonly isDetailLoading = this.serialService.isDetailLoading;
  readonly quickLookupSerial = this.serialService.quickLookupSerial;
  readonly isQuickLookupLoading = this.serialService.isQuickLookupLoading;
  readonly quickLookupError = this.serialService.quickLookupError;
  readonly branches = this.serialService.branches;

  readonly activeStatus = signal<string>('ALL');
  readonly isModalOpen = signal<boolean>(false);
  readonly selectedBranchFilterId = signal<string>('');

  scannerQuery = '';
  tableSearch = '';
  searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly sampleSerials: string[] = [
    'SN-RTX5090-00192',
    'SN-RTX5090-00188',
    'SN-AMD9800X-88129',
  ];

  readonly branchOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả chi nhánh' },
    ...this.branches().map((b) => ({
      value: String(b.id),
      label: `${b.name} (${b.code})`,
    })),
  ]);

  ngOnInit(): void {
    const searchParam = this.route.snapshot.queryParams['search'];
    if (searchParam) {
      this.tableSearch = searchParam;
    }
    void this.serialService.loadBranches();
    void this.loadTableData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scannerInputElement?.nativeElement?.focus();
    }, 150);
  }

  async loadTableData(): Promise<void> {
    const branchVal = this.selectedBranchFilterId();
    await this.serialService.loadSerials({
      search: this.tableSearch,
      status: this.activeStatus(),
      branchId: branchVal ? Number(branchVal) : undefined,
      page: this.page(),
      limit: this.limit(),
    });
  }

  filterByStatus(status: string): void {
    this.activeStatus.set(status);
    this.serialService.page.set(1);
    void this.loadTableData();
  }

  onBranchFilterChange(branchId: string): void {
    this.selectedBranchFilterId.set(branchId);
    this.serialService.page.set(1);
    void this.loadTableData();
  }

  onSearchChange(term: string): void {
    this.tableSearch = term;
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.serialService.page.set(1);
      void this.loadTableData();
    }, 300);
  }

  async onQuickScanSubmit(): Promise<void> {
    const term = this.scannerQuery.trim();
    if (!term) {
      return;
    }

    try {
      await this.serialService.quickLookup(term);
    } catch {
      // Handled via quickLookupError signal
    }
  }

  selectSampleSerial(sample: string): void {
    this.scannerQuery = sample;
    void this.onQuickScanSubmit();
  }

  clearQuickLookup(): void {
    this.serialService.quickLookupSerial.set(null);
    this.scannerQuery = '';
  }

  async openSerialModal(serialId: string): Promise<void> {
    this.isModalOpen.set(true);
    await this.serialService.loadSerialDetail(serialId);
  }

  closeSerialModal(): void {
    this.isModalOpen.set(false);
  }

  onModalDataUpdated(): void {
    void this.loadTableData();
  }

  goToPage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages()) {
      return;
    }
    this.serialService.page.set(newPage);
    void this.loadTableData();
  }

  refreshData(): void {
    void this.loadTableData();
  }

  getEndIndex(): number {
    const calculated = this.page() * this.limit();
    return calculated > this.total() ? this.total() : calculated;
  }

  formatCurrency(value: string | number): string {
    const num = Number(value);
    if (isNaN(num)) {
      return '0 đ';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
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
      case 'RETURNED_TO_SUPPLIER':
        return 'text-muted';
      default:
        return 'text-foreground';
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
        return 'Trả NCC';
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
        return 'bg-sky-500';
      case 'ISSUED':
        return 'bg-primary';
      case 'QUARANTINED':
        return 'bg-rose-500';
      case 'RETURNED_TO_SUPPLIER':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  }

  getProductImage(media: unknown): string | null {
    if (!media) {
      return null;
    }
    if (Array.isArray(media) && media.length > 0) {
      const first = media[0];
      if (typeof first === 'string') {
        return first;
      }
      if (typeof first === 'object' && first && 'url' in first) {
        return (first as { url: string }).url;
      }
    }
    if (typeof media === 'string') {
      return media;
    }
    return null;
  }

  getAssociatedOrderCode(qk: SerialDetailResponse): string | null {
    const mov = qk.movements.find((m) => m.orderCode);
    return mov?.orderCode ?? null;
  }

  getRemainingWarranty(endDateStr: string | null): string {
    if (!endDateStr) {
      return 'Không xác định';
    }
    const end = new Date(endDateStr);
    const now = new Date();
    if (now > end) {
      return 'Đã hết hạn';
    }
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `Còn ${months} tháng (${diffDays} ngày)`;
    }
    return `Còn ${diffDays} ngày`;
  }
}
