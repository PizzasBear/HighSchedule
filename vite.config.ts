import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import path from "path";
// import fs from "fs/promises";

function relpath(...args: string[]): string {
  return path.resolve(__dirname, ...args);
}

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: "esnext",
    assetsDir: "static",
    rollupOptions: {
      input: {
        home: relpath("index.html"),
      },
      external: [relpath()],
    },
    sourcemap: true,
  },
});
