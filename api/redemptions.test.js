import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPrizeAvailability } from './redemptions.js';

test('buildPrizeAvailability marks limited prize as sold out after one active redemption', () => {
  const availability = buildPrizeAvailability([
    {
      prize_id: 'tianjin_ai_innovation_conference_ticket_20250711',
      status: 'pending',
    },
    {
      prize_id: 'tianjin_ai_innovation_conference_ticket_20250711',
      status: 'rejected',
    },
  ]);

  assert.deepEqual(availability.tianjin_ai_innovation_conference_ticket_20250711, {
    inventory: 1,
    redeemed: 1,
    remaining: 0,
    soldOut: true,
  });
});
