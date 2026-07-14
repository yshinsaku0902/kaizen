"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/app/lib/dal";
import { prisma } from "@/app/lib/prisma";

export type CreateProposalState =
  | {
      errors?: {
        title?: string;
        content?: string;
        expectedEffect?: string;
      };
      values?: {
        title: string;
        content: string;
        expectedEffect: string;
      };
    }
  | undefined;

// 提案を新規作成する Server Action。
export async function createProposal(
  _prevState: CreateProposalState,
  formData: FormData,
): Promise<CreateProposalState> {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const expectedEffect = String(formData.get("expectedEffect") ?? "").trim();

  const errors: NonNullable<CreateProposalState>["errors"] = {};
  if (!title) errors.title = "タイトルを入力してください。";
  if (!content) errors.content = "提案内容を入力してください。";
  if (!expectedEffect) {
    errors.expectedEffect = "期待される効果・現状の課題を入力してください。";
  }

  if (Object.keys(errors).length > 0) {
    // 入力値を保持したままエラーを返す
    return { errors, values: { title, content, expectedEffect } };
  }

  await prisma.proposal.create({
    data: { title, content, expectedEffect, authorId: user.id },
  });

  // 一覧へ戻る（redirect は例外を投げるので try/catch で包まない）
  redirect("/");
}
