/**
 * Password hashing utilities using the Web Crypto API.
 * No external dependencies — works in all modern browsers.
 */

/**
 * Hash a password string using SHA-256.
 * Returns a hex-encoded hash string.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against a stored SHA-256 hash.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === storedHash;
}
