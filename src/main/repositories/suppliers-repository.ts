import { db } from '../db'
import { eq, and, like, or, desc, asc, count, gte, lte } from 'drizzle-orm'

import {
  suppliersTable,
  type SelectSupplier,
  type InsertSupplier,
} from '../db/schema/suppliers'

export interface SuppliersFilters {
  search?: string
  isActive?: boolean
  country?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'companyName' | 'createdAt' | 'currentBalance'
  sortOrder?: 'asc' | 'desc'
  hasOutstandingBalance?: boolean
}

export const SuppliersRepository = {
  findAll: async (filters: SuppliersFilters = {}) => {
    const {
      search,
      isActive,
      country,
      page = 1,
      limit = 50,
      sortBy = 'name',
      sortOrder = 'asc',
      hasOutstandingBalance,
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(suppliersTable.deleted, false)]

    if (search) {
      whereConditions.push(
        or(
          like(suppliersTable.name, `%${search}%`),
          like(suppliersTable.companyName, `%${search}%`),
          like(suppliersTable.contactPerson, `%${search}%`),
          like(suppliersTable.email, `%${search}%`),
          like(suppliersTable.taxId, `%${search}%`)
        )!
      )
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(suppliersTable.isActive, isActive))
    }

    if (country) {
      whereConditions.push(eq(suppliersTable.country, country))
    }

    if (hasOutstandingBalance) {
      whereConditions.push(gte(suppliersTable.currentBalance, 1))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(suppliersTable[sortBy])
        : asc(suppliersTable[sortBy])

    const [suppliers, totalResult] = await Promise.all([
      db
        .select()
        .from(suppliersTable)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(suppliersTable)
        .where(and(...whereConditions)),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: suppliers,
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

  findById: async (id: SelectSupplier['id']) =>
    db
      .select()
      .from(suppliersTable)
      .where(and(
        eq(suppliersTable.id, id),
        eq(suppliersTable.deleted, false)
      ))
      .get(),

  findByTaxId: async (taxId: string) =>
    db
      .select()
      .from(suppliersTable)
      .where(and(
        eq(suppliersTable.taxId, taxId),
        eq(suppliersTable.deleted, false)
      ))
      .get(),

  create: async (data: InsertSupplier) => {
    const result = await db
      .insert(suppliersTable)
      .values(data)
      .returning()

    return result[0]
  },

  update: async (id: SelectSupplier['id'], data: Partial<SelectSupplier>) =>
    db
      .update(suppliersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(suppliersTable.id, id))
      .returning(),

  delete: async (id: SelectSupplier['id']) =>
    db
      .update(suppliersTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(suppliersTable.id, id)),

  // Update supplier balance (what we owe them)
  updateBalance: async (id: SelectSupplier['id'], newBalance: number) =>
    db
      .update(suppliersTable)
      .set({ currentBalance: newBalance, updatedAt: new Date() })
      .where(eq(suppliersTable.id, id)),

  addToBalance: async (id: SelectSupplier['id'], amount: number) => {
    const supplier = await db
      .select()
      .from(suppliersTable)
      .where(eq(suppliersTable.id, id))
      .get()

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    const newBalance = supplier.currentBalance + amount
    return db
      .update(suppliersTable)
      .set({ currentBalance: newBalance, updatedAt: new Date() })
      .where(eq(suppliersTable.id, id))
  },

  subtractFromBalance: async (id: SelectSupplier['id'], amount: number) => {
    const supplier = await db
      .select()
      .from(suppliersTable)
      .where(eq(suppliersTable.id, id))
      .get()

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    const newBalance = Math.max(0, supplier.currentBalance - amount)
    return db
      .update(suppliersTable)
      .set({ currentBalance: newBalance, updatedAt: new Date() })
      .where(eq(suppliersTable.id, id))
  },

  // Get active suppliers for selection
  findActiveForSelection: async () =>
    db
      .select({
        id: suppliersTable.id,
        name: suppliersTable.name,
        companyName: suppliersTable.companyName,
        paymentTerms: suppliersTable.paymentTerms,
        creditLimit: suppliersTable.creditLimit,
        currentBalance: suppliersTable.currentBalance,
      })
      .from(suppliersTable)
      .where(and(
        eq(suppliersTable.deleted, false),
        eq(suppliersTable.isActive, true)
      ))
      .orderBy(asc(suppliersTable.name)),

  // Get suppliers with outstanding balance
  findWithOutstandingBalance: async () =>
    db
      .select()
      .from(suppliersTable)
      .where(and(
        eq(suppliersTable.deleted, false),
        eq(suppliersTable.isActive, true),
        gte(suppliersTable.currentBalance, 1)
      ))
      .orderBy(desc(suppliersTable.currentBalance)),

  // Check if we can extend credit from supplier
  canExtendCredit: async (id: SelectSupplier['id'], amount: number): Promise<boolean> => {
    const supplier = await db
      .select()
      .from(suppliersTable)
      .where(eq(suppliersTable.id, id))
      .get()

    if (!supplier || !supplier.isActive) {
      return false
    }

    const newBalance = supplier.currentBalance + amount
    return newBalance <= supplier.creditLimit
  },
}
