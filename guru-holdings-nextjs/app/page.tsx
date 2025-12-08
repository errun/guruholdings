'use client';

import { Database, BarChart3, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { formatNumber } from '@/lib/format';
import { GuruCard, SubscribeForm, ShareholderLetters } from '@/components/home';
import buffettData from '@/data/buffett';
import liLuData from '@/data/li-lu';

export default function HomePage() {
  const { t, localizeText, formatQuarterLabel } = useLanguage();

  const gurus = [buffettData, liLuData].map((guru) => ({
    id: guru.id,
    name: localizeText(guru.overview.name),
    company: localizeText(guru.overview.company),
    description: localizeText(guru.overview.description),
    avatar: guru.overview.avatar,
    totalValue: `$${formatNumber(guru.totalValue)}`,
    lastUpdate: formatQuarterLabel(guru.lastUpdate),
    highlights: guru.overview.highlights.map((h) => localizeText(h)),
  }));

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
	      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {String(t('home.hero.title'))}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {String(t('home.hero.subtitle'))}
        </p>
      </section>

      {/* Guru Cards */}
      <section className="grid gap-8 md:grid-cols-2">
        {gurus.map((guru) => (
          <GuruCard key={guru.id} {...guru} />
        ))}
      </section>

      {/* Shareholder Letters */}
      <section>
        <ShareholderLetters />
      </section>

      {/* Subscribe Form */}
      <section>
        <SubscribeForm />
      </section>
    </div>
  );
}

