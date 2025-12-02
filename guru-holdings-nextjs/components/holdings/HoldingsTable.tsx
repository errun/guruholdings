'use client';

import { useLanguage } from '@/lib/i18n';
import { formatNumber, formatPercent, getChangeColor } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TransformedHolding } from '@/lib/types';

interface HoldingsTableProps {
  holdings: TransformedHolding[];
  quarters: string[];
}

export function HoldingsTable({ holdings, quarters }: HoldingsTableProps) {
  const { t, formatQuarterLabel } = useLanguage();

  const sortedHoldings = [...holdings].sort((a, b) => b.currentWeight - a.currentWeight);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{String(t('holdingsTable.title'))}</CardTitle>
        <CardDescription>{String(t('holdingsTable.subtitle'))}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span>{String(t('holdingsTable.legend.increase'))}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>{String(t('holdingsTable.legend.decrease'))}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>{String(t('holdingsTable.legend.new'))}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400" />
            <span>{String(t('holdingsTable.legend.exit'))}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-200" />
            <span>{String(t('holdingsTable.legend.unchanged'))}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">{String(t('holdingsTable.stockInfo'))}</TableHead>
                {quarters.map((quarter) => (
                  <TableHead key={quarter} className="text-center min-w-[150px]">
                    {formatQuarterLabel(quarter)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => (
                <TableRow key={holding.symbol}>
                  <TableCell>
                    <div className="font-medium">{holding.symbol}</div>
                    <div className="text-sm text-muted-foreground">{holding.companyName}</div>
                  </TableCell>
                  {quarters.map((quarter) => {
                    const quarterData = holding.quarters[quarter];
                    if (!quarterData) {
                      return (
                        <TableCell key={quarter} className="text-center text-muted-foreground">
                          {String(t('holdingsTable.noHoldings'))}
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={quarter} className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium">${formatNumber(quarterData.value)}</div>
                          <div className="text-xs text-muted-foreground">
                            {String(t('holdingsTable.sharesLabel')).replace('{{count}}', formatNumber(quarterData.shares))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {String(t('holdingsTable.weightLabel')).replace('{{weight}}', quarterData.weight.toFixed(1))}
                          </div>
                          <Badge className={`text-xs ${getChangeColor(quarterData.changeType)}`}>
                            {String(t(`common.changeTypes.${quarterData.changeType}`))}
                            {quarterData.changePercent !== 0 && ` ${formatPercent(quarterData.changePercent)}`}
                          </Badge>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

