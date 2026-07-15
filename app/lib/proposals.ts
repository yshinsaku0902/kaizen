// 提案データの取得ロジック。提出された提案は全ユーザーが閲覧できる。
import { prisma } from "@/app/lib/prisma";
import type { ProposalStatus } from "@/app/generated/prisma/enums";

// 一覧取得：全件を新しい順で。status 指定時はそのステータスのみ。
export async function listProposals(status?: ProposalStatus) {
  return prisma.proposal.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
}

// ステータス別の件数（全件）。絞り込みタブのバッジに使う。
export async function countProposalsByStatus(): Promise<
  Record<ProposalStatus, number>
> {
  const grouped = await prisma.proposal.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts: Record<ProposalStatus, number> = {
    PENDING: 0,
    IN_REVIEW: 0,
    ANSWERED: 0,
  };
  for (const g of grouped) counts[g.status] = g._count._all;
  return counts;
}

// 詳細取得：全員が閲覧できる。存在しなければ null。
export async function getProposal(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true } },
      respondedBy: { select: { name: true } },
      questions: {
        orderBy: { createdAt: "asc" },
        include: { askedBy: { select: { name: true } } },
      },
    },
  });
}
