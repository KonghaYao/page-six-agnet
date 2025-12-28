import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
    plugins: [solid(), tailwindcss()],
    server: {
        proxy: {
            "/api/langgraph": {
                target: "http://localhost:8123",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/langgraph/, ""),
            },
        },
    },
    resolve: {
        alias: {
            "page-agent": new URL("../page-agent-server/frontend/index", import.meta.url).pathname,
        },
    },
});
