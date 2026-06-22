import { NextRequest, NextResponse } from 'next/server';

// Edge-compatible HMAC verification using Web Crypto API
async function verifyCookie(signed: string, secret: string): Promise<string | null> {
  const lastDot = signed.lastIndexOf('.');
  if (lastDot === -1) return null;
  const value = signed.slice(0, lastDot);
  const provided = signed.slice(lastDot + 1);

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (expected.length !== provided.length) return null;
  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0 ? value : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith('/admin');
  const isSuperadminApi = pathname.startsWith('/api/superadmin');

  if (isAdminPage || isSuperadminApi) {
    const secret = process.env.COOKIE_SECRET ?? 'iv-fallback-secret-change-in-prod';
    const signed = request.cookies.get('iv_role')?.value ?? '';
    const role = await verifyCookie(signed, secret);

    if (role !== 'superadmin') {
      if (isAdminPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/superadmin/:path*'],
};
