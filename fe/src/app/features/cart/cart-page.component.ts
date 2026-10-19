import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { VndPipe } from '../../lib/vnd.pipe';

@Component({ selector: 'app-cart-page', imports: [RouterLink, VndPipe], changeDetection: ChangeDetectionStrategy.OnPush, template: `<section class="mx-auto max-w-4xl px-4 py-10 sm:px-6"><h1 class="text-3xl font-extrabold">Giỏ hàng</h1>@if (loading()) { <div class="mt-7 h-48 animate-pulse rounded-2xl bg-surface-alt"></div> } @else if (!cart.items().length) { <div class="mt-7 rounded-2xl border border-dashed border-line p-8 text-center"><p class="font-bold">Giỏ hàng đang trống</p><a routerLink="/san-pham" class="mt-4 inline-flex font-bold text-primary">Khám phá sản phẩm</a></div> } @else { <div class="mt-7 rounded-2xl border border-line bg-surface">@for (item of cart.items(); track item.id) { <article class="flex gap-4 border-b border-line p-5 last:border-0"><div class="min-w-0 flex-1"><p class="font-bold">{{ item.name }}</p><p class="mt-1 text-sm text-muted">{{ item.sku }} · {{ item.unitPrice | vnd }}</p><div class="mt-3 flex items-center gap-3"><button type="button" class="rounded border border-line px-2" (click)="change(item.id, item.quantity - 1)">−</button><span>{{ item.quantity }}</span><button type="button" class="rounded border border-line px-2" (click)="change(item.id, item.quantity + 1)">+</button><button type="button" class="ml-2 text-sm font-bold text-danger" (click)="remove(item.id)">Xóa</button></div></div><p class="font-extrabold">{{ item.lineTotal | vnd }}</p></article> }</div><div class="mt-5 flex items-center justify-between rounded-2xl bg-surface-alt p-5"><span class="font-bold">Tạm tính</span><span class="text-2xl font-extrabold">{{ cart.subtotal() | vnd }}</span></div><a routerLink="/checkout" class="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground">Tiếp tục checkout</a> }</section>` })
export class CartPageComponent {
  protected readonly cart = inject(CartService);
  protected readonly loading = signal(true);
  constructor() { void this.load(); }
  protected change(itemId: string, quantity: number): void { void this.cart.setQuantity(itemId, quantity); }
  protected remove(itemId: string): void { void this.cart.remove(itemId); }
  private async load(): Promise<void> { try { await this.cart.load(); } finally { this.loading.set(false); } }
}
