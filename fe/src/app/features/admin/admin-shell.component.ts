import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppIconModule } from '../../components/atoms';

type AdminNavItem = { label: string; path: string; icon: string; exact?: boolean };

type AdminNavGroup = { label: string; items: readonly AdminNavItem[] };

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AppIconModule],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {
  protected readonly sidebarOpen = signal(false);

  protected readonly navGroups: readonly AdminNavGroup[] = [
    { label: 'Tổng quan', items: [{ label: 'Dashboard', path: '/admin/dashboard', icon: 'layout-grid', exact: true }] },
    {
      label: 'Vận hành',
      items: [
        { label: 'Đơn hàng', path: '/admin/orders', icon: 'shopping-cart' },
        { label: 'Thanh toán & đối soát', path: '/admin/payments', icon: 'credit-card' },
        { label: 'Tồn kho & điều chuyển', path: '/admin/inventory/balances', icon: 'package' },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { label: 'Mẫu sản phẩm', path: '/admin/catalog/templates', icon: 'cpu' },
        { label: 'Biến thể SKU', path: '/admin/catalog/variants', icon: 'list' },
        { label: 'Danh mục & thương hiệu', path: '/admin/catalog/categories', icon: 'sliders-horizontal' },
        { label: 'Bộ PC dựng sẵn', path: '/admin/catalog/pc-bundles', icon: 'layout-grid' },
      ],
    },
    {
      label: 'Mua hàng',
      items: [
        { label: 'Nhà cung cấp', path: '/admin/procurement/suppliers', icon: 'store' },
        { label: 'Đơn mua hàng PO', path: '/admin/procurement/purchase-orders', icon: 'file-text' },
      ],
    },
    {
      label: 'Hệ thống',
      items: [
        { label: 'Khách hàng', path: '/admin/customers', icon: 'user' },
        { label: 'Đánh giá sản phẩm', path: '/admin/reviews', icon: 'star' },
        { label: 'Cài đặt chi nhánh', path: '/admin/settings/branches', icon: 'settings' },
      ],
    },
  ];

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
