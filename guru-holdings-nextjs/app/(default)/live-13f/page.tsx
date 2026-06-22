import { Live13FPage } from '@/components/site-pages/Live13FPage';
import { getLive13FMetadata } from '@/lib/i18n/page-metadata';

export const metadata = getLive13FMetadata('en');

export default function Page() {
  return <Live13FPage locale="en" />;
}
