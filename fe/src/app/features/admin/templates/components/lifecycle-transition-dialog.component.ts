import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../../../../components/atoms/button/button.directive';
import {
  AdminProductTemplateService,
  ProductLifecycle,
} from '../services/admin-product-template.service';

@Component({
  selector: 'app-lifecycle-transition-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonDirective],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div data-modal-id="MOD-05" class="bg-surface border border-line rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 text-sm text-foreground">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 class="font-bold text-foreground uppercase text-base">
                Chuyển Trạng Thái Vòng Đời
              </h3>
              <p class="text-xs text-muted mt-0.5">
                {{ targetName() }}
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1.5 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          @if (errorMessage()) {
            <div class="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label class="block font-semibold text-muted uppercase text-xs mb-1.5">
                Chọn Trạng Thái Mục Tiêu
              </label>
              <div class="grid grid-cols-2 gap-2">
                @for (state of availableStates; track state.key) {
                  <button
                    type="button"
                    (click)="selectedState.set(state.key)"
                    [class.border-primary]="selectedState() === state.key"
                    [class.bg-primary/10]="selectedState() === state.key"
                    [class.border-line]="selectedState() !== state.key"
                    [class.bg-surface]="selectedState() !== state.key"
                    class="p-2.5 rounded border text-left transition-all cursor-pointer"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-xs" [class.text-primary]="selectedState() === state.key" [class.text-foreground]="selectedState() !== state.key">
                        {{ state.label }}
                      </span>
                      @if (currentState() === state.key) {
                        <span class="text-xs px-1.5 py-0.5 rounded bg-surface-alt border border-line text-muted">Hiện tại</span>
                      }
                    </div>
                    <p class="text-xs text-muted mt-0.5 truncate">
                      {{ state.description }}
                    </p>
                  </button>
                }
              </div>
            </div>

            @if (targetType() === 'template' && selectedState() === 'ACTIVE') {
              <div class="space-y-2 pt-2 border-t border-line/60">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <span class="text-muted uppercase tracking-wide">Điều Kiện Kích Hoạt (ACTIVE)</span>
                  <span
                    class="px-2 py-0.5 rounded text-xs font-bold"
                    [class.bg-emerald-500/10]="canTransitionToActive()"
                    [class.text-emerald-700]="canTransitionToActive()"
                    [class.bg-destructive/10]="!canTransitionToActive()"
                    [class.text-destructive]="!canTransitionToActive()"
                  >
                    {{ canTransitionToActive() ? 'ĐỦ ĐIỀU KIỆN' : 'CHƯA ĐỦ ĐIỀU KIỆN' }}
                  </span>
                </div>

                <div class="space-y-1.5 text-xs">
                  <div class="flex items-center justify-between py-1 px-2.5 rounded bg-surface-alt border border-line/50">
                    <span class="text-foreground">Thông số kỹ thuật bắt buộc của danh mục</span>
                    <span class="font-bold tabular-nums" [class.text-emerald-700]="isSpecComplete()" [class.text-destructive]="!isSpecComplete()">
                      {{ isSpecComplete() ? 'Đầy đủ' : ('Thiếu: ' + missingSpecKeys().join(', ')) }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between py-1 px-2.5 rounded bg-surface-alt border border-line/50">
                    <span class="text-foreground">Tối thiểu 1 biến thể SKU đang kinh doanh</span>
                    <span class="font-bold tabular-nums" [class.text-emerald-700]="hasActiveVariant()" [class.text-destructive]="!hasActiveVariant()">
                      {{ hasActiveVariant() ? (activeVariantCount() + ' SKU hoạt động') : '0 SKU hoạt động' }}
                    </span>
                  </div>
                </div>
              </div>
            }

            <div>
              <label class="block font-semibold text-muted uppercase text-xs mb-1">
                Lý Do Thay Đổi (Tùy chọn)
              </label>
              <textarea
                [value]="reason()"
                (input)="reason.set($any($event.target).value)"
                rows="2"
                placeholder="Nhập ghi chú lý do thay đổi trạng thái..."
                class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground text-xs focus:outline-none focus:border-primary"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              (click)="onCancel()"
            >
              Hủy
            </button>
            <button
              type="button"
              appButton
              variant="primary"
              size="sm"
              [disabled]="isConfirmDisabled()"
              (click)="onConfirm()"
              class="disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Đang chuyển...' : 'Xác Nhận Chuyển' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifecycleTransitionDialogComponent {
  private readonly templateService = inject(AdminProductTemplateService);

  readonly isOpen = input<boolean>(false);
  readonly targetType = input<'template' | 'variant'>('template');
  readonly targetId = input<number>(0);
  readonly targetName = input<string>('');
  readonly currentState = input<ProductLifecycle>('DRAFT');
  readonly missingSpecKeys = input<string[]>([]);
  readonly activeVariantCount = input<number>(0);

  readonly close = output<void>();
  readonly transitioned = output<{ state: ProductLifecycle; reason?: string }>();

  readonly selectedState = signal<ProductLifecycle>('ACTIVE');
  readonly reason = signal<string>('');
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  readonly availableStates: { key: ProductLifecycle; label: string; description: string }[] = [
    { key: 'DRAFT', label: 'Bản thảo', description: 'Chưa mở bán, chỉ hiển thị nội bộ' },
    { key: 'ACTIVE', label: 'Đang bán', description: 'Mở bán trên toàn hệ thống storefront' },
    { key: 'PAUSED', label: 'Tạm dừng', description: 'Tạm ẩn hoặc khóa mua hàng' },
    { key: 'DISCONTINUED', label: 'Ngừng kinh doanh', description: 'Ngừng sản xuất hoặc dừng vĩnh viễn' },
  ];

  readonly isSpecComplete = computed(() => this.missingSpecKeys().length === 0);
  readonly hasActiveVariant = computed(() => this.activeVariantCount() > 0);

  readonly canTransitionToActive = computed(() => {
    if (this.targetType() !== 'template') {
      return true;
    }
    return this.isSpecComplete() && this.hasActiveVariant();
  });

  readonly isConfirmDisabled = computed(() => {
    if (this.isSubmitting()) {
      return true;
    }
    if (this.selectedState() === this.currentState()) {
      return true;
    }
    if (this.targetType() === 'template' && this.selectedState() === 'ACTIVE') {
      return !this.canTransitionToActive();
    }
    return false;
  });

  constructor() {
    effect(() => {
      const cur = this.currentState();
      this.selectedState.set(cur === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
      this.reason.set('');
      this.errorMessage.set(null);
    });
  }

  onCancel(): void {
    this.close.emit();
  }

  async onConfirm(): Promise<void> {
    const id = this.targetId();
    if (!id) {
      this.errorMessage.set('Không tìm thấy mục tiêu');
      return;
    }

    const state = this.selectedState();
    const reasonText = this.reason().trim() || undefined;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      if (this.targetType() === 'template') {
        await this.templateService.transitionTemplateLifecycle(id, state, reasonText);
      } else {
        await this.templateService.transitionVariantLifecycle(id, state, reasonText);
      }

      this.transitioned.emit({ state, reason: reasonText });
      this.close.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi chuyển trạng thái vòng đời';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
