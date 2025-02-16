import { defineConfig } from "tsup"

export default defineConfig((options) => {
  const isDev = process.env.NODE_ENV === "development"
  console.debug("isDev", isDev)
  return {
    entry: {
      index: "src/index.ts",
      react: "src/export/react.ts",
    },
    format: ["cjs", "esm"], // Output formats
    dts: true,
    minify: !isDev,
    sourcemap: isDev,
    watch: isDev,
    clean: isDev,
  }
})
