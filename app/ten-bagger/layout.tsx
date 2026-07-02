import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `【KAWARA版特別レポート】時価総額300億円から“10倍”へ。精密AIが特定した次のテンバガー有望銘柄とは？｜投資のKAWARA版`,
  description: "感情を排除し、企業の「構造」だけを冷徹に解剖。資産分析AIエンジン「極（KIWAMI）」リサーチ部門が発行するテンバガー有望特別レポートを無料でお届けします。",
};

export default function TenBaggerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
