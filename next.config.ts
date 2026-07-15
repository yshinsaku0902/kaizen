import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nodemailer は Node 専用パッケージなのでバンドルせず外部依存として扱う
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
