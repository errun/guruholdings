'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { readStorageJSON, writeStorageJSON } from '@/lib/storage';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const STORAGE_KEY = 'subscribers';

export function SubscribeForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [storageErrored, setStorageErrored] = useState(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const { value, error } = readStorageJSON<string[]>(STORAGE_KEY, []);
    if (error) {
      setStorageErrored(true);
      setSubscriberCount(Array.isArray(value) ? value.length : 0);
      return;
    }
    if (!Array.isArray(value)) {
      setStorageErrored(true);
      setSubscriberCount(0);
      return;
    }
    setSubscriberCount(value.length);
    setStorageErrored(false);
  }, []);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  useEffect(() => {
    if (!storageErrored) return;
    clearResetTimer();
    setStatus('error');
    setMessage(String(t('subscribe.messages.storageUnavailable')));
  }, [storageErrored, clearResetTimer, t]);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearResetTimer();

    if (!email.trim()) {
      setStatus('error');
      setMessage(String(t('subscribe.messages.required')));
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage(String(t('subscribe.messages.invalid')));
      return;
    }

    setStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { value: storedSubscribers, error: readError } = readStorageJSON<string[]>(STORAGE_KEY, []);
      if (readError || !Array.isArray(storedSubscribers)) {
        setStorageErrored(true);
        return;
      }

      if (storedSubscribers.includes(email)) {
        setStatus('error');
        setMessage(String(t('subscribe.messages.exists')));
        return;
      }

      const nextSubscribers = [...storedSubscribers, email];
      const { success: persistSuccess } = writeStorageJSON(STORAGE_KEY, nextSubscribers);

      if (!persistSuccess) {
        setStorageErrored(true);
        return;
      }

      setStorageErrored(false);
      setStatus('success');
      setMessage(String(t('subscribe.messages.success')));
      setEmail('');
      setSubscriberCount(nextSubscribers.length);

      resetTimerRef.current = setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch {
      setStatus('error');
      setMessage(String(t('subscribe.messages.failure')));
    }
  };

  const isSubmitting = status === 'loading';
  const isFormDisabled = isSubmitting || storageErrored;

  return (
    <Card
      id="subscribe"
      className="relative overflow-hidden border border-slate-200/80 bg-gradient-to-br from-amber-50 via-white to-sky-50"
    >
      <div className="pointer-events-none absolute -left-24 top-10 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
      <CardContent className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <CardTitle className="text-2xl font-display sm:text-3xl">
            {String(t('subscribe.title'))}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {String(t('subscribe.description'))}
          </CardDescription>
          <p className="text-xs text-muted-foreground">{String(t('subscribe.promise'))}</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={String(t('subscribe.placeholder'))}
                disabled={isFormDisabled}
                className="flex-1 rounded-full bg-white"
              />
              <Button type="submit" disabled={isFormDisabled} className="rounded-full px-6">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {String(t('subscribe.buttonLoading'))}
                  </>
                ) : (
                  String(t('subscribe.button'))
                )}
              </Button>
            </div>

            {message && (
              <Alert variant={status === 'success' ? 'success' : 'destructive'}>
                {status === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </form>

          <div className="mt-6 border-t border-slate-200/80 pt-4 text-sm text-muted-foreground">
            {String(t('subscribe.subscriberCount')).replace('{{count}}', String(subscriberCount))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
