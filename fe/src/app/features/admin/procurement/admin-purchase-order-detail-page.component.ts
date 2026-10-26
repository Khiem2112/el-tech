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
import { handleProductImageError } from '../../../core/constants/product.constants';
import { AppIconModule } from '../../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
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
    AppIconModule,
    SelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden text-[13px] text-foreground bg-white w-full">
      <div class="h-9 bg-white border-b border-line px-6 flex items-center justify-between text-xs flex-shrink-0">
        <nav class="flex items-center gap-1.5 text-muted">
          <a routerLink="/admin/procurement/purchase-orders" class="hover:text-primary transition-colors">
            Đơn Mua Hàng
          </a>
          <span>/</span>
          <span class="font-mono font-bold text-foreground">
            {{ isNew() ? 'Tạo Đơn PO Mới' : (order()?.code || 'Đang tải...') }}
          </span>
          @if (!isNew() && order()?.supplier) {
            <span>/</span>
            <span class="truncate max-w-xs text-muted">
              Nhà Cung Cấp: {{ order()?.supplier?.name }}
            </span>
          }
        </nav>
        <span class="text-[11px] text-muted font-mono">SCR-21</span>
      </div>

      <header class="bg-white border-b border-line px-6 py-2.5 flex items-center justify-between flex-wrap gap-4 flex-shrink-0 shadow-xs">
        <div class="flex items-center gap-2 flex-wrap">
          @if (isNew()) {
            <button
              type="button"
              (click)="saveNewPurchaseOrder()"
              [disabled]="isSubmitting() || editableLines().length === 0"
              class="px-4 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded transition-colors shadow-xs disabled:opacity-50"
            >
              Lưu Bản Thảo PO
            </button>
            <a
              routerLink="/admin/procurement/purchase-orders"
              class="px-3 py-1.5 bg-surface-alt hover:bg-surface-alt/80 border border-line text-foreground font-semibold text-xs rounded transition-colors"
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
                  class="px-3.5 py-1.5 bg-surface-alt hover:bg-surface-alt/80 border border-line text-foreground font-semibold text-xs rounded transition-colors"
                >
                  Lưu Thay Đổi
                </button>
                <button
                  type="button"
                  (click)="openConfirmModal()"
                  class="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded transition-colors shadow-xs"
                >
                  Xác Nhận PO
                </button>
                <button
                  type="button"
                  (click)="openCancelModal()"
                  class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs rounded transition-colors"
                >
                  Hủy Đơn PO
                </button>
              }
              @case ('CONFIRMED') {
                <button
                  type="button"
                  (click)="openValidateReceiptModal()"
                  class="px-4 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded shadow-xs transition-colors"
                >
                  Đối Soát & Nhập Kho 100%
                </button>
                <button
                  type="button"
                  (click)="openShortShipmentModal()"
                  class="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded transition-colors"
                >
                  Báo Giao Thiếu Hàng
                </button>
                <button
                  type="button"
                  (click)="openCancelModal()"
                  class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs rounded transition-colors"
                >
                  Hủy Đơn PO
                </button>
              }
              @case ('RECEIVED') {
                <button
                  type="button"
                  (click)="closePurchaseOrder()"
                  [disabled]="isSubmitting()"
                  class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs transition-colors"
                >
                  Đóng Đơn PO
                </button>
              }
              @case ('CLOSED') {
                <span class="px-3 py-1 bg-surface-alt text-muted rounded text-xs font-semibold border border-line">
                  Đơn PO đã hoàn tất và đóng
                </span>
              }
              @case ('CANCELLED') {
                <span class="px-3 py-1 bg-rose-50 text-rose-700 rounded text-xs font-semibold border border-rose-200">
                  Đơn PO đã bị hủy ({{ po.cancellationReason || 'Không có lý do' }})
                </span>
              }
            }
          }
        </div>

        <div class="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
          <div
            class="px-2.5 py-1 rounded transition-colors"
            [class.bg-primary]="currentStep() >= 1"
            [class.text-primary-foreground]="currentStep() >= 1"
            [class.bg-surface-alt]="currentStep() < 1"
            [class.text-muted]="currentStep() < 1"
          >
            Bản Thảo
          </div>
          <span class="text-muted">&rarr;</span>
          <div
            class="px-2.5 py-1 rounded transition-colors"
            [class.bg-primary]="currentStep() >= 2"
            [class.text-primary-foreground]="currentStep() >= 2"
            [class.bg-surface-alt]="currentStep() < 2"
            [class.text-muted]="currentStep() < 2"
          >
            Đã Xác Nhận
          </div>
          <span class="text-muted">&rarr;</span>
          <div
            class="px-2.5 py-1 rounded transition-colors"
            [class.bg-primary]="currentStep() >= 3"
            [class.text-primary-foreground]="currentStep() >= 3"
            [class.bg-surface-alt]="currentStep() < 3"
            [class.text-muted]="currentStep() < 3"
          >
            Đã Nhập Kho
          </div>
          <span class="text-muted">&rarr;</span>
          <div
            class="px-2.5 py-1 rounded transition-colors"
            [class.bg-primary]="currentStep() >= 4"
            [class.text-primary-foreground]="currentStep() >= 4"
            [class.bg-surface-alt]="currentStep() < 4"
            [class.text-muted]="currentStep() < 4"
          >
            Đóng PO
          </div>
        </div>
      </header>

      @if (!isNew() && order(); as po) {
        <div class="bg-surface border-b border-line px-6 py-3.5 flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-black text-foreground font-mono tracking-tight">
                ĐƠN MUA HÀNG #{{ po.code }}
              </h1>
              @switch (po.status) {
                @case ('DRAFT') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    Bản thảo
                  </span>
                }
                @case ('CONFIRMED') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    Đã xác nhận
                  </span>
                }
                @case ('RECEIVED') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đã nhập kho
                  </span>
                }
                @case ('CLOSED') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-alt text-muted border border-line">
                    Đã đóng
                  </span>
                }
                @case ('CANCELLED') {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                    Đã hủy
                  </span>
                }
              }
            </div>
            <div class="text-xs text-muted mt-1">
              Nhà cung cấp: <strong class="text-foreground">{{ po.supplier.name }}</strong> | Chi nhánh nhận: <strong class="text-foreground">{{ po.receivingBranch.name }}</strong>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              [routerLink]="['/admin/procurement/suppliers']"
              [queryParams]="{ search: po.supplier.code }"
              class="p-2 bg-white hover:bg-surface-alt border border-line rounded text-center transition-colors min-w-[100px]"
              title="Mở danh bạ nhà cung cấp"
            >
              <div class="font-bold text-primary text-xs font-mono">{{ po.supplier.code }}</div>
              <div class="text-[10px] text-muted uppercase tracking-wider">Nhà Cung Cấp</div>
            </a>

            @if (po.receiptMove) {
              <a
                [routerLink]="['/admin/inventory/ledger']"
                [queryParams]="{ search: po.code }"
                class="p-2 bg-white hover:bg-surface-alt border border-line rounded text-center transition-colors min-w-[100px] cursor-pointer group block"
                title="Nhấp để xem chứng từ nhập kho trong sổ kho bất biến"
              >
                <div class="font-bold text-xs font-mono text-emerald-700 truncate group-hover:scale-105 transition-transform">
                  {{ po.receiptMove.code }}
                </div>
                <div class="text-[10px] text-muted uppercase tracking-wider">Phiếu Nhập Kho</div>
              </a>
            } @else if (po.status === 'CONFIRMED') {
              <button
                type="button"
                (click)="openValidateReceiptModal()"
                class="p-2 bg-white hover:bg-surface-alt border border-line rounded text-center transition-colors min-w-[100px] cursor-pointer group block w-full"
                title="Nhấp để mở giao diện quét mã và đối soát nhập kho"
              >
                <div class="font-bold text-xs font-mono text-amber-700 truncate group-hover:scale-105 transition-transform">
                  Chờ Nhập Kho
                </div>
                <div class="text-[10px] text-muted uppercase tracking-wider">Đối Soát Kho</div>
              </button>
            } @else {
              <div class="p-2 bg-white border border-line rounded text-center min-w-[100px]">
                <div class="font-bold text-xs font-mono text-muted truncate">Chưa Tạo</div>
                <div class="text-[10px] text-muted uppercase tracking-wider">Phiếu Nhập Kho</div>
              </div>
            }

            <a
              [routerLink]="['/admin/inventory/serials']"
              [queryParams]="{ search: po.code }"
              class="p-2 bg-white hover:bg-surface-alt border border-line rounded text-center transition-colors min-w-[100px] cursor-pointer group block"
              title="Nhấp để xem danh sách sê-ri linh kiện đã nạp từ đơn PO này"
            >
              <div class="font-bold text-foreground text-xs font-mono group-hover:scale-105 transition-transform">
                {{ totalAssignedSerials() }} / {{ totalSerialRequiredQuantity() }}
              </div>
              <div class="text-[10px] text-muted uppercase tracking-wider">Serial Đã Gán</div>
            </a>

            @if (po.supersedesPurchaseOrder) {
              <a
                [routerLink]="['/admin/procurement/purchase-orders', po.supersedesPurchaseOrder.id]"
                class="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-center transition-colors min-w-[100px]"
                title="Bấm để xem đơn mua hàng gốc bị hủy"
              >
                <div class="font-bold text-amber-800 text-xs font-mono">{{ po.supersedesPurchaseOrder.code }}</div>
                <div class="text-[10px] text-amber-800 uppercase tracking-wider">Đơn Gốc</div>
              </a>
            } @else if (po.supersededByOrders.length > 0) {
              <a
                [routerLink]="['/admin/procurement/purchase-orders', po.supersededByOrders[0].id]"
                class="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-center transition-colors min-w-[100px]"
                title="Bấm để xem đơn mua hàng thay thế"
              >
                <div class="font-bold text-rose-700 text-xs font-mono">{{ po.supersededByOrders[0].code }}</div>
                <div class="text-[10px] text-rose-700 uppercase tracking-wider">PO Thay Thế</div>
              </a>
            } @else {
              <div class="p-2 bg-white border border-line rounded text-center min-w-[100px]">
                <div class="font-bold text-muted text-xs font-mono">Đơn gốc</div>
                <div class="text-[10px] text-muted uppercase tracking-wider">PO Thay Thế</div>
              </div>
            }
          </div>
        </div>
      }

      <main class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div class="bg-white border border-line rounded-lg p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-line pb-2">
            <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
              Thông Tin Đơn Mua Hàng
            </h2>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              [class.bg-emerald-50]="isNew() || order()?.status === 'DRAFT'"
              [class.text-emerald-700]="isNew() || order()?.status === 'DRAFT'"
              [class.border]="isNew() || order()?.status === 'DRAFT'"
              [class.border-emerald-200]="isNew() || order()?.status === 'DRAFT'"
              [class.bg-surface-alt]="!isNew() && order()?.status !== 'DRAFT'"
              [class.text-muted]="!isNew() && order()?.status !== 'DRAFT'"
            >
              {{ (isNew() || order()?.status === 'DRAFT') ? 'Có thể chỉnh sửa' : 'Dữ liệu đã khóa' }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-[13px]">
            <div>
              <label class="block text-muted font-semibold uppercase text-xs mb-1">Nhà Cung Cấp</label>
              @if (isNew() || order()?.status === 'DRAFT') {
                <app-select
                  [options]="supplierOptions()"
                  [value]="selectedSupplierId ? selectedSupplierId.toString() : ''"
                  (valueChange)="selectedSupplierId = $event ? Number($event) : null"
                  placeholder="Chọn nhà cung cấp..."
                  size="sm"
                  ariaLabel="Nhà Cung Cấp"
                />
              } @else {
                <div class="font-bold text-foreground text-sm pt-1">{{ order()?.supplier?.name }}</div>
                <div class="text-muted text-xs font-mono mt-0.5">{{ order()?.supplier?.code }}</div>
              }
            </div>

            <div>
              <label class="block text-muted font-semibold uppercase text-xs mb-1">Kho Nhận Hàng</label>
              @if (isNew() || order()?.status === 'DRAFT') {
                <app-select
                  [options]="branchOptions()"
                  [value]="selectedBranchId ? selectedBranchId.toString() : ''"
                  (valueChange)="selectedBranchId = $event ? Number($event) : null"
                  placeholder="Chọn chi nhánh nhận hàng..."
                  size="sm"
                  ariaLabel="Kho Nhận Hàng"
                />
              } @else {
                <div class="font-bold text-foreground text-sm pt-1">{{ order()?.receivingBranch?.name }}</div>
                <div class="text-muted text-xs font-mono mt-0.5">{{ order()?.receivingBranch?.code }}</div>
              }
            </div>

            <div>
              <label class="block text-muted font-semibold uppercase text-xs mb-1">Ghi Chú Đơn Hàng</label>
              @if (isNew() || order()?.status === 'DRAFT') {
                <input
                  type="text"
                  [(ngModel)]="orderNote"
                  placeholder="Ghi chú nội bộ hoặc điều khoản giao hàng..."
                  class="w-full px-2.5 py-2 bg-surface border border-line rounded text-[13px] text-foreground focus:outline-none focus:border-primary"
                />
              } @else {
                <div class="text-foreground text-[13px] pt-1">{{ order()?.note || 'Không có ghi chú' }}</div>
              }
            </div>

            <div>
              <label class="block text-muted font-semibold uppercase text-xs mb-1">Tổng Giá Trị Đơn PO</label>
              <div class="font-black text-primary text-base pt-1 tabular tabular-nums font-mono">
                {{ formatCurrency(calculatedTotalAmount()) }} ₫
              </div>
              <div class="text-muted text-[10px] mt-0.5">Đã bao gồm đơn giá thỏa thuận VAT</div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-line rounded-lg shadow-xs overflow-hidden">
          <div class="p-4 border-b border-line flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
                Danh Sách Linh Kiện Đặt Mua
              </h2>
              <p class="text-xs text-muted mt-0.5">
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
                  class="w-full pl-8 pr-3 py-1.5 bg-surface border border-line rounded text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                />
                <lucide-icon
                  name="plus"
                  class="size-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none"
                  aria-hidden="true"
                ></lucide-icon>

                @if (searchedVariants().length > 0) {
                  <div class="absolute left-0 right-0 mt-1 bg-white border border-line rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto">
                    @for (v of searchedVariants(); track v.id) {
                      <div
                        (click)="addVariantToOrder(v)"
                        class="p-2 hover:bg-surface-alt cursor-pointer border-b border-line last:border-none flex items-center justify-between gap-2"
                      >
                        <div class="min-w-0 flex-1">
                          <div class="font-mono font-bold text-foreground text-[13px] truncate">{{ v.sku }}</div>
                          <div class="text-xs text-muted truncate">{{ v.productTemplate.name }}</div>
                        </div>
                        <div class="text-right flex-shrink-0">
                          <span class="text-primary text-[13px] font-mono font-bold tabular">
                            {{ formatCurrency(v.sellingPrice) }} ₫
                          </span>
                          @if (v.serialRequired) {
                            <div class="text-[10px] text-blue-600 font-semibold">Cần Serial</div>
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
            <table class="w-full text-left border-collapse text-[13px]">
              <thead class="bg-surface-alt/70 border-b border-line text-muted font-semibold uppercase tracking-wider text-[11px]">
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
              <tbody class="divide-y divide-line">
                @if (editableLines().length === 0) {
                  <tr>
                    <td [attr.colspan]="(isNew() || order()?.status === 'DRAFT') ? 8 : 7" class="py-8 text-center text-muted">
                      Chưa có linh kiện nào trong đơn mua hàng. Vui lòng tìm và thêm linh kiện ở trên.
                    </td>
                  </tr>
                } @else {
                  @for (line of editableLines(); track line.skuId) {
                    <tr class="hover:bg-surface-alt/40 transition-colors">
                      <td class="py-2.5 px-4 text-center">
                        <div class="w-9 h-9 rounded bg-surface border border-line overflow-hidden flex items-center justify-center mx-auto">
                          @if (line.imageUrl) {
                            <img
                              src="/images/products/placeholder.webp"
                              [src]="line.imageUrl || '/images/products/placeholder.webp'"
                              [alt]="line.name || line.sku || 'Linh kiện nhập kho'"
                              class="w-full h-full object-contain p-0.5"
                              (error)="onImageError($event)"
                            />
                          } @else {
                            <span class="text-[10px] text-muted font-mono">PC</span>
                          }
                        </div>
                      </td>
                      <td class="py-2.5 px-4 font-mono font-bold text-foreground">
                        {{ line.sku }}
                      </td>
                      <td class="py-2.5 px-4 font-semibold text-foreground">
                        {{ line.name }}
                      </td>
                      <td class="py-2.5 px-4 text-center">
                        @if (line.serialRequired) {
                          <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                            Bắt buộc Serial
                          </span>
                        } @else {
                          <span class="text-muted text-[11px]">Không</span>
                        }
                      </td>
                      <td class="py-2.5 px-4 text-center">
                        @if (isNew() || order()?.status === 'DRAFT') {
                          <input
                            type="number"
                            min="1"
                            [ngModel]="line.quantity"
                            (ngModelChange)="onLineQuantityChange(line.skuId, $event)"
                            class="w-20 px-2 py-1 bg-surface border border-line rounded text-center font-bold text-foreground text-[13px] focus:outline-none focus:border-primary"
                          />
                        } @else {
                          <span class="font-black text-foreground tabular tabular-nums text-sm">
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
                            class="w-32 px-2 py-1 bg-surface border border-line rounded text-right font-mono font-bold text-foreground text-[13px] focus:outline-none focus:border-primary tabular"
                          />
                        } @else {
                          <span class="font-mono text-foreground tabular tabular-nums">
                            {{ formatCurrency(line.agreedUnitCost) }} ₫
                          </span>
                        }
                      </td>
                      <td class="py-2.5 px-4 text-right font-black tabular tabular-nums font-mono text-primary text-sm">
                        {{ formatCurrency(line.lineTotal) }} ₫
                      </td>
                      @if (isNew() || order()?.status === 'DRAFT') {
                        <td class="py-2.5 px-4 text-center">
                          <button
                            type="button"
                            (click)="removeLine(line.skuId)"
                            class="p-1 rounded text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Xóa dòng"
                            aria-label="Xóa dòng sản phẩm khỏi đơn mua hàng"
                          >
                            <lucide-icon name="trash-2" class="size-4" aria-hidden="true"></lucide-icon>
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
              class="px-4 py-2.5 rounded-lg shadow-xl text-[13px] font-semibold pointer-events-auto border transition-all duration-200 ease-out"
              [class.bg-white]="true"
              [class.text-emerald-700]="toast.type === 'success'"
              [class.border-emerald-300]="toast.type === 'success'"
              [class.text-rose-700]="toast.type === 'error'"
              [class.border-rose-300]="toast.type === 'error'"
              [class.text-foreground]="toast.type === 'info'"
              [class.border-line]="toast.type === 'info'"
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
  protected readonly onImageError = handleProductImageError;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly poService = inject(AdminPurchaseOrderService);

  readonly order = signal<PurchaseOrderDetail | null>(null);
  readonly isNew = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  readonly suppliers = signal<SimpleOption[]>([]);
  readonly branches = signal<SimpleOption[]>([]);

  readonly supplierOptions = computed<SelectOption[]>(() =>
    this.suppliers().map((s) => ({
      value: s.id.toString(),
      label: `${s.name} (${s.code})`,
    }))
  );

  readonly branchOptions = computed<SelectOption[]>(() =>
    this.branches().map((b) => ({
      value: b.id.toString(),
      label: `${b.name} (${b.code})`,
    }))
  );

  protected readonly Number = Number;

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
