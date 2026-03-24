import { defineConfig, type HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const SUPABASE_URL = "https://wqrvguxkanjuorntlmmx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcnZndXhrYW5qdW9ybnRsbW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDQ2MTEsImV4cCI6MjA4MzcyMDYxMX0.ebDizNzXtDAdA-nnutGy6WDm-7QX1SL_N5CFrdJPD4w";

function gscMetaPlugin() {
  return {
    name: "inject-gsc-meta",
    async transformIndexHtml(): Promise<HtmlTagDescriptor[]> {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/site_integrations?key=eq.gsc_verification_code&select=value`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        const data = await res.json() as Array<{ value: string }>;
        if (data?.[0]?.value) {
          return [
            {
              tag: "meta",
              attrs: {
                name: "google-site-verification",
                content: data[0].value,
              },
              injectTo: "head" as const,
            },
          ];
        }
      } catch (e) {
        console.warn("[gsc-meta-plugin] Failed to fetch verification code:", e);
      }
      return [];
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), gscMetaPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
