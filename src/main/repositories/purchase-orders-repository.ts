import { db } from '../db'
import { eq, and, like, or, desc, asc, count, gte, lte, sum } from 'drizzle-orm'

import {
  purchaseOrdersTable,
  type SelectPurchaseOrder,
  type InsertPurchaseOrder,
} from '../db/schema/purchase-orders'
import {
  purchaseOrderItemsTable,
  type SelectPurchaseOrderItem,
  type InsertPurchaseOrderItem,
} from '../db/schema/purchase-order-items'
import { suppliersTable } from '../db/schema/suppliers'
import { presentationsTable } from '../db/schema/presentations'
import { productsTable } from '../db/schema/products'

export interface PurchaseOrdersFilters {
  search?: string
  supplierId?: number
  status?: 'draft' | 'sent' | 'partial' | 'completed' | 'cancelled'
  createdBy?: string
  page?: number
  limit?: number
  sortBy?: 'orderDate' | 'total' | 'orderNumber' | 'expectedDeliveryDate'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
}

export interface CreatePurchaseOrderData {
  order: InsertPurchaseOrder
  items: Array<{
    presentationId: number
    quantity: number
    unitCost: number
    totalCost: number
    discount?: number
    discountType?: 'fixed' | 'percentage'
    notes?: string
  }>
}

export interface PurchaseOrderWithDetails extends SelectPurchaseOrder {
  supplier?: {
    id: number
    name: string
    companyName?: string
    contactPerson?: string
  }
  items?: Array<{
    id: number
    presentationId: number
    presentationName: string
    productName: string
    quantity: number
    unitCost: number
    totalCost: number
    quantityReceived: number
    quantityPending: number
    discount: number
    discountType?: 'fixed' | 'percentage'
    notes?: string
  }>
}

export const PurchaseOrdersRepository = {
  findAll: async (filters: PurchaseOrdersFilters = {}) => {
    const {
      search,
      supplierId,
      status,
      createdBy,
      page = 1,
      limit = 50,
      sortBy = 'orderDate',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(purchaseOrdersTable.deleted, false)]

    if (search) {
      whereConditions.push(
        or(
          like(purchaseOrdersTable.orderNumber, `%${search}%`),
          like(purchaseOrdersTable.notes, `%${search}%`),
          like(suppliersTable.name, `%${search}%`),
          like(suppliersTable.companyName, `%${search}%`)
        )!
      )
    }

    if (supplierId) {
      whereConditions.push(eq(purchaseOrdersTable.supplierId, supplierId))
    }

    if (status) {
      whereConditions.push(eq(purchaseOrdersTable.status, status))
    }

    if (createdBy) {
      whereConditions.push(eq(purchaseOrdersTable.createdBy, createdBy))
    }

    if (dateFrom) {
      whereConditions.push(gte(purchaseOrdersTable.orderDate, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(purchaseOrdersTable.orderDate, dateTo))
    }

    if (minAmount) {
      whereConditions.push(gte(purchaseOrdersTable.total, minAmount))
    }

    if (maxAmount) {
      whereConditions.push(lte(purchaseOrdersTable.total, maxAmount))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(purchaseOrdersTable[sortBy])
        : asc(purchaseOrdersTable[sortBy])

    const [orders, totalResult] = await Promise.all([
      db
        .select({
          ...purchaseOrdersTable,
          supplierName: suppliersTable.name,
          supplierCompanyName: suppliersTable.companyName,
        })
        .from(purchaseOrdersTable)
        .leftJoin(suppliersTable, eq(purchaseOrdersTable.supplierId, suppliersTable.id))
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(purchaseOrdersTable)
        .leftJoin(suppliersTable, eq(purchaseOrdersTable.supplierId, suppliersTable.id))
        .where(and(...whereConditions)),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: orders,
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

  findById: async (id: SelectPurchaseOrder['id']): Promise<PurchaseOrderWithDetails | undefined> => {
    const orderResult = await db
      .select({
        ...purchaseOrdersTable,
        supplier: {
          id: suppliersTable.id,
          name: suppliersTable.name,
          companyName: suppliersTable.companyName,
          contactPerson: suppliersTable.contactPerson,
        },
      })
      .from(purchaseOrdersTable)
      .leftJoin(suppliersTable, eq(purchaseOrdersTable.supplierId, suppliersTable.id))
      .where(and(
        eq(purchaseOrdersTable.id, id),
        eq(purchaseOrdersTable.deleted, false)
      ))
      .get()

    if (!orderResult) return undefined

    // Get order items
    const items = await db
      .select({
        id: purchaseOrderItemsTable.id,
        presentationId: purchaseOrderItemsTable.presentationId,
        presentationName: presentationsTable.name,
        productName: productsTable.name,
        quantity: purchaseOrderItemsTable.quantity,
        unitCost: purchaseOrderItemsTable.unitCost,
        totalCost: purchaseOrderItemsTable.totalCost,
        quantityReceived: purchaseOrderItemsTable.quantityReceived,
        quantityPending: purchaseOrderItemsTable.quantityPending,
        discount: purchaseOrderItemsTable.discount,
        discountType: purchaseOrderItemsTable.discountType,
        notes: purchaseOrderItemsTable.notes,
      })
      .from(purchaseOrderItemsTable)
      .leftJoin(presentationsTable, eq(purchaseOrderItemsTable.presentationId, presentationsTable.id))
      .leftJoin(productsTable, eq(presentationsTable.productId, productsTable.id))
      .where(eq(purchaseOrderItemsTable.purchaseOrderId, id))

    return {
      ...orderResult,
      items,
    }
  },

  create: async (data: CreatePurchaseOrderData) => {
      // Create purchase order
      const orderResult = await db
        .insert(purchaseOrdersTable)
        .values(data.order)
        .returning()

      const order = orderResult[0]

      // Create order items
      const orderItems = data.items.map(item => ({
        ...item,
        purchaseOrderId: order.id,
        quantityPending: item.quantity, // Initially all quantity is pending
      }))

      await db.insert(purchaseOrderItemsTable).values(orderItems)

      return order
  },

  update: async (id: SelectPurchaseOrder['id'], data: Partial<SelectPurchaseOrder>) =>
    db
      .update(purchaseOrdersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(purchaseOrdersTable.id, id))
      .returning(),

  updateStatus: async (id: SelectPurchaseOrder['id'], status: SelectPurchaseOrder['status']) => {
    const updateData: Partial<SelectPurchaseOrder> = {
      status,
      updatedAt: new Date(),
    }

    if (status === 'sent') {
      updateData.sentAt = new Date()
    } else if (status === 'completed') {
      updateData.completedAt = new Date()
    }

    return db
      .update(purchaseOrdersTable)
      .set(updateData)
      .where(eq(purchaseOrdersTable.id, id))
      .returning()
  },

  updateItemReceived: async (itemId: number, quantityReceived: number) => {
    const item = await db
      .select()
      .from(purchaseOrderItemsTable)
      .where(eq(purchaseOrderItemsTable.id, itemId))
      .get()

    if (!item) {
      throw new Error('Purchase order item not found')
    }

    const newTotalReceived = item.quantityReceived + quantityReceived
    const newPending = Math.max(0, item.quantity - newTotalReceived)

    return db
      .update(purchaseOrderItemsTable)
      .set({
        quantityReceived: newTotalReceived,
        quantityPending: newPending,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrderItemsTable.id, itemId))
      .returning()
  },

  delete: async (id: SelectPurchaseOrder['id']) =>
    db
      .update(purchaseOrdersTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(purchaseOrdersTable.id, id)),

  // Generate next order number
  generateOrderNumber: async () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const prefix = `PO${year}${month}`

    const lastOrder = await db
      .select({ orderNumber: purchaseOrdersTable.orderNumber })
      .from(purchaseOrdersTable)
      .where(like(purchaseOrdersTable.orderNumber, `${prefix}%`))
      .orderBy(desc(purchaseOrdersTable.orderNumber))
      .limit(1)
      .get()

    if (!lastOrder) {
      return `${prefix}001`
    }

    const lastNumber = parseInt(lastOrder.orderNumber.slice(-3))
    const nextNumber = String(lastNumber + 1).padStart(3, '0')
    return `${prefix}${nextNumber}`
  },

  // Get orders summary for supplier
  getOrdersForSupplier: async (supplierId: number) => {
    const ordersSummary = await db
      .select({
        totalOrders: count(purchaseOrdersTable.id),
        totalAmount: sum(purchaseOrdersTable.total),
      })
      .from(purchaseOrdersTable)
      .where(and(
        eq(purchaseOrdersTable.supplierId, supplierId),
        eq(purchaseOrdersTable.deleted, false)
      ))
      .get()

    const statusBreakdown = await db
      .select({
        status: purchaseOrdersTable.status,
        count: count(purchaseOrdersTable.id),
        totalAmount: sum(purchaseOrdersTable.total),
      })
      .from(purchaseOrdersTable)
      .where(and(
        eq(purchaseOrdersTable.supplierId, supplierId),
        eq(purchaseOrdersTable.deleted, false)
      ))
      .groupBy(purchaseOrdersTable.status)

    return {
      summary: ordersSummary,
      statusBreakdown,
    }
  },

  // Get pending orders
  findPendingOrders: async () =>
    db
      .select({
        ...purchaseOrdersTable,
        supplierName: suppliersTable.name,
      })
      .from(purchaseOrdersTable)
      .leftJoin(suppliersTable, eq(purchaseOrdersTable.supplierId, suppliersTable.id))
      .where(and(
        eq(purchaseOrdersTable.deleted, false),
        or(
          eq(purchaseOrdersTable.status, 'sent'),
          eq(purchaseOrdersTable.status, 'partial')
        )!
      ))
      .orderBy(asc(purchaseOrdersTable.expectedDeliveryDate)),

  // Get orders statistics
  getOrdersStats: async (dateFrom?: Date, dateTo?: Date) => {
    const whereConditions = [eq(purchaseOrdersTable.deleted, false)]

    if (dateFrom) {
      whereConditions.push(gte(purchaseOrdersTable.orderDate, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(purchaseOrdersTable.orderDate, dateTo))
    }

    const stats = await db
      .select({
        status: purchaseOrdersTable.status,
        totalOrders: count(purchaseOrdersTable.id),
        totalAmount: sum(purchaseOrdersTable.total),
      })
      .from(purchaseOrdersTable)
      .where(and(...whereConditions))
      .groupBy(purchaseOrdersTable.status)

    return stats
  },
}
