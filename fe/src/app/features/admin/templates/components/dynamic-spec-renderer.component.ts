import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
import { SpecAttribute, normalizeSpecSchema } from '../../categories/services/admin-category.service';

@Component({
  selector: 'app-dynamic-spec-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent],
  template: `
    <div class="space-y-4">
      @if (effectiveSchema().length === 0) {
        <div class="p-6 text-center text-xs text-muted italic bg-surface-alt/40 border border-dashed border-line rounded">
          Danh mục này chưa cấu hình thông số kỹ thuật động hoặc chưa chọn danh mục.
        </div>
      } @else {
        <div class="divide-y divide-line/50">
          @for (attr of effectiveSchema(); track attr.key) {
            <div class="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
              <div class="sm:col-span-5">
                <label class="block font-semibold text-foreground text-xs leading-normal">
                  <span class="inline">{{ attr.label }}</span>
                  @if (attr.unit) {
                    <span class="text-muted font-normal whitespace-nowrap ml-1">({{ attr.unit }})</span>
                  }
                  @if (attr.required) {
                    <span class="text-danger ml-0.5" title="Bắt buộc">*</span>
                  }
                  @if (attr.isDeprecated) {
                    <span class="ml-1 px-1.5 py-0.5 rounded bg-surface-alt border border-line text-muted text-xs font-normal whitespace-nowrap">Ngưng dùng</span>
                  }
                </label>
              </div>

              <div class="sm:col-span-7">
                @switch (attr.type) {
                  @case ('text') {
                    <input
                      type="text"
                      [disabled]="readonly()"
                      [value]="getSpecValue(attr.key)"
                      (input)="onTextInput(attr.key, $event)"
                      [placeholder]="'Nhập ' + attr.label.toLowerCase() + '...'"
                      class="w-full px-3 py-1.5 bg-surface border rounded text-foreground focus:outline-none text-sm font-medium transition-colors"
                      [class.border-danger]="hasError(attr.key)"
                      [class.focus:border-danger]="hasError(attr.key)"
                      [class.ring-1]="hasError(attr.key)"
                      [class.ring-danger]="hasError(attr.key)"
                      [class.border-line]="!hasError(attr.key)"
                      [class.focus:border-primary]="!hasError(attr.key)"
                    />
                  }

                  @case ('number') {
                    <div class="relative">
                      <input
                        type="number"
                        [disabled]="readonly()"
                        [value]="getSpecValue(attr.key)"
                        (input)="onNumberInput(attr.key, $event)"
                        placeholder="0"
                        class="w-full px-3 py-1.5 bg-surface border rounded text-foreground tabular focus:outline-none text-sm font-medium transition-colors"
                        [class.border-danger]="hasError(attr.key)"
                        [class.focus:border-danger]="hasError(attr.key)"
                        [class.ring-1]="hasError(attr.key)"
                        [class.ring-danger]="hasError(attr.key)"
                        [class.border-line]="!hasError(attr.key)"
                        [class.focus:border-primary]="!hasError(attr.key)"
                      />
                      @if (attr.unit) {
                        <span class="absolute right-3 top-2 text-xs text-muted pointer-events-none tabular">
                          {{ attr.unit }}
                        </span>
                      }
                    </div>
                  }

                  @case ('select') {
                    <app-select
                      [options]="getSelectOptions(attr)"
                      [value]="getSelectValue(attr.key)"
                      (valueChange)="onSelectOptionChange(attr.key, $event)"
                      [disabled]="readonly()"
                      size="sm"
                      [ariaLabel]="attr.label"
                      [class]="hasError(attr.key) ? 'border-danger ring-1 ring-danger rounded' : ''"
                    />
                  }

                  @case ('boolean') {
                    <label class="inline-flex items-center gap-2 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        [disabled]="readonly()"
                        [checked]="Boolean(getSpecValue(attr.key))"
                        (change)="onBooleanChange(attr.key, $event)"
                        class="rounded text-primary focus:ring-0 w-4 h-4 bg-surface border-line"
                      />
                      <span class="text-xs text-foreground font-medium">Có hỗ trợ</span>
                    </label>
                  }
                }

                @if (hasError(attr.key)) {
                  <p class="text-xs text-danger mt-1 font-medium">{{ getErrorMessage(attr.key) }}</p>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (extraSpecKeys().length > 0) {
        <div class="pt-4 mt-4 border-t border-line space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              Thông Số Bổ Sung Ngoài Schema
            </h3>
            <span class="text-[11px] text-muted">({{ extraSpecKeys().length }} thông số)</span>
          </div>

          <div class="divide-y divide-line/40 bg-surface-alt/20 rounded border border-line p-3">
            @for (extraKey of extraSpecKeys(); track extraKey) {
              <div class="py-2 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                <div class="sm:col-span-5 flex items-center justify-between gap-2">
                  <span class="text-xs font-medium text-foreground truncate" [title]="extraKey">
                    {{ extraKey }}
                  </span>
                  @if (!readonly()) {
                    <button
                      type="button"
                      (click)="removeExtraSpec(extraKey)"
                      class="text-xs text-danger hover:underline font-normal"
                      title="Xóa thông số này"
                    >
                      Xóa
                    </button>
                  }
                </div>
                <div class="sm:col-span-7">
                  <input
                    type="text"
                    [disabled]="readonly()"
                    [value]="getSpecValue(extraKey)"
                    (input)="onTextInput(extraKey, $event)"
                    placeholder="Giá trị..."
                    class="w-full px-3 py-1.5 bg-surface border border-line rounded text-foreground focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                  />
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (!readonly()) {
        <div class="pt-2 flex items-center gap-2">
          @if (!showAddExtraField()) {
            <button
              type="button"
              (click)="showAddExtraField.set(true)"
              class="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1"
            >
              + Thêm thông số kỹ thuật tùy biến
            </button>
          } @else {
            <div class="p-3 bg-surface border border-line rounded-md w-full space-y-2">
              <div class="text-xs font-semibold text-foreground">Thêm thông số mới</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  [value]="newExtraKey()"
                  (input)="newExtraKey.set($any($event.target).value)"
                  placeholder="Mã/Tên thông số (VD: bus_ram, port_type)"
                  class="px-2.5 py-1.5 bg-surface border border-line rounded text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  [value]="newExtraValue()"
                  (input)="newExtraValue.set($any($event.target).value)"
                  placeholder="Giá trị"
                  class="px-2.5 py-1.5 bg-surface border border-line rounded text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div class="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  (click)="cancelAddExtra()"
                  class="px-2.5 py-1 text-xs text-muted hover:text-foreground border border-line rounded"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  (click)="confirmAddExtra()"
                  class="px-2.5 py-1 text-xs bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90"
                >
                  Xác nhận thêm
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSpecRendererComponent {
  readonly schema = input<SpecAttribute[]>([]);
  readonly specValues = model<Record<string, unknown>>({});
  readonly specErrors = input<Record<string, string>>({});
  readonly readonly = input<boolean>(false);

  readonly fieldChange = output<string>();

  protected readonly showAddExtraField = signal<boolean>(false);
  protected readonly newExtraKey = signal<string>('');
  protected readonly newExtraValue = signal<string>('');

  protected Boolean = Boolean;

  readonly effectiveSchema = computed<SpecAttribute[]>(() => {
    return normalizeSpecSchema(this.schema());
  });

  readonly schemaKeySet = computed<Set<string>>(() => {
    const set = new Set<string>();
    for (const attr of this.effectiveSchema()) {
      if (attr.key) {
        set.add(attr.key.toLowerCase());
      }
    }
    return set;
  });

  readonly extraSpecKeys = computed<string[]>(() => {
    const values = this.specValues() ?? {};
    const schemaKeys = this.schemaKeySet();
    const result: string[] = [];

    for (const rawKey of Object.keys(values)) {
      if (!schemaKeys.has(rawKey.toLowerCase())) {
        result.push(rawKey);
      }
    }
    return result;
  });

  hasError(key: string): boolean {
    const errors = this.specErrors();
    return Boolean(errors && (errors[key] || errors[key.toLowerCase()]));
  }

  getErrorMessage(key: string): string {
    const errors = this.specErrors();
    return (errors && (errors[key] || errors[key.toLowerCase()])) || '';
  }

  getSpecValue(key: string): unknown {
    const values = this.specValues() ?? {};
    if (key in values) {
      return values[key] ?? '';
    }
    const lowerKey = key.toLowerCase();
    for (const existingKey of Object.keys(values)) {
      if (existingKey.toLowerCase() === lowerKey) {
        return values[existingKey] ?? '';
      }
    }
    return '';
  }

  onTextInput(key: string, event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const current = { ...(this.specValues() ?? {}) };
    current[key] = inputEl.value;
    this.specValues.set(current);
    this.fieldChange.emit(key);
  }

  onNumberInput(key: string, event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const current = { ...(this.specValues() ?? {}) };
    const val = inputEl.value.trim();
    current[key] = val === '' ? null : Number(val);
    this.specValues.set(current);
    this.fieldChange.emit(key);
  }

  getSelectOptions(attr: SpecAttribute): readonly SelectOption[] {
    return [
      { value: '', label: `-- Chọn ${attr.label} --` },
      ...(attr.options || []).map((opt) => ({ value: opt, label: opt })),
    ];
  }

  getSelectValue(key: string): string {
    const val = this.getSpecValue(key);
    return val !== null && val !== undefined ? String(val) : '';
  }

  onSelectOptionChange(key: string, value: string): void {
    const current = { ...(this.specValues() ?? {}) };
    current[key] = value;
    this.specValues.set(current);
    this.fieldChange.emit(key);
  }

  onBooleanChange(key: string, event: Event): void {
    const checkEl = event.target as HTMLInputElement;
    const current = { ...(this.specValues() ?? {}) };
    current[key] = checkEl.checked;
    this.specValues.set(current);
    this.fieldChange.emit(key);
  }

  removeExtraSpec(key: string): void {
    const current = { ...(this.specValues() ?? {}) };
    delete current[key];
    this.specValues.set(current);
  }

  cancelAddExtra(): void {
    this.showAddExtraField.set(false);
    this.newExtraKey.set('');
    this.newExtraValue.set('');
  }

  confirmAddExtra(): void {
    const key = this.newExtraKey().trim();
    const val = this.newExtraValue().trim();
    if (!key) {
      return;
    }
    const current = { ...(this.specValues() ?? {}) };
    current[key] = val;
    this.specValues.set(current);
    this.cancelAddExtra();
  }
}
