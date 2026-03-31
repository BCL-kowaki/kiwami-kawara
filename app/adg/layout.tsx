import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "超精密！資産運用AI分析エンジン「極」｜投資のKAWARA版",
  description: "あなたの資産状況をAIが精密に分析。7カテゴリの資産情報を入力いただくだけで、プロ級の分析レポートをお届けします。",
};

export default function AdgLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Google Ads CV Tag */}
      <Script id="google-ads-cv" strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `gtag('event', 'conversion', {'send_to': 'AW-18041797103/C_DWCPLjtpAcEO_z_5pD'});`,
        }}
      />
      {children}
    </>
  );
}
