import { z } from 'zod'

export const productFormSchema = z.object({
  id: z.number().optional(),

  name: z.string().refine(value => value.trim() !== '', {
    message: 'Ingrese el nombre del producto',
  }),

  description: z.string().transform(value => value || null),

  image: z.string().transform(value => value || null),

  barcode: z.string().transform(value => value || null),

  sku: z.string().transform(value => value || null),

  categoryId: z
    .number({
      error: 'Seleccione una categoría',
    })
    .int()
    .positive('Seleccione una categoría'),

  baseUnit: z.enum(['unit', 'lb', 'liter']),

  salePrice: z.coerce
    .number({
      error: 'Ingrese el precio de venta',
    })
    .positive('El precio de venta debe ser mayor a 0')
    .transform(value => {
      return Math.round(value * 100)
    }),

  minStock: z.coerce
    .number({
      error: 'Ingrese el stock mínimo',
    })
    .int()
    .min(0, 'El stock mínimo no puede ser negativo'),

  isActive: z.boolean(),
})

export type ProductFormInput = z.input<typeof productFormSchema>
export type ProductFormData = z.output<typeof productFormSchema>
