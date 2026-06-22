'use client';

import { ErrorState } from '@/components/layout/ErrorState';

export default function ErrorPage({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState locale="en" error={error} reset={reset} />;
}
