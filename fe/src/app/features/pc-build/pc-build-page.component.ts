import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VndPipe } from '../../lib/vnd.pipe';
import { ApiClientService } from '../../core/api/api-client.service';

type Bundle = { id: number; name: string; slug: string; description: string | null; build: { total: string; lines: readonly { sku: string; name: string; quantity: number; unitPrice: string }[] } };

@Component({ selector: 'app-pc-build-page', imports: [RouterLink, VndPipe], changeDetection: ChangeDetectionStrategy.OnPush, template: `<section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p class="text-xs font-extrabold tracking-[.16em] text-primary">VIRTUAL PC BUNDLES</p><h1 class="mt-2 text-3xl font-extrabold">PC dựng sẵn</h1><p class="mt-3 max-w-2xl text-muted">Mỗi cấu hình được tạo từ linh kiện thực tế; tồn kho được xác nhận lại theo từng component khi checkout.</p>@if (loading()) { <div class="mt-8 grid gap-4 md:grid-cols-2">@for (item of [1,2]; track item) { <div class="h-56 animate-pulse rounded-2xl bg-surface-alt"></div> }</div> } @else if (error()) { <div class="mt-8 rounded-xl bg-danger/10 p-5" role="alert">Không thể tải cấu hình. <button class="font-bold underline" type="button" (click)="load()">Thử lại</button></div> } @else { <div class="mt-8 grid gap-5 md:grid-cols-2">@for (bundle of bundles(); track bundle.id) { <article class="rounded-2xl border border-line bg-surface p-6 shadow-card"><h2 class="text-xl font-bold">{{ bundle.name }}</h2><p class="mt-2 text-sm text-muted">{{ bundle.description }}</p><ul class="mt-5 space-y-2 text-sm">@for (line of bundle.build.lines; track line.sku) { <li>{{ line.name }} ×{{ line.quantity }}</li> }</ul><p class="mt-6 text-2xl font-extrabold">{{ bundle.build.total | vnd }}</p><a class="mt-4 inline-flex rounded-lg border border-line px-4 py-2 text-sm font-bold hover:border-primary" routerLink="/tu-lap-pc">Tùy chỉnh cấu hình</a></article> }</div> }</section>` })
export class PcBuildPageComponent {
  private readonly api = inject(ApiClientService); protected readonly bundles = signal<readonly Bundle[]>([]); protected readonly loading = signal(true); protected readonly error = signal(false);
  constructor() { void this.load(); }
  protected async load(): Promise<void> { this.loading.set(true); this.error.set(false); try { const result = await this.api.get<readonly Bundle[]>('/pc-bundles'); if (!result.success) throw new Error(result.error.code); this.bundles.set(result.data); } catch { this.error.set(true); } finally { this.loading.set(false); } }
}
