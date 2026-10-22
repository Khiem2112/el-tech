import { Route, Routes } from '@angular/router';
import { AdminShellComponent } from './admin-shell.component';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminListPageComponent } from './admin-list-page.component';

type ListRow = { code: string; name: string; meta: string; value: string; status: string; tone: string };

const rows: readonly ListRow[] = [
  { code: '#EL-10482', name: 'Nguyễn Minh Khang', meta: 'HN · Thái Hà · 4 sản phẩm', value: '32.490.000 ₫', status: 'Đang lắp ráp', tone: 'purple' },
  { code: '#EL-10481', name: 'Trần Gia Huy', meta: 'HCM · Q.10 · 2 sản phẩm', value: '18.990.000 ₫', status: 'Chờ xác nhận', tone: 'orange' },
  { code: '#EL-10480', name: 'Lê Hoàng Anh', meta: 'ĐN · Hải Châu · 1 sản phẩm', value: '7.250.000 ₫', status: 'Hoàn tất', tone: 'green' },
  { code: '#EL-10479', name: 'Phạm Thuỳ Linh', meta: 'HN · Thái Hà · 3 sản phẩm', value: '4.680.000 ₫', status: 'Đang giao hàng', tone: 'blue' },
  { code: '#EL-10478', name: 'Đỗ Đức Nam', meta: 'HCM · Q.10 · QR lệch tiền', value: '26.150.000 ₫', status: 'Cần đối soát', tone: 'red' },
];

const list = (title: string, description: string, eyebrow: string, actionLabel: string): Route => ({
  component: AdminListPageComponent,
  data: { title, description, eyebrow, actionLabel, rows },
});

export const ADMIN_ROUTES: Routes = [{ path: '', component: AdminShellComponent, children: [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'orders', ...list('Quản lý đơn hàng', 'Theo dõi tiến trình và xử lý ngoại lệ của toàn bộ đơn hàng.', 'ORDER OPERATIONS', 'Tạo đơn thủ công') },
  { path: 'payments', ...list('Thanh toán & đối soát', 'Tra cứu trạng thái thu tiền, giao dịch QR và COD.', 'PAYMENTS', 'Xuất báo cáo') },
  { path: 'payments/review-queue', ...list('Hàng đợi đối soát QR', '07 giao dịch cần kiểm tra thủ công trong vòng 24 giờ.', 'PAYMENT REVIEW', 'Xử lý giao dịch') },
  { path: 'inventory/balances', ...list('Tồn kho theo chi nhánh', 'Giám sát số lượng khả dụng theo từng SKU và điểm kho.', 'INVENTORY', 'Điều chuyển hàng') },
  { path: 'inventory/transfers', ...list('Điều chuyển nội bộ', 'Các phiếu gom hàng và cân đối tồn kho giữa các chi nhánh.', 'TRANSFERS', 'Tạo phiếu điều chuyển') },
  { path: 'catalog/templates', ...list('Mẫu sản phẩm', 'Quản lý product template và các biến thể SKU liên kết.', 'CATALOG', 'Thêm mẫu sản phẩm') },
  { path: 'catalog/variants', ...list('Biến thể SKU', 'Tra cứu nhanh SKU, barcode và tồn khả dụng toàn hệ thống.', 'CATALOG / SKUS', 'Thêm biến thể') },
  { path: 'catalog/categories', ...list('Danh mục & thương hiệu', 'Cấu hình cây danh mục và schema thông số kỹ thuật.', 'CATALOG CONFIG', 'Thêm danh mục') },
  { path: 'catalog/pc-bundles', ...list('Bộ PC dựng sẵn', 'Quản lý BOM ảo và cấu hình máy tính bán sẵn.', 'PC BUILDER', 'Tạo bộ PC') },
  { path: 'procurement/suppliers', ...list('Nhà cung cấp', 'Danh bạ đối tác cung ứng linh kiện PC.', 'PROCUREMENT', 'Thêm nhà cung cấp') },
  { path: 'procurement/purchase-orders', ...list('Đơn mua hàng PO', 'Theo dõi đơn đặt mua và đối soát nhập kho.', 'PROCUREMENT', 'Tạo đơn mua hàng') },
  { path: 'customers', ...list('Khách hàng', 'Tra cứu hồ sơ khách hàng và lịch sử mua hàng.', 'CUSTOMERS', 'Thêm khách hàng') },
  { path: 'reviews', ...list('Đánh giá sản phẩm', 'Kiểm duyệt phản hồi từ người mua đã hoàn thành đơn.', 'REVIEWS', 'Xuất báo cáo') },
  { path: 'settings/branches', ...list('Cài đặt chi nhánh', 'Quản lý điểm kho và khu vực phục vụ giao hàng.', 'SYSTEM SETTINGS', 'Thêm chi nhánh') },
] }];
