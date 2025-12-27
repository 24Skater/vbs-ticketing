import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Global test setup
    globals: true,
    
    // Setup files to run before tests
    setupFiles: ['./src/__tests__/setup.ts'],
    
    // Include patterns
    include: ['src/**/*.{test,spec}.{js,ts}'],
    
    // Exclude patterns
    exclude: ['node_modules', 'dist', 'frontend', 'admin-panel'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/__tests__/**',
        'src/types/**',
      ],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
    
    // Timeout for tests
    testTimeout: 10000,
    
    // Watch mode options
    watch: false,
    
    // Reporter
    reporters: ['verbose'],
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

