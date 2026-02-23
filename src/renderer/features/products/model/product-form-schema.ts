import { z } from 'zod'
import { UNIT_CONFIG } from '../../../../main/domains/products/products-units'
import { toUnitPrecision } from '../../../../shared/utils/quantity'

export const productFormSchema = z
  .object({
    id: z.number().optional(),

    name: z
      .string({
        error: 'Ingrese el nombre del producto',
      })
      .refine(value => value.trim() !== '', {
        message: 'Ingrese el nombre del producto',
      }),

    description: z.string().transform(value => value.trim() || null),

    image: z.string().transform(value => value.trim() || null),

    barcode: z.string().transform(value => value.trim() || null),

    sku: z.string().transform(value => value.trim() || null),

    categoryId: z
      .number({
        error: 'Seleccione una categorÃ­a',
      })
      .int()
      .positive('Seleccione una categorÃ­a'),

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
        error: 'Ingrese el stock mÃ­nimo',
      })
      .min(0, 'El stock mÃ­nimo no puede ser negativo'),
  })
  .transform(data => ({
    ...data,
    minStock: toUnitPrecision(
      data.minStock,
      UNIT_CONFIG[data.baseUnit].unitPrecision
    ),
  }))

export type ProductFormInput = z.input<typeof productFormSchema>
export type ProductFormData = z.output<typeof productFormSchema>
