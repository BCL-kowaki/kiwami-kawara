import type { PendingReportRegistration } from "@/types/report";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10分
const KV_STORE_KEY = "report:pending";

let useMemoryStore = false;
const memoryStore = new Map<string, PendingReportRegistration>();

function getStorePath(): string {
  const dir = process.cwd();
  return path.join(dir, ".data", "report-pending.json");
}

function useKv(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function loadStore(): Promise<Record<string, PendingReportRegistration>> {
  if (useKv()) {
    try {
      const { kv } = await import("@vercel/kv");
      const data = await kv.get<Record<string, PendingReportRegistration>>(KV_STORE_KEY);
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }
  if (useMemoryStore) {
    return Object.fromEntries(memoryStore);
  }
  try {
    const filePath = getStorePath();
    const data = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(data) as Record<string, PendingReportRegistration>;
    return parsed;
  } catch {
    return {};
  }
}

async function saveStore(store: Record<string, PendingReportRegistration>): Promise<void> {
  if (useKv()) {
    try {
      const { kv } = await import("@vercel/kv");
      await kv.set(KV_STORE_KEY, store);
    } catch (err) {
      console.error("[report-store] KV save error:", err);
    }
    return;
  }
  if (useMemoryStore) {
    memoryStore.clear();
    for (const [k, v] of Object.entries(store)) memoryStore.set(k, v);
    return;
  }
  try {
    const filePath = getStorePath();
    const dir = path.dirname(filePath);
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? (err as NodeJS.ErrnoException).code : "";
    if (code === "ENOENT" || code === "EACCES" || code === "EROFS") {
      useMemoryStore = true;
      memoryStore.clear();
      for (const [k, v] of Object.entries(store)) memoryStore.set(k, v);
    } else {
      throw err;
    }
  }
}

export async function setPending(
  email: string,
  data: Omit<PendingReportRegistration, "createdAt">
): Promise<void> {
  const key = email.toLowerCase().trim();
  const store = await loadStore();
  store[key] = {
    ...data,
    createdAt: Date.now(),
  };
  await saveStore(store);
}

export async function getPending(email: string): Promise<PendingReportRegistration | undefined> {
  const key = email.toLowerCase().trim();
  const store = await loadStore();
  return store[key];
}

export async function setCode(email: string, code: string, phone: string): Promise<void> {
  const key = email.toLowerCase().trim();
  const store = await loadStore();
  const entry = store[key];
  if (!entry) return;
  entry.code = code;
  entry.phone = phone;
  entry.codeExpires = Date.now() + CODE_EXPIRY_MS;
  store[key] = entry;
  await saveStore(store);
}

/** Twilio Verify 用: 認証依頼した電話番号だけ保存（コードはTwilioが管理） */
export async function setPhoneOnly(email: string, phone: string): Promise<void> {
  const key = email.toLowerCase().trim();
  const store = await loadStore();
  const entry = store[key];
  if (!entry) return;
  entry.phone = phone;
  store[key] = entry;
  await saveStore(store);
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const key = email.toLowerCase().trim();
  const store = await loadStore();
  const entry = store[key];
  if (!entry || entry.code !== code || !entry.codeExpires || Date.now() > entry.codeExpires) {
    return false;
  }
  entry.verified = true;
  store[key] = entry;
  await saveStore(store);
  return true;
}
