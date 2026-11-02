type Filing = { reportDate: string; filingDate: string };
type Snapshot = { latestQuarter: string; generatedAt: string; dataFingerprint: string;
  managers: { latestQuarter: string; latestFiling: Filing }[] };
type Check = { checkedAt: string; dataFingerprint: string; latestQuarter: string; verifiedManagerCount: number };

// A scheduled date is an intention. Only successful, matching source verification
// may be presented as evidence that the site's holdings were checked.
export function getDataFreshness(snapshot: Snapshot, check: Check) {
  const currentManagers = snapshot.managers.filter(m => m.latestQuarter === snapshot.latestQuarter);
  const filings = currentManagers.map(m => m.latestFiling.filingDate).filter(Boolean).sort();
  const matches = check.dataFingerprint === snapshot.dataFingerprint && check.latestQuarter === snapshot.latestQuarter &&
    check.verifiedManagerCount === snapshot.managers.length && Number.isFinite(Date.parse(check.checkedAt)) &&
    Date.parse(check.checkedAt) >= Date.parse(snapshot.generatedAt);
  return {
    checkedAt: matches ? check.checkedAt : null,
    reportDate: currentManagers[0]?.latestFiling.reportDate || null,
    filingStart: filings[0] || null,
    filingEnd: filings.at(-1) || null,
    currentManagerCount: currentManagers.length,
    managerCount: snapshot.managers.length,
  };
}
