import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function Home() {
  // Proxy に加えた保護（本質的なチェックはデータソース近くで行う）
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { name, email, role } = session.user;
  const roleLabel = role === "ADMIN" ? "管理者" : "社員";

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              業務改善提案システム
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {name}（{roleLabel}）でログイン中
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              ログアウト
            </button>
          </form>
        </header>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            ログインできました 🎉
          </h2>
          <dl className="mt-4 grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
            <dt className="text-zinc-500 dark:text-zinc-400">名前</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{name}</dd>
            <dt className="text-zinc-500 dark:text-zinc-400">メール</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{email}</dd>
            <dt className="text-zinc-500 dark:text-zinc-400">権限</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{roleLabel}</dd>
          </dl>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            次のステップで、提案の一覧・投稿・回答画面をここに追加していきます。
          </p>
        </div>
      </div>
    </div>
  );
}
