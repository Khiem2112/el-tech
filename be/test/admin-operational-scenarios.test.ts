import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  DepositDisposition,
  FulfillmentMethod,
  OrderStatus,
  PaymentChargeStatus,
  PaymentChargeType,
  PaymentMethod,
  PaymentState,
  PaymentTransactionResult,
  RefundStatus,
  SalesLineType,
  SerialStatus,
  ServiceType,
  StockLedgerEntryType,
  StockMoveStatus,
  StockMoveType,
} from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import { poReceiptService } from '../src/services/admin/po-receipt.service.js';
import { adminPurchaseOrderService } from '../src/services/admin/purchase-order.service.js';
import { adminTransferService } from '../src/services/admin/transfer.service.js';
import { orderClosingService } from '../src/services/admin/order-closing.service.js';
import { orderExceptionService } from '../src/services/admin/order-exception.service.js';
import { orderFulfillmentInboundService } from '../src/services/admin/order-fulfillment-inbound.service.js';
import { orderFulfillmentShippingService } from '../src/services/admin/order-fulfillment-shipping.service.js';

describe('TASK-63: Admin Operational Scenarios & Deep-Linked Interaction Verification', () => {
  const getTestAdminId = async (): Promise<string> => {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    return adminUser?.id || '00000000-0000-4000-a000-000000089241';
  };

  test('Scenario 1: Category to Inventory to Internal Branch Transfer Execution', async () => {
    const branches = await prisma.branch.findMany({ take: 2 });
    assert.ok(branches.length >= 2, 'He thong can it nhat 2 chi nhanh de thuc hien dieu chuyen kho');
    const sourceBranch = branches[0];
    const destinationBranch = branches[1];

    const variant = await prisma.productVariant.findFirstOrThrow({
      where: {
        isActive: true,
        serialRequired: false,
      },
      include: {
        productTemplate: { include: { category: true } },
      },
    });

    await prisma.stockQuant.upsert({
      where: {
        branchId_skuId: {
          branchId: sourceBranch.id,
          skuId: variant.id,
        },
      },
      update: {
        onHand: 10,
        reserved: 0,
        weightedAverageCost: 500000,
      },
      create: {
        branchId: sourceBranch.id,
        skuId: variant.id,
        onHand: 10,
        reserved: 0,
        weightedAverageCost: 500000,
      },
    });

    const sourceQuantInitial = await prisma.stockQuant.findUniqueOrThrow({
      where: {
        branchId_skuId: {
          branchId: sourceBranch.id,
          skuId: variant.id,
        },
      },
    });
    const initialSourceOnHand = sourceQuantInitial.onHand;

    const transferQty = 2;
    const transferMove = await adminTransferService.createTransfer({
      sourceBranchId: sourceBranch.id,
      destinationBranchId: destinationBranch.id,
      note: 'Dieu chuyen cap bo sung hang giua 2 chi nhanh cho kich ban Scenario 1',
      lines: [
        {
          skuId: variant.id,
          quantity: transferQty,
        },
      ],
    });

    assert.ok(transferMove.code.startsWith('TRF-'), 'Ma phieu dieu chuyen phai co tien to TRF-');
    assert.ok(
      transferMove.status === StockMoveStatus.DRAFT ||
        transferMove.status === StockMoveStatus.RESERVED,
      'Phieu dieu chuyen khoi tao phai o trang thai DRAFT hoac RESERVED',
    );

    const dispatched = await adminTransferService.dispatchTransfer(transferMove.id, {
      lines: [
        {
          skuId: variant.id,
          serialNumbers: [],
        },
      ],
    });
    assert.equal(dispatched.status, StockMoveStatus.IN_TRANSIT);

    const sourceQuantAfterDispatch = await prisma.stockQuant.findUnique({
      where: {
        branchId_skuId: {
          branchId: sourceBranch.id,
          skuId: variant.id,
        },
      },
    });
    assert.equal(
      sourceQuantAfterDispatch?.onHand,
      initialSourceOnHand - transferQty,
      'Ton thuc te tai chi nhanh nguon phai giam tuong ung so luong xuat di',
    );

    const received = await adminTransferService.receiveTransfer(transferMove.id, {
      note: 'Thu kho dich da tiep nhan va kiem dem day du so luong',
    });
    assert.equal(received.status, StockMoveStatus.VALIDATED);

    const destQuantAfterReceive = await prisma.stockQuant.findUnique({
      where: {
        branchId_skuId: {
          branchId: destinationBranch.id,
          skuId: variant.id,
        },
      },
    });
    assert.ok(destQuantAfterReceive, 'StockQuant dich phai ton tai sau khi nhan hang');

    const ledgerEntries = await prisma.stockLedgerEntry.findMany({
      where: {
        stockMoveLine: {
          stockMoveId: transferMove.id,
        },
      },
    });

    const hasTransferOut = ledgerEntries.some(
      (entry) =>
        entry.entryType === StockLedgerEntryType.TRANSFER_OUT &&
        entry.deltaOnHand === -transferQty,
    );
    const hasTransferIn = ledgerEntries.some(
      (entry) =>
        entry.entryType === StockLedgerEntryType.TRANSFER_IN &&
        entry.deltaOnHand === transferQty,
    );

    assert.ok(hasTransferOut, 'So kho bat bien phai ghi nhan but toan TRANSFER_OUT');
    assert.ok(hasTransferIn, 'So kho bat bien phai ghi nhan but toan TRANSFER_IN');
  });

  test('Scenario 2: Custom PC Order Full Lifecycle from Confirmation to Complete and Review', async () => {
    const adminId = await getTestAdminId();
    const branch = await prisma.branch.findFirstOrThrow();
    const customer = await prisma.customer.findFirstOrThrow();
    const variant = await prisma.productVariant.findFirstOrThrow({
      where: { isActive: true, serialRequired: false },
      include: { productTemplate: true },
    });

    await prisma.stockQuant.upsert({
      where: {
        branchId_skuId: {
          branchId: branch.id,
          skuId: variant.id,
        },
      },
      update: {
        onHand: 10,
        reserved: 0,
        weightedAverageCost: 10000000,
      },
      create: {
        branchId: branch.id,
        skuId: variant.id,
        onHand: 10,
        reserved: 0,
        weightedAverageCost: 10000000,
      },
    });

    const timestamp = Date.now();
    const uniqueOrderCode = `ORD-PC-E2E-${timestamp}`;

    const order = await prisma.order.create({
      data: {
        code: uniqueOrderCode,
        idempotencyKey: `idemp-${uniqueOrderCode}`,
        customerId: customer.id,
        fulfillmentBranchId: branch.id,
        fulfillmentMethod: FulfillmentMethod.PICKUP,
        paymentMethod: PaymentMethod.COD,
        status: OrderStatus.PENDING_COD_CONFIRMATION,
        subtotal: 15000000,
        grandTotal: 15000000,
        receiverName: 'Nguyen Hoang Nam',
        receiverEmail: 'hoangnam.tech@gmail.com',
        receiverPhone: '0988234567',
        receiverEmailVerifiedAt: new Date(),
        receiverPhoneVerifiedAt: new Date(),
        branchSnapshot: { id: branch.id, name: branch.name },
        pricingSnapshot: { subtotal: '15000000', grandTotal: '15000000' },
        lines: {
          create: [
            {
              lineType: SalesLineType.SKU,
              skuId: variant.id,
              nameSnapshot: variant.productTemplate.name,
              skuSnapshot: variant.sku,
              quantity: 1,
              unitPrice: 15000000,
              netAmount: 15000000,
              sortOrder: 1,
              pcBuildKey: '00000000-0000-4000-c000-000000000001',
              pcBuildNameSnapshot: 'PC Custom Gaming',
              pcBuildTypeSnapshot: 'CUSTOM',
            },
            {
              lineType: SalesLineType.SERVICE,
              serviceType: ServiceType.ASSEMBLY,
              nameSnapshot: 'Dich vu lap rap PC chuyen nghiep',
              quantity: 1,
              unitPrice: 0,
              netAmount: 0,
              sortOrder: 2,
              pcBuildKey: '00000000-0000-4000-c000-000000000001',
              pcBuildNameSnapshot: 'PC Custom Gaming',
              pcBuildTypeSnapshot: 'CUSTOM',
            },
          ],
        },
        payment: {
          create: {
            method: PaymentMethod.COD,
            state: PaymentState.DEPOSIT_PAID,
            depositRequired: 1500000,
            codRemaining: 13500000,
            totalReceived: 1500000,
          },
        },
      },
      include: {
        lines: true,
        payment: true,
      },
    });

    const confirmRes = await orderFulfillmentInboundService.confirmCodOrder(order.id, adminId, {
      note: 'Xac nhan don lap rap PC Custom va khoa giu linh kien',
    });
    assert.equal(confirmRes.status, OrderStatus.CONFIRMED);

    const prepareRes = await orderFulfillmentInboundService.prepareComponents(order.id, adminId, {
      note: 'Bat dau soan linh kien, khoa quyen tu huy cua khach hang',
    });
    assert.equal(prepareRes.status, OrderStatus.PREPARING_COMPONENTS);

    const assembleRes = await orderFulfillmentInboundService.assembleOrder(order.id, adminId, {
      technicianName: 'Truong Phong Ky Thuat',
      serialAssignments: [],
    });
    assert.equal(assembleRes.status, OrderStatus.ASSEMBLING);

    const readyRes = await orderFulfillmentInboundService.readyForPickup(order.id, adminId, {
      note: 'Ke luu tru showroom KE-PC-VIP-01',
    });
    assert.equal(readyRes.status, OrderStatus.READY_FOR_PICKUP);

    const completeRes = await orderClosingService.completeOrder(order.id, adminId, {
      codCollectedAmount: 13500000,
      actorName: 'Thu Ngan Showroom',
      note: 'Khach den nhan may va thanh toan du tien mat',
    });
    assert.equal(completeRes.status, OrderStatus.COMPLETED);

    const updatedPayment = await prisma.payment.findUnique({
      where: { orderId: order.id },
    });
    assert.equal(updatedPayment?.state, PaymentState.PAID);
    assert.equal(Number(updatedPayment?.codRemaining), 0);
    assert.equal(Number(updatedPayment?.totalReceived), 15000000);

    const codEntry = await prisma.codCollection.findFirst({
      where: { paymentId: updatedPayment?.id },
    });
    assert.ok(codEntry, 'Nhat ky thu tien mat CodCollection phai duoc ghi nhan');
    assert.equal(Number(codEntry.amount), 13500000);
  });

  test('Scenario 3: Purchase Order Lifecycle with Exact Receipt and Weighted Average Cost', async () => {
    const adminId = await getTestAdminId();
    const branch = await prisma.branch.findFirstOrThrow();
    const variant = await prisma.productVariant.findFirstOrThrow({
      where: { isActive: true },
    });

    const supplier = await prisma.supplier.upsert({
      where: { code: 'SUP-VIENSON' },
      update: {},
      create: {
        code: 'SUP-VIENSON',
        name: 'Cong ty Co phan Vien Son',
        email: 'contact@vienson.vn',
        phone: '02838326085',
        address: '730 An Duong Vuong, Quan 5, TP.HCM',
        contactName: 'Nguyen Van Dai Dien',
        isActive: true,
      },
    });

    const timestamp = Date.now();
    const poCode = `PO-TEST-WAC-${timestamp}`;
    const unitCost = 10000000;
    const poQty = 2;

    const po = (await adminPurchaseOrderService.createPurchaseOrder({
      code: poCode,
      supplierId: supplier.id,
      receivingBranchId: branch.id,
      notes: 'Don mua PO kiem thu tinh toan gia von WAC va nhap kho 100%',
      lines: [
        {
          skuId: variant.id,
          quantity: poQty,
          agreedUnitCost: unitCost,
        },
      ],
    })) as { id: string; status: string };
    assert.equal(po.status, 'DRAFT');

    const confirmedPo = (await adminPurchaseOrderService.confirmPurchaseOrder(
      po.id,
      adminId,
    )) as { id: string; status: string };
    assert.equal(confirmedPo.status, 'CONFIRMED');

    const uniqueSerials = [
      `SN-PO-INB-${timestamp}-1`,
      `SN-PO-INB-${timestamp}-2`,
    ];

    const validatedPo = (await poReceiptService.validatePoReceipt(
      po.id,
      {
        lines: [
          {
            skuId: variant.id,
            receivedQuantity: poQty,
            serialNumbers: uniqueSerials,
          },
        ],
      },
      adminId,
    )) as { id: string; status: string };
    assert.equal(validatedPo.status, 'RECEIVED');

    const quant = await prisma.stockQuant.findUnique({
      where: {
        branchId_skuId: {
          branchId: branch.id,
          skuId: variant.id,
        },
      },
    });
    assert.ok(quant, 'StockQuant tai chi nhanh nhan phai ton tai');
    assert.ok(Number(quant.weightedAverageCost) > 0, 'Gia von binh quan WAC phai lon hon 0');

    const newSerials = await prisma.serialUnit.findMany({
      where: {
        serialNumber: { in: uniqueSerials },
      },
    });
    assert.equal(newSerials.length, 2, 'Phai tao du 2 so serial moi voi trang thai AVAILABLE');
    for (const sn of newSerials) {
      assert.equal(sn.status, SerialStatus.AVAILABLE);
      assert.equal(sn.currentBranchId, branch.id);
    }
  });

  test('Scenario 4: Delivery Failure, Redelivery Attempt, Return to Branch and PC Deposit Forfeiture', async () => {
    const adminId = await getTestAdminId();
    const branch = await prisma.branch.findFirstOrThrow();
    const customer = await prisma.customer.findFirstOrThrow();
    const variant = await prisma.productVariant.findFirstOrThrow({
      where: { isActive: true, serialRequired: false },
      include: { productTemplate: true },
    });

    const timestamp = Date.now();
    const uniqueOrderCode = `ORD-FAIL-RETURN-${timestamp}`;

    const order = await prisma.order.create({
      data: {
        code: uniqueOrderCode,
        idempotencyKey: `idemp-${uniqueOrderCode}`,
        customerId: customer.id,
        fulfillmentBranchId: branch.id,
        fulfillmentMethod: FulfillmentMethod.DELIVERY,
        paymentMethod: PaymentMethod.COD,
        status: OrderStatus.SHIPPING,
        subtotal: 20000000,
        grandTotal: 20000000,
        redeliveryAttemptCount: 0,
        receiverName: 'Nguyen Hoang Nam',
        receiverEmail: 'hoangnam.tech@gmail.com',
        receiverPhone: '0988234567',
        receiverEmailVerifiedAt: new Date(),
        receiverPhoneVerifiedAt: new Date(),
        branchSnapshot: { id: branch.id, name: branch.name },
        pricingSnapshot: { subtotal: '20000000', grandTotal: '20000000' },
        lines: {
          create: [
            {
              lineType: SalesLineType.SKU,
              skuId: variant.id,
              nameSnapshot: variant.productTemplate.name,
              skuSnapshot: variant.sku,
              quantity: 1,
              unitPrice: 20000000,
              netAmount: 20000000,
              sortOrder: 1,
              pcBuildKey: '00000000-0000-4000-c000-000000000002',
              pcBuildNameSnapshot: 'PC Custom Gaming VIP',
              pcBuildTypeSnapshot: 'CUSTOM',
            },
            {
              lineType: SalesLineType.SERVICE,
              serviceType: ServiceType.ASSEMBLY,
              nameSnapshot: 'Dich vu lap rap PC chuyen nghiep',
              quantity: 1,
              unitPrice: 0,
              netAmount: 0,
              sortOrder: 2,
              pcBuildKey: '00000000-0000-4000-c000-000000000002',
              pcBuildNameSnapshot: 'PC Custom Gaming VIP',
              pcBuildTypeSnapshot: 'CUSTOM',
            },
          ],
        },
        payment: {
          create: {
            method: PaymentMethod.COD,
            state: PaymentState.DEPOSIT_PAID,
            depositRequired: 2000000,
            codRemaining: 18000000,
            totalReceived: 2000000,
          },
        },
        stockMoves: {
          create: {
            code: `MOV-OUT-${uniqueOrderCode}`,
            idempotencyKey: `move-out:${uniqueOrderCode}`,
            moveType: StockMoveType.ORDER_ISSUE,
            status: StockMoveStatus.VALIDATED,
            sourceBranchId: branch.id,
            lines: {
              create: {
                skuId: variant.id,
                quantity: 1,
                unitCost: 10000000,
              },
            },
          },
        },
      },
      include: {
        lines: true,
        payment: true,
        stockMoves: true,
      },
    });

    const fail1 = await orderFulfillmentShippingService.deliveryFailed(order.id, adminId, {
      reason: 'Khach thue bao khong lien lac duoc lan 1',
    });
    assert.equal(fail1.status, OrderStatus.DELIVERY_FAILED);

    const redeliverRes = await orderFulfillmentShippingService.scheduleRedelivery(
      order.id,
      adminId,
      {
        redeliveryDate: '2026-10-30',
        note: 'Khach lien he lai hen giao vao cuoi tuan',
      },
    );
    assert.equal(redeliverRes.status, OrderStatus.SHIPPING);

    const updatedOrderAttempt = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
    });
    assert.equal(updatedOrderAttempt.redeliveryAttemptCount, 1);

    const fail2 = await orderFulfillmentShippingService.deliveryFailed(order.id, adminId, {
      reason: 'Khach ban di cong tac tu choi nhan lan 2',
    });
    assert.equal(fail2.status, OrderStatus.DELIVERY_FAILED);

    const returnRes = await orderFulfillmentShippingService.initiateReturn(order.id, adminId, {
      note: 'Giao that bai 2 lan, chuyen kien hang quay ve chi nhanh xuat phat',
    });
    assert.equal(returnRes.status, OrderStatus.RETURNING);

    const receiveReturnRes = await orderFulfillmentShippingService.receiveReturn(
      order.id,
      adminId,
      {
        note: 'Kiem dem kien hang nguyen ven niem phong khi nhan ve kho',
      },
    );
    assert.equal(receiveReturnRes.status, OrderStatus.RETURNED_TO_BRANCH);

    const cancelRes = await orderClosingService.cancelOrder(order.id, adminId, {
      reason: 'Huy don do khach khong nhan hang sau khi chuyen ve chi nhanh',
    });
    assert.equal(cancelRes.status, OrderStatus.CANCELLED);

    const cancelledPayment = await prisma.payment.findUniqueOrThrow({
      where: { orderId: order.id },
    });
    assert.equal(
      cancelledPayment.depositDisposition,
      DepositDisposition.FORFEITED,
      'Tien coc PC phai bi tich thu theo quy tac PAY-014',
    );
  });

  test('Scenario 5: VietQR Discrepancy, Hold Queue, Cancellation and Manual Bank Refund Confirmation', async () => {
    const adminId = await getTestAdminId();
    const branch = await prisma.branch.findFirstOrThrow();
    const customer = await prisma.customer.findFirstOrThrow();
    const variant = await prisma.productVariant.findFirstOrThrow({
      where: { isActive: true },
      include: { productTemplate: true },
    });

    const timestamp = Date.now();
    const uniqueOrderCode = `ORD-QR-DISCREPANCY-${timestamp}`;

    const order = await prisma.order.create({
      data: {
        code: uniqueOrderCode,
        idempotencyKey: `idemp-${uniqueOrderCode}`,
        customerId: customer.id,
        fulfillmentBranchId: branch.id,
        fulfillmentMethod: FulfillmentMethod.DELIVERY,
        paymentMethod: PaymentMethod.QR,
        status: OrderStatus.ON_HOLD,
        subtotal: 5200000,
        grandTotal: 5200000,
        holdReason: 'PAYMENT_REVIEW',
        receiverName: 'Nguyen Hoang Nam',
        receiverEmail: 'hoangnam.tech@gmail.com',
        receiverPhone: '0988234567',
        receiverEmailVerifiedAt: new Date(),
        receiverPhoneVerifiedAt: new Date(),
        branchSnapshot: { id: branch.id, name: branch.name },
        pricingSnapshot: { subtotal: '5200000', grandTotal: '5200000' },
        lines: {
          create: {
            lineType: SalesLineType.SKU,
            skuId: variant.id,
            nameSnapshot: variant.productTemplate.name,
            skuSnapshot: variant.sku,
            quantity: 1,
            unitPrice: 5200000,
            netAmount: 5200000,
            sortOrder: 1,
          },
        },
        payment: {
          create: {
            method: PaymentMethod.QR,
            state: PaymentState.UNPAID,
            totalReceived: 5000000,
            charges: {
              create: {
                idempotencyKey: `charge-${uniqueOrderCode}`,
                chargeType: PaymentChargeType.INITIAL_ORDER,
                providerReference: `QR-${uniqueOrderCode}`,
                expectedAmount: 5200000,
                status: PaymentChargeStatus.REVIEW,
                transactions: {
                  create: {
                    providerTransactionId: `TX-BANK-${uniqueOrderCode}`,
                    receivedAmount: 5000000,
                    normalizedResult: PaymentTransactionResult.UNDERPAID,
                    occurredAt: new Date(),
                    rawPayload: { discrepancy: true, expected: 5200000, received: 5000000 },
                  },
                },
              },
            },
          },
        },
      },
      include: {
        lines: true,
        payment: true,
      },
    });

    const resolveRes = await orderExceptionService.resolveQrDiscrepancy(order.id, adminId, {
      resolutionType: 'CANCEL_REFUND',
      note: 'Giao dich chuyen sai so tien khong hop le theo FQ36-A, huy don de hoan tien',
    });
    assert.ok(resolveRes.success);
    assert.equal(resolveRes.status, OrderStatus.CANCELLED);

    const refundRecord = await prisma.refund.findFirst({
      where: { payment: { orderId: order.id } },
      include: { payment: true },
    });
    assert.ok(refundRecord, 'Ban ghi hoan tien Refund phai duoc tao');
    assert.equal(refundRecord.status, RefundStatus.PENDING);
    assert.equal(Number(refundRecord.amount), 5000000);

    const bankTransactionCode = `FT${timestamp}99881`;
    const confirmRefundRes = await orderExceptionService.processManualRefund(
      refundRecord.id,
      adminId,
      {
        transactionReference: bankTransactionCode,
        note: 'Da chuyen khoan tra lai 100% so tien chuyen nham qua app ngan hang',
      },
    );
    assert.ok(confirmRefundRes.success);

    const finalizedRefund = await prisma.refund.findUniqueOrThrow({
      where: { id: refundRecord.id },
      include: { payment: true },
    });
    assert.equal(finalizedRefund.status, RefundStatus.CONFIRMED);
    assert.equal(finalizedRefund.transactionReference, bankTransactionCode);
    assert.equal(finalizedRefund.payment.state, PaymentState.REFUNDED);
  });
});
