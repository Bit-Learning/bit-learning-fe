import { resolve } from "node:path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	define: {
		global: "globalThis",
	},
	plugins: [
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		react(),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["src/test/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			reportsDirectory: "../../coverage/apps-web",
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/coverage/**",
			],
		},
		reporters: ["default"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
	},
	build: {
		sourcemap: false,
		minify: "esbuild", // Enable esbuild for minification
		reportCompressedSize: false,
		cacheDir: ".vite_cache",
		terserOptions: {
			compress: {
				drop_console: true, // Remove console logs for production
			},
		},
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules/pyodide")) {
						return "pyodide";
					}

					if (id.includes("node_modules")) {
						return "vendor";
					}
				},
			},
		},
	},
	// server: {
	//     port: 5173,
	//     proxy: {
	//         '/api': {
	//             target: 'http://localhost:4000',
	//             changeOrigin: true,
	//         },
	//     },
	// },
});
