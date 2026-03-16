import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "超精密！資産運用AI分析エンジン「極」｜投資のKAWARA版",
  description: "あなたの資産状況をAIが精密に分析。7カテゴリの資産情報を入力いただくだけで、プロ級の分析レポートをお届けします。",
};

export default function AdLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Meta Pixel Code */}
      <Script id="meta-pixel" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2140461380047418');
fbq('track', 'PageView');
fbq('track', 'CompleteRegistration');`,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=2140461380047418&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      {/* End Meta Pixel Code */}
      {children}
    </>
  );
}
