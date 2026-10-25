import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  queryReviewsSchema,
  updateReviewVisibilitySchema,
} from '../src/validations/admin/review.schema.js';
import {
  queryNotificationsSchema,
} from '../src/validations/admin/notification.schema.js';

describe('TASK-61: Review Moderation and Notification Outbox Validation', () => {
  test('Review Moderation: queryReviewsSchema parses rating and isVisible parameters', () => {
    const query = {
      page: '2',
      limit: '15',
      rating: '5',
      isVisible: 'false',
      search: 'GeForce RTX',
    };

    const parsed = queryReviewsSchema.parse(query);
    assert.equal(parsed.page, 2);
    assert.equal(parsed.limit, 15);
    assert.equal(parsed.rating, 5);
    assert.equal(parsed.isVisible, 'false');
    assert.equal(parsed.search, 'GeForce RTX');
  });

  test('Review Moderation: updateReviewVisibilitySchema requires hiddenReason when isVisible is false', () => {
    assert.throws(
      () => {
        updateReviewVisibilitySchema.parse({
          isVisible: false,
          hiddenReason: '  ',
        });
      },
      (error: Error) => {
        return error.message.includes('Ly do an danh gia la bat buoc');
      },
    );

    const validHidden = updateReviewVisibilitySchema.parse({
      isVisible: false,
      hiddenReason: 'Danh gia spam kem link ngoai vi pham quy dinh',
    });
    assert.equal(validHidden.isVisible, false);
    assert.equal(validHidden.hiddenReason, 'Danh gia spam kem link ngoai vi pham quy dinh');

    const validRestore = updateReviewVisibilitySchema.parse({
      isVisible: true,
    });
    assert.equal(validRestore.isVisible, true);
  });

  test('Notification Outbox: queryNotificationsSchema parses channel, eventType and status', () => {
    const query = {
      page: '1',
      limit: '50',
      channel: 'EMAIL',
      eventType: 'ORDER_READY_FOR_PICKUP',
      status: 'SENT',
      search: 'ORD-2026-0891',
    };

    const parsed = queryNotificationsSchema.parse(query);
    assert.equal(parsed.page, 1);
    assert.equal(parsed.limit, 50);
    assert.equal(parsed.channel, 'EMAIL');
    assert.equal(parsed.eventType, 'ORDER_READY_FOR_PICKUP');
    assert.equal(parsed.status, 'SENT');
    assert.equal(parsed.search, 'ORD-2026-0891');
  });

  test('Notification Outbox: queryNotificationsSchema rejects invalid channel', () => {
    assert.throws(() => {
      queryNotificationsSchema.parse({
        channel: 'TELEGRAM',
      });
    });
  });
});
