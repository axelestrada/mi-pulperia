import { Category } from "@/features/categories/model/category-schema"

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
    }
  }
}
