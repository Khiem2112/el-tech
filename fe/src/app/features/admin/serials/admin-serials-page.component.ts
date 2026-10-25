import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SerialDetailDialogComponent } from './components/serial-detail-dialog.component';
import { AdminSerialService } from './services/admin-serial.service';

@Component({
  selector: 'app-admin-serials-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SerialDetailDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto text-sm text-slate-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
            SCR-17
          </span>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              Tra Cứu Vòng Đời Sê-ri & Lịch Sử Bảo Hành
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              Định danh đơn vị vật lý duy nhất, kiểm soát vị trí chi nhánh và truy vết bảo hành (INV-011 đến INV-014)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400">
            Tổng số: <strong class="text-white font-mono">{{ summary().totalSerials }}</strong> sê-ri
          </span>
          <a
            routerLink="/admin/inventory/balances"
            class="px-3.5 py-2 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs rounded transition-colors inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg class="w-4 h-4 text-[#76b900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          class="p-3 bg-[#161b26] border rounded-lg text-left transition-colors cursor-pointer"
          [ngClass]="activeStatus() === 'ALL' ? 'border-[#76b900] ring-1 ring-[#76b900]' : 'border-[#272f3d] hover:border-slate-600'"
        >
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tất cả Serial</div>
          <div class="text-lg font-bold font-mono text-white mt-1">{{ summary().totalSerials }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('AVAILABLE')"
          class="p-3 bg-[#161b26] border rounded-lg text-left transition-colors cursor-pointer"
          [ngClass]="activeStatus() === 'AVAILABLE' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-[#272f3d] hover:border-slate-600'"
        >
          <div class="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Trong kho</div>
          <div class="text-lg font-bold font-mono text-emerald-400 mt-1">{{ summary().availableCount }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('RESERVED')"
          class="p-3 bg-[#161b26] border rounded-lg text-left transition-colors cursor-pointer"
          [ngClass]="activeStatus() === 'RESERVED' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-[#272f3d] hover:border-slate-600'"
        >
          <div class="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Khóa giữ hàng</div>
          <div class="text-lg font-bold font-mono text-amber-400 mt-1">{{ summary().reservedCount }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('IN_TRANSIT')"
          class="p-3 bg-[#161b26] border rounded-lg text-left transition-colors cursor-pointer"
          [ngClass]="activeStatus() === 'IN_TRANSIT' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-[#272f3d] hover:border-slate-600'"
        >
          <div class="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Đang chuyển</div>
          <div class="text-lg font-bold font-mono text-blue-400 mt-1">{{ summary().inTransitCount }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('ISSUED')"
          class="p-3 bg-[#161b26] border rounded-lg text-left transition-colors cursor-pointer"
          [ngClass]="activeStatus() === 'ISSUED' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-[#272f3d] hover:border-slate-600'"
        >
          <div class="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Đã xuất bán</div>
          <div class="text-lg font-bold font-mono text-purple-400 mt-1">{{ summary().issuedCount }}</div>
        </button>

        <button
          type="button"
          (click)="filterByStatus('QUARANTINED')"
          class="p-3 bg-[#161b26] border rounded-lg text-left transition-colors cursor-pointer"
          [ngClass]="activeStatus() === 'QUARANTINED' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#272f3d] hover:border-slate-600'"
        >
          <div class="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Cách ly / Lỗi</div>
          <div class="text-lg font-bold font-mono text-rose-400 mt-1">{{ summary().quarantinedCount }}</div>
        </button>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-xl p-5 shadow-sm space-y-4 max-w-4xl mx-auto">
        <div class="text-center space-y-1">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300">
            Quét Mã Vạch Hoặc Nhập Số Sê-Ri Tra Cứu Tức Thì
          </h2>
          <p class="text-xs text-slate-400">
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
              class="w-full pl-4 pr-24 py-3 bg-[#090d16] border-2 border-[#272f3d] focus:border-[#76b900] rounded-lg font-mono font-bold text-white text-sm focus:outline-none transition-colors"
            />
            <span class="absolute right-3 top-3.5 text-slate-500 font-mono text-xs uppercase tracking-wider">
              MÃ VẠCH
            </span>
          </div>

          <button
            type="submit"
            [disabled]="isQuickLookupLoading()"
            class="px-6 py-3 bg-[#76b900] hover:bg-[#5a8d00] text-black font-bold rounded-lg shadow-sm whitespace-nowrap text-sm uppercase tracking-wide disabled:opacity-50 transition-colors flex items-center gap-2"
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
          <div class="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs text-center">
            {{ quickLookupError() }}
          </div>
        }

        <div class="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400">
          <span>Gợi ý mẫu:</span>
          @for (sample of sampleSerials; track sample) {
            <button
              type="button"
              (click)="selectSampleSerial(sample)"
              class="px-2.5 py-1 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded font-mono font-bold text-slate-300 text-xs transition-colors"
            >
              {{ sample }}
            </button>
          }
        </div>
      </div>

      @if (quickLookupSerial(); as qk) {
        <div class="bg-[#161b26] border border-[#76b900]/50 rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div class="bg-[#090d16] p-4 border-b border-[#272f3d] flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded border border-[#272f3d] bg-[#161b26] flex items-center justify-center text-[#76b900] font-mono font-bold text-base">
                SN
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-sm font-bold text-white">{{ qk.productTemplate.name }}</h3>
                  <span class="text-xs px-2 py-0.5 rounded font-bold uppercase" [ngClass]="getStatusBadgeClass(qk.status)">
                    {{ getStatusLabel(qk.status) }}
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5">
                  Serial: <strong class="text-white">{{ qk.serialNumber }}</strong> | SKU: <strong>{{ qk.sku }}</strong>
                  @if (qk.barcode) {
                    <span> | Barcode: <strong>{{ qk.barcode }}</strong></span>
                  }
                </div>
              </div>
            </div>

            <div class="text-left sm:text-right">
              <span class="text-xs uppercase font-semibold text-slate-400 block">Vị trí hiện tại</span>
              <span class="font-bold text-white text-sm">
                {{ qk.currentBranch?.name ?? 'Chưa phân bổ' }}
              </span>
              @if (qk.currentBranch) {
                <span class="text-xs text-slate-400 font-mono block">({{ qk.currentBranch.code }})</span>
              }
            </div>
          </div>

          <div class="p-4 bg-emerald-950/20 border-b border-emerald-900/40 text-emerald-300 text-xs">
            Linh kiện đang ở trạng thái hợp lệ. Số Serial gắn cố định với lịch sử di chuyển và chính sách bảo hành chính hãng.
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#272f3d]">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
                <span class="font-bold text-white uppercase tracking-wider text-xs">Lịch sử di chuyển gần nhất</span>
                <span class="text-xs font-mono text-[#76b900]">{{ qk.movements.length }} bản ghi</span>
              </div>

              @if (qk.movements.length === 0) {
                <div class="py-6 text-center text-xs text-slate-500">Chưa có lịch sử di chuyển</div>
              } @else {
                <div class="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#272f3d]">
                  @for (mov of qk.movements.slice(-3); track mov.id) {
                    <div class="relative">
                      <span class="absolute -left-6 top-1 w-3 h-3 rounded-full border border-[#161b26]" [ngClass]="getMovementDotClass(mov.resultingStatus)"></span>
                      <div class="font-bold text-white text-xs">{{ mov.summaryText }}</div>
                      <div class="text-xs text-slate-400">
                        {{ formatDateTime(mov.occurredAt) }} | Phiếu: <strong class="text-[#76b900] font-mono">{{ mov.stockMoveCode }}</strong>
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
              <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
                <span class="font-bold text-white uppercase tracking-wider text-xs">Chính sách & Thời hạn bảo hành</span>
                <span class="text-xs font-mono font-bold text-emerald-400">Chính hãng</span>
              </div>

              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="bg-[#090d16] p-2.5 rounded border border-[#272f3d]">
                    <span class="text-[11px] uppercase font-semibold text-slate-400 block">Thời hạn bảo hành</span>
                    <strong class="text-white text-sm font-bold">{{ qk.warranty.durationMonths }} Tháng</strong>
                  </div>

                  <div class="bg-[#090d16] p-2.5 rounded border border-[#272f3d]">
                    <span class="text-[11px] uppercase font-semibold text-slate-400 block">Đơn vị tiếp nhận</span>
                    <strong class="text-white text-xs font-bold truncate block">{{ qk.warranty.serviceProvider }}</strong>
                  </div>
                </div>

                <div class="p-3 bg-[#090d16] rounded border border-[#272f3d] space-y-1.5 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Ngày bắt đầu bảo hành:</span>
                    <span class="font-bold font-mono text-white">{{ formatDate(qk.warranty.startDate) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Ngày hết hạn dự kiến:</span>
                    <span class="font-bold font-mono text-emerald-400">{{ formatDate(qk.warranty.endDate) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Số lần bảo hành đã ghi nhận:</span>
                    <span class="font-bold text-white">{{ qk.warranty.warrantyClaimCount }} lần</span>
                  </div>
                </div>

                <div class="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    (click)="openSerialModal(qk.id)"
                    class="flex-1 px-4 py-2.5 bg-[#76b900] hover:bg-[#5a8d00] text-black font-bold rounded-lg text-xs uppercase tracking-wide transition-colors"
                  >
                    Xem Chi Tiết Vòng Đời (MOD-23)
                  </button>
                  <button
                    type="button"
                    (click)="clearQuickLookup()"
                    class="px-3 py-2.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold rounded-lg text-xs"
                  >
                    Đóng Xem Nhanh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="bg-[#161b26] border border-[#272f3d] rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div class="flex flex-1 flex-col sm:flex-row gap-2">
          <div class="relative flex-1">
            <input
              type="text"
              [(ngModel)]="tableSearch"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Lọc theo Serial, SKU, Tên linh kiện..."
              class="w-full bg-[#090d16] border border-[#272f3d] rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#76b900]"
            />
          </div>

          <div class="w-full sm:w-56">
            <select
              [(ngModel)]="selectedBranchFilter"
              (ngModelChange)="onBranchChange($event)"
              class="w-full bg-[#090d16] border border-[#272f3d] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#76b900]"
            >
              <option [ngValue]="null">Tất cả chi nhánh</option>
              @for (b of branches(); track b.id) {
                <option [ngValue]="b.id">{{ b.name }} ({{ b.code }})</option>
              }
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 justify-end">
          <button
            type="button"
            (click)="refreshData()"
            class="px-3 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded text-xs text-slate-300 font-semibold transition-colors flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div class="bg-[#161b26] border border-[#272f3d] rounded-xl overflow-hidden shadow-sm">
        @if (isLoading()) {
          <div class="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <svg class="w-8 h-8 animate-spin text-[#76b900]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span class="text-xs">Đang tải danh sách sê-ri linh kiện...</span>
          </div>
        } @else if (error()) {
          <div class="p-8 text-center text-rose-400 text-xs">
            {{ error() }}
          </div>
        } @else if (serials().length === 0) {
          <div class="py-16 text-center text-slate-400 space-y-2">
            <svg class="w-12 h-12 mx-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="text-sm font-semibold text-slate-300">Không tìm thấy mã sê-ri nào phù hợp</p>
            <p class="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc chi nhánh/trạng thái</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 uppercase tracking-wider font-semibold">
                  <th class="py-3 px-4">Mã Sê-Ri</th>
                  <th class="py-3 px-4">Linh Kiện & SKU</th>
                  <th class="py-3 px-4">Chi Nhánh Hiện Tại</th>
                  <th class="py-3 px-4">Trạng Thái</th>
                  <th class="py-3 px-4 text-right">Giá Niêm Yết</th>
                  <th class="py-3 px-4">Ngày Khởi Tạo</th>
                  <th class="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d]/60">
                @for (unit of serials(); track unit.id) {
                  <tr class="hover:bg-[#090d16]/50 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {{ unit.serialNumber }}
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-200 line-clamp-1">{{ unit.productName }}</div>
                      <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                        SKU: {{ unit.sku }}
                        @if (unit.barcode) {
                          <span> | Barcode: {{ unit.barcode }}</span>
                        }
                      </div>
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      @if (unit.currentBranchName) {
                        <span class="text-slate-200 font-semibold">{{ unit.currentBranchName }}</span>
                        <span class="text-[11px] text-slate-500 font-mono block">({{ unit.currentBranchCode }})</span>
                      } @else {
                        <span class="text-slate-500 italic">Chưa xác định</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <span class="text-[11px] px-2 py-0.5 rounded font-bold uppercase" [ngClass]="getStatusBadgeClass(unit.status)">
                        {{ getStatusLabel(unit.status) }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold text-[#76b900] whitespace-nowrap">
                      {{ formatCurrency(unit.sellingPrice) }}
                    </td>
                    <td class="py-3.5 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {{ formatDate(unit.createdAt) }}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        (click)="openSerialModal(unit.id)"
                        class="px-2.5 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-white rounded font-semibold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div class="p-4 bg-[#090d16] border-t border-[#272f3d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Hiển thị <strong class="text-white">{{ (page() - 1) * limit() + 1 }}</strong> -
              <strong class="text-white">{{ getEndIndex() }}</strong> trong tổng số
              <strong class="text-white">{{ total() }}</strong> sê-ri
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="page() <= 1"
                (click)="goToPage(page() - 1)"
                class="px-3 py-1.5 rounded bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white disabled:opacity-40 transition-colors"
              >
                Trước
              </button>
              <span class="px-2 font-mono text-slate-300">
                Trang {{ page() }} / {{ totalPages() }}
              </span>
              <button
                type="button"
                [disabled]="page() >= totalPages()"
                (click)="goToPage(page() + 1)"
                class="px-3 py-1.5 rounded bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-white disabled:opacity-40 transition-colors"
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

  scannerQuery = '';
  tableSearch = '';
  selectedBranchFilter: number | null = null;
  searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly sampleSerials: string[] = [
    'SN-RTX5090-00192',
    'SN-RTX5090-00188',
    'SN-AMD9800X-88129',
  ];

  ngOnInit(): void {
    const searchParam = this.route.snapshot.queryParams['search'];
    if (searchParam) {
      this.tableSearch = searchParam;
    }
    void this.serialService.loadBranches();
    void this.loadTableData();
  }

  async loadTableData(): Promise<void> {
    await this.serialService.loadSerials({
      search: this.tableSearch,
      status: this.activeStatus(),
      branchId: this.selectedBranchFilter ?? undefined,
      page: this.page(),
      limit: this.limit(),
    });
  }

  filterByStatus(status: string): void {
    this.activeStatus.set(status);
    this.serialService.page.set(1);
    void this.loadTableData();
  }

  onBranchChange(branchId: number | null): void {
    this.selectedBranchFilter = branchId;
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

  getStatusTextClass(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'text-emerald-400';
      case 'RESERVED':
        return 'text-amber-400';
      case 'IN_TRANSIT':
        return 'text-blue-400';
      case 'ISSUED':
        return 'text-purple-400';
      case 'QUARANTINED':
        return 'text-rose-400';
      case 'RETURNED_TO_SUPPLIER':
        return 'text-slate-400';
      default:
        return 'text-slate-300';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'Trong kho';
      case 'RESERVED':
        return 'Đã đặt trước';
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
