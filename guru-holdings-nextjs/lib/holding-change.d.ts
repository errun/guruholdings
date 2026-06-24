export type HoldingChangeInput = {
  changeType?: string;
  currentWeight?: number | null;
  previousWeight?: number | null;
  weight?: number | null;
  weightChange?: number | null;
  currentShares?: number | null;
  previousShares?: number | null;
  shares?: number | null;
  shareChange?: number | null;
  shareChangePercent?: number | null;
};

export type HoldingChangeModel = {
  action: string;
  currentWeight: number | null;
  previousWeight: number | null;
  weightDelta: number | null;
  currentShares: number | null;
  previousShares: number | null;
  shareDelta: number | null;
  shareDeltaPercent: number | null;
  isNew: boolean;
  isExit: boolean;
  isSpecial: boolean;
  showWeightTransition: boolean;
  specialWeight: number | null;
};

export function buildHoldingChangeModel(change: HoldingChangeInput): HoldingChangeModel;
