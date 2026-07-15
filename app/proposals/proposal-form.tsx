"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { CreateProposalState } from "./actions";

const fieldClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";
const errorClass = "text-sm text-red-600 dark:text-red-400";

type ProposalFormValues = {
  title: string;
  content: string;
  expectedEffect: string;
};

// 新規作成・編集で共通の提案フォーム。action と初期値・ラベルを差し替えて使う。
export function ProposalForm({
  action,
  initialValues,
  submitLabel = "提案を送信",
  pendingLabel = "送信中…",
  cancelHref = "/",
}: {
  action: (
    state: CreateProposalState,
    formData: FormData,
  ) => Promise<CreateProposalState>;
  initialValues?: ProposalFormValues;
  submitLabel?: string;
  pendingLabel?: string;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  // バリデーションエラー後は入力し直した値を、初回は既存値を表示する。
  const values: ProposalFormValues = {
    title: state?.values?.title ?? initialValues?.title ?? "",
    content: state?.values?.content ?? initialValues?.content ?? "",
    expectedEffect:
      state?.values?.expectedEffect ?? initialValues?.expectedEffect ?? "",
  };

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={labelClass}>
          タイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={values.title}
          placeholder="例：会議室予約をカレンダー連携にしたい"
          className={fieldClass}
        />
        {state?.errors?.title && (
          <p className={errorClass}>{state.errors.title}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="content" className={labelClass}>
          提案内容
        </label>
        <textarea
          id="content"
          name="content"
          rows={5}
          defaultValue={values.content}
          placeholder="どんな改善をしたいか、具体的に記入してください。"
          className={fieldClass}
        />
        {state?.errors?.content && (
          <p className={errorClass}>{state.errors.content}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="expectedEffect" className={labelClass}>
          期待される効果・現状の課題
        </label>
        <textarea
          id="expectedEffect"
          name="expectedEffect"
          rows={3}
          defaultValue={values.expectedEffect}
          placeholder="現状どんな困りごとがあり、改善で何が良くなるか。"
          className={fieldClass}
        />
        {state?.errors?.expectedEffect && (
          <p className={errorClass}>{state.errors.expectedEffect}</p>
        )}
      </div>

      <div className="mt-1 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
