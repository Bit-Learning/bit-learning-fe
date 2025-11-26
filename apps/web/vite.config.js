import { sentryVitePlugin } from '@sentry/vite-plugin'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({ target: 'react', autoCodeSplitting: true }),
        react(),
        sentryVitePlugin({
            org: 'bithub-learning',
            project: 'bithub-web',
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            reportsDirectory: '../../coverage/apps-web',
        },
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
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
})
