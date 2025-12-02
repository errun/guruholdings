'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { GuruData, TransformedGuruData, TransformedHolding, TransformedValueHistoryEntry, TransformedResourceItem, LocalizedText } from '@/lib/types';

const parseQuarter = (quarter: string): { year: number; quarter: number } => {
  const match = /^(\d{4})Q([1-4])$/.exec(quarter);
  if (!match) {
    return { year: 0, quarter: 0 };
  }
  return { year: Number(match[1]), quarter: Number(match[2]) };
};

const compareQuarters = (a: string, b: string): number => {
  const parsedA = parseQuarter(a);
  const parsedB = parseQuarter(b);

  if (parsedA.year !== parsedB.year) {
    return parsedA.year - parsedB.year;
  }

  return parsedA.quarter - parsedB.quarter;
};

interface TransformContext {
  localizeText: (value: LocalizedText | string | undefined) => string;
  formatQuarterLabel: (quarter: string) => string;
  t: (key: string, replacements?: Record<string, string | number>) => string | string[] | Record<string, unknown>;
}

const transformGuruData = (
  rawData: GuruData | null,
  { localizeText, formatQuarterLabel, t }: TransformContext
): TransformedGuruData | null => {
  if (!rawData) return null;

  const quarterSet = new Set<string>();

  rawData.valueHistory.forEach((entry) => {
    quarterSet.add(entry.quarter);
  });

  rawData.holdings.forEach((holding) => {
    Object.keys(holding.quarters).forEach((quarter) => {
      quarterSet.add(quarter);
    });
  });

  const sortedQuartersAsc = Array.from(quarterSet).sort(compareQuarters);
  const lastFourQuartersAsc = sortedQuartersAsc.slice(-4);
  const lastFourQuartersDesc = [...lastFourQuartersAsc].reverse();

  const overview = rawData.overview;

  const valueHistory: TransformedValueHistoryEntry[] = lastFourQuartersAsc.map((quarter) => {
    const match = rawData.valueHistory.find((item) => item.quarter === quarter);
    return {
      quarter,
      label: formatQuarterLabel(quarter),
      value: match ? match.value : 0,
    };
  });

  const holdings: TransformedHolding[] = rawData.holdings.map((holding) => {
    const quarters: TransformedHolding['quarters'] = {};
    lastFourQuartersDesc.forEach((quarter) => {
      if (holding.quarters[quarter]) {
        quarters[quarter] = holding.quarters[quarter];
      }
    });

    return {
      symbol: holding.symbol,
      companyName: localizeText(holding.companyName),
      currentShares: holding.currentShares,
      currentValue: holding.currentValue,
      currentWeight: holding.currentWeight,
      quarters,
    };
  });

  const insights = rawData.insights;
  const resources = rawData.resources;

  const mapResourceItems = (items: typeof resources.shareholderLetters): TransformedResourceItem[] =>
    items.map((item) => ({
      year: item.year,
      title: localizeText(item.title),
      description: localizeText(item.description),
      url: item.url,
    }));

  const riskLabel = insights.riskLevel ? String(t(`common.riskLevels.${insights.riskLevel}`)) : '';

  return {
    id: rawData.id,
    name: localizeText(overview.name),
    company: localizeText(overview.company),
    avatar: overview.avatar,
    description: localizeText(overview.description),
    highlights: overview.highlights.map((item) => localizeText(item)),
    lastUpdate: rawData.lastUpdate,
    lastUpdateLabel: formatQuarterLabel(rawData.lastUpdate),
    totalValue: rawData.totalValue,
    insights: {
      summary: localizeText(insights.summary),
      keyChanges: insights.keyChanges.map((item) => localizeText(item)),
      riskLevel: insights.riskLevel,
      riskLabel,
      diversification: localizeText(insights.diversification),
    },
    valueHistory,
    holdings,
    quarters: lastFourQuartersDesc,
    resources: {
      shareholderLetters: mapResourceItems(resources.shareholderLetters),
      meetingTranscripts: mapResourceItems(resources.meetingTranscripts),
    },
  };
};

interface UseHoldingsDataResult {
  data: TransformedGuruData | null;
  loading: boolean;
  error: string | null;
}

export const useHoldingsData = (guruId: string): UseHoldingsDataResult => {
  const { localizeText, formatQuarterLabel, t } = useLanguage();
  const [rawData, setRawData] = useState<GuruData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let dataModule;
        if (guruId === 'buffett') {
          dataModule = await import('@/data/buffett');
        } else if (guruId === 'li-lu') {
          dataModule = await import('@/data/li-lu');
        } else {
          throw new Error('data_not_found');
        }

        setRawData(dataModule.default);
      } catch (err) {
        if (err instanceof Error && err.message === 'data_not_found') {
          setError('data_not_found');
        } else {
          setError('unknown_error');
        }
        setRawData(null);
      } finally {
        setLoading(false);
      }
    };

    if (guruId) {
      fetchData();
    }
  }, [guruId]);

  const data = useMemo(
    () => transformGuruData(rawData, { localizeText, formatQuarterLabel, t }),
    [rawData, localizeText, formatQuarterLabel, t]
  );

  return { data, loading, error };
};

