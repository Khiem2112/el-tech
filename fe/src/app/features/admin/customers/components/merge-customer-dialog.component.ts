import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
  AdminCustomerDetail,
  AdminCustomerMergeCandidate,
  AdminCustomerMergeResult,
  AdminCustomerService,
} from '../services/admin-customer.service';

@Component({
  selector: 'app-merge-customer-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
          class="relative bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl w-full max-w-xl p-6 space-y-4 text-xs text-slate-200"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between border-b border-[#272f3d] pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded bg-[#090d16] border border-[#272f3d] text-[#76b900] font-mono text-[10px] font-bold">
                  MOD-37
                </span>
                <h2 id="merge-modal-title" class="font-bold text-white uppercase text-sm">
                  Gộp Hồ Sơ Khách Hàng
                </h2>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Hồ sơ chính: <strong class="text-white">{{ target.name }}</strong> ({{ target.phone }})
              </p>
            </div>
            <button
              type="button"
              (click)="handleClose()"
              class="p-1 rounded hover:bg-[#272f3d] text-slate-400 hover:text-white transition-colors"
              title="Đóng hộp thoại"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-200 text-xs">
            Toàn bộ các đơn hàng, lượt sử dụng coupon, đánh giá sản phẩm và thông báo của hồ sơ phụ sẽ được chuyển nhượng quyền sở hữu sang hồ sơ chính. Hồ sơ phụ sẽ bị vô hiệu hóa và đánh dấu liên kết.
          </div>

          @if (errorMessage()) {
            <div class="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-xs">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="mergeForm" (ngSubmit)="submitMerge()" class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="candidate-select" class="block font-semibold text-slate-300 uppercase text-[11px]">
                  Chọn Hồ Sơ Phụ Cần Gộp Vào
                </label>
                @if (isLoadingCandidates()) {
                  <span class="text-slate-400 text-[10px]">Đang tải danh sách gợi ý...</span>
                }
              </div>

              <div class="space-y-2">
                <div class="flex gap-2">
                  <input
                    type="text"
                    [value]="candidateSearchQuery()"
                    (input)="onCandidateSearchInput($event)"
                    placeholder="Tìm theo tên, SĐT hoặc email..."
                    class="flex-1 px-3 py-1.5 bg-[#090d16] border border-[#272f3d] rounded text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#76b900]"
                  />
                  <button
                    type="button"
                    (click)="searchCandidates()"
                    class="px-3 py-1.5 bg-[#272f3d] hover:bg-[#323d4e] text-slate-200 font-semibold rounded text-xs transition-colors"
                  >
                    Tìm kiếm
                  </button>
                </div>

                <select
                  id="candidate-select"
                  formControlName="sourceCustomerId"
                  (change)="onCandidateSelected($event)"
                  class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-slate-200 focus:outline-none focus:border-[#76b900] text-xs font-medium"
                >
                  <option value="" disabled>-- Chọn hồ sơ trùng khớp hoặc khách vãng lai --</option>
                  @for (candidate of candidates(); track candidate.id) {
                    <option [value]="candidate.id">
                      {{ candidate.name }} ({{ candidate.phone }} - {{ candidate.email }}) | {{ candidate.isRegistered ? 'Thành viên' : 'Khách vãng lai' }} | {{ candidate.orderCount }} đơn ({{ formatCurrency(candidate.totalSpent) }})
                    </option>
                  }
                </select>
              </div>

              @if (candidates().length === 0 && !isLoadingCandidates()) {
                <p class="text-slate-400 text-[11px] mt-1 italic">
                  Không tìm thấy hồ sơ phụ khả dụng trùng số điện thoại hoặc email. Hãy nhập từ khóa tìm kiếm ở trên.
                </p>
              }
            </div>

            @if (selectedCandidate(); as source) {
              <div class="p-3 bg-[#090d16] border border-[#272f3d] rounded-lg space-y-2 text-xs">
                <div class="text-[11px] font-bold text-[#76b900] uppercase tracking-wider">
                  Bản So Sánh Chuyển Giao Dữ Liệu
                </div>
                <div class="grid grid-cols-2 gap-3 text-slate-300">
                  <div class="p-2.5 rounded bg-[#161b26] border border-[#272f3d]/60">
                    <span class="text-slate-500 block text-[10px] uppercase font-bold">Hồ sơ phụ (sẽ vô hiệu hóa)</span>
                    <div class="font-bold text-white mt-1">{{ source.name }}</div>
                    <div class="text-slate-400 font-mono text-[11px]">{{ source.phone }}</div>
                    <div class="text-slate-400 text-[11px] truncate">{{ source.email }}</div>
                    <div class="mt-2 text-[11px] pt-1.5 border-t border-[#272f3d]">
                      Đơn hàng chuyển đi: <strong class="text-amber-400 tabular-nums">{{ source.orderCount }} đơn</strong>
                    </div>
                    <div class="text-[11px]">
                      Giá trị tích lũy: <strong class="text-white tabular-nums">{{ formatCurrency(source.totalSpent) }}</strong>
                    </div>
                  </div>

                  <div class="p-2.5 rounded bg-[#161b26] border border-[#76b900]/30">
                    <span class="text-[#76b900] block text-[10px] uppercase font-bold">Hồ sơ chính (tiếp nhận)</span>
                    <div class="font-bold text-white mt-1">{{ target.name }}</div>
                    <div class="text-slate-400 font-mono text-[11px]">{{ target.phone }}</div>
                    <div class="text-slate-400 text-[11px] truncate">{{ target.email }}</div>
                    <div class="mt-2 text-[11px] pt-1.5 border-t border-[#272f3d]">
                      Tổng đơn sau gộp: <strong class="text-[#76b900] tabular-nums">{{ target.stats.orderCount + source.orderCount }} đơn</strong>
                    </div>
                    <div class="text-[11px]">
                      Tổng chi tiêu sau gộp: <strong class="text-[#76b900] tabular-nums">{{ formatCurrency(target.stats.totalSpent + source.totalSpent) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            }

            <div>
              <label for="merge-reason" class="block font-semibold text-slate-300 uppercase text-[11px] mb-1">
                Lý Do Gộp Hồ Sơ Bắt Buộc <span class="text-red-400">*</span>
              </label>
              <textarea
                id="merge-reason"
                formControlName="reason"
                rows="2"
                placeholder="Ví dụ: Khách mua hàng vãng lai sau đó đăng ký tài khoản thành viên với cùng số điện thoại..."
                class="w-full px-3 py-2 bg-[#090d16] border border-[#272f3d] rounded text-slate-200 text-xs focus:outline-none focus:border-[#76b900]"
              ></textarea>
              @if (mergeForm.get('reason')?.touched && mergeForm.get('reason')?.errors?.['required']) {
                <p class="text-red-400 text-[11px] mt-0.5">Vui lòng nhập lý do hợp nhất hồ sơ.</p>
              }
              @if (mergeForm.get('reason')?.touched && mergeForm.get('reason')?.errors?.['minlength']) {
                <p class="text-red-400 text-[11px] mt-0.5">Lý do tối thiểu 3 ký tự.</p>
              }
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#272f3d]">
              <button
                type="button"
                (click)="handleClose()"
                [disabled]="isSubmitting()"
                class="px-4 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] rounded text-slate-300 font-semibold text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                [disabled]="mergeForm.invalid || isSubmitting()"
                class="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
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

  onCandidateSelected(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const candidateId = target.value;
    const match = this.candidates().find((c) => c.id === candidateId) ?? null;
    this.selectedCandidate.set(match);
  }

  async submitMerge(): Promise<void> {
    if (this.mergeForm.invalid) {
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
