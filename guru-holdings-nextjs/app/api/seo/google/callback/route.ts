import { NextRequest } from 'next/server';
import { configurationFailure, handlers } from '@/lib/seo/cloud';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  try { return await handlers().callback(request); } catch { return configurationFailure(); }
}
