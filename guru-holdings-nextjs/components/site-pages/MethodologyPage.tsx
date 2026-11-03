import Link from 'next/link';
import snapshot from '@/data-generated/snapshots/latest.json';
import { methodologyCopy } from '@/lib/i18n/methodology';
import { localizedPath, type Locale } from '@/lib/i18n/site';
import { formatQuarter } from '@/lib/sec13f-view';
import { PageBreadcrumbs } from '@/components/layout/PageBreadcrumbs';

export function MethodologyPage({ locale }: { locale: Locale }) {
  const copy = methodologyCopy[locale];
  const current = snapshot.managers.filter(m => m.latestQuarter === snapshot.latestQuarter).length;
  return <article className="container max-w-4xl py-8 lg:py-12">
    <PageBreadcrumbs locale={locale} current={copy.title} path="/methodology" />
    <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{copy.title}</h1>
    <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.intro}</p>
    <section className="mt-7 rounded-md border border-stone-200 bg-stone-50 p-4">
      <h2 className="font-semibold">{copy.coverage}</h2>
      <p className="mt-2 font-mono">{formatQuarter(snapshot.latestQuarter, locale)} · {current}/{snapshot.managers.length}</p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">{snapshot.managers.map(manager => <li key={manager.id}>
        <Link className="text-primary underline underline-offset-4" href={localizedPath(locale, `/live-13f/${manager.id}`)}>{manager.displayName} · {formatQuarter(manager.latestQuarter, locale)}</Link>
      </li>)}</ul>
    </section>
    <section className="mt-7"><h2 className="text-lg font-semibold">{copy.dates}</h2><p className="mt-2 leading-7 text-muted-foreground">{copy.meaning}</p></section>
    {copy.sections.map(section => <section key={section.title} className="mt-7">
      <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2><p className="mt-2 leading-7 text-muted-foreground">{section.body}</p>
    </section>)}
    <section className="mt-7"><h2 className="text-lg font-semibold">{copy.sources}</h2>
      <ul className="mt-3 space-y-2 text-sm text-primary underline underline-offset-4">
        <li><a href="https://www.sec.gov/rules-regulations/staff-guidance/frequently-asked-questions-about-form-13f" rel="noreferrer" target="_blank">SEC · Form 13F FAQ</a></li>
        <li><a href="https://www.sec.gov/edgar/search/" rel="noreferrer" target="_blank">SEC EDGAR</a></li>
      </ul>
    </section>
    <Link href={localizedPath(locale, '/live-13f')} className="mt-8 inline-block font-medium text-primary underline underline-offset-4">{copy.explore}</Link>
  </article>;
}
