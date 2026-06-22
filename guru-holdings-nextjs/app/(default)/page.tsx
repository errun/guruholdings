import { HomePage } from '@/components/site-pages/HomePage';
import { getHomeMetadata } from '@/lib/i18n/page-metadata';

export const metadata = getHomeMetadata('en');

export default function Page() {
  return <HomePage locale="en" />;
}
