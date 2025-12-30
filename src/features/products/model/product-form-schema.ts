import { z } from 'zod'

export const productFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
})

export type ProductFormData = z.infer<typeof productFormSchema>
