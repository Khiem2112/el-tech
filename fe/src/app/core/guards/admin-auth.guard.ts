import { inject } from '@angular/core';
import { type CanActivateFn, type RouterStateSnapshot, Router } from '@angular/router';
import { AdminApiService } from '../api/admin-api.service';
import { AuthService } from '../auth/auth.service';

export const adminAuthGuard: CanActivateFn = (_route, state: RouterStateSnapshot) => {
  const adminApi = inject(AdminApiService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (adminApi.isAuthenticated()) {
    return true;
  }

  const currentUser = authService.currentUser();
  if (currentUser && currentUser.role !== 'admin') {
    return router.createUrlTree(['/admin/login'], {
      queryParams: {
        returnUrl: state.url,
        error: 'forbidden',
      },
    });
  }

  return router.createUrlTree(['/admin/login'], {
    queryParams: {
      returnUrl: state.url,
    },
  });
};
