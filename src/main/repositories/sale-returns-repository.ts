import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  like,
  lte,
} from 'drizzle-orm'
import { db } from '../db'
import {
  type InsertReturnExchangeItem,
  type InsertReturnItem,
  type InsertSaleReturn,
  returnExchangeItemsTable,
  returnItemsTable,
  type SelectSaleReturn,
  saleReturnsTable,
} from '../db/schema/sale-returns'
import { salesTable } from '../db/schema/sales'

export interface SaleReturnFilters {
  saleId?: number
  type?: 'refund' | 'exchange'
  dateFrom?: Date
  dateTo?: Date
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'balanceCents'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateSaleReturnData {
  return: InsertSaleReturn
  returnItems: Array<Omit<InsertReturnItem, 'returnId'>>
  exchangeItems?: Array<Omit<InsertReturnExchangeItem, 'returnId'>>
}

export interface SaleReturnWithDetails extends SelectSaleReturn {
  sale?: { id: number; saleNumber: string; total: number }
  returnItems?: Array<{
    id: number
    saleItemId: number
    quantityReturned: number
    condition: 'good' | 'damaged'
    adjustmentId?: number
    productName?: string
    presentationName?: string
    unitPrice?: number
    totalReturnedPrice?: number
  }>
  exchangeItems?: Array<{
    id: number
    presentationId: number
    batchId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    productName?: string
    presentationName?: string
  }>
}

export const SaleReturnsRepository = {
  create: async (data: CreateSaleReturnData) => {
    const returnResult = await db
      .insert(saleReturnsTable)
      .values(data.return)
      .returning()

    const saleReturn = returnResult[0]
    if (!saleReturn) throw new Error('Failed to create sale return')

    const itemsToInsert = data.returnItems.map(item => ({
      ...item,
      returnId: saleReturn.id,
    }))
    await db.insert(returnItemsTable).values(itemsToInsert)

    if (data.exchangeItems && data.exchangeItems.length > 0) {
      const exchangeToInsert = data.exchangeItems.map(item => ({
        ...item,
        returnId: saleReturn.id,
      }))
      await db.insert(returnExchangeItemsTable).values(exchangeToInsert)
    }

    return saleReturn
  },

  findById: async (
    id: SelectSaleReturn['id']
  ): Promise<SaleReturnWithDetails | undefined> => {
    const row = await db
      .select()
      .from(saleReturnsTable)
      .where(
        and(eq(saleReturnsTable.id, id), eq(saleReturnsTable.deleted, false))
      )
      .get()

    if (!row) return undefined

    const returnItems = await db
      .select({
        id: returnItemsTable.id,
        saleItemId: returnItemsTable.saleItemId,
        quantityReturned: returnItemsTable.quantityReturned,
        condition: returnItemsTable.condition,
        adjustmentId: returnItemsTable.adjustmentId,
      })
      .from(returnItemsTable)
      .where(eq(returnItemsTable.returnId, id))

    const exchangeItems = await db
      .select({
        id: returnExchangeItemsTable.id,
        presentationId: returnExchangeItemsTable.presentationId,
        batchId: returnExchangeItemsTable.batchId,
        quantity: returnExchangeItemsTable.quantity,
        unitPrice: returnExchangeItemsTable.unitPrice,
        totalPrice: returnExchangeItemsTable.totalPrice,
      })
      .from(returnExchangeItemsTable)
      .where(eq(returnExchangeItemsTable.returnId, id))

    const sale = await db
      .select({
        id: salesTable.id,
        saleNumber: salesTable.saleNumber,
        total: salesTable.total,
      })
      .from(salesTable)
      .where(eq(salesTable.id, row.saleId))
      .get()

    return {
      ...row,
      sale,
      returnItems,
      exchangeItems,
    }
  },

  findBySaleId: async (saleId: number) => {
    return db
      .select()
      .from(saleReturnsTable)
      .where(
        and(
          eq(saleReturnsTable.saleId, saleId),
          eq(saleReturnsTable.deleted, false)
        )
      )
      .orderBy(desc(saleReturnsTable.createdAt))
  },

  findAll: async (filters: SaleReturnFilters = {}) => {
    const {
      saleId,
      type,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters

    const offset = (page - 1) * limit
    const whereConditions = [eq(saleReturnsTable.deleted, false)]

    if (saleId) {
      whereConditions.push(eq(saleReturnsTable.saleId, saleId))
    }
    if (type) {
      whereConditions.push(eq(saleReturnsTable.type, type))
    }
    if (dateFrom) {
      whereConditions.push(gte(saleReturnsTable.createdAt, dateFrom))
    }
    if (dateTo) {
      whereConditions.push(lte(saleReturnsTable.createdAt, dateTo))
    }

    const orderBy =
      sortOrder === 'desc'
        ? desc(saleReturnsTable[sortBy])
        : asc(saleReturnsTable[sortBy])

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          ...getTableColumns(saleReturnsTable),
          saleNumber: salesTable.saleNumber,
        })
        .from(saleReturnsTable)
        .leftJoin(salesTable, eq(saleReturnsTable.saleId, salesTable.id))
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(saleReturnsTable)
        .where(and(...whereConditions)),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: rows,
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

  generateReturnNumber: async () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const prefix = `DEV${year}${month}${day}`

    const lastReturn = await db
      .select({ returnNumber: saleReturnsTable.returnNumber })
      .from(saleReturnsTable)
      .where(like(saleReturnsTable.returnNumber, `${prefix}%`))
      .orderBy(desc(saleReturnsTable.returnNumber))
      .limit(1)
      .get()

    if (!lastReturn) {
      return `${prefix}001`
    }

    const lastNumber = parseInt(lastReturn.returnNumber.slice(-3), 10)
    const nextNumber = String(lastNumber + 1).padStart(3, '0')
    return `${prefix}${nextNumber}`
  },

  /** Dinero devuelto al cliente (balance > 0) y recibido por diferencia (balance < 0) para reportes */
  getTotalRefunded: async (dateFrom?: Date, dateTo?: Date) => {
    const whereConditions = [eq(saleReturnsTable.deleted, false)]

    if (dateFrom) {
      whereConditions.push(gte(saleReturnsTable.createdAt, dateFrom))
    }
    if (dateTo) {
      whereConditions.push(lte(saleReturnsTable.createdAt, dateTo))
    }

    const rows = await db
      .select({ balanceCents: saleReturnsTable.balanceCents })
      .from(saleReturnsTable)
      .where(and(...whereConditions))

    const totalRefunded = rows
      .filter(r => r.balanceCents > 0)
      .reduce((s, r) => s + r.balanceCents, 0)

    const totalReceived = rows
      .filter(r => r.balanceCents < 0)
      .reduce((s, r) => s + Math.abs(r.balanceCents), 0)

    return { totalRefunded, totalReceived }
  },
}
