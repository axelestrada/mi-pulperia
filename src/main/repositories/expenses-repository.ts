import { db } from '../db'
import { eq, and, like, or, desc, asc, count, gte, lte, sum } from 'drizzle-orm'

import {
  expensesTable,
  expenseCategoriesTable,
  type SelectExpense,
  type InsertExpense,
  type SelectExpenseCategory,
  type InsertExpenseCategory,
} from '../db/schema/expenses'
import { suppliersTable } from '../db/schema/suppliers'

export interface ExpensesFilters {
  search?: string
  categoryId?: number
  supplierId?: number
  status?: 'pending' | 'paid' | 'cancelled'
  createdBy?: string
  paymentMethod?: 'cash' | 'credit' | 'debit' | 'transfer' | 'check'
  page?: number
  limit?: number
  sortBy?: 'expenseDate' | 'amount' | 'totalAmount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
  isRecurring?: boolean
  needsApproval?: boolean
}

export interface ExpenseCategoriesFilters {
  search?: string
  isActive?: boolean
  affectsCogs?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ExpenseWithDetails extends SelectExpense {
  category?: {
    id: number
    name: string
    description?: string
    affectsCogs: boolean
  }
  supplier?: {
    id: number
    name: string
    companyName?: string
  }
}

export const ExpensesRepository = {
  // === EXPENSES ===
  findAll: async (filters: ExpensesFilters = {}) => {
    const {
      search,
      categoryId,
      supplierId,
      status,
      createdBy,
      paymentMethod,
      page = 1,
      limit = 50,
      sortBy = 'expenseDate',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      isRecurring,
      needsApproval,
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(expensesTable.deleted, false)]

    if (search) {
      whereConditions.push(
        or(
          like(expensesTable.expenseNumber, `%${search}%`),
          like(expensesTable.title, `%${search}%`),
          like(expensesTable.description, `%${search}%`),
          like(expensesTable.referenceNumber, `%${search}%`),
          like(expenseCategoriesTable.name, `%${search}%`),
          like(suppliersTable.name, `%${search}%`)
        )!
      )
    }

    if (categoryId) {
      whereConditions.push(eq(expensesTable.categoryId, categoryId))
    }

    if (supplierId) {
      whereConditions.push(eq(expensesTable.supplierId, supplierId))
    }

    if (status) {
      whereConditions.push(eq(expensesTable.status, status))
    }

    if (createdBy) {
      whereConditions.push(eq(expensesTable.createdBy, createdBy))
    }

    if (paymentMethod) {
      whereConditions.push(eq(expensesTable.paymentMethod, paymentMethod))
    }

    if (dateFrom) {
      whereConditions.push(gte(expensesTable.expenseDate, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(expensesTable.expenseDate, dateTo))
    }

    if (minAmount !== undefined) {
      whereConditions.push(gte(expensesTable.totalAmount, minAmount))
    }

    if (maxAmount !== undefined) {
      whereConditions.push(lte(expensesTable.totalAmount, maxAmount))
    }

    if (isRecurring !== undefined) {
      whereConditions.push(eq(expensesTable.isRecurring, isRecurring))
    }

    if (needsApproval !== undefined) {
      whereConditions.push(eq(expensesTable.needsApproval, needsApproval))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(expensesTable[sortBy])
        : asc(expensesTable[sortBy])

    const [expenses, totalResult] = await Promise.all([
      db
        .select({
          ...expensesTable,
          categoryName: expenseCategoriesTable.name,
          categoryAffectsCogs: expenseCategoriesTable.affectsCogs,
          supplierName: suppliersTable.name,
          supplierCompanyName: suppliersTable.companyName,
        })
        .from(expensesTable)
        .leftJoin(expenseCategoriesTable, eq(expensesTable.categoryId, expenseCategoriesTable.id))
        .leftJoin(suppliersTable, eq(expensesTable.supplierId, suppliersTable.id))
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(expensesTable)
        .leftJoin(expenseCategoriesTable, eq(expensesTable.categoryId, expenseCategoriesTable.id))
        .leftJoin(suppliersTable, eq(expensesTable.supplierId, suppliersTable.id))
        .where(and(...whereConditions)),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: expenses,
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

  findById: async (id: SelectExpense['id']): Promise<ExpenseWithDetails | undefined> => {
    const expense = await db
      .select({
        ...expensesTable,
        category: {
          id: expenseCategoriesTable.id,
          name: expenseCategoriesTable.name,
          description: expenseCategoriesTable.description,
          affectsCogs: expenseCategoriesTable.affectsCogs,
        },
        supplier: {
          id: suppliersTable.id,
          name: suppliersTable.name,
          companyName: suppliersTable.companyName,
        },
      })
      .from(expensesTable)
      .leftJoin(expenseCategoriesTable, eq(expensesTable.categoryId, expenseCategoriesTable.id))
      .leftJoin(suppliersTable, eq(expensesTable.supplierId, suppliersTable.id))
      .where(and(
        eq(expensesTable.id, id),
        eq(expensesTable.deleted, false)
      ))
      .get()

    return expense
  },

  create: async (data: InsertExpense) => {
    const result = await db
      .insert(expensesTable)
      .values(data)
      .returning()

    return result[0]
  },

  update: async (id: SelectExpense['id'], data: Partial<SelectExpense>) =>
    db
      .update(expensesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(expensesTable.id, id))
      .returning(),

  approve: async (id: SelectExpense['id'], approvedBy: string) =>
    db
      .update(expensesTable)
      .set({
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(expensesTable.id, id))
      .returning(),

  delete: async (id: SelectExpense['id']) =>
    db
      .update(expensesTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(expensesTable.id, id)),

  // Generate next expense number
  generateExpenseNumber: async () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const prefix = `EXP${year}${month}`

    const lastExpense = await db
      .select({ expenseNumber: expensesTable.expenseNumber })
      .from(expensesTable)
      .where(like(expensesTable.expenseNumber, `${prefix}%`))
      .orderBy(desc(expensesTable.expenseNumber))
      .limit(1)
      .get()

    if (!lastExpense) {
      return `${prefix}001`
    }

    const lastNumber = parseInt(lastExpense.expenseNumber.slice(-3))
    const nextNumber = String(lastNumber + 1).padStart(3, '0')
    return `${prefix}${nextNumber}`
  },

  // Get expenses statistics
  getExpensesStats: async (dateFrom?: Date, dateTo?: Date) => {
    const whereConditions = [eq(expensesTable.deleted, false)]

    if (dateFrom) {
      whereConditions.push(gte(expensesTable.expenseDate, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(expensesTable.expenseDate, dateTo))
    }

    const [statusStats, categoryStats, paymentMethodStats] = await Promise.all([
      // By status
      db
        .select({
          status: expensesTable.status,
          totalExpenses: count(expensesTable.id),
          totalAmount: sum(expensesTable.totalAmount),
        })
        .from(expensesTable)
        .where(and(...whereConditions))
        .groupBy(expensesTable.status),

      // By category
      db
        .select({
          categoryId: expensesTable.categoryId,
          categoryName: expenseCategoriesTable.name,
          totalExpenses: count(expensesTable.id),
          totalAmount: sum(expensesTable.totalAmount),
        })
        .from(expensesTable)
        .leftJoin(expenseCategoriesTable, eq(expensesTable.categoryId, expenseCategoriesTable.id))
        .where(and(...whereConditions))
        .groupBy(expensesTable.categoryId, expenseCategoriesTable.name),

      // By payment method
      db
        .select({
          paymentMethod: expensesTable.paymentMethod,
          totalExpenses: count(expensesTable.id),
          totalAmount: sum(expensesTable.totalAmount),
        })
        .from(expensesTable)
        .where(and(...whereConditions))
        .groupBy(expensesTable.paymentMethod),
    ])

    return {
      byStatus: statusStats,
      byCategory: categoryStats,
      byPaymentMethod: paymentMethodStats,
    }
  },

  // Get expenses needing approval
  findNeedingApproval: async () =>
    db
      .select({
        ...expensesTable,
        categoryName: expenseCategoriesTable.name,
      })
      .from(expensesTable)
      .leftJoin(expenseCategoriesTable, eq(expensesTable.categoryId, expenseCategoriesTable.id))
      .where(and(
        eq(expensesTable.deleted, false),
        eq(expensesTable.needsApproval, true),
        eq(expensesTable.status, 'pending')
      ))
      .orderBy(asc(expensesTable.createdAt)),

  // Get recurring expenses due for creation
  findRecurringDue: async () => {
    const today = new Date()
    return db
      .select()
      .from(expensesTable)
      .where(and(
        eq(expensesTable.deleted, false),
        eq(expensesTable.isRecurring, true),
        lte(expensesTable.nextRecurringDate, today)
      ))
      .orderBy(asc(expensesTable.nextRecurringDate))
  },

  // === EXPENSE CATEGORIES ===
  findAllCategories: async (filters: ExpenseCategoriesFilters = {}) => {
    const {
      search,
      isActive,
      affectsCogs,
      page = 1,
      limit = 50,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(expenseCategoriesTable.deleted, false)]

    if (search) {
      whereConditions.push(
        or(
          like(expenseCategoriesTable.name, `%${search}%`),
          like(expenseCategoriesTable.description, `%${search}%`)
        )!
      )
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(expenseCategoriesTable.isActive, isActive))
    }

    if (affectsCogs !== undefined) {
      whereConditions.push(eq(expenseCategoriesTable.affectsCogs, affectsCogs))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(expenseCategoriesTable[sortBy])
        : asc(expenseCategoriesTable[sortBy])

    const [categories, totalResult] = await Promise.all([
      db
        .select()
        .from(expenseCategoriesTable)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(expenseCategoriesTable)
        .where(and(...whereConditions)),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: categories,
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

  findCategoryById: async (id: SelectExpenseCategory['id']) =>
    db
      .select()
      .from(expenseCategoriesTable)
      .where(and(
        eq(expenseCategoriesTable.id, id),
        eq(expenseCategoriesTable.deleted, false)
      ))
      .get(),

  createCategory: async (data: InsertExpenseCategory) => {
    const result = await db
      .insert(expenseCategoriesTable)
      .values(data)
      .returning()

    return result[0]
  },

  updateCategory: async (id: SelectExpenseCategory['id'], data: Partial<SelectExpenseCategory>) =>
    db
      .update(expenseCategoriesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(expenseCategoriesTable.id, id))
      .returning(),

  deleteCategory: async (id: SelectExpenseCategory['id']) =>
    db
      .update(expenseCategoriesTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(expenseCategoriesTable.id, id)),

  // Get active categories for selection
  findActiveCategoriesForSelection: async () =>
    db
      .select({
        id: expenseCategoriesTable.id,
        name: expenseCategoriesTable.name,
        description: expenseCategoriesTable.description,
        affectsCogs: expenseCategoriesTable.affectsCogs,
      })
      .from(expenseCategoriesTable)
      .where(and(
        eq(expenseCategoriesTable.deleted, false),
        eq(expenseCategoriesTable.isActive, true)
      ))
      .orderBy(asc(expenseCategoriesTable.name)),
}
