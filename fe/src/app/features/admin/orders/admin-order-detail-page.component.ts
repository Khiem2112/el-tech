import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ActionTriggerEvent, OrderActionBarComponent } from './components/order-action-bar.component';
import { OrderBuyerSectionComponent } from './components/order-buyer-section.component';
import { OrderFinanceSummaryComponent } from './components/order-finance-summary.component';
import { OrderLinesPcGroupComponent } from './components/order-lines-pc-group.component';
import { OrderStatusBarComponent } from './components/order-status-bar.component';
import { OrderTimelineHistoryComponent } from './components/order-timeline-history.component';
import { ConfirmCodDialogComponent } from './components/modals/confirm-cod-dialog.component';
import { PrepareDialogComponent } from './components/modals/prepare-dialog.component';
import { AssembleDialogComponent } from './components/modals/assemble-dialog.component';
import { ReadyForPickupDialogComponent } from './components/modals/ready-for-pickup-dialog.component';
import { ShipDialogComponent } from './components/modals/ship-dialog.component';
import { DeliveryFailedDialogComponent } from './components/modals/delivery-failed-dialog.component';
import { RedeliveryDialogComponent } from './components/modals/redelivery-dialog.component';
import { ReturnInitiateDialogComponent } from './components/modals/return-initiate-dialog.component';
import { ReturnReceiveDialogComponent } from './components/modals/return-receive-dialog.component';
import { CompleteOrderDialogComponent } from './components/modals/complete-order-dialog.component';
import { CancelOrderDialogComponent } from './components/modals/cancel-order-dialog.component';
import { ResolveHoldDialogComponent } from './components/modals/resolve-hold-dialog.component';
import { PickupToDeliveryAmendmentDialogComponent } from './components/modals/pickup-to-delivery-amendment-dialog.component';
import { ResolveQrDiscrepancyDialogComponent } from './components/modals/resolve-qr-discrepancy-dialog.component';
import { ManualRefundDialogComponent } from './components/modals/manual-refund-dialog.component';
import { AdminOrderDetailService } from './services/admin-order-detail.service';

@Component({
  selector: 'app-admin-order-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrderStatusBarComponent,
    OrderActionBarComponent,
    OrderBuyerSectionComponent,
    OrderLinesPcGroupComponent,
    OrderFinanceSummaryComponent,
    OrderTimelineHistoryComponent,
    ConfirmCodDialogComponent,
    PrepareDialogComponent,
    AssembleDialogComponent,
    ReadyForPickupDialogComponent,
    ShipDialogComponent,
    DeliveryFailedDialogComponent,
    RedeliveryDialogComponent,
    ReturnInitiateDialogComponent,
    ReturnReceiveDialogComponent,
    CompleteOrderDialogComponent,
    CancelOrderDialogComponent,
    ResolveHoldDialogComponent,
    PickupToDeliveryAmendmentDialogComponent,
    ResolveQrDiscrepancyDialogComponent,
    ManualRefundDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto text-sm text-foreground">
      <div class="h-9 bg-surface border border-line rounded px-4 flex items-center justify-between text-xs shadow-card">
        <nav class="flex items-center gap-1.5 text-muted">
          <a
            routerLink="/admin/orders"
            class="hover:text-primary transition-colors font-medium"
          >
            Đơn Hàng
          </a>
          <span>/</span>
          <span class="font-mono font-bold text-foreground">
            {{ detailService.order()?.code || orderId() }}
          </span>
          @if (detailService.order(); as ord) {
            <span>/</span>
            <span class="text-muted">
              Chi Nhánh: {{ ord.fulfillmentBranch.code }} ({{ ord.fulfillmentBranch.name }})
            </span>
          }
        </nav>
      </div>

      @if (actionToastMessage()) {
        <div class="p-3 bg-primary/10 border border-primary/30 rounded text-foreground text-xs flex items-center justify-between shadow-card">
          <span class="font-medium">{{ actionToastMessage() }}</span>
          <button
            type="button"
            (click)="actionToastMessage.set(null)"
            class="text-muted hover:text-foreground text-xs px-2 font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      }

      @if (detailService.isLoading()) {
        <div class="p-12 text-center bg-surface border border-line rounded-lg shadow-card">
          <div class="text-primary font-bold text-sm">Đang tải dữ liệu chi tiết đơn hàng...</div>
          <p class="text-xs text-muted mt-1">Đang kết xuất thông tin khách hàng, linh kiện và sổ kiểm toán</p>
        </div>
      } @else if (detailService.error()) {
        <div class="p-8 text-center bg-surface border border-rose-500/30 rounded-lg space-y-3 shadow-card">
          <div class="text-rose-600 dark:text-rose-400 font-bold text-sm">Không thể truy xuất đơn hàng</div>
          <p class="text-xs text-muted">{{ detailService.error() }}</p>
          <div class="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              (click)="loadOrder()"
              class="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded hover:opacity-90 transition-opacity"
            >
              Thử lại
            </button>
            <a
              routerLink="/admin/orders"
              class="px-4 py-2 bg-surface-alt border border-line text-foreground font-semibold text-xs rounded hover:bg-surface transition-colors"
            >
              Quay về danh sách
            </a>
          </div>
        </div>
      } @else if (detailService.order(); as ord) {
        <app-order-status-bar [order]="ord" />

        <app-order-action-bar
          [order]="ord"
          (actionTriggered)="onActionTriggered($event)"
          (refreshRequested)="loadOrder()"
        />

        <div class="bg-surface border border-line rounded-lg p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 shadow-card">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-xl font-bold text-foreground font-mono tracking-tight">
                ĐƠN HÀNG #{{ ord.code }}
              </h1>
              <span class="px-2.5 py-0.5 rounded text-xs font-bold" [class]="statusBadgeClass(ord.status)">
                {{ statusLabel(ord.status) }}
              </span>
              <span
                class="px-2.5 py-0.5 rounded text-xs font-bold font-mono border"
                [class.bg-surface-elevated]="ord.hasAssembly"
                [class.text-primary]="ord.hasAssembly"
                [class.border-line]="ord.hasAssembly"
                [class.bg-surface-alt]="!ord.hasAssembly"
                [class.text-muted]="!ord.hasAssembly"
                [class.border-line]="!ord.hasAssembly"
              >
                {{ ord.hasAssembly ? 'PC Lắp Ráp' : 'Linh Kiện Lẻ' }}
              </span>
            </div>
            <div class="text-xs text-muted mt-1">
              Ngày đặt: {{ formatDate(ord.submittedAt) }} | Chi nhánh: <strong class="text-foreground">{{ ord.fulfillmentBranch.name }}</strong>
            </div>
          </div>

          <!-- Smart Buttons Block -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <a
              [routerLink]="['/admin/customers', ord.customer.id]"
              class="p-2 bg-surface-alt hover:bg-surface border border-line rounded text-center transition-colors cursor-pointer group block shadow-card"
              title="Nhấp để xem hồ sơ chi tiết khách hàng"
            >
              <div class="font-mono font-bold text-primary truncate group-hover:scale-105 transition-transform">
                {{ ord.customer.name }}
              </div>
              <div class="text-xs text-muted uppercase tracking-wider">Khách Hàng</div>
            </a>

            <a
              [routerLink]="['/admin/inventory/ledger']"
              [queryParams]="{ search: ord.code }"
              class="p-2 bg-surface-alt hover:bg-surface border border-line rounded text-center transition-colors cursor-pointer group block shadow-card"
              title="Nhấp để xem các chứng từ và bút toán xuất giữ trong sổ kho bất biến"
            >
              <div class="font-mono font-bold text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                {{ ord.stockMoves.length }} phiếu
              </div>
              <div class="text-xs text-muted uppercase tracking-wider">Phiếu Xuất/Giữ Kho</div>
            </a>

            <a
              href="#section-finance"
              class="p-2 bg-surface-alt hover:bg-surface border border-line rounded text-center transition-colors cursor-pointer group block shadow-card"
              title="Nhấp để xem chi tiết chứng từ thanh toán và quyết toán"
            >
              <div class="font-mono font-bold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                {{ ord.payment ? (ord.payment.state === 'PAID' ? 'Đã thu 100%' : (ord.payment.state === 'REFUNDED' ? 'Đã hoàn tiền' : 'Cọc 10%')) : 'Chưa thu' }}
              </div>
              <div class="text-xs text-muted uppercase tracking-wider">Thanh Toán</div>
            </a>

            <a
              href="#section-timeline"
              class="p-2 bg-surface-alt hover:bg-surface border border-line rounded text-center transition-colors cursor-pointer group block shadow-card"
              title="Nhấp để xem các phụ lục đơn hàng và lịch sử thay đổi"
            >
              <div class="font-mono font-bold text-foreground group-hover:scale-105 transition-transform">
                {{ ord.amendments.length }} phụ lục
              </div>
              <div class="text-xs text-muted uppercase tracking-wider">Phụ Lục Đơn</div>
            </a>

            <a
              [routerLink]="['/admin/settings/notification-outbox']"
              [queryParams]="{ search: ord.code }"
              class="p-2 bg-surface-alt hover:bg-surface border border-line rounded text-center transition-colors cursor-pointer group block shadow-card"
              title="Nhấp để xem nhật ký thông báo email/SMS đã phát cho đơn này"
            >
              <div class="font-mono font-bold text-primary group-hover:scale-105 transition-transform">
                {{ ord.statusHistories.length }} sự kiện
              </div>
              <div class="text-xs text-muted uppercase tracking-wider">Nhật Ký Outbox</div>
            </a>
          </div>
        </div>

        <app-order-buyer-section [order]="ord" />

        <app-order-lines-pc-group [order]="ord" />

        <div id="section-finance">
          <app-order-finance-summary
            [order]="ord"
            (openModalRequested)="onActionTriggered({ actionKey: $event, modalId: $event, targetStatus: '', label: $event })"
          />
        </div>

        <div id="section-timeline">
          <app-order-timeline-history [order]="ord" />
        </div>

        <app-confirm-cod-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-07'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã xác nhận đơn hàng COD và khóa giữ tồn kho thành công.')"
        />

        <app-prepare-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-08'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã chuyển đơn hàng sang trạng thái Đang Soạn Hàng.')"
        />

        <app-assemble-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-09'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã xuất kho và chuyển đơn sang khâu Lắp Ráp Máy Tính.')"
        />

        <app-ready-for-pickup-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-10'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã phát thông báo sẵn sàng nhận hàng tại showroom tới khách hàng.')"
        />

        <app-ship-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-11'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã xuất kho và chuyển đơn hàng sang trạng thái Đang Giao Hàng.')"
        />

        <app-delivery-failed-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-12'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã ghi nhận giao hàng thất bại thành công.')"
        />

        <app-redelivery-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-13'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã lên lịch hẹn giao lại thành công.')"
        />

        <app-return-initiate-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-14'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã xác nhận kiện hàng đang chuyển hoàn về kho chi nhánh.')"
        />

        <app-return-receive-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-15'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã đối soát 100% linh kiện, khôi phục tồn kho onHand và chuyển đơn sang trạng thái Đã Về Kho.')"
        />

        <app-complete-order-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-16'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã hoàn tất đơn hàng, quyết toán tài chính và kích hoạt quyền đánh giá đã xác minh thành công.')"
        />

        <app-cancel-order-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-17'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã hủy đơn hàng, giải phóng kho giữ chỗ và cập nhật trạng thái tiền cọc/hoàn tiền.')"
        />

        <app-resolve-hold-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-18'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã cập nhật trạng thái ngoại lệ tạm giữ của đơn hàng thành công.')"
        />

        <app-pickup-to-delivery-amendment-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-19'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã tạo phụ lục chuyển sang giao hàng tận nơi thành công.')"
        />

        <app-resolve-qr-discrepancy-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-20'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã xử lý đối soát giao dịch VietQR thành công.')"
        />

        <app-manual-refund-dialog
          [order]="ord"
          [isOpen]="activeModal() === 'MOD-21'"
          (closed)="onModalClosed()"
          (confirmed)="onOperationConfirmed('Đã xác nhận chuyển khoản hoàn tiền thủ công thành công.')"
        />
      }
    </div>
  `,
})
export class AdminOrderDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly detailService = inject(AdminOrderDetailService);

  readonly orderId = signal<string>('');
  readonly actionToastMessage = signal<string | null>(null);
  readonly activeModal = signal<
    | 'MOD-07'
    | 'MOD-08'
    | 'MOD-09'
    | 'MOD-10'
    | 'MOD-11'
    | 'MOD-12'
    | 'MOD-13'
    | 'MOD-14'
    | 'MOD-15'
    | 'MOD-16'
    | 'MOD-17'
    | 'MOD-18'
    | 'MOD-19'
    | 'MOD-20'
    | 'MOD-21'
    | null
  >(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
      this.loadOrder();
    }
  }

  loadOrder(): void {
    const id = this.orderId();
    if (id) {
      this.detailService.fetchOrderDetail(id);
    }
  }

  onActionTriggered(event: ActionTriggerEvent): void {
    if (event.modalId === 'MOD-07' || event.actionKey === 'CONFIRM_COD') {
      this.activeModal.set('MOD-07');
    } else if (event.modalId === 'MOD-08' || event.actionKey === 'START_PREP') {
      this.activeModal.set('MOD-08');
    } else if (event.modalId === 'MOD-09' || event.actionKey === 'ASSEMBLE_PC') {
      this.activeModal.set('MOD-09');
    } else if (event.modalId === 'MOD-10' || event.actionKey === 'READY_PICKUP') {
      this.activeModal.set('MOD-10');
    } else if (event.modalId === 'MOD-11' || event.actionKey === 'SHIP_ORDER') {
      this.activeModal.set('MOD-11');
    } else if (event.modalId === 'MOD-12' || event.actionKey === 'DELIVERY_FAILED') {
      this.activeModal.set('MOD-12');
    } else if (event.modalId === 'MOD-13' || event.actionKey === 'REDELIVERY') {
      this.activeModal.set('MOD-13');
    } else if (event.modalId === 'MOD-14' || event.actionKey === 'RETURNING') {
      this.activeModal.set('MOD-14');
    } else if (event.modalId === 'MOD-15' || event.actionKey === 'RETURNED_TO_BRANCH') {
      this.activeModal.set('MOD-15');
    } else if (event.modalId === 'MOD-16' || event.actionKey === 'COMPLETE_ORDER') {
      this.activeModal.set('MOD-16');
    } else if (event.modalId === 'MOD-17' || event.actionKey === 'CANCEL_ORDER') {
      this.activeModal.set('MOD-17');
    } else if (
      event.modalId === 'MOD-18' ||
      event.actionKey === 'HOLD_ORDER' ||
      event.actionKey === 'RESOLVE_HOLD'
    ) {
      this.activeModal.set('MOD-18');
    } else if (event.modalId === 'MOD-19' || event.actionKey === 'PICKUP_TO_DELIVERY') {
      this.activeModal.set('MOD-19');
    } else if (event.modalId === 'MOD-20' || event.actionKey === 'RESOLVE_QR_DISCREPANCY') {
      this.activeModal.set('MOD-20');
    } else if (event.modalId === 'MOD-21' || event.actionKey === 'MANUAL_REFUND') {
      this.activeModal.set('MOD-21');
    } else {
      this.actionToastMessage.set(
        `Đã chọn thao tác: ${event.label} (Mã hành động: ${event.actionKey}${event.modalId ? ', Modal: ' + event.modalId : ''}).`
      );
    }
  }

  onModalClosed(): void {
    this.activeModal.set(null);
  }

  onOperationConfirmed(message: string): void {
    this.activeModal.set(null);
    this.actionToastMessage.set(message);
    this.loadOrder();
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Chờ thanh toán QR';
      case 'PENDING_COD_CONFIRMATION':
        return 'Chờ xác nhận COD';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PREPARING_COMPONENTS':
        return 'Đang soạn hàng';
      case 'ASSEMBLING':
        return 'Đang ráp PC';
      case 'READY_FOR_PICKUP':
        return 'Sẵn sàng nhận';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'DELIVERY_FAILED':
        return 'Giao thất bại';
      case 'RETURNING':
        return 'Đang chuyển hoàn';
      case 'RETURNED_TO_BRANCH':
        return 'Đã về kho';
      case 'COMPLETED':
        return 'Hoàn tất';
      case 'ON_HOLD':
        return 'Tạm giữ (On-Hold)';
      case 'CANCELLED':
        return 'Đã hủy đơn';
      default:
        return status;
    }
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      case 'PREPARING_COMPONENTS':
      case 'ASSEMBLING':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
      case 'READY_FOR_PICKUP':
      case 'SHIPPING':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
      case 'PENDING_COD_CONFIRMATION':
      case 'PENDING_PAYMENT':
      case 'DELIVERY_FAILED':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      case 'ON_HOLD':
        return 'bg-warning/20 text-warning border border-warning/40';
      case 'CANCELLED':
      case 'RETURNING':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  }

  formatDate(dateInput: string | Date | undefined): string {
    if (!dateInput) {
      return '';
    }
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
}
