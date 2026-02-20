import z from 'zod'

export const batchSchema = z.object({
  id: z.number(),
  productId: z.number(),
  productName: z.string(),
  unitPrecision: z.number(),
  supplierId: z.number().nullable(),
  batchCode: z.string().nullable(),
  expirationDate: z.date().nullable(),
  quantityInitial: z.number(),
  quantityAvailable: z.number(),
  unitCost: z.number(),
  createdAt: z.date(),
})

export type InventoryBatch = z.infer<typeof batchSchema>
