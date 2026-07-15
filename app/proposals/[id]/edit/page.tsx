import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/app/lib/dal";
import { getProposal } from "@/app/lib/proposals";
import { ProposalForm } from "../../proposal-form";
import { updateProposal } from "../../actions";

export default async function EditProposalPage({
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

  // 編集できるのは提案者本人・回答前のみ。それ以外は詳細へ戻す。
  if (proposal.authorId !== user.id || proposal.status === "ANSWERED") {
    redirect(`/proposals/${id}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-2xl">
        <Link
          href={`/proposals/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← 提案へ戻る
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          提案を編集
        </h1>
        <p className="mt-1 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          回答前の提案は内容を修正できます。
        </p>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <ProposalForm
            action={updateProposal.bind(null, id)}
            initialValues={{
              title: proposal.title,
              content: proposal.content,
              expectedEffect: proposal.expectedEffect,
            }}
            submitLabel="変更を保存"
            pendingLabel="保存中…"
            cancelHref={`/proposals/${id}`}
          />
        </div>
      </div>
    </div>
  );
}
