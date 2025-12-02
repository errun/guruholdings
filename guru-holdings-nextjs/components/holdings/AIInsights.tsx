'use client';

import { Sparkles, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransformedInsights } from '@/lib/types';

interface AIInsightsProps {
  insights: TransformedInsights;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800';
    case 'elevated':
      return 'bg-orange-100 text-orange-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function AIInsights({ insights }: AIInsightsProps) {
  const { t } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {String(t('aiInsights.title'))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            {String(t('aiInsights.summaryTitle'))}
          </h4>
          <p className="text-muted-foreground leading-relaxed">{insights.summary}</p>
        </div>

        {/* Key Changes */}
        <div className="space-y-2">
          <h4 className="font-semibold">{String(t('aiInsights.keyChangesTitle'))}</h4>
          <ul className="space-y-2">
            {insights.keyChanges.map((change, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 text-purple-600">•</span>
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Level & Diversification */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-purple-600" />
              {String(t('aiInsights.riskLevel'))}
            </h4>
            <Badge className={getRiskColor(insights.riskLevel)}>
              {insights.riskLabel}
            </Badge>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              {String(t('aiInsights.diversification'))}
            </h4>
            <p className="text-sm text-muted-foreground">{insights.diversification}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground italic border-t pt-4">
          {String(t('aiInsights.disclaimer'))}
        </p>
      </CardContent>
    </Card>
  );
}

