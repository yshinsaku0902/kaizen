// Next.js 16 の Proxy（旧 Middleware）。未ログインを /login へ誘導する“楽観的”チェック。
// 本質的な保護は各ページ/Server Action 側の auth() でも行う。
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  // 未ログインでログインページ以外にアクセス → /login へ
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // ログイン済みでログインページ → トップへ
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

// 認証エンドポイント・静的アセットでは Proxy を動かさない
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
