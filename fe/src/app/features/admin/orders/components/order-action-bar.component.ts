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
    <div class="bg-surface border border-line rounded-lg p-3 sm:p-4 flex items-center justify-between flex-wrap gap-3 shadow-card text-foreground">
      <div class="flex items-center gap-2 flex-wrap">
        @if (primaryAction(); as pAction) {
          <button
            type="button"
            (click)="onActionClick(pAction)"
            [attr.data-modal-id]="pAction.modalId"
            class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs rounded transition-opacity shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <span>{{ pAction.label }}</span>
          </button>
        }

        @if (standardActions().length > 0) {
          <div class="relative inline-block text-left">
            <button
              type="button"
              (click)="toggleWorkflowMenu()"
              class="px-3 py-2 bg-surface-alt hover:bg-surface border border-line text-foreground font-semibold text-xs rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Quy trình tiếp theo</span>
              <svg class="w-3 h-3 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            @if (isWorkflowMenuOpen()) {
              <div
                class="absolute left-0 mt-1 w-64 bg-surface border border-line rounded-lg shadow-xl py-1 z-30 text-xs"
              >
                <div class="px-3 py-1.5 text-xs font-bold text-muted uppercase tracking-wider border-b border-line bg-surface-alt">
                  Chuyển trạng thái
                </div>
                @for (action of standardActions(); track action.actionKey) {
                  <button
                    type="button"
                    (click)="onActionClick(action)"
                    [attr.data-modal-id]="action.modalId"
                    class="w-full text-left px-3 py-2 hover:bg-surface-alt text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>{{ action.label }}</span>
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
              class="px-3 py-2 bg-surface-alt hover:bg-surface border border-line text-foreground font-semibold text-xs rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ngoại lệ & Thao tác khác</span>
              <svg class="w-3 h-3 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            @if (isExceptionMenuOpen()) {
              <div
                class="absolute left-0 mt-1 w-64 bg-surface border border-line rounded-lg shadow-xl py-1 z-30 text-xs"
              >
                <div class="px-3 py-1.5 text-xs font-bold text-muted uppercase tracking-wider border-b border-line bg-surface-alt">
                  Thao tác điều chỉnh
                </div>
                @for (action of exceptionActions(); track action.actionKey) {
                  <button
                    type="button"
                    (click)="onActionClick(action)"
                    [attr.data-modal-id]="action.modalId"
                    class="w-full text-left px-3 py-2 hover:bg-surface-alt flex items-center justify-between transition-colors"
                    [class.text-rose-600]="action.isDestructive"
                    [class.dark:text-rose-400]="action.isDestructive"
                    [class.hover:bg-rose-500/10]="action.isDestructive"
                    [class.text-amber-700]="!action.isDestructive && action.actionKey === 'HOLD_ORDER'"
                    [class.dark:text-amber-400]="!action.isDestructive && action.actionKey === 'HOLD_ORDER'"
                    [class.text-foreground]="!action.isDestructive && action.actionKey !== 'HOLD_ORDER'"
                  >
                    <span>{{ action.label }}</span>
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
          class="px-3 py-2 bg-surface-alt hover:bg-surface border border-line text-foreground text-xs font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer shadow-card"
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
