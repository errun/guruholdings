import { MethodologyPage } from '@/components/site-pages/MethodologyPage';
import { getMethodologyMetadata } from '@/lib/i18n/page-metadata';
export const metadata = getMethodologyMetadata('en');
export default function Page() { return <MethodologyPage locale="en" />; }
