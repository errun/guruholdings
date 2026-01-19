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
    <Card className="group relative overflow-hidden border border-slate-200/80 bg-white/80 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 opacity-80" />
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl sm:text-5xl">{avatar}</div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-semibold">{name}</h3>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {company}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <p className="leading-relaxed text-muted-foreground">{description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
            <span className="text-xs text-muted-foreground">{String(t('home.cards.totalValue'))}</span>
            <p className="mt-2 text-lg font-semibold text-primary">{totalValue}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
            <span className="text-xs text-muted-foreground">{String(t('home.cards.latestUpdate'))}</span>
            <p className="mt-2 text-lg font-semibold">{lastUpdate}</p>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {String(t('home.cards.investmentHighlights'))}
          </h4>
          <ul className="space-y-2">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button asChild className="w-full rounded-full">
          <Link href={`/holdings/${id}`}>
            {String(t('home.cards.viewHoldings'))}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
