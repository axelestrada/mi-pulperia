import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { type InsertTopUp, type SelectTopUp, topUpsTable } from '../db/schema/top-ups'

export interface TopUpsFilters {
  dateFrom?: Date
  dateTo?: Date
  limit?: number
}

export const TopUpsRepository = {
  async findAll(filters: TopUpsFilters = {}) {
    const { dateFrom, dateTo, limit = 200 } = filters
    const whereConditions = [eq(topUpsTable.deleted, false)]

    if (dateFrom) whereConditions.push(gte(topUpsTable.createdAt, dateFrom))
    if (dateTo) whereConditions.push(lte(topUpsTable.createdAt, dateTo))

    return db
      .select()
      .from(topUpsTable)
      .where(and(...whereConditions))
      .orderBy(desc(topUpsTable.createdAt))
      .limit(limit)
  },

  async create(payload: InsertTopUp) {
    const result = await db.insert(topUpsTable).values(payload).returning()
    return result[0]
  },

  async getVirtualBalance() {
    const result = await db
      .select({
        loaded: sql<number>`coalesce(sum(case when ${topUpsTable.type} = 'balance_load' then ${topUpsTable.amount} else 0 end), 0)`,
        consumed: sql<number>`coalesce(sum(case when ${topUpsTable.type} = 'top_up' then ${topUpsTable.cost} else 0 end), 0)`,
      })
      .from(topUpsTable)
      .where(eq(topUpsTable.deleted, false))
      .get()

    const loaded = Number(result?.loaded || 0)
    const consumed = Number(result?.consumed || 0)
    return loaded - consumed
  },

  async getSummary(dateFrom?: Date, dateTo?: Date) {
    const whereConditions = [eq(topUpsTable.deleted, false)]
    if (dateFrom) whereConditions.push(gte(topUpsTable.createdAt, dateFrom))
    if (dateTo) whereConditions.push(lte(topUpsTable.createdAt, dateTo))

    const rows = await db
      .select({
        type: topUpsTable.type,
        amount: topUpsTable.amount,
        cost: topUpsTable.cost,
      })
      .from(topUpsTable)
      .where(and(...whereConditions))
      .orderBy(asc(topUpsTable.createdAt))

    const topUpRows = rows.filter(r => r.type === 'top_up')
    const balanceLoads = rows.filter(r => r.type === 'balance_load')

    const topUpCount = topUpRows.length
    const totalAmount = topUpRows.reduce((sum, r) => sum + (r.amount || 0), 0)
    const totalCost = topUpRows.reduce((sum, r) => sum + (r.cost || 0), 0)
    const loadedAmount = balanceLoads.reduce((sum, r) => sum + (r.amount || 0), 0)

    return {
      count: topUpCount,
      amount: totalAmount,
      cost: totalCost,
      margin: totalAmount - totalCost,
      loadedAmount,
    }
  },

  async findById(id: SelectTopUp['id']) {
    return db
      .select()
      .from(topUpsTable)
      .where(and(eq(topUpsTable.id, id), eq(topUpsTable.deleted, false)))
      .get()
  },
}
