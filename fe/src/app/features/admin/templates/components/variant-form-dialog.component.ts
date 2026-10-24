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
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-sm text-slate-200">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h3 class="font-bold text-white uppercase text-base">
                {{ isEditing() ? 'Chỉnh Sửa Biến Thể SKU' : 'Thêm Biến Thể SKU Mới' }}
              </h3>
              <p class="text-xs text-slate-400">
                Cấu hình thông tin thương mại, giá niêm yết và quy định serial (MOD-04)
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1.5 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          @if (formError()) {
            <div class="p-3 bg-rose-950/50 border border-rose-800 rounded text-rose-300 text-xs">
              {{ formError() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="space-y-3 bg-[#090d16] p-4 rounded border border-[#272f3d]">
              <div class="border-b border-[#272f3d] pb-1.5">
                <span class="font-bold text-white text-xs uppercase tracking-wider">Thông Tin Thương Mại</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-400 uppercase text-xs mb-1">
                    Mã SKU <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    [value]="sku()"
                    (input)="sku.set($any($event.target).value)"
                    placeholder="VD: VGA-RTX5090-O24G-BLACK"
                    class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white font-mono font-bold focus:outline-none focus:border-[#76b900] text-sm"
                  />
                  <p class="text-[11px] text-slate-500 mt-0.5">Duy nhất trên toàn hệ thống.</p>
                </div>

                <div>
                  <label class="block font-semibold text-slate-400 uppercase text-xs mb-1">
                    Mã Vạch Barcode
                  </label>
                  <input
                    type="text"
                    [value]="barcode()"
                    (input)="barcode.set($any($event.target).value)"
                    placeholder="VD: 4711081992011"
                    class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white font-mono focus:outline-none focus:border-[#76b900] text-sm"
                  />
                  <p class="text-[11px] text-slate-500 mt-0.5">Tùy chọn, duy nhất nếu có nhập.</p>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-400 uppercase text-xs mb-1">
                  Nhãn Biến Thể / Phiên Bản
                </label>
                <input
                  type="text"
                  [value]="variationLabel()"
                  (input)="variationLabel.set($any($event.target).value)"
                  placeholder="VD: Bản OC Edition - Màu Đen"
                  class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white font-semibold focus:outline-none focus:border-[#76b900] text-sm"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-400 uppercase text-xs mb-1">
                    Giá Bán Niêm Yết (VND) <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    [value]="sellingPrice()"
                    (input)="sellingPrice.set(+$any($event.target).value)"
                    placeholder="59990000"
                    class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white font-mono font-bold focus:outline-none focus:border-[#76b900] text-sm"
                  />
                  <p class="text-[11px] text-slate-500 mt-0.5">Số nguyên dương VND, đã bao gồm VAT.</p>
                </div>

                <div>
                  <label class="block font-semibold text-slate-400 uppercase text-xs mb-1">
                    Trạng Thái Kinh Doanh
                  </label>
                  <select
                    [value]="lifecycleState()"
                    (change)="lifecycleState.set($any($event.target).value)"
                    class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] text-sm"
                  >
                    <option value="DRAFT">Bản thảo nội bộ</option>
                    <option value="ACTIVE">Đang kinh doanh</option>
                    <option value="PAUSED">Tạm dừng kinh doanh</option>
                    <option value="DISCONTINUED">Ngừng kinh doanh</option>
                  </select>
                </div>
              </div>

              <div class="pt-2">
                <label class="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    [checked]="serialRequired()"
                    (change)="serialRequired.set($any($event.target).checked)"
                    class="rounded text-[#76b900] focus:ring-0 w-4 h-4 bg-[#161b26] border-[#272f3d]"
                  />
                  <div>
                    <span class="font-bold text-white text-xs">Bắt buộc quản lý số Serial từng chiếc</span>
                    <p class="text-[11px] text-slate-400">Áp dụng cho linh kiện điện tử có số sê-ri bảo hành độc lập.</p>
                  </div>
                </label>
              </div>
            </div>

            <div class="space-y-3 bg-[#090d16] p-4 rounded border border-[#272f3d]">
              <div class="border-b border-[#272f3d] pb-1.5">
                <span class="font-bold text-white text-xs uppercase tracking-wider">Thông Số Kỹ Thuật Riêng Của Biến Thể</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-400 uppercase text-xs mb-1">Màu Sắc</label>
                  <input
                    type="text"
                    [value]="specColor()"
                    (input)="specColor.set($any($event.target).value)"
                    placeholder="VD: Đen, Trắng, Bạc"
                    class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] text-sm"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-400 uppercase text-xs mb-1">Ghi Chú Thông Số Riêng</label>
                  <input
                    type="text"
                    [value]="specNote()"
                    (input)="specNote.set($any($event.target).value)"
                    placeholder="VD: Xung nhịp OC, Cổng kết nối riêng"
                    class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-white focus:outline-none focus:border-[#76b900] text-sm"
                  />
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#272f3d]">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 bg-[#272f3d] hover:bg-[#343e50] text-slate-200 rounded font-semibold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors disabled:opacity-50"
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

  async onSubmit(): Promise<void> {
    const trimmedSku = this.sku().trim();
    if (!trimmedSku) {
      this.formError.set('Vui long nhap ma SKU');
      return;
    }

    const price = Number(this.sellingPrice());
    if (isNaN(price) || price <= 0 || !Number.isInteger(price)) {
      this.formError.set('Gia ban phai la so nguyen duong VND');
      return;
    }

    const templateId = this.productTemplateId();
    if (!templateId) {
      this.formError.set('Khong xac dinh duoc mau san pham lien ket');
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
      const msg = err instanceof Error ? err.message : 'Loi khi luu bien the SKU';
      this.formError.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
