import Link from "next/link";
import { requireUser } from "@/app/lib/dal";
import { ProposalForm } from "./proposal-form";

export default async function NewProposalPage() {
  await requireUser();

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← 一覧へ戻る
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          新規の業務改善提案
        </h1>
        <p className="mt-1 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          気づいた改善アイデアを投稿してください。
        </p>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <ProposalForm />
        </div>
      </div>
    </div>
  );
}
