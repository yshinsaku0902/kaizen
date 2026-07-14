import { config } from "dotenv";
// Next.js と同じ .env.local から環境変数（DATABASE_URL など）を読み込む
config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
