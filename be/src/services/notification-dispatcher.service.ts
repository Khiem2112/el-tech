import { NotificationChannel, Prisma } from '@prisma/client';
import { DomainError } from '../contracts/domain-error.js';
import { sendOrderConfirmationEmail } from '../lib/mailer.js';
import type { OrderConfirmationEmailPayload, OrderConfirmationItemPayload } from '../lib/mailer.js';
import { prisma } from '../lib/prisma.js';

export type DeliveryAttemptRecord = {
  readonly channel?: string;
  readonly status?: string;
  readonly attemptedAt?: string;
  readonly error?: string | null;
  readonly details?: Record<string, unknown>;
};

function parseDeliveryAttempts(attempts: unknown): readonly DeliveryAttemptRecord[] {
  if (!Array.isArray(attempts)) {
    return [];
  }
  return attempts.map((item) => {
    const raw = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    return {
      channel: typeof raw['channel'] === 'string' ? raw['channel'] : undefined,
      status: typeof raw['status'] === 'string' ? raw['status'] : undefined,
      attemptedAt: typeof raw['attemptedAt'] === 'string' ? raw['attemptedAt'] : undefined,
      error: typeof raw['error'] === 'string' ? raw['error'] : null,
      details: typeof raw['details'] === 'object' && raw['details'] !== null ? (raw['details'] as Record<string, unknown>) : undefined,
    };
  });
}

type NotificationRecord = {
  readonly id: string;
  readonly eventType: string;
  readonly channels: readonly NotificationChannel[];
  readonly payload: unknown;
  readonly deliveryAttempts: unknown;
  readonly publishedAt: Date | null;
  readonly customer: {
    readonly id: string;
    readonly email: string;
    readonly phone: string;
  };
  readonly order: {
    readonly id: string;
    readonly code: string;
    readonly receiverName: string;
    readonly receiverEmail: string;
    readonly receiverPhone: string;
    readonly fulfillmentMethod: string;
    readonly paymentMethod: string;
    readonly grandTotal: { toFixed: (digits: number) => string };
    readonly deliveryAddressSnapshot: unknown;
    readonly branchSnapshot: unknown;
    readonly lines: readonly {
      readonly skuId: number | null;
      readonly nameSnapshot: string;
      readonly quantity: number;
      readonly unitPrice: { toFixed: (digits: number) => string };
      readonly netAmount: { toFixed: (digits: number) => string };
    }[];
  } | null;
};

function extractOrderConfirmationPayload(notification: NotificationRecord): OrderConfirmationEmailPayload | null {
  const raw = typeof notification.payload === 'object' && notification.payload !== null
    ? (notification.payload as Record<string, unknown>)
    : {};

  const orderCode = typeof raw['orderCode'] === 'string'
    ? raw['orderCode']
    : notification.order?.code;

  if (!orderCode) {
    return null;
  }

  const receiverName = typeof raw['receiverName'] === 'string'
    ? raw['receiverName']
    : notification.order?.receiverName || 'Quy khach';

  const receiverEmail = typeof raw['receiverEmail'] === 'string'
    ? raw['receiverEmail']
    : notification.order?.receiverEmail || notification.customer.email;

  const receiverPhone = typeof raw['receiverPhone'] === 'string'
    ? raw['receiverPhone']
    : notification.order?.receiverPhone || notification.customer.phone;

  const fulfillmentMethod = typeof raw['fulfillmentMethod'] === 'string'
    ? raw['fulfillmentMethod']
    : notification.order?.fulfillmentMethod || 'DELIVERY';

  const paymentMethod = typeof raw['paymentMethod'] === 'string'
    ? raw['paymentMethod']
    : notification.order?.paymentMethod || 'COD';

  const grandTotal = typeof raw['grandTotal'] === 'string'
    ? raw['grandTotal']
    : notification.order?.grandTotal.toFixed(0) || '0';

  let deliveryAddress = typeof raw['deliveryAddress'] === 'string'
    ? raw['deliveryAddress']
    : null;
  if (!deliveryAddress && notification.order?.deliveryAddressSnapshot) {
    const deliverySnapshot = notification.order.deliveryAddressSnapshot as { address?: string } | null;
    deliveryAddress = deliverySnapshot?.address ?? null;
  }

  let branchName: string | null = null;
  let branchAddress: string | null = null;
  if (notification.order?.branchSnapshot) {
    const branchSnapshot = notification.order.branchSnapshot as { name?: string; address?: string } | null;
    branchName = branchSnapshot?.name ?? null;
    branchAddress = branchSnapshot?.address ?? null;
  }

  let items: OrderConfirmationItemPayload[] = [];
  if (Array.isArray(raw['items'])) {
    items = (raw['items'] as Record<string, unknown>[]).map((item) => ({
      skuId: typeof item['skuId'] === 'number' ? item['skuId'] : null,
      name: typeof item['name'] === 'string' ? item['name'] : 'San pham',
      quantity: typeof item['quantity'] === 'number' ? item['quantity'] : 1,
      unitPrice: typeof item['unitPrice'] === 'string' ? item['unitPrice'] : '0',
      netAmount: typeof item['netAmount'] === 'string' ? item['netAmount'] : '0',
    }));
  } else if (notification.order?.lines) {
    items = notification.order.lines.map((line) => ({
      skuId: line.skuId,
      name: line.nameSnapshot,
      quantity: line.quantity,
      unitPrice: line.unitPrice.toFixed(0),
      netAmount: line.netAmount.toFixed(0),
    }));
  }

  return {
    orderCode,
    receiverName,
    receiverEmail,
    receiverPhone,
    fulfillmentMethod,
    deliveryAddress,
    branchName,
    branchAddress,
    paymentMethod,
    grandTotal,
    items,
  };
}

async function processChannelAttempts(
  channels: readonly NotificationChannel[],
  now: Date,
  detailsPrefix: Record<string, unknown>,
  customer: { email: string; phone: string },
  emailPayload: OrderConfirmationEmailPayload | null,
  orderCode?: string,
): Promise<{ attempts: readonly DeliveryAttemptRecord[]; failureError: string | null }> {
  const attempts: DeliveryAttemptRecord[] = [];
  let failureError: string | null = null;

  for (const channel of channels) {
    if (channel === NotificationChannel.IN_APP) {
      attempts.push({
        channel: 'IN_APP',
        status: 'DELIVERED',
        attemptedAt: now.toISOString(),
        error: null,
        details: {
          ...detailsPrefix,
          target: 'CUSTOMER_PORTAL',
        },
      });
    } else if (channel === NotificationChannel.EMAIL) {
      const recipient = emailPayload?.receiverEmail || customer.email;
      let emailSuccess = false;
      let emailError: string | null = null;

      if (emailPayload) {
        emailSuccess = await sendOrderConfirmationEmail(emailPayload);
        if (!emailSuccess) {
          emailError = 'Gui email xac nhan don hang that bai qua SMTP';
        }
      } else {
        emailError = 'Khong tim thay thong tin don hang de tao email xac nhan';
      }

      if (emailSuccess) {
        attempts.push({
          channel: 'EMAIL',
          status: 'DELIVERED',
          attemptedAt: now.toISOString(),
          error: null,
          details: {
            ...detailsPrefix,
            recipient,
            orderCode,
          },
        });
      } else {
        failureError = emailError;
        attempts.push({
          channel: 'EMAIL',
          status: 'FAILED',
          attemptedAt: now.toISOString(),
          error: emailError,
          details: {
            ...detailsPrefix,
            recipient,
            orderCode,
          },
        });
      }
    } else if (channel === NotificationChannel.SMS) {
      attempts.push({
        channel: 'SMS',
        status: 'DELIVERED',
        attemptedAt: now.toISOString(),
        error: null,
        details: {
          ...detailsPrefix,
          recipient: customer.phone,
          orderCode,
        },
      });
    }
  }

  return { attempts, failureError };
}

export const notificationDispatcherService = {
  async dispatchOrderSubmittedNotification(notificationId: string): Promise<void> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        include: {
          order: {
            select: {
              id: true,
              code: true,
              receiverName: true,
              receiverEmail: true,
              receiverPhone: true,
              fulfillmentMethod: true,
              paymentMethod: true,
              grandTotal: true,
              deliveryAddressSnapshot: true,
              branchSnapshot: true,
              lines: {
                select: {
                  skuId: true,
                  nameSnapshot: true,
                  quantity: true,
                  unitPrice: true,
                  netAmount: true,
                },
              },
            },
          },
          customer: {
            select: { id: true, email: true, phone: true },
          },
        },
      });

      if (!notification) {
        return;
      }

      const now = new Date();
      const currentAttempts = parseDeliveryAttempts(notification.deliveryAttempts);
      const emailPayload = extractOrderConfirmationPayload(notification);
      const { attempts: newAttempts, failureError } = await processChannelAttempts(
        notification.channels,
        now,
        { eventType: notification.eventType },
        notification.customer,
        emailPayload,
        notification.order?.code,
      );

      const nextAttempts = [...currentAttempts, ...newAttempts];
      const hasFailure = Boolean(failureError);

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          publishedAt: hasFailure ? notification.publishedAt : (notification.publishedAt ?? now),
          lastDeliveryAt: now,
          lastDeliveryError: failureError,
          deliveryAttempts: nextAttempts as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Loi he thong khi phat hanh thong bao don hang';
      try {
        const existing = await prisma.notification.findUnique({
          where: { id: notificationId },
        });
        if (existing) {
          const currentAttempts = parseDeliveryAttempts(existing.deliveryAttempts);
          const failedAttempt: DeliveryAttemptRecord = {
            channel: existing.channels.join(','),
            status: 'FAILED',
            attemptedAt: new Date().toISOString(),
            error: errorMessage,
          };
          await prisma.notification.update({
            where: { id: notificationId },
            data: {
              lastDeliveryAt: new Date(),
              lastDeliveryError: errorMessage,
              deliveryAttempts: [...currentAttempts, failedAttempt] as unknown as Prisma.InputJsonValue,
            },
          });
        }
      } catch (innerError: unknown) {
        console.error('Loi khi cap nhat trang thai that bai cua thong bao:', innerError);
      }
    }
  },

  async retryDispatch(notificationId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        order: {
          select: {
            id: true,
            code: true,
            receiverName: true,
            receiverEmail: true,
            receiverPhone: true,
            fulfillmentMethod: true,
            paymentMethod: true,
            grandTotal: true,
            deliveryAddressSnapshot: true,
            branchSnapshot: true,
            lines: {
              select: {
                skuId: true,
                nameSnapshot: true,
                quantity: true,
                unitPrice: true,
                netAmount: true,
              },
            },
          },
        },
        customer: {
          select: { id: true, email: true, phone: true },
        },
      },
    });

    if (!notification) {
      throw new DomainError('NOTIFICATION_NOT_FOUND', {
        ruleId: 'NOT-006',
        messageKey: 'error.notificationNotFound',
        status: 404,
      });
    }

    try {
      const now = new Date();
      const currentAttempts = parseDeliveryAttempts(notification.deliveryAttempts);
      const emailPayload = extractOrderConfirmationPayload(notification);
      const { attempts: newAttempts, failureError } = await processChannelAttempts(
        notification.channels,
        now,
        { dispatchedBy: 'ADMIN_MANUAL_RETRY', eventType: notification.eventType },
        notification.customer,
        emailPayload,
        notification.order?.code,
      );

      const nextAttempts = [...currentAttempts, ...newAttempts];
      const hasFailure = Boolean(failureError);

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          publishedAt: hasFailure ? notification.publishedAt : (notification.publishedAt ?? now),
          lastDeliveryAt: now,
          lastDeliveryError: failureError,
          deliveryAttempts: nextAttempts as unknown as Prisma.InputJsonValue,
        },
      });

      if (hasFailure) {
        throw new DomainError('NOTIFICATION_DELIVERY_FAILED', {
          ruleId: 'NOT-005',
          messageKey: 'error.notificationDeliveryFailed',
          status: 502,
        });
      }
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Loi khi thu lai phat hanh thong bao';
      const currentAttempts = parseDeliveryAttempts(notification.deliveryAttempts);
      const failedAttempt: DeliveryAttemptRecord = {
        channel: notification.channels.join(','),
        status: 'FAILED',
        attemptedAt: new Date().toISOString(),
        error: errorMessage,
        details: { dispatchedBy: 'ADMIN_MANUAL_RETRY' },
      };
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          lastDeliveryAt: new Date(),
          lastDeliveryError: errorMessage,
          deliveryAttempts: [...currentAttempts, failedAttempt] as unknown as Prisma.InputJsonValue,
        },
      });
      throw error;
    }
  },
};
