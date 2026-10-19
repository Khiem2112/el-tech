import { ActorType, Prisma } from '@prisma/client';
import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

type SubmitOrderInput = {
  readonly cartToken: string;
  readonly emailVerificationId: string;
  readonly phoneVerificationId: string;
  readonly receiverName: string;
  readonly receiverEmail: string;
  readonly receiverPhone: string;
  readonly fulfillmentMethod: 'PICKUP' | 'DELIVERY';
  readonly branchId?: number;
  readonly deliveryAreaCode?: string;
  readonly paymentMethod: 'QR' | 'COD';
  readonly deliveryAddress?: string;
  readonly idempotencyKey: string;
};

type CancelOrderInput = {
  readonly orderCode: string;
  readonly identifier: string;
  readonly sessionToken?: string;
  readonly reason?: string;
};

const asVnd = (value: Prisma.Decimal): string => value.toFixed(0);
const orderCode = (): string => `ELT-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`;

export const orderService = {
  async submit(input: SubmitOrderInput): Promise<{ code: string; status: string; paymentState: string; paymentReference?: string; expectedAmount?: string }> {
    const existing = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { payment: { include: { charges: true } } } });
    if (existing) return { code: existing.code, status: existing.status, paymentState: existing.payment?.state ?? 'UNPAID', paymentReference: existing.payment?.charges[0]?.providerReference, expectedAmount: existing.payment?.charges[0] ? asVnd(existing.payment.charges[0].expectedAmount) : undefined };
    return prisma.$transaction(async (tx) => {
      const [emailVerification, phoneVerification] = await Promise.all([
        tx.verification.findFirst({ where: { id: input.emailVerificationId, purpose: 'CHECKOUT', contactType: 'EMAIL', identifier: input.receiverEmail.trim().toLowerCase(), consumedAt: { not: null } } }),
        tx.verification.findFirst({ where: { id: input.phoneVerificationId, purpose: 'CHECKOUT', contactType: 'PHONE', identifier: input.receiverPhone.trim().toLowerCase(), consumedAt: { not: null } } }),
      ]);
      if (!emailVerification || !phoneVerification) throw new DomainError('CONTACT_NOT_VERIFIED', { ruleId: 'CUS-002', messageKey: 'error.contactNotVerified', status: 409 });
      if (input.fulfillmentMethod === 'DELIVERY' && !input.deliveryAddress) throw new DomainError('DELIVERY_ADDRESS_REQUIRED', { messageKey: 'error.deliveryAddressRequired' });

      const cart = await tx.cart.findFirst({ where: { opaqueToken: input.cartToken, isActive: true }, include: { items: { where: { isActive: true }, include: { sku: { include: { productTemplate: true } } } } } });
      if (!cart || !cart.items.length) throw new DomainError('CART_EMPTY', { messageKey: 'error.cartEmpty', status: 409 });

      const quantities = new Map<number, number>();
      for (const item of cart.items) {
        if (item.skuId) quantities.set(item.skuId, (quantities.get(item.skuId) ?? 0) + item.quantity);
      }

      let branch: { id: number; name: string; address: string };
      if (input.fulfillmentMethod === 'DELIVERY') {
        const eligibleBranches = await tx.branch.findMany({
          where: { isActive: true, ...(input.deliveryAreaCode ? { deliveryAreaCodes: { has: input.deliveryAreaCode } } : {}) },
          include: { stockQuants: { where: { isActive: true, skuId: { in: [...quantities.keys()] } } } },
          orderBy: { deliveryPriority: 'asc' },
        });
        const bestBranch = eligibleBranches.find((candidate) =>
          [...quantities].every(([skuId, quantity]) => {
            const stock = candidate.stockQuants.find((entry) => entry.skuId === skuId);
            return Boolean(stock && stock.onHand - stock.reserved - stock.quarantineDamaged >= quantity);
          })
        );
        if (!bestBranch) throw new DomainError('NO_FULFILLMENT_BRANCH', { ruleId: 'CHK-012', messageKey: 'error.noFulfillmentBranch', status: 409 });
        branch = bestBranch;
      } else {
        if (!input.branchId) throw new DomainError('BRANCH_REQUIRED', { ruleId: 'CHK-004', messageKey: 'error.branchRequired', status: 400 });
        const selectedBranch = await tx.branch.findFirst({ where: { id: input.branchId, isActive: true } });
        if (!selectedBranch) throw new DomainError('BRANCH_NOT_AVAILABLE', { messageKey: 'error.branchNotAvailable', status: 409 });
        branch = selectedBranch;
      }

      const stocks = await tx.stockQuant.findMany({ where: { branchId: branch.id, skuId: { in: [...quantities.keys()] }, isActive: true } });
      if ([...quantities].some(([skuId, quantity]) => { const stock = stocks.find((entry) => entry.skuId === skuId); return !stock || stock.onHand - stock.reserved - stock.quarantineDamaged < quantity; })) throw new DomainError('INSUFFICIENT_STOCK', { ruleId: 'INV-004', messageKey: 'error.insufficientStock', status: 409 });

      const subtotal = cart.items.reduce((sum, item) => item.sku ? sum.add(item.sku.sellingPrice.mul(item.quantity)) : sum, new Prisma.Decimal(0));
      const feeConfig = input.fulfillmentMethod === 'DELIVERY' ? await tx.deliveryFeeConfig.findFirst({ where: { isActive: true, effectiveFrom: { lte: new Date() }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }] }, orderBy: { effectiveFrom: 'desc' } }) : null;
      const shippingFee = feeConfig && subtotal.lessThan(feeConfig.freeShippingThreshold) ? feeConfig.fixedFee : new Prisma.Decimal(0);
      const grandTotal = subtotal.add(shippingFee);

      const normalizedEmail = input.receiverEmail.trim().toLowerCase();
      const normalizedPhone = input.receiverPhone.trim();
      const existingCustomers = await tx.customer.findMany({ where: { isActive: true, OR: [{ email: normalizedEmail }, { phone: normalizedPhone }] } });
      let customerId: string;
      if (existingCustomers.length === 0) {
        const createdCustomer = await tx.customer.create({ data: { name: input.receiverName, email: normalizedEmail, phone: normalizedPhone, emailVerifiedAt: emailVerification.consumedAt!, phoneVerifiedAt: phoneVerification.consumedAt! } });
        customerId = createdCustomer.id;
      } else {
        const exactMatches = existingCustomers.filter((entry) => entry.email.toLowerCase() === normalizedEmail && entry.phone === normalizedPhone);
        if (exactMatches.length === 1 && exactMatches[0]) {
          customerId = exactMatches[0].id;
        } else {
          throw new DomainError('CUSTOMER_IDENTITY_AMBIGUOUS', { ruleId: 'CUS-004', messageKey: 'error.customerIdentityAmbiguous', status: 409 });
        }
      }

      const hasCustomBuild = cart.items.some((item) => item.pcBuildType === 'CUSTOM');
      const isCodWithDeposit = input.paymentMethod === 'COD' && hasCustomBuild;

      let depositRequired = new Prisma.Decimal(0);
      let codRemaining = new Prisma.Decimal(0);
      let status: 'PENDING_PAYMENT' | 'PENDING_COD_CONFIRMATION' = 'PENDING_COD_CONFIRMATION';

      if (input.paymentMethod === 'QR') {
        status = 'PENDING_PAYMENT';
      } else if (isCodWithDeposit) {
        status = 'PENDING_PAYMENT';
        const tenPercent = grandTotal.mul(0.1).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
        const minDeposit = new Prisma.Decimal(500000);
        depositRequired = Prisma.Decimal.min(grandTotal, Prisma.Decimal.max(tenPercent, minDeposit));
        codRemaining = grandTotal.sub(depositRequired);
      } else {
        status = 'PENDING_COD_CONFIRMATION';
        codRemaining = grandTotal;
      }

      const order = await tx.order.create({
        data: {
          code: orderCode(),
          idempotencyKey: input.idempotencyKey,
          customerId,
          fulfillmentBranchId: branch.id,
          deliveryFeeConfigId: feeConfig?.id,
          fulfillmentMethod: input.fulfillmentMethod,
          paymentMethod: input.paymentMethod,
          status,
          subtotal,
          shippingFee,
          grandTotal,
          receiverName: input.receiverName,
          receiverEmail: normalizedEmail,
          receiverPhone: normalizedPhone,
          receiverEmailVerifiedAt: emailVerification.consumedAt!,
          receiverPhoneVerifiedAt: phoneVerification.consumedAt!,
          deliveryAddressSnapshot: input.fulfillmentMethod === 'DELIVERY' ? { address: input.deliveryAddress } : Prisma.DbNull,
          branchSnapshot: { id: branch.id, name: branch.name, address: branch.address },
          pricingSnapshot: { subtotal: asVnd(subtotal), shippingFee: asVnd(shippingFee), grandTotal: asVnd(grandTotal) },
          lines: {
            create: cart.items.map((item, sortOrder) => ({
              skuId: item.skuId ?? undefined,
              sourcePcBundleId: item.sourcePcBundleId ?? undefined,
              lineType: item.lineType,
              serviceType: item.serviceType ?? undefined,
              pcBuildKey: item.pcBuildKey ?? undefined,
              pcBuildNameSnapshot: item.pcBuildName ?? undefined,
              pcBuildTypeSnapshot: item.pcBuildType ?? undefined,
              skuSnapshot: item.sku?.sku ?? (item.lineType === 'SERVICE' ? 'SERVICE-ASSEMBLY' : undefined),
              nameSnapshot: item.sku?.productTemplate.name ?? (item.lineType === 'SERVICE' ? `Dich vu lap rap PC (${item.pcBuildName ?? 'PC'})` : 'San pham'),
              specSnapshot: item.sku?.variantSpec === null ? Prisma.JsonNull : ((item.sku?.variantSpec ?? {}) as Prisma.InputJsonValue),
              quantity: item.quantity,
              unitPrice: item.sku ? item.sku.sellingPrice : new Prisma.Decimal(0),
              netAmount: item.sku ? item.sku.sellingPrice.mul(item.quantity) : new Prisma.Decimal(0),
              sortOrder,
            })),
          },
        },
      });

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          method: input.paymentMethod,
          state: 'UNPAID',
          depositRequired,
          codRemaining,
          depositDisposition: isCodWithDeposit ? 'HELD' : null,
        },
      });

      let paymentReference: string | undefined;
      let expectedChargeAmount: Prisma.Decimal | undefined;

      if (input.paymentMethod === 'QR') {
        paymentReference = `QR-${order.code}`;
        expectedChargeAmount = grandTotal;
        await tx.paymentCharge.create({ data: { paymentId: payment.id, idempotencyKey: input.idempotencyKey, chargeType: 'INITIAL_ORDER', providerReference: paymentReference, expectedAmount: grandTotal, expiresAt: new Date(Date.now() + 30 * 60_000) } });
        const move = await tx.stockMove.create({ data: { code: `RES-${order.code}`, sourceBranchId: branch.id, orderId: order.id, idempotencyKey: `reserve:${order.id}`, moveType: 'ORDER_ISSUE', status: 'RESERVED', expiresAt: new Date(Date.now() + 30 * 60_000), reservedAt: new Date() } });
        for (const [skuId, quantity] of quantities) {
          const stock = stocks.find((entry) => entry.skuId === skuId)!;
          const updated = await tx.stockQuant.updateMany({ where: { id: stock.id, version: stock.version }, data: { reserved: { increment: quantity }, version: { increment: 1 } } });
          if (updated.count !== 1) throw new DomainError('STOCK_CHANGED', { ruleId: 'INV-006', messageKey: 'error.stockChanged', retryable: true, status: 409 });
          const after = await tx.stockQuant.findUniqueOrThrow({ where: { id: stock.id } });
          const moveLine = await tx.stockMoveLine.create({ data: { stockMoveId: move.id, skuId, quantity, unitCost: stock.weightedAverageCost } });
          await tx.stockLedgerEntry.create({ data: { stockQuantId: stock.id, stockMoveLineId: moveLine.id, entryType: 'RESERVE', deltaReserved: quantity, onHandAfter: after.onHand, reservedAfter: after.reserved, quarantineAfter: after.quarantineDamaged, actorType: ActorType.CUSTOMER } });
        }
      } else if (isCodWithDeposit) {
        paymentReference = `DEP-${order.code}`;
        expectedChargeAmount = depositRequired;
        await tx.paymentCharge.create({ data: { paymentId: payment.id, idempotencyKey: input.idempotencyKey, chargeType: 'CUSTOM_BUILD_DEPOSIT', providerReference: paymentReference, expectedAmount: depositRequired, expiresAt: new Date(Date.now() + 30 * 60_000) } });
      }

      await tx.orderStatusHistory.create({ data: { orderId: order.id, previousStatus: status, nextStatus: status, reason: 'ORDER_SUBMITTED', actorType: ActorType.CUSTOMER, idempotencyKey: `status:${order.id}` } });
      await tx.cart.update({ where: { id: cart.id }, data: { isActive: false } });
      return { code: order.code, status: order.status, paymentState: payment.state, paymentReference, expectedAmount: expectedChargeAmount ? asVnd(expectedChargeAmount) : undefined };
    });
  },

  async cancel(input: CancelOrderInput): Promise<{ code: string; status: string; paymentState: string }> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          code: input.orderCode,
          isActive: true,
          OR: [
            { receiverEmail: input.identifier.trim().toLowerCase() },
            { receiverPhone: input.identifier.trim() },
          ],
        },
        include: {
          payment: true,
          lines: true,
          stockMoves: { where: { status: 'RESERVED' }, include: { lines: true } },
        },
      });

      if (!order) throw new DomainError('ORDER_NOT_FOUND', { messageKey: 'error.orderNotFound', status: 404 });

      if (input.sessionToken) {
        const session = await tx.verification.findFirst({
          where: {
            id: input.sessionToken,
            purpose: 'GUEST_ORDER_ACCESS',
            consumedAt: { not: null },
            orderId: order.id,
          },
        });
        if (!session) {
          throw new DomainError('ORDER_ACCESS_DENIED', { messageKey: 'error.orderAccessDenied', status: 403 });
        }
      }

      const eligibleStatuses = ['PENDING_PAYMENT', 'PENDING_COD_CONFIRMATION', 'CONFIRMED'];
      if (!eligibleStatuses.includes(order.status)) {
        throw new DomainError('ORDER_NOT_CANCELLABLE', { ruleId: 'ORD-015', messageKey: 'error.orderNotCancellable', status: 409 });
      }

      for (const move of order.stockMoves) {
        if (!move.sourceBranchId) continue;
        const sourceBranchId = move.sourceBranchId;
        await tx.stockMove.update({ where: { id: move.id }, data: { status: 'CANCELLED' } });
        for (const moveLine of move.lines) {
          const stock = await tx.stockQuant.findFirst({ where: { branchId: sourceBranchId, skuId: moveLine.skuId, isActive: true } });
          if (stock) {
            await tx.stockQuant.update({ where: { id: stock.id }, data: { reserved: { decrement: moveLine.quantity }, version: { increment: 1 } } });
            const after = await tx.stockQuant.findUniqueOrThrow({ where: { id: stock.id } });
            await tx.stockLedgerEntry.create({
              data: {
                stockQuantId: stock.id,
                stockMoveLineId: moveLine.id,
                entryType: 'RELEASE_RESERVATION',
                deltaReserved: -moveLine.quantity,
                onHandAfter: after.onHand,
                reservedAfter: after.reserved,
                quarantineAfter: after.quarantineDamaged,
                actorType: ActorType.CUSTOMER,
              },
            });
          }
        }
      }

      if (order.payment) {
        await tx.paymentCharge.updateMany({
          where: { paymentId: order.payment.id, status: 'PENDING' },
          data: { status: 'EXPIRED' },
        });
      }

      let nextPaymentState = order.payment?.state ?? 'UNPAID';
      if (order.payment && order.payment.totalReceived.greaterThan(0)) {
        nextPaymentState = 'REFUND_PENDING';
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            state: 'REFUND_PENDING',
            depositDisposition: order.payment.depositDisposition ? 'REFUND_PENDING' : null,
          },
        });
        await tx.refund.create({
          data: {
            paymentId: order.payment.id,
            idempotencyKey: `refund:${order.id}:${Date.now()}`,
            amount: order.payment.totalReceived,
            status: 'PENDING',
            reason: input.reason ?? 'CUSTOMER_SELF_CANCEL',
          },
        });
      } else if (order.payment && order.payment.state === 'PENDING') {
        nextPaymentState = 'EXPIRED';
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { state: 'EXPIRED' },
        });
      }

      const cancelledAt = new Date();
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancelledAt,
          cancellationReason: input.reason ?? 'Khách hàng yêu cầu hủy đơn',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: 'CANCELLED',
          reason: input.reason ?? 'CUSTOMER_SELF_CANCEL',
          actorType: ActorType.CUSTOMER,
          idempotencyKey: `cancel:${order.id}:${Date.now()}`,
        },
      });

      return { code: order.code, status: 'CANCELLED', paymentState: nextPaymentState };
    });
  },

  async expireOrderIfOverdue(orderId: string): Promise<boolean> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: { include: { charges: { where: { status: 'PENDING' } } } },
      },
    });
    if (!order || order.status !== 'PENDING_PAYMENT') return false;
    const hasExpiredCharge = order.payment?.charges.some((charge) => charge.expiresAt && charge.expiresAt < new Date());
    if (!hasExpiredCharge) return false;

    await prisma.$transaction(async (tx) => {
      const freshOrder = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          payment: { include: { charges: { where: { status: 'PENDING' } } } },
          stockMoves: { where: { status: 'RESERVED' }, include: { lines: true } },
        },
      });
      if (freshOrder.status !== 'PENDING_PAYMENT') return;

      for (const move of freshOrder.stockMoves) {
        if (!move.sourceBranchId) continue;
        const sourceBranchId = move.sourceBranchId;
        await tx.stockMove.update({ where: { id: move.id }, data: { status: 'CANCELLED' } });
        for (const moveLine of move.lines) {
          const stock = await tx.stockQuant.findFirst({ where: { branchId: sourceBranchId, skuId: moveLine.skuId, isActive: true } });
          if (stock) {
            await tx.stockQuant.update({ where: { id: stock.id }, data: { reserved: { decrement: moveLine.quantity }, version: { increment: 1 } } });
            const after = await tx.stockQuant.findUniqueOrThrow({ where: { id: stock.id } });
            await tx.stockLedgerEntry.create({
              data: {
                stockQuantId: stock.id,
                stockMoveLineId: moveLine.id,
                entryType: 'RELEASE_RESERVATION',
                deltaReserved: -moveLine.quantity,
                onHandAfter: after.onHand,
                reservedAfter: after.reserved,
                quarantineAfter: after.quarantineDamaged,
                actorType: ActorType.SYSTEM,
              },
            });
          }
        }
      }

      if (freshOrder.payment) {
        await tx.paymentCharge.updateMany({
          where: { paymentId: freshOrder.payment.id, status: 'PENDING', expiresAt: { lt: new Date() } },
          data: { status: 'EXPIRED' },
        });
        await tx.payment.update({
          where: { id: freshOrder.payment.id },
          data: { state: 'EXPIRED' },
        });
      }

      await tx.order.update({
        where: { id: freshOrder.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'PAYMENT_TIMEOUT',
          cancelledAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: freshOrder.id,
          previousStatus: 'PENDING_PAYMENT',
          nextStatus: 'CANCELLED',
          reason: 'PAYMENT_TIMEOUT',
          actorType: ActorType.SYSTEM,
          idempotencyKey: `timeout:${freshOrder.id}:${Date.now()}`,
        },
      });
    });

    return true;
  },

  async expireOverdueOrders(): Promise<number> {
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        isActive: true,
        payment: {
          charges: {
            some: {
              status: 'PENDING',
              expiresAt: { lt: new Date() },
            },
          },
        },
      },
      select: { id: true },
    });
    let count = 0;
    for (const entry of expiredOrders) {
      const expired = await this.expireOrderIfOverdue(entry.id);
      if (expired) count++;
    }
    return count;
  },

  async getKanbanOrders(): Promise<readonly unknown[]> {
    const orders = await prisma.order.findMany({
      where: { isActive: true },
      include: {
        fulfillmentBranch: true,
        lines: { take: 3 },
        payment: true,
        verifications: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stageMap: Record<string, string> = {
      PENDING_PAYMENT: 'pending',
      PENDING_COD_CONFIRMATION: 'pending',
      CONFIRMED: 'preparing',
      PREPARING_COMPONENTS: 'preparing',
      ASSEMBLING: 'assembling',
      READY_FOR_PICKUP: 'ready',
      SHIPPING: 'ready',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    };

    return orders.map((o) => {
      const stage = stageMap[o.status] || 'pending';
      const firstLine = o.lines[0];
      const isPc = Boolean(firstLine?.pcBuildKey || o.lines.length >= 3);
      const otpVerification = o.verifications.find((v) => v.identifier.includes('OTP') || Boolean(v.value));

      let highlight: { type: 'warning' | 'info' | 'telemetry' | 'otp' | 'success'; text: string; badge?: string; progress?: number } | undefined;
      if (stage === 'pending') {
        highlight = { type: 'warning', text: 'Chờ đối soát VietQR tự động qua Napas247', badge: 'QR 15m' };
      } else if (stage === 'assembling') {
        highlight = { type: 'telemetry', text: 'Furmark v2.4: 67°C ổn định · Fan 1450 RPM', progress: 68 };
      } else if (stage === 'ready' && otpVerification) {
        highlight = { type: 'otp', text: `Mã OTP nhận máy: ${otpVerification.value}`, badge: 'OTP quay' };
      } else if (stage === 'completed') {
        highlight = { type: 'success', text: 'Đã kích hoạt bảo hành điện tử 36 tháng', badge: 'Hoàn tất' };
      }

      return {
        id: o.id,
        code: o.code,
        type: isPc ? 'pc' : 'parts',
        typeName: isPc ? 'PC Custom Build' : 'Linh kiện phần cứng',
        title: firstLine ? firstLine.nameSnapshot : 'Đơn hàng PC & Linh kiện',
        subtitle: o.lines.length > 1 ? `${firstLine?.nameSnapshot} + ${o.lines.length - 1} linh kiện khác` : 'Bảo hành chính hãng EL-TECH',
        thumbnail: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
        totalAmount: Number(o.grandTotal),
        stage: stage === 'cancelled' ? 'completed' : stage,
        branch: o.fulfillmentBranch?.code === 'BRANCH-HN' ? 'hn' : 'hcm',
        branchName: o.fulfillmentBranch?.name || 'Hub Quận 10, TP.HCM',
        createdAtText: new Date(o.createdAt).toLocaleDateString('vi-VN'),
        technician: {
          initials: 'NV',
          name: 'Kỹ thuật viên EL-TECH',
        },
        highlight,
      };
    });
  },

  async getCustomerOrders(identifier?: string): Promise<readonly unknown[]> {
    const customer = await prisma.customer.findFirst({
      where: identifier
        ? { OR: [{ id: identifier }, { email: identifier }, { phone: identifier }] }
        : { email: 'hoangnam.tech@gmail.com' },
    });

    if (!customer) return [];

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id, isActive: true },
      include: {
        fulfillmentBranch: true,
        lines: true,
        payment: true,
        verifications: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      id: o.id,
      code: o.code,
      status: o.status,
      grandTotal: Number(o.grandTotal),
      subtotal: Number(o.subtotal),
      receiverName: o.receiverName,
      receiverPhone: o.receiverPhone,
      receiverAddress: typeof o.deliveryAddressSnapshot === 'object' ? (o.deliveryAddressSnapshot as Record<string, string>)?.address : 'Tại quầy',
      createdAt: o.createdAt,
      lines: o.lines.map((l) => ({
        id: l.id,
        name: l.nameSnapshot,
        quantity: l.quantity,
        unitPrice: Number(l.unitPrice),
      })),
      otpCode: o.verifications[0]?.value,
    }));
  },
};
