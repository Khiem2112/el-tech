import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  AdminNavItem,
  findAdminNavItemByUrl,
} from '../constants/admin-navigation.constants';

type BreadcrumbState = {
  readonly code: string;
  readonly module: string;
  readonly title: string;
  readonly fullPath: string;
  readonly parentUrl?: string;
  readonly subTitle?: string;
};

@Component({
  selector: 'app-admin-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex items-center gap-3 min-w-0">
      <span
        class="px-2.5 py-0.5 rounded-full bg-[#090d16] text-[#76b900] font-mono text-xs font-bold border border-[#272f3d] flex-shrink-0"
      >
        {{ state().code }}
      </span>

      <nav aria-label="Đường dẫn phân cấp" class="flex items-center gap-2 text-xs truncate">
        <span class="text-slate-400 font-medium truncate">{{ state().module }}</span>
        <span class="text-slate-600">/</span>
        <a
          [routerLink]="state().parentUrl || state().fullPath"
          class="font-bold text-slate-100 text-sm truncate hover:text-[#76b900] transition-colors"
          [title]="state().parentUrl ? 'Quay lại danh sách cha với bộ lọc bảo toàn' : 'Quay lại danh sách cha'"
        >
          {{ state().title }}
        </a>

        @if (state().subTitle) {
          <span class="text-slate-600">/</span>
          <span class="text-slate-300 font-medium truncate">{{ state().subTitle }}</span>
        }
      </nav>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly state = signal<BreadcrumbState>(this.computeState(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.state.set(this.computeState(event.urlAfterRedirects));
      });
  }

  private computeState(url: string): BreadcrumbState {
    const item: AdminNavItem | null = findAdminNavItemByUrl(url);
    if (!item) {
      return {
        code: 'ADMIN',
        module: 'Quản Trị',
        title: 'Bảng Điều Khiển',
        fullPath: '/admin/dashboard',
      };
    }

    const cleanUrl = url.split('?')[0].split('#')[0];
    let subTitle: string | undefined;
    let parentUrl: string | undefined;

    const isChildRoute = cleanUrl.length > item.fullPath.length;

    if (isChildRoute) {
      const rest = cleanUrl.substring(item.fullPath.length).replace(/^\//, '');
      if (rest === 'new') {
        subTitle = 'Tạo mới';
      } else if (rest) {
        subTitle = `Chi tiết (#${rest})`;
      }

      // Kiem tra tham so returnUrl hoac phuc hoi tu bo nho phien session
      const parsedUrl = this.router.parseUrl(url);
      const queryReturnUrl = parsedUrl.queryParams['returnUrl'];
      if (typeof queryReturnUrl === 'string' && queryReturnUrl.startsWith(item.fullPath)) {
        parentUrl = queryReturnUrl;
      } else if (typeof window !== 'undefined' && window.sessionStorage) {
        const storedParentUrl = window.sessionStorage.getItem(`admin_parent_url_${item.fullPath}`);
        if (storedParentUrl && storedParentUrl.startsWith(item.fullPath)) {
          parentUrl = storedParentUrl;
        }
      }
    } else {
      // Khi o tren man hinh danh sach cha, luu lai toan bo url kem cac bo loc
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(`admin_parent_url_${item.fullPath}`, url);
      }
    }

    return {
      code: item.code,
      module: item.module,
      title: item.title,
      fullPath: item.fullPath,
      parentUrl,
      subTitle,
    };
  }
}
