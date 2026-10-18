import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({ selector: 'app-not-found-page', imports: [RouterLink], changeDetection: ChangeDetectionStrategy.OnPush, template: `<main class="mx-auto flex min-h-screen max-w-3xl items-center px-4"><section class="rounded-3xl border border-line bg-surface p-8 shadow-card"><p class="text-sm font-bold text-primary">404</p><h1 class="mt-2 text-3xl font-extrabold">Trang này không tồn tại hoặc đã được di chuyển</h1><p class="mt-3 leading-6 text-muted">Bạn có thể tiếp tục tìm sản phẩm hoặc quay về trang chủ. Dữ liệu của bạn không bị thay đổi.</p><div class="mt-6 flex gap-3"><a class="rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground" routerLink="/">Về trang chủ</a><a class="rounded-xl border border-line px-5 py-3 text-sm font-bold" routerLink="/san-pham">Xem sản phẩm</a></div></section></main>` })
export class NotFoundPageComponent {}
