import Script from 'next/script';

// Google Analytics 4 measurement ID.
const GA_MEASUREMENT_ID = 'G-Q0X5T11MVY';

/**
 * Google Analytics (gtag.js) scripts.
 * Rendered inside <html> in both root layouts so the library loads once for the whole site.
 */
export function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
