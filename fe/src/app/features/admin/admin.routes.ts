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
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'catalog/brands',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'catalog/templates',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'catalog/templates/new',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'catalog/templates/:id',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'catalog/variants',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'catalog/pc-bundles',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
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
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'inventory/serials',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'inventory/ledger',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
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
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'procurement/purchase-orders',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'procurement/purchase-orders/new',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'procurement/purchase-orders/:id',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
          ),
      },
      {
        path: 'procurement/supplier-returns',
        loadComponent: () =>
          import('./pages/admin-placeholder-page.component').then(
            (module) => module.AdminPlaceholderPageComponent,
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
