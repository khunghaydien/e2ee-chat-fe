const isBrowser = () => typeof window !== "undefined";

export class PrivateKeyStorage {
  private static PRIVATE_KEY_JWK = "private_key_jwk";
  private static PRIVATE_KEY_EXPIRES_AT = "private_key_jwk_expires_at";
  private static TTL_MS = 15 * 60 * 1000;

  static getPrivateKeyJwk(): string | null {
    if (!isBrowser()) return null;
    const jwk = localStorage.getItem(this.PRIVATE_KEY_JWK);
    const expiresRaw = localStorage.getItem(this.PRIVATE_KEY_EXPIRES_AT);
    if (!jwk || !expiresRaw) {
      this.clear();
      return null;
    }
    const expires = Number(expiresRaw);
    if (Number.isNaN(expires) || Date.now() > expires) {
      // key đã hết hạn
      this.clear();
      return null;
    }
    return jwk;
  }

  static setPrivateKeyJwk(jwk: string) {
    if (!isBrowser()) return;
    localStorage.setItem(this.PRIVATE_KEY_JWK, jwk);
    localStorage.setItem(
      this.PRIVATE_KEY_EXPIRES_AT,
      String(Date.now() + this.TTL_MS),
    );
  }

  static removePrivateKey() {
    if (!isBrowser()) return;
    localStorage.removeItem(this.PRIVATE_KEY_JWK);
    localStorage.removeItem(this.PRIVATE_KEY_EXPIRES_AT);
  }

  static clear() {
    if (!isBrowser()) return;
    this.removePrivateKey();
  }
}

