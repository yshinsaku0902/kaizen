import Link from "next/link";
import { signOut } from "@/auth";
import { requireUser } from "@/app/lib/dal";
import {
  listProposalsFor,
  countProposalsByStatus,
} from "@/app/lib/proposals";
import {
  statusLabel,
  statusBadgeClass,
  decisionLabel,
  decisionBadgeClass,
} from "@/app/lib/labels";
import type { ProposalStatus } from "@/app/generated/prisma/enums";

// 絞り込みタブに使う有効なステータスかどうか。
function toStatus(value?: string): ProposalStatus | undefined {
  return value === "PENDING" || value === "IN_REVIEW" || value === "ANSWERED"
    ? value
    : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const activeStatus = toStatus((await searchParams).status);
  const [proposals, counts] = await Promise.all([
    listProposalsFor(user, activeStatus),
    countProposalsByStatus(user),
  ]);
  const total = counts.PENDING + counts.IN_REVIEW + counts.ANSWERED;

  // 絞り込みタブの定義（すべて＋各ステータス、件数バッジ付き）。
  const filters: { value: ProposalStatus | undefined; label: string; count: number }[] = [
    { value: undefined, label: "すべて", count: total },
    { value: "PENDING", label: statusLabel.PENDING, count: counts.PENDING },
    { value: "IN_REVIEW", label: statusLabel.IN_REVIEW, count: counts.IN_REVIEW },
    { value: "ANSWERED", label: statusLabel.ANSWERED, count: counts.ANSWERED },
  ];

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
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/account/password"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              パスワード変更
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                ユーザー管理
              </Link>
            )}
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
          </div>
        </header>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => {
              const active = activeStatus === f.value;
              return (
                <Link
                  key={f.label}
                  href={f.value ? `/?status=${f.value}` : "/"}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  {f.label}
                  <span
                    className={`text-xs ${active ? "opacity-70" : "text-zinc-400 dark:text-zinc-500"}`}
                  >
                    {f.count}
                  </span>
                </Link>
              );
            })}
          </div>
          <Link
            href="/proposals/new"
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            ＋ 新規提案
          </Link>
        </div>

        {proposals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
            {activeStatus ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                「{statusLabel[activeStatus]}」の提案はありません。
              </p>
            ) : (
              <>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  まだ提案がありません。
                </p>
                <Link
                  href="/proposals/new"
                  className="mt-2 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                >
                  最初の提案を投稿する
                </Link>
              </>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {proposals.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/proposals/${p.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <h2 className="truncate font-medium text-zinc-900 dark:text-zinc-50">
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
