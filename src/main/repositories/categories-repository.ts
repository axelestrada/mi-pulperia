import { db } from '../db'

import {
  categoriesTable,
  type SelectCategory,
  type InsertCategory,
} from '../db/schema/categories'

import { eq } from 'drizzle-orm'

export const CategoriesRepository = {
  findAll: async () =>
    db.select().from(categoriesTable).where(eq(categoriesTable.deleted, false)),

  create: async (data: InsertCategory) =>
    db.insert(categoriesTable).values(data),

  update: async (id: SelectCategory['id'], data: Partial<SelectCategory>) =>
    db
      .update(categoriesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id)),

  delete: async (id: SelectCategory['id']) =>
    db
      .update(categoriesTable)
      .set({ deleted: true })
      .where(eq(categoriesTable.id, id)),
}
