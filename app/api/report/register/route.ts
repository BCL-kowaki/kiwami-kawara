import { NextRequest, NextResponse } from "next/server";
import type { ReportRegistrationBody } from "@/types/report";
import { getSESClient, sendEmail, getFromEmail } from "@/lib/ses";
import { setPending } from "@/lib/report-store";

const ADMIN_EMAILS = [
  "quest@kawaraban.co.jp",
  "y3awtd-hirayama-p@hdbronze.htdb.jp",
  "mailmagazine.entry@gmail.com",
];

function formatAdminBody(data: ReportRegistrationBody): string {
  const addressLine = [data.address1, data.address2].filter(Boolean).join(" ");
  let body = `【特別レポート申込】受信データ\n\n`;
  body += `受信日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}\n`;
  body += `お名前: ${data.name}\n`;
  body += `メールアドレス: ${data.email}\n`;
  body += `郵便番号: ${data.postalCode || ""}\n`;
  body += `住所: ${addressLine}\n`;
  body += `免責事項同意: ${data.disclaimerAccepted ? "同意" : "未同意"}\n`;
  return body;
}

export async function POST(request: NextRequest) {
  try {
    const data: ReportRegistrationBody = await request.json();

    const name = (data.name || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const postalCode = (data.postalCode || "").trim().replace(/-/g, "");
    const address1 = (data.address1 || "").trim();
    const address2 = (data.address2 || "").trim();

    if (!name) {
      return NextResponse.json({ ok: false, message: "名前を入力してください。" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ ok: false, message: "メールアドレスを入力してください。" }, { status: 400 });
    }
    if (!postalCode || postalCode.length < 7) {
      return NextResponse.json({ ok: false, message: "有効な郵便番号を入力してください。" }, { status: 400 });
    }
    if (!address1) {
      return NextResponse.json({ ok: false, message: "住所（都道府県・市区町村）を入力してください。" }, { status: 400 });
    }
    if (!data.disclaimerAccepted) {
      return NextResponse.json({ ok: false, message: "免責事項に同意してください。" }, { status: 400 });
    }

    const address = [postalCode, address1, address2].filter(Boolean).join("｜");
    await setPending(email, {
      name,
      email,
      address,
    });

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (!accessKeyId || !secretAccessKey) {
      console.log("[report/register] AWS not set, skipping email. Data:", { name, email, address });
      return NextResponse.json({ ok: true });
    }

    const fromEmail = getFromEmail();
    const sesClient = getSESClient();
    const adminBody = formatAdminBody({ ...data, name, email, postalCode, address1, address2, disclaimerAccepted: true });

    await sendEmail(sesClient, fromEmail, ADMIN_EMAILS, `【特別レポート申込】${name} 様`, adminBody);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[report/register]", err);
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
