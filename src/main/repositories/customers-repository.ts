import { db } from '../db'
import { eq, and, like, or, desc, asc, count } from 'drizzle-orm'

import {
  customersTable,
  type SelectCustomer,
  type InsertCustomer,
} from '../db/schema/customers'

export interface CustomersFilters {
  search?: string
  isActive?: boolean
  documentType?: 'cedula' | 'passport' | 'ruc'
  page?: number
  limit?: number
  sortBy?: 'name' | 'createdAt' | 'currentBalance'
  sortOrder?: 'asc' | 'desc'
}

export const CustomersRepository = {
  findAll: async (filters: CustomersFilters = {}) => {
    const {
      search,
      isActive,
      documentType,
      page = 1,
      limit = 50,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(customersTable.deleted, false)]

    if (search) {
      whereConditions.push(
        or(
          like(customersTable.name, `%${search}%`),
          like(customersTable.email, `%${search}%`),
          like(customersTable.phone, `%${search}%`),
          like(customersTable.document, `%${search}%`)
        )!
      )
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(customersTable.isActive, isActive))
    }

    if (documentType) {
      whereConditions.push(eq(customersTable.documentType, documentType))
    }

    // Build order by
    const orderBy = sortOrder === 'desc'
      ? desc(customersTable[sortBy])
      : asc(customersTable[sortBy])

    const [customers, totalResult] = await Promise.all([
      db
        .select()
        .from(customersTable)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(customersTable)
        .where(and(...whereConditions))
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: customers,
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

  findById: async (id: SelectCustomer['id']) =>
    db
      .select()
      .from(customersTable)
      .where(and(
        eq(customersTable.id, id),
        eq(customersTable.deleted, false)
      ))
      .get(),

  findByDocument: async (document: string) =>
    db
      .select()
      .from(customersTable)
      .where(and(
        eq(customersTable.document, document),
        eq(customersTable.deleted, false)
      ))
      .get(),

  create: async (data: InsertCustomer) => {
    const result = await db
      .insert(customersTable)
      .values(data)
      .returning()

    return result[0]
  },

  update: async (id: SelectCustomer['id'], data: Partial<SelectCustomer>) =>
    db
      .update(customersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customersTable.id, id))
      .returning(),

  updateBalance: async (id: SelectCustomer['id'], newBalance: number) =>
    db
      .update(customersTable)
      .set({ currentBalance: newBalance, updatedAt: new Date() })
      .where(eq(customersTable.id, id)),

  delete: async (id: SelectCustomer['id']) =>
    db
      .update(customersTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(customersTable.id, id)),

  // Get customers with outstanding balances
  findWithOutstandingBalance: async () =>
    db
      .select()
      .from(customersTable)
      .where(and(
        eq(customersTable.deleted, false),
        eq(customersTable.isActive, true)
      ))
      .having(({ currentBalance }) => currentBalance > 0),

  // Get active customers for dropdown/selection
  findActiveForSelection: async () =>
    db
      .select({
        id: customersTable.id,
        name: customersTable.name,
        document: customersTable.document,
        creditLimit: customersTable.creditLimit,
        currentBalance: customersTable.currentBalance,
      })
      .from(customersTable)
      .where(and(
        eq(customersTable.deleted, false),
        eq(customersTable.isActive, true)
      ))
      .orderBy(asc(customersTable.name)),
}
