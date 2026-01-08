import { z } from 'zod'

export const categoryFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Ingrese el nombre de la categoría'),
  description: z.string().optional(),
})

export type CategoryFormInput = z.input<typeof categoryFormSchema>
export type CategoryFormData = z.output<typeof categoryFormSchema>
