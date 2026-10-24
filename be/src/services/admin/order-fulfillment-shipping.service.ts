import {
  ActorType,
  FulfillmentMethod,
  NotificationChannel,
  OrderAmendmentStatus,
  OrderAmendmentType,
  OrderStatus,
  PaymentMethod,
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
  DeliveryFailedInput,
  InitiateReturnInput,
  ReceiveReturnInput,
  ScheduleRedeliveryInput,
  ShipOrderInput,
} from '../../validations/admin/order-operations.schema.js';

export type AvailableSerialDto = {
  id: string;
  serialNumber: string;
  status: SerialStatus;
};

export type StandaloneSerialRequirementDto = {
  skuId: number;
  skuCode: string;
  name: string;
  quantity: number;
  availableSerials: AvailableSerialDto[];
};

export type PendingAmendmentDto = {
  id: string;
  type: OrderAmendmentType;
  fee: string;
  status: OrderAmendmentStatus;
  reason: string;
};

export type ShippingRequirementsResultDto = {
  orderId: string;
  orderCode: string;
  hasAssembly: boolean;
  fulfillmentMethod: FulfillmentMethod;
  status: OrderStatus;
  pendingAmendments: PendingAmendmentDto[];
  hasUnpaidAmendments: boolean;
  standaloneSerialRequirements: StandaloneSerialRequirementDto[];
};

export type ReturnItemDto = {
  skuId: number;
  skuCode: string;
  name: string;
  quantity: number;
};

export type ReturnIssuedSerialDto = {
  id: string;
  serialNumber: string;
  skuId: number;
  skuCode: string;
};

export type ReturnRequirementsResultDto = {
  orderId: string;
  orderCode: string;
  status: OrderStatus;
  items: ReturnItemDto[];
  issuedSerials: ReturnIssuedSerialDto[];
};

export type OrderOperationResultDto = {
  success: boolean;
  orderId: string;
  orderCode: string;
  status: OrderStatus;
  message: string;
  stockMoveCode?: string;
};

type AggregatedItem = {
  skuId: number;
  skuCode: string;
  name: string;
  serialRequired: boolean;
  quantity: number;
};

export class OrderFulfillmentShippingService {
  async getShippingRequirements(orderId: string): Promise<ShippingRequirementsResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        amendments: {
          where: { isActive: true },
        },
        lines: {
          where: { lineType: SalesLineType.SKU, skuId: { not: null } },
          include: {
            sku: {
              include: {
                productTemplate: true,
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

    const hasAssembly = order.lines.some(
      (line) => line.serviceType === ServiceType.ASSEMBLY || line.lineType === SalesLineType.SERVICE,
    );

    const pendingAmendments: PendingAmendmentDto[] = order.amendments
      .filter(
        (a) =>
          a.status === OrderAmendmentStatus.PENDING_ACCEPTANCE ||
          a.status === OrderAmendmentStatus.PAYMENT_PENDING ||
          (order.paymentMethod === PaymentMethod.QR &&
            a.status !== OrderAmendmentStatus.PAID &&
            a.status !== OrderAmendmentStatus.CANCELLED),
      )
      .map((a) => ({
        id: a.id,
        type: a.type,
        fee: a.fee.toString(),
        status: a.status,
        reason: a.reason,
      }));

    const hasUnpaidAmendments = pendingAmendments.length > 0;
    const standaloneSerialRequirements: StandaloneSerialRequirementDto[] = [];

    if (!hasAssembly && order.status === OrderStatus.PREPARING_COMPONENTS) {
      const aggregated = new Map<number, AggregatedItem>();
      for (const line of order.lines) {
        if (line.skuId) {
          const existing = aggregated.get(line.skuId);
          if (existing) {
            existing.quantity += line.quantity;
          } else {
            const skuCode = line.sku?.sku ?? line.skuSnapshot ?? `SKU-${line.skuId}`;
            const name = line.nameSnapshot || line.sku?.variationLabel || line.sku?.productTemplate?.name || `Linh kien #${line.skuId}`;
            aggregated.set(line.skuId, {
              skuId: line.skuId,
              skuCode,
              name,
              serialRequired: Boolean(line.sku?.serialRequired),
              quantity: line.quantity,
            });
          }
        }
      }

      for (const [skuId, item] of aggregated.entries()) {
        if (item.serialRequired) {
          const availableUnits = await prisma.serialUnit.findMany({
            where: {
              skuId,
              currentBranchId: order.fulfillmentBranchId,
              status: { in: [SerialStatus.AVAILABLE, SerialStatus.RESERVED] },
              isActive: true,
            },
            take: item.quantity * 5,
            select: {
              id: true,
              serialNumber: true,
              status: true,
            },
          });

          standaloneSerialRequirements.push({
            skuId,
            skuCode: item.skuCode,
            name: item.name,
            quantity: item.quantity,
            availableSerials: availableUnits,
          });
        }
      }
    }

    return {
      orderId: order.id,
      orderCode: order.code,
      hasAssembly,
      fulfillmentMethod: order.fulfillmentMethod,
      status: order.status,
      pendingAmendments,
      hasUnpaidAmendments,
      standaloneSerialRequirements,
    };
  }

  async getReturnRequirements(orderId: string): Promise<ReturnRequirementsResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lines: {
          where: { lineType: SalesLineType.SKU, skuId: { not: null } },
          include: {
            sku: {
              include: {
                productTemplate: true,
              },
            },
          },
        },
        stockMoves: {
          where: { moveType: StockMoveType.ORDER_ISSUE, status: StockMoveStatus.VALIDATED },
          include: {
            lines: {
              include: {
                serialMovements: {
                  where: { resultingStatus: SerialStatus.ISSUED },
                  include: {
                    serialUnit: {
                      include: {
                        sku: true,
                      },
                    },
                  },
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

    const aggregated = new Map<number, ReturnItemDto>();
    for (const line of order.lines) {
      if (line.skuId) {
        const existing = aggregated.get(line.skuId);
        if (existing) {
          existing.quantity += line.quantity;
        } else {
          const skuCode = line.sku?.sku ?? line.skuSnapshot ?? `SKU-${line.skuId}`;
          const name = line.nameSnapshot || line.sku?.variationLabel || line.sku?.productTemplate?.name || `Linh kien #${line.skuId}`;
          aggregated.set(line.skuId, {
            skuId: line.skuId,
            skuCode,
            name,
            quantity: line.quantity,
          });
        }
      }
    }

    const issuedSerials: ReturnIssuedSerialDto[] = [];
    for (const move of order.stockMoves) {
      for (const line of move.lines) {
        for (const mov of line.serialMovements) {
          if (mov.serialUnit) {
            issuedSerials.push({
              id: mov.serialUnit.id,
              serialNumber: mov.serialUnit.serialNumber,
              skuId: mov.serialUnit.skuId,
              skuCode: mov.serialUnit.sku.sku,
            });
          }
        }
      }
    }

    return {
      orderId: order.id,
      orderCode: order.code,
      status: order.status,
      items: Array.from(aggregated.values()),
      issuedSerials,
    };
  }

  async shipOrder(
    orderId: string,
    adminId: string,
    input: ShipOrderInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        amendments: {
          where: { isActive: true },
        },
        lines: {
          where: { lineType: SalesLineType.SKU, skuId: { not: null } },
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
      },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    if (order.fulfillmentMethod !== FulfillmentMethod.DELIVERY) {
      throw new DomainError('INVALID_FULFILLMENT_METHOD', {
        ruleId: 'ORD-008',
        messageKey: 'error.invalidFulfillmentMethod',
        status: 400,
        details: {
          fulfillmentMethod: order.fulfillmentMethod,
          message: 'Chi co the xuat kho giao van doi voi don hang giao tan noi (DELIVERY)',
        },
      });
    }

    const eligibleStatuses: OrderStatus[] = [
      OrderStatus.PREPARING_COMPONENTS,
      OrderStatus.ASSEMBLING,
    ];

    if (!eligibleStatuses.includes(order.status)) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-022',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          eligibleStatuses,
          message: 'Don hang phai o trang thai PREPARING_COMPONENTS hoac ASSEMBLING de xuat kho giao hang',
        },
      });
    }

    const hasAssembly = order.lines.some(
      (line) => line.serviceType === ServiceType.ASSEMBLY || line.lineType === SalesLineType.SERVICE,
    );

    if (order.status === OrderStatus.PREPARING_COMPONENTS && hasAssembly) {
      throw new DomainError('ASSEMBLY_REQUIRED', {
        ruleId: 'ORD-009',
        messageKey: 'error.assemblyRequired',
        status: 400,
        details: {
          message: 'Don hang PC lap rap bat buoc phai trai qua buoc ban giao lap rap truoc khi xuat kho giao van',
        },
      });
    }

    for (const amendment of order.amendments) {
      if (amendment.status === OrderAmendmentStatus.PENDING_ACCEPTANCE) {
        throw new DomainError('AMENDMENT_NOT_ACCEPTED', {
          ruleId: 'PRC-008',
          messageKey: 'error.amendmentNotAccepted',
          status: 400,
          details: {
            amendmentId: amendment.id,
            status: amendment.status,
            message: `Phu luc don hang ${amendment.id} chua duoc khach hang chap thuan truoc khi xuat kho`,
          },
        });
      }

      if (amendment.status === OrderAmendmentStatus.PAYMENT_PENDING) {
        throw new DomainError('AMENDMENT_PAYMENT_PENDING', {
          ruleId: 'PAY-019',
          messageKey: 'error.amendmentPaymentPending',
          status: 400,
          details: {
            amendmentId: amendment.id,
            status: amendment.status,
            message: `Phu phi tu phu luc ${amendment.id} dang cho thanh toan`,
          },
        });
      }

      if (
        order.paymentMethod === PaymentMethod.QR &&
        amendment.status !== OrderAmendmentStatus.PAID &&
        amendment.status !== OrderAmendmentStatus.CANCELLED
      ) {
        throw new DomainError('AMENDMENT_UNPAID', {
          ruleId: 'PAY-019',
          messageKey: 'error.amendmentUnpaid',
          status: 400,
          details: {
            amendmentId: amendment.id,
            status: amendment.status,
            message: `Don hang QR yeu cau toan bo phu phi phu luc phai duoc thanh toan du truoc khi xuat kho (Phu luc: ${amendment.id})`,
          },
        });
      }
    }

    const aggregated = new Map<number, AggregatedItem>();
    for (const line of order.lines) {
      if (line.skuId) {
        const existing = aggregated.get(line.skuId);
        if (existing) {
          existing.quantity += line.quantity;
        } else {
          const skuCode = line.sku?.sku ?? line.skuSnapshot ?? `SKU-${line.skuId}`;
          const name = line.nameSnapshot || line.sku?.variationLabel || line.sku?.productTemplate?.name || `Linh kien #${line.skuId}`;
          aggregated.set(line.skuId, {
            skuId: line.skuId,
            skuCode,
            name,
            serialRequired: Boolean(line.sku?.serialRequired),
            quantity: line.quantity,
          });
        }
      }
    }

    const assignedSerials = input.serialAssignments || [];
    const serialUnitsToIssue: Array<{ unit: { id: string; serialNumber: string }; skuId: number }> = [];

    if (order.status === OrderStatus.PREPARING_COMPONENTS) {
      for (const [skuId, item] of aggregated.entries()) {
        if (item.serialRequired) {
          const matched = assignedSerials.filter((s) => s.skuId === skuId);
          if (matched.length !== item.quantity) {
            throw new DomainError('SERIAL_QUANTITY_MISMATCH', {
              ruleId: 'INV-019',
              messageKey: 'error.serialQuantityMismatch',
              status: 400,
              details: {
                skuId,
                skuCode: item.skuCode,
                required: item.quantity,
                provided: matched.length,
                message: `Linh kien ${item.name} (${item.skuCode}) yeu cau ${item.quantity} so se-ri hop le, hien nhan ${matched.length}`,
              },
            });
          }

          for (const assignment of matched) {
            const unit = await prisma.serialUnit.findFirst({
              where: {
                skuId,
                serialNumber: assignment.serialNumber,
                currentBranchId: order.fulfillmentBranchId,
                status: { in: [SerialStatus.AVAILABLE, SerialStatus.RESERVED] },
                isActive: true,
              },
            });

            if (!unit) {
              throw new DomainError('SERIAL_NOT_AVAILABLE', {
                ruleId: 'INV-019',
                messageKey: 'error.serialNotAvailable',
                status: 400,
                details: {
                  skuId,
                  serialNumber: assignment.serialNumber,
                  message: `So se-ri ${assignment.serialNumber} khong ton tai hoac khong san sang tai chi nhanh xuat`,
                },
              });
            }

            serialUnitsToIssue.push({ unit, skuId });
          }
        }
      }
    }

    const skuIds = [...aggregated.keys()];
    const quants = await prisma.stockQuant.findMany({
      where: {
        branchId: order.fulfillmentBranchId,
        skuId: { in: skuIds },
        isActive: true,
      },
    });

    let resultMoveCode = '';

    await prisma.$transaction(async (tx) => {
      if (order.status === OrderStatus.PREPARING_COMPONENTS) {
        let stockMove = await tx.stockMove.findFirst({
          where: { orderId: order.id, moveType: StockMoveType.ORDER_ISSUE },
          include: { lines: true },
        });

        if (!stockMove) {
          stockMove = await tx.stockMove.create({
            data: {
              code: `ISS-${order.code}`,
              sourceBranchId: order.fulfillmentBranchId,
              orderId: order.id,
              idempotencyKey: `issue-ship:${order.id}:${Date.now()}`,
              moveType: StockMoveType.ORDER_ISSUE,
              status: StockMoveStatus.VALIDATED,
              validatedAt: new Date(),
              validatedById: adminId,
              reason: 'Xuat kho ban giao don vi van chuyen (Don ban le)',
            },
            include: { lines: true },
          });
        } else {
          stockMove = await tx.stockMove.update({
            where: { id: stockMove.id },
            data: {
              status: StockMoveStatus.VALIDATED,
              validatedAt: new Date(),
              validatedById: adminId,
            },
            include: { lines: true },
          });
        }

        resultMoveCode = stockMove.code;
        const moveLineMap = new Map<number, string>();

        for (const [skuId, item] of aggregated.entries()) {
          const quant = quants.find((q) => q.skuId === skuId);
          if (!quant) {
            throw new DomainError('STOCK_QUANT_NOT_FOUND', {
              messageKey: 'error.stockQuantNotFound',
              status: 404,
              details: { skuId },
            });
          }

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

          let moveLine = stockMove.lines.find((l) => l.skuId === skuId);
          if (!moveLine) {
            moveLine = await tx.stockMoveLine.create({
              data: {
                stockMoveId: stockMove.id,
                skuId,
                quantity: item.quantity,
                unitCost: quant.weightedAverageCost,
              },
            });
          }

          moveLineMap.set(skuId, moveLine.id);

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

        for (const { unit, skuId } of serialUnitsToIssue) {
          const moveLineId = moveLineMap.get(skuId);
          if (!moveLineId) {
            throw new DomainError('MOVE_LINE_NOT_FOUND', {
              messageKey: 'error.moveLineNotFound',
              status: 500,
              details: { skuId },
            });
          }

          await tx.serialUnit.update({
            where: { id: unit.id },
            data: {
              status: SerialStatus.ISSUED,
            },
          });

          await tx.serialMovement.create({
            data: {
              serialUnitId: unit.id,
              stockMoveLineId: moveLineId,
              fromBranchId: order.fulfillmentBranchId,
              toBranchId: null,
              resultingStatus: SerialStatus.ISSUED,
            },
          });
        }
      }

      const existingSnapshot = (order.deliveryAddressSnapshot && typeof order.deliveryAddressSnapshot === 'object'
        ? order.deliveryAddressSnapshot
        : {}) as Record<string, unknown>;

      const updatedSnapshot = {
        ...existingSnapshot,
        shippingCarrier: input.carrier,
        trackingCode: input.trackingCode,
        shippedAt: new Date().toISOString(),
      };

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.SHIPPING,
          deliveryAddressSnapshot: updatedSnapshot,
        },
      });

      const historyReason = `Xuat kho ban giao ${input.carrier} - Ma van don: ${input.trackingCode}${input.note ? ' - ' + input.note : ''}`;

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.SHIPPING,
          reason: historyReason,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:ship:${order.id}:${Date.now()}`,
        },
      });

      await tx.notification.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          deduplicationKey: `order-shipped:${order.id}:${Date.now()}`,
          eventType: 'ORDER_SHIPPED',
          title: `Don hang #${order.code} dang duoc van chuyen`,
          body: `Don hang #${order.code} da duoc ban giao cho don vi van chuyen ${input.carrier} voi ma van don ${input.trackingCode}.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
          payload: {
            orderId: order.id,
            orderCode: order.code,
            carrier: input.carrier,
            trackingCode: input.trackingCode,
          },
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.SHIPPING,
      message: 'Da xuat kho va ban giao kien hang cho don vi van chuyen thanh cong',
      stockMoveCode: resultMoveCode || undefined,
    };
  }

  async deliveryFailed(
    orderId: string,
    adminId: string,
    input: DeliveryFailedInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { fulfillmentBranch: true },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    if (order.status !== OrderStatus.SHIPPING) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-024',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          requiredStatus: OrderStatus.SHIPPING,
          message: 'Don hang phai o trang thai SHIPPING de ghi nhan giao hang that bai',
        },
      });
    }

    const historyReason = `Giao hang that bai: ${input.reason}${input.note ? ' - ' + input.note : ''}`;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.DELIVERY_FAILED,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.DELIVERY_FAILED,
          reason: historyReason,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:delivery-failed:${order.id}:${Date.now()}`,
        },
      });

      await tx.notification.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          deduplicationKey: `order-delivery-failed:${order.id}:${Date.now()}`,
          eventType: 'ORDER_DELIVERY_FAILED',
          title: `Giao hang khong thanh cong don hang #${order.code}`,
          body: `Don hang #${order.code} chua the giao den ban. Ly do: ${input.reason}. Vui long lien he chung toi de ho tro.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
          payload: {
            orderId: order.id,
            orderCode: order.code,
            reason: input.reason,
          },
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.DELIVERY_FAILED,
      message: 'Da ghi nhan giao hang that bai. Ton kho van duoc bao luu tren tuyen van chuyen.',
    };
  }

  async scheduleRedelivery(
    orderId: string,
    adminId: string,
    input: ScheduleRedeliveryInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { fulfillmentBranch: true },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    if (order.status !== OrderStatus.DELIVERY_FAILED) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-024',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          requiredStatus: OrderStatus.DELIVERY_FAILED,
          message: 'Don hang phai o trang thai DELIVERY_FAILED de len lich hen giao lai',
        },
      });
    }

    if (order.redeliveryAttemptCount >= 2) {
      throw new DomainError('REDELIVERY_LIMIT_EXCEEDED', {
        ruleId: 'ORD-024',
        messageKey: 'error.redeliveryLimitExceeded',
        status: 400,
        details: {
          redeliveryAttemptCount: order.redeliveryAttemptCount,
          maxAllowed: 2,
          message: 'He thong chan hen giao lai: da cham moc toi da 2 lan giao that bai. Vui long chuyen hoan ve kho chi nhanh.',
        },
      });
    }

    const nextAttempt = order.redeliveryAttemptCount + 1;
    const historyReason = `Len lich hen giao lai lan ${nextAttempt}: ngay ${input.redeliveryDate}${input.note ? ' - ' + input.note : ''}`;

    const existingSnapshot = (order.deliveryAddressSnapshot && typeof order.deliveryAddressSnapshot === 'object'
      ? order.deliveryAddressSnapshot
      : {}) as Record<string, unknown>;

    const updatedSnapshot = {
      ...existingSnapshot,
      lastRedeliveryScheduledDate: input.redeliveryDate,
      lastRedeliveryNote: input.note || null,
    };

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.SHIPPING,
          redeliveryAttemptCount: { increment: 1 },
          deliveryAddressSnapshot: updatedSnapshot,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.SHIPPING,
          reason: historyReason,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:redelivery:${order.id}:${Date.now()}`,
        },
      });

      await tx.notification.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          deduplicationKey: `order-redelivery:${order.id}:${nextAttempt}:${Date.now()}`,
          eventType: 'ORDER_REDELIVERY_SCHEDULED',
          title: `Lich hen giao lai don hang #${order.code}`,
          body: `Don hang #${order.code} da duoc len lich giao lai vao ngay ${input.redeliveryDate}.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
          payload: {
            orderId: order.id,
            orderCode: order.code,
            redeliveryDate: input.redeliveryDate,
            attemptCount: nextAttempt,
          },
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.SHIPPING,
      message: `Da len lich hen giao lai lan ${nextAttempt} thanh cong`,
    };
  }

  async initiateReturn(
    orderId: string,
    adminId: string,
    input?: InitiateReturnInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { fulfillmentBranch: true },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    if (order.status !== OrderStatus.DELIVERY_FAILED) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-025',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          requiredStatus: OrderStatus.DELIVERY_FAILED,
          message: 'Don hang phai o trang thai DELIVERY_FAILED de khoi tao chuyen hoan ve kho chi nhanh',
        },
      });
    }

    const historyReason = input?.note || 'Shipper xac nhan kien hang dang chuyen hoan ve kho chi nhanh';

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.RETURNING,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.RETURNING,
          reason: historyReason,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:returning:${order.id}:${Date.now()}`,
        },
      });

      await tx.notification.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          deduplicationKey: `order-returning:${order.id}:${Date.now()}`,
          eventType: 'ORDER_RETURNING',
          title: `Don hang #${order.code} dang tren duong chuyen hoan`,
          body: `Kien hang don #${order.code} dang duoc van chuyen nguoc ve kho chi nhanh sau khi giao khong thanh cong.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          payload: {
            orderId: order.id,
            orderCode: order.code,
          },
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.RETURNING,
      message: 'Da xac nhan kien hang dang tren duong chuyen hoan ve chi nhanh',
    };
  }

  async receiveReturn(
    orderId: string,
    adminId: string,
    input?: ReceiveReturnInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        lines: {
          where: { lineType: SalesLineType.SKU, skuId: { not: null } },
          include: {
            sku: {
              include: {
                productTemplate: true,
              },
            },
          },
        },
        stockMoves: {
          where: { moveType: StockMoveType.ORDER_ISSUE, status: StockMoveStatus.VALIDATED },
          include: {
            lines: {
              include: {
                serialMovements: {
                  where: { resultingStatus: SerialStatus.ISSUED },
                  include: {
                    serialUnit: true,
                  },
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

    if (order.status !== OrderStatus.RETURNING) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-025',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: {
          currentStatus: order.status,
          requiredStatus: OrderStatus.RETURNING,
          message: 'Don hang phai o trang thai RETURNING de xac nhan da ve kho chi nhanh',
        },
      });
    }

    const existingReversal = await prisma.stockMove.findFirst({
      where: {
        orderId: order.id,
        moveType: StockMoveType.ORDER_REVERSAL,
        status: StockMoveStatus.VALIDATED,
      },
    });

    if (existingReversal) {
      throw new DomainError('REVERSAL_ALREADY_EXISTS', {
        ruleId: 'INV-022',
        messageKey: 'error.reversalAlreadyExists',
        status: 409,
        details: {
          stockMoveId: existingReversal.id,
          message: 'Phieu kho dao nguoc da duoc tao va xac thuc truoc do cho don hang nay',
        },
      });
    }

    const aggregated = new Map<number, AggregatedItem>();
    for (const line of order.lines) {
      if (line.skuId) {
        const existing = aggregated.get(line.skuId);
        if (existing) {
          existing.quantity += line.quantity;
        } else {
          const skuCode = line.sku?.sku ?? line.skuSnapshot ?? `SKU-${line.skuId}`;
          const name = line.nameSnapshot || line.sku?.variationLabel || line.sku?.productTemplate?.name || `Linh kien #${line.skuId}`;
          aggregated.set(line.skuId, {
            skuId: line.skuId,
            skuCode,
            name,
            serialRequired: Boolean(line.sku?.serialRequired),
            quantity: line.quantity,
          });
        }
      }
    }

    const originalStockMove = order.stockMoves[0] || null;
    const originalMoveLineIds = originalStockMove?.lines.map((l) => l.id) || [];

    const issuedSerialMovements = await prisma.serialMovement.findMany({
      where: {
        stockMoveLineId: { in: originalMoveLineIds },
        resultingStatus: SerialStatus.ISSUED,
      },
      include: {
        serialUnit: true,
        stockMoveLine: true,
      },
    });

    let reversalCode = '';

    await prisma.$transaction(async (tx) => {
      reversalCode = `REV-${order.code}-${Date.now().toString().slice(-4)}`;

      const reversalStockMove = await tx.stockMove.create({
        data: {
          code: reversalCode,
          destinationBranchId: order.fulfillmentBranchId,
          orderId: order.id,
          reversalOfMoveId: originalStockMove?.id || null,
          idempotencyKey: `return-reversal:${order.id}:${Date.now()}`,
          moveType: StockMoveType.ORDER_REVERSAL,
          status: StockMoveStatus.VALIDATED,
          validatedAt: new Date(),
          validatedById: adminId,
          reason: input?.note || 'Nhap hoan kho chi nhanh tu don hang giao that bai',
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

        if (!quant) {
          throw new DomainError('STOCK_QUANT_NOT_FOUND', {
            messageKey: 'error.stockQuantNotFound',
            status: 404,
            details: { skuId },
          });
        }

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

        const origLine = originalStockMove?.lines.find((l) => l.skuId === skuId);

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

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.RETURNED_TO_BRANCH,
        },
      });

      const historyReason = input?.note || 'Da doi soat 100% hang hoan va nhap lai kho chi nhanh';

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.RETURNED_TO_BRANCH,
          reason: historyReason,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:returned-branch:${order.id}:${Date.now()}`,
        },
      });

      await tx.notification.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          deduplicationKey: `order-returned-branch:${order.id}:${Date.now()}`,
          eventType: 'ORDER_RETURNED_TO_BRANCH',
          title: `Don hang #${order.code} da ve lai kho chi nhanh`,
          body: `Kien hang don #${order.code} da duoc nhan lai va nhap kho thanh cong tai chi nhanh ${order.fulfillmentBranch.name}.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          payload: {
            orderId: order.id,
            orderCode: order.code,
            branchName: order.fulfillmentBranch.name,
          },
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.RETURNED_TO_BRANCH,
      message: 'Da doi soat 100% linh kien, phuc hoi ton kho thuc te onHand va chuyen don ve RETURNED_TO_BRANCH',
      stockMoveCode: reversalCode,
    };
  }
}

export const orderFulfillmentShippingService = new OrderFulfillmentShippingService();