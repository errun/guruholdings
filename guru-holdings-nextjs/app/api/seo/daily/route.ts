import { NextRequest } from 'next/server';
import { configurationFailure, handlers } from '@/lib/seo/cloud';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
export async function POST(request: NextRequest) {
  try { return await handlers().daily(request); } catch { return configurationFailure(); }
}
