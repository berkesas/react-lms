import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

export default [
  // ESM build with declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationMap: true,
        declarationDir: 'dist/esm',
        rootDir: 'src',
        exclude: ['**/*.test.ts', '**/*.test.tsx', 'node_modules'],
      }),
      postcss({
        modules: true,
        extract: false,
        minimize: true,
      }),
    ],
    external: ['react', 'react-dom'],
  },
  // CJS build without declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        rootDir: 'src',
        exclude: ['**/*.test.ts', '**/*.test.tsx', 'node_modules'],
      }),
      postcss({
        modules: true,
        extract: false,
        minimize: true,
      }),
    ],
    external: ['react', 'react-dom'],
  },
];