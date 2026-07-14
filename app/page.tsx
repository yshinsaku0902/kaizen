import Link from "next/link";
import { signOut } from "@/auth";
import { requireUser } from "@/app/lib/dal";
import { listProposalsFor } from "@/app/lib/proposals";
import {
  statusLabel,
  statusBadgeClass,
  decisionLabel,
  decisionBadgeClass,
  formatDate,
} from "@/app/lib/labels";

export default async function Home() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const proposals = await listProposalsFor(user);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              業務改善提案
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {user.name}（{isAdmin ? "管理者" : "社員"}）
              {isAdmin ? "／全員の提案を表示中" : "／自分の提案を表示中"}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              ログアウト
            </button>
          </form>
        </header>

        <div className="mb-5 flex justify-end">
          <Link
            href="/proposals/new"
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            ＋ 新規提案
          </Link>
        </div>

        {proposals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              まだ提案がありません。
            </p>
            <Link
              href="/proposals/new"
              className="mt-2 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
            >
              最初の提案を投稿する
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {proposals.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/proposals/${p.id}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                    {p.title}
                  </h2>
                  <div className="flex shrink-0 gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass[p.status]}`}
                    >
                      {statusLabel[p.status]}
                    </span>
                    {p.decision && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${decisionBadgeClass[p.decision]}`}
                      >
                        {decisionLabel[p.decision]}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {p.content}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                  {isAdmin && <span>提案者：{p.author.name}</span>}
                  {isAdmin && <span aria-hidden>·</span>}
                  <span>{formatDate(p.createdAt)}</span>
                </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
