import { NextResponse, type NextRequest } from 'next/server';
import stockRouteAliases from '@/data-source/stock-route-aliases.json';

const aliases = stockRouteAliases as Record<string, string>;
const stockPathPattern = /^\/(?:((?:zh|ja|ko))\/)?stocks\/([^/]+)$/;

export function middleware(request: NextRequest) {
  const match = stockPathPattern.exec(request.nextUrl.pathname);
  if (!match) return NextResponse.next();

  let alias: string;
  try {
    alias = decodeURIComponent(match[2]);
  } catch {
    return NextResponse.next();
  }

  const slug = aliases[alias];
  if (!slug) return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = `${match[1] ? `/${match[1]}` : ''}/stocks/${slug}`;
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: ['/stocks/:path*', '/zh/stocks/:path*', '/ja/stocks/:path*', '/ko/stocks/:path*'],
};
