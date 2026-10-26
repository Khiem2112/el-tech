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
  QuarantineStockInput,
  QueryInventoryBalancesInput,
  QueryStockLedgerInput,
} from '../../validations/admin/inventory.schema.js';

export type InventoryBalanceItemDto = {
  id: string;
  branchId: number;
  branchCode: string;
  branchName: string;
  branchAddress: string;
  skuId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  productTemplateId: number;
  productName: string;
  productSlug: string;
  categoryId: number;
  categoryName: string;
  brandName: string;
  onHand: number;
  reserved: number;
  quarantineDamaged: number;
  available: number;
  hasInvariantBreach: boolean;
  weightedAverageCost: string;
  sellingPrice: string;
  serialRequired: boolean;
  version: number;
  updatedAt: Date;
};

export type QuarantineStockResult = {
  success: boolean;
  stockQuantId: string;
  stockMoveId: string;
  stockMoveCode: string;
  skuId: number;
  branchId: number;
  quarantinedQuantity: number;
  quarantineDamagedAfter: number;
  availableAfter: number;
  message: string;
};

export type InventoryBalancesSummaryDto = {
  totalQuants: number;
  totalOnHand: number;
  totalReserved: number;
  totalQuarantine: number;
  totalAvailable: number;
  totalInventoryValue: string;
};

export type InventoryBalancesResult = {
  items: InventoryBalanceItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: InventoryBalancesSummaryDto;
};

export type StockLedgerEntryItemDto = {
  id: string;
  stockQuantId: string;
  branchId: number;
  branchCode: string;
  branchName: string;
  skuId: number;
  sku: string;
  productName: string;
  variationLabel: string | null;
  entryType: StockLedgerEntryType;
  deltaOnHand: number;
  deltaReserved: number;
  deltaQuarantine: number;
  onHandAfter: number;
  reservedAfter: number;
  quarantineAfter: number;
  actorType: string;
  actorId: string | null;
  occurredAt: Date;
  documentCode: string;
  moveCode: string;
  moveType: string;
  reason: string | null;
  sourceBranchName: string | null;
  destinationBranchName: string | null;
};

export type StockLedgerListResult = {
  items: StockLedgerEntryItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StockQuantLedgerDetailResult = {
  quant: InventoryBalanceItemDto;
  entries: StockLedgerEntryItemDto[];
};

export class AdminInventoryService {
  async getBalances(query: QueryInventoryBalancesInput): Promise<InventoryBalancesResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const search = query.search?.trim();

    const where: Prisma.StockQuantWhereInput = {
      isActive: true,
    };

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.categoryId) {
      where.sku = {
        productTemplate: {
          categoryId: query.categoryId,
        },
      };
    }

    if (search) {
      where.OR = [
        {
          sku: {
            sku: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          sku: {
            barcode: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          sku: {
            variationLabel: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          sku: {
            productTemplate: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    const quants = await prisma.stockQuant.findMany({
      where,
      include: {
        branch: true,
        sku: {
          include: {
            productTemplate: {
              include: {
                category: true,
                brand: true,
              },
            },
          },
        },
      },
      orderBy: [
        { branch: { deliveryPriority: 'asc' } },
        { sku: { sku: 'asc' } },
      ],
    });

    let mappedItems: InventoryBalanceItemDto[] = quants.map((quant) => {
      const available = quant.onHand - quant.reserved - quant.quarantineDamaged;
      const hasInvariantBreach = available < 0;
      return {
        id: quant.id,
        branchId: quant.branchId,
        branchCode: quant.branch.code,
        branchName: quant.branch.name,
        branchAddress: quant.branch.address,
        skuId: quant.skuId,
        sku: quant.sku.sku,
        barcode: quant.sku.barcode,
        variationLabel: quant.sku.variationLabel,
        productTemplateId: quant.sku.productTemplateId,
        productName: quant.sku.productTemplate.name,
        productSlug: quant.sku.productTemplate.slug,
        categoryId: quant.sku.productTemplate.categoryId,
        categoryName: quant.sku.productTemplate.category.name,
        brandName: quant.sku.productTemplate.brand.name,
        onHand: quant.onHand,
        reserved: quant.reserved,
        quarantineDamaged: quant.quarantineDamaged,
        available,
        hasInvariantBreach,
        weightedAverageCost: quant.weightedAverageCost.toFixed(0),
        sellingPrice: quant.sku.sellingPrice.toFixed(0),
        serialRequired: quant.sku.serialRequired,
        version: quant.version,
        updatedAt: quant.updatedAt,
      };
    });

    if (query.stockStatus && query.stockStatus !== 'ALL') {
      if (query.stockStatus === 'IN_STOCK') {
        mappedItems = mappedItems.filter((item) => item.available > 5);
      } else if (query.stockStatus === 'LOW_STOCK') {
        mappedItems = mappedItems.filter((item) => item.available >= 1 && item.available <= 5);
      } else if (query.stockStatus === 'OUT_OF_STOCK') {
        mappedItems = mappedItems.filter((item) => item.available <= 0);
      }
    }

    let totalOnHand = 0;
    let totalReserved = 0;
    let totalQuarantine = 0;
    let totalAvailable = 0;
    let totalInventoryValueNumber = 0;

    for (const item of mappedItems) {
      totalOnHand += item.onHand;
      totalReserved += item.reserved;
      totalQuarantine += item.quarantineDamaged;
      totalAvailable += item.available;
      const wac = Number(item.weightedAverageCost) || 0;
      totalInventoryValueNumber += item.onHand * wac;
    }

    const totalCount = mappedItems.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = mappedItems.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total: totalCount,
      page,
      limit,
      totalPages,
      summary: {
        totalQuants: totalCount,
        totalOnHand,
        totalReserved,
        totalQuarantine,
        totalAvailable,
        totalInventoryValue: totalInventoryValueNumber.toLocaleString('vi-VN'),
      },
    };
  }

  async getQuantLedger(stockQuantId: string): Promise<StockQuantLedgerDetailResult> {
    const quant = await prisma.stockQuant.findUnique({
      where: { id: stockQuantId },
      include: {
        branch: true,
        sku: {
          include: {
            productTemplate: {
              include: {
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!quant) {
      throw new DomainError('STOCK_QUANT_NOT_FOUND', {
        status: 404,
        messageKey: 'So du ton kho khong ton tai',
        details: { stockQuantId },
      });
    }

    const available = quant.onHand - quant.reserved - quant.quarantineDamaged;
    const quantDto: InventoryBalanceItemDto = {
      id: quant.id,
      branchId: quant.branchId,
      branchCode: quant.branch.code,
      branchName: quant.branch.name,
      branchAddress: quant.branch.address,
      skuId: quant.skuId,
      sku: quant.sku.sku,
      barcode: quant.sku.barcode,
      variationLabel: quant.sku.variationLabel,
      productTemplateId: quant.sku.productTemplateId,
      productName: quant.sku.productTemplate.name,
      productSlug: quant.sku.productTemplate.slug,
      categoryId: quant.sku.productTemplate.categoryId,
      categoryName: quant.sku.productTemplate.category.name,
      brandName: quant.sku.productTemplate.brand.name,
      onHand: quant.onHand,
      reserved: quant.reserved,
      quarantineDamaged: quant.quarantineDamaged,
      available,
      hasInvariantBreach: available < 0,
      weightedAverageCost: quant.weightedAverageCost.toFixed(0),
      sellingPrice: quant.sku.sellingPrice.toFixed(0),
      serialRequired: quant.sku.serialRequired,
      version: quant.version,
      updatedAt: quant.updatedAt,
    };

    const entries = await prisma.stockLedgerEntry.findMany({
      where: { stockQuantId },
      include: {
        stockMoveLine: {
          include: {
            stockMove: {
              include: {
                order: true,
                purchaseOrder: true,
                sourceBranch: true,
                destinationBranch: true,
              },
            },
          },
        },
      },
      orderBy: { occurredAt: 'desc' },
      take: 50,
    });

    const mappedEntries: StockLedgerEntryItemDto[] = entries.map((entry) => {
      const stockMove = entry.stockMoveLine.stockMove;
      const documentCode =
        stockMove.purchaseOrder?.code ?? stockMove.order?.code ?? stockMove.code;

      return {
        id: entry.id,
        stockQuantId: entry.stockQuantId,
        branchId: quant.branchId,
        branchCode: quant.branch.code,
        branchName: quant.branch.name,
        skuId: quant.skuId,
        sku: quant.sku.sku,
        productName: quant.sku.productTemplate.name,
        variationLabel: quant.sku.variationLabel,
        entryType: entry.entryType,
        deltaOnHand: entry.deltaOnHand,
        deltaReserved: entry.deltaReserved,
        deltaQuarantine: entry.deltaQuarantine,
        onHandAfter: entry.onHandAfter,
        reservedAfter: entry.reservedAfter,
        quarantineAfter: entry.quarantineAfter,
        actorType: entry.actorType,
        actorId: entry.actorId,
        occurredAt: entry.occurredAt,
        documentCode,
        moveCode: stockMove.code,
        moveType: stockMove.moveType,
        reason: stockMove.reason,
        sourceBranchName: stockMove.sourceBranch?.name ?? null,
        destinationBranchName: stockMove.destinationBranch?.name ?? null,
      };
    });

    return {
      quant: quantDto,
      entries: mappedEntries,
    };
  }

  async getLedgerEntries(query: QueryStockLedgerInput): Promise<StockLedgerListResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const search = query.search?.trim();

    const where: Prisma.StockLedgerEntryWhereInput = {};

    if (query.branchId || query.skuId) {
      where.stockQuant = {};
      if (query.branchId) {
        where.stockQuant.branchId = query.branchId;
      }
      if (query.skuId) {
        where.stockQuant.skuId = query.skuId;
      }
    }

    if (query.entryType) {
      where.entryType = query.entryType as StockLedgerEntryType;
    }

    if (query.startDate || query.endDate) {
      where.occurredAt = {};
      if (query.startDate) {
        where.occurredAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.occurredAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        {
          stockQuant: {
            sku: {
              sku: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          stockQuant: {
            sku: {
              productTemplate: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        {
          stockMoveLine: {
            stockMove: {
              code: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          stockMoveLine: {
            stockMove: {
              order: {
                code: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        {
          stockMoveLine: {
            stockMove: {
              purchaseOrder: {
                code: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      ];
    }

    const [total, entries] = await Promise.all([
      prisma.stockLedgerEntry.count({ where }),
      prisma.stockLedgerEntry.findMany({
        where,
        include: {
          stockQuant: {
            include: {
              branch: true,
              sku: {
                include: {
                  productTemplate: true,
                },
              },
            },
          },
          stockMoveLine: {
            include: {
              stockMove: {
                include: {
                  order: true,
                  purchaseOrder: true,
                  sourceBranch: true,
                  destinationBranch: true,
                },
              },
            },
          },
        },
        orderBy: { occurredAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const items: StockLedgerEntryItemDto[] = entries.map((entry) => {
      const stockMove = entry.stockMoveLine.stockMove;
      const documentCode =
        stockMove.purchaseOrder?.code ?? stockMove.order?.code ?? stockMove.code;

      return {
        id: entry.id,
        stockQuantId: entry.stockQuantId,
        branchId: entry.stockQuant.branchId,
        branchCode: entry.stockQuant.branch.code,
        branchName: entry.stockQuant.branch.name,
        skuId: entry.stockQuant.skuId,
        sku: entry.stockQuant.sku.sku,
        productName: entry.stockQuant.sku.productTemplate.name,
        variationLabel: entry.stockQuant.sku.variationLabel,
        entryType: entry.entryType,
        deltaOnHand: entry.deltaOnHand,
        deltaReserved: entry.deltaReserved,
        deltaQuarantine: entry.deltaQuarantine,
        onHandAfter: entry.onHandAfter,
        reservedAfter: entry.reservedAfter,
        quarantineAfter: entry.quarantineAfter,
        actorType: entry.actorType,
        actorId: entry.actorId,
        occurredAt: entry.occurredAt,
        documentCode,
        moveCode: stockMove.code,
        moveType: stockMove.moveType,
        reason: stockMove.reason,
        sourceBranchName: stockMove.sourceBranch?.name ?? null,
        destinationBranchName: stockMove.destinationBranch?.name ?? null,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async quarantineStock(
    input: QuarantineStockInput,
    adminUserId?: string,
  ): Promise<QuarantineStockResult> {
    const quant = await prisma.stockQuant.findUnique({
      where: {
        branchId_skuId: {
          branchId: input.branchId,
          skuId: input.skuId,
        },
      },
      include: {
        sku: true,
      },
    });

    if (!quant) {
      throw new DomainError('STOCK_QUANT_NOT_FOUND', {
        messageKey: 'Khong tim thay so du ton kho cua san pham tai chi nhanh nay',
        status: 404,
      });
    }

    const available = quant.onHand - quant.reserved - quant.quarantineDamaged;
    if (available < input.quantity) {
      throw new DomainError('INSUFFICIENT_AVAILABLE_STOCK', {
        messageKey: `So luong ton kha dung khong du de cach ly (kha dung: ${available}, yeu cau: ${input.quantity})`,
        status: 400,
        details: {
          available,
          requested: input.quantity,
        },
      });
    }

    let serialUnitsToQuarantine: { id: string; serialNumber: string; status: SerialStatus }[] = [];
    if (quant.sku.serialRequired) {
      if (!input.serialIds || input.serialIds.length !== input.quantity) {
        throw new DomainError('SERIAL_REQUIRED', {
          messageKey: `SKU yeu cau quan ly so se-ri. Can cung cap chinh xac ${input.quantity} so se-ri.`,
          status: 400,
        });
      }

      serialUnitsToQuarantine = await prisma.serialUnit.findMany({
        where: {
          skuId: input.skuId,
          currentBranchId: input.branchId,
          OR: [
            { id: { in: input.serialIds } },
            { serialNumber: { in: input.serialIds } },
          ],
        },
        select: { id: true, serialNumber: true, status: true },
      });

      if (serialUnitsToQuarantine.length !== input.quantity) {
        throw new DomainError('INVALID_SERIAL_COUNT', {
          messageKey: 'Danh sach so se-ri khong khop voi so luong yeu cau hoac khong thuoc chi nhanh nay',
          status: 400,
        });
      }

      const notAvailable = serialUnitsToQuarantine.filter(
        (u) => u.status !== SerialStatus.AVAILABLE,
      );
      if (notAvailable.length > 0) {
        throw new DomainError('SERIAL_NOT_AVAILABLE', {
          messageKey: `Cac so se-ri sau khong o trang thai kha dung: ${notAvailable.map((s) => s.serialNumber).join(', ')}`,
          status: 400,
        });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedQuant = await tx.stockQuant.update({
        where: { id: quant.id },
        data: {
          quarantineDamaged: { increment: input.quantity },
          version: { increment: 1 },
        },
      });

      const moveCode = `MOVE-QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const stockMove = await tx.stockMove.create({
        data: {
          code: moveCode,
          idempotencyKey: `move:quarantine:${quant.id}:${Date.now()}:${Math.floor(Math.random() * 10000)}`,
          sourceBranchId: input.branchId,
          moveType: StockMoveType.INTERNAL_CORRECTION,
          status: StockMoveStatus.VALIDATED,
          reason: input.reason,
          validatedAt: new Date(),
          validatedById: adminUserId ?? null,
        },
      });

      const stockMoveLine = await tx.stockMoveLine.create({
        data: {
          stockMoveId: stockMove.id,
          skuId: input.skuId,
          quantity: input.quantity,
          unitCost: quant.weightedAverageCost,
        },
      });

      await tx.stockLedgerEntry.create({
        data: {
          stockQuantId: quant.id,
          stockMoveLineId: stockMoveLine.id,
          entryType: StockLedgerEntryType.QUARANTINE,
          deltaOnHand: 0,
          deltaReserved: 0,
          deltaQuarantine: input.quantity,
          onHandAfter: updatedQuant.onHand,
          reservedAfter: updatedQuant.reserved,
          quarantineAfter: updatedQuant.quarantineDamaged,
          actorType: ActorType.ADMIN,
          actorId: adminUserId ?? null,
          occurredAt: new Date(),
        },
      });

      for (const unit of serialUnitsToQuarantine) {
        await tx.serialUnit.update({
          where: { id: unit.id },
          data: {
            status: SerialStatus.QUARANTINED,
          },
        });

        await tx.serialMovement.create({
          data: {
            serialUnitId: unit.id,
            stockMoveLineId: stockMoveLine.id,
            fromBranchId: input.branchId,
            toBranchId: input.branchId,
            resultingStatus: SerialStatus.QUARANTINED,
            occurredAt: new Date(),
          },
        });
      }

      const availableAfter =
        updatedQuant.onHand - updatedQuant.reserved - updatedQuant.quarantineDamaged;

      return {
        success: true,
        stockQuantId: quant.id,
        stockMoveId: stockMove.id,
        stockMoveCode: stockMove.code,
        skuId: input.skuId,
        branchId: input.branchId,
        quarantinedQuantity: input.quantity,
        quarantineDamagedAfter: updatedQuant.quarantineDamaged,
        availableAfter,
        message: `Da cach ly thanh cong ${input.quantity} san pham vao kho hong loi.`,
      };
    });

    return result;
  }
}

export const adminInventoryService = new AdminInventoryService();
