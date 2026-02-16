import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import { getPending } from "@/lib/report-store";
import { getSESClient, sendEmail, getFromEmail } from "@/lib/ses";

const ADMIN_EMAILS = [
  "quest@kawaraban.co.jp",
  "y3awtd-hirayama-p@hdbronze.htdb.jp",
  "mailmagazine.entry@gmail.com",
];

function formatVerifiedAdminBody(name: string, email: string, address: string, phone: string): string {
  const parts = address.split("｜");
  const postalCode = parts[0] ?? "";
  const addressLine = parts.slice(1).filter(Boolean).join(" ");
  let body = `【特別レポート申込】本人確認完了\n\n`;
  body += `完了日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}\n`;
  body += `お名前: ${name}\n`;
  body += `メールアドレス: ${email}\n`;
  body += `郵便番号: ${postalCode}\n`;
  body += `住所: ${addressLine}\n`;
  body += `電話番号: ${phone}\n`;
  body += `※2〜3日以内にレポートを送付してください。\n`;
  return body;
}

function formatUserCompletedBody(name: string): string {
  let body = `${name} 様\n\n`;
  body += `この度は、投資のKAWARA版「極」特別レポートのお申し込みいただき、\n`;
  body += `誠にありがとうございます。\n\n`;
  body += `ご本人様確認が完了しました。\n\n`;
  body += `登録情報確認後、担当スタッフより2〜3日以内にレポートを送付させていただきます。\n`;
  body += `今しばらくお待ちください。\n\n`;
  body += `株式会社投資の"KAWARA"版.ｃｏｍ\n`;
  body += `（本メールは自動送信です）\n`;
  return body;
}

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const codeStr = String(code || "").trim();

    if (!normalizedEmail || !codeStr) {
      return NextResponse.json({ ok: false, message: "メールアドレスと認証コードを入力してください。" }, { status: 400 });
    }

    const pending = await getPending(normalizedEmail);
    if (!pending?.phone) {
      return NextResponse.json({ ok: false, message: "申込または電話番号が見つかりません。先にSMS認証コードを送信してください。" }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
      return NextResponse.json({ ok: false, message: "認証の設定がありません。" }, { status: 500 });
    }

    const phoneE164 = pending.phone.startsWith("+")
      ? pending.phone
      : `+81${pending.phone.replace(/^0/, "")}`;

    const client = Twilio(accountSid, authToken);
    const check = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phoneE164, code: codeStr });

    if (check.status !== "approved") {
      return NextResponse.json(
        { ok: false, message: "認証コードが正しくないか、有効期限が切れています。" },
        { status: 400 }
      );
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (accessKeyId && secretAccessKey) {
      const fromEmail = getFromEmail();
      const sesClient = getSESClient();
      const adminBody = formatVerifiedAdminBody(pending.name, pending.email, pending.address, pending.phone);
      const userBody = formatUserCompletedBody(pending.name);
      await sendEmail(sesClient, fromEmail, ADMIN_EMAILS, `【レポート申込】本人確認完了 ${pending.name} 様`, adminBody);
      await sendEmail(sesClient, fromEmail, pending.email, "【投資のKAWARA版】特別レポートのお申し込みを承りました", userBody);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[report/verify-sms]", err);
    const message = err instanceof Error ? err.message : "認証処理に失敗しました。";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
