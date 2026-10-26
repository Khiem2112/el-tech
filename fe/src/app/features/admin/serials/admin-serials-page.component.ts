import { CommonModule } from '@angular/common';
import {
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
import { AdminSerialService } from './services/admin-serial.service';

@Component({
  selector: 'app-admin-serials-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonDirective, SelectComponent, SerialDetailDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto text-sm text-foreground">
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
            Tổng số: <strong class="text-foreground font-mono">{{ summary().totalSerials }}</strong> sê-ri
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

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          (click)="filterByStatus('ALL')"
          class="p-3 bg-surface border rounded-lg text-left transition-colors cursor-pointer shadow-card"
          [ngClass]="activeStatus() === 'ALL' ? 'border-primary ring-1 ring-primary' : 'border-line hover:border-muted'"
        >
          <div class="text-[11px] font-semibold text-muted uppercase tracking-wider">Tất cả Serial</div>
          <div class="text-lg font-bold font-mono text-foreground mt-1">{{ summary().totalSerials }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('AVAILABLE')"
          class="p-3 bg-surface border rounded-lg text-left transition-colors cursor-pointer shadow-card"
          [ngClass]="activeStatus() === 'AVAILABLE' ? 'border-primary ring-1 ring-primary' : 'border-line hover:border-muted'"
        >
          <div class="text-[11px] font-semibold text-primary-strong uppercase tracking-wider">Trong kho</div>
          <div class="text-lg font-bold font-mono text-primary-strong mt-1">{{ summary().availableCount }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('RESERVED')"
          class="p-3 bg-surface border rounded-lg text-left transition-colors cursor-pointer shadow-card"
          [ngClass]="activeStatus() === 'RESERVED' ? 'border-warning ring-1 ring-warning' : 'border-line hover:border-muted'"
        >
          <div class="text-[11px] font-semibold text-warning uppercase tracking-wider">Đã gán xuất kho</div>
          <div class="text-lg font-bold font-mono text-warning mt-1">{{ summary().reservedCount }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('IN_TRANSIT')"
          class="p-3 bg-surface border rounded-lg text-left transition-colors cursor-pointer shadow-card"
          [ngClass]="activeStatus() === 'IN_TRANSIT' ? 'border-sky-500 ring-1 ring-sky-500' : 'border-line hover:border-muted'"
        >
          <div class="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">Đang chuyển</div>
          <div class="text-lg font-bold font-mono text-sky-600 mt-1">{{ summary().inTransitCount }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('ISSUED')"
          class="p-3 bg-surface border rounded-lg text-left transition-colors cursor-pointer shadow-card"
          [ngClass]="activeStatus() === 'ISSUED' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-line hover:border-muted'"
        >
          <div class="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Đã xuất bán</div>
          <div class="text-lg font-bold font-mono text-purple-600 mt-1">{{ summary().issuedCount }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('QUARANTINED')"
          class="p-3 bg-surface border rounded-lg text-left transition-colors cursor-pointer shadow-card"
          [ngClass]="activeStatus() === 'QUARANTINED' ? 'border-danger ring-1 ring-danger' : 'border-line hover:border-muted'"
        >
          <div class="text-[11px] font-semibold text-danger uppercase tracking-wider">Cách ly / Lỗi</div>
          <div class="text-lg font-bold font-mono text-danger mt-1">{{ summary().quarantinedCount }}</div>
        </button>
      </div>

      <div class="bg-surface border border-line rounded-xl p-5 shadow-card space-y-4 max-w-4xl mx-auto">
        <div class="text-center space-y-1">
          <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
            Quét Mã Vạch Hoặc Nhập Số Sê-Ri Tra Cứu Tức Thì
          </h2>
          <p class="text-xs text-muted">
            Tương thích súng quét barcode chuyên dụng hoặc nhập tay chuỗi serial, mã SKU, mã vạch linh kiện
          </p>
        </div>

        <form (ngSubmit)="onQuickScanSubmit()" class="flex items-center gap-2">
          <div class="relative flex-1">
            <input
              #scannerInput
              type="text"
              [(ngModel)]="scannerQuery"
              name="scannerQuery"
              placeholder="Quét barcode hoặc gõ chuỗi Serial..."
              class="w-full pl-4 pr-24 py-2.5 bg-surface border border-line focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-mono font-bold text-foreground text-sm focus:outline-none transition-colors"
            />
            <span class="absolute right-3 top-2.5 text-muted font-mono text-xs uppercase tracking-wider">
              MÃ VẠCH
            </span>
          </div>

          <button
            type="submit"
            [disabled]="isQuickLookupLoading()"
            appButton
            variant="primary"
            size="md"
            class="whitespace-nowrap uppercase tracking-wide inline-flex items-center gap-2"
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

        @if (quickLookupError()) {
          <div class="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-xs text-center font-medium">
            {{ quickLookupError() }}
          </div>
        }

        <div class="flex items-center justify-center gap-2 flex-wrap text-xs text-muted">
          <span>Gợi ý mẫu:</span>
          @for (sample of sampleSerials; track sample) {
            <button
              type="button"
              (click)="selectSampleSerial(sample)"
              class="px-2.5 py-1 bg-surface-alt hover:bg-surface border border-line rounded font-mono font-bold text-foreground text-xs transition-colors"
            >
              {{ sample }}
            </button>
          }
        </div>
      </div>

      @if (quickLookupSerial(); as qk) {
        <div class="bg-surface border border-primary/50 rounded-xl shadow-card overflow-hidden max-w-4xl mx-auto text-foreground">
          <div class="bg-surface-alt p-4 border-b border-line flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded border border-line bg-surface flex items-center justify-center text-primary-strong font-mono font-bold text-base">
                SN
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-sm font-bold text-foreground">{{ qk.productTemplate.name }}</h3>
                  <span class="text-xs px-2 py-0.5 rounded font-bold uppercase" [ngClass]="getStatusBadgeClass(qk.status)">
                    {{ getStatusLabel(qk.status) }}
                  </span>
                </div>
                <div class="text-xs text-muted font-mono mt-0.5">
                  Serial: <strong class="text-foreground">{{ qk.serialNumber }}</strong> | SKU: <strong>{{ qk.sku }}</strong>
                  @if (qk.barcode) {
                    <span> | Barcode: <strong>{{ qk.barcode }}</strong></span>
                  }
                </div>
              </div>
            </div>

            <div class="text-left sm:text-right">
              <span class="text-xs uppercase font-semibold text-muted block">Vị trí hiện tại</span>
              <span class="font-bold text-foreground text-sm">
                {{ qk.currentBranch?.name ?? 'Chưa phân bổ' }}
              </span>
              @if (qk.currentBranch) {
                <span class="text-xs text-muted font-mono block">({{ qk.currentBranch.code }})</span>
              }
            </div>
          </div>

          <div class="p-4 bg-primary/10 border-b border-primary/20 text-primary-strong text-xs">
            Linh kiện đang ở trạng thái hợp lệ. Số Serial gắn cố định với lịch sử di chuyển và chính sách bảo hành chính hãng.
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between border-b border-line pb-2">
                <span class="font-bold text-foreground uppercase tracking-wider text-xs">Lịch sử di chuyển gần nhất</span>
                <span class="text-xs font-mono text-primary-strong">{{ qk.movements.length }} bản ghi</span>
              </div>

              @if (qk.movements.length === 0) {
                <div class="py-6 text-center text-xs text-muted">Chưa có lịch sử di chuyển</div>
              } @else {
                <div class="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                  @for (mov of qk.movements.slice(-3); track mov.id) {
                    <div class="relative">
                      <span class="absolute -left-6 top-1 w-3 h-3 rounded-full border border-surface" [ngClass]="getMovementDotClass(mov.resultingStatus)"></span>
                      <div class="font-bold text-foreground text-xs">{{ mov.summaryText }}</div>
                      <div class="text-xs text-muted">
                        {{ formatDateTime(mov.occurredAt) }} | Phiếu: <strong class="text-primary-strong font-mono">{{ mov.stockMoveCode }}</strong>
                      </div>
                      <div class="text-xs font-semibold mt-0.5" [ngClass]="getStatusTextClass(mov.resultingStatus)">
                        Trạng thái: {{ getStatusLabel(mov.resultingStatus) }}
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between border-b border-line pb-2">
                <span class="font-bold text-foreground uppercase tracking-wider text-xs">Chính sách & Thời hạn bảo hành</span>
                <span class="text-xs font-mono font-bold text-primary-strong">Chính hãng</span>
              </div>

              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="bg-surface-alt p-2.5 rounded border border-line">
                    <span class="text-[11px] uppercase font-semibold text-muted block">Thời hạn bảo hành</span>
                    <strong class="text-foreground text-sm font-bold">{{ qk.warranty.durationMonths }} Tháng</strong>
                  </div>

                  <div class="bg-surface-alt p-2.5 rounded border border-line">
                    <span class="text-[11px] uppercase font-semibold text-muted block">Đơn vị tiếp nhận</span>
                    <strong class="text-foreground text-xs font-bold truncate block">{{ qk.warranty.serviceProvider }}</strong>
                  </div>
                </div>

                <div class="p-3 bg-surface-alt rounded border border-line space-y-1.5 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Ngày bắt đầu bảo hành:</span>
                    <span class="font-bold font-mono text-foreground">{{ formatDate(qk.warranty.startDate) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Ngày hết hạn dự kiến:</span>
                    <span class="font-bold font-mono text-primary-strong">{{ formatDate(qk.warranty.endDate) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Số lần bảo hành đã ghi nhận:</span>
                    <span class="font-bold text-foreground">{{ qk.warranty.warrantyClaimCount }} lần</span>
                  </div>
                </div>

                <div class="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    (click)="openSerialModal(qk.id)"
                    appButton
                    variant="primary"
                    size="sm"
                    class="flex-1 uppercase tracking-wide"
                  >
                    Xem Chi Tiết Vòng Đời
                  </button>
                  <button
                    type="button"
                    (click)="clearQuickLookup()"
                    appButton
                    variant="secondary"
                    size="sm"
                  >
                    Đóng Xem Nhanh
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
            <label for="serials-table-search" class="block text-[11px] font-semibold text-muted uppercase mb-1">Tìm kiếm</label>
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
            <span class="block text-[11px] font-semibold text-muted uppercase mb-1">Chi nhánh</span>
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
            <table class="w-full text-left text-xs min-w-[1000px] border-collapse">
              <thead>
                <tr class="bg-surface-alt border-b border-line text-muted uppercase tracking-wider font-semibold">
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
                    <td class="py-3.5 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                      {{ unit.serialNumber }}
                    </td>
                    <td class="py-3.5 px-4 max-w-xs">
                      <div class="font-bold text-foreground truncate">{{ unit.productName }}</div>
                      <div class="text-[11px] text-muted font-mono mt-0.5 truncate">
                        SKU: {{ unit.sku }}
                        @if (unit.barcode) {
                          <span> | Barcode: {{ unit.barcode }}</span>
                        }
                      </div>
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      @if (unit.currentBranchName) {
                        <span class="text-foreground font-semibold">{{ unit.currentBranchName }}</span>
                        <span class="text-[11px] text-muted font-mono block">({{ unit.currentBranchCode }})</span>
                      } @else {
                        <span class="text-muted italic">Chưa xác định</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <span class="text-[11px] px-2 py-0.5 rounded font-bold uppercase whitespace-nowrap" [ngClass]="getStatusBadgeClass(unit.status)">
                        {{ getStatusLabel(unit.status) }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold text-primary-strong whitespace-nowrap">
                      {{ formatCurrency(unit.sellingPrice) }}
                    </td>
                    <td class="py-3.5 px-4 text-muted font-mono whitespace-nowrap">
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

          <div class="p-4 bg-surface-alt border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
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
              <span class="px-2 font-mono text-foreground font-semibold">
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
export class AdminSerialsPageComponent implements OnInit {
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
        return 'bg-purple-50 text-purple-700 border border-purple-200';
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
        return 'text-purple-700';
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
        return 'bg-purple-500';
      case 'QUARANTINED':
        return 'bg-rose-500';
      case 'RETURNED_TO_SUPPLIER':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  }
}
