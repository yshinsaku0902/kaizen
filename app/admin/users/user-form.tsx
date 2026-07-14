"use client";

import { useActionState } from "react";
import { createUser } from "./actions";

const fieldClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";
const errorClass = "text-sm text-red-600 dark:text-red-400";

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          名前
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={state?.values?.name}
          className={fieldClass}
        />
        {state?.errors?.name && <p className={errorClass}>{state.errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={state?.values?.email}
          className={fieldClass}
        />
        {state?.errors?.email && (
          <p className={errorClass}>{state.errors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClass}>
          初期パスワード（8文字以上）
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={fieldClass}
        />
        {state?.errors?.password && (
          <p className={errorClass}>{state.errors.password}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className={labelClass}>
          役割
        </label>
        <select
          id="role"
          name="role"
          defaultValue={state?.values?.role ?? "EMPLOYEE"}
          className={fieldClass}
        >
          <option value="EMPLOYEE">社員</option>
          <option value="ADMIN">管理者</option>
        </select>
        {state?.errors?.role && <p className={errorClass}>{state.errors.role}</p>}
      </div>

      {state?.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
          {state.success}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "作成中…" : "ユーザーを作成"}
        </button>
      </div>
    </form>
  );
}
