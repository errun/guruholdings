'use client';

import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { buffettLetters } from '@/data/buffett-letters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ShareholderLetters() {
  const { t, localizeText } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const displayedLetters = showAll ? buffettLetters : buffettLetters.slice(0, 3);

  return (
    <Card className="relative overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
      <div className="pointer-events-none absolute -right-24 top-0 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
      <CardHeader className="relative text-center space-y-2 sm:text-left">
        <CardTitle className="text-2xl font-display sm:text-3xl">
          {String(t('shareholderLetters.title'))}
        </CardTitle>
        <CardDescription className="max-w-2xl text-base">
          {String(t('shareholderLetters.subtitle'))}
        </CardDescription>
        <p className="text-xs text-muted-foreground">
          {String(t('shareholderLetters.mixedNote'))}
        </p>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {displayedLetters.map((letter) => (
          <div
            key={letter.year}
            className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{letter.year}</Badge>
                  <h4 className="font-semibold">{localizeText(letter.title)}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{localizeText(letter.summary)}</p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {String(t('shareholderLetters.keyHighlights'))}:
                  </p>
                  <ul className="space-y-1">
                    {letter.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-primary">•</span>
                        <span>{localizeText(highlight)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-full">
                <a href={letter.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {String(t('shareholderLetters.readLetter'))}
                </a>
              </Button>
            </div>
          </div>
        ))}

        {buffettLetters.length > 3 && (
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="gap-2 rounded-full"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  {String(t('shareholderLetters.showLess'))}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  {String(t('shareholderLetters.showMore'))}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
