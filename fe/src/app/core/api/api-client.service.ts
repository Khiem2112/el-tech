import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from './api.types';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/v1';

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return firstValueFrom(this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`));
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return firstValueFrom(this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body));
  }
}
