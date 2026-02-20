import type { InsertInventoryMovement } from '../db/schema/inventory-movements'
import { InsertSale, type SelectSale } from '../db/schema/sales'
import { InventoryBatchesRepository } from '../repositories/inventory-batches-repository'
import { InventoryMovementsRepository } from '../repositories/inventory-movements-repository'
import { POSRepository } from '../repositories/pos-repository'
import {
  type CreateSaleData,
  type SalesFilters,
  SalesRepository,
} from '../repositories/sales-repository'
import { CashSessionsService } from './cash-sessions-service'
import { CustomersService } from './customers-service'

export const SalesService = {
  async list(filters: SalesFilters = {}) {
    return SalesRepository.findAll(filters)
  },

  async getById(id: SelectSale['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid sale id')
    }

    const sale = await SalesRepository.findById(id)
    if (!sale) {
      throw new Error('Sale not found')
    }

    return sale
  },

  async create(data: CreateSaleData) {
    // Validate that a cash session is open
    const openSession = await CashSessionsService.validateCanMakeSale()

    // Validate customer if provided
    if (data.sale.customerId) {
      await CustomersService.getById(data.sale.customerId)
    }

    // Validate sale totals
    if (data.sale.subtotal < 0) {
      throw new Error('Subtotal cannot be negative')
    }

    if (data.sale.total <= 0) {
      throw new Error('Total must be positive')
    }

    if (data.sale.taxAmount && data.sale.taxAmount < 0) {
      throw new Error('Tax amount cannot be negative')
    }

    if (data.sale.discountAmount && data.sale.discountAmount < 0) {
      throw new Error('Discount amount cannot be negative')
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new Error('Sale must have at least one item')
    }

    for (const item of data.items) {
      if (!Number.isInteger(item.presentationId)) {
        throw new Error('Invalid presentation id')
      }

      if (item.quantity <= 0) {
        throw new Error('Item quantity must be positive')
      }

      if (item.unitPrice < 0) {
        throw new Error('Item price cannot be negative')
      }

      // Validate batch availability
      const batch = await InventoryBatchesRepository.findById(item.batchId)
      if (!batch) {
        throw new Error(`Batch with id ${item.batchId} not found`)
      }

      if (batch.quantityAvailable < item.quantity) {
        throw new Error(
          `Insufficient stock in batch ${item.batchId}. Available: ${batch.quantityAvailable}, Requested: ${item.quantity}`
        )
      }
    }

    // Validate payments
    if (!data.payments || data.payments.length === 0) {
      throw new Error('Sale must have at least one payment method')
    }

    let totalPaymentAmount = 0
    for (const payment of data.payments) {
      if (payment.amount <= 0) {
        throw new Error('Payment amount must be positive')
      }

      if (
        !['cash', 'credit', 'debit', 'transfer', 'check'].includes(
          payment.method
        )
      ) {
        throw new Error('Invalid payment method')
      }

      totalPaymentAmount += payment.amount

      // Validate cash payments
      if (payment.method === 'cash') {
        if (
          !payment.receivedAmount ||
          payment.receivedAmount < payment.amount
        ) {
          throw new Error(
            'Received cash amount must be at least the payment amount'
          )
        }

        const expectedChange = payment.receivedAmount - payment.amount
        if (payment.changeAmount !== expectedChange) {
          throw new Error('Change amount calculation is incorrect')
        }
      }

      // Validate card/transfer payments
      if (['credit', 'debit', 'transfer'].includes(payment.method)) {
        if (!payment.referenceNumber?.trim()) {
          throw new Error(
            `Reference number is required for ${payment.method} payments`
          )
        }
      }
    }

    if (Math.abs(totalPaymentAmount - data.sale.total) > 0.01) {
      throw new Error('Total payment amount must equal sale total')
    }

    // Generate sale number if not provided
    if (!data.sale.saleNumber) {
      data.sale.saleNumber = await SalesRepository.generateSaleNumber()
    }

    // Set cash session
    data.sale.cashSessionId = openSession.id

    // Create the sale and associated records in a transaction
    const sale = await SalesRepository.create(data)

    // Create inventory movements for each item
    for (const item of data.items) {
      // Create inventory movement
      const movementData: InsertInventoryMovement = {
        productId: (await InventoryBatchesRepository.findById(item.batchId))!
          .productId,
        batchId: item.batchId,
        type: 'OUT',
        quantity: -item.quantity, // Negative for outgoing
        reason: 'Sale',
        referenceType: 'sale',
        referenceId: sale.id,
      }

      await InventoryMovementsRepository.create(movementData)

      // Update batch quantity
      await InventoryBatchesRepository.updateQuantity(
        item.batchId,
        -item.quantity
      )
    }

    return {
      sale,
      saleDetails: await SalesRepository.findById(sale.id),
    }
  },

  async update(id: SelectSale['id'], data: Partial<SelectSale>) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid sale id')
    }

    // Check if sale exists
    const existingSale = await SalesRepository.findById(id)
    if (!existingSale) {
      throw new Error('Sale not found')
    }

    // Only allow certain fields to be updated
    const allowedFields = ['notes', 'status']
    const updateData: Partial<SelectSale> = {}

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update')
    }

    return SalesRepository.update(id, updateData)
  },

  async cancel(id: SelectSale['id'], reason?: string) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid sale id')
    }

    const sale = await SalesRepository.findById(id)
    if (!sale) {
      throw new Error('Sale not found')
    }

    if (sale.status !== 'completed') {
      throw new Error('Only completed sales can be cancelled')
    }

    // TODO: Implement inventory reversal logic
    // This should reverse all inventory movements and restore batch quantities

    return SalesRepository.cancel(id, reason)
  },

  async refund(id: SelectSale['id'], reason?: string) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid sale id')
    }

    const sale = await SalesRepository.findById(id)
    if (!sale) {
      throw new Error('Sale not found')
    }

    if (sale.status !== 'completed') {
      throw new Error('Only completed sales can be refunded')
    }

    // TODO: Implement inventory reversal logic
    // This should reverse all inventory movements and restore batch quantities

    return SalesRepository.refund(id, reason)
  },

  async delete(id: SelectSale['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid sale id')
    }

    const sale = await SalesRepository.findById(id)
    if (!sale) {
      throw new Error('Sale not found')
    }

    if (sale.status === 'completed') {
      throw new Error(
        'Cannot delete completed sales. Use cancel or refund instead.'
      )
    }

    return SalesRepository.delete(id)
  },

  async getSalesForSession(sessionId: number) {
    if (!Number.isInteger(sessionId)) {
      throw new Error('Invalid session id')
    }

    return SalesRepository.getSalesForSession(sessionId)
  },

  async getDailySales(date: Date) {
    if (!(date instanceof Date)) {
      throw new Error('Invalid date')
    }

    return SalesRepository.getDailySales(date)
  },

  async getTopSellingProducts(limit = 10, dateFrom?: Date, dateTo?: Date) {
    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100')
    }

    if (dateFrom && !(dateFrom instanceof Date)) {
      throw new Error('Invalid date from')
    }

    if (dateTo && !(dateTo instanceof Date)) {
      throw new Error('Invalid date to')
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw new Error('Date from cannot be after date to')
    }

    return SalesRepository.getTopSellingProducts(limit, dateFrom, dateTo)
  },

  async getSalesSummary(filters: { dateFrom?: Date; dateTo?: Date } = {}) {
    const { dateFrom, dateTo } = filters

    if (dateFrom && !(dateFrom instanceof Date)) {
      throw new Error('Invalid date from')
    }

    if (dateTo && !(dateTo instanceof Date)) {
      throw new Error('Invalid date to')
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw new Error('Date from cannot be after date to')
    }

    const salesData = await SalesRepository.findAll({
      status: 'completed',
      dateFrom,
      dateTo,
      limit: 10000, // Get more records for summary
    })

    const sales = salesData.data

    if (sales.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageSaleAmount: 0,
        totalItems: 0,
        salesByStatus: {},
      }
    }

    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const averageSaleAmount = totalRevenue / totalSales

    // Group by status
    const salesByStatus = sales.reduce(
      (acc, sale) => {
        acc[sale.status] = (acc[sale.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalSales,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageSaleAmount: Math.round(averageSaleAmount * 100) / 100,
      salesByStatus,
    }
  },

  async getRecentSales(limit = 10) {
    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100')
    }

    return SalesRepository.findAll({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit,
    })
  },

  // Helper method to calculate totals
  calculateSaleTotals(
    items: Array<{
      quantity: number
      unitPrice: number
      discount?: number
      discountType?: 'fixed' | 'percentage'
    }>,
    taxRate: number = 0
  ) {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        totalItems: 0,
      }
    }

    let subtotal = 0
    let totalItems = 0

    for (const item of items) {
      let itemTotal = item.quantity * item.unitPrice

      // Apply discount if present
      if (item.discount && item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemTotal = itemTotal * (1 - item.discount / 100)
        } else {
          itemTotal = Math.max(0, itemTotal - item.discount)
        }
      }

      subtotal += itemTotal
      totalItems += item.quantity
    }

    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      totalItems,
    }
  },

  // Helper method to validate and calculate change
  calculateChange(
    payments: Array<{ method: string; amount: number; receivedAmount?: number }>
  ) {
    const cashPayments = payments.filter(p => p.method === 'cash')

    const totalCashReceived = cashPayments.reduce(
      (sum, p) => sum + (p.receivedAmount || 0),
      0
    )
    const totalCashAmount = cashPayments.reduce((sum, p) => sum + p.amount, 0)

    return Math.max(0, totalCashReceived - totalCashAmount)
  },
}
