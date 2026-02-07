import { contextBridge, ipcRenderer } from 'electron'

import { InsertCategory, SelectCategory } from './db/schema/categories'
import { SelectProduct } from './db/schema/products'
import { InsertCustomer, SelectCustomer } from './db/schema/customers'
import {
  InsertCashRegister,
  SelectCashRegister,
} from './db/schema/cash-registers'

import {
  AddStockDTO,
  AdjustStockDTO,
  ConsumeProductDTO,
  InventoryBatchFilters,
  InventoryMovementFilters,
} from './domains/inventory/inventory-model'

import { NewProductDTO, ProductDTO } from './domains/products/products-model'
import { NewPresentationDTO } from './domains/presentations/presentations-model'
import { PaginatedResult } from '../shared/types/pagination'
import { PresentationsListFilters } from '../shared/types/presentations'
import { CustomersFilters } from './repositories/customers-repository'
import { CashRegistersFilters } from './repositories/cash-registers-repository'
import { CashSessionsFilters } from './repositories/cash-sessions-repository'
import { POSFilters } from './repositories/pos-repository'
import { SalesFilters, CreateSaleData } from './repositories/sales-repository'
import { ProductsListFilters } from './domains/products/products-list-filters'

contextBridge.exposeInMainWorld('api', {
  products: {
    list: (filters: ProductsListFilters): Promise<PaginatedResult<ProductDTO>> =>
      ipcRenderer.invoke('products:list', filters),
    create: (product: NewProductDTO) =>
      ipcRenderer.invoke('products:create', product),
    update: (id: SelectProduct['id'], product: Partial<SelectProduct>) =>
      ipcRenderer.invoke('products:update', id, product),
    remove: (id: SelectProduct['id']) =>
      ipcRenderer.invoke('products:remove', id),
  },
  presentations: {
    list: (filters: PresentationsListFilters) =>
      ipcRenderer.invoke('presentations:list', filters),
    listByProduct: (productId: number) =>
      ipcRenderer.invoke('presentations:listByProduct', productId),
    create: (data: NewPresentationDTO) =>
      ipcRenderer.invoke('presentations:create', data),
    update: (id: number, data: Partial<NewPresentationDTO>) =>
      ipcRenderer.invoke('presentations:update', id, data),
    toggle: (id: number, isActive: boolean) =>
      ipcRenderer.invoke('presentations:toggle', id, isActive),
  },
  categories: {
    list: () => ipcRenderer.invoke('categories:list'),
    create: (category: InsertCategory) =>
      ipcRenderer.invoke('categories:create', category),
    update: (id: SelectCategory['id'], category: Partial<SelectCategory>) =>
      ipcRenderer.invoke('categories:update', id, category),
    remove: (id: SelectCategory['id']) =>
      ipcRenderer.invoke('categories:remove', id),
  },
  inventory: {
    addStock: (data: AddStockDTO) =>
      ipcRenderer.invoke('inventory:addStock', data),
    consume: (data: ConsumeProductDTO) =>
      ipcRenderer.invoke('inventory:consume', data),
    adjustStock: (data: AdjustStockDTO) =>
      ipcRenderer.invoke('inventory:adjustStock', data),
    getAvailableStock: (productId: SelectProduct['id']) =>
      ipcRenderer.invoke('inventory:getAvailableStock', productId),
    listBatches: (filters: InventoryBatchFilters) =>
      ipcRenderer.invoke('inventory:batches:list', filters),
    listMovements: (filters: InventoryMovementFilters) =>
      ipcRenderer.invoke('inventory:movements:list', filters),
  },
  customers: {
    list: (filters: CustomersFilters) =>
      ipcRenderer.invoke('customers:list', filters),
    getById: (id: number) => ipcRenderer.invoke('customers:getById', id),
    getByDocument: (document: string) =>
      ipcRenderer.invoke('customers:getByDocument', document),
    create: (customer: InsertCustomer) =>
      ipcRenderer.invoke('customers:create', customer),
    update: (id: number, customer: Partial<SelectCustomer>) =>
      ipcRenderer.invoke('customers:update', id, customer),
    remove: (id: number) => ipcRenderer.invoke('customers:remove', id),
    updateBalance: (id: number, newBalance: number) =>
      ipcRenderer.invoke('customers:updateBalance', id, newBalance),
    addToBalance: (id: number, amount: number) =>
      ipcRenderer.invoke('customers:addToBalance', id, amount),
    subtractFromBalance: (id: number, amount: number) =>
      ipcRenderer.invoke('customers:subtractFromBalance', id, amount),
    getActiveForSelection: () =>
      ipcRenderer.invoke('customers:getActiveForSelection'),
    getWithOutstandingBalance: () =>
      ipcRenderer.invoke('customers:getWithOutstandingBalance'),
    canExtendCredit: (id: number, amount: number) =>
      ipcRenderer.invoke('customers:canExtendCredit', id, amount),
  },
  cashRegisters: {
    list: (filters: CashRegistersFilters) =>
      ipcRenderer.invoke('cash-registers:list', filters),
    getById: (id: number) => ipcRenderer.invoke('cash-registers:getById', id),
    create: (cashRegister: InsertCashRegister) =>
      ipcRenderer.invoke('cash-registers:create', cashRegister),
    update: (id: number, cashRegister: Partial<SelectCashRegister>) =>
      ipcRenderer.invoke('cash-registers:update', id, cashRegister),
    remove: (id: number) => ipcRenderer.invoke('cash-registers:remove', id),
    activate: (id: number) => ipcRenderer.invoke('cash-registers:activate', id),
    deactivate: (id: number) =>
      ipcRenderer.invoke('cash-registers:deactivate', id),
    getActiveForSelection: () =>
      ipcRenderer.invoke('cash-registers:getActiveForSelection'),
    ensureDefault: () => ipcRenderer.invoke('cash-registers:ensureDefault'),
  },
  cashSessions: {
    list: (filters: CashSessionsFilters) =>
      ipcRenderer.invoke('cash-sessions:list', filters),
    getById: (id: number) => ipcRenderer.invoke('cash-sessions:getById', id),
    openSession: (input: any) =>
      ipcRenderer.invoke('cash-sessions:openSession', input),
    closeSession: (id: number, input: any) =>
      ipcRenderer.invoke('cash-sessions:closeSession', id, input),
    getCurrentOpenSession: () =>
      ipcRenderer.invoke('cash-sessions:getCurrentOpenSession'),
    getOpenSessionForRegister: (cashRegisterId: number) =>
      ipcRenderer.invoke(
        'cash-sessions:getOpenSessionForRegister',
        cashRegisterId
      ),
    getSessionSummary: (id: number) =>
      ipcRenderer.invoke('cash-sessions:getSessionSummary', id),
    updateSessionNotes: (id: number, notes: string) =>
      ipcRenderer.invoke('cash-sessions:updateSessionNotes', id, notes),
    validateCanMakeSale: () =>
      ipcRenderer.invoke('cash-sessions:validateCanMakeSale'),
    getSessionsNeedingClosure: () =>
      ipcRenderer.invoke('cash-sessions:getSessionsNeedingClosure'),
    getSessionStats: (filters: any) =>
      ipcRenderer.invoke('cash-sessions:getSessionStats', filters),
  },
  pos: {
    getAvailablePresentations: (filters: POSFilters) =>
      ipcRenderer.invoke('pos:getAvailablePresentations', filters),
    getPresentationWithBatches: (presentationId: number) =>
      ipcRenderer.invoke('pos:getPresentationWithBatches', presentationId),
    searchByCode: (code: string) =>
      ipcRenderer.invoke('pos:searchByCode', code),
    getCategories: () => ipcRenderer.invoke('pos:getCategories'),
    createSale: (input: any) => ipcRenderer.invoke('pos:createSale', input),
    calculateTotals: (items: any[], taxRate?: number) =>
      ipcRenderer.invoke('pos:calculateTotals', items, taxRate),
    calculateChange: (payments: any[]) =>
      ipcRenderer.invoke('pos:calculateChange', payments),
    getRecentSales: (limit?: number) =>
      ipcRenderer.invoke('pos:getRecentSales', limit),
    getLowStockPresentations: (threshold?: number) =>
      ipcRenderer.invoke('pos:getLowStockPresentations', threshold),
    getExpiringPresentations: (daysFromNow?: number) =>
      ipcRenderer.invoke('pos:getExpiringPresentations', daysFromNow),
    validateBarcode: (barcode: string) =>
      ipcRenderer.invoke('pos:validateBarcode', barcode),
    quickSearch: (query: string, limit?: number) =>
      ipcRenderer.invoke('pos:quickSearch', query, limit),
  },
  sales: {
    list: (filters: SalesFilters) => ipcRenderer.invoke('sales:list', filters),
    getById: (id: number) => ipcRenderer.invoke('sales:getById', id),
    create: (data: CreateSaleData) => ipcRenderer.invoke('sales:create', data),
    update: (id: number, data: any) =>
      ipcRenderer.invoke('sales:update', id, data),
    cancel: (id: number, reason?: string) =>
      ipcRenderer.invoke('sales:cancel', id, reason),
    refund: (id: number, reason?: string) =>
      ipcRenderer.invoke('sales:refund', id, reason),
    delete: (id: number) => ipcRenderer.invoke('sales:delete', id),
    getSalesForSession: (sessionId: number) =>
      ipcRenderer.invoke('sales:getSalesForSession', sessionId),
    getDailySales: (date: Date) =>
      ipcRenderer.invoke('sales:getDailySales', date),
    getTopSellingProducts: (limit?: number, dateFrom?: Date, dateTo?: Date) =>
      ipcRenderer.invoke(
        'sales:getTopSellingProducts',
        limit,
        dateFrom,
        dateTo
      ),
    getSalesSummary: (filters: any) =>
      ipcRenderer.invoke('sales:getSalesSummary', filters),
    getRecentSales: (limit?: number) =>
      ipcRenderer.invoke('sales:getRecentSales', limit),
    calculateSaleTotals: (items: any[], taxRate?: number) =>
      ipcRenderer.invoke('sales:calculateSaleTotals', items, taxRate),
    calculateChange: (payments: any[]) =>
      ipcRenderer.invoke('sales:calculateChange', payments),
  },
  suppliers: {
    list: () => ipcRenderer.invoke('suppliers:list'),
    create: (supplier: any) => ipcRenderer.invoke('suppliers:create', supplier),
    update: (id: number, supplier: any) =>
      ipcRenderer.invoke('suppliers:update', id, supplier),
    remove: (id: number) => ipcRenderer.invoke('suppliers:remove', id),
    getById: (id: number) => ipcRenderer.invoke('suppliers:getById', id),
    getActiveSuppliers: () =>
      ipcRenderer.invoke('suppliers:getActiveSuppliers'),
    updateBalance: (id: number, newBalance: number) =>
      ipcRenderer.invoke('suppliers:updateBalance', id, newBalance),
    addToBalance: (id: number, amount: number) =>
      ipcRenderer.invoke('suppliers:addToBalance', id, amount),
    subtractFromBalance: (id: number, amount: number) =>
      ipcRenderer.invoke('suppliers:subtractFromBalance', id, amount),
    getWithOutstandingBalance: () =>
      ipcRenderer.invoke('suppliers:getWithOutstandingBalance'),
    canExtendCredit: (id: number, amount: number) =>
      ipcRenderer.invoke('suppliers:canExtendCredit', id, amount),
  },
  purchaseOrders: {
    list: () => ipcRenderer.invoke('purchaseOrders:list'),
    create: (order: any) => ipcRenderer.invoke('purchaseOrders:create', order),
    update: (id: number, order: any) =>
      ipcRenderer.invoke('purchaseOrders:update', id, order),
    remove: (id: number) => ipcRenderer.invoke('purchaseOrders:remove', id),
    getById: (id: number) => ipcRenderer.invoke('purchaseOrders:getById', id),
    getBySupplier: (supplierId: number) =>
      ipcRenderer.invoke('purchaseOrders:getBySupplier', supplierId),
    updateStatus: (id: number, status: string) =>
      ipcRenderer.invoke('purchaseOrders:updateStatus', id, status),
    generateOrderNumber: () =>
      ipcRenderer.invoke('purchaseOrders:generateOrderNumber'),
    sendToSupplier: (id: number) =>
      ipcRenderer.invoke('purchaseOrders:sendToSupplier', id),
    markAsCompleted: (id: number) =>
      ipcRenderer.invoke('purchaseOrders:markAsCompleted', id),
    cancel: (id: number, reason?: string) =>
      ipcRenderer.invoke('purchaseOrders:cancel', id, reason),
    getPendingOrders: () =>
      ipcRenderer.invoke('purchaseOrders:getPendingOrders'),
    getOrdersStats: (dateFrom?: Date, dateTo?: Date) =>
      ipcRenderer.invoke('purchaseOrders:getOrdersStats', dateFrom, dateTo),
    getOrdersForSupplier: (supplierId: number) =>
      ipcRenderer.invoke('purchaseOrders:getOrdersForSupplier', supplierId),
    updateItemReceived: (itemId: number, quantityReceived: number) =>
      ipcRenderer.invoke(
        'purchaseOrders:updateItemReceived',
        itemId,
        quantityReceived
      ),
  },
  inventoryAdjustments: {
    list: () => ipcRenderer.invoke('inventoryAdjustments:list'),
    create: (adjustment: any) =>
      ipcRenderer.invoke('inventoryAdjustments:create', adjustment),
    update: (id: number, adjustment: any) =>
      ipcRenderer.invoke('inventoryAdjustments:update', id, adjustment),
    remove: (id: number) =>
      ipcRenderer.invoke('inventoryAdjustments:remove', id),
    getById: (id: number) =>
      ipcRenderer.invoke('inventoryAdjustments:getById', id),
    approve: (id: number) =>
      ipcRenderer.invoke('inventoryAdjustments:approve', id),
    cancel: (id: number) =>
      ipcRenderer.invoke('inventoryAdjustments:cancel', id),
    generateAdjustmentNumber: () =>
      ipcRenderer.invoke('inventoryAdjustments:generateAdjustmentNumber'),
    getAvailableBatches: (productId?: number) =>
      ipcRenderer.invoke('inventoryAdjustments:getAvailableBatches', productId),
    getBatchInfo: (batchId: number) =>
      ipcRenderer.invoke('inventoryAdjustments:getBatchInfo', batchId),
    getPendingAdjustments: () =>
      ipcRenderer.invoke('inventoryAdjustments:getPendingAdjustments'),
    getAdjustmentsStats: (dateFrom?: Date, dateTo?: Date) =>
      ipcRenderer.invoke(
        'inventoryAdjustments:getAdjustmentsStats',
        dateFrom,
        dateTo
      ),
    generateShrinkageNumber: () =>
      ipcRenderer.invoke('inventoryAdjustments:generateShrinkageNumber'),
  },
  credits: {
    list: () => ipcRenderer.invoke('credits:list'),
    create: (credit: any) => ipcRenderer.invoke('credits:create', credit),
    update: (id: number, credit: any) =>
      ipcRenderer.invoke('credits:update', id, credit),
    remove: (id: number) => ipcRenderer.invoke('credits:remove', id),
    getById: (id: number) => ipcRenderer.invoke('credits:getById', id),
    addPayment: (creditId: number, paymentData: any) =>
      ipcRenderer.invoke('credits:addPayment', creditId, paymentData),
    cancel: (id: number) => ipcRenderer.invoke('credits:cancel', id),
    generateCreditNumber: () =>
      ipcRenderer.invoke('credits:generateCreditNumber'),
    generatePaymentNumber: () =>
      ipcRenderer.invoke('credits:generatePaymentNumber'),
    getOverdueCredits: () => ipcRenderer.invoke('credits:getOverdueCredits'),
    getByCustomer: (customerId: number) =>
      ipcRenderer.invoke('credits:getByCustomer', customerId),
    getCreditsStats: (dateFrom?: Date, dateTo?: Date) =>
      ipcRenderer.invoke('credits:getCreditsStats', dateFrom, dateTo),
    calculateLateFees: (creditId: number) =>
      ipcRenderer.invoke('credits:calculateLateFees', creditId),
    getActiveCredits: () => ipcRenderer.invoke('credits:getActiveCredits'),
    getPartialCredits: () => ipcRenderer.invoke('credits:getPartialCredits'),
  },
  expenses: {
    list: () => ipcRenderer.invoke('expenses:list'),
    create: (expense: any) => ipcRenderer.invoke('expenses:create', expense),
    update: (id: number, expense: any) =>
      ipcRenderer.invoke('expenses:update', id, expense),
    remove: (id: number) => ipcRenderer.invoke('expenses:remove', id),
    getById: (id: number) => ipcRenderer.invoke('expenses:getById', id),
    approve: (id: number, approvedBy?: string) =>
      ipcRenderer.invoke('expenses:approve', id, approvedBy),
    generateExpenseNumber: () =>
      ipcRenderer.invoke('expenses:generateExpenseNumber'),
    getExpensesStats: (dateFrom?: Date, dateTo?: Date) =>
      ipcRenderer.invoke('expenses:getExpensesStats', dateFrom, dateTo),
    getNeedingApproval: () => ipcRenderer.invoke('expenses:getNeedingApproval'),
    getRecurringDue: () => ipcRenderer.invoke('expenses:getRecurringDue'),
    getPendingExpenses: () => ipcRenderer.invoke('expenses:getPendingExpenses'),
    getPaidExpenses: () => ipcRenderer.invoke('expenses:getPaidExpenses'),
  },
  expenseCategories: {
    list: () => ipcRenderer.invoke('expenseCategories:list'),
    create: (category: any) =>
      ipcRenderer.invoke('expenseCategories:create', category),
    update: (id: number, category: any) =>
      ipcRenderer.invoke('expenseCategories:update', id, category),
    remove: (id: number) => ipcRenderer.invoke('expenseCategories:remove', id),
    getById: (id: number) =>
      ipcRenderer.invoke('expenseCategories:getById', id),
    getActiveForSelection: () =>
      ipcRenderer.invoke('expenseCategories:getActiveForSelection'),
    getCogsCategories: () =>
      ipcRenderer.invoke('expenseCategories:getCogsCategories'),
    getNonCogsCategories: () =>
      ipcRenderer.invoke('expenseCategories:getNonCogsCategories'),
  },
  reports: {
    getSalesReport: (filters: any) =>
      ipcRenderer.invoke('reports:getSalesReport', filters),
    getInventoryReport: (filters: any) =>
      ipcRenderer.invoke('reports:getInventoryReport', filters),
    getCustomersReport: (filters: any) =>
      ipcRenderer.invoke('reports:getCustomersReport', filters),
    getProfitsReport: (filters: any) =>
      ipcRenderer.invoke('reports:getProfitsReport', filters),
    getDashboardMetrics: (period?: string) =>
      ipcRenderer.invoke('reports:getDashboardMetrics', period),
    getTopProducts: (filters: any) =>
      ipcRenderer.invoke('reports:getTopProducts', filters),
    exportData: (reportType: string, filters: any) =>
      ipcRenderer.invoke('reports:exportData', reportType, filters),
  },
})

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) =>
      ipcRenderer.invoke(channel, ...args),
    on: (channel: string, func: (...args: any[]) => void) =>
      ipcRenderer.on(channel, func),
    removeAllListeners: (channel: string) =>
      ipcRenderer.removeAllListeners(channel),
  },
})

contextBridge.exposeInMainWorld('images', {
  saveProductImage: async (file: File) =>
    ipcRenderer.invoke(
      'save-product-image',
      Buffer.from(
        new Uint8Array(file.arrayBuffer ? await file.arrayBuffer() : [])
      )
    ),
  getProductImagePath: (filename: string) =>
    ipcRenderer.invoke('get-product-image-path', filename),
  deleteProductImage: (filename: string) =>
    ipcRenderer.invoke('delete-product-image', filename),
})
