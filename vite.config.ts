import path from "node:path";
import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron/simple";

import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    AutoImport({
      include: [/\.[tj]sx?$/],
      imports: ["react", "react-router-dom"],
      dirs: [
        "./src/components/**/*",
        "./src/app/**/*",
        "./src/components/ui/shadcn-io/**/*",
      ],
      dts: "./src/auto-imports.d.ts",
      eslintrc: {
        enabled: true,
      },
    }),
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
