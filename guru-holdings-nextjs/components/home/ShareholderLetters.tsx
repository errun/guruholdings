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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{String(t('shareholderLetters.title'))}</CardTitle>
        <CardDescription>{String(t('shareholderLetters.subtitle'))}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedLetters.map((letter) => (
          <div
            key={letter.year}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-4">
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
              <Button variant="outline" size="sm" asChild>
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
              className="gap-2"
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

