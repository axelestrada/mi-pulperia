import { and, eq, inArray, like, or, sql } from 'drizzle-orm'
import { db } from 'main/db'
import { categoriesTable } from 'main/db/schema/categories'
import {
  type InsertProduct,
  productsTable,
  type SelectProduct,
} from 'main/db/schema/products'
import { presentationsTable } from '../../db/schema/presentations'

type FindAllParams = {
  categories?: number[]
  status?: Array<'active' | 'inactive'>
  lowStock?: boolean
  expired?: boolean
  expiringSoon?: boolean
  search?: string
  page: number
  pageSize: number
}

export const ProductsRepository = {
  findAll: async ({
    categories,
    status,
    lowStock,
    page,
    search,
    pageSize,
    expired,
    expiringSoon,
  }: FindAllParams) => {
    const dayStart = sql`strftime('%s', 'now', 'start of day', 'localtime')`
    const dayStartPlus30 = sql`strftime('%s', 'now', 'start of day', 'localtime', '+30 days')`

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

    const totalPresentationsCountSubquery = sql<number>`
      (
        SELECT COUNT(*)
        FROM presentations p
        WHERE p.product_id = ${productsTable.id}
          AND p.deleted = false
      )
    `

    const presentationsSubquery = sql<
      {
        id: number
        name: string
        salePrice: number
        isBase: number
      }[]
    >`
      (
        SELECT json_group_array(
          json_object(
            'id', p.id,
            'name', p.name,
            'salePrice', p.sale_price,
            'isBase', p.is_base,
            'barcode', p.barcode,
            'sku', p.sku
          )
        )
        FROM (
          SELECT id, name, sale_price, is_base, barcode, sku
          FROM presentations
          WHERE product_id = ${productsTable.id}
            AND deleted = false
            AND status = 'active'
          ORDER BY is_base DESC, id ASC
          LIMIT 3
        ) p
      )
    `

    const expiredBatchesSubquery = sql<number>`
      (
        SELECT COUNT(*)
        FROM inventory_batches ib
        WHERE ib.product_id = ${productsTable.id}
          AND ib.expiration_date IS NOT NULL
          AND ib.expiration_date < ${dayStart}
      )
    `

    const expiringBatchesSubquery = sql<number>`
      (
        SELECT COUNT(*)
        FROM inventory_batches ib
        WHERE ib.product_id = ${productsTable.id}
          AND ib.expiration_date IS NOT NULL
          AND ib.expiration_date >= ${dayStart}
          AND ib.expiration_date < ${dayStartPlus30}
      )
    `

    const hasExpiredBatchesSubquery = sql<number>`
      EXISTS (
        SELECT 1
        FROM inventory_batches ib
        WHERE ib.product_id = ${productsTable.id}
          AND ib.expiration_date IS NOT NULL
          AND ib.expiration_date < ${dayStart}
      )
    `

    const hasExpiringSoonBatchesSubquery = sql<number>`
      EXISTS (
        SELECT 1
        FROM inventory_batches ib
        WHERE ib.product_id = ${productsTable.id}
          AND ib.expiration_date IS NOT NULL
          AND ib.expiration_date >= ${dayStart}
          AND ib.expiration_date < ${dayStartPlus30}
      )
    `

    const totalSubquery = sql<number>`COUNT(*) OVER()`.as('total')

    const whereConditions = [eq(productsTable.deleted, false)]

    if (categories?.length) {
      whereConditions.push(inArray(productsTable.categoryId, categories))
    }

    if (status?.length) {
      whereConditions.push(inArray(productsTable.status, status))
    }

    if (lowStock) {
      whereConditions.push(sql`${stockSubquery} <= ${productsTable.minStock}`)
    }

    if (expired) {
      whereConditions.push(hasExpiredBatchesSubquery)
    }

    if (expiringSoon) {
      whereConditions.push(hasExpiringSoonBatchesSubquery)
    }

    if (search) {
      const searchCondition = or(
        like(productsTable.name, `%${search}%`),
        like(productsTable.description, `%${search}%`),
        like(categoriesTable.name, `%${search}%`),
        like(categoriesTable.description, `%${search}%`),
        sql<boolean>`
          EXISTS (
            SELECT 1
            FROM presentations p
            WHERE p.product_id = ${productsTable.id}
              AND p.deleted = false
              AND p.status = 'active'
              AND (
                p.sku LIKE ${`%${search}%`}
                OR p.barcode LIKE ${`%${search}%`}
                OR p.name LIKE ${`%${search}%`}
                OR p.description LIKE ${`%${search}%`}
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
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,

        baseUnit: productsTable.baseUnit,
        unitPrecision: productsTable.unitPrecision,

        image: presentationsTable.image,

        minStock: productsTable.minStock,
        status: productsTable.status,

        categoryId: categoriesTable.id,
        categoryName: categoriesTable.name,

        stock: stockSubquery.as('stock'),

        presentations: presentationsSubquery.as('presentations'),
        totalPresentationsCount: totalPresentationsCountSubquery.as(
          'totalPresentationsCount'
        ),

        expiredBatchesCount: expiredBatchesSubquery.as('expiredBatchesCount'),
        expiringSoonBatchesCount: expiringBatchesSubquery.as(
          'expiringSoonBatchesCount'
        ),

        hasExpiredBatches: hasExpiredBatchesSubquery.as('hasExpiredBatches'),
        hasExpiringSoonBatches: hasExpiringSoonBatchesSubquery.as(
          'hasExpiringSoonBatches'
        ),

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

    const parsedRows = rows.map(r => {
      const p = r.presentations ?? []

      if (typeof p === 'string') {
        try {
          return { ...r, presentations: JSON.parse(p) }
        } catch {
          return { ...r, presentations: [] }
        }
      }

      return { ...r, presentations: p }
    })

    return parsedRows
  },

  create: (data: InsertProduct) => {
    return db.insert(productsTable).values(data).returning()
  },

  update: async (id: SelectProduct['id'], data: Partial<SelectProduct>) =>
    db
      .update(productsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productsTable.id, id)),

  toggle: async (id: SelectProduct['id']) =>
    db
      .update(productsTable)
      .set({
        status: sql`
        CASE
          WHEN ${productsTable.status} = 'active' THEN 'inactive'
          ELSE 'active'
        END
      `,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id)),

  delete: async (id: SelectProduct['id']) =>
    db
      .update(productsTable)
      .set({ deleted: true, status: 'deleted', updatedAt: new Date() })
      .where(eq(productsTable.id, id)),
}
