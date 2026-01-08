import { z } from 'zod'

export const productFormSchema = z.object({
  id: z.number().optional(),

  name: z.string().min(1, 'Ingrese el nombre del producto'),

  description: z.string().optional(),

  image: z.string().optional(),

  barcode: z.string().optional(),

  sku: z.string().optional(),

  categoryId: z
    .number({
      error: 'Seleccione una categoría',
    })
    .int()
    .positive('Seleccione una categoría'),

  baseUnit: z.enum(['unit', 'lb', 'liter']),

  salePrice: z
    .number({
      error: 'Ingrese el precio de venta',
    })
    .positive('El precio de venta debe ser mayor a 0')
    .transform(value => {
      return Math.round(value * 100)
    }),

  minStock: z.number().int().min(0, 'El stock mínimo no puede ser negativo'),

  isActive: z.boolean(),
})

export type ProductFormData = z.infer<typeof productFormSchema>
