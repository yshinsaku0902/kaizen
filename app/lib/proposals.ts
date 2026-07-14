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
