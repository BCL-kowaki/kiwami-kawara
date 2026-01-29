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
  // 整数かどうかをチェック
  if (Number.isInteger(amount)) {
    return `${amount}%`;
  }
  // 小数点以下1桁で丸める
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
  });

  let body = `【資産運用AI分析】受信データ\n\n`;
  body += `受信日時: ${formattedDate}\n`;
  const fullName = [data.familyName, data.givenName].filter(Boolean).join(" ");
  if (fullName) body += `お名前: ${fullName}\n`;
  if (data.email) {
    body += `メールアドレス: ${data.email}\n`;
  }
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;


  const commodityTypeLabel = (t?: string) => {
    switch (t) {
      case "GOLD":
        return "金";
      case "SILVER":
        return "銀";
      case "PLATINUM":
        return "プラチナ";
      case "OTHER":
        return "その他";
      default:
        return t;
    }
  };

  body += `1・ETF・投資信託・NISA\n\n`;
  if (data.funds.details.length > 0) {
    data.funds.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n\n`;

  body += `2・現金・預金\n\n`;
  if (data.cash.details?.length > 0) {
    data.cash.details.forEach((detail: any) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const currency = detail.currency || "JPY";
        body += `・${currency}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n\n`;

  body += `3・上場株\n\n`;
  if (data.listedStocks.details.length > 0) {
    data.listedStocks.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n\n`;

  body += `4・債券\n\n`;
  if (data.bonds.details.length > 0) {
    data.bonds.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n\n`;

  body += `5・貴金属・コモディティ\n\n`;
  if (data.commodities.details.length > 0) {
    data.commodities.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n\n`;

  body += `6・暗号資産\n\n`;
  if (data.crypto.details.length > 0) {
    data.crypto.details.forEach((detail) => {
      if (detail.amount !== undefined && detail.amount !== null) {
        const name = detail.name || "（未入力）";
        body += `・${name}：${formatPercentage(detail.amount)}\n`;
      }
    });
  }
  body += `\n`;

  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `\n【JSONデータ】\n`;
  body += JSON.stringify(data, null, 2);

  return body;
}

function formatUserEmailBody(data: PortfolioSubmission): string {
  const customerName = [data.familyName, data.givenName].filter(Boolean).join(" ");
  const namePrefix = customerName ? `${customerName} 様\n\n` : "";

  let body = `${namePrefix}`;
  body += `この度は、投資のKAWARA版．ｃｏｍ「資産運用AI分析」に\n`;
  body += `お申し込みいただき、誠にありがとうございます。\n\n`;
  body += `━━━━━━━━━━━━━━━━━━\n`;
  body += `■ 今後の流れについて\n`;
  body += `━━━━━━━━━━━━━━━━━━\n\n`;
  body += `① ご入力いただいた内容をもとに、今から分析を行っていきます。\n`;
  body += `② 分析が完了次第、担当者より改めてご連絡いたします。\n`;
  body += `③ レポートの詳細は個人情報が含まれる内容となるため、ご本人確認（SMS認証）を行わせていただきます。\n`;
  body += `④ ご本人確認後、レポートをご覧いただけます。\n\n`;
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
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const command = new SendEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: [to],
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
    console.log("=== フォーム送信受信 ===");
    console.log("Email:", data.email);
    console.log("Name:", `${data.familyName} ${data.givenName}`);

    // AWS認証情報のチェック
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    
    if (!accessKeyId || !secretAccessKey) {
      console.error("AWS credentials are not set");
      // 開発環境では、認証情報がなくてもデータをログに出力して成功を返す
      console.log("=== 資産運用AI分析フォーム送信データ ===");
      console.log(JSON.stringify(data, null, 2));
      console.log("===========================================");
      return NextResponse.json({
        ok: true,
        message: "開発環境: データをログに出力しました（メール送信はスキップ）"
      });
    }

    // 送信元メールアドレスのチェック（必須）
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
    
    // 送信元に表示名を追加
    const fromEmail = `=?UTF-8?B?${Buffer.from('株式会社投資の"KAWARA"版.com').toString('base64')}?= <${fromEmailAddress}>`;

    // 管理者メールアドレス
    const adminEmail = process.env.ADMIN_EMAIL || "mizuki.hirapro@gmail.com";

    console.log("AWS Region:", process.env.AWS_REGION || "ap-northeast-1");
    console.log("From email:", fromEmail);
    console.log("Admin email:", adminEmail);

    const sesClient = getSESClient();
    const adminEmailBody = formatEmailBody(data);
    const userEmailBody = formatUserEmailBody(data);
    const submittedDate = new Date(data.submittedAt);
    const formattedDate = submittedDate.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const customerName = [data.familyName, data.givenName].filter(Boolean).join(" ");
    const adminSubject = `【資産運用AI分析】フォーム入力 ${customerName}様`;
    const userSubject = `【投資のKAWARA版】資産運用AI分析の申請を承りました`;

    // メール送信結果を追跡
    let adminMailSent = false;
    let userMailSent = false;
    let userMailError: string | null = null;

    // 管理者へのメール送信
    console.log("Sending admin email...");
    const adminResult = await sendEmail(
      sesClient,
      fromEmail,
      adminEmail,
      adminSubject,
      adminEmailBody
    );
    
    if (adminResult.success) {
      console.log("Admin email sent successfully, MessageId:", adminResult.messageId);
      adminMailSent = true;
    } else {
      console.error("Admin email failed:", adminResult.error);
    }

    // ユーザーへの自動返信メール送信（メールアドレスが入力されている場合）
    if (data.email && data.email.trim()) {
      console.log("Sending user email to:", data.email.trim());
      const userResult = await sendEmail(
        sesClient,
        fromEmail,
        data.email.trim(),
        userSubject,
        userEmailBody
      );

      if (userResult.success) {
        console.log("User email sent successfully, MessageId:", userResult.messageId);
        userMailSent = true;
      } else {
        console.error("User email failed:", userResult.error);
        userMailError = userResult.error || null;
      }
    } else {
      console.log("User email skipped: email address not provided");
    }

    // 成功・失敗に関わらず200を返す（ログで確認可能）
    return NextResponse.json({
      ok: true,
      adminMailSent,
      userMailSent,
      userMailError: userMailError || undefined,
    });

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { ok: false, message: `サーバーエラーが発生しました: ${error.message || "不明なエラー"}` },
      { status: 500 }
    );
  }
}
