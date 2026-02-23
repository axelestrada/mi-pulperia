import { db } from '../db'
import { eq, and, like, or, desc, asc, count } from 'drizzle-orm'

import {
  cashRegistersTable,
  type SelectCashRegister,
  type InsertCashRegister,
} from '../db/schema/cash-registers'

export interface CashRegistersFilters {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'location' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export const CashRegistersRepository = {
  findAll: async (filters: CashRegistersFilters = {}) => {
    const {
      search,
      isActive,
      page = 1,
      limit = 50,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(cashRegistersTable.deleted, false)]

    if (search) {
      whereConditions.push(
        or(
          like(cashRegistersTable.name, `%${search}%`),
          like(cashRegistersTable.description, `%${search}%`),
          like(cashRegistersTable.location, `%${search}%`)
        )!
      )
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(cashRegistersTable.isActive, isActive))
    }

    // Build order by
    const orderBy = sortOrder === 'desc'
      ? desc(cashRegistersTable[sortBy])
      : asc(cashRegistersTable[sortBy])

    const [cashRegisters, totalResult] = await Promise.all([
      db
        .select()
        .from(cashRegistersTable)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(cashRegistersTable)
        .where(and(...whereConditions))
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: cashRegisters,
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

  findById: async (id: SelectCashRegister['id']) =>
    db
      .select()
      .from(cashRegistersTable)
      .where(and(
        eq(cashRegistersTable.id, id),
        eq(cashRegistersTable.deleted, false)
      ))
      .get(),

  create: async (data: InsertCashRegister) => {
    const result = await db
      .insert(cashRegistersTable)
      .values(data)
      .returning()

    return result[0]
  },

  update: async (id: SelectCashRegister['id'], data: Partial<SelectCashRegister>) =>
    db
      .update(cashRegistersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cashRegistersTable.id, id))
      .returning(),

  delete: async (id: SelectCashRegister['id']) =>
    db
      .update(cashRegistersTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(cashRegistersTable.id, id)),

  // Get active cash registers for selection
  findActiveForSelection: async () =>
    db
      .select({
        id: cashRegistersTable.id,
        name: cashRegistersTable.name,
        location: cashRegistersTable.location,
      })
      .from(cashRegistersTable)
      .where(and(
        eq(cashRegistersTable.deleted, false),
        eq(cashRegistersTable.isActive, true)
      ))
      .orderBy(asc(cashRegistersTable.name)),
}
