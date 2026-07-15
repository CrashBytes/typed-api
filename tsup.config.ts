import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,  // Disable problematic rollup-plugin-dts
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
})
