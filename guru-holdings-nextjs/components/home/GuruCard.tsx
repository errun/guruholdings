'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

interface GuruCardProps {
  id: string;
  name: string;
  company: string;
  description: string;
  avatar: string;
  totalValue: string;
  lastUpdate: string;
  highlights: string[];
}

export function GuruCard({
  id,
  name,
  company,
  description,
  avatar,
  totalValue,
  lastUpdate,
  highlights,
}: GuruCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{avatar}</div>
          <div>
            <h3 className="text-2xl font-bold">{name}</h3>
            <p className="text-muted-foreground">{company}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="leading-relaxed text-muted-foreground">{description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">{String(t('home.cards.totalValue'))}</span>
            <p className="text-lg font-semibold text-primary">{totalValue}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">{String(t('home.cards.latestUpdate'))}</span>
            <p className="text-lg font-semibold">{lastUpdate}</p>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">{String(t('home.cards.investmentHighlights'))}</h4>
          <ul className="space-y-2">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                <span className="mt-1 text-primary">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button asChild className="w-full">
          <Link href={`/holdings/${id}`}>
            {String(t('home.cards.viewHoldings'))}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

