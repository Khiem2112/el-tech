import { Routes } from '@angular/router';
import { StorefrontShellComponent } from './storefront-shell.component';

export const STOREFRONT_ROUTES: Routes = [
  {
    path: '', component: StorefrontShellComponent,
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./storefront-home.component').then((module) => module.StorefrontHomeComponent) },
      { path: 'san-pham', loadComponent: () => import('./storefront-placeholder.component').then((module) => module.StorefrontPlaceholderComponent), data: { title: 'Sản phẩm', description: 'Danh mục, bộ lọc và tìm kiếm sản phẩm sẽ được mở ở Phase 2.' } },
      { path: 'pc-dung-san', loadComponent: () => import('./storefront-placeholder.component').then((module) => module.StorefrontPlaceholderComponent), data: { title: 'PC dựng sẵn', description: 'Các cấu hình PC dựng sẵn sẽ được mở ở Phase 3.' } },
      { path: 'tu-lap-pc', loadComponent: () => import('./storefront-placeholder.component').then((module) => module.StorefrontPlaceholderComponent), data: { title: 'Tự lắp PC', description: 'Trình tạo cấu hình sẽ được mở ở Phase 3.' } },
      { path: 'tra-cuu-don', loadComponent: () => import('./storefront-placeholder.component').then((module) => module.StorefrontPlaceholderComponent), data: { title: 'Theo dõi đơn', description: 'Tra cứu đơn bằng mã đơn và OTP sẽ được mở ở Phase 7.' } },
      { path: 'gio-hang', loadComponent: () => import('./storefront-placeholder.component').then((module) => module.StorefrontPlaceholderComponent), data: { title: 'Giỏ hàng', description: 'Giỏ hàng có token ẩn sẽ được mở ở Phase 4.' } },
    ],
  },
];
