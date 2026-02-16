import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import { getPending, setPhoneOnly } from "@/lib/report-store";

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPhone = (phone || "").trim().replace(/\s/g, "");

    if (!normalizedEmail) {
      return NextResponse.json({ ok: false, message: "メールアドレスが必要です。" }, { status: 400 });
    }
    if (!normalizedPhone) {
      return NextResponse.json({ ok: false, message: "電話番号を入力してください。" }, { status: 400 });
    }

    const pending = await getPending(normalizedEmail);
    if (!pending) {
      return NextResponse.json({ ok: false, message: "申込が見つかりません。先にフォームから登録してください。" }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
      console.error("[report/send-sms] Twilio Verify env not set (need TWILIO_VERIFY_SERVICE_SID)");
      return NextResponse.json(
        { ok: false, message: "SMS送信の設定がありません。" },
        { status: 500 }
      );
    }

    const toE164 = normalizedPhone.startsWith("+")
      ? normalizedPhone
      : `+81${normalizedPhone.replace(/^0/, "")}`;

    const client = Twilio(accountSid, authToken);
    await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: toE164, channel: "sms" });

    await setPhoneOnly(normalizedEmail, normalizedPhone);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[report/send-sms]", err);
    const message = err instanceof Error ? err.message : "SMS送信に失敗しました。";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
