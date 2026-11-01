import { NotificationChannel, Prisma } from '@prisma/client';
import { DomainError } from '../contracts/domain-error.js';
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

function buildChannelAttempts(
  channels: readonly NotificationChannel[],
  now: Date,
  detailsPrefix: Record<string, unknown>,
  customer: { email: string; phone: string },
  orderCode?: string,
): readonly DeliveryAttemptRecord[] {
  const attempts: DeliveryAttemptRecord[] = [];

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
      attempts.push({
        channel: 'EMAIL',
        status: 'DELIVERED',
        attemptedAt: now.toISOString(),
        error: null,
        details: {
          ...detailsPrefix,
          recipient: customer.email,
          orderCode,
        },
      });
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

  return attempts;
}

export const notificationDispatcherService = {
  async dispatchOrderSubmittedNotification(notificationId: string): Promise<void> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        include: {
          order: {
            select: { id: true, code: true },
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
      const newAttempts = buildChannelAttempts(
        notification.channels,
        now,
        { eventType: notification.eventType },
        notification.customer,
        notification.order?.code,
      );

      const nextAttempts = [...currentAttempts, ...newAttempts];

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          publishedAt: notification.publishedAt ?? now,
          lastDeliveryAt: now,
          lastDeliveryError: null,
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
          select: { id: true, code: true },
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
      const newAttempts = buildChannelAttempts(
        notification.channels,
        now,
        { dispatchedBy: 'ADMIN_MANUAL_RETRY', eventType: notification.eventType },
        notification.customer,
        notification.order?.code,
      );

      const nextAttempts = [...currentAttempts, ...newAttempts];

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          publishedAt: notification.publishedAt ?? now,
          lastDeliveryAt: now,
          lastDeliveryError: null,
          deliveryAttempts: nextAttempts as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (error: unknown) {
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
