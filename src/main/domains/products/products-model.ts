import z from "zod"

export type ProductRow = {
  id: number
  name: string

  description: string | null
  baseUnit: 'unit' | 'lb' | 'liter'
  unitPrecision: number

  minStock: number
  status: 'active' | 'inactive'
  categoryId: number | null
  categoryName: string | null
  image: string | null
  stock: number
  presentations: {
    id: number
    name: string,
    salePrice: number
  }[]
  totalPresentationsCount: number
  hasExpiredBatches: number
  hasExpiringSoonBatches: number
  expiredBatchesCount: number
  expiringSoonBatchesCount: number
  total: number
}

export const productDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  baseUnit: z.enum(['unit', 'lb', 'liter']),
  unitPrecision: z.number(),
  minStock: z.number(),
  status: z.enum(['active', 'inactive']),
  categoryId: z.number().nullable(),
  categoryName: z.string().nullable(),
  image: z.string().nullable(),
  stock: z.number(),
  presentations: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      salePrice: z.number(),
      barcode: z.string().nullable(),
      sku: z.string().nullable(),
      isBase: z.coerce.boolean(),
    })
  ),
  totalPresentationsCount: z.number(),
  hasExpiredBatches: z.number(),
  hasExpiringSoonBatches: z.number(),
  expiredBatchesCount: z.number(),
  expiringSoonBatchesCount: z.number(),
  total: z.number(),
}).transform((product) => ({
  ...product,
  outOfStock: product.stock === 0,
  lowStock: product.stock < product.minStock,
  category: {
    id: product.categoryId,
    name: product.categoryName,
  }
}))

export type ProductDTO = z.infer<typeof productDTOSchema>

export type NewProductDTO = {
  name: string
  description: string | null
  categoryId: number
  baseUnit: 'unit' | 'lb' | 'liter'
  minStock: number
  salePrice: number
  sku: string | null
  barcode: string | null
  image: string | null
}


export type UpdateProductDTO = {
  name: string
  description: string | null
  categoryId: number
  minStock: number
  salePrice: number
  sku: string | null
  barcode: string | null
  image: string | null
}
