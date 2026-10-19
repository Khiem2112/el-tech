import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

type SerializedOrder = {
  code: string;
  status: string;
  holdReason: string | null;
  payment: { state: string; method: string; totalReceived: string; codRemaining: string } | null;
  lines: { name: string; quantity: number; netAmount: string }[];
  timeline: { status: string; reason: string | null; occurredAt: string }[];
};

const serialize = (order: { code: string; status: string; holdReason: string | null; payment: { state: string; method: string; totalReceived: { toFixed: (digits: number) => string }; codRemaining: { toFixed: (digits: number) => string } } | null; lines: readonly { nameSnapshot: string; quantity: number; netAmount: { toFixed: (digits: number) => string } }[]; statusHistories: readonly { nextStatus: string; reason: string | null; occurredAt: Date }[] }): SerializedOrder => ({ code: order.code, status: order.status, holdReason: order.holdReason, payment: order.payment && { state: order.payment.state, method: order.payment.method, totalReceived: order.payment.totalReceived.toFixed(0), codRemaining: order.payment.codRemaining.toFixed(0) }, lines: order.lines.map((line) => ({ name: line.nameSnapshot, quantity: line.quantity, netAmount: line.netAmount.toFixed(0) })), timeline: order.statusHistories.map((entry) => ({ status: entry.nextStatus, reason: entry.reason, occurredAt: entry.occurredAt.toISOString() })) });


export const orderLookupService = {
  async request(code: string, identifier: string): Promise<{ verificationId: string; expiresAt: string }> {
    const order = await prisma.order.findFirst({ where: { code, isActive: true, OR: [{ receiverEmail: identifier.trim().toLowerCase() }, { receiverPhone: identifier.trim() }] } });
    if (!order) throw new DomainError('ORDER_NOT_FOUND', { messageKey: 'error.orderNotFound', status: 404 });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const verification = await prisma.verification.create({ data: { identifier: identifier.trim().toLowerCase(), value: otp, orderId: order.id, purpose: 'GUEST_ORDER_ACCESS', contactType: order.receiverEmail === identifier.trim().toLowerCase() ? 'EMAIL' : 'PHONE', expiresAt: new Date(Date.now() + 5 * 60_000) } });
    if (process.env.NODE_ENV !== 'production') console.info({ orderCode: code, verificationId: verification.id, otp });
    return { verificationId: verification.id, expiresAt: verification.expiresAt.toISOString() };
  },
  async verify(verificationId: string, code: string): Promise<{ verificationId: string; order: ReturnType<typeof serialize> }> {
    const verification = await prisma.verification.findFirst({ where: { id: verificationId, purpose: 'GUEST_ORDER_ACCESS', consumedAt: null, expiresAt: { gt: new Date() }, orderId: { not: null } }, include: { order: { include: { payment: true, lines: true, statusHistories: { orderBy: { occurredAt: 'asc' } } } } } });
    if (!verification || verification.value !== code || !verification.order) throw new DomainError('ORDER_ACCESS_DENIED', { messageKey: 'error.orderAccessDenied', status: 403 });
    await prisma.verification.update({ where: { id: verification.id }, data: { consumedAt: new Date() } });
    return { verificationId: verification.id, order: serialize(verification.order) };
  },
};
