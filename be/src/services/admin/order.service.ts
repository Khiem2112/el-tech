import {
  FulfillmentMethod,
  OrderHoldReason,
  OrderStatus,
  PaymentMethod,
  PaymentState,
  Prisma,
} from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import { QueryOrderInput } from '../../validations/admin/order.schema.js';

export type AdminOrderListItemDto = {
  id: string;
  code: string;
  submittedAt: Date;
  createdAt: Date;
  status: OrderStatus;
  holdReason: OrderHoldReason | null;
  cancellationReason: string | null;
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: PaymentMethod;
  grandTotal: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  branch: {
    id: number;
    code: string;
    name: string;
  };
  payment: {
    id: string;
    state: PaymentState;
    method: PaymentMethod;
    totalReceived: string;
    codRemaining: string;
  } | null;
  hasAssembly: boolean;
  lineCount: number;
};

export type AdminOrderListResult = {
  items: AdminOrderListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
};

export class AdminOrderService {
  async getOrders(query: QueryOrderInput): Promise<AdminOrderListResult> {
    const where: Prisma.OrderWhereInput = {
      isActive: true,
    };

    if (query.status) {
      if (Array.isArray(query.status)) {
        where.status = { in: query.status as OrderStatus[] };
      } else {
        where.status = query.status as OrderStatus;
      }
    } else if (query.tab && query.tab !== 'ALL') {
      if (query.tab === 'DELIVERY_PICKUP') {
        where.status = {
          in: [OrderStatus.READY_FOR_PICKUP, OrderStatus.SHIPPING],
        };
      } else if (Object.values(OrderStatus).includes(query.tab as OrderStatus)) {
        where.status = query.tab as OrderStatus;
      }
    }

    if (query.branchId) {
      where.fulfillmentBranchId = query.branchId;
    }

    if (query.fulfillmentMethod) {
      where.fulfillmentMethod = query.fulfillmentMethod;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (typeof query.hasAssembly === 'boolean') {
      if (query.hasAssembly) {
        where.lines = {
          some: {
            OR: [
              { serviceType: 'ASSEMBLY' },
              { lineType: 'SERVICE' },
            ],
          },
        };
      } else {
        where.lines = {
          none: {
            OR: [
              { serviceType: 'ASSEMBLY' },
              { lineType: 'SERVICE' },
            ],
          },
        };
      }
    }

    if (query.from || query.to) {
      where.submittedAt = {};
      if (query.from) {
        const fromDate = new Date(query.from);
        if (!Number.isNaN(fromDate.getTime())) {
          where.submittedAt.gte = fromDate;
        }
      }
      if (query.to) {
        const toDate = new Date(query.to);
        if (!Number.isNaN(toDate.getTime())) {
          if (query.to.length === 10) {
            toDate.setHours(23, 59, 59, 999);
          }
          where.submittedAt.lte = toDate;
        }
      }
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { receiverName: { contains: term, mode: 'insensitive' } },
        { receiverPhone: { contains: term, mode: 'insensitive' } },
        { receiverEmail: { contains: term, mode: 'insensitive' } },
        { customer: { name: { contains: term, mode: 'insensitive' } } },
        { customer: { phone: { contains: term, mode: 'insensitive' } } },
        { customer: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = limit > 0 ? (page - 1) * limit : 0;
    const take = limit > 0 ? limit : undefined;

    const sortBy = query.sortBy ?? 'submittedAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [total, orders, rawStatusCounts] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          code: true,
          submittedAt: true,
          createdAt: true,
          status: true,
          holdReason: true,
          cancellationReason: true,
          fulfillmentMethod: true,
          paymentMethod: true,
          grandTotal: true,
          receiverName: true,
          receiverPhone: true,
          receiverEmail: true,
          fulfillmentBranch: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          payment: {
            select: {
              id: true,
              state: true,
              method: true,
              totalReceived: true,
              codRemaining: true,
            },
          },
          lines: {
            select: {
              id: true,
              serviceType: true,
              lineType: true,
            },
          },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { isActive: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {
      ALL: 0,
      PENDING_PAYMENT: 0,
      PENDING_COD_CONFIRMATION: 0,
      CONFIRMED: 0,
      PREPARING_COMPONENTS: 0,
      ASSEMBLING: 0,
      READY_FOR_PICKUP: 0,
      SHIPPING: 0,
      DELIVERY_FAILED: 0,
      RETURNING: 0,
      RETURNED_TO_BRANCH: 0,
      COMPLETED: 0,
      ON_HOLD: 0,
      CANCELLED: 0,
    };

    for (const group of rawStatusCounts) {
      statusCounts[group.status] = group._count.id;
      statusCounts.ALL += group._count.id;
    }

    statusCounts['DELIVERY_PICKUP'] =
      (statusCounts['READY_FOR_PICKUP'] ?? 0) + (statusCounts['SHIPPING'] ?? 0);

    const items: AdminOrderListItemDto[] = orders.map((order) => ({
      id: order.id,
      code: order.code,
      submittedAt: order.submittedAt,
      createdAt: order.createdAt,
      status: order.status,
      holdReason: order.holdReason,
      cancellationReason: order.cancellationReason,
      fulfillmentMethod: order.fulfillmentMethod,
      paymentMethod: order.paymentMethod,
      grandTotal: order.grandTotal.toString(),
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      receiverEmail: order.receiverEmail,
      branch: {
        id: order.fulfillmentBranch.id,
        code: order.fulfillmentBranch.code,
        name: order.fulfillmentBranch.name,
      },
      payment: order.payment
        ? {
            id: order.payment.id,
            state: order.payment.state,
            method: order.payment.method,
            totalReceived: order.payment.totalReceived.toString(),
            codRemaining: order.payment.codRemaining.toString(),
          }
        : null,
      hasAssembly: order.lines.some(
        (line) => line.serviceType === 'ASSEMBLY' || line.lineType === 'SERVICE',
      ),
      lineCount: order.lines.length,
    }));

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      statusCounts,
    };
  }

  async getOrderById(id: string): Promise<unknown> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        fulfillmentBranch: true,
        lines: {
          include: {
            sku: {
              include: {
                productTemplate: true,
              },
            },
          },
        },
        payment: {
          include: {
            charges: true,
            refunds: true,
            codCollections: true,
          },
        },
        statusHistories: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order || !order.isActive) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    return order;
  }

  async getOrderCounts(): Promise<Record<string, number>> {
    const rawCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { isActive: true },
    });

    const counts: Record<string, number> = {
      ALL: 0,
      PENDING_PAYMENT: 0,
      PENDING_COD_CONFIRMATION: 0,
      CONFIRMED: 0,
      PREPARING_COMPONENTS: 0,
      ASSEMBLING: 0,
      READY_FOR_PICKUP: 0,
      SHIPPING: 0,
      DELIVERY_FAILED: 0,
      RETURNING: 0,
      RETURNED_TO_BRANCH: 0,
      COMPLETED: 0,
      ON_HOLD: 0,
      CANCELLED: 0,
    };

    for (const item of rawCounts) {
      counts[item.status] = item._count.id;
      counts.ALL += item._count.id;
    }

    counts['DELIVERY_PICKUP'] =
      (counts['READY_FOR_PICKUP'] ?? 0) + (counts['SHIPPING'] ?? 0);

    return counts;
  }
}

export const adminOrderService = new AdminOrderService();
