import { db } from '../db'
import { productsTable, type InsertProduct } from '../db/schema/products'

import { eq } from 'drizzle-orm'

export const ProductsRepository = {
  findAll: async () => db.select().from(productsTable),

  findById: async (id: number) =>
    db.select().from(productsTable).where(eq(productsTable.id, id)).get(),

  create: async (data: InsertProduct) =>
    db.insert(productsTable).values(data).returning().get(),
}
