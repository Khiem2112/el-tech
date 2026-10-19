import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

type CreateReviewInput = { readonly verificationId: string; readonly orderLineId: string; readonly rating: number; readonly text: string };

export const reviewService = {
  async create(input: CreateReviewInput): Promise<{ id: string }> {
    const verification = await prisma.verification.findFirst({ where: { id: input.verificationId, purpose: 'GUEST_ORDER_ACCESS', consumedAt: { not: null }, orderId: { not: null } } });
    if (!verification?.orderId) throw new DomainError('REVIEW_NOT_ELIGIBLE', { ruleId: 'REV-002', messageKey: 'error.reviewNotEligible', status: 403 });
    const line = await prisma.orderLine.findFirst({ where: { id: input.orderLineId, orderId: verification.orderId, order: { status: 'COMPLETED' }, skuId: { not: null } }, include: { order: true, sku: true } });
    if (!line?.sku || !line.skuId) throw new DomainError('REVIEW_NOT_ELIGIBLE', { ruleId: 'REV-002', messageKey: 'error.reviewNotEligible', status: 403 });
    const existing = await prisma.review.findUnique({ where: { orderLineId: line.id } });
    if (existing) throw new DomainError('REVIEW_ALREADY_EXISTS', { ruleId: 'REV-004', messageKey: 'error.reviewAlreadyExists', status: 409 });
    const review = await prisma.review.create({ data: { customerId: line.order.customerId, productTemplateId: line.sku.productTemplateId, skuId: line.skuId, orderId: line.orderId, orderLineId: line.id, rating: input.rating, text: input.text } });
    return { id: review.id };
  },
  async list(productSlug: string): Promise<readonly { id: string; rating: number; text: string; createdAt: string }[]> {
    const reviews = await prisma.review.findMany({ where: { isActive: true, isVisible: true, productTemplate: { slug: productSlug, isActive: true } }, select: { id: true, rating: true, text: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
    return reviews.map((review) => ({ ...review, createdAt: review.createdAt.toISOString() }));
  },
};
