import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const userAgent = process.env.SEC_USER_AGENT || 'GuruHoldingsTracker/0.1 edwin@example.com';

let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const normalizeCik = (cik) => String(cik).padStart(10, '0');

const compareQuarter = (a, b) => {
  const [ay, aq] = a.split('Q').map(Number);
  const [by, bq] = b.split('Q').map(Number);
  return ay === by ? aq - bq : ay - by;
};

const secFetch = async (url) => {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 160) await sleep(160 - elapsed);
  lastRequestAt = Date.now();

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept-Encoding': 'gzip, deflate',
        },
      });

      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`SEC source returned ${response.status}: ${url}`);
        await sleep(500 * attempt * attempt);
        continue;
      }

      if (!response.ok) {
        throw new Error(`SEC source returned ${response.status}: ${url}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      await sleep(500 * attempt * attempt);
    }
  }

  throw lastError;
};

const loadJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(rootDir, relativePath), 'utf8'));

const readText = async (file, failures, failureCode) => {
  try {
    return await readFile(file, 'utf8');
  } catch (error) {
    failures.push(`${failureCode}:${error.code || error.message}`);
    return null;
  }
};

const requiredString = (value) => typeof value === 'string' && value.trim().length > 0;
const requiredNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const positiveNumber = (value) => requiredNumber(value) && value > 0;

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const validateHoldingSchema = (holding, context, failures) => {
  const required = ['securityId', 'companyId', 'cusip', 'issuerName', 'value', 'shares', 'weight', 'quarter', 'accessionNumber'];
  for (const key of required) {
    const value = holding?.[key];
    if (typeof value === 'number') {
      if (!requiredNumber(value)) failures.push(`invalid_holding_number:${context}:${key}`);
    } else if (!requiredString(value)) {
      failures.push(`missing_holding_field:${context}:${key}`);
    }
  }

  if (!positiveNumber(holding?.value)) failures.push(`non_positive_holding_value:${context}`);
  if (!positiveNumber(holding?.shares)) failures.push(`non_positive_holding_shares:${context}`);
  if (!Array.isArray(holding?.themes) || holding.themes.length === 0) {
    failures.push(`missing_holding_themes:${context}`);
  }
};

const validateManagerValueUnits = (manager, failures) => {
  const ratios = manager.holdings
    .filter((holding) => positiveNumber(holding.value) && positiveNumber(holding.shares))
    .map((holding) => holding.value / holding.shares);
  const medianPrice = median(ratios);
  const plausibleCount = ratios.filter((ratio) => ratio >= 1 && ratio <= 200000).length;
  const plausibleRatio = ratios.length ? plausibleCount / ratios.length : 0;

  if (!ratios.length || medianPrice === null) {
    failures.push(`value_share_unit_missing:${manager.id}`);
    return;
  }

  if (medianPrice < 1 || medianPrice > 200000 || plausibleRatio < 0.75) {
    failures.push(`value_share_unit_suspicious:${manager.id}:median_${medianPrice.toFixed(4)}:plausible_${plausibleRatio.toFixed(2)}`);
  }
};

const expectedChangeType = (current, previous) => {
  if (current && !previous) return 'new';
  if (!current && previous) return 'exit';
  if (current.shares > previous.shares) return 'increase';
  if (current.shares < previous.shares) return 'decrease';
  return 'unchanged';
};

const verifyChangesFromShares = (normalizedManager, failures) => {
  const quarters = Object.keys(normalizedManager.holdingsByQuarter || {}).sort(compareQuarter);
  for (let index = 0; index < quarters.length; index += 1) {
    const quarter = quarters[index];
    const previousQuarter = quarters[index - 1] || null;
    const currentMap = new Map((normalizedManager.holdingsByQuarter[quarter] || []).map((holding) => [holding.securityId, holding]));
    const previousMap = previousQuarter
      ? new Map((normalizedManager.holdingsByQuarter[previousQuarter] || []).map((holding) => [holding.securityId, holding]))
      : new Map();
    const actualMap = new Map((normalizedManager.changesByQuarter?.[quarter] || []).map((change) => [change.securityId, change]));
    const securityIds = new Set([...currentMap.keys(), ...previousMap.keys()]);

    if (actualMap.size !== securityIds.size) {
      failures.push(`change_count_mismatch:${normalizedManager.id}:${quarter}:expected_${securityIds.size}:actual_${actualMap.size}`);
    }

    for (const securityId of securityIds) {
      const current = currentMap.get(securityId) || null;
      const previous = previousMap.get(securityId) || null;
      const actual = actualMap.get(securityId);
      if (!actual) {
        failures.push(`missing_change:${normalizedManager.id}:${quarter}:${securityId}`);
        continue;
      }

      const currentShares = current?.shares || 0;
      const previousShares = previous?.shares || 0;
      const expected = expectedChangeType(current, previous);

      if (actual.changeType !== expected) {
        failures.push(`change_type_mismatch:${normalizedManager.id}:${quarter}:${securityId}:${actual.changeType}:${expected}`);
      }
      if (actual.currentShares !== currentShares || actual.previousShares !== previousShares) {
        failures.push(`change_share_mismatch:${normalizedManager.id}:${quarter}:${securityId}`);
      }
      if (actual.shareChange !== currentShares - previousShares) {
        failures.push(`change_delta_mismatch:${normalizedManager.id}:${quarter}:${securityId}`);
      }
    }
  }
};

const verifyConsensus = (snapshot, failures) => {
  const sharedIncrease = snapshot.consensus?.sharedIncrease || [];
  const sharedDecrease = snapshot.consensus?.sharedDecrease || [];

  if (sharedIncrease.length + sharedDecrease.length <= 0) {
    failures.push('missing_consensus_signals');
  }

  for (const item of sharedIncrease) {
    if (!Array.isArray(item.increaseManagers) || item.increaseManagers.length < 2) {
      failures.push(`shared_increase_less_than_2:${item.companyId || item.issuerName}`);
    }
  }

  for (const item of sharedDecrease) {
    if (!Array.isArray(item.decreaseManagers) || item.decreaseManagers.length < 2) {
      failures.push(`shared_decrease_less_than_2:${item.companyId || item.issuerName}`);
    }
  }
};

const verify = async () => {
  const snapshot = await loadJson('data-generated/snapshots/latest.json');
  const managersConfig = await loadJson('data-source/managers.json');
  const failures = [];
  const checks = [];

  if (snapshot.validation?.status !== 'passed') {
    failures.push(`snapshot_validation_not_passed:${snapshot.validation?.status}`);
  }

  if (!requiredString(snapshot.generatedAt)) failures.push('missing_generated_at');
  if (!requiredString(snapshot.dataFingerprint)) failures.push('missing_data_fingerprint');
  if (!requiredString(snapshot.latestQuarter)) failures.push('missing_latest_quarter');
  if (!Array.isArray(snapshot.managers) || snapshot.managers.length !== managersConfig.length) {
    failures.push(`manager_count_mismatch:expected_${managersConfig.length}:actual_${snapshot.managers?.length || 0}`);
  }

  const expectedById = new Map(managersConfig.map((manager) => [manager.id, normalizeCik(manager.cik)]));
  const actualIds = new Set(snapshot.managers?.map((manager) => manager.id) || []);
  for (const manager of managersConfig) {
    if (!actualIds.has(manager.id)) failures.push(`missing_fixed_manager:${manager.id}`);
  }

  verifyConsensus(snapshot, failures);

  for (const manager of snapshot.managers || []) {
    const expectedCik = expectedById.get(manager.id);
    if (!expectedCik) {
      failures.push(`unexpected_manager:${manager.id}`);
      continue;
    }
    if (normalizeCik(manager.cik) !== expectedCik) {
      failures.push(`cik_mismatch:${manager.id}:${manager.cik}:${expectedCik}`);
    }

    const normalizedManager = await loadJson(`data-generated/normalized/${manager.id}.json`);
    if (normalizedManager.cik !== expectedCik) {
      failures.push(`normalized_cik_mismatch:${manager.id}`);
    }
    if (!Array.isArray(normalizedManager.quarters) || normalizedManager.quarters.length < 4) {
      failures.push(`normalized_quarter_history_below_4:${manager.id}`);
    }

    if (!Array.isArray(manager.holdings) || manager.holdings.length === 0) {
      failures.push(`empty_public_holdings:${manager.id}`);
    }
    if (manager.holdings?.length !== manager.latestHoldingCount) {
      failures.push(`public_holding_count_mismatch:${manager.id}:${manager.holdings?.length || 0}:${manager.latestHoldingCount}`);
    }

    for (const holding of manager.holdings || []) {
      validateHoldingSchema(holding, `${manager.id}:${holding?.securityId || 'unknown'}`, failures);
    }
    validateManagerValueUnits(manager, failures);
    verifyChangesFromShares(normalizedManager, failures);

    const filing = manager.latestFiling;
    if (!filing?.sourceUrl || !filing?.infoTableSha256 || !filing?.accessionNumber || !filing?.quarter) {
      failures.push(`missing_source_or_hash:${manager.id}`);
      continue;
    }

    let sourceXml = '';
    try {
      sourceXml = await (await secFetch(filing.sourceUrl)).text();
    } catch (error) {
      failures.push(`sec_http_failed:${manager.id}:${error.message}`);
      continue;
    }

    if (!sourceXml.includes('<infoTable') && !sourceXml.includes(':infoTable')) {
      failures.push(`source_without_info_table:${manager.id}`);
    }

    const remoteHash = sha256(sourceXml);
    if (remoteHash !== filing.infoTableSha256) {
      failures.push(`remote_hash_mismatch:${manager.id}`);
    }

    const rawXmlPath = path.join(
      rootDir,
      'data-source',
      'raw',
      'sec-13f',
      filing.quarter,
      manager.id,
      filing.accessionNumber,
      'infotable.xml'
    );
    const localXml = await readText(rawXmlPath, failures, `missing_local_raw_xml:${manager.id}`);
    if (localXml && sha256(localXml) !== filing.infoTableSha256) {
      failures.push(`local_hash_mismatch:${manager.id}`);
    }

    checks.push({
      managerId: manager.id,
      quarter: filing.quarter,
      accessionNumber: filing.accessionNumber,
      sourceStatus: 200,
      holdingCount: manager.latestHoldingCount,
      quartersChecked: normalizedManager.quarters.length,
      hash: filing.infoTableSha256,
    });
  }

  const result = {
    status: failures.length ? 'failed' : 'passed',
    latestQuarter: snapshot.latestQuarter,
    generatedAt: snapshot.generatedAt,
    managerCount: snapshot.managers?.length || 0,
    checks,
    failures,
    warnings: snapshot.validation?.warnings || [],
  };

  console.log(JSON.stringify(result, null, 2));

  if (failures.length) {
    process.exitCode = 1;
  }
};

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
