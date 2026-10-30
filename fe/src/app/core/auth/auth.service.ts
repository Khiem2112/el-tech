import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../api/api.types';

export type UserProfile = {
  id: string;
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'customer' | 'pro_builder' | 'admin';
  address?: string;
  addressNote?: string;
  createdAt: string;
};

export type LoginPayload = {
  emailOrPhone: string;
  password?: string;
  rememberMe?: boolean;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password?: string;
};

export type AuthResponseData = {
  token: string;
  user: UserProfile;
};

const STORAGE_KEY = 'el_tech_user_profile';
const TOKEN_KEY = 'el_tech_user_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl =
    typeof window !== 'undefined' && window.location.port === '4200'
      ? 'http://localhost:3000/v1/auth'
      : '/v1/auth';

  readonly currentUser = signal<UserProfile | null>(this.loadStoredUser());
  readonly authToken = signal<string | null>(this.loadStoredToken());
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAuthModalOpen = signal<boolean>(false);

  constructor() {
    void this.initSession();
  }

  private loadStoredUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignore storage parse errors
    }
    return null;
  }

  private loadStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private saveSession(token: string, user: UserProfile): void {
    this.authToken.set(token);
    this.currentUser.set(user);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch {
        // Ignore storage errors
      }
    }
  }

  private clearSession(): void {
    this.authToken.set(null);
    this.currentUser.set(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  }

  private async initSession(): Promise<void> {
    const token = this.authToken();
    if (!token) return;

    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const response = await firstValueFrom(
        this.http.get<ApiResponse<UserProfile>>(`${this.baseUrl}/me`, { headers }),
      );
      if (response.success) {
        this.currentUser.set(response.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
        }
      } else {
        this.clearSession();
      }
    } catch {
      // Retain cached session if backend connection fails temporarily
    }
  }

  openAuthModal(): void {
    this.isAuthModalOpen.set(true);
  }

  closeAuthModal(): void {
    this.isAuthModalOpen.set(false);
  }

  async login(payload: LoginPayload): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AuthResponseData>>(`${this.baseUrl}/login`, {
        identifier: payload.emailOrPhone,
        password: payload.password,
        rememberMe: payload.rememberMe,
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Đăng nhập không thành công');
    }

    this.saveSession(response.data.token, response.data.user);
    this.closeAuthModal();
    return true;
  }

  async register(payload: RegisterPayload): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AuthResponseData>>(`${this.baseUrl}/register`, {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Đăng ký không thành công');
    }

    this.saveSession(response.data.token, response.data.user);
    this.closeAuthModal();
    return true;
  }

  async loginWithGoogle(): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AuthResponseData>>(`${this.baseUrl}/google`, {
        email: 'hoangnam.tech@gmail.com',
        name: 'Nguyễn Hoàng Nam',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      }),
    );

    if (!response.success) {
      throw new Error(response.error.messageKey || 'Đăng nhập Google không thành công');
    }

    this.saveSession(response.data.token, response.data.user);
    this.closeAuthModal();
    return true;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    const current = this.currentUser();
    if (!current) return;

    const token = this.authToken();
    const updatedUser = { ...current, ...updates };

    if (token) {
      try {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        const response = await firstValueFrom(
          this.http.patch<ApiResponse<UserProfile>>(
            `${this.baseUrl}/profile`,
            {
              name: updates.name,
              phone: updates.phone,
              address: updates.address,
              addressNote: updates.addressNote,
            },
            { headers },
          ),
        );
        if (response.success) {
          this.saveSession(token, { ...current, ...response.data });
          return;
        }
      } catch {
        // Fallback to local state if request fails
      }
    }

    this.saveSession(token ?? '', updatedUser);
  }

  async logout(): Promise<void> {
    const token = this.authToken();
    if (token) {
      try {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        await firstValueFrom(
          this.http.post<ApiResponse<{ loggedOut: boolean }>>(`${this.baseUrl}/logout`, {}, { headers }),
        );
      } catch {
        // Ignore network errors on logout
      }
    }
    this.clearSession();
  }
}
