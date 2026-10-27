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
import { Router } from '@angular/router';
import { z } from 'zod';
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
import { SelectComponent, SelectOption } from '../../../../components/atoms/select/select.component';
import {
  AdminCategory,
  AdminCategoryService,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../services/admin-category.service';

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ten danh muc toi thieu 2 ky tu')
    .max(150, 'Ten danh muc toi da 150 ky tu'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug toi thieu 2 ky tu')
    .max(150, 'Slug toi da 150 ky tu')
    .regex(/^[a-z0-9-]+$/, 'Slug chi chua chu thuong khong dau, so va gach noi'),
  parentId: z.number().nullable().optional(),
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
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonDirective, SelectComponent],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        data-modal-id="MOD-01"
        [attr.aria-labelledby]="'category-modal-title'"
      >
        <div
          class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 text-sm text-foreground"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 id="category-modal-title" class="font-bold text-foreground uppercase text-base tracking-wide">
                {{ isEditMode() ? 'Chỉnh Sửa Danh Mục Ngành Hàng' : 'Thêm Danh Mục Ngành Hàng' }}
              </h2>
              <p class="text-xs text-muted mt-0.5">
                {{ isEditMode() ? 'Cập nhật thông tin phân cấp và thuộc tính danh mục' : 'Tạo mới danh mục ngành hàng phần cứng và linh kiện PC' }}
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

          @if (isEditMode() && categoryToEdit(); as cat) {
            <div class="grid grid-cols-3 gap-2 p-2 bg-surface-alt/70 border border-line rounded">
              <button
                type="button"
                (click)="navigateToTemplates(cat)"
                class="p-1.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
                title="Xem danh sách mẫu sản phẩm thuộc danh mục này"
              >
                <div class="text-sm font-bold text-foreground group-hover:text-primary tabular-nums transition-colors">
                  {{ cat.productTemplateCount }}
                </div>
                <div class="text-[11px] text-muted uppercase mt-0.5 font-medium">Sản Phẩm</div>
              </button>

              <button
                type="button"
                (click)="navigateToInventory(cat)"
                class="p-1.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
                title="Xem tổng tồn kho linh kiện của danh mục này"
              >
                <div class="text-sm font-bold text-emerald-700 group-hover:scale-105 tabular-nums transition-transform">
                  {{ cat.totalInventory }}
                </div>
                <div class="text-[11px] text-muted uppercase mt-0.5 font-medium">Tồn Kho</div>
              </button>

              <button
                type="button"
                (click)="navigateToTransfers(cat)"
                class="p-1.5 bg-surface hover:bg-surface-alt border border-line rounded text-center transition-colors cursor-pointer group"
                title="Xem phiếu điều chuyển kho đang xử lý của danh mục này"
              >
                <div class="text-sm font-bold text-blue-700 group-hover:scale-105 tabular-nums transition-transform">
                  {{ cat.activeTransfers }}
                </div>
                <div class="text-[11px] text-muted uppercase mt-0.5 font-medium">Chuyển Kho</div>
              </button>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="name" class="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Tên danh mục ngành hàng <span class="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                formControlName="name"
                (input)="onNameInput()"
                placeholder="Ví dụ: Bo Mạch Chủ (Mainboard)"
                class="w-full px-3 py-2 bg-surface-alt border rounded text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                [ngClass]="getFieldClass('name')"
              />
              @if (isFieldInvalid('name')) {
                <p class="text-rose-500 text-xs mt-1">{{ getFieldError('name') }}</p>
              }
            </div>

            <div>
              <label for="slug" class="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Mã đường dẫn (Slug) <span class="text-rose-500">*</span>
              </label>
              <input
                id="slug"
                type="text"
                formControlName="slug"
                placeholder="mainboard-bo-mach-chu"
                class="w-full px-3 py-2 bg-surface-alt border rounded text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                [ngClass]="getFieldClass('slug')"
              />
              @if (isFieldInvalid('slug')) {
                <p class="text-rose-500 text-xs mt-1">{{ getFieldError('slug') }}</p>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Danh mục cấp cha (Tùy chọn)
              </label>
              <app-select
                [options]="parentOptions()"
                [value]="selectedParentIdString()"
                (valueChange)="onParentChange($event)"
                size="sm"
              />
            </div>

            <div>
              <label for="description" class="block text-[13px] font-semibold uppercase tracking-wider text-muted mb-1.5">
                Mô tả ngành hàng
              </label>
              <textarea
                id="description"
                rows="3"
                formControlName="description"
                placeholder="Nhập thông tin giới thiệu và quy chuẩn kỹ thuật của ngành hàng..."
                class="w-full px-3 py-2 bg-surface-alt border border-line rounded text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
              ></textarea>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input
                id="isActive"
                type="checkbox"
                formControlName="isActive"
                class="w-4 h-4 rounded bg-surface-alt border-line text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label for="isActive" class="text-[13px] text-foreground cursor-pointer">
                Kích hoạt hiển thị danh mục trong hệ thống và bộ lọc linh kiện
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-line">
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
                  <span>{{ isEditMode() ? 'Cập nhật danh mục' : 'Lưu danh mục' }}</span>
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
export class CategoryFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly router = inject(Router);

  readonly isOpen = input<boolean>(false);
  readonly categoryToEdit = input<AdminCategory | null>(null);
  readonly allCategories = input<AdminCategory[]>([]);

  readonly closeDialog = output<void>();
  readonly saved = output<AdminCategory>();

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  private isSlugManuallyEdited = signal<boolean>(false);

  readonly isEditMode = computed(() => Boolean(this.categoryToEdit()));

  readonly selectableParents = computed(() => {
    const current = this.categoryToEdit();
    const list = this.allCategories();
    if (!current) {
      return list;
    }

    const excludedIds = new Set<number>();
    excludedIds.add(current.id);

    const findDescendants = (parentId: number): void => {
      for (const item of list) {
        if (item.parentId === parentId && !excludedIds.has(item.id)) {
          excludedIds.add(item.id);
          findDescendants(item.id);
        }
      }
    };

    findDescendants(current.id);
    return list.filter((item) => !excludedIds.has(item.id));
  });

  readonly parentOptions = computed<SelectOption[]>(() => {
    const options: SelectOption[] = [
      { value: '', label: 'Không có (Danh mục gốc cấp cao nhất)' },
    ];
    for (const cat of this.selectableParents()) {
      options.push({
        value: String(cat.id),
        label: `${cat.name} (${cat.slug})`,
      });
    }
    return options;
  });

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    slug: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    parentId: [null as number | null],
    description: [''],
    isActive: [true],
  });

  readonly selectedParentIdString = computed(() => {
    const val = this.form.get('parentId')?.value;
    return val !== null && val !== undefined ? String(val) : '';
  });

  onParentChange(val: string): void {
    this.form.patchValue({ parentId: val ? Number(val) : null });
    this.form.get('parentId')?.markAsDirty();
  }

  constructor() {
    effect(() => {
      const category = this.categoryToEdit();
      if (category) {
        this.form.reset({
          name: category.name,
          slug: category.slug,
          parentId: category.parentId,
          description: category.description || '',
          isActive: category.isActive,
        });
        this.isSlugManuallyEdited.set(true);
      } else {
        this.form.reset({
          name: '',
          slug: '',
          parentId: null,
          description: '',
          isActive: true,
        });
        this.isSlugManuallyEdited.set(false);
      }
      this.errorMessage.set(null);
    });
  }

  @HostListener('window:keydown.escape')
  handleEscape(): void {
    if (this.isOpen() && !this.isSubmitting()) {
      this.onClose();
    }
  }

  onNameInput(): void {
    if (!this.isSlugManuallyEdited() && !this.isEditMode()) {
      const nameVal = this.form.get('name')?.value || '';
      const generatedSlug = slugify(nameVal);
      this.form.get('slug')?.setValue(generatedSlug, { emitEvent: false });
    }
  }

  onClose(): void {
    this.form.reset();
    this.errorMessage.set(null);
    this.closeDialog.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return Boolean(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldClass(fieldName: string): Record<string, boolean> {
    const invalid = this.isFieldInvalid(fieldName);
    return {
      'border-rose-500': invalid,
      'border-line': !invalid,
    };
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) {
      return '';
    }
    if (field.errors['required']) {
      return 'Trường này bắt buộc nhập';
    }
    if (field.errors['minlength']) {
      return `Tối thiểu ${field.errors['minlength'].requiredLength} ký tự`;
    }
    if (field.errors['maxlength']) {
      return `Tối đa ${field.errors['maxlength'].requiredLength} ký tự`;
    }
    return 'Dữ liệu không hợp lệ';
  }

  navigateToTemplates(cat: AdminCategory): void {
    this.onClose();
    void this.router.navigate(['/admin/catalog/templates'], {
      queryParams: { categoryId: cat.id, category: cat.slug },
    });
  }

  navigateToInventory(cat: AdminCategory): void {
    this.onClose();
    void this.router.navigate(['/admin/inventory/balances'], {
      queryParams: { categoryId: cat.id, category: cat.slug },
    });
  }

  navigateToTransfers(cat: AdminCategory): void {
    this.onClose();
    void this.router.navigate(['/admin/inventory/transfers'], {
      queryParams: { categoryId: cat.id, category: cat.slug },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const validationResult = categoryFormSchema.safeParse(rawValue);

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      this.errorMessage.set(issue?.message || 'Dữ liệu nhập không hợp lệ');
      return;
    }

    const { name, slug, parentId, description, isActive } = validationResult.data;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const current = this.categoryToEdit();
      let result: AdminCategory;

      if (current) {
        const payload: UpdateCategoryPayload = {
          name,
          slug,
          parentId: parentId ?? null,
          description: description || null,
          isActive,
        };
        result = await this.categoryService.updateCategory(current.id, payload);
      } else {
        const payload: CreateCategoryPayload = {
          name,
          slug,
          parentId: parentId ?? null,
          description: description || null,
          isActive,
        };
        result = await this.categoryService.createCategory(payload);
      }

      this.saved.emit(result);
      this.onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu danh mục ngành hàng';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
