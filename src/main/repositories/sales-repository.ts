import {
  and,
  asc,
  avg,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  like,
  lte,
  or,
  sum,
} from 'drizzle-orm'
import { db } from '../db'
import { cashRegistersTable } from '../db/schema/cash-registers'
import { cashSessionsTable } from '../db/schema/cash-sessions'
import { customersTable } from '../db/schema/customers'
import { paymentMethodsTable } from '../db/schema/payment-methods'
import { presentationsTable } from '../db/schema/presentations'
import { productsTable } from '../db/schema/products'
import { saleItemsTable } from '../db/schema/sale-items'
import {
  type InsertSale,
  type SelectSale,
  salesTable,
} from '../db/schema/sales'

export interface SalesFilters {
  search?: string
  customerId?: number
  cashSessionId?: number
  status?: 'completed' | 'cancelled' | 'refunded'
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'total' | 'saleNumber'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
}

export interface CreateSaleData {
  sale: InsertSale
  items: Array<{
    presentationId: number
    batchId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    discount?: number
    discountType?: 'fixed' | 'percentage'
    notes?: string
  }>
  payments: Array<{
    method: 'cash' | 'credit' | 'debit' | 'transfer' | 'check'
    amount: number
    receivedAmount?: number
    changeAmount?: number
    referenceNumber?: string
    authorizationCode?: string
    details?: string
    notes?: string
  }>
}

export interface SaleWithDetails extends SelectSale {
  customer?: {
    id: number
    name: string
    document?: string
  }
  cashSession?: {
    id: number
    cashRegisterId: number
    cashRegisterName: string
  }
  items?: Array<{
    id: number
    presentationId: number
    presentationName: string
    presentationUnit: 'unit' | 'lb' | 'liter'
    presentationFactor: number | null
    productName: string
    productBaseUnit: 'unit' | 'lb' | 'liter'
    productBaseUnitPrecision: number
    batchId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    discount: number
    discountType?: 'fixed' | 'percentage'
    notes?: string
  }>
  payments?: Array<{
    id: number
    method: string
    amount: number
    receivedAmount?: number
    changeAmount?: number
    referenceNumber?: string
    authorizationCode?: string
    details?: string
    notes?: string
  }>
}

export const SalesRepository = {
  findAll: async (filters: SalesFilters = {}) => {
    const {
      search,
      customerId,
      cashSessionId,
      status,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(salesTable.deleted, false)]

    if (search) {
      whereConditions.push(
        or(
          like(salesTable.saleNumber, `%${search}%`),
          like(salesTable.notes, `%${search}%`),
          like(customersTable.name, `%${search}%`),
          like(customersTable.document, `%${search}%`)
        )!
      )
    }

    if (customerId) {
      whereConditions.push(eq(salesTable.customerId, customerId))
    }

    if (cashSessionId) {
      whereConditions.push(eq(salesTable.cashSessionId, cashSessionId))
    }

    if (status) {
      whereConditions.push(eq(salesTable.status, status))
    }

    if (dateFrom) {
      whereConditions.push(gte(salesTable.createdAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(salesTable.createdAt, dateTo))
    }

    if (minAmount) {
      whereConditions.push(gte(salesTable.total, minAmount))
    }

    if (maxAmount) {
      whereConditions.push(lte(salesTable.total, maxAmount))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc' ? desc(salesTable[sortBy]) : asc(salesTable[sortBy])

    const [sales, totalResult] = await Promise.all([
      db
        .select({
          ...salesTable,
          customerName: customersTable.name,
          customerDocument: customersTable.document,
          cashRegisterName: cashRegistersTable.name,
        })
        .from(salesTable)
        .leftJoin(customersTable, eq(salesTable.customerId, customersTable.id))
        .leftJoin(
          cashSessionsTable,
          eq(salesTable.cashSessionId, cashSessionsTable.id)
        )
        .leftJoin(
          cashRegistersTable,
          eq(cashSessionsTable.cashRegisterId, cashRegistersTable.id)
        )
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(salesTable)
        .leftJoin(customersTable, eq(salesTable.customerId, customersTable.id))
        .leftJoin(
          cashSessionsTable,
          eq(salesTable.cashSessionId, cashSessionsTable.id)
        )
        .leftJoin(
          cashRegistersTable,
          eq(cashSessionsTable.cashRegisterId, cashRegistersTable.id)
        )
        .where(and(...whereConditions)),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: sales,
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

  findById: async (
    id: SelectSale['id']
  ): Promise<SaleWithDetails | undefined> => {
    const saleResult = await db
      .select({
        ...getTableColumns(salesTable),
        customer: {
          id: customersTable.id,
          name: customersTable.name,
          document: customersTable.document,
        },
        cashSession: {
          id: cashSessionsTable.id,
          cashRegisterId: cashSessionsTable.cashRegisterId,
          cashRegisterName: cashRegistersTable.name,
        },
      })
      .from(salesTable)
      .leftJoin(customersTable, eq(salesTable.customerId, customersTable.id))
      .leftJoin(
        cashSessionsTable,
        eq(salesTable.cashSessionId, cashSessionsTable.id)
      )
      .leftJoin(
        cashRegistersTable,
        eq(cashSessionsTable.cashRegisterId, cashRegistersTable.id)
      )
      .where(and(eq(salesTable.id, id), eq(salesTable.deleted, false)))
      .get()

    if (!saleResult) return undefined

    // Get sale items
    const items = await db
      .select({
        id: saleItemsTable.id,
        presentationId: saleItemsTable.presentationId,
        presentationName: presentationsTable.name,
        presentationUnit: presentationsTable.unit,
        presentationFactor: presentationsTable.factor,
        productName: productsTable.name,
        productBaseUnit: productsTable.baseUnit,
        productBaseUnitPrecision: productsTable.unitPrecision,
        batchId: saleItemsTable.batchId,
        quantity: saleItemsTable.quantity,
        unitPrice: saleItemsTable.unitPrice,
        totalPrice: saleItemsTable.totalPrice,
        discount: saleItemsTable.discount,
        discountType: saleItemsTable.discountType,
        notes: saleItemsTable.notes,
      })
      .from(saleItemsTable)
      .leftJoin(
        presentationsTable,
        eq(saleItemsTable.presentationId, presentationsTable.id)
      )
      .leftJoin(
        productsTable,
        eq(presentationsTable.productId, productsTable.id)
      )
      .where(eq(saleItemsTable.saleId, id))

    // Get payments
    const payments = await db
      .select()
      .from(paymentMethodsTable)
      .where(eq(paymentMethodsTable.saleId, id))

    return {
      ...saleResult,
      items,
      payments,
    }
  },

  create: async (data: CreateSaleData) => {
    // Create sale
    const saleResult = await db.insert(salesTable).values(data.sale).returning()

    const sale = saleResult[0]

    // Create sale items
    const saleItems = data.items.map(item => ({
      ...item,
      saleId: sale.id,
    }))

    await db.insert(saleItemsTable).values(saleItems)

    // Create payment methods
    const payments = data.payments.map(payment => ({
      ...payment,
      saleId: sale.id,
    }))

    await db.insert(paymentMethodsTable).values(payments)

    return sale
  },

  update: async (id: SelectSale['id'], data: Partial<SelectSale>) =>
    db
      .update(salesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(salesTable.id, id))
      .returning(),

  cancel: async (id: SelectSale['id'], notes?: string) =>
    db
      .update(salesTable)
      .set({
        status: 'cancelled',
        notes: notes || salesTable.notes,
        updatedAt: new Date(),
      })
      .where(eq(salesTable.id, id))
      .returning(),

  refund: async (id: SelectSale['id'], notes?: string) =>
    db
      .update(salesTable)
      .set({
        status: 'refunded',
        notes: notes || salesTable.notes,
        updatedAt: new Date(),
      })
      .where(eq(salesTable.id, id))
      .returning(),

  delete: async (id: SelectSale['id']) =>
    db
      .update(salesTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(salesTable.id, id)),

  // Generate next sale number
  generateSaleNumber: async () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const prefix = `${year}${month}${day}`

    const lastSale = await db
      .select({ saleNumber: salesTable.saleNumber })
      .from(salesTable)
      .where(like(salesTable.saleNumber, `${prefix}%`))
      .orderBy(desc(salesTable.saleNumber))
      .limit(1)
      .get()

    if (!lastSale) {
      return `${prefix}001`
    }

    const lastNumber = parseInt(lastSale.saleNumber.slice(-3))
    const nextNumber = String(lastNumber + 1).padStart(3, '0')
    return `${prefix}${nextNumber}`
  },

  // Get sales summary for cash session
  getSalesForSession: async (sessionId: number) => {
    const salesSummary = await db
      .select({
        totalSales: count(salesTable.id),
        totalAmount: sum(salesTable.total),
        totalItems: sum(saleItemsTable.quantity),
      })
      .from(salesTable)
      .leftJoin(saleItemsTable, eq(salesTable.id, saleItemsTable.saleId))
      .where(
        and(
          eq(salesTable.cashSessionId, sessionId),
          eq(salesTable.status, 'completed'),
          eq(salesTable.deleted, false)
        )
      )
      .get()

    const paymentsSummary = await db
      .select({
        method: paymentMethodsTable.method,
        totalAmount: sum(paymentMethodsTable.amount),
      })
      .from(paymentMethodsTable)
      .leftJoin(salesTable, eq(paymentMethodsTable.saleId, salesTable.id))
      .where(
        and(
          eq(salesTable.cashSessionId, sessionId),
          eq(salesTable.status, 'completed'),
          eq(salesTable.deleted, false)
        )
      )
      .groupBy(paymentMethodsTable.method)

    return {
      summary: salesSummary,
      paymentBreakdown: paymentsSummary,
    }
  },

  // Get daily sales report
  getDailySales: async (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return db
      .select({
        totalSales: count(salesTable.id),
        totalAmount: sum(salesTable.total),
        avgSaleAmount: avg(salesTable.total),
      })
      .from(salesTable)
      .where(
        and(
          gte(salesTable.createdAt, startOfDay),
          lte(salesTable.createdAt, endOfDay),
          eq(salesTable.status, 'completed'),
          eq(salesTable.deleted, false)
        )
      )
      .get()
  },

  // Get top selling products
  getTopSellingProducts: async (limit = 10, dateFrom?: Date, dateTo?: Date) => {
    const whereConditions = [
      eq(salesTable.status, 'completed'),
      eq(salesTable.deleted, false),
    ]

    if (dateFrom) {
      whereConditions.push(gte(salesTable.createdAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(salesTable.createdAt, dateTo))
    }

    return db
      .select({
        productId: productsTable.id,
        productName: productsTable.name,
        presentationId: presentationsTable.id,
        presentationName: presentationsTable.name,
        totalQuantity: sum(saleItemsTable.quantity),
        totalRevenue: sum(saleItemsTable.totalPrice),
        salesCount: count(saleItemsTable.id),
      })
      .from(saleItemsTable)
      .leftJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
      .leftJoin(
        presentationsTable,
        eq(saleItemsTable.presentationId, presentationsTable.id)
      )
      .leftJoin(
        productsTable,
        eq(presentationsTable.productId, productsTable.id)
      )
      .where(and(...whereConditions))
      .groupBy(saleItemsTable.presentationId)
      .orderBy(desc(sum(saleItemsTable.quantity)))
      .limit(limit)
  },
}
