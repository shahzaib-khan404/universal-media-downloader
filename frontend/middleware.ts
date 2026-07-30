import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/history', '/settings', '/download'];
const AUTH_REQUIRED = process.env.NEXT_PUBLIC_AUTH_REQUIRED === 'true';

export function middleware(request: NextRequest) {
  if (!AUTH_REQUIRED) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/history/:path*', '/settings/:path*', '/download/:path*'],
};
