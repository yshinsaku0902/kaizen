"use server";

import bcrypt from "bcryptjs";
import { requireUser } from "@/app/lib/dal";
import { prisma } from "@/app/lib/prisma";

export type ChangePasswordState =
  | {
      errors?: {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      };
      success?: string;
    }
  | undefined;

// ログイン中の本人が自分のパスワードを変更する Server Action。
export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const sessionUser = await requireUser();

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });
  if (!user) {
    // セッションはあるがユーザーが消えている等の異常系
    return { errors: { currentPassword: "ユーザーが見つかりません。" } };
  }

  const errors: NonNullable<ChangePasswordState>["errors"] = {};

  const currentOk = await bcrypt.compare(current, user.passwordHash);
  if (!currentOk) {
    errors.currentPassword = "現在のパスワードが正しくありません。";
  }
  if (next.length < 8) {
    errors.newPassword = "新しいパスワードは8文字以上で入力してください。";
  }
  if (next !== confirm) {
    errors.confirmPassword = "確認用パスワードが一致しません。";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const passwordHash = await bcrypt.hash(next, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: "パスワードを変更しました。" };
}
