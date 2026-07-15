"use client";

import { withdrawProposal } from "../actions";

// 提案者本人が回答前の提案を取り下げるボタン。誤操作防止に確認ダイアログを挟む。
export function WithdrawButton({ proposalId }: { proposalId: string }) {
  return (
    <form
      action={withdrawProposal.bind(null, proposalId)}
      onSubmit={(e) => {
        if (!confirm("この提案を取り下げます。よろしいですか？")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
      >
        取り下げる
      </button>
    </form>
  );
}
