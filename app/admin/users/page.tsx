import Link from "next/link";
import { requireAdmin } from "@/app/lib/dal";
import { prisma } from "@/app/lib/prisma";
import { formatDate } from "@/app/lib/labels";
import { UserForm } from "./user-form";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← 一覧へ戻る
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          ユーザー管理
        </h1>
        <p className="mt-1 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          社員・管理者アカウントを作成します。
        </p>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            登録済みユーザー（{users.length}名）
          </h2>
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                    {u.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {u.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === "ADMIN"
                        ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {u.role === "ADMIN" ? "管理者" : "社員"}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatDate(u.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 font-medium text-zinc-900 dark:text-zinc-50">
            新規ユーザーを作成
          </h2>
          <UserForm />
        </section>
      </div>
    </div>
  );
}
