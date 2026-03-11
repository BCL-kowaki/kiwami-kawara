"use client";

import { useState, FormEvent } from "react";
import NetworkBackground from "../components/NetworkBackground";

const DISCLAIMER_TEXT =
  "本レポートはAIによる分析結果の参考資料です。投資の判断およびその責任はお客様ご自身にございます。特定の銘柄の推奨や投資助言を目的としたものではございません。";

type Step = "form" | "phone" | "verify" | "done";

export default function XrpPage() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [reportToken, setReportToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/xrp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          postalCode: "",
          address1: "",
          address2: "",
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
      const res = await fetch("/api/xrp/send-sms", {
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
      const res = await fetch("/api/xrp/send-sms", {
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
      const res = await fetch("/api/xrp/verify-sms", {
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
      try {
        const sender = typeof window !== "undefined" ? localStorage.getItem("sender_code") || "(none)" : "(none)";
        if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "xrp_report_verify_complete", {
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

  // カラーテーマ: 黒ベース × シルバーテキストグラデーション × ピンク赤ボタン
  const silverBorder = "linear-gradient(270deg, #FFFFFF 0%, #BDC3C9 51%, #FFFFFF 100%)";
  const btnRedGradient = "linear-gradient(90deg, #ff6186 0%, #f51b93 100%)";

  // テキストグラデーション用の共通スタイル
  const silverTextGradient = {
    background: "linear-gradient(90deg, #BDC3C9 0%, #FFFFFF 50%, #BDC3C9 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  };

  const inputClass =
    "w-full px-4 py-3 rounded-[2px] focus:ring-2 focus:ring-[#BDC3C9] transition-all placeholder-gray-500";
  const inputStyle = {
    background: "#1a1a1a",
    border: "1px solid #3a3a3a",
    color: "white",
  };
  const cardStyle = {
    background: "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)",
  };
  const borderStyle = { background: silverBorder };
  const btnStyle =
    "w-full py-4 rounded-full font-bold text-base transition-all shadow-lg text-white disabled:opacity-60 disabled:cursor-not-allowed";
  const btnGradient = { background: btnRedGradient };

  // 完了画面
  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#050505" }}>
        <NetworkBackground variant="silver" />
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
                  <p className="text-sm leading-relaxed text-left" style={{ color: "#d4d4d4" }}>
                    KAWARA版特別レポート「XRPの仕組みに隠れた『上がりにくい理由』」のお申し込みありがとうございます。
                  </p>
                  <div className="rounded-[2px] p-4 border text-xs" style={{ background: "#151515", borderColor: "#2a2a2a" }}>
                    <p style={{ color: "#cccccc" }}>
                      ご登録内容確認後、2〜3日以内に<br />担当スタッフよりご連絡させていただきます。<br />
                      お届けまで今しばらくお待ちください。
                    </p>
                  </div>
                </div>
                <a
                  href="/xrp/"
                  className="inline-block mt-4 text-sm underline"
                  style={{ color: "#BDC3C9" }}
                >
                  フォームトップへ戻る
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-center py-4" style={{ color: "#888888" }}>
          &copy;2026 株式会社投資の&quot;KAWARA&quot;版.com
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden" style={{ background: "#050505" }}>
      <NetworkBackground variant="silver" />
      <div className="max-w-[640px] mx-auto relative z-10">
        <div className="p-[2px] rounded-[2px] shadow-2xl mb-6" style={borderStyle}>
          <div className="backdrop-blur-sm rounded-[2px] p-4" style={cardStyle}>
            <div className="text-center mb-4">
              {/* バッジ */}
              <div className="inline-block mb-3">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(189, 195, 201, 0.1)", color: "#FFFFFF", border: "1px solid rgba(189, 195, 201, 0.35)" }}
                >
                  KAWARA版特別レポート
                </span>
              </div>

              {/* タイトル */}
              <h1
                className="text-xl sm:text-2xl mb-2"
                style={{
                  fontWeight: 900,
                  background: "linear-gradient(90deg, #FFFFFF 0%, #eeeeee 50%, #FFFFFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                XRPの仕組みに隠れた<br />「上がりにくい理由」
              </h1>
              {/* コピー */}
              <p className="text-xs mt-3 leading-relaxed text-left text-white">
                {step === "form" &&
                  "SNSの熱狂だけを頼りに、XRPを握り続けていませんか？AIが感情を排除し構造だけを解剖した結果、「上がりにくい4つの理由」と現実的な価格帯が見えてきました。まだ確認していない方は、今すぐお受け取りください。以下をご入力のうえ、免責事項に同意してお申し込みください。"
                }
                {step === "phone" &&
                  "本レポートには投資判断に関わる分析内容が含まれるため、ご本人確認を必須としております。認証コードをSMSでお送りしますので、電話番号を入力して次へ進んでください。"
                }
                {step === "verify" && "SMSでお送りした6桁の認証コードを入力してください。"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-[2px] animate-pulse" style={{ background: "#1a1010", borderLeft: "4px solid #ef4444" }}>
                <p className="font-medium" style={{ color: "#fca5a5" }}>{error}</p>
              </div>
            )}

            {step === "form" && (
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={silverTextGradient}>
                      お名前 <span style={{ color: "#f87171", WebkitTextFillColor: "#f87171" }}>（必須）</span>
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
                    <label className="block text-sm font-semibold mb-2" style={silverTextGradient}>
                      メールアドレス <span style={{ color: "#f87171", WebkitTextFillColor: "#f87171" }}>（必須）</span>
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
                  <div className="rounded-[2px] p-4 border" style={{ background: "#0e0e0e", borderColor: "#2a2a2a" }}>
                    <p className="text-xs leading-relaxed mb-4" style={silverTextGradient}>
                      {DISCLAIMER_TEXT}
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={disclaimerAccepted}
                        onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                        className="mt-1 rounded border-gray-600"
                        style={{ accentColor: "#BDC3C9" }}
                      />
                      <span className="text-sm" style={silverTextGradient}>
                        上記免責事項に同意する <span style={{ color: "#f87171", WebkitTextFillColor: "#f87171" }}>（必須）</span>
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
                    <label className="block text-sm font-semibold mb-2" style={silverTextGradient}>
                      電話番号 <span style={{ color: "#f87171", WebkitTextFillColor: "#f87171" }}>（必須・SMS受信可能な番号）</span>
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
                    <p className="text-xs mt-1" style={silverTextGradient}>ハイフンなしで入力（例: 09012345678）。入力後、認証コードをSMSでお送りします。</p>
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
                    <label className="block text-sm font-semibold mb-2" style={silverTextGradient}>
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
                  <p className="text-xs" style={silverTextGradient}>
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
                    style={{ borderColor: "#3a3a3a", ...silverTextGradient }}
                  >
                    再送信
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-sm py-3 px-4 rounded-[2px] border"
                    style={{ borderColor: "#3a3a3a", ...silverTextGradient }}
                  >
                    電話番号を変更
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <p className="text-xs text-center mt-6" style={silverTextGradient}>
          &copy;2026 株式会社投資の&quot;KAWARA&quot;版.com
        </p>
      </div>
    </div>
  );
}
