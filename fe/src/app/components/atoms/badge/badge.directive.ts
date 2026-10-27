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
      primary: 'bg-primary/15 text-primary-strong border border-primary/30',
      dark: 'bg-surface-dark text-white border border-line',
      muted: 'bg-surface-alt text-muted border border-line',
      success: 'bg-primary text-primary-foreground font-bold',
      outline: 'bg-surface text-foreground border border-line',
      danger: 'bg-danger/15 text-danger border border-danger/30 font-bold',
      warning: 'bg-warning/15 text-warning border border-warning/30 font-bold',
      info: 'bg-surface-alt text-foreground border border-line font-bold',
    };

    return cn(base, sizes[this.size()], variants[this.variant()], this.customClass());
  });
}
