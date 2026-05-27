"use client";

import { useState, FormEvent } from "react";

type Step = "form" | "phone" | "verify" | "done";

export default function LivePage() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true);
  const [topDisclaimerChecked, setTopDisclaimerChecked] = useState(true);
  const [ndaChecked, setNdaChecked] = useState(true);
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
      const res = await fetch("/api/live/register", {
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
      const res = await fetch("/api/live/send-sms", {
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
      const res = await fetch("/api/live/send-sms", {
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
      const res = await fetch("/api/live/verify-sms", {
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
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "live_verify_complete", {
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

  // ===== MRT wellness 風配色 =====
  // 背景: /wlns-bg.jpg（深紅の和紙テクスチャ）
  // カード: 白
  // 金グラデ: #c9b58a → #b08a3e（タイトル枠・ボタン）
  // 深赤: #2b0305 / #a12324（タイトル・アイコン）
  // 茶系: #5a4838 / #2a1810（本文）
  const bgRootStyle: React.CSSProperties = {
    backgroundImage: "url('/wlns-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#3d0f1d",
    backgroundAttachment: "fixed",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
  };

  const borderGradient: React.CSSProperties = {
    background: "linear-gradient(135deg, #c9b58a 0%, #b08a3e 50%, #715419 100%)",
  };

  // ボタン: 金グラデ
  const goldButtonStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #715419 0%, #f9e3ab 50%, #715419 100%)",
    color: "#141209",
    letterSpacing: "0.2em",
    border: "1px solid #b08a3e",
  };

  // アイコン: 深赤グラデ
  const redIconStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #2b0305 0%, #a12324 50%, #2b0305 100%)",
    color: "#ffffff",
  };

  // タイトルテキスト: 深赤グラデ（クリップ）
  const titleGradientClass = "bg-clip-text text-transparent";
  const titleGradientStyle: React.CSSProperties = {
    backgroundImage: "linear-gradient(135deg, #2b0305 0%, #a12324 50%, #2b0305 100%)",
  };

  const labelStyle: React.CSSProperties = { color: "#2a1810", letterSpacing: "0.02em" };

  const inputClass =
    "w-full px-4 py-3 rounded-[2px] focus:ring-2 focus:ring-[#b08a3e] focus:outline-none transition-all placeholder-[#a89978]";
  const inputStyle: React.CSSProperties = {
    background: "#fffaf0",
    border: "1px solid #c9b58a",
    color: "#2a1810",
  };

  const btnStyle =
    "w-4/5 sm:w-1/2 py-4 rounded-none font-bold text-base transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed";

  // 完了画面
  if (step === "done") {
    return (
      <div className="theme-wlns min-h-screen flex flex-col relative overflow-hidden" style={bgRootStyle}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative z-10 max-w-md w-full">
            <div className="p-[2px] rounded-[2px] shadow-2xl" style={borderGradient}>
              <div className="rounded-[2px] p-5 text-center" style={cardStyle}>
                <div className="mb-2 pt-6 pb-4">
                  <div
                    className="inline-flex items-center justify-center w-15 h-15 rounded-full shadow-lg animate-bounce"
                    style={redIconStyle}
                  >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#ffffff" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-xl font-extrabold mb-4" style={{ color: "#5a1a2b" }}>
                  お申し込みありがとうございました
                </h1>
                <div className="space-y-4 mb-6">
                  <p className="text-sm leading-relaxed" style={{ color: "#5a4838" }}>
                    「次世代ウェルネス戦略 LIVE配信」へのお申し込みを承りました。
                  </p>
                  <div
                    className="rounded-[2px] p-4 border text-sm"
                    style={{ background: "#ede1cb", borderColor: "#c9b58a" }}
                  >
                    <p className="font-bold mb-1" style={{ color: "#3d0f1d" }}>
                      配信に関するご案内
                    </p>
                    <p style={{ color: "#5a4838" }}>
                      配信URLおよび視聴に必要な情報は、<br />
                      ご登録いただいたメールアドレス宛に<br />
                      順次お送りいたします。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-center py-4" style={{ color: "#f5ecdc" }}>
          &copy;2026 株式会社投資の&quot;KAWARA&quot;版.com
        </p>
      </div>
    );
  }

  return (
    <div className="theme-wlns min-h-screen py-8 px-4 relative overflow-hidden" style={bgRootStyle}>
      <div className="max-w-[640px] mx-auto relative z-10">
        <div className="p-[2px] rounded-[2px] shadow-2xl mb-6" style={borderGradient}>
          <div className="rounded-[2px] p-4 sm:p-6" style={cardStyle}>
            <div className="text-center mb-4">
              {/* バッジ */}
              <div className="inline-block mb-3">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(176, 138, 62, 0.08)",
                    color: "#5a1a2b",
                    border: "1px solid #c9b58a",
                    letterSpacing: "0.08em",
                  }}
                >
                  KAWARA版特別コンテンツ
                </span>
              </div>

              {/* タイトル（全ステップ共通） */}
              <h1
                className={`text-2xl sm:text-4xl mb-3 leading-snug ${titleGradientClass}`}
                style={{
                  ...titleGradientStyle,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  wordBreak: "keep-all",
                }}
              >
                <span className="inline-block whitespace-nowrap">次世代ウェルネス戦略</span><br />
                <span className="inline-block whitespace-nowrap">LIVE配信 視聴申し込み</span>
              </h1>

              {/* コピー */}
              {step === "form" && (
                <div className="text-sm sm:text-base mt-4 leading-loose text-left space-y-4" style={{ color: "#5a4838" }}>
                  <p>
                    本LIVE配信は「
                    <strong className="font-bold" style={{ color: "#2a1810" }}>次世代ウェルネス戦略</strong>
                    」をテーマにお届けします。
                  </p>
                  <p>
                    近年、
                    <strong className="font-bold" style={{ color: "#2a1810" }}>iPS細胞や再生医療</strong>
                    といった先端領域は、研究段階から実用化フェーズへと急速に移行しており、健康寿命や予防医療への関心が高まる中で、最新動向への注目が集まっています。
                  </p>
                  <p>本配信では、以下の内容をお届けします。</p>
                  <div
                    className="p-4 rounded-[2px]"
                    style={{
                      background: "rgba(176, 138, 62, 0.06)",
                      borderLeft: "2px solid #b08a3e",
                    }}
                  >
                    <ul className="space-y-3 list-disc pl-5" style={{ color: "#5a4838" }}>
                      <li>そもそもiPS細胞とは何なのか？今、医療・ウェルネス領域で関心が高まっている理由とは？</li>
                      <li>将来の医療や健康管理において、iPS細胞がどのように活用される可能性があるのか？</li>
                      <li>人生100年時代に、なぜ健康寿命を意識することが大切なのか？</li>
                      <li>一部の富裕層や経営者が関心を寄せる、次世代ウェルネス戦略とは？</li>
                    </ul>
                  </div>
                  <p>
                    配信URLおよび視聴に必要な情報は、ご登録のメールアドレス宛にお送りいたします。ご視聴をご希望の方は、以下のフォームにご入力のうえ、注意事項にご同意のうえお申し込みください。
                  </p>
                </div>
              )}

              {(step === "phone" || step === "verify") && (
                <p className="text-sm mt-4 leading-relaxed text-left whitespace-pre-line" style={{ color: "#5a4838" }}>
                  {step === "phone" &&
                    "本配信には機密情報が含まれる場合があるため、SMS認証によるご本人確認を必須とさせていただいております。これは、重複登録および第三者によるなりすましを防止する目的によるものです。\n\nなお、SMS認証が完了するまで配信は開始されませんので、あらかじめご了承ください。"
                  }
                  {step === "verify" && "SMSでお送りした6桁の承認コードを入力してください。"}
                </p>
              )}
            </div>

            {error && (
              <div
                className="mb-6 p-4 rounded-[2px] animate-pulse"
                style={{ background: "#fcefe3", borderLeft: "4px solid #a12324" }}
              >
                <p className="font-medium" style={{ color: "#a12324" }}>{error}</p>
              </div>
            )}

            {step === "form" && (
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      お名前 <span style={{ color: "#a12324" }}>（必須）</span>
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
                      メールアドレス <span style={{ color: "#a12324" }}>（必須）</span>
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
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className={btnStyle}
                    style={goldButtonStyle}
                  >
                    {loading ? "送信中..." : "視聴お申し込みへ進む"}
                  </button>
                </div>
              </form>
            )}

            {step === "phone" && (
              <form onSubmit={handleSendSms}>
                <div className="space-y-4 mb-4">
                  <div
                    className="p-4"
                    style={{
                      background: "rgba(176, 138, 62, 0.06)",
                      borderLeft: "2px solid #b08a3e",
                    }}
                  >
                    <p
                      className="text-sm font-semibold mb-3 pb-2 border-b"
                      style={{ color: "#5a1a2b", borderColor: "#c9b58a", letterSpacing: "0.08em" }}
                    >
                      ◼︎免責事項
                    </p>
                    <div
                      className="text-xs leading-relaxed mb-3 overflow-y-auto pr-2"
                      style={{ maxHeight: "120px", color: "#5a4838" }}
                    >
                      <p>本配信サービスで提供される情報は、あくまで参考情報の提供を目的としたものであり、特定の銘柄・商品・案件への投資勧誘、または投資助言、医療行為・診断・治療の代替を行うものではございません。</p>
                      <p className="mt-2">配信内容に基づく判断および、その結果生じたいかなる損害・損失についても、当社および関係者は一切の責任を負いかねますので、あらかじめご了承ください。</p>
                      <p className="mt-2">健康・医療に関する判断は、ご自身の責任において、必要に応じて医療専門家にご相談のうえ実行いただきますようお願いいたします。</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={topDisclaimerChecked}
                        onChange={(e) => setTopDisclaimerChecked(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded"
                        style={{ accentColor: "#b08a3e" }}
                      />
                      <span className="text-sm" style={{ color: "#2a1810" }}>
                        上記免責事項に同意する <span style={{ color: "#a12324" }}>（必須）</span>
                      </span>
                    </label>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      background: "rgba(176, 138, 62, 0.06)",
                      borderLeft: "2px solid #b08a3e",
                    }}
                  >
                    <p
                      className="text-sm font-semibold mb-3 pb-2 border-b"
                      style={{ color: "#5a1a2b", borderColor: "#c9b58a", letterSpacing: "0.08em" }}
                    >
                      ◼︎秘密保持契約文
                    </p>
                    <div
                      className="text-xs leading-relaxed mb-3 overflow-y-auto pr-2"
                      style={{ maxHeight: "120px", color: "#5a4838" }}
                    >
                      <p>本配信サービスを通じて提供される情報（以下「秘密情報」といいます）は、ご登録者ご本人のみを対象として配信されるものであり、内容の全部または一部を第三者へ開示、転載、複製、共有、転送、SNS等への投稿、その他あらゆる方法によって外部へ流出させる行為を固くお断りいたします。</p>
                      <p className="mt-2">ご登録者は、本配信を受領した時点をもって、秘密情報を善良な管理者の注意義務をもって取り扱うことに同意するものとし、本サービスの目的以外で使用しないものとします。</p>
                      <p className="mt-2">万一、秘密情報の漏洩、流用、目的外利用が確認された場合、当社は配信の即時停止、ならびに損害賠償請求その他必要な法的措置を講じる場合がございますので、あらかじめご了承ください。</p>
                      <p className="mt-2">なお、本契約は本サービスへのご登録時点から、配信終了後も継続して効力を有するものとします。</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ndaChecked}
                        onChange={(e) => setNdaChecked(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded"
                        style={{ accentColor: "#b08a3e" }}
                      />
                      <span className="text-sm" style={{ color: "#2a1810" }}>
                        上記秘密保持契約に同意する <span style={{ color: "#a12324" }}>（必須）</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      電話番号 <span style={{ color: "#a12324" }}>（必須・SMS受信可能な番号）</span>
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
                    <p className="text-xs mt-1" style={{ color: "#7a6a52" }}>
                      ハイフンなしで入力（例: 09012345678）。入力後、承認コードをSMSでお送りします。
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !reportToken || !topDisclaimerChecked || !ndaChecked}
                    className={btnStyle}
                    style={goldButtonStyle}
                  >
                    {loading ? "送信中..." : "承認コードを送信"}
                  </button>
                </div>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={handleVerify}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>
                      承認コード（6桁）
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
                  <p className="text-xs" style={{ color: "#7a6a52" }}>
                    承認コードが届かなかった方は、【再送信】ボタンを押してください。
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !reportToken}
                    className={btnStyle}
                    style={goldButtonStyle}
                  >
                    {loading ? "承認中..." : "承認する"}
                  </button>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={handleResendSms}
                    disabled={loading}
                    className="text-sm py-3 px-4 rounded-[2px] border"
                    style={{ borderColor: "#c9b58a", color: "#5a1a2b", background: "#fffaf0" }}
                  >
                    再送信
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-sm py-3 px-4 rounded-[2px] border"
                    style={{ borderColor: "#c9b58a", color: "#5a1a2b", background: "#fffaf0" }}
                  >
                    電話番号を変更
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <p className="text-xs text-center mt-6" style={{ color: "#f5ecdc" }}>
          &copy;2026 株式会社投資の&quot;KAWARA&quot;版.com
        </p>
      </div>
    </div>
  );
}
