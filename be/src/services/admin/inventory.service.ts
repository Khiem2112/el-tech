import { Prisma, StockLedgerEntryType } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
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
  weightedAverageCost: string;
  sellingPrice: string;
  serialRequired: boolean;
  version: number;
  updatedAt: Date;
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
      const available = Math.max(0, quant.onHand - quant.reserved - quant.quarantineDamaged);
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

    const available = Math.max(0, quant.onHand - quant.reserved - quant.quarantineDamaged);
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
}

export const adminInventoryService = new AdminInventoryService();
