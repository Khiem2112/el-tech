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
  AdminCoupon,
  AdminCouponService,
  CategoryRuleInput,
  CouponDiscountType,
  CouponPaymentMethod,
  CouponTargetRule,
  CreateCouponPayload,
  SkuRuleInput,
  UpdateCouponPayload,
} from '../services/admin-coupon.service';

type CategoryRuleItem = {
  id: number;
  name: string;
  rule: CouponTargetRule;
};

type SkuRuleItem = {
  id: number;
  sku: string;
  name: string;
  rule: CouponTargetRule;
};

const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'Mã coupon tối thiểu 3 ký tự')
      .max(30, 'Mã coupon tối đa 30 ký tự')
      .regex(/^[A-Za-z0-9_-]+$/, 'Mã coupon chỉ chứa chữ cái, số, gạch ngang và gạch dưới'),
    name: z
      .string()
      .trim()
      .min(2, 'Tên chương trình tối thiểu 2 ký tự')
      .max(200, 'Tên chương trình tối đa 200 ký tự'),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    discountValue: z.coerce.number().positive('Mức giảm phải lớn hơn 0'),
    minimumSubtotal: z.coerce.number().min(0, 'Đơn tối thiểu không thể âm'),
    maximumDiscount: z.coerce.number().positive('Mức giảm tối đa phải lớn hơn 0').nullable().optional(),
    requiredPaymentMethod: z.enum(['ALL', 'QR', 'COD']),
    globalQuota: z.coerce.number().int().positive('Hạn mức toàn hệ thống phải là số nguyên dương').nullable().optional(),
    perCustomerQuota: z.coerce.number().int().positive('Hạn mức mỗi khách hàng phải là số nguyên dương').nullable().optional(),
    effectiveFrom: z.string().min(1, 'Vui lòng chọn ngày bắt đầu hiệu lực'),
    effectiveTo: z.string().min(1, 'Vui lòng chọn ngày kết thúc hiệu lực'),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const fromTime = new Date(data.effectiveFrom).getTime();
    const toTime = new Date(data.effectiveTo).getTime();

    if (toTime <= fromTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['effectiveTo'],
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      });
    }

    if (data.discountType === 'PERCENTAGE') {
      if (data.discountValue < 1 || data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Mức giảm phần trăm phải nằm trong khoảng từ 1% đến 100%',
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
  selector: 'app-coupon-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectComponent],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-dialog-title"
      >
        <div
          class="relative bg-surface border border-line rounded-lg shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col text-sm text-foreground"
          (click)="$event.stopPropagation()"
        >
          <header class="p-4 border-b border-line flex items-center justify-between shrink-0 bg-surface">
            <div>
              <h2 id="coupon-dialog-title" class="font-bold text-foreground uppercase text-base tracking-wide">
                {{ isEditMode() ? 'Chỉnh Sửa Mã Giảm Giá' : 'Thêm Mới Mã Giảm Giá' }}
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

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate id="coupon-form">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="coupon-code" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Mã coupon <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="coupon-code"
                    type="text"
                    formControlName="code"
                    (input)="onCodeInput($event)"
                    placeholder="VÍ DỤ: ELTECH1000K"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-bold text-foreground text-sm tabular-nums focus:outline-none focus:border-primary uppercase transition-colors"
                  />
                  @if (form.get('code')?.touched && form.get('code')?.errors) {
                    <p class="text-rose-600 dark:text-rose-400 text-xs mt-1">Mã coupon từ 3-30 ký tự viết hoa không dấu</p>
                  }
                </div>

                <div>
                  <label for="coupon-name" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Tên chương trình <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="coupon-name"
                    type="text"
                    formControlName="name"
                    placeholder="Ví dụ: Tri Ân Khách Hàng Thân Thiết"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-semibold text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  @if (form.get('name')?.touched && form.get('name')?.errors) {
                    <p class="text-rose-600 dark:text-rose-400 text-xs mt-1">Tên chương trình tối thiểu 2 ký tự</p>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <label for="discount-value" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Mức giảm {{ form.get('discountType')?.value === 'PERCENTAGE' ? '(%)' : '(VNĐ)' }} <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="discount-value"
                    type="number"
                    formControlName="discountValue"
                    [step]="form.get('discountType')?.value === 'PERCENTAGE' ? '1' : '1000'"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-bold text-foreground text-sm focus:outline-none focus:border-primary tabular-nums transition-colors"
                  />
                </div>

                <div>
                  <label for="max-discount" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Giảm tối đa (VNĐ)
                  </label>
                  <input
                    id="max-discount"
                    type="number"
                    formControlName="maximumDiscount"
                    step="1000"
                    placeholder="Không giới hạn"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-semibold text-foreground text-sm focus:outline-none focus:border-primary tabular-nums transition-colors"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label for="min-subtotal" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Đơn tối thiểu (VNĐ)
                  </label>
                  <input
                    id="min-subtotal"
                    type="number"
                    formControlName="minimumSubtotal"
                    step="1000"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-semibold text-foreground text-sm focus:outline-none focus:border-primary tabular-nums transition-colors"
                  />
                </div>

                <div>
                  <label for="global-quota" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Hạn mức hệ thống (Lượt)
                  </label>
                  <input
                    id="global-quota"
                    type="number"
                    formControlName="globalQuota"
                    placeholder="Không giới hạn"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-semibold text-foreground text-sm focus:outline-none focus:border-primary tabular-nums transition-colors"
                  />
                </div>

                <div>
                  <label for="per-user-quota" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Hạn mức / Khách (Lượt)
                  </label>
                  <input
                    id="per-user-quota"
                    type="number"
                    formControlName="perCustomerQuota"
                    placeholder="Mặc định 1 lượt"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-semibold text-foreground text-sm focus:outline-none focus:border-primary tabular-nums transition-colors"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label for="effective-from" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Hiệu lực từ ngày <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="effective-from"
                    type="date"
                    formControlName="effectiveFrom"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-semibold text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label for="effective-to" class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Hết hạn đến ngày <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="effective-to"
                    type="date"
                    formControlName="effectiveTo"
                    class="w-full px-3 py-2 bg-surface-alt border border-line rounded-md font-semibold text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-foreground text-xs uppercase mb-1">
                    Phương thức thanh toán
                  </label>
                  <app-select
                    [options]="paymentMethodOptions"
                    [value]="form.get('requiredPaymentMethod')?.value"
                    (valueChange)="onPaymentMethodChange($event)"
                    size="md"
                  />
                </div>
              </div>

              <div class="space-y-3 p-3 bg-surface-alt rounded-md border border-line">
                <span class="font-semibold text-foreground text-xs uppercase tracking-wider block">
                  Danh mục áp dụng / loại trừ
                </span>

                <div class="flex flex-col sm:flex-row gap-2 items-center">
                  <div class="flex-1 w-full">
                    <app-select
                      [options]="categoryOptions()"
                      [value]="selectedCatIdToAdd()"
                      (valueChange)="selectedCatIdToAdd.set($event)"
                      placeholder="-- Chọn danh mục --"
                      size="sm"
                      [searchable]="true"
                    />
                  </div>
                  <div class="w-full sm:w-36">
                    <app-select
                      [options]="ruleTypeOptions"
                      [value]="selectedCatRuleToAdd()"
                      (valueChange)="selectedCatRuleToAdd.set($event)"
                      size="sm"
                    />
                  </div>
                  <button
                    type="button"
                    (click)="handleAddCategoryRule()"
                    [disabled]="!selectedCatIdToAdd()"
                    class="px-3.5 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground text-xs font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Thêm danh mục
                  </button>
                </div>

                @if (selectedCategories().length > 0) {
                  <div class="flex flex-wrap gap-2 pt-1">
                    @for (rule of selectedCategories(); track rule.id) {
                      <span
                        class="px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1.5 border"
                        [class.bg-rose-500/10]="rule.rule === 'EXCLUDE'"
                        [class.border-rose-500/30]="rule.rule === 'EXCLUDE'"
                        [class.text-rose-700]="rule.rule === 'EXCLUDE'"
                        [class.dark:text-rose-400]="rule.rule === 'EXCLUDE'"
                        [class.bg-emerald-500/10]="rule.rule === 'INCLUDE'"
                        [class.border-emerald-500/30]="rule.rule === 'INCLUDE'"
                        [class.text-emerald-700]="rule.rule === 'INCLUDE'"
                        [class.dark:text-emerald-400]="rule.rule === 'INCLUDE'"
                      >
                        <span>{{ rule.rule === 'EXCLUDE' ? 'Loại trừ' : 'Áp dụng' }}: <strong>{{ rule.name }}</strong></span>
                        <button
                          type="button"
                          (click)="removeCategoryRule(rule.id)"
                          class="hover:text-foreground p-0.5 cursor-pointer"
                          title="Xóa quy tắc"
                          aria-label="Xóa quy tắc"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    }
                  </div>
                }
              </div>

              <div class="space-y-3 p-3 bg-surface-alt rounded-md border border-line">
                <span class="font-semibold text-foreground text-xs uppercase tracking-wider block">
                  Biến thể SKU áp dụng / loại trừ
                </span>

                <div class="flex flex-col sm:flex-row gap-2 items-center">
                  <div class="flex-1 w-full">
                    <app-select
                      [options]="skuOptions()"
                      [value]="selectedSkuIdToAdd()"
                      (valueChange)="selectedSkuIdToAdd.set($event)"
                      placeholder="-- Chọn biến thể SKU --"
                      size="sm"
                      [searchable]="true"
                    />
                  </div>
                  <div class="w-full sm:w-36">
                    <app-select
                      [options]="ruleTypeOptions"
                      [value]="selectedSkuRuleToAdd()"
                      (valueChange)="selectedSkuRuleToAdd.set($event)"
                      size="sm"
                    />
                  </div>
                  <button
                    type="button"
                    (click)="handleAddSkuRule()"
                    [disabled]="!selectedSkuIdToAdd()"
                    class="px-3.5 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground text-xs font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Thêm SKU
                  </button>
                </div>

                @if (selectedSkus().length > 0) {
                  <div class="flex flex-wrap gap-2 pt-1">
                    @for (rule of selectedSkus(); track rule.id) {
                      <span
                        class="px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1.5 border"
                        [class.bg-rose-500/10]="rule.rule === 'EXCLUDE'"
                        [class.border-rose-500/30]="rule.rule === 'EXCLUDE'"
                        [class.text-rose-700]="rule.rule === 'EXCLUDE'"
                        [class.dark:text-rose-400]="rule.rule === 'EXCLUDE'"
                        [class.bg-emerald-500/10]="rule.rule === 'INCLUDE'"
                        [class.border-emerald-500/30]="rule.rule === 'INCLUDE'"
                        [class.text-emerald-700]="rule.rule === 'INCLUDE'"
                        [class.dark:text-emerald-400]="rule.rule === 'INCLUDE'"
                      >
                        <span>{{ rule.rule === 'EXCLUDE' ? 'Loại trừ' : 'Áp dụng' }}: <strong class="tabular-nums font-semibold">{{ rule.sku }}</strong></span>
                        <button
                          type="button"
                          (click)="removeSkuRule(rule.id)"
                          class="hover:text-foreground p-0.5 cursor-pointer"
                          title="Xóa quy tắc SKU"
                          aria-label="Xóa quy tắc SKU"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    }
                  </div>
                }
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input
                  id="coupon-active"
                  type="checkbox"
                  formControlName="isActive"
                  class="w-4 h-4 rounded bg-surface border-line text-primary focus:ring-primary focus:ring-offset-0 focus:outline-none"
                />
                <label for="coupon-active" class="text-xs font-semibold text-foreground cursor-pointer">
                  Kích hoạt mã giảm giá ngay sau khi lưu
                </label>
              </div>
            </form>
          </div>

          <footer class="p-4 border-t border-line flex items-center justify-end gap-3 shrink-0 bg-surface">
            <button
              type="button"
              (click)="onClose()"
              [disabled]="isSaving()"
              class="px-4 py-2 bg-surface-alt hover:bg-surface text-foreground font-semibold text-xs rounded-md transition-colors border border-line cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              form="coupon-form"
              [disabled]="isSaving()"
              class="px-5 py-2 bg-primary hover:bg-primary-strong disabled:opacity-50 text-primary-foreground font-bold text-xs rounded-md shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              @if (isSaving()) {
                <span class="inline-block w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                <span>Đang lưu...</span>
              } @else {
                <span>{{ isEditMode() ? 'Cập Nhật Mã Giảm Giá' : 'Lưu Mã Giảm Giá' }}</span>
              }
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly couponService = inject(AdminCouponService);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly variantService = inject(AdminVariantService);

  readonly isOpen = input<boolean>(false);
  readonly coupon = input<AdminCoupon | null>(null);

  readonly closeDialog = output<void>();
  readonly saveSuccess = output<AdminCoupon>();

  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedSkus = signal<SkuRuleItem[]>([]);
  readonly selectedCategories = signal<CategoryRuleItem[]>([]);

  readonly selectedCatIdToAdd = signal<string>('');
  readonly selectedCatRuleToAdd = signal<string>('EXCLUDE');
  readonly selectedSkuIdToAdd = signal<string>('');
  readonly selectedSkuRuleToAdd = signal<string>('EXCLUDE');

  readonly availableCategories = computed(() => this.categoryService.categories());
  readonly availableVariants = signal<
    { id: number; sku: string; variationLabel: string | null; productTemplate: { name: string } }[]
  >([]);

  readonly isEditMode = computed(() => Boolean(this.coupon()?.id));

  readonly categoryOptions = computed<readonly SelectOption[]>(() =>
    this.availableCategories().map((c) => ({
      value: c.id.toString(),
      label: c.name,
    })),
  );

  readonly skuOptions = computed<readonly SelectOption[]>(() =>
    this.availableVariants().map((v) => ({
      value: v.id.toString(),
      label: `${v.sku} - ${v.productTemplate.name}`,
    })),
  );

  readonly discountTypeOptions: readonly SelectOption[] = [
    { value: 'PERCENTAGE', label: 'Theo phần trăm (%)' },
    { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (VNĐ)' },
  ];

  readonly paymentMethodOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Tất cả phương thức' },
    { value: 'QR', label: 'Chỉ qua VietQR' },
    { value: 'COD', label: 'Chỉ qua COD' },
  ];

  readonly ruleTypeOptions: readonly SelectOption[] = [
    { value: 'EXCLUDE', label: 'Loại trừ' },
    { value: 'INCLUDE', label: 'Áp dụng' },
  ];

  readonly form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    discountType: ['PERCENTAGE', [Validators.required]],
    discountValue: [10, [Validators.required, Validators.min(1)]],
    minimumSubtotal: [0, [Validators.min(0)]],
    maximumDiscount: [null],
    requiredPaymentMethod: ['ALL'],
    globalQuota: [null],
    perCustomerQuota: [1],
    effectiveFrom: ['', [Validators.required]],
    effectiveTo: ['', [Validators.required]],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadReferenceData();
        this.resetFormWithCoupon(this.coupon());
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

    if (this.availableVariants().length === 0) {
      try {
        const variantsResult = await this.variantService.loadVariants({ limit: 50 });
        this.availableVariants.set(variantsResult.items);
      } catch {
        this.availableVariants.set([]);
      }
    }
  }

  private resetFormWithCoupon(item: AdminCoupon | null): void {
    this.errorMessage.set(null);
    this.selectedCatIdToAdd.set('');
    this.selectedCatRuleToAdd.set('EXCLUDE');
    this.selectedSkuIdToAdd.set('');
    this.selectedSkuRuleToAdd.set('EXCLUDE');

    if (item) {
      this.form.patchValue({
        code: item.code,
        name: item.name,
        discountType: item.discountType,
        discountValue: item.discountValue,
        minimumSubtotal: item.minimumSubtotal,
        maximumDiscount: item.maximumDiscount,
        requiredPaymentMethod: item.requiredPaymentMethod ?? 'ALL',
        globalQuota: item.globalQuota,
        perCustomerQuota: item.perCustomerQuota ?? 1,
        effectiveFrom: formatIsoToDateInput(item.effectiveFrom),
        effectiveTo: formatIsoToDateInput(item.effectiveTo),
        isActive: item.isActive,
      });

      this.selectedCategories.set(
        item.categoryRules.map((rule) => ({
          id: rule.categoryId,
          name: rule.name,
          rule: rule.rule,
        })),
      );

      this.selectedSkus.set(
        item.skuRules.map((rule) => ({
          id: rule.skuId,
          sku: rule.sku,
          name: rule.productName,
          rule: rule.rule,
        })),
      );
    } else {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      this.form.reset({
        code: '',
        name: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minimumSubtotal: 0,
        maximumDiscount: null,
        requiredPaymentMethod: 'ALL',
        globalQuota: null,
        perCustomerQuota: 1,
        effectiveFrom: formatIsoToDateInput(now.toISOString()),
        effectiveTo: formatIsoToDateInput(nextMonth.toISOString()),
        isActive: true,
      });

      this.selectedCategories.set([]);
      this.selectedSkus.set([]);
    }
  }

  onCodeInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const upper = inputElement.value.toUpperCase();
      this.form.patchValue({ code: upper }, { emitEvent: false });
    }
  }

  onDiscountTypeChange(val: string): void {
    this.form.patchValue({ discountType: val });
  }

  onPaymentMethodChange(val: string): void {
    this.form.patchValue({ requiredPaymentMethod: val });
  }

  handleAddCategoryRule(): void {
    const catIdStr = this.selectedCatIdToAdd();
    const catId = Number(catIdStr);
    if (!catId) return;

    const existing = this.selectedCategories().find((c) => c.id === catId);
    if (existing) return;

    const found = this.availableCategories().find((c) => c.id === catId);
    if (!found) return;

    const rule: CouponTargetRule = this.selectedCatRuleToAdd() === 'INCLUDE' ? 'INCLUDE' : 'EXCLUDE';
    this.selectedCategories.update((list) => [
      ...list,
      { id: catId, name: found.name, rule },
    ]);
    this.selectedCatIdToAdd.set('');
  }

  removeCategoryRule(id: number): void {
    this.selectedCategories.update((list) => list.filter((item) => item.id !== id));
  }

  handleAddSkuRule(): void {
    const skuIdStr = this.selectedSkuIdToAdd();
    const skuId = Number(skuIdStr);
    if (!skuId) return;

    const existing = this.selectedSkus().find((s) => s.id === skuId);
    if (existing) return;

    const found = this.availableVariants().find((v) => v.id === skuId);
    if (!found) return;

    const rule: CouponTargetRule = this.selectedSkuRuleToAdd() === 'INCLUDE' ? 'INCLUDE' : 'EXCLUDE';
    this.selectedSkus.update((list) => [
      ...list,
      { id: skuId, sku: found.sku, name: found.productTemplate.name, rule },
    ]);
    this.selectedSkuIdToAdd.set('');
  }

  removeSkuRule(id: number): void {
    this.selectedSkus.update((list) => list.filter((item) => item.id !== id));
  }

  onClose(): void {
    this.errorMessage.set(null);
    this.closeDialog.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.isSaving()) return;

    this.form.markAllAsTouched();
    this.errorMessage.set(null);

    const rawValue = this.form.getRawValue();
    const parseResult = couponFormSchema.safeParse(rawValue);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      this.errorMessage.set(firstIssue ? firstIssue.message : 'Dữ liệu nhập không hợp lệ');
      return;
    }

    const validated = parseResult.data;
    const paymentMethod: CouponPaymentMethod | null =
      validated.requiredPaymentMethod === 'ALL'
        ? null
        : (validated.requiredPaymentMethod as CouponPaymentMethod);

    const categoryRules: CategoryRuleInput[] = this.selectedCategories().map((item) => ({
      categoryId: item.id,
      rule: item.rule,
    }));

    const skuRules: SkuRuleInput[] = this.selectedSkus().map((item) => ({
      skuId: item.id,
      rule: item.rule,
    }));

    const effectiveFromIso = new Date(validated.effectiveFrom).toISOString();
    const effectiveToIso = new Date(
      `${validated.effectiveTo}T23:59:59.999Z`,
    ).toISOString();

    this.isSaving.set(true);

    try {
      let saved: AdminCoupon;
      const currentItem = this.coupon();

      if (currentItem?.id) {
        const updatePayload: UpdateCouponPayload = {
          code: validated.code.toUpperCase(),
          name: validated.name,
          discountType: validated.discountType as CouponDiscountType,
          discountValue: validated.discountValue,
          minimumSubtotal: validated.minimumSubtotal,
          maximumDiscount: validated.maximumDiscount ?? null,
          requiredPaymentMethod: paymentMethod,
          globalQuota: validated.globalQuota ?? null,
          perCustomerQuota: validated.perCustomerQuota ?? null,
          effectiveFrom: effectiveFromIso,
          effectiveTo: effectiveToIso,
          isActive: validated.isActive,
          skuRules,
          categoryRules,
        };
        saved = await this.couponService.updateCoupon(currentItem.id, updatePayload);
      } else {
        const createPayload: CreateCouponPayload = {
          code: validated.code.toUpperCase(),
          name: validated.name,
          discountType: validated.discountType as CouponDiscountType,
          discountValue: validated.discountValue,
          minimumSubtotal: validated.minimumSubtotal,
          maximumDiscount: validated.maximumDiscount ?? null,
          requiredPaymentMethod: paymentMethod,
          globalQuota: validated.globalQuota ?? null,
          perCustomerQuota: validated.perCustomerQuota ?? null,
          effectiveFrom: effectiveFromIso,
          effectiveTo: effectiveToIso,
          isActive: validated.isActive,
          skuRules,
          categoryRules,
        };
        saved = await this.couponService.createCoupon(createPayload);
      }

      this.saveSuccess.emit(saved);
      this.onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu mã giảm giá';
      this.errorMessage.set(msg);
    } finally {
      this.isSaving.set(false);
    }
  }
}
