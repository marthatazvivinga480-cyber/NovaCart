import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "lucide-client-directive",
      enforce: "pre",
      transform(code, id) {
        // Lucide supports server-rendered React too; this app runs in the browser.
        if (!id.replaceAll("\\", "/").includes("/node_modules/lucide-react/")) return;
        const updated = code.replace(/^([ \t]*)(["'])use client\2;?[ \t]*$/m, "$1");
        return updated === code ? undefined : { code: updated, map: null };
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replaceAll("\\", "/");
          if (!path.includes("/node_modules/")) return;
          if (path.includes("/@firebase/firestore/")) return "firebase-firestore";
          if (path.includes("/@firebase/auth/")) return "firebase-auth";
          if (path.includes("/@firebase/")) return "firebase-core";
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(path)) return "react-vendor";
        },
      },
    },
  },
});
