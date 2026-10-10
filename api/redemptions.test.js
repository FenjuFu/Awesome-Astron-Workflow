import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPrizeAvailability, isPrizeExpired } from './redemptions.js';

test('buildPrizeAvailability marks limited prize as sold out after one active redemption', () => {
  const availability = buildPrizeAvailability(
    [
      {
        prize_id: 'tianjin_ai_innovation_conference_ticket_20250711',
        status: 'pending',
      },
      {
        prize_id: 'tianjin_ai_innovation_conference_ticket_20250711',
        status: 'rejected',
      },
    ],
    { tianjin_ai_innovation_conference_ticket_20250711: 1 }
  );

  assert.deepEqual(availability.tianjin_ai_innovation_conference_ticket_20250711, {
    inventory: 1,
    redeemed: 1,
    remaining: 0,
    soldOut: true,
  });
});

test('buildPrizeAvailability adds baseline redeemed to active redemptions', () => {
  const availability = buildPrizeAvailability(
    [{ prize_id: 'kubecon_openinfra_pytorch_china_20260907', status: 'pending' }],
    { kubecon_openinfra_pytorch_china_20260907: 5 },
    { kubecon_openinfra_pytorch_china_20260907: 1 }
  );

  assert.deepEqual(availability.kubecon_openinfra_pytorch_china_20260907, {
    inventory: 5,
    redeemed: 2,
    remaining: 3,
    soldOut: false,
  });
});

test('isPrizeExpired flips after the deadline', () => {
  const deadlines = { prize: '2026-11-30T23:59:59.999+08:00' };

  assert.equal(isPrizeExpired('prize', new Date('2026-11-30T23:59:59+08:00'), deadlines), false);
  assert.equal(isPrizeExpired('prize', new Date('2026-12-01T00:00:00+08:00'), deadlines), true);
  assert.equal(isPrizeExpired('no_deadline', new Date('2099-01-01T00:00:00Z'), deadlines), false);
});
