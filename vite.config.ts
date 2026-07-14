import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isFtpBuild =
  process.env.BUILD_TARGET === "ftp" ||
  process.argv.includes("--mode=ftp") ||
  process.argv.some((arg, index, argv) => arg === "--mode" && argv[index + 1] === "ftp");

export default defineConfig({
  nitro: isFtpBuild ? false : true,
  tanstackStart: {
    ...(isFtpBuild ? { spa: { enabled: true } } : { server: { entry: "server" } }),
  },
});
