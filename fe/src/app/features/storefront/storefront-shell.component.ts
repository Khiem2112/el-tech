import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

type NavItem = { label: string; path: string };

@Component({ selector: 'app-storefront-shell', imports: [RouterLink, RouterLinkActive, RouterOutlet], templateUrl: './storefront-shell.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class StorefrontShellComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly productsOpen = signal(false);
  protected readonly navigation: readonly NavItem[] = [
    { label: 'PC dựng sẵn', path: '/pc-dung-san' },
    { label: 'Tự lắp PC', path: '/tu-lap-pc' },
    { label: 'Theo dõi đơn', path: '/tra-cuu-don' },
  ];

  protected toggleMobileMenu(): void { this.mobileMenuOpen.update((open) => !open); }
  protected toggleProducts(): void { this.productsOpen.update((open) => !open); }
  protected closeOverlays(): void { this.mobileMenuOpen.set(false); this.productsOpen.set(false); }

  @HostListener('document:keydown.escape')
  protected onEscape(): void { this.closeOverlays(); }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.closeOverlays();
  }
}
