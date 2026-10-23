import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminCategory,
  AdminCategoryService,
  SpecAttribute,
} from '../services/admin-category.service';

type EditableAttribute = SpecAttribute & {
  isOriginal: boolean;
  optionsText: string;
};

@Component({
  selector: 'app-spec-schema-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen() && category()) {
      <div
        class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'spec-sheet-title'"
      >
        <div
          class="relative bg-[#161b26] border-l border-[#272f3d] shadow-2xl w-full max-w-2xl h-full flex flex-col text-xs text-white"
          (click)="$event.stopPropagation()"
        >
          <div class="h-14 px-6 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
            <div>
              <h2 id="spec-sheet-title" class="font-bold text-white uppercase text-sm tracking-wide">
                Cấu Hình Thuộc Tính Kỹ Thuật Động
              </h2>
              <p class="text-xs text-slate-400">
                Ngành hàng: <strong class="text-[#76b900]">{{ category()?.name }}</strong> (Phiên bản schema: v{{ category()?.specificationSchemaVersion }})
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Đóng bảng trượt"
              aria-label="Đóng bảng trượt"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-4 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <svg class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong class="font-bold">Quy tắc CAT-009:</strong>
              Khóa cứng không cho xóa hoặc đổi kiểu dữ liệu đối với các trường thông số kỹ thuật đã có mẫu sản phẩm sử dụng (hiện có {{ hasProducts() ? category()?.productTemplateCount : 0 }} mẫu). Chỉ cho phép đánh dấu ngưng kích hoạt hoặc bổ sung thuộc tính mới.
            </div>
          </div>

          @if (errorMessage()) {
            <div class="m-4 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {{ errorMessage() }}
            </div>
          }

          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-white uppercase tracking-wider text-xs">
                  Danh Sách Thuộc Tính Kỹ Thuật (v{{ category()?.specificationSchemaVersion }})
                </span>
                <span class="text-slate-400 ml-2">({{ attributes().length }} trường)</span>
              </div>
              <button
                type="button"
                (click)="addNewAttribute()"
                class="px-3 py-1.5 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded font-semibold text-xs text-white transition-colors inline-flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5 text-[#76b900]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Thêm Thuộc Tính</span>
              </button>
            </div>

            @if (attributes().length === 0) {
              <div class="p-8 text-center border border-dashed border-[#272f3d] rounded-lg text-slate-400">
                <p>Chưa có thuộc tính kỹ thuật nào được cấu hình cho ngành hàng này.</p>
                <p class="text-[11px] text-slate-500 mt-1">Bấm "+ Thêm Thuộc Tính" để bắt đầu khai báo schema thông số kỹ thuật.</p>
              </div>
            }

            <div class="space-y-3">
              @for (attr of attributes(); track attr.key + '-' + $index; let i = $index) {
                <div class="p-4 bg-[#090d16] border border-[#272f3d] rounded-lg space-y-3">
                  <div class="flex items-center justify-between gap-3 border-b border-[#272f3d] pb-2.5">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-white text-sm">
                        {{ attr.label || 'Chưa đặt tên nhãn' }}
                      </span>
                      <span class="px-2 py-0.5 rounded font-mono text-[10px] bg-[#161b26] border border-[#272f3d] text-slate-300">
                        {{ attr.key || 'key-chua-dat' }}
                      </span>
                      @if (isAttributeLocked(attr)) {
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          ĐÃ KHÓA (CAT-009)
                        </span>
                      }
                      @if (attr.isDeprecated) {
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          NGƯNG DÙNG
                        </span>
                      }
                    </div>

                    <div class="flex items-center gap-2">
                      @if (!isAttributeLocked(attr)) {
                        <button
                          type="button"
                          (click)="removeAttribute(i)"
                          class="p-1 rounded text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Xóa thuộc tính này"
                          aria-label="Xóa thuộc tính này"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      }
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label class="block font-semibold text-slate-400 text-[10px] uppercase mb-1">
                        Khóa định danh (Key) <span class="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="attr.key"
                        [disabled]="isAttributeLocked(attr)"
                        placeholder="vram_capacity"
                        class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded font-mono text-white placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#76b900]"
                      />
                    </div>

                    <div>
                      <label class="block font-semibold text-slate-400 text-[10px] uppercase mb-1">
                        Nhãn hiển thị tiếng Việt <span class="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="attr.label"
                        placeholder="Dung lượng VRAM"
                        class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                      />
                    </div>

                    <div>
                      <label class="block font-semibold text-slate-400 text-[10px] uppercase mb-1">
                        Kiểu dữ liệu <span class="text-rose-400">*</span>
                      </label>
                      <select
                        [(ngModel)]="attr.type"
                        [disabled]="isAttributeLocked(attr)"
                        class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#76b900]"
                      >
                        <option value="text">Văn bản (Text / String)</option>
                        <option value="number">Số lượng / Giá trị số (Number)</option>
                        <option value="boolean">Đúng / Sai (Boolean)</option>
                        <option value="select">Danh sách lựa chọn (Select / Enum)</option>
                      </select>
                    </div>

                    <div>
                      <label class="block font-semibold text-slate-400 text-[10px] uppercase mb-1">
                        Đơn vị đo lường (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="attr.unit"
                        placeholder="GB, MHz, W, mm,..."
                        class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                      />
                    </div>
                  </div>

                  @if (attr.type === 'select') {
                    <div>
                      <label class="block font-semibold text-slate-400 text-[10px] uppercase mb-1">
                        Các giá trị lựa chọn (Cách nhau bởi dấu phẩy)
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="attr.optionsText"
                        (ngModelChange)="onOptionTextChanged(attr)"
                        placeholder="PCIe 4.0, PCIe 5.0"
                        class="w-full px-2.5 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                      />
                    </div>
                  }

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#272f3d]/60 text-[11px]">
                    <label class="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        [(ngModel)]="attr.required"
                        class="w-3.5 h-3.5 rounded bg-[#161b26] border-[#272f3d] text-[#76b900] focus:ring-0"
                      />
                      <span>Bắt buộc nhập</span>
                    </label>

                    <label class="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        [(ngModel)]="attr.filterable"
                        class="w-3.5 h-3.5 rounded bg-[#161b26] border-[#272f3d] text-[#76b900] focus:ring-0"
                      />
                      <span>Bộ lọc tìm kiếm</span>
                    </label>

                    <label class="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        [(ngModel)]="attr.comparable"
                        class="w-3.5 h-3.5 rounded bg-[#161b26] border-[#272f3d] text-[#76b900] focus:ring-0"
                      />
                      <span>Bảng so sánh</span>
                    </label>

                    <label class="flex items-center gap-1.5 text-amber-400 cursor-pointer">
                      <input
                        type="checkbox"
                        [(ngModel)]="attr.isDeprecated"
                        class="w-3.5 h-3.5 rounded bg-[#161b26] border-[#272f3d] text-amber-500 focus:ring-0"
                      />
                      <span>Ngưng dùng</span>
                    </label>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="h-16 px-6 border-t border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#090d16]">
            <span class="text-slate-400 text-xs">
              Lưu cấu hình sẽ tự động tăng phiên bản schema lên <strong class="text-[#76b900]">v{{ (category()?.specificationSchemaVersion || 1) + 1 }}</strong>
            </span>
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="onClose()"
                [disabled]="isSaving()"
                class="px-4 py-2 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] rounded font-semibold text-white transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                (click)="onSave()"
                [disabled]="isSaving()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                @if (isSaving()) {
                  <span class="inline-block w-3.5 h-3.5 border-2 border-[#090d16] border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang lưu...</span>
                } @else {
                  <span>Lưu Cấu Hình (v{{ (category()?.specificationSchemaVersion || 1) + 1 }})</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecSchemaSheetComponent {
  private readonly categoryService = inject(AdminCategoryService);

  readonly isOpen = input<boolean>(false);
  readonly category = input<AdminCategory | null>(null);

  readonly closeSheet = output<void>();
  readonly saved = output<AdminCategory>();

  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly attributes = signal<EditableAttribute[]>([]);

  readonly hasProducts = computed(() => {
    const cat = this.category();
    return Boolean(cat && cat.productTemplateCount > 0);
  });

  constructor() {
    effect(() => {
      const cat = this.category();
      if (cat) {
        const schema = cat.specificationSchema || [];
        const editable: EditableAttribute[] = schema.map((attr) => ({
          ...attr,
          isOriginal: true,
          optionsText: (attr.options || []).join(', '),
        }));
        this.attributes.set(editable);
      } else {
        this.attributes.set([]);
      }
      this.errorMessage.set(null);
    });
  }

  @HostListener('window:keydown.escape')
  handleEscape(): void {
    if (this.isOpen() && !this.isSaving()) {
      this.onClose();
    }
  }

  isAttributeLocked(attr: EditableAttribute): boolean {
    return attr.isOriginal && this.hasProducts();
  }

  addNewAttribute(): void {
    const nextIndex = this.attributes().length + 1;
    const newAttr: EditableAttribute = {
      key: `custom_spec_${nextIndex}`,
      label: `Thuộc tính mới ${nextIndex}`,
      type: 'text',
      unit: null,
      required: false,
      filterable: false,
      comparable: false,
      options: [],
      optionsText: '',
      isDeprecated: false,
      isOriginal: false,
    };
    this.attributes.update((list) => [...list, newAttr]);
  }

  removeAttribute(index: number): void {
    const target = this.attributes()[index];
    if (target && this.isAttributeLocked(target)) {
      this.errorMessage.set('Thuộc tính đã có sản phẩm sử dụng, không thể xóa theo quy tắc CAT-009');
      return;
    }
    this.attributes.update((list) => list.filter((_, i) => i !== index));
  }

  onOptionTextChanged(attr: EditableAttribute): void {
    attr.options = attr.optionsText
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  onClose(): void {
    this.errorMessage.set(null);
    this.closeSheet.emit();
  }

  async onSave(): Promise<void> {
    const cat = this.category();
    if (!cat) {
      return;
    }

    const rawList = this.attributes();

    for (const item of rawList) {
      if (!item.key || !item.key.trim()) {
        this.errorMessage.set('Khóa định danh (key) của mỗi thuộc tính không được để trống');
        return;
      }
      if (!/^[a-z0-9_]+$/.test(item.key.trim().toLowerCase())) {
        this.errorMessage.set(
          `Khóa "${item.key}" không hợp lệ. Chỉ chấp nhận chữ thường không dấu, số và gạch dưới`,
        );
        return;
      }
      if (!item.label || !item.label.trim()) {
        this.errorMessage.set(`Vui lòng nhập nhãn hiển thị cho thuộc tính "${item.key}"`);
        return;
      }
    }

    const keys = rawList.map((item) => item.key.trim().toLowerCase());
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      this.errorMessage.set('Các khóa định danh (key) trong danh sách không được trùng lặp');
      return;
    }

    const payloadAttributes: SpecAttribute[] = rawList.map((item) => ({
      key: item.key.trim().toLowerCase(),
      label: item.label.trim(),
      type: item.type,
      unit: item.unit ? item.unit.trim() : null,
      required: Boolean(item.required),
      filterable: Boolean(item.filterable),
      comparable: Boolean(item.comparable),
      options: item.type === 'select' ? item.options : [],
      isDeprecated: Boolean(item.isDeprecated),
    }));

    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const updated = await this.categoryService.updateSpecSchema(cat.id, {
        specificationSchema: payloadAttributes,
      });
      this.saved.emit(updated);
      this.onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu cấu hình thuộc tính kỹ thuật';
      this.errorMessage.set(message);
    } finally {
      this.isSaving.set(false);
    }
  }
}
