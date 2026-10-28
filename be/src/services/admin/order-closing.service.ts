import {
  ActorType,
  CouponRedemptionStatus,
  DepositDisposition,
  FulfillmentMethod,
  NotificationChannel,
  OrderStatus,
  PaymentMethod,
  PaymentState,
  RefundStatus,
  SalesLineType,
  SerialStatus,
  ServiceType,
  StockLedgerEntryType,
  StockMoveStatus,
  StockMoveType,
} from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CancelOrderInput,
  CompleteOrderInput,
} from '../../validations/admin/order-operations.schema.js';

export type CancellationPreviewDto = {
  orderId: string;
  orderCode: string;
  currentStatus: OrderStatus;
  canCancel: boolean;
  blockReason?: string;
  isCustomPc: boolean;
  hasPreparedComponents: boolean;
  depositRequired: string;
  isDepositForfeited: boolean;
  totalReceived: string;
  refundableAmount: string;
  reservedItemsCount: number;
};

export type OrderOperationResultDto = {
  success: boolean;
  orderId: string;
  orderCode: string;
  status: OrderStatus;
  message: string;
};

export class OrderClosingService {
  async getCancellationPreview(orderId: string): Promise<CancellationPreviewDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        lines: true,
        statusHistories: true,
      },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    if (
      order.status === OrderStatus.SHIPPING ||
      order.status === OrderStatus.DELIVERY_FAILED ||
      order.status === OrderStatus.RETURNING
    ) {
      return {
        orderId: order.id,
        orderCode: order.code,
        currentStatus: order.status,
        canCancel: false,
        blockReason: 'Don hang da xuat kho giao van hoac dang chuyen hoan. Bat buoc phai xac nhan nhap kho ve chi nhanh truoc khi huy.',
        isCustomPc: false,
        hasPreparedComponents: false,
        depositRequired: '0',
        isDepositForfeited: false,
        totalReceived: '0',
        refundableAmount: '0',
        reservedItemsCount: 0,
      };
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      return {
        orderId: order.id,
        orderCode: order.code,
        currentStatus: order.status,
        canCancel: false,
        blockReason: 'Don hang da hoan tat hoac da o trang thai huy truoc do.',
        isCustomPc: false,
        hasPreparedComponents: false,
        depositRequired: '0',
        isDepositForfeited: false,
        totalReceived: '0',
        refundableAmount: '0',
        reservedItemsCount: 0,
      };
    }

    const isCustomPc = order.lines.some(
      (l) => Boolean(l.pcBuildKey) || l.serviceType === ServiceType.ASSEMBLY || l.lineType === SalesLineType.SERVICE,
    );

    const preparedStatuses: readonly OrderStatus[] = [
      OrderStatus.PREPARING_COMPONENTS,
      OrderStatus.ASSEMBLING,
      OrderStatus.READY_FOR_PICKUP,
      OrderStatus.RETURNED_TO_BRANCH,
    ];

    const hasPreparedComponents =
      preparedStatuses.includes(order.status) ||
      order.statusHistories.some(
        (h) => h.nextStatus === OrderStatus.PREPARING_COMPONENTS || h.nextStatus === OrderStatus.ASSEMBLING,
      );

    const totalReceived = Number(order.payment?.totalReceived ?? 0);
    const depositRequired = Number(order.payment?.depositRequired ?? 0);

    const isDepositForfeited =
      isCustomPc &&
      hasPreparedComponents &&
      order.paymentMethod === PaymentMethod.COD &&
      depositRequired > 0;
    let refundableAmount = 0;

    if (isDepositForfeited) {
      refundableAmount = Math.max(0, totalReceived - depositRequired);
    } else {
      refundableAmount = totalReceived;
    }

    const reservedLines = order.lines.filter((l) => l.lineType === SalesLineType.SKU && l.skuId !== null);
    const reservedItemsCount = reservedLines.reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      orderId: order.id,
      orderCode: order.code,
      currentStatus: order.status,
      canCancel: true,
      isCustomPc,
      hasPreparedComponents,
      depositRequired: depositRequired.toString(),
      isDepositForfeited,
      totalReceived: totalReceived.toString(),
      refundableAmount: refundableAmount.toString(),
      reservedItemsCount,
    };
  }

  async completeOrder(
    orderId: string,
    adminId: string,
    input: CompleteOrderInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        payment: {
          include: {
            charges: true,
            refunds: true,
            codCollections: true,
          },
        },
        lines: {
          include: {
            sku: {
              include: {
                productTemplate: true,
              },
            },
          },
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

    const eligibleStatuses: readonly OrderStatus[] = [
      OrderStatus.SHIPPING,
      OrderStatus.READY_FOR_PICKUP,
    ];

    if (!eligibleStatuses.includes(order.status)) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-010',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          eligibleStatuses,
          message: 'Don hang chi co the hoan tat tu trang thai SHIPPING hoac READY_FOR_PICKUP',
        },
      });
    }

    const hasAssembly = order.lines.some(
      (line) => line.serviceType === ServiceType.ASSEMBLY || line.lineType === SalesLineType.SERVICE,
    );

    const isPickupStandalone =
      order.fulfillmentMethod === FulfillmentMethod.PICKUP && !hasAssembly;

    const remainingCod = Number(order.payment?.codRemaining ?? 0);

    await prisma.$transaction(async (tx) => {
      if (order.paymentMethod === PaymentMethod.COD && remainingCod > 0 && order.payment) {
        await tx.codCollection.create({
          data: {
            paymentId: order.payment.id,
            idempotencyKey: `cod-col:${order.id}:${Date.now()}`,
            amount: remainingCod,
            actorId: adminId,
            occurredAt: new Date(),
          },
        });

        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            totalReceived: { increment: remainingCod },
            codRemaining: 0,
            state: PaymentState.PAID,
          },
        });
      }

      if (isPickupStandalone) {
        const aggregated = new Map<number, { skuId: number; quantity: number }>();
        for (const line of order.lines) {
          if (line.skuId && line.lineType === SalesLineType.SKU) {
            const existing = aggregated.get(line.skuId);
            if (existing) {
              existing.quantity += line.quantity;
            } else {
              aggregated.set(line.skuId, { skuId: line.skuId, quantity: line.quantity });
            }
          }
        }

        const skuIds = [...aggregated.keys()];
        const quants = await tx.stockQuant.findMany({
          where: {
            branchId: order.fulfillmentBranchId,
            skuId: { in: skuIds },
            isActive: true,
          },
        });

        let targetStockMove = order.stockMoves[0];
        if (!targetStockMove) {
          targetStockMove = await tx.stockMove.create({
            data: {
              code: `ISS-${order.code}`,
              sourceBranchId: order.fulfillmentBranchId,
              orderId: order.id,
              idempotencyKey: `issue:${order.id}:${Date.now()}`,
              moveType: StockMoveType.ORDER_ISSUE,
              status: StockMoveStatus.VALIDATED,
              validatedAt: new Date(),
              validatedById: adminId,
              reason: 'Ban giao truc tiep tai showroom va hoan tat don hang',
            },
            include: { lines: true },
          });
        } else {
          targetStockMove = await tx.stockMove.update({
            where: { id: targetStockMove.id },
            data: {
              status: StockMoveStatus.VALIDATED,
              validatedAt: new Date(),
              validatedById: adminId,
              reason: 'Ban giao truc tiep tai showroom va hoan tat don hang',
            },
            include: { lines: true },
          });
        }

        for (const [skuId, item] of aggregated.entries()) {
          const quant = quants.find((q) => q.skuId === skuId);
          if (quant) {
            await tx.stockQuant.updateMany({
              where: { id: quant.id, version: quant.version },
              data: {
                onHand: { decrement: item.quantity },
                reserved: { decrement: item.quantity },
                version: { increment: 1 },
              },
            });

            const updatedQuant = await tx.stockQuant.findUniqueOrThrow({
              where: { id: quant.id },
            });

            let moveLine = targetStockMove.lines.find((l) => l.skuId === skuId);
            if (!moveLine) {
              moveLine = await tx.stockMoveLine.create({
                data: {
                  stockMoveId: targetStockMove.id,
                  skuId,
                  quantity: item.quantity,
                  unitCost: quant.weightedAverageCost,
                },
              });
            }

            await tx.stockLedgerEntry.create({
              data: {
                stockQuantId: quant.id,
                stockMoveLineId: moveLine.id,
                entryType: StockLedgerEntryType.ORDER_ISSUE,
                deltaOnHand: -item.quantity,
                deltaReserved: -item.quantity,
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

        if (input.confirmedSerialNumbers && input.confirmedSerialNumbers.length > 0) {
          await tx.serialUnit.updateMany({
            where: {
              serialNumber: { in: input.confirmedSerialNumbers },
              currentBranchId: order.fulfillmentBranchId,
            },
            data: {
              status: SerialStatus.ISSUED,
            },
          });
        }
      }

      if (
        order.couponRedemption &&
        order.couponRedemption.status === CouponRedemptionStatus.RESERVED
      ) {
        await tx.couponRedemption.update({
          where: { id: order.couponRedemption.id },
          data: {
            status: CouponRedemptionStatus.CONSUMED,
            consumedAt: new Date(),
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.COMPLETED,
          reason:
            input.note ||
            (order.fulfillmentMethod === FulfillmentMethod.PICKUP
              ? 'Hoan tat ban giao don hang tai quầy'
              : 'Xac nhan giao hang thanh cong'),
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:complete:${order.id}:${Date.now()}`,
        },
      });

      await tx.notification.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          deduplicationKey: `order-completed:${order.id}:${Date.now()}`,
          eventType: 'ORDER_COMPLETED',
          title: `Don hang #${order.code} da hoan tat`,
          body: `Don hang #${order.code} da duoc ban giao thanh cong. Quy khach hien da co the gui danh gia xac thuc cho cac san pham da mua.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          payload: {
            orderId: order.id,
            orderCode: order.code,
            completedAt: new Date().toISOString(),
          },
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.COMPLETED,
      message: 'Hoan tat don hang, quyet toan tai chinh va kich hoat quyen danh gia xac minh thanh cong',
    };
  }

  async cancelOrder(
    orderId: string,
    adminId: string,
    input: CancelOrderInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        payment: {
          include: {
            charges: true,
            refunds: true,
          },
        },
        lines: {
          include: {
            sku: {
              include: {
                productTemplate: true,
              },
            },
          },
        },
        statusHistories: true,
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

    if (
      order.status === OrderStatus.SHIPPING ||
      order.status === OrderStatus.DELIVERY_FAILED ||
      order.status === OrderStatus.RETURNING
    ) {
      throw new DomainError('CANNOT_CANCEL_SHIPPED_ORDER', {
        ruleId: 'ORD-012',
        messageKey: 'error.cannotCancelShippedOrder',
        status: 400,
        details: {
          currentStatus: order.status,
          message: 'Don hang da xuat kho giao van hoac dang chuyen hoan khong the huy truc tiep. Phai xac nhan nhap kho ve chi nhanh truoc.',
        },
      });
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-013',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          message: 'Don hang da hoan tat hoac da bi huy truoc do khong the thao tac lai.',
        },
      });
    }

    const isCustomPc = order.lines.some(
      (l) => Boolean(l.pcBuildKey) || l.serviceType === ServiceType.ASSEMBLY || l.lineType === SalesLineType.SERVICE,
    );

    const preparedStatuses: readonly OrderStatus[] = [
      OrderStatus.PREPARING_COMPONENTS,
      OrderStatus.ASSEMBLING,
      OrderStatus.READY_FOR_PICKUP,
      OrderStatus.RETURNED_TO_BRANCH,
    ];

    const hasPreparedComponents =
      preparedStatuses.includes(order.status) ||
      order.statusHistories.some(
        (h) => h.nextStatus === OrderStatus.PREPARING_COMPONENTS || h.nextStatus === OrderStatus.ASSEMBLING,
      );

    const totalReceived = Number(order.payment?.totalReceived ?? 0);
    const depositRequired = Number(order.payment?.depositRequired ?? 0);

    const isDepositForfeited =
      isCustomPc &&
      hasPreparedComponents &&
      order.paymentMethod === PaymentMethod.COD &&
      depositRequired > 0;

    let refundableAmount = 0;
    if (isDepositForfeited) {
      refundableAmount = Math.max(0, totalReceived - depositRequired);
    } else {
      refundableAmount = totalReceived;
    }

    const validatedIssueMove = order.stockMoves.find(
      (m) => m.moveType === StockMoveType.ORDER_ISSUE && m.status === StockMoveStatus.VALIDATED,
    );

    const unreserveStatuses: readonly OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING_COMPONENTS,
      OrderStatus.ON_HOLD,
    ];
    const hasStockToUnreserve = unreserveStatuses.includes(order.status) && !validatedIssueMove;

    await prisma.$transaction(async (tx) => {
      if (validatedIssueMove) {
        const aggregated = new Map<number, { skuId: number; quantity: number }>();
        for (const line of order.lines) {
          if (line.skuId && line.lineType === SalesLineType.SKU) {
            const existing = aggregated.get(line.skuId);
            if (existing) {
              existing.quantity += line.quantity;
            } else {
              aggregated.set(line.skuId, { skuId: line.skuId, quantity: line.quantity });
            }
          }
        }

        const reversalCode = `REV-${order.code}-${Date.now().toString().slice(-4)}`;
        const reversalStockMove = await tx.stockMove.create({
          data: {
            code: reversalCode,
            destinationBranchId: order.fulfillmentBranchId,
            orderId: order.id,
            reversalOfMoveId: validatedIssueMove.id,
            idempotencyKey: `cancel-reversal:${order.id}:${Date.now()}`,
            moveType: StockMoveType.ORDER_REVERSAL,
            status: StockMoveStatus.VALIDATED,
            validatedAt: new Date(),
            validatedById: adminId,
            reason: `Nhap hoan kho khi huy don hang: ${input.reason}`,
          },
        });

        const revLineMap = new Map<number, string>();

        for (const [skuId, item] of aggregated.entries()) {
          const quant = await tx.stockQuant.findFirst({
            where: {
              branchId: order.fulfillmentBranchId,
              skuId,
              isActive: true,
            },
          });

          if (quant) {
            await tx.stockQuant.updateMany({
              where: { id: quant.id, version: quant.version },
              data: {
                onHand: { increment: item.quantity },
                version: { increment: 1 },
              },
            });

            const updatedQuant = await tx.stockQuant.findUniqueOrThrow({
              where: { id: quant.id },
            });

            const origLine = validatedIssueMove.lines.find((l) => l.skuId === skuId);

            const revMoveLine = await tx.stockMoveLine.create({
              data: {
                stockMoveId: reversalStockMove.id,
                skuId,
                originalMoveLineId: origLine?.id || null,
                quantity: item.quantity,
                unitCost: quant.weightedAverageCost,
              },
            });

            revLineMap.set(skuId, revMoveLine.id);

            await tx.stockLedgerEntry.create({
              data: {
                stockQuantId: quant.id,
                stockMoveLineId: revMoveLine.id,
                entryType: StockLedgerEntryType.REVERSAL,
                deltaOnHand: item.quantity,
                deltaReserved: 0,
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

        const origMoveLineIds = validatedIssueMove.lines.map((l) => l.id);
        const issuedSerialMovements = await tx.serialMovement.findMany({
          where: {
            stockMoveLineId: { in: origMoveLineIds },
            resultingStatus: SerialStatus.ISSUED,
          },
          include: {
            serialUnit: true,
          },
        });

        for (const mov of issuedSerialMovements) {
          const revLineId = revLineMap.get(mov.serialUnit.skuId);
          if (revLineId) {
            await tx.serialUnit.update({
              where: { id: mov.serialUnitId },
              data: {
                status: SerialStatus.AVAILABLE,
                currentBranchId: order.fulfillmentBranchId,
              },
            });

            await tx.serialMovement.create({
              data: {
                serialUnitId: mov.serialUnitId,
                stockMoveLineId: revLineId,
                fromBranchId: null,
                toBranchId: order.fulfillmentBranchId,
                resultingStatus: SerialStatus.AVAILABLE,
              },
            });
          }
        }

        await tx.stockMove.updateMany({
          where: {
            orderId: order.id,
            status: StockMoveStatus.RESERVED,
          },
          data: {
            status: StockMoveStatus.CANCELLED,
            reason: `Huy don hang: ${input.reason}`,
          },
        });
      } else if (hasStockToUnreserve) {
        const aggregated = new Map<number, { skuId: number; quantity: number }>();
        for (const line of order.lines) {
          if (line.skuId && line.lineType === SalesLineType.SKU) {
            const existing = aggregated.get(line.skuId);
            if (existing) {
              existing.quantity += line.quantity;
            } else {
              aggregated.set(line.skuId, { skuId: line.skuId, quantity: line.quantity });
            }
          }
        }

        const skuIds = [...aggregated.keys()];
        const quants = await tx.stockQuant.findMany({
          where: {
            branchId: order.fulfillmentBranchId,
            skuId: { in: skuIds },
            isActive: true,
          },
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
              reason: `Huy don hang: ${input.reason}`,
            },
            include: { lines: true },
          });
        }

        for (const [skuId, item] of aggregated.entries()) {
          const quant = quants.find((q) => q.skuId === skuId);
          if (quant && quant.reserved >= item.quantity) {
            await tx.stockQuant.updateMany({
              where: { id: quant.id, version: quant.version },
              data: {
                reserved: { decrement: item.quantity },
                version: { increment: 1 },
              },
            });

            const updatedQuant = await tx.stockQuant.findUniqueOrThrow({
              where: { id: quant.id },
            });

            let moveLine = targetMove.lines.find((l) => l.skuId === skuId);
            if (!moveLine) {
              moveLine = await tx.stockMoveLine.create({
                data: {
                  stockMoveId: targetMove.id,
                  skuId,
                  quantity: item.quantity,
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
                deltaReserved: -item.quantity,
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
          where: {
            orderId: order.id,
            status: StockMoveStatus.RESERVED,
          },
          data: {
            status: StockMoveStatus.CANCELLED,
            reason: `Huy don hang: ${input.reason}`,
          },
        });
      }

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

      if (order.payment) {
        if (isDepositForfeited) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              depositDisposition: DepositDisposition.FORFEITED,
              state: refundableAmount > 0 ? PaymentState.REFUND_PENDING : order.payment.state,
            },
          });

          if (refundableAmount > 0) {
            await tx.refund.create({
              data: {
                paymentId: order.payment.id,
                idempotencyKey: `refund:cancel:${order.id}:${Date.now()}`,
                amount: refundableAmount,
                status: RefundStatus.PENDING,
                reason: `${input.reason} (Tich thu 10% coc PC, hoan phan tien chenh lech)`,
              },
            });
          }
        } else {
          if (totalReceived > 0) {
            await tx.payment.update({
              where: { id: order.payment.id },
              data: {
                state: PaymentState.REFUND_PENDING,
                depositDisposition:
                  depositRequired > 0
                    ? DepositDisposition.REFUND_PENDING
                    : order.payment.depositDisposition,
              },
            });

            await tx.refund.create({
              data: {
                paymentId: order.payment.id,
                idempotencyKey: `refund:cancel:${order.id}:${Date.now()}`,
                amount: totalReceived,
                status: RefundStatus.PENDING,
                reason: input.reason,
              },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancellationReason: input.reason,
          cancelledAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.CANCELLED,
          reason: input.reason,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:cancel:${order.id}:${Date.now()}`,
        },
      });

      await tx.notification.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          deduplicationKey: `order-cancelled:${order.id}:${Date.now()}`,
          eventType: 'ORDER_CANCELLED',
          title: `Don hang #${order.code} da bi huy`,
          body: `Don hang #${order.code} da duoc huy bo voi ly do: ${input.reason}. Tinh trang tien coc/hoan tien da duoc he thong ghi nhan tu dong.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          payload: {
            orderId: order.id,
            orderCode: order.code,
            cancellationReason: input.reason,
            isDepositForfeited,
            refundableAmount: refundableAmount.toString(),
          },
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.CANCELLED,
      message: 'Da huy don hang, giai phong ton kho va khoi tao quyet toan tien coc/hoan tien thanh cong',
    };
  }
}

export const orderClosingService = new OrderClosingService();
