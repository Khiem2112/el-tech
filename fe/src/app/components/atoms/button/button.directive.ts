import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
  template: `<ng-content />`,
})
export class ButtonDirective {
  public readonly variant = input<ButtonVariant>('primary');
  public readonly size = input<ButtonSize>('md');
  public readonly disabled = input<boolean>(false);
  public readonly customClass = input<string>('', { alias: 'class' });

  protected readonly hostClasses = computed(() => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';
    
    const radius = this.variant() === 'icon' || this.size() === 'icon' ? 'rounded-md' : 'rounded-md';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary hover:bg-primary-strong text-primary-foreground font-bold shadow-sm active:scale-[0.99]',
      secondary: 'bg-surface-alt hover:bg-line text-foreground border border-line',
      outline: 'border border-line bg-surface hover:bg-surface-alt hover:border-foreground text-foreground',
      ghost: 'text-muted hover:text-foreground hover:bg-surface-alt',
      danger: 'bg-danger text-white hover:bg-danger/90',
      destructive: 'bg-danger text-white hover:bg-danger/90',
      icon: 'text-muted hover:text-foreground hover:bg-surface-alt border border-transparent hover:border-line',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-8 px-2.5 text-sm gap-1.5',
      md: 'h-9 px-3.5 text-sm gap-2',
      lg: 'h-10 px-4 text-sm gap-2',
      icon: 'h-9 w-9 p-0',
    };

    return cn(base, radius, variants[this.variant()], sizes[this.size()], this.customClass());
  });
}
