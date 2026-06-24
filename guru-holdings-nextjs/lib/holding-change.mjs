const finiteOrNull = (value) => Number.isFinite(value) ? Number(value) : null;

export function buildHoldingChangeModel(change) {
  const action = change?.changeType || 'unchanged';
  const currentWeight = finiteOrNull(change?.currentWeight ?? change?.weight);
  const explicitPreviousWeight = finiteOrNull(change?.previousWeight);
  const weightDelta = finiteOrNull(change?.weightChange);
  const previousWeight = explicitPreviousWeight ?? (
    currentWeight !== null && weightDelta !== null ? currentWeight - weightDelta : null
  );
  const currentShares = finiteOrNull(change?.currentShares ?? change?.shares);
  const previousShares = finiteOrNull(change?.previousShares);
  const shareDelta = finiteOrNull(change?.shareChange) ?? (
    currentShares !== null && previousShares !== null ? currentShares - previousShares : null
  );
  const shareDeltaPercent = finiteOrNull(change?.shareChangePercent);
  const isNew = action === 'new';
  const isExit = action === 'exit';

  return {
    action,
    currentWeight,
    previousWeight,
    weightDelta: weightDelta ?? (
      currentWeight !== null && previousWeight !== null ? currentWeight - previousWeight : null
    ),
    currentShares,
    previousShares,
    shareDelta,
    shareDeltaPercent,
    isNew,
    isExit,
    isSpecial: isNew || isExit,
    showWeightTransition: !isNew && !isExit && currentWeight !== null && previousWeight !== null,
    specialWeight: isNew ? currentWeight : isExit ? previousWeight : null,
  };
}
