import {
  ActorType,
  Prisma,
  SerialStatus,
  StockLedgerEntryType,
  StockMoveStatus,
  StockMoveType,
} from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreateSupplierReturnInput,
  QuerySupplierReturnInput,
} from '../../validations/admin/supplier-return.schema.js';

export type SupplierReturnListItemDto = {
  id: string;
  code: string;
  status: StockMoveStatus;
  reason: string | null;
  sourceBranchId: number | null;
  sourceBranchName: string | null;
  sourceBranchCode: string | null;
  inboundMoveId: string | null;
  inboundMoveCode: string | null;
  purchaseOrderId: string | null;
  purchaseOrderCode: string | null;
  supplierId: number | null;
  supplierName: string | null;
  supplierCode: string | null;
  totalQuantity: number;
  lineCount: number;
  returnSources: string[];
  validatedAt: Date | null;
  createdAt: Date;
};

export type SupplierReturnListResult = {
  items: SupplierReturnListItemDto[];
  total: number;
  page: number;
  limit: number;
};

export type EligibleReceiptSkuInfo = {
  skuId: number;
  skuCode: string;
  skuName: string;
  serialRequired: boolean;
  unitCost: string;
  receivedQuantity: number;
  alreadyReturnedQuantity: number;
  maxReturnableQuantity: number;
  currentOnHand: number;
  currentQuarantineDamaged: number;
  availableSerials: string[];
  quarantinedSerials: string[];
};

export type EligibleReceiptMoveDto = {
  inboundMoveId: string;
  inboundMoveCode: string;
  validatedAt: Date | null;
  purchaseOrderId: string;
  purchaseOrderCode: string;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  receivingBranchId: number;
  receivingBranchName: string;
  receivingBranchCode: string;
  skus: EligibleReceiptSkuInfo[];
};

async function generateNextSupplierReturnCode(
  client: Prisma.TransactionClient | typeof prisma,
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `RET-${currentYear}-`;
  const latestReturn = await client.stockMove.findFirst({
    where: {
      moveType: StockMoveType.SUPPLIER_RETURN,
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: 'desc',
    },
    select: { code: true },
  });

  let nextSequence = 1;
  if (latestReturn) {
    const parts = latestReturn.code.split('-');
    const lastNum = parseInt(parts[2], 10);
    if (!Number.isNaN(lastNum)) {
      nextSequence = lastNum + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export class AdminSupplierReturnService {
  async getSupplierReturns(query: QuerySupplierReturnInput): Promise<SupplierReturnListResult> {
    const where: Prisma.StockMoveWhereInput = {
      moveType: StockMoveType.SUPPLIER_RETURN,
    };

    if (query.branchId) {
      where.sourceBranchId = query.branchId;
    }

    if (query.supplierId) {
      where.reversalOfMove = {
        purchaseOrder: {
          supplierId: query.supplierId,
        },
      };
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { reason: { contains: term, mode: 'insensitive' } },
        {
          reversalOfMove: {
            code: { contains: term, mode: 'insensitive' },
          },
        },
        {
          reversalOfMove: {
            purchaseOrder: {
              code: { contains: term, mode: 'insensitive' },
            },
          },
        },
        {
          reversalOfMove: {
            purchaseOrder: {
              supplier: {
                name: { contains: term, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const total = await prisma.stockMove.count({ where });

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = limit > 0 ? (page - 1) * limit : 0;
    const take = limit > 0 ? limit : undefined;

    const returnMoves = await prisma.stockMove.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        sourceBranch: {
          select: { id: true, code: true, name: true },
        },
        reversalOfMove: {
          select: {
            id: true,
            code: true,
            purchaseOrder: {
              select: {
                id: true,
                code: true,
                supplier: {
                  select: { id: true, code: true, name: true },
                },
              },
            },
          },
        },
        lines: {
          include: {
            sku: {
              select: { id: true, sku: true, variationLabel: true },
            },
            ledgerEntries: {
              select: { deltaOnHand: true, deltaQuarantine: true },
            },
          },
        },
      },
    });

    const items: SupplierReturnListItemDto[] = returnMoves.map((rm) => {
      let totalQty = 0;
      const sourcesSet = new Set<string>();

      for (const line of rm.lines) {
        totalQty += line.quantity;
        for (const entry of line.ledgerEntries) {
          if (entry.deltaQuarantine < 0) {
            sourcesSet.add('quarantineDamaged');
          }
          if (entry.deltaOnHand < 0) {
            sourcesSet.add('onHand');
          }
        }
      }

      return {
        id: rm.id,
        code: rm.code,
        status: rm.status,
        reason: rm.reason,
        sourceBranchId: rm.sourceBranch?.id ?? null,
        sourceBranchName: rm.sourceBranch?.name ?? null,
        sourceBranchCode: rm.sourceBranch?.code ?? null,
        inboundMoveId: rm.reversalOfMove?.id ?? null,
        inboundMoveCode: rm.reversalOfMove?.code ?? null,
        purchaseOrderId: rm.reversalOfMove?.purchaseOrder?.id ?? null,
        purchaseOrderCode: rm.reversalOfMove?.purchaseOrder?.code ?? null,
        supplierId: rm.reversalOfMove?.purchaseOrder?.supplier.id ?? null,
        supplierName: rm.reversalOfMove?.purchaseOrder?.supplier.name ?? null,
        supplierCode: rm.reversalOfMove?.purchaseOrder?.supplier.code ?? null,
        totalQuantity: totalQty,
        lineCount: rm.lines.length,
        returnSources: Array.from(sourcesSet),
        validatedAt: rm.validatedAt,
        createdAt: rm.createdAt,
      };
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getSupplierReturnById(id: string): Promise<unknown> {
    const returnMove = await prisma.stockMove.findUnique({
      where: { id },
      include: {
        sourceBranch: true,
        destinationBranch: true,
        reversalOfMove: {
          include: {
            purchaseOrder: {
              include: {
                supplier: true,
                receivingBranch: true,
              },
            },
          },
        },
        lines: {
          include: {
            sku: {
              include: {
                productTemplate: true,
              },
            },
            originalMoveLine: true,
            ledgerEntries: true,
            serialMovements: {
              include: {
                serialUnit: true,
              },
            },
          },
        },
      },
    });

    if (!returnMove || returnMove.moveType !== StockMoveType.SUPPLIER_RETURN) {
      throw new DomainError('SUPPLIER_RETURN_NOT_FOUND', {
        status: 404,
        messageKey: 'Phieu xuat tra nha cung cap khong ton tai',
        details: { id },
      });
    }

    return returnMove;
  }

  async getEligibleReceiptMoves(
    search?: string,
    supplierId?: number,
    branchId?: number,
  ): Promise<EligibleReceiptMoveDto[]> {
    const where: Prisma.StockMoveWhereInput = {
      moveType: StockMoveType.PURCHASE_RECEIPT,
      status: StockMoveStatus.VALIDATED,
    };

    if (branchId) {
      where.destinationBranchId = branchId;
    }

    if (supplierId) {
      where.purchaseOrder = {
        supplierId,
      };
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { purchaseOrder: { code: { contains: term, mode: 'insensitive' } } },
        { purchaseOrder: { supplier: { name: { contains: term, mode: 'insensitive' } } } },
      ];
    }

    const receiptMoves = await prisma.stockMove.findMany({
      where,
      orderBy: { validatedAt: 'desc' },
      include: {
        destinationBranch: {
          select: { id: true, code: true, name: true },
        },
        purchaseOrder: {
          select: {
            id: true,
            code: true,
            supplier: {
              select: { id: true, code: true, name: true },
            },
          },
        },
        lines: {
          include: {
            sku: {
              select: {
                id: true,
                sku: true,
                variationLabel: true,
                serialRequired: true,
                productTemplate: { select: { name: true } },
              },
            },
            reversalLines: {
              where: {
                stockMove: {
                  moveType: StockMoveType.SUPPLIER_RETURN,
                  status: { not: StockMoveStatus.CANCELLED },
                },
              },
              select: { quantity: true },
            },
            receivedSerialUnits: {
              select: {
                serialNumber: true,
                status: true,
                currentBranchId: true,
              },
            },
          },
        },
      },
    });

    const eligibleReceipts: EligibleReceiptMoveDto[] = [];

    for (const receipt of receiptMoves) {
      if (!receipt.purchaseOrder || !receipt.destinationBranch) {
        continue;
      }

      const receivingBranchId = receipt.destinationBranch.id;
      const skuInfos: EligibleReceiptSkuInfo[] = [];

      for (const line of receipt.lines) {
        const receivedQty = line.quantity;
        const alreadyReturned = line.reversalLines.reduce((acc, cur) => acc + cur.quantity, 0);
        const maxReturnable = Math.max(0, receivedQty - alreadyReturned);

        const quant = await prisma.stockQuant.findUnique({
          where: {
            branchId_skuId: {
              branchId: receivingBranchId,
              skuId: line.skuId,
            },
          },
          select: {
            onHand: true,
            quarantineDamaged: true,
          },
        });

        const currentOnHand = quant ? quant.onHand : 0;
        const currentQuarantine = quant ? quant.quarantineDamaged : 0;

        const availableSerials = line.receivedSerialUnits
          .filter(
            (u) =>
              u.status === SerialStatus.AVAILABLE &&
              u.currentBranchId === receivingBranchId,
          )
          .map((u) => u.serialNumber);

        const quarantinedSerials = line.receivedSerialUnits
          .filter(
            (u) =>
              u.status === SerialStatus.QUARANTINED &&
              u.currentBranchId === receivingBranchId,
          )
          .map((u) => u.serialNumber);

        skuInfos.push({
          skuId: line.skuId,
          skuCode: line.sku.sku,
          skuName: `${line.sku.productTemplate.name}${line.sku.variationLabel ? ` (${line.sku.variationLabel})` : ''}`,
          serialRequired: line.sku.serialRequired,
          unitCost: line.unitCost.toString(),
          receivedQuantity: receivedQty,
          alreadyReturnedQuantity: alreadyReturned,
          maxReturnableQuantity: maxReturnable,
          currentOnHand,
          currentQuarantineDamaged: currentQuarantine,
          availableSerials,
          quarantinedSerials,
        });
      }

      const hasReturnableSku = skuInfos.some((s) => s.maxReturnableQuantity > 0);
      if (hasReturnableSku) {
        eligibleReceipts.push({
          inboundMoveId: receipt.id,
          inboundMoveCode: receipt.code,
          validatedAt: receipt.validatedAt,
          purchaseOrderId: receipt.purchaseOrder.id,
          purchaseOrderCode: receipt.purchaseOrder.code,
          supplierId: receipt.purchaseOrder.supplier.id,
          supplierName: receipt.purchaseOrder.supplier.name,
          supplierCode: receipt.purchaseOrder.supplier.code,
          receivingBranchId: receipt.destinationBranch.id,
          receivingBranchName: receipt.destinationBranch.name,
          receivingBranchCode: receipt.destinationBranch.code,
          skus: skuInfos,
        });
      }
    }

    return eligibleReceipts;
  }

  async getReceiptMoveReturnInfo(receiptMoveId: string): Promise<EligibleReceiptMoveDto> {
    const receipts = await this.getEligibleReceiptMoves();
    const found = receipts.find((r) => r.inboundMoveId === receiptMoveId);
    if (!found) {
      const receiptMove = await prisma.stockMove.findUnique({
        where: { id: receiptMoveId },
        include: {
          destinationBranch: true,
          purchaseOrder: {
            include: { supplier: true },
          },
          lines: {
            include: {
              sku: {
                include: { productTemplate: true },
              },
              reversalLines: {
                where: {
                  stockMove: {
                    moveType: StockMoveType.SUPPLIER_RETURN,
                    status: { not: StockMoveStatus.CANCELLED },
                  },
                },
              },
              receivedSerialUnits: true,
            },
          },
        },
      });

      if (!receiptMove || receiptMove.moveType !== StockMoveType.PURCHASE_RECEIPT) {
        throw new DomainError('RECEIPT_MOVE_NOT_FOUND', {
          status: 404,
          messageKey: 'Phiếu nhập kho gốc không tồn tại',
          details: { receiptMoveId },
        });
      }

      const receivingBranchId = receiptMove.destinationBranchId ?? 0;
      const skuInfos: EligibleReceiptSkuInfo[] = [];

      for (const line of receiptMove.lines) {
        const receivedQty = line.quantity;
        const alreadyReturned = line.reversalLines.reduce((acc, cur) => acc + cur.quantity, 0);
        const maxReturnable = Math.max(0, receivedQty - alreadyReturned);

        const quant = await prisma.stockQuant.findUnique({
          where: {
            branchId_skuId: {
              branchId: receivingBranchId,
              skuId: line.skuId,
            },
          },
        });

        const availableSerials = line.receivedSerialUnits
          .filter(
            (u) =>
              u.status === SerialStatus.AVAILABLE &&
              u.currentBranchId === receivingBranchId,
          )
          .map((u) => u.serialNumber);

        const quarantinedSerials = line.receivedSerialUnits
          .filter(
            (u) =>
              u.status === SerialStatus.QUARANTINED &&
              u.currentBranchId === receivingBranchId,
          )
          .map((u) => u.serialNumber);

        skuInfos.push({
          skuId: line.skuId,
          skuCode: line.sku.sku,
          skuName: `${line.sku.productTemplate.name}${line.sku.variationLabel ? ` (${line.sku.variationLabel})` : ''}`,
          serialRequired: line.sku.serialRequired,
          unitCost: line.unitCost.toString(),
          receivedQuantity: receivedQty,
          alreadyReturnedQuantity: alreadyReturned,
          maxReturnableQuantity: maxReturnable,
          currentOnHand: quant ? quant.onHand : 0,
          currentQuarantineDamaged: quant ? quant.quarantineDamaged : 0,
          availableSerials,
          quarantinedSerials,
        });
      }

      return {
        inboundMoveId: receiptMove.id,
        inboundMoveCode: receiptMove.code,
        validatedAt: receiptMove.validatedAt,
        purchaseOrderId: receiptMove.purchaseOrder?.id ?? '',
        purchaseOrderCode: receiptMove.purchaseOrder?.code ?? '',
        supplierId: receiptMove.purchaseOrder?.supplier.id ?? 0,
        supplierName: receiptMove.purchaseOrder?.supplier.name ?? '',
        supplierCode: receiptMove.purchaseOrder?.supplier.code ?? '',
        receivingBranchId: receiptMove.destinationBranch?.id ?? 0,
        receivingBranchName: receiptMove.destinationBranch?.name ?? '',
        receivingBranchCode: receiptMove.destinationBranch?.code ?? '',
        skus: skuInfos,
      };
    }

    return found;
  }

  async createSupplierReturn(
    input: CreateSupplierReturnInput,
    adminUserId?: string,
  ): Promise<unknown> {
    const inboundMove = await prisma.stockMove.findUnique({
      where: { id: input.inboundStockMoveId },
      include: {
        destinationBranch: true,
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
        lines: {
          include: {
            sku: true,
            reversalLines: {
              where: {
                stockMove: {
                  moveType: StockMoveType.SUPPLIER_RETURN,
                  status: { not: StockMoveStatus.CANCELLED },
                },
              },
            },
            receivedSerialUnits: true,
          },
        },
      },
    });

    if (!inboundMove) {
      throw new DomainError('INBOUND_MOVE_NOT_FOUND', {
        status: 404,
        messageKey: 'Khong tim thay phieu nhap kho goc tuong ung',
        details: { inboundStockMoveId: input.inboundStockMoveId },
      });
    }

    if (inboundMove.moveType !== StockMoveType.PURCHASE_RECEIPT) {
      throw new DomainError('INVALID_ORIGINAL_MOVE_TYPE', {
        status: 400,
        messageKey: 'Chung tu goc phai la phieu nhap kho mua hang (PURCHASE_RECEIPT)',
        details: { moveType: inboundMove.moveType },
      });
    }

    if (inboundMove.status !== StockMoveStatus.VALIDATED) {
      throw new DomainError('INBOUND_MOVE_NOT_VALIDATED', {
        status: 400,
        messageKey: 'Chi co the xuat tra nha cung cap tu phieu nhap kho da duoc xac nhan nhap kho hop le',
        details: { status: inboundMove.status },
      });
    }

    const sourceBranchId = inboundMove.destinationBranchId;
    if (!sourceBranchId) {
      throw new DomainError('INBOUND_MOVE_MISSING_BRANCH', {
        status: 400,
        messageKey: 'Phieu nhap kho goc thieu thong tin chi nhanh nhan hang',
      });
    }

    const inboundLinesMap = new Map<number, (typeof inboundMove.lines)[number]>();
    for (const line of inboundMove.lines) {
      inboundLinesMap.set(line.skuId, line);
    }

    for (const reqLine of input.lines) {
      const inboundLine = inboundLinesMap.get(reqLine.skuId);
      if (!inboundLine) {
        throw new DomainError('RETURN_SKU_NOT_IN_INBOUND_MOVE', {
          status: 400,
          messageKey: `Linh kien SKU id ${reqLine.skuId} khong thuoc phieu nhap kho goc ${inboundMove.code}`,
          details: { skuId: reqLine.skuId, inboundMoveCode: inboundMove.code },
        });
      }

      const receivedQty = inboundLine.quantity;
      const alreadyReturnedQty = inboundLine.reversalLines.reduce((acc, cur) => acc + cur.quantity, 0);
      const remainingReturnableCeiling = Math.max(0, receivedQty - alreadyReturnedQty);

      if (reqLine.quantity > remainingReturnableCeiling) {
        throw new DomainError('SUPPLIER_RETURN_EXCEEDS_CEILING', {
          status: 400,
          messageKey: `So luong xuat tra (${reqLine.quantity}) vuot qua han muc toi da cho phep (${remainingReturnableCeiling}) cua phieu nhap ${inboundMove.code}`,
          details: {
            skuId: reqLine.skuId,
            requested: reqLine.quantity,
            remainingCeiling: remainingReturnableCeiling,
            alreadyReturned: alreadyReturnedQty,
            receivedTotal: receivedQty,
          },
        });
      }

      const quant = await prisma.stockQuant.findUnique({
        where: {
          branchId_skuId: {
            branchId: sourceBranchId,
            skuId: reqLine.skuId,
          },
        },
      });

      if (reqLine.returnSource === 'quarantineDamaged') {
        const availableQuarantine = quant ? quant.quarantineDamaged : 0;
        if (availableQuarantine < reqLine.quantity) {
          throw new DomainError('INSUFFICIENT_QUARANTINE_STOCK', {
            status: 400,
            messageKey: `Ton kho cach ly loi tai chi nhanh khong du de xuat tra (hien co ${availableQuarantine}, yeu cau ${reqLine.quantity})`,
            details: {
              skuId: reqLine.skuId,
              requested: reqLine.quantity,
              availableQuarantine,
            },
          });
        }
      } else {
        const availableOnHand = quant ? quant.onHand - quant.reserved : 0;
        if (availableOnHand < reqLine.quantity) {
          throw new DomainError('INSUFFICIENT_STOCK', {
            status: 400,
            messageKey: `Ton kho thuc te kha dung tai chi nhanh khong du de xuat tra (kha dung ${availableOnHand}, yeu cau ${reqLine.quantity})`,
            details: {
              skuId: reqLine.skuId,
              requested: reqLine.quantity,
              availableOnHand,
              totalOnHand: quant ? quant.onHand : 0,
            },
          });
        }
      }

      const cleanSerials = (reqLine.serialNumbers ?? [])
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (inboundLine.sku.serialRequired || cleanSerials.length > 0) {
        if (cleanSerials.length !== reqLine.quantity) {
          throw new DomainError('SUPPLIER_RETURN_SERIAL_COUNT_MISMATCH', {
            status: 400,
            messageKey: `Linh kien yeu cau dung ${reqLine.quantity} so serial nhung chi cung cap ${cleanSerials.length}`,
            details: {
              skuId: reqLine.skuId,
              expectedSerials: reqLine.quantity,
              providedSerials: cleanSerials.length,
            },
          });
        }

        const serialSet = new Set<string>();
        for (const s of cleanSerials) {
          const upper = s.toUpperCase();
          if (serialSet.has(upper)) {
            throw new DomainError('SUPPLIER_RETURN_DUPLICATE_SERIAL_INPUT', {
              status: 400,
              messageKey: `Phat hien so serial trung lap trong danh sach xuat tra: ${s}`,
              details: { serial: s },
            });
          }
          serialSet.add(upper);
        }

        const receivedSerialMap = new Map<string, (typeof inboundLine.receivedSerialUnits)[number]>();
        for (const su of inboundLine.receivedSerialUnits) {
          receivedSerialMap.set(su.serialNumber.toUpperCase(), su);
        }

        for (const s of cleanSerials) {
          const matchedSu = receivedSerialMap.get(s.toUpperCase());
          if (!matchedSu) {
            throw new DomainError('SERIAL_NOT_FROM_ORIGINAL_RECEIPT', {
              status: 400,
              messageKey: `So serial ${s} khong thuoc lo hang nhap cua phieu ${inboundMove.code}`,
              details: { serial: s, inboundMoveCode: inboundMove.code },
            });
          }

          if (matchedSu.currentBranchId !== sourceBranchId) {
            throw new DomainError('SERIAL_NOT_AT_BRANCH', {
              status: 400,
              messageKey: `So serial ${s} hien khong nam tai chi nhanh xuat hang`,
              details: { serial: s, currentBranchId: matchedSu.currentBranchId },
            });
          }

          if (reqLine.returnSource === 'quarantineDamaged') {
            if (
              matchedSu.status !== SerialStatus.QUARANTINED &&
              matchedSu.status !== SerialStatus.AVAILABLE
            ) {
              throw new DomainError('SERIAL_INVALID_STATUS_FOR_RETURN', {
                status: 400,
                messageKey: `So serial ${s} khong o trang thai hop le de tra hang tu kho loi (trang thai hien tai: ${matchedSu.status})`,
                details: { serial: s, status: matchedSu.status },
              });
            }
          } else {
            if (matchedSu.status !== SerialStatus.AVAILABLE) {
              throw new DomainError('SERIAL_INVALID_STATUS_FOR_RETURN', {
                status: 400,
                messageKey: `So serial ${s} khong o trang thai san sang (AVAILABLE) de xuat tra (trang thai hien tai: ${matchedSu.status})`,
                details: { serial: s, status: matchedSu.status },
              });
            }
          }
        }
      }
    }

    return await prisma.$transaction(async (tx) => {
      const returnCode = await generateNextSupplierReturnCode(tx);
      const idempotencyKey = `supplier-return-${returnCode}-${Date.now()}`;

      const returnStockMove = await tx.stockMove.create({
        data: {
          code: returnCode,
          sourceBranchId,
          destinationBranchId: null,
          reversalOfMoveId: inboundMove.id,
          idempotencyKey,
          moveType: StockMoveType.SUPPLIER_RETURN,
          status: StockMoveStatus.VALIDATED,
          reason: input.reason.trim(),
          validatedAt: new Date(),
          validatedById: adminUserId ?? null,
        },
      });

      for (const reqLine of input.lines) {
        const inboundLine = inboundLinesMap.get(reqLine.skuId)!;

        const returnMoveLine = await tx.stockMoveLine.create({
          data: {
            stockMoveId: returnStockMove.id,
            skuId: reqLine.skuId,
            originalMoveLineId: inboundLine.id,
            quantity: reqLine.quantity,
            unitCost: inboundLine.unitCost,
          },
        });

        const quant = await tx.stockQuant.findUnique({
          where: {
            branchId_skuId: {
              branchId: sourceBranchId,
              skuId: reqLine.skuId,
            },
          },
        });

        if (!quant) {
          throw new DomainError('STOCK_QUANT_NOT_FOUND', {
            status: 404,
            messageKey: 'Khong tim thay ban ghi ton kho de cap nhat',
          });
        }

        let deltaOnHand = 0;
        let deltaQuarantine = 0;
        let onHandAfter = quant.onHand;
        let quarantineAfter = quant.quarantineDamaged;

        if (reqLine.returnSource === 'quarantineDamaged') {
          deltaQuarantine = -reqLine.quantity;
          quarantineAfter = quant.quarantineDamaged - reqLine.quantity;

          await tx.stockQuant.update({
            where: { id: quant.id },
            data: {
              quarantineDamaged: quarantineAfter,
              version: { increment: 1 },
            },
          });
        } else {
          deltaOnHand = -reqLine.quantity;
          onHandAfter = quant.onHand - reqLine.quantity;

          await tx.stockQuant.update({
            where: { id: quant.id },
            data: {
              onHand: onHandAfter,
              version: { increment: 1 },
            },
          });
        }

        await tx.stockLedgerEntry.create({
          data: {
            stockQuantId: quant.id,
            stockMoveLineId: returnMoveLine.id,
            entryType: StockLedgerEntryType.SUPPLIER_RETURN,
            deltaOnHand,
            deltaReserved: 0,
            deltaQuarantine,
            onHandAfter,
            reservedAfter: quant.reserved,
            quarantineAfter,
            actorType: ActorType.ADMIN,
            actorId: adminUserId ?? null,
            occurredAt: new Date(),
          },
        });

        const cleanSerials = (reqLine.serialNumbers ?? [])
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        if (cleanSerials.length > 0) {
          for (const serialNum of cleanSerials) {
            const serialUnit = await tx.serialUnit.findUnique({
              where: { serialNumber: serialNum },
            });

            if (!serialUnit) {
              continue;
            }

            await tx.serialUnit.update({
              where: { id: serialUnit.id },
              data: {
                status: SerialStatus.RETURNED_TO_SUPPLIER,
                currentBranchId: null,
              },
            });

            await tx.serialMovement.create({
              data: {
                serialUnitId: serialUnit.id,
                stockMoveLineId: returnMoveLine.id,
                fromBranchId: sourceBranchId,
                toBranchId: null,
                resultingStatus: SerialStatus.RETURNED_TO_SUPPLIER,
                occurredAt: new Date(),
              },
            });
          }
        }
      }

      const createdReturn = await tx.stockMove.findUnique({
        where: { id: returnStockMove.id },
        include: {
          sourceBranch: true,
          reversalOfMove: {
            include: {
              purchaseOrder: {
                include: {
                  supplier: true,
                },
              },
            },
          },
          lines: {
            include: {
              sku: {
                include: { productTemplate: true },
              },
              serialMovements: {
                include: { serialUnit: true },
              },
              ledgerEntries: true,
            },
          },
        },
      });

      return createdReturn;
    });
  }
}

export const adminSupplierReturnService = new AdminSupplierReturnService();
