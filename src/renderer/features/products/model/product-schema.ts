import { z } from 'zod'

export const productSchema = z.object({
  id: z.number().int().positive(),

  name: z.string(),

  description: z.string().nullable(),

  image: z.string().nullable(),

  barcode: z.string().nullable(),

  sku: z.string().nullable(),

  category: z.object({
    id: z.number().int().positive(),
    name: z.string(),
  }),

  stock: z.number(),

  baseUnit: z.enum(['unit', 'lb', 'liter']),

  salePrice: z.number().int().nonnegative(),

  minStock: z.number().int().nonnegative(),

  isActive: z.boolean(),

  createdAt: z.date(),
  updatedAt: z.date(),

  deleted: z.boolean(),
})

export type Product = z.output<typeof productSchema>