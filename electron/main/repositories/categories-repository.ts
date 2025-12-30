import { db } from '../db'
import {
  categoriesTable,
  type SelectCategory,
  type InsertCategory,
} from '../db/schema/categories'

import { eq } from 'drizzle-orm'

export const CategoriesRepository = {
  findAll: async () => db.select().from(categoriesTable),

  findById: async (id: SelectCategory['id']) =>
    db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).get(),

  create: async (data: InsertCategory) =>
    db.insert(categoriesTable).values(data).returning().get(),

  update: async (id: SelectCategory['id'], data: Partial<SelectCategory>) =>
    db.update(categoriesTable).set(data).where(eq(categoriesTable.id, id)).returning().get(),

  delete: async (id: SelectCategory['id']) =>
    db.delete(categoriesTable).where(eq(categoriesTable.id, id)),
}
