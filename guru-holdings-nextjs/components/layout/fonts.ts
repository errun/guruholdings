import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

const display = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const fontVariables = `${sans.variable} ${display.variable} ${mono.variable}`;
