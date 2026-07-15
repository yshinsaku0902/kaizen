// 提案データの取得ロジック。役割に応じて見える範囲を絞る。
import { prisma } from "@/app/lib/prisma";
import type { Role, ProposalStatus } from "@/app/generated/prisma/enums";

// 役割に応じた閲覧範囲。管理者は全件、社員は自分の提案のみ。
function scopeFor(user: { id: string; role: Role }) {
  return user.role === "ADMIN" ? {} : { authorId: user.id };
}

// 一覧取得：閲覧範囲内を新しい順で。status 指定時はそのステータスのみ。
export async function listProposalsFor(
  user: { id: string; role: Role },
  status?: ProposalStatus,
) {
  return prisma.proposal.findMany({
    where: { ...scopeFor(user), ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
}

// ステータス別の件数（閲覧範囲内）。絞り込みタブのバッジに使う。
export async function countProposalsByStatus(
  user: { id: string; role: Role },
): Promise<Record<ProposalStatus, number>> {
  const grouped = await prisma.proposal.groupBy({
    by: ["status"],
    where: scopeFor(user),
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

// 詳細取得：閲覧権限を満たさない場合は null（社員は自分の提案のみ）。
export async function getProposalForViewer(
  id: string,
  user: { id: string; role: Role },
) {
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true } },
      respondedBy: { select: { name: true } },
    },
  });
  if (!proposal) return null;
  // 社員は他人の提案を見られない
  if (user.role !== "ADMIN" && proposal.authorId !== user.id) return null;
  return proposal;
}
