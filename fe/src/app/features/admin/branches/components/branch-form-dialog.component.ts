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
  AdminBranch,
  AdminBranchService,
  CreateBranchPayload,
  UpdateBranchPayload,
} from '../services/admin-branch.service';

const branchFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Mã chi nhánh tối thiểu 2 ký tự')
    .max(50, 'Mã chi nhánh tối đa 50 ký tự')
    .regex(/^[A-Za-z0-9_-]+$/, 'Mã chỉ gồm chữ cái, số, gạch nối hoặc gạch dưới'),
  name: z
    .string()
    .trim()
    .min(2, 'Tên chi nhánh tối thiểu 2 ký tự')
    .max(200, 'Tên chi nhánh tối đa 200 ký tự'),
  address: z
    .string()
    .trim()
    .min(5, 'Địa chỉ tối thiểu 5 ký tự')
    .max(500, 'Địa chỉ tối đa 500 ký tự'),
  openingHour: z.string().trim().min(1, 'Vui lòng nhập giờ mở cửa'),
  deliveryPriority: z.coerce.number().int().min(0, 'Độ ưu tiên phải từ 0 trở lên'),
  deliveryAreaCodes: z.string().trim(),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ (10 chữ số)')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Email không đúng định dạng')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
});

@Component({
  selector: 'app-branch-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'branch-modal-title'"
      >
        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 text-sm text-white"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h2 id="branch-modal-title" class="font-bold text-white uppercase text-base">
                {{ isEditMode() ? 'Chỉnh Sửa Chi Nhánh' : 'Thêm Chi Nhánh Mới' }}
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ isEditMode() ? 'Cập nhật thông tin chi nhánh và khu vực phục vụ' : 'Thêm mới chi nhánh showroom và kho trung chuyển' }}
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

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="branch-code" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                  Mã chi nhánh <span class="text-rose-400">*</span>
                </label>
                <input
                  id="branch-code"
                  type="text"
                  formControlName="code"
                  placeholder="Ví dụ: HN-01"
                  class="w-full px-3 py-2 bg-[#090d16] border rounded font-mono font-bold text-white text-sm focus:outline-none uppercase placeholder:text-slate-600"
                  [ngClass]="hasError('code') ? 'border-rose-500 focus:border-rose-500' : 'border-[#272f3d] focus:border-[#76b900]'"
                />
                @if (hasError('code')) {
                  <p class="text-rose-400 text-[11px] mt-1">{{ getErrorMessage('code') }}</p>
                }
              </div>

              <div>
                <label for="branch-name" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                  Tên chi nhánh <span class="text-rose-400">*</span>
                </label>
                <input
                  id="branch-name"
                  type="text"
                  formControlName="name"
                  placeholder="Ví dụ: EL-TECH Cầu Giấy"
                  class="w-full px-3 py-2 bg-[#090d16] border rounded text-white text-sm focus:outline-none font-semibold placeholder:text-slate-600"
                  [ngClass]="hasError('name') ? 'border-rose-500 focus:border-rose-500' : 'border-[#272f3d] focus:border-[#76b900]'"
                />
                @if (hasError('name')) {
                  <p class="text-rose-400 text-[11px] mt-1">{{ getErrorMessage('name') }}</p>
                }
              </div>
            </div>

            <div>
              <label for="branch-address" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                Địa chỉ chi nhánh <span class="text-rose-400">*</span>
              </label>
              <input
                id="branch-address"
                type="text"
                formControlName="address"
                placeholder="Số 12 Duy Tân, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội"
                class="w-full px-3 py-2 bg-[#090d16] border rounded text-white text-sm focus:outline-none placeholder:text-slate-600"
                [ngClass]="hasError('address') ? 'border-rose-500 focus:border-rose-500' : 'border-[#272f3d] focus:border-[#76b900]'"
              />
              @if (hasError('address')) {
                <p class="text-rose-400 text-[11px] mt-1">{{ getErrorMessage('address') }}</p>
              }
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="branch-hours" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                  Giờ mở cửa <span class="text-rose-400">*</span>
                </label>
                <input
                  id="branch-hours"
                  type="text"
                  formControlName="openingHour"
                  placeholder="08:30 - 21:00"
                  class="w-full px-3 py-2 bg-[#090d16] border rounded text-white text-sm focus:outline-none placeholder:text-slate-600"
                  [ngClass]="hasError('openingHour') ? 'border-rose-500 focus:border-rose-500' : 'border-[#272f3d] focus:border-[#76b900]'"
                />
                @if (hasError('openingHour')) {
                  <p class="text-rose-400 text-[11px] mt-1">{{ getErrorMessage('openingHour') }}</p>
                }
              </div>

              <div>
                <label for="branch-priority" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                  Độ ưu tiên giao hàng
                </label>
                <input
                  id="branch-priority"
                  type="number"
                  formControlName="deliveryPriority"
                  min="0"
                  max="100"
                  class="w-full px-3 py-2 bg-[#090d16] border rounded font-mono font-bold text-white text-sm focus:outline-none"
                  [ngClass]="hasError('deliveryPriority') ? 'border-rose-500 focus:border-rose-500' : 'border-[#272f3d] focus:border-[#76b900]'"
                />
                @if (hasError('deliveryPriority')) {
                  <p class="text-rose-400 text-[11px] mt-1">{{ getErrorMessage('deliveryPriority') }}</p>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="branch-phone" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                  Số điện thoại
                </label>
                <input
                  id="branch-phone"
                  type="tel"
                  formControlName="phone"
                  placeholder="0987654321"
                  class="w-full px-3 py-2 bg-[#090d16] border rounded text-white text-sm focus:outline-none placeholder:text-slate-600"
                  [ngClass]="hasError('phone') ? 'border-rose-500 focus:border-rose-500' : 'border-[#272f3d] focus:border-[#76b900]'"
                />
                @if (hasError('phone')) {
                  <p class="text-rose-400 text-[11px] mt-1">{{ getErrorMessage('phone') }}</p>
                }
              </div>

              <div>
                <label for="branch-email" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                  Email liên hệ
                </label>
                <input
                  id="branch-email"
                  type="email"
                  formControlName="email"
                  placeholder="branch@eltech.vn"
                  class="w-full px-3 py-2 bg-[#090d16] border rounded text-white text-sm focus:outline-none placeholder:text-slate-600"
                  [ngClass]="hasError('email') ? 'border-rose-500 focus:border-rose-500' : 'border-[#272f3d] focus:border-[#76b900]'"
                />
                @if (hasError('email')) {
                  <p class="text-rose-400 text-[11px] mt-1">{{ getErrorMessage('email') }}</p>
                }
              </div>
            </div>

            <div>
              <label for="branch-areas" class="block font-semibold text-slate-300 text-xs uppercase mb-1">
                Danh sách mã khu vực phục vụ
              </label>
              <input
                id="branch-areas"
                type="text"
                formControlName="deliveryAreaCodes"
                placeholder="HN-*, VP-*, BN-* (phân cách bằng dấu phẩy)"
                class="w-full px-3 py-2 bg-[#090d16] border rounded font-mono text-white text-sm focus:outline-none placeholder:text-slate-600"
                [ngClass]="hasError('deliveryAreaCodes') ? 'border-rose-500 focus:border-rose-500' : 'border-[#272f3d] focus:border-[#76b900]'"
              />
              <p class="text-[11px] text-slate-400 mt-1">
                Các tiền tố mã bưu chính hoặc khu vực chi nhánh sẽ tiếp nhận đơn giao hàng (cách nhau bởi dấu phẩy).
              </p>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input
                id="branch-active"
                type="checkbox"
                formControlName="isActive"
                class="w-4 h-4 rounded bg-[#090d16] border-[#272f3d] text-[#76b900] focus:ring-[#76b900] focus:ring-offset-0 focus:ring-1"
              />
              <label for="branch-active" class="text-xs text-slate-300 font-medium select-none cursor-pointer">
                Kích hoạt hoạt động cho chi nhánh này
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#272f3d]">
              <button
                type="button"
                (click)="onClose()"
                [disabled]="isSubmitting()"
                class="px-4 py-2 bg-[#1e2533] hover:bg-[#272f3d] text-slate-300 font-semibold rounded text-sm border border-[#272f3d] transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] disabled:opacity-50 text-[#090d16] font-bold rounded shadow-sm text-sm transition-colors"
              >
                {{ isSubmitting() ? 'Đang lưu...' : (isEditMode() ? 'Lưu Thay Đổi' : 'Tạo Chi Nhánh') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly branchService = inject(AdminBranchService);

  readonly isOpen = input<boolean>(false);
  readonly branch = input<AdminBranch | null>(null);

  readonly closeDialog = output<void>();
  readonly branchSaved = output<AdminBranch>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    openingHour: ['08:30 - 21:00', [Validators.required]],
    deliveryPriority: [1, [Validators.required, Validators.min(0)]],
    deliveryAreaCodes: [''],
    phone: [''],
    email: [''],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const current = this.branch();
      if (open) {
        this.errorMessage.set(null);
        if (current) {
          this.populateForm(current);
        } else {
          this.resetForm();
        }
      }
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (this.isOpen() && !this.isSubmitting()) {
      event.preventDefault();
      this.onClose();
    }
  }

  isEditMode(): boolean {
    return this.branch() !== null;
  }

  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string): string {
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
    if (control.errors['min']) {
      return `Giá trị tối thiểu là ${control.errors['min'].min}`;
    }
    if (control.errors['pattern'] || control.errors['email']) {
      return 'Định dạng không hợp lệ';
    }
    return 'Dữ liệu không hợp lệ';
  }

  private populateForm(branch: AdminBranch): void {
    let openingHourStr = '08:30 - 21:00';
    let phoneStr = '';
    let emailStr = '';

    if (typeof branch.openingHour === 'string') {
      openingHourStr = branch.openingHour;
    } else if (branch.openingHour && typeof branch.openingHour === 'object') {
      const obj = branch.openingHour as Record<string, unknown>;
      if (typeof obj['display'] === 'string') {
        openingHourStr = obj['display'];
      } else if (typeof obj['mon_fri'] === 'string') {
        openingHourStr = obj['mon_fri'];
      }
      if (typeof obj['phone'] === 'string') {
        phoneStr = obj['phone'];
      }
      if (typeof obj['email'] === 'string') {
        emailStr = obj['email'];
      }
    }

    const areaCodesStr = Array.isArray(branch.deliveryAreaCodes)
      ? branch.deliveryAreaCodes.join(', ')
      : '';

    this.form.reset({
      code: branch.code,
      name: branch.name,
      address: branch.address,
      openingHour: openingHourStr,
      deliveryPriority: branch.deliveryPriority,
      deliveryAreaCodes: areaCodesStr,
      phone: phoneStr,
      email: emailStr,
      isActive: branch.isActive,
    });
  }

  private resetForm(): void {
    this.form.reset({
      code: '',
      name: '',
      address: '',
      openingHour: '08:30 - 21:00',
      deliveryPriority: 1,
      deliveryAreaCodes: '',
      phone: '',
      email: '',
      isActive: true,
    });
  }

  onClose(): void {
    this.closeDialog.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const validationResult = branchFormSchema.safeParse(raw);

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      this.errorMessage.set(firstIssue ? firstIssue.message : 'Dữ liệu không hợp lệ');
      return;
    }

    const validData = validationResult.data;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const areaCodes = validData.deliveryAreaCodes
      ? validData.deliveryAreaCodes
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      : [];

    try {
      const current = this.branch();
      let result: AdminBranch;

      if (current) {
        const payload: UpdateBranchPayload = {
          code: validData.code,
          name: validData.name,
          address: validData.address,
          openingHour: validData.openingHour,
          deliveryPriority: validData.deliveryPriority,
          deliveryAreaCodes: areaCodes,
          phone: validData.phone || undefined,
          email: validData.email || undefined,
          isActive: validData.isActive,
        };
        result = await this.branchService.updateBranch(current.id, payload);
      } else {
        const payload: CreateBranchPayload = {
          code: validData.code,
          name: validData.name,
          address: validData.address,
          openingHour: validData.openingHour,
          deliveryPriority: validData.deliveryPriority,
          deliveryAreaCodes: areaCodes,
          phone: validData.phone || undefined,
          email: validData.email || undefined,
          isActive: validData.isActive,
        };
        result = await this.branchService.createBranch(payload);
      }

      this.branchSaved.emit(result);
      this.onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi lưu chi nhánh';
      if (msg === 'error.branchCodeExists') {
        this.errorMessage.set('Mã chi nhánh này đã tồn tại trong hệ thống. Vui lòng chọn mã khác.');
      } else {
        this.errorMessage.set(msg);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
