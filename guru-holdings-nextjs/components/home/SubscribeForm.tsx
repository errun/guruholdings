'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { readStorageJSON, writeStorageJSON } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <Card id="subscribe" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{String(t('subscribe.title'))}</CardTitle>
        <CardDescription className="max-w-2xl mx-auto">
          {String(t('subscribe.description'))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={String(t('subscribe.placeholder'))}
              disabled={isFormDisabled}
              className="flex-1"
            />
            <Button type="submit" disabled={isFormDisabled}>
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

        <p className="text-xs text-center text-muted-foreground mt-4">
          {String(t('subscribe.promise'))}
        </p>

        <div className="text-center text-sm text-muted-foreground mt-6 pt-4 border-t border-blue-200">
          {String(t('subscribe.subscriberCount')).replace('{{count}}', String(subscriberCount))}
        </div>
      </CardContent>
    </Card>
  );
}

