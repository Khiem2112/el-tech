import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VndPipe } from '../../lib/vnd.pipe';
import { ApiClientService } from '../../core/api/api-client.service';
import { CatalogProduct, CatalogService } from '../catalog/catalog.service';

type BuildLine = { readonly skuId: number; readonly sku: string; readonly name: string; readonly quantity: number; readonly unitPrice: string; readonly lineTotal: string };
type BuildPreview = { readonly lines: readonly BuildLine[]; readonly total: string };

@Component({
  selector: 'app-custom-build-page',
  imports: [RouterLink, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><a routerLink="/pc-dung-san" class="text-sm font-bold text-primary">← PC dựng sẵn</a><p class="mt-6 text-xs font-extrabold tracking-[.16em] text-primary">CUSTOM BUILD</p><h1 class="mt-2 text-3xl font-extrabold">Tự lắp PC</h1><p class="mt-3 max-w-3xl text-muted">Chọn linh kiện và xem giá dự toán. Giá, tồn kho và tính khả dụng sẽ được xác nhận lại trước khi đặt hàng.</p><div class="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]"><div><h2 class="text-lg font-bold">Chọn linh kiện</h2>@if (loading()) { <div class="mt-4 h-48 animate-pulse rounded-2xl bg-surface-alt"></div> } @else { <div class="mt-4 grid gap-3 sm:grid-cols-2">@for (product of products(); track product.id) { <article class="rounded-xl border border-line bg-surface p-4"><p class="text-xs font-bold text-muted">{{ product.category.name }} · {{ product.brand.name }}</p><h3 class="mt-1 font-bold">{{ product.name }}</h3><div class="mt-3 flex flex-wrap gap-2">@for (variant of product.variants; track variant.id) { <button type="button" class="rounded-lg border border-line px-3 py-2 text-left text-sm hover:border-primary" (click)="add(variant.id)"><span class="block font-semibold">{{ variant.variationLabel ?? variant.sku }}</span><span class="text-muted">{{ variant.sellingPrice | vnd }}</span></button> }</div></article> }</div> }</div><aside class="h-fit rounded-2xl border border-line bg-surface p-5 shadow-card"><h2 class="text-lg font-extrabold">Cấu hình hiện tại</h2>@if (!preview().lines.length) { <p class="mt-4 text-sm text-muted">Chưa có linh kiện nào được chọn.</p> } @else { <ul class="mt-4 space-y-3">@for (line of preview().lines; track line.skuId) { <li class="flex gap-3 text-sm"><div class="min-w-0 flex-1"><p class="font-semibold">{{ line.name }}</p><p class="text-muted">{{ line.quantity }} × {{ line.unitPrice | vnd }}</p></div><button type="button" class="text-danger" (click)="remove(line.skuId)">Xóa</button></li> }</ul><div class="mt-5 border-t border-line pt-4"><p class="flex justify-between font-extrabold"><span>Tạm tính</span><span>{{ preview().total | vnd }}</span></p></div> }<p class="mt-5 rounded-xl bg-surface-alt p-3 text-xs leading-5 text-muted">Đây là công cụ chọn cấu hình, không cam kết tự động tương thích phần cứng. Hãy xem kỹ thông số hoặc liên hệ tư vấn trước khi thanh toán.</p><a routerLink="/gio-hang" class="mt-5 inline-flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground">Tiếp tục đến giỏ hàng</a></aside></div></section>`,
})
export class CustomBuildPageComponent {
  private readonly catalog = inject(CatalogService);
  private readonly api = inject(ApiClientService);
  protected readonly products = signal<readonly CatalogProduct[]>([]);
  protected readonly preview = signal<BuildPreview>({ lines: [], total: '0' });
  protected readonly loading = signal(true);
  private readonly lines = signal<readonly { skuId: number; quantity: number }[]>([]);

  constructor() { void this.load(); }

  protected add(skuId: number): void {
    const existing = this.lines().find((line) => line.skuId === skuId);
    this.lines.update((lines) => existing ? lines.map((line) => line.skuId === skuId ? { ...line, quantity: line.quantity + 1 } : line) : [...lines, { skuId, quantity: 1 }]);
    void this.refreshPreview();
  }

  protected remove(skuId: number): void {
    this.lines.update((lines) => lines.filter((line) => line.skuId !== skuId));
    void this.refreshPreview();
  }

  private async load(): Promise<void> {
    try { this.products.set(await this.catalog.list()); } finally { this.loading.set(false); }
  }

  private async refreshPreview(): Promise<void> {
    if (!this.lines().length) { this.preview.set({ lines: [], total: '0' }); return; }
    const response = await this.api.post<BuildPreview>('/pc-builds/preview', { lines: this.lines() });
    if (response.success) this.preview.set(response.data);
  }
}
