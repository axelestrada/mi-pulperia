import { z } from 'zod'

export const inventoryItemSchema = z.object({
  productId: z
    .number({
      error: 'Seleccione un producto',
    })
    .nullable()
    .refine(v => v !== null, {
      error: 'Seleccione un producto',
    })
    .transform(v => v ?? 0),
  supplierId: z.number().nullable(),
  batchCode: z.string().nullable(),
  expirationDate: z.date().nullable(),
  quantity: z.coerce
    .number({
      error: 'Ingrese la cantidad',
    })
    .nullable()
    .refine(v => v !== null && v > 0, {
      message: 'La cantidad debe ser mayor a 0',
    })
    .transform(v => v ?? 0),
  unitCost: z.coerce
    .number({
      error: 'Ingrese el costo unitario',
    })
    .nullable()
    .refine(v => v !== null && v > 0, {
      message: 'El costo debe ser mayor a 0',
    })
    .transform(value => {
      return Math.round((value ?? 0) * 100)
    }),
  referenceType: z.string().optional(),
  referenceId: z.number().optional(),
})

export const inventoryEntrySchema = z.object({
  items: z.array(inventoryItemSchema).min(1, {
    error: 'Debe agregar al menos un lote',
  }),
})

export type InventoryEntryFormInput = z.input<typeof inventoryEntrySchema>
export type InventoryEntryFormData = z.output<typeof inventoryEntrySchema>
