import { ipcMain } from 'electron'
import { SalesRepository } from '../repositories/sales-repository'
import { InventoryBatchesRepository } from '../repositories/inventory-batches-repository'
import { CustomersRepository } from '../repositories/customers-repository'
import { ExpensesRepository } from '../repositories/expenses-repository'
import { CreditsRepository } from '../repositories/credits-repository'
import { PurchaseOrdersRepository } from '../repositories/purchase-orders-repository'
import { InventoryAdjustmentsRepository } from '../repositories/inventory-adjustments-repository'
import { eq, and, gte, lte, sum, count, desc, asc } from 'drizzle-orm'
import { db } from '../db'
import { salesTable } from '../db/schema/sales'
import { saleItemsTable } from '../db/schema/sale-items'
import { productsTable } from '../db/schema/products'
import { categoriesTable } from '../db/schema/categories'
import { customersTable } from '../db/schema/customers'

export function registerReportsIpc() {
  // === SALES REPORTS ===
  ipcMain.handle('reports:getSalesReport', async (_, filters) => {
    try {
      const { dateFrom, dateTo, customerId, categoryId, productId } = filters

      const whereConditions = [eq(salesTable.deleted, false)]

      if (dateFrom) {
        whereConditions.push(gte(salesTable.createdAt, new Date(dateFrom)))
      }

      if (dateTo) {
        whereConditions.push(lte(salesTable.createdAt, new Date(dateTo)))
      }

      if (customerId) {
        whereConditions.push(eq(salesTable.customerId, customerId))
      }

      // Get sales summary
      const summary = await db
        .select({
          totalSales: count(salesTable.id),
          totalRevenue: sum(salesTable.total),
          totalCost: sum(salesTable.totalCost),
          totalProfit: sum(salesTable.totalProfit),
          averageTicket: sum(salesTable.total),
        })
        .from(salesTable)
        .where(and(...whereConditions))
        .get()

      // Get sales by date
      const salesByDate = await db
        .select({
          date: salesTable.createdAt,
          totalSales: count(salesTable.id),
          totalRevenue: sum(salesTable.total),
          totalProfit: sum(salesTable.totalProfit),
        })
        .from(salesTable)
        .where(and(...whereConditions))
        .groupBy(salesTable.createdAt)
        .orderBy(asc(salesTable.createdAt))

      // Get top products
      const topProducts = await db
        .select({
          productId: saleItemsTable.productId,
          productName: productsTable.name,
          totalQuantity: sum(saleItemsTable.quantity),
          totalRevenue: sum(saleItemsTable.totalPrice),
          totalProfit: sum(saleItemsTable.totalProfit),
        })
        .from(saleItemsTable)
        .leftJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
        .leftJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
        .where(and(...whereConditions))
        .groupBy(saleItemsTable.productId, productsTable.name)
        .orderBy(desc(sum(saleItemsTable.totalPrice)))
        .limit(10)

      // Get sales by payment method
      const salesByPaymentMethod = await db
        .select({
          paymentMethod: salesTable.paymentMethod,
          totalSales: count(salesTable.id),
          totalAmount: sum(salesTable.total),
        })
        .from(salesTable)
        .where(and(...whereConditions))
        .groupBy(salesTable.paymentMethod)

      return {
        summary: {
          ...summary,
          averageTicket: summary?.totalRevenue && summary?.totalSales
            ? (summary.totalRevenue / summary.totalSales)
            : 0
        },
        salesByDate,
        topProducts,
        salesByPaymentMethod,
      }
    } catch (error) {
      console.error('Error generating sales report:', error)
      throw error
    }
  })

  // === INVENTORY REPORTS ===
  ipcMain.handle('reports:getInventoryReport', async (_, filters) => {
    try {
      const { categoryId, lowStockOnly, expiringOnly, daysToExpire = 30 } = filters

      const result = await InventoryBatchesRepository.findAll({
        categoryId,
        hasStock: lowStockOnly,
        expiringInDays: expiringOnly ? daysToExpire : undefined,
        limit: 1000
      })

      const batches = result.data

      // Calculate summary
      const summary = {
        totalProducts: new Set(batches.map(b => b.productId)).size,
        totalBatches: batches.length,
        totalValue: batches.reduce((sum, b) => sum + (b.quantityAvailable * b.unitCost), 0),
        totalQuantity: batches.reduce((sum, b) => sum + b.quantityAvailable, 0),
        lowStockItems: batches.filter(b => b.quantityAvailable <= 10).length,
        expiringItems: batches.filter(b => {
          if (!b.expirationDate) return false
          const daysToExp = Math.ceil((new Date(b.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          return daysToExp <= daysToExpire && daysToExp >= 0
        }).length,
      }

      // Group by category
      const byCategory = batches.reduce((acc, batch) => {
        const categoryName = batch.product?.category?.name || 'Sin categoría'
        if (!acc[categoryName]) {
          acc[categoryName] = {
            totalBatches: 0,
            totalValue: 0,
            totalQuantity: 0,
          }
        }
        acc[categoryName].totalBatches += 1
        acc[categoryName].totalValue += batch.quantityAvailable * batch.unitCost
        acc[categoryName].totalQuantity += batch.quantityAvailable
        return acc
      }, {} as Record<string, any>)

      return {
        summary,
        batches,
        byCategory: Object.entries(byCategory).map(([name, data]) => ({ categoryName: name, ...data })),
      }
    } catch (error) {
      console.error('Error generating inventory report:', error)
      throw error
    }
  })

  // === CUSTOMERS REPORT ===
  ipcMain.handle('reports:getCustomersReport', async (_, filters) => {
    try {
      const { dateFrom, dateTo, hasOutstandingBalance } = filters

      const result = await CustomersRepository.list({
        hasOutstandingBalance,
        limit: 1000
      })

      const customers = result.data

      // Get customer sales in date range
      const customerSales = await Promise.all(
        customers.map(async (customer) => {
          const salesFilters = {
            customerId: customer.id,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
          }

          const sales = await SalesRepository.findAll(salesFilters)

          const totalSales = sales.data.length
          const totalSpent = sales.data.reduce((sum, sale) => sum + sale.total, 0)
          const averageTicket = totalSales > 0 ? totalSpent / totalSales : 0

          return {
            ...customer,
            totalSales,
            totalSpent,
            averageTicket,
            lastPurchaseDate: sales.data.length > 0 ? sales.data[0].createdAt : null,
          }
        })
      )

      // Calculate summary
      const summary = {
        totalCustomers: customers.length,
        activeCustomers: customerSales.filter(c => c.totalSales > 0).length,
        customersWithBalance: customers.filter(c => c.currentBalance > 0).length,
        totalOutstandingBalance: customers.reduce((sum, c) => sum + c.currentBalance, 0),
        averageSpending: customerSales.length > 0
          ? customerSales.reduce((sum, c) => sum + c.totalSpent, 0) / customerSales.length
          : 0,
      }

      // Top customers by spending
      const topCustomers = customerSales
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10)

      return {
        summary,
        customers: customerSales,
        topCustomers,
      }
    } catch (error) {
      console.error('Error generating customers report:', error)
      throw error
    }
  })

  // === PROFITS REPORT ===
  ipcMain.handle('reports:getProfitsReport', async (_, filters) => {
    try {
      const { dateFrom, dateTo } = filters

      // Get sales data
      const salesResult = await SalesRepository.findAll({
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        limit: 10000
      })

      const sales = salesResult.data

      // Get expenses data
      const expensesResult = await ExpensesRepository.findAll({
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        status: 'paid',
        limit: 10000
      })

      const expenses = expensesResult.data

      // Calculate totals
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
      const totalCost = sales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0)
      const grossProfit = totalRevenue - totalCost
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0)
      const netProfit = grossProfit - totalExpenses

      // Calculate margins
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      // Group by date
      const dailyProfits = sales.reduce((acc, sale) => {
        const date = new Date(sale.createdAt).toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = {
            date,
            revenue: 0,
            cost: 0,
            grossProfit: 0,
          }
        }
        acc[date].revenue += sale.total
        acc[date].cost += sale.totalCost || 0
        acc[date].grossProfit += (sale.total - (sale.totalCost || 0))
        return acc
      }, {} as Record<string, any>)

      // Add expenses to daily data
      expenses.forEach(expense => {
        const date = new Date(expense.expenseDate).toISOString().split('T')[0]
        if (dailyProfits[date]) {
          dailyProfits[date].expenses = (dailyProfits[date].expenses || 0) + expense.totalAmount
          dailyProfits[date].netProfit = dailyProfits[date].grossProfit - (dailyProfits[date].expenses || 0)
        }
      })

      const profitsByDate = Object.values(dailyProfits).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      return {
        summary: {
          totalRevenue,
          totalCost,
          grossProfit,
          totalExpenses,
          netProfit,
          grossMargin,
          netMargin,
          totalSales: sales.length,
          averageTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
        },
        profitsByDate,
        expenses: expenses.slice(0, 20), // Top 20 expenses
      }
    } catch (error) {
      console.error('Error generating profits report:', error)
      throw error
    }
  })

  // === DASHBOARD METRICS ===
  ipcMain.handle('reports:getDashboardMetrics', async (_, period = 'today') => {
    try {
      const now = new Date()
      let dateFrom: Date
      let dateTo: Date = now

      switch (period) {
        case 'today':
          dateFrom = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          dateFrom = new Date(now.getFullYear(), 0, 1)
          break
        default:
          dateFrom = new Date(now.setHours(0, 0, 0, 0))
      }

      // Get sales metrics
      const salesResult = await SalesRepository.findAll({
        dateFrom,
        dateTo,
        limit: 10000
      })

      const sales = salesResult.data
      const totalSales = sales.length
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
      const totalProfit = sales.reduce((sum, sale) => sum + (sale.totalProfit || 0), 0)
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

      // Get low stock items
      const lowStockResult = await InventoryBatchesRepository.findAll({
        hasStock: true,
        limit: 1000
      })

      const lowStockItems = lowStockResult.data.filter(batch => batch.quantityAvailable <= 10)

      // Get overdue credits
      const overdueCredits = await CreditsRepository.findOverdueCredits()
      const totalOverdueAmount = overdueCredits.reduce((sum, credit) => sum + credit.remainingAmount, 0)

      // Get pending orders
      const pendingOrders = await PurchaseOrdersRepository.findPendingOrders()

      return {
        sales: {
          totalSales,
          totalRevenue,
          totalProfit,
          averageTicket,
        },
        inventory: {
          lowStockItems: lowStockItems.length,
          totalLowStockValue: lowStockItems.reduce((sum, item) =>
            sum + (item.quantityAvailable * item.unitCost), 0
          ),
        },
        credits: {
          overdueCredits: overdueCredits.length,
          totalOverdueAmount,
        },
        orders: {
          pendingOrders: pendingOrders.length,
          totalPendingValue: pendingOrders.reduce((sum, order) => sum + order.total, 0),
        },
      }
    } catch (error) {
      console.error('Error getting dashboard metrics:', error)
      throw error
    }
  })

  // === TOP PRODUCTS ===
  ipcMain.handle('reports:getTopProducts', async (_, filters) => {
    try {
      const { dateFrom, dateTo, limit = 10, sortBy = 'revenue' } = filters

      const whereConditions = [eq(salesTable.deleted, false)]

      if (dateFrom) {
        whereConditions.push(gte(salesTable.createdAt, new Date(dateFrom)))
      }

      if (dateTo) {
        whereConditions.push(lte(salesTable.createdAt, new Date(dateTo)))
      }

      const topProducts = await db
        .select({
          productId: saleItemsTable.productId,
          productName: productsTable.name,
          categoryName: categoriesTable.name,
          totalQuantity: sum(saleItemsTable.quantity),
          totalRevenue: sum(saleItemsTable.totalPrice),
          totalProfit: sum(saleItemsTable.totalProfit),
          totalSales: count(saleItemsTable.id),
        })
        .from(saleItemsTable)
        .leftJoin(salesTable, eq(saleItemsTable.saleId, salesTable.id))
        .leftJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(and(...whereConditions))
        .groupBy(saleItemsTable.productId, productsTable.name, categoriesTable.name)
        .orderBy(
          sortBy === 'quantity' ? desc(sum(saleItemsTable.quantity)) :
          sortBy === 'profit' ? desc(sum(saleItemsTable.totalProfit)) :
          desc(sum(saleItemsTable.totalPrice))
        )
        .limit(limit)

      return topProducts
    } catch (error) {
      console.error('Error getting top products:', error)
      throw error
    }
  })

  // === EXPORT DATA ===
  ipcMain.handle('reports:exportData', async (_, reportType, filters) => {
    try {
      let data: any[] = []

      switch (reportType) {
        case 'sales':
          const salesResult = await SalesRepository.findAll({ ...filters, limit: 10000 })
          data = salesResult.data
          break
        case 'inventory':
          const inventoryResult = await InventoryBatchesRepository.findAll({ ...filters, limit: 10000 })
          data = inventoryResult.data
          break
        case 'customers':
          const customersResult = await CustomersRepository.list({ ...filters, limit: 10000 })
          data = customersResult.data
          break
        case 'expenses':
          const expensesResult = await ExpensesRepository.findAll({ ...filters, limit: 10000 })
          data = expensesResult.data
          break
        case 'credits':
          const creditsResult = await CreditsRepository.findAll({ ...filters, limit: 10000 })
          data = creditsResult.data
          break
        default:
          throw new Error(`Unknown report type: ${reportType}`)
      }

      return {
        data,
        exportDate: new Date().toISOString(),
        recordCount: data.length,
        filters,
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      throw error
    }
  })
}
