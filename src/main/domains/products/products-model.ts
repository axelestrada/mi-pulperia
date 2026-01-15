import { SelectProduct } from 'main/db/schema/products'

export type EnrichedProduct = SelectProduct & {
  categoryName: string | null
  stock: number
}

export type ProductDTO = Omit<
  EnrichedProduct,
  'categoryName' | 'categoryId'
> & {
  category: {
    id: number
    name: string
  }
}
