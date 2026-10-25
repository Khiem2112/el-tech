import { Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  MergeCustomerInput,
  QueryCustomerInput,
  UpdateCustomerInput,
} from '../../validations/admin/customer.schema.js';

export type CustomerListItemDto = {
  readonly id: string;
  readonly userId: string | null;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly emailVerifiedAt: string;
  readonly phoneVerifiedAt: string;
  readonly isRegistered: boolean;
  readonly mergedIntoCustomerId: string | null;
  readonly isActive: boolean;
  readonly orderCount: number;
  readonly totalSpent: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly role: string;
    readonly image: string | null;
  } | null;
};

export type CustomerListResultDto = {
  readonly items: readonly CustomerListItemDto[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

export type CustomerOrderSummaryDto = {
  readonly id: string;
  readonly code: string;
  readonly status: string;
  readonly fulfillmentMethod: string;
  readonly paymentMethod: string;
  readonly subtotal: number;
  readonly grandTotal: number;
  readonly submittedAt: string;
  readonly completedAt: string | null;
  readonly receiverName: string;
  readonly receiverPhone: string;
  readonly receiverEmail: string;
  readonly branch: {
    readonly id: number;
    readonly code: string;
    readonly name: string;
  };
  readonly lineCount: number;
  readonly summaryDescription: string;
};

export type CustomerCouponRedemptionDto = {
  readonly id: string;
  readonly couponId: string;
  readonly status: string;
  readonly reservedAt: string;
  readonly consumedAt: string | null;
  readonly orderId: string;
  readonly coupon: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly discountType: string;
    readonly discountValue: number;
  };
};

export type CustomerReviewDto = {
  readonly id: string;
  readonly rating: number;
  readonly text: string;
  readonly isVisible: boolean;
  readonly createdAt: string;
  readonly productTemplate: {
    readonly id: number;
    readonly name: string;
  };
  readonly order: {
    readonly id: string;
    readonly code: string;
  };
};

export type CustomerMergedProfileDto = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly createdAt: string;
  readonly orderCount: number;
};

export type CustomerStatsDto = {
  readonly orderCount: number;
  readonly completedOrderCount: number;
  readonly totalSpent: number;
  readonly couponUsageCount: number;
  readonly reviewCount: number;
  readonly mergedCount: number;
};

export type CustomerDetailDto = {
  readonly id: string;
  readonly userId: string | null;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly emailVerifiedAt: string;
  readonly phoneVerifiedAt: string;
  readonly isRegistered: boolean;
  readonly mergedIntoCustomerId: string | null;
  readonly mergedInto: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string;
  } | null;
  readonly mergedCustomers: readonly CustomerMergedProfileDto[];
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly role: string;
    readonly image: string | null;
    readonly createdAt: string;
  } | null;
  readonly stats: CustomerStatsDto;
  readonly orders: readonly CustomerOrderSummaryDto[];
  readonly couponRedemptions: readonly CustomerCouponRedemptionDto[];
  readonly reviews: readonly CustomerReviewDto[];
};

export type CustomerMergeCandidateDto = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly isRegistered: boolean;
  readonly orderCount: number;
  readonly totalSpent: number;
  readonly matchType: 'PHONE' | 'EMAIL' | 'OTHER';
  readonly createdAt: string;
};

export type CustomerMergeResultDto = {
  readonly targetCustomerId: string;
  readonly sourceCustomerId: string;
  readonly ordersMoved: number;
  readonly couponsMoved: number;
  readonly reviewsMoved: number;
  readonly notificationsMoved: number;
  readonly reason: string;
  readonly mergedAt: string;
};

export class AdminCustomerService {
  async getCustomers(query: QueryCustomerInput): Promise<CustomerListResultDto> {
    const { page, limit, search, type, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (type === 'USER') {
      where.userId = { not: null };
    } else if (type === 'GUEST') {
      where.userId = null;
    }

    if (status === 'ACTIVE') {
      where.isActive = true;
      where.mergedIntoCustomerId = null;
    } else if (status === 'MERGED') {
      where.mergedIntoCustomerId = { not: null };
    } else if (status === 'INACTIVE') {
      where.isActive = false;
    }

    if (search && search.length > 0) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
    ]);

    const customerIds = records.map((record) => record.id);

    const spentAggregations =
      customerIds.length > 0
        ? await prisma.order.groupBy({
            by: ['customerId'],
            where: {
              customerId: { in: customerIds },
              status: 'COMPLETED',
            },
            _sum: {
              grandTotal: true,
            },
          })
        : [];

    const spentMap = new Map<string, number>();
    for (const agg of spentAggregations) {
      spentMap.set(agg.customerId, agg._sum.grandTotal ? Number(agg._sum.grandTotal) : 0);
    }

    const items: readonly CustomerListItemDto[] = records.map((record) => ({
      id: record.id,
      userId: record.userId,
      name: record.name,
      email: record.email,
      phone: record.phone,
      emailVerifiedAt: record.emailVerifiedAt.toISOString(),
      phoneVerifiedAt: record.phoneVerifiedAt.toISOString(),
      isRegistered: record.userId !== null,
      mergedIntoCustomerId: record.mergedIntoCustomerId,
      isActive: record.isActive,
      orderCount: record._count.orders,
      totalSpent: spentMap.get(record.id) ?? 0,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      user: record.user
        ? {
            id: record.user.id,
            name: record.user.name,
            email: record.user.email,
            role: record.user.role,
            image: record.user.image,
          }
        : null,
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getCustomerById(id: string): Promise<CustomerDetailDto> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
          },
        },
        mergedInto: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        mergedCustomers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            _count: {
              select: {
                orders: true,
              },
            },
          },
        },
        orders: {
          orderBy: { submittedAt: 'desc' },
          include: {
            fulfillmentBranch: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            lines: {
              select: {
                id: true,
                nameSnapshot: true,
                skuSnapshot: true,
                quantity: true,
                unitPrice: true,
                netAmount: true,
              },
            },
          },
        },
        couponRedemptions: {
          orderBy: { reservedAt: 'desc' },
          include: {
            coupon: {
              select: {
                id: true,
                code: true,
                name: true,
                discountType: true,
                discountValue: true,
              },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            productTemplate: {
              select: {
                id: true,
                name: true,
              },
            },
            order: {
              select: {
                id: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new DomainError('CUSTOMER_NOT_FOUND', {
        messageKey: 'CUSTOMER_NOT_FOUND',
        status: 404,
      });
    }

    const completedOrders = customer.orders.filter((order) => order.status === 'COMPLETED');
    const totalSpent = completedOrders.reduce((sum, order) => sum + Number(order.grandTotal), 0);
    const consumedCoupons = customer.couponRedemptions.filter(
      (redemption) => redemption.status === 'CONSUMED',
    );

    const stats: CustomerStatsDto = {
      orderCount: customer.orders.length,
      completedOrderCount: completedOrders.length,
      totalSpent,
      couponUsageCount: consumedCoupons.length,
      reviewCount: customer.reviews.length,
      mergedCount: customer.mergedCustomers.length,
    };

    const ordersDto: readonly CustomerOrderSummaryDto[] = customer.orders.map((order) => {
      const summaryItems = order.lines.map((line) => line.nameSnapshot).slice(0, 2);
      const remainingCount = order.lines.length - summaryItems.length;
      let summaryDescription = summaryItems.join(', ');
      if (remainingCount > 0) {
        summaryDescription += ` va ${remainingCount} san pham khac`;
      }

      return {
        id: order.id,
        code: order.code,
        status: order.status,
        fulfillmentMethod: order.fulfillmentMethod,
        paymentMethod: order.paymentMethod,
        subtotal: Number(order.subtotal),
        grandTotal: Number(order.grandTotal),
        submittedAt: order.submittedAt.toISOString(),
        completedAt: order.completedAt ? order.completedAt.toISOString() : null,
        receiverName: order.receiverName,
        receiverPhone: order.receiverPhone,
        receiverEmail: order.receiverEmail,
        branch: {
          id: order.fulfillmentBranch.id,
          code: order.fulfillmentBranch.code,
          name: order.fulfillmentBranch.name,
        },
        lineCount: order.lines.length,
        summaryDescription: summaryDescription || 'Don hang linh kien',
      };
    });

    const couponRedemptionsDto: readonly CustomerCouponRedemptionDto[] =
      customer.couponRedemptions.map((redemption) => ({
        id: redemption.id,
        couponId: redemption.couponId,
        status: redemption.status,
        reservedAt: redemption.reservedAt.toISOString(),
        consumedAt: redemption.consumedAt ? redemption.consumedAt.toISOString() : null,
        orderId: redemption.orderId,
        coupon: {
          id: redemption.coupon.id,
          code: redemption.coupon.code,
          name: redemption.coupon.name,
          discountType: redemption.coupon.discountType,
          discountValue: Number(redemption.coupon.discountValue),
        },
      }));

    const reviewsDto: readonly CustomerReviewDto[] = customer.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      text: review.text,
      isVisible: review.isVisible,
      createdAt: review.createdAt.toISOString(),
      productTemplate: {
        id: review.productTemplate.id,
        name: review.productTemplate.name,
      },
      order: {
        id: review.order.id,
        code: review.order.code,
      },
    }));

    const mergedCustomersDto: readonly CustomerMergedProfileDto[] =
      customer.mergedCustomers.map((merged) => ({
        id: merged.id,
        name: merged.name,
        email: merged.email,
        phone: merged.phone,
        createdAt: merged.createdAt.toISOString(),
        orderCount: merged._count.orders,
      }));

    return {
      id: customer.id,
      userId: customer.userId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      emailVerifiedAt: customer.emailVerifiedAt.toISOString(),
      phoneVerifiedAt: customer.phoneVerifiedAt.toISOString(),
      isRegistered: customer.userId !== null,
      mergedIntoCustomerId: customer.mergedIntoCustomerId,
      mergedInto: customer.mergedInto
        ? {
            id: customer.mergedInto.id,
            name: customer.mergedInto.name,
            email: customer.mergedInto.email,
            phone: customer.mergedInto.phone,
          }
        : null,
      mergedCustomers: mergedCustomersDto,
      isActive: customer.isActive,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      user: customer.user
        ? {
            id: customer.user.id,
            name: customer.user.name,
            email: customer.user.email,
            role: customer.user.role,
            image: customer.user.image,
            createdAt: customer.user.createdAt.toISOString(),
          }
        : null,
      stats,
      orders: ordersDto,
      couponRedemptions: couponRedemptionsDto,
      reviews: reviewsDto,
    };
  }

  async getMergeCandidates(
    targetCustomerId: string,
    search?: string,
  ): Promise<readonly CustomerMergeCandidateDto[]> {
    const targetCustomer = await prisma.customer.findUnique({
      where: { id: targetCustomerId },
    });

    if (!targetCustomer) {
      throw new DomainError('CUSTOMER_NOT_FOUND', {
        messageKey: 'TARGET_CUSTOMER_NOT_FOUND',
        status: 404,
      });
    }

    const where: Prisma.CustomerWhereInput = {
      id: { not: targetCustomerId },
      mergedIntoCustomerId: null,
      isActive: true,
    };

    if (search && search.trim().length > 0) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim(), mode: 'insensitive' } },
      ];
    } else {
      where.OR = [
        { phone: targetCustomer.phone },
        { email: { equals: targetCustomer.email, mode: 'insensitive' } },
        { userId: null },
      ];
    }

    const candidates = await prisma.customer.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (candidates.length === 0) {
      return [];
    }

    const candidateIds = candidates.map((candidate) => candidate.id);

    const spentAggregations = await prisma.order.groupBy({
      by: ['customerId'],
      where: {
        customerId: { in: candidateIds },
        status: 'COMPLETED',
      },
      _sum: {
        grandTotal: true,
      },
    });

    const spentMap = new Map<string, number>();
    for (const agg of spentAggregations) {
      spentMap.set(agg.customerId, agg._sum.grandTotal ? Number(agg._sum.grandTotal) : 0);
    }

    return candidates.map((candidate) => {
      let matchType: 'PHONE' | 'EMAIL' | 'OTHER' = 'OTHER';
      if (candidate.phone === targetCustomer.phone) {
        matchType = 'PHONE';
      } else if (candidate.email.toLowerCase() === targetCustomer.email.toLowerCase()) {
        matchType = 'EMAIL';
      }

      return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        isRegistered: candidate.userId !== null,
        orderCount: candidate._count.orders,
        totalSpent: spentMap.get(candidate.id) ?? 0,
        matchType,
        createdAt: candidate.createdAt.toISOString(),
      };
    });
  }

  async mergeCustomerProfiles(
    targetCustomerId: string,
    input: MergeCustomerInput,
  ): Promise<CustomerMergeResultDto> {
    const { sourceCustomerId, reason } = input;

    if (targetCustomerId === sourceCustomerId) {
      throw new DomainError('CANNOT_MERGE_SELF', {
        messageKey: 'CANNOT_MERGE_SAME_CUSTOMER',
        status: 400,
      });
    }

    const [targetCustomer, sourceCustomer] = await Promise.all([
      prisma.customer.findUnique({ where: { id: targetCustomerId } }),
      prisma.customer.findUnique({ where: { id: sourceCustomerId } }),
    ]);

    if (!targetCustomer) {
      throw new DomainError('CUSTOMER_NOT_FOUND', {
        messageKey: 'TARGET_CUSTOMER_NOT_FOUND',
        status: 404,
      });
    }

    if (!sourceCustomer) {
      throw new DomainError('CUSTOMER_NOT_FOUND', {
        messageKey: 'SOURCE_CUSTOMER_NOT_FOUND',
        status: 404,
      });
    }

    if (targetCustomer.mergedIntoCustomerId) {
      throw new DomainError('TARGET_ALREADY_MERGED', {
        messageKey: 'TARGET_ALREADY_MERGED',
        status: 400,
      });
    }

    if (sourceCustomer.mergedIntoCustomerId) {
      throw new DomainError('SOURCE_ALREADY_MERGED', {
        messageKey: 'SOURCE_ALREADY_MERGED',
        status: 400,
      });
    }

    const mergeResult = await prisma.$transaction(async (tx) => {
      const orderUpdate = await tx.order.updateMany({
        where: { customerId: sourceCustomerId },
        data: { customerId: targetCustomerId },
      });

      const couponUpdate = await tx.couponRedemption.updateMany({
        where: { customerId: sourceCustomerId },
        data: { customerId: targetCustomerId },
      });

      const reviewUpdate = await tx.review.updateMany({
        where: { customerId: sourceCustomerId },
        data: { customerId: targetCustomerId },
      });

      const notificationUpdate = await tx.notification.updateMany({
        where: { customerId: sourceCustomerId },
        data: { customerId: targetCustomerId },
      });

      await tx.cart.updateMany({
        where: { customerId: sourceCustomerId },
        data: { customerId: targetCustomerId },
      });

      await tx.customer.update({
        where: { id: sourceCustomerId },
        data: {
          mergedIntoCustomerId: targetCustomerId,
          isActive: false,
        },
      });

      return {
        ordersMoved: orderUpdate.count,
        couponsMoved: couponUpdate.count,
        reviewsMoved: reviewUpdate.count,
        notificationsMoved: notificationUpdate.count,
      };
    });

    return {
      targetCustomerId,
      sourceCustomerId,
      ordersMoved: mergeResult.ordersMoved,
      couponsMoved: mergeResult.couponsMoved,
      reviewsMoved: mergeResult.reviewsMoved,
      notificationsMoved: mergeResult.notificationsMoved,
      reason,
      mergedAt: new Date().toISOString(),
    };
  }

  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<CustomerDetailDto> {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new DomainError('CUSTOMER_NOT_FOUND', {
        messageKey: 'CUSTOMER_NOT_FOUND',
        status: 404,
      });
    }

    await prisma.customer.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });

    return this.getCustomerById(id);
  }
}

export const adminCustomerService = new AdminCustomerService();
