import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';
import { orderService } from './order.service.js';

type SerializedOrder = {
  code: string;
  status: string;
  holdReason: string | null;
  cancellable: boolean;
  fulfillmentMethod: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  deliveryAddress: string | null;
  branch: { id: number; name: string; address: string } | null;
  subtotal: string;
  shippingFee: string;
  grandTotal: string;
  payment: {
    state: string;
    method: string;
    totalReceived: string;
    codRemaining: string;
    depositRequired: string;
    depositDisposition: string | null;
    paymentReference?: string;
    expectedAmount?: string;
  } | null;
  lines: {
    id: string;
    skuId: number | null;
    sku: string | null;
    name: string;
    media?: unknown;
    quantity: number;
    unitPrice: string;
    netAmount: string;
    lineType: string;
    pcBuildName: string | null;
    pcBuildType: string | null;
    canReview: boolean;
  }[];
  timeline: { status: string; reason: string | null; occurredAt: string }[];
};

type OrderRecord = {
  code: string;
  status: string;
  holdReason: string | null;
  fulfillmentMethod: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  deliveryAddressSnapshot: unknown;
  branchSnapshot: unknown;
  subtotal: { toFixed: (digits: number) => string };
  shippingFee: { toFixed: (digits: number) => string };
  grandTotal: { toFixed: (digits: number) => string };
  payment: {
    state: string;
    method: string;
    totalReceived: { toFixed: (digits: number) => string };
    codRemaining: { toFixed: (digits: number) => string };
    depositRequired: { toFixed: (digits: number) => string };
    depositDisposition: string | null;
    charges: readonly { status: string; providerReference: string; expectedAmount: { toFixed: (digits: number) => string } }[];
  } | null;
  lines: readonly {
    id: string;
    skuId: number | null;
    skuSnapshot: string | null;
    nameSnapshot: string;
    quantity: number;
    unitPrice: { toFixed: (digits: number) => string };
    netAmount: { toFixed: (digits: number) => string };
    lineType: string;
    pcBuildNameSnapshot: string | null;
    pcBuildTypeSnapshot: string | null;
    review: unknown | null;
    sku?: { productTemplate?: { media: unknown } | null } | null;
  }[];
  statusHistories: readonly { nextStatus: string; reason: string | null; occurredAt: Date }[];
};

const serialize = (order: OrderRecord): SerializedOrder => {
  const pendingCharge = order.payment?.charges.find((c) => c.status === 'PENDING');
  const deliverySnapshot = order.deliveryAddressSnapshot as { address?: string } | null;
  const branchSnapshot = order.branchSnapshot as { id: number; name: string; address: string } | null;
  const cancellable = ['PENDING_PAYMENT', 'PENDING_COD_CONFIRMATION', 'CONFIRMED'].includes(order.status);

  return {
    code: order.code,
    status: order.status,
    holdReason: order.holdReason,
    cancellable,
    fulfillmentMethod: order.fulfillmentMethod,
    receiverName: order.receiverName,
    receiverEmail: order.receiverEmail,
    receiverPhone: order.receiverPhone,
    deliveryAddress: deliverySnapshot?.address ?? null,
    branch: branchSnapshot,
    subtotal: order.subtotal.toFixed(0),
    shippingFee: order.shippingFee.toFixed(0),
    grandTotal: order.grandTotal.toFixed(0),
    payment: order.payment && {
      state: order.payment.state,
      method: order.payment.method,
      totalReceived: order.payment.totalReceived.toFixed(0),
      codRemaining: order.payment.codRemaining.toFixed(0),
      depositRequired: order.payment.depositRequired.toFixed(0),
      depositDisposition: order.payment.depositDisposition,
      paymentReference: pendingCharge?.providerReference,
      expectedAmount: pendingCharge?.expectedAmount.toFixed(0),
    },
    lines: order.lines.map((line) => ({
      id: line.id,
      skuId: line.skuId,
      sku: line.skuSnapshot,
      name: line.nameSnapshot,
      media: line.sku?.productTemplate?.media ?? null,
      quantity: line.quantity,
      unitPrice: line.unitPrice.toFixed(0),
      netAmount: line.netAmount.toFixed(0),
      lineType: line.lineType,
      pcBuildName: line.pcBuildNameSnapshot,
      pcBuildType: line.pcBuildTypeSnapshot,
      canReview: order.status === 'COMPLETED' && Boolean(line.skuId) && !line.review,
    })),
    timeline: order.statusHistories.map((entry) => ({
      status: entry.nextStatus,
      reason: entry.reason,
      occurredAt: entry.occurredAt.toISOString(),
    })),
  };
};

export const orderLookupService = {
  async request(code: string, identifier: string): Promise<{ verificationId: string; expiresAt: string }> {
    const order = await prisma.order.findFirst({ where: { code, isActive: true, OR: [{ receiverEmail: identifier.trim().toLowerCase() }, { receiverPhone: identifier.trim() }] } });
    if (!order) throw new DomainError('ORDER_NOT_FOUND', { messageKey: 'error.orderNotFound', status: 404 });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const verification = await prisma.verification.create({ data: { identifier: identifier.trim().toLowerCase(), value: otp, orderId: order.id, purpose: 'GUEST_ORDER_ACCESS', contactType: order.receiverEmail === identifier.trim().toLowerCase() ? 'EMAIL' : 'PHONE', expiresAt: new Date(Date.now() + 5 * 60_000) } });
    if (process.env.NODE_ENV !== 'production') console.info({ orderCode: code, verificationId: verification.id, otp });
    return { verificationId: verification.id, expiresAt: verification.expiresAt.toISOString() };
  },
  async verify(verificationId: string, code: string): Promise<{ verificationId: string; sessionToken: string; order: ReturnType<typeof serialize> }> {
    const verification = await prisma.verification.findFirst({
      where: { id: verificationId, purpose: 'GUEST_ORDER_ACCESS', consumedAt: null, expiresAt: { gt: new Date() }, orderId: { not: null } },
      include: {
        order: {
          include: {
            payment: { include: { charges: true } },
            lines: { include: { review: true, sku: { include: { productTemplate: { select: { media: true } } } } } },
            statusHistories: { orderBy: { occurredAt: 'asc' } },
          },
        },
      },
    });
    if (!verification || verification.value !== code || !verification.order) throw new DomainError('ORDER_ACCESS_DENIED', { messageKey: 'error.orderAccessDenied', status: 403 });
    await prisma.verification.update({ where: { id: verification.id }, data: { consumedAt: new Date() } });
    await orderService.expireOrderIfOverdue(verification.order.id);
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: verification.order.id },
      include: {
        payment: { include: { charges: true } },
        lines: { include: { review: true, sku: { include: { productTemplate: { select: { media: true } } } } } },
        statusHistories: { orderBy: { occurredAt: 'asc' } },
      },
    });
    return { verificationId: verification.id, sessionToken: verification.id, order: serialize(order) };
  },

  async getBySession(sessionToken: string): Promise<ReturnType<typeof serialize>> {
    const verification = await prisma.verification.findFirst({
      where: {
        id: sessionToken,
        purpose: 'GUEST_ORDER_ACCESS',
        consumedAt: { not: null },
        orderId: { not: null },
      },
    });
    if (!verification || !verification.orderId) throw new DomainError('ORDER_ACCESS_DENIED', { messageKey: 'error.orderAccessDenied', status: 403 });
    const maxAgeMs = 2 * 60 * 60 * 1000;
    if (Date.now() - verification.consumedAt!.getTime() > maxAgeMs) {
      throw new DomainError('SESSION_EXPIRED', { messageKey: 'error.sessionExpired', status: 403 });
    }
    await orderService.expireOrderIfOverdue(verification.orderId);
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: verification.orderId },
      include: {
        payment: { include: { charges: true } },
        lines: { include: { review: true, sku: { include: { productTemplate: { select: { media: true } } } } } },
        statusHistories: { orderBy: { occurredAt: 'asc' } },
      },
    });
    return serialize(order);
  },
};
