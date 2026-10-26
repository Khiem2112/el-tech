import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from './components/admin-header.component';
import { AdminSidebarComponent } from './components/admin-sidebar.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent, AdminHeaderComponent],
  template: `
    <div class="h-screen w-screen overflow-hidden flex bg-canvas text-foreground">
      @if (isMobileSidebarOpen()) {
        <div
          (click)="closeMobileSidebar()"
          class="fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        ></div>
      }

      <div
        class="fixed inset-y-0 left-0 z-40 lg:z-30 transition-transform duration-200 ease-in-out lg:translate-x-0"
        [class.-translate-x-full]="!isMobileSidebarOpen()"
        [class.translate-x-0]="isMobileSidebarOpen()"
      >
        <app-admin-sidebar (closeSidebar)="closeMobileSidebar()" />
      </div>

      <div class="flex-1 flex flex-col h-screen min-w-0 overflow-hidden lg:pl-72 bg-canvas">
        <app-admin-header (toggleSidebar)="toggleMobileSidebar()" />

        <main class="flex-1 overflow-y-auto bg-canvas text-foreground">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {
  readonly isMobileSidebarOpen = signal<boolean>(false);

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }
}
