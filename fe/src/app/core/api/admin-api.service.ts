import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from './api.types';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
};

export type AdminLoginPayload = {
  email: string;
  password?: string;
  rememberMe?: boolean;
};

export type AdminLoginData = {
  token: string;
  user: AdminUser;
};

const ADMIN_TOKEN_KEY = 'el_tech_admin_token';
const ADMIN_USER_KEY = 'el_tech_admin_user';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/api/admin/auth'
      : '/api/admin/auth';

  readonly currentAdmin = signal<AdminUser | null>(this.loadStoredUser());
  readonly adminToken = signal<string | null>(this.loadStoredToken());
  readonly isAuthenticated = computed(() => {
    const user = this.currentAdmin();
    const token = this.adminToken();
    return Boolean(user && user.role === 'ADMIN' && token);
  });

  async login(payload: AdminLoginPayload): Promise<AdminLoginData> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AdminLoginData>>(`${this.baseUrl}/login`, payload),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey);
    }

    const { token, user } = response.data;
    this.adminToken.set(token);
    this.currentAdmin.set(user);
    this.saveSession(token, user, Boolean(payload.rememberMe));

    return response.data;
  }

  async getMe(): Promise<AdminUser | null> {
    const token = this.adminToken();
    if (!token) {
      return null;
    }

    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminUser>>(`${this.baseUrl}/me`, { headers }),
      );

      if (response.success) {
        this.currentAdmin.set(response.data);
        return response.data;
      }
      this.clearSession();
      return null;
    } catch {
      this.clearSession();
      return null;
    }
  }

  async logout(): Promise<void> {
    const token = this.adminToken();
    if (token) {
      try {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        await firstValueFrom(
          this.http.post<ApiResponse<{ loggedOut: boolean }>>(
            `${this.baseUrl}/logout`,
            {},
            { headers },
          ),
        );
      } catch {
        // Continue clearing client session on network failure
      }
    }
    this.clearSession();
  }

  private loadStoredToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(ADMIN_TOKEN_KEY) ?? sessionStorage.getItem(ADMIN_TOKEN_KEY);
  }

  private loadStoredUser(): AdminUser | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(ADMIN_USER_KEY) ?? sessionStorage.getItem(ADMIN_USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  }

  private saveSession(token: string, user: AdminUser, rememberMe: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(ADMIN_TOKEN_KEY, token);
    storage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    this.adminToken.set(null);
    this.currentAdmin.set(null);
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
  }
}
