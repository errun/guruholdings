'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';
import type { AnalyticsWindow } from '@/lib/research-analytics';

export function Analytics() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    // Previews and local verification must not contaminate the production property.
    if (!['guruholdings.net', 'www.guruholdings.net'].includes(window.location.hostname)) return;
    const analytics = window as AnalyticsWindow;
    analytics.dataLayer = analytics.dataLayer || [];
    analytics.gtag = analytics.gtag || function () { analytics.dataLayer!.push(arguments); };
    if (!analytics.__guruAnalyticsInitialized) {
      analytics.gtag('js', new Date());
      analytics.gtag('config', GA_MEASUREMENT_ID);
      analytics.__guruAnalyticsInitialized = true;
    }
    setEnabled(true);
    window.dispatchEvent(new Event('guru:analytics-ready'));
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) analytics.gtag?.('event', 'page_view', {
        send_to: GA_MEASUREMENT_ID, page_location: window.location.href, page_title: document.title,
      });
    };
    window.addEventListener('pageshow', restored);
    return () => window.removeEventListener('pageshow', restored);
  }, []);
  return enabled ? <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" /> : null;
}
