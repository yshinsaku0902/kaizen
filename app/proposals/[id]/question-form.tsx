"use client";

import { useActionState, useEffect, useRef } from "react";
import { askQuestion, type AskQuestionState } from "../actions";

// 管理者が提案者への質問を記録するフォーム。
export function QuestionForm({ proposalId }: { proposalId: string }) {
  const action = askQuestion.bind(null, proposalId);
  const [state, formAction, pending] = useActionState<AskQuestionState, FormData>(
    action,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // 送信成功したら入力欄をクリアする。
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <textarea
        name="question"
        rows={3}
        defaultValue={state?.value ?? ""}
        placeholder="提案者に確認したいことを記入してください。提案に記録され、提案者もこのページで確認できます。"
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
      />
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {state.success}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "記録中…" : "質問を記録"}
        </button>
      </div>
    </form>
  );
}
