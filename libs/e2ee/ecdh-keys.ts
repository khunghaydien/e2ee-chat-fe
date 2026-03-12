/**
 * ECDH P-256 keypair generation và export.
 * Public key gửi lên server (JWK string). Private key user tự copy/dán nguyên bản (JWK), không lưu không mã hóa.
 */

const ECDH_PARAMS: EcKeyGenParams = {
  name: "ECDH",
  namedCurve: "P-256",
};

export type PublicKeyJwk = { crv: string; kty: string; x: string; y: string };

/** Sinh cặp khóa ECDH P-256 */
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(ECDH_PARAMS, true, ["deriveBits", "deriveKey"]);
}

/** Export public key thành chuỗi JWK để gửi lên server (chỉ chứa crv, kty, x, y) */
export async function exportPublicKeyForServer(publicKey: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey("jwk", publicKey);
  const safe: PublicKeyJwk = {
    crv: jwk.crv!,
    kty: jwk.kty!,
    x: jwk.x!,
    y: jwk.y!,
  };
  return JSON.stringify(safe);
}

/** Lấy public key (CryptoKey) từ private key. */
export async function getPublicKeyFromPrivate(privateKey: CryptoKey): Promise<CryptoKey> {
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);
  const publicJwk: JsonWebKey = {
    kty: jwk.kty,
    crv: jwk.crv,
    x: jwk.x,
    y: jwk.y,
  };
  return await crypto.subtle.importKey(
    "jwk",
    publicJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
}

/**
 * Chuẩn hóa x, y từ base64 hoặc base64url sang base64url (Web Crypto JWK yêu cầu base64url).
 */
function ensureBase64Url(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("JWK x/y must be string");
  }
  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Import public key từ JWK (string hoặc object từ server / message.sender.publicKey).
 * Chấp nhận cả base64 và base64url cho x, y; chuẩn hóa về đúng format cho Web Crypto.
 */
export async function importPublicKeyFromServer(
  publicKeyJwkInput: string | JsonWebKey
): Promise<CryptoKey> {
  let jwkRaw: JsonWebKey;
  if (typeof publicKeyJwkInput === "string") {
    const parsed = JSON.parse(publicKeyJwkInput) as JsonWebKey | string;
    jwkRaw = typeof parsed === "string" ? (JSON.parse(parsed) as JsonWebKey) : parsed;
  } else {
    jwkRaw = publicKeyJwkInput;
  }

  const x = jwkRaw.x;
  const y = jwkRaw.y;
  if (!jwkRaw.kty || !jwkRaw.crv || x == null || y == null) {
    throw new Error("Invalid public key JWK: missing kty, crv, x or y");
  }

  const normalized: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x: ensureBase64Url(x),
    y: ensureBase64Url(y),
  };

  return await crypto.subtle.importKey(
    "jwk",
    { ...normalized, key_ops: undefined, ext: true },
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
}

/** Export private key thành JWK string (để user copy). */
export async function exportPrivateKeyJwk(privateKey: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);
  return JSON.stringify(jwk);
}

/** Import private key từ chuỗi JWK (user dán bản copy). */
export async function importPrivateKeyFromJwk(
  jwkString: string,
): Promise<CryptoKey> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jwkString);
  } catch (e) {
    throw new Error("Private key JWK must be valid JSON");
  }

  // Cho phép trường hợp user paste 2 lớp string: "\"{...}\""
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      throw new Error("Private key JWK is wrapped in an invalid string");
    }
  }

  const jwk = parsed as JsonWebKey;

  if (jwk.kty !== "EC" || jwk.crv !== "P-256") {
    throw new Error("Private key must be EC P-256 JWK");
  }

  // Private key ECDH bắt buộc phải có trường `d`
  if (!jwk.d) {
    throw new Error(
      "This looks like a public key JWK",
    );
  }

  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits", "deriveKey"],
  );
}

