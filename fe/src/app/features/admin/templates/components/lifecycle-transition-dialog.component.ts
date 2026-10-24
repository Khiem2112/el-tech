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
import {
  AdminProductTemplateService,
  ProductLifecycle,
} from '../services/admin-product-template.service';

@Component({
  selector: 'app-lifecycle-transition-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <div class="bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 text-sm text-slate-200">
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <h3 class="font-bold text-white uppercase text-base">
                Chuyển Trạng Thái Vòng Đời
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ targetName() }} (MOD-05)
              </p>
            </div>
            <button
              type="button"
              (click)="onCancel()"
              class="p-1.5 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Đóng"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          @if (errorMessage()) {
            <div class="p-3 bg-rose-950/50 border border-rose-800 rounded text-rose-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label class="block font-semibold text-slate-400 uppercase text-xs mb-1.5">
                Chọn Trạng Thái Mục Tiêu
              </label>
              <div class="grid grid-cols-2 gap-2">
                @for (state of availableStates; track state.key) {
                  <button
                    type="button"
                    (click)="selectedState.set(state.key)"
                    [class.border-[#76b900]]="selectedState() === state.key"
                    [class.bg-[#76b900]/10]="selectedState() === state.key"
                    [class.border-[#272f3d]]="selectedState() !== state.key"
                    [class.bg-[#090d16]]="selectedState() !== state.key"
                    class="p-2.5 rounded border text-left transition-all"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-xs" [class.text-[#76b900]]="selectedState() === state.key" [class.text-white]="selectedState() !== state.key">
                        {{ state.label }}
                      </span>
                      @if (currentState() === state.key) {
                        <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Hiện tại</span>
                      }
                    </div>
                    <p class="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {{ state.description }}
                    </p>
                  </button>
                }
              </div>
            </div>

            @if (targetType() === 'template' && selectedState() === 'ACTIVE') {
              <div class="space-y-2 bg-[#090d16] p-3.5 rounded border border-[#272f3d]">
                <div class="flex items-center justify-between border-b border-[#272f3d] pb-1.5">
                  <span class="font-bold text-white text-xs uppercase tracking-wide">
                    Kiểm Tra Điều Kiện Kích Hoạt (CAT-008)
                  </span>
                  @if (canTransitionToActive()) {
                    <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-xs font-bold">ĐỦ ĐIỀU KIỆN</span>
                  } @else {
                    <span class="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-xs font-bold">CHƯA ĐẠT</span>
                  }
                </div>

                <div class="space-y-2 pt-1 text-xs">
                  <div class="flex items-start justify-between p-2 rounded border" [class.border-emerald-800]="isSpecComplete()" [class.bg-emerald-950/20]="isSpecComplete()" [class.border-rose-900]="!isSpecComplete()" [class.bg-rose-950/20]="!isSpecComplete()">
                    <div class="pr-2">
                      <span class="font-bold text-white">100% Thông số kỹ thuật bắt buộc</span>
                      @if (missingSpecKeys().length > 0) {
                        <p class="text-rose-400 text-[11px] mt-0.5">
                          Còn thiếu các trường: {{ missingSpecKeys().join(', ') }}
                        </p>
                      } @else {
                        <p class="text-emerald-400 text-[11px] mt-0.5">
                          Đã điền đầy đủ tất cả thông số bắt buộc của danh mục.
                        </p>
                      }
                    </div>
                    <span class="font-bold" [class.text-emerald-400]="isSpecComplete()" [class.text-rose-400]="!isSpecComplete()">
                      {{ isSpecComplete() ? 'ĐẠT' : 'THIẾU' }}
                    </span>
                  </div>

                  <div class="flex items-start justify-between p-2 rounded border" [class.border-emerald-800]="hasActiveVariant()" [class.bg-emerald-950/20]="hasActiveVariant()" [class.border-rose-900]="!hasActiveVariant()" [class.bg-rose-950/20]="!hasActiveVariant()">
                    <div class="pr-2">
                      <span class="font-bold text-white">Tối thiểu 1 biến thể SKU hoạt động</span>
                      @if (activeVariantCount() > 0) {
                        <p class="text-emerald-400 text-[11px] mt-0.5">
                          Có {{ activeVariantCount() }} biến thể đang ở trạng thái ACTIVE.
                        </p>
                      } @else {
                        <p class="text-rose-400 text-[11px] mt-0.5">
                          Chưa có biến thể SKU nào ở trạng thái ACTIVE. Vui lòng kích hoạt ít nhất 1 SKU trước.
                        </p>
                      }
                    </div>
                    <span class="font-bold" [class.text-emerald-400]="hasActiveVariant()" [class.text-rose-400]="!hasActiveVariant()">
                      {{ hasActiveVariant() ? 'ĐẠT' : 'THIẾU' }}
                    </span>
                  </div>
                </div>
              </div>
            }

            <div>
              <label class="block font-semibold text-slate-400 uppercase text-xs mb-1">
                Lý Do Chuyển Trạng Thái (Tùy chọn)
              </label>
              <textarea
                [value]="reason()"
                (input)="reason.set($any($event.target).value)"
                rows="2"
                placeholder="Nhập ghi chú lý do thay đổi trạng thái..."
                class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-white text-xs focus:outline-none focus:border-[#76b900]"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#272f3d]">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 bg-[#272f3d] hover:bg-[#343e50] text-slate-200 rounded font-semibold text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              [disabled]="isConfirmDisabled()"
              (click)="onConfirm()"
              class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold rounded text-xs transition-colors disabled:opacity-50"
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
