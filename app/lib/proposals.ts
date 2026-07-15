// 提案データの取得ロジック。提出された提案は全ユーザーが閲覧できる。
import { prisma } from "@/app/lib/prisma";
import type { ProposalStatus, Decision } from "@/app/generated/prisma/enums";

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

// 管理者ダッシュボード用の集計。ステータス別・結論別の件数と採用率、
// 対応待ち（未対応・検討中）の古い順リストを返す。
export async function getDashboardStats() {
  const [all, oldestOpen] = await Promise.all([
    prisma.proposal.findMany({ select: { status: true, decision: true } }),
    prisma.proposal.findMany({
      where: { status: { not: "ANSWERED" } },
      orderBy: { createdAt: "asc" },
      take: 5,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const status: Record<ProposalStatus, number> = {
    PENDING: 0,
    IN_REVIEW: 0,
    ANSWERED: 0,
  };
  const decision: Record<Decision, number> = {
    ADOPTED: 0,
    REJECTED: 0,
    ON_HOLD: 0,
  };
  for (const p of all) {
    status[p.status] += 1;
    if (p.decision) decision[p.decision] += 1;
  }

  const total = all.length;
  const decided = decision.ADOPTED + decision.REJECTED + decision.ON_HOLD;
  // 採用率：結論が出た提案のうち「採用」の割合（結論ゼロなら null）
  const adoptionRate =
    decided > 0 ? Math.round((decision.ADOPTED / decided) * 100) : null;

  return { total, status, decision, decided, adoptionRate, oldestOpen };
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
