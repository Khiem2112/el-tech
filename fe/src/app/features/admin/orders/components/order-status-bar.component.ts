import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AdminOrderDetail } from '../services/admin-order-detail.service';
import { AdminOrderStatus } from '../services/admin-order.service';

type FlowStep = {
  readonly key: string;
  readonly label: string;
  readonly statuses: AdminOrderStatus[];
};

@Component({
  selector: 'app-order-status-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-line rounded-lg p-3 sm:p-3.5 space-y-2.5 text-foreground">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
        <div class="flex items-center gap-2 flex-wrap">
          <div class="inline-flex items-center rounded bg-surface-alt p-0.5 border border-line text-xs font-mono">
            <span
              class="px-2 py-0.5 rounded font-medium transition-colors"
              [class.bg-surface]="order().fulfillmentMethod === 'DELIVERY'"
              [class.text-foreground]="order().fulfillmentMethod === 'DELIVERY'"
              [class.text-muted]="order().fulfillmentMethod !== 'DELIVERY'"
            >
              Giao Tận Nơi
            </span>
            <span
              class="px-2 py-0.5 rounded font-medium transition-colors"
              [class.bg-surface]="order().fulfillmentMethod === 'PICKUP'"
              [class.text-foreground]="order().fulfillmentMethod === 'PICKUP'"
              [class.text-muted]="order().fulfillmentMethod !== 'PICKUP'"
            >
              Nhận Tại Shop
            </span>
          </div>

          <div class="inline-flex items-center rounded bg-surface-alt p-0.5 border border-line text-xs font-mono">
            <span
              class="px-2 py-0.5 rounded font-medium transition-colors"
              [class.bg-surface]="order().hasAssembly"
              [class.text-primary]="order().hasAssembly"
              [class.text-muted]="!order().hasAssembly"
            >
              Có Lắp Ráp PC
            </span>
            <span
              class="px-2 py-0.5 rounded font-medium transition-colors"
              [class.bg-surface]="!order().hasAssembly"
              [class.text-foreground]="!order().hasAssembly"
              [class.text-muted]="order().hasAssembly"
            >
              Linh Kiện Rời
            </span>
          </div>
        </div>

        @if (isExceptionState()) {
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-medium" [class]="exceptionClass()">
            <span class="text-muted">Ngoại lệ:</span>
            <span>{{ exceptionLabel() }}</span>
          </div>
        }
      </div>

      <div class="overflow-x-auto pb-0.5">
        <div class="flex items-center min-w-[580px] gap-1.5">
          @for (step of activeFlowSteps(); track step.key; let idx = $index; let last = $last) {
            <div
              class="flex-1 px-2.5 py-1.5 rounded text-xs text-center border transition-all select-none"
              [class.bg-primary]="isStepActive(step)"
              [class.text-primary-foreground]="isStepActive(step)"
              [class.border-primary]="isStepActive(step)"
              [class.font-semibold]="isStepActive(step)"
              [class.bg-primary/10]="isStepCompleted(step)"
              [class.text-primary]="isStepCompleted(step)"
              [class.border-primary/20]="isStepCompleted(step)"
              [class.bg-surface-alt]="isStepPending(step)"
              [class.text-muted]="isStepPending(step)"
              [class.border-line]="isStepPending(step)"
            >
              <div class="text-[10px] uppercase tracking-wider text-muted font-mono" [class.text-primary-foreground]="isStepActive(step)">
                Chặng {{ idx + 1 }}
              </div>
              <div class="mt-0.5 truncate font-medium">{{ step.label }}</div>
            </div>
            @if (!last) {
              <div class="text-muted/40 font-mono px-0.5 text-xs">&rarr;</div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class OrderStatusBarComponent {
  readonly order = input.required<AdminOrderDetail>();

  readonly activeFlowSteps = computed<FlowStep[]>(() => {
    const ord = this.order();
    const hasAssembly = ord.hasAssembly;
    const isPickup = ord.fulfillmentMethod === 'PICKUP';

    const steps: FlowStep[] = [
      {
        key: 'CONFIRMED',
        label: 'ĐÃ XÁC NHẬN',
        statuses: ['CONFIRMED'],
      },
      {
        key: 'PREPARING_COMPONENTS',
        label: 'SOẠN HÀNG',
        statuses: ['PREPARING_COMPONENTS'],
      },
    ];

    if (hasAssembly) {
      steps.push({
        key: 'ASSEMBLING',
        label: 'LẮP RÁP PC',
        statuses: ['ASSEMBLING'],
      });
    }

    if (isPickup) {
      steps.push({
        key: 'READY_FOR_PICKUP',
        label: 'SẴN SÀNG NHẬN',
        statuses: ['READY_FOR_PICKUP'],
      });
    } else {
      steps.push({
        key: 'SHIPPING',
        label: 'XUẤT GIAO',
        statuses: ['SHIPPING'],
      });
    }

    steps.push({
      key: 'COMPLETED',
      label: 'HOÀN TẤT',
      statuses: ['COMPLETED'],
    });

    return steps;
  });

  readonly isExceptionState = computed<boolean>(() => {
    const s = this.order().status;
    return (
      s === 'ON_HOLD' ||
      s === 'CANCELLED' ||
      s === 'DELIVERY_FAILED' ||
      s === 'RETURNING' ||
      s === 'RETURNED_TO_BRANCH' ||
      s === 'PENDING_COD_CONFIRMATION'
    );
  });

  readonly exceptionLabel = computed<string>(() => {
    const ord = this.order();
    switch (ord.status) {
      case 'ON_HOLD':
        return `TẠM GIỮ (${ord.holdReason || 'Đang xử lý'})`;
      case 'CANCELLED':
        return `ĐÃ HỦY (${ord.cancellationReason || 'Theo yêu cầu'})`;
      case 'DELIVERY_FAILED':
        return `GIAO THẤT BẠI (Lần ${ord.redeliveryAttemptCount})`;
      case 'RETURNING':
        return 'ĐANG CHUYỂN HOÀN KHO';
      case 'RETURNED_TO_BRANCH':
        return 'HÀNG ĐÃ VỀ KHO CHI NHÁNH';
      case 'PENDING_COD_CONFIRMATION':
        return 'CHỜ XÁC NHẬN ĐƠN COD';
      default:
        return ord.status;
    }
  });

  readonly exceptionClass = computed<string>(() => {
    const s = this.order().status;
    if (s === 'CANCELLED') {
      return 'bg-destructive/10 text-destructive border-destructive/20';
    }
    if (s === 'ON_HOLD') {
      return 'bg-warning/10 text-warning border-warning/30';
    }
    if (s === 'PENDING_COD_CONFIRMATION' || s === 'DELIVERY_FAILED') {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-surface-alt text-muted border-line';
  });

  private getStepOrderIndex(status: AdminOrderStatus): number {
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'PENDING_COD_CONFIRMATION':
        return -1;
      case 'CONFIRMED':
        return 0;
      case 'PREPARING_COMPONENTS':
        return 1;
      case 'ASSEMBLING':
        return 2;
      case 'READY_FOR_PICKUP':
      case 'SHIPPING':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  }

  isStepActive(step: FlowStep): boolean {
    const current = this.order().status;
    return step.statuses.includes(current);
  }

  isStepCompleted(step: FlowStep): boolean {
    const currentStatus = this.order().status;
    const currentIndex = this.getStepOrderIndex(currentStatus);
    const stepTargetIndex = this.getStepOrderIndex(step.statuses[0]);

    if (currentStatus === 'COMPLETED') {
      return true;
    }
    return currentIndex > stepTargetIndex;
  }

  isStepPending(step: FlowStep): boolean {
    return !this.isStepActive(step) && !this.isStepCompleted(step);
  }
}
