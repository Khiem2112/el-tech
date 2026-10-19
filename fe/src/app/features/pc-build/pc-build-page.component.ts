import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VndPipe } from '../../lib/vnd.pipe';
import { ApiClientService } from '../../core/api/api-client.service';
import { CartService } from '../../services/cart.service';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

type Bundle = { id: number; name: string; slug: string; description: string | null; build: { total: string; lines: readonly { skuId: number; sku: string; name: string; quantity: number; unitPrice: string }[] } };

@Component({
  selector: 'app-pc-build-page',
  imports: [RouterLink, VndPipe, ButtonDirective, BadgeDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="pb-6 border-b border-line">
        <nav class="text-xs text-muted mb-1">
          <a routerLink="/" class="hover:text-foreground">Trang chủ</a> / 
          <span class="text-foreground font-bold">PC dựng sẵn</span>
        </nav>
        <div class="flex items-center gap-2">
          <span appBadge variant="outline" class="text-xs text-primary border-primary/30">VIRTUAL PC BUNDLES</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-2">Dàn Máy PC Dựng Sẵn (Prebuilt)</h1>
        <p class="text-xs text-muted mt-1 max-w-2xl">Mỗi cấu hình được chọn lọc từ linh kiện thực tế; tương thích tuyệt đối và kiểm tra stress test 24h trước khi xuất xưởng.</p>
      </div>

      @if (loading()) {
        <div class="mt-8 grid gap-6 md:grid-cols-2">
          @for (item of [1, 2]; track item) {
            <div class="h-64 animate-pulse rounded-xl bg-surface-alt border border-line"></div>
          }
        </div>
      } @else if (error()) {
        <div class="mt-8 rounded-lg bg-danger/10 border border-danger/30 p-5 text-center" role="alert">
          <p class="text-sm font-bold text-foreground">Không thể tải cấu hình máy tính dựng sẵn.</p>
          <button appButton variant="primary" size="sm" class="mt-3" type="button" (click)="load()">
            Thử lại
          </button>
        </div>
      } @else {
        <div class="mt-8 grid gap-6 md:grid-cols-2">
          @for (bundle of bundles(); track bundle.id) {
            <article class="rounded-xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all">
              <div>
                <div class="flex items-center justify-between">
                  <span appBadge variant="primary" class="text-[10px]">ELT BUNDLE</span>
                  <span class="text-xs text-muted">BOM CHÍNH HÃNG</span>
                </div>
                <h2 class="text-lg font-bold text-foreground mt-2">{{ bundle.name }}</h2>
                <p class="mt-1 text-xs text-muted leading-relaxed">{{ bundle.description }}</p>
                
                <div class="mt-4 pt-4 border-t border-line">
                  <span class="text-xs font-bold text-foreground uppercase block mb-2">Danh sách linh kiện trong bộ:</span>
                  <ul class="space-y-1.5 text-xs text-muted">
                    @for (line of bundle.build.lines; track line.sku) {
                      <li class="flex items-center justify-between gap-2">
                        <span class="truncate">{{ line.name }}</span>
                        <span class="font-bold text-foreground shrink-0">×{{ line.quantity }}</span>
                      </li>
                    }
                  </ul>
                </div>
              </div>

              <div class="mt-6 pt-4 border-t border-line">
                <div class="flex items-baseline justify-between mb-4">
                  <span class="text-xs text-muted">Giá trọn gói lắp ráp:</span>
                  <span class="text-xl font-black text-primary tabular">{{ bundle.build.total | vnd }}</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    appButton
                    variant="primary"
                    size="md"
                    (click)="addToCart(bundle)"
                  >
                    <lucide-icon name="ShoppingCart" class="size-4" aria-hidden="true"></lucide-icon>
                    <span>Thêm vào giỏ</span>
                  </button>
                  <a
                    routerLink="/tu-lap-pc"
                    appButton
                    variant="secondary"
                    size="md"
                  >
                    <lucide-icon name="Wrench" class="size-4" aria-hidden="true"></lucide-icon>
                    <span>Tùy chỉnh thêm</span>
                  </a>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
})
export class PcBuildPageComponent {
  private readonly api = inject(ApiClientService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  protected readonly bundles = signal<readonly Bundle[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() { void this.load(); }

  protected async addToCart(bundle: Bundle): Promise<void> {
    const items = bundle.build.lines.map((line) => ({ skuId: line.skuId, quantity: line.quantity }));
    await this.cart.addBuild({
      buildName: bundle.name,
      buildType: 'PREBUILT',
      sourcePcBundleId: bundle.id,
      items,
      hasAssemblyService: true,
    });
    void this.router.navigate(['/gio-hang']);
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const result = await this.api.get<readonly Bundle[]>('/pc-bundles');
      if (!result.success) throw new Error(result.error.code);
      this.bundles.set(result.data);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
