'use client';

import { ExternalLink, FileText, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransformedResources } from '@/lib/types';

interface ResourcesSectionProps {
  resources: TransformedResources;
}

export function ResourcesSection({ resources }: ResourcesSectionProps) {
  const { t } = useLanguage();

  const hasShareholderLetters = resources.shareholderLetters.length > 0;
  const hasMeetingTranscripts = resources.meetingTranscripts.length > 0;

  if (!hasShareholderLetters && !hasMeetingTranscripts) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{String(t('holdingsPage.resources.title'))}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shareholder Letters */}
        {hasShareholderLetters && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">{String(t('holdingsPage.resources.shareholderLetters.title'))}</h4>
                <p className="text-sm text-muted-foreground">
                  {String(t('holdingsPage.resources.shareholderLetters.subtitle'))}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {resources.shareholderLetters.map((letter) => (
                <Button key={letter.year} variant="outline" size="sm" asChild>
                  <a href={letter.url} target="_blank" rel="noopener noreferrer">
                    {letter.year}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Transcripts */}
        {hasMeetingTranscripts && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">{String(t('holdingsPage.resources.meetingTranscripts.title'))}</h4>
                <p className="text-sm text-muted-foreground">
                  {String(t('holdingsPage.resources.meetingTranscripts.subtitle'))}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {resources.meetingTranscripts.map((transcript) => (
                <Button key={transcript.year} variant="outline" size="sm" asChild>
                  <a href={transcript.url} target="_blank" rel="noopener noreferrer">
                    {transcript.year}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

