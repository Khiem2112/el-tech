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

  async post<T>(path: string, body: unknown, options: { readonly idempotencyKey?: string } = {}): Promise<ApiResponse<T>> {
    return firstValueFrom(this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body, { headers: this.commandHeaders(options.idempotencyKey) }));
  }

  async patch<T>(path: string, body: unknown, options: { readonly idempotencyKey?: string } = {}): Promise<ApiResponse<T>> {
    return firstValueFrom(this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body, { headers: this.commandHeaders(options.idempotencyKey) }));
  }

  async delete<T>(path: string, options: { readonly idempotencyKey?: string } = {}): Promise<ApiResponse<T>> {
    return firstValueFrom(this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`, { headers: this.commandHeaders(options.idempotencyKey) }));
  }

  private commandHeaders(idempotencyKey?: string): HttpHeaders {
    return idempotencyKey ? new HttpHeaders({ 'Idempotency-Key': idempotencyKey }) : new HttpHeaders();
  }
}
