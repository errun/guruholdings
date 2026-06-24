import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildHoldingChangeModel } from '../../lib/holding-change.mjs';

const cases = [
  { changeType: 'increase', currentWeight: 3.4, previousWeight: 2.1, weightChange: 1.3, currentShares: 120, previousShares: 100, shareChange: 20 },
  { changeType: 'decrease', currentWeight: 1.2, previousWeight: 2.5, weightChange: -1.3, currentShares: 60, previousShares: 100, shareChange: -40 },
  { changeType: 'new', currentWeight: 1.8, previousWeight: 0, weightChange: 1.8, currentShares: 50, previousShares: 0, shareChange: 50 },
  { changeType: 'exit', currentWeight: 0, previousWeight: 2.4, weightChange: -2.4, currentShares: 0, previousShares: 70, shareChange: -70 },
  { changeType: 'unchanged', currentWeight: 4, previousWeight: 4, weightChange: 0, currentShares: 90, previousShares: 90, shareChange: 0 },
];

for (const input of cases) {
  const model = buildHoldingChangeModel(input);
  assert.equal(model.action, input.changeType);
  assert.equal(model.currentWeight, input.currentWeight);
  assert.equal(model.previousWeight, input.previousWeight);
  assert.ok(Math.abs(model.weightDelta - input.weightChange) < 1e-9);
  assert.equal(model.shareDelta, input.shareChange);
}

assert.equal(buildHoldingChangeModel(cases[0]).showWeightTransition, true);
assert.equal(buildHoldingChangeModel(cases[2]).isSpecial, true);
assert.equal(buildHoldingChangeModel(cases[2]).specialWeight, 1.8);
assert.equal(buildHoldingChangeModel(cases[3]).specialWeight, 2.4);

const derivedPrevious = buildHoldingChangeModel({ changeType: 'increase', currentWeight: 5, weightChange: 1.25 });
assert.equal(derivedPrevious.previousWeight, 3.75);

const missingPrevious = buildHoldingChangeModel({ changeType: 'unchanged', currentWeight: 5 });
assert.equal(missingPrevious.previousWeight, null);
assert.equal(missingPrevious.showWeightTransition, false);

const snapshot = JSON.parse(fs.readFileSync('data-generated/snapshots/latest.json', 'utf8'));
for (const manager of snapshot.managers) {
  for (const change of manager.latestCompanyChanges || []) {
    const model = buildHoldingChangeModel(change);
    if (model.currentWeight !== null && model.previousWeight !== null && model.weightDelta !== null) {
      assert.ok(Math.abs(model.previousWeight + model.weightDelta - model.currentWeight) < 1e-7, `${manager.id}:${change.companyId}`);
    }
  }
}

console.log(`Holding change check passed: ${cases.length} action states plus published snapshot formulas.`);
