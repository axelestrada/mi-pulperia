import { z } from 'zod'

export const presentationFormSchema = z
  .object({
    id: z.number().optional(),
    productId: z.number(),

    name: z.string().refine(value => value.trim() !== '', {
      message: 'Ingrese el nombre de la presentación',
    }),

    description: z.string().transform(value => value.trim() || null),

    image: z.string().transform(value => value.trim() || null),

    barcode: z.string().transform(value => value.trim() || null),

    sku: z.string().transform(value => value.trim() || null),

    unit: z.enum(['unit', 'lb', 'liter']),
    unitPrecision: z.number(),

    factorType: z.enum(['fixed', 'variable']),
    factor: z.coerce
      .number({
        error: 'Ingrese el factor',
      })
      .positive({
        error: 'El factor debe ser un número mayor a 0',
      })
      .nullable(),

    salePrice: z.coerce
      .number({
        error: 'Ingrese el precio de venta',
      })
      .positive('El precio de venta debe ser mayor a 0')
      .transform(value => {
        return Math.round(value * 100)
      }),

    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.factorType === 'fixed') {
      if (data.factor === null || data.factor < 1) {
        ctx.addIssue({
          path: ['factor'],
          message: 'El factor fijo debe ser un número mayor o igual a 1',
          code: 'custom',
        })
      }
    }
  })
  .transform(data => ({
    ...data,
    factor: data.factorType === 'variable' ? null : data.factor,
  }))

export type PresentationFormInput = z.input<typeof presentationFormSchema>
export type PresentationFormData = z.output<typeof presentationFormSchema>

export type PresentationFormMode = 'create' | 'edit'
