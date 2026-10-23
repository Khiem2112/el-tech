import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { AdminApiService } from '../../../core/api/admin-api.service';
import { AdminBreadcrumbComponent } from './admin-breadcrumb.component';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, AdminBreadcrumbComponent],
  template: `
    <header
      class="h-14 bg-[#161b26] border-b border-[#272f3d] flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20"
    >
      <div class="flex items-center gap-3 min-w-0">
        <button
          type="button"
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-[#272f3d] transition-colors"
          aria-label="Mở trình đơn điều hướng"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <app-admin-breadcrumb />
      </div>

      <div class="flex items-center gap-3 flex-shrink-0">
        <div class="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#090d16] border border-[#272f3d] rounded-full text-xs">
          <span class="w-2 h-2 rounded-full bg-[#76b900] animate-pulse"></span>
          <span class="text-slate-300 font-medium">Hệ Thống Trực Tuyến</span>
        </div>

        <div class="flex items-center gap-2 pl-2 border-l border-[#272f3d]">
          <div
            class="w-8 h-8 rounded-full bg-[#090d16] border border-[#272f3d] flex items-center justify-center font-bold text-xs text-[#76b900]"
          >
            AD
          </div>
          <div class="hidden md:block text-left">
            <div class="text-white font-semibold text-xs leading-tight">
              {{ adminApi.currentAdmin()?.name ?? 'Quản Trị Viên' }}
            </div>
            <div class="text-[11px] text-slate-400 leading-tight font-mono">
              {{ adminApi.currentAdmin()?.email ?? 'admin@eltech.vn' }}
            </div>
          </div>
        </div>

        <button
          type="button"
          (click)="onLogout()"
          class="px-2.5 py-1.5 rounded-md text-xs text-slate-300 hover:text-rose-400 hover:bg-[#272f3d] transition-colors inline-flex items-center gap-1.5"
          title="Đăng xuất khỏi hệ thống"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span class="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHeaderComponent {
  readonly adminApi = inject(AdminApiService);
  private readonly router = inject(Router);

  @Output() readonly toggleSidebar = new EventEmitter<void>();

  async onLogout(): Promise<void> {
    await this.adminApi.logout();
    await this.router.navigate(['/admin/login']);
  }
}
