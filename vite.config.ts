import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monkey({
      entry: "src/main.tsx",
      userscript: {
        name: "ContestLens",
        description: "Analyze LeetCode contest replays to detect suspicious submission patterns",
        version: "1.0.0",
        author: "ContestLens",
        icon: "https://leetcode.com/favicon.ico",
        namespace: "contestlens/vite-plugin-monkey",
        match: [
          "*://leetcode.com/u/*",
          "*://www.leetcode.com/u/*",
          "*://leetcode.com/contest/*",
          "*://www.leetcode.com/contest/*",
          "*://leetcode.com/problems/*",
          "*://www.leetcode.com/problems/*",
        ],
        "run-at": "document-start",
        grant: ["unsafeWindow"],
      },
    }),
  ],
  build: {
    // Inline assets ≤ 500 KB as base64 so the userscript is self-contained
    assetsInlineLimit: 500_000,
  },
});
