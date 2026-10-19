import { Injectable, computed, signal } from '@angular/core';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'customer' | 'pro_builder' | 'admin';
  address?: string;
  addressNote?: string;
  createdAt: string;
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-89241',
  name: 'Nguyễn Hoàng Nam',
  email: 'hoangnam.tech@gmail.com',
  phone: '0988 234 567',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: 'pro_builder',
  address: 'Căn hộ Landmark 4, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh',
  addressNote: 'Gọi trước khi giao 30 phút, bảo quản hàng linh kiện điện tử cẩn thận.',
  createdAt: '10/2024',
};

const STORAGE_KEY = 'el_tech_user_profile';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly currentUser = signal<UserProfile | null>(this.loadStoredUser());
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAuthModalOpen = signal<boolean>(false);

  private loadStoredUser(): UserProfile | null {
    if (typeof window === 'undefined') return DEFAULT_USER;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignore storage parse errors
    }
    return DEFAULT_USER;
  }

  openAuthModal(): void {
    this.isAuthModalOpen.set(true);
  }

  closeAuthModal(): void {
    this.isAuthModalOpen.set(false);
  }

  async login(payload: { emailOrPhone: string; password?: string }): Promise<boolean> {
    const user: UserProfile = {
      ...DEFAULT_USER,
      email: payload.emailOrPhone.includes('@') ? payload.emailOrPhone : DEFAULT_USER.email,
      phone: !payload.emailOrPhone.includes('@') ? payload.emailOrPhone : DEFAULT_USER.phone,
    };
    this.setUser(user);
    this.closeAuthModal();
    return true;
  }

  async register(payload: { name: string; emailOrPhone: string; password?: string }): Promise<boolean> {
    const user: UserProfile = {
      ...DEFAULT_USER,
      id: `usr-${Date.now().toString().slice(-5)}`,
      name: payload.name,
      email: payload.emailOrPhone.includes('@') ? payload.emailOrPhone : 'customer@eltech.vn',
      phone: !payload.emailOrPhone.includes('@') ? payload.emailOrPhone : '0912 345 678',
    };
    this.setUser(user);
    this.closeAuthModal();
    return true;
  }

  async loginWithGoogle(): Promise<boolean> {
    this.setUser(DEFAULT_USER);
    this.closeAuthModal();
    return true;
  }

  updateProfile(updates: Partial<UserProfile>): void {
    const current = this.currentUser();
    if (!current) return;
    const updated = { ...current, ...updates };
    this.setUser(updated);
  }

  logout(): void {
    this.currentUser.set(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  }

  private setUser(user: UserProfile): void {
    this.currentUser.set(user);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch {
        // Ignore storage errors
      }
    }
  }
}
