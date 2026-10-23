import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  AdminNavItem,
  findAdminNavItemByUrl,
} from '../constants/admin-navigation.constants';

@Component({
  selector: 'app-admin-placeholder-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#272f3d]">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-[#161b26] border border-[#272f3d] text-[#76b900] font-mono text-xs font-bold">
              {{ currentItem()?.code ?? 'ADMIN' }}
            </span>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">
              {{ currentItem()?.title ?? 'Màn Hình Quản Trị' }}
            </h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Phân hệ: {{ currentItem()?.module ?? 'Quản Trị' }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a
            routerLink="/admin/dashboard"
            class="px-3 py-1.5 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] rounded text-xs text-slate-200 transition-colors"
          >
            Về Dashboard
          </a>
        </div>
      </div>

      <div class="p-8 bg-[#161b26] border border-[#272f3d] rounded-lg text-center space-y-4">
        <div class="inline-block p-4 rounded-full bg-[#090d16] border border-[#272f3d] text-[#76b900]">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </div>

        <div class="max-w-md mx-auto space-y-2">
          <h2 class="text-base font-bold text-white">
            Phân hệ {{ currentItem()?.title }} ({{ currentItem()?.code }})
          </h2>
          <p class="text-xs text-slate-400">
            Hạ tầng định tuyến và bảo vệ phân quyền đã được khởi tạo thành công. Nghiệp vụ chi tiết của màn hình này sẽ được triển khai theo tiến độ kế hoạch.
          </p>
        </div>

        <div class="pt-2 text-xs font-mono text-slate-500">
          Tuyến đường: {{ currentItem()?.fullPath }}
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPlaceholderPageComponent {
  private readonly router = inject(Router);

  currentItem(): AdminNavItem | null {
    return findAdminNavItemByUrl(this.router.url);
  }
}
