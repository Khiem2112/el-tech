import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminApiService } from '../../../core/api/admin-api.service';
import {
  ADMIN_NAV_GROUPS,
  AdminNavGroup,
} from '../constants/admin-navigation.constants';

const STORAGE_ACCORDION_KEY = 'el_tech_admin_sidebar_groups';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <aside
      class="w-72 h-full bg-surface border-r border-line flex flex-col select-none text-foreground"
    >
      <div
        class="h-14 px-4 flex items-center justify-between border-b border-line bg-surface flex-shrink-0"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-7 h-7 rounded-md bg-[#76b900] shadow-sm text-black font-black flex items-center justify-center text-xs tracking-tighter"
          >
            EL
          </div>
          <div>
            <div class="font-extrabold text-foreground text-sm tracking-wider flex items-center gap-1.5 leading-none">
              EL-TECH
              <span
                class="text-[11px] bg-primary/10 text-primary-strong border border-primary/20 px-1.5 py-0.5 rounded-full font-mono font-bold"
              >
                PORTAL
              </span>
            </div>
            <div class="text-xs text-muted tracking-tight mt-0.5">Quản Trị Bán Hàng & Vận Hành</div>
          </div>
        </div>

        <button
          type="button"
          (click)="closeSidebar.emit()"
          class="lg:hidden p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-alt"
          aria-label="Đóng thanh điều hướng"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-3 border-b border-line bg-surface flex-shrink-0 space-y-1">
        <div class="relative">
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Tìm nhanh chức năng, danh mục..."
            class="w-full px-3 py-2 bg-canvas border border-line rounded-md text-[13px] text-foreground placeholder:text-muted focus:border-primary focus:outline-none transition-colors"
          />
          @if (searchQuery()) {
            <button
              type="button"
              (click)="onClearSearch()"
              class="absolute right-2.5 top-2.5 text-muted hover:text-foreground"
              title="Xóa tìm kiếm"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }
        </div>

        @if (searchQuery()) {
          <div class="text-xs text-muted px-1 flex items-center justify-between pt-1">
            <span>
              Kết quả:
              <strong class="text-primary-strong tabular-nums">{{ filteredCount() }}</strong>
            </span>
            <button
              type="button"
              (click)="onClearSearch()"
              class="text-primary-strong hover:underline font-medium"
            >
              Hiện tất cả
            </button>
          </div>
        }
      </div>

      <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-2 text-[13px]">
        @for (group of displayedGroups(); track group.id) {
          <div class="rounded-md border border-transparent">
            <button
              type="button"
              (click)="toggleGroup(group.id)"
              class="w-full px-2 py-1.5 rounded-md hover:bg-surface-alt text-xs font-bold uppercase tracking-wider text-muted hover:text-foreground flex items-center justify-between transition-colors"
            >
              <span class="truncate">{{ group.label }}</span>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <span class="text-xs text-muted font-normal tabular-nums">
                  {{ group.items.length }}
                </span>
                <svg
                  class="w-3.5 h-3.5 text-muted transition-transform duration-200"
                  [class.rotate-180]="isGroupOpen(group.id)"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            @if (isGroupOpen(group.id)) {
              <div class="space-y-0.5 pt-1 pl-1">
                @for (item of group.items; track item.code) {
                  <a
                    [routerLink]="item.fullPath"
                    routerLinkActive="bg-primary/10 text-primary-strong font-semibold"
                    (click)="onItemClick()"
                    class="flex items-center px-2.5 py-2 rounded-md text-muted hover:bg-surface-alt hover:text-foreground font-medium text-[13px] transition-colors"
                  >
                    <span class="truncate">{{ item.title }}</span>
                  </a>
                }
              </div>
            }
          </div>
        }
      </nav>

      <div
        class="p-3 border-t border-line bg-surface flex items-center justify-between text-xs flex-shrink-0"
      >
        <div class="flex items-center gap-2 truncate">
          <div
            class="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary-strong flex-shrink-0"
          >
            AD
          </div>
          <div class="truncate">
            <div class="text-foreground font-semibold text-sm leading-tight truncate">
              {{ adminApi.currentAdmin()?.name ?? 'Quản Trị Viên' }}
            </div>
            <div class="text-xs text-muted leading-tight font-mono truncate">
              {{ adminApi.currentAdmin()?.email ?? 'admin@eltech.vn' }}
            </div>
          </div>
        </div>

        <button
          type="button"
          (click)="onLogout()"
          class="text-[13px] text-muted hover:text-rose-600 px-2 py-1.5 rounded-md hover:bg-surface-alt transition-colors inline-flex items-center gap-1.5 flex-shrink-0 font-medium"
          title="Đăng xuất khỏi hệ thống"
        >
          <span>Đăng xuất</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  readonly adminApi = inject(AdminApiService);
  private readonly router = inject(Router);

  @Output() readonly closeSidebar = new EventEmitter<void>();

  readonly searchQuery = signal<string>('');
  readonly openGroupIds = signal<Set<string>>(this.loadInitialOpenGroups());

  readonly displayedGroups = computed<readonly AdminNavGroup[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return ADMIN_NAV_GROUPS;
    }

    return ADMIN_NAV_GROUPS.map((group) => {
      const filteredItems = group.items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query) ||
          item.module.toLowerCase().includes(query),
      );
      return {
        ...group,
        items: filteredItems,
      };
    }).filter((group) => group.items.length > 0);
  });

  readonly filteredCount = computed<number>(() => {
    return this.displayedGroups().reduce((acc, g) => acc + g.items.length, 0);
  });

  isGroupOpen(groupId: string): boolean {
    if (this.searchQuery().trim()) {
      return true;
    }
    return this.openGroupIds().has(groupId);
  }

  toggleGroup(groupId: string): void {
    const current = new Set(this.openGroupIds());
    if (current.has(groupId)) {
      current.delete(groupId);
    } else {
      current.add(groupId);
    }
    this.openGroupIds.set(current);
    this.persistOpenGroups(current);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onClearSearch(): void {
    this.searchQuery.set('');
  }

  onItemClick(): void {
    this.closeSidebar.emit();
  }

  async onLogout(): Promise<void> {
    await this.adminApi.logout();
    await this.router.navigate(['/admin/login']);
  }

  private loadInitialOpenGroups(): Set<string> {
    if (typeof window === 'undefined') {
      return new Set(['mod-operations', 'mod-catalog']);
    }
    try {
      const raw = localStorage.getItem(STORAGE_ACCORDION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set<string>(parsed);
        }
      }
    } catch {
      // Fallback to default open groups
    }
    return new Set(['mod-operations', 'mod-catalog']);
  }

  private persistOpenGroups(groups: Set<string>): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(STORAGE_ACCORDION_KEY, JSON.stringify(Array.from(groups)));
    } catch {
      // Ignore storage errors
    }
  }
}
