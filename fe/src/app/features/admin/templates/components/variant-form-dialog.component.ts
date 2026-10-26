import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
import {
  AdminProductTemplateService,
  CreateProductVariantPayload,
  ProductLifecycle,
  ProductVariantItem,
  UpdateProductVariantPayload,
} from '../services/admin-product-template.service';

@Component({
  selector: 'app-variant-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonDirective, SelectComponent],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div data-modal-id="MOD-04" class="bg-surface border border-line rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-sm text-foreground">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-base">
                {{ isEditing() ? 'Chỉnh Sửa Biến Thể SKU' : 'Thêm Biến Thể SKU Mới' }}
              </h3>
              <p class="text-xs text-muted">
                Cấu hình thông tin thương mại, giá niêm yết và quy định serial
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          @if (formError()) {
            <div class="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
              {{ formError() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="space-y-3 bg-surface-alt p-4 rounded border border-line">
              <div class="border-b border-line pb-1.5">
                <span class="font-bold text-foreground text-xs uppercase tracking-wider">Thông Tin Thương Mại</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-muted uppercase text-xs mb-1">
                    Mã SKU <span class="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    [value]="sku()"
                    (input)="sku.set($any($event.target).value)"
                    placeholder="VD: VGA-RTX5090-O24G-BLACK"
                    class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-mono font-bold focus:outline-none focus:border-primary text-sm"
                  />
                  <p class="text-xs text-muted mt-0.5">Duy nhất trên toàn hệ thống.</p>
                </div>

                <div>
                  <label class="block font-semibold text-muted uppercase text-xs mb-1">
                    Mã Vạch Barcode
                  </label>
                  <input
                    type="text"
                    [value]="barcode()"
                    (input)="barcode.set($any($event.target).value)"
                    placeholder="VD: 4711081992011"
                    class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-mono focus:outline-none focus:border-primary text-sm"
                  />
                  <p class="text-xs text-muted mt-0.5">Tùy chọn, duy nhất nếu có nhập.</p>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-muted uppercase text-xs mb-1">
                  Nhãn Biến Thể / Phiên Bản
                </label>
                <input
                  type="text"
                  [value]="variationLabel()"
                  (input)="variationLabel.set($any($event.target).value)"
                  placeholder="VD: Bản OC Edition - Màu Đen"
                  class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-semibold focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-muted uppercase text-xs mb-1">
                    Giá Bán Niêm Yết (VND) <span class="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    [value]="sellingPrice()"
                    (input)="sellingPrice.set(+$any($event.target).value)"
                    placeholder="59990000"
                    class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground font-mono font-bold focus:outline-none focus:border-primary text-sm"
                  />
                  <p class="text-xs text-muted mt-0.5">Số nguyên dương VND, đã bao gồm VAT.</p>
                </div>

                <div>
                  <label class="block font-semibold text-muted uppercase text-xs mb-1">
                    Trạng Thái Kinh Doanh
                  </label>
                  <app-select
                    [options]="lifecycleOptions"
                    [value]="lifecycleState()"
                    (valueChange)="onLifecycleSelectChange($event)"
                    placeholder="Chọn trạng thái"
                  />
                </div>
              </div>

              <div class="pt-2">
                <label class="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    [checked]="serialRequired()"
                    (change)="serialRequired.set($any($event.target).checked)"
                    class="rounded text-primary focus:ring-0 w-4 h-4 bg-surface border-line"
                  />
                  <div>
                    <span class="font-bold text-foreground text-xs">Bắt buộc quản lý số Serial từng chiếc</span>
                    <p class="text-xs text-muted">Áp dụng cho linh kiện điện tử có số sê-ri bảo hành độc lập.</p>
                  </div>
                </label>
              </div>
            </div>

            <div class="space-y-3 bg-surface-alt p-4 rounded border border-line">
              <div class="border-b border-line pb-1.5">
                <span class="font-bold text-foreground text-xs uppercase tracking-wider">Thông Số Kỹ Thuật Riêng Của Biến Thể</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-muted uppercase text-xs mb-1">Màu Sắc</label>
                  <input
                    type="text"
                    [value]="specColor()"
                    (input)="specColor.set($any($event.target).value)"
                    placeholder="VD: Đen, Trắng, Bạc"
                    class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-muted uppercase text-xs mb-1">Ghi Chú Thông Số Riêng</label>
                  <input
                    type="text"
                    [value]="specNote()"
                    (input)="specNote.set($any($event.target).value)"
                    placeholder="VD: Xung nhịp OC, Cổng kết nối riêng"
                    class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                appButton
                variant="outline"
                size="sm"
                (click)="onCancel()"
              >
                Hủy
              </button>
              <button
                type="submit"
                appButton
                variant="primary"
                size="sm"
                [disabled]="isSubmitting()"
                class="disabled:opacity-50"
              >
                {{ isSubmitting() ? 'Đang lưu...' : (isEditing() ? 'Cập Nhật Biến Thể' : 'Thêm Biến Thể') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantFormDialogComponent {
  private readonly templateService = inject(AdminProductTemplateService);

  readonly isOpen = input<boolean>(false);
  readonly variant = input<ProductVariantItem | null>(null);
  readonly productTemplateId = input<number>(0);

  readonly close = output<void>();
  readonly saved = output<void>();

  readonly sku = signal<string>('');
  readonly barcode = signal<string>('');
  readonly variationLabel = signal<string>('');
  readonly sellingPrice = signal<number>(0);
  readonly serialRequired = signal<boolean>(false);
  readonly lifecycleState = signal<ProductLifecycle>('DRAFT');
  readonly specColor = signal<string>('');
  readonly specNote = signal<string>('');

  readonly formError = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  readonly isEditing = signal<boolean>(false);

  readonly lifecycleOptions: SelectOption[] = [
    { value: 'DRAFT', label: 'Bản thảo nội bộ' },
    { value: 'ACTIVE', label: 'Đang kinh doanh' },
    { value: 'PAUSED', label: 'Tạm dừng kinh doanh' },
    { value: 'DISCONTINUED', label: 'Ngừng kinh doanh' },
  ];

  constructor() {
    effect(() => {
      const v = this.variant();
      if (v) {
        this.isEditing.set(true);
        this.sku.set(v.sku);
        this.barcode.set(v.barcode ?? '');
        this.variationLabel.set(v.variationLabel ?? '');
        this.sellingPrice.set(Number(v.sellingPrice));
        this.serialRequired.set(v.serialRequired);
        this.lifecycleState.set(v.lifecycleState);

        const spec = v.variantSpec ?? {};
        this.specColor.set(typeof spec['color'] === 'string' ? spec['color'] : '');
        this.specNote.set(typeof spec['note'] === 'string' ? spec['note'] : '');
      } else {
        this.isEditing.set(false);
        this.sku.set('');
        this.barcode.set('');
        this.variationLabel.set('');
        this.sellingPrice.set(0);
        this.serialRequired.set(false);
        this.lifecycleState.set('DRAFT');
        this.specColor.set('');
        this.specNote.set('');
      }
      this.formError.set(null);
    });
  }

  onCancel(): void {
    this.close.emit();
  }

  onLifecycleSelectChange(value: string | number): void {
    this.lifecycleState.set(value as ProductLifecycle);
  }

  async onSubmit(): Promise<void> {
    const trimmedSku = this.sku().trim();
    if (!trimmedSku) {
      this.formError.set('Vui lòng nhập mã SKU');
      return;
    }

    const price = Number(this.sellingPrice());
    if (isNaN(price) || price <= 0 || !Number.isInteger(price)) {
      this.formError.set('Giá bán phải là số nguyên dương VND');
      return;
    }

    const templateId = this.productTemplateId();
    if (!templateId) {
      this.formError.set('Không xác định được mẫu sản phẩm liên kết');
      return;
    }

    this.isSubmitting.set(true);
    this.formError.set(null);

    const variantSpec: Record<string, unknown> = {};
    if (this.specColor().trim()) {
      variantSpec['color'] = this.specColor().trim();
    }
    if (this.specNote().trim()) {
      variantSpec['note'] = this.specNote().trim();
    }

    try {
      const currentVariant = this.variant();
      if (this.isEditing() && currentVariant) {
        const payload: UpdateProductVariantPayload = {
          sku: trimmedSku,
          barcode: this.barcode().trim() || null,
          variationLabel: this.variationLabel().trim() || null,
          sellingPrice: price,
          serialRequired: this.serialRequired(),
          lifecycleState: this.lifecycleState(),
          variantSpec,
        };
        await this.templateService.updateVariant(currentVariant.id, payload);
      } else {
        const payload: CreateProductVariantPayload = {
          productTemplateId: templateId,
          sku: trimmedSku,
          barcode: this.barcode().trim() || null,
          variationLabel: this.variationLabel().trim() || null,
          sellingPrice: price,
          serialRequired: this.serialRequired(),
          lifecycleState: this.lifecycleState(),
          variantSpec,
        };
        await this.templateService.createVariant(payload);
      }

      this.saved.emit();
      this.close.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu biến thể SKU';
      this.formError.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
