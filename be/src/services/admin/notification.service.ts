import { NotificationChannel, Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import { QueryNotificationsInput } from '../../validations/admin/notification.schema.js';

export type AdminNotificationCustomerDto = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
};

export type AdminNotificationOrderDto = {
  readonly id: string;
  readonly code: string;
} | null;

export type AdminNotificationDeliveryAttemptDto = {
  readonly channel?: string;
  readonly status?: string;
  readonly attemptedAt?: string;
  readonly error?: string | null;
  readonly details?: Record<string, unknown>;
};

export type AdminNotificationStatus = 'SENT' | 'PENDING' | 'FAILED';

export type AdminNotificationItemDto = {
  readonly id: string;
  readonly customerId: string;
  readonly orderId: string | null;
  readonly deduplicationKey: string;
  readonly eventType: string;
  readonly title: string;
  readonly body: string;
  readonly channels: readonly ('IN_APP' | 'EMAIL' | 'SMS')[];
  readonly payload: Record<string, unknown>;
  readonly deliveryAttempts: readonly AdminNotificationDeliveryAttemptDto[];
  readonly publishedAt: string | null;
  readonly lastDeliveryAt: string | null;
  readonly lastDeliveryError: string | null;
  readonly readAt: string | null;
  readonly status: AdminNotificationStatus;
  readonly retryCount: number;
  readonly customer: AdminNotificationCustomerDto;
  readonly order: AdminNotificationOrderDto;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminNotificationListResultDto = {
  readonly items: readonly AdminNotificationItemDto[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

function parseDeliveryAttempts(attempts: unknown): readonly AdminNotificationDeliveryAttemptDto[] {
  if (!Array.isArray(attempts)) {
    return [];
  }
  return attempts.map((item) => {
    const raw = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    return {
      channel: typeof raw.channel === 'string' ? raw.channel : undefined,
      status: typeof raw.status === 'string' ? raw.status : undefined,
      attemptedAt: typeof raw.attemptedAt === 'string' ? raw.attemptedAt : undefined,
      error: typeof raw.error === 'string' ? raw.error : null,
      details: typeof raw.details === 'object' && raw.details !== null ? (raw.details as Record<string, unknown>) : undefined,
    };
  });
}

function computeNotificationStatus(
  publishedAt: Date | null,
  lastDeliveryError: string | null,
): AdminNotificationStatus {
  if (lastDeliveryError && lastDeliveryError.trim().length > 0) {
    return 'FAILED';
  }
  if (publishedAt) {
    return 'SENT';
  }
  return 'PENDING';
}

function mapNotificationToDto(notification: {
  id: string;
  customerId: string;
  orderId: string | null;
  deduplicationKey: string;
  eventType: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  payload: unknown;
  deliveryAttempts: unknown;
  publishedAt: Date | null;
  lastDeliveryAt: Date | null;
  lastDeliveryError: string | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: { id: string; name: string; email: string; phone: string };
  order: { id: string; code: string } | null;
}): AdminNotificationItemDto {
  const attempts = parseDeliveryAttempts(notification.deliveryAttempts);
  const status = computeNotificationStatus(
    notification.publishedAt,
    notification.lastDeliveryError,
  );
  const payloadObj =
    typeof notification.payload === 'object' && notification.payload !== null
      ? (notification.payload as Record<string, unknown>)
      : {};

  return {
    id: notification.id,
    customerId: notification.customerId,
    orderId: notification.orderId,
    deduplicationKey: notification.deduplicationKey,
    eventType: notification.eventType,
    title: notification.title,
    body: notification.body,
    channels: notification.channels,
    payload: payloadObj,
    deliveryAttempts: attempts,
    publishedAt: notification.publishedAt ? notification.publishedAt.toISOString() : null,
    lastDeliveryAt: notification.lastDeliveryAt ? notification.lastDeliveryAt.toISOString() : null,
    lastDeliveryError: notification.lastDeliveryError,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    status,
    retryCount: attempts.length,
    customer: {
      id: notification.customer.id,
      name: notification.customer.name,
      email: notification.customer.email,
      phone: notification.customer.phone,
    },
    order: notification.order
      ? {
          id: notification.order.id,
          code: notification.order.code,
        }
      : null,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
  };
}

export const adminNotificationService = {
  async getNotifications(query: QueryNotificationsInput): Promise<AdminNotificationListResultDto> {
    const where: Prisma.NotificationWhereInput = {
      isActive: true,
    };

    if (query.channel && query.channel !== 'ALL') {
      where.channels = {
        has: query.channel as NotificationChannel,
      };
    }

    if (query.eventType && query.eventType !== 'ALL' && query.eventType.trim().length > 0) {
      where.eventType = {
        contains: query.eventType.trim(),
        mode: 'insensitive',
      };
    }

    if (query.status === 'SENT') {
      where.publishedAt = { not: null };
      where.lastDeliveryError = null;
    } else if (query.status === 'PENDING') {
      where.publishedAt = null;
      where.lastDeliveryError = null;
    } else if (query.status === 'FAILED') {
      where.lastDeliveryError = { not: null };
    }

    if (query.search && query.search.trim().length > 0) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
        { deduplicationKey: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
        { order: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const total = await prisma.notification.count({ where });
    const skip = (query.page - 1) * query.limit;
    const totalPages = Math.ceil(total / query.limit) || 1;

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        order: {
          select: { id: true, code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
    });

    return {
      items: notifications.map((item) => mapNotificationToDto(item)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  },

  async getNotificationById(id: string): Promise<AdminNotificationItemDto> {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        order: {
          select: { id: true, code: true },
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

    return mapNotificationToDto(notification);
  },

  async retryNotification(id: string): Promise<AdminNotificationItemDto> {
    const existing = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('NOTIFICATION_NOT_FOUND', {
        ruleId: 'NOT-006',
        messageKey: 'error.notificationNotFound',
        status: 404,
      });
    }

    const currentAttempts = parseDeliveryAttempts(existing.deliveryAttempts);
    const retryAttempt: AdminNotificationDeliveryAttemptDto = {
      channel: existing.channels.join(','),
      status: 'RETRY_DISPATCHED',
      attemptedAt: new Date().toISOString(),
      error: null,
      details: { dispatchedBy: 'ADMIN_MANUAL_RETRY' },
    };

    const nextAttempts = [...currentAttempts, retryAttempt];
    const now = new Date();

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        publishedAt: now,
        lastDeliveryAt: now,
        lastDeliveryError: null,
        deliveryAttempts: nextAttempts as unknown as Prisma.InputJsonValue,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        order: {
          select: { id: true, code: true },
        },
      },
    });

    return mapNotificationToDto(updated);
  },
};
