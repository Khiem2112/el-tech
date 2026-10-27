import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { AppIconModule } from '../icon/icon.module';
import { cn } from '../../../lib/cn';

export type SelectOption = {
  value: string;
  label: string;
  count?: number;
  description?: string;
};

export type SelectSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule, CdkConnectedOverlay, CdkOverlayOrigin, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative inline-block w-full">
      <button
        #trigger
        type="button"
        cdkOverlayOrigin
        #origin="cdkOverlayOrigin"
        [class]="triggerClasses()"
        [class.border-primary]="isOpen()"
        [class.ring-1]="isOpen()"
        [class.ring-primary]="isOpen()"
        [disabled]="disabled()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-label]="ariaLabel() || placeholder()"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)"
      >
        <span class="truncate text-left" [class.text-muted]="!selectedOption()">
          {{ displayLabel() }}
        </span>
        <lucide-icon
          name="chevron-down"
          class="size-4 shrink-0 text-muted transition-transform duration-200"
          [class.rotate-180]="isOpen()"
          [class.text-primary]="isOpen()"
          aria-hidden="true"
        ></lucide-icon>
      </button>

      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayOpen]="isOpen()"
        [cdkConnectedOverlayPositions]="overlayPositions"
        [cdkConnectedOverlayMinWidth]="triggerWidth()"
        (overlayOutsideClick)="close()"
        (detach)="close()"
      >
        <div
          class="z-50 overflow-hidden rounded-md border border-line bg-surface text-foreground shadow-card-hover animate-in fade-in-0 zoom-in-95"
          [style.minWidth.px]="triggerWidth()"
        >
          @if (searchable()) {
            <div class="border-b border-line p-2 bg-surface-alt">
              <div class="relative flex items-center">
                <lucide-icon
                  name="search"
                  class="absolute left-2.5 size-3.5 text-muted pointer-events-none"
                  aria-hidden="true"
                ></lucide-icon>
                <input
                  #searchInput
                  type="text"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchChange($event)"
                  (keydown)="onSearchKeydown($event)"
                  [placeholder]="searchPlaceholder()"
                  class="w-full rounded border border-line bg-surface py-1.5 pl-8 pr-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          }

          <div
            role="listbox"
            tabindex="-1"
            class="max-h-60 overflow-y-auto custom-scrollbar p-1"
          >
            @for (option of filteredOptions(); track option.value; let idx = $index) {
              <div
                role="option"
                [attr.aria-selected]="option.value === value()"
                class="flex cursor-pointer items-center justify-between rounded px-2.5 py-1.5 text-sm transition-colors"
                [class.bg-surface-alt]="highlightedIndex() === idx"
                [class.text-primary]="option.value === value()"
                [class.font-bold]="option.value === value()"
                [class.text-foreground]="option.value !== value() && highlightedIndex() !== idx"
                (mouseenter)="highlightedIndex.set(idx)"
                (click)="selectOption(option)"
              >
                <div class="flex flex-col min-w-0 pr-2">
                  <span class="truncate">{{ option.label }}</span>
                  @if (option.description) {
                    <span class="text-xs text-muted truncate">{{ option.description }}</span>
                  }
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  @if (option.count !== undefined) {
                    <span class="rounded bg-surface-alt px-1.5 py-0.5 text-xs text-muted tabular">
                      {{ option.count }}
                    </span>
                  }
                  @if (option.value === value()) {
                    <lucide-icon name="check" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  }
                </div>
              </div>
            } @empty {
              <div class="px-3 py-4 text-center text-sm text-muted">
                Không tìm thấy tùy chọn phù hợp
              </div>
            }
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  public readonly options = input<readonly SelectOption[]>([]);
  public readonly placeholder = input<string>('Chọn...');
  public readonly searchable = input<boolean>(false);
  public readonly searchPlaceholder = input<string>('Tìm kiếm...');
  public readonly disabled = input<boolean>(false);
  public readonly size = input<SelectSize>('md');
  public readonly customClass = input<string>('', { alias: 'class' });
  public readonly ariaLabel = input<string>('');

  public readonly value = model<string>('');

  protected readonly isOpen = signal<boolean>(false);
  protected readonly searchQuery = signal<string>('');
  protected readonly highlightedIndex = signal<number>(-1);
  protected readonly triggerWidth = signal<number>(200);

  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly overlayPositions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 4,
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -4,
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 4,
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -4,
    },
  ];

  protected readonly selectedOption = computed(() => {
    const val = this.value();
    return this.options().find((item) => item.value === val) ?? null;
  });

  protected readonly displayLabel = computed(() => {
    const opt = this.selectedOption();
    return opt ? opt.label : this.placeholder();
  });

  protected readonly filteredOptions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const opts = this.options();
    if (!query) {
      return opts;
    }
    return opts.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.description && opt.description.toLowerCase().includes(query)),
    );
  });

  protected readonly triggerClasses = computed(() => {
    const base =
      'flex w-full items-center justify-between gap-2 rounded-md border border-line bg-surface font-medium text-foreground transition-all duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

    const sizes: Record<SelectSize, string> = {
      sm: 'h-8 px-2.5 text-sm',
      md: 'h-9 px-3 text-sm',
      lg: 'h-10 px-3.5 text-base',
    };

    return cn(base, sizes[this.size()], this.customClass());
  });

  public writeValue(val: string): void {
    this.value.set(val || '');
  }

  public registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState?(_isDisabled: boolean): void {
    // Disabled state is controlled via disabled input signal
  }

  public toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    if (this.disabled()) {
      return;
    }
    this.updateTriggerWidth();
    this.searchQuery.set('');
    this.highlightInitialOption();
    this.isOpen.set(true);

    if (this.searchable()) {
      setTimeout(() => {
        this.searchInputRef()?.nativeElement.focus();
      }, 0);
    }
  }

  public close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.onTouched();
    this.triggerRef()?.nativeElement.focus();
  }

  public selectOption(option: SelectOption): void {
    this.value.set(option.value);
    this.onChange(option.value);
    this.close();
  }

  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.highlightedIndex.set(this.filteredOptions().length > 0 ? 0 : -1);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else {
          this.navigateHighlight(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else {
          this.navigateHighlight(-1);
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close();
        }
        break;
    }
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateHighlight(-1);
        break;
      case 'Enter': {
        event.preventDefault();
        const options = this.filteredOptions();
        const index = this.highlightedIndex();
        if (index >= 0 && index < options.length) {
          this.selectOption(options[index]);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  private navigateHighlight(step: number): void {
    const list = this.filteredOptions();
    if (list.length === 0) {
      return;
    }
    const current = this.highlightedIndex();
    let next = current + step;
    if (next < 0) {
      next = list.length - 1;
    } else if (next >= list.length) {
      next = 0;
    }
    this.highlightedIndex.set(next);
  }

  private highlightInitialOption(): void {
    const currentVal = this.value();
    const index = this.filteredOptions().findIndex((item) => item.value === currentVal);
    this.highlightedIndex.set(index >= 0 ? index : 0);
  }

  private updateTriggerWidth(): void {
    const triggerEl = this.triggerRef()?.nativeElement;
    if (triggerEl) {
      this.triggerWidth.set(Math.max(triggerEl.offsetWidth, 180));
    }
  }
}
