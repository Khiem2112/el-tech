import {
  ActorType,
  FulfillmentMethod,
  NotificationChannel,
  OrderStatus,
  PaymentMethod,
  SerialStatus,
  StockLedgerEntryType,
  StockMoveStatus,
  StockMoveType,
} from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  AssembleOrderInput,
  ConfirmCodOrderInput,
  PrepareOrderInput,
  ReadyForPickupInput,
} from '../../validations/admin/order-operations.schema.js';

export type StockReadinessItemDto = {
  skuId: number;
  skuCode: string;
  name: string;
  requiredQuantity: number;
  onHand: number;
  reserved: number;
  available: number;
  isSufficient: boolean;
};

export type StockReadinessResultDto = {
  orderId: string;
  orderCode: string;
  branch: {
    id: number;
    code: string;
    name: string;
  };
  canConfirm: boolean;
  items: StockReadinessItemDto[];
};

export type AvailableSerialDto = {
  id: string;
  serialNumber: string;
  status: SerialStatus;
};

export type AssemblyRequirementItemDto = {
  skuId: number;
  skuCode: string;
  name: string;
  quantity: number;
  serialRequired: boolean;
  availableSerials: AvailableSerialDto[];
};

export type AssemblyRequirementsResultDto = {
  orderId: string;
  orderCode: string;
  branch: {
    id: number;
    code: string;
    name: string;
  };
  hasAssembly: boolean;
  items: AssemblyRequirementItemDto[];
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

export class OrderFulfillmentInboundService {
  async getStockReadiness(orderId: string): Promise<StockReadinessResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        lines: {
          where: { lineType: 'SKU', skuId: { not: null } },
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

    const skuIds = [...aggregated.keys()];
    const quants = await prisma.stockQuant.findMany({
      where: {
        branchId: order.fulfillmentBranchId,
        skuId: { in: skuIds },
        isActive: true,
      },
    });

    const items: StockReadinessItemDto[] = [];
    let canConfirm = true;

    for (const [skuId, item] of aggregated.entries()) {
      const quant = quants.find((q) => q.skuId === skuId);
      const onHand = quant?.onHand ?? 0;
      const reserved = quant?.reserved ?? 0;
      const quarantine = quant?.quarantineDamaged ?? 0;
      const available = Math.max(0, onHand - reserved - quarantine);
      const isSufficient = Boolean(quant && available >= item.quantity);

      if (!isSufficient) {
        canConfirm = false;
      }

      items.push({
        skuId,
        skuCode: item.skuCode,
        name: item.name,
        requiredQuantity: item.quantity,
        onHand,
        reserved,
        available,
        isSufficient,
      });
    }

    return {
      orderId: order.id,
      orderCode: order.code,
      branch: {
        id: order.fulfillmentBranch.id,
        code: order.fulfillmentBranch.code,
        name: order.fulfillmentBranch.name,
      },
      canConfirm,
      items,
    };
  }

  async getAssemblyRequirements(orderId: string): Promise<AssemblyRequirementsResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        lines: {
          where: { lineType: 'SKU', skuId: { not: null } },
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
      (l) => Boolean(l.pcBuildKey) || l.serviceType === 'ASSEMBLY',
    );

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

    const items: AssemblyRequirementItemDto[] = [];

    for (const [skuId, item] of aggregated.entries()) {
      let availableSerials: AvailableSerialDto[] = [];

      if (item.serialRequired) {
        const serialUnits = await prisma.serialUnit.findMany({
          where: {
            skuId,
            currentBranchId: order.fulfillmentBranchId,
            status: SerialStatus.AVAILABLE,
            isActive: true,
          },
          orderBy: { serialNumber: 'asc' },
          take: 50,
        });

        availableSerials = serialUnits.map((u) => ({
          id: u.id,
          serialNumber: u.serialNumber,
          status: u.status,
        }));
      }

      items.push({
        skuId,
        skuCode: item.skuCode,
        name: item.name,
        quantity: item.quantity,
        serialRequired: item.serialRequired,
        availableSerials,
      });
    }

    return {
      orderId: order.id,
      orderCode: order.code,
      branch: {
        id: order.fulfillmentBranch.id,
        code: order.fulfillmentBranch.code,
        name: order.fulfillmentBranch.name,
      },
      hasAssembly,
      items,
    };
  }

  async confirmCodOrder(
    orderId: string,
    adminId: string,
    input?: ConfirmCodOrderInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        lines: {
          where: { lineType: 'SKU', skuId: { not: null } },
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

    if (order.status !== OrderStatus.PENDING_COD_CONFIRMATION) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-006',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: { currentStatus: order.status, requiredStatus: OrderStatus.PENDING_COD_CONFIRMATION },
      });
    }

    if (order.paymentMethod !== PaymentMethod.COD) {
      throw new DomainError('INVALID_PAYMENT_METHOD', {
        messageKey: 'error.invalidPaymentMethod',
        status: 400,
        details: { paymentMethod: order.paymentMethod },
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

    const skuIds = [...aggregated.keys()];
    const quants = await prisma.stockQuant.findMany({
      where: {
        branchId: order.fulfillmentBranchId,
        skuId: { in: skuIds },
        isActive: true,
      },
    });

    for (const [skuId, item] of aggregated.entries()) {
      const quant = quants.find((q) => q.skuId === skuId);
      const onHand = quant?.onHand ?? 0;
      const reserved = quant?.reserved ?? 0;
      const quarantine = quant?.quarantineDamaged ?? 0;
      const available = onHand - reserved - quarantine;

      if (!quant || available < item.quantity) {
        throw new DomainError('INSUFFICIENT_STOCK', {
          ruleId: 'INV-006',
          messageKey: 'error.insufficientStock',
          status: 400,
          details: {
            skuId,
            skuCode: item.skuCode,
            requiredQuantity: item.quantity,
            availableStock: available,
          },
        });
      }
    }

    const moveCode = `RES-${order.code}`;

    await prisma.$transaction(async (tx) => {
      const stockMove = await tx.stockMove.create({
        data: {
          code: moveCode,
          sourceBranchId: order.fulfillmentBranchId,
          orderId: order.id,
          idempotencyKey: `reserve-cod:${order.id}:${Date.now()}`,
          moveType: StockMoveType.ORDER_ISSUE,
          status: StockMoveStatus.RESERVED,
          reservedAt: new Date(),
          reason: input?.note || 'Xac nhan don hang COD va khoa giu cho ton kho',
        },
      });

      for (const [skuId, item] of aggregated.entries()) {
        const quant = quants.find((q) => q.skuId === skuId)!;

        await tx.stockQuant.updateMany({
          where: { id: quant.id, version: quant.version },
          data: {
            reserved: { increment: item.quantity },
            version: { increment: 1 },
          },
        });

        const updatedQuant = await tx.stockQuant.findUniqueOrThrow({
          where: { id: quant.id },
        });

        const moveLine = await tx.stockMoveLine.create({
          data: {
            stockMoveId: stockMove.id,
            skuId,
            quantity: item.quantity,
            unitCost: quant.weightedAverageCost,
          },
        });

        await tx.stockLedgerEntry.create({
          data: {
            stockQuantId: quant.id,
            stockMoveLineId: moveLine.id,
            entryType: StockLedgerEntryType.RESERVE,
            deltaOnHand: 0,
            deltaReserved: item.quantity,
            deltaQuarantine: 0,
            onHandAfter: updatedQuant.onHand,
            reservedAfter: updatedQuant.reserved,
            quarantineAfter: updatedQuant.quarantineDamaged,
            actorType: ActorType.ADMIN,
            actorId: adminId,
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: OrderStatus.PENDING_COD_CONFIRMATION,
          nextStatus: OrderStatus.CONFIRMED,
          reason: input?.note || 'Xac nhan don hang COD thanh cong',
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:confirm-cod:${order.id}:${Date.now()}`,
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.CONFIRMED,
      stockMoveCode: moveCode,
      message: 'Da xac nhan don hang COD va khoa giu ton kho thanh cong',
    };
  }

  async prepareComponents(
    orderId: string,
    adminId: string,
    input?: PrepareOrderInput,
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

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-007',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: { currentStatus: order.status, requiredStatus: OrderStatus.CONFIRMED },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PREPARING_COMPONENTS },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: OrderStatus.CONFIRMED,
          nextStatus: OrderStatus.PREPARING_COMPONENTS,
          reason: input?.note || 'Bat dau soan linh kien tai kho va khoa quyen tu huy cua khach hang',
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:start-prep:${order.id}:${Date.now()}`,
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.PREPARING_COMPONENTS,
      message: 'Da chuyen trang thai sang Dang Soan Hang thanh cong',
    };
  }

  async assembleOrder(
    orderId: string,
    adminId: string,
    input: AssembleOrderInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
        lines: {
          where: { lineType: 'SKU', skuId: { not: null } },
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

    if (order.status !== OrderStatus.PREPARING_COMPONENTS) {
      throw new DomainError('INVALID_ORDER_STATE', {
        ruleId: 'ORD-008',
        messageKey: 'error.invalidOrderState',
        status: 409,
        details: { currentStatus: order.status, requiredStatus: OrderStatus.PREPARING_COMPONENTS },
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

    const assignedSerials = input.serialAssignments ?? [];
    const assignedNumbers = new Set<string>();

    for (const assignment of assignedSerials) {
      if (assignedNumbers.has(assignment.serialNumber)) {
        throw new DomainError('DUPLICATE_SERIAL_ASSIGNMENT', {
          messageKey: 'error.duplicateSerialAssignment',
          status: 400,
          details: { serialNumber: assignment.serialNumber },
        });
      }
      assignedNumbers.add(assignment.serialNumber);
    }

    for (const [skuId, item] of aggregated.entries()) {
      if (item.serialRequired) {
        const matched = assignedSerials.filter((s) => s.skuId === skuId);
        if (matched.length !== item.quantity) {
          throw new DomainError('SERIAL_QUANTITY_MISMATCH', {
            ruleId: 'PCB-008',
            messageKey: 'error.serialQuantityMismatch',
            status: 400,
            details: {
              skuId,
              skuCode: item.skuCode,
              requiredCount: item.quantity,
              providedCount: matched.length,
            },
          });
        }
      }
    }

    const serialUnitsToIssue: Array<{ unit: { id: string; serialNumber: string; skuId: number }; skuId: number }> = [];

    if (assignedSerials.length > 0) {
      const serialNumbers = assignedSerials.map((s) => s.serialNumber);
      const units = await prisma.serialUnit.findMany({
        where: {
          serialNumber: { in: serialNumbers },
          isActive: true,
        },
      });

      for (const assignment of assignedSerials) {
        const found = units.find((u) => u.serialNumber === assignment.serialNumber);
        if (!found) {
          throw new DomainError('SERIAL_NOT_FOUND', {
            messageKey: 'error.serialNotFound',
            status: 404,
            details: { serialNumber: assignment.serialNumber },
          });
        }

        if (found.skuId !== assignment.skuId) {
          throw new DomainError('SERIAL_SKU_MISMATCH', {
            messageKey: 'error.serialSkuMismatch',
            status: 400,
            details: {
              serialNumber: assignment.serialNumber,
              expectedSkuId: assignment.skuId,
              actualSkuId: found.skuId,
            },
          });
        }

        if (found.currentBranchId !== order.fulfillmentBranchId) {
          throw new DomainError('SERIAL_BRANCH_MISMATCH', {
            messageKey: 'error.serialBranchMismatch',
            status: 400,
            details: {
              serialNumber: assignment.serialNumber,
              expectedBranchId: order.fulfillmentBranchId,
              actualBranchId: found.currentBranchId,
            },
          });
        }

        if (found.status !== SerialStatus.AVAILABLE && found.status !== SerialStatus.RESERVED) {
          throw new DomainError('SERIAL_NOT_AVAILABLE', {
            messageKey: 'error.serialNotAvailable',
            status: 409,
            details: {
              serialNumber: assignment.serialNumber,
              currentStatus: found.status,
            },
          });
        }

        serialUnitsToIssue.push({ unit: found, skuId: assignment.skuId });
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

    await prisma.$transaction(async (tx) => {
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
            idempotencyKey: `issue:${order.id}:${Date.now()}`,
            moveType: StockMoveType.ORDER_ISSUE,
            status: StockMoveStatus.VALIDATED,
            validatedAt: new Date(),
            validatedById: adminId,
            reason: 'Xuat kho ban giao lap rap may tinh',
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

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.ASSEMBLING },
      });

      const historyReason = input.technicianName
        ? `Ban giao lap rap PC - Ky thuat vien: ${input.technicianName}`
        : 'Ban giao lap rap PC va xuat kho linh kien';

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: OrderStatus.PREPARING_COMPONENTS,
          nextStatus: OrderStatus.ASSEMBLING,
          reason: historyReason,
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:assemble:${order.id}:${Date.now()}`,
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.ASSEMBLING,
      message: 'Da xuat kho linh kien va chuyen ban lap rap PC thanh cong',
    };
  }

  async readyForPickup(
    orderId: string,
    adminId: string,
    input?: ReadyForPickupInput,
  ): Promise<OrderOperationResultDto> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillmentBranch: true,
      },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
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
        details: { currentStatus: order.status, eligibleStatuses },
      });
    }

    if (order.fulfillmentMethod !== FulfillmentMethod.PICKUP) {
      throw new DomainError('INVALID_FULFILLMENT_METHOD', {
        messageKey: 'error.invalidFulfillmentMethod',
        status: 400,
        details: { fulfillmentMethod: order.fulfillmentMethod },
      });
    }

    const branchName = order.fulfillmentBranch.name;
    const deadlineDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const pickupDeadlineIso = deadlineDate.toISOString();

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.READY_FOR_PICKUP },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          nextStatus: OrderStatus.READY_FOR_PICKUP,
          reason: input?.note || 'Bao san sang nhan hang tai showroom (Luu kho 14 ngay)',
          actorType: ActorType.ADMIN,
          actorId: adminId,
          idempotencyKey: `history:ready-pickup:${order.id}:${Date.now()}`,
        },
      });

      await tx.notification.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          deduplicationKey: `order-ready-pickup:${order.id}:${Date.now()}`,
          eventType: 'ORDER_READY_FOR_PICKUP',
          title: `Don hang #${order.code} da san sang nhan tai showroom`,
          body: `Don hang #${order.code} cua quy khach da duoc chuan bi xong va san sang de nhan tai showroom ${branchName}. Thoi han luu kho la 14 ngay.`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
          payload: {
            orderId: order.id,
            orderCode: order.code,
            fulfillmentBranchId: order.fulfillmentBranchId,
            branchName,
            pickupDeadline: pickupDeadlineIso,
          },
        },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      status: OrderStatus.READY_FOR_PICKUP,
      message: 'Da phat thong bao san sang nhan hang tai showroom toi khach hang',
    };
  }
}

export const orderFulfillmentInboundService = new OrderFulfillmentInboundService();
