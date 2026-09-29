import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // يمنع Next من اختيار جذر خاطئ حين يوجد package-lock.json آخر أعلى في الشجرة
  outputFileTracingRoot: __dirname,
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  async redirects() {
    return [
      // رابط مختصر للاشتراك في النشرة — تحويل دائم (308)
      { source: "/join", destination: "https://bahjaa.beehiiv.com/subscribe", permanent: true },
    ];
  },
};

export default nextConfig;
