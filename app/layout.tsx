import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "超精密！資産運用AI分析「極」",
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
