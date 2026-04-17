import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
	],
	server: {
		port: 8386,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@workspace/ui": path.resolve(__dirname, "../../packages/ui/src"),
		},
	},
	define: {
		global: "globalThis",
	},
	build: {
		sourcemap: false,
		minify: "esbuild", // Enable esbuild for minification
		reportCompressedSize: false,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						return "vendor";
					}
				},
			},
		},
	},
});
