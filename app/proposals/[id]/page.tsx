import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/app/lib/dal";
import { getProposal } from "@/app/lib/proposals";
import {
  statusLabel,
  statusBadgeClass,
  decisionLabel,
  decisionBadgeClass,
  formatDate,
} from "@/app/lib/labels";
import { setProposalStatus } from "../actions";
import { ResponseForm } from "./response-form";
import { WithdrawButton } from "./withdraw-button";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const proposal = await getProposal(id);

  // 存在しない or 閲覧権限なしは 404 扱い
  if (!proposal) {
    notFound();
  }

  const isAdmin = user.role === "ADMIN";
  const isAuthor = proposal.authorId === user.id;
  const isAnswered = proposal.status === "ANSWERED";

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← 一覧へ戻る
        </Link>

        <article className="mt-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {proposal.title}
            </h1>
            <div className="flex shrink-0 gap-1.5">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass[proposal.status]}`}
              >
                {statusLabel[proposal.status]}
              </span>
              {proposal.decision && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${decisionBadgeClass[proposal.decision]}`}
                >
                  {decisionLabel[proposal.decision]}
                </span>
              )}
            </div>
          </div>

          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            提案者：{proposal.author.name}
            {isAdmin && `（${proposal.author.email}）`} ·{" "}
            {formatDate(proposal.createdAt)}
          </p>

          <section className="mt-6">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              提案内容
            </h2>
            <p className="mt-1.5 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
              {proposal.content}
            </p>
          </section>

          <section className="mt-5">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              期待される効果・現状の課題
            </h2>
            <p className="mt-1.5 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
              {proposal.expectedEffect}
            </p>
          </section>
        </article>

        {/* 提案者本人：回答前は編集・取り下げが可能 */}
        {isAuthor && !isAnswered && (
          <div className="mt-4 flex items-center gap-2">
            <Link
              href={`/proposals/${proposal.id}/edit`}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              編集する
            </Link>
            <WithdrawButton proposalId={proposal.id} />
          </div>
        )}

        {/* 管理者：回答前は受付状況（未対応⇄検討中）を切り替えられる */}
        {isAdmin && !isAnswered && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              受付状況：
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {statusLabel[proposal.status]}
              </span>
            </span>
            {proposal.status === "PENDING" ? (
              <form action={setProposalStatus.bind(null, proposal.id, "IN_REVIEW")}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  検討中にする
                </button>
              </form>
            ) : (
              <form action={setProposalStatus.bind(null, proposal.id, "PENDING")}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  未対応に戻す
                </button>
              </form>
            )}
          </div>
        )}

        {/* 回答（回答済のとき表示） */}
        {isAnswered && proposal.responseText && (
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                管理者からの回答
              </h2>
              {proposal.decision && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${decisionBadgeClass[proposal.decision]}`}
                >
                  {decisionLabel[proposal.decision]}
                </span>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
              {proposal.responseText}
            </p>
            {proposal.implementationPlan && (
              <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  実施する改善策
                </h3>
                <p className="mt-1.5 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
                  {proposal.implementationPlan}
                </p>
              </div>
            )}
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              {proposal.respondedBy?.name ?? "管理者"}
              {proposal.respondedAt && ` · ${formatDate(proposal.respondedAt)}`}
            </p>
          </section>
        )}

        {/* 管理者向け：回答フォーム（未回答なら記入、回答済なら修正） */}
        {isAdmin && (
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 font-medium text-zinc-900 dark:text-zinc-50">
              {isAnswered ? "回答を修正する" : "この提案に回答する"}
            </h2>
            <ResponseForm
              proposalId={proposal.id}
              currentDecision={proposal.decision}
              currentResponseText={proposal.responseText}
              currentImplementationPlan={proposal.implementationPlan}
            />
          </section>
        )}
      </div>
    </div>
  );
}
