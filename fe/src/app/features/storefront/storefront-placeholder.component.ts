import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type PageData = { title: string; description: string };

@Component({ selector: 'app-storefront-placeholder', imports: [RouterLink], changeDetection: ChangeDetectionStrategy.OnPush, template: `<section class="mx-auto flex min-h-[55vh] max-w-3xl items-center px-4 py-16 sm:px-6"><div class="w-full rounded-3xl border border-line bg-surface p-8 shadow-card"><p class="text-xs font-extrabold tracking-[0.16em] text-primary">EL-TECH</p><h1 class="mt-3 text-3xl font-extrabold">{{ page().title }}</h1><p class="mt-4 leading-7 text-muted">{{ page().description }}</p><a class="mt-7 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" routerLink="/">Về trang chủ</a></div></section>` })
export class StorefrontPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly page = (): PageData => this.route.snapshot.data as PageData;
}
