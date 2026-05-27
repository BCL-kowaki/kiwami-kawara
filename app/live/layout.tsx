import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `もう相場には疲れた！そんなあなたのための“ほったらかし投資”情報配信サービス｜投資のKAWARA版`,
  description: "もう相場には疲れた！そんなあなたのための“ほったらかし投資”情報配信サービス。",
};

export default function NegLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
