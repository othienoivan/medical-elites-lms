import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        "**/*.rar",
        "**/*.zip",
        "**/*.7z",
        "**/*.tar",
        "**/*.gz",
        "**/backups/**",
        "**/Backups/**",
      ],
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("pptx-preview")) return "powerpoint-viewer";
          if (id.includes("pdfjs-dist")) return "pdf-viewer";
          if (id.includes("mammoth")) return "docx-parser";
          if (id.includes("jspdf") || id.includes("html2canvas")) return "pdf-tools";
          if (id.includes("xlsx")) return "excel-tools";
          if (id.includes("@tiptap")) return "rich-text-editor";
          if (id.includes("firebase")) return "firebase";
          if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) return "react-vendor";
          return undefined;
        },
      },
    },
  },
});
