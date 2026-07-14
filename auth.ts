// next-auth (Auth.js) v5 の設定。
// Credentials（メール＋パスワード）方式のため、セッションは JWT 必須。
// パスワードは bcrypt でハッシュ照合し、成功時に id/role をトークンへ載せる。
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // ここで返した値が jwt コールバックの `user` に渡る
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // ログイン直後（user がある時）に id/role をトークンへ写す
    async jwt({ token, user }) {
      if (user) {
        // authorize() は必ず string の id を返すので non-null で確定させる
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    // トークンの id/role をセッションに公開する
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
