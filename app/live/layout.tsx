import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `次世代ウェルネス戦略 LIVE配信視聴申し込み｜投資のKAWARA版`,
  description: "iPS細胞・再生医療をはじめとする最先端のウェルネス領域に関する情報を、第一線の専門家からLIVE配信でお届けする視聴サービス。",
};

export default function LiveLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
