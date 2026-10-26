import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppIconModule } from '../../../components/atoms/icon/icon.module';
import { SelectComponent, SelectOption } from '../../../components/atoms/select/select.component';
import { NotificationDetailDialogComponent } from './components/notification-detail-dialog.component';
import {
  AdminNotificationItem,
  AdminNotificationService,
} from './services/admin-notification.service';

type ToastNotification = {
  readonly id: string;
  readonly message: string;
  readonly type: 'success' | 'error' | 'warning';
};

@Component({
  selector: 'app-admin-notification-outbox-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationDetailDialogComponent, AppIconModule, SelectComponent],
  template: `
    <div class="flex flex-col h-full bg-[#090d16] text-white overflow-hidden text-sm">
      <header class="h-14 bg-[#161b26] border-b border-[#272f3d] flex items-center justify-between px-6 flex-shrink-0">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold tracking-tight uppercase text-white">
            Nhật Ký Thông Báo Giao Dịch
          </h1>
          <span class="text-xs text-slate-400 border-l border-[#272f3d] pl-3 font-mono">
            SCR-30
          </span>
        </div>

        <div class="flex items-center gap-3">
          <span class="px-2.5 py-1 rounded text-xs font-bold bg-[#090d16] border border-[#272f3d] text-[#76b900] uppercase tracking-wider">
            Hàng đợi thông báo tự động
          </span>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Mã đơn / Người nhận
            </label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              placeholder="ORD-..., SĐT, Email..."
              class="w-full px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#76b900]"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Kênh thông báo
            </label>
            <app-select
              [options]="channelOptions"
              [value]="selectedChannel"
              (valueChange)="onChannelSelect($event)"
              size="sm"
              ariaLabel="Kênh thông báo"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Loại sự kiện
            </label>
            <app-select
              [options]="eventTypeOptions"
              [value]="selectedEventType"
              (valueChange)="onEventTypeSelect($event)"
              size="sm"
              ariaLabel="Loại sự kiện"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
              Trạng thái gửi
            </label>
            <div class="flex items-center gap-2">
              <app-select
                [options]="statusOptions"
                [value]="selectedStatus"
                (valueChange)="onStatusSelect($event)"
                size="sm"
                class="flex-1"
                ariaLabel="Trạng thái gửi"
              />

              <button
                type="button"
                (click)="onSearch()"
                class="px-3 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors shrink-0"
              >
                Lọc
              </button>
            </div>
          </div>
        </div>

        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-[#090d16]/70 border-b border-[#272f3d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3 px-4">Thời gian</th>
                  <th class="py-3 px-4">Mã đơn</th>
                  <th class="py-3 px-4">Khách hàng</th>
                  <th class="py-3 px-4">Sự kiện</th>
                  <th class="py-3 px-4">Kênh gửi</th>
                  <th class="py-3 px-4">Nội dung</th>
                  <th class="py-3 px-4 text-center">Thử lại</th>
                  <th class="py-3 px-4 text-center">Trạng thái</th>
                  <th class="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#272f3d] text-xs">
                @if (notificationService.isLoading()) {
                  <tr>
                    <td colspan="9" class="py-12 text-center text-slate-400">
                      <div class="inline-block animate-spin w-6 h-6 border-2 border-[#76b900] border-t-transparent rounded-full mb-2"></div>
                      <div>Đang tải dữ liệu nhật ký hộp thư outbox...</div>
                    </td>
                  </tr>
                } @else if (notificationService.notifications().length === 0) {
                  <tr>
                    <td colspan="9" class="py-12 text-center text-slate-400">
                      Không có thông báo nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                } @else {
                  @for (item of notificationService.notifications(); track item.id) {
                    <tr class="hover:bg-[#1f2736] transition-colors">
                      <td class="py-3 px-4 text-slate-400 tabular-nums">
                        {{ item.createdAt | date: 'dd/MM/yyyy HH:mm:ss' }}
                      </td>

                      <td class="py-3 px-4 font-mono font-bold text-[#76b900]">
                        @if (item.order) {
                          <a
                            [routerLink]="['/admin/orders', item.order.id]"
                            class="hover:underline"
                          >
                            {{ item.order.code }}
                          </a>
                        } @else {
                          <span class="text-slate-500">-</span>
                        }
                      </td>

                      <td class="py-3 px-4">
                        <div class="font-bold text-white">{{ item.customer.name }}</div>
                        <div class="text-[11px] text-slate-400">{{ item.customer.email }}</div>
                      </td>

                      <td class="py-3 px-4 font-mono text-[11px] text-slate-200">
                        {{ item.eventType }}
                      </td>

                      <td class="py-3 px-4">
                        <div class="flex items-center gap-1 flex-wrap">
                          @for (ch of item.channels; track ch) {
                            <span
                              class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                              [class]="ch === 'EMAIL' ? 'bg-sky-950/60 text-sky-400 border border-sky-800/40' : ch === 'SMS' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' : 'bg-[#76b900]/20 text-[#88d400] border border-[#76b900]/30'"
                            >
                              {{ ch }}
                            </span>
                          }
                        </div>
                      </td>

                      <td class="py-3 px-4 text-slate-300 max-w-xs truncate" [title]="item.body">
                        <div class="font-semibold text-slate-100 truncate">{{ item.title }}</div>
                        <div class="text-[11px] text-slate-400 truncate">{{ item.body }}</div>
                      </td>

                      <td class="py-3 px-4 text-center tabular-nums font-bold text-slate-200">
                        {{ item.retryCount }}
                      </td>

                      <td class="py-3 px-4 text-center">
                        @if (item.status === 'SENT') {
                          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#76b900]/20 text-[#88d400] border border-[#76b900]/30 uppercase">
                            ĐÃ GỬI
                          </span>
                        } @else if (item.status === 'PENDING') {
                          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-800/40 uppercase">
                            CHỜ GỬI
                          </span>
                        } @else {
                          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/40 uppercase">
                            THẤT BẠI
                          </span>
                        }
                      </td>

                      <td class="py-3 px-4 text-right">
                        <button
                          type="button"
                          (click)="openDetailDialog(item)"
                          class="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-[#272f3d] text-[#76b900] hover:text-[#88d400] transition-colors"
                          title="Xem chi tiết & Thử lại"
                          aria-label="Xem chi tiết nội dung thông báo"
                        >
                          <lucide-icon name="eye" class="size-4" aria-hidden="true"></lucide-icon>
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          @if (notificationService.total() > 0) {
            <div class="p-4 border-t border-[#272f3d] flex items-center justify-between text-xs text-slate-400">
              <div>
                Hiển thị trang <strong class="text-white">{{ notificationService.page() }}</strong> /
                <strong class="text-white">{{ notificationService.totalPages() }}</strong>
                (Tổng cộng <strong class="text-white">{{ notificationService.total() }}</strong> thông báo)
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  [disabled]="notificationService.page() <= 1 || notificationService.isLoading()"
                  (click)="goToPage(notificationService.page() - 1)"
                  class="px-3 py-1 bg-[#090d16] border border-[#272f3d] rounded hover:bg-[#272f3d] disabled:opacity-40 disabled:hover:bg-[#090d16] text-slate-200 transition-colors"
                >
                  Trước
                </button>
                <button
                  type="button"
                  [disabled]="notificationService.page() >= notificationService.totalPages() || notificationService.isLoading()"
                  (click)="goToPage(notificationService.page() + 1)"
                  class="px-3 py-1 bg-[#090d16] border border-[#272f3d] rounded hover:bg-[#272f3d] disabled:opacity-40 disabled:hover:bg-[#090d16] text-slate-200 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          }
        </div>
      </main>

      @if (selectedNotification()) {
        <app-notification-detail-dialog
          [notification]="selectedNotification()!"
          (closed)="closeDetailDialog()"
          (retried)="onNotificationRetried($event)"
        />
      }

      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        @for (toast of toasts(); track toast.id) {
          <div
            class="px-4 py-2.5 rounded-md shadow-lg text-xs font-semibold border flex items-center justify-between gap-3 transition-all"
            [class]="toast.type === 'success' ? 'bg-[#161b26] border-[#76b900] text-[#76b900]' : toast.type === 'error' ? 'bg-[#161b26] border-rose-600 text-rose-400' : 'bg-[#161b26] border-amber-600 text-amber-300'"
          >
            <span>{{ toast.message }}</span>
            <button
              type="button"
              (click)="removeToast(toast.id)"
              class="text-slate-400 hover:text-white"
              aria-label="Đóng thông báo"
            >
              <lucide-icon name="x" class="size-3.5" aria-hidden="true"></lucide-icon>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNotificationOutboxPageComponent implements OnInit {
  readonly notificationService = inject(AdminNotificationService);
  private readonly route = inject(ActivatedRoute);

  readonly channelOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả kênh (In-app, Email, SMS)' },
    { value: 'IN_APP', label: 'Thông báo trong ứng dụng' },
    { value: 'EMAIL', label: 'Thư điện tử (Email)' },
    { value: 'SMS', label: 'Tin nhắn SMS' },
  ];

  readonly eventTypeOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả sự kiện' },
    { value: 'ORDER_PLACED', label: 'Tiếp nhận đặt hàng' },
    { value: 'ORDER_CONFIRMED', label: 'Xác nhận đơn hàng' },
    { value: 'ORDER_SHIPPED', label: 'Đã xuất kho giao hàng' },
    { value: 'ORDER_READY_FOR_PICKUP', label: 'Sẵn sàng nhận tại showroom' },
    { value: 'ORDER_CANCELLED', label: 'Hủy đơn hàng' },
  ];

  readonly statusOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'SENT', label: 'Gửi thành công' },
    { value: 'PENDING', label: 'Đang chờ gửi' },
    { value: 'FAILED', label: 'Thất bại / Lỗi gửi' },
  ];

  searchQuery = '';
  selectedChannel: 'ALL' | 'IN_APP' | 'EMAIL' | 'SMS' = 'ALL';
  selectedEventType = 'ALL';
  selectedStatus: 'ALL' | 'SENT' | 'PENDING' | 'FAILED' = 'ALL';

  readonly selectedNotification = signal<AdminNotificationItem | null>(null);
  readonly toasts = signal<readonly ToastNotification[]>([]);

  ngOnInit(): void {
    const searchParam = this.route.snapshot.queryParams['search'];
    if (searchParam) {
      this.searchQuery = searchParam;
    }
    void this.loadData();
  }

  async loadData(): Promise<void> {
    await this.notificationService.loadNotifications({
      page: 1,
      channel: this.selectedChannel,
      eventType: this.selectedEventType !== 'ALL' ? this.selectedEventType : undefined,
      status: this.selectedStatus,
      search: this.searchQuery,
    });
  }

  onChannelSelect(val: string): void {
    this.selectedChannel = val as 'ALL' | 'IN_APP' | 'EMAIL' | 'SMS';
    void this.onFilterChange();
  }

  onEventTypeSelect(val: string): void {
    this.selectedEventType = val;
    void this.onFilterChange();
  }

  onStatusSelect(val: string): void {
    this.selectedStatus = val as 'ALL' | 'SENT' | 'PENDING' | 'FAILED';
    void this.onFilterChange();
  }

  async onFilterChange(): Promise<void> {
    await this.loadData();
  }

  async onSearch(): Promise<void> {
    await this.loadData();
  }

  async goToPage(page: number): Promise<void> {
    await this.notificationService.loadNotifications({
      page,
      channel: this.selectedChannel,
      eventType: this.selectedEventType !== 'ALL' ? this.selectedEventType : undefined,
      status: this.selectedStatus,
      search: this.searchQuery,
    });
  }

  openDetailDialog(item: AdminNotificationItem): void {
    this.selectedNotification.set(item);
  }

  closeDetailDialog(): void {
    this.selectedNotification.set(null);
  }

  onNotificationRetried(updated: AdminNotificationItem): void {
    this.selectedNotification.set(updated);
    this.addToast('Đã phát lại thông báo giao dịch thành công', 'success');
  }

  addToast(message: string, type: 'success' | 'error' | 'warning'): void {
    const id = Date.now().toString();
    const toast: ToastNotification = { id, message, type };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
