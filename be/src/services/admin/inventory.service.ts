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
  QueryStockMovesInput,
} from '../../validations/admin/inventory.schema.js';

export type StockMoveSkuDto = {
  id: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  template: {
    id: number;
    name: string;
  };
};

export type StockMoveLineSerialUnitDto = {
  serialNumber: string;
  status: string;
};

export type StockMoveLineDto = {
  id: string;
  stockMoveId: string;
  skuId: number;
  quantity: number;
  unitCost: string;
  sku: StockMoveSkuDto;
  receivedSerialUnits: StockMoveLineSerialUnitDto[];
  serialMovements: StockMoveLineSerialUnitDto[];
  serials: string[];
};

export type StockMoveOrderDto = {
  id: string;
  code: string;
  receiverName: string;
  receiverPhone: string;
  status: string;
  createdAt: Date;
};

export type StockMovePurchaseOrderDto = {
  id: string;
  poNumber: string;
  code: string;
  supplier: {
    name: string;
  };
  status: string;
  createdAt: Date;
};

export type StockMoveItemDto = {
  id: string;
  code: string;
  orderId: string | null;
  purchaseOrderId: string | null;
  moveType: StockMoveType;
  status: StockMoveStatus;
  reason: string | null;
  reservedAt: Date | null;
  validatedAt: Date | null;
  cancelledAt: Date | null;
  dispatchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  order: StockMoveOrderDto | null;
  purchaseOrder: StockMovePurchaseOrderDto | null;
  lines: StockMoveLineDto[];
  totalQuantity: number;
  totalLines: number;
};

export type StockMovesResult = {
  items: StockMoveItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};


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
        
        { sku: { sku: 'asc' } },
      ],
    });

    let mappedItems: InventoryBalanceItemDto[] = quants.map((quant) => {
      const available = quant.onHand - quant.reserved - quant.quarantineDamaged;
      const hasInvariantBreach = available < 0;
      return {
        id: quant.id,
        branchId: 1,
        branchCode: 'STORE-MAIN',
        branchName: 'Showroom EL-TECH',
        branchAddress: '280 Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh',
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
      branchId: 1,
      branchCode: 'STORE-MAIN',
      branchName: 'Showroom EL-TECH',
      branchAddress: '280 Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh',
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
        branchId: 1,
        branchCode: 'STORE-MAIN',
        branchName: 'Showroom EL-TECH',
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
        sourceBranchName: null,
        destinationBranchName: null,
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
        branchId: 1,
        branchCode: 'STORE-MAIN',
        branchName: 'Showroom EL-TECH',
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
        sourceBranchName: null,
        destinationBranchName: null,
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
        skuId: input.skuId,
      },
      include: {
        sku: true,
      },
    });

    if (!quant) {
      throw new DomainError('STOCK_QUANT_NOT_FOUND', {
        messageKey: 'Khong tim thay so du ton kho cua san pham',
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
          OR: [
            { id: { in: input.serialIds } },
            { serialNumber: { in: input.serialIds } },
          ],
        },
        select: { id: true, serialNumber: true, status: true },
      });

      if (serialUnitsToQuarantine.length !== input.quantity) {
        throw new DomainError('INVALID_SERIAL_COUNT', {
          messageKey: 'Danh sach so se-ri khong khop voi so luong yeu cau',
          status: 400,
        });
      }

      const invalidUnit = serialUnitsToQuarantine.find(
        (u) => u.status !== SerialStatus.AVAILABLE,
      );
      if (invalidUnit) {
        throw new DomainError('SERIAL_NOT_AVAILABLE', {
          messageKey: `So se-ri ${invalidUnit.serialNumber} khong o trang thai kha dung de cach ly (trang thai: ${invalidUnit.status})`,
          status: 400,
          details: {
            serialNumber: invalidUnit.serialNumber,
            currentStatus: invalidUnit.status,
          },
        });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const moveCode = `MOV-QUARANTINE-${Date.now().toString(36).toUpperCase()}`;

      const stockMove = await tx.stockMove.create({
        data: {
          code: moveCode,
          idempotencyKey: `move:quarantine:${quant.id}:${Date.now()}:${Math.floor(Math.random() * 10000)}`,
          moveType: StockMoveType.ORDER_ISSUE,
          status: StockMoveStatus.VALIDATED,
          reason: input.reason,
          validatedAt: new Date(),
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

      const updatedQuant = await tx.stockQuant.update({
        where: { id: quant.id },
        data: {
          quarantineDamaged: {
            increment: input.quantity,
          },
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
          occurredAt: now,
        },
      });

      if (quant.sku.serialRequired && serialUnitsToQuarantine.length > 0) {
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
              resultingStatus: SerialStatus.QUARANTINED,
              occurredAt: new Date(),
            },
          });
        }
      }

      const availableAfter =
        updatedQuant.onHand - updatedQuant.reserved - updatedQuant.quarantineDamaged;

      return {
        success: true,
        stockQuantId: quant.id,
        stockMoveId: stockMove.id,
        stockMoveCode: stockMove.code,
        skuId: input.skuId,
        branchId: 1,
        quarantinedQuantity: input.quantity,
        quarantineDamagedAfter: updatedQuant.quarantineDamaged,
        availableAfter,
        message: `Da cach ly thanh cong ${input.quantity} san pham vao kho hong loi.`,
      };
    });

    return result;
  }

  async getStockMoves(input: QueryStockMovesInput): Promise<StockMovesResult> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMoveWhereInput = {};

    if (input.moveType && input.moveType !== 'ALL') {
      where.moveType = input.moveType as StockMoveType;
    }

    if (input.status && input.status !== 'ALL') {
      where.status = input.status as StockMoveStatus;
    }

    if (input.search && input.search.trim().length > 0) {
      const search = input.search.trim();
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
        { order: { code: { contains: search, mode: 'insensitive' } } },
        { purchaseOrder: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, moves] = await Promise.all([
      prisma.stockMove.count({ where }),
      prisma.stockMove.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              code: true,
              receiverName: true,
              receiverPhone: true,
              status: true,
              createdAt: true,
            },
          },
          purchaseOrder: {
            select: {
              id: true,
              code: true,
              supplier: {
                select: {
                  name: true,
                },
              },
              status: true,
              createdAt: true,
            },
          },
          lines: {
            include: {
              sku: {
                select: {
                  id: true,
                  sku: true,
                  barcode: true,
                  variationLabel: true,
                  productTemplate: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              receivedSerialUnits: {
                select: {
                  serialNumber: true,
                  status: true,
                },
              },
              serialMovements: {
                include: {
                  serialUnit: {
                    select: {
                      serialNumber: true,
                      status: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const items: StockMoveItemDto[] = moves.map((move) => {
      const lines: StockMoveLineDto[] = move.lines.map((line) => {
        const receivedSerials: StockMoveLineSerialUnitDto[] = line.receivedSerialUnits.map((u) => ({
          serialNumber: u.serialNumber,
          status: u.status,
        }));

        const serialMovements: StockMoveLineSerialUnitDto[] = line.serialMovements.map((m) => ({
          serialNumber: m.serialUnit.serialNumber,
          status: m.serialUnit.status,
        }));

        const allSerials = Array.from(
          new Set([
            ...receivedSerials.map((s) => s.serialNumber),
            ...serialMovements.map((s) => s.serialNumber),
          ]),
        );

        return {
          id: line.id,
          stockMoveId: line.stockMoveId,
          skuId: line.skuId,
          quantity: line.quantity,
          unitCost: line.unitCost.toString(),
          sku: {
            id: line.sku.id,
            sku: line.sku.sku,
            barcode: line.sku.barcode,
            variationLabel: line.sku.variationLabel,
            template: {
              id: line.sku.productTemplate.id,
              name: line.sku.productTemplate.name,
            },
          },
          receivedSerialUnits: receivedSerials,
          serialMovements,
          serials: allSerials,
        };
      });

      const totalQuantity = lines.reduce((acc, line) => acc + line.quantity, 0);

      const orderDto: StockMoveOrderDto | null = move.order
        ? {
            id: move.order.id,
            code: move.order.code,
            receiverName: move.order.receiverName,
            receiverPhone: move.order.receiverPhone,
            status: move.order.status,
            createdAt: move.order.createdAt,
          }
        : null;

      const purchaseOrderDto: StockMovePurchaseOrderDto | null = move.purchaseOrder
        ? {
            id: move.purchaseOrder.id,
            poNumber: move.purchaseOrder.code,
            code: move.purchaseOrder.code,
            supplier: {
              name: move.purchaseOrder.supplier.name,
            },
            status: move.purchaseOrder.status,
            createdAt: move.purchaseOrder.createdAt,
          }
        : null;

      return {
        id: move.id,
        code: move.code,
        orderId: move.orderId,
        purchaseOrderId: move.purchaseOrderId,
        moveType: move.moveType,
        status: move.status,
        reason: move.reason,
        reservedAt: move.reservedAt,
        validatedAt: move.validatedAt,
        cancelledAt: move.cancelledAt,
        dispatchedAt: move.dispatchedAt,
        createdAt: move.createdAt,
        updatedAt: move.updatedAt,
        order: orderDto,
        purchaseOrder: purchaseOrderDto,
        lines,
        totalQuantity,
        totalLines: lines.length,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const adminInventoryService = new AdminInventoryService();
