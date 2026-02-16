"use client";

import { useState, FormEvent, useCallback } from "react";
import NetworkBackground from "../components/NetworkBackground";

const DISCLAIMER_TEXT =
  "このレポートはあくまでもAIが導き出した参考材料として取り扱う必要がある。このレポート内容を模倣して損失が出た場合は投資のKAWARA版は一切の責任を負わない。全て自己責任であり、投資助言を目的としたものではない。";

type Step = "form" | "phone" | "verify" | "done";

interface ZipcloudResult {
  address1: string;
  address2: string;
  address3: string;
}

export default function ReportPage() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [reportToken, setReportToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAddress = useCallback(async (zip: string) => {
    const normalized = zip.replace(/-/g, "");
    if (normalized.length < 7) return;
    const res = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(normalized)}`
    );
    const data = await res.json();
    if (data.status === 200 && data.results?.[0]) {
      const r: ZipcloudResult = data.results[0];
      setAddress1([r.address1, r.address2, r.address3].filter(Boolean).join(""));
    }
  }, []);

  const handlePostalCodeBlur = () => {
    if (postalCode.trim()) fetchAddress(postalCode.trim());
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/report/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          postalCode: postalCode.trim().replace(/-/g, ""),
          address1: address1.trim(),
          address2: address2.trim(),
          disclaimerAccepted,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "送信に失敗しました。");
        return;
      }
      if (json.token) setReportToken(json.token);
      setStep("phone");
    } catch {
      setError("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/report/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: reportToken, phone: phone.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "SMS送信に失敗しました。");
        return;
      }
      if (json.token) setReportToken(json.token);
      setStep("verify");
    } catch {
      setError("SMS送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleResendSms = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/report/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: reportToken, phone: phone.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "再送信に失敗しました。");
        return;
      }
      if (json.token) setReportToken(json.token);
      setError("");
    } catch {
      setError("再送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/report/verify-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: reportToken, code: code.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "認証に失敗しました。");
        return;
      }
      setStep("done");
      // レポート申込完了イベント（GA4 / Google Ads）
      try {
        const sender = typeof window !== "undefined" ? localStorage.getItem("sender_code") || "(none)" : "(none)";
        if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "report_verify_complete", {
            sender,
            email_domain: (email.split("@")[1] || "").toLowerCase(),
          });
        }
      } catch {
        // ignore
      }
    } catch {
      setError("認証に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // 参考グラデーション: 赤 #f31313 → ピンク #f803d4 → 黄 #f6ec0c (270deg)
  const reportGradient = "linear-gradient(270deg, #f31313 0%, #f803d4 51%, #f6ec0c 100%)";
  const reportGradient135 = "linear-gradient(135deg, #f31313 0%, #f803d4 50%, #f6ec0c 100%)";

  const inputClass =
    "w-full px-4 py-3 rounded-[2px] focus:ring-2 focus:ring-[#f803d4] transition-all placeholder-gray-400";
  const inputStyle = {
    background: "#2a2a2a",
    border: "1px solid #4a4a4a",
    color: "white",
  };
  const labelStyle = { color: "#e5e5e5" };
  const cardStyle = {
    background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)",
  };
  const borderStyle = { background: reportGradient };
  const btnStyle =
    "w-full py-4 rounded-full font-bold text-base transition-all shadow-lg text-white disabled:opacity-60 disabled:cursor-not-allowed";
  const btnGradient = { background: reportGradient135 };

  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#0b0e1f" }}>
        <NetworkBackground variant="report" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative z-10 max-w-md w-full">
            <div className="p-[2px] rounded-[2px] shadow-2xl" style={borderStyle}>
              <div className="backdrop-blur-sm rounded-[2px] p-5 text-center" style={cardStyle}>
                <div className="mb-2 pt-6 pb-4">
                  <div
                    className="inline-flex items-center justify-center w-15 h-15 rounded-full shadow-lg animate-bounce"
                    style={btnGradient}
                  >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#ffffff" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-xl font-extrabold mb-4" style={{ color: "#ffffff" }}>
                  登録が完了しました
                </h1>
                <div className="space-y-4 mb-6">
                  <p className="text-sm leading-relaxed text-left" style={{ color: "#eeeeee" }}>
                    【1,000名突破記念】AI「極」が選んだ最優秀ポートフォリオレポートのお申し込みありがとうございます。
                  </p>
                  <div className="rounded-[2px] p-4 border text-sm" style={{ background: "#252535", borderColor: "#3a3a4a" }}>
                    <p style={{ color: "#cccccc" }}>
                    ご登録内容確認後、2〜3日以内にご担当スタッフよりご連絡させていただきます。<br />
                    お届けまで今しばらくお待ちください。
                    </p>
                  </div>
                </div>
                <a
                  href="/report/"
                  className="inline-block mt-4 text-sm underline"
                  style={{ color: "#f803d4" }}
                >
                  フォームトップへ戻る
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-center py-4" style={{ color: "#ffffff" }}>
          ©2026 株式会社投資の&quot;KAWARA&quot;版.com
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden" style={{ background: "#333" }}>
      <NetworkBackground variant="report" />
      <div className="max-w-[640px] mx-auto relative z-10">
        <div className="p-[2px] rounded-[2px] shadow-2xl mb-6" style={borderStyle}>
          <div className="backdrop-blur-sm rounded-[2px] p-4" style={cardStyle}>
            <div className="text-center mb-4">
              <div className="inline-block mb-3">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(248, 3, 212, 0.2)", color: "#fff", border: "1px solid rgba(248, 3, 212, 0.5)" }}
                >
                  1,000名突破記念
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#f31313] via-[#f803d4] to-[#f6ec0c]" style={{ fontWeight: 900 }}>
                AI「極」が選んだ<br />最優秀ポートフォリオレポート<br />公開します！
              </h1>
              <p className="text-xs mt-3 leading-relaxed text-left" style={{ color: "#eee" }}>
                {step === "form" && "1,000名の利用者の中からAI「極」が選出した「最も優れたポートフォリオ」の全貌を、特別レポートでお届けします。以下の項目をご入力のうえ、免責事項に同意して送信してください。"}
                {step === "phone" && "認証コードをSMSでお送りします。電話番号を入力して次へ進んでください。"}
                {step === "verify" && "SMSでお送りした6桁の認証コードを入力してください。"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-[2px] animate-pulse" style={{ background: "#2a1a1a", borderLeft: "4px solid #ef4444" }}>
                <p className="font-medium" style={{ color: "#fca5a5" }}>{error}</p>
              </div>
            )}

            {step === "form" && (
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      お名前 <span style={{ color: "#f87171" }}>（必須）</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={inputClass}
                      style={inputStyle}
                      placeholder="山田 太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      メールアドレス <span style={{ color: "#f87171" }}>（必須）</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass}
                      style={inputStyle}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      郵便番号 <span style={{ color: "#f87171" }}>（必須）</span>
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9-]/g, ""))}
                      onBlur={handlePostalCodeBlur}
                      required
                      className={inputClass}
                      style={inputStyle}
                      placeholder="1000001"
                      maxLength={8}
                    />
                    <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>ハイフンなしでも入力できます。入力後、住所が自動で入ります。</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      住所1（都道府県・市区町村・町域） <span style={{ color: "#f87171" }}>（必須）</span>
                    </label>
                    <input
                      type="text"
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      required
                      className={inputClass}
                      style={inputStyle}
                      placeholder="東京都千代田区千代田"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      住所2（番地・建物名など）
                    </label>
                    <input
                      type="text"
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="1-1-1 〇〇ビル101"
                    />
                  </div>
                  <div className="rounded-[2px] p-4 border" style={{ background: "#1a1a1a", borderColor: "#4a4a4a" }}>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: "#eeeeee" }}>
                      {DISCLAIMER_TEXT}
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={disclaimerAccepted}
                        onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                        className="mt-1 rounded border-gray-500"
                        style={{ accentColor: "#f803d4" }}
                      />
                      <span className="text-sm" style={{ color: "#e5e5e5" }}>
                        上記免責事項に同意する <span style={{ color: "#f87171" }}>（必須）</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={btnStyle}
                    style={btnGradient}
                  >
                    {loading ? "送信中..." : "特別レポートを受け取る"}
                  </button>
                </div>
              </form>
            )}

            {step === "phone" && (
              <form onSubmit={handleSendSms}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      電話番号 <span style={{ color: "#f87171" }}>（必須・SMS受信可能な番号）</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={inputClass}
                      style={inputStyle}
                      placeholder="09012345678"
                    />
                    <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>ハイフンなしで入力（例: 09012345678）。入力後、認証コードをSMSでお送りします。</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit" disabled={loading || !reportToken} className={btnStyle} style={btnGradient}>
                    {loading ? "送信中..." : "認証コードを送信"}
                  </button>
                </div>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={handleVerify}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      認証コード（6桁）
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      maxLength={6}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="123456"
                    />
                  </div>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    認証コードが届かなかった方は、【再送信】ボタンを押してください。
                  </p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button type="submit" disabled={loading || !reportToken} className={btnStyle} style={btnGradient}>
                    {loading ? "認証中..." : "認証する"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendSms}
                    disabled={loading}
                    className="text-sm py-3 px-4 rounded-[2px] border"
                    style={{ borderColor: "#4a4a4a", color: "#e5e5e5" }}
                  >
                    再送信
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-sm py-3 px-4 rounded-[2px] border"
                    style={{ borderColor: "#4a4a4a", color: "#e5e5e5" }}
                  >
                    電話番号を変更
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <p className="text-xs text-center mt-6" style={{ color: "#ffffff" }}>
          ©2026 株式会社投資の&quot;KAWARA&quot;版.com
        </p>
      </div>
    </div>
  );
}
