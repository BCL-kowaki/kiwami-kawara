import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "【KAWARA版特別レポート】XRPの仕組みに隠れた「上がりにくい理由」｜投資のKAWARA版",
  description: "感情を排除し、XRPの「構造」だけを冷徹に解剖。資産分析AIエンジン「極（KIWAMI）」リサーチ部門が発行する特別レポートを無料でお届けします。",
};

export default function XrpKbtmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
