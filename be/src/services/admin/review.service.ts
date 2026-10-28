import { Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  QueryReviewsInput,
  UpdateReviewVisibilityInput,
} from '../../validations/admin/review.schema.js';

export type AdminReviewCustomerDto = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
};

export type AdminReviewProductDto = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
};

export type AdminReviewSkuDto = {
  readonly id: number;
  readonly sku: string;
  readonly variationLabel: string | null;
};

export type AdminReviewOrderDto = {
  readonly id: string;
  readonly code: string;
};

export type AdminReviewRevisionHistoryItemDto = {
  readonly action: string;
  readonly reason: string | null;
  readonly changedBy: string;
  readonly changedAt: string;
};

export type AdminReviewItemDto = {
  readonly id: string;
  readonly customerId: string;
  readonly productTemplateId: number;
  readonly skuId: number;
  readonly orderId: string;
  readonly orderLineId: string;
  readonly rating: number;
  readonly text: string;
  readonly isVisible: boolean;
  readonly hiddenReason: string | null;
  readonly revisionHistory: readonly AdminReviewRevisionHistoryItemDto[];
  readonly customer: AdminReviewCustomerDto;
  readonly productTemplate: AdminReviewProductDto;
  readonly sku: AdminReviewSkuDto;
  readonly order: AdminReviewOrderDto;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminReviewListResultDto = {
  readonly items: readonly AdminReviewItemDto[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

function parseRevisionHistory(history: unknown): readonly AdminReviewRevisionHistoryItemDto[] {
  if (!Array.isArray(history)) {
    return [];
  }
  return history.map((item) => {
    const raw = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    return {
      action: typeof raw.action === 'string' ? raw.action : 'UNKNOWN',
      reason: typeof raw.reason === 'string' ? raw.reason : null,
      changedBy: typeof raw.changedBy === 'string' ? raw.changedBy : 'System',
      changedAt: typeof raw.changedAt === 'string' ? raw.changedAt : new Date().toISOString(),
    };
  });
}

function mapReviewToDto(review: {
  id: string;
  customerId: string;
  productTemplateId: number;
  skuId: number;
  orderId: string;
  orderLineId: string;
  rating: number;
  text: string;
  isVisible: boolean;
  hiddenReason: string | null;
  revisionHistory: unknown;
  createdAt: Date;
  updatedAt: Date;
  customer: { id: string; name: string; email: string; phone: string };
  productTemplate: { id: number; name: string; slug: string };
  sku: { id: number; sku: string; variationLabel: string | null };
  order: { id: string; code: string };
}): AdminReviewItemDto {
  return {
    id: review.id,
    customerId: review.customerId,
    productTemplateId: review.productTemplateId,
    skuId: review.skuId,
    orderId: review.orderId,
    orderLineId: review.orderLineId,
    rating: review.rating,
    text: review.text,
    isVisible: review.isVisible,
    hiddenReason: review.hiddenReason,
    revisionHistory: parseRevisionHistory(review.revisionHistory),
    customer: {
      id: review.customer.id,
      name: review.customer.name,
      email: review.customer.email,
      phone: review.customer.phone,
    },
    productTemplate: {
      id: review.productTemplate.id,
      name: review.productTemplate.name,
      slug: review.productTemplate.slug,
    },
    sku: {
      id: review.sku.id,
      sku: review.sku.sku,
      variationLabel: review.sku.variationLabel,
    },
    order: {
      id: review.order.id,
      code: review.order.code,
    },
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

export const adminReviewService = {
  async getReviews(query: QueryReviewsInput): Promise<AdminReviewListResultDto> {
    const where: Prisma.ReviewWhereInput = {
      isActive: true,
    };

    if (query.rating !== undefined) {
      where.rating = query.rating;
    }

    if (query.isVisible === 'true') {
      where.isVisible = true;
    } else if (query.isVisible === 'false') {
      where.isVisible = false;
    }

    if (query.search && query.search.trim().length > 0) {
      const search = query.search.trim();
      where.OR = [
        { text: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { productTemplate: { name: { contains: search, mode: 'insensitive' } } },
        { order: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const total = await prisma.review.count({ where });
    const skip = (query.page - 1) * query.limit;
    const totalPages = Math.ceil(total / query.limit) || 1;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        productTemplate: {
          select: { id: true, name: true, slug: true },
        },
        sku: {
          select: { id: true, sku: true, variationLabel: true },
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
      items: reviews.map((item) => mapReviewToDto(item)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  },

  async getReviewById(id: string): Promise<AdminReviewItemDto> {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        productTemplate: {
          select: { id: true, name: true, slug: true },
        },
        sku: {
          select: { id: true, sku: true, variationLabel: true },
        },
        order: {
          select: { id: true, code: true },
        },
      },
    });

    if (!review) {
      throw new DomainError('REVIEW_NOT_FOUND', {
        ruleId: 'REV-005',
        messageKey: 'error.reviewNotFound',
        status: 404,
      });
    }

    return mapReviewToDto(review);
  },

  async updateReviewVisibility(
    id: string,
    input: UpdateReviewVisibilityInput,
    changedBy?: string,
  ): Promise<AdminReviewItemDto> {
    const existing = await prisma.review.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('REVIEW_NOT_FOUND', {
        ruleId: 'REV-005',
        messageKey: 'error.reviewNotFound',
        status: 404,
      });
    }

    if (!input.isVisible && (!input.hiddenReason || input.hiddenReason.trim().length < 3)) {
      throw new DomainError('HIDDEN_REASON_REQUIRED', {
        ruleId: 'REV-005',
        messageKey: 'error.hiddenReasonRequired',
        status: 400,
      });
    }

    const currentHistory = parseRevisionHistory(existing.revisionHistory);
    const revisionEntry: AdminReviewRevisionHistoryItemDto = {
      action: input.isVisible ? 'RESTORE_VISIBLE' : 'HIDE_FROM_STORE',
      reason: input.isVisible ? null : input.hiddenReason ?? null,
      changedBy: changedBy ?? 'Administrator',
      changedAt: new Date().toISOString(),
    };

    const nextHistory = [...currentHistory, revisionEntry];

    const updated = await prisma.review.update({
      where: { id },
      data: {
        isVisible: input.isVisible,
        hiddenReason: input.isVisible ? null : input.hiddenReason,
        revisionHistory: nextHistory as unknown as Prisma.InputJsonValue,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        productTemplate: {
          select: { id: true, name: true, slug: true },
        },
        sku: {
          select: { id: true, sku: true, variationLabel: true },
        },
        order: {
          select: { id: true, code: true },
        },
      },
    });

    return mapReviewToDto(updated);
  },
};
