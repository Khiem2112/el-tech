import {
  ActorType,
  Prisma,
  PurchaseOrderStatus,
  SerialStatus,
  StockLedgerEntryType,
  StockMoveStatus,
  StockMoveType,
} from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import { ValidatePoReceiptInput } from '../../validations/admin/purchase-order.schema.js';

export class PoReceiptService {
  async validatePoReceipt(
    purchaseOrderId: string,
    input: ValidatePoReceiptInput,
    adminUserId?: string,
  ): Promise<unknown> {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        supplier: true,
        receivingBranch: true,
        lines: {
          include: {
            sku: {
              include: {
                productTemplate: true,
              },
            },
          },
        },
        receiptMove: true,
      },
    });

    if (!purchaseOrder) {
      throw new DomainError('PURCHASE_ORDER_NOT_FOUND', {
        status: 404,
        messageKey: 'Don mua hang khong ton tai',
        details: { purchaseOrderId },
      });
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.CONFIRMED) {
      throw new DomainError('PURCHASE_ORDER_INVALID_STATE', {
        status: 400,
        messageKey: 'Chi don hang o trang thai DA XAC NHAN moi duoc phep nhap kho',
        details: { status: purchaseOrder.status },
      });
    }

    if (purchaseOrder.receiptMove) {
      throw new DomainError('PURCHASE_ORDER_ALREADY_RECEIVED', {
        status: 400,
        messageKey: 'Don mua hang da duoc tao phieu nhap kho truoc do',
        details: { receiptMoveId: purchaseOrder.receiptMove.id },
      });
    }

    const inputMap = new Map<number, { receivedQuantity: number; serialNumbers: string[] }>();
    for (const line of input.lines) {
      inputMap.set(line.skuId, {
        receivedQuantity: line.receivedQuantity,
        serialNumbers: line.serialNumbers ?? [],
      });
    }

    if (inputMap.size !== purchaseOrder.lines.length) {
      throw new DomainError('PURCHASE_RECEIPT_MISMATCH', {
        status: 400,
        messageKey: 'So luong dong linh kien nhap kho khong khop voi don mua hang da duyet',
        details: { expectedLines: purchaseOrder.lines.length, actualLines: inputMap.size },
      });
    }

    const allProvidedSerials: string[] = [];

    for (const poLine of purchaseOrder.lines) {
      const match = inputMap.get(poLine.skuId);
      if (!match) {
        throw new DomainError('PURCHASE_RECEIPT_MISMATCH', {
          status: 400,
          messageKey: `Linh kien SKU ${poLine.sku.sku} bi thieu trong du lieu doi soat`,
          details: { skuId: poLine.skuId },
        });
      }

      if (match.receivedQuantity !== poLine.quantity) {
        throw new DomainError('PURCHASE_RECEIPT_MISMATCH', {
          status: 400,
          messageKey: `So luong linh kien SKU ${poLine.sku.sku} khong khop 100% (yeu cau ${poLine.quantity}, thuc nhan ${match.receivedQuantity})`,
          details: {
            skuId: poLine.skuId,
            expected: poLine.quantity,
            actual: match.receivedQuantity,
          },
        });
      }

      if (poLine.sku.serialRequired) {
        const cleanSerials = match.serialNumbers
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        if (cleanSerials.length !== poLine.quantity) {
          throw new DomainError('PURCHASE_RECEIPT_MISSING_SERIAL', {
            status: 400,
            messageKey: `Linh kien SKU ${poLine.sku.sku} yeu cau du ${poLine.quantity} so serial nhung chi co ${cleanSerials.length}`,
            details: {
              skuId: poLine.skuId,
              expectedQuantity: poLine.quantity,
              actualSerials: cleanSerials.length,
            },
          });
        }

        const serialSet = new Set<string>();
        for (const serial of cleanSerials) {
          const lower = serial.toUpperCase();
          if (serialSet.has(lower)) {
            throw new DomainError('PURCHASE_RECEIPT_DUPLICATE_SERIAL', {
              status: 400,
              messageKey: `Phat hien so serial trung lap trong du lieu nhap: ${serial}`,
              details: { duplicateSerial: serial },
            });
          }
          serialSet.add(lower);
          allProvidedSerials.push(serial);
        }
      }
    }

    if (allProvidedSerials.length > 0) {
      const existingUnits = await prisma.serialUnit.findMany({
        where: {
          serialNumber: {
            in: allProvidedSerials,
            mode: 'insensitive',
          },
        },
        select: { serialNumber: true },
      });

      if (existingUnits.length > 0) {
        const duplicated = existingUnits.map((item) => item.serialNumber).join(', ');
        throw new DomainError('PURCHASE_RECEIPT_DUPLICATE_SERIAL', {
          status: 400,
          messageKey: `So serial da ton tai tren he thong kho: ${duplicated}`,
          details: { duplicates: existingUnits },
        });
      }
    }

    return await prisma.$transaction(async (tx) => {
      const moveCode = `REC-${purchaseOrder.code}`;
      const stockMove = await tx.stockMove.create({
        data: {
          code: moveCode,
          destinationBranchId: purchaseOrder.receivingBranchId,
          sourceBranchId: null,
          purchaseOrderId: purchaseOrder.id,
          idempotencyKey: `po-receipt-${purchaseOrder.id}`,
          moveType: StockMoveType.PURCHASE_RECEIPT,
          status: StockMoveStatus.VALIDATED,
          validatedAt: new Date(),
          validatedById: adminUserId ?? null,
        },
      });

      for (const poLine of purchaseOrder.lines) {
        const moveLine = await tx.stockMoveLine.create({
          data: {
            stockMoveId: stockMove.id,
            skuId: poLine.skuId,
            quantity: poLine.quantity,
            unitCost: poLine.agreedUnitCost,
          },
        });

        const quant = await tx.stockQuant.findUnique({
          where: {
            branchId_skuId: {
              branchId: purchaseOrder.receivingBranchId,
              skuId: poLine.skuId,
            },
          },
        });

        const currentOnHand = quant ? quant.onHand : 0;
        const currentWac = quant ? Number(quant.weightedAverageCost) : 0;
        const incomingQty = poLine.quantity;
        const incomingCost = Number(poLine.agreedUnitCost);
        const newOnHand = currentOnHand + incomingQty;

        let newWacNumber = incomingCost;
        if (currentOnHand > 0 && newOnHand > 0) {
          newWacNumber = (currentOnHand * currentWac + incomingQty * incomingCost) / newOnHand;
        }
        const roundedWac = new Prisma.Decimal(newWacNumber.toFixed(2));

        const updatedQuant = quant
          ? await tx.stockQuant.update({
              where: { id: quant.id },
              data: {
                onHand: newOnHand,
                weightedAverageCost: roundedWac,
                version: { increment: 1 },
              },
            })
          : await tx.stockQuant.create({
              data: {
                branchId: purchaseOrder.receivingBranchId,
                skuId: poLine.skuId,
                onHand: newOnHand,
                reserved: 0,
                quarantineDamaged: 0,
                weightedAverageCost: roundedWac,
                version: 1,
              },
            });

        await tx.stockLedgerEntry.create({
          data: {
            stockQuantId: updatedQuant.id,
            stockMoveLineId: moveLine.id,
            entryType: StockLedgerEntryType.PURCHASE_RECEIPT,
            deltaOnHand: incomingQty,
            deltaReserved: 0,
            deltaQuarantine: 0,
            onHandAfter: newOnHand,
            reservedAfter: updatedQuant.reserved,
            quarantineAfter: updatedQuant.quarantineDamaged,
            actorType: ActorType.ADMIN,
            actorId: adminUserId ?? null,
            occurredAt: new Date(),
          },
        });

        if (poLine.sku.serialRequired) {
          const match = inputMap.get(poLine.skuId);
          const cleanSerials = (match?.serialNumbers ?? [])
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

          for (const serial of cleanSerials) {
            const serialUnit = await tx.serialUnit.create({
              data: {
                skuId: poLine.skuId,
                currentBranchId: purchaseOrder.receivingBranchId,
                originStockMoveLineId: moveLine.id,
                serialNumber: serial,
                status: SerialStatus.AVAILABLE,
              },
            });

            await tx.serialMovement.create({
              data: {
                serialUnitId: serialUnit.id,
                stockMoveLineId: moveLine.id,
                fromBranchId: null,
                toBranchId: purchaseOrder.receivingBranchId,
                resultingStatus: SerialStatus.AVAILABLE,
                occurredAt: new Date(),
              },
            });
          }
        }
      }

      const updatedPo = await tx.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: {
          status: PurchaseOrderStatus.RECEIVED,
          receivedAt: new Date(),
        },
        include: {
          supplier: true,
          receivingBranch: true,
          lines: {
            include: {
              sku: {
                include: {
                  productTemplate: true,
                },
              },
            },
          },
          receiptMove: {
            include: {
              lines: {
                include: {
                  receivedSerialUnits: true,
                },
              },
            },
          },
        },
      });

      return updatedPo;
    });
  }
}

export const poReceiptService = new PoReceiptService();
