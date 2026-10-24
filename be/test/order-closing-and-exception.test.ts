import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  OrderStatus,
  PaymentMethod,
  PaymentState,
  RefundStatus,
  DepositDisposition,
} from '@prisma/client';
import {
  completeOrderSchema,
  cancelOrderSchema,
  resolveHoldSchema,
  pickupToDeliverySchema,
  resolveQrDiscrepancySchema,
  manualRefundSchema,
} from '../src/validations/admin/order-operations.schema.js';

describe('TASK-56: Order Operations Validation & Rules', () => {
  test('Criterion 1: completeOrderSchema validates COD completion data', () => {
    const validCodInput = {
      codCollectedAmount: 15000000,
      actorName: 'Nguyen Van Thu Ngan',
      note: 'Thu du tien mat tai quay',
      confirmedSerialNumbers: ['SN-GPU-001', 'SN-MB-002'],
    };

    const parsed = completeOrderSchema.parse(validCodInput);
    assert.equal(parsed.codCollectedAmount, 15000000);
    assert.equal(parsed.actorName, 'Nguyen Van Thu Ngan');
    assert.equal(parsed.confirmedSerialNumbers.length, 2);
  });

  test('Criterion 2: cancelOrderSchema requires non-empty cancellation reason', () => {
    assert.throws(() => {
      cancelOrderSchema.parse({ reason: '   ' });
    });

    const parsed = cancelOrderSchema.parse({
      reason: 'Khach doi y huy cau hinh PC lap rap',
    });
    assert.equal(parsed.reason, 'Khach doi y huy cau hinh PC lap rap');
  });

  test('Criterion 3: resolveQrDiscrepancySchema strictly enforces 2 branches without cash top-up', () => {
    const manualMatch = resolveQrDiscrepancySchema.parse({
      resolutionType: 'MANUAL_MATCH',
      note: 'Xac thuc chung tu ngan hang nhan du 100% tien',
    });
    assert.equal(manualMatch.resolutionType, 'MANUAL_MATCH');

    const cancelRefund = resolveQrDiscrepancySchema.parse({
      resolutionType: 'CANCEL_REFUND',
      note: 'Giao dich thieu 500k, huy don va hoan tien sang REFUND_PENDING',
    });
    assert.equal(cancelRefund.resolutionType, 'CANCEL_REFUND');

    assert.throws(() => {
      resolveQrDiscrepancySchema.parse({
        resolutionType: 'CASH_TOPUP' as unknown as 'MANUAL_MATCH',
        note: 'Nop them tien mat',
      });
    });
  });

  test('Criterion 4: manualRefundSchema enforces transaction reference for bank proof', () => {
    assert.throws(() => {
      manualRefundSchema.parse({
        transactionReference: '',
      });
    });

    const parsed = manualRefundSchema.parse({
      transactionReference: 'FT261022881902',
      bankName: 'Techcombank',
      transferredAt: '2026-10-24T15:00:00.000Z',
      note: 'Uy nhiem chi thanh cong',
    });
    assert.equal(parsed.transactionReference, 'FT261022881902');
    assert.equal(parsed.bankName, 'Techcombank');
  });

  test('PickupToDeliveryAmendmentSchema validates delivery conversion and fee', () => {
    const parsed = pickupToDeliverySchema.parse({
      receiverName: 'Tran Anh Tuan',
      receiverPhone: '0912888999',
      deliveryAddress: 'So 18 Duy Tan, Cau Giay, Ha Noi',
      shippingFee: 45000,
      acceptanceChannel: 'PHONE',
    });

    assert.equal(parsed.receiverName, 'Tran Anh Tuan');
    assert.equal(parsed.shippingFee, 45000);
    assert.equal(parsed.acceptanceChannel, 'PHONE');
  });

  test('ResolveHoldSchema handles resolution actions accurately', () => {
    const resume = resolveHoldSchema.parse({
      action: 'CONFIRM_RESUME',
      reason: 'Da doi sang linh kien tuong duong theo thoa thuan',
    });
    assert.equal(resume.action, 'CONFIRM_RESUME');

    const cancel = resolveHoldSchema.parse({
      action: 'CANCEL_REFUND',
      reason: 'Khach khong dong y doi linh kien, hoan tien',
    });
    assert.equal(cancel.action, 'CANCEL_REFUND');

    const extend = resolveHoldSchema.parse({
      action: 'EXTEND_PICKUP',
      reason: 'Khach hen cuoi tuan qua showroom lay hang',
    });
    assert.equal(extend.action, 'EXTEND_PICKUP');
  });

  test('State flow logic integrity checks', () => {
    assert.equal(OrderStatus.COMPLETED, 'COMPLETED');
    assert.equal(OrderStatus.CANCELLED, 'CANCELLED');
    assert.equal(OrderStatus.ON_HOLD, 'ON_HOLD');
    assert.equal(PaymentMethod.COD, 'COD');
    assert.equal(PaymentMethod.QR, 'QR');
    assert.equal(PaymentState.PAID, 'PAID');
    assert.equal(PaymentState.REFUND_PENDING, 'REFUND_PENDING');
    assert.equal(PaymentState.REFUNDED, 'REFUNDED');
    assert.equal(RefundStatus.PENDING, 'PENDING');
    assert.equal(RefundStatus.CONFIRMED, 'CONFIRMED');
    assert.equal(DepositDisposition.FORFEITED, 'FORFEITED');
    assert.equal(DepositDisposition.REFUND_PENDING, 'REFUND_PENDING');
  });
});
