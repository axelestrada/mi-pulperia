import { db } from '../db'
import {
  productsTable,
  type InsertProduct,
  type SelectProduct,
} from '../db/schema/products'

import { eq } from 'drizzle-orm'

export const ProductsRepository = {
  findAll: async () =>
    db.select().from(productsTable).where(eq(productsTable.deleted, false)),

  create: async (data: InsertProduct) => db.insert(productsTable).values(data),

  update: async (id: SelectProduct['id'], data: Partial<SelectProduct>) =>
    db.update(productsTable).set(data).where(eq(productsTable.id, id)),

  delete: async (id: SelectProduct['id']) =>
    db
      .update(productsTable)
      .set({ deleted: true })
      .where(eq(productsTable.id, id)),
}
