import {
  ActorType,
  FulfillmentMethod,
  OrderHoldReason,
  OrderStatus,
  PaymentChargeStatus,
  PaymentMethod,
  PaymentState,
  RefundStatus,
  SalesLineType,
  ServiceType,
} from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import { UpdateOrderNotesInput } from '../../validations/admin/order.schema.js';

export type AdminOrderTransitionDto = {
  targetStatus: OrderStatus;
  label: string;
  actionKey: string;
  modalId?: string;
  isPrimary?: boolean;
  isDestructive?: boolean;
};

export type AdminOrderLineItemDto = {
  id: string;
  skuId: number | null;
  sourcePcBundleId: number | null;
  lineType: SalesLineType;
  serviceType: ServiceType | null;
  pcBuildKey: string | null;
  pcBuildNameSnapshot: string | null;
  pcBuildTypeSnapshot: string | null;
  skuSnapshot: string | null;
  nameSnapshot: string;
  specSnapshot: Record<string, unknown>;
  taxSnapshot: Record<string, unknown>;
  promotionSnapshots: unknown[];
  quantity: number;
  unitPrice: string;
  productDiscount: string;
  couponDiscount: string;
  netAmount: string;
  sortOrder: number;
  availableStock: number | null;
  categoryName?: string;
  imageUrl?: string;
};

export type AdminPcBuildGroupDto = {
  pcBuildKey: string;
  pcBuildName: string;
  pcBuildType: string;
  hasAssembly: boolean;
  assemblyFee: string;
  totalWattage: number;
  items: AdminOrderLineItemDto[];
};

export type AdminOrderTimelineEventDto = {
  id: string;
  previousStatus: OrderStatus;
  nextStatus: OrderStatus;
  reason: string | null;
  actorType: ActorType;
  actorId: string | null;
  actorName: string;
  occurredAt: Date;
};

export type AdminOrderDetailDto = {
  id: string;
  code: string;
  status: OrderStatus;
  holdReason: OrderHoldReason | null;
  cancellationReason: string | null;
  redeliveryAttemptCount: number;
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: PaymentMethod;
  subtotal: string;
  productDiscount: string;
  couponDiscount: string;
  shippingFee: string;
  taxAmount: string;
  roundingAdjustment: string;
  grandTotal: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverAddress: string;
  customerNotes: string | null;
  internalNotes: string | null;
  shippingCarrier: string | null;
  trackingCode: string | null;
  hasAssembly: boolean;
  submittedAt: Date;
  confirmedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
  };
  fulfillmentBranch: {
    id: number;
    code: string;
    name: string;
    address: string;
  };
  payment: {
    id: string;
    state: PaymentState;
    method: PaymentMethod;
    depositDisposition: string | null;
    depositRequired: string;
    totalReceived: string;
    codRemaining: string;
    charges: Array<{
      id: string;
      chargeType: string;
      providerReference: string;
      expectedAmount: string;
      receivedAmount?: string;
      status: string;
      createdAt: Date;
      providerTransactionId?: string;
    }>;
    refunds: Array<{
      id: string;
      amount: string;
      reason: string;
      status: string;
      createdAt: Date;
    }>;
    codCollections: Array<{
      id: string;
      amount: string;
      actorId: string | null;
      occurredAt: Date;
    }>;
  } | null;
  stockMoves: Array<{
    id: string;
    code: string;
    moveType: string;
    status: string;
    reason: string | null;
    createdAt: Date;
    reservedAt: Date | null;
    dispatchedAt: Date | null;
    validatedAt: Date | null;
  }>;
  amendments: Array<{
    id: string;
    type: string;
    status: string;
    fee: string;
    reason: string;
    createdAt: Date;
  }>;
  statusHistories: AdminOrderTimelineEventDto[];
  lines: AdminOrderLineItemDto[];
  pcBuildGroups: AdminPcBuildGroupDto[];
  standaloneLines: AdminOrderLineItemDto[];
  availableTransitions: AdminOrderTransitionDto[];
};

function calculateAvailableTransitions(
  status: OrderStatus,
  fulfillmentMethod: FulfillmentMethod,
  hasAssembly: boolean,
  redeliveryAttemptCount: number,
  holdReason?: OrderHoldReason | null,
  hasPendingRefund?: boolean,
  hasQrReview?: boolean,
): AdminOrderTransitionDto[] {
  const transitions: AdminOrderTransitionDto[] = [];

  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      transitions.push({
        targetStatus: OrderStatus.CANCELLED,
        label: 'Huy Don Hang',
        actionKey: 'CANCEL_ORDER',
        modalId: 'MOD-17',
        isDestructive: true,
      });
      break;

    case OrderStatus.PENDING_COD_CONFIRMATION:
      transitions.push({
        targetStatus: OrderStatus.CONFIRMED,
        label: 'Xac Nhan Don COD',
        actionKey: 'CONFIRM_COD',
        modalId: 'MOD-07',
        isPrimary: true,
      });
      transitions.push({
        targetStatus: OrderStatus.CANCELLED,
        label: 'Huy Don Hang',
        actionKey: 'CANCEL_ORDER',
        modalId: 'MOD-17',
        isDestructive: true,
      });
      break;

    case OrderStatus.CONFIRMED:
      transitions.push({
        targetStatus: OrderStatus.PREPARING_COMPONENTS,
        label: 'Bat Dau Soan Hang',
        actionKey: 'START_PREP',
        modalId: 'MOD-08',
        isPrimary: true,
      });
      transitions.push({
        targetStatus: OrderStatus.ON_HOLD,
        label: 'Tam Giu Don Hang',
        actionKey: 'HOLD_ORDER',
        modalId: 'MOD-18',
      });
      transitions.push({
        targetStatus: OrderStatus.CANCELLED,
        label: 'Huy Don Hang',
        actionKey: 'CANCEL_ORDER',
        modalId: 'MOD-17',
        isDestructive: true,
      });
      break;

    case OrderStatus.PREPARING_COMPONENTS:
      if (hasAssembly) {
        transitions.push({
          targetStatus: OrderStatus.ASSEMBLING,
          label: 'Ban Giao Lap Rap PC',
          actionKey: 'ASSEMBLE_PC',
          modalId: 'MOD-09',
          isPrimary: true,
        });
      } else if (fulfillmentMethod === FulfillmentMethod.PICKUP) {
        transitions.push({
          targetStatus: OrderStatus.READY_FOR_PICKUP,
          label: 'Bao San Sang Nhan Tai Shop',
          actionKey: 'READY_PICKUP',
          modalId: 'MOD-10',
          isPrimary: true,
        });
      } else {
        transitions.push({
          targetStatus: OrderStatus.SHIPPING,
          label: 'Xuat Kho Giao Hang',
          actionKey: 'SHIP_ORDER',
          modalId: 'MOD-11',
          isPrimary: true,
        });
      }
      transitions.push({
        targetStatus: OrderStatus.ON_HOLD,
        label: 'Tam Giu Don Hang',
        actionKey: 'HOLD_ORDER',
        modalId: 'MOD-18',
      });
      transitions.push({
        targetStatus: OrderStatus.CANCELLED,
        label: 'Huy Don Hang',
        actionKey: 'CANCEL_ORDER',
        modalId: 'MOD-17',
        isDestructive: true,
      });
      break;

    case OrderStatus.ASSEMBLING:
      if (fulfillmentMethod === FulfillmentMethod.PICKUP) {
        transitions.push({
          targetStatus: OrderStatus.READY_FOR_PICKUP,
          label: 'Bao San Sang Nhan Tai Shop',
          actionKey: 'READY_PICKUP',
          modalId: 'MOD-10',
          isPrimary: true,
        });
      } else {
        transitions.push({
          targetStatus: OrderStatus.SHIPPING,
          label: 'Xuat Kho Giao Hang',
          actionKey: 'SHIP_ORDER',
          modalId: 'MOD-11',
          isPrimary: true,
        });
      }
      transitions.push({
        targetStatus: OrderStatus.ON_HOLD,
        label: 'Tam Giu Don Hang',
        actionKey: 'HOLD_ORDER',
        modalId: 'MOD-18',
      });
      transitions.push({
        targetStatus: OrderStatus.CANCELLED,
        label: 'Huy Don Hang',
        actionKey: 'CANCEL_ORDER',
        modalId: 'MOD-17',
        isDestructive: true,
      });
      break;

    case OrderStatus.READY_FOR_PICKUP:
      transitions.push({
        targetStatus: OrderStatus.COMPLETED,
        label: 'Hoan Tat Nhan Hang',
        actionKey: 'COMPLETE_ORDER',
        modalId: 'MOD-16',
        isPrimary: true,
      });
      transitions.push({
        targetStatus: OrderStatus.READY_FOR_PICKUP,
        label: 'Doi Sang Giao Tan Noi',
        actionKey: 'PICKUP_TO_DELIVERY',
        modalId: 'MOD-19',
      });
      transitions.push({
        targetStatus: OrderStatus.ON_HOLD,
        label: 'Tam Giu Don Hang',
        actionKey: 'HOLD_ORDER',
        modalId: 'MOD-18',
      });
      transitions.push({
        targetStatus: OrderStatus.CANCELLED,
        label: 'Huy Don Hang',
        actionKey: 'CANCEL_ORDER',
        modalId: 'MOD-17',
        isDestructive: true,
      });
      break;

    case OrderStatus.SHIPPING:
      transitions.push({
        targetStatus: OrderStatus.COMPLETED,
        label: 'Xac Nhan Giao Thanh Cong',
        actionKey: 'COMPLETE_ORDER',
        modalId: 'MOD-16',
        isPrimary: true,
      });
      transitions.push({
        targetStatus: OrderStatus.DELIVERY_FAILED,
        label: 'Bao Giao That Bai',
        actionKey: 'DELIVERY_FAILED',
        modalId: 'MOD-12',
        isDestructive: true,
      });
      break;

    case OrderStatus.DELIVERY_FAILED:
      if (redeliveryAttemptCount < 2) {
        transitions.push({
          targetStatus: OrderStatus.SHIPPING,
          label: 'Hen Giao Lai',
          actionKey: 'REDELIVERY',
          modalId: 'MOD-13',
          isPrimary: true,
        });
      }
      transitions.push({
        targetStatus: OrderStatus.SHIPPING,
        label: 'Len Lich Giao Lai',
        actionKey: 'REDELIVERY',
        modalId: 'MOD-13',
        isPrimary: true,
      });
      transitions.push({
        targetStatus: OrderStatus.CANCELLED,
        label: 'Huy Don Hang',
        actionKey: 'CANCEL_ORDER',
        modalId: 'MOD-17',
        isDestructive: true,
      });
      break;

    case OrderStatus.ON_HOLD:
      if (holdReason === OrderHoldReason.PAYMENT_REVIEW || hasQrReview) {
        transitions.push({
          targetStatus: OrderStatus.CONFIRMED,
          label: 'Doi Soat Lech VietQR',
          actionKey: 'RESOLVE_QR_DISCREPANCY',
          modalId: 'MOD-20',
          isPrimary: true,
        });
      }
      transitions.push({
        targetStatus: OrderStatus.CONFIRMED,
        label: 'Xu Ly Xong - Tiep Tuc Don',
        actionKey: 'RESOLVE_HOLD',
        modalId: 'MOD-18',
        isPrimary: !(holdReason === OrderHoldReason.PAYMENT_REVIEW || hasQrReview),
      });
      if (holdReason === OrderHoldReason.PICKUP_EXPIRED) {
        transitions.push({
          targetStatus: OrderStatus.READY_FOR_PICKUP,
          label: 'Chuyen Sang Giao Tan Noi',
          actionKey: 'PICKUP_TO_DELIVERY',
          modalId: 'MOD-19',
        });
      }
      transitions.push({
        targetStatus: OrderStatus.CANCELLED,
        label: 'Huy Don Hang',
        actionKey: 'CANCEL_ORDER',
        modalId: 'MOD-17',
        isDestructive: true,
      });
      break;

    default:
      break;
  }

  if (hasPendingRefund) {
    transitions.push({
      targetStatus: status,
      label: 'Xac Nhan Hoan Tien Thu Cong',
      actionKey: 'MANUAL_REFUND',
      modalId: 'MOD-21',
    });
  }

  return transitions;
}

export class AdminOrderDetailService {
  async getOrderDetail(id: string): Promise<AdminOrderDetailDto> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            user: {
              select: {
                image: true,
              },
            },
          },
        },
        fulfillmentBranch: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
          },
        },
        lines: {
          orderBy: { sortOrder: 'asc' },
          include: {
            sku: {
              include: {
                productTemplate: {
                  include: {
                    category: { select: { id: true, name: true } },
                  },
                },
                stockQuants: true,
              },
            },
          },
        },
        payment: {
          include: {
            charges: {
              orderBy: { createdAt: 'desc' },
              include: {
                transactions: {
                  orderBy: { occurredAt: 'desc' },
                  take: 1,
                },
              },
            },
            refunds: {
              orderBy: { createdAt: 'desc' },
            },
            codCollections: {
              orderBy: { occurredAt: 'desc' },
            },
          },
        },
        stockMoves: {
          orderBy: { createdAt: 'desc' },
        },
        amendments: {
          orderBy: { createdAt: 'desc' },
        },
        statusHistories: {
          orderBy: { occurredAt: 'desc' },
        },
      },
    });

    if (!order || !order.isActive) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    const adminActorIds = order.statusHistories
      .map((h) => (h.actorType === ActorType.ADMIN && typeof h.actorId === 'string' ? h.actorId : null))
      .filter((actorId): actorId is string => typeof actorId === 'string' && actorId.length > 0);

    const uniqueAdminIds: string[] = [...new Set(adminActorIds)];
    const adminUsers = uniqueAdminIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: uniqueAdminIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const adminNameMap = new Map<string, string>();
    for (const u of adminUsers) {
      adminNameMap.set(u.id, u.name || u.email);
    }

    const timelineEvents: AdminOrderTimelineEventDto[] = order.statusHistories.map((h) => {
      let actorName = 'He thong';
      if (h.actorType === ActorType.ADMIN) {
        actorName = (h.actorId && adminNameMap.get(h.actorId)) || 'Nhan vien quan tri';
      } else if (h.actorType === ActorType.CUSTOMER) {
        actorName = order.customer.name || 'Khach hang';
      } else if (h.actorType === ActorType.PAYMENT_PROVIDER) {
        actorName = 'Cong thanh toan';
      }

      return {
        id: h.id,
        previousStatus: h.previousStatus,
        nextStatus: h.nextStatus,
        reason: h.reason,
        actorType: h.actorType,
        actorId: h.actorId,
        actorName,
        occurredAt: h.occurredAt,
      };
    });

    const deliverySnapshot = (
      typeof order.deliveryAddressSnapshot === 'object' && order.deliveryAddressSnapshot !== null
        ? (order.deliveryAddressSnapshot as Record<string, unknown>)
        : {}
    );

    const receiverAddress =
      typeof deliverySnapshot['address'] === 'string'
        ? (deliverySnapshot['address'] as string)
        : order.fulfillmentMethod === FulfillmentMethod.PICKUP
        ? 'Nhan tai showroom / quay'
        : 'Chua cap nhat dia chi';

    const customerNotes =
      typeof deliverySnapshot['customerNotes'] === 'string'
        ? (deliverySnapshot['customerNotes'] as string)
        : null;

    const internalNotes =
      typeof deliverySnapshot['internalNotes'] === 'string'
        ? (deliverySnapshot['internalNotes'] as string)
        : null;

    const shippingCarrier =
      typeof deliverySnapshot['shippingCarrier'] === 'string'
        ? (deliverySnapshot['shippingCarrier'] as string)
        : null;

    const trackingCode =
      typeof deliverySnapshot['trackingCode'] === 'string'
        ? (deliverySnapshot['trackingCode'] as string)
        : null;

    const hasAssembly = order.lines.some(
      (line) => line.serviceType === ServiceType.ASSEMBLY || line.lineType === SalesLineType.SERVICE,
    );

    const lineItems: AdminOrderLineItemDto[] = order.lines.map((line) => {
      let availableStock: number | null = null;
      if (line.sku && line.sku.stockQuants) {
        const branchQuant = line.sku.stockQuants.find(
          (sq) => sq.branchId === order.fulfillmentBranchId,
        );
        if (branchQuant) {
          availableStock = Math.max(
            0,
            branchQuant.onHand - branchQuant.reserved - branchQuant.quarantineDamaged,
          );
        }
      }

      let imageUrl: string | undefined;
      if (line.sku?.productTemplate?.media) {
        const media = line.sku.productTemplate.media as unknown[];
        if (Array.isArray(media) && media.length > 0) {
          const primary = media.find((m) => typeof m === 'object' && m !== null && (m as Record<string, unknown>)['isPrimary']);
          if (primary && typeof (primary as Record<string, unknown>)['url'] === 'string') {
            imageUrl = (primary as Record<string, unknown>)['url'] as string;
          } else if (typeof (media[0] as Record<string, unknown>)['url'] === 'string') {
            imageUrl = (media[0] as Record<string, unknown>)['url'] as string;
          }
        }
      }

      return {
        id: line.id,
        skuId: line.skuId,
        sourcePcBundleId: line.sourcePcBundleId,
        lineType: line.lineType,
        serviceType: line.serviceType,
        pcBuildKey: line.pcBuildKey,
        pcBuildNameSnapshot: line.pcBuildNameSnapshot,
        pcBuildTypeSnapshot: line.pcBuildTypeSnapshot,
        skuSnapshot: line.skuSnapshot,
        nameSnapshot: line.nameSnapshot,
        specSnapshot: (line.specSnapshot as Record<string, unknown>) || {},
        taxSnapshot: (line.taxSnapshot as Record<string, unknown>) || {},
        promotionSnapshots: (line.promotionSnapshots as unknown[]) || [],
        quantity: line.quantity,
        unitPrice: line.unitPrice.toString(),
        productDiscount: line.productDiscount.toString(),
        couponDiscount: line.couponDiscount.toString(),
        netAmount: line.netAmount.toString(),
        sortOrder: line.sortOrder,
        availableStock,
        categoryName: line.sku?.productTemplate?.category?.name,
        imageUrl,
      };
    });

    const pcBuildMap = new Map<string, AdminPcBuildGroupDto>();
    const standaloneLines: AdminOrderLineItemDto[] = [];

    for (const line of lineItems) {
      if (line.pcBuildKey) {
        if (!pcBuildMap.has(line.pcBuildKey)) {
          pcBuildMap.set(line.pcBuildKey, {
            pcBuildKey: line.pcBuildKey,
            pcBuildName: line.pcBuildNameSnapshot || 'Cau hinh PC Lap Rap',
            pcBuildType: line.pcBuildTypeSnapshot || 'CUSTOM_STUDIO',
            hasAssembly: false,
            assemblyFee: '0',
            totalWattage: 0,
            items: [],
          });
        }
        const group = pcBuildMap.get(line.pcBuildKey)!;
        if (line.serviceType === ServiceType.ASSEMBLY || line.lineType === SalesLineType.SERVICE) {
          group.hasAssembly = true;
          group.assemblyFee = line.netAmount;
        } else {
          group.items.push(line);
          const tdp = Number(
            line.specSnapshot['tdp'] ||
            line.specSnapshot['power'] ||
            line.specSnapshot['wattage'] ||
            0,
          );
          if (!Number.isNaN(tdp) && tdp > 0) {
            group.totalWattage += tdp;
          }
        }
      } else {
        if (line.serviceType !== ServiceType.ASSEMBLY) {
          standaloneLines.push(line);
        }
      }
    }

    const pcBuildGroups = Array.from(pcBuildMap.values());

    const hasPendingRefund = Boolean(
      order.payment?.refunds.some((r) => r.status === RefundStatus.PENDING),
    );
    const hasQrReview = Boolean(
      order.payment?.charges.some((c) => c.status === PaymentChargeStatus.REVIEW),
    );

    const availableTransitions = calculateAvailableTransitions(
      order.status,
      order.fulfillmentMethod,
      hasAssembly,
      order.redeliveryAttemptCount,
      order.holdReason,
      hasPendingRefund,
      hasQrReview,
    );

    return {
      id: order.id,
      code: order.code,
      status: order.status,
      holdReason: order.holdReason,
      cancellationReason: order.cancellationReason,
      redeliveryAttemptCount: order.redeliveryAttemptCount,
      fulfillmentMethod: order.fulfillmentMethod,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal.toString(),
      productDiscount: order.productDiscount.toString(),
      couponDiscount: order.couponDiscount.toString(),
      shippingFee: order.shippingFee.toString(),
      taxAmount: order.taxAmount.toString(),
      roundingAdjustment: order.roundingAdjustment.toString(),
      grandTotal: order.grandTotal.toString(),
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      receiverEmail: order.receiverEmail,
      receiverAddress,
      customerNotes,
      internalNotes,
      shippingCarrier,
      trackingCode,
      hasAssembly,
      submittedAt: order.submittedAt,
      confirmedAt: order.confirmedAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        avatarUrl: order.customer.user?.image || null,
      },
      fulfillmentBranch: {
        id: order.fulfillmentBranch.id,
        code: order.fulfillmentBranch.code,
        name: order.fulfillmentBranch.name,
        address: order.fulfillmentBranch.address,
      },
      payment: order.payment
        ? {
            id: order.payment.id,
            state: order.payment.state,
            method: order.payment.method,
            depositDisposition: order.payment.depositDisposition,
            depositRequired: order.payment.depositRequired.toString(),
            totalReceived: order.payment.totalReceived.toString(),
            codRemaining: order.payment.codRemaining.toString(),
            charges: order.payment.charges.map((c) => ({
              id: c.id,
              chargeType: c.chargeType,
              providerReference: c.providerReference,
              expectedAmount: c.expectedAmount.toString(),
              receivedAmount: c.transactions[0]?.receivedAmount?.toString(),
              status: c.status,
              createdAt: c.createdAt,
              providerTransactionId: c.transactions[0]?.providerTransactionId,
            })),
            refunds: order.payment.refunds.map((r) => ({
              id: r.id,
              amount: r.amount.toString(),
              reason: r.reason,
              status: r.status,
              createdAt: r.createdAt,
            })),
            codCollections: order.payment.codCollections.map((cc) => ({
              id: cc.id,
              amount: cc.amount.toString(),
              actorId: cc.actorId,
              occurredAt: cc.occurredAt,
            })),
          }
        : null,
      stockMoves: order.stockMoves.map((sm) => ({
        id: sm.id,
        code: sm.code,
        moveType: sm.moveType,
        status: sm.status,
        reason: sm.reason,
        createdAt: sm.createdAt,
        reservedAt: sm.reservedAt,
        dispatchedAt: sm.dispatchedAt,
        validatedAt: sm.validatedAt,
      })),
      amendments: order.amendments.map((am) => ({
        id: am.id,
        type: am.type,
        status: am.status,
        fee: am.fee.toString(),
        reason: am.reason,
        createdAt: am.createdAt,
      })),
      statusHistories: timelineEvents,
      lines: lineItems,
      pcBuildGroups,
      standaloneLines,
      availableTransitions,
    };
  }

  async updateOrderNotes(id: string, input: UpdateOrderNotesInput): Promise<{
    internalNotes: string | null;
    customerNotes: string | null;
  }> {
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        deliveryAddressSnapshot: true,
      },
    });

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', {
        messageKey: 'error.orderNotFound',
        status: 404,
      });
    }

    const currentSnapshot =
      typeof order.deliveryAddressSnapshot === 'object' && order.deliveryAddressSnapshot !== null
        ? (order.deliveryAddressSnapshot as Record<string, unknown>)
        : {};

    const updatedSnapshot = {
      ...currentSnapshot,
      ...(input.internalNotes !== undefined ? { internalNotes: input.internalNotes } : {}),
      ...(input.customerNotes !== undefined ? { customerNotes: input.customerNotes } : {}),
    };

    await prisma.order.update({
      where: { id },
      data: {
        deliveryAddressSnapshot: updatedSnapshot,
      },
    });

    return {
      internalNotes: typeof updatedSnapshot['internalNotes'] === 'string' ? (updatedSnapshot['internalNotes'] as string) : null,
      customerNotes: typeof updatedSnapshot['customerNotes'] === 'string' ? (updatedSnapshot['customerNotes'] as string) : null,
    };
  }
}

export const adminOrderDetailService = new AdminOrderDetailService();
