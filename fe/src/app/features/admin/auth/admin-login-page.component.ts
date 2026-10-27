import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { z } from 'zod';
import { AdminApiService } from '../../../core/api/admin-api.service';
import { zodValidator } from '../../../forms/zod-validator';

const emailSchema = z.string().email('Email không đúng định dạng');
const passwordSchema = z.string().min(1, 'Vui lòng nhập mật khẩu');

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-canvas text-foreground flex flex-col justify-center items-center p-4">
      <div class="w-full max-w-sm sm:max-w-md bg-surface border border-line rounded-lg shadow-xs p-6 sm:p-8">
        <div class="mb-6 text-center space-y-1">
          <div
            class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#76b900] text-black font-black text-sm tracking-tight mb-2"
          >
            EL
          </div>
          <h1 class="text-xl font-bold tracking-tight text-foreground">
            Đăng Nhập Quản Trị
          </h1>
          <p class="text-xs text-muted">
            Hệ thống quản trị và vận hành linh kiện EL-TECH
          </p>
        </div>

        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-600 font-medium">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
          <div>
            <label for="admin-email" class="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Email đăng nhập
            </label>
            <input
              id="admin-email"
              type="email"
              formControlName="email"
              placeholder="admin@eltech.vn"
              class="w-full px-3 py-2 text-sm bg-surface-alt border border-line rounded focus:outline-none focus:border-primary text-foreground placeholder:text-muted transition-colors"
            />
            @if (loginForm.controls.email.touched && loginForm.controls.email.errors) {
              <p class="text-xs text-rose-600 mt-1">
                {{ loginForm.controls.email.errors['zodError'] ?? 'Email không hợp lệ' }}
              </p>
            }
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="admin-password" class="block text-xs font-semibold uppercase tracking-wider text-muted">
                Mật khẩu
              </label>
            </div>
            <input
              id="admin-password"
              type="password"
              formControlName="password"
              placeholder="Nhập mật khẩu quản trị"
              class="w-full px-3 py-2 text-sm bg-surface-alt border border-line rounded focus:outline-none focus:border-primary text-foreground placeholder:text-muted transition-colors"
            />
            @if (loginForm.controls.password.touched && loginForm.controls.password.errors) {
              <p class="text-xs text-rose-600 mt-1">
                {{ loginForm.controls.password.errors['zodError'] ?? 'Vui lòng nhập mật khẩu' }}
              </p>
            }
          </div>

          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-muted">
              <input
                id="remember-me"
                type="checkbox"
                formControlName="rememberMe"
                class="w-4 h-4 rounded border-line bg-surface text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Ghi nhớ phiên đăng nhập (30 ngày)</span>
            </label>
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full py-2.5 px-4 bg-primary hover:bg-primary-strong disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold text-sm rounded transition-colors shadow-xs mt-2"
          >
            {{ isLoading() ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị' }}
          </button>
        </form>

        <div class="mt-6 pt-4 border-t border-line text-center text-xs text-muted">
          <span>Tài khoản thử nghiệm: </span>
          <span class="tabular text-foreground font-medium">admin&#64;eltech.vn</span>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginPageComponent {
  private readonly adminApi = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm = new FormGroup({
    email: new FormControl('admin@eltech.vn', {
      nonNullable: true,
      validators: [Validators.required, zodValidator(emailSchema)],
    }),
    password: new FormControl('admin123', {
      nonNullable: true,
      validators: [Validators.required, zodValidator(passwordSchema)],
    }),
    rememberMe: new FormControl(true, {
      nonNullable: true,
    }),
  });

  constructor() {
    const errorParam = this.route.snapshot.queryParamMap.get('error');
    if (errorParam === 'forbidden') {
      this.errorMessage.set('Tài khoản của bạn không đủ thẩm quyền quản trị viên (ADMIN).');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password, rememberMe } = this.loginForm.getRawValue();

    try {
      await this.adminApi.login({ email, password, rememberMe });
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/admin/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } catch {
      this.errorMessage.set('Thông tin xác thực không chính xác hoặc tài khoản không có quyền quản trị.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
