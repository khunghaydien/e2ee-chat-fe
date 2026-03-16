/**
 * ECDH handshake: dùng private key của mình + public key của đối phương để derive shared secret.
 * Mã hóa/giải mã tin nhắn bằng AES-GCM với key derived từ shared secret.
 */

import { importPublicKeyFromServer } from "./ecdh-keys";

const ECDH_PARAMS: EcKeyImportParams = { name: "ECDH", namedCurve: "P-256" };

/** Derive shared secret (bytes) từ cặp ECDH */
async function deriveSharedBits(
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<ArrayBuffer> {
  return await crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: theirPublicKey,
    },
    myPrivateKey,
    256
  );
}

/** Derive AES-GCM key từ shared secret (SHA-256 của shared bits làm key material) */
async function sharedSecretToAesKey(sharedBits: ArrayBuffer): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", sharedBits);
  return await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

const IV_LEN = 12;
const TAG_LEN = 128; // 16 bytes in bits

/**
 * Mã hóa plaintext. Trả về base64: iv (12 bytes) + ciphertext (có tag 16 bytes).
 * Dùng private key của tôi + public key của người nhận (recipient).
 * recipientPublicKeyJwk: chuỗi JWK hoặc object JWK (từ API).
 */
export async function encryptMessage(
  plaintext: string,
  myPrivateKey: CryptoKey,
  recipientPublicKeyJwk: string | JsonWebKey
): Promise<string> {
  const theirPublicKey = await importPublicKeyFromServer(recipientPublicKeyJwk);
  const sharedBits = await deriveSharedBits(myPrivateKey, theirPublicKey);
  const aesKey = await sharedSecretToAesKey(sharedBits);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const enc = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: TAG_LEN },
    aesKey,
    new TextEncoder().encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + enc.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(enc), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Giải mã ciphertext (base64). Dùng private key của tôi + public key của người gửi (sender).
 * senderPublicKeyJwk: chuỗi JWK hoặc object JWK (từ API).
 */
export async function decryptMessage(
  ciphertextBase64: string,
  myPrivateKey: CryptoKey,
  senderPublicKeyJwk: string | JsonWebKey
): Promise<string> {
  const theirPublicKey = await importPublicKeyFromServer(senderPublicKeyJwk);
  const sharedBits = await deriveSharedBits(myPrivateKey, theirPublicKey);
  const aesKey = await sharedSecretToAesKey(sharedBits);
  const combined = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, IV_LEN);
  const ciphertext = combined.slice(IV_LEN);
  const dec = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: TAG_LEN },
    aesKey,
    ciphertext
  );
  return new TextDecoder().decode(dec);
}

/**
 * Kiểm tra xem content có phải ciphertext E2EE không (base64 hợp lệ, độ dài đủ iv+tag).
 */
export function isEncryptedContent(content: string): boolean {
  try {
    const raw = atob(content);
    return raw.length >= IV_LEN + 16; // iv + min 16 bytes (tag)
  } catch {
    return false;
  }
}
