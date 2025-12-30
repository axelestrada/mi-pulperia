import { db } from '../db'
import { categoriesTable, type InsertCategory } from '../db/schema/categories'

import { eq } from 'drizzle-orm'

export const CategoriesRepository = {
  findAll: async () => db.select().from(categoriesTable),

  findById: async (id: number) =>
    db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).get(),

  create: async (data: InsertCategory) =>
    db.insert(categoriesTable).values(data),
}
