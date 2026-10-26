import {
  ActorType,
  ContactType,
  CouponRedemptionStatus,
  DepositDisposition,
  FulfillmentMethod,
  NotificationChannel,
  OrderAmendmentStatus,
  OrderAmendmentType,
  OrderHoldReason,
  OrderStatus,
  PaymentChargeStatus,
  PaymentChargeType,
  PaymentMethod,
  PaymentState,
  RefundStatus,
  SalesLineType,
  StockLedgerEntryType,
  StockMoveStatus,
  StockMoveType,
} from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  HoldOrderInput,
  ManualRefundInput,
  PickupToDeliveryInput,
  ResolveHoldInput,
  ResolveQrDiscrepancyInput,
} from '../../validations/admin/order-operations.schema.js';

export type OrderOperationResultDto = {
  success: boolean;
  orderId: string;
  orderCode: string;
  status: OrderStatus;
  message: string;
};

export type QrDiscrepancyDetailDto = {
  orderId: string;
  orderCode: string;
  expectedAmount: string;
  receivedAmount: string;
  differenceAmount: string;
  isUnderpaid: boolean;
  isOverpaid: boolean;
  isExactMatch: boolean;
  chargeId: string;
  providerReference: string;
  providerTransactionId?: string;
  reviewDeadlineAt?: string;
};

export class OrderExceptionService {
  async getQrDiscrepancyDetail(orderId: string): Promise<QrDiscrepancyDetailDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: {
          include: {
            charges: {
              orderBy: { createdAt: 'desc' },
              include: {
                transactions: {
                  orderBy: { occurredAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    const reviewCharge =
      order.payment?.charges.find((c) => c.status === PaymentChargeStatus.REVIEW) ||
      order.payment?.charges[0];

    const expected = Number(reviewCharge?.expectedAmount ?? order.grandTotal);
    const lastTx = reviewCharge?.transactions[0];
    const received = lastTx ? Number(lastTx.receivedAmount) : Number(order.payment?.totalReceived ?? 0);
    const diff = received - expected;

    return {
      orderId: order.id,
      orderCode: order.code,
      expectedAmount: expected.toString(),
      receivedAmount: received.toString(),
      differenceAmount: diff.toString(),
      isUnderpaid: diff < 0,
      isOverpaid: diff > 0,
      isExactMatch: diff === 0,
      chargeId: reviewCharge?.id ?? '',
      providerReference: reviewCharge?.providerReference ?? '',
      providerTransactionId: lastTx?.providerTransactionId,
      reviewDeadlineAt: reviewCharge?.reviewDeadlineAt?.toISOString(),
    };
  }

  async holdOrder(
    orderId: string,
    adminId: string,
    input: HoldOrderInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    const eligibleStatuses: readonly OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING_COMPONENTS,
      OrderStatus.READY_FOR_PICKUP,
    ];

    if (!eligibleStatuses.includes(order.status)) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-022',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          message: 'Don hang chi co the tam giu khi dang o trang thai CONFIRMED, PREPARING_COMPONENTS hoac READY_FOR_PICKUP',
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.ON_HOLD,
          holdReason: input.holdReason,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.ON_HOLD,
          reason: `Tam giu don hang: ${input.note} (Nguyen nhan: ${input.holdReason})`,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:hold:${order.id}:${Date.now()}`,
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.ON_HOLD,
      message: 'Da chuyen don hang sang trang thai tam giu ngoai le ON_HOLD',
    };
  }

  async resolveHold(
    orderId: string,
    adminId: string,
    input: ResolveHoldInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        payment: true,
        lines: {
          where: { lineType: SalesLineType.SKU, skuId: { not: null } },
        },
        stockMoves: {
          where: { moveType: StockMoveType.ORDER_ISSUE },
          include: { lines: true },
        },
        couponRedemption: true,
      },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    if (order.status !== OrderStatus.ON_HOLD) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-022',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          message: 'Don hang khong o trang thai tam giu ON_HOLD',
        },
      });
    }

    if (input.action === 'CANCEL_REFUND') {
      const totalReceived = Number(order.payment?.totalReceived ?? 0);
      const isCustomPc = order.lines.some(
        (l) => Boolean(l.pcBuildKey) || l.serviceType === 'ASSEMBLY',
      );

      await prisma.$transaction(async (tx) => {
        const aggregated = new Map<number, number>();
        for (const line of order.lines) {
          if (line.skuId) {
            aggregated.set(line.skuId, (aggregated.get(line.skuId) ?? 0) + line.quantity);
          }
        }

        const skuIds = [...aggregated.keys()];
        const quants = await tx.stockQuant.findMany({
          where: { branchId: order.fulfillmentBranchId, skuId: { in: skuIds }, isActive: true },
        });

        let targetMove =
          order.stockMoves.find((m) => m.status === StockMoveStatus.RESERVED) ||
          order.stockMoves[0];

        if (!targetMove) {
          targetMove = await tx.stockMove.create({
            data: {
              code: `REL-${order.code}`,
              sourceBranchId: order.fulfillmentBranchId,
              orderId: order.id,
              idempotencyKey: `rel:${order.id}:${Date.now()}`,
              moveType: StockMoveType.ORDER_ISSUE,
              status: StockMoveStatus.CANCELLED,
              reason: `Giai quyet ON_HOLD huy don: ${input.reason}`,
            },
            include: { lines: true },
          });
        }

        for (const [skuId, qty] of aggregated.entries()) {
          const quant = quants.find((q) => q.skuId === skuId);
          if (quant && quant.reserved >= qty) {
            await tx.stockQuant.updateMany({
              where: { id: quant.id, version: quant.version },
              data: {
                reserved: { decrement: qty },
                version: { increment: 1 },
              },
            });

            const updatedQuant = await tx.stockQuant.findUniqueOrThrow({ where: { id: quant.id } });

            let moveLine = targetMove.lines.find((l) => l.skuId === skuId);
            if (!moveLine) {
              moveLine = await tx.stockMoveLine.create({
                data: {
                  stockMoveId: targetMove.id,
                  skuId,
                  quantity: qty,
                  unitCost: quant.weightedAverageCost,
                },
              });
            }

            await tx.stockLedgerEntry.create({
              data: {
                stockQuantId: quant.id,
                stockMoveLineId: moveLine.id,
                entryType: StockLedgerEntryType.RELEASE_RESERVATION,
                deltaOnHand: 0,
                deltaReserved: -qty,
                deltaQuarantine: 0,
                onHandAfter: updatedQuant.onHand,
                reservedAfter: updatedQuant.reserved,
                quarantineAfter: updatedQuant.quarantineDamaged,
                actorType: ActorType.ADMIN,
                actorId: adminId,
              },
            });
          }
        }

        await tx.stockMove.updateMany({
          where: { orderId: order.id, status: StockMoveStatus.RESERVED },
          data: { status: StockMoveStatus.CANCELLED, reason: `Giai quyet ON_HOLD huy don: ${input.reason}` },
        });

        if (order.couponRedemption && order.couponRedemption.status === CouponRedemptionStatus.RESERVED) {
          await tx.couponRedemption.update({
            where: { id: order.couponRedemption.id },
            data: { status: CouponRedemptionStatus.RELEASED, releasedAt: new Date() },
          });
        }

        if (order.payment) {
          if (totalReceived > 0) {
            await tx.payment.update({
              where: { id: order.payment.id },
              data: {
                state: PaymentState.REFUND_PENDING,
                depositDisposition: isCustomPc ? DepositDisposition.FORFEITED : DepositDisposition.REFUND_PENDING,
              },
            });

            await tx.refund.create({
              data: {
                paymentId: order.payment.id,
                idempotencyKey: `refund:resolve-hold:${order.id}:${Date.now()}`,
                amount: totalReceived,
                status: RefundStatus.PENDING,
                reason: `Huy don khi xu ly ngoai le ON_HOLD: ${input.reason}`,
              },
            });
          }
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            holdReason: null,
            cancellationReason: input.reason,
            cancelledAt: new Date(),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            previousStatus: OrderStatus.ON_HOLD,
            nextStatus: OrderStatus.CANCELLED,
            reason: `Giai quyet ngoai le bang cach huy don: ${input.reason}`,
            actorType: ActorType.ADMIN,
            actorId: adminId,
            idempotencyKey: `history:resolve-hold-cancel:${order.id}:${Date.now()}`,
          },
        });
      });

      return {
        success: true,
        orderId: order.id,
        orderCode: order.code,
        status: OrderStatus.CANCELLED,
        message: 'Da giai quyet ngoai le ON_HOLD bang phuong an huy don va tao lenh hoan tien',
      };
    }

    let targetStatus: OrderStatus = OrderStatus.CONFIRMED;
    if (input.action === 'EXTEND_PICKUP' || order.holdReason === OrderHoldReason.PICKUP_EXPIRED) {
      targetStatus = OrderStatus.READY_FOR_PICKUP;
    } else {
      targetStatus = OrderStatus.CONFIRMED;
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: targetStatus,
          holdReason: null,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: OrderStatus.ON_HOLD,
          nextStatus: targetStatus,
          reason: `Giai quyet ngoai le ON_HOLD: ${input.reason} (Hanh dong: ${input.action})`,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:resolve-hold:${order.id}:${Date.now()}`,
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: targetStatus,
      message: `Da giai quyet ngoai le ON_HOLD thanh cong. Don hang tiep tuc o trang thai ${targetStatus}`,
    };
  }

  async createPickupToDeliveryAmendment(
    orderId: string,
    adminId: string,
    input: PickupToDeliveryInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        payment: true,
      },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    const eligibleStatuses: readonly OrderStatus[] = [
      OrderStatus.READY_FOR_PICKUP,
      OrderStatus.ON_HOLD,
    ];

    if (!eligibleStatuses.includes(order.status)) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-023',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          message: 'Chi co the chuyen doi sang giao hang tan noi khi don o trang thai READY_FOR_PICKUP hoac ON_HOLD',
        },
      });
    }

    const activeFeeConfig = await prisma.deliveryFeeConfig.findFirst({
      where: { isActive: true },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!activeFeeConfig) {
      throw new DomainError('CONFIG_NOT_FOUND', {
        messageKey: 'error.deliveryFeeConfigNotFound',
        status: 500,
        details: { message: 'Khong tim thay cau hinh bieu phi van chuyen ap dung' },
      });
    }

    const shippingFee = input.shippingFee;
    const isCod = order.paymentMethod === PaymentMethod.COD;
    const amendmentStatus = isCod
      ? OrderAmendmentStatus.ACCEPTED
      : OrderAmendmentStatus.PAYMENT_PENDING;

    const addressSnapshot = {
      fullAddress: input.deliveryAddress,
      receiverName: input.receiverName,
      receiverPhone: input.receiverPhone,
    };

    const ruleSnapshot = {
      previousMethod: FulfillmentMethod.PICKUP,
      newMethod: FulfillmentMethod.DELIVERY,
      appliedFee: shippingFee,
      configId: activeFeeConfig.id,
    };

    await prisma.$transaction(async (tx) => {
      const amendment = await tx.orderAmendment.create({
        data: {
          orderId: order.id,
          deliveryFeeConfigId: activeFeeConfig.id,
          idempotencyKey: `amd:${order.id}:${Date.now()}`,
          type: OrderAmendmentType.PICKUP_TO_DELIVERY,
          status: amendmentStatus,
          fee: shippingFee,
          reason: input.reason || 'Chuyen doi tu nhan tai shop sang giao hang tan noi (MOD-19)',
          addressSnapshot,
          ruleSnapshot,
          acceptanceChannel: input.acceptanceChannel === 'EMAIL' ? ContactType.EMAIL : ContactType.PHONE,
          acceptedByValue: input.acceptedByValue || input.receiverPhone,
          acceptedAt: new Date(),
        },
      });

      if (!isCod && shippingFee > 0 && order.payment) {
        const providerReference = `AMD-${order.code}-${Date.now().toString().slice(-4)}`;
        await tx.paymentCharge.create({
          data: {
            paymentId: order.payment.id,
            orderAmendmentId: amendment.id,
            idempotencyKey: `charge:amd:${amendment.id}:${Date.now()}`,
            chargeType: PaymentChargeType.AMENDMENT,
            providerReference,
            expectedAmount: shippingFee,
            status: PaymentChargeStatus.PENDING,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });
      }

      if (isCod && order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            codRemaining: { increment: shippingFee },
          },
        });
      }

      const nextStatus =
        order.status === OrderStatus.ON_HOLD ? OrderStatus.READY_FOR_PICKUP : order.status;

      await tx.order.update({
        where: { id: order.id },
        data: {
          fulfillmentMethod: FulfillmentMethod.DELIVERY,
          deliveryFeeConfigId: activeFeeConfig.id,
          deliveryAddressSnapshot: addressSnapshot,
          status: nextStatus,
          holdReason: null,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus,
          reason: `Tao phu luc chuyen sang giao hang tan noi: Phi giao ${shippingFee.toLocaleString('vi-VN')} VND. Phuong thuc thanh toan: ${order.paymentMethod}`,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:amd-pickup-delivery:${order.id}:${Date.now()}`,
        },
      });

      await tx.notification.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          deduplicationKey: `order-amendment-pickup-delivery:${order.id}:${Date.now()}`,
          eventType: 'ORDER_AMENDMENT_CREATED',
          title: `Don hang #${order.code} da chuyen sang giao hang tan noi`,
          body: `Phu luc chuyen doi hinh thuc giao hang da duoc thiet lap. Dia chi giao: ${input.deliveryAddress}. Phu phi giao hang: ${shippingFee.toLocaleString('vi-VN')} VND.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          payload: {
            orderId: order.id,
            amendmentId: amendment.id,
            shippingFee,
          },
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: order.status === OrderStatus.ON_HOLD ? OrderStatus.READY_FOR_PICKUP : order.status,
      message: 'Da tao phu luc chuyen doi nhan tai showroom sang giao hang tan noi thanh cong',
    };
  }

  async resolveQrDiscrepancy(
    orderId: string,
    adminId: string,
    input: ResolveQrDiscrepancyInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        payment: {
          include: {
            charges: {
              orderBy: { createdAt: 'desc' },
              include: {
                transactions: {
                  orderBy: { occurredAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
        lines: {
          where: { lineType: SalesLineType.SKU, skuId: { not: null } },
        },
        stockMoves: {
          where: { moveType: StockMoveType.ORDER_ISSUE },
          include: { lines: true },
        },
        couponRedemption: true,
      },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    const reviewCharge =
      order.payment?.charges.find((c) => c.status === PaymentChargeStatus.REVIEW) ||
      order.payment?.charges[0];

    if (!reviewCharge) {
      throw new DomainError('CHARGE_NOT_FOUND', {
        messageKey: 'error.paymentChargeNotFound',
        status: 404,
        details: { message: 'Khong tim thay giao dich thanh toan QR cua don hang' },
      });
    }

    const lastTx = reviewCharge.transactions[0];
    const actualReceived = lastTx
      ? Number(lastTx.receivedAmount)
      : Number(order.payment?.totalReceived ?? 0);

    if (input.resolutionType === 'MANUAL_MATCH') {
      await prisma.$transaction(async (tx) => {
        await tx.paymentCharge.update({
          where: { id: reviewCharge.id },
          data: {
            status: PaymentChargeStatus.PAID,
          },
        });

        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              state: PaymentState.PAID,
              totalReceived: reviewCharge.expectedAmount,
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CONFIRMED,
            holdReason: null,
            confirmedAt: new Date(),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            previousStatus: order.status,
            nextStatus: OrderStatus.CONFIRMED,
            reason: `Doi soat VietQR - Khop thu cong: ${input.note} (Ma GD: ${input.transactionReference || reviewCharge.providerReference})`,
            actorType: ActorType.ADMIN,
            actorId: adminId,
            idempotencyKey: `history:manual-match-qr:${order.id}:${Date.now()}`,
          },
        });
      });

      return {
        success: true,
        orderId: order.id,
        orderCode: order.code,
        status: OrderStatus.CONFIRMED,
        message: 'Khop thu cong giao dich VietQR thanh cong, don hang da duoc xac nhan (CONFIRMED)',
      };
    }

    await prisma.$transaction(async (tx) => {
      const aggregated = new Map<number, number>();
      for (const line of order.lines) {
        if (line.skuId) {
          aggregated.set(line.skuId, (aggregated.get(line.skuId) ?? 0) + line.quantity);
        }
      }

      const skuIds = [...aggregated.keys()];
      const quants = await tx.stockQuant.findMany({
        where: { branchId: order.fulfillmentBranchId, skuId: { in: skuIds }, isActive: true },
      });

      let targetMove =
        order.stockMoves.find((m) => m.status === StockMoveStatus.RESERVED) ||
        order.stockMoves[0];

      if (!targetMove) {
        targetMove = await tx.stockMove.create({
          data: {
            code: `REL-${order.code}`,
            sourceBranchId: order.fulfillmentBranchId,
            orderId: order.id,
            idempotencyKey: `rel:${order.id}:${Date.now()}`,
            moveType: StockMoveType.ORDER_ISSUE,
            status: StockMoveStatus.CANCELLED,
            reason: `Huy don lech QR: ${input.note}`,
          },
          include: { lines: true },
        });
      }

      for (const [skuId, qty] of aggregated.entries()) {
        const quant = quants.find((q) => q.skuId === skuId);
        if (quant && quant.reserved >= qty) {
          await tx.stockQuant.updateMany({
            where: { id: quant.id, version: quant.version },
            data: {
              reserved: { decrement: qty },
              version: { increment: 1 },
            },
          });

          const updatedQuant = await tx.stockQuant.findUniqueOrThrow({ where: { id: quant.id } });

          let moveLine = targetMove.lines.find((l) => l.skuId === skuId);
          if (!moveLine) {
            moveLine = await tx.stockMoveLine.create({
              data: {
                stockMoveId: targetMove.id,
                skuId,
                quantity: qty,
                unitCost: quant.weightedAverageCost,
              },
            });
          }

          await tx.stockLedgerEntry.create({
            data: {
              stockQuantId: quant.id,
              stockMoveLineId: moveLine.id,
              entryType: StockLedgerEntryType.RELEASE_RESERVATION,
              deltaOnHand: 0,
              deltaReserved: -qty,
              deltaQuarantine: 0,
              onHandAfter: updatedQuant.onHand,
              reservedAfter: updatedQuant.reserved,
              quarantineAfter: updatedQuant.quarantineDamaged,
              actorType: ActorType.ADMIN,
              actorId: adminId,
            },
          });
        }
      }

      await tx.stockMove.updateMany({
        where: { orderId: order.id, status: StockMoveStatus.RESERVED },
        data: {
          status: StockMoveStatus.CANCELLED,
          reason: `Huy don lech QR: ${input.note}`,
        },
      });

      if (
        order.couponRedemption &&
        order.couponRedemption.status === CouponRedemptionStatus.RESERVED
      ) {
        await tx.couponRedemption.update({
          where: { id: order.couponRedemption.id },
          data: {
            status: CouponRedemptionStatus.RELEASED,
            releasedAt: new Date(),
          },
        });
      }

      await tx.paymentCharge.update({
        where: { id: reviewCharge.id },
        data: {
          status: PaymentChargeStatus.REFUND_PENDING,
        },
      });

      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            state: PaymentState.REFUND_PENDING,
          },
        });

        if (actualReceived > 0) {
          await tx.refund.create({
            data: {
              paymentId: order.payment.id,
              idempotencyKey: `refund:qr-discrepancy:${order.id}:${Date.now()}`,
              amount: actualReceived,
              status: RefundStatus.PENDING,
              reason: `Huy don do lech VietQR va hoan 100% so tien thuc nhan (${actualReceived.toLocaleString('vi-VN')} VND): ${input.note}`,
            },
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          holdReason: null,
          cancellationReason: `Huy don do lech VietQR: ${input.note}`,
          cancelledAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.CANCELLED,
          reason: `Doi soat VietQR - Huy don va hoan tien 100% thuc nhan: ${input.note}`,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:cancel-qr:${order.id}:${Date.now()}`,
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.CANCELLED,
      message: 'Da huy don hang va chuyen 100% so tien thuc nhan sang hang doi hoan tien REFUND_PENDING',
    };
  }

  async processManualRefund(
    refundId: string,
    adminId: string,
    input: ManualRefundInput,
  ): Promise<OrderOperationResultDto> {
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        payment: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!refund) {
      throw new DomainError('REFUND_NOT_FOUND', {
        messageKey: 'error.refundNotFound',
        status: 404,
      });
    }

    if (refund.status === RefundStatus.CONFIRMED) {
      return {
        success: true,
        orderId: refund.payment.order.id,
        orderCode: refund.payment.order.code,
        status: refund.payment.order.status,
        message: 'Yeu cau hoan tien da duoc xac nhan truoc do (idempotent)',
      };
    }

    const transferDate = input.transferredAt ? new Date(input.transferredAt) : new Date();

    await prisma.$transaction(async (tx) => {
      await tx.refund.update({
        where: { id: refund.id },
        data: {
          status: RefundStatus.CONFIRMED,
          transactionReference: input.transactionReference,
          occurredAt: transferDate,
          reason: input.note ? `${refund.reason} | Ghi chu: ${input.note}` : refund.reason,
        },
      });

      await tx.payment.update({
        where: { id: refund.paymentId },
        data: {
          state: PaymentState.REFUNDED,
          depositDisposition:
            refund.payment.depositDisposition === DepositDisposition.REFUND_PENDING
              ? DepositDisposition.REFUNDED
              : refund.payment.depositDisposition,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: refund.payment.order.id,
          previousStatus: refund.payment.order.status,
          nextStatus: refund.payment.order.status,
          reason: `Hoan tien thu cong thanh cong: Ma GD ${input.transactionReference}, Ngan hang: ${input.bankName || 'Techcombank'}, So tien: ${Number(refund.amount).toLocaleString('vi-VN')} VND`,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:refund-confirm:${refund.id}:${Date.now()}`,
        },
      });
    });

    return {
      success: true,
      orderId: refund.payment.order.id,
      orderCode: refund.payment.order.code,
      status: refund.payment.order.status,
      message: 'Da xac nhan hoan tien thu cong thanh cong va cap nhat trang thai Payment sang REFUNDED',
    };
  }
}

export const orderExceptionService = new OrderExceptionService();
