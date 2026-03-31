import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `【KAWARA版特別レポート】\u201C今\u201D！BTC価格の歴史的な分水嶺。暴騰か暴落か。精密AIが導き出した極端な未来とは？｜投資のKAWARA版`,
  description: "感情を排除し、BTCの「構造」だけを冷徹に解剖。資産分析AIエンジン「極（KIWAMI）」リサーチ部門が発行する特別レポートを無料でお届けします。",
};

export default function BtcKbtmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
