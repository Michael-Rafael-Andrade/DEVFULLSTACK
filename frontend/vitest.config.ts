import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                       // describe/it/expect sem import
    environment: 'jsdom',                // simula o navegador
    setupFiles: ['./tests/setup.ts'],    // registra os matchers do jest-dom
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});