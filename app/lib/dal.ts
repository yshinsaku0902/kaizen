// 認可の共通処理（Data Access Layer）。
// ページ・Server Action の入口で呼び、ログイン/権限を担保する。
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// ログイン必須。未ログインなら /login へ。戻り値はセッション上のユーザー。
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

// 管理者必須。社員がアクセスしたらトップへ戻す。
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
