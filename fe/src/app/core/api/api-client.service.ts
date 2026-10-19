import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from './api.types';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/v1';

  async get<T>(path: string, options: { readonly headers?: HttpHeaders } = {}): Promise<ApiResponse<T>> {
    return firstValueFrom(this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, options));
  }

  async post<T>(path: string, body: unknown, options: { readonly idempotencyKey?: string; readonly cartToken?: string } = {}): Promise<ApiResponse<T>> {
    return firstValueFrom(this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body, { headers: this.commandHeaders(options.idempotencyKey, options.cartToken) }));
  }

  async patch<T>(path: string, body: unknown, options: { readonly idempotencyKey?: string; readonly cartToken?: string } = {}): Promise<ApiResponse<T>> {
    return firstValueFrom(this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body, { headers: this.commandHeaders(options.idempotencyKey, options.cartToken) }));
  }

  async delete<T>(path: string, options: { readonly idempotencyKey?: string; readonly cartToken?: string } = {}): Promise<ApiResponse<T>> {
    return firstValueFrom(this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`, { headers: this.commandHeaders(options.idempotencyKey, options.cartToken) }));
  }

  private commandHeaders(idempotencyKey?: string, cartToken?: string): HttpHeaders {
    let headers = new HttpHeaders();
    if (idempotencyKey) headers = headers.set('Idempotency-Key', idempotencyKey);
    if (cartToken) headers = headers.set('X-Cart-Token', cartToken);
    return headers;
  }
}
