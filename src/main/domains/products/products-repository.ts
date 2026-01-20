import { db } from 'main/db'
import { categoriesTable } from 'main/db/schema/categories'

import {
  InsertProduct,
  productsTable,
  type SelectProduct,
} from 'main/db/schema/products'

import { and, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm'

import { presentationsTable } from '../../db/schema/presentations'

type FindAllParams = {
  categoryId?: number
  isActive?: boolean
  lowStock?: boolean
  search?: string
  page: number
  pageSize: number
}

export const ProductsRepository = {
  findAll: async ({
    categoryId,
    isActive,
    lowStock,
    page,
    search,
    pageSize,
  }: FindAllParams) => {
    const stockSubquery = sql<number>`
      COALESCE(
        (
          SELECT SUM(quantity_available)
          FROM inventory_batches ib
          WHERE ib.product_id = ${productsTable.id}
        ),
        0
      )
    `

    const presentationsCountSubquery = sql<number>`
      (
        SELECT COUNT(*)
        FROM presentations p
        WHERE p.product_id = ${productsTable.id}
          AND p.deleted = false
      )
    `

    const lowStockSubquery = sql<boolean>`
      ${stockSubquery} <= ${productsTable.minStock}
    `

    const totalSubquery = sql<number>`COUNT(*) OVER()`.as('total')

    const whereConditions = [eq(productsTable.deleted, false)]

    if (categoryId) {
      whereConditions.push(eq(productsTable.categoryId, categoryId))
    }

    if (typeof isActive === 'boolean') {
      whereConditions.push(eq(productsTable.isActive, isActive))
    }

    if (lowStock) {
      whereConditions.push(lowStockSubquery)
    }

    if (search) {
      const searchCondition = or(
        ilike(productsTable.name, search),
        sql<boolean>`
          EXISTS (
            SELECT 1
            FROM presentations p
            WHERE p.product_id = ${productsTable.id}
              AND p.deleted = false
              AND (
                p.sku LIKE ${`%${search}%`}
                OR p.barcode LIKE ${`%${search}%`}
              )
          )
        `
      )

      if (searchCondition) {
        whereConditions.push(searchCondition)
      }
    }

    const offset = (page - 1) * pageSize

    const rows = await db
      .select({
        ...getTableColumns(productsTable),

        categoryId: categoriesTable.id,
        categoryName: categoriesTable.name,

        salePrice: presentationsTable.salePrice,
        barcode: presentationsTable.barcode,
        sku: presentationsTable.sku,
        image: presentationsTable.image,

        presentationsCount: presentationsCountSubquery.as('presentationsCount'),

        stock: stockSubquery.as('stock'),

        total: totalSubquery,
      })
      .from(productsTable)
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
      )
      .leftJoin(
        presentationsTable,
        and(
          eq(presentationsTable.productId, productsTable.id),
          eq(presentationsTable.isBase, true),
          eq(presentationsTable.deleted, false)
        )
      )
      .where(and(...whereConditions))
      .limit(pageSize)
      .offset(offset)

    return rows
  },

  create: (data: InsertProduct) => {
    return db.insert(productsTable).values(data).returning()
  },

  update: async (id: SelectProduct['id'], data: Partial<SelectProduct>) =>
    db
      .update(productsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productsTable.id, id)),

  delete: async (id: SelectProduct['id']) =>
    db
      .update(productsTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(productsTable.id, id)),
}
