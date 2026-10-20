/**
 * Unit tests for the Bayesian statistics in report.mjs.
 * Run with: node --test scripts/xp/report.test.mjs
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bayesianAnalysis, decisionRule } from './report.mjs';

test('bayesianAnalysis: control has null probBeatControl', () => {
  const result = bayesianAnalysis([
    { variant: 'A', n: 100, conversions: 10 },
    { variant: 'B', n: 100, conversions: 15 },
  ]);
  assert.equal(result[0].probBeatControl, null);
  assert.equal(result[0].expectedLoss, null);
});

test('bayesianAnalysis: clearly winning variant has high P(beat control)', () => {
  // B converts at 30% vs A at 5% with large n — should be near 1.0
  const result = bayesianAnalysis([
    { variant: 'A', n: 500, conversions: 25 },
    { variant: 'B', n: 500, conversions: 150 },
  ]);
  assert.ok(result[1].probBeatControl > 0.99, `Expected > 0.99, got ${result[1].probBeatControl}`);
});

test('bayesianAnalysis: equal performance gives ~50% P(beat control)', () => {
  const result = bayesianAnalysis([
    { variant: 'A', n: 1000, conversions: 100 },
    { variant: 'B', n: 1000, conversions: 100 },
  ]);
  const p = result[1].probBeatControl;
  assert.ok(p > 0.35 && p < 0.65, `Expected ~0.5, got ${p}`);
});

test('bayesianAnalysis: losing variant has low P(beat control)', () => {
  const result = bayesianAnalysis([
    { variant: 'A', n: 500, conversions: 150 },
    { variant: 'B', n: 500, conversions: 25 },
  ]);
  assert.ok(result[1].probBeatControl < 0.01, `Expected < 0.01, got ${result[1].probBeatControl}`);
});

test('bayesianAnalysis: three-variant A/B/C all get results', () => {
  const result = bayesianAnalysis([
    { variant: 'A', n: 200, conversions: 20 },
    { variant: 'B', n: 200, conversions: 30 },
    { variant: 'C', n: 200, conversions: 40 },
  ]);
  assert.equal(result.length, 3);
  assert.ok(result[2].probBeatControl > result[1].probBeatControl,
    'C should beat control more often than B');
});

test('bayesianAnalysis: deterministic results (same seed)', () => {
  const r1 = bayesianAnalysis([{ variant: 'A', n: 100, conversions: 10 }, { variant: 'B', n: 100, conversions: 15 }]);
  const r2 = bayesianAnalysis([{ variant: 'A', n: 100, conversions: 10 }, { variant: 'B', n: 100, conversions: 15 }]);
  assert.equal(r1[1].probBeatControl, r2[1].probBeatControl);
});

test('bayesianAnalysis: expectedLoss is non-negative', () => {
  const result = bayesianAnalysis([
    { variant: 'A', n: 100, conversions: 10 },
    { variant: 'B', n: 100, conversions: 15 },
  ]);
  assert.ok(result[1].expectedLoss >= 0);
});

test('decisionRule: WINNER when conditions met', () => {
  const d = decisionRule({ probBeatControl: 0.96, daysRunning: 25, minDays: 21, maxDays: 56, exposedPerVariant: 200 });
  assert.equal(d, 'WINNER');
});

test('decisionRule: KEEP RUNNING when not enough days', () => {
  const d = decisionRule({ probBeatControl: 0.96, daysRunning: 10, minDays: 21, maxDays: 56, exposedPerVariant: 200 });
  assert.equal(d, 'KEEP RUNNING');
});

test('decisionRule: KEEP RUNNING when not enough exposed', () => {
  const d = decisionRule({ probBeatControl: 0.96, daysRunning: 25, minDays: 21, maxDays: 56, exposedPerVariant: 50 });
  assert.equal(d, 'KEEP RUNNING');
});

test('decisionRule: KEEP RUNNING when probability too low', () => {
  const d = decisionRule({ probBeatControl: 0.80, daysRunning: 30, minDays: 21, maxDays: 56, exposedPerVariant: 200 });
  assert.equal(d, 'KEEP RUNNING');
});

test('decisionRule: NO DIFFERENCE at maxDays', () => {
  const d = decisionRule({ probBeatControl: 0.85, daysRunning: 56, minDays: 21, maxDays: 56, exposedPerVariant: 200 });
  assert.equal(d, 'NO DIFFERENCE');
});

test('decisionRule: WINNER takes priority over maxDays', () => {
  const d = decisionRule({ probBeatControl: 0.96, daysRunning: 60, minDays: 21, maxDays: 56, exposedPerVariant: 200 });
  assert.equal(d, 'WINNER');
});
