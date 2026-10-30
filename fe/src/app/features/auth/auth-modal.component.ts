import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { InputDirective } from '../../components/atoms/input/input.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

@Component({
  selector: 'app-auth-modal',
  imports: [FormsModule, ButtonDirective, InputDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.isAuthModalOpen()) {
      <div
        class="fixed inset-0 z-50 bg-surface-dark/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        (click)="closeModal()"
      >
        <div
          class="relative w-full max-w-[440px] my-auto bg-surface rounded-2xl shadow-2xl border border-line overflow-hidden transition-all duration-200"
          (click)="$event.stopPropagation()"
        >
          <!-- Top NVIDIA Green Gradient Line -->
          <div class="h-1.5 w-full bg-gradient-to-r from-primary via-primary-pale to-primary-fixed"></div>

          <!-- Close Button -->
          <button
            type="button"
            aria-label="Đóng cửa sổ"
            class="absolute top-4 right-4 size-8 rounded-full bg-surface-alt hover:bg-slate-200 text-muted hover:text-foreground flex items-center justify-center transition-colors z-10 cursor-pointer"
            (click)="closeModal()"
          >
            <lucide-icon name="X" class="size-4" aria-hidden="true"></lucide-icon>
          </button>

          <!-- Modal Body Content -->
          <div class="p-6 sm:p-7 flex flex-col gap-5">
            <!-- Header Identity -->
            <div class="flex flex-col items-center text-center">
              <div class="size-11 rounded-xl bg-surface-dark border border-line-dark flex items-center justify-center shadow-xs mb-3">
                <lucide-icon name="Cpu" class="size-6 text-primary" aria-hidden="true"></lucide-icon>
              </div>
              <span class="text-xs tracking-widest text-primary font-bold uppercase">EL-TECH HARDWARE</span>
              <h2 id="auth-modal-title" class="text-xl font-black text-foreground tracking-tight mt-1">
                {{ authMode() === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới' }}
              </h2>
              <p class="text-xs text-muted mt-1 max-w-[340px]">
                {{ authMode() === 'login' ? 'Đăng nhập để quản lý đơn hàng & theo dõi bảo hành' : 'Trải nghiệm cấu hình riêng và quyền lợi bảo hành độc quyền' }}
              </p>
            </div>

            <!-- Segmented Tab Switcher -->
            <div class="grid grid-cols-2 p-1 bg-surface-alt rounded-lg border border-line">
              <button
                type="button"
                class="py-2 rounded-md text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                [class.bg-surface]="authMode() === 'login'"
                [class.text-foreground]="authMode() === 'login'"
                [class.shadow-xs]="authMode() === 'login'"
                [class.text-muted]="authMode() !== 'login'"
                (click)="switchMode('login')"
              >
                <lucide-icon name="User" class="size-3.5" [class.text-primary]="authMode() === 'login'" aria-hidden="true"></lucide-icon>
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                class="py-2 rounded-md text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                [class.bg-surface]="authMode() === 'register'"
                [class.text-foreground]="authMode() === 'register'"
                [class.shadow-xs]="authMode() === 'register'"
                [class.text-muted]="authMode() !== 'register'"
                (click)="switchMode('register')"
              >
                <lucide-icon name="Plus" class="size-3.5" [class.text-primary]="authMode() === 'register'" aria-hidden="true"></lucide-icon>
                <span>Đăng ký</span>
              </button>
            </div>

            <!-- Google OAuth 1-Click Fast Button -->
            <button
              type="button"
              class="w-full h-11 px-4 rounded-lg bg-surface hover:bg-surface-alt border border-line shadow-xs flex items-center justify-center gap-3 text-xs font-bold text-foreground transition-all duration-150 group"
              (click)="handleGoogleAuth()"
            >
              <svg class="size-4.5 shrink-0" viewBox="0 0 24 24">
                <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"/>
                <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" fill="#34A853"/>
                <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"/>
                <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"/>
              </svg>
              <span>Tiếp tục nhanh với Google</span>
            </button>

            <!-- Divider -->
            <div class="relative flex items-center justify-center">
              <div class="w-full h-px bg-border"></div>
              <span class="absolute px-3 bg-surface text-xs text-muted uppercase font-bold tracking-wider">
                Hoặc với Email / SĐT
              </span>
            </div>

            <!-- Error Message Banner -->
            @if (errorMessage(); as err) {
              <div class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-600 flex items-center gap-2 animate-in fade-in duration-200">
                <lucide-icon name="AlertTriangle" class="size-4 shrink-0 text-rose-500" aria-hidden="true"></lucide-icon>
                <span>{{ err }}</span>
              </div>
            }

            <!-- Success Message Banner -->
            @if (successMessage(); as msg) {
              <div class="p-3 rounded-lg bg-primary/10 border border-primary/30 text-xs font-bold text-primary flex items-center gap-2 animate-in fade-in duration-200">
                <lucide-icon name="Check" class="size-4 shrink-0" aria-hidden="true"></lucide-icon>
                <span>{{ msg }}</span>
              </div>
            }

            <!-- Auth Input Form -->
            <form class="flex flex-col gap-3.5" (ngSubmit)="handleSubmit()">
              <!-- Name (Register mode only) -->
              @if (authMode() === 'register') {
                <div class="space-y-1">
                  <label class="block text-xs font-bold text-foreground" for="regName">
                    Họ và tên <span class="text-rose-500 font-bold">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="regName"
                      appInput
                      class="w-full text-sm font-medium pl-8"
                      [(ngModel)]="name"
                      name="name"
                      placeholder="Nguyễn Văn A"
                      required
                    >
                    <lucide-icon name="User" class="size-3.5 text-muted absolute left-2.5 pointer-events-none" aria-hidden="true"></lucide-icon>
                  </div>
                </div>

                <!-- Email (Register mode only) -->
                <div class="space-y-1">
                  <label class="block text-xs font-bold text-foreground" for="regEmail">
                    Email <span class="text-rose-500 font-bold">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="regEmail"
                      type="email"
                      appInput
                      class="w-full text-sm font-medium pl-8"
                      [(ngModel)]="email"
                      name="email"
                      placeholder="name@example.com"
                      required
                    >
                    <lucide-icon name="Mail" class="size-3.5 text-muted absolute left-2.5 pointer-events-none" aria-hidden="true"></lucide-icon>
                  </div>
                </div>

                <!-- Phone (Register mode only) -->
                <div class="space-y-1">
                  <label class="block text-xs font-bold text-foreground" for="regPhone">
                    Số điện thoại <span class="text-rose-500 font-bold">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="regPhone"
                      type="tel"
                      appInput
                      class="w-full text-sm font-medium pl-8"
                      [(ngModel)]="phone"
                      name="phone"
                      placeholder="0912xxxxxx"
                      required
                    >
                    <lucide-icon name="Phone" class="size-3.5 text-muted absolute left-2.5 pointer-events-none" aria-hidden="true"></lucide-icon>
                  </div>
                </div>
              } @else {
                <!-- Email / Phone field (Login mode) -->
                <div class="space-y-1">
                  <label class="block text-xs font-bold text-foreground" for="authIdentifier">
                    Email hoặc Số điện thoại <span class="text-rose-500 font-bold">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="authIdentifier"
                      appInput
                      class="w-full text-sm font-medium pl-8"
                      [(ngModel)]="identifier"
                      name="identifier"
                      placeholder="name@example.com hoặc 0912xxxxxx"
                      required
                    >
                    <lucide-icon name="Mail" class="size-3.5 text-muted absolute left-2.5 pointer-events-none" aria-hidden="true"></lucide-icon>
                  </div>
                </div>
              }

              <!-- Password field with Show/Hide toggle -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-foreground" for="authPassword">
                  Mật khẩu <span class="text-rose-500 font-bold">*</span>
                </label>
                <div class="relative flex items-center">
                  <input
                    id="authPassword"
                    appInput
                    [type]="showPassword() ? 'text' : 'password'"
                    class="w-full text-sm font-medium pl-8 pr-9"
                    [(ngModel)]="password"
                    name="password"
                    placeholder="••••••••"
                    required
                  >
                  <lucide-icon name="Lock" class="size-3.5 text-muted absolute left-2.5 pointer-events-none" aria-hidden="true"></lucide-icon>
                  <button
                    type="button"
                    class="absolute right-2.5 text-muted hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Ẩn hiện mật khẩu"
                    (click)="showPassword.set(!showPassword())"
                  >
                    @if (showPassword()) {
                      <lucide-icon name="EyeOff" class="size-3.5" aria-hidden="true"></lucide-icon>
                    } @else {
                      <lucide-icon name="Eye" class="size-3.5" aria-hidden="true"></lucide-icon>
                    }
                  </button>
                </div>
              </div>

              <!-- Remember me and Forgot password (Login mode only) -->
              @if (authMode() === 'login') {
                <div class="flex items-center justify-between text-xs pt-0.5">
                  <label class="flex items-center gap-1.5 cursor-pointer select-none text-muted hover:text-foreground">
                    <input
                      type="checkbox"
                      class="rounded border-line text-primary focus:ring-primary size-3.5"
                      [(ngModel)]="rememberMe"
                      name="rememberMe"
                    >
                    <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                  </label>
                  <button
                    type="button"
                    class="text-xs font-bold text-primary hover:underline cursor-pointer"
                    (click)="handleForgotPassword()"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                @if (forgotPasswordSent()) {
                  <div class="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
                    <lucide-icon name="Check" class="size-4 shrink-0" aria-hidden="true"></lucide-icon>
                    <span>Hướng dẫn khôi phục mật khẩu đã được gửi đến email/SĐT của bạn.</span>
                  </div>
                }
              }

              <!-- Submit Button -->
              <button
                type="submit"
                appButton
                variant="primary"
                size="lg"
                class="w-full mt-1"
                [disabled]="isSubmitting() || !canSubmit()"
              >
                @if (isSubmitting()) {
                  <lucide-icon name="loader-2" class="size-4 animate-spin" aria-hidden="true"></lucide-icon>
                  <span>Đang xử lý...</span>
                } @else {
                  <span>{{ authMode() === 'login' ? 'Đăng nhập vào EL-TECH' : 'Tạo tài khoản EL-TECH' }}</span>
                  <lucide-icon name="ArrowRight" class="size-4" aria-hidden="true"></lucide-icon>
                }
              </button>
            </form>

            <!-- Terms notice on register -->
            @if (authMode() === 'register') {
              <p class="text-center text-xs text-muted leading-relaxed">
                Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của EL-TECH.
              </p>
            }

            <!-- Guest Lookup Footer -->
            <div class="pt-3 bg-surface-alt -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 px-6 py-3 border-t border-line flex items-center justify-between rounded-b-2xl text-xs">
              <span class="text-muted flex items-center gap-1.5">
                <lucide-icon name="Truck" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                <span>Khách mua vãng lai?</span>
              </span>
              <button
                type="button"
                class="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                (click)="navigateToGuestLookup()"
              >
                <span>Tra cứu bằng mã OTP</span>
                <lucide-icon name="ChevronRight" class="size-3.5" aria-hidden="true"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AuthModalComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly authMode = signal<'login' | 'register'>('login');
  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly forgotPasswordSent = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected name = '';
  protected email = '';
  protected phone = '';
  protected identifier = '';
  protected password = '';
  protected rememberMe = true;

  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  protected resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.identifier = '';
    this.password = '';
    this.rememberMe = true;
    this.showPassword.set(false);
    this.forgotPasswordSent.set(false);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  protected closeModal(): void {
    this.resetForm();
    this.auth.closeAuthModal();
  }

  protected switchMode(mode: 'login' | 'register'): void {
    if (this.authMode() !== mode) {
      this.resetForm();
      this.authMode.set(mode);
    }
  }

  protected canSubmit(): boolean {
    if (this.successMessage()) {
      return false;
    }
    if (this.authMode() === 'register') {
      const hasName = this.name.trim().length > 0;
      const hasEmail = this.email.trim().includes('@') && this.email.trim().length >= 5;
      const hasPhone = this.phone.trim().replace(/[\s.-]/g, '').length >= 9;
      const hasPassword = this.password.trim().length >= 4;
      return hasName && hasEmail && hasPhone && hasPassword;
    }
    return this.identifier.trim().length > 0 && this.password.trim().length >= 4;
  }

  protected async handleSubmit(): Promise<void> {
    if (!this.canSubmit() || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const currentUrl = this.router.url;
      const queryParams =
        currentUrl &&
        currentUrl !== '/' &&
        !currentUrl.startsWith('/dang-nhap-thanh-cong') &&
        !currentUrl.startsWith('/login-success')
          ? { returnUrl: currentUrl }
          : undefined;

      if (this.authMode() === 'login') {
        await this.auth.login({
          emailOrPhone: this.identifier.trim(),
          password: this.password,
          rememberMe: this.rememberMe,
        });
      } else {
        await this.auth.register({
          name: this.name.trim(),
          email: this.email.trim(),
          phone: this.phone.trim(),
          password: this.password,
        });
      }
      this.closeModal();
      void this.router.navigate(['/dang-nhap-thanh-cong'], { queryParams });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('emailAlreadyExists') || message.includes('EMAIL_ALREADY_EXISTS')) {
        this.errorMessage.set('Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.');
      } else if (message.includes('invalidCredentials') || message.includes('INVALID_CREDENTIALS')) {
        this.errorMessage.set('Email/Số điện thoại hoặc mật khẩu không chính xác.');
      } else if (message.includes('invalidPhone') || message.includes('INVALID_PHONE')) {
        this.errorMessage.set('Số điện thoại không hợp lệ (tối thiểu 9 số).');
      } else if (message.includes('invalidEmail') || message.includes('INVALID_EMAIL')) {
        this.errorMessage.set('Địa chỉ email không đúng định dạng.');
      } else {
        this.errorMessage.set('Đã xảy ra lỗi trong quá trình xác thực. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected async handleGoogleAuth(): Promise<void> {
    this.errorMessage.set(null);
    const currentUrl = this.router.url;
    const queryParams =
      currentUrl &&
      currentUrl !== '/' &&
      !currentUrl.startsWith('/dang-nhap-thanh-cong') &&
      !currentUrl.startsWith('/login-success')
        ? { returnUrl: currentUrl }
        : undefined;

    try {
      await this.auth.loginWithGoogle();
      this.closeModal();
      void this.router.navigate(['/dang-nhap-thanh-cong'], { queryParams });
    } catch {
      this.errorMessage.set('Đăng nhập nhanh với Google không thành công. Vui lòng thử lại.');
    }
  }

  protected handleForgotPassword(): void {
    this.forgotPasswordSent.set(true);
  }

  protected navigateToGuestLookup(): void {
    this.closeModal();
    void this.router.navigate(['/tra-cuu-don']);
  }
}
