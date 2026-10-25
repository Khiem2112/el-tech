import { Routes } from '@angular/router';
import { adminAuthGuard } from '../../core/guards/admin-auth.guard';
import { AdminShellComponent } from './admin-shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/admin-login-page.component').then(
        (module) => module.AdminLoginPageComponent,
      ),
  },
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/admin-dashboard-page.component').then(
            (module) => module.AdminDashboardPageComponent,
          ),
      },
      {
        path: 'catalog/categories',
        loadComponent: () =>
          import('./categories/admin-categories-page.component').then(
            (module) => module.AdminCategoriesPageComponent,
          ),
      },
      {
        path: 'catalog/brands',
        loadComponent: () =>
          import('./brands/admin-brands-page.component').then(
            (module) => module.AdminBrandsPageComponent,
          ),
      },
      {
        path: 'catalog/templates',
        loadComponent: () =>
          import('./templates/admin-product-templates-page.component').then(
            (module) => module.AdminProductTemplatesPageComponent,
          ),
      },
      {
        path: 'catalog/templates/new',
        loadComponent: () =>
          import('./templates/admin-product-template-detail-page.component').then(
            (module) => module.AdminProductTemplateDetailPageComponent,
          ),
      },
      {
        path: 'catalog/templates/:id',
        loadComponent: () =>
          import('./templates/admin-product-template-detail-page.component').then(
            (module) => module.AdminProductTemplateDetailPageComponent,
          ),
      },
      {
        path: 'catalog/variants',
        loadComponent: () =>
          import('./variants/admin-variants-page.component').then(
            (module) => module.AdminVariantsPageComponent,
          ),
      },
      {
        path: 'catalog/pc-bundles',
        loadComponent: () =>
          import('./pc-bundles/admin-pc-bundles-page.component').then(
            (module) => module.AdminPcBundlesPageComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/admin-orders-page.component').then(
            (module) => module.AdminOrdersPageComponent,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./orders/admin-order-detail-page.component').then(
            (module) => module.AdminOrderDetailPageComponent,
          ),
      },
      {
        path: 'inventory/balances',
        loadComponent: () =>
          import('./inventory/admin-inventory-balances-page.component').then(
            (module) => module.AdminInventoryBalancesPageComponent,
          ),
      },
      {
        path: 'inventory/serials',
        loadComponent: () =>
          import('./serials/admin-serials-page.component').then(
            (module) => module.AdminSerialsPageComponent,
          ),
      },
      {
        path: 'inventory/ledger',
        loadComponent: () =>
          import('./inventory/admin-stock-ledger-page.component').then(
            (module) => module.AdminStockLedgerPageComponent,
          ),
      },
      {
        path: 'inventory/transfers',
        loadComponent: () =>
          import('./inventory/admin-transfers-page.component').then(
            (module) => module.AdminTransfersPageComponent,
          ),
      },
      {
        path: 'procurement/suppliers',
        loadComponent: () =>
          import('./suppliers/admin-suppliers-page.component').then(
            (module) => module.AdminSuppliersPageComponent,
          ),
      },
      {
        path: 'procurement/purchase-orders',
        loadComponent: () =>
          import('./procurement/admin-purchase-orders-page.component').then(
            (module) => module.AdminPurchaseOrdersPageComponent,
          ),
      },
      {
        path: 'procurement/purchase-orders/new',
        loadComponent: () =>
          import('./procurement/admin-purchase-order-detail-page.component').then(
            (module) => module.AdminPurchaseOrderDetailPageComponent,
          ),
      },
      {
        path: 'procurement/purchase-orders/:id',
        loadComponent: () =>
          import('./procurement/admin-purchase-order-detail-page.component').then(
            (module) => module.AdminPurchaseOrderDetailPageComponent,
          ),
      },
      {
        path: 'procurement/supplier-returns',
        loadComponent: () =>
          import('./procurement/admin-supplier-returns-page.component').then(
            (module) => module.AdminSupplierReturnsPageComponent,
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./customers/admin-customers-page.component').then(
            (module) => module.AdminCustomersPageComponent,
          ),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./customers/admin-customer-detail-page.component').then(
            (module) => module.AdminCustomerDetailPageComponent,
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./reviews/admin-reviews-page.component').then(
            (module) => module.AdminReviewsPageComponent,
          ),
      },
      {
        path: 'promotions',
        loadComponent: () =>
          import('./promotions/admin-product-promotions-page.component').then(
            (module) => module.AdminProductPromotionsPageComponent,
          ),
      },
      {
        path: 'promotions/products',
        loadComponent: () =>
          import('./promotions/admin-product-promotions-page.component').then(
            (module) => module.AdminProductPromotionsPageComponent,
          ),
      },
      {
        path: 'promotions/product-promotions',
        redirectTo: 'promotions/products',
      },
      {
        path: 'promotions/coupons',
        loadComponent: () =>
          import('./coupons/admin-coupons-page.component').then(
            (module) => module.AdminCouponsPageComponent,
          ),
      },
      {
        path: 'promotions/shipping-fee',
        loadComponent: () =>
          import('./shipping-fee/admin-shipping-fee-page.component').then(
            (module) => module.AdminShippingFeePageComponent,
          ),
      },
      {
        path: 'settings/branches',
        loadComponent: () =>
          import('./branches/admin-branches-page.component').then(
            (module) => module.AdminBranchesPageComponent,
          ),
      },
      {
        path: 'settings/notification-outbox',
        loadComponent: () =>
          import('./notifications/admin-notification-outbox-page.component').then(
            (module) => module.AdminNotificationOutboxPageComponent,
          ),
      },
    ],
  },
];
