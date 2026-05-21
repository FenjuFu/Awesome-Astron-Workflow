import test from 'node:test';
import assert from 'node:assert/strict';

import { acquireSearchSlot, __resetSearchRateLimiters } from './github.js';

const SEARCH_RATE_LIMIT_PER_MINUTE = 28;
const REFILL_MS = 60_000 / SEARCH_RATE_LIMIT_PER_MINUTE;

test('acquireSearchSlot lets the initial burst through without waiting', async () => {
  __resetSearchRateLimiters();
  const token = 'burst-token';

  const start = Date.now();
  for (let i = 0; i < SEARCH_RATE_LIMIT_PER_MINUTE; i += 1) {
    await acquireSearchSlot(token);
  }
  const elapsed = Date.now() - start;

  // 28 sequential acquires from a full bucket should be near-instant. Pad
  // generously for slow CI.
  assert.ok(elapsed < 500, `expected initial burst to be fast, took ${elapsed}ms`);
});

test('acquireSearchSlot paces calls once the bucket is empty', async () => {
  __resetSearchRateLimiters();
  const token = 'paced-token';

  for (let i = 0; i < SEARCH_RATE_LIMIT_PER_MINUTE; i += 1) {
    await acquireSearchSlot(token);
  }

  const start = Date.now();
  await acquireSearchSlot(token);
  const elapsed = Date.now() - start;

  // The 29th call should wait at least one refill interval (~2143ms). Allow
  // a small floor to absorb timer jitter on slower machines.
  assert.ok(
    elapsed >= REFILL_MS - 100,
    `expected to wait ~${Math.round(REFILL_MS)}ms after the bucket drains, waited ${elapsed}ms`,
  );
});

test('acquireSearchSlot buckets are isolated per token', async () => {
  __resetSearchRateLimiters();

  // Drain bucket A completely.
  for (let i = 0; i < SEARCH_RATE_LIMIT_PER_MINUTE; i += 1) {
    await acquireSearchSlot('token-A');
  }

  // Bucket B should still be full and respond immediately.
  const start = Date.now();
  await acquireSearchSlot('token-B');
  const elapsed = Date.now() - start;

  assert.ok(elapsed < 100, `expected token-B to be unaffected, waited ${elapsed}ms`);
});

test('acquireSearchSlot returns immediately for unauthenticated callers', async () => {
  __resetSearchRateLimiters();
  const start = Date.now();
  await acquireSearchSlot(null);
  await acquireSearchSlot(undefined);
  await acquireSearchSlot('');
  const elapsed = Date.now() - start;

  assert.ok(elapsed < 50, `expected falsy tokens to bypass the limiter, took ${elapsed}ms`);
});

test('acquireSearchSlot serializes concurrent waiters fairly', async () => {
  __resetSearchRateLimiters();
  const token = 'queue-token';

  for (let i = 0; i < SEARCH_RATE_LIMIT_PER_MINUTE; i += 1) {
    await acquireSearchSlot(token);
  }

  // Fire three waiters in order; they should resolve roughly REFILL_MS apart.
  const start = Date.now();
  const resolvedAt = [];
  await Promise.all([
    acquireSearchSlot(token).then(() => resolvedAt.push(Date.now() - start)),
    acquireSearchSlot(token).then(() => resolvedAt.push(Date.now() - start)),
    acquireSearchSlot(token).then(() => resolvedAt.push(Date.now() - start)),
  ]);

  assert.equal(resolvedAt.length, 3);
  // First waiter releases after ~1 interval, third after ~3.
  assert.ok(
    resolvedAt[2] >= REFILL_MS * 2.5,
    `expected serialized waits, observed [${resolvedAt.join(', ')}]`,
  );
});
