import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "超精密！資産運用AI分析ツール「極」｜株式会社投資の\"KAWARA\"版.com",
  description: "資産運用AI診断フォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
