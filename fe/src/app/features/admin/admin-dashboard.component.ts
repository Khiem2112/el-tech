import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIconModule } from '../../components/atoms';

type QueueItem = { label: string; value: string; detail: string; tone: string; path: string; icon: string };
type OrderRow = { id: string; customer: string; branch: string; amount: string; status: string; tone: string; time: string };

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, AppIconModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  protected readonly queueItems: readonly QueueItem[] = [
    { label: 'COD chờ xác nhận', value: '12', detail: 'Cần xử lý trong 30 phút', tone: 'orange', path: '/admin/orders', icon: 'clock' },
    { label: 'QR cần đối soát', value: '07', detail: 'Có giao dịch lệch tiền', tone: 'purple', path: '/admin/payments/review-queue', icon: 'credit-card' },
    { label: 'Tồn kho dưới ngưỡng', value: '24', detail: 'SKU tại 3 chi nhánh', tone: 'red', path: '/admin/inventory/balances', icon: 'alert-triangle' },
    { label: 'Giao hàng thất bại', value: '03', detail: 'Chờ hẹn giao lại', tone: 'blue', path: '/admin/orders', icon: 'truck' },
  ];
  protected readonly orders: readonly OrderRow[] = [
    { id: '#EL-10482', customer: 'Nguyễn Minh Khang', branch: 'HN · Thái Hà', amount: '32.490.000 ₫', status: 'Đang lắp ráp', tone: 'purple', time: '10:42' },
    { id: '#EL-10481', customer: 'Trần Gia Huy', branch: 'HCM · Q.10', amount: '18.990.000 ₫', status: 'Chờ xác nhận COD', tone: 'orange', time: '10:18' },
    { id: '#EL-10480', customer: 'Lê Hoàng Anh', branch: 'ĐN · Hải Châu', amount: '7.250.000 ₫', status: 'Sẵn sàng lấy hàng', tone: 'green', time: '09:56' },
    { id: '#EL-10479', customer: 'Phạm Thuỳ Linh', branch: 'HN · Thái Hà', amount: '4.680.000 ₫', status: 'Đang giao hàng', tone: 'blue', time: '09:31' },
    { id: '#EL-10478', customer: 'Đỗ Đức Nam', branch: 'HCM · Q.10', amount: '26.150.000 ₫', status: 'Thanh toán lỗi', tone: 'red', time: '09:04' },
  ];

  protected readonly stockAlerts = [
    { sku: 'GPU-RTX-4070S', name: 'ASUS Dual RTX 4070 SUPER 12GB', branch: 'HN · Thái Hà', available: 0, threshold: 2 },
    { sku: 'RAM-DDR5-32', name: 'Kingston Fury Beast DDR5 32GB', branch: 'HCM · Q.10', available: 1, threshold: 5 },
    { sku: 'SSD-NVME-2TB', name: 'WD Black SN850X 2TB Gen4', branch: 'ĐN · Hải Châu', available: 2, threshold: 6 },
  ];
}
