import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-admin-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (total() > 0) {
      <div
        class="px-4 py-3 bg-surface-alt border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
      >
        <div class="text-muted text-center sm:text-left">
          Hiển thị
          <strong class="text-foreground tabular-nums">{{ startItem() }}</strong>
          -
          <strong class="text-foreground tabular-nums">{{ endItem() }}</strong>
          trong tổng số
          <strong class="text-foreground tabular-nums">{{ total() }}</strong>
          {{ itemName() }}
        </div>

        <div class="flex items-center gap-1 flex-wrap justify-center">
          <button
            type="button"
            [disabled]="page() <= 1 || isLoading()"
            (click)="prevPage()"
            class="px-2.5 py-1 bg-surface hover:bg-surface-alt border border-line rounded disabled:opacity-40 disabled:cursor-not-allowed text-foreground transition-colors font-medium text-xs cursor-pointer"
            aria-label="Trang trước"
          >
            Trước
          </button>

          @for (item of pageNumbers(); track $index) {
            @if (item === 'ellipsis') {
              <span class="px-1.5 py-1 text-muted select-none text-xs">...</span>
            } @else {
              <button
                type="button"
                [disabled]="isLoading()"
                (click)="goToPage(item)"
                class="min-w-7 h-7 sm:min-w-8 sm:h-8 px-2 rounded border text-xs font-bold transition-colors cursor-pointer tabular-nums disabled:opacity-50"
                [class.border-primary]="page() === item"
                [class.bg-primary]="page() === item"
                [class.text-primary-foreground]="page() === item"
                [class.border-line]="page() !== item"
                [class.bg-surface]="page() !== item"
                [class.text-foreground]="page() !== item"
                [class.hover:bg-surface-alt]="page() !== item"
                [attr.aria-current]="page() === item ? 'page' : null"
                [attr.aria-label]="'Trang ' + item"
              >
                {{ item }}
              </button>
            }
          }

          <button
            type="button"
            [disabled]="page() >= totalPages() || isLoading()"
            (click)="nextPage()"
            class="px-2.5 py-1 bg-surface hover:bg-surface-alt border border-line rounded disabled:opacity-40 disabled:cursor-not-allowed text-foreground transition-colors font-medium text-xs cursor-pointer"
            aria-label="Trang sau"
          >
            Sau
          </button>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPaginationComponent {
  readonly page = input<number>(1);
  readonly total = input<number>(0);
  readonly limit = input<number>(10);
  readonly totalPages = input<number>(1);
  readonly itemName = input<string>('bản ghi');
  readonly isLoading = input<boolean>(false);

  readonly pageChange = output<number>();

  readonly startItem = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.limit() + 1
  );

  readonly endItem = computed(() =>
    Math.min(this.page() * this.limit(), this.total())
  );

  readonly pageNumbers = computed<(number | 'ellipsis')[]>(() => {
    const totalP = Math.max(1, this.totalPages());
    const currentP = Math.max(1, Math.min(this.page(), totalP));

    if (totalP <= 7) {
      return Array.from({ length: totalP }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalP);

    for (let i = Math.max(1, currentP - 2); i <= Math.min(totalP, currentP + 2); i++) {
      pages.add(i);
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result: (number | 'ellipsis')[] = [];

    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push('ellipsis');
      }
      result.push(sorted[i]);
    }

    return result;
  });

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages() || p === this.page() || this.isLoading()) {
      return;
    }
    this.pageChange.emit(p);
  }

  prevPage(): void {
    this.goToPage(this.page() - 1);
  }

  nextPage(): void {
    this.goToPage(this.page() + 1);
  }
}

