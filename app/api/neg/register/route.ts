import { NextRequest, NextResponse } from "next/server";
import type { ReportRegistrationBody } from "@/types/report";
import { getSESClient, sendEmail, getFromEmail } from "@/lib/ses";
import { signReportToken } from "@/lib/report-token";

const ADMIN_EMAILS = [
  "quest@kawaraban.co.jp",
  "y3awtd-hirayama-p@hdbronze.htdb.jp",
  "mailmagazine.entry@gmail.com",
];

function formatAdminBody(data: ReportRegistrationBody): string {
  const addressLine = [data.address1, data.address2].filter(Boolean).join(" ");
  let body = `【配信サービス申込】受信データ（“ほったらかし投資”情報配信サービス）\n\n`;
  body += `受信日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}\n`;
  body += `お名前: ${data.name}\n`;
  body += `メールアドレス: ${data.email}\n`;
  body += `郵便番号: ${data.postalCode || ""}\n`;
  body += `住所: ${addressLine}\n`;
  body += `情報の取扱いに関する注意事項同意: ${data.disclaimerAccepted ? "同意" : "未同意"}\n`;
  return body;
}

export async function POST(request: NextRequest) {
  try {
    const data: ReportRegistrationBody = await request.json();

    const name = (data.name || "").trim();
    const email = (data.email || "").trim().toLowerCase();

    if (!name) {
      return NextResponse.json({ ok: false, message: "名前を入力してください。" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ ok: false, message: "メールアドレスを入力してください。" }, { status: 400 });
    }
    if (!data.disclaimerAccepted) {
      return NextResponse.json({ ok: false, message: "情報の取扱いに関する注意事項に同意してください。" }, { status: 400 });
    }

    const token = signReportToken({ email, name, address: "" });

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (accessKeyId && secretAccessKey) {
      const fromEmail = getFromEmail();
      const sesClient = getSESClient();
      const adminBody = formatAdminBody({ ...data, name, email, postalCode: "", address1: "", address2: "", disclaimerAccepted: true });
      await sendEmail(sesClient, fromEmail, ADMIN_EMAILS, `【配信サービス申込】${name} 様（“ほったらかし投資”情報配信サービス）`, adminBody);
    } else {
      console.log("[neg/register] AWS not set, skipping email. Data:", { name, email });
    }

    return NextResponse.json({ ok: true, token });
  } catch (err) {
    console.error("[neg/register]", err);
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
