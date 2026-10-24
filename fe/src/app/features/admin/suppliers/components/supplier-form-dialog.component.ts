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
  AdminSupplier,
  AdminSupplierService,
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from '../services/admin-supplier.service';

const supplierFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Mã nhà cung cấp tối thiểu 2 ký tự')
    .max(50, 'Mã nhà cung cấp tối đa 50 ký tự')
    .regex(/^[A-Za-z0-9_-]+$/, 'Mã nhà cung cấp chỉ chứa chữ cái, số, gạch ngang hoặc gạch dưới')
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, 'Tên nhà cung cấp tối thiểu 2 ký tự')
    .max(200, 'Tên nhà cung cấp tối đa 200 ký tự'),
  contactName: z.string().trim().max(100, 'Tên người liên hệ tối đa 100 ký tự').optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+().\s-]{6,25}$/, 'Số điện thoại không đúng định dạng')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Định dạng email không hợp lệ')
    .optional()
    .or(z.literal('')),
  address: z.string().trim().max(500, 'Địa chỉ tối đa 500 ký tự').optional(),
  isActive: z.boolean(),
});

@Component({
  selector: 'app-supplier-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'supplier-modal-title'"
      >
        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-xl p-6 space-y-4 text-sm text-white"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h2 id="supplier-modal-title" class="font-bold text-white uppercase text-base tracking-wide">
                {{ isEditMode() ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp' }}
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ isEditMode() ? 'Cập nhật thông tin đối tác và nhà phân phối linh kiện' : 'Thêm đối tác nhà phân phối linh kiện phần cứng mới' }}
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Đóng hộp thoại"
              aria-label="Đóng hộp thoại"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          @if (errorMessage()) {
            <div class="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="supplier-code" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Mã nhà cung cấp <span class="text-rose-400">*</span>
                </label>
                <input
                  id="supplier-code"
                  type="text"
                  formControlName="code"
                  placeholder="Ví dụ: SUP-ASUS-VN"
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900] uppercase"
                  [class.border-rose-500]="isFieldInvalid('code')"
                />
                @if (isFieldInvalid('code')) {
                  <p class="mt-1 text-xs text-rose-400">
                    {{ getFieldError('code') }}
                  </p>
                }
              </div>

              <div>
                <label for="supplier-name" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Tên nhà cung cấp <span class="text-rose-400">*</span>
                </label>
                <input
                  id="supplier-name"
                  type="text"
                  formControlName="name"
                  placeholder="Ví dụ: Công ty TNHH ASUS Technology..."
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                  [class.border-rose-500]="isFieldInvalid('name')"
                />
                @if (isFieldInvalid('name')) {
                  <p class="mt-1 text-xs text-rose-400">
                    {{ getFieldError('name') }}
                  </p>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="supplier-contact" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Người liên hệ
                </label>
                <input
                  id="supplier-contact"
                  type="text"
                  formControlName="contactName"
                  placeholder="Họ và tên..."
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                  [class.border-rose-500]="isFieldInvalid('contactName')"
                />
                @if (isFieldInvalid('contactName')) {
                  <p class="mt-1 text-xs text-rose-400">
                    {{ getFieldError('contactName') }}
                  </p>
                }
              </div>

              <div>
                <label for="supplier-phone" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  id="supplier-phone"
                  type="text"
                  formControlName="phone"
                  placeholder="028.3811.9999"
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                  [class.border-rose-500]="isFieldInvalid('phone')"
                />
                @if (isFieldInvalid('phone')) {
                  <p class="mt-1 text-xs text-rose-400">
                    {{ getFieldError('phone') }}
                  </p>
                }
              </div>

              <div>
                <label for="supplier-email" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Email
                </label>
                <input
                  id="supplier-email"
                  type="email"
                  formControlName="email"
                  placeholder="sales@asus.com.vn"
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                  [class.border-rose-500]="isFieldInvalid('email')"
                />
                @if (isFieldInvalid('email')) {
                  <p class="mt-1 text-xs text-rose-400">
                    {{ getFieldError('email') }}
                  </p>
                }
              </div>
            </div>

            <div>
              <label for="supplier-address" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Kho xuất hàng / Địa chỉ trụ sở
              </label>
              <textarea
                id="supplier-address"
                rows="2"
                formControlName="address"
                placeholder="Địa chỉ chi tiết kho giao hàng hoặc trụ sở chính..."
                class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900] resize-y"
              ></textarea>
            </div>

            <div class="pt-2">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  formControlName="isActive"
                  class="w-4 h-4 rounded bg-[#090d16] border-[#272f3d] text-[#76b900] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span class="text-xs font-medium text-slate-200">
                  Kích hoạt trạng thái hợp tác của nhà cung cấp
                </span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#272f3d]">
              <button
                type="button"
                (click)="onClose()"
                [disabled]="isSubmitting()"
                class="px-4 py-2 bg-transparent hover:bg-[#272f3d] border border-[#272f3d] rounded font-semibold text-slate-300 hover:text-white text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                @if (isSubmitting()) {
                  <svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Đang lưu...</span>
                } @else {
                  <span>{{ isEditMode() ? 'Lưu Thay Đổi' : 'Lưu Nhà Cung Cấp' }}</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supplierService = inject(AdminSupplierService);

  readonly isOpen = input<boolean>(false);
  readonly supplier = input<AdminSupplier | null>(null);

  readonly closeDialog = output<void>();
  readonly saved = output<AdminSupplier>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isEditMode = computed(() => this.supplier() !== null);

  readonly form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    contactName: [''],
    phone: [''],
    email: [''],
    address: [''],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      const currentSupplier = this.supplier();
      if (this.isOpen()) {
        this.errorMessage.set(null);
        if (currentSupplier) {
          this.form.reset({
            code: currentSupplier.code,
            name: currentSupplier.name,
            contactName: currentSupplier.contactName ?? '',
            phone: currentSupplier.phone ?? '',
            email: currentSupplier.email ?? '',
            address: currentSupplier.address ?? '',
            isActive: currentSupplier.isActive,
          });
        } else {
          this.form.reset({
            code: '',
            name: '',
            contactName: '',
            phone: '',
            email: '',
            address: '',
            isActive: true,
          });
        }
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen() && !this.isSubmitting()) {
      this.onClose();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) {
      return '';
    }
    if (control.errors['required']) {
      return 'Trường này là bắt buộc';
    }
    if (control.errors['minlength']) {
      return `Tối thiểu ${control.errors['minlength'].requiredLength} ký tự`;
    }
    if (control.errors['maxlength']) {
      return `Tối đa ${control.errors['maxlength'].requiredLength} ký tự`;
    }
    if (control.errors['pattern']) {
      return 'Mã chỉ gồm chữ cái, số, gạch ngang hoặc gạch dưới';
    }
    if (control.errors['email']) {
      return 'Định dạng email không hợp lệ';
    }
    return 'Dữ liệu không hợp lệ';
  }

  onClose(): void {
    this.closeDialog.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formRaw = this.form.value;
    const validationResult = supplierFormSchema.safeParse({
      code: formRaw.code,
      name: formRaw.name,
      contactName: formRaw.contactName || undefined,
      phone: formRaw.phone || undefined,
      email: formRaw.email || undefined,
      address: formRaw.address || undefined,
      isActive: Boolean(formRaw.isActive),
    });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      this.errorMessage.set(firstIssue ? firstIssue.message : 'Dữ liệu không hợp lệ');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      let savedSupplier: AdminSupplier;
      const targetSupplier = this.supplier();

      if (targetSupplier) {
        const payload: UpdateSupplierPayload = {
          code: validationResult.data.code,
          name: validationResult.data.name,
          contactName: validationResult.data.contactName ?? null,
          phone: validationResult.data.phone ?? null,
          email: validationResult.data.email ?? null,
          address: validationResult.data.address ?? null,
          isActive: validationResult.data.isActive,
        };
        savedSupplier = await this.supplierService.updateSupplier(targetSupplier.id, payload);
      } else {
        const payload: CreateSupplierPayload = {
          code: validationResult.data.code,
          name: validationResult.data.name,
          contactName: validationResult.data.contactName ?? null,
          phone: validationResult.data.phone ?? null,
          email: validationResult.data.email ?? null,
          address: validationResult.data.address ?? null,
          isActive: validationResult.data.isActive,
        };
        savedSupplier = await this.supplierService.createSupplier(payload);
      }

      this.saved.emit(savedSupplier);
      this.onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu nhà cung cấp';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
