import path from 'node:path'
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

import Icons from 'unplugin-icons/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.[tj]s?$/],
      imports: ['react', 'react-router-dom'],
      dirs: [
        './src/components/**/*',
        './src/app/**/*',
        './src/components/ui/shadcn-io/**/*',
        './src/features/**/*',
        './src/shared/components/**/*',
        './src/shared/hooks/**/*',
        './src/shared/utils/**/*',
      ],
      dts: './src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
      resolvers: [
        IconsResolver({
          prefix: 'Icon',
          extension: 'tsx',
        }),
      ],
    }),
    Icons({ compiler: 'jsx', jsx: 'react' }),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
