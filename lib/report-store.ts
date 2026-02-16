import type { PendingReportRegistration } from "@/types/report";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10分

function getStorePath(): string {
  const dir = process.cwd();
  return path.join(dir, ".data", "report-pending.json");
}

async function loadStore(): Promise<Record<string, PendingReportRegistration>> {
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
  const filePath = getStorePath();
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(store, null, 2), "utf-8");
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
