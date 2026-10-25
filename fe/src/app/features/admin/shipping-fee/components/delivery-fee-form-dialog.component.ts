import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
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
  AdminDeliveryFeeConfig,
  AdminShippingFeeService,
  CreateDeliveryFeePayload,
} from '../services/admin-shipping-fee.service';

const deliveryFeeFormSchema = z.object({
  fixedFee: z.coerce
    .number({ invalid_type_error: 'Mức phí giao hàng phải là số hợp lệ' })
    .int('Mức phí giao hàng phải là số nguyên VND')
    .min(0, 'Mức phí giao hàng không được nhỏ hơn 0'),
  freeShippingThreshold: z.coerce
    .number({ invalid_type_error: 'Ngưỡng miễn phí vận chuyển phải là số hợp lệ' })
    .int('Ngưỡng miễn phí vận chuyển phải là số nguyên VND')
    .min(0, 'Ngưỡng miễn phí vận chuyển không được nhỏ hơn 0'),
  effectiveFrom: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Date.parse(val)),
      'Thời điểm bắt đầu hiệu lực không hợp lệ',
    ),
  note: z.string().trim().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});

type DeliveryFeeFormValues = z.infer<typeof deliveryFeeFormSchema>;

@Component({
  selector: 'app-delivery-fee-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div
          class="fixed inset-0 bg-[#090d16]/75 backdrop-blur-sm transition-opacity"
          (click)="onBackdropClick()"
          aria-hidden="true"
        ></div>

        <div
          class="relative bg-[#090d16] border border-[#272f3d] rounded-lg shadow-2xl w-full max-w-lg z-10 overflow-hidden flex flex-col max-h-[90vh]"
          (click)="$event.stopPropagation()"
        >
          <header class="px-6 py-4 border-b border-[#272f3d] flex items-center justify-between flex-shrink-0 bg-[#161b26]">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[#76b900]"></span>
                <h2 id="dialog-title" class="font-bold text-white uppercase text-sm tracking-wide">
                  Cập Nhật Biểu Phí Vận Chuyển
                </h2>
                <span class="text-[10px] bg-[#090d16] border border-[#272f3d] text-slate-400 font-mono px-1.5 py-0.5 rounded">
                  MOD-36
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Thiết lập mức phí giao hàng cố định và ngưỡng miễn phí vận chuyển toàn hệ thống
              </p>
            </div>

            <button
              type="button"
              (click)="onClose()"
              class="p-1 rounded text-slate-400 hover:text-white hover:bg-[#272f3d] transition-colors"
              title="Đóng hộp thoại"
              aria-label="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <form
            [formGroup]="feeForm"
            (ngSubmit)="onSubmit()"
            novalidate
            class="flex-1 overflow-y-auto p-6 space-y-4 text-sm"
          >
            @if (formError()) {
              <div
                class="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs flex items-center gap-2"
                role="alert"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                </svg>
                <span>{{ formError() }}</span>
              </div>
            }

            <div class="space-y-1">
              <label for="fixedFee" class="block font-semibold text-slate-300 text-xs uppercase">
                Mức phí giao hàng cố định (VNĐ) <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <input
                  id="fixedFee"
                  type="number"
                  step="1000"
                  min="0"
                  formControlName="fixedFee"
                  placeholder="50000"
                  class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded font-bold tabular-nums text-white text-sm focus:outline-none focus:border-[#76b900] transition-colors"
                  [class.border-rose-500]="isFieldInvalid('fixedFee')"
                />
                <span class="absolute right-3 top-2 text-xs text-slate-400 font-semibold pointer-events-none">
                  VND
                </span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Đồng giá cho đơn giao tận nơi dưới ngưỡng miễn phí</span>
                <span class="text-[#76b900] font-mono font-semibold tabular-nums">
                  {{ formatVnd(feeForm.get('fixedFee')?.value) }}
                </span>
              </div>
              @if (isFieldInvalid('fixedFee')) {
                <p class="text-rose-400 text-xs mt-0.5">
                  {{ getFieldError('fixedFee') }}
                </p>
              }
            </div>

            <div class="space-y-1">
              <label for="freeShippingThreshold" class="block font-semibold text-slate-300 text-xs uppercase">
                Ngưỡng đơn hàng miễn phí giao hàng (VNĐ) <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <input
                  id="freeShippingThreshold"
                  type="number"
                  step="1000"
                  min="0"
                  formControlName="freeShippingThreshold"
                  placeholder="5000000"
                  class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded font-bold tabular-nums text-white text-sm focus:outline-none focus:border-[#76b900] transition-colors"
                  [class.border-rose-500]="isFieldInvalid('freeShippingThreshold')"
                />
                <span class="absolute right-3 top-2 text-xs text-slate-400 font-semibold pointer-events-none">
                  VND
                </span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Đơn hàng có giá trị ròng đạt mức này sẽ được miễn 100% ship</span>
                <span class="text-[#76b900] font-mono font-semibold tabular-nums">
                  {{ formatVnd(feeForm.get('freeShippingThreshold')?.value) }}
                </span>
              </div>
              @if (isFieldInvalid('freeShippingThreshold')) {
                <p class="text-rose-400 text-xs mt-0.5">
                  {{ getFieldError('freeShippingThreshold') }}
                </p>
              }
            </div>

            <div class="space-y-1">
              <label for="effectiveFrom" class="block font-semibold text-slate-300 text-xs uppercase">
                Thời điểm bắt đầu có hiệu lực
              </label>
              <input
                id="effectiveFrom"
                type="datetime-local"
                formControlName="effectiveFrom"
                class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-slate-200 text-sm focus:outline-none focus:border-[#76b900] transition-colors"
              />
              <p class="text-[11px] text-slate-400 mt-1">
                Để trống để áp dụng ngay lập tức sau khi lưu.
              </p>
            </div>

            <div class="space-y-1">
              <label for="note" class="block font-semibold text-slate-300 text-xs uppercase">
                Ghi chú lý do điều chỉnh
              </label>
              <textarea
                id="note"
                rows="2"
                formControlName="note"
                placeholder="Ví dụ: Điều chỉnh phụ phí nhiên liệu hoặc chính sách ưu đãi quý mới..."
                class="w-full px-3 py-2 bg-[#161b26] border border-[#272f3d] rounded text-slate-200 text-sm focus:outline-none focus:border-[#76b900] transition-colors resize-none"
              ></textarea>
              <p class="text-[11px] text-slate-400 mt-1">
                Ghi chú nội bộ phục vụ kiểm toán và theo dõi lịch sử vận hành.
              </p>
            </div>

            <div class="p-3 bg-[#161b26] border border-[#272f3d] rounded text-xs text-slate-300 space-y-1">
              <strong class="text-white uppercase text-[11px] tracking-wider block">Cơ chế hiệu lực đơn nhất:</strong>
              <p class="text-slate-400">
                Khi áp dụng cấu hình mới, cấu hình đang hoạt động trước đó sẽ được tự động kết thúc hiệu lực và lưu vào bảng lịch sử.
              </p>
            </div>

            <footer class="flex items-center justify-end gap-3 pt-4 border-t border-[#272f3d] flex-shrink-0">
              <button
                type="button"
                (click)="onClose()"
                [disabled]="isSaving()"
                class="px-4 py-2 bg-[#161b26] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 rounded font-semibold text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                [disabled]="isSaving()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:bg-[#76b900]/50 text-[#090d16] font-bold rounded text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                @if (isSaving()) {
                  <svg class="animate-spin h-3.5 w-3.5 text-[#090d16]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Đang Lưu...</span>
                } @else {
                  <span>Áp Dụng Biểu Phí Mới</span>
                }
              </button>
            </footer>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryFeeFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly shippingFeeService = inject(AdminShippingFeeService);

  readonly isOpen = input<boolean>(false);
  readonly currentConfig = input<AdminDeliveryFeeConfig | null>(null);

  readonly closeDialog = output<void>();
  readonly saveSuccess = output<AdminDeliveryFeeConfig>();

  readonly formError = signal<string | null>(null);
  readonly isSaving = signal<boolean>(false);

  readonly feeForm: FormGroup = this.fb.group({
    fixedFee: [50000, [Validators.required, Validators.min(0)]],
    freeShippingThreshold: [5000000, [Validators.required, Validators.min(0)]],
    effectiveFrom: [''],
    note: [''],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const current = this.currentConfig();
        this.formError.set(null);
        if (current) {
          this.feeForm.patchValue({
            fixedFee: current.fixedFee,
            freeShippingThreshold: current.freeShippingThreshold,
            effectiveFrom: '',
            note: '',
          });
        } else {
          this.feeForm.patchValue({
            fixedFee: 50000,
            freeShippingThreshold: 5000000,
            effectiveFrom: '',
            note: '',
          });
        }
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen() && !this.isSaving()) {
      this.onClose();
    }
  }

  onBackdropClick(): void {
    if (!this.isSaving()) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closeDialog.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.feeForm.get(fieldName);
    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(fieldName: string): string {
    const control = this.feeForm.get(fieldName);
    if (!control || !control.errors) {
      return '';
    }
    if (control.errors['required']) {
      return 'Trường này là bắt buộc';
    }
    if (control.errors['min']) {
      return 'Giá trị không được nhỏ hơn 0';
    }
    return 'Dữ liệu không hợp lệ';
  }

  formatVnd(value: unknown): string {
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
  }

  async onSubmit(): Promise<void> {
    this.formError.set(null);

    const validation = deliveryFeeFormSchema.safeParse(this.feeForm.value);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      this.formError.set(firstIssue ? firstIssue.message : 'Dữ liệu nhập không hợp lệ');
      return;
    }

    const values: DeliveryFeeFormValues = validation.data;
    const payload: CreateDeliveryFeePayload = {
      fixedFee: values.fixedFee,
      freeShippingThreshold: values.freeShippingThreshold,
      effectiveFrom: values.effectiveFrom ? new Date(values.effectiveFrom).toISOString() : undefined,
      note: values.note ? values.note.trim() : undefined,
    };

    this.isSaving.set(true);
    try {
      const result = await this.shippingFeeService.createDeliveryFee(payload);
      this.saveSuccess.emit(result);
      this.onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể lưu biểu phí vận chuyển mới';
      this.formError.set(message);
    } finally {
      this.isSaving.set(false);
    }
  }
}
