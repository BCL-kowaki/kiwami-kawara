import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `【KAWARA版特別レポート】カルダノ（ADA）崩壊のカウントダウン。「構造的に選ばれなくなった資産」｜投資のKAWARA版`,
  description: "感情を一切排除し、カルダノ（ADA）の「構造」だけを冷徹に解剖。流動性枯渇とガバナンスの機能不全から導き出した衰退シナリオを、資産分析AIエンジン「極（KIWAMI）」が特別レポートでお届けします。",
};

export default function AdaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
