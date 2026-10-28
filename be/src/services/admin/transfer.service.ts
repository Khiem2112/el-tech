import {
  ActorType,
  Prisma,
  SerialStatus,
  StockLedgerEntryType,
  StockMoveStatus,
  StockMoveType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CancelTransferInput,
  CreateTransferInput,
  DispatchTransferInput,
  QueryTransferInput,
  ReceiveTransferInput,
} from '../../validations/admin/transfer.schema.js';

export type TransferStatusDisplay = 'REQUESTED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export type TransferLineItemDto = {
  id: string;
  skuId: number;
  skuCode: string;
  productName: string;
  productImage: string | null;
  variationLabel: string | null;
  quantity: number;
  unitCost: string;
  serialRequired: boolean;
  serialNumbers: string[];
};

export type TransferListItemDto = {
  id: string;
  code: string;
  status: StockMoveStatus;
  displayStatus: TransferStatusDisplay;
  sourceBranchId: number;
  sourceBranchCode: string;
  sourceBranchName: string;
  destinationBranchId: number;
  destinationBranchCode: string;
  destinationBranchName: string;
  totalQuantity: number;
  lineCount: number;
  primaryProductName: string;
  primaryProductImage: string | null;
  reason: string | null;
  createdAt: Date;
  dispatchedAt: Date | null;
  validatedAt: Date | null;
  cancelledAt: Date | null;
  dispatchedByName: string | null;
  validatedByName: string | null;
  lines: TransferLineItemDto[];
};

export type TransferSummaryDto = {
  totalTransfers: number;
  inTransitUnits: number;
  connectedBranchesCount: number;
  fullReceiptRate: string;
};

export type TransferListResult = {
  items: TransferListItemDto[];
  total: number;
  page: number;
  limit: number;
  summary: TransferSummaryDto;
};

export type TransferDetailDto = TransferListItemDto & {
  sourceBranchAddress: string;
  destinationBranchAddress: string;
};

export type TransferEligibleSkuDto = {
  skuId: number;
  skuCode: string;
  productName: string;
  productImage: string | null;
  variationLabel: string | null;
  availableQuantity: number;
  onHand: number;
  reserved: number;
  serialRequired: boolean;
  currentCost: string;
};

function extractVariantImageUrl(variantSpec: unknown, templateMedia: unknown): string | null {
  if (variantSpec && typeof variantSpec === 'object') {
    const spec = variantSpec as Record<string, unknown>;
    if (typeof spec['image'] === 'string' && spec['image'].length > 0) {
      return spec['image'];
    }
    if (typeof spec['imageUrl'] === 'string' && spec['imageUrl'].length > 0) {
      return spec['imageUrl'];
    }
  }

  if (Array.isArray(templateMedia) && templateMedia.length > 0) {
    const firstItem = templateMedia[0];
    if (typeof firstItem === 'string' && firstItem.length > 0) {
      return firstItem;
    }
    if (firstItem && typeof firstItem === 'object') {
      const obj = firstItem as Record<string, unknown>;
      if (typeof obj['url'] === 'string') {
        return obj['url'];
      }
    }
  }

  return null;
}

function mapToDisplayStatus(status: StockMoveStatus): TransferStatusDisplay {
  switch (status) {
    case StockMoveStatus.DRAFT:
    case StockMoveStatus.RESERVED:
      return 'REQUESTED';
    case StockMoveStatus.IN_TRANSIT:
      return 'IN_TRANSIT';
    case StockMoveStatus.VALIDATED:
      return 'RECEIVED';
    case StockMoveStatus.CANCELLED:
    case StockMoveStatus.REVERSED:
    default:
      return 'CANCELLED';
  }
}

async function generateNextTransferCode(
  client: Prisma.TransactionClient | typeof prisma,
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `TRF-${currentYear}-`;
  const latestTransfer = await client.stockMove.findFirst({
    where: {
      moveType: StockMoveType.INTERNAL_TRANSFER,
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
  if (latestTransfer) {
    const parts = latestTransfer.code.split('-');
    const lastNum = parseInt(parts[2], 10);
    if (!Number.isNaN(lastNum)) {
      nextSequence = lastNum + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export class AdminTransferService {
  async listTransfers(query: QueryTransferInput): Promise<TransferListResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMoveWhereInput = {
      moveType: StockMoveType.INTERNAL_TRANSFER,
    };

    if (query.status && query.status !== 'ALL') {
      if (query.status === 'REQUESTED' || query.status === 'DRAFT') {
        where.status = StockMoveStatus.DRAFT;
      } else if (query.status === 'RECEIVED' || query.status === 'VALIDATED') {
        where.status = StockMoveStatus.VALIDATED;
      } else if (query.status === 'IN_TRANSIT') {
        where.status = StockMoveStatus.IN_TRANSIT;
      } else if (query.status === 'CANCELLED') {
        where.status = StockMoveStatus.CANCELLED;
      }
    }

    if (query.sourceBranchId) {
      where.sourceBranchId = query.sourceBranchId;
    }

    if (query.destinationBranchId) {
      where.destinationBranchId = query.destinationBranchId;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { reason: { contains: term, mode: 'insensitive' } },
        {
          lines: {
            some: {
              sku: {
                OR: [
                  { sku: { contains: term, mode: 'insensitive' } },
                  { productTemplate: { name: { contains: term, mode: 'insensitive' } } },
                ],
              },
            },
          },
        },
      ];
    }

    const [total, stockMoves] = await Promise.all([
      prisma.stockMove.count({ where }),
      prisma.stockMove.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sourceBranch: true,
          destinationBranch: true,
          lines: {
            include: {
              sku: {
                include: {
                  productTemplate: true,
                },
              },
              serialMovements: {
                include: {
                  serialUnit: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const userIds = new Set<string>();
    for (const move of stockMoves) {
      if (move.dispatchedById) {
        userIds.add(move.dispatchedById);
      }
      if (move.validatedById) {
        userIds.add(move.validatedById);
      }
    }

    const users = userIds.size > 0
      ? await prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const userMap = new Map<string, string>();
    for (const u of users) {
      userMap.set(u.id, u.name || u.email);
    }

    const items: TransferListItemDto[] = stockMoves.map((move) => {
      let totalQuantity = 0;
      const lines: TransferLineItemDto[] = move.lines.map((line) => {
        totalQuantity += line.quantity;
        const imageUrl = extractVariantImageUrl(
          line.sku.variantSpec,
          line.sku.productTemplate.media,
        );

        const serialNumbers = line.serialMovements.map((sm) => sm.serialUnit.serialNumber);

        return {
          id: line.id,
          skuId: line.skuId,
          skuCode: line.sku.sku,
          productName: line.sku.productTemplate.name,
          productImage: imageUrl,
          variationLabel: line.sku.variationLabel,
          quantity: line.quantity,
          unitCost: line.unitCost.toFixed(0),
          serialRequired: line.sku.serialRequired,
          serialNumbers,
        };
      });

      const primaryLine = lines[0] ?? null;
      const primaryProductName = primaryLine
        ? `${primaryLine.productName}${lines.length > 1 ? ` (+${lines.length - 1} linh kien)` : ''}`
        : 'Linh kien dieu chuyen';
      const primaryProductImage = primaryLine?.productImage ?? null;

      return {
        id: move.id,
        code: move.code,
        status: move.status,
        displayStatus: mapToDisplayStatus(move.status),
        sourceBranchId: move.sourceBranchId ?? 0,
        sourceBranchCode: move.sourceBranch?.code ?? 'N/A',
        sourceBranchName: move.sourceBranch?.name ?? 'Chi nhanh xuat',
        destinationBranchId: move.destinationBranchId ?? 0,
        destinationBranchCode: move.destinationBranch?.code ?? 'N/A',
        destinationBranchName: move.destinationBranch?.name ?? 'Chi nhanh nhan',
        totalQuantity,
        lineCount: lines.length,
        primaryProductName,
        primaryProductImage,
        reason: move.reason,
        createdAt: move.createdAt,
        dispatchedAt: move.dispatchedAt,
        validatedAt: move.validatedAt,
        cancelledAt: move.cancelledAt,
        dispatchedByName: move.dispatchedById ? userMap.get(move.dispatchedById) ?? null : null,
        validatedByName: move.validatedById ? userMap.get(move.validatedById) ?? null : null,
        lines,
      };
    });

    const [allMovesForSummary, branchCount] = await Promise.all([
      prisma.stockMove.findMany({
        where: { moveType: StockMoveType.INTERNAL_TRANSFER },
        select: {
          status: true,
          lines: {
            select: { quantity: true },
          },
        },
      }),
      prisma.branch.count({ where: { isActive: true } }),
    ]);

    let inTransitUnits = 0;
    let validatedCount = 0;
    let completedOrInTransitCount = 0;

    for (const m of allMovesForSummary) {
      if (m.status === StockMoveStatus.IN_TRANSIT) {
        for (const l of m.lines) {
          inTransitUnits += l.quantity;
        }
        completedOrInTransitCount += 1;
      } else if (m.status === StockMoveStatus.VALIDATED) {
        validatedCount += 1;
        completedOrInTransitCount += 1;
      }
    }

    const fullReceiptRate = completedOrInTransitCount > 0
      ? `${Math.round((validatedCount / completedOrInTransitCount) * 100)}%`
      : '100%';

    return {
      items,
      total,
      page,
      limit,
      summary: {
        totalTransfers: allMovesForSummary.length,
        inTransitUnits,
        connectedBranchesCount: branchCount,
        fullReceiptRate,
      },
    };
  }

  async getTransferById(id: string): Promise<TransferDetailDto> {
    const move = await prisma.stockMove.findUnique({
      where: { id },
      include: {
        sourceBranch: true,
        destinationBranch: true,
        lines: {
          include: {
            sku: {
              include: {
                productTemplate: true,
              },
            },
            serialMovements: {
              include: {
                serialUnit: true,
              },
            },
          },
        },
      },
    });

    if (!move || move.moveType !== StockMoveType.INTERNAL_TRANSFER) {
      throw new DomainError('TRANSFER_NOT_FOUND', {
        status: 404,
        messageKey: 'Phieu dieu chuyen kho khong ton tai',
        details: { id },
      });
    }

    let dispatchedByName: string | null = null;
    let validatedByName: string | null = null;

    if (move.dispatchedById) {
      const u = await prisma.user.findUnique({
        where: { id: move.dispatchedById },
        select: { name: true, email: true },
      });
      dispatchedByName = u?.name || u?.email || null;
    }

    if (move.validatedById) {
      const u = await prisma.user.findUnique({
        where: { id: move.validatedById },
        select: { name: true, email: true },
      });
      validatedByName = u?.name || u?.email || null;
    }

    let totalQuantity = 0;
    const lines: TransferLineItemDto[] = move.lines.map((line) => {
      totalQuantity += line.quantity;
      const imageUrl = extractVariantImageUrl(
        line.sku.variantSpec,
        line.sku.productTemplate.media,
      );

      const serialNumbers = line.serialMovements.map((sm) => sm.serialUnit.serialNumber);

      return {
        id: line.id,
        skuId: line.skuId,
        skuCode: line.sku.sku,
        productName: line.sku.productTemplate.name,
        productImage: imageUrl,
        variationLabel: line.sku.variationLabel,
        quantity: line.quantity,
        unitCost: line.unitCost.toFixed(0),
        serialRequired: line.sku.serialRequired,
        serialNumbers,
      };
    });

    const primaryLine = lines[0] ?? null;
    const primaryProductName = primaryLine
      ? `${primaryLine.productName}${lines.length > 1 ? ` (+${lines.length - 1} linh kien)` : ''}`
      : 'Linh kien dieu chuyen';
    const primaryProductImage = primaryLine?.productImage ?? null;

    return {
      id: move.id,
      code: move.code,
      status: move.status,
      displayStatus: mapToDisplayStatus(move.status),
      sourceBranchId: move.sourceBranchId ?? 0,
      sourceBranchCode: move.sourceBranch?.code ?? 'N/A',
      sourceBranchName: move.sourceBranch?.name ?? 'Chi nhanh xuat',
      sourceBranchAddress: move.sourceBranch?.address ?? '',
      destinationBranchId: move.destinationBranchId ?? 0,
      destinationBranchCode: move.destinationBranch?.code ?? 'N/A',
      destinationBranchName: move.destinationBranch?.name ?? 'Chi nhanh nhan',
      destinationBranchAddress: move.destinationBranch?.address ?? '',
      totalQuantity,
      lineCount: lines.length,
      primaryProductName,
      primaryProductImage,
      reason: move.reason,
      createdAt: move.createdAt,
      dispatchedAt: move.dispatchedAt,
      validatedAt: move.validatedAt,
      cancelledAt: move.cancelledAt,
      dispatchedByName,
      validatedByName,
      lines,
    };
  }

  async getEligibleSourceSkus(branchId: number): Promise<TransferEligibleSkuDto[]> {
    const quants = await prisma.stockQuant.findMany({
      where: {
        branchId,
        isActive: true,
        onHand: { gt: 0 },
      },
      include: {
        sku: {
          include: {
            productTemplate: true,
          },
        },
      },
      orderBy: {
        sku: {
          sku: 'asc',
        },
      },
    });

    return quants
      .map((q) => {
        const available = Math.max(0, q.onHand - q.reserved - q.quarantineDamaged);
        const imageUrl = extractVariantImageUrl(
          q.sku.variantSpec,
          q.sku.productTemplate.media,
        );

        return {
          skuId: q.skuId,
          skuCode: q.sku.sku,
          productName: q.sku.productTemplate.name,
          productImage: imageUrl,
          variationLabel: q.sku.variationLabel,
          availableQuantity: available,
          onHand: q.onHand,
          reserved: q.reserved,
          serialRequired: q.sku.serialRequired,
          currentCost: q.weightedAverageCost.toFixed(0),
        };
      })
      .filter((item) => item.availableQuantity > 0);
  }

  async getTransferAvailableSerials(transferId: string, skuId: number): Promise<string[]> {
    const transfer = await prisma.stockMove.findUnique({
      where: { id: transferId },
      select: { sourceBranchId: true },
    });

    if (!transfer || !transfer.sourceBranchId) {
      throw new DomainError('TRANSFER_NOT_FOUND', {
        status: 404,
        messageKey: 'Khong tim thay phieu dieu chuyen',
        details: { transferId },
      });
    }

    const serials = await prisma.serialUnit.findMany({
      where: {
        skuId,
        currentBranchId: transfer.sourceBranchId,
        status: SerialStatus.AVAILABLE,
        isActive: true,
      },
      select: { serialNumber: true },
      orderBy: { serialNumber: 'asc' },
    });

    return serials.map((s) => s.serialNumber);
  }

  async createTransfer(
    input: CreateTransferInput,
    _adminUserId?: string,
  ): Promise<TransferDetailDto> {
    const [sourceBranch, destBranch] = await Promise.all([
      prisma.branch.findUnique({ where: { id: input.sourceBranchId } }),
      prisma.branch.findUnique({ where: { id: input.destinationBranchId } }),
    ]);

    if (!sourceBranch || !sourceBranch.isActive) {
      throw new DomainError('SOURCE_BRANCH_INVALID', {
        status: 400,
        messageKey: 'Chi nhanh xuat khong ton tai hoac da ngung hoat dong',
        details: { sourceBranchId: input.sourceBranchId },
      });
    }

    if (!destBranch || !destBranch.isActive) {
      throw new DomainError('DESTINATION_BRANCH_INVALID', {
        status: 400,
        messageKey: 'Chi nhanh nhan khong ton tai hoac da ngung hoat dong',
        details: { destinationBranchId: input.destinationBranchId },
      });
    }

    const skuIds = input.lines.map((l) => l.skuId);
    const quants = await prisma.stockQuant.findMany({
      where: {
        branchId: input.sourceBranchId,
        skuId: { in: skuIds },
      },
    });

    const quantMap = new Map<number, (typeof quants)[number]>();
    for (const q of quants) {
      quantMap.set(q.skuId, q);
    }

    for (const line of input.lines) {
      const quant = quantMap.get(line.skuId);
      const available = quant ? Math.max(0, quant.onHand - quant.reserved - quant.quarantineDamaged) : 0;
      if (available < line.quantity) {
        throw new DomainError('INSUFFICIENT_AVAILABLE_STOCK', {
          status: 400,
          messageKey: `Ton kho kha dung tai kho xuat khong du cho SKU ID ${line.skuId} (Can: ${line.quantity}, Kha dung: ${available})`,
          details: { skuId: line.skuId, required: line.quantity, available },
        });
      }
    }

    const createdMove = await prisma.$transaction(async (tx) => {
      const code = await generateNextTransferCode(tx);
      const idempotencyKey = `transfer-${code}-${Date.now()}`;

      const move = await tx.stockMove.create({
        data: {
          code,
          sourceBranchId: input.sourceBranchId,
          destinationBranchId: input.destinationBranchId,
          idempotencyKey,
          moveType: StockMoveType.INTERNAL_TRANSFER,
          status: StockMoveStatus.DRAFT,
          reason: input.reason?.trim() || null,
        },
      });

      for (const line of input.lines) {
        const quant = quantMap.get(line.skuId);
        const unitCost = quant ? quant.weightedAverageCost : new Decimal(0);

        await tx.stockMoveLine.create({
          data: {
            stockMoveId: move.id,
            skuId: line.skuId,
            quantity: line.quantity,
            unitCost,
          },
        });
      }

      return move;
    });

    return await this.getTransferById(createdMove.id);
  }

  async dispatchTransfer(
    id: string,
    input: DispatchTransferInput,
    adminUserId?: string,
  ): Promise<TransferDetailDto> {
    await prisma.$transaction(async (tx) => {
      const move = await tx.stockMove.findUnique({
        where: { id },
        include: {
          lines: {
            include: {
              sku: true,
            },
          },
        },
      });

      if (!move || move.moveType !== StockMoveType.INTERNAL_TRANSFER) {
        throw new DomainError('TRANSFER_NOT_FOUND', {
          status: 404,
          messageKey: 'Phieu dieu chuyen kho khong ton tai',
          details: { id },
        });
      }

      if (move.status !== StockMoveStatus.DRAFT) {
        throw new DomainError('TRANSFER_INVALID_STATUS_FOR_DISPATCH', {
          status: 400,
          messageKey: 'Chi co the xuat kho phieu dieu chuyen dang o trang thai yeu cau (DRAFT/REQUESTED)',
          details: { currentStatus: move.status },
        });
      }

      const sourceBranchId = move.sourceBranchId;
      if (!sourceBranchId) {
        throw new DomainError('SOURCE_BRANCH_MISSING', {
          status: 400,
          messageKey: 'Phieu dieu chuyen thieu thong tin kho xuat',
        });
      }

      const inputLinesMap = new Map<number, string[]>();
      for (const il of input.lines) {
        inputLinesMap.set(il.skuId, il.serialNumbers);
      }

      for (const line of move.lines) {
        const quant = await tx.stockQuant.findUnique({
          where: {
            branchId_skuId: {
              branchId: sourceBranchId,
              skuId: line.skuId,
            },
          },
        });

        if (!quant || quant.onHand - quant.reserved < line.quantity) {
          throw new DomainError('INSUFFICIENT_STOCK_FOR_DISPATCH', {
            status: 400,
            messageKey: `Ton kho thuc te tai kho xuat khong du de xuat SKU ${line.sku.sku}`,
            details: {
              skuId: line.skuId,
              required: line.quantity,
              onHand: quant?.onHand ?? 0,
              reserved: quant?.reserved ?? 0,
            },
          });
        }

        if (line.sku.serialRequired) {
          const providedSerials = inputLinesMap.get(line.skuId) ?? [];
          const cleanSerials = providedSerials
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          if (cleanSerials.length !== line.quantity) {
            throw new DomainError('SERIAL_COUNT_MISMATCH', {
              status: 400,
              messageKey: `So luong serial can xuat khong khop voi so luong linh kien cho SKU ${line.sku.sku} (Can: ${line.quantity}, Da chon: ${cleanSerials.length})`,
              details: { skuId: line.skuId, required: line.quantity, provided: cleanSerials.length },
            });
          }

          const serialSet = new Set<string>();
          for (const s of cleanSerials) {
            const upper = s.toUpperCase();
            if (serialSet.has(upper)) {
              throw new DomainError('DUPLICATE_SERIAL_IN_DISPATCH', {
                status: 400,
                messageKey: `Phat hien ma serial trung lap trong danh sach xuat kho: ${s}`,
                details: { serial: s },
              });
            }
            serialSet.add(upper);
          }

          for (const serialNum of cleanSerials) {
            const su = await tx.serialUnit.findUnique({
              where: { serialNumber: serialNum },
            });

            if (!su || su.skuId !== line.skuId) {
              throw new DomainError('SERIAL_NOT_FOUND_OR_SKU_MISMATCH', {
                status: 400,
                messageKey: `Serial ${serialNum} khong ton tai hoac khong dung loai SKU`,
                details: { serialNumber: serialNum, skuId: line.skuId },
              });
            }

            if (su.currentBranchId !== sourceBranchId || su.status !== SerialStatus.AVAILABLE) {
              throw new DomainError('SERIAL_NOT_AVAILABLE_FOR_DISPATCH', {
                status: 400,
                messageKey: `Serial ${serialNum} khong co san tai chi nhanh xuat (Trang thai: ${su.status}, Kho: ${su.currentBranchId})`,
                details: { serialNumber: serialNum, status: su.status, branchId: su.currentBranchId },
              });
            }

            await tx.serialUnit.update({
              where: { id: su.id },
              data: {
                status: SerialStatus.IN_TRANSIT,
                currentBranchId: null,
              },
            });

            await tx.serialMovement.upsert({
              where: {
                serialUnitId_stockMoveLineId: {
                  serialUnitId: su.id,
                  stockMoveLineId: line.id,
                },
              },
              create: {
                serialUnitId: su.id,
                stockMoveLineId: line.id,
                fromBranchId: sourceBranchId,
                toBranchId: move.destinationBranchId,
                resultingStatus: SerialStatus.IN_TRANSIT,
                occurredAt: new Date(),
              },
              update: {
                fromBranchId: sourceBranchId,
                toBranchId: move.destinationBranchId,
                resultingStatus: SerialStatus.IN_TRANSIT,
                occurredAt: new Date(),
              },
            });
          }
        }

        const onHandAfter = quant.onHand - line.quantity;
        await tx.stockQuant.update({
          where: { id: quant.id },
          data: {
            onHand: onHandAfter,
            version: { increment: 1 },
          },
        });

        await tx.stockLedgerEntry.create({
          data: {
            stockQuantId: quant.id,
            stockMoveLineId: line.id,
            entryType: StockLedgerEntryType.TRANSFER_OUT,
            deltaOnHand: -line.quantity,
            deltaReserved: 0,
            deltaQuarantine: 0,
            onHandAfter,
            reservedAfter: quant.reserved,
            quarantineAfter: quant.quarantineDamaged,
            actorType: ActorType.ADMIN,
            actorId: adminUserId ?? null,
            occurredAt: new Date(),
          },
        });
      }

      await tx.stockMove.update({
        where: { id: move.id },
        data: {
          status: StockMoveStatus.IN_TRANSIT,
          dispatchedAt: new Date(),
          dispatchedById: adminUserId ?? null,
        },
      });
    });

    return await this.getTransferById(id);
  }

  async receiveTransfer(
    id: string,
    input?: ReceiveTransferInput,
    adminUserId?: string,
  ): Promise<TransferDetailDto> {
    await prisma.$transaction(async (tx) => {
      const move = await tx.stockMove.findUnique({
        where: { id },
        include: {
          lines: {
            include: {
              sku: true,
              serialMovements: true,
            },
          },
        },
      });

      if (!move || move.moveType !== StockMoveType.INTERNAL_TRANSFER) {
        throw new DomainError('TRANSFER_NOT_FOUND', {
          status: 404,
          messageKey: 'Phieu dieu chuyen kho khong ton tai',
          details: { id },
        });
      }

      if (move.status !== StockMoveStatus.IN_TRANSIT) {
        throw new DomainError('TRANSFER_INVALID_STATUS_FOR_RECEIVE', {
          status: 400,
          messageKey: 'Chi co the xac nhan nhan hang cho phieu dang tren duong chuyen (IN_TRANSIT)',
          details: { currentStatus: move.status },
        });
      }

      const destBranchId = move.destinationBranchId;
      if (!destBranchId) {
        throw new DomainError('DESTINATION_BRANCH_MISSING', {
          status: 400,
          messageKey: 'Phieu dieu chuyen thieu thong tin chi nhanh nhan',
        });
      }

      for (const line of move.lines) {
        let destQuant = await tx.stockQuant.findUnique({
          where: {
            branchId_skuId: {
              branchId: destBranchId,
              skuId: line.skuId,
            },
          },
        });

        if (!destQuant) {
          destQuant = await tx.stockQuant.create({
            data: {
              branchId: destBranchId,
              skuId: line.skuId,
              onHand: 0,
              reserved: 0,
              quarantineDamaged: 0,
              weightedAverageCost: line.unitCost,
            },
          });
        }

        const currentOnHandDecimal = new Decimal(destQuant.onHand);
        const currentCostDecimal = destQuant.weightedAverageCost;
        const incomingQty = line.quantity;
        const incomingQtyDecimal = new Decimal(incomingQty);
        const incomingCostDecimal = line.unitCost;
        const newOnHand = destQuant.onHand + incomingQty;
        const newOnHandDecimal = new Decimal(newOnHand);

        const newWac = newOnHandDecimal.gt(0)
          ? currentOnHandDecimal
              .mul(currentCostDecimal)
              .add(incomingQtyDecimal.mul(incomingCostDecimal))
              .div(newOnHandDecimal)
              .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
          : incomingCostDecimal.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

        await tx.stockQuant.update({
          where: { id: destQuant.id },
          data: {
            onHand: newOnHand,
            weightedAverageCost: newWac,
            version: { increment: 1 },
          },
        });

        await tx.stockLedgerEntry.create({
          data: {
            stockQuantId: destQuant.id,
            stockMoveLineId: line.id,
            entryType: StockLedgerEntryType.TRANSFER_IN,
            deltaOnHand: incomingQty,
            deltaReserved: 0,
            deltaQuarantine: 0,
            onHandAfter: newOnHand,
            reservedAfter: destQuant.reserved,
            quarantineAfter: destQuant.quarantineDamaged,
            actorType: ActorType.ADMIN,
            actorId: adminUserId ?? null,
            occurredAt: new Date(),
          },
        });

        if (line.sku.serialRequired) {
          for (const mov of line.serialMovements) {
            await tx.serialUnit.update({
              where: { id: mov.serialUnitId },
              data: {
                status: SerialStatus.AVAILABLE,
                currentBranchId: destBranchId,
              },
            });

            await tx.serialMovement.upsert({
              where: {
                serialUnitId_stockMoveLineId: {
                  serialUnitId: mov.serialUnitId,
                  stockMoveLineId: line.id,
                },
              },
              create: {
                serialUnitId: mov.serialUnitId,
                stockMoveLineId: line.id,
                fromBranchId: move.sourceBranchId,
                toBranchId: destBranchId,
                resultingStatus: SerialStatus.AVAILABLE,
                occurredAt: new Date(),
              },
              update: {
                toBranchId: destBranchId,
                resultingStatus: SerialStatus.AVAILABLE,
                occurredAt: new Date(),
              },
            });
          }
        }
      }

      await tx.stockMove.update({
        where: { id: move.id },
        data: {
          status: StockMoveStatus.VALIDATED,
          validatedAt: new Date(),
          validatedById: adminUserId ?? null,
        },
      });
    });

    return await this.getTransferById(id);
  }

  async cancelTransfer(
    id: string,
    input: CancelTransferInput,
    _adminUserId?: string,
  ): Promise<TransferDetailDto> {
    const move = await prisma.stockMove.findUnique({
      where: { id },
    });

    if (!move || move.moveType !== StockMoveType.INTERNAL_TRANSFER) {
      throw new DomainError('TRANSFER_NOT_FOUND', {
        status: 404,
        messageKey: 'Phieu dieu chuyen kho khong ton tai',
        details: { id },
      });
    }

    if (move.status !== StockMoveStatus.DRAFT) {
      if (move.status === StockMoveStatus.IN_TRANSIT) {
        throw new DomainError('TRANSFER_CANNOT_BE_CANCELLED_IN_TRANSIT', {
          status: 400,
          messageKey: 'Khong the huy phieu dieu chuyen da xuat kho dang van chuyen (IN_TRANSIT)',
          details: { currentStatus: move.status },
        });
      }
      if (move.status === StockMoveStatus.VALIDATED) {
        throw new DomainError('TRANSFER_CANNOT_BE_CANCELLED_COMPLETED', {
          status: 400,
          messageKey: 'Khong the huy phieu dieu chuyen da hoan tat nhap kho',
          details: { currentStatus: move.status },
        });
      }
      if (move.status === StockMoveStatus.CANCELLED) {
        throw new DomainError('TRANSFER_ALREADY_CANCELLED', {
          status: 400,
          messageKey: 'Phieu dieu chuyen da bi huy truoc do',
          details: { currentStatus: move.status },
        });
      }
      throw new DomainError('TRANSFER_CANNOT_BE_CANCELLED', {
        status: 400,
        messageKey: 'Chi co the huy phieu dieu chuyen o trang thai khoi tao (REQUESTED/DRAFT)',
        details: { currentStatus: move.status },
      });
    }

    const cancelReason = input.reason.trim();
    const updatedReason = move.reason ? `${move.reason} - [HUY: ${cancelReason}]` : cancelReason;

    await prisma.stockMove.update({
      where: { id: move.id },
      data: {
        status: StockMoveStatus.CANCELLED,
        cancelledAt: new Date(),
        reason: updatedReason,
      },
    });

    return await this.getTransferById(id);
  }
}

export const adminTransferService = new AdminTransferService();
