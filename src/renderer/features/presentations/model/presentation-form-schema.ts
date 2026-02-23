import { z } from 'zod'
import { UNIT_CONFIG } from '../../../../main/domains/products/products-units'
import { toUnitPrecision } from '../../../../shared/utils/quantity'

const baseSchema = {
  id: z.number().optional(),
  productId: z.number(),

  name: z.string().refine(v => v.trim() !== '', {
    message: 'Ingrese el nombre de la presentación',
  }),

  description: z.string().transform(v => v.trim() || null),
  image: z.string().transform(v => v.trim() || null),
  barcode: z.string().transform(v => v.trim() || null),
  sku: z.string().transform(v => v.trim() || null),

  unit: z.enum(['unit', 'lb', 'liter']),

  salePrice: z.coerce
    .number({ error: 'Ingrese el precio de venta' })
    .positive('El precio de venta debe ser mayor a 0')
    .transform(v => Math.round(v * 100)),

  status: z.enum(['active', 'inactive', 'deleted']),
} as const

export const presentationFormSchema = z
  .discriminatedUnion('factorType', [
    z.object({
      ...baseSchema,
      factorType: z.literal('fixed'),
      factor: z.coerce
        .number({ error: 'Ingrese el factor' })
        .positive('El factor debe ser mayor a 0'),
    }),

    z.object({
      ...baseSchema,
      factorType: z.literal('variable'),
      factor: z.coerce.string().transform(() => null),
    }),
  ])
  .transform(data => ({
    ...data,
    factor:
      data.factorType === 'variable'
        ? null
        : toUnitPrecision(data.factor, UNIT_CONFIG[data.unit].unitPrecision),
  }))

export type PresentationFormInput = z.input<typeof presentationFormSchema>
export type PresentationFormData = z.output<typeof presentationFormSchema>

export type PresentationFormMode = 'create' | 'edit'
