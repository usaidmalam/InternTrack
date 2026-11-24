import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],

    // Connect to Flask during local development
    server: {
        proxy: {
            '/applications': 'http://127.0.0.1:8000'
        }
    }
})