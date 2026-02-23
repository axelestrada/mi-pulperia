import z from 'zod'

export const movementSchema = z.object({
  id: z.number(),
  productId: z.number(),
  productName: z.string(),
  batchCode: z.string().nullable(),
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.number(),
  unitCost: z.number(),
  reason: z.string(),
  referenceType: z.string().nullable().optional(),
  referenceId: z.number().nullable().optional(),
  createdAt: z.string(),
})

export type InventoryMovement = z.infer<typeof movementSchema>
