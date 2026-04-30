import { NextRequest, NextResponse } from "next/server";
import { PortfolioSubmission } from "@/types/portfolio";
import { getSESClient, sendEmail, getFromEmail } from "@/lib/ses";
import { signReportToken } from "@/lib/report-token";

const ADMIN_EMAILS = [
  "quest@kawaraban.co.jp",
  "y3awtd-hirayama-p@hdbronze.htdb.jp",
  "mailmagazine.entry@gmail.com",
];

function formatPercentage(amount: number): string {
  if (Number.isInteger(amount)) return `${amount}%`;
  return `${Math.round(amount * 10) / 10}%`;
}

function formatAdminEmailBody(data: PortfolioSubmission): string {
  const submittedDate = new Date(data.submittedAt);
  const formattedDate = submittedDate.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });

  let body = `【Google広告経由】資産運用AI分析ツール 受信データ\n\n`;
  body += `受信日時: ${formattedDate}\n`;
  const fullName = data.name || [data.familyName, data.givenName].filter(Boolean).join(" ");
  if (fullName) body += `お名前: ${fullName}\n`;
  if (data.email) body += `メールアドレス: ${data.email}\n`;
  body += `\n資産状況:\n`;

  body += `1・ETF・投資信託・NISA\n`;
  if (data.funds.details.length > 0) {
    data.funds.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        body += `・${detail.name || "（未入力）"}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `2・現金・預金\n`;
  if (data.cash.details?.length > 0) {
    data.cash.details.forEach((detail: any) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        body += `・${detail.currency || "JPY"}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `3・上場株\n`;
  if (data.listedStocks.details.length > 0) {
    data.listedStocks.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        body += `・${detail.name || "（未入力）"}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `4・債券\n`;
  if (data.bonds.details.length > 0) {
    data.bonds.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        body += `・${detail.name || "（未入力）"}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `5・貴金属・コモディティ\n`;
  if (data.commodities.details.length > 0) {
    data.commodities.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        body += `・${detail.name || "（未入力）"}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `6・暗号資産\n`;
  if (data.crypto.details.length > 0) {
    data.crypto.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        body += `・${detail.name || "（未入力）"}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }

  return body;
}

export async function POST(request: NextRequest) {
  try {
    const data: PortfolioSubmission = await request.json();
    console.log("=== 【Google広告経由】フォーム送信受信 ===");
    console.log("Email:", data.email);
    console.log("Name:", data.name || `${data.familyName} ${data.givenName}`);

    const fullName = data.name || [data.familyName, data.givenName].filter(Boolean).join(" ");
    const emailAddr = (data.email || "").trim().toLowerCase();

    if (!fullName) {
      return NextResponse.json({ ok: false, message: "お名前を入力してください。" }, { status: 400 });
    }
    if (!emailAddr) {
      return NextResponse.json({ ok: false, message: "メールアドレスを入力してください。" }, { status: 400 });
    }

    // トークン発行（SMS認証ステップ用）
    const token = signReportToken({ email: emailAddr, name: fullName, address: "" });

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      console.log("[adg/submit] AWS not set, skipping email.");
      console.log("=== 【Google広告経由】資産運用AI分析フォーム送信データ ===");
      console.log(JSON.stringify(data, null, 2));
      return NextResponse.json({ ok: true, token });
    }

    const fromEmail = getFromEmail();
    const sesClient = getSESClient();
    const adminEmailBody = formatAdminEmailBody(data);
    const customerName = fullName;
    const adminSubject = `【Google広告経由】【資産運用AI分析】フォーム入力 ${customerName}様`;

    // 管理者へのメール送信
    console.log("Sending admin email to:", ADMIN_EMAILS.join(", "));
    await sendEmail(sesClient, fromEmail, ADMIN_EMAILS, adminSubject, adminEmailBody);

    return NextResponse.json({ ok: true, token });
  } catch (error: any) {
    console.error("[adg/submit] API error:", error);
    return NextResponse.json(
      { ok: false, message: `サーバーエラーが発生しました: ${error.message || "不明なエラー"}` },
      { status: 500 }
    );
  }
}
