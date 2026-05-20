import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import { verifyNegTelToken } from "@/lib/neg-tel-token";
import { signReportToken } from "@/lib/report-token";

export async function POST(request: NextRequest) {
  try {
    let body: { urlToken?: unknown; phone?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, message: "invalid request" }, { status: 400 });
    }
    const urlToken = typeof body?.urlToken === "string" ? body.urlToken : "";
    const normalizedPhone = (body?.phone != null ? String(body.phone) : "").trim().replace(/\s/g, "");
    if (!urlToken) {
      return NextResponse.json({ ok: false, message: "invalid url" }, { status: 400 });
    }
    if (!normalizedPhone) {
      return NextResponse.json({ ok: false, message: "phone required" }, { status: 400 });
    }
    const payload = verifyNegTelToken(urlToken);
    if (!payload) {
      return NextResponse.json({ ok: false, message: "expired" }, { status: 400 });
    }
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!accountSid || !authToken || !verifyServiceSid) {
      return NextResponse.json({ ok: false, message: "config missing" }, { status: 500 });
    }
    const toE164 = normalizedPhone.startsWith("+") ? normalizedPhone : `+81${normalizedPhone.replace(/^0/, "")}`;
    const client = Twilio(accountSid, authToken);
    await client.verify.v2.services(verifyServiceSid).verifications.create({ to: toE164, channel: "sms" });
    const sessionToken = signReportToken({
      email: payload.email,
      name: payload.name,
      address: "",
      phone: normalizedPhone,
    });
    return NextResponse.json({ ok: true, sessionToken });
  } catch (err) {
    console.error("[neg/tel/send-sms]", err);
    return NextResponse.json({ ok: false, message: String(err) }, { status: 500 });
  }
}
