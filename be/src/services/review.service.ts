import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';
import { isUuid } from '../lib/uuid.js';

type CreateReviewInput = {
  readonly productTemplateId?: number;
  readonly productSlug?: string;
  readonly skuId?: number;
  readonly authorName?: string;
  readonly customerId?: string;
  readonly rating: number;
  readonly text: string;
};

export type CustomerReviewDto = {
  readonly id: string;
  readonly rating: number;
  readonly text: string;
  readonly authorName: string | null;
  readonly isVisible: boolean;
  readonly createdAt: string;
  readonly product: {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly media: unknown;
  };
};

export const reviewService = {
  async create(input: CreateReviewInput): Promise<{ id: string }> {
    let templateId = input.productTemplateId;
    let skuId = input.skuId;

    if (!templateId && input.productSlug) {
      const template = await prisma.productTemplate.findUnique({
        where: { slug: input.productSlug, isActive: true },
        include: { variants: { where: { isActive: true }, take: 1 } },
      });
      if (template) {
        templateId = template.id;
        if (!skuId && template.variants.length > 0) {
          skuId = template.variants[0].id;
        }
      }
    }

    if (!templateId && skuId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: skuId },
      });
      if (variant) {
        templateId = variant.productTemplateId;
      }
    }

    if (!templateId) {
      throw new DomainError('PRODUCT_NOT_FOUND', {
        messageKey: 'error.productNotFound',
        status: 404,
      });
    }

    if (!skuId) {
      const firstVariant = await prisma.productVariant.findFirst({
        where: { productTemplateId: templateId, isActive: true },
      });
      if (firstVariant) {
        skuId = firstVariant.id;
      } else {
        throw new DomainError('SKU_NOT_FOUND', {
          messageKey: 'error.skuNotFound',
          status: 404,
        });
      }
    }

    let resolvedCustomerId: string | null = null;
    let authorName = input.authorName?.trim() || null;
    if (input.customerId && isUuid(input.customerId)) {
      const customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { id: input.customerId },
            { userId: input.customerId },
          ],
        },
      });
      if (customer) {
        resolvedCustomerId = customer.id;
        if (!authorName) {
          authorName = customer.name;
        }
      }
    }

    const review = await prisma.review.create({
      data: {
        productTemplateId: templateId,
        skuId,
        customerId: resolvedCustomerId,
        authorName: authorName || 'Khách hàng',
        rating: input.rating,
        text: input.text,
        isVisible: true,
      },
    });

    return { id: review.id };
  },

  async list(productSlug: string): Promise<readonly { id: string; authorName: string | null; rating: number; text: string; createdAt: string }[]> {
    const reviews = await prisma.review.findMany({
      where: {
        isActive: true,
        isVisible: true,
        productTemplate: { slug: productSlug, isActive: true },
      },
      select: {
        id: true,
        authorName: true,
        rating: true,
        text: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
    }));
  },

  async listByCustomer(filter: { customerId?: string; email?: string }): Promise<readonly CustomerReviewDto[]> {
    let customer: { id: string } | null = null;
    if (filter.customerId && isUuid(filter.customerId)) {
      customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { id: filter.customerId },
            { userId: filter.customerId },
          ],
        },
        select: { id: true },
      });
    }
    if (!customer && filter.email) {
      customer = await prisma.customer.findFirst({
        where: { email: filter.email },
        select: { id: true },
      });
    }

    if (!customer) {
      return [];
    }

    const reviews = await prisma.review.findMany({
      where: {
        customerId: customer.id,
        isActive: true,
      },
      include: {
        productTemplate: {
          select: {
            id: true,
            name: true,
            slug: true,
            media: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      text: review.text,
      authorName: review.authorName,
      isVisible: review.isVisible,
      createdAt: review.createdAt.toISOString(),
      product: {
        id: review.productTemplate.id,
        name: review.productTemplate.name,
        slug: review.productTemplate.slug,
        media: review.productTemplate.media,
      },
    }));
  },
};
