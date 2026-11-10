/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bulls-and-cows/', 
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
});