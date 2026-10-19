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
      { path: 'tu-lap-pc', loadComponent: () => import('../pc-build/custom-build-page.component').then((module) => module.CustomBuildPageComponent) },
      { path: 'tra-cuu-don', loadComponent: () => import('../orders/order-lookup-page.component').then((module) => module.OrderLookupPageComponent) },
      { path: 'gio-hang', loadComponent: () => import('../cart/cart-page.component').then((module) => module.CartPageComponent) },
      { path: 'checkout', loadComponent: () => import('../checkout/checkout-page.component').then((module) => module.CheckoutPageComponent) },
    ],
  },
];
