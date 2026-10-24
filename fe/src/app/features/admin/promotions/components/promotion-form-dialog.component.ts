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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { z } from 'zod';
import { AdminCategoryService } from '../../categories/services/admin-category.service';
import { AdminVariantService } from '../../variants/services/admin-variant.service';
import {
  AdminProductPromotion,
  AdminPromotionService,
  CreatePromotionPayload,
  PromotionDiscountType,
  UpdatePromotionPayload,
} from '../services/admin-promotion.service';

type SkuTargetItem = {
  id: number;
  sku: string;
  name: string;
};

type CategoryTargetItem = {
  id: number;
  name: string;
};

const promotionFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Tên chương trình khuyến mãi tối thiểu 2 ký tự')
      .max(200, 'Tên chương trình khuyến mãi tối đa 200 ký tự'),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    discountValue: z.coerce.number().positive('Giá trị giảm giá phải lớn hơn 0'),
    isExclusive: z.boolean(),
    effectiveFrom: z.string().min(1, 'Vui lòng chọn ngày bắt đầu hiệu lực'),
    effectiveTo: z.string().min(1, 'Vui lòng chọn ngày kết thúc hiệu lực'),
    isActive: z.boolean(),
    scope: z.enum(['SKU', 'CATEGORY']),
  })
  .superRefine((data, ctx) => {
    const fromTime = new Date(data.effectiveFrom).getTime();
    const toTime = new Date(data.effectiveTo).getTime();

    if (toTime <= fromTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['effectiveTo'],
        message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu',
      });
    }

    if (data.discountType === 'PERCENTAGE') {
      if (data.discountValue < 1 || data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Mức giảm phần trăm phải từ 1% đến 100%',
        });
      }
    } else if (data.discountType === 'FIXED_AMOUNT') {
      if (!Number.isInteger(data.discountValue) || data.discountValue < 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Mức giảm số tiền phải là số nguyên tối thiểu 1.000 VNĐ',
        });
      }
    }
  });

function formatIsoToDateInput(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-promotion-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-dialog-title"
      >
        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-sm text-white"
          (click)="$event.stopPropagation()"
        >
          <header class="p-5 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0">
            <div>
              <h2 id="promo-dialog-title" class="font-bold text-white uppercase text-base tracking-wide">
                {{ isEditMode() ? 'Chỉnh Sửa Khuyến Mãi Sản Phẩm' : 'Thêm Mới Khuyến Mãi Sản Phẩm' }}
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Thiết lập chương trình giảm giá tự động theo danh mục hoặc danh sách SKU (MOD-33)
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f3d] transition-colors"
              title="Đóng hộp thoại"
              aria-label="Đóng hộp thoại"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="overflow-y-auto p-5 flex-1 space-y-4">
            @if (errorMessage()) {
              <div class="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {{ errorMessage() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate id="promo-form">
              <div>
                <label for="promo-name" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                  Tên chương trình khuyến mãi <span class="text-rose-400">*</span>
                </label>
                <input
                  id="promo-name"
                  type="text"
                  formControlName="name"
                  placeholder="Ví dụ: Đại Tiệc RTX 50 Series - Giảm Trực Tiếp 1.000.000đ"
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded-md font-semibold text-white text-sm focus:outline-none focus:border-[#76b900] transition-colors"
                />
                @if (fieldError('name')) {
                  <p class="text-rose-400 text-xs mt-1">{{ fieldError('name') }}</p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="promo-discount-type" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                    Loại giảm giá <span class="text-rose-400">*</span>
                  </label>
                  <select
                    id="promo-discount-type"
                    formControlName="discountType"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded-md text-white text-sm focus:outline-none focus:border-[#76b900] transition-colors font-semibold"
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label for="promo-discount-value" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                    Mức giảm ({{ form.get('discountType')?.value === 'PERCENTAGE' ? '%' : 'VNĐ' }}) <span class="text-rose-400">*</span>
                  </label>
                  <input
                    id="promo-discount-value"
                    type="number"
                    formControlName="discountValue"
                    [placeholder]="form.get('discountType')?.value === 'PERCENTAGE' ? 'Ví dụ: 10' : 'Ví dụ: 500000'"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded-md font-bold tabular-nums text-white text-sm focus:outline-none focus:border-[#76b900] transition-colors"
                  />
                  @if (fieldError('discountValue')) {
                    <p class="text-rose-400 text-xs mt-1">{{ fieldError('discountValue') }}</p>
                  }
                </div>
              </div>

              <div class="space-y-3 border-t border-b border-[#272f3d] py-3.5">
                <span class="block font-semibold text-slate-300 text-xs uppercase">
                  Phạm vi áp dụng <span class="text-rose-400">*</span>
                </span>
                <div class="grid grid-cols-2 gap-3">
                  <label
                    class="flex items-center gap-2.5 p-3 rounded-md border cursor-pointer transition-colors"
                    [class.border-[#76b900]]="form.get('scope')?.value === 'CATEGORY'"
                    [class.bg-[#76b900]/10]="form.get('scope')?.value === 'CATEGORY'"
                    [class.border-[#272f3d]]="form.get('scope')?.value !== 'CATEGORY'"
                    [class.bg-[#090d16]]="form.get('scope')?.value !== 'CATEGORY'"
                  >
                    <input
                      type="radio"
                      formControlName="scope"
                      value="CATEGORY"
                      class="text-[#76b900] focus:ring-[#76b900]"
                    />
                    <div>
                      <div class="font-bold text-white text-sm">Theo danh mục</div>
                      <div class="text-[11px] text-slate-400">Áp dụng toàn bộ linh kiện thuộc ngành hàng</div>
                    </div>
                  </label>

                  <label
                    class="flex items-center gap-2.5 p-3 rounded-md border cursor-pointer transition-colors"
                    [class.border-[#76b900]]="form.get('scope')?.value === 'SKU'"
                    [class.bg-[#76b900]/10]="form.get('scope')?.value === 'SKU'"
                    [class.border-[#272f3d]]="form.get('scope')?.value !== 'SKU'"
                    [class.bg-[#090d16]]="form.get('scope')?.value !== 'SKU'"
                  >
                    <input
                      type="radio"
                      formControlName="scope"
                      value="SKU"
                      class="text-[#76b900] focus:ring-[#76b900]"
                    />
                    <div>
                      <div class="font-bold text-white text-sm">Theo danh sách SKU</div>
                      <div class="text-[11px] text-slate-400">Chỉ định chính xác biến thể phần cứng</div>
                    </div>
                  </label>
                </div>

                @if (form.get('scope')?.value === 'CATEGORY') {
                  <div class="p-3 bg-[#090d16] rounded-md border border-[#272f3d] space-y-2">
                    <label for="select-cat-picker" class="block font-semibold text-slate-300 text-xs uppercase">
                      Chọn danh mục áp dụng:
                    </label>
                    <div class="flex gap-2">
                      <select
                        id="select-cat-picker"
                        #catPicker
                        class="flex-1 px-3 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white text-sm focus:outline-none focus:border-[#76b900]"
                      >
                        <option value="">-- Chọn ngành hàng --</option>
                        @for (cat of availableCategories(); track cat.id) {
                          <option [value]="cat.id">{{ cat.name }}</option>
                        }
                      </select>
                      <button
                        type="button"
                        (click)="onAddCategory(catPicker.value); catPicker.value = ''"
                        class="px-3 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors"
                      >
                        Thêm
                      </button>
                    </div>

                    @if (selectedCategories().length > 0) {
                      <div class="flex flex-wrap gap-1.5 pt-1">
                        @for (item of selectedCategories(); track item.id) {
                          <span class="px-2 py-1 bg-[#161b26] border border-[#272f3d] rounded flex items-center gap-2 text-xs">
                            <span class="text-white font-medium">{{ item.name }}</span>
                            <button
                              type="button"
                              (click)="onRemoveCategory(item.id)"
                              class="text-slate-400 hover:text-rose-400"
                              title="Xóa danh mục"
                            >
                              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        }
                      </div>
                    } @else {
                      <p class="text-amber-400 text-xs">Chưa chọn danh mục ngành hàng nào.</p>
                    }
                  </div>
                }

                @if (form.get('scope')?.value === 'SKU') {
                  <div class="p-3 bg-[#090d16] rounded-md border border-[#272f3d] space-y-2">
                    <label for="select-sku-picker" class="block font-semibold text-slate-300 text-xs uppercase">
                      Chọn SKU biến thể áp dụng:
                    </label>
                    <div class="flex gap-2">
                      <select
                        id="select-sku-picker"
                        #skuPicker
                        class="flex-1 px-3 py-1.5 bg-[#161b26] border border-[#272f3d] rounded text-white text-sm focus:outline-none focus:border-[#76b900]"
                      >
                        <option value="">-- Chọn SKU linh kiện --</option>
                        @for (v of availableVariants(); track v.id) {
                          <option [value]="v.id">
                            {{ v.sku }} - {{ v.productTemplate.name }} {{ v.variationLabel ? '(' + v.variationLabel + ')' : '' }}
                          </option>
                        }
                      </select>
                      <button
                        type="button"
                        (click)="onAddSku(skuPicker.value); skuPicker.value = ''"
                        class="px-3 py-1.5 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors"
                      >
                        Thêm
                      </button>
                    </div>

                    @if (selectedSkus().length > 0) {
                      <div class="flex flex-wrap gap-1.5 pt-1">
                        @for (skuItem of selectedSkus(); track skuItem.id) {
                          <span class="px-2 py-1 bg-[#161b26] border border-[#272f3d] rounded flex items-center gap-2 font-mono text-xs">
                            <strong class="text-[#76b900]">{{ skuItem.sku }}</strong>
                            <span class="text-slate-300 font-sans truncate max-w-[200px]">{{ skuItem.name }}</span>
                            <button
                              type="button"
                              (click)="onRemoveSku(skuItem.id)"
                              class="text-slate-400 hover:text-rose-400"
                              title="Xóa SKU"
                            >
                              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        }
                      </div>
                    } @else {
                      <p class="text-amber-400 text-xs">Chưa chọn SKU biến thể linh kiện nào.</p>
                    }
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="promo-effective-from" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                    Từ ngày <span class="text-rose-400">*</span>
                  </label>
                  <input
                    id="promo-effective-from"
                    type="date"
                    formControlName="effectiveFrom"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded-md text-white text-sm focus:outline-none focus:border-[#76b900] transition-colors"
                  />
                  @if (fieldError('effectiveFrom')) {
                    <p class="text-rose-400 text-xs mt-1">{{ fieldError('effectiveFrom') }}</p>
                  }
                </div>

                <div>
                  <label for="promo-effective-to" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                    Đến ngày <span class="text-rose-400">*</span>
                  </label>
                  <input
                    id="promo-effective-to"
                    type="date"
                    formControlName="effectiveTo"
                    class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded-md text-white text-sm focus:outline-none focus:border-[#76b900] transition-colors"
                  />
                  @if (fieldError('effectiveTo')) {
                    <p class="text-rose-400 text-xs mt-1">{{ fieldError('effectiveTo') }}</p>
                  }
                </div>
              </div>

              <div class="space-y-3 pt-1">
                <label class="flex items-start gap-3 p-3 bg-[#090d16] rounded-md border border-[#272f3d] cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="isExclusive"
                    class="mt-0.5 text-[#76b900] focus:ring-[#76b900] rounded"
                  />
                  <div>
                    <span class="font-bold text-white text-sm">Áp dụng độc quyền</span>
                    <p class="text-xs text-slate-400 mt-0.5">
                      Nếu bật, sản phẩm này không được áp dụng đồng thời với bất kỳ mã coupon giảm giá đơn hàng nào khác.
                    </p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3 bg-[#090d16] rounded-md border border-[#272f3d] cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="isActive"
                    class="mt-0.5 text-[#76b900] focus:ring-[#76b900] rounded"
                  />
                  <div>
                    <span class="font-bold text-white text-sm">Kích hoạt chương trình</span>
                    <p class="text-xs text-slate-400 mt-0.5">
                      Chương trình sẽ tự động có hiệu lực giảm giá cho khách hàng trong khoảng thời gian đã định.
                    </p>
                  </div>
                </label>
              </div>
            </form>
          </div>

          <footer class="p-5 border-t border-[#272f3d] flex items-center justify-end gap-3 flex-shrink-0 bg-[#161b26]">
            <button
              type="button"
              (click)="onClose()"
              class="px-4 py-2 bg-[#272f3d] hover:bg-slate-700 text-slate-200 font-semibold rounded-md text-sm transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              form="promo-form"
              [disabled]="isSaving()"
              class="px-5 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:opacity-50 text-[#090d16] font-bold rounded-md shadow-sm text-sm transition-colors flex items-center gap-2"
            >
              @if (isSaving()) {
                <span class="w-4 h-4 border-2 border-[#090d16] border-t-transparent rounded-full animate-spin"></span>
                <span>Đang Lưu...</span>
              } @else {
                <span>Lưu Khuyến Mãi</span>
              }
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly promotionService = inject(AdminPromotionService);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly variantService = inject(AdminVariantService);

  readonly isOpen = input<boolean>(false);
  readonly promotion = input<AdminProductPromotion | null>(null);

  readonly closeDialog = output<void>();
  readonly saveSuccess = output<AdminProductPromotion>();

  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedSkus = signal<SkuTargetItem[]>([]);
  readonly selectedCategories = signal<CategoryTargetItem[]>([]);

  readonly availableCategories = computed(() => this.categoryService.categories());
  readonly availableVariants = signal<
    { id: number; sku: string; variationLabel: string | null; productTemplate: { name: string } }[]
  >([]);

  readonly isEditMode = computed(() => Boolean(this.promotion()?.id));

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    discountType: ['PERCENTAGE', [Validators.required]],
    discountValue: [10, [Validators.required, Validators.min(1)]],
    isExclusive: [false],
    effectiveFrom: ['', [Validators.required]],
    effectiveTo: ['', [Validators.required]],
    isActive: [true],
    scope: ['CATEGORY', [Validators.required]],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadReferenceData();
        this.resetFormWithPromotion(this.promotion());
      }
    });
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen() && !this.isSaving()) {
      this.onClose();
    }
  }

  private async loadReferenceData(): Promise<void> {
    if (this.categoryService.categories().length === 0) {
      await this.categoryService.loadCategories({ isActive: true });
    }

    try {
      const res = await this.variantService.loadVariants({ limit: 100 });
      this.availableVariants.set(res.items);
    } catch {
      // Catalog variants loading fallback
    }
  }

  private resetFormWithPromotion(promo: AdminProductPromotion | null): void {
    this.errorMessage.set(null);

    if (promo) {
      const effectiveScope = promo.scope === 'SKU' ? 'SKU' : 'CATEGORY';
      this.form.reset({
        name: promo.name,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        isExclusive: promo.isExclusive,
        effectiveFrom: formatIsoToDateInput(promo.effectiveFrom),
        effectiveTo: formatIsoToDateInput(promo.effectiveTo),
        isActive: promo.isActive,
        scope: effectiveScope,
      });

      this.selectedSkus.set(
        promo.skuTargets.map((s) => ({
          id: s.skuId,
          sku: s.sku,
          name: s.productName,
        })),
      );

      this.selectedCategories.set(
        promo.categoryTargets.map((c) => ({
          id: c.categoryId,
          name: c.name,
        })),
      );
    } else {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);

      this.form.reset({
        name: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isExclusive: false,
        effectiveFrom: formatIsoToDateInput(today.toISOString()),
        effectiveTo: formatIsoToDateInput(nextMonth.toISOString()),
        isActive: true,
        scope: 'CATEGORY',
      });

      this.selectedSkus.set([]);
      this.selectedCategories.set([]);
    }
  }

  onAddCategory(categoryIdStr: string): void {
    const catId = Number(categoryIdStr);
    if (!catId) return;

    const cat = this.availableCategories().find((c) => c.id === catId);
    if (!cat) return;

    if (!this.selectedCategories().some((c) => c.id === catId)) {
      this.selectedCategories.update((list) => [...list, { id: cat.id, name: cat.name }]);
    }
  }

  onRemoveCategory(id: number): void {
    this.selectedCategories.update((list) => list.filter((c) => c.id !== id));
  }

  onAddSku(skuIdStr: string): void {
    const skuId = Number(skuIdStr);
    if (!skuId) return;

    const variant = this.availableVariants().find((v) => v.id === skuId);
    if (!variant) return;

    if (!this.selectedSkus().some((s) => s.id === skuId)) {
      this.selectedSkus.update((list) => [
        ...list,
        { id: variant.id, sku: variant.sku, name: variant.productTemplate.name },
      ]);
    }
  }

  onRemoveSku(id: number): void {
    this.selectedSkus.update((list) => list.filter((s) => s.id !== id));
  }

  fieldError(field: string): string | null {
    const ctrl = this.form.get(field);
    if (ctrl && ctrl.touched && ctrl.errors) {
      if (ctrl.errors['required']) return 'Trường này là bắt buộc';
      if (ctrl.errors['minlength']) return 'Độ dài tối thiểu không đạt';
      if (ctrl.errors['maxlength']) return 'Độ dài vượt quá giới hạn cho phép';
      if (ctrl.errors['min']) return 'Giá trị phải lớn hơn 0';
    }
    return null;
  }

  onClose(): void {
    this.errorMessage.set(null);
    this.closeDialog.emit();
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    this.errorMessage.set(null);

    const rawValue = this.form.getRawValue();
    const validationResult = promotionFormSchema.safeParse(rawValue);

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      this.errorMessage.set(firstIssue?.message ?? 'Dữ liệu nhập chưa hợp lệ');
      return;
    }

    const {
      name,
      discountType,
      discountValue,
      isExclusive,
      effectiveFrom,
      effectiveTo,
      isActive,
      scope,
    } = validationResult.data;

    const skuIds = this.selectedSkus().map((s) => s.id);
    const categoryIds = this.selectedCategories().map((c) => c.id);

    if (scope === 'SKU' && skuIds.length === 0) {
      this.errorMessage.set('Vui lòng chọn ít nhất một biến thể SKU áp dụng');
      return;
    }

    if (scope === 'CATEGORY' && categoryIds.length === 0) {
      this.errorMessage.set('Vui lòng chọn ít nhất một danh mục ngành hàng áp dụng');
      return;
    }

    const fromDate = new Date(effectiveFrom);
    const toDate = new Date(effectiveTo);
    toDate.setHours(23, 59, 59, 999);

    if (toDate.getTime() <= fromDate.getTime()) {
      this.errorMessage.set('Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
      return;
    }

    this.isSaving.set(true);

    try {
      let savedPromotion: AdminProductPromotion;
      const currentPromo = this.promotion();

      if (currentPromo) {
        const updatePayload: UpdatePromotionPayload = {
          name,
          discountType: discountType as PromotionDiscountType,
          discountValue,
          isExclusive,
          effectiveFrom: fromDate.toISOString(),
          effectiveTo: toDate.toISOString(),
          isActive,
          scope,
          skuIds: scope === 'SKU' ? skuIds : [],
          categoryIds: scope === 'CATEGORY' ? categoryIds : [],
        };
        savedPromotion = await this.promotionService.updatePromotion(currentPromo.id, updatePayload);
      } else {
        const createPayload: CreatePromotionPayload = {
          name,
          discountType: discountType as PromotionDiscountType,
          discountValue,
          isExclusive,
          effectiveFrom: fromDate.toISOString(),
          effectiveTo: toDate.toISOString(),
          isActive,
          scope,
          skuIds: scope === 'SKU' ? skuIds : [],
          categoryIds: scope === 'CATEGORY' ? categoryIds : [],
        };
        savedPromotion = await this.promotionService.createPromotion(createPayload);
      }

      this.saveSuccess.emit(savedPromotion);
      this.onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu chương trình khuyến mãi';
      this.errorMessage.set(msg);
    } finally {
      this.isSaving.set(false);
    }
  }
}
