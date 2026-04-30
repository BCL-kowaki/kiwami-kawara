import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import { verifyReportToken } from "@/lib/report-token";
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
  let body = `【配信サービス申込】本人確認完了（“ほったらかし投資”情報配信サービス）\n\n`;
  body += `完了日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}\n`;
  body += `お名前: ${name}\n`;
  body += `メールアドレス: ${email}\n`;
  body += `郵便番号: ${postalCode}\n`;
  body += `住所: ${addressLine}\n`;
  body += `電話番号: ${phone}\n`;
  body += `※当該アドレス宛に配信を開始してください。\n`;
  return body;
}

function formatUserCompletedBody(name: string): string {
  let body = `${name} 様\n\n`;
  body += `この度は、投資のKAWARA版「“ほったらかし投資”情報配信サービス」に\n`;
  body += `お申し込みいただき、誠にありがとうございます。\n\n`;
  body += `情報の取扱いに関する注意事項へのご同意、\n`;
  body += `およびSMS認証によるご本人確認が完了いたしました。\n\n`;
  body += `今後、ご登録いただいたメールアドレス宛に\n`;
  body += `順次情報を配信してまいりますので、配信開始まで\n`;
  body += `いましばらくお待ちください。\n\n`;
  body += `株式会社投資の"KAWARA"版.ｃｏｍ\n`;
  body += `（本メールは自動送信です）\n\n`;
  body += `© 投資の"KAWARA"版．ｃｏｍ\n`;
  return body;
}

export async function POST(request: NextRequest) {
  try {
    const { token, code } = await request.json();
    const codeStr = String(code || "").trim();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ ok: false, message: "セッションが無効です。最初からフォームに戻って登録してください。" }, { status: 400 });
    }
    if (!codeStr) {
      return NextResponse.json({ ok: false, message: "認証コードを入力してください。" }, { status: 400 });
    }

    const payload = verifyReportToken(token);
    if (!payload?.phone) {
      return NextResponse.json({ ok: false, message: "セッションの有効期限が切れました。電話番号入力からやり直してください。" }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
      return NextResponse.json({ ok: false, message: "認証の設定がありません。" }, { status: 500 });
    }

    const phoneE164 = payload.phone.startsWith("+")
      ? payload.phone
      : `+81${payload.phone.replace(/^0/, "")}`;

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
      const adminBody = formatVerifiedAdminBody(payload.name, payload.email, payload.address, payload.phone);
      const userBody = formatUserCompletedBody(payload.name);
      await sendEmail(sesClient, fromEmail, ADMIN_EMAILS, `【配信サービス申込】本人確認完了 ${payload.name} 様（“ほったらかし投資”情報配信サービス）`, adminBody);
      await sendEmail(sesClient, fromEmail, payload.email, `【投資のKAWARA版】“ほったらかし投資”情報配信サービスのお申し込みを承りました`, userBody);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[neg/verify-sms]", err);
    const message = err instanceof Error ? err.message : "認証処理に失敗しました。";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
