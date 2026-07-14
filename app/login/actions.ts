"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

// ログインフォームの Server Action。
// 成功時は signIn が redirect（例外）を投げるので、その場合はそのまま再送出する。
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "メールアドレスまたはパスワードが正しくありません。";
    }
    // redirect などの制御用例外は再送出する
    throw error;
  }
  return undefined;
}
