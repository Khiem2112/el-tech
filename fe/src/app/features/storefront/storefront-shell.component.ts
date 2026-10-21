import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { CatalogProduct, CatalogService } from '../catalog/catalog.service';
import { AppIconModule, BadgeDirective, InputDirective } from '../../components/atoms';
import { CartDrawerComponent } from '../cart/cart-drawer.component';
import { AuthModalComponent } from '../auth/auth-modal.component';
import { VndPipe } from '../../lib/vnd.pipe';
import { ProductImagePipe } from '../../lib/product-image.pipe';
import { handleProductImageError } from '../../core/constants/product.constants';

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
    InputDirective,
    CartDrawerComponent,
    AuthModalComponent,
    VndPipe,
    ProductImagePipe,
  ],
  templateUrl: './storefront-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontShellComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly productsOpen = signal(false);
  protected searchQuery = '';

  protected readonly searchDropdownOpen = signal(false);
  protected readonly isSearching = signal(false);
  protected readonly searchResults = signal<readonly CatalogProduct[]>([]);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly onImageError = handleProductImageError;

  protected readonly navigation: readonly NavItem[] = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Linh kiện PC', path: '/san-pham' },
    { label: 'Build PC', path: '/tu-lap-pc' },
    { label: 'Tra cứu đơn', path: '/tra-cuu-don' },
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
    this.searchDropdownOpen.set(false);
  }

  protected onSearchInput(): void {
    const term = this.searchQuery.trim();
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    if (term.length < 2) {
      this.searchResults.set([]);
      this.searchDropdownOpen.set(false);
      this.isSearching.set(false);
      return;
    }
    this.isSearching.set(true);
    this.searchDropdownOpen.set(true);
    this.searchDebounceTimer = setTimeout(() => {
      void this.performLiveSearch(term);
    }, 300);
  }

  protected onSearchFocus(): void {
    const term = this.searchQuery.trim();
    if (term.length >= 2 && this.searchResults().length > 0) {
      this.searchDropdownOpen.set(true);
    }
  }

  private async performLiveSearch(term: string): Promise<void> {
    try {
      const products = await this.catalog.list({ query: term });
      if (this.searchQuery.trim() !== term) {
        return;
      }
      this.searchResults.set(products.slice(0, 6));
    } catch {
      if (this.searchQuery.trim() === term) {
        this.searchResults.set([]);
      }
    } finally {
      if (this.searchQuery.trim() === term) {
        this.isSearching.set(false);
      }
    }
  }

  protected selectProduct(product: CatalogProduct): void {
    this.closeOverlays();
    this.searchQuery = '';
    void this.router.navigate(['/san-pham', product.category.slug, product.slug]);
  }

  protected getMinPrice(product: CatalogProduct): number {
    if (!product.variants || product.variants.length === 0) {
      return 0;
    }
    const prices = product.variants
      .map((variant) => Number(variant.sellingPrice))
      .filter((price) => !Number.isNaN(price) && price > 0);
    return prices.length > 0 ? Math.min(...prices) : Number(product.variants[0].sellingPrice) || 0;
  }

  protected onSearch(): void {
    const trimmed = this.searchQuery.trim();
    this.closeOverlays();
    const queryParams: Record<string, string> = {};
    if (trimmed) {
      queryParams['q'] = trimmed;
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
