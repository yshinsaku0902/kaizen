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
  // ADMIN_PASSWORD を明示指定したときだけ既存管理者のパスワードも更新する。
  // （未指定＝デフォルトのときは、既存の管理者パスワードを勝手に戻さない）
  const passwordProvided = !!process.env.ADMIN_PASSWORD;

  const admin = await prisma.user.upsert({
    where: { email },
    update: passwordProvided ? { passwordHash } : {},
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  console.log(`✅ 管理者を用意しました: ${admin.email} (role=${admin.role})`);
  if (passwordProvided) {
    console.log("🔑 ADMIN_PASSWORD で管理者のパスワードを設定/更新しました。");
  } else {
    console.log(
      "⚠  ADMIN_PASSWORD 未指定のため初期パスワード 'changeme123' を使用しました（既存ユーザーのパスワードは変更していません）。",
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
