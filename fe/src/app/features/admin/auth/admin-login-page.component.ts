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
    <div class="min-h-screen bg-[#090d16] text-white flex flex-col justify-center items-center p-4">
      <div class="w-full max-w-md bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl p-8">
        <div class="mb-6 text-center">
          <div class="inline-block bg-[#090d16] text-[#76b900] border border-[#272f3d] text-xs font-bold px-3 py-1 rounded tracking-widest uppercase mb-3 font-mono">
            EL-TECH PORTAL
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Đăng Nhập Quản Trị</h1>
          <p class="text-xs text-slate-400 mt-1">Hệ thống quản trị và vận hành linh kiện EL-TECH</p>
        </div>

        <div class="mb-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded text-xs text-amber-200">
          Phân quyền hệ thống: Áp dụng tài khoản quản trị viên (ADMIN) để truy cập và quản lý dữ liệu.
        </div>

        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-rose-950/40 border border-rose-800/60 rounded text-xs text-rose-200">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
          <div>
            <label for="admin-email" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email đăng nhập
            </label>
            <input
              id="admin-email"
              type="email"
              formControlName="email"
              placeholder="admin@eltech.vn"
              class="w-full px-3 py-2 text-sm bg-[#090d16] border border-[#272f3d] rounded focus:outline-none focus:border-[#76b900] text-white placeholder-slate-500"
            />
            @if (loginForm.controls.email.touched && loginForm.controls.email.errors) {
              <p class="text-xs text-rose-400 mt-1">
                {{ loginForm.controls.email.errors['zodError'] ?? 'Email không hợp lệ' }}
              </p>
            }
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="admin-password" class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mật khẩu
              </label>
            </div>
            <input
              id="admin-password"
              type="password"
              formControlName="password"
              placeholder="Nhập mật khẩu quản trị"
              class="w-full px-3 py-2 text-sm bg-[#090d16] border border-[#272f3d] rounded focus:outline-none focus:border-[#76b900] text-white placeholder-slate-500"
            />
            @if (loginForm.controls.password.touched && loginForm.controls.password.errors) {
              <p class="text-xs text-rose-400 mt-1">
                {{ loginForm.controls.password.errors['zodError'] ?? 'Vui lòng nhập mật khẩu' }}
              </p>
            }
          </div>

          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                id="remember-me"
                type="checkbox"
                formControlName="rememberMe"
                class="w-4 h-4 rounded border-[#272f3d] bg-[#090d16] text-[#76b900] focus:ring-0 focus:ring-offset-0"
              />
              <span>Ghi nhớ phiên đăng nhập (30 ngày)</span>
            </label>
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full py-2.5 px-4 bg-[#76b900] hover:bg-[#5a8d00] disabled:bg-slate-700 disabled:cursor-not-allowed text-[#090d16] font-bold text-sm rounded shadow transition-colors mt-2"
          >
            {{ isLoading() ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị' }}
          </button>
        </form>

        <div class="mt-6 pt-4 border-t border-[#272f3d] text-center text-xs text-slate-400">
          <span>Tài khoản thử nghiệm: </span>
          <span class="font-mono text-slate-200">admin&#64;eltech.vn</span>
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
