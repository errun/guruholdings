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
const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const validateHoldingSchema = (holding, context, failures) => {
  const required = [
    'securityId',
    'companyId',
    'canonicalCompanyId',
    'canonicalName',
    'cusip',
    'issuerName',
    'positionType',
    'value',
    'shares',
    'weight',
    'quarter',
    'accessionNumber',
  ];
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

const extractInfoTableXml = (sourceText, sourceFormat) => {
  if (sourceFormat !== 'complete-submission-text') return sourceText;
  const xmlDocuments = [...sourceText.matchAll(/<XML>([\s\S]*?)<\/XML>/gi)].map((match) => match[1].trim());
  return xmlDocuments.find((xml) => xml.includes('<infoTable') || xml.includes(':infoTable')) || '';
};

const expectedChangeType = (current, previous) => {
  if (current && !previous) return 'new';
  if (!current && previous) return 'exit';
  if (current.shares > previous.shares) return 'increase';
  if (current.shares < previous.shares) return 'decrease';
  return 'unchanged';
};

const verifyChangesFromShares = (normalizedManager, failures, options = {}) => {
  const holdingsKey = options.holdingsKey || 'holdingsByQuarter';
  const changesKey = options.changesKey || 'changesByQuarter';
  const idKey = options.idKey || 'securityId';
  const label = options.label || 'security';
  const holdingsByQuarter = normalizedManager[holdingsKey] || {};
  const changesByQuarter = normalizedManager[changesKey] || {};
  const quarters = Object.keys(holdingsByQuarter).sort(compareQuarter);
  for (let index = 0; index < quarters.length; index += 1) {
    const quarter = quarters[index];
    const previousQuarter = quarters[index - 1] || null;
    const currentMap = new Map((holdingsByQuarter[quarter] || []).map((holding) => [holding[idKey], holding]));
    const previousMap = previousQuarter
      ? new Map((holdingsByQuarter[previousQuarter] || []).map((holding) => [holding[idKey], holding]))
      : new Map();
    const actualMap = new Map((changesByQuarter?.[quarter] || []).map((change) => [change[idKey], change]));
    const securityIds = new Set([...currentMap.keys(), ...previousMap.keys()]);

    if (actualMap.size !== securityIds.size) {
      failures.push(`${label}_change_count_mismatch:${normalizedManager.id}:${quarter}:expected_${securityIds.size}:actual_${actualMap.size}`);
    }

    for (const securityId of securityIds) {
      const current = currentMap.get(securityId) || null;
      const previous = previousMap.get(securityId) || null;
      const actual = actualMap.get(securityId);
      if (!actual) {
        failures.push(`missing_${label}_change:${normalizedManager.id}:${quarter}:${securityId}`);
        continue;
      }

      const currentShares = current?.shares || 0;
      const previousShares = previous?.shares || 0;
      const expected = expectedChangeType(current, previous);

      if (actual.changeType !== expected) {
        failures.push(`${label}_change_type_mismatch:${normalizedManager.id}:${quarter}:${securityId}:${actual.changeType}:${expected}`);
      }
      if (actual.currentShares !== currentShares || actual.previousShares !== previousShares) {
        failures.push(`${label}_change_share_mismatch:${normalizedManager.id}:${quarter}:${securityId}`);
      }
      if (actual.shareChange !== currentShares - previousShares) {
        failures.push(`${label}_change_delta_mismatch:${normalizedManager.id}:${quarter}:${securityId}`);
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
    if (!Array.isArray(item.managers) || item.managers.some((manager) => !requiredNumber(manager.shareChange) || !requiredNumber(manager.valueChange) || !requiredNumber(manager.weightChange))) {
      failures.push(`shared_increase_missing_change_amounts:${item.companyId || item.issuerName}`);
    }
    if (!Array.isArray(item.rawCusips) || item.rawCusips.length === 0) {
      failures.push(`shared_increase_missing_raw_cusips:${item.companyId || item.issuerName}`);
    }
  }

  for (const item of sharedDecrease) {
    if (!Array.isArray(item.decreaseManagers) || item.decreaseManagers.length < 2) {
      failures.push(`shared_decrease_less_than_2:${item.companyId || item.issuerName}`);
    }
    if (!Array.isArray(item.managers) || item.managers.some((manager) => !requiredNumber(manager.shareChange) || !requiredNumber(manager.valueChange) || !requiredNumber(manager.weightChange))) {
      failures.push(`shared_decrease_missing_change_amounts:${item.companyId || item.issuerName}`);
    }
    if (!Array.isArray(item.rawCusips) || item.rawCusips.length === 0) {
      failures.push(`shared_decrease_missing_raw_cusips:${item.companyId || item.issuerName}`);
    }
  }
};

const verifyCompanyHoldingsFromRaw = (normalizedManager, failures) => {
  for (const quarter of Object.keys(normalizedManager.holdingsByQuarter || {})) {
    const rawHoldings = normalizedManager.holdingsByQuarter[quarter] || [];
    const companyHoldings = normalizedManager.companyHoldingsByQuarter?.[quarter] || [];
    const expected = new Map();

    for (const holding of rawHoldings) {
      const key = holding.companyId;
      if (!expected.has(key)) {
        expected.set(key, {
          value: 0,
          shares: 0,
          rawCusips: [],
        });
      }
      const row = expected.get(key);
      row.value += holding.value;
      row.shares += holding.shares;
      row.rawCusips.push(holding.cusip);
    }

    const actual = new Map(companyHoldings.map((holding) => [holding.companyId, holding]));
    if (actual.size !== expected.size) {
      failures.push(`company_holding_count_mismatch:${normalizedManager.id}:${quarter}:expected_${expected.size}:actual_${actual.size}`);
    }

    for (const [companyId, expectedRow] of expected.entries()) {
      const actualRow = actual.get(companyId);
      if (!actualRow) {
        failures.push(`missing_company_holding:${normalizedManager.id}:${quarter}:${companyId}`);
        continue;
      }

      if (actualRow.value !== expectedRow.value || actualRow.shares !== expectedRow.shares) {
        failures.push(`company_holding_sum_mismatch:${normalizedManager.id}:${quarter}:${companyId}`);
      }

      const actualCusips = unique(actualRow.rawCusips || [actualRow.cusip]).sort().join(',');
      const expectedCusips = unique(expectedRow.rawCusips).sort().join(',');
      if (actualCusips !== expectedCusips) {
        failures.push(`company_holding_cusip_mismatch:${normalizedManager.id}:${quarter}:${companyId}`);
      }
    }
  }
};

const verifySecurityNormalization = (snapshot, securitiesConfig, normalizedManagers, failures) => {
  const alphabetConfig = securitiesConfig.find((security) => security.canonicalCompanyId === 'alphabet');
  if (!alphabetConfig) {
    failures.push('missing_alphabet_security_config');
    return;
  }

  const alphabetCusips = new Set((alphabetConfig.cusips || []).map((cusip) => cusip.replace(/\s+/g, '').toUpperCase()));
  for (const expectedCusip of ['02079K107', '02079K305']) {
    if (!alphabetCusips.has(expectedCusip)) {
      failures.push(`missing_alphabet_cusip:${expectedCusip}`);
    }
  }

  const snapshotConfig = snapshot.securityNormalization?.canonicalCompanies?.find((security) => security.canonicalCompanyId === 'alphabet');
  if (!snapshotConfig) {
    failures.push('missing_alphabet_snapshot_config');
  }

  for (const manager of normalizedManagers) {
    for (const [quarter, holdings] of Object.entries(manager.holdingsByQuarter || {})) {
      const alphabetRows = holdings.filter((holding) => alphabetCusips.has(holding.cusip));
      for (const holding of alphabetRows) {
        if (holding.canonicalCompanyId !== 'alphabet' || holding.companyId !== 'alphabet') {
          failures.push(`alphabet_raw_holding_not_normalized:${manager.id}:${quarter}:${holding.cusip}`);
        }
      }

      const groupedRawCusips = unique(alphabetRows.map((holding) => holding.cusip)).sort();
      if (groupedRawCusips.length > 0) {
        const companyHolding = manager.companyHoldingsByQuarter?.[quarter]?.find((holding) => holding.companyId === 'alphabet');
        if (!companyHolding) {
          failures.push(`missing_alphabet_company_holding:${manager.id}:${quarter}`);
        } else {
          const groupedCompanyCusips = unique(companyHolding.rawCusips || [companyHolding.cusip]).sort();
          if (groupedCompanyCusips.join(',') !== groupedRawCusips.join(',')) {
            failures.push(`alphabet_company_holding_cusips_not_merged:${manager.id}:${quarter}`);
          }
        }
      }
    }
  }
};

const verify = async () => {
  const snapshot = await loadJson('data-generated/snapshots/latest.json');
  const managersConfig = await loadJson('data-source/managers.json');
  const securitiesConfig = await loadJson('data-source/securities.json');
  const failures = [];
  const checks = [];
  const normalizedManagers = [];

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
    normalizedManagers.push(normalizedManager);
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
    if (!Array.isArray(manager.companyHoldings) || manager.companyHoldings.length === 0) {
      failures.push(`empty_public_company_holdings:${manager.id}`);
    }
    if (!Array.isArray(manager.latestCompanyChanges) || manager.latestCompanyChanges.length === 0) {
      failures.push(`empty_public_company_changes:${manager.id}`);
    }

    for (const holding of manager.holdings || []) {
      validateHoldingSchema(holding, `${manager.id}:${holding?.securityId || 'unknown'}`, failures);
    }
    for (const holding of manager.companyHoldings || []) {
      validateHoldingSchema(holding, `${manager.id}:company:${holding?.companyId || 'unknown'}`, failures);
    }
    validateManagerValueUnits(manager, failures);
    verifyChangesFromShares(normalizedManager, failures);
    verifyCompanyHoldingsFromRaw(normalizedManager, failures);
    verifyChangesFromShares(normalizedManager, failures, {
      holdingsKey: 'companyHoldingsByQuarter',
      changesKey: 'companyChangesByQuarter',
      idKey: 'companyId',
      label: 'company',
    });

    const filing = manager.latestFiling;
    if (!filing?.sourceUrl || !filing?.infoTableSha256 || !filing?.accessionNumber || !filing?.quarter) {
      failures.push(`missing_source_or_hash:${manager.id}`);
      continue;
    }

    let sourceXml = '';
    try {
      const sourceText = await (await secFetch(filing.sourceUrl)).text();
      sourceXml = extractInfoTableXml(sourceText, filing.sourceFormat);
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

  verifySecurityNormalization(snapshot, securitiesConfig, normalizedManagers, failures);

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
