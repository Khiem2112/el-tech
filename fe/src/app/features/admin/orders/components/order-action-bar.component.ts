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
    <div class="bg-surface border border-line rounded-lg p-3 sm:p-3.5 flex items-center justify-between flex-wrap gap-3 text-foreground">
      <div class="flex items-center gap-2 flex-wrap">
        @if (primaryAction(); as pAction) {
          <button
            type="button"
            (click)="onActionClick(pAction)"
            [attr.data-modal-id]="pAction.modalId"
            class="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm rounded transition-opacity flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <span>{{ pAction.label }}</span>
          </button>
        }

        @if (hasSecondaryActions()) {
          <div class="relative inline-block text-left">
            <button
              type="button"
              (click)="toggleMenu()"
              class="px-3 py-2 bg-surface-alt hover:bg-surface border border-line text-foreground font-medium text-sm rounded flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Thao tác khác</span>
              <svg class="w-3.5 h-3.5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (isMenuOpen()) {
              <div class="fixed inset-0 z-20" (click)="closeMenu()"></div>
              <div
                class="absolute left-0 mt-1 w-64 bg-surface border border-line rounded-lg shadow-xl py-1 z-30 text-sm"
              >
                @if (standardActions().length > 0) {
                  <div class="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider border-b border-line bg-surface-alt">
                    Chuyển trạng thái
                  </div>
                  @for (action of standardActions(); track action.actionKey) {
                    <button
                      type="button"
                      (click)="onActionClick(action)"
                      [attr.data-modal-id]="action.modalId"
                      class="w-full text-left px-3 py-2 hover:bg-surface-alt text-foreground flex items-center justify-between transition-colors text-sm"
                    >
                      <span>{{ action.label }}</span>
                    </button>
                  }
                }

                @if (exceptionActions().length > 0) {
                  <div class="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider border-b border-line bg-surface-alt" [class.border-t]="standardActions().length > 0">
                    Ngoại lệ & Thao tác phụ
                  </div>
                  @for (action of exceptionActions(); track action.actionKey) {
                    <button
                      type="button"
                      (click)="onActionClick(action)"
                      [attr.data-modal-id]="action.modalId"
                      class="w-full text-left px-3 py-2 hover:bg-surface-alt flex items-center justify-between transition-colors text-sm"
                      [class.text-destructive]="action.isDestructive"
                      [class.hover:bg-destructive/10]="action.isDestructive"
                      [class.text-amber-700]="!action.isDestructive && action.actionKey === 'HOLD_ORDER'"
                      [class.dark:text-amber-400]="!action.isDestructive && action.actionKey === 'HOLD_ORDER'"
                      [class.text-foreground]="!action.isDestructive && action.actionKey !== 'HOLD_ORDER'"
                    >
                      <span>{{ action.label }}</span>
                    </button>
                  }
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
          class="px-3 py-2 bg-surface hover:bg-surface-alt border border-line text-foreground text-sm font-medium rounded transition-colors flex items-center gap-1 cursor-pointer"
          title="Tải lại dữ liệu chi tiết đơn hàng"
        >
          <span>Làm mới</span>
        </button>
      </div>
    </div>
  `,
})
export class OrderActionBarComponent {
  readonly order = input.required<AdminOrderDetail>();

  readonly actionTriggered = output<ActionTriggerEvent>();
  readonly refreshRequested = output<void>();

  readonly isMenuOpen = signal<boolean>(false);

  readonly hasSecondaryActions = computed<boolean>(() => {
    return this.standardActions().length > 0 || this.exceptionActions().length > 0;
  });

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

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  onActionClick(action: AdminOrderTransition): void {
    this.isMenuOpen.set(false);
    this.actionTriggered.emit({
      actionKey: action.actionKey,
      modalId: action.modalId,
      targetStatus: action.targetStatus,
      label: action.label,
    });
  }
}
