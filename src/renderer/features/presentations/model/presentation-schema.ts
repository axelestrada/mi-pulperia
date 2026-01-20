import { z } from 'zod'

export const presentationSchema = z.object({
  id: z.number(),
  productId: z.number(),
  isBase: z.boolean(),

  name: z.string(),
  description: z.string().nullable(),

  image: z.string().nullable(),
  barcode: z.string().nullable(),
  sku: z.string().nullable(),

  unit: z.enum(['unit', 'lb', 'liter']),
  unitPrecision: z.number(),

  factorType: z.enum(['fixed', 'variable']),
  factor: z.number().nullable(),

  salePrice: z.number(),

  isActive: z.boolean(),
  createdAt: z.date(),
})

export type Presentation = z.output<typeof presentationSchema>
