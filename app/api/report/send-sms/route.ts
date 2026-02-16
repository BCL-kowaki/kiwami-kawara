import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import { verifyReportToken, signReportToken } from "@/lib/report-token";

export async function POST(request: NextRequest) {
  try {
    const { token, phone } = await request.json();
    const normalizedPhone = (phone || "").trim().replace(/\s/g, "");

    if (!token || typeof token !== "string") {
      return NextResponse.json({ ok: false, message: "セッションが無効です。最初からフォームに戻って登録してください。" }, { status: 400 });
    }
    if (!normalizedPhone) {
      return NextResponse.json({ ok: false, message: "電話番号を入力してください。" }, { status: 400 });
    }

    const payload = verifyReportToken(token);
    if (!payload) {
      return NextResponse.json({ ok: false, message: "セッションの有効期限が切れました。最初からフォームに戻って登録してください。" }, { status: 400 });
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

    const newToken = signReportToken({
      email: payload.email,
      name: payload.name,
      address: payload.address,
      phone: normalizedPhone,
    });

    return NextResponse.json({ ok: true, token: newToken });
  } catch (err) {
    console.error("[report/send-sms]", err);
    const message = err instanceof Error ? err.message : "SMS送信に失敗しました。";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
