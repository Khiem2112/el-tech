import { Prisma, SerialStatus } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import { adminInventoryService } from './inventory.service.js';
import {
  QuerySerialsInput,
  UpdateSerialStatusInput,
} from '../../validations/admin/serial.schema.js';

export type SerialListItem = {
  id: string;
  serialNumber: string;
  status: SerialStatus;
  skuId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  productTemplateId: number;
  productName: string;
  productSlug: string;
  categoryName: string;
  brandName: string;
  currentBranchId: number | null;
  currentBranchName: string | null;
  currentBranchCode: string | null;
  sellingPrice: string;
  createdAt: string;
  updatedAt: string;
};

export type SerialsSummary = {
  totalSerials: number;
  availableCount: number;
  reservedCount: number;
  inTransitCount: number;
  issuedCount: number;
  quarantinedCount: number;
  returnedToSupplierCount: number;
};

export type SerialsListResponse = {
  items: SerialListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: SerialsSummary;
};

export type SerialMovementDetail = {
  id: string;
  occurredAt: string;
  resultingStatus: SerialStatus;
  fromBranchId: number | null;
  fromBranchName: string | null;
  fromBranchCode: string | null;
  toBranchId: number | null;
  toBranchName: string | null;
  toBranchCode: string | null;
  stockMoveId: string;
  stockMoveCode: string;
  moveType: string;
  reason: string | null;
  orderId: string | null;
  orderCode: string | null;
  purchaseOrderId: string | null;
  purchaseOrderCode: string | null;
  supplierName: string | null;
  actorId: string | null;
  actorName: string | null;
  summaryText: string;
};

export type SerialWarrantyInfo = {
  durationMonths: number;
  serviceProvider: string;
  startDate: string | null;
  endDate: string | null;
  isExpired: boolean;
  warrantyClaimCount: number;
};

export type SerialDetailResponse = {
  id: string;
  serialNumber: string;
  status: SerialStatus;
  skuId: number;
  sku: string;
  barcode: string | null;
  variationLabel: string | null;
  sellingPrice: string;
  productTemplate: {
    id: number;
    name: string;
    slug: string;
    model: string;
    brandName: string;
    categoryName: string;
    media: unknown;
  };
  currentBranch: {
    id: number;
    code: string;
    name: string;
    address: string;
  } | null;
  origin: {
    stockMoveId: string;
    stockMoveCode: string;
    purchaseOrderId: string | null;
    purchaseOrderCode: string | null;
    supplierName: string | null;
    receivedAt: string | null;
  } | null;
  warranty: SerialWarrantyInfo;
  movements: SerialMovementDetail[];
  createdAt: string;
  updatedAt: string;
};

export class AdminSerialService {
  async getSerials(query: QuerySerialsInput): Promise<SerialsListResponse> {
    const { search, status, branchId, skuId, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SerialUnitWhereInput = {
      isActive: true,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (branchId) {
      where.currentBranchId = branchId;
    }

    if (skuId) {
      where.skuId = skuId;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { serialNumber: { contains: term, mode: 'insensitive' } },
        { sku: { sku: { contains: term, mode: 'insensitive' } } },
        { sku: { barcode: { contains: term, mode: 'insensitive' } } },
        { sku: { productTemplate: { name: { contains: term, mode: 'insensitive' } } } },
      ];
    }

    const [total, rawUnits, statusCounts] = await Promise.all([
      prisma.serialUnit.count({ where }),
      prisma.serialUnit.findMany({
        where,
        include: {
          sku: {
            include: {
              productTemplate: {
                include: {
                  brand: true,
                  category: true,
                },
              },
            },
          },
          currentBranch: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.serialUnit.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
        where: { isActive: true },
      }),
    ]);

    const summary: SerialsSummary = {
      totalSerials: 0,
      availableCount: 0,
      reservedCount: 0,
      inTransitCount: 0,
      issuedCount: 0,
      quarantinedCount: 0,
      returnedToSupplierCount: 0,
    };

    for (const group of statusCounts) {
      const count = group._count.status;
      summary.totalSerials += count;
      switch (group.status) {
        case SerialStatus.AVAILABLE:
          summary.availableCount = count;
          break;
        case SerialStatus.RESERVED:
          summary.reservedCount = count;
          break;
        case SerialStatus.IN_TRANSIT:
          summary.inTransitCount = count;
          break;
        case SerialStatus.ISSUED:
          summary.issuedCount = count;
          break;
        case SerialStatus.QUARANTINED:
          summary.quarantinedCount = count;
          break;
        case SerialStatus.RETURNED_TO_SUPPLIER:
          summary.returnedToSupplierCount = count;
          break;
      }
    }

    const items: SerialListItem[] = rawUnits.map((unit) => ({
      id: unit.id,
      serialNumber: unit.serialNumber,
      status: unit.status,
      skuId: unit.skuId,
      sku: unit.sku.sku,
      barcode: unit.sku.barcode,
      variationLabel: unit.sku.variationLabel,
      productTemplateId: unit.sku.productTemplate.id,
      productName: unit.sku.productTemplate.name,
      productSlug: unit.sku.productTemplate.slug,
      categoryName: unit.sku.productTemplate.category.name,
      brandName: unit.sku.productTemplate.brand.name,
      currentBranchId: unit.currentBranchId,
      currentBranchName: unit.currentBranch?.name ?? null,
      currentBranchCode: unit.currentBranch?.code ?? null,
      sellingPrice: unit.sku.sellingPrice.toString(),
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      summary,
    };
  }

  async getSerialDetail(identifier: string): Promise<SerialDetailResponse> {
    const trimmed = identifier.trim();
    if (!trimmed) {
      throw new DomainError('SERIAL_IDENTIFIER_REQUIRED', {
        messageKey: 'Ma dinh danh serial la bat buoc',
        status: 400,
      });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

    const unit = await prisma.serialUnit.findFirst({
      where: isUuid
        ? { id: trimmed }
        : { serialNumber: { equals: trimmed, mode: 'insensitive' } },
      include: {
        sku: {
          include: {
            productTemplate: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
        currentBranch: true,
        originStockMoveLine: {
          include: {
            stockMove: {
              include: {
                purchaseOrder: {
                  include: {
                    supplier: true,
                  },
                },
              },
            },
          },
        },
        movements: {
          orderBy: { occurredAt: 'asc' },
          include: {
            stockMoveLine: {
              include: {
                stockMove: {
                  include: {
                    sourceBranch: true,
                    destinationBranch: true,
                    order: true,
                    purchaseOrder: {
                      include: {
                        supplier: true,
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

    if (!unit) {
      throw new DomainError('SERIAL_NOT_FOUND', {
        messageKey: `Khong tim thay so serial '${trimmed}' trong he thong`,
        status: 404,
      });
    }

    const branchIds = new Set<number>();
    const userIds = new Set<string>();

    for (const mov of unit.movements) {
      if (mov.fromBranchId) {
        branchIds.add(mov.fromBranchId);
      }
      if (mov.toBranchId) {
        branchIds.add(mov.toBranchId);
      }
      const sm = mov.stockMoveLine.stockMove;
      if (sm.validatedById) {
        userIds.add(sm.validatedById);
      }
      if (sm.dispatchedById) {
        userIds.add(sm.dispatchedById);
      }
    }

    const [branches, users] = await Promise.all([
      branchIds.size > 0
        ? prisma.branch.findMany({
            where: { id: { in: Array.from(branchIds) } },
            select: { id: true, code: true, name: true },
          })
        : [],
      userIds.size > 0
        ? prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: { id: true, name: true, email: true },
          })
        : [],
    ]);

    const branchMap = new Map<number, { id: number; code: string; name: string }>();
    for (const b of branches) {
      branchMap.set(b.id, b);
    }

    const userMap = new Map<string, { id: string; name: string; email: string }>();
    for (const u of users) {
      userMap.set(u.id, u);
    }

    const movementDetails: SerialMovementDetail[] = unit.movements.map((mov) => {
      const sm = mov.stockMoveLine.stockMove;
      const fromBranch = mov.fromBranchId ? branchMap.get(mov.fromBranchId) ?? null : sm.sourceBranch;
      const toBranch = mov.toBranchId ? branchMap.get(mov.toBranchId) ?? null : sm.destinationBranch;

      const actorId = sm.validatedById ?? sm.dispatchedById ?? null;
      const actor = actorId ? userMap.get(actorId) ?? null : null;

      let summaryText = `Dieu chuyen kho (Lenh: ${sm.code})`;
      if (sm.purchaseOrder) {
        summaryText = `Nhap kho tu don mua PO: ${sm.purchaseOrder.code} (${sm.purchaseOrder.supplier.name})`;
      } else if (sm.order) {
        summaryText = `Xuat ban cho don hang: ${sm.order.code}`;
      } else if (fromBranch && toBranch) {
        summaryText = `Dieu chuyen tu ${fromBranch.name} sang ${toBranch.name}`;
      }

      return {
        id: mov.id,
        occurredAt: mov.occurredAt.toISOString(),
        resultingStatus: mov.resultingStatus,
        fromBranchId: mov.fromBranchId ?? (fromBranch?.id ?? null),
        fromBranchName: fromBranch?.name ?? null,
        fromBranchCode: fromBranch?.code ?? null,
        toBranchId: mov.toBranchId ?? (toBranch?.id ?? null),
        toBranchName: toBranch?.name ?? null,
        toBranchCode: toBranch?.code ?? null,
        stockMoveId: sm.id,
        stockMoveCode: sm.code,
        moveType: sm.moveType,
        reason: sm.reason,
        orderId: sm.orderId,
        orderCode: sm.order?.code ?? null,
        purchaseOrderId: sm.purchaseOrderId,
        purchaseOrderCode: sm.purchaseOrder?.code ?? null,
        supplierName: sm.purchaseOrder?.supplier?.name ?? null,
        actorId,
        actorName: actor?.name ?? (actor?.email ?? null),
        summaryText,
      };
    });

    const originStockMove = unit.originStockMoveLine.stockMove;
    const originPurchaseOrder = originStockMove.purchaseOrder;

    const durationMonths = 36;
    const firstOccurredDate = unit.movements[0]?.occurredAt ?? unit.createdAt;
    const startDate = firstOccurredDate.toISOString();
    const expiryDate = new Date(firstOccurredDate);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    const endDate = expiryDate.toISOString();
    const isExpired = new Date() > expiryDate;

    const warrantyClaimCount = unit.movements.filter(
      (m) =>
        m.resultingStatus === SerialStatus.QUARANTINED ||
        m.resultingStatus === SerialStatus.RETURNED_TO_SUPPLIER,
    ).length;

    const warranty: SerialWarrantyInfo = {
      durationMonths,
      serviceProvider: `${unit.sku.productTemplate.brand.name} Service VN`,
      startDate,
      endDate,
      isExpired,
      warrantyClaimCount,
    };

    return {
      id: unit.id,
      serialNumber: unit.serialNumber,
      status: unit.status,
      skuId: unit.skuId,
      sku: unit.sku.sku,
      barcode: unit.sku.barcode,
      variationLabel: unit.sku.variationLabel,
      sellingPrice: unit.sku.sellingPrice.toString(),
      productTemplate: {
        id: unit.sku.productTemplate.id,
        name: unit.sku.productTemplate.name,
        slug: unit.sku.productTemplate.slug,
        model: unit.sku.productTemplate.model,
        brandName: unit.sku.productTemplate.brand.name,
        categoryName: unit.sku.productTemplate.category.name,
        media: unit.sku.productTemplate.media,
      },
      currentBranch: unit.currentBranch
        ? {
            id: unit.currentBranch.id,
            code: unit.currentBranch.code,
            name: unit.currentBranch.name,
            address: unit.currentBranch.address,
          }
        : null,
      origin: originStockMove
        ? {
            stockMoveId: originStockMove.id,
            stockMoveCode: originStockMove.code,
            purchaseOrderId: originPurchaseOrder?.id ?? null,
            purchaseOrderCode: originPurchaseOrder?.code ?? null,
            supplierName: originPurchaseOrder?.supplier?.name ?? null,
            receivedAt: unit.originStockMoveLine.createdAt.toISOString(),
          }
        : null,
      warranty,
      movements: movementDetails,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    };
  }

  async updateSerialStatus(
    identifier: string,
    payload: UpdateSerialStatusInput,
    adminUserId?: string,
  ): Promise<SerialDetailResponse> {
    const trimmed = identifier.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

    const unit = await prisma.serialUnit.findFirst({
      where: isUuid
        ? { id: trimmed }
        : { serialNumber: { equals: trimmed, mode: 'insensitive' } },
    });

    if (!unit) {
      throw new DomainError('SERIAL_NOT_FOUND', {
        messageKey: `Khong tim thay so serial '${trimmed}' de cap nhat`,
        status: 404,
      });
    }

    if (payload.branchId && payload.branchId !== unit.currentBranchId) {
      throw new DomainError('SERIAL_BRANCH_TRANSFER_FORBIDDEN', {
        messageKey: 'Khong the thay doi chi nhanh truc tiep tren so se-ri. Bat buoc phai thuc hien thong qua quy trinh tao phieu dieu chuyen kho.',
        status: 400,
      });
    }

    if (payload.status === SerialStatus.QUARANTINED && unit.status !== SerialStatus.QUARANTINED) {
      if (!unit.currentBranchId) {
        throw new DomainError('SERIAL_NO_BRANCH', {
          messageKey: 'So se-ri khong nam o chi nhanh nao de thuc hien cach ly',
          status: 400,
        });
      }

      await adminInventoryService.quarantineStock(
        {
          branchId: unit.currentBranchId,
          skuId: unit.skuId,
          quantity: 1,
          serialIds: [unit.id],
          reason: 'Admin cap nhat trang thai se-ri sang QUARANTINED',
        },
        adminUserId,
      );

      return this.getSerialDetail(unit.id);
    }

    const dataToUpdate: Prisma.SerialUnitUpdateInput = {
      status: payload.status,
    };

    await prisma.serialUnit.update({
      where: { id: unit.id },
      data: dataToUpdate,
    });

    return this.getSerialDetail(unit.id);
  }
}

export const adminSerialService = new AdminSerialService();
