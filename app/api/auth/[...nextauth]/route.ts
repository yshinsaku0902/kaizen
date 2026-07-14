// next-auth の認証エンドポイント（/api/auth/*）。auth.ts の handlers をそのまま公開する。
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
