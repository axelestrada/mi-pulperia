import { db } from 'main/db'
import { categoriesTable } from 'main/db/schema/categories'

import {
  productsTable,
  type InsertProduct,
  type SelectProduct,
} from 'main/db/schema/products'

import { eq, getTableColumns } from 'drizzle-orm'

export const ProductsRepository = {
  findAll: async () => {
    const rows = await db
      .select({
        ...getTableColumns(productsTable),

        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
      )
      .where(eq(productsTable.deleted, false))

    return rows
  },

  create: async (data: InsertProduct) => db.insert(productsTable).values(data),

  update: async (id: SelectProduct['id'], data: Partial<SelectProduct>) =>
    db.update(productsTable).set(data).where(eq(productsTable.id, id)),

  delete: async (id: SelectProduct['id']) =>
    db
      .update(productsTable)
      .set({ deleted: true })
      .where(eq(productsTable.id, id)),
}
