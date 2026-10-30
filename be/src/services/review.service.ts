import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

type CreateReviewInput = {
  readonly productTemplateId?: number;
  readonly productSlug?: string;
  readonly skuId?: number;
  readonly authorName?: string;
  readonly customerId?: string;
  readonly rating: number;
  readonly text: string;
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

    const review = await prisma.review.create({
      data: {
        productTemplateId: templateId,
        skuId,
        customerId: input.customerId ?? null,
        authorName: input.authorName || 'Khách hàng',
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
};
