'use client';

import { Database, BarChart3, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { formatNumber } from '@/lib/format';
import { GuruCard, SubscribeForm, ShareholderLetters } from '@/components/home';
import { Button } from '@/components/ui/button';
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

  const totalPortfolioValue = `$${formatNumber(buffettData.totalValue + liLuData.totalValue)}`;
  const latestUpdate = formatQuarterLabel(buffettData.lastUpdate);
  const versionDate = '2026-01-19';
  const heroFeatures = [
    { icon: Database, label: String(t('home.features.secData')) },
    { icon: BarChart3, label: String(t('home.features.visualCharts')) },
    { icon: Sparkles, label: String(t('home.features.aiSummary')) },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_70%)]" />
      <div className="container relative py-10 sm:py-14 space-y-16">
        <section className="relative overflow-hidden rounded-[32px] border bg-gradient-to-br from-slate-50 via-white to-amber-50 p-8 sm:p-12 animate-in fade-in duration-700">
          <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                <Sparkles className="h-4 w-4 text-primary" />
                {String(t('common.brand'))}
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-display font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {String(t('home.hero.title'))}
                </h1>
                <p className="text-lg text-muted-foreground sm:text-xl">
                  {String(t('home.hero.subtitle'))}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {heroFeatures.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                  >
                    <feature.icon className="h-4 w-4 text-primary" />
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-6">
                  <a href="#gurus">{String(t('home.cards.viewHoldings'))}</a>
                </Button>
                <Button asChild variant="ghost" className="rounded-full px-6">
                  <a href="#subscribe">{String(t('common.navigation.subscribe'))}</a>
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200/70 bg-slate-900 px-6 py-8 text-white shadow-xl shadow-slate-900/20">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  {String(t('home.cards.totalValue'))}
                </p>
                <p className="mt-3 text-3xl font-display font-semibold sm:text-4xl">
                  {totalPortfolioValue}
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  {String(t('home.cards.latestUpdate'))}: {latestUpdate}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  {gurus.map((guru) => (
                    <div key={guru.id} className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                      <p className="text-sm font-semibold">{guru.name}</p>
                      <p className="text-xs text-muted-foreground">{guru.company}</p>
                      <p className="mt-3 text-lg font-semibold text-primary">{guru.totalValue}</p>
                      <p className="text-xs text-muted-foreground">
                        {String(t('home.cards.latestUpdate'))}: {guru.lastUpdate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="gurus" className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {gurus.map((guru) => (
            <GuruCard key={guru.id} {...guru} />
          ))}
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <ShareholderLetters />
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <SubscribeForm />
        </section>

        <section className="text-center text-xs text-muted-foreground">
          {String(t('home.versionLabel'))}: {versionDate}
        </section>
      </div>
    </div>
  );
}
