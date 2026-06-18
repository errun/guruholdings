import crypto from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const dataSourceDir = path.join(rootDir, 'data-source');
const generatedDir = path.join(rootDir, 'data-generated');
const rawDir = path.join(dataSourceDir, 'raw', 'sec-13f');
const rawIndexDir = path.join(dataSourceDir, 'raw-index');
const normalizedDir = path.join(generatedDir, 'normalized');
const snapshotsDir = path.join(generatedDir, 'snapshots');
const reportsDir = path.join(generatedDir, 'reports');

const userAgent = process.env.SEC_USER_AGENT || 'GuruHoldingsTracker/0.1 edwin@example.com';
const requestHeaders = {
  'User-Agent': userAgent,
  'Accept-Encoding': 'gzip, deflate',
};
let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureDir = async (dir) => {
  await mkdir(dir, { recursive: true });
};

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

const readJsonIfExists = async (file) => {
  try {
    return await readJson(file);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
};

const writeJson = async (file, value) => {
  await ensureDir(path.dirname(file));
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const secFetch = async (url, options = {}) => {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 160) {
    await sleep(160 - elapsed);
  }
  lastRequestAt = Date.now();

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...requestHeaders,
          ...(options.headers || {}),
        },
      });

      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`SEC request failed ${response.status} for ${url}`);
        await sleep(500 * attempt * attempt);
        continue;
      }

      if (!response.ok) {
        throw new Error(`SEC request failed ${response.status} for ${url}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      await sleep(500 * attempt * attempt);
    }
  }

  throw lastError;
};

const toQuarter = (dateString) => {
  const date = new Date(`${dateString}T00:00:00Z`);
  const month = date.getUTCMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `${date.getUTCFullYear()}Q${quarter}`;
};

const compareQuarter = (a, b) => {
  const [ay, aq] = a.split('Q').map(Number);
  const [by, bq] = b.split('Q').map(Number);
  return ay === by ? aq - bq : ay - by;
};

const normalizeCik = (cik) => String(cik).padStart(10, '0');
const archiveCik = (cik) => String(Number(cik));
const accessionNoDash = (accessionNumber) => accessionNumber.replaceAll('-', '');

const decodeXml = (value = '') =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();

const textFromTag = (block, tag) => {
  const pattern = new RegExp(`<(?:[A-Za-z0-9_]+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:[A-Za-z0-9_]+:)?${tag}>`, 'i');
  const match = block.match(pattern);
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, '')) : '';
};

const parseNumber = (value) => {
  if (!value) return 0;
  const parsed = Number(String(value).replaceAll(',', '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeIssuer = (name) => name.replace(/\s+/g, ' ').trim().toUpperCase();

const classifyThemes = (issuerName, themes) => {
  const normalized = normalizeIssuer(issuerName);
  const matches = themes
    .filter((theme) => theme.keywords.some((keyword) => normalized.includes(keyword.toUpperCase())))
    .map((theme) => theme.id);
  return matches.length ? matches : ['unclassified'];
};

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const createSecurityResolver = (securities = []) => {
  const canonicalCompanies = securities.map((security) => ({
    canonicalCompanyId: security.canonicalCompanyId,
    canonicalName: security.canonicalName,
    ticker: security.ticker || null,
    cusips: (security.cusips || []).map((cusip) => cusip.replace(/\s+/g, '').toUpperCase()),
    issuerAliases: (security.issuerAliases || []).map(normalizeIssuer),
    searchAliases: unique([
      ...(security.ticker ? String(security.ticker).split(/[\/,|]/).map((item) => item.trim()) : []),
      ...(security.searchAliases || []),
      ...(security.cusips || []),
      security.canonicalName,
    ]).map((item) => String(item).trim()).filter(Boolean),
    themes: security.themes || [],
    note: security.note || null,
  }));

  const byCusip = new Map();
  for (const company of canonicalCompanies) {
    for (const cusip of company.cusips) {
      byCusip.set(cusip, company);
    }
  }

  const resolve = (issuerName, cusip) => {
    const normalizedCusip = cusip.replace(/\s+/g, '').toUpperCase();
    const byExactCusip = byCusip.get(normalizedCusip);
    if (byExactCusip) return byExactCusip;

    const normalizedIssuer = normalizeIssuer(issuerName);
    return canonicalCompanies.find((company) =>
      company.issuerAliases.some((alias) => normalizedIssuer.includes(alias))
    ) || null;
  };

  return {
    canonicalCompanies,
    resolve,
  };
};

const pickFilings = (submission, count = 4) => {
  const recent = submission.filings?.recent;
  if (!recent?.form) return [];

  const rows = recent.form.map((form, index) => ({
    form,
    accessionNumber: recent.accessionNumber[index],
    filingDate: recent.filingDate[index],
    reportDate: recent.reportDate[index],
    primaryDocument: recent.primaryDocument[index],
  }));

  const eligible = rows
    .filter((row) => ['13F-HR', '13F-HR/A'].includes(row.form) && row.reportDate && row.accessionNumber)
    .map((row) => ({
      ...row,
      quarter: toQuarter(row.reportDate),
      isAmendment: row.form.endsWith('/A'),
    }))
    .sort((a, b) => {
      const byQuarter = compareQuarter(b.quarter, a.quarter);
      if (byQuarter !== 0) return byQuarter;
      const byDate = b.filingDate.localeCompare(a.filingDate);
      if (byDate !== 0) return byDate;
      return Number(b.isAmendment) - Number(a.isAmendment);
    });

  const byQuarter = new Map();
  for (const row of eligible) {
    if (!byQuarter.has(row.quarter)) {
      byQuarter.set(row.quarter, row);
    }
  }

  return Array.from(byQuarter.values()).slice(0, count);
};

const filingBaseUrl = (cik, accessionNumber) =>
  `https://www.sec.gov/Archives/edgar/data/${archiveCik(cik)}/${accessionNoDash(accessionNumber)}`;

const fetchFilingFiles = async (manager, filing) => {
  const baseUrl = filingBaseUrl(manager.cik, filing.accessionNumber);
  const indexUrl = `${baseUrl}/index.json`;
  const index = await (await secFetch(indexUrl)).json();
  const allXmlCandidates = (index.directory?.item || [])
    .map((item) => item.name)
    .filter((name) => name.toLowerCase().endsWith('.xml'));
  const xmlCandidates = [
    ...allXmlCandidates.filter((name) => name.toLowerCase() !== 'primary_doc.xml'),
    ...allXmlCandidates.filter((name) => name.toLowerCase() === 'primary_doc.xml'),
  ];

  let infoTableFile = null;
  let infoTableXml = '';
  let sourceFormat = 'xml';
  for (const name of xmlCandidates) {
    const xml = await (await secFetch(`${baseUrl}/${name}`)).text();
    if (xml.includes('<infoTable') || xml.includes(':infoTable')) {
      infoTableFile = name;
      infoTableXml = xml;
      break;
    }
  }

  const completeSubmissionUrl = `${baseUrl}/${filing.accessionNumber}.txt`;
  if (!infoTableFile) {
    const completeSubmissionText = await (await secFetch(completeSubmissionUrl)).text();
    const xmlDocuments = [...completeSubmissionText.matchAll(/<XML>([\s\S]*?)<\/XML>/gi)].map((match) => match[1].trim());
    const infoTableDocument = xmlDocuments.find((xml) => xml.includes('<infoTable') || xml.includes(':infoTable'));
    if (infoTableDocument) {
      infoTableFile = `${filing.accessionNumber}.txt#infotable`;
      infoTableXml = infoTableDocument;
      sourceFormat = 'complete-submission-text';
    }
  }

  if (!infoTableFile) {
    throw new Error(`No 13F infoTable XML found for ${manager.id} ${filing.accessionNumber}`);
  }

  return {
    baseUrl,
    indexUrl,
    index,
    infoTableFile,
    infoTableUrl: sourceFormat === 'xml' ? `${baseUrl}/${infoTableFile}` : completeSubmissionUrl,
    infoTableXml,
    sourceFormat,
  };
};

const parseInfoTable = (xml, manager, filing, themes, securityResolver) => {
  const blocks = xml.match(/<(?:[A-Za-z0-9_]+:)?infoTable\b[^>]*>[\s\S]*?<\/(?:[A-Za-z0-9_]+:)?infoTable>/gi) || [];
  const aggregated = new Map();

  for (const block of blocks) {
    const issuerName = textFromTag(block, 'nameOfIssuer');
    const titleOfClass = textFromTag(block, 'titleOfClass');
    const cusip = textFromTag(block, 'cusip').replace(/\s+/g, '').toUpperCase();
    const putCall = textFromTag(block, 'putCall').toUpperCase();
    const value = parseNumber(textFromTag(block, 'value'));
    const shares = parseNumber(textFromTag(block, 'sshPrnamt'));

    if (!issuerName || !cusip || value <= 0 || shares <= 0) {
      continue;
    }

    const securityId = putCall ? `${cusip}:${putCall}` : cusip;
    const canonicalSecurity = securityResolver.resolve(issuerName, cusip);
    const canonicalCompanyId = canonicalSecurity?.canonicalCompanyId || cusip;
    const companyId = putCall ? `${canonicalCompanyId}:${putCall}` : canonicalCompanyId;
    const positionType = putCall || 'SHARE';
    const detectedThemes = classifyThemes(issuerName, themes);
    const mergedThemes = unique([...detectedThemes, ...(canonicalSecurity?.themes || [])]);
    const existing = aggregated.get(securityId);
    if (existing) {
      existing.value += value;
      existing.shares += shares;
      existing.sourceRows += 1;
    } else {
      aggregated.set(securityId, {
        securityId,
        companyId,
        rawCompanyId: cusip,
        canonicalCompanyId,
        canonicalName: canonicalSecurity?.canonicalName || issuerName.trim(),
        canonicalTicker: canonicalSecurity?.ticker || null,
        canonicalCusips: canonicalSecurity?.cusips || [cusip],
        cusip,
        issuerName: issuerName.trim(),
        normalizedIssuerName: normalizeIssuer(issuerName),
        titleOfClass,
        putCall: putCall || null,
        positionType,
        value,
        shares,
        themes: mergedThemes,
        sourceRows: 1,
        managerId: manager.id,
        quarter: filing.quarter,
        accessionNumber: filing.accessionNumber,
        filingDate: filing.filingDate,
        reportDate: filing.reportDate,
      });
    }
  }

  const holdings = Array.from(aggregated.values()).sort((a, b) => b.value - a.value);
  const totalValue = holdings.reduce((sum, item) => sum + item.value, 0);

  return holdings.map((holding, index) => ({
    ...holding,
    rank: index + 1,
    weight: totalValue > 0 ? (holding.value / totalValue) * 100 : 0,
  }));
};

const aggregateCompanyHoldings = (holdings) => {
  const aggregated = new Map();

  for (const holding of holdings) {
    const companyId = holding.companyId || holding.securityId;
    const existing = aggregated.get(companyId);
    if (existing) {
      existing.value += holding.value;
      existing.shares += holding.shares;
      existing.sourceRows += holding.sourceRows || 1;
      existing.securityIds.push(holding.securityId);
      existing.rawCusips.push(holding.cusip);
      existing.issuerNames.push(holding.issuerName);
      existing.titleClasses.push(holding.titleOfClass);
      existing.themes = unique([...existing.themes, ...(holding.themes || [])]);
      existing.accessionNumbers.push(holding.accessionNumber);
    } else {
      aggregated.set(companyId, {
        securityId: companyId,
        companyId,
        rawCompanyId: holding.rawCompanyId,
        canonicalCompanyId: holding.canonicalCompanyId || companyId,
        canonicalName: holding.canonicalName || holding.issuerName,
        canonicalTicker: holding.canonicalTicker || null,
        canonicalCusips: holding.canonicalCusips || [holding.cusip],
        cusip: holding.cusip,
        rawCusips: [holding.cusip],
        issuerName: holding.canonicalName || holding.issuerName,
        issuerNames: [holding.issuerName],
        normalizedIssuerName: normalizeIssuer(holding.canonicalName || holding.issuerName),
        titleOfClass: holding.titleOfClass,
        titleClasses: [holding.titleOfClass],
        putCall: holding.putCall,
        positionType: holding.positionType || holding.putCall || 'SHARE',
        value: holding.value,
        shares: holding.shares,
        themes: holding.themes || ['unclassified'],
        sourceRows: holding.sourceRows || 1,
        securityIds: [holding.securityId],
        managerId: holding.managerId,
        quarter: holding.quarter,
        accessionNumber: holding.accessionNumber,
        accessionNumbers: [holding.accessionNumber],
        filingDate: holding.filingDate,
        reportDate: holding.reportDate,
      });
    }
  }

  const rows = Array.from(aggregated.values()).map((holding) => ({
    ...holding,
    rawCusips: unique(holding.rawCusips),
    issuerNames: unique(holding.issuerNames),
    titleClasses: unique(holding.titleClasses),
    securityIds: unique(holding.securityIds),
    accessionNumbers: unique(holding.accessionNumbers),
    cusip: unique(holding.rawCusips).join(', '),
    titleOfClass: unique(holding.titleClasses).length > 1 ? 'Aggregated classes' : holding.titleOfClass,
  })).sort((a, b) => b.value - a.value);

  const totalValue = rows.reduce((sum, item) => sum + item.value, 0);
  return rows.map((holding, index) => ({
    ...holding,
    rank: index + 1,
    weight: totalValue > 0 ? (holding.value / totalValue) * 100 : 0,
  }));
};

const buildCompanyHoldingsByQuarter = (holdingsByQuarter) =>
  Object.fromEntries(
    Object.entries(holdingsByQuarter).map(([quarter, holdings]) => [quarter, aggregateCompanyHoldings(holdings)])
  );

const computeManagerChanges = (manager, quarterHoldings, keyField = 'securityId') => {
  const quarters = Object.keys(quarterHoldings).sort(compareQuarter);
  const changesByQuarter = {};

  for (let i = 0; i < quarters.length; i += 1) {
    const quarter = quarters[i];
    const previousQuarter = quarters[i - 1] || null;
    const currentMap = new Map((quarterHoldings[quarter] || []).map((item) => [item[keyField], item]));
    const previousMap = previousQuarter
      ? new Map((quarterHoldings[previousQuarter] || []).map((item) => [item[keyField], item]))
      : new Map();
    const ids = new Set([...currentMap.keys(), ...previousMap.keys()]);

    changesByQuarter[quarter] = Array.from(ids).map((id) => {
      const current = currentMap.get(id) || null;
      const previous = previousMap.get(id) || null;
      let changeType = 'unchanged';

      if (current && !previous) changeType = 'new';
      else if (!current && previous) changeType = 'exit';
      else if (current.shares > previous.shares) changeType = 'increase';
      else if (current.shares < previous.shares) changeType = 'decrease';

      const currentShares = current?.shares || 0;
      const previousShares = previous?.shares || 0;
      const currentValue = current?.value || 0;
      const previousValue = previous?.value || 0;
      const currentWeight = current?.weight || 0;
      const previousWeight = previous?.weight || 0;

      return {
        managerId: manager.id,
        managerName: manager.displayName,
        quarter,
        previousQuarter,
        securityId: current?.securityId || previous?.securityId || id,
        companyId: current?.companyId || previous?.companyId,
        rawCompanyId: current?.rawCompanyId || previous?.rawCompanyId,
        canonicalCompanyId: current?.canonicalCompanyId || previous?.canonicalCompanyId,
        canonicalName: current?.canonicalName || previous?.canonicalName,
        canonicalTicker: current?.canonicalTicker || previous?.canonicalTicker || null,
        canonicalCusips: current?.canonicalCusips || previous?.canonicalCusips || [],
        cusip: current?.cusip || previous?.cusip,
        rawCusips: current?.rawCusips || previous?.rawCusips || [current?.cusip || previous?.cusip].filter(Boolean),
        issuerNames: current?.issuerNames || previous?.issuerNames || [current?.issuerName || previous?.issuerName].filter(Boolean),
        securityIds: current?.securityIds || previous?.securityIds || [current?.securityId || previous?.securityId].filter(Boolean),
        issuerName: current?.issuerName || previous?.issuerName,
        titleOfClass: current?.titleOfClass || previous?.titleOfClass,
        putCall: current?.putCall || previous?.putCall || null,
        positionType: current?.positionType || previous?.positionType || 'SHARE',
        themes: current?.themes || previous?.themes || ['unclassified'],
        changeType,
        currentShares,
        previousShares,
        shareChange: currentShares - previousShares,
        shareChangePercent: previousShares > 0 ? ((currentShares - previousShares) / previousShares) * 100 : null,
        currentValue,
        previousValue,
        valueChange: currentValue - previousValue,
        currentWeight,
        previousWeight,
        weightChange: currentWeight - previousWeight,
        accessionNumber: current?.accessionNumber || previous?.accessionNumber,
        sourceUrl: current ? `${filingBaseUrl(manager.cik, current.accessionNumber)}` : null,
      };
    }).sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange));
  }

  return changesByQuarter;
};

const computeConsensus = (managers, latestQuarter) => {
  const changes = managers.flatMap((manager) => manager.companyChangesByQuarter[latestQuarter] || []);
  const byCompany = new Map();

  for (const change of changes) {
    if (!change.companyId) continue;
    if (!byCompany.has(change.companyId)) {
      byCompany.set(change.companyId, {
        companyId: change.companyId,
        canonicalCompanyId: change.canonicalCompanyId,
        canonicalName: change.canonicalName || change.issuerName,
        canonicalTicker: change.canonicalTicker || null,
        canonicalCusips: change.canonicalCusips || [],
        cusip: change.cusip,
        rawCusips: [],
        issuerName: change.issuerName,
        issuerNames: [],
        themes: change.themes,
        managers: [],
        increaseManagers: [],
        decreaseManagers: [],
        newManagers: [],
        exitManagers: [],
        divergent: false,
        currentShares: 0,
        previousShares: 0,
        netShareChange: 0,
        netValueChange: 0,
        netWeightChange: 0,
      });
    }

    const record = byCompany.get(change.companyId);
    record.rawCusips.push(...(change.rawCusips || [change.cusip].filter(Boolean)));
    record.issuerNames.push(...(change.issuerNames || [change.issuerName].filter(Boolean)));
    record.currentShares += change.currentShares;
    record.previousShares += change.previousShares;
    record.netShareChange += change.shareChange;
    record.managers.push({
      managerId: change.managerId,
      managerName: change.managerName,
      changeType: change.changeType,
      currentShares: change.currentShares,
      previousShares: change.previousShares,
      shareChange: change.shareChange,
      shareChangePercent: change.shareChangePercent,
      valueChange: change.valueChange,
      weightChange: change.weightChange,
      currentValue: change.currentValue,
      currentWeight: change.currentWeight,
    });
    record.netValueChange += change.valueChange;
    record.netWeightChange += change.weightChange;

    if (['increase', 'new'].includes(change.changeType)) record.increaseManagers.push(change.managerName);
    if (['decrease', 'exit'].includes(change.changeType)) record.decreaseManagers.push(change.managerName);
    if (change.changeType === 'new') record.newManagers.push(change.managerName);
    if (change.changeType === 'exit') record.exitManagers.push(change.managerName);
  }

  const records = Array.from(byCompany.values()).map((record) => ({
    ...record,
    rawCusips: unique(record.rawCusips),
    issuerNames: unique(record.issuerNames),
    netShareChangePercent: record.previousShares > 0 ? (record.netShareChange / record.previousShares) * 100 : null,
    divergent: record.increaseManagers.length > 0 && record.decreaseManagers.length > 0,
  }));

  const sharedIncrease = records
    .filter((record) => record.increaseManagers.length >= 2)
    .sort((a, b) => b.increaseManagers.length - a.increaseManagers.length || b.netValueChange - a.netValueChange);

  const sharedDecrease = records
    .filter((record) => record.decreaseManagers.length >= 2)
    .sort((a, b) => b.decreaseManagers.length - a.decreaseManagers.length || a.netValueChange - b.netValueChange);

  const divergent = records
    .filter((record) => record.divergent)
    .sort((a, b) => b.managers.length - a.managers.length);

  const themeMap = new Map();
  for (const record of records) {
    for (const theme of record.themes || ['unclassified']) {
      if (!themeMap.has(theme)) {
        themeMap.set(theme, {
          theme,
          companyCount: 0,
          increaseCount: 0,
          decreaseCount: 0,
          netValueChange: 0,
          netWeightChange: 0,
          managerIds: new Set(),
        });
      }
      const themeRecord = themeMap.get(theme);
      themeRecord.companyCount += 1;
      themeRecord.increaseCount += record.increaseManagers.length;
      themeRecord.decreaseCount += record.decreaseManagers.length;
      themeRecord.netValueChange += record.netValueChange;
      themeRecord.netWeightChange += record.netWeightChange;
      record.managers.forEach((manager) => themeRecord.managerIds.add(manager.managerId));
    }
  }

  const themeChanges = Array.from(themeMap.values())
    .map((theme) => ({
      ...theme,
      managerCount: theme.managerIds.size,
      managerIds: Array.from(theme.managerIds),
    }))
    .sort((a, b) => Math.abs(b.netValueChange) - Math.abs(a.netValueChange));

  return {
    quarter: latestQuarter,
    managerCount: new Set(changes.map((change) => change.managerId)).size,
    changeCount: changes.length,
    sharedIncrease,
    sharedDecrease,
    divergent,
    themeChanges,
  };
};

const changeTypes = ['new', 'exit', 'increase', 'decrease', 'unchanged'];

const computeChangeCounts = (changes = []) =>
  Object.fromEntries(changeTypes.map((type) => [type, changes.filter((change) => change.changeType === type).length]));

const computeTop10Weight = (companyHoldings = []) =>
  companyHoldings.slice(0, 10).reduce((sum, holding) => sum + (holding.weight || 0), 0);

const computeThemeAllocation = (companyHoldings = []) => {
  const totalValue = companyHoldings.reduce((sum, holding) => sum + holding.value, 0);
  const byTheme = new Map();

  for (const holding of companyHoldings) {
    const themes = holding.themes?.length ? holding.themes : ['unclassified'];
    const valuePerTheme = holding.value / themes.length;
    for (const theme of themes) {
      if (!byTheme.has(theme)) {
        byTheme.set(theme, {
          theme,
          value: 0,
          holdingCount: 0,
          topCompanies: [],
        });
      }
      const record = byTheme.get(theme);
      record.value += valuePerTheme;
      record.holdingCount += 1;
      record.topCompanies.push({
        companyId: holding.companyId,
        canonicalName: holding.canonicalName || holding.issuerName,
        value: holding.value,
        weight: holding.weight,
      });
    }
  }

  return Array.from(byTheme.values())
    .map((record) => ({
      ...record,
      weight: totalValue > 0 ? (record.value / totalValue) * 100 : 0,
      topCompanies: record.topCompanies.sort((a, b) => b.value - a.value).slice(0, 5),
    }))
    .sort((a, b) => b.value - a.value);
};

const concentrationBucket = (companyHoldingCount, top10Weight) => {
  if (companyHoldingCount <= 15 || top10Weight >= 80) return 'focused';
  if (companyHoldingCount <= 60 || top10Weight >= 55) return 'balanced';
  return 'diversified';
};

const buildQuarterAnalytics = (quarters, holdingsByQuarter, companyHoldingsByQuarter, companyChangesByQuarter) =>
  quarters.map((quarter) => {
    const holdings = holdingsByQuarter[quarter] || [];
    const companyHoldings = companyHoldingsByQuarter[quarter] || [];
    const changes = companyChangesByQuarter[quarter] || [];
    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

    return {
      quarter,
      totalValue,
      holdingCount: holdings.length,
      companyHoldingCount: companyHoldings.length,
      top10Weight: computeTop10Weight(companyHoldings),
      changeCounts: computeChangeCounts(changes),
      themeAllocation: computeThemeAllocation(companyHoldings),
    };
  });

const buildManagerMetrics = (latestCompanyHoldings, latestCompanyChanges, quarterAnalytics) => {
  const changeCounts = computeChangeCounts(latestCompanyChanges);
  const top10Weight = computeTop10Weight(latestCompanyHoldings);
  const totalValue = latestCompanyHoldings.reduce((sum, holding) => sum + holding.value, 0);
  const newValue = latestCompanyChanges
    .filter((change) => change.changeType === 'new')
    .reduce((sum, change) => sum + change.currentValue, 0);
  const largestIncrease = latestCompanyChanges
    .filter((change) => ['increase', 'new'].includes(change.changeType))
    .sort((a, b) => b.valueChange - a.valueChange)[0] || null;
  const largestDecrease = latestCompanyChanges
    .filter((change) => ['decrease', 'exit'].includes(change.changeType))
    .sort((a, b) => a.valueChange - b.valueChange)[0] || null;
  const turnoverCount = changeCounts.new + changeCounts.exit;

  return {
    holdingCount: latestCompanyHoldings.length,
    top10Weight,
    concentration: concentrationBucket(latestCompanyHoldings.length, top10Weight),
    changeCounts,
    newValue,
    newValueWeight: totalValue > 0 ? (newValue / totalValue) * 100 : 0,
    turnoverCount,
    turnoverRate: latestCompanyHoldings.length > 0 ? (turnoverCount / latestCompanyHoldings.length) * 100 : 0,
    largestIncrease: largestIncrease ? toPublicChange(largestIncrease) : null,
    largestDecrease: largestDecrease ? toPublicChange(largestDecrease) : null,
    quarterTrend: quarterAnalytics,
  };
};

const buildStockIndex = (managers, latestQuarter, consensus) => {
  const recentQuarters = unique(managers.flatMap((manager) => manager.quarters || []))
    .sort(compareQuarter)
    .slice(-4);
  const byCompany = new Map();

  const ensureStock = (seed) => {
    const companyId = seed.companyId || seed.canonicalCompanyId || seed.securityId;
    if (!companyId) return null;

    if (!byCompany.has(companyId)) {
      byCompany.set(companyId, {
        companyId,
        canonicalCompanyId: seed.canonicalCompanyId || companyId,
        canonicalName: seed.canonicalName || seed.issuerName,
        canonicalTicker: seed.canonicalTicker || null,
        canonicalCusips: seed.canonicalCusips || [],
        rawCusips: [],
        issuerNames: [],
        themes: [],
        searchAliases: [],
        holders: [],
        rawHoldings: [],
      });
    }

    const record = byCompany.get(companyId);
    record.canonicalName = record.canonicalName || seed.canonicalName || seed.issuerName;
    record.canonicalTicker = record.canonicalTicker || seed.canonicalTicker || null;
    record.canonicalCusips = unique([...record.canonicalCusips, ...(seed.canonicalCusips || [])]);
    record.rawCusips = unique([...record.rawCusips, ...(seed.rawCusips || [seed.cusip]).filter(Boolean)]);
    record.issuerNames = unique([...record.issuerNames, ...(seed.issuerNames || [seed.issuerName]).filter(Boolean)]);
    record.themes = unique([...record.themes, ...(seed.themes || [])]);
    record.searchAliases = unique([
      ...record.searchAliases,
      seed.canonicalTicker,
      seed.canonicalName,
      seed.issuerName,
      ...(seed.canonicalCusips || []),
      ...(seed.rawCusips || [seed.cusip]).filter(Boolean),
    ]);
    return record;
  };

  for (const manager of managers) {
    const latestChangesByCompany = new Map((manager.latestCompanyChanges || []).map((change) => [change.companyId, change]));

    for (const holdings of Object.values(manager.companyHoldingsByQuarter || {})) {
      for (const holding of holdings) {
        ensureStock(holding);
      }
    }

    for (const holding of manager.latestCompanyHoldings || []) {
      const stock = ensureStock(holding);
      if (!stock) continue;
      const change = latestChangesByCompany.get(holding.companyId) || null;
      stock.holders.push({
        managerId: manager.id,
        managerName: manager.displayName,
        leadInvestor: manager.leadInvestor,
        quarter: manager.latestQuarter,
        value: holding.value,
        shares: holding.shares,
        weight: holding.weight,
        changeType: change?.changeType || 'unchanged',
        currentShares: change?.currentShares ?? holding.shares,
        previousShares: change?.previousShares ?? holding.shares,
        shareChange: change?.shareChange ?? 0,
        shareChangePercent: change?.shareChangePercent ?? 0,
        currentValue: change?.currentValue ?? holding.value,
        previousValue: change?.previousValue ?? holding.value,
        valueChange: change?.valueChange ?? 0,
        currentWeight: change?.currentWeight ?? holding.weight,
        previousWeight: change?.previousWeight ?? holding.weight,
        weightChange: change?.weightChange ?? 0,
        accessionNumber: holding.accessionNumber,
        filingDate: holding.filingDate,
        sourceUrl: manager.latestFiling?.sourceUrl || null,
      });
    }

    for (const holding of manager.latestHoldings || []) {
      const stock = ensureStock(holding);
      if (!stock) continue;
      stock.rawHoldings.push({
        managerId: manager.id,
        managerName: manager.displayName,
        quarter: manager.latestQuarter,
        securityId: holding.securityId,
        cusip: holding.cusip,
        issuerName: holding.issuerName,
        titleOfClass: holding.titleOfClass,
        value: holding.value,
        shares: holding.shares,
        weight: holding.weight,
        accessionNumber: holding.accessionNumber,
        filingDate: holding.filingDate,
        sourceUrl: manager.latestFiling?.sourceUrl || null,
      });
    }
  }

  const consensusSignalsByCompany = new Map();
  for (const item of consensus.sharedIncrease || []) {
    consensusSignalsByCompany.set(item.companyId, [
      ...(consensusSignalsByCompany.get(item.companyId) || []),
      { direction: 'increase', managerCount: item.increaseManagers.length, netShareChange: item.netShareChange, netValueChange: item.netValueChange, netWeightChange: item.netWeightChange },
    ]);
  }
  for (const item of consensus.sharedDecrease || []) {
    consensusSignalsByCompany.set(item.companyId, [
      ...(consensusSignalsByCompany.get(item.companyId) || []),
      { direction: 'decrease', managerCount: item.decreaseManagers.length, netShareChange: item.netShareChange, netValueChange: item.netValueChange, netWeightChange: item.netWeightChange },
    ]);
  }

  return Array.from(byCompany.values())
    .map((stock) => {
      const quarters = recentQuarters.map((quarter) => {
        const holders = [];
        for (const manager of managers) {
          const holding = (manager.companyHoldingsByQuarter?.[quarter] || []).find((item) => item.companyId === stock.companyId);
          if (!holding) continue;
          const change = (manager.companyChangesByQuarter?.[quarter] || []).find((item) => item.companyId === stock.companyId) || null;
          holders.push({
            managerId: manager.id,
            managerName: manager.displayName,
            value: holding.value,
            shares: holding.shares,
            weight: holding.weight,
            changeType: change?.changeType || 'unchanged',
            shareChange: change?.shareChange || 0,
            valueChange: change?.valueChange || 0,
            weightChange: change?.weightChange || 0,
          });
        }
        return {
          quarter,
          holderCount: holders.length,
          totalValue: holders.reduce((sum, holder) => sum + holder.value, 0),
          totalShares: holders.reduce((sum, holder) => sum + holder.shares, 0),
          holders,
        };
      });
      const sortedHolders = stock.holders.sort((a, b) => b.value - a.value);
      const latestTotalValue = sortedHolders.reduce((sum, holder) => sum + holder.value, 0);
      const latestTotalShares = sortedHolders.reduce((sum, holder) => sum + holder.shares, 0);
      const aliases = unique([
        stock.canonicalTicker,
        stock.canonicalName,
        ...stock.searchAliases,
        ...stock.canonicalCusips,
        ...stock.rawCusips,
        ...stock.issuerNames,
      ]).filter(Boolean);

      return {
        companyId: stock.companyId,
        canonicalCompanyId: stock.canonicalCompanyId,
        canonicalName: stock.canonicalName,
        canonicalTicker: stock.canonicalTicker,
        canonicalCusips: unique(stock.canonicalCusips),
        rawCusips: unique(stock.rawCusips),
        issuerNames: unique(stock.issuerNames),
        themes: stock.themes.length ? stock.themes : ['unclassified'],
        latestQuarter,
        latestHolderCount: sortedHolders.length,
        latestTotalValue,
        latestTotalShares,
        holders: sortedHolders,
        rawHoldings: stock.rawHoldings.sort((a, b) => b.value - a.value),
        quarters,
        consensusSignals: consensusSignalsByCompany.get(stock.companyId) || [],
        searchAliases: aliases,
        searchText: aliases.join(' ').toUpperCase(),
        href: `/stocks/${encodeURIComponent(stock.companyId)}`,
      };
    })
    .sort((a, b) => b.latestTotalValue - a.latestTotalValue);
};

const buildSearchIndex = (stocks, managers, consensus) => ({
  stocks: stocks.map((stock) => ({
    companyId: stock.companyId,
    canonicalName: stock.canonicalName,
    canonicalTicker: stock.canonicalTicker,
    cusips: stock.rawCusips,
    themes: stock.themes,
    latestHolderCount: stock.latestHolderCount,
    latestTotalValue: stock.latestTotalValue,
    topHolders: stock.holders.slice(0, 4).map((holder) => ({
      managerId: holder.managerId,
      managerName: holder.managerName,
      value: holder.value,
      weight: holder.weight,
      changeType: holder.changeType,
    })),
    href: stock.href,
    searchText: stock.searchText,
  })),
  managers: managers.map((manager) => ({
    id: manager.id,
    displayName: manager.displayName,
    managerName: manager.managerName,
    leadInvestor: manager.leadInvestor,
    cik: manager.cik,
    latestQuarter: manager.latestQuarter,
    latestTotalValue: manager.latestTotalValue,
    latestHoldingCount: manager.latestHoldingCount,
    companyHoldingCount: manager.companyHoldings.length,
    top10Weight: manager.metrics?.top10Weight || 0,
    concentration: manager.metrics?.concentration || 'unknown',
    href: `/live-13f/${manager.id}`,
    searchText: unique([
      manager.id,
      manager.displayName,
      manager.managerName,
      manager.leadInvestor,
      manager.cik,
    ]).join(' ').toUpperCase(),
  })),
  consensus: [
    ...(consensus.sharedIncrease || []).map((item) => ({
      direction: 'increase',
      companyId: item.companyId,
      canonicalName: item.canonicalName || item.issuerName,
      canonicalTicker: item.canonicalTicker,
      cusips: item.rawCusips,
      managerCount: item.increaseManagers.length,
      netShareChange: item.netShareChange,
      netValueChange: item.netValueChange,
      netWeightChange: item.netWeightChange,
      href: `/stocks/${encodeURIComponent(item.companyId)}`,
      searchText: unique([item.canonicalName, item.issuerName, item.canonicalTicker, ...(item.rawCusips || [])]).join(' ').toUpperCase(),
    })),
    ...(consensus.sharedDecrease || []).map((item) => ({
      direction: 'decrease',
      companyId: item.companyId,
      canonicalName: item.canonicalName || item.issuerName,
      canonicalTicker: item.canonicalTicker,
      cusips: item.rawCusips,
      managerCount: item.decreaseManagers.length,
      netShareChange: item.netShareChange,
      netValueChange: item.netValueChange,
      netWeightChange: item.netWeightChange,
      href: `/stocks/${encodeURIComponent(item.companyId)}`,
      searchText: unique([item.canonicalName, item.issuerName, item.canonicalTicker, ...(item.rawCusips || [])]).join(' ').toUpperCase(),
    })),
  ],
});

const toPublicHolding = (holding) => ({
  rank: holding.rank,
  securityId: holding.securityId,
  companyId: holding.companyId,
  rawCompanyId: holding.rawCompanyId,
  canonicalCompanyId: holding.canonicalCompanyId,
  canonicalName: holding.canonicalName,
  canonicalTicker: holding.canonicalTicker,
  canonicalCusips: holding.canonicalCusips,
  cusip: holding.cusip,
  rawCusips: holding.rawCusips,
  issuerNames: holding.issuerNames,
  securityIds: holding.securityIds,
  issuerName: holding.issuerName,
  titleOfClass: holding.titleOfClass,
  putCall: holding.putCall,
  positionType: holding.positionType,
  value: holding.value,
  shares: holding.shares,
  weight: holding.weight,
  themes: holding.themes,
  sourceRows: holding.sourceRows,
  quarter: holding.quarter,
  accessionNumber: holding.accessionNumber,
  filingDate: holding.filingDate,
  reportDate: holding.reportDate,
});

const toPublicChange = (change) => ({
  securityId: change.securityId,
  companyId: change.companyId,
  rawCompanyId: change.rawCompanyId,
  canonicalCompanyId: change.canonicalCompanyId,
  canonicalName: change.canonicalName,
  canonicalTicker: change.canonicalTicker,
  canonicalCusips: change.canonicalCusips,
  cusip: change.cusip,
  rawCusips: change.rawCusips,
  issuerNames: change.issuerNames,
  securityIds: change.securityIds,
  issuerName: change.issuerName,
  titleOfClass: change.titleOfClass,
  putCall: change.putCall,
  positionType: change.positionType,
  themes: change.themes,
  changeType: change.changeType,
  currentShares: change.currentShares,
  previousShares: change.previousShares,
  shareChange: change.shareChange,
  shareChangePercent: change.shareChangePercent,
  currentValue: change.currentValue,
  previousValue: change.previousValue,
  valueChange: change.valueChange,
  currentWeight: change.currentWeight,
  previousWeight: change.previousWeight,
  weightChange: change.weightChange,
  quarter: change.quarter,
  previousQuarter: change.previousQuarter,
  accessionNumber: change.accessionNumber,
  sourceUrl: change.sourceUrl || null,
});

const toPublicManager = (manager) => ({
  id: manager.id,
  displayName: manager.displayName,
  managerName: manager.managerName,
  leadInvestor: manager.leadInvestor,
  cik: manager.cik,
  latestQuarter: manager.latestQuarter,
  latestFiling: manager.latestFiling,
  latestHoldingCount: manager.latestHoldingCount,
  latestTotalValue: manager.latestTotalValue,
  quarters: manager.quarters,
  quarterSummaries: manager.quarterSummaries,
  filings: manager.filings,
  holdings: manager.latestHoldings.map(toPublicHolding),
  companyHoldings: manager.latestCompanyHoldings.map(toPublicHolding),
  latestChanges: manager.latestChanges.map(toPublicChange),
  latestCompanyChanges: manager.latestCompanyChanges.map(toPublicChange),
  quarterlyCompanyChanges: Object.fromEntries(
    manager.quarters.map((quarter) => [
      quarter,
      (manager.companyChangesByQuarter[quarter] || []).map(toPublicChange),
    ])
  ),
  topHoldings: manager.topHoldings,
  topIncreases: manager.topIncreases,
  topDecreases: manager.topDecreases,
  metrics: manager.metrics,
  quarterAnalytics: manager.quarterAnalytics,
  themeAllocation: manager.themeAllocation,
  topHoldingWeights: manager.topHoldingWeights,
});

const validateSnapshot = (snapshot, expectedManagerCount) => {
  const fatal = [];
  const warnings = [];

  if (snapshot.managers.length !== expectedManagerCount) {
    fatal.push(`manager_count_mismatch:expected_${expectedManagerCount}:actual_${snapshot.managers.length}`);
  }
  if (!snapshot.latestQuarter) fatal.push('missing_latest_quarter');
  if (!snapshot.consensus) fatal.push('missing_consensus');
  if (!Array.isArray(snapshot.stocks) || snapshot.stocks.length === 0) fatal.push('missing_stock_index');
  if (!snapshot.searchIndex?.stocks?.length || !snapshot.searchIndex?.managers?.length || !snapshot.searchIndex?.consensus?.length) {
    fatal.push('missing_search_index');
  }
  if (!snapshot.securityNormalization?.canonicalCompanies?.length) {
    fatal.push('missing_security_normalization_config');
  }

  for (const manager of snapshot.managers) {
    if (!manager.latestQuarter) fatal.push(`missing_latest_quarter:${manager.id}`);
    if (!manager.latestFiling?.accessionNumber) fatal.push(`missing_accession:${manager.id}`);
    if (!manager.latestFiling?.sourceUrl) fatal.push(`missing_source_url:${manager.id}`);
    if (!manager.latestFiling?.infoTableSha256) fatal.push(`missing_source_hash:${manager.id}`);
    if (manager.latestHoldingCount <= 0) fatal.push(`empty_latest_holdings:${manager.id}`);
    if (!Array.isArray(manager.holdings) || manager.holdings.length !== manager.latestHoldingCount) {
      fatal.push(`public_holdings_incomplete:${manager.id}`);
    }
    if (!Array.isArray(manager.companyHoldings) || manager.companyHoldings.length === 0) {
      fatal.push(`missing_company_holdings:${manager.id}`);
    }
    if (!Array.isArray(manager.latestCompanyChanges) || manager.latestCompanyChanges.length === 0) {
      fatal.push(`missing_company_changes:${manager.id}`);
    }
    if (!manager.quarterlyCompanyChanges || Object.keys(manager.quarterlyCompanyChanges).length < 4) {
      fatal.push(`missing_quarterly_company_changes:${manager.id}`);
    }
    if (!Array.isArray(manager.quarterSummaries) || manager.quarterSummaries.length < 4) {
      fatal.push(`quarter_history_below_4:${manager.id}`);
    }
    if (!manager.metrics?.changeCounts || !Array.isArray(manager.quarterAnalytics) || manager.quarterAnalytics.length < 4) {
      fatal.push(`missing_manager_metrics:${manager.id}`);
    }
    if (!Array.isArray(manager.themeAllocation)) {
      fatal.push(`missing_manager_theme_allocation:${manager.id}`);
    }
    if (manager.latestQuarter !== snapshot.latestQuarter) {
      warnings.push(`manager_not_current_global_quarter:${manager.id}:${manager.latestQuarter}`);
    }
    if (manager.latestHoldingCount < 3) {
      warnings.push(`small_holding_count:${manager.id}:${manager.latestHoldingCount}`);
    }
  }

  if (snapshot.consensus.managerCount < 2) {
    warnings.push('consensus_latest_quarter_has_less_than_two_managers');
  }

  for (const requiredQuery of ['NVDA', 'ALPHABET', 'MICROSOFT', 'BILL ACKMAN']) {
    const query = requiredQuery.toUpperCase();
    const matchedStock = snapshot.searchIndex?.stocks?.some((item) => item.searchText?.includes(query));
    const matchedManager = snapshot.searchIndex?.managers?.some((item) => item.searchText?.includes(query));
    if (!matchedStock && !matchedManager) {
      fatal.push(`required_search_query_missing:${requiredQuery}`);
    }
  }

  return {
    status: fatal.length ? 'failed' : 'passed',
    fatal,
    warnings,
  };
};

const buildReport = (snapshot) => {
  const lines = [
    '# 13F Data Update Report',
    '',
    `Generated at: ${snapshot.generatedAt}`,
    `Latest quarter: ${snapshot.latestQuarter}`,
    `Validation: ${snapshot.validation.status}`,
    `Canonical companies: ${snapshot.securityNormalization?.canonicalCompanies?.length || 0}`,
    `Stock index: ${snapshot.stocks?.length || 0}`,
    `Search index: ${(snapshot.searchIndex?.stocks?.length || 0) + (snapshot.searchIndex?.managers?.length || 0) + (snapshot.searchIndex?.consensus?.length || 0)}`,
    '',
    '## Managers',
    '',
    '| Manager | Latest quarter | Filing date | Holdings | Total value | Accession |',
    '| --- | --- | --- | ---: | ---: | --- |',
  ];

  for (const manager of snapshot.managers) {
    lines.push(
      `| ${manager.displayName} | ${manager.latestQuarter} | ${manager.latestFiling.filingDate} | ${manager.latestHoldingCount} | ${Math.round(manager.latestTotalValue).toLocaleString('en-US')} | ${manager.latestFiling.accessionNumber} |`
    );
  }

  lines.push('', '## Consensus', '');
  lines.push(`Shared increases: ${snapshot.consensus.sharedIncrease.length}`);
  lines.push(`Shared decreases: ${snapshot.consensus.sharedDecrease.length}`);
  lines.push(`Divergent signals: ${snapshot.consensus.divergent.length}`);
  lines.push('', '## Validation', '');
  lines.push(`Fatal: ${snapshot.validation.fatal.length ? snapshot.validation.fatal.join(', ') : 'none'}`);
  lines.push(`Warnings: ${snapshot.validation.warnings.length ? snapshot.validation.warnings.join(', ') : 'none'}`);
  lines.push('');

  return `${lines.join('\n')}\n`;
};

const fingerprintSnapshot = (snapshot) =>
  sha256(JSON.stringify({
    dataSource: snapshot.dataSource,
    securityNormalization: snapshot.securityNormalization,
    latestQuarter: snapshot.latestQuarter,
    managers: snapshot.managers,
    consensus: snapshot.consensus,
    stocks: snapshot.stocks,
    searchIndex: snapshot.searchIndex,
    validation: snapshot.validation,
  }));

const main = async () => {
  await Promise.all([
    ensureDir(rawDir),
    ensureDir(rawIndexDir),
    ensureDir(normalizedDir),
    ensureDir(snapshotsDir),
    ensureDir(reportsDir),
  ]);

  const managersConfig = await readJson(path.join(dataSourceDir, 'managers.json'));
  const themes = await readJson(path.join(dataSourceDir, 'themes.json'));
  const securities = await readJson(path.join(dataSourceDir, 'securities.json'));
  const securityResolver = createSecurityResolver(securities);
  const runStartedAt = new Date().toISOString();
  const managerOutputs = [];
  const rawIndex = [];

  for (const manager of managersConfig) {
    const submissionUrl = `https://data.sec.gov/submissions/CIK${normalizeCik(manager.cik)}.json`;
    const submission = await (await secFetch(submissionUrl, { headers: { Host: 'data.sec.gov' } })).json();
    const filings = pickFilings(submission, 4);
    const holdingsByQuarter = {};
    const filingsOutput = [];

    for (const filing of filings) {
      const files = await fetchFilingFiles(manager, filing);
      const holdings = parseInfoTable(files.infoTableXml, manager, filing, themes, securityResolver);
      const quarterDir = path.join(rawDir, filing.quarter, manager.id, filing.accessionNumber);
      const metadata = {
        managerId: manager.id,
        managerName: manager.displayName,
        cik: normalizeCik(manager.cik),
        accessionNumber: filing.accessionNumber,
        form: filing.form,
        filingDate: filing.filingDate,
        reportDate: filing.reportDate,
        quarter: filing.quarter,
        indexUrl: files.indexUrl,
        infoTableUrl: files.infoTableUrl,
        infoTableFile: files.infoTableFile,
        sourceFormat: files.sourceFormat,
        infoTableSha256: sha256(files.infoTableXml),
        fetchedAt: runStartedAt,
        holdingCount: holdings.length,
      };

      await writeJson(path.join(quarterDir, 'index.json'), files.index);
      await writeFile(path.join(quarterDir, 'infotable.xml'), files.infoTableXml, 'utf8');
      await writeJson(path.join(quarterDir, 'metadata.json'), metadata);

      holdingsByQuarter[filing.quarter] = holdings;
      filingsOutput.push({
        ...filing,
        sourceUrl: files.infoTableUrl,
        indexUrl: files.indexUrl,
        sourceFormat: files.sourceFormat,
        infoTableSha256: metadata.infoTableSha256,
        holdingCount: holdings.length,
      });
      rawIndex.push(metadata);
    }

    const companyHoldingsByQuarter = buildCompanyHoldingsByQuarter(holdingsByQuarter);
    const changesByQuarter = computeManagerChanges(manager, holdingsByQuarter, 'securityId');
    const companyChangesByQuarter = computeManagerChanges(manager, companyHoldingsByQuarter, 'companyId');
    const quarters = Object.keys(holdingsByQuarter).sort(compareQuarter).reverse();
    const latestQuarter = quarters[0] || null;
    const latestHoldings = latestQuarter ? holdingsByQuarter[latestQuarter] : [];
    const latestChanges = latestQuarter ? changesByQuarter[latestQuarter] || [] : [];
    const latestCompanyHoldings = latestQuarter ? companyHoldingsByQuarter[latestQuarter] || [] : [];
    const latestCompanyChanges = latestQuarter ? companyChangesByQuarter[latestQuarter] || [] : [];
    const latestTotalValue = latestHoldings.reduce((sum, item) => sum + item.value, 0);
    const quarterSummaries = quarters.map((quarter) => {
      const quarterHoldings = holdingsByQuarter[quarter] || [];
      const quarterCompanyHoldings = companyHoldingsByQuarter[quarter] || [];
      const quarterCompanyChanges = companyChangesByQuarter[quarter] || [];
      const filing = filingsOutput.find((item) => item.quarter === quarter) || null;
      return {
        quarter,
        filingDate: filing?.filingDate || null,
        reportDate: filing?.reportDate || null,
        accessionNumber: filing?.accessionNumber || null,
        holdingCount: quarterHoldings.length,
        companyHoldingCount: quarterCompanyHoldings.length,
        totalValue: quarterHoldings.reduce((sum, item) => sum + item.value, 0),
        top10Weight: computeTop10Weight(quarterCompanyHoldings),
        changeCounts: computeChangeCounts(quarterCompanyChanges),
      };
    });
    const quarterAnalytics = buildQuarterAnalytics(quarters, holdingsByQuarter, companyHoldingsByQuarter, companyChangesByQuarter);
    const metrics = buildManagerMetrics(latestCompanyHoldings, latestCompanyChanges, quarterAnalytics);
    const themeAllocation = computeThemeAllocation(latestCompanyHoldings);
    const topHoldingWeights = latestCompanyHoldings.slice(0, 10).map((holding) => ({
      companyId: holding.companyId,
      canonicalName: holding.canonicalName || holding.issuerName,
      canonicalTicker: holding.canonicalTicker || null,
      value: holding.value,
      weight: holding.weight,
    }));

    const normalizedManager = {
      id: manager.id,
      displayName: manager.displayName,
      managerName: manager.managerName,
      leadInvestor: manager.leadInvestor,
      cik: normalizeCik(manager.cik),
      latestQuarter,
      latestFiling: filingsOutput.find((filing) => filing.quarter === latestQuarter) || null,
      latestHoldingCount: latestHoldings.length,
      latestTotalValue,
      quarters,
      quarterSummaries,
      filings: filingsOutput,
      holdingsByQuarter,
      companyHoldingsByQuarter,
      changesByQuarter,
      companyChangesByQuarter,
      latestHoldings,
      latestCompanyHoldings,
      latestChanges,
      latestCompanyChanges,
      metrics,
      quarterAnalytics,
      themeAllocation,
      topHoldingWeights,
      topHoldings: latestHoldings.slice(0, 12),
      topIncreases: latestCompanyChanges
        .filter((change) => ['increase', 'new'].includes(change.changeType))
        .sort((a, b) => b.valueChange - a.valueChange)
        .slice(0, 10),
      topDecreases: latestCompanyChanges
        .filter((change) => ['decrease', 'exit'].includes(change.changeType))
        .sort((a, b) => a.valueChange - b.valueChange)
        .slice(0, 10),
    };

    managerOutputs.push(normalizedManager);
    await writeJson(path.join(normalizedDir, `${manager.id}.json`), normalizedManager);
  }

  const allQuarters = managerOutputs.flatMap((manager) => manager.quarters);
  const latestQuarter = allQuarters.sort(compareQuarter).at(-1) || null;
  const consensus = computeConsensus(managerOutputs, latestQuarter);
  const publicManagers = managerOutputs.map(toPublicManager);
  const stocks = buildStockIndex(managerOutputs, latestQuarter, consensus);
  const searchIndex = buildSearchIndex(stocks, publicManagers, consensus);
  const baseSnapshot = {
    dataSource: 'SEC EDGAR 13F filings',
    securityNormalization: {
      source: 'data-source/securities.json',
      canonicalCompanies: securityResolver.canonicalCompanies,
    },
    latestQuarter,
    managers: publicManagers,
    consensus,
    stocks,
    searchIndex,
    validation: null,
  };
  baseSnapshot.validation = validateSnapshot(baseSnapshot, managersConfig.length);

  const dataFingerprint = fingerprintSnapshot(baseSnapshot);
  const snapshotPath = path.join(snapshotsDir, 'latest.json');
  const previousSnapshot = await readJsonIfExists(snapshotPath);
  const generatedAt =
    previousSnapshot?.dataFingerprint === dataFingerprint && previousSnapshot?.generatedAt
      ? previousSnapshot.generatedAt
      : runStartedAt;
  const snapshot = {
    generatedAt,
    dataFingerprint,
    ...baseSnapshot,
  };

  await writeJson(path.join(rawIndexDir, `${latestQuarter}.json`), rawIndex);

  if (snapshot.validation.status !== 'passed') {
    await writeJson(path.join(reportsDir, 'failed-latest.json'), snapshot);
    await writeFile(path.join(reportsDir, 'failed-latest.md'), buildReport(snapshot), 'utf8');
    throw new Error(`Data validation failed: ${snapshot.validation.fatal.join(', ')}`);
  }

  await writeJson(snapshotPath, snapshot);
  await writeFile(path.join(reportsDir, 'latest.md'), buildReport(snapshot), 'utf8');

  console.log(`Generated SEC 13F snapshot for ${latestQuarter}`);
  console.log(`Managers: ${snapshot.managers.length}`);
  console.log(`Shared increases: ${snapshot.consensus.sharedIncrease.length}`);
  console.log(`Shared decreases: ${snapshot.consensus.sharedDecrease.length}`);
  if (snapshot.validation.warnings.length) {
    console.warn(`Warnings: ${snapshot.validation.warnings.join(', ')}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
