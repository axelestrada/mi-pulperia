import { Category } from '@/features/categories/model/category-schema'

export {}

declare global {
  interface Window {
    api: {
      products: {
        list: () => Promise<Product[]>
        create: (product: ProductFormData) => Promise<Product>
        update: (
          id: Product['id'],
          product: Partial<Product>
        ) => Promise<Product>
        remove: (id: Product['id']) => Promise<void>
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
    }
    images: {
      saveProductImage: (file: File) => Promise<{ filename: string }>
      deleteProductImage: (filename: string) => Promise<void>
      getProductImagePath: (filename: string) => Promise<string>
    }
  }
}
