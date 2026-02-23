import { db } from '../db'
import {
  eq,
  and,
  like,
  or,
  desc,
  asc,
  count,
  isNull,
  gte,
  lte,
} from 'drizzle-orm'

import {
  cashSessionsTable,
  type SelectCashSession,
  type InsertCashSession,
} from '../db/schema/cash-sessions'
import { cashRegistersTable } from '../db/schema/cash-registers'

export interface CashSessionsFilters {
  search?: string
  cashRegisterId?: number
  status?: 'open' | 'closed'
  openedBy?: string
  page?: number
  limit?: number
  sortBy?: 'openedAt' | 'closedAt' | 'expectedAmount'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
}

export const CashSessionsRepository = {
  findAll: async (filters: CashSessionsFilters = {}) => {
    const {
      search,
      cashRegisterId,
      status,
      openedBy,
      page = 1,
      limit = 50,
      sortBy = 'openedAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = []

    if (search) {
      whereConditions.push(
        or(
          like(cashSessionsTable.openedBy, `%${search}%`),
          like(cashSessionsTable.closedBy, `%${search}%`),
          like(cashSessionsTable.notes, `%${search}%`),
          like(cashRegistersTable.name, `%${search}%`)
        )!
      )
    }

    if (cashRegisterId) {
      whereConditions.push(eq(cashSessionsTable.cashRegisterId, cashRegisterId))
    }

    if (status) {
      whereConditions.push(eq(cashSessionsTable.status, status))
    }

    if (openedBy) {
      whereConditions.push(eq(cashSessionsTable.openedBy, openedBy))
    }

    if (dateFrom) {
      whereConditions.push(gte(cashSessionsTable.openedAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(cashSessionsTable.openedAt, dateTo))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(cashSessionsTable[sortBy])
        : asc(cashSessionsTable[sortBy])

    const [sessions, totalResult] = await Promise.all([
      db
        .select({
          ...cashSessionsTable,
          cashRegisterName: cashRegistersTable.name,
          cashRegisterLocation: cashRegistersTable.location,
        })
        .from(cashSessionsTable)
        .leftJoin(
          cashRegistersTable,
          eq(cashSessionsTable.cashRegisterId, cashRegistersTable.id)
        )
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(cashSessionsTable)
        .leftJoin(
          cashRegistersTable,
          eq(cashSessionsTable.cashRegisterId, cashRegistersTable.id)
        )
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        ),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  },

  findById: async (id: SelectCashSession['id']) =>
    db
      .select({
        ...cashSessionsTable,
        cashRegisterName: cashRegistersTable.name,
        cashRegisterLocation: cashRegistersTable.location,
      })
      .from(cashSessionsTable)
      .leftJoin(
        cashRegistersTable,
        eq(cashSessionsTable.cashRegisterId, cashRegistersTable.id)
      )
      .where(eq(cashSessionsTable.id, id))
      .get(),

  create: async (data: InsertCashSession) => {
    const result = await db.insert(cashSessionsTable).values(data).returning()

    return result[0]
  },

  update: async (
    id: SelectCashSession['id'],
    data: Partial<SelectCashSession>
  ) =>
    db
      .update(cashSessionsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cashSessionsTable.id, id))
      .returning(),

  close: async (
    id: SelectCashSession['id'],
    closedBy: string,
    actualAmount: number,
    expectedAmount: number,
    notes?: string
  ) => {
    const difference = actualAmount - expectedAmount

    return db
      .update(cashSessionsTable)
      .set({
        status: 'closed',
        closedBy,
        closedAt: new Date(),
        actualAmount,
        expectedAmount,
        difference,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(cashSessionsTable.id, id))
      .returning()
  },

  // Find currently open session for a cash register
  findOpenSession: async (cashRegisterId: number) => {
    const result = await db
      .select()
      .from(cashSessionsTable)
      .where(
        and(
          eq(cashSessionsTable.cashRegisterId, cashRegisterId),
          eq(cashSessionsTable.status, 'open')
        )
      )
      .get()

    return result || null
  },

  // Find any open session (for validation)
  findAnyOpenSession: async () => {
    const result = await db
      .select({
        ...cashSessionsTable,
        cashRegisterName: cashRegistersTable.name,
      })
      .from(cashSessionsTable)
      .leftJoin(
        cashRegistersTable,
        eq(cashSessionsTable.cashRegisterId, cashRegistersTable.id)
      )
      .where(eq(cashSessionsTable.status, 'open'))
      .get()

    return result || null
  },

  // Get session summary for closing
  getSessionSummary: async (sessionId: number) => {
    // This would typically include sales totals, payment method breakdowns, etc.
    // For now, we'll just return the session data
    return db
      .select()
      .from(cashSessionsTable)
      .where(eq(cashSessionsTable.id, sessionId))
      .get()
  },

  // Update expected amount during session
  updateExpectedAmount: async (
    id: SelectCashSession['id'],
    expectedAmount: number
  ) =>
    db
      .update(cashSessionsTable)
      .set({ expectedAmount, updatedAt: new Date() })
      .where(eq(cashSessionsTable.id, id)),
}
