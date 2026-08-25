import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPrizeAvailability } from './redemptions.js';

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
