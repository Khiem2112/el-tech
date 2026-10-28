import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { AppIconModule } from '../../../components/atoms/icon/icon.module';
import { AdminApiService } from '../../../core/api/admin-api.service';
import { AdminBreadcrumbComponent } from './admin-breadcrumb.component';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, AdminBreadcrumbComponent, AppIconModule],
  template: `
    <header
      class="h-14 bg-surface border-b border-line shadow-xs flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20"
    >
      <div class="flex items-center gap-3 min-w-0">
        <button
          type="button"
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-1.5 rounded-md text-foreground hover:bg-surface-alt transition-colors"
          aria-label="Mở trình đơn điều hướng"
        >
          <lucide-icon name="menu" class="w-5 h-5" aria-hidden="true"></lucide-icon>
        </button>

        <app-admin-breadcrumb />
      </div>

      <div class="flex items-center gap-3 flex-shrink-0">
        <div class="flex items-center gap-2 pl-3 border-l border-line">
          <div
            class="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary-strong"
          >
            AD
          </div>
          <div class="hidden md:block text-left">
            <div class="text-foreground font-semibold text-sm leading-tight">
              {{ adminApi.currentAdmin()?.name ?? 'Quản Trị Viên' }}
            </div>
            <div class="text-xs text-muted leading-tight tabular">
              {{ adminApi.currentAdmin()?.email ?? 'admin@eltech.vn' }}
            </div>
          </div>
        </div>

        <button
          type="button"
          (click)="onLogout()"
          class="px-2.5 py-1.5 rounded-md text-sm text-muted hover:text-rose-600 hover:bg-rose-500/10 border border-line transition-colors inline-flex items-center gap-1.5 font-medium"
          title="Đăng xuất khỏi hệ thống"
          aria-label="Đăng xuất khỏi hệ thống"
        >
          <lucide-icon name="log-out" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
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
