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
import { RouterModule } from '@angular/router';
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
    CreateTransferDialogComponent,
    DispatchTransferDialogComponent,
    ReceiveTransferDialogComponent,
    CancelTransferDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-18
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Điều Chuyển Kho Nội Bộ
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Quy trình chuẩn hóa 3 bước giữa các chi nhánh: Chờ xuất -> Đang chuyển -> Đã nhận đủ (TRF-001 đến TRF-006, INV-003)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <a
            routerLink="/admin/inventory/balances"
            class="px-3 py-1.5 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs rounded transition-colors inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Tồn Kho Chi Nhánh</span>
          </a>

          <a
            routerLink="/admin/inventory/ledger"
            class="px-3 py-1.5 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs rounded transition-colors inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span>Sổ Kho</span>
          </a>

          <a
            routerLink="/admin/inventory/serials"
            class="px-3 py-1.5 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs rounded transition-colors inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01M15 7h.01M15 11h.01M15 15h.01M19 7h.01M19 11h.01M19 15h.01" />
            </svg>
            <span>Tra Cứu Sê-ri</span>
          </a>

          <button
            type="button"
            (click)="isCreateDialogOpen.set(true)"
            class="px-3.5 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-black font-bold text-xs rounded transition-colors shadow-sm inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tạo Điều Chuyển</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lệnh điều chuyển</div>
          <div class="text-lg font-bold font-mono text-white mt-1">{{ summary().totalTransfers }}</div>
        </div>

        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Đang vận chuyển</div>
          <div class="text-lg font-bold font-mono text-amber-400 mt-1">{{ summary().inTransitUnits }} chiếc</div>
        </div>

        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kho chi nhánh</div>
          <div class="text-lg font-bold font-mono text-white mt-1">{{ summary().connectedBranchesCount }} kho</div>
        </div>

        <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tỉ lệ nhận đủ</div>
          <div class="text-lg font-bold font-mono text-[#76b900] mt-1">{{ summary().fullReceiptRate }}</div>
        </div>
      </div>

      @if (toastMessage()) {
        <div class="p-3 bg-[#161b26] border border-[#76b900] text-[#76b900] rounded text-xs flex items-center justify-between shadow-md">
          <span>{{ toastMessage() }}</span>
          <button type="button" (click)="toastMessage.set(null)" class="text-slate-400 hover:text-white font-bold ml-2">Đóng</button>
        </div>
      }

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-3.5 space-y-3 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div>
            <label for="filter-search" class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Tìm kiếm</label>
            <input
              id="filter-search"
              type="text"
              [ngModel]="searchFilter()"
              (ngModelChange)="searchFilter.set($event); onFilterChange()"
              placeholder="Mã phiếu, SKU, tên linh kiện..."
              class="w-full px-2.5 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
            />
          </div>

          <div>
            <label for="filter-status" class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Trạng thái</label>
            <select
              id="filter-status"
              [ngModel]="statusFilter()"
              (ngModelChange)="statusFilter.set($event); onFilterChange()"
              class="w-full px-2.5 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="REQUESTED">Chờ xuất (REQUESTED)</option>
              <option value="IN_TRANSIT">Đang chuyển (IN_TRANSIT)</option>
              <option value="RECEIVED">Đã nhận đủ (RECEIVED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </div>

          <div>
            <label for="filter-src" class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Kho xuất</label>
            <select
              id="filter-src"
              [ngModel]="sourceBranchFilter()"
              (ngModelChange)="sourceBranchFilter.set($event); onFilterChange()"
              class="w-full px-2.5 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
            >
              <option [ngValue]="null">Tất cả kho xuất</option>
              @for (b of branches(); track b.id) {
                <option [ngValue]="b.id">{{ b.code }} - {{ b.name }}</option>
              }
            </select>
          </div>

          <div>
            <label for="filter-dst" class="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Kho nhận</label>
            <select
              id="filter-dst"
              [ngModel]="destinationBranchFilter()"
              (ngModelChange)="destinationBranchFilter.set($event); onFilterChange()"
              class="w-full px-2.5 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
            >
              <option [ngValue]="null">Tất cả kho nhận</option>
              @for (b of branches(); track b.id) {
                <option [ngValue]="b.id">{{ b.code }} - {{ b.name }}</option>
              }
            </select>
          </div>

          <div class="flex items-end">
            <button
              type="button"
              (click)="resetFilters()"
              class="w-full px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold text-xs rounded transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="py-2.5 px-4 w-12 text-center">Ảnh</th>
                <th class="py-2.5 px-4">Mã phiếu</th>
                <th class="py-2.5 px-4">Linh kiện & Ghi chú</th>
                <th class="py-2.5 px-4">Kho xuất</th>
                <th class="py-2.5 px-4">Kho nhận</th>
                <th class="py-2.5 px-4">Số lượng</th>
                <th class="py-2.5 px-4">Thời gian</th>
                <th class="py-2.5 px-4 text-center">Trạng thái</th>
                <th class="py-2.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#272f3d]">
              @if (isLoading()) {
                <tr>
                  <td colspan="9" class="py-8 text-center text-slate-400 italic">
                    Đang tải danh sách phiếu điều chuyển kho...
                  </td>
                </tr>
              } @else if (transfers().length === 0) {
                <tr>
                  <td colspan="9" class="py-8 text-center text-slate-400">
                    Không tìm thấy phiếu điều chuyển nào phù hợp với bộ lọc.
                  </td>
                </tr>
              } @else {
                @for (item of transfers(); track item.id) {
                  <tr class="hover:bg-[#090d16]/60 transition-colors">
                    <td class="py-3 px-4 text-center">
                      <div class="w-9 h-9 rounded border border-[#272f3d] bg-[#090d16] overflow-hidden flex items-center justify-center mx-auto">
                        @if (item.primaryProductImage) {
                          <img [src]="item.primaryProductImage" [alt]="item.primaryProductName" class="w-full h-full object-contain p-0.5" />
                        } @else {
                          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        }
                      </div>
                    </td>

                    <td class="py-3 px-4 font-mono font-bold text-white text-xs">
                      {{ item.code }}
                    </td>

                    <td class="py-3 px-4 max-w-xs">
                      <div class="font-bold text-white truncate" [title]="item.primaryProductName">
                        {{ item.primaryProductName }}
                      </div>
                      <div class="text-[11px] text-slate-400 truncate" [title]="item.reason || 'Điều chuyển nội bộ'">
                        {{ item.reason || 'Điều chuyển nội bộ' }}
                      </div>
                    </td>

                    <td class="py-3 px-4 font-medium text-slate-300">
                      <div>{{ item.sourceBranchCode }}</div>
                      <div class="text-[10px] text-slate-500 truncate">{{ item.sourceBranchName }}</div>
                    </td>

                    <td class="py-3 px-4 font-medium text-slate-300">
                      <div>{{ item.destinationBranchCode }}</div>
                      <div class="text-[10px] text-slate-500 truncate">{{ item.destinationBranchName }}</div>
                    </td>

                    <td class="py-3 px-4 font-mono font-medium text-white tabular-nums">
                      {{ item.totalQuantity }} chiếc
                      <span class="text-[10px] text-slate-400 block font-sans">({{ item.lineCount }} SKU)</span>
                    </td>

                    <td class="py-3 px-4 text-slate-400 text-xs tabular-nums">
                      {{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </td>

                    <td class="py-3 px-4 text-center">
                      @switch (item.displayStatus) {
                        @case ('REQUESTED') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/40 text-sky-300 border border-sky-800/60 uppercase">
                            Chờ xuất
                          </span>
                        }
                        @case ('IN_TRANSIT') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-800/60 uppercase">
                            Đang chuyển
                          </span>
                        }
                        @case ('RECEIVED') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-[#76b900] border border-emerald-800/60 uppercase">
                            Đã nhận đủ
                          </span>
                        }
                        @case ('CANCELLED') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/40 text-rose-300 border border-rose-800/60 uppercase">
                            Đã hủy
                          </span>
                        }
                      }
                    </td>

                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="openDetail(item)"
                          class="p-1 rounded bg-[#090d16] hover:bg-[#272f3d] text-slate-300 border border-[#272f3d] transition-colors"
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
                            class="px-2.5 py-1 rounded bg-[#76b900] hover:bg-[#5a8d00] text-black font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1"
                            title="Xác nhận xuất kho"
                          >
                            <span>Xuất kho</span>
                          </button>

                          <button
                            type="button"
                            (click)="openCancel(item)"
                            class="p-1 rounded bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900 transition-colors"
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
                            class="px-2.5 py-1 rounded bg-[#76b900] hover:bg-[#5a8d00] text-black font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1"
                            title="Xác nhận nhập kho tại kho đích"
                          >
                            <span>Nhận hàng</span>
                          </button>
                        } @else {
                          <span class="text-slate-500 text-[11px] font-semibold italic">Đã chốt sổ</span>
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
          <div class="p-3 bg-[#090d16] border-t border-[#272f3d] flex items-center justify-between text-xs text-slate-400">
            <div>
              Hiển thị {{ (page() - 1) * limit() + 1 }} - {{ Math.min(page() * limit(), total()) }} trên tổng {{ total() }} phiếu
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="page() <= 1"
                (click)="goToPage(page() - 1)"
                class="px-2.5 py-1 bg-[#161b26] border border-[#272f3d] rounded text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#272f3d]"
              >
                Trước
              </button>
              <span class="font-mono text-white">Trang {{ page() }} / {{ totalPages() }}</span>
              <button
                type="button"
                [disabled]="page() >= totalPages()"
                (click)="goToPage(page() + 1)"
                class="px-2.5 py-1 bg-[#161b26] border border-[#272f3d] rounded text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#272f3d]"
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
            class="fixed inset-0 bg-[#090d16]/75 backdrop-blur-sm transition-opacity"
            (click)="selectedDetail.set(null)"
          ></div>

          <div class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-xs text-slate-200">
            <div class="p-4 border-b border-[#272f3d] flex items-center justify-between">
              <div>
                <h3 class="font-bold text-white text-sm uppercase">Chi Tiết Phiếu Điều Chuyển {{ detail.code }}</h3>
                <p class="text-xs text-slate-400">Tạo lúc: {{ detail.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <button
                type="button"
                (click)="selectedDetail.set(null)"
                class="p-1 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              <div class="grid grid-cols-2 gap-3 p-3 bg-[#090d16] border border-[#272f3d] rounded">
                <div>
                  <span class="text-slate-400 text-[11px] uppercase block">Kho xuất hàng</span>
                  <span class="font-bold text-white text-xs">{{ detail.sourceBranchCode }} - {{ detail.sourceBranchName }}</span>
                </div>
                <div>
                  <span class="text-slate-400 text-[11px] uppercase block">Kho nhận hàng</span>
                  <span class="font-bold text-white text-xs">{{ detail.destinationBranchCode }} - {{ detail.destinationBranchName }}</span>
                </div>
                <div>
                  <span class="text-slate-400 text-[11px] uppercase block">Người xuất kho</span>
                  <span class="text-slate-200">{{ detail.dispatchedByName || 'Chưa xuất kho' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 text-[11px] uppercase block">Người nhận hàng</span>
                  <span class="text-slate-200">{{ detail.validatedByName || 'Chưa nhận hàng' }}</span>
                </div>
              </div>

              <div>
                <div class="font-bold text-white uppercase text-[11px] mb-2">Danh sách linh kiện điều chuyển:</div>
                <div class="space-y-2">
                  @for (line of detail.lines; track line.id) {
                    <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded space-y-1.5">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="font-bold text-white">{{ line.productName }}</div>
                          <div class="text-[11px] font-mono text-slate-400">SKU: {{ line.skuCode }} - Đơn giá vốn: {{ line.unitCost }} ₫</div>
                        </div>
                        <div class="font-bold font-mono text-white text-sm">
                          {{ line.quantity }} chiếc
                        </div>
                      </div>

                      @if (line.serialRequired && line.serialNumbers.length > 0) {
                        <div class="pt-1.5 border-t border-[#272f3d]">
                          <span class="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Mã sê-ri xuất kho:</span>
                          <div class="flex flex-wrap gap-1.5">
                            @for (sn of line.serialNumbers; track sn) {
                              <span class="px-1.5 py-0.5 rounded bg-[#161b26] border border-[#272f3d] font-mono text-[10px] text-[#76b900] font-bold">
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

            <div class="p-3 border-t border-[#272f3d] flex justify-end">
              <button
                type="button"
                (click)="selectedDetail.set(null)"
                class="px-4 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold rounded"
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
  private readonly transferService = inject(AdminTransferService);

  readonly transfers = this.transferService.transfers;
  readonly total = this.transferService.transfersTotal;
  readonly page = this.transferService.transfersPage;
  readonly limit = this.transferService.transfersLimit;
  readonly summary = this.transferService.transfersSummary;
  readonly isLoading = this.transferService.isLoading;
  readonly branches = this.transferService.branches;

  readonly searchFilter = signal<string>('');
  readonly statusFilter = signal<string>('ALL');
  readonly sourceBranchFilter = signal<number | null>(null);
  readonly destinationBranchFilter = signal<number | null>(null);

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
    await Promise.all([
      this.transferService.loadBranches(),
      this.fetchTransfers(),
    ]);
  }

  async fetchTransfers(): Promise<void> {
    const params: TransferFilterParams = {
      page: this.page(),
      limit: this.limit(),
      search: this.searchFilter().trim() || undefined,
      status: this.statusFilter() !== 'ALL' ? this.statusFilter() : undefined,
      sourceBranchId: this.sourceBranchFilter() ?? undefined,
      destinationBranchId: this.destinationBranchFilter() ?? undefined,
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
    this.sourceBranchFilter.set(null);
    this.destinationBranchFilter.set(null);
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
