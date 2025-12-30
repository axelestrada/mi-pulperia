import { z } from 'zod'

export const categoryFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
})

export type CategoryFormInput = z.input<typeof categoryFormSchema>
export type CategoryFormData = z.output<typeof categoryFormSchema>
