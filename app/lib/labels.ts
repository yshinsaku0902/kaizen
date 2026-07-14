// enum 値の日本語表示・バッジ色の対応表。
import type { ProposalStatus, Decision } from "@/app/generated/prisma/enums";

export const statusLabel: Record<ProposalStatus, string> = {
  PENDING: "未対応",
  IN_REVIEW: "検討中",
  ANSWERED: "回答済",
};

export const statusBadgeClass: Record<ProposalStatus, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  IN_REVIEW:
    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  ANSWERED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

export const decisionLabel: Record<Decision, string> = {
  ADOPTED: "採用",
  REJECTED: "不採用",
  ON_HOLD: "保留",
};

export const decisionBadgeClass: Record<Decision, string> = {
  ADOPTED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  ON_HOLD: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

// 日付を YYYY/MM/DD で表示
export function formatDate(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}
