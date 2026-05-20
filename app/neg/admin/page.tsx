"use client";

import { useState, FormEvent } from "react";

export default function NegAdminPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedUrl("");
    setCopied(false);
    setLoading(true);
    try {
      const res = await fetch("/api/neg/admin/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), password }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "エラーが発生しました。");
        return;
      }
      setGeneratedUrl(json.url);
    } catch {
      setError("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // フォールバック
      const ta = document.createElement("textarea");
      ta.value = generatedUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">管理画面</h1>
        <p className="text-gray-400 text-sm mb-8">
          メールアドレス別の電話番号取得ページURLを生成します。<br />
          生成されたURLをメールに記載して顧客に送付してください。
        </p>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                管理者パスワード <span className="text-red-400">（必須）</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                placeholder="管理者パスワード"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                顧客メールアドレス <span className="text-red-400">（必須）</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                顧客名（任意）
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                placeholder="山田 太郎"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded font-bold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(90deg, #ec4899 0%, #f472b6 100%)" }}
            >
              {loading ? "生成中..." : "URLを生成"}
            </button>
          </form>

          {generatedUrl && (
            <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-600">
              <p className="text-sm font-medium text-gray-300 mb-2">生成されたURL：</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-xs break-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded text-sm font-medium text-white transition-all flex-shrink-0"
                  style={{ background: copied ? "#16a34a" : "#374151" }}
                >
                  {copied ? "コピー済み!" : "コピー"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ※ このURLをメールに記載して顧客に送付してください。有効期限は30日です。
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-900 rounded border border-gray-700 text-xs text-gray-500">
          <p className="font-bold text-gray-400 mb-1">【使い方】</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>管理者パスワードを入力</li>
            <li>顧客のメールアドレスと名前を入力</li>
            <li>「URLを生成」ボタンを押す</li>
            <li>生成されたURLをコピーしてメールに貼り付けて顧客に送付</li>
            <li>顧客がURLにアクセスすると電話番号認証ページが表示される</li>
            <li>認証完了後、管理者へ通知メールが届く</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
