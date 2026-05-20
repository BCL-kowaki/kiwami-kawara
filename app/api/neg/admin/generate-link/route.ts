import { NextRequest, NextResponse } from "next/server";
import { signNegTelToken } from "@/lib/neg-tel-token";

// 管理者認証用パスワード（環境変数 ADMIN_PASSWORD で設定。未設定時はデフォルト値）
function getAdminPassword(): string {
    return process.env.NEG_ADMIN_PASSWORD || "kawara-admin-2026";
  }

export async function POST(request: NextRequest) {
    try {
          const { email, name, password } = await request.json();

          // 管理者認証
          if (!password || password !== getAdminPassword()) {
                  return NextResponse.json({ ok: false, message: "認証に失敗しました。" }, { status: 401 });
                }

          const trimmedEmail = (email || "").trim().toLowerCase();
          const trimmedName = (name || "").trim();

          if (!trimmedEmail) {
                  return NextResponse.json({ ok: false, message: "メールアドレスを入力してください。" }, { status: 400 });
                }

          const token = signNegTelToken({ email: trimmedEmail, name: trimmedName });
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kiwami.kawaraban.co.jp";
          const url = `${baseUrl}/neg/tel/${token}`;

          return NextResponse.json({ ok: true, url, token });
        } catch (err) {
          console.error("[neg/admin/generate-link]", err);
          return NextResponse.json({ ok: false, message: "エラーが発生しました。" }, { status: 500 });
        }
  }
