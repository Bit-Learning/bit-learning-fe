import { resolve } from "node:path";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		react(),
		sentryVitePlugin({
			org: "bithub-learning",
			project: "bithub-web",
		}),
		codecovVitePlugin({
			enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
			bundleName: "web",
			uploadToken: process.env.CODECOV_TOKEN,
		}),
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
	build: { sourcemap: false },
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
