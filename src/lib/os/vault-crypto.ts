import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function getKey(): Buffer {
  const raw =
    process.env.PROJECT_VAULT_SECRET ||
    process.env.SESSION_SECRET ||
    "editco-vault-dev-fallback-key";
  return createHash("sha256").update(raw).digest();
}

export type EncryptedSecret = {
  cipher: string;
  iv: string;
  tag: string;
};

export function encryptSecret(plaintext: string): EncryptedSecret | null {
  const trimmed = plaintext.trim();
  if (!trimmed) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(trimmed, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipher: enc.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptSecret(input: {
  cipher?: string | null;
  iv?: string | null;
  tag?: string | null;
}): string | null {
  if (!input.cipher || !input.iv || !input.tag) return null;
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(input.iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(input.tag, "base64"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(input.cipher, "base64")),
      decipher.final(),
    ]);
    return dec.toString("utf8");
  } catch {
    return null;
  }
}

export function hasEncryptedSecret(input: {
  cipher?: string | null;
}): boolean {
  return Boolean(input.cipher && input.cipher.length > 0);
}
