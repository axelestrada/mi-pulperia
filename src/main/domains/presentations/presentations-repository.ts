import { and, eq, like, or, sql } from 'drizzle-orm'
import { db } from 'main/db'
import {
  InsertPresentation,
  presentationsTable,
} from 'main/db/schema/presentations'
import { PaginatedResult } from '~/src/shared/types/pagination'
import { PresentationsListFilters } from '~/src/shared/types/presentations'
import { PresentationRow } from './presentations-model'
import { productsTable } from '../../db/schema/products'

export const PresentationsRepository = {
  async findAll({
    productId,
    categoryId,
    isActive,
    page = 1,
    pageSize = 20,
    search,
  }: PresentationsListFilters): Promise<PaginatedResult<PresentationRow>> {
    const whereConditions = [eq(presentationsTable.deleted, false)]

    if (productId) {
      whereConditions.push(eq(presentationsTable.productId, productId))
    }

    if (categoryId) {
      whereConditions.push(eq(productsTable.categoryId, categoryId))
    }

    if (typeof isActive === 'boolean') {
      whereConditions.push(eq(presentationsTable.isActive, isActive))
    }

    if (search) {
      const searchConditions = or(
        like(presentationsTable.name, `%${search}%`),
        like(presentationsTable.sku, `%${search}%`),
        like(presentationsTable.barcode, `%${search}%`),
        like(productsTable.name, `%${search}%`)
      )

      if (searchConditions) {
        whereConditions.push(searchConditions)
      }
    }

    const offset = (page - 1) * pageSize

    const totalQuery = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(presentationsTable)
      .innerJoin(
        productsTable,
        eq(presentationsTable.productId, productsTable.id)
      )
      .where(and(...whereConditions))

    const rows = await db
      .select()
      .from(presentationsTable)
      .innerJoin(
        productsTable,
        eq(presentationsTable.productId, productsTable.id)
      )
      .where(and(...whereConditions))
      .limit(pageSize)
      .offset(offset)

    return {
      data: rows.map(r => r.presentations),
      total: totalQuery[0].total,
      totalPages: Math.ceil(totalQuery[0].total / pageSize),
      page,
      pageSize,
    }
  },

  findByProductId(productId: number) {
    return db
      .select()
      .from(presentationsTable)
      .where(
        and(
          eq(presentationsTable.productId, productId),
          eq(presentationsTable.deleted, false)
        )
      )
  },

  async create(data: InsertPresentation) {
    const [row] = await db.insert(presentationsTable).values(data).returning()

    return row
  },

  async update(id: number, data: Partial<InsertPresentation>) {
    const [row] = await db
      .update(presentationsTable)
      .set({...data, updatedAt: new Date() })
      .where(eq(presentationsTable.id, id))
      .returning()

    return row
  },

  async updateBasePresentation(productId: number, data: Partial<InsertPresentation>) {
    const [row] = await db
      .update(presentationsTable)
      .set({...data, updatedAt: new Date() })
      .where(
        and(
          eq(presentationsTable.productId, productId),
          eq(presentationsTable.isBase, true),
          eq(presentationsTable.deleted, false)
        )
      )
      .returning()

    return row
  },

  toggleActive(id: number, isActive: boolean) {
    return db
      .update(presentationsTable)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(presentationsTable.id, id))
  },
}
