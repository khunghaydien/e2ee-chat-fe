/**
 * Không còn lưu encrypted private key — user copy/dán JWK nguyên bản.
 * File giữ lại để tương thích nếu có code cũ gọi; các hàm no-op.
 */

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveEncryptedPrivateKey(_encryptedPayloadBase64: string): void {
  if (!isBrowser()) return;
  // No-op: không lưu key
}

export function getEncryptedPrivateKey(): string | null {
  if (!isBrowser()) return null;
  return null;
}

export function clearEncryptedPrivateKey(): void {
  if (!isBrowser()) return;
  // No-op
}

export function hasEncryptedPrivateKey(): boolean {
  return false;
}
