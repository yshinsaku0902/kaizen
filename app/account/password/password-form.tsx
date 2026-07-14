"use client";

import { useActionState } from "react";
import { changePassword } from "./actions";

const fieldClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";
const errorClass = "text-sm text-red-600 dark:text-red-400";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="currentPassword" className={labelClass}>
          現在のパスワード
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className={fieldClass}
        />
        {state?.errors?.currentPassword && (
          <p className={errorClass}>{state.errors.currentPassword}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className={labelClass}>
          新しいパスワード（8文字以上）
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          className={fieldClass}
        />
        {state?.errors?.newPassword && (
          <p className={errorClass}>{state.errors.newPassword}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className={labelClass}>
          新しいパスワード（確認）
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={fieldClass}
        />
        {state?.errors?.confirmPassword && (
          <p className={errorClass}>{state.errors.confirmPassword}</p>
        )}
      </div>

      {state?.success && (
        <p
          className="text-sm text-emerald-600 dark:text-emerald-400"
          role="status"
        >
          {state.success}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "変更中…" : "パスワードを変更"}
        </button>
      </div>
    </form>
  );
}
