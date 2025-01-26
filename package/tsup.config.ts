import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  const isDev = process.env.NODE_ENV === 'development'

  return {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'], // Output formats
    dts: true,
    minify: !isDev,
    sourcemap: isDev,
    watch: isDev,
  }
})
