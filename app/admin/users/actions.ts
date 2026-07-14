"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/app/lib/dal";
import { prisma } from "@/app/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";

export type CreateUserState =
  | {
      errors?: {
        email?: string;
        name?: string;
        password?: string;
        role?: string;
      };
      values?: { email: string; name: string; role: string };
      success?: string;
    }
  | undefined;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 管理者が新しいユーザー（社員／管理者）を作成する Server Action。
export async function createUser(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  const errors: NonNullable<CreateUserState>["errors"] = {};
  if (!emailPattern.test(email)) {
    errors.email = "正しいメールアドレスを入力してください。";
  }
  if (!name) errors.name = "名前を入力してください。";
  if (password.length < 8) {
    errors.password = "パスワードは8文字以上で入力してください。";
  }
  if (role !== "EMPLOYEE" && role !== "ADMIN") {
    errors.role = "役割を選択してください。";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values: { email, name, role } };
  }

  // メール重複チェック
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      errors: { email: "このメールアドレスは既に登録されています。" },
      values: { email, name, role },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name, passwordHash, role: role as Role },
  });

  // 一覧を最新化
  revalidatePath("/admin/users");
  return { success: `${name} さんを作成しました。` };
}
