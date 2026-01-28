import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // This tells Vitest to look in the testing folder outside of frontend
    include: ['../testing/unit/**/*.{test,spec}.{js,ts}'],
    // This ensures it can find axios and other packages
    globals: true,
  },
})