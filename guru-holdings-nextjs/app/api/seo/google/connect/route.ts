import { NextRequest } from 'next/server';
import { configurationFailure, handlers } from '@/lib/seo/cloud';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return handlers().page(); } catch { return configurationFailure(); }
}
export async function POST(request: NextRequest) {
  try { return await handlers().connect(request); } catch { return configurationFailure(); }
}
