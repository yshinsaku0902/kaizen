// 初期データ投入スクリプト（tsx で実行）
// 「管理者が社員を招待・作成する」方式のため、最初の管理者だけをここで用意する。
// 何度実行しても安全（upsert）。既存ユーザーのパスワードは上書きしない。
import { config } from "dotenv";
config({ path: ".env.local" }); // DATABASE_URL などを読み込む（import より先に実行される）

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const name = process.env.ADMIN_NAME ?? "管理者";

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {}, // 既に存在する場合は何も変更しない
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  console.log(`✅ 管理者を用意しました: ${admin.email} (role=${admin.role})`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(
      "⚠  ADMIN_PASSWORD 未指定のため初期パスワード 'changeme123' を使用しました。ログイン後に必ず変更してください。",
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
