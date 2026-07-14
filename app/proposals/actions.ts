"use server";

import { redirect } from "next/navigation";
import { requireUser, requireAdmin } from "@/app/lib/dal";
import { prisma } from "@/app/lib/prisma";
import { Decision } from "@/app/generated/prisma/enums";

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

export type RespondState =
  | {
      errors?: {
        decision?: string;
        responseText?: string;
      };
      values?: {
        decision: string;
        responseText: string;
      };
    }
  | undefined;

// 管理者が提案へ回答する Server Action（結論＋回答文を記録し「回答済」に）。
export async function respondToProposal(
  id: string,
  _prevState: RespondState,
  formData: FormData,
): Promise<RespondState> {
  const admin = await requireAdmin();

  const decision = String(formData.get("decision") ?? "");
  const responseText = String(formData.get("responseText") ?? "").trim();

  const errors: NonNullable<RespondState>["errors"] = {};
  const isValidDecision = (Object.values(Decision) as string[]).includes(
    decision,
  );
  if (!isValidDecision) errors.decision = "結論を選択してください。";
  if (!responseText) errors.responseText = "回答文を入力してください。";

  if (Object.keys(errors).length > 0) {
    return { errors, values: { decision, responseText } };
  }

  await prisma.proposal.update({
    where: { id },
    data: {
      decision: decision as Decision,
      responseText,
      status: "ANSWERED",
      respondedById: admin.id,
      respondedAt: new Date(),
    },
  });

  redirect(`/proposals/${id}`);
}
