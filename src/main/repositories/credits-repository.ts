import { db } from '../db'
import { eq, and, like, or, desc, asc, count, gte, lte, sum } from 'drizzle-orm'

import {
  creditsTable,
  creditPaymentsTable,
  type SelectCredit,
  type InsertCredit,
  type SelectCreditPayment,
  type InsertCreditPayment,
} from '../db/schema/credits'
import { customersTable } from '../db/schema/customers'
import { salesTable } from '../db/schema/sales'

export interface CreditsFilters {
  search?: string
  customerId?: number
  type?: 'sale_credit' | 'manual_credit' | 'payment' | 'adjustment'
  status?: 'active' | 'paid' | 'partial' | 'cancelled'
  createdBy?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'dueDate' | 'amount' | 'remainingAmount'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
  dueDateFrom?: Date
  dueDateTo?: Date
  minAmount?: number
  maxAmount?: number
  overdue?: boolean
}

export interface CreateCreditData {
  credit: InsertCredit
  initialPayment?: {
    amount: number
    paymentMethod: 'cash' | 'credit' | 'debit' | 'transfer' | 'check'
    receivedAmount?: number
    changeAmount?: number
    referenceNumber?: string
    authorizationCode?: string
    notes?: string
  }
}

export interface CreditWithDetails extends SelectCredit {
  customer?: {
    id: number
    name: string
    document?: string
    creditLimit: number
    currentBalance: number
  }
  sale?: {
    id: number
    saleNumber: string
    total: number
  }
  payments?: Array<{
    id: number
    paymentNumber: string
    amount: number
    paymentMethod: string
    receivedAmount?: number
    changeAmount?: number
    referenceNumber?: string
    notes?: string
    createdAt: Date
    createdBy: string
  }>
  totalPaid?: number
  isOverdue?: boolean
}

export const CreditsRepository = {
  findAll: async (filters: CreditsFilters = {}) => {
    const {
      search,
      customerId,
      type,
      status,
      createdBy,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      dueDateFrom,
      dueDateTo,
      minAmount,
      maxAmount,
      overdue,
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(creditsTable.deleted, false)]

    if (search) {
      whereConditions.push(
        or(
          like(creditsTable.creditNumber, `%${search}%`),
          like(creditsTable.description, `%${search}%`),
          like(creditsTable.notes, `%${search}%`),
          like(customersTable.name, `%${search}%`),
          like(customersTable.document, `%${search}%`)
        )!
      )
    }

    if (customerId) {
      whereConditions.push(eq(creditsTable.customerId, customerId))
    }

    if (type) {
      whereConditions.push(eq(creditsTable.type, type))
    }

    if (status) {
      whereConditions.push(eq(creditsTable.status, status))
    }

    if (createdBy) {
      whereConditions.push(eq(creditsTable.createdBy, createdBy))
    }

    if (dateFrom) {
      whereConditions.push(gte(creditsTable.createdAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(creditsTable.createdAt, dateTo))
    }

    if (dueDateFrom) {
      whereConditions.push(gte(creditsTable.dueDate, dueDateFrom))
    }

    if (dueDateTo) {
      whereConditions.push(lte(creditsTable.dueDate, dueDateTo))
    }

    if (minAmount !== undefined) {
      whereConditions.push(gte(creditsTable.amount, minAmount))
    }

    if (maxAmount !== undefined) {
      whereConditions.push(lte(creditsTable.amount, maxAmount))
    }

    if (overdue) {
      const today = new Date()
      whereConditions.push(
        and(
          lte(creditsTable.dueDate, today),
          or(
            eq(creditsTable.status, 'active'),
            eq(creditsTable.status, 'partial')
          )!
        )!
      )
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(creditsTable[sortBy])
        : asc(creditsTable[sortBy])

    const [credits, totalResult] = await Promise.all([
      db
        .select({
          ...creditsTable,
          customerName: customersTable.name,
          customerDocument: customersTable.document,
          customerCreditLimit: customersTable.creditLimit,
          customerCurrentBalance: customersTable.currentBalance,
          saleNumber: salesTable.saleNumber,
        })
        .from(creditsTable)
        .leftJoin(customersTable, eq(creditsTable.customerId, customersTable.id))
        .leftJoin(salesTable, eq(creditsTable.saleId, salesTable.id))
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(creditsTable)
        .leftJoin(customersTable, eq(creditsTable.customerId, customersTable.id))
        .leftJoin(salesTable, eq(creditsTable.saleId, salesTable.id))
        .where(and(...whereConditions)),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    // Check if credits are overdue
    const today = new Date()
    const creditsWithOverdueStatus = credits.map(credit => ({
      ...credit,
      isOverdue: credit.dueDate ? new Date(credit.dueDate) < today &&
        (credit.status === 'active' || credit.status === 'partial') : false
    }))

    return {
      data: creditsWithOverdueStatus,
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

  findById: async (id: SelectCredit['id']): Promise<CreditWithDetails | undefined> => {
    const creditResult = await db
      .select({
        ...creditsTable,
        customer: {
          id: customersTable.id,
          name: customersTable.name,
          document: customersTable.document,
          creditLimit: customersTable.creditLimit,
          currentBalance: customersTable.currentBalance,
        },
        sale: {
          id: salesTable.id,
          saleNumber: salesTable.saleNumber,
          total: salesTable.total,
        },
      })
      .from(creditsTable)
      .leftJoin(customersTable, eq(creditsTable.customerId, customersTable.id))
      .leftJoin(salesTable, eq(creditsTable.saleId, salesTable.id))
      .where(and(
        eq(creditsTable.id, id),
        eq(creditsTable.deleted, false)
      ))
      .get()

    if (!creditResult) return undefined

    // Get payments
    const payments = await db
      .select()
      .from(creditPaymentsTable)
      .where(eq(creditPaymentsTable.creditId, id))
      .orderBy(desc(creditPaymentsTable.createdAt))

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const today = new Date()
    const isOverdue = creditResult.dueDate ?
      new Date(creditResult.dueDate) < today &&
      (creditResult.status === 'active' || creditResult.status === 'partial') : false

    return {
      ...creditResult,
      payments: payments.map(payment => ({
        ...payment,
        createdAt: new Date(payment.createdAt),
      })),
      totalPaid,
      isOverdue,
    }
  },

  create: async (data: CreateCreditData) => {
      // Create credit
      const creditResult = await db
        .insert(creditsTable)
        .values(data.credit)
        .returning()

      const credit = creditResult[0]

      // Create initial payment if provided
      if (data.initialPayment && data.initialPayment.amount > 0) {
        const paymentNumber = await this.generatePaymentNumber()

        await db.insert(creditPaymentsTable).values({
          creditId: credit.id,
          paymentNumber,
          amount: data.initialPayment.amount,
          paymentMethod: data.initialPayment.paymentMethod,
          receivedAmount: data.initialPayment.receivedAmount,
          changeAmount: data.initialPayment.changeAmount,
          referenceNumber: data.initialPayment.referenceNumber,
          authorizationCode: data.initialPayment.authorizationCode,
          notes: data.initialPayment.notes,
          createdBy: credit.createdBy,
        })

        // Update credit amounts
        const newPaidAmount = credit.paidAmount + data.initialPayment.amount
        const newRemainingAmount = credit.originalAmount - newPaidAmount
        const newStatus = newRemainingAmount <= 0 ? 'paid' :
                         newPaidAmount > 0 ? 'partial' : 'active'

        await db
          .update(creditsTable)
          .set({
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            status: newStatus,
            updatedAt: new Date(),
          })
          .where(eq(creditsTable.id, credit.id))
      }

      return credit
  },

  update: async (id: SelectCredit['id'], data: Partial<SelectCredit>) =>
    db
      .update(creditsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creditsTable.id, id))
      .returning(),

  addPayment: async (creditId: number, paymentData: Omit<InsertCreditPayment, 'creditId' | 'paymentNumber'>) => {
    
      const paymentNumber = await this.generatePaymentNumber()

      // Create payment
      const paymentResult = await db
        .insert(creditPaymentsTable)
        .values({
          ...paymentData,
          creditId,
          paymentNumber,
        })
        .returning()

      const payment = paymentResult[0]

      // Get current credit
      const credit = await db
        .select()
        .from(creditsTable)
        .where(eq(creditsTable.id, creditId))
        .get()

      if (credit) {
        // Update credit amounts
        const newPaidAmount = credit.paidAmount + payment.amount
        const newRemainingAmount = Math.max(0, credit.originalAmount - newPaidAmount)
        const newStatus = newRemainingAmount <= 0 ? 'paid' :
                         newPaidAmount > 0 ? 'partial' : 'active'

        await db
          .update(creditsTable)
          .set({
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            status: newStatus,
            updatedAt: new Date(),
          })
          .where(eq(creditsTable.id, creditId))
      }

      return payment
  },

  cancel: async (id: SelectCredit['id']) =>
    db
      .update(creditsTable)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(creditsTable.id, id))
      .returning(),

  delete: async (id: SelectCredit['id']) =>
    db
      .update(creditsTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(creditsTable.id, id)),

  // Generate next credit number
  generateCreditNumber: async () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const prefix = `CRD${year}${month}`

    const lastCredit = await db
      .select({ creditNumber: creditsTable.creditNumber })
      .from(creditsTable)
      .where(like(creditsTable.creditNumber, `${prefix}%`))
      .orderBy(desc(creditsTable.creditNumber))
      .limit(1)
      .get()

    if (!lastCredit) {
      return `${prefix}001`
    }

    const lastNumber = parseInt(lastCredit.creditNumber.slice(-3))
    const nextNumber = String(lastNumber + 1).padStart(3, '0')
    return `${prefix}${nextNumber}`
  },

  // Generate next payment number
  generatePaymentNumber: async () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const prefix = `PAY${year}${month}`

    const lastPayment = await db
      .select({ paymentNumber: creditPaymentsTable.paymentNumber })
      .from(creditPaymentsTable)
      .where(like(creditPaymentsTable.paymentNumber, `${prefix}%`))
      .orderBy(desc(creditPaymentsTable.paymentNumber))
      .limit(1)
      .get()

    if (!lastPayment) {
      return `${prefix}001`
    }

    const lastNumber = parseInt(lastPayment.paymentNumber.slice(-3))
    const nextNumber = String(lastNumber + 1).padStart(3, '0')
    return `${prefix}${nextNumber}`
  },

  // Get overdue credits
  findOverdueCredits: async () => {
    const today = new Date()
    return db
      .select({
        ...creditsTable,
        customerName: customersTable.name,
        customerDocument: customersTable.document,
      })
      .from(creditsTable)
      .leftJoin(customersTable, eq(creditsTable.customerId, customersTable.id))
      .where(and(
        eq(creditsTable.deleted, false),
        lte(creditsTable.dueDate, today),
        or(
          eq(creditsTable.status, 'active'),
          eq(creditsTable.status, 'partial')
        )!
      ))
      .orderBy(asc(creditsTable.dueDate))
  },

  // Get credits for customer
  findByCustomer: async (customerId: number) =>
    db
      .select()
      .from(creditsTable)
      .where(and(
        eq(creditsTable.customerId, customerId),
        eq(creditsTable.deleted, false)
      ))
      .orderBy(desc(creditsTable.createdAt)),

  // Get credits statistics
  getCreditsStats: async (dateFrom?: Date, dateTo?: Date) => {
    const whereConditions = [eq(creditsTable.deleted, false)]

    if (dateFrom) {
      whereConditions.push(gte(creditsTable.createdAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(creditsTable.createdAt, dateTo))
    }

    const stats = await db
      .select({
        status: creditsTable.status,
        totalCredits: count(creditsTable.id),
        totalAmount: sum(creditsTable.originalAmount),
        totalPaid: sum(creditsTable.paidAmount),
        totalRemaining: sum(creditsTable.remainingAmount),
      })
      .from(creditsTable)
      .where(and(...whereConditions))
      .groupBy(creditsTable.status)

    // Get overdue statistics
    const today = new Date()
    const overdueStats = await db
      .select({
        totalOverdue: count(creditsTable.id),
        totalOverdueAmount: sum(creditsTable.remainingAmount),
      })
      .from(creditsTable)
      .where(and(
        eq(creditsTable.deleted, false),
        lte(creditsTable.dueDate, today),
        or(
          eq(creditsTable.status, 'active'),
          eq(creditsTable.status, 'partial')
        )!
      ))
      .get()

    return {
      byStatus: stats,
      overdue: overdueStats,
    }
  },

  // Calculate late fees for overdue credits
  calculateLateFees: async (creditId: number) => {
    const credit = await db
      .select()
      .from(creditsTable)
      .where(eq(creditsTable.id, creditId))
      .get()

    if (!credit || !credit.dueDate || credit.interestRate === 0) {
      return 0
    }

    const today = new Date()
    const dueDate = new Date(credit.dueDate)

    if (today <= dueDate) {
      return 0
    }

    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    const monthsOverdue = daysOverdue / 30

    // Simple interest calculation
    const interestRate = credit.interestRate / 100 // Convert from percentage
    const lateFees = Math.floor(credit.remainingAmount * interestRate * monthsOverdue)

    return lateFees
  },
}
