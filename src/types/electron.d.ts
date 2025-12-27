import { SelectCategory } from "electron/main/db/schema/categories"
import { SelectProduct } from "electron/main/db/schema/products"

export {}

declare global {
  interface Window {
    api: {
      products: {
        list: () => Promise<SelectProduct[]>
      },
      categories: {
        list: () => Promise<SelectCategory[]>
      }
    }
  }
}