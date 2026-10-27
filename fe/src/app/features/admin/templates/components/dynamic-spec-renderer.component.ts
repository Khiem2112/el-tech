import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
import { SpecAttribute } from '../../categories/services/admin-category.service';

@Component({
  selector: 'app-dynamic-spec-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent],
  template: `
    <div class="space-y-1">
      @if (schema().length === 0) {
        <div class="p-6 text-center text-xs text-muted italic bg-surface-alt/40 border border-dashed border-line rounded">
          Danh mục này chưa cấu hình thông số kỹ thuật động hoặc chưa chọn danh mục.
        </div>
      } @else {
        <div class="divide-y divide-line/50">
          @for (attr of schema(); track attr.key) {
            <div class="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
              <div class="sm:col-span-4">
                <label class="block font-semibold text-foreground text-xs">
                  {{ attr.label }}
                  @if (attr.unit) {
                    <span class="text-muted font-normal">({{ attr.unit }})</span>
                  }
                  @if (attr.required) {
                    <span class="text-destructive ml-0.5" title="Bắt buộc">*</span>
                  }
                  @if (attr.isDeprecated) {
                    <span class="ml-1 px-1.5 py-0.5 rounded bg-surface-alt border border-line text-muted text-xs font-normal">Ngưng dùng</span>
                  }
                </label>
                <div class="text-xs text-muted/70">{{ attr.key }}</div>
              </div>

              <div class="sm:col-span-8">
                @switch (attr.type) {
                  @case ('text') {
                    <input
                      type="text"
                      [disabled]="readonly()"
                      [value]="getSpecValue(attr.key)"
                      (input)="onTextInput(attr.key, $event)"
                      [placeholder]="'Nhập ' + attr.label.toLowerCase() + '...'"
                      class="w-full px-3 py-1.5 bg-surface border border-line/70 rounded text-foreground focus:outline-none focus:border-primary text-sm font-medium transition-colors"
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
                        class="w-full px-3 py-1.5 bg-surface border border-line/70 rounded text-foreground tabular focus:outline-none focus:border-primary text-sm font-medium transition-colors"
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
  readonly readonly = input<boolean>(false);

  protected Boolean = Boolean;

  getSpecValue(key: string): unknown {
    const values = this.specValues() ?? {};
    return values[key] ?? '';
  }

  onTextInput(key: string, event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const current = { ...(this.specValues() ?? {}) };
    current[key] = inputEl.value;
    this.specValues.set(current);
  }

  onNumberInput(key: string, event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const current = { ...(this.specValues() ?? {}) };
    const val = inputEl.value.trim();
    current[key] = val === '' ? null : Number(val);
    this.specValues.set(current);
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
  }

  onBooleanChange(key: string, event: Event): void {
    const checkEl = event.target as HTMLInputElement;
    const current = { ...(this.specValues() ?? {}) };
    current[key] = checkEl.checked;
    this.specValues.set(current);
  }
}
