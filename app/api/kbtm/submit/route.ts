import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { PortfolioSubmission } from "@/types/portfolio";

// SESクライアントを取得
function getSESClient() {
  const region = process.env.AWS_REGION || "ap-northeast-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not set");
  }

  return new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// 割合を%単位に整形する関数（整数の場合は小数点なしで表示）
function formatPercentage(amount: number): string {
  if (Number.isInteger(amount)) {
    return `${amount}%`;
  }
  return `${Math.round(amount * 10) / 10}%`;
}

function formatEmailBody(data: PortfolioSubmission): string {
  const submittedDate = new Date(data.submittedAt);
  const formattedDate = submittedDate.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });

  let body = `【個別メール】【資産運用AI分析ツール】受信データ\n\n`;
  body += `受信日時: ${formattedDate}\n`;
  const fullName = data.name || [data.familyName, data.givenName].filter(Boolean).join(" ");
  if (fullName) body += `お名前: ${fullName}\n`;
  if (data.email) {
    body += `メールアドレス: ${data.email}\n`;
  }
  body += `資産状況:\n`;

  body += `1・ETF・投資信託・NISA\n`;
  if (data.funds.details.length > 0) {
    data.funds.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `2・現金・預金\n`;
  if (data.cash.details?.length > 0) {
    data.cash.details.forEach((detail: any) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const currency = detail.currency || "JPY";
        body += `・${currency}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `3・上場株\n`;
  if (data.listedStocks.details.length > 0) {
    data.listedStocks.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `4・債券\n`;
  if (data.bonds.details.length > 0) {
    data.bonds.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `5・貴金属・コモディティ\n`;
  if (data.commodities.details.length > 0) {
    data.commodities.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `6・暗号資産\n`;
  if (data.crypto.details.length > 0) {
    data.crypto.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }

  return body;
}

function formatUserEmailBody(data: PortfolioSubmission): string {
  const customerName = data.name || [data.familyName, data.givenName].filter(Boolean).join(" ");
  const namePrefix = customerName ? `${customerName} 様\n\n` : "";

  let body = `${namePrefix}`;
  body += `この度は、投資のKAWARA版．ｃｏｍ 資産分析AIエンジン"極"に\n`;
  body += `お申し込みいただき、誠にありがとうございます。\n\n`;
  body += `━━━━━━━━━━━━━━━━━━\n`;
  body += `■ 今後の流れについて\n`;
  body += `━━━━━━━━━━━━━━━━━━\n\n`;
  body += `① ご入力いただいた内容をもとに、これからAIが精密な分析を行っていきます。\n`;
  body += `② 分析が完了次第、担当者より改めてご連絡いたします。\n`;
  body += `③ レポートの詳細は個人情報が含まれる内容となるため、ご本人様確認（SMS認証）を行わせていただきます。\n`;
  body += `④ ご本人様確認後、レポートをご覧いただけます。\n\n`;
  body += `目安として3営業日以内にご連絡させていただきます。\n`;
  body += `お楽しみにお待ちください。\n\n`;
  body += `━━━━━━━━━━━━━━━━━━\n`;
  body += `■ ご注意事項\n`;
  body += `━━━━━━━━━━━━━━━━━━\n\n`;
  body += `・本メールは自動送信です。\n`;
  body += `・本メールへの返信ではお問い合わせを受け付けておりません。\n`;
  body += `・内容に心当たりがない場合は、本メールを破棄してください。\n\n`;
  body += `━━━━━━━━━━━━━━━━━━\n\n`;
  body += `株式会社投資の"KAWARA"版．ｃｏｍ\n\n`;
  body += `（本メールは自動送信です）\n`;

  return body;
}

// SESでメール送信
async function sendEmail(
  client: SESClient,
  from: string,
  to: string | string[],
  subject: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const toAddresses = Array.isArray(to) ? to : [to];
    const command = new SendEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: body,
            Charset: "UTF-8",
          },
        },
      },
    });

    const result = await client.send(command);
    return { success: true, messageId: result.MessageId };
  } catch (error: any) {
    console.error("SES send error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: PortfolioSubmission = await request.json();
    console.log("=== [kbtm] フォーム送信受信 ===");
    console.log("Email:", data.email);
    console.log("Name:", data.name || `${data.familyName} ${data.givenName}`);

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      console.error("AWS credentials are not set");
      console.log("=== [kbtm] 資産運用AI分析フォーム送信データ ===");
      console.log(JSON.stringify(data, null, 2));
      console.log("===========================================");
      return NextResponse.json({
        ok: true,
        message: "開発環境: データをログに出力しました（メール送信はスキップ）"
      });
    }

    const fromEmailAddress = process.env.SES_FROM_EMAIL;
    if (!fromEmailAddress) {
      console.error("SES_FROM_EMAILが未設定");
      return NextResponse.json({
        ok: false,
        message: "SES_FROM_EMAILが未設定です",
        adminMailSent: false,
        userMailSent: false,
      }, { status: 500 });
    }

    const fromEmail = `=?UTF-8?B?${Buffer.from('株式会社投資の"KAWARA"版.com').toString('base64')}?= <${fromEmailAddress}>`;

    const adminEmails = [
      "quest@kawaraban.co.jp",
      "y3awtd-hirayama-p@hdbronze.htdb.jp",
      "mailmagazine.entry@gmail.com",
    ];

    const sesClient = getSESClient();
    const adminEmailBody = formatEmailBody(data);
    const userEmailBody = formatUserEmailBody(data);
    const customerName = data.name || [data.familyName, data.givenName].filter(Boolean).join(" ");
    const adminSubject = `【個別メール】【資産運用AI分析】フォーム入力 ${customerName}様`;
    const userSubject = `【投資のKAWARA版】資産運用AI分析の申請を承りました`;

    let adminMailSent = false;
    let userMailSent = false;
    let userMailError: string | null = null;

    const adminResult = await sendEmail(
      sesClient,
      fromEmail,
      adminEmails,
      adminSubject,
      adminEmailBody
    );

    if (adminResult.success) {
      console.log("[kbtm] Admin email sent successfully, MessageId:", adminResult.messageId);
      adminMailSent = true;
    } else {
      console.error("[kbtm] Admin email failed:", adminResult.error);
    }

    if (data.email && data.email.trim()) {
      const userResult = await sendEmail(
        sesClient,
        fromEmail,
        data.email.trim(),
        userSubject,
        userEmailBody
      );

      if (userResult.success) {
        console.log("[kbtm] User email sent successfully, MessageId:", userResult.messageId);
        userMailSent = true;
      } else {
        console.error("[kbtm] User email failed:", userResult.error);
        userMailError = userResult.error || null;
      }
    }

    return NextResponse.json({
      ok: true,
      adminMailSent,
      userMailSent,
      userMailError: userMailError || undefined,
    });

  } catch (error: any) {
    console.error("[kbtm] API error:", error);
    return NextResponse.json(
      { ok: false, message: `サーバーエラーが発生しました: ${error.message || "不明なエラー"}` },
      { status: 500 }
    );
  }
}
