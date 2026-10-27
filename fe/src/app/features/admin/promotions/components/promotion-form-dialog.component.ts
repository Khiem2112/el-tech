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
import {
  SelectComponent,
  SelectOption,
} from '../../../../components/atoms/select/select.component';
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
  imports: [CommonModule, ReactiveFormsModule, SelectComponent],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-dialog-title"
      >
        <div
          class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-sm text-foreground"
          (click)="$event.stopPropagation()"
        >
          <header class="p-4 border-b border-line flex items-center justify-between shrink-0 bg-surface">
            <div>
              <h2 id="promo-dialog-title" class="font-bold text-foreground uppercase text-base tracking-wide">
                {{ isEditMode() ? 'Chỉnh Sửa Khuyến Mãi' : 'Thêm Mới Khuyến Mãi' }}
              </h2>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1 rounded text-muted hover:text-foreground hover:bg-surface-alt transition-colors cursor-pointer"
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
              <div class="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-medium">
                {{ errorMessage() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate id="promo-form">
              <div>
                <label for="promo-name" class="block font-semibold text-foreground text-xs uppercase mb-1">
                  Tên chương trình khuyến mãi <span class="text-rose-500">*</span>
                </label>
                <input
                  id="promo-name"
                  type="text"
                  formControlName="name"
                  placeholder="Ví dụ: Đại Tiệc RTX 50 Series - Giảm Trực Tiếp 1.000.000đ"
                  class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-semibold text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                />
                @if (fieldError('name')) {
                  <p class="text-rose-600 dark:text-rose-400 text-xs mt-1">{{ fieldError('name') }}</p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Loại giảm giá <span class="text-rose-500">*</span>
                  </label>
                  <app-select
                    [options]="discountTypeOptions"
                    [value]="form.get('discountType')?.value"
                    (valueChange)="onDiscountTypeChange($event)"
                    size="md"
                  />
                </div>

                <div>
                  <label for="promo-discount-value" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Mức giảm ({{ form.get('discountType')?.value === 'PERCENTAGE' ? '%' : 'VNĐ' }}) <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="promo-discount-value"
                    type="number"
                    formControlName="discountValue"
                    [placeholder]="form.get('discountType')?.value === 'PERCENTAGE' ? 'Ví dụ: 10' : 'Ví dụ: 500000'"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-bold tabular-nums text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  @if (fieldError('discountValue')) {
                    <p class="text-rose-600 dark:text-rose-400 text-xs mt-1">{{ fieldError('discountValue') }}</p>
                  }
                </div>
              </div>

              <div class="space-y-3 border-t border-b border-line py-3.5">
                <span class="block font-semibold text-foreground text-xs uppercase">
                  Phạm vi áp dụng <span class="text-rose-500">*</span>
                </span>
                <div class="grid grid-cols-2 gap-3">
                  <label
                    class="flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors"
                    [class.border-primary]="form.get('scope')?.value === 'CATEGORY'"
                    [class.bg-primary/5]="form.get('scope')?.value === 'CATEGORY'"
                    [class.border-line]="form.get('scope')?.value !== 'CATEGORY'"
                    [class.bg-surface-alt]="form.get('scope')?.value !== 'CATEGORY'"
                  >
                    <input
                      type="radio"
                      formControlName="scope"
                      value="CATEGORY"
                      class="text-primary focus:ring-primary"
                    />
                    <span class="font-bold text-foreground text-xs uppercase tracking-wide">Theo danh mục</span>
                  </label>

                  <label
                    class="flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors"
                    [class.border-primary]="form.get('scope')?.value === 'SKU'"
                    [class.bg-primary/5]="form.get('scope')?.value === 'SKU'"
                    [class.border-line]="form.get('scope')?.value !== 'SKU'"
                    [class.bg-surface-alt]="form.get('scope')?.value !== 'SKU'"
                  >
                    <input
                      type="radio"
                      formControlName="scope"
                      value="SKU"
                      class="text-primary focus:ring-primary"
                    />
                    <span class="font-bold text-foreground text-xs uppercase tracking-wide">Theo danh sách SKU</span>
                  </label>
                </div>

                @if (form.get('scope')?.value === 'CATEGORY') {
                  <div class="p-3 bg-surface-alt rounded-md border border-line space-y-2">
                    <label class="block font-semibold text-foreground text-xs uppercase">
                      Chọn danh mục áp dụng:
                    </label>
                    <div class="flex gap-2 items-center">
                      <div class="flex-1">
                        <app-select
                          [options]="categoryOptions()"
                          [value]="selectedCatIdToAdd()"
                          (valueChange)="selectedCatIdToAdd.set($event)"
                          placeholder="-- Chọn ngành hàng --"
                          size="sm"
                          [searchable]="true"
                        />
                      </div>
                      <button
                        type="button"
                        (click)="handleAddCategory()"
                        [disabled]="!selectedCatIdToAdd()"
                        class="px-3.5 py-1.5 bg-primary hover:bg-primary-strong disabled:opacity-50 text-primary-foreground font-bold rounded text-xs transition-colors cursor-pointer"
                      >
                        Thêm
                      </button>
                    </div>

                    @if (selectedCategories().length > 0) {
                      <div class="flex flex-wrap gap-1.5 pt-1">
                        @for (item of selectedCategories(); track item.id) {
                          <span class="px-2.5 py-1 bg-surface border border-line rounded flex items-center gap-2 text-xs">
                            <span class="text-foreground font-medium">{{ item.name }}</span>
                            <button
                              type="button"
                              (click)="onRemoveCategory(item.id)"
                              class="text-muted hover:text-rose-600 cursor-pointer"
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
                      <p class="text-amber-600 dark:text-amber-400 text-xs">Chưa chọn danh mục ngành hàng nào.</p>
                    }
                  </div>
                }

                @if (form.get('scope')?.value === 'SKU') {
                  <div class="p-3 bg-surface-alt rounded-md border border-line space-y-2">
                    <label class="block font-semibold text-foreground text-xs uppercase">
                      Chọn SKU biến thể áp dụng:
                    </label>
                    <div class="flex gap-2 items-center">
                      <div class="flex-1">
                        <app-select
                          [options]="skuOptions()"
                          [value]="selectedSkuIdToAdd()"
                          (valueChange)="selectedSkuIdToAdd.set($event)"
                          placeholder="-- Chọn SKU linh kiện --"
                          size="sm"
                          [searchable]="true"
                        />
                      </div>
                      <button
                        type="button"
                        (click)="handleAddSku()"
                        [disabled]="!selectedSkuIdToAdd()"
                        class="px-3.5 py-1.5 bg-primary hover:bg-primary-strong disabled:opacity-50 text-primary-foreground font-bold rounded text-xs transition-colors cursor-pointer"
                      >
                        Thêm
                      </button>
                    </div>

                    @if (selectedSkus().length > 0) {
                      <div class="flex flex-wrap gap-1.5 pt-1">
                        @for (skuItem of selectedSkus(); track skuItem.id) {
                          <span class="px-2.5 py-1 bg-surface border border-line rounded flex items-center gap-2 font-mono text-xs">
                            <strong class="text-primary">{{ skuItem.sku }}</strong>
                            <span class="text-foreground font-sans truncate max-w-[200px]">{{ skuItem.name }}</span>
                            <button
                              type="button"
                              (click)="onRemoveSku(skuItem.id)"
                              class="text-muted hover:text-rose-600 cursor-pointer"
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
                      <p class="text-amber-600 dark:text-amber-400 text-xs">Chưa chọn SKU biến thể linh kiện nào.</p>
                    }
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="promo-effective-from" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Từ ngày <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="promo-effective-from"
                    type="date"
                    formControlName="effectiveFrom"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  @if (fieldError('effectiveFrom')) {
                    <p class="text-rose-600 dark:text-rose-400 text-xs mt-1">{{ fieldError('effectiveFrom') }}</p>
                  }
                </div>

                <div>
                  <label for="promo-effective-to" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Đến ngày <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="promo-effective-to"
                    type="date"
                    formControlName="effectiveTo"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  @if (fieldError('effectiveTo')) {
                    <p class="text-rose-600 dark:text-rose-400 text-xs mt-1">{{ fieldError('effectiveTo') }}</p>
                  }
                </div>
              </div>

              <div class="space-y-2 pt-1">
                <label class="flex items-center gap-2.5 p-2.5 bg-surface-alt rounded-md border border-line cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="isExclusive"
                    class="text-primary focus:ring-primary rounded"
                  />
                  <span class="font-semibold text-foreground text-xs">Áp dụng độc quyền (không dùng chung với coupon đơn hàng)</span>
                </label>

                <label class="flex items-center gap-2.5 p-2.5 bg-surface-alt rounded-md border border-line cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="isActive"
                    class="text-primary focus:ring-primary rounded"
                  />
                  <span class="font-semibold text-foreground text-xs">Kích hoạt chương trình</span>
                </label>
              </div>
            </form>
          </div>

          <footer class="p-5 border-t border-line flex items-center justify-end gap-3 shrink-0 bg-surface">
            <button
              type="button"
              (click)="onClose()"
              class="px-4 py-2 bg-surface-alt hover:bg-surface border border-line text-foreground font-semibold rounded-md text-sm transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              form="promo-form"
              [disabled]="isSaving()"
              class="px-5 py-2 bg-primary hover:bg-primary-strong disabled:opacity-50 text-primary-foreground font-bold rounded-md shadow-sm text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              @if (isSaving()) {
                <span class="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
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

  readonly selectedCatIdToAdd = signal<string>('');
  readonly selectedSkuIdToAdd = signal<string>('');

  readonly availableCategories = computed(() => this.categoryService.categories());
  readonly availableVariants = signal<
    { id: number; sku: string; variationLabel: string | null; productTemplate: { name: string } }[]
  >([]);

  readonly categoryOptions = computed<readonly SelectOption[]>(() =>
    this.availableCategories().map((c) => ({
      value: c.id.toString(),
      label: c.name,
    })),
  );

  readonly skuOptions = computed<readonly SelectOption[]>(() =>
    this.availableVariants().map((v) => ({
      value: v.id.toString(),
      label: `${v.sku} - ${v.productTemplate.name}${v.variationLabel ? ' (' + v.variationLabel + ')' : ''}`,
    })),
  );

  readonly discountTypeOptions: readonly SelectOption[] = [
    { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
    { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (VNĐ)' },
  ];

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
    this.selectedCatIdToAdd.set('');
    this.selectedSkuIdToAdd.set('');

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

  onDiscountTypeChange(val: string): void {
    this.form.patchValue({ discountType: val });
  }

  handleAddCategory(): void {
    const catIdStr = this.selectedCatIdToAdd();
    const catId = Number(catIdStr);
    if (!catId) return;

    const cat = this.availableCategories().find((c) => c.id === catId);
    if (!cat) return;

    if (!this.selectedCategories().some((c) => c.id === catId)) {
      this.selectedCategories.update((list) => [...list, { id: cat.id, name: cat.name }]);
    }
    this.selectedCatIdToAdd.set('');
  }

  onRemoveCategory(id: number): void {
    this.selectedCategories.update((list) => list.filter((c) => c.id !== id));
  }

  handleAddSku(): void {
    const skuIdStr = this.selectedSkuIdToAdd();
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
    this.selectedSkuIdToAdd.set('');
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
