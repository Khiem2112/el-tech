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
  AdminBrand,
  AdminBrandService,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '../services/admin-brand.service';

const brandFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ten thuong hieu toi thieu 2 ky tu')
    .max(100, 'Ten thuong hieu toi da 100 ky tu'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug toi thieu 2 ky tu')
    .max(100, 'Slug toi da 100 ky tu')
    .regex(/^[a-z0-9-]+$/, 'Slug chi chua chu thuong khong dau, so va gach noi'),
  description: z.string().trim().max(1000, 'Mo ta toi da 1000 ky tu').optional(),
  isActive: z.boolean(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

@Component({
  selector: 'app-brand-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'brand-modal-title'"
      >
        <div
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 text-sm text-white"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h2 id="brand-modal-title" class="font-bold text-white uppercase text-base tracking-wide">
                {{ isEditMode() ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới' }}
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ isEditMode() ? 'Cập nhật thông tin chi tiết của hãng sản xuất' : 'Thêm mới hãng sản xuất linh kiện máy tính vào hệ thống' }}
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
            <div>
              <label for="brand-name" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Tên thương hiệu <span class="text-rose-400">*</span>
              </label>
              <input
                id="brand-name"
                type="text"
                formControlName="name"
                (input)="onNameInput()"
                placeholder="Ví dụ: ASUS, Corsair, MSI..."
                class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                [class.border-rose-500]="isFieldInvalid('name')"
              />
              @if (isFieldInvalid('name')) {
                <p class="mt-1 text-xs text-rose-400">
                  {{ getFieldError('name') }}
                </p>
              }
            </div>

            <div>
              <label for="brand-slug" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Đường dẫn định danh (Slug) <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <input
                  id="brand-slug"
                  type="text"
                  formControlName="slug"
                  (input)="onSlugManualInput()"
                  placeholder="corsair"
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                  [class.border-rose-500]="isFieldInvalid('slug')"
                />
              </div>
              <p class="mt-1 text-[11px] text-slate-400">
                Định danh duy nhất trên URL (chỉ gồm chữ thường không dấu, số và gạch ngang).
              </p>
              @if (isFieldInvalid('slug')) {
                <p class="mt-1 text-xs text-rose-400">
                  {{ getFieldError('slug') }}
                </p>
              }
            </div>

            <div>
              <label for="brand-description" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Mô tả giới thiệu
              </label>
              <textarea
                id="brand-description"
                rows="3"
                formControlName="description"
                placeholder="Nhập thông tin giới thiệu ngắn gọn về thương hiệu..."
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
                  Kích hoạt trạng thái hoạt động của thương hiệu
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
                Hủy bỏ
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
                  <span>{{ isEditMode() ? 'Lưu thay đổi' : 'Thêm thương hiệu' }}</span>
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
export class BrandFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly brandService = inject(AdminBrandService);

  readonly isOpen = input<boolean>(false);
  readonly brand = input<AdminBrand | null>(null);

  readonly closeDialog = output<void>();
  readonly saved = output<AdminBrand>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly autoSlugEnabled = signal<boolean>(true);

  readonly isEditMode = computed(() => this.brand() !== null);

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    description: [''],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      const currentBrand = this.brand();
      if (this.isOpen()) {
        this.errorMessage.set(null);
        if (currentBrand) {
          this.autoSlugEnabled.set(false);
          this.form.reset({
            name: currentBrand.name,
            slug: currentBrand.slug,
            description: currentBrand.description ?? '',
            isActive: currentBrand.isActive,
          });
        } else {
          this.autoSlugEnabled.set(true);
          this.form.reset({
            name: '',
            slug: '',
            description: '',
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

  onNameInput(): void {
    if (!this.isEditMode() && this.autoSlugEnabled()) {
      const nameValue = this.form.get('name')?.value || '';
      const generatedSlug = slugify(nameValue);
      this.form.get('slug')?.setValue(generatedSlug, { emitEvent: false });
    }
  }

  onSlugManualInput(): void {
    this.autoSlugEnabled.set(false);
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
      return 'Slug chỉ gồm chữ thường không dấu, số và gạch ngang';
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
    const validationResult = brandFormSchema.safeParse({
      name: formRaw.name,
      slug: formRaw.slug,
      description: formRaw.description || undefined,
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
      let savedBrand: AdminBrand;
      const targetBrand = this.brand();

      if (targetBrand) {
        const payload: UpdateBrandPayload = {
          name: validationResult.data.name,
          slug: validationResult.data.slug,
          description: validationResult.data.description ?? null,
          isActive: validationResult.data.isActive,
        };
        savedBrand = await this.brandService.updateBrand(targetBrand.id, payload);
      } else {
        const payload: CreateBrandPayload = {
          name: validationResult.data.name,
          slug: validationResult.data.slug,
          description: validationResult.data.description ?? null,
          isActive: validationResult.data.isActive,
        };
        savedBrand = await this.brandService.createBrand(payload);
      }

      this.saved.emit(savedBrand);
      this.onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu thương hiệu';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
