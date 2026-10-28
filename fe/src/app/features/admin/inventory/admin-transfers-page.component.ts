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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { handleProductImageError } from '../../../core/constants/product.constants';
import { BadgeDirective } from '../../../components/atoms/badge/badge.directive';
import { ButtonDirective } from '../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { CancelTransferDialogComponent } from './components/cancel-transfer-dialog.component';
import { CreateTransferDialogComponent } from './components/create-transfer-dialog.component';
import { DispatchTransferDialogComponent } from './components/dispatch-transfer-dialog.component';
import { ReceiveTransferDialogComponent } from './components/receive-transfer-dialog.component';
import {
  AdminTransferService,
  TransferDetail,
  TransferFilterParams,
  TransferListItem,
} from './services/admin-transfer.service';

@Component({
  selector: 'app-admin-transfers-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BadgeDirective,
    ButtonDirective,
    SelectComponent,
    CreateTransferDialogComponent,
    DispatchTransferDialogComponent,
    ReceiveTransferDialogComponent,
    CancelTransferDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-4 lg:p-6 space-y-4 text-sm text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Điều Chuyển Kho Nội Bộ
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Quy trình chuẩn hóa 3 bước giữa các chi nhánh: Chờ xuất -> Đang chuyển -> Đã nhận đủ
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <a
            routerLink="/admin/inventory/balances"
            appButton
            variant="secondary"
            size="sm"
            class="uppercase tracking-wide"
          >
            <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Tồn Kho Chi Nhánh</span>
          </a>

          <a
            routerLink="/admin/inventory/ledger"
            appButton
            variant="secondary"
            size="sm"
            class="uppercase tracking-wide"
          >
            <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span>Sổ Kho</span>
          </a>

          <a
            routerLink="/admin/inventory/serials"
            appButton
            variant="secondary"
            size="sm"
            class="uppercase tracking-wide"
          >
            <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01M15 7h.01M15 11h.01M15 15h.01M19 7h.01M19 11h.01M19 15h.01" />
            </svg>
            <span>Tra Cứu Sê-ri</span>
          </a>

          <button
            type="button"
            (click)="isCreateDialogOpen.set(true)"
            appButton
            variant="primary"
            size="sm"
            class="uppercase tracking-wide"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tạo Điều Chuyển</span>
          </button>
        </div>
      </div>

      <div class="p-4 bg-surface border border-line rounded-lg">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-line">
          <div class="space-y-0.5">
            <span class="text-xs font-semibold text-muted uppercase tracking-wider block">Lệnh Điều Chuyển</span>
            <div class="text-xl font-bold text-foreground tabular tabular-nums">{{ summary().totalTransfers }}</div>
          </div>

          <div class="space-y-0.5 pt-3 sm:pt-0 sm:pl-6">
            <span class="text-xs font-semibold text-warning uppercase tracking-wider block">Đang Vận Chuyển</span>
            <div class="text-xl font-bold text-warning tabular tabular-nums">{{ summary().inTransitUnits }} chiếc</div>
          </div>

          <div class="space-y-0.5 pt-3 sm:pt-0 sm:pl-6">
            <span class="text-xs font-semibold text-muted uppercase tracking-wider block">Kho Liên Kết</span>
            <div class="text-xl font-bold text-foreground tabular tabular-nums">{{ summary().connectedBranchesCount }} kho</div>
          </div>

          <div class="space-y-0.5 pt-3 sm:pt-0 sm:pl-6">
            <span class="text-xs font-semibold text-primary-strong uppercase tracking-wider block">Tỉ Lệ Nhận Đủ</span>
            <div class="text-xl font-bold text-primary-strong tabular tabular-nums">{{ summary().fullReceiptRate }}</div>
          </div>
        </div>
      </div>

      @if (toastMessage()) {
        <div class="p-3 bg-surface border border-primary text-foreground rounded text-xs flex items-center justify-between shadow-card">
          <span class="font-medium">{{ toastMessage() }}</span>
          <button type="button" (click)="toastMessage.set(null)" class="text-muted hover:text-foreground font-bold ml-2">Đóng</button>
        </div>
      }

      <div class="bg-surface border border-line rounded-lg p-3.5 space-y-3 shadow-card">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-end">
          <div>
            <label for="filter-search" class="block text-xs font-semibold text-muted uppercase mb-1">Tìm kiếm</label>
            <input
              id="filter-search"
              type="text"
              [ngModel]="searchFilter()"
              (ngModelChange)="searchFilter.set($event); onFilterChange()"
              placeholder="Mã phiếu, SKU, tên linh kiện..."
              class="w-full h-9 px-2.5 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted"
            />
          </div>

          <div>
            <span class="block text-xs font-semibold text-muted uppercase mb-1">Trạng thái</span>
            <app-select
              [options]="statusOptions"
              [value]="statusFilter()"
              (valueChange)="statusFilter.set($event); onFilterChange()"
              size="md"
            />
          </div>

          <div>
            <span class="block text-xs font-semibold text-muted uppercase mb-1">Kho xuất</span>
            <app-select
              [options]="sourceBranchOptions()"
              [value]="sourceBranchFilterId()"
              (valueChange)="sourceBranchFilterId.set($event); onFilterChange()"
              [searchable]="true"
              searchPlaceholder="Tìm kho xuất..."
              size="md"
            />
          </div>

          <div>
            <span class="block text-xs font-semibold text-muted uppercase mb-1">Kho nhận</span>
            <app-select
              [options]="destinationBranchOptions()"
              [value]="destinationBranchFilterId()"
              (valueChange)="destinationBranchFilterId.set($event); onFilterChange()"
              [searchable]="true"
              searchPlaceholder="Tìm kho nhận..."
              size="md"
            />
          </div>

          <div>
            <button
              type="button"
              (click)="resetFilters()"
              appButton
              variant="secondary"
              size="md"
              class="w-full text-xs font-semibold"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg shadow-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left min-w-[1000px] border-collapse">
            <thead class="bg-surface-alt border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th class="py-2.5 px-4 w-12 text-center">Ảnh</th>
                <th class="py-2.5 px-4 whitespace-nowrap">Mã phiếu</th>
                <th class="py-2.5 px-4">Linh kiện & Ghi chú</th>
                <th class="py-2.5 px-4 whitespace-nowrap">Kho xuất</th>
                <th class="py-2.5 px-4 whitespace-nowrap">Kho nhận</th>
                <th class="py-2.5 px-4 whitespace-nowrap text-right">Số lượng</th>
                <th class="py-2.5 px-4 whitespace-nowrap">Thời gian</th>
                <th class="py-2.5 px-4 text-center whitespace-nowrap">Trạng thái</th>
                <th class="py-2.5 px-4 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line text-foreground text-sm">
              @if (isLoading()) {
                <tr>
                  <td colspan="9" class="py-8 text-center text-muted italic">
                    Đang tải danh sách phiếu điều chuyển kho...
                  </td>
                </tr>
              } @else if (transfers().length === 0) {
                <tr>
                  <td colspan="9" class="py-8 text-center text-muted">
                    Không tìm thấy phiếu điều chuyển nào phù hợp với bộ lọc.
                  </td>
                </tr>
              } @else {
                @for (item of transfers(); track item.id) {
                  <tr class="hover:bg-surface-alt/70 transition-colors">
                    <td class="py-3 px-4 text-center">
                      <div class="w-9 h-9 rounded border border-line bg-surface-alt overflow-hidden flex items-center justify-center mx-auto">
                        @if (item.primaryProductImage) {
                          <img
                            src="/images/products/placeholder.webp"
                            [src]="item.primaryProductImage || '/images/products/placeholder.webp'"
                            [alt]="item.primaryProductName || 'Sản phẩm chuyển kho'"
                            class="w-full h-full object-contain p-0.5"
                            (error)="onImageError($event)"
                          />
                        } @else {
                          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        }
                      </div>
                    </td>

                    <td class="py-3 px-4 font-bold text-foreground text-sm whitespace-nowrap tabular">
                      {{ item.code }}
                    </td>

                    <td class="py-3 px-4 max-w-xs">
                      <div class="font-bold text-foreground truncate" [title]="item.primaryProductName">
                        {{ item.primaryProductName }}
                      </div>
                      <div class="text-xs text-muted truncate" [title]="item.reason || 'Điều chuyển nội bộ'">
                        {{ item.reason || 'Điều chuyển nội bộ' }}
                      </div>
                    </td>

                    <td class="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      <div class="font-semibold">{{ item.sourceBranchCode }}</div>
                      <div class="text-xs text-muted truncate">{{ item.sourceBranchName }}</div>
                    </td>

                    <td class="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      <div class="font-semibold">{{ item.destinationBranchCode }}</div>
                      <div class="text-xs text-muted truncate">{{ item.destinationBranchName }}</div>
                    </td>

                    <td class="py-3 px-4 font-medium text-foreground whitespace-nowrap tabular tabular-nums text-right">
                      {{ item.totalQuantity }} chiếc
                      <span class="text-xs text-muted block font-sans">({{ item.lineCount }} SKU)</span>
                    </td>

                    <td class="py-3 px-4 text-muted text-sm tabular tabular-nums whitespace-nowrap">
                      {{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </td>

                    <td class="py-3 px-4 text-center whitespace-nowrap">
                      @switch (item.displayStatus) {
                        @case ('REQUESTED') {
                          <span appBadge variant="info" class="whitespace-nowrap uppercase">
                            Chờ xuất
                          </span>
                        }
                        @case ('IN_TRANSIT') {
                          <span appBadge variant="warning" class="whitespace-nowrap uppercase">
                            Đang chuyển
                          </span>
                        }
                        @case ('RECEIVED') {
                          <span appBadge variant="success" class="whitespace-nowrap uppercase">
                            Đã nhận đủ
                          </span>
                        }
                        @case ('CANCELLED') {
                          <span appBadge variant="danger" class="whitespace-nowrap uppercase">
                            Đã hủy
                          </span>
                        }
                      }
                    </td>

                    <td class="py-3 px-4 text-right whitespace-nowrap shrink-0">
                      <div class="flex items-center justify-end gap-1.5 whitespace-nowrap shrink-0">
                        <button
                          type="button"
                          (click)="openDetail(item)"
                          appButton
                          variant="secondary"
                          size="sm"
                          class="h-8 w-8 p-0"
                          title="Xem chi tiết các dòng linh kiện"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        @if (item.displayStatus === 'REQUESTED') {
                          <button
                            type="button"
                            (click)="openDispatch(item)"
                            appButton
                            variant="primary"
                            size="sm"
                            class="whitespace-nowrap shrink-0"
                            title="Xác nhận xuất kho"
                          >
                            <span>Xuất kho</span>
                          </button>

                          <button
                            type="button"
                            (click)="openCancel(item)"
                            appButton
                            variant="danger"
                            size="sm"
                            class="h-8 w-8 p-0"
                            title="Hủy phiếu"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        } @else if (item.displayStatus === 'IN_TRANSIT') {
                          <button
                            type="button"
                            (click)="openReceive(item)"
                            appButton
                            variant="primary"
                            size="sm"
                            class="whitespace-nowrap shrink-0"
                            title="Xác nhận nhập kho tại kho đích"
                          >
                            <span>Nhận hàng</span>
                          </button>
                        } @else {
                          <span class="text-muted text-xs font-semibold italic">Đã chốt sổ</span>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        @if (total() > limit()) {
          <div class="p-3 bg-surface-alt border-t border-line flex items-center justify-between text-sm text-muted">
            <div>
              Hiển thị {{ (page() - 1) * limit() + 1 }} - {{ Math.min(page() * limit(), total()) }} trên tổng {{ total() }} phiếu
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
              <span class="text-foreground font-semibold tabular tabular-nums">Trang {{ page() }} / {{ totalPages() }}</span>
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

      <!-- Detail Modal -->
      @if (selectedDetail(); as detail) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            (click)="selectedDetail.set(null)"
          ></div>

          <div class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-xs text-foreground">
            <div class="p-4 border-b border-line flex items-center justify-between">
              <div>
                <h3 class="font-bold text-foreground text-sm uppercase">Chi Tiết Phiếu Điều Chuyển {{ detail.code }}</h3>
                <p class="text-xs text-muted">Tạo lúc: {{ detail.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <button
                type="button"
                (click)="selectedDetail.set(null)"
                class="p-1 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              <div class="grid grid-cols-2 gap-3 p-3 bg-surface-alt border border-line rounded">
                <div>
                  <span class="text-muted text-xs uppercase block font-semibold">Kho xuất hàng</span>
                  <span class="font-bold text-foreground text-xs">{{ detail.sourceBranchCode }} - {{ detail.sourceBranchName }}</span>
                </div>
                <div>
                  <span class="text-muted text-xs uppercase block font-semibold">Kho nhận hàng</span>
                  <span class="font-bold text-foreground text-xs">{{ detail.destinationBranchCode }} - {{ detail.destinationBranchName }}</span>
                </div>
                <div>
                  <span class="text-muted text-xs uppercase block font-semibold">Người xuất kho</span>
                  <span class="text-foreground">{{ detail.dispatchedByName || 'Chưa xuất kho' }}</span>
                </div>
                <div>
                  <span class="text-muted text-xs uppercase block font-semibold">Người nhận hàng</span>
                  <span class="text-foreground">{{ detail.validatedByName || 'Chưa nhận hàng' }}</span>
                </div>
              </div>

              <div>
                <div class="font-bold text-foreground uppercase text-xs mb-2">Danh sách linh kiện điều chuyển:</div>
                <div class="space-y-2">
                  @for (line of detail.lines; track line.id) {
                    <div class="p-3 bg-surface-alt border border-line rounded space-y-1.5">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="font-bold text-foreground">{{ line.productName }}</div>
                          <div class="text-xs text-muted tabular">SKU: {{ line.skuCode }} - Đơn giá vốn: <span class="tabular tabular-nums">{{ line.unitCost }} đ</span></div>
                        </div>
                        <div class="font-bold text-foreground text-sm tabular tabular-nums">
                          {{ line.quantity }} chiếc
                        </div>
                      </div>

                      @if (line.serialRequired && line.serialNumbers.length > 0) {
                        <div class="pt-1.5 border-t border-line">
                          <span class="text-xs text-muted uppercase font-semibold block mb-1">Mã sê-ri xuất kho:</span>
                          <div class="flex flex-wrap gap-1.5">
                            @for (sn of line.serialNumbers; track sn) {
                              <span class="px-2 py-0.5 rounded bg-surface border border-line text-xs text-primary-strong font-semibold tabular">
                                {{ sn }}
                              </span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="p-3 border-t border-line flex justify-end">
              <button
                type="button"
                (click)="selectedDetail.set(null)"
                appButton
                variant="secondary"
                size="sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modals -->
      <app-create-transfer-dialog
        [isOpen]="isCreateDialogOpen()"
        (saved)="onTransferCreated($event)"
        (closed)="isCreateDialogOpen.set(false)"
      />

      <app-dispatch-transfer-dialog
        [isOpen]="isDispatchDialogOpen()"
        [transfer]="selectedTransferForAction()"
        (dispatched)="onTransferDispatched($event)"
        (closed)="isDispatchDialogOpen.set(false)"
      />

      <app-receive-transfer-dialog
        [isOpen]="isReceiveDialogOpen()"
        [transfer]="selectedTransferForAction()"
        (received)="onTransferReceived($event)"
        (closed)="isReceiveDialogOpen.set(false)"
      />

      <app-cancel-transfer-dialog
        [isOpen]="isCancelDialogOpen()"
        [transfer]="selectedTransferForAction()"
        (cancelled)="onTransferCancelled($event)"
        (closed)="isCancelDialogOpen.set(false)"
      />
    </div>
  `,
})
export class AdminTransfersPageComponent implements OnInit {
  protected readonly Math = Math;
  protected readonly onImageError = handleProductImageError;
  private readonly transferService = inject(AdminTransferService);
  private readonly route = inject(ActivatedRoute);

  readonly transfers = this.transferService.transfers;
  readonly total = this.transferService.transfersTotal;
  readonly page = this.transferService.transfersPage;
  readonly limit = this.transferService.transfersLimit;
  readonly summary = this.transferService.transfersSummary;
  readonly isLoading = this.transferService.isLoading;
  readonly branches = this.transferService.branches;

  readonly searchFilter = signal<string>('');
  readonly statusFilter = signal<string>('ALL');
  readonly sourceBranchFilterId = signal<string>('');
  readonly destinationBranchFilterId = signal<string>('');

  readonly statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'REQUESTED', label: 'Chờ xuất' },
    { value: 'IN_TRANSIT', label: 'Đang chuyển' },
    { value: 'RECEIVED', label: 'Đã nhận đủ' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  readonly sourceBranchOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả kho xuất' },
    ...this.branches().map((b) => ({
      value: String(b.id),
      label: `${b.code} - ${b.name}`,
    })),
  ]);

  readonly destinationBranchOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Tất cả kho nhận' },
    ...this.branches().map((b) => ({
      value: String(b.id),
      label: `${b.code} - ${b.name}`,
    })),
  ]);

  readonly isCreateDialogOpen = signal<boolean>(false);
  readonly isDispatchDialogOpen = signal<boolean>(false);
  readonly isReceiveDialogOpen = signal<boolean>(false);
  readonly isCancelDialogOpen = signal<boolean>(false);
  readonly selectedTransferForAction = signal<TransferListItem | null>(null);
  readonly selectedDetail = signal<TransferDetail | null>(null);
  readonly toastMessage = signal<string | null>(null);

  readonly totalPages = computed(() => {
    const t = this.total();
    const l = this.limit();
    return t > 0 ? Math.ceil(t / l) : 1;
  });

  async ngOnInit(): Promise<void> {
    const searchParam =
      this.route.snapshot.queryParams['search'] ||
      this.route.snapshot.queryParams['code'];
    const statusParam = this.route.snapshot.queryParams['status'];
    if (searchParam) {
      this.searchFilter.set(searchParam);
    }
    if (statusParam) {
      this.statusFilter.set(statusParam);
    }

    await Promise.all([
      this.transferService.loadBranches(),
      this.fetchTransfers(),
    ]);
  }

  async fetchTransfers(): Promise<void> {
    const srcVal = this.sourceBranchFilterId();
    const dstVal = this.destinationBranchFilterId();
    const params: TransferFilterParams = {
      page: this.page(),
      limit: this.limit(),
      search: this.searchFilter().trim() || undefined,
      status: this.statusFilter() !== 'ALL' ? this.statusFilter() : undefined,
      sourceBranchId: srcVal ? parseInt(srcVal, 10) : undefined,
      destinationBranchId: dstVal ? parseInt(dstVal, 10) : undefined,
    };
    await this.transferService.loadTransfers(params);
  }

  async onFilterChange(): Promise<void> {
    this.transferService.transfersPage.set(1);
    await this.fetchTransfers();
  }

  async resetFilters(): Promise<void> {
    this.searchFilter.set('');
    this.statusFilter.set('ALL');
    this.sourceBranchFilterId.set('');
    this.destinationBranchFilterId.set('');
    this.transferService.transfersPage.set(1);
    await this.fetchTransfers();
  }

  async goToPage(newPage: number): Promise<void> {
    this.transferService.transfersPage.set(newPage);
    await this.fetchTransfers();
  }

  openDispatch(item: TransferListItem): void {
    this.selectedTransferForAction.set(item);
    this.isDispatchDialogOpen.set(true);
  }

  openReceive(item: TransferListItem): void {
    this.selectedTransferForAction.set(item);
    this.isReceiveDialogOpen.set(true);
  }

  openCancel(item: TransferListItem): void {
    this.selectedTransferForAction.set(item);
    this.isCancelDialogOpen.set(true);
  }

  async openDetail(item: TransferListItem): Promise<void> {
    try {
      const detail = await this.transferService.getTransferById(item.id);
      this.selectedDetail.set(detail);
    } catch {
      this.toastMessage.set('Khong the tai chi tiet phieu dieu chuyen');
    }
  }

  async onTransferCreated(detail: TransferDetail): Promise<void> {
    this.isCreateDialogOpen.set(false);
    this.toastMessage.set(`Tao yeu cau dieu chuyen ${detail.code} thanh cong`);
    await this.fetchTransfers();
  }

  async onTransferDispatched(detail: TransferDetail): Promise<void> {
    this.isDispatchDialogOpen.set(false);
    this.toastMessage.set(`Xuat kho dieu chuyen ${detail.code} thanh cong`);
    await this.fetchTransfers();
  }

  async onTransferReceived(detail: TransferDetail): Promise<void> {
    this.isReceiveDialogOpen.set(false);
    this.toastMessage.set(`Xac nhan nhan hang ${detail.code} vao kho thanh cong`);
    await this.fetchTransfers();
  }

  async onTransferCancelled(detail: TransferDetail): Promise<void> {
    this.isCancelDialogOpen.set(false);
    this.toastMessage.set(`Da huy phieu dieu chuyen ${detail.code}`);
    await this.fetchTransfers();
  }
}
