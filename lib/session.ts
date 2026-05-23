import { createHmac } from 'crypto';

const SECRET = process.env.COOKIE_SECRET;
if (!SECRET) {
  console.error('CRITICAL: COOKIE_SECRET env var is not set. Cookie signatures are insecure.');
}
const _SECRET = SECRET ?? 'iv-fallback-secret-change-in-prod';

/** Sign a value: returns "value.hmac" */
export function signValue(value: string): string {
  const hmac = createHmac('sha256', _SECRET).update(value).digest('hex');
  return `${value}.${hmac}`;
}

/** Verify and unwrap a signed value. Returns the original value or null if invalid. */
export function verifyValue(signed: string): string | null {
  const lastDot = signed.lastIndexOf('.');
  if (lastDot === -1) return null;
  const value = signed.slice(0, lastDot);
  const expected = createHmac('sha256', _SECRET).update(value).digest('hex');
  const provided = signed.slice(lastDot + 1);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== provided.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0 ? value : null;
}
