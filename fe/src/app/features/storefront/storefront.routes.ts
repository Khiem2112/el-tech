import { Routes } from '@angular/router';
import { StorefrontShellComponent } from './storefront-shell.component';

export const STOREFRONT_ROUTES: Routes = [
  {
    path: '', component: StorefrontShellComponent,
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./storefront-home.component').then((module) => module.StorefrontHomeComponent) },
      { path: 'san-pham', loadComponent: () => import('../catalog/catalog-page.component').then((module) => module.CatalogPageComponent) },
      { path: 'san-pham/:categorySlug/:productSlug', loadComponent: () => import('../catalog/product-detail-page.component').then((module) => module.ProductDetailPageComponent) },
      { path: 'pc-dung-san', loadComponent: () => import('../pc-build/pc-build-page.component').then((module) => module.PcBuildPageComponent) },
      { path: 'tu-lap-pc', loadComponent: () => import('./storefront-placeholder.component').then((module) => module.StorefrontPlaceholderComponent), data: { title: 'Tự lắp PC', description: 'Trình tạo cấu hình sẽ được mở ở Phase 3.' } },
      { path: 'tra-cuu-don', loadComponent: () => import('./storefront-placeholder.component').then((module) => module.StorefrontPlaceholderComponent), data: { title: 'Theo dõi đơn', description: 'Tra cứu đơn bằng mã đơn và OTP sẽ được mở ở Phase 7.' } },
      { path: 'gio-hang', loadComponent: () => import('./storefront-placeholder.component').then((module) => module.StorefrontPlaceholderComponent), data: { title: 'Giỏ hàng', description: 'Giỏ hàng có token ẩn sẽ được mở ở Phase 4.' } },
    ],
  },
];
