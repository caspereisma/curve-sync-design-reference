import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    base: command === 'serve' ? '/' : './',
    plugins: [react()],
    server: {
        port: 3101,
        strictPort: true
    },
    preview: {
        port: 4101,
        strictPort: true
    }
}));
