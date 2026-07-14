// Prisma クライアントの共有インスタンス
// dev 環境ではホットリロードのたびに新しいインスタンスが作られ、
// 接続が枯渇するのを防ぐため globalThis にキャッシュする。
// Prisma 7 は driver adapter 必須なので @prisma/adapter-pg を使う。
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
