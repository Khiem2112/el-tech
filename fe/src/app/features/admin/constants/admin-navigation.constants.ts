export type AdminNavItem = {
  readonly code: string;
  readonly title: string;
  readonly route: string;
  readonly fullPath: string;
  readonly module: string;
};

export type AdminNavGroup = {
  readonly id: string;
  readonly label: string;
  readonly items: readonly AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: readonly AdminNavGroup[] = [
  {
    id: 'mod-operations',
    label: 'Vận Hành & Báo Cáo',
    items: [
      {
        code: 'SCR-02',
        title: 'Trung Tâm Vận Hành',
        route: 'dashboard',
        fullPath: '/admin/dashboard',
        module: 'Vận Hành & Báo Cáo',
      },
    ],
  },
  {
    id: 'mod-catalog',
    label: 'Danh Mục & Sản Phẩm',
    items: [
      {
        code: 'SCR-03',
        title: 'Ngành Hàng & Thuộc Tính',
        route: 'catalog/categories',
        fullPath: '/admin/catalog/categories',
        module: 'Danh Mục & Sản Phẩm',
      },
      {
        code: 'SCR-04',
        title: 'Thương Hiệu',
        route: 'catalog/brands',
        fullPath: '/admin/catalog/brands',
        module: 'Danh Mục & Sản Phẩm',
      },
      {
        code: 'SCR-05',
        title: 'Mẫu Sản Phẩm',
        route: 'catalog/templates',
        fullPath: '/admin/catalog/templates',
        module: 'Danh Mục & Sản Phẩm',
      },
      {
        code: 'SCR-07',
        title: 'Biến Thể SKU',
        route: 'catalog/variants',
        fullPath: '/admin/catalog/variants',
        module: 'Danh Mục & Sản Phẩm',
      },
      {
        code: 'SCR-08',
        title: 'Bộ Máy Tính Dựng Sẵn',
        route: 'catalog/pc-bundles',
        fullPath: '/admin/catalog/pc-bundles',
        module: 'Danh Mục & Sản Phẩm',
      },
    ],
  },
  {
    id: 'mod-orders',
    label: 'Đơn Hàng & Vận Hành',
    items: [
      {
        code: 'SCR-09',
        title: 'Danh Sách Đơn Hàng',
        route: 'orders',
        fullPath: '/admin/orders',
        module: 'Đơn Hàng & Vận Hành',
      },
    ],
  },
  {
    id: 'mod-inventory',
    label: 'Kho Hàng & Thiết Bị',
    items: [
      {
        code: 'SCR-15',
        title: 'Tồn Kho Chi Nhánh',
        route: 'inventory/balances',
        fullPath: '/admin/inventory/balances',
        module: 'Kho Hàng & Thiết Bị',
      },
      {
        code: 'SCR-17',
        title: 'Tra Cứu Sê-ri & Bảo Hành',
        route: 'inventory/serials',
        fullPath: '/admin/inventory/serials',
        module: 'Kho Hàng & Thiết Bị',
      },
      {
        code: 'SCR-16',
        title: 'Sổ Kho Bất Biến',
        route: 'inventory/ledger',
        fullPath: '/admin/inventory/ledger',
        module: 'Kho Hàng & Thiết Bị',
      },
      {
        code: 'SCR-18',
        title: 'Điều Chuyển Kho',
        route: 'inventory/transfers',
        fullPath: '/admin/inventory/transfers',
        module: 'Kho Hàng & Thiết Bị',
      },
    ],
  },
  {
    id: 'mod-procurement',
    label: 'Mua Hàng & Nhà Cung Cấp',
    items: [
      {
        code: 'SCR-19',
        title: 'Danh Bạ Nhà Cung Cấp',
        route: 'procurement/suppliers',
        fullPath: '/admin/procurement/suppliers',
        module: 'Mua Hàng & Nhà Cung Cấp',
      },
      {
        code: 'SCR-20',
        title: 'Đơn Mua Hàng PO',
        route: 'procurement/purchase-orders',
        fullPath: '/admin/procurement/purchase-orders',
        module: 'Mua Hàng & Nhà Cung Cấp',
      },
      {
        code: 'SCR-22',
        title: 'Trả Hàng Nhà Cung Cấp',
        route: 'procurement/supplier-returns',
        fullPath: '/admin/procurement/supplier-returns',
        module: 'Mua Hàng & Nhà Cung Cấp',
      },
    ],
  },
  {
    id: 'mod-customers',
    label: 'Khách Hàng & Đánh Giá',
    items: [
      {
        code: 'SCR-26',
        title: 'Danh Sách Khách Hàng',
        route: 'customers',
        fullPath: '/admin/customers',
        module: 'Khách Hàng & Đánh Giá',
      },
      {
        code: 'SCR-28',
        title: 'Kiểm Duyệt Đánh Giá',
        route: 'reviews',
        fullPath: '/admin/reviews',
        module: 'Khách Hàng & Đánh Giá',
      },
    ],
  },
  {
    id: 'mod-settings',
    label: 'Chính Sách & Cài Đặt',
    items: [
      {
        code: 'SCR-23',
        title: 'Chính Sách Khuyến Mãi & Phí',
        route: 'promotions',
        fullPath: '/admin/promotions',
        module: 'Chính Sách & Cài Đặt',
      },
      {
        code: 'SCR-24',
        title: 'Mã Giảm Giá Coupons',
        route: 'promotions/coupons',
        fullPath: '/admin/promotions/coupons',
        module: 'Chính Sách & Cài Đặt',
      },
      {
        code: 'SCR-25',
        title: 'Biểu Phí Giao Hàng',
        route: 'promotions/shipping-fee',
        fullPath: '/admin/promotions/shipping-fee',
        module: 'Chính Sách & Cài Đặt',
      },
      {
        code: 'SCR-29',
        title: 'Chi Nhánh & Khu Vực',
        route: 'settings/branches',
        fullPath: '/admin/settings/branches',
        module: 'Chính Sách & Cài Đặt',
      },
      {
        code: 'SCR-30',
        title: 'Hộp Thư Outbox',
        route: 'settings/notification-outbox',
        fullPath: '/admin/settings/notification-outbox',
        module: 'Chính Sách & Cài Đặt',
      },
    ],
  },
];

export const ALL_ADMIN_NAV_ITEMS: readonly AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap(
  (group) => group.items,
);

export function findAdminNavItemByUrl(url: string): AdminNavItem | null {
  const cleanUrl = url.split('?')[0].split('#')[0];
  const exact = ALL_ADMIN_NAV_ITEMS.find((item) => item.fullPath === cleanUrl);
  if (exact) {
    return exact;
  }
  const matching = ALL_ADMIN_NAV_ITEMS.filter((item) => cleanUrl.startsWith(item.fullPath));
  if (matching.length > 0) {
    matching.sort((a, b) => b.fullPath.length - a.fullPath.length);
    return matching[0];
  }
  return null;
}
