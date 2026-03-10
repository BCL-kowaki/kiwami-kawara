import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import { verifyReportToken, signReportToken } from "@/lib/report-token";

export async function POST(request: NextRequest) {
  try {
    let body: { token?: unknown; phone?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, message: "リクエストの形式が正しくありません。" }, { status: 400 });
    }
    const token = typeof body?.token === "string" ? body.token : "";
    const phone = body?.phone;
    const normalizedPhone = (phone != null ? String(phone) : "").trim().replace(/\s/g, "");

    if (!token) {
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
      console.error("[xrp/send-sms] Twilio env missing.");
      return NextResponse.json(
        { ok: false, message: "SMS送信の設定がありません。管理者にお問い合わせください。" },
        { status: 500 }
      );
    }

    const toE164 = normalizedPhone.startsWith("+")
      ? normalizedPhone
      : `+81${normalizedPhone.replace(/^0/, "")}`;

    try {
      const client = Twilio(accountSid, authToken);
      await client.verify.v2
        .services(verifyServiceSid)
        .verifications.create({ to: toE164, channel: "sms" });
    } catch (twilioErr: unknown) {
      const code = twilioErr && typeof twilioErr === "object" && "code" in twilioErr ? (twilioErr as { code?: number }).code : undefined;
      const status = twilioErr && typeof twilioErr === "object" && "status" in twilioErr ? (twilioErr as { status?: number }).status : undefined;
      console.error("[xrp/send-sms] Twilio error", { code, status, message: twilioErr instanceof Error ? twilioErr.message : String(twilioErr) });
      if (status === 404 || code === 20404) {
        return NextResponse.json({ ok: false, message: "SMS送信の設定（Verifyサービス）が見つかりません。管理者にお問い合わせください。" }, { status: 500 });
      }
      if (status === 401 || code === 20003) {
        return NextResponse.json({ ok: false, message: "SMS送信の認証に失敗しました。管理者にお問い合わせください。" }, { status: 500 });
      }
      return NextResponse.json(
        { ok: false, message: "SMSの送信に一時的に失敗しました。しばらく経ってから再度お試しください。" },
        { status: 500 }
      );
    }

    const newToken = signReportToken({
      email: payload.email,
      name: payload.name,
      address: payload.address,
      phone: normalizedPhone,
    });

    return NextResponse.json({ ok: true, token: newToken });
  } catch (err) {
    console.error("[xrp/send-sms] Unexpected error", err);
    return NextResponse.json(
      { ok: false, message: "SMS送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }
}
