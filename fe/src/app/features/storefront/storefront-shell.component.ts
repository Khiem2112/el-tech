import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { AppIconModule, BadgeDirective } from '../../components/atoms';
import { CartDrawerComponent } from '../cart/cart-drawer.component';
import { AuthModalComponent } from '../auth/auth-modal.component';

type NavItem = { label: string; path: string };

@Component({
  selector: 'app-storefront-shell',
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    AppIconModule,
    BadgeDirective,
    CartDrawerComponent,
    AuthModalComponent,
  ],
  templateUrl: './storefront-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontShellComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly productsOpen = signal(false);
  protected searchQuery = '';
  protected selectedCategory = 'all';

  protected readonly navigation: readonly NavItem[] = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Linh kiện PC', path: '/san-pham' },
    { label: 'Build PC', path: '/tu-lap-pc' },
    { label: 'Tra cứu đơn', path: '/tra-cuu-don' },
    { label: 'Tiến độ đơn', path: '/tien-do-don' },
    { label: 'Chính sách', path: '/chinh-sach' },
  ];

  constructor() {
    void this.cart.load();
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected toggleProducts(): void {
    this.productsOpen.update((open) => !open);
  }

  protected closeOverlays(): void {
    this.mobileMenuOpen.set(false);
    this.productsOpen.set(false);
  }

  protected onSearch(): void {
    const trimmed = this.searchQuery.trim();
    this.closeOverlays();
    const queryParams: Record<string, string> = {};
    if (trimmed) {
      queryParams['q'] = trimmed;
    }
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      queryParams['category'] = this.selectedCategory;
    }
    void this.router.navigate(['/san-pham'], { queryParams });
  }

  protected openCart(): void {
    this.cart.openDrawer();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeOverlays();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeOverlays();
    }
  }
}
