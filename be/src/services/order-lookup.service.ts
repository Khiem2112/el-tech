import { DomainError } from '../contracts/domain-error.js';
import { sendLookupOtpEmail } from '../lib/mailer.js';
import { prisma } from '../lib/prisma.js';
import { isUuid, sanitizeIdentifier } from '../lib/uuid.js';
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
  const cancellable = ['PENDING_PAYMENT', 'CONFIRMED'].includes(order.status);

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
  async lookupByOrderCode(code: string, requesterUserId?: string): Promise<SerializedOrder> {
    const order = await prisma.order.findFirst({
      where: { code, isActive: true },
      include: {
        customer: true,
        payment: { include: { charges: true } },
        lines: { include: { review: true, sku: { include: { productTemplate: { select: { media: true } } } } } },
        statusHistories: { orderBy: { occurredAt: 'asc' } },
      },
    });
    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
        details: { message: 'Đơn hàng không tồn tại trong hệ thống. Vui lòng kiểm tra lại mã đơn hàng.' },
      });
    }

    if (order.customer.userId !== null) {
      if (!requesterUserId || requesterUserId !== order.customer.userId) {
        throw new DomainError('ORDER_ACCESS_DENIED', {
          messageKey: 'error.orderBelongsToAccount',
          status: 403,
          details: { message: 'Đơn hàng này thuộc về tài khoản cá nhân. Vui lòng đăng nhập đúng tài khoản để tra cứu.' },
        });
      }
    }

    await orderService.expireOrderIfOverdue(order.id);
    return serialize(order);
  },

  async requestGuestLookupOtp(identifier: string, contactType: 'EMAIL' | 'PHONE'): Promise<{ verificationId: string; expiresAt: string }> {
    const trimmed = identifier.trim();
    const guestOrders = await prisma.order.findMany({
      where: {
        isActive: true,
        customer: { userId: null },
        ...(contactType === 'EMAIL'
          ? { receiverEmail: trimmed.toLowerCase() }
          : { receiverPhone: trimmed }),
      },
      take: 1,
    });
    if (guestOrders.length === 0) {
      const accountOrders = await prisma.order.findMany({
        where: {
          isActive: true,
          customer: { userId: { not: null } },
          ...(contactType === 'EMAIL'
            ? { receiverEmail: trimmed.toLowerCase() }
            : { receiverPhone: trimmed }),
        },
        take: 1,
      });

      if (accountOrders.length > 0) {
        throw new DomainError('ORDER_ACCESS_DENIED', {
          messageKey: 'error.orderBelongsToAccount',
          status: 403,
          details: { message: 'Đơn hàng này thuộc về tài khoản cá nhân. Vui lòng đăng nhập tài khoản để tra cứu và quản lý đơn hàng.' },
        });
      }

      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
        details: { message: 'Đơn hàng không tồn tại trong hệ thống. Vui lòng kiểm tra lại thông tin.' },
      });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const verification = await prisma.verification.create({
      data: {
        identifier: trimmed.toLowerCase(),
        value: otp,
        purpose: 'GUEST_ORDER_ACCESS',
        contactType,
        expiresAt: new Date(Date.now() + 5 * 60_000),
      },
    });
    if (contactType === 'EMAIL') {
      await sendLookupOtpEmail(trimmed.toLowerCase(), otp);
    }
    if (process.env.NODE_ENV !== 'production') {
      console.info({ guestLookup: trimmed, verificationId: verification.id, otp });
    }
    return { verificationId: verification.id, expiresAt: verification.expiresAt.toISOString() };
  },

  async verifyGuestLookupOtp(verificationId: string, otp: string): Promise<{ verificationId: string; sessionToken: string; orders: SerializedOrder[] }> {
    const verification = await prisma.verification.findFirst({
      where: {
        id: verificationId,
        purpose: 'GUEST_ORDER_ACCESS',
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!verification || verification.value !== otp) {
      throw new DomainError('OTP_INVALID', { messageKey: 'error.otpInvalid', status: 403 });
    }
    await prisma.verification.update({ where: { id: verification.id }, data: { consumedAt: new Date() } });

    const isEmail = verification.contactType === 'EMAIL' || verification.identifier.includes('@');
    const guestOrders = await prisma.order.findMany({
      where: {
        isActive: true,
        customer: { userId: null },
        ...(isEmail
          ? { receiverEmail: verification.identifier.toLowerCase() }
          : { receiverPhone: verification.identifier }),
      },
      include: {
        payment: { include: { charges: true } },
        lines: { include: { review: true, sku: { include: { productTemplate: { select: { media: true } } } } } },
        statusHistories: { orderBy: { occurredAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      verificationId: verification.id,
      sessionToken: verification.id,
      orders: guestOrders.map(serialize),
    };
  },

  async request(code: string, identifier: string): Promise<{ verificationId: string; expiresAt: string }> {
    const order = await prisma.order.findFirst({
      where: { code, isActive: true, OR: [{ receiverEmail: identifier.trim().toLowerCase() }, { receiverPhone: identifier.trim() }] },
      include: { customer: true },
    });
    if (!order) {
      const orderExists = await prisma.order.findFirst({
        where: { code, isActive: true },
        include: { customer: true },
      });
      if (!orderExists) {
        throw new DomainError('ORDER_NOT_FOUND', {
          messageKey: 'error.orderNotFound',
          status: 404,
          details: { message: 'Đơn hàng không tồn tại trong hệ thống. Vui lòng kiểm tra lại mã đơn hàng.' },
        });
      }
      if (orderExists.customer.userId !== null) {
        throw new DomainError('ORDER_ACCESS_DENIED', {
          messageKey: 'error.orderBelongsToAccount',
          status: 403,
          details: { message: 'Đơn hàng này thuộc về tài khoản cá nhân. Vui lòng đăng nhập đúng tài khoản để tra cứu.' },
        });
      }
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
        details: { message: 'Thông tin liên hệ không khớp với mã đơn hàng đã nhập.' },
      });
    }

    if (order.customer.userId !== null) {
      throw new DomainError('ORDER_ACCESS_DENIED', {
        messageKey: 'error.orderBelongsToAccount',
        status: 403,
        details: { message: 'Đơn hàng này thuộc về tài khoản thành viên. Vui lòng đăng nhập đúng tài khoản để tra cứu.' },
      });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const contactType = order.receiverEmail === identifier.trim().toLowerCase() ? 'EMAIL' : 'PHONE';
    const verification = await prisma.verification.create({
      data: {
        identifier: identifier.trim().toLowerCase(),
        value: otp,
        orderId: order.id,
        purpose: 'GUEST_ORDER_ACCESS',
        contactType,
        expiresAt: new Date(Date.now() + 5 * 60_000),
      },
    });
    if (contactType === 'EMAIL') {
      await sendLookupOtpEmail(identifier.trim().toLowerCase(), otp);
    }
    if (process.env.NODE_ENV !== 'production') {
      console.info({ orderCode: code, verificationId: verification.id, otp });
    }
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

  async getOrderDetailForCustomer(orderCode: string, identifier: string, requesterUserId?: string): Promise<SerializedOrder> {
    const trimmed = sanitizeIdentifier(identifier);
    if (!trimmed) {
      throw new DomainError('UNAUTHORIZED', { messageKey: 'error.unauthorized', status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: { code: orderCode, isActive: true },
      include: { customer: true },
    });
    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', { messageKey: 'error.orderNotFound', status: 404 });
    }

    const isUuidIdentifier = isUuid(trimmed);
    const customer = await prisma.customer.findFirst({
      where: {
        isActive: true,
        OR: [
          ...(isUuidIdentifier ? [{ id: trimmed }] : []),
          { email: trimmed.toLowerCase() },
          { phone: trimmed },
        ],
      },
    });

    if (order.customer.userId !== null) {
      const isUserOwner =
        (requesterUserId && requesterUserId === order.customer.userId) ||
        (isUuidIdentifier && order.customerId === trimmed) ||
        Boolean(customer && order.customerId === customer.id);

      if (!isUserOwner) {
        throw new DomainError('ORDER_ACCESS_DENIED', {
          messageKey: 'error.orderBelongsToAccount',
          status: 403,
          details: { message: 'Đơn hàng này thuộc về tài khoản thành viên. Vui lòng đăng nhập đúng tài khoản để tra cứu.' },
        });
      }
    } else {
      const isGuestOwner =
        (isUuidIdentifier && order.customerId === trimmed) ||
        order.receiverEmail.toLowerCase() === trimmed.toLowerCase() ||
        order.receiverPhone === trimmed ||
        Boolean(customer && order.customerId === customer.id);

      if (!isGuestOwner) {
        throw new DomainError('ORDER_ACCESS_DENIED', { messageKey: 'error.orderAccessDenied', status: 403 });
      }
    }

    await orderService.expireOrderIfOverdue(order.id);

    const fullOrder = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        payment: { include: { charges: true } },
        lines: { include: { review: true, sku: { include: { productTemplate: { select: { media: true } } } } } },
        statusHistories: { orderBy: { occurredAt: 'asc' } },
      },
    });

    return serialize(fullOrder);
  },
};

export { serialize };
export type { SerializedOrder };
