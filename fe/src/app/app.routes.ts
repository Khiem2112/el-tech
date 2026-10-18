import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./features/storefront/storefront.routes').then((module) => module.STOREFRONT_ROUTES) },
  { path: '**', loadComponent: () => import('./shared/pages/not-found-page.component').then((module) => module.NotFoundPageComponent) },
];
