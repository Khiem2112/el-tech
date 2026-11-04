import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../../lib/cn';

export type BadgeVariant = 'primary' | 'dark' | 'muted' | 'success' | 'outline' | 'danger' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'span[appBadge], div[appBadge]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `<ng-content />`,
})
export class BadgeDirective {
  public readonly variant = input<BadgeVariant>('muted');
  public readonly size = input<BadgeSize>('md');
  public readonly customClass = input<string>('', { alias: 'class' });

  protected readonly hostClasses = computed(() => {
    const base = 'inline-flex items-center rounded-sm font-semibold transition-colors tabular-nums';

    const sizes: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
    };

    const variants: Record<BadgeVariant, string> = {
      primary: 'bg-primary/10 text-primary-strong border border-primary/20',
      dark: 'bg-surface-dark text-white border border-line-dark',
      muted: 'bg-surface-alt text-muted border border-line',
      success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
      outline: 'bg-surface text-foreground border border-line',
      danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
      warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
      info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
    };

    return cn(base, sizes[this.size()], variants[this.variant()], this.customClass());
  });
}
