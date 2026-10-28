import { Prisma, PurchaseOrderStatus } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreatePurchaseOrderInput,
  QueryPurchaseOrderInput,
  ShortShipmentInput,
  UpdatePurchaseOrderInput,
} from '../../validations/admin/purchase-order.schema.js';

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
    if (typeof firstItem === 'string') {
      return firstItem;
    }
    if (firstItem && typeof firstItem === 'object') {
      const mediaObj = firstItem as Record<string, unknown>;
      if (typeof mediaObj['url'] === 'string') {
        return mediaObj['url'];
      }
    }
  }

  return null;
}

export type PurchaseOrderListItemDto = {
  id: string;
  code: string;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  receivingBranchId: number;
  receivingBranchName: string;
  receivingBranchCode: string;
  status: PurchaseOrderStatus;
  lineCount: number;
  totalQuantity: number;
  totalAmount: string;
  note: string | null;
  cancellationReason: string | null;
  supersedesPurchaseOrderId: string | null;
  supersedesCode: string | null;
  supersededByCode: string | null;
  hasReceiptMove: boolean;
  confirmedAt: Date | null;
  receivedAt: Date | null;
  closedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PurchaseOrderListResult = {
  items: PurchaseOrderListItemDto[];
  total: number;
  page: number;
  limit: number;
};

async function generateNextPurchaseOrderCode(
  client: Prisma.TransactionClient | typeof prisma,
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `PO-${currentYear}-`;
  const latestOrder = await client.purchaseOrder.findFirst({
    where: {
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
  if (latestOrder) {
    const parts = latestOrder.code.split('-');
    const lastNum = parseInt(parts[2], 10);
    if (!Number.isNaN(lastNum)) {
      nextSequence = lastNum + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export class AdminPurchaseOrderService {
  async getPurchaseOrders(query: QueryPurchaseOrderInput): Promise<PurchaseOrderListResult> {
    const where: Prisma.PurchaseOrderWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.receivingBranchId) {
      where.receivingBranchId = query.receivingBranchId;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { supplier: { name: { contains: term, mode: 'insensitive' } } },
        { supplier: { code: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const total = await prisma.purchaseOrder.count({ where });

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = limit > 0 ? (page - 1) * limit : 0;
    const take = limit > 0 ? limit : undefined;

    const orders = await prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        supplier: {
          select: { id: true, code: true, name: true },
        },
        receivingBranch: {
          select: { id: true, code: true, name: true },
        },
        lines: {
          select: { quantity: true, agreedUnitCost: true },
        },
        receiptMove: {
          select: { id: true, code: true },
        },
        supersedesPurchaseOrder: {
          select: { id: true, code: true },
        },
        supersededByOrders: {
          select: { id: true, code: true },
        },
      },
    });

    const items: PurchaseOrderListItemDto[] = orders.map((po) => {
      let totalAmountNum = 0;
      let totalQty = 0;
      for (const line of po.lines) {
        totalQty += line.quantity;
        totalAmountNum += line.quantity * Number(line.agreedUnitCost);
      }

      return {
        id: po.id,
        code: po.code,
        supplierId: po.supplierId,
        supplierName: po.supplier.name,
        supplierCode: po.supplier.code,
        receivingBranchId: po.receivingBranchId,
        receivingBranchName: po.receivingBranch.name,
        receivingBranchCode: po.receivingBranch.code,
        status: po.status,
        lineCount: po.lines.length,
        totalQuantity: totalQty,
        totalAmount: totalAmountNum.toFixed(2),
        note: po.note,
        cancellationReason: po.cancellationReason,
        supersedesPurchaseOrderId: po.supersedesPurchaseOrderId,
        supersedesCode: po.supersedesPurchaseOrder?.code ?? null,
        supersededByCode: po.supersededByOrders[0]?.code ?? null,
        hasReceiptMove: Boolean(po.receiptMove),
        confirmedAt: po.confirmedAt,
        receivedAt: po.receivedAt,
        closedAt: po.closedAt,
        cancelledAt: po.cancelledAt,
        createdAt: po.createdAt,
        updatedAt: po.updatedAt,
      };
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getPurchaseOrderById(id: string): Promise<unknown> {
    const po = await prisma.purchaseOrder.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
      include: {
        supplier: true,
        receivingBranch: true,
        supersedesPurchaseOrder: {
          select: {
            id: true,
            code: true,
            status: true,
            createdAt: true,
          },
        },
        supersededByOrders: {
          select: {
            id: true,
            code: true,
            status: true,
            createdAt: true,
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
        lines: {
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
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!po) {
      throw new DomainError('PURCHASE_ORDER_NOT_FOUND', {
        status: 404,
        messageKey: 'Don mua hang khong ton tai',
        details: { id },
      });
    }

    let totalAmountNum = 0;
    let totalQty = 0;
    const formattedLines = po.lines.map((line) => {
      const lineTotal = line.quantity * Number(line.agreedUnitCost);
      totalAmountNum += lineTotal;
      totalQty += line.quantity;

      const receivedMoveLine = po.receiptMove?.lines.find((ml) => ml.skuId === line.skuId);
      const receivedSerials = receivedMoveLine?.receivedSerialUnits.map((u) => u.serialNumber) ?? [];

      const imageUrl = extractVariantImageUrl(
        line.sku.variantSpec,
        line.sku.productTemplate.media,
      );

      return {
        id: line.id,
        skuId: line.skuId,
        quantity: line.quantity,
        agreedUnitCost: Number(line.agreedUnitCost).toFixed(2),
        lineTotal: lineTotal.toFixed(2),
        sku: {
          id: line.sku.id,
          sku: line.sku.sku,
          barcode: line.sku.barcode,
          variationLabel: line.sku.variationLabel,
          serialRequired: line.sku.serialRequired,
          imageUrl,
          templateName: line.sku.productTemplate.name,
          categoryName: line.sku.productTemplate.category.name,
          brandName: line.sku.productTemplate.brand.name,
        },
        receivedSerials,
      };
    });

    return {
      id: po.id,
      code: po.code,
      status: po.status,
      supplierId: po.supplierId,
      supplier: po.supplier,
      receivingBranchId: po.receivingBranchId,
      receivingBranch: po.receivingBranch,
      note: po.note,
      cancellationReason: po.cancellationReason,
      confirmedAt: po.confirmedAt,
      receivedAt: po.receivedAt,
      closedAt: po.closedAt,
      cancelledAt: po.cancelledAt,
      createdAt: po.createdAt,
      updatedAt: po.updatedAt,
      lines: formattedLines,
      totalQuantity: totalQty,
      totalAmount: totalAmountNum.toFixed(2),
      supersedesPurchaseOrder: po.supersedesPurchaseOrder,
      supersededByOrders: po.supersededByOrders,
      receiptMove: po.receiptMove
        ? {
            id: po.receiptMove.id,
            code: po.receiptMove.code,
            status: po.receiptMove.status,
            validatedAt: po.receiptMove.validatedAt,
            lineCount: po.receiptMove.lines.length,
          }
        : null,
    };
  }

  async createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<unknown> {
    const supplier = await prisma.supplier.findUnique({
      where: { id: input.supplierId },
    });
    if (!supplier) {
      throw new DomainError('SUPPLIER_NOT_FOUND', {
        status: 404,
        messageKey: 'Nha cung cap khong ton tai',
        details: { supplierId: input.supplierId },
      });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: input.receivingBranchId },
    });
    if (!branch) {
      throw new DomainError('BRANCH_NOT_FOUND', {
        status: 404,
        messageKey: 'Kho chi nhanh nhan hang khong ton tai',
        details: { receivingBranchId: input.receivingBranchId },
      });
    }

    const skuIds = input.lines.map((l) => l.skuId);
    const uniqueSkuIds = new Set(skuIds);
    if (uniqueSkuIds.size !== skuIds.length) {
      throw new DomainError('PURCHASE_ORDER_DUPLICATE_SKU', {
        status: 400,
        messageKey: 'Don mua hang khong the chua nhieu dong cung mot SKU',
      });
    }

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: skuIds } },
    });
    if (variants.length !== uniqueSkuIds.size) {
      throw new DomainError('PRODUCT_VARIANT_NOT_FOUND', {
        status: 400,
        messageKey: 'Mot hoac nhieu SKU khong ton tai trong he thong',
      });
    }

    return await prisma.$transaction(async (tx) => {
      let code = input.code?.trim().toUpperCase();
      if (!code) {
        code = await generateNextPurchaseOrderCode(tx);
      } else {
        const existing = await tx.purchaseOrder.findUnique({
          where: { code },
        });
        if (existing) {
          throw new DomainError('PURCHASE_ORDER_CODE_EXISTS', {
            status: 409,
            messageKey: `Ma don mua hang ${code} da ton tai`,
            details: { code },
          });
        }
      }

      const created = await tx.purchaseOrder.create({
        data: {
          code,
          supplierId: input.supplierId,
          receivingBranchId: input.receivingBranchId,
          status: PurchaseOrderStatus.DRAFT,
          note: input.note ?? null,
          lines: {
            create: input.lines.map((l) => ({
              skuId: l.skuId,
              quantity: l.quantity,
              agreedUnitCost: new Prisma.Decimal(l.agreedUnitCost),
            })),
          },
        },
        include: {
          supplier: true,
          receivingBranch: true,
          lines: {
            include: {
              sku: true,
            },
          },
        },
      });

      return created;
    });
  }

  async updatePurchaseOrder(id: string, input: UpdatePurchaseOrderInput): Promise<unknown> {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!existing) {
      throw new DomainError('PURCHASE_ORDER_NOT_FOUND', {
        status: 404,
        messageKey: 'Don mua hang khong ton tai',
        details: { id },
      });
    }

    if (existing.status !== PurchaseOrderStatus.DRAFT) {
      throw new DomainError('PURCHASE_ORDER_LOCKED', {
        status: 400,
        messageKey: 'Chi co the sua don mua hang o trang thai BAN THAO',
        details: { status: existing.status },
      });
    }

    if (input.supplierId && input.supplierId !== existing.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: input.supplierId },
      });
      if (!supplier) {
        throw new DomainError('SUPPLIER_NOT_FOUND', {
          status: 404,
          messageKey: 'Nha cung cap khong ton tai',
          details: { supplierId: input.supplierId },
        });
      }
    }

    if (input.receivingBranchId && input.receivingBranchId !== existing.receivingBranchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: input.receivingBranchId },
      });
      if (!branch) {
        throw new DomainError('BRANCH_NOT_FOUND', {
          status: 404,
          messageKey: 'Kho chi nhanh nhan hang khong ton tai',
          details: { receivingBranchId: input.receivingBranchId },
        });
      }
    }

    if (input.lines) {
      const skuIds = input.lines.map((l) => l.skuId);
      const uniqueSkuIds = new Set(skuIds);
      if (uniqueSkuIds.size !== skuIds.length) {
        throw new DomainError('PURCHASE_ORDER_DUPLICATE_SKU', {
          status: 400,
          messageKey: 'Don mua hang khong the chua nhieu dong cung mot SKU',
        });
      }

      const variants = await prisma.productVariant.findMany({
        where: { id: { in: skuIds } },
      });
      if (variants.length !== uniqueSkuIds.size) {
        throw new DomainError('PRODUCT_VARIANT_NOT_FOUND', {
          status: 400,
          messageKey: 'Mot hoac nhieu SKU khong ton tai trong he thong',
        });
      }
    }

    return await prisma.$transaction(async (tx) => {
      if (input.lines) {
        await tx.purchaseOrderLine.deleteMany({
          where: { purchaseOrderId: id },
        });

        await tx.purchaseOrderLine.createMany({
          data: input.lines.map((l) => ({
            purchaseOrderId: id,
            skuId: l.skuId,
            quantity: l.quantity,
            agreedUnitCost: new Prisma.Decimal(l.agreedUnitCost),
          })),
        });
      }

      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: {
          ...(input.supplierId ? { supplierId: input.supplierId } : {}),
          ...(input.receivingBranchId ? { receivingBranchId: input.receivingBranchId } : {}),
          ...(input.note !== undefined ? { note: input.note } : {}),
        },
        include: {
          supplier: true,
          receivingBranch: true,
          lines: {
            include: { sku: true },
          },
        },
      });

      return updated;
    });
  }

  async confirmPurchaseOrder(id: string): Promise<unknown> {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!existing) {
      throw new DomainError('PURCHASE_ORDER_NOT_FOUND', {
        status: 404,
        messageKey: 'Don mua hang khong ton tai',
        details: { id },
      });
    }

    if (existing.status !== PurchaseOrderStatus.DRAFT) {
      throw new DomainError('PURCHASE_ORDER_INVALID_STATE', {
        status: 400,
        messageKey: 'Chi co the xac nhan don hang o trang thai BAN THAO',
        details: { status: existing.status },
      });
    }

    if (existing.lines.length === 0) {
      throw new DomainError('PURCHASE_ORDER_EMPTY_LINES', {
        status: 400,
        messageKey: 'Khong the xac nhan don mua hang khong co dong linh kien nao',
      });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
      include: {
        supplier: true,
        receivingBranch: true,
        lines: {
          include: { sku: true },
        },
      },
    });

    return updated;
  }

  async closePurchaseOrder(id: string): Promise<unknown> {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('PURCHASE_ORDER_NOT_FOUND', {
        status: 404,
        messageKey: 'Don mua hang khong ton tai',
        details: { id },
      });
    }

    if (existing.status !== PurchaseOrderStatus.RECEIVED) {
      throw new DomainError('PURCHASE_ORDER_INVALID_STATE', {
        status: 400,
        messageKey: 'Chi don mua hang da nhap kho moi co the dong',
        details: { status: existing.status },
      });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    return updated;
  }

  async cancelPurchaseOrder(id: string, reason: string): Promise<unknown> {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('PURCHASE_ORDER_NOT_FOUND', {
        status: 404,
        messageKey: 'Don mua hang khong ton tai',
        details: { id },
      });
    }

    if (existing.status === PurchaseOrderStatus.RECEIVED || existing.status === PurchaseOrderStatus.CLOSED) {
      throw new DomainError('PURCHASE_ORDER_CANNOT_CANCEL', {
        status: 400,
        messageKey: 'Khong the huy don mua hang da nhap kho hoac da dong',
        details: { status: existing.status },
      });
    }

    if (existing.status === PurchaseOrderStatus.CANCELLED) {
      throw new DomainError('PURCHASE_ORDER_ALREADY_CANCELLED', {
        status: 400,
        messageKey: 'Don mua hang da duoc huy truoc do',
      });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    return updated;
  }

  async handleShortShipment(id: string, input: ShortShipmentInput): Promise<unknown> {
    const originalPo = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    });

    if (!originalPo) {
      throw new DomainError('PURCHASE_ORDER_NOT_FOUND', {
        status: 404,
        messageKey: 'Don mua hang khong ton tai',
        details: { id },
      });
    }

    if (originalPo.status !== PurchaseOrderStatus.CONFIRMED) {
      throw new DomainError('PURCHASE_ORDER_INVALID_STATE', {
        status: 400,
        messageKey: 'Chi co the bao giao thieu cho don hang o trang thai DA XAC NHAN',
        details: { status: originalPo.status },
      });
    }

    const inputMap = new Map<number, number>();
    for (const line of input.lines) {
      inputMap.set(line.skuId, line.actualQuantity);
    }

    let hasDeficit = false;
    let totalActualQty = 0;
    const replacementLines: { skuId: number; quantity: number; agreedUnitCost: Prisma.Decimal }[] = [];

    for (const poLine of originalPo.lines) {
      const actualQty = inputMap.get(poLine.skuId);
      if (actualQty === undefined) {
        throw new DomainError('SHORT_SHIPMENT_MISSING_LINE', {
          status: 400,
          messageKey: `Thieu thong tin so luong thuc nhan cho linh kien SKU id ${poLine.skuId}`,
          details: { skuId: poLine.skuId },
        });
      }

      if (actualQty > poLine.quantity) {
        throw new DomainError('SHORT_SHIPMENT_EXCESS_QUANTITY', {
          status: 400,
          messageKey: `So luong thuc nhan (${actualQty}) vuot qua so luong da chot tren PO (${poLine.quantity})`,
          details: { skuId: poLine.skuId, actual: actualQty, ordered: poLine.quantity },
        });
      }

      if (actualQty < poLine.quantity) {
        hasDeficit = true;
      }

      if (actualQty > 0) {
        totalActualQty += actualQty;
        replacementLines.push({
          skuId: poLine.skuId,
          quantity: actualQty,
          agreedUnitCost: poLine.agreedUnitCost,
        });
      }
    }

    if (!hasDeficit) {
      throw new DomainError('SHORT_SHIPMENT_NOT_DEFICIT', {
        status: 400,
        messageKey: 'So luong thuc nhan bang dung so luong dat mua. Vui long dung chuc nang Nhap kho 100%',
      });
    }

    if (totalActualQty === 0) {
      throw new DomainError('SHORT_SHIPMENT_ZERO_QUANTITY', {
        status: 400,
        messageKey: 'Tong so luong thuc nhan bang 0. Vui long su dung chuc nang Huy don hang',
      });
    }

    return await prisma.$transaction(async (tx) => {
      const cancelReasonText = `SUPPLIER_SHORT_SHIPMENT: ${input.reason?.trim() || 'Nha cung cap giao thieu linh kien'}`;
      await tx.purchaseOrder.update({
        where: { id: originalPo.id },
        data: {
          status: PurchaseOrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: cancelReasonText,
        },
      });

      let replacementCode = `${originalPo.code}-R`;
      const codeCheck = await tx.purchaseOrder.findUnique({
        where: { code: replacementCode },
      });
      if (codeCheck) {
        replacementCode = `${originalPo.code}-R-${Date.now().toString().slice(-4)}`;
      }

      const replacementPo = await tx.purchaseOrder.create({
        data: {
          code: replacementCode,
          supplierId: originalPo.supplierId,
          receivingBranchId: originalPo.receivingBranchId,
          supersedesPurchaseOrderId: originalPo.id,
          status: PurchaseOrderStatus.CONFIRMED,
          confirmedAt: new Date(),
          note: `PO thay the cho don ${originalPo.code} bi huy do giao thieu. ${input.reason?.trim() || ''}`.trim(),
          lines: {
            create: replacementLines.map((line) => ({
              skuId: line.skuId,
              quantity: line.quantity,
              agreedUnitCost: line.agreedUnitCost,
            })),
          },
        },
        include: {
          supplier: true,
          receivingBranch: true,
          supersedesPurchaseOrder: true,
          lines: {
            include: { sku: true },
          },
        },
      });

      return replacementPo;
    });
  }
}

export const adminPurchaseOrderService = new AdminPurchaseOrderService();
