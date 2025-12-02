// Localized text types
export interface LocalizedText {
  en: string;
  zh: string;
}

// Quarter data types
export interface QuarterData {
  shares: number;
  value: number;
  weight: number;
  changeType: 'increase' | 'decrease' | 'new' | 'exit' | 'unchanged';
  changePercent: number;
}

// Holdings types
export interface Holding {
  symbol: string;
  companyName: LocalizedText;
  currentShares: number;
  currentValue: number;
  currentWeight: number;
  quarters: Record<string, QuarterData>;
}

export interface TransformedHolding {
  symbol: string;
  companyName: string;
  currentShares: number;
  currentValue: number;
  currentWeight: number;
  quarters: Record<string, QuarterData>;
}

// Value history types
export interface ValueHistoryEntry {
  quarter: string;
  value: number;
}

export interface TransformedValueHistoryEntry {
  quarter: string;
  label: string;
  value: number;
}

// Insights types
export interface Insights {
  summary: LocalizedText;
  keyChanges: LocalizedText[];
  riskLevel: 'low' | 'moderate' | 'elevated' | 'high';
  diversification: LocalizedText;
}

export interface TransformedInsights {
  summary: string;
  keyChanges: string[];
  riskLevel: 'low' | 'moderate' | 'elevated' | 'high';
  riskLabel: string;
  diversification: string;
}

// Resource types
export interface ResourceItem {
  year: number;
  title: LocalizedText;
  description: LocalizedText;
  url: string;
}

export interface TransformedResourceItem {
  year: number;
  title: string;
  description: string;
  url: string;
}

export interface Resources {
  shareholderLetters: ResourceItem[];
  meetingTranscripts: ResourceItem[];
}

export interface TransformedResources {
  shareholderLetters: TransformedResourceItem[];
  meetingTranscripts: TransformedResourceItem[];
}

// Overview types
export interface Overview {
  name: LocalizedText;
  company: LocalizedText;
  avatar: string;
  description: LocalizedText;
  highlights: LocalizedText[];
}

// Main Guru data type
export interface GuruData {
  id: string;
  overview: Overview;
  lastUpdate: string;
  totalValue: number;
  insights: Insights;
  valueHistory: ValueHistoryEntry[];
  holdings: Holding[];
  resources: Resources;
}

// Transformed Guru data for display
export interface TransformedGuruData {
  id: string;
  name: string;
  company: string;
  avatar: string;
  description: string;
  highlights: string[];
  lastUpdate: string;
  lastUpdateLabel: string;
  totalValue: number;
  insights: TransformedInsights;
  valueHistory: TransformedValueHistoryEntry[];
  holdings: TransformedHolding[];
  quarters: string[];
  resources: TransformedResources;
}

// Shareholder letter types
export interface ShareholderLetter {
  year: number;
  title: LocalizedText;
  summary: LocalizedText;
  highlights: LocalizedText[];
  url: string;
  publishDate: string;
}

// Language types
export type Language = 'en' | 'zh';

