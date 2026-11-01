import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('el_tech_user_token');
    if (token && !request.headers.has('Authorization')) {
      return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }
  }
  return next(request);
};

