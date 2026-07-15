"use client";

import { useActionState } from "react";
import { respondToProposal, type RespondState } from "../actions";
import { decisionLabel } from "@/app/lib/labels";
import type { Decision } from "@/app/generated/prisma/enums";

const decisions: Decision[] = ["ADOPTED", "REJECTED", "ON_HOLD"];

export function ResponseForm({
  proposalId,
  currentDecision,
  currentResponseText,
  currentImplementationPlan,
}: {
  proposalId: string;
  currentDecision: Decision | null;
  currentResponseText: string | null;
  currentImplementationPlan: string | null;
}) {
  // proposalId を第1引数に束縛し、(prevState, formData) 形式にする
  const action = respondToProposal.bind(null, proposalId);
  const [state, formAction, pending] = useActionState<RespondState, FormData>(
    action,
    undefined,
  );

  const selectedDecision = state?.values?.decision ?? currentDecision ?? "";
  const responseText = state?.values?.responseText ?? currentResponseText ?? "";
  const implementationPlan =
    state?.values?.implementationPlan ?? currentImplementationPlan ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          結論
        </legend>
        <div className="flex flex-wrap gap-2">
          {decisions.map((d) => (
            <label
              key={d}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 dark:border-zinc-700 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:bg-zinc-900"
            >
              <input
                type="radio"
                name="decision"
                value={d}
                defaultChecked={selectedDecision === d}
              />
              <span className="text-zinc-900 dark:text-zinc-100">
                {decisionLabel[d]}
              </span>
            </label>
          ))}
        </div>
        {state?.errors?.decision && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.decision}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="responseText"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          回答文
        </label>
        <textarea
          id="responseText"
          name="responseText"
          rows={4}
          defaultValue={responseText}
          placeholder="採用理由・今後の対応・不採用の理由などを記入してください。"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
        />
        {state?.errors?.responseText && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.responseText}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="implementationPlan"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          実施する改善策（任意）
        </label>
        <textarea
          id="implementationPlan"
          name="implementationPlan"
          rows={4}
          defaultValue={implementationPlan}
          placeholder="採用する場合に、実際に実施する施策・スケジュールなどを記入してください。"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "保存中…" : "回答を保存"}
        </button>
      </div>
    </form>
  );
}
