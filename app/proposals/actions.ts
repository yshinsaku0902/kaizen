"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireUser, requireAdmin } from "@/app/lib/dal";
import { prisma } from "@/app/lib/prisma";
import { sendQuestionEmail } from "@/app/lib/email";
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

// フォームから提案の入力値を取り出し、必須チェックを行う（作成・編集で共通）。
function readProposalInput(formData: FormData) {
  const values = {
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    expectedEffect: String(formData.get("expectedEffect") ?? "").trim(),
  };

  const errors: NonNullable<CreateProposalState>["errors"] = {};
  if (!values.title) errors.title = "タイトルを入力してください。";
  if (!values.content) errors.content = "提案内容を入力してください。";
  if (!values.expectedEffect) {
    errors.expectedEffect = "期待される効果・現状の課題を入力してください。";
  }

  return { values, errors, hasError: Object.keys(errors).length > 0 };
}

// 提案を新規作成する Server Action。
export async function createProposal(
  _prevState: CreateProposalState,
  formData: FormData,
): Promise<CreateProposalState> {
  const user = await requireUser();

  const { values, errors, hasError } = readProposalInput(formData);
  if (hasError) {
    // 入力値を保持したままエラーを返す
    return { errors, values };
  }

  await prisma.proposal.create({
    data: { ...values, authorId: user.id },
  });

  // 一覧へ戻る（redirect は例外を投げるので try/catch で包まない）
  redirect("/");
}

// 提案を編集する Server Action（提案者本人・回答前のみ）。
export async function updateProposal(
  id: string,
  _prevState: CreateProposalState,
  formData: FormData,
): Promise<CreateProposalState> {
  const user = await requireUser();

  const existing = await prisma.proposal.findUnique({ where: { id } });
  // 自分の提案でない、または回答済みは編集不可（黙って一覧へ）
  if (
    !existing ||
    existing.authorId !== user.id ||
    existing.status === "ANSWERED"
  ) {
    redirect("/");
  }

  const { values, errors, hasError } = readProposalInput(formData);
  if (hasError) {
    return { errors, values };
  }

  await prisma.proposal.update({ where: { id }, data: values });

  redirect(`/proposals/${id}`);
}

// 提案を取り下げる Server Action（提案者本人・回答前のみ）。
export async function withdrawProposal(id: string) {
  const user = await requireUser();

  // 本人かつ回答前の場合のみ削除。条件を満たさなければ 0 件で何も起きない。
  await prisma.proposal.deleteMany({
    where: { id, authorId: user.id, status: { not: "ANSWERED" } },
  });

  revalidatePath("/");
  redirect("/");
}

// 提案のステータスを 未対応⇄検討中 で切り替える Server Action（管理者・回答前のみ）。
export async function setProposalStatus(
  id: string,
  status: "PENDING" | "IN_REVIEW",
) {
  await requireAdmin();

  // 回答済みの提案は回答フローで管理するため対象外。
  await prisma.proposal.updateMany({
    where: { id, status: { not: "ANSWERED" } },
    data: { status },
  });

  revalidatePath("/");
  revalidatePath(`/proposals/${id}`);
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
        implementationPlan: string;
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
  // 実施する改善策は任意入力（未記入なら NULL 保存）
  const implementationPlan = String(
    formData.get("implementationPlan") ?? "",
  ).trim();

  const errors: NonNullable<RespondState>["errors"] = {};
  const isValidDecision = (Object.values(Decision) as string[]).includes(
    decision,
  );
  if (!isValidDecision) errors.decision = "結論を選択してください。";
  if (!responseText) errors.responseText = "回答文を入力してください。";

  if (Object.keys(errors).length > 0) {
    return { errors, values: { decision, responseText, implementationPlan } };
  }

  await prisma.proposal.update({
    where: { id },
    data: {
      decision: decision as Decision,
      responseText,
      implementationPlan: implementationPlan || null,
      status: "ANSWERED",
      respondedById: admin.id,
      respondedAt: new Date(),
    },
  });

  redirect(`/proposals/${id}`);
}

export type AskQuestionState =
  | {
      error?: string;
      success?: string;
      value?: string;
    }
  | undefined;

// 管理者が提案者へ質問をメール送信し、記録として残す Server Action。
export async function askQuestion(
  id: string,
  _prevState: AskQuestionState,
  formData: FormData,
): Promise<AskQuestionState> {
  const admin = await requireAdmin();

  const body = String(formData.get("question") ?? "").trim();
  if (!body) return { error: "質問内容を入力してください。", value: body };

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { author: { select: { email: true } } },
  });
  if (!proposal) return { error: "提案が見つかりません。" };

  // メール本文に載せる提案ページの URL を組み立てる。
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const proposalUrl = `${proto}://${host}/proposals/${id}`;

  try {
    await sendQuestionEmail({
      to: proposal.author.email,
      replyTo: admin.email ?? undefined,
      proposalTitle: proposal.title,
      proposalUrl,
      question: body,
      askerName: admin.name ?? "管理者",
    });
  } catch (e) {
    console.error("[askQuestion] メール送信に失敗:", e);
    return {
      error: "メール送信に失敗しました。SMTP 設定をご確認ください。",
      value: body,
    };
  }

  // 送信できたら記録を残す。
  await prisma.question.create({
    data: { body, proposalId: id, askedById: admin.id },
  });

  revalidatePath(`/proposals/${id}`);
  return { success: "質問をメールで送信しました。" };
}
