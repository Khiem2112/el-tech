import { OrderHoldReason, OrderStatus, PaymentChargeStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export type UrgentQueuesDto = {
  pendingCodConfirmation: number;
  paymentReview: number;
  pickupExpired: number;
  lowStockSkuCount: number;
};

export type BranchOrderStatusDto = {
  branchId: number;
  branchCode: string;
  branchName: string;
  confirmed: number;
  preparingComponents: number;
  assembling: number;
  readyForPickup: number;
  shipping: number;
  onHold: number;
  total: number;
};

export type OrderStatusDistributionDto = {
  byBranch: BranchOrderStatusDto[];
  systemTotal: {
    confirmed: number;
    preparingComponents: number;
    assembling: number;
    readyForPickup: number;
    shipping: number;
    onHold: number;
    total: number;
  };
  statusCounts: Record<string, number>;
};

export type LowStockAlertItemDto = {
  quantId: string;
  skuId: number;
  sku: string;
  productName: string;
  variationLabel?: string | null;
  brandName: string;
  categoryName: string;
  branchId: number;
  branchCode: string;
  branchName: string;
  onHand: number;
  reserved: number;
  quarantineDamaged: number;
  available: number;
};

export type AdminDashboardSummaryDto = {
  urgentQueues: UrgentQueuesDto;
  orderDistribution: OrderStatusDistributionDto;
  lowStockAlerts: LowStockAlertItemDto[];
};

export class AdminDashboardService {
  async getUrgentQueues(branchId?: number): Promise<UrgentQueuesDto> {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [pendingCodConfirmation, paymentReview, pickupExpired, quants] = await Promise.all([
      prisma.order.count({
        where: {
          status: OrderStatus.PENDING_COD_CONFIRMATION,
          isActive: true,
          ...(branchId ? { fulfillmentBranchId: branchId } : {}),
        },
      }),
      prisma.order.count({
        where: {
          isActive: true,
          ...(branchId ? { fulfillmentBranchId: branchId } : {}),
          OR: [
            { holdReason: OrderHoldReason.PAYMENT_REVIEW },
            {
              payment: {
                charges: {
                  some: {
                    status: PaymentChargeStatus.REVIEW,
                    isActive: true,
                  },
                },
              },
            },
          ],
        },
      }),
      prisma.order.count({
        where: {
          isActive: true,
          ...(branchId ? { fulfillmentBranchId: branchId } : {}),
          OR: [
            {
              status: OrderStatus.READY_FOR_PICKUP,
              OR: [
                {
                  statusHistories: {
                    some: {
                      nextStatus: OrderStatus.READY_FOR_PICKUP,
                      occurredAt: { lte: fourteenDaysAgo },
                    },
                  },
                },
                {
                  updatedAt: { lte: fourteenDaysAgo },
                },
              ],
            },
            {
              holdReason: OrderHoldReason.PICKUP_EXPIRED,
              status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] },
            },
          ],
        },
      }),
      prisma.stockQuant.findMany({
        where: {
          isActive: true,
          ...(branchId ? { branchId } : {}),
        },
        select: {
          skuId: true,
          onHand: true,
          reserved: true,
          quarantineDamaged: true,
        },
      }),
    ]);

    const outOfStockSkuIds = new Set<number>();
    for (const quant of quants) {
      const available = Math.max(0, quant.onHand - quant.reserved - quant.quarantineDamaged);
      if (available <= 0) {
        outOfStockSkuIds.add(quant.skuId);
      }
    }

    return {
      pendingCodConfirmation,
      paymentReview,
      pickupExpired,
      lowStockSkuCount: outOfStockSkuIds.size,
    };
  }

  async getOrderStatusDistribution(branchId?: number): Promise<OrderStatusDistributionDto> {
    const [branches, orderGroups, filteredOrderCounts] = await Promise.all([
      prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { deliveryPriority: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
        },
      }),
      prisma.order.groupBy({
        by: ['fulfillmentBranchId', 'status'],
        _count: { id: true },
        where: { isActive: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
          isActive: true,
          ...(branchId ? { fulfillmentBranchId: branchId } : {}),
        },
      }),
    ]);

    const branchMap = new Map<number, BranchOrderStatusDto>();
    for (const branch of branches) {
      branchMap.set(branch.id, {
        branchId: branch.id,
        branchCode: branch.code,
        branchName: branch.name,
        confirmed: 0,
        preparingComponents: 0,
        assembling: 0,
        readyForPickup: 0,
        shipping: 0,
        onHold: 0,
        total: 0,
      });
    }

    const systemTotal = {
      confirmed: 0,
      preparingComponents: 0,
      assembling: 0,
      readyForPickup: 0,
      shipping: 0,
      onHold: 0,
      total: 0,
    };

    for (const group of orderGroups) {
      const branchData = branchMap.get(group.fulfillmentBranchId);
      const count = group._count.id;

      switch (group.status) {
        case OrderStatus.CONFIRMED:
          if (branchData) branchData.confirmed += count;
          systemTotal.confirmed += count;
          break;
        case OrderStatus.PREPARING_COMPONENTS:
          if (branchData) branchData.preparingComponents += count;
          systemTotal.preparingComponents += count;
          break;
        case OrderStatus.ASSEMBLING:
          if (branchData) branchData.assembling += count;
          systemTotal.assembling += count;
          break;
        case OrderStatus.READY_FOR_PICKUP:
          if (branchData) branchData.readyForPickup += count;
          systemTotal.readyForPickup += count;
          break;
        case OrderStatus.SHIPPING:
          if (branchData) branchData.shipping += count;
          systemTotal.shipping += count;
          break;
        case OrderStatus.ON_HOLD:
          if (branchData) branchData.onHold += count;
          systemTotal.onHold += count;
          break;
        default:
          break;
      }
    }

    for (const branchData of branchMap.values()) {
      branchData.total =
        branchData.confirmed +
        branchData.preparingComponents +
        branchData.assembling +
        branchData.readyForPickup +
        branchData.shipping +
        branchData.onHold;
    }

    systemTotal.total =
      systemTotal.confirmed +
      systemTotal.preparingComponents +
      systemTotal.assembling +
      systemTotal.readyForPickup +
      systemTotal.shipping +
      systemTotal.onHold;

    const statusCounts: Record<string, number> = {
      PENDING_PAYMENT: 0,
      PENDING_COD_CONFIRMATION: 0,
      CONFIRMED: 0,
      PREPARING_COMPONENTS: 0,
      ASSEMBLING: 0,
      READY_FOR_PICKUP: 0,
      SHIPPING: 0,
      DELIVERY_FAILED: 0,
      RETURNING: 0,
      RETURNED_TO_BRANCH: 0,
      COMPLETED: 0,
      ON_HOLD: 0,
      CANCELLED: 0,
    };

    for (const group of filteredOrderCounts) {
      statusCounts[group.status] = group._count.id;
    }

    return {
      byBranch: Array.from(branchMap.values()),
      systemTotal,
      statusCounts,
    };
  }

  async getLowStockAlerts(branchId?: number, limit = 10): Promise<LowStockAlertItemDto[]> {
    const quants = await prisma.stockQuant.findMany({
      where: {
        isActive: true,
        ...(branchId ? { branchId } : {}),
      },
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        sku: {
          select: {
            id: true,
            sku: true,
            variationLabel: true,
            productTemplate: {
              select: {
                name: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const mapped: LowStockAlertItemDto[] = quants.map((quant) => {
      const available = Math.max(
        0,
        quant.onHand - quant.reserved - quant.quarantineDamaged,
      );

      return {
        quantId: quant.id,
        skuId: quant.sku.id,
        sku: quant.sku.sku,
        productName: quant.sku.productTemplate.name,
        variationLabel: quant.sku.variationLabel,
        brandName: quant.sku.productTemplate.brand?.name ?? '',
        categoryName: quant.sku.productTemplate.category?.name ?? '',
        branchId: quant.branch.id,
        branchCode: quant.branch.code,
        branchName: quant.branch.name,
        onHand: quant.onHand,
        reserved: quant.reserved,
        quarantineDamaged: quant.quarantineDamaged,
        available,
      };
    });

    mapped.sort((a, b) => a.available - b.available || a.onHand - b.onHand);

    return mapped.slice(0, limit);
  }

  async getSummary(branchId?: number): Promise<AdminDashboardSummaryDto> {
    const [urgentQueues, orderDistribution, lowStockAlerts] = await Promise.all([
      this.getUrgentQueues(branchId),
      this.getOrderStatusDistribution(branchId),
      this.getLowStockAlerts(branchId, 10),
    ]);

    return {
      urgentQueues,
      orderDistribution,
      lowStockAlerts,
    };
  }
}

export const adminDashboardService = new AdminDashboardService();
