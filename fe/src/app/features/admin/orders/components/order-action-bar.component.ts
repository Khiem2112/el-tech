import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { AdminOrderDetail, AdminOrderTransition } from '../services/admin-order-detail.service';

export type ActionTriggerEvent = {
  actionKey: string;
  modalId?: string;
  targetStatus: string;
  label: string;
};

@Component({
  selector: 'app-order-action-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#161b26] border border-[#272f3d] rounded-lg p-3 sm:p-4 flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-2 flex-wrap">
        @if (primaryAction(); as pAction) {
          <button
            type="button"
            (click)="onActionClick(pAction)"
            class="px-4 py-2 bg-[#76b900] hover:bg-[#5a8d00] text-[#090d16] font-bold text-xs rounded transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <span>{{ pAction.label }}</span>
            @if (pAction.modalId) {
              <span class="text-[10px] opacity-75 font-mono">({{ pAction.modalId }})</span>
            }
          </button>
        }

        @if (standardActions().length > 0) {
          <div class="relative inline-block text-left">
            <button
              type="button"
              (click)="toggleWorkflowMenu()"
              class="px-3 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs rounded flex items-center gap-1 cursor-pointer"
            >
              <span>Quy trình tiếp theo</span>
              <svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            @if (isWorkflowMenuOpen()) {
              <div
                class="absolute left-0 mt-1 w-64 bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl py-1 z-30 text-xs"
              >
                <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#272f3d]">
                  Chuyển trạng thái
                </div>
                @for (action of standardActions(); track action.actionKey) {
                  <button
                    type="button"
                    (click)="onActionClick(action)"
                    class="w-full text-left px-3 py-2 hover:bg-[#272f3d] text-slate-200 hover:text-white flex items-center justify-between"
                  >
                    <span>{{ action.label }}</span>
                    @if (action.modalId) {
                      <span class="text-[10px] text-slate-400 font-mono">{{ action.modalId }}</span>
                    }
                  </button>
                }
              </div>
            }
          </div>
        }

        @if (exceptionActions().length > 0) {
          <div class="relative inline-block text-left">
            <button
              type="button"
              (click)="toggleExceptionMenu()"
              class="px-3 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-white font-semibold text-xs rounded flex items-center gap-1 cursor-pointer"
            >
              <span>Ngoại lệ & Thao tác khác</span>
              <svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            @if (isExceptionMenuOpen()) {
              <div
                class="absolute left-0 mt-1 w-64 bg-[#161b26] border border-[#272f3d] rounded-lg shadow-xl py-1 z-30 text-xs"
              >
                <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#272f3d]">
                  Thao tác điều chỉnh
                </div>
                @for (action of exceptionActions(); track action.actionKey) {
                  <button
                    type="button"
                    (click)="onActionClick(action)"
                    class="w-full text-left px-3 py-2 hover:bg-[#272f3d] flex items-center justify-between"
                    [class.text-rose-400]="action.isDestructive"
                    [class.hover:bg-rose-500/10]="action.isDestructive"
                    [class.text-amber-300]="!action.isDestructive && action.actionKey === 'HOLD_ORDER'"
                    [class.text-slate-200]="!action.isDestructive && action.actionKey !== 'HOLD_ORDER'"
                  >
                    <span>{{ action.label }}</span>
                    @if (action.modalId) {
                      <span class="text-[10px] font-mono opacity-70">{{ action.modalId }}</span>
                    }
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="refreshRequested.emit()"
          class="px-3 py-2 bg-[#090d16] hover:bg-[#272f3d] border border-[#272f3d] text-slate-300 hover:text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
          title="Tải lại dữ liệu chi tiết đơn hàng"
        >
          <span>Làm mới dữ liệu</span>
        </button>
      </div>
    </div>
  `,
})
export class OrderActionBarComponent {
  readonly order = input.required<AdminOrderDetail>();

  readonly actionTriggered = output<ActionTriggerEvent>();
  readonly refreshRequested = output<void>();

  readonly isWorkflowMenuOpen = signal<boolean>(false);
  readonly isExceptionMenuOpen = signal<boolean>(false);

  readonly primaryAction = computed<AdminOrderTransition | null>(() => {
    const transitions = this.order().availableTransitions;
    return transitions.find((t) => t.isPrimary) || null;
  });

  readonly standardActions = computed<AdminOrderTransition[]>(() => {
    const transitions = this.order().availableTransitions;
    return transitions.filter(
      (t) =>
        !t.isPrimary &&
        !t.isDestructive &&
        t.actionKey !== 'HOLD_ORDER' &&
        t.actionKey !== 'AMENDMENT' &&
        t.actionKey !== 'PICKUP_TO_DELIVERY' &&
        t.actionKey !== 'RESOLVE_QR_DISCREPANCY' &&
        t.actionKey !== 'MANUAL_REFUND',
    );
  });

  readonly exceptionActions = computed<AdminOrderTransition[]>(() => {
    const transitions = this.order().availableTransitions;
    return transitions.filter(
      (t) =>
        t.isDestructive ||
        t.actionKey === 'HOLD_ORDER' ||
        t.actionKey === 'AMENDMENT' ||
        t.actionKey === 'PICKUP_TO_DELIVERY' ||
        t.actionKey === 'RESOLVE_QR_DISCREPANCY' ||
        t.actionKey === 'MANUAL_REFUND',
    );
  });

  toggleWorkflowMenu(): void {
    this.isWorkflowMenuOpen.update((v) => !v);
    this.isExceptionMenuOpen.set(false);
  }

  toggleExceptionMenu(): void {
    this.isExceptionMenuOpen.update((v) => !v);
    this.isWorkflowMenuOpen.set(false);
  }

  onActionClick(action: AdminOrderTransition): void {
    this.isWorkflowMenuOpen.set(false);
    this.isExceptionMenuOpen.set(false);
    this.actionTriggered.emit({
      actionKey: action.actionKey,
      modalId: action.modalId,
      targetStatus: action.targetStatus,
      label: action.label,
    });
  }
}
