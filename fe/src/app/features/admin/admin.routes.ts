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
          import('./pages/admin-dashboard-page.component').then(
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
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
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
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
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
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'promotions',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
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
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
    ],
  },
];
