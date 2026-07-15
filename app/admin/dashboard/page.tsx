import Link from "next/link";
import { requireAdmin } from "@/app/lib/dal";
import { getDashboardStats } from "@/app/lib/proposals";
import {
  statusLabel,
  statusBadgeClass,
  decisionLabel,
  decisionBadgeClass,
  formatDate,
} from "@/app/lib/labels";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getDashboardStats();

  // サマリータイル（総数＋ステータス別）
  const tiles: { label: string; value: number }[] = [
    { label: "総提案数", value: stats.total },
    { label: statusLabel.PENDING, value: stats.status.PENDING },
    { label: statusLabel.IN_REVIEW, value: stats.status.IN_REVIEW },
    { label: statusLabel.ANSWERED, value: stats.status.ANSWERED },
  ];

  const decisions = ["ADOPTED", "REJECTED", "ON_HOLD"] as const;

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
          ダッシュボード
        </h1>
        <p className="mt-1 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          提案の状況サマリー
        </p>

        {/* サマリータイル */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {t.value}
              </p>
            </div>
          ))}
        </div>

        {/* 結論の内訳＋採用率 */}
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
              結論の内訳
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              採用率{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {stats.adoptionRate === null ? "—" : `${stats.adoptionRate}%`}
              </span>
              <span className="ml-1 text-xs">（回答済 {stats.decided} 件中）</span>
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {decisions.map((d) => (
              <div key={d} className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${decisionBadgeClass[d]}`}
                >
                  {decisionLabel[d]}
                </span>
                <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {stats.decision[d]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 対応待ち（古い順） */}
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            対応待ち（古い順）
          </h2>
          {stats.oldestOpen.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
              対応待ちの提案はありません。
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
              {stats.oldestOpen.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/proposals/${p.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                        {p.title}
                      </p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        提案者：{p.author.name} · {formatDate(p.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass[p.status]}`}
                    >
                      {statusLabel[p.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
