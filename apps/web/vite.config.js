import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
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
