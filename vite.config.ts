import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'

import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'

import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.[tj]s?$/],
      imports: [
        'react',
        'react-router-dom',
        {
          '@tanstack/react-query': [
            'useQuery',
            'useMutation',
            'useQueryClient',
            'QueryClient',
            'QueryClientProvider',
          ],
        },
        {
          'react-hook-form': [
            'useForm',
            'Controller',
            'useFormContext',
            'FormProvider',
            'useFieldArray',
          ],
        },
        {
          '@hookform/resolvers/zod': ['zodResolver'],
        },
        { sileo: ['sileo'] },
        { sonner: ['toast'] },
        {
          '@heroui/react': [
            'HeroUIProvider',
            'ToastProvider',
            'useDisclosure',
            'Button',
            'Breadcrumbs',
            'BreadcrumbItem',
            'Badge',
            'Input',
            'Divider',
            'Kbd',
            'Tabs',
            'Tab',
            'Table',
            'TableHeader',
            'TableBody',
            'TableColumn',
            'TableRow',
            'TableCell',
            'Spinner',
            'Tooltip',
            'Pagination',
            'Chip',
          ],
        },
      ],
      dirs: [
        './src/renderer/features/**/*',
        './src/renderer/components/table/**/*',
        './src/renderer/components/sidebar/**/*',
        './src/renderer/components/badges/**/*',
        './src/shared/components/**/*',
        './src/shared/hooks/**/*',
        './src/shared/utils/**/*',
        './src/shared/errors/**/*',
        './src/renderer/pages/**/*',
        './src/lib/**/*',
        './src/renderer/*',
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
        entry: './src/main/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'sharp',
                'better-sqlite3',
                'electron',
                'fs',
                'path',
                'os',
              ],
            },
          },
          resolve: {
            alias: {
              '@': path.resolve(__dirname, './src/renderer'),
              '~': path.resolve(__dirname, './'),
              shared: path.resolve(__dirname, './src/shared'),
              main: path.resolve(__dirname, './src/main'),
              domains: path.resolve(__dirname, './src/main/domains'),
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'src/main/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '~': path.resolve(__dirname, './'),
      shared: path.resolve(__dirname, './src/shared'),
      main: path.resolve(__dirname, './src/main'),
      domains: path.resolve(__dirname, './src/main/domains'),
    },
  },
  build: {
    rollupOptions: {
      external: ['better-sqlite3', 'sharp'],
    },
  },
})
