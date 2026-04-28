var _a;
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
var backendUrl = (_a = process.env.VITE_BACKEND_URL) !== null && _a !== void 0 ? _a : "http://localhost:5078";
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: backendUrl,
                changeOrigin: true
            },
            "/hubs": {
                target: backendUrl,
                changeOrigin: true,
                ws: true
            }
        }
    }
});
