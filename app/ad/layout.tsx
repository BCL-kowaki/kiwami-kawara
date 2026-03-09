import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "超精密！資産運用AI分析エンジン「極」｜投資のKAWARA版",
  description: "あなたの資産状況をAIが精密に分析。7カテゴリの資産情報を入力いただくだけで、プロ級の分析レポートをお届けします。",
};

export default function AdLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
