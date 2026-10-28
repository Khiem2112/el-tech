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
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  SelectComponent,
  SelectOption,
} from '../../../../components/atoms/select/select.component';
import {
  AdminCustomerDetail,
  AdminCustomerMergeCandidate,
  AdminCustomerMergeResult,
  AdminCustomerService,
} from '../services/admin-customer.service';

@Component({
  selector: 'app-merge-customer-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen() && targetCustomer(); as target) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="merge-modal-title"
      >
        <div
          class="relative bg-surface border border-line rounded-lg shadow-xl w-full max-w-xl p-5 space-y-4 text-sm text-foreground"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 id="merge-modal-title" class="font-semibold text-foreground uppercase text-base">
                Gộp Hồ Sơ Khách Hàng
              </h2>
              <p class="text-xs text-muted mt-0.5">
                Hồ sơ chính: <strong class="text-foreground">{{ target.name }}</strong> ({{ target.phone }})
              </p>
            </div>
            <button
              type="button"
              (click)="handleClose()"
              class="p-1 rounded hover:bg-surface-alt text-muted hover:text-foreground transition-colors cursor-pointer"
              title="Đóng hộp thoại"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-800 dark:text-amber-300 text-xs">
            Toàn bộ đơn hàng, voucher và dữ liệu của hồ sơ phụ sẽ được chuyển sang hồ sơ chính. Thao tác này không thể hoàn tác.
          </div>

          @if (errorMessage()) {
            <div class="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-700 dark:text-red-400 text-xs">
              {{ errorMessage() }}
            </div>
          }

          @if (selectedCandidate()?.isRegistered) {
            <div class="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-700 dark:text-red-400 text-xs font-medium">
              Không thể sáp nhập hồ sơ đã có tài khoản thành viên. Chỉ được phép gộp hồ sơ khách vãng lai vào hồ sơ khách hàng chính.
            </div>
          }

          <form [formGroup]="mergeForm" (ngSubmit)="submitMerge()" class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="candidate-select" class="block font-semibold text-foreground uppercase text-xs">
                  Chọn Hồ Sơ Phụ Cần Gộp Vào
                </label>
                @if (isLoadingCandidates()) {
                  <span class="text-muted text-xs">Đang tải danh sách gợi ý...</span>
                }
              </div>

              <div class="space-y-2">
                <div class="flex gap-2">
                  <input
                    type="text"
                    [value]="candidateSearchQuery()"
                    (input)="onCandidateSearchInput($event)"
                    placeholder="Tìm theo tên, SĐT hoặc email..."
                    class="flex-1 px-3 py-1.5 bg-surface border border-line rounded text-foreground text-xs placeholder:text-muted focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    (click)="searchCandidates()"
                    class="px-3 py-1.5 bg-surface-alt hover:bg-surface-elevated border border-line text-foreground font-semibold rounded text-xs transition-colors"
                  >
                    Tìm kiếm
                  </button>
                </div>

                <app-select
                  id="candidate-select"
                  formControlName="sourceCustomerId"
                  [options]="candidateOptions()"
                  (valueChange)="onCandidateSelectedValue($event)"
                  size="sm"
                  class="w-full"
                />
              </div>

              @if (candidates().length === 0 && !isLoadingCandidates()) {
                <p class="text-muted text-xs mt-1 italic">
                  Không tìm thấy hồ sơ phụ khả dụng trùng số điện thoại hoặc email. Hãy nhập từ khóa tìm kiếm ở trên.
                </p>
              }
            </div>

            @if (selectedCandidate(); as source) {
              <div class="p-3 bg-surface-alt border border-line rounded-lg space-y-2 text-xs">
                <div class="text-xs font-bold text-primary uppercase tracking-wider">
                  Bản So Sánh Chuyển Giao Dữ Liệu
                </div>
                <div class="grid grid-cols-2 gap-3 text-foreground">
                  <div class="p-2.5 rounded bg-surface border border-line">
                    <span class="text-muted block text-xs uppercase font-bold">Hồ sơ phụ (sẽ vô hiệu hóa)</span>
                    <div class="font-bold text-foreground mt-1">{{ source.name }}</div>
                    <div class="text-muted text-xs tabular-nums">{{ source.phone }}</div>
                    <div class="text-muted text-xs truncate">{{ source.email }}</div>
                    <div class="mt-2 text-xs pt-1.5 border-t border-line">
                      Đơn hàng chuyển đi: <strong class="text-amber-600 whitespace-nowrap tabular-nums">{{ source.orderCount }} đơn</strong>
                    </div>
                    <div class="text-xs">
                      Giá trị tích lũy: <strong class="text-foreground whitespace-nowrap tabular-nums">{{ formatCurrency(source.totalSpent) }}</strong>
                    </div>
                  </div>

                  <div class="p-2.5 rounded bg-surface border border-primary/30">
                    <span class="text-primary block text-xs uppercase font-bold">Hồ sơ chính (tiếp nhận)</span>
                    <div class="font-bold text-foreground mt-1">{{ target.name }}</div>
                    <div class="text-muted text-xs tabular-nums">{{ target.phone }}</div>
                    <div class="text-muted text-xs truncate">{{ target.email }}</div>
                    <div class="mt-2 text-xs pt-1.5 border-t border-line">
                      Tổng đơn sau gộp: <strong class="text-primary whitespace-nowrap tabular-nums">{{ target.stats.orderCount + source.orderCount }} đơn</strong>
                    </div>
                    <div class="text-xs">
                      Tổng chi tiêu sau gộp: <strong class="text-primary whitespace-nowrap tabular-nums">{{ formatCurrency(target.stats.totalSpent + source.totalSpent) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            }

            <div>
              <label for="merge-reason" class="block font-semibold text-foreground uppercase text-xs mb-1">
                Lý Do Gộp Hồ Sơ Bắt Buộc <span class="text-red-500">*</span>
              </label>
              <textarea
                id="merge-reason"
                formControlName="reason"
                rows="2"
                placeholder="Ví dụ: Khách mua hàng vãng lai sau đó đăng ký tài khoản thành viên với cùng số điện thoại..."
                class="w-full px-3 py-2 bg-surface border border-line rounded text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-primary"
              ></textarea>
              @if (mergeForm.get('reason')?.touched && mergeForm.get('reason')?.errors?.['required']) {
                <p class="text-red-500 text-xs mt-0.5">Vui lòng nhập lý do hợp nhất hồ sơ.</p>
              }
              @if (mergeForm.get('reason')?.touched && mergeForm.get('reason')?.errors?.['minlength']) {
                <p class="text-red-500 text-xs mt-0.5">Lý do tối thiểu 3 ký tự.</p>
              }
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                (click)="handleClose()"
                [disabled]="isSubmitting()"
                class="px-4 py-2 bg-surface hover:bg-surface-alt border border-line rounded text-foreground font-semibold text-sm transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                [disabled]="mergeForm.invalid || isSubmitting() || selectedCandidate()?.isRegistered"
                class="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded text-sm transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                @if (isSubmitting()) {
                  <span>Đang thực hiện...</span>
                } @else {
                  <span>Xác nhận gộp hồ sơ</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class MergeCustomerDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(AdminCustomerService);

  readonly isOpen = input<boolean>(false);
  readonly targetCustomer = input<AdminCustomerDetail | null>(null);

  readonly close = output<void>();
  readonly merged = output<AdminCustomerMergeResult>();

  readonly candidates = signal<readonly AdminCustomerMergeCandidate[]>([]);
  readonly selectedCandidate = signal<AdminCustomerMergeCandidate | null>(null);
  readonly candidateSearchQuery = signal<string>('');
  readonly isLoadingCandidates = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly candidateOptions = computed<readonly SelectOption[]>(() => {
    const list = this.candidates();
    if (list.length === 0) {
      return [
        {
          value: '',
          label: '-- Không có hồ sơ phụ phù hợp --',
        },
      ];
    }
    return [
      {
        value: '',
        label: '-- Chọn hồ sơ trùng khớp hoặc khách vãng lai --',
      },
      ...list.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.phone} - ${c.email}) | ${c.isRegistered ? 'Thành viên' : 'Khách vãng lai'} | ${c.orderCount} đơn (${this.formatCurrency(c.totalSpent)})`,
      })),
    ];
  });

  readonly mergeForm = this.fb.group({
    sourceCustomerId: ['', [Validators.required]],
    reason: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const target = this.targetCustomer();
      if (open && target) {
        this.resetDialogState();
        this.loadCandidates(target.id);
      }
    });
  }

  private resetDialogState(): void {
    this.mergeForm.reset({ sourceCustomerId: '', reason: '' });
    this.selectedCandidate.set(null);
    this.candidateSearchQuery.set('');
    this.errorMessage.set(null);
    this.candidates.set([]);
  }

  async loadCandidates(targetId: string, search?: string): Promise<void> {
    this.isLoadingCandidates.set(true);
    this.errorMessage.set(null);

    try {
      const result = await this.customerService.getMergeCandidates(targetId, search);
      this.candidates.set(result);
      if (result.length > 0 && !this.selectedCandidate()) {
        const firstCandidate = result[0];
        this.mergeForm.patchValue({ sourceCustomerId: firstCandidate.id });
        this.selectedCandidate.set(firstCandidate);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách hồ sơ gợi ý';
      this.errorMessage.set(message);
    } finally {
      this.isLoadingCandidates.set(false);
    }
  }

  onCandidateSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.candidateSearchQuery.set(target.value);
  }

  searchCandidates(): void {
    const target = this.targetCustomer();
    if (target) {
      this.loadCandidates(target.id, this.candidateSearchQuery());
    }
  }

  onCandidateSelectedValue(candidateId: string): void {
    this.mergeForm.patchValue({ sourceCustomerId: candidateId });
    const match = this.candidates().find((c) => c.id === candidateId) ?? null;
    this.selectedCandidate.set(match);
  }

  async submitMerge(): Promise<void> {
    if (this.mergeForm.invalid || this.selectedCandidate()?.isRegistered) {
      this.mergeForm.markAllAsTouched();
      return;
    }

    const target = this.targetCustomer();
    if (!target) {
      return;
    }

    const { sourceCustomerId, reason } = this.mergeForm.value;
    if (!sourceCustomerId || !reason) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const result = await this.customerService.mergeCustomer(target.id, {
        sourceCustomerId,
        reason,
      });
      this.merged.emit(result);
      this.handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Thao tác gộp hồ sơ thất bại';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  handleClose(): void {
    this.close.emit();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }
}
