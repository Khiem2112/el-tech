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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmPODialogComponent } from './components/confirm-po-dialog.component';
import { ShortShipmentDialogComponent } from './components/short-shipment-dialog.component';
import { ValidatePOReceiptDialogComponent } from './components/validate-po-receipt-dialog.component';
import {
  AdminPurchaseOrderService,
  CatalogVariantOption,
  CreatePurchaseOrderPayload,
  PurchaseOrderDetail,
  ShortShipmentPayload,
  SimpleOption,
  UpdatePurchaseOrderPayload,
  ValidateReceiptPayload,
} from './services/admin-purchase-order.service';

type EditableLine = {
  skuId: number;
  sku: string;
  name: string;
  barcode: string | null;
  serialRequired: boolean;
  imageUrl: string | null;
  quantity: number;
  agreedUnitCost: number;
  lineTotal: number;
};

type ToastMessage = {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
};

@Component({
  selector: 'app-admin-purchase-order-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ConfirmPODialogComponent,
    ValidatePOReceiptDialogComponent,
    ShortShipmentDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden text-sm text-slate-200">
      <div class="h-9 bg-[#161b26] border-b border-[#272f3d] px-6 flex items-center justify-between text-xs flex-shrink-0">
        <nav class="flex items-center gap-1.5 text-slate-400">
          <a routerLink="/admin/procurement/purchase-orders" class="hover:text-[#76b900] transition-colors">
            Đơn Mua Hàng
          </a>
          <span>/</span>
          <span class="font-mono font-bold text-white">
            {{ isNew() ? 'Tạo Đơn PO Mới' : (order()?.code || 'Đang tải...') }}
          </span>
          @if (!isNew() && order()?.supplier) {
            <span>/</span>
            <span class="truncate max-w-xs text-slate-300">
              Nhà Cung Cấp: {{ order()?.supplier?.name }}
            </span>
          }
        </nav>
        <span class="text-[11px] text-slate-500 font-mono">SCR-21</span>
      </div>

      <header class="bg-[#161b26] border-b border-[#272f3d] px-6 py-2.5 flex items-center justify-between flex-wrap gap-4 flex-shrink-0 shadow-xs">
        <div class="flex items-center gap-2 flex-wrap">
          @if (isNew()) {
            <button
              type="button"
              (click)="saveNewPurchaseOrder()"
              [disabled]="isSubmitting() || editableLines().length === 0"
              class="px-4 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors shadow-sm disabled:opacity-50"
            >
              Lưu Bản Thảo PO
            </button>
            <a
              routerLink="/admin/procurement/purchase-orders"
              class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 font-semibold text-xs rounded transition-colors"
            >
              Hủy Bỏ
            </a>
          } @else if (order(); as po) {
            @switch (po.status) {
              @case ('DRAFT') {
                <button
                  type="button"
                  (click)="saveDraftChanges()"
                  [disabled]="isSubmitting()"
                  class="px-3.5 py-1.5 bg-[#1f2736] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs rounded transition-colors"
                >
                  Lưu Thay Đổi
                </button>
                <button
                  type="button"
                  (click)="openConfirmModal()"
                  class="px-3.5 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors shadow-sm"
                >
                  Xác Nhận PO
                </button>
                <button
                  type="button"
                  (click)="openCancelModal()"
                  class="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-800 text-xs rounded transition-colors"
                >
                  Hủy Đơn PO
                </button>
              }
              @case ('CONFIRMED') {
                <button
                  type="button"
                  (click)="openValidateReceiptModal()"
                  class="px-4 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded shadow-sm transition-colors"
                >
                  Đối Soát & Nhập Kho 100%
                </button>
                <button
                  type="button"
                  (click)="openShortShipmentModal()"
                  class="px-3.5 py-1.5 bg-amber-950/40 hover:bg-amber-950/80 text-amber-300 border border-amber-800 font-bold text-xs rounded transition-colors"
                >
                  Báo Giao Thiếu Hàng
                </button>
                <button
                  type="button"
                  (click)="openCancelModal()"
                  class="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-800 text-xs rounded transition-colors"
                >
                  Hủy Đơn PO
                </button>
              }
              @case ('RECEIVED') {
                <button
                  type="button"
                  (click)="closePurchaseOrder()"
                  [disabled]="isSubmitting()"
                  class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-sm transition-colors"
                >
                  Đóng Đơn PO
                </button>
              }
              @case ('CLOSED') {
                <span class="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs font-semibold border border-slate-700">
                  Đơn PO đã hoàn tất và đóng
                </span>
              }
              @case ('CANCELLED') {
                <span class="px-3 py-1 bg-rose-950/60 text-rose-300 rounded text-xs font-semibold border border-rose-800">
                  Đơn PO đã bị hủy ({{ po.cancellationReason || 'Không có lý do' }})
                </span>
              }
            }
          }
        </div>

        <div class="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
          <div
            class="px-2.5 py-1 rounded transition-colors"
            [class.bg-[#76b900]]="currentStep() >= 1"
            [class.text-[#090d16]]="currentStep() >= 1"
            [class.bg-[#090d16]]="currentStep() < 1"
            [class.text-slate-400]="currentStep() < 1"
          >
            Bản Thảo
          </div>
          <span class="text-slate-600">&rarr;</span>
          <div
            class="px-2.5 py-1 rounded transition-colors"
            [class.bg-[#76b900]]="currentStep() >= 2"
            [class.text-[#090d16]]="currentStep() >= 2"
            [class.bg-[#090d16]]="currentStep() < 2"
            [class.text-slate-400]="currentStep() < 2"
          >
            Đã Xác Nhận
          </div>
          <span class="text-slate-600">&rarr;</span>
          <div
            class="px-2.5 py-1 rounded transition-colors"
            [class.bg-[#76b900]]="currentStep() >= 3"
            [class.text-[#090d16]]="currentStep() >= 3"
            [class.bg-[#090d16]]="currentStep() < 3"
            [class.text-slate-400]="currentStep() < 3"
          >
            Đã Nhập Kho
          </div>
          <span class="text-slate-600">&rarr;</span>
          <div
            class="px-2.5 py-1 rounded transition-colors"
            [class.bg-[#76b900]]="currentStep() >= 4"
            [class.text-[#090d16]]="currentStep() >= 4"
            [class.bg-[#090d16]]="currentStep() < 4"
            [class.text-slate-400]="currentStep() < 4"
          >
            Đóng PO
          </div>
        </div>
      </header>

      @if (!isNew() && order(); as po) {
        <div class="bg-[#161b26] border-b border-[#272f3d] px-6 py-3.5 flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-black text-white font-mono tracking-tight">
                ĐƠN MUA HÀNG #{{ po.code }}
              </h1>
              @switch (po.status) {
                @case ('DRAFT') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-800">
                    Bản thảo
                  </span>
                }
                @case ('CONFIRMED') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950/80 text-blue-300 border border-blue-800">
                    Đã xác nhận
                  </span>
                }
                @case ('RECEIVED') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    Đã nhập kho
                  </span>
                }
                @case ('CLOSED') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    Đã đóng
                  </span>
                }
                @case ('CANCELLED') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950/80 text-rose-300 border border-rose-800">
                    Đã hủy
                  </span>
                }
              }
            </div>
            <div class="text-xs text-slate-400 mt-1">
              Nhà cung cấp: <strong class="text-white">{{ po.supplier.name }}</strong> | Chi nhánh nhận: <strong class="text-white">{{ po.receivingBranch.name }}</strong>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              [routerLink]="['/admin/procurement/suppliers']"
              [queryParams]="{ search: po.supplier.code }"
              class="p-2 bg-[#090d16] hover:bg-[#1f2736] border border-[#272f3d] rounded text-center transition-colors min-w-[100px]"
              title="Mở danh bạ nhà cung cấp"
            >
              <div class="font-bold text-[#76b900] text-xs font-mono">{{ po.supplier.code }}</div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Nhà Cung Cấp</div>
            </a>

            @if (po.receiptMove) {
              <a
                [routerLink]="['/admin/inventory/ledger']"
                [queryParams]="{ search: po.code }"
                class="p-2 bg-[#090d16] hover:bg-[#1f2736] border border-[#272f3d] rounded text-center transition-colors min-w-[100px] cursor-pointer group block"
                title="Nhấp để xem chứng từ nhập kho trong sổ kho bất biến"
              >
                <div class="font-bold text-xs font-mono text-emerald-400 truncate group-hover:scale-105 transition-transform">
                  {{ po.receiptMove.code }}
                </div>
                <div class="text-[10px] text-slate-400 uppercase tracking-wider">Phiếu Nhập Kho</div>
              </a>
            } @else if (po.status === 'CONFIRMED') {
              <button
                type="button"
                (click)="openValidateReceiptModal()"
                class="p-2 bg-[#090d16] hover:bg-[#1f2736] border border-[#272f3d] rounded text-center transition-colors min-w-[100px] cursor-pointer group block w-full"
                title="Nhấp để mở giao diện quét mã và đối soát nhập kho"
              >
                <div class="font-bold text-xs font-mono text-amber-400 truncate group-hover:scale-105 transition-transform">
                  Chờ Nhập Kho
                </div>
                <div class="text-[10px] text-slate-400 uppercase tracking-wider">Đối Soát Kho</div>
              </button>
            } @else {
              <div class="p-2 bg-[#090d16] border border-[#272f3d] rounded text-center min-w-[100px]">
                <div class="font-bold text-xs font-mono text-slate-500 truncate">Chưa Tạo</div>
                <div class="text-[10px] text-slate-500 uppercase tracking-wider">Phiếu Nhập Kho</div>
              </div>
            }

            <a
              [routerLink]="['/admin/inventory/serials']"
              [queryParams]="{ search: po.code }"
              class="p-2 bg-[#090d16] hover:bg-[#1f2736] border border-[#272f3d] rounded text-center transition-colors min-w-[100px] cursor-pointer group block"
              title="Nhấp để xem danh sách sê-ri linh kiện đã nạp từ đơn PO này"
            >
              <div class="font-bold text-white text-xs font-mono group-hover:scale-105 transition-transform">
                {{ totalAssignedSerials() }} / {{ totalSerialRequiredQuantity() }}
              </div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Serial Đã Gán</div>
            </a>

            @if (po.supersedesPurchaseOrder) {
              <a
                [routerLink]="['/admin/procurement/purchase-orders', po.supersedesPurchaseOrder.id]"
                class="p-2 bg-amber-950/30 hover:bg-amber-950/60 border border-amber-800 rounded text-center transition-colors min-w-[100px]"
                title="Bấm để xem đơn mua hàng gốc bị hủy"
              >
                <div class="font-bold text-amber-300 text-xs font-mono">{{ po.supersedesPurchaseOrder.code }}</div>
                <div class="text-[10px] text-amber-400 uppercase tracking-wider">Đơn Gốc</div>
              </a>
            } @else if (po.supersededByOrders.length > 0) {
              <a
                [routerLink]="['/admin/procurement/purchase-orders', po.supersededByOrders[0].id]"
                class="p-2 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800 rounded text-center transition-colors min-w-[100px]"
                title="Bấm để xem đơn mua hàng thay thế"
              >
                <div class="font-bold text-rose-300 text-xs font-mono">{{ po.supersededByOrders[0].code }}</div>
                <div class="text-[10px] text-rose-400 uppercase tracking-wider">PO Thay Thế</div>
              </a>
            } @else {
              <div class="p-2 bg-[#090d16] border border-[#272f3d] rounded text-center min-w-[100px]">
                <div class="font-bold text-slate-400 text-xs font-mono">Đơn gốc</div>
                <div class="text-[10px] text-slate-500 uppercase tracking-wider">PO Thay Thế</div>
              </div>
            }
          </div>
        </div>
      }

      <main class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-2">
            <h2 class="text-xs font-bold uppercase tracking-wider text-white">
              Thông Tin Đơn Mua Hàng
            </h2>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              [class.bg-emerald-950]="isNew() || order()?.status === 'DRAFT'"
              [class.text-emerald-300]="isNew() || order()?.status === 'DRAFT'"
              [class.bg-slate-800]="!isNew() && order()?.status !== 'DRAFT'"
              [class.text-slate-400]="!isNew() && order()?.status !== 'DRAFT'"
            >
              {{ (isNew() || order()?.status === 'DRAFT') ? 'Có thể chỉnh sửa' : 'Dữ liệu đã khóa' }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold uppercase mb-1">Nhà Cung Cấp</label>
              @if (isNew() || order()?.status === 'DRAFT') {
                <select
                  [(ngModel)]="selectedSupplierId"
                  class="w-full px-2.5 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white focus:outline-none focus:border-[#76b900]"
                >
                  <option [ngValue]="null" disabled>Chọn nhà cung cấp...</option>
                  @for (s of suppliers(); track s.id) {
                    <option [ngValue]="s.id">{{ s.name }} ({{ s.code }})</option>
                  }
                </select>
              } @else {
                <div class="font-bold text-white text-sm pt-1">{{ order()?.supplier?.name }}</div>
                <div class="text-slate-400 text-xs font-mono mt-0.5">{{ order()?.supplier?.code }}</div>
              }
            </div>

            <div>
              <label class="block text-slate-400 font-semibold uppercase mb-1">Kho Nhận Hàng</label>
              @if (isNew() || order()?.status === 'DRAFT') {
                <select
                  [(ngModel)]="selectedBranchId"
                  class="w-full px-2.5 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white focus:outline-none focus:border-[#76b900]"
                >
                  <option [ngValue]="null" disabled>Chọn chi nhánh nhận hàng...</option>
                  @for (b of branches(); track b.id) {
                    <option [ngValue]="b.id">{{ b.name }} ({{ b.code }})</option>
                  }
                </select>
              } @else {
                <div class="font-bold text-white text-sm pt-1">{{ order()?.receivingBranch?.name }}</div>
                <div class="text-slate-400 text-xs font-mono mt-0.5">{{ order()?.receivingBranch?.code }}</div>
              }
            </div>

            <div>
              <label class="block text-slate-400 font-semibold uppercase mb-1">Ghi Chú Đơn Hàng</label>
              @if (isNew() || order()?.status === 'DRAFT') {
                <input
                  type="text"
                  [(ngModel)]="orderNote"
                  placeholder="Ghi chú nội bộ hoặc điều khoản giao hàng..."
                  class="w-full px-2.5 py-2 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white focus:outline-none focus:border-[#76b900]"
                />
              } @else {
                <div class="text-slate-300 text-xs pt-1">{{ order()?.note || 'Không có ghi chú' }}</div>
              }
            </div>

            <div>
              <label class="block text-slate-400 font-semibold uppercase mb-1">Tổng Giá Trị Đơn PO</label>
              <div class="font-black text-[#76b900] text-base pt-1 tabular-nums font-mono">
                {{ formatCurrency(calculatedTotalAmount()) }} ₫
              </div>
              <div class="text-slate-400 text-[10px] mt-0.5">Đã bao gồm đơn giá thỏa thuận VAT</div>
            </div>
          </div>
        </div>

        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm">
          <div class="p-4 border-b border-[#272f3d] flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 class="text-xs font-bold uppercase tracking-wider text-white">
                Danh Sách Linh Kiện Đặt Mua
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ (isNew() || order()?.status === 'DRAFT') ? 'Thêm mới hoặc chỉnh sửa linh kiện và đơn giá thỏa thuận' : 'Dòng hàng được khóa cứng theo quy tắc PUR-005' }}
              </p>
            </div>

            @if (isNew() || order()?.status === 'DRAFT') {
              <div class="relative w-72">
                <input
                  type="text"
                  [ngModel]="variantSearchTerm()"
                  (ngModelChange)="onSearchVariants($event)"
                  placeholder="+ Thêm SKU linh kiện vào PO..."
                  class="w-full pl-8 pr-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                />
                <svg
                  class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>

                @if (searchedVariants().length > 0) {
                  <div class="absolute left-0 right-0 mt-1 bg-[#090d16] border border-[#272f3d] rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto">
                    @for (v of searchedVariants(); track v.id) {
                      <div
                        (click)="addVariantToOrder(v)"
                        class="p-2 hover:bg-[#1f2736] cursor-pointer border-b border-[#272f3d]/60 last:border-none flex items-center justify-between gap-2"
                      >
                        <div class="min-w-0 flex-1">
                          <div class="font-mono font-bold text-white text-xs truncate">{{ v.sku }}</div>
                          <div class="text-[11px] text-slate-400 truncate">{{ v.productTemplate.name }}</div>
                        </div>
                        <div class="text-right flex-shrink-0">
                          <span class="text-[#76b900] text-xs font-mono font-bold">
                            {{ formatCurrency(v.sellingPrice) }} ₫
                          </span>
                          @if (v.serialRequired) {
                            <div class="text-[9px] text-blue-400">Cần Serial</div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-[#090d16] border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-2.5 px-4 w-12 text-center">Ảnh</th>
                  <th class="py-2.5 px-4">Mã SKU</th>
                  <th class="py-2.5 px-4">Tên Linh Kiện</th>
                  <th class="py-2.5 px-4 text-center">Yêu Cầu Serial</th>
                  <th class="py-2.5 px-4 text-center w-28">Số Lượng</th>
                  <th class="py-2.5 px-4 text-right w-36">Đơn Giá Thỏa Thuận</th>
                  <th class="py-2.5 px-4 text-right">Thành Tiền</th>
                  @if (isNew() || order()?.status === 'DRAFT') {
                    <th class="py-2.5 px-4 text-center w-16">Xóa</th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d]">
                @if (editableLines().length === 0) {
                  <tr>
                    <td [attr.colspan]="(isNew() || order()?.status === 'DRAFT') ? 8 : 7" class="py-8 text-center text-slate-500">
                      Chưa có linh kiện nào trong đơn mua hàng. Vui lòng tìm và thêm linh kiện ở trên.
                    </td>
                  </tr>
                } @else {
                  @for (line of editableLines(); track line.skuId) {
                    <tr class="hover:bg-[#1f2736]/60 transition-colors">
                      <td class="py-2.5 px-4 text-center">
                        <div class="w-9 h-9 rounded bg-[#090d16] border border-[#272f3d] overflow-hidden flex items-center justify-center mx-auto">
                          @if (line.imageUrl) {
                            <img [src]="line.imageUrl" [alt]="line.sku" class="w-full h-full object-contain p-0.5" />
                          } @else {
                            <span class="text-[10px] text-slate-600 font-mono">PC</span>
                          }
                        </div>
                      </td>
                      <td class="py-2.5 px-4 font-mono font-bold text-white">
                        {{ line.sku }}
                      </td>
                      <td class="py-2.5 px-4 font-semibold text-slate-200">
                        {{ line.name }}
                      </td>
                      <td class="py-2.5 px-4 text-center">
                        @if (line.serialRequired) {
                          <span class="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px] font-semibold">
                            Bắt buộc Serial
                          </span>
                        } @else {
                          <span class="text-slate-500 text-[10px]">Không</span>
                        }
                      </td>
                      <td class="py-2.5 px-4 text-center">
                        @if (isNew() || order()?.status === 'DRAFT') {
                          <input
                            type="number"
                            min="1"
                            [ngModel]="line.quantity"
                            (ngModelChange)="onLineQuantityChange(line.skuId, $event)"
                            class="w-20 px-2 py-1 bg-[#090d16] border border-[#272f3d] rounded text-center font-bold text-white text-xs focus:outline-none focus:border-[#76b900]"
                          />
                        } @else {
                          <span class="font-black text-white tabular-nums text-sm">
                            {{ line.quantity }} chiếc
                          </span>
                        }
                      </td>
                      <td class="py-2.5 px-4 text-right">
                        @if (isNew() || order()?.status === 'DRAFT') {
                          <input
                            type="number"
                            min="0"
                            [ngModel]="line.agreedUnitCost"
                            (ngModelChange)="onLineCostChange(line.skuId, $event)"
                            class="w-32 px-2 py-1 bg-[#090d16] border border-[#272f3d] rounded text-right font-mono font-bold text-white text-xs focus:outline-none focus:border-[#76b900]"
                          />
                        } @else {
                          <span class="font-mono text-slate-300 tabular-nums">
                            {{ formatCurrency(line.agreedUnitCost) }} ₫
                          </span>
                        }
                      </td>
                      <td class="py-2.5 px-4 text-right font-black tabular-nums font-mono text-[#76b900] text-sm">
                        {{ formatCurrency(line.lineTotal) }} ₫
                      </td>
                      @if (isNew() || order()?.status === 'DRAFT') {
                        <td class="py-2.5 px-4 text-center">
                          <button
                            type="button"
                            (click)="removeLine(line.skuId)"
                            class="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Xóa dòng"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      }
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <app-confirm-po-dialog
        [po]="order()"
        [isOpen]="isConfirmModalOpen()"
        [isSubmitting]="isSubmitting()"
        (confirmed)="handleConfirmOrder()"
        (cancelled)="isConfirmModalOpen.set(false)"
      ></app-confirm-po-dialog>

      <app-validate-po-receipt-dialog
        [po]="order()"
        [isOpen]="isValidateReceiptModalOpen()"
        [isSubmitting]="isSubmitting()"
        (validated)="handleValidateReceipt($event)"
        (cancelled)="isValidateReceiptModalOpen.set(false)"
      ></app-validate-po-receipt-dialog>

      <app-short-shipment-dialog
        [po]="order()"
        [isOpen]="isShortShipmentModalOpen()"
        [isSubmitting]="isSubmitting()"
        (submitted)="handleShortShipment($event)"
        (cancelled)="isShortShipmentModalOpen.set(false)"
      ></app-short-shipment-dialog>

      @if (toasts().length > 0) {
        <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          @for (toast of toasts(); track toast.id) {
            <div
              class="px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold text-white pointer-events-auto border transition-all animate-bounce-short"
              [class.bg-emerald-800]="toast.type === 'success'"
              [class.border-emerald-600]="toast.type === 'success'"
              [class.bg-rose-900]="toast.type === 'error'"
              [class.border-rose-700]="toast.type === 'error'"
              [class.bg-[#161b26]]="toast.type === 'info'"
              [class.border-[#272f3d]]="toast.type === 'info'"
            >
              {{ toast.text }}
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AdminPurchaseOrderDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly poService = inject(AdminPurchaseOrderService);

  readonly order = signal<PurchaseOrderDetail | null>(null);
  readonly isNew = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  readonly suppliers = signal<SimpleOption[]>([]);
  readonly branches = signal<SimpleOption[]>([]);

  selectedSupplierId: number | null = null;
  selectedBranchId: number | null = null;
  orderNote = '';

  readonly editableLines = signal<EditableLine[]>([]);
  readonly variantSearchTerm = signal<string>('');
  readonly searchedVariants = signal<CatalogVariantOption[]>([]);

  readonly isConfirmModalOpen = signal<boolean>(false);
  readonly isValidateReceiptModalOpen = signal<boolean>(false);
  readonly isShortShipmentModalOpen = signal<boolean>(false);

  readonly toasts = signal<ToastMessage[]>([]);
  private toastCounter = 0;

  readonly currentStep = computed<number>(() => {
    if (this.isNew()) {
      return 1;
    }
    const status = this.order()?.status;
    switch (status) {
      case 'DRAFT':
        return 1;
      case 'CONFIRMED':
        return 2;
      case 'RECEIVED':
        return 3;
      case 'CLOSED':
        return 4;
      default:
        return 1;
    }
  });

  readonly calculatedTotalAmount = computed<number>(() => {
    return this.editableLines().reduce((sum, line) => sum + line.lineTotal, 0);
  });

  readonly totalAssignedSerials = computed<number>(() => {
    const lines = this.order()?.lines ?? [];
    return lines.reduce((sum, l) => sum + (l.receivedSerials?.length ?? 0), 0);
  });

  readonly totalSerialRequiredQuantity = computed<number>(() => {
    const lines = this.order()?.lines ?? [];
    return lines.filter((l) => l.sku.serialRequired).reduce((sum, l) => sum + l.quantity, 0);
  });

  async ngOnInit(): Promise<void> {
    await this.loadDropdownOptions();

    const id = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map((s) => s.path).join('/');

    if (id === 'new' || url.includes('/new')) {
      this.isNew.set(true);
      if (this.suppliers().length > 0) {
        this.selectedSupplierId = this.suppliers()[0].id;
      }
      if (this.branches().length > 0) {
        this.selectedBranchId = this.branches()[0].id;
      }
    } else if (id) {
      await this.loadOrder(id);
    }
  }

  private async loadDropdownOptions(): Promise<void> {
    const [suppliersData, branchesData] = await Promise.all([
      this.poService.loadSuppliers(),
      this.poService.loadBranches(),
    ]);
    this.suppliers.set(suppliersData);
    this.branches.set(branchesData);
  }

  private async loadOrder(id: string): Promise<void> {
    try {
      const data = await this.poService.getPurchaseOrderById(id);
      this.order.set(data);
      this.selectedSupplierId = data.supplierId;
      this.selectedBranchId = data.receivingBranchId;
      this.orderNote = data.note ?? '';

      const lines: EditableLine[] = data.lines.map((l) => ({
        skuId: l.skuId,
        sku: l.sku.sku,
        name: l.sku.templateName,
        barcode: l.sku.barcode,
        serialRequired: l.sku.serialRequired,
        imageUrl: l.sku.imageUrl,
        quantity: l.quantity,
        agreedUnitCost: parseFloat(l.agreedUnitCost) || 0,
        lineTotal: parseFloat(l.lineTotal) || 0,
      }));
      this.editableLines.set(lines);
    } catch {
      this.showToast('Không tìm thấy đơn mua hàng hoặc đơn hàng đã bị xóa', 'error');
      void this.router.navigate(['/admin/procurement/purchase-orders']);
    }
  }

  async onSearchVariants(term: string): Promise<void> {
    this.variantSearchTerm.set(term);
    if (!term || term.trim().length < 2) {
      this.searchedVariants.set([]);
      return;
    }

    const results = await this.poService.searchCatalogVariants(term.trim());
    const existingSkuIds = new Set(this.editableLines().map((l) => l.skuId));
    this.searchedVariants.set(results.filter((v) => !existingSkuIds.has(v.id)));
  }

  addVariantToOrder(variant: CatalogVariantOption): void {
    const unitCost = parseFloat(variant.sellingPrice) || 0;
    const newLine: EditableLine = {
      skuId: variant.id,
      sku: variant.sku,
      name: variant.productTemplate.name,
      barcode: variant.barcode,
      serialRequired: variant.serialRequired,
      imageUrl: variant.imageUrl,
      quantity: 1,
      agreedUnitCost: unitCost,
      lineTotal: unitCost,
    };

    this.editableLines.set([...this.editableLines(), newLine]);
    this.variantSearchTerm.set('');
    this.searchedVariants.set([]);
  }

  onLineQuantityChange(skuId: number, val: number): void {
    const qty = Math.max(1, Number(val) || 1);
    const updated = this.editableLines().map((line) => {
      if (line.skuId === skuId) {
        return {
          ...line,
          quantity: qty,
          lineTotal: qty * line.agreedUnitCost,
        };
      }
      return line;
    });
    this.editableLines.set(updated);
  }

  onLineCostChange(skuId: number, val: number): void {
    const cost = Math.max(0, Number(val) || 0);
    const updated = this.editableLines().map((line) => {
      if (line.skuId === skuId) {
        return {
          ...line,
          agreedUnitCost: cost,
          lineTotal: line.quantity * cost,
        };
      }
      return line;
    });
    this.editableLines.set(updated);
  }

  removeLine(skuId: number): void {
    this.editableLines.set(this.editableLines().filter((l) => l.skuId !== skuId));
  }

  async saveNewPurchaseOrder(): Promise<void> {
    if (!this.selectedSupplierId) {
      this.showToast('Vui lòng chọn nhà cung cấp', 'error');
      return;
    }
    if (!this.selectedBranchId) {
      this.showToast('Vui lòng chọn chi nhánh nhận hàng', 'error');
      return;
    }
    if (this.editableLines().length === 0) {
      this.showToast('Đơn mua hàng phải có ít nhất một linh kiện', 'error');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const payload: CreatePurchaseOrderPayload = {
        supplierId: this.selectedSupplierId,
        receivingBranchId: this.selectedBranchId,
        note: this.orderNote.trim() || null,
        lines: this.editableLines().map((l) => ({
          skuId: l.skuId,
          quantity: l.quantity,
          agreedUnitCost: l.agreedUnitCost,
        })),
      };

      const created = await this.poService.createPurchaseOrder(payload);
      this.showToast(`Đã tạo thành công đơn mua hàng ${created.code}`, 'success');
      void this.router.navigate(['/admin/procurement/purchase-orders', created.id]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo mới đơn PO thất bại';
      this.showToast(msg, 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async saveDraftChanges(): Promise<void> {
    const po = this.order();
    if (!po) {
      return;
    }

    if (!this.selectedSupplierId || !this.selectedBranchId) {
      this.showToast('Vui lòng chọn nhà cung cấp và chi nhánh nhận', 'error');
      return;
    }

    if (this.editableLines().length === 0) {
      this.showToast('Đơn mua hàng phải có ít nhất một linh kiện', 'error');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const payload: UpdatePurchaseOrderPayload = {
        supplierId: this.selectedSupplierId,
        receivingBranchId: this.selectedBranchId,
        note: this.orderNote.trim() || null,
        lines: this.editableLines().map((l) => ({
          skuId: l.skuId,
          quantity: l.quantity,
          agreedUnitCost: l.agreedUnitCost,
        })),
      };

      await this.poService.updatePurchaseOrder(po.id, payload);
      this.showToast('Đã lưu thay đổi đơn mua hàng', 'success');
      await this.loadOrder(po.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật đơn PO thất bại';
      this.showToast(msg, 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  openConfirmModal(): void {
    this.isConfirmModalOpen.set(true);
  }

  async handleConfirmOrder(): Promise<void> {
    const po = this.order();
    if (!po) {
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.poService.confirmPurchaseOrder(po.id);
      this.isConfirmModalOpen.set(false);
      this.showToast(`Đã xác nhận và khóa đơn mua ${po.code}`, 'success');
      await this.loadOrder(po.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xác nhận đơn PO thất bại';
      this.showToast(msg, 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  openValidateReceiptModal(): void {
    this.isValidateReceiptModalOpen.set(true);
  }

  async handleValidateReceipt(payload: ValidateReceiptPayload): Promise<void> {
    const po = this.order();
    if (!po) {
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.poService.validateReceipt(po.id, payload);
      this.isValidateReceiptModalOpen.set(false);
      this.showToast(`Đối soát 100% thành công, đã nhập kho và tính lại giá vốn cho đơn ${po.code}`, 'success');
      await this.loadOrder(po.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đối soát nhập kho thất bại';
      this.showToast(msg, 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  openShortShipmentModal(): void {
    this.isShortShipmentModalOpen.set(true);
  }

  async handleShortShipment(payload: ShortShipmentPayload): Promise<void> {
    const po = this.order();
    if (!po) {
      return;
    }

    this.isSubmitting.set(true);
    try {
      const replacement = await this.poService.handleShortShipment(po.id, payload);
      this.isShortShipmentModalOpen.set(false);
      this.showToast(`Đã hủy PO ${po.code} và tạo PO thay thế ${replacement.code}`, 'success');
      void this.router.navigate(['/admin/procurement/purchase-orders', replacement.id]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xử lý giao thiếu thất bại';
      this.showToast(msg, 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async closePurchaseOrder(): Promise<void> {
    const po = this.order();
    if (!po) {
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.poService.closePurchaseOrder(po.id);
      this.showToast(`Đã đóng đơn mua hàng ${po.code}`, 'success');
      await this.loadOrder(po.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đóng đơn PO';
      this.showToast(msg, 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async openCancelModal(): Promise<void> {
    const po = this.order();
    if (!po) {
      return;
    }

    const reason = window.prompt(`Nhập lý do hủy đơn mua hàng #${po.code}:`);
    if (!reason || !reason.trim()) {
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.poService.cancelPurchaseOrder(po.id, reason.trim());
      this.showToast(`Đã hủy đơn mua hàng #${po.code}`, 'info');
      await this.loadOrder(po.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hủy đơn PO thất bại';
      this.showToast(msg, 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  formatCurrency(value: string | number): string {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) {
      return '0';
    }
    return num.toLocaleString('vi-VN');
  }

  showToast(text: string, type: 'success' | 'error' | 'info'): void {
    const id = ++this.toastCounter;
    this.toasts.set([...this.toasts(), { id, text, type }]);
    setTimeout(() => {
      this.toasts.set(this.toasts().filter((t) => t.id !== id));
    }, 4500);
  }
}
