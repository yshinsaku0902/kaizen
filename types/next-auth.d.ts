// next-auth のセッション/JWT に独自フィールド（id・role）を足すための型拡張。
import type { DefaultSession } from "next-auth";
import type { Role } from "@/app/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  // authorize() が返すユーザー、および jwt コールバックの `user`
  interface User {
    role: Role;
  }
}

// JWT インターフェイスの実体は @auth/core/jwt にある（next-auth/jwt は再エクスポートのみ）
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
