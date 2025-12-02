'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useHoldingsData } from '@/hooks/useHoldingsData';
import { formatNumber, formatPercent } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HoldingsChart, HoldingsTable, AIInsights, ResourcesSection, DataNotice } from '@/components/holdings';

interface HoldingsPageProps {
  params: Promise<{ guruId: string }>;
}

export default function HoldingsPage({ params }: HoldingsPageProps) {
  const { guruId } = use(params);
  const { t, formatQuarterLabel } = useLanguage();
  const { data, loading, error } = useHoldingsData(guruId);

  if (loading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{String(t('messages.loading'))}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-16">
        <Alert variant="destructive">
          <AlertDescription>
            {String(t(`messages.errors.${error || 'unknown_error'}`))}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {String(t('messages.backToHome'))}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate quarter-over-quarter change
  const valueHistory = data.valueHistory;
  const currentValue = valueHistory[valueHistory.length - 1]?.value || 0;
  const previousValue = valueHistory[valueHistory.length - 2]?.value || 0;
  const previousQuarter = valueHistory[valueHistory.length - 2]?.quarter || '';
  const valueChange = currentValue - previousValue;
  const changePercent = previousValue > 0 ? ((valueChange / previousValue) * 100) : 0;

  const renderChangeIndicator = () => {
    if (!previousQuarter) {
      return (
        <p className="text-sm text-muted-foreground">
          {String(t('holdingsPage.quarterChange.noPrevious'))}
        </p>
      );
    }

    if (valueChange > 0) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <TrendingUp className="h-5 w-5" />
          <span className="font-semibold">
            {String(t('holdingsPage.quarterChange.increase'))
              .replace('{{amount}}', `$${formatNumber(valueChange)}`)
              .replace('{{percent}}', formatPercent(changePercent))}
          </span>
        </div>
      );
    } else if (valueChange < 0) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <TrendingDown className="h-5 w-5" />
          <span className="font-semibold">
            {String(t('holdingsPage.quarterChange.decrease'))
              .replace('{{amount}}', `$${formatNumber(Math.abs(valueChange))}`)
              .replace('{{percent}}', formatPercent(changePercent))}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Minus className="h-5 w-5" />
          <span>
            {String(t('holdingsPage.quarterChange.noChange'))
              .replace('{{previousQuarter}}', formatQuarterLabel(previousQuarter))}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="gap-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          {String(t('holdingsPage.back'))}
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{data.avatar}</span>
          <div>
            <h1 className="text-3xl font-bold">
              {String(t('holdingsPage.title')).replace('{{name}}', data.name)}
            </h1>
            <p className="text-muted-foreground">
              {String(t('holdingsPage.subtitle'))
                .replace('{{company}}', data.company)
                .replace('{{update}}', data.lastUpdateLabel)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{String(t('holdingsPage.totalValueLabel'))}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">${formatNumber(data.totalValue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{String(t('holdingsPage.quarterChange.title'))}</CardTitle>
            {previousQuarter && (
              <CardDescription>
                {String(t('holdingsPage.quarterChange.description'))
                  .replace('{{previousQuarter}}', formatQuarterLabel(previousQuarter))}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>{renderChangeIndicator()}</CardContent>
        </Card>
      </div>

      {/* Charts */}
      <HoldingsChart holdings={data.holdings} valueHistory={data.valueHistory} />

      {/* AI Insights */}
      <AIInsights insights={data.insights} />

      {/* Holdings Table */}
      <HoldingsTable holdings={data.holdings} quarters={data.quarters} />

      {/* Resources */}
      <ResourcesSection resources={data.resources} />

      {/* Data Notice */}
      <DataNotice />
    </div>
  );
}

