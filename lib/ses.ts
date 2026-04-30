import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export function getSESClient(): SESClient {
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

export async function sendEmail(
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
      Destination: { ToAddresses: toAddresses },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: { Text: { Data: body, Charset: "UTF-8" } },
      },
    });
    const result = await client.send(command);
    return { success: true, messageId: result.MessageId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("SES send error:", error);
    return { success: false, error: message };
  }
}

export function getFromEmail(): string {
  const fromEmailAddress = process.env.SES_FROM_EMAIL;
  if (!fromEmailAddress) throw new Error("SES_FROM_EMAILが未設定です");
  return `=?UTF-8?B?${Buffer.from('株式会社投資の"KAWARA"版.com').toString('base64')}?= <${fromEmailAddress}>`;
}
