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
import { AppIconModule } from '../../../components/atoms/icon/icon.module';
import { CreateSupplierReturnDialogComponent } from './components/create-supplier-return-dialog.component';
import {
  AdminSupplierReturnService,
  SupplierReturnDetail,
  SupplierReturnListItem,
} from './services/admin-supplier-return.service';

@Component({
  selector: 'app-admin-supplier-returns-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppIconModule, CreateSupplierReturnDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 w-full text-xs text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 class="text-xl font-bold text-foreground tracking-tight uppercase">
            Xuất Trả Nhà Cung Cấp
          </h1>
          <p class="text-xs text-muted mt-0.5">
            Quản lý phiếu xuất trả linh kiện cho đối tác đối chiếu phiếu nhập kho gốc
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="openCreateDialog()"
            class="px-3.5 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded transition-colors shadow-xs inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <lucide-icon name="plus" class="size-4" aria-hidden="true"></lucide-icon>
            <span>Tạo Phiếu Xuất Trả</span>
          </button>
        </div>
      </div>

      <div class="bg-surface border border-line rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative flex-1">
            <input
              type="text"
              [ngModel]="returnService.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Tìm theo mã phiếu, mã PO, nhà cung cấp, chứng từ nhập..."
              class="w-full pl-9 pr-4 py-1.5 bg-white border border-line rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
            />
            <lucide-icon
              name="search"
              class="size-4 text-muted absolute left-3 top-2 pointer-events-none"
              aria-hidden="true"
            ></lucide-icon>
          </div>
        </div>

        <div class="text-xs text-muted text-right">
          Tổng số: <strong class="text-foreground tabular tabular-nums">{{ visibleReturns().length }}</strong> phiếu xuất trả
        </div>
      </div>

      @if (successToast()) {
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center justify-between">
          <span>{{ successToast() }}</span>
          <button type="button" (click)="successToast.set(null)" class="text-emerald-700 hover:text-emerald-950 font-bold ml-2">Đóng</button>
        </div>
      }

      <div class="bg-surface border border-line rounded-lg shadow-xs overflow-hidden">
        @if (returnService.isLoading()) {
          <div class="p-8 text-center text-muted space-y-3">
            <div class="inline-block w-8 h-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
            <p class="text-xs">Đang tải danh sách phiếu xuất trả nhà cung cấp...</p>
          </div>
        } @else if (returnService.error()) {
          <div class="p-6 text-center space-y-3">
            <p class="text-xs text-rose-600">{{ returnService.error() }}</p>
            <button
              type="button"
              (click)="loadData()"
              class="px-3 py-1.5 bg-surface-alt hover:bg-surface-alt/80 border border-line text-foreground rounded text-xs transition-colors"
            >
              Thử lại
            </button>
          </div>
        } @else if (visibleReturns().length === 0) {
          <div class="p-12 text-center text-muted space-y-3">
            <div class="w-10 h-10 mx-auto rounded-full bg-surface-alt border border-line flex items-center justify-center text-muted">
              <lucide-icon name="rotate-ccw" class="size-5" aria-hidden="true"></lucide-icon>
            </div>
            <p class="text-sm font-semibold text-foreground">Không tìm thấy phiếu xuất trả nhà cung cấp nào</p>
            <p class="text-xs text-muted">
              Tạo phiếu xuất trả từ các đơn mua hàng PO đã hoàn tất đối soát nhập kho.
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-sm">
              <thead class="bg-surface-alt/70 border-b border-line text-muted font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="py-2.5 px-4">Mã Phiếu</th>
                  <th class="py-2.5 px-4">Nhà Cung Cấp</th>
                  <th class="py-2.5 px-4">Đơn PO & Phiếu Nhập Gốc</th>
                  <th class="py-2.5 px-4">Kho Xuất</th>
                  <th class="py-2.5 px-4 text-center">Số Lượng</th>
                  <th class="py-2.5 px-4">Ngày Xuất</th>
                  <th class="py-2.5 px-4 text-center">Trạng Thái</th>
                  <th class="py-2.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                @for (item of visibleReturns(); track item.id) {
                  <tr class="hover:bg-surface-alt/40 transition-colors">
                    <td class="py-2.5 px-4 tabular font-bold text-foreground">
                      {{ item.code }}
                      @if (item.reason) {
                        <div class="text-xs font-normal text-muted line-clamp-1 max-w-xs">
                          {{ item.reason }}
                        </div>
                      }
                    </td>
                    <td class="py-2.5 px-4">
                      <div class="font-bold text-foreground">{{ item.supplierName ?? 'N/A' }}</div>
                      <div class="text-muted text-xs tabular">{{ item.supplierCode ?? 'N/A' }}</div>
                    </td>
                    <td class="py-2.5 px-4 tabular">
                      <div class="text-primary font-bold">{{ item.purchaseOrderCode ?? 'N/A' }}</div>
                      <div class="text-muted text-xs">{{ item.inboundMoveCode ?? 'N/A' }}</div>
                    </td>
                    <td class="py-2.5 px-4">
                      <div class="text-foreground">{{ item.sourceBranchName ?? 'N/A' }}</div>
                      <div class="text-muted text-xs tabular">{{ item.sourceBranchCode ?? 'N/A' }}</div>
                    </td>
                    <td class="py-2.5 px-4 text-center tabular-nums text-foreground font-bold">
                      {{ item.totalQuantity }} chiếc
                      <div class="text-xs font-normal text-muted">
                        {{ formatReturnSources(item.returnSources) }}
                      </div>
                    </td>
                    <td class="py-2.5 px-4 text-muted tabular-nums text-xs">
                      {{ formatDate(item.validatedAt || item.createdAt) }}
                    </td>
                    <td class="py-2.5 px-4 text-center whitespace-nowrap">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        HOÀN TẤT TRẢ
                      </span>
                    </td>
                    <td class="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        (click)="viewDetail(item.id)"
                        class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-primary transition-colors inline-flex"
                        title="Xem chi tiết phiếu xuất trả"
                        aria-label="Xem chi tiết phiếu xuất trả"
                      >
                        <lucide-icon name="file-text" class="size-4" aria-hidden="true"></lucide-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <app-create-supplier-return-dialog
        [isOpen]="isCreateDialogOpen()"
        (close)="isCreateDialogOpen.set(false)"
        (created)="onReturnCreated()"
      />

      @if (selectedDetail()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            (click)="selectedDetail.set(null)"
          ></div>

          <div
            class="relative bg-white border border-line rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 text-xs text-foreground"
          >
            <div class="p-4 border-b border-line flex items-center justify-between flex-shrink-0">
              <div>
                <h3 class="font-bold text-foreground uppercase text-sm tracking-wide">
                  Chi Tiết Phiếu Xuất Trả #{{ selectedDetail()!.code }}
                </h3>
                <p class="text-xs text-muted mt-0.5">
                  Ngày xuất: <span class="tabular-nums">{{ formatDate(selectedDetail()!.validatedAt || selectedDetail()!.createdAt) }}</span>
                </p>
              </div>
              <button
                type="button"
                (click)="selectedDetail.set(null)"
                class="p-1 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
                title="Đóng"
                aria-label="Đóng"
              >
                <lucide-icon name="x" class="size-4" aria-hidden="true"></lucide-icon>
              </button>
            </div>

            <div class="p-4 overflow-y-auto space-y-3 flex-1">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-surface border border-line rounded-lg text-xs">
                <div>
                  <span class="text-muted block text-xs uppercase font-semibold">Nhà Cung Cấp</span>
                  <strong class="text-foreground block truncate">
                    {{ selectedDetail()!.reversalOfMove?.purchaseOrder?.supplier?.name ?? 'N/A' }}
                  </strong>
                  <span class="text-muted tabular text-xs block">
                    {{ selectedDetail()!.reversalOfMove?.purchaseOrder?.supplier?.code ?? '' }}
                  </span>
                </div>
                <div>
                  <span class="text-muted block text-xs uppercase font-semibold">Kho Xuất Trả</span>
                  <strong class="text-foreground block truncate">{{ selectedDetail()!.sourceBranch?.name ?? 'N/A' }}</strong>
                  <span class="text-muted tabular text-xs block">
                    {{ selectedDetail()!.sourceBranch?.code ?? '' }}
                  </span>
                </div>
                <div>
                  <span class="text-muted block text-xs uppercase font-semibold">Đơn PO Gốc</span>
                  <span class="tabular text-primary font-bold block">
                    {{ selectedDetail()!.reversalOfMove?.purchaseOrder?.code ?? 'N/A' }}
                  </span>
                </div>
                <div>
                  <span class="text-muted block text-xs uppercase font-semibold">Phiếu Nhập Gốc</span>
                  <span class="tabular text-foreground font-bold block">
                    {{ selectedDetail()!.reversalOfMove?.code ?? 'N/A' }}
                  </span>
                </div>
              </div>

              @if (selectedDetail()!.reason) {
                <div class="p-2.5 bg-surface border border-line rounded-lg text-xs space-y-0.5">
                  <span class="text-muted font-semibold block uppercase text-xs">Lý Do Xuất Trả</span>
                  <p class="text-foreground">{{ selectedDetail()!.reason }}</p>
                </div>
              }

              <div class="space-y-1.5">
                <span class="text-muted font-semibold uppercase text-xs tracking-wider">Danh Sách Dòng Hàng Xuất Trả</span>
                <div class="border border-line rounded-lg overflow-hidden">
                  <table class="w-full text-left border-collapse text-sm">
                    <thead class="bg-surface-alt/70 border-b border-line text-muted uppercase text-xs">
                      <tr>
                        <th class="py-2 px-3">Linh Kiện SKU</th>
                        <th class="py-2 px-3 text-center">Số Lượng</th>
                        <th class="py-2 px-3">Số Serial Đã Xuất Trả</th>
                        <th class="py-2 px-3 text-right">Biến Động Tồn</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-line">
                      @for (line of selectedDetail()!.lines; track line.id) {
                        <tr>
                          <td class="py-2 px-3">
                            <div class="font-bold text-foreground tabular">{{ line.sku.sku }}</div>
                            <div class="text-xs text-muted">
                              {{ line.sku.productTemplate?.name }}
                              @if (line.sku.variationLabel) {
                                ({{ line.sku.variationLabel }})
                              }
                            </div>
                          </td>
                          <td class="py-2 px-3 text-center font-bold text-foreground tabular-nums">
                            {{ line.quantity }} chiếc
                          </td>
                          <td class="py-2 px-3">
                            @if (line.serialMovements && line.serialMovements.length > 0) {
                              <div class="flex flex-wrap gap-1">
                                @for (sm of line.serialMovements; track sm.id) {
                                  <span class="px-1.5 py-0.5 rounded bg-surface border border-line text-xs text-primary tabular-nums font-medium">
                                    {{ sm.serialUnit.serialNumber }}
                                  </span>
                                }
                              </div>
                            } @else {
                              <span class="text-muted text-xs">Không yêu cầu serial</span>
                            }
                          </td>
                          <td class="py-2 px-3 text-right tabular-nums text-[11px]">
                            @for (entry of line.ledgerEntries; track $index) {
                              @if (entry.deltaQuarantine < 0) {
                                <div class="text-amber-600 font-bold">
                                  Kho lỗi: {{ entry.deltaQuarantine }}
                                </div>
                              }
                              @if (entry.deltaOnHand < 0) {
                                <div class="text-rose-600 font-bold">
                                  Kho onHand: {{ entry.deltaOnHand }}
                                </div>
                              }
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="p-3.5 border-t border-line flex items-center justify-end flex-shrink-0">
              <button
                type="button"
                (click)="selectedDetail.set(null)"
                class="px-4 py-1.5 bg-surface-alt hover:bg-surface-alt/80 border border-line text-foreground font-semibold rounded text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminSupplierReturnsPageComponent implements OnInit {
  readonly returnService = inject(AdminSupplierReturnService);

  readonly isCreateDialogOpen = signal<boolean>(false);
  readonly selectedDetail = signal<SupplierReturnDetail | null>(null);
  readonly successToast = signal<string | null>(null);

  readonly visibleReturns = computed<SupplierReturnListItem[]>(() => {
    return this.returnService.supplierReturns();
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    await this.returnService.loadSupplierReturns();
  }

  onSearchChange(value: string): void {
    this.returnService.searchQuery.set(value);
    this.returnService.loadSupplierReturns({ search: value });
  }

  openCreateDialog(): void {
    this.isCreateDialogOpen.set(true);
  }

  async onReturnCreated(): Promise<void> {
    this.successToast.set('Đã lập phiếu xuất trả nhà cung cấp thành công!');
    await this.loadData();
  }

  async viewDetail(id: string): Promise<void> {
    try {
      const detail = await this.returnService.getSupplierReturnById(id);
      this.selectedDetail.set(detail);
    } catch {
      // Handled in service error state
    }
  }

  formatReturnSources(sources: string[]): string {
    if (!sources || sources.length === 0) return 'Kho linh kiện';
    return sources
      .map((s) => (s === 'quarantineDamaged' ? 'Kho cách ly lỗi' : 'Kho thực tế (OnHand)'))
      .join(', ');
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
