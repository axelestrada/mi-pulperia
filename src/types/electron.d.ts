import { Category } from '@/features/categories/model/category-schema'

export {}

declare global {
  interface Window {
    api: {
      products: {
        list: () => Promise<Product[]>
      }
      categories: {
        list: () => Promise<Category[]>
        create: (category: CategoryFormData) => Promise<Category>
        update: (
          id: Category['id'],
          category: Partial<Category>
        ) => Promise<Category>
        remove: (id: Category['id']) => Promise<void>
      }
      images: {
        upload: (args: {
          category: 'products' | 'categories'
          id?: number
        }) => Promise<{ success: boolean; filename?: string; error?: string }>
        saveBase64: (args: {
          base64Data: string
          category: 'products' | 'categories'
          id?: number
        }) => Promise<{ success: boolean; filename?: string; error?: string }>
        getBase64: (args: {
          filename: string
          category: 'products' | 'categories'
        }) => Promise<{ success: boolean; base64?: string; error?: string }>
        getPath: (args: {
          filename: string
          category: 'products' | 'categories'
        }) => Promise<{ success: boolean; path?: string; error?: string }>
        delete: (args: {
          filename: string
          category: 'products' | 'categories'
        }) => Promise<{ success: boolean; error?: string }>
        list: (args: {
          category: 'products' | 'categories'
        }) => Promise<{ success: boolean; images?: string[]; error?: string }>
      }
      backup: {
        create: () => Promise<{
          success: boolean
          path?: string
          error?: string
        }>
        createAuto: () => Promise<{
          success: boolean
          path?: string
          error?: string
        }>
        list: () => Promise<{
          success: boolean
          backups?: Array<{ path: string; date: Date; size: number }>
          error?: string
        }>
        clean: (keepLast?: number) => Promise<{
          success: boolean
          deleted?: number
          error?: string
        }>
        restore: (args: {
          path: string
          createBackupBefore?: boolean
        }) => Promise<{ success: boolean; error?: string }>
      }
    }
  }
}
