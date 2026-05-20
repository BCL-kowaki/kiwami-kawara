"use client";

import { useState, FormEvent } from "react";
import NetworkBackground from "../../../components/NetworkBackground";

type Step = "phone" | "verify" | "done";

export default function NegTelForm({ urlToken }: { urlToken: string }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topDisclaimerChecked, setTopDisclaimerChecked] = useState(true);
  const [ndaChecked, setNdaChecked] = useState(true);

  const silverBorder = "linear-gradient(270deg, #FFFFFF 0%, #BDC3C9 51%, #FFFFFF 100%)";
  const btnRedGradient = "linear-gradient(90deg, #ec4899 0%, #f472b6 100%)";
  const silverTextGradient = {
    background: "linear-gradient(90deg, #BDC3C9 0%, #FFFFFF 50%, #BDC3C9 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  };
  const inputClass = "w-full px-4 py-3 rounded-[2px] focus:ring-2 focus:ring-[#BDC3C9] transition-all placeholder-gray-500";
  const inputStyle = { background: "#1a1a1a", border: "1px solid #3a3a3a", color: "white" };
  const cardStyle = { background: "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)" };
  const borderStyle = { background: silverBorder };
  const btnStyle = "w-full py-4 rounded-full font-bold text-base transition-all shadow-lg text-white disabled:opacity-60 disabled:cursor-not-allowed";
  const btnGradient = { background: btnRedGradient };

  const handleSendSms = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/neg/tel/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlToken, phone: phone.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "SMS送信に失敗しました。");
        return;
      }
      setSessionToken(json.sessionToken);
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
      const res = await fetch("/api/neg/tel/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlToken, phone: phone.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "再送信に失敗しました。");
        return;
      }
      setSessionToken(json.sessionToken);
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
      const res = await fetch("/api/neg/tel/verify-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, code: code.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "認証に失敗しました。");
        return;
      }
      setStep("done");
    } catch {
      setError("認証に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#050505" }}>
        <NetworkBackground variant="silver" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative z-10 max-w-md w-full">
            <div className="p-[2px] rounded-[2px] shadow-2xl" style={borderStyle}>
              <div className="backdrop-blur-sm rounded-[2px] p-5 text-center" style={cardStyle}>
                <div className="mb-2 pt-6 pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full shadow-lg animate-bounce" style={btnGradient}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#ffffff" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-xl font-extrabold mb-4" style={{ color: "#ffffff" }}>登録が完了しました</h1>
                <div className="space-y-4 mb-6">
                  <p className="text-sm leading-relaxed text-left" style={{ color: "#d4d4d4" }}>
                    投資のKAWARA版「&#34;ほったらかし投資&#34;情報配信サービス」へのお申し込みありがとうございます。
                  </p>
                  <div className="rounded-[2px] p-4 border text-xs" style={{ background: "#151515", borderColor: "#2a2a2a" }}>
                    <p style={{ color: "#cccccc" }}>
                      今後、ご登録いただいたメールアドレス宛に<br />順次情報をお届けしてまいります。<br />
                      配信開始までいましばらくお待ちください。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-center py-4" style={{ color: "#888888" }}>
          &copy;2026 株式会社投資の&#34;KAWARA&#34;版.com
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
              <div className="inline-block mb-3">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(189, 195, 201, 0.1)", color: "#FFFFFF", border: "1px solid rgba(189, 195, 201, 0.35)" }}>
                  KAWARA版特別コンテンツ
                </span>
              </div>
              {step === "phone" && (
                <p className="text-sm mt-4 leading-relaxed text-left text-white">
                  本配信には機密情報が含まれる場合があるため、SMS認証によるご本人確認を必須とさせていただいております。これは、重複登録および第三者によるなりすましを防止する目的によるものです。
                  <br /><br />
                  なお、SMS認証が完了するまで配信は開始されませんので、あらかじめご了承ください。
                </p>
              )}
              {step === "verify" && (
                <p className="text-sm mt-4 leading-relaxed text-left text-white">
                  SMSでお送りした6桁の承認コードを入力してください。
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-[2px] animate-pulse" style={{ background: "#1a1010", borderLeft: "4px solid #ef4444" }}>
                <p className="font-medium" style={{ color: "#fca5a5" }}>{error}</p>
              </div>
            )}

            {step === "phone" && (
              <form onSubmit={handleSendSms}>
                <div className="space-y-4 mb-4">
                  <div className="rounded-[2px] p-4 border" style={{ background: "#0e0e0e", borderColor: "#2a2a2a" }}>
                    <p className="text-sm font-bold mb-2" style={silverTextGradient}>◼︎免責事項</p>
                    <div className="text-xs leading-relaxed mb-3 overflow-y-auto pr-2" style={{ maxHeight: "120px", color: "#cccccc" }}>
                      <p>本配信サービスで提供される情報は、あくまで参考情報の提供を目的としたものであり、特定の銘柄・商品・案件への投資勧誘、または投資助言を行うものではございません。</p>
                      <p className="mt-2">配信内容に基づく投資判断および、その結果生じたいかなる損害・損失についても、当社および関係者は一切の責任を負いかねますので、あらかじめご了承ください。</p>
                      <p className="mt-2">投資にあたっては、ご自身の判断と責任において、十分にご検討のうえ実行いただきますようお願いいたします。</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <span onClick={() => setTopDisclaimerChecked(!topDisclaimerChecked)} className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-[3px] border-2 flex items-center justify-center transition-all" style={{ borderColor: topDisclaimerChecked ? "#ffffff" : "#555555", background: topDisclaimerChecked ? "#ffffff" : "transparent" }}>
                        {topDisclaimerChecked && (<svg className="w-3.5 h-3.5" fill="none" stroke="#000000" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)}
                      </span>
                      <span className="text-sm" style={silverTextGradient}>上記免責事項に同意する <span style={{ color: "#f472b6", WebkitTextFillColor: "#f472b6" }}>（必須）</span></span>
                    </label>
                  </div>
                  <div className="rounded-[2px] p-4 border" style={{ background: "#0e0e0e", borderColor: "#2a2a2a" }}>
                    <p className="text-sm font-bold mb-2" style={silverTextGradient}>◼︎秘密保持契約文</p>
                    <div className="text-xs leading-relaxed mb-3 overflow-y-auto pr-2" style={{ maxHeight: "120px", color: "#cccccc" }}>
                      <p>本配信サービスを通じて提供される情報（以下「秘密情報」といいます）は、ご登録者ご本人のみを対象として配信されるものであり、内容の全部または一部を第三者へ開示、転載、複製、共有、転送、SNS等への投稿、その他あらゆる方法によって外部へ流出させる行為を固くお断りいたします。</p>
                      <p className="mt-2">万一、秘密情報の漏洩、流用、目的外利用が確認された場合、当社は配信の即時停止、ならびに損害賠償請求その他必要な法的措置を講じる場合がございます。</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <span onClick={() => setNdaChecked(!ndaChecked)} className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-[3px] border-2 flex items-center justify-center transition-all" style={{ borderColor: ndaChecked ? "#ffffff" : "#555555", background: ndaChecked ? "#ffffff" : "transparent" }}>
                        {ndaChecked && (<svg className="w-3.5 h-3.5" fill="none" stroke="#000000" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)}
                      </span>
                      <span className="text-sm" style={silverTextGradient}>上記秘密保持契約に同意する <span style={{ color: "#f472b6", WebkitTextFillColor: "#f472b6" }}>（必須）</span></span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={silverTextGradient}>
                      電話番号 <span style={{ color: "#f472b6", WebkitTextFillColor: "#f472b6" }}>（必須・SMS受信可能な番号）</span>
                    </label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass} style={inputStyle} placeholder="09012345678" />
                    <p className="text-xs mt-1" style={silverTextGradient}>ハイフンなしで入力（例: 09012345678）。入力後、承認コードをSMSでお送りします。</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit" disabled={loading || !topDisclaimerChecked || !ndaChecked} className={btnStyle} style={btnGradient}>
                    {loading ? "送信中..." : "承認コードを送信"}
                  </button>
                </div>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={handleVerify}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={silverTextGradient}>承認コード（6桁）</label>
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required maxLength={6} className={inputClass} style={inputStyle} placeholder="123456" />
                  </div>
                  <p className="text-xs" style={silverTextGradient}>承認コードが届かなかった方は、【再送信】ボタンを押してください。</p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button type="submit" disabled={loading || !sessionToken} className={btnStyle} style={btnGradient}>
                    {loading ? "承認中..." : "承認する"}
                  </button>
                  <button type="button" onClick={handleResendSms} disabled={loading} className="text-sm py-3 px-4 rounded-[2px] border" style={{ borderColor: "#3a3a3a", ...silverTextGradient }}>
                    再送信
                  </button>
                  <button type="button" onClick={() => setStep("phone")} className="text-sm py-3 px-4 rounded-[2px] border" style={{ borderColor: "#3a3a3a", ...silverTextGradient }}>
                    電話番号を変更
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <p className="text-xs text-center mt-6" style={silverTextGradient}>
          &copy;2026 株式会社投資の&#34;KAWARA&#34;版.com
        </p>
      </div>
    </div>
  );
}
