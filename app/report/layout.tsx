import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "【1,000名突破記念】AI「極」が選んだ最優秀ポートフォリオレポート｜投資のKAWARA版",
  description: "利用者1,000名の中からAI「極」が選出した「最も優れたポートフォリオ」の全貌を特別レポートでお届け。地政学リスク・変動相場の中でも選ばれたポートフォリオとは。",
};

export default function ReportLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
