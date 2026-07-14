// 提案データの取得ロジック。役割に応じて見える範囲を絞る。
import { prisma } from "@/app/lib/prisma";
import type { Role } from "@/app/generated/prisma/enums";

// 一覧取得：管理者は全件、社員は自分の提案のみ。
export async function listProposalsFor(user: { id: string; role: Role }) {
  return prisma.proposal.findMany({
    where: user.role === "ADMIN" ? undefined : { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
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
