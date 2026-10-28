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
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
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
  imports: [CommonModule, ReactiveFormsModule, ButtonDirective],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        data-modal-id="MOD-03"
        [attr.aria-labelledby]="'brand-modal-title'"
      >
        <div
          class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 text-sm text-foreground"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 id="brand-modal-title" class="font-bold text-foreground uppercase text-base tracking-wide">
                {{ isEditMode() ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới' }}
              </h2>
              <p class="text-xs text-muted mt-0.5">
                {{ isEditMode() ? 'Cập nhật thông tin chi tiết của hãng sản xuất' : 'Thêm mới hãng sản xuất linh kiện máy tính vào hệ thống' }}
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="p-1 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
              title="Đóng hộp thoại"
              aria-label="Đóng hộp thoại"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          @if (errorMessage()) {
            <div class="p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
            <div>
              <label for="brand-name" class="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Tên thương hiệu <span class="text-rose-500">*</span>
              </label>
              <input
                id="brand-name"
                type="text"
                formControlName="name"
                (input)="onNameInput()"
                placeholder="Ví dụ: ASUS, Corsair, MSI..."
                class="w-full px-3 py-2 bg-surface-alt border border-line rounded text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                [class.border-rose-500]="isFieldInvalid('name')"
              />
              @if (isFieldInvalid('name')) {
                <p class="mt-1 text-xs text-rose-500">
                  {{ getFieldError('name') }}
                </p>
              }
            </div>

            <div>
              <label for="brand-slug" class="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Đường dẫn định danh (Slug) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="brand-slug"
                  type="text"
                  formControlName="slug"
                  (input)="onSlugManualInput()"
                  placeholder="corsair"
                  class="w-full px-3 py-2 bg-surface-alt border border-line rounded text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                  [class.border-rose-500]="isFieldInvalid('slug')"
                />
              </div>
              @if (isFieldInvalid('slug')) {
                <p class="mt-1 text-xs text-rose-500">
                  {{ getFieldError('slug') }}
                </p>
              }
            </div>

            <div>
              <label for="brand-description" class="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Mô tả giới thiệu
              </label>
              <textarea
                id="brand-description"
                rows="3"
                formControlName="description"
                placeholder="Nhập thông tin giới thiệu ngắn gọn về thương hiệu..."
                class="w-full px-3 py-2 bg-surface-alt border border-line rounded text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary resize-y"
              ></textarea>
            </div>

            <div class="pt-2">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  formControlName="isActive"
                  class="w-4 h-4 rounded bg-surface-alt border-line text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span class="text-xs font-medium text-foreground">
                  Kích hoạt trạng thái hoạt động của thương hiệu
                </span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                appButton
                variant="secondary"
                size="sm"
                (click)="onClose()"
                [disabled]="isSubmitting()"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                appButton
                variant="primary"
                size="sm"
                [disabled]="isSubmitting()"
                class="inline-flex items-center gap-1.5"
              >
                @if (isSubmitting()) {
                  <span class="inline-block w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
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
