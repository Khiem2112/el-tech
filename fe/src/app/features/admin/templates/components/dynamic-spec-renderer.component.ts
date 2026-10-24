import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpecAttribute } from '../../categories/services/admin-category.service';

@Component({
  selector: 'app-dynamic-spec-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      @if (schema().length === 0) {
        <div class="p-4 bg-[#090d16] border border-dashed border-[#272f3d] rounded text-xs text-slate-400 text-center">
          Danh mục này chưa được cấu hình thông số kỹ thuật động hoặc chưa chọn danh mục.
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (attr of schema(); track attr.key) {
            <div [class.md:col-span-2]="attr.type === 'text' && attr.key.includes('description')">
              <label class="block font-semibold text-slate-400 text-xs uppercase mb-1">
                {{ attr.label }}
                @if (attr.unit) {
                  <span class="text-slate-500 font-normal">({{ attr.unit }})</span>
                }
                @if (attr.required) {
                  <span class="text-rose-500 ml-0.5">*</span>
                }
                @if (attr.isDeprecated) {
                  <span class="ml-1 px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 text-[10px]">Lỗi thời</span>
                }
              </label>

              @switch (attr.type) {
                @case ('text') {
                  <input
                    type="text"
                    [disabled]="readonly()"
                    [value]="getSpecValue(attr.key)"
                    (input)="onTextInput(attr.key, $event)"
                    [placeholder]="'Nhập ' + attr.label.toLowerCase() + '...'"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] text-sm"
                  />
                }

                @case ('number') {
                  <div class="relative">
                    <input
                      type="number"
                      [disabled]="readonly()"
                      [value]="getSpecValue(attr.key)"
                      (input)="onNumberInput(attr.key, $event)"
                      [placeholder]="'0'"
                      class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white font-mono focus:outline-none focus:border-[#76b900] text-sm"
                    />
                    @if (attr.unit) {
                      <span class="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none font-mono">
                        {{ attr.unit }}
                      </span>
                    }
                  </div>
                }

                @case ('select') {
                  <select
                    [disabled]="readonly()"
                    [value]="getSpecValue(attr.key)"
                    (change)="onSelectChange(attr.key, $event)"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] text-sm"
                  >
                    <option value="">-- Chọn {{ attr.label }} --</option>
                    @for (opt of attr.options; track opt) {
                      <option [value]="opt">{{ opt }}</option>
                    }
                  </select>
                }

                @case ('boolean') {
                  <div class="pt-2">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        [disabled]="readonly()"
                        [checked]="Boolean(getSpecValue(attr.key))"
                        (change)="onBooleanChange(attr.key, $event)"
                        class="rounded text-[#76b900] focus:ring-0 w-4 h-4 bg-[#090d16] border-[#272f3d]"
                      />
                      <span class="text-xs text-slate-300 font-medium">Bật / Có hỗ trợ</span>
                    </label>
                  </div>
                }
              }

              @if (attr.required) {
                <p class="text-[11px] text-slate-500 mt-1">Trường bắt buộc theo cấu trúc danh mục.</p>
              }
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

  onSelectChange(key: string, event: Event): void {
    const selectEl = event.target as HTMLSelectElement;
    const current = { ...(this.specValues() ?? {}) };
    current[key] = selectEl.value;
    this.specValues.set(current);
  }

  onBooleanChange(key: string, event: Event): void {
    const checkEl = event.target as HTMLInputElement;
    const current = { ...(this.specValues() ?? {}) };
    current[key] = checkEl.checked;
    this.specValues.set(current);
  }
}
