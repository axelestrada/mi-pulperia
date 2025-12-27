import { SelectProduct } from "./electron/main/db/schema"
import { SelectCategory } from "./electron/main/db/schema/categories"

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