import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const SECRET = process.env.COOKIE_SECRET ?? 'iv-fallback-secret-change-in-prod';

function verifyCookie(signed: string): string | null {
  const lastDot = signed.lastIndexOf('.');
  if (lastDot === -1) return null;
  const value = signed.slice(0, lastDot);
  const expected = createHmac('sha256', SECRET).update(value).digest('hex');
  const provided = signed.slice(lastDot + 1);
  if (expected.length !== provided.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0 ? value : null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin and /api/superadmin/* at the edge — require admin or superadmin role
  const isAdminPage = pathname.startsWith('/admin');
  const isSuperadminApi = pathname.startsWith('/api/superadmin');

  if (isAdminPage || isSuperadminApi) {
    const signed = request.cookies.get('iv_role')?.value ?? '';
    const role = verifyCookie(signed);

    if (role !== 'admin' && role !== 'superadmin') {
      if (isAdminPage) {
        // Redirect unauthenticated browser requests to home
        return NextResponse.redirect(new URL('/', request.url));
      }
      // Block API requests
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/superadmin/:path*'],
};
