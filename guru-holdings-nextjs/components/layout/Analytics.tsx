import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

export function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="beforeInteractive"
      />
      <Script id="google-analytics" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
          window.addEventListener('pageshow', function(event) {
            if (!event.persisted) return;

            gtag('event', 'page_view', {
              send_to: '${GA_MEASUREMENT_ID}',
              page_location: window.location.href,
              page_title: document.title
            });
          });
        `}
      </Script>
    </>
  );
}
