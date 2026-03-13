import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "超精密！資産運用AI分析エンジン「極」｜株式会社投資の\"KAWARA\"版.com",
  description: "資産運用AI診断フォーム",
};

export default function KbtmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
