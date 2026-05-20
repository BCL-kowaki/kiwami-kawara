import { createHmac, timingSafeEqual, randomBytes } from "crypto";

const ALGORITHM = "sha256";
// 管理者が生成したリンク用トークン（有効期限なし or 長期）
const TOKEN_EXPIRY_SEC = 60 * 60 * 24 * 30; // 30日

export interface NegTelTokenPayload {
    email: string;
    name: string;
    exp: number;
}

function getSecret(): string {
    const secret = process.env.REPORT_TOKEN_SECRET;
    if (secret && secret.length >= 16) return secret;
    return "report-dev-secret-change-in-production";
}

function base64UrlEncode(buf: Buffer): string {
    return buf.toString("base64url");
}

function base64UrlDecode(str: string): Buffer {
    return Buffer.from(str, "base64url");
}

export function signNegTelToken(payload: Omit<NegTelTokenPayload, "exp">): string {
    const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SEC;
    // ランダムノンスを追加してURLごとにユニークにする
  const nonce = randomBytes(8).toString("hex");
    const data = JSON.stringify({ ...payload, exp, nonce });
    const secret = getSecret();
    const sig = createHmac(ALGORITHM, secret).update(data).digest();
    const payloadB64 = base64UrlEncode(Buffer.from(data, "utf-8"));
    const sigB64 = base64UrlEncode(sig);
    return `${payloadB64}.${sigB64}`;
}

export function verifyNegTelToken(token: string): NegTelTokenPayload | null {
    try {
          const [payloadB64, sigB64] = token.split(".");
          if (!payloadB64 || !sigB64) return null;
          const data = base64UrlDecode(payloadB64).toString("utf-8");
          const payload = JSON.parse(data) as NegTelTokenPayload & { nonce?: string };
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
          const secret = getSecret();
          const expectedSig = createHmac(ALGORITHM, secret).update(data).digest();
          const actualSig = base64UrlDecode(sigB64);
          if (expectedSig.length !== actualSig.length || !timingSafeEqual(expectedSig, actualSig)) return null;
          return { email: payload.email, name: payload.name, exp: payload.exp };
    } catch {
          return null;
    }
}
