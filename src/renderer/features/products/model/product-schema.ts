import { z } from 'zod'

export const productSchema = z.object({
  id: z.number(),

  name: z.string(),

  description: z.string().nullable(),

  image: z.string().nullable(),

  barcode: z.string().nullable(),

  sku: z.string().nullable(),

  category: z.object({
    id: z.number(),
    name: z.string(),
  }),

  stock: z.number(),

  baseUnit: z.enum(['unit', 'lb', 'liter']),

  salePrice: z.number(),

  minStock: z.number(),

  lowStock: z.boolean(),
  outOfStock: z.boolean(),

  hasExpiredBatches: z.boolean(),
  hasExpiringBatches: z.boolean(),
  expiredBatchesCount: z.number(),
  expiringBatchesCount: z.number(),

  status: z.enum(['active', 'inactive']),

  createdAt: z.date(),

  presentationsCount: z.number(),
})

export type Product = z.output<typeof productSchema>
