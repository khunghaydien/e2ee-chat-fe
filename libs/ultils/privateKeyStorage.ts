const isBrowser = () => typeof window !== "undefined";

export class PrivateKeyStorage {
  private static PRIVATE_KEY_JWK = "private_key_jwk";

  static getPrivateKeyJwk(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(this.PRIVATE_KEY_JWK);
  }

  static setPrivateKeyJwk(jwk: string) {
    if (!isBrowser()) return;
    localStorage.setItem(this.PRIVATE_KEY_JWK, jwk);
  }

  static removePrivateKey() {
    if (!isBrowser()) return;
    localStorage.removeItem(this.PRIVATE_KEY_JWK);
  }

  static clear() {
    if (!isBrowser()) return;
    this.removePrivateKey();
  }
}

