import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../../lib/cn';

@Component({
  selector: 'input[appInput], select[appInput], textarea[appInput]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `<ng-content />`,
})
export class InputDirective {
  public readonly customClass = input<string>('', { alias: 'class' });

  protected readonly hostClasses = computed(() => {
    const base = 'w-full h-9 px-3 text-sm rounded-md border border-line bg-surface text-foreground transition-colors placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:bg-surface-alt';

    return cn(base, this.customClass());
  });
}
