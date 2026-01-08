import { z } from 'zod'

export const categorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  deleted: z.boolean(),
})

export type Category = z.output<typeof categorySchema>
