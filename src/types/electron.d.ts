import { Category } from '@/features/categories/model/category-schema'

import { Product } from '@/features/products/model/product-schema'

// Global types for all modules
declare global {
  // Supplier types
  interface Supplier {
    id: number
    name: string
    companyName?: string
    contactPerson?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    taxId?: string
    paymentTerms: number
    creditLimit: number
    currentBalance: number
    bankName?: string
    bankAccount?: string
    notes?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    deleted: boolean
  }

  interface SupplierFormData {
    name: string
    companyName?: string
    contactPerson?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    taxId?: string
    paymentTerms: number
    creditLimit: number
    bankName?: string
    bankAccount?: string
    notes?: string
    isActive: boolean
  }

  // Purchase Order types
  interface PurchaseOrder {
    id: number
    orderNumber: string
    supplierId: number
    supplier?: Supplier
    status: 'draft' | 'sent' | 'partial' | 'completed' | 'cancelled'
    orderDate: Date
    expectedDeliveryDate?: Date
    subtotal: number
    taxAmount: number
    discountAmount: number
    shippingAmount: number
    total: number
    notes?: string
    internalNotes?: string
    createdBy: string
    sentAt?: Date
    completedAt?: Date
    createdAt: Date
    updatedAt: Date
    deleted: boolean
    items?: PurchaseOrderItem[]
  }

  interface PurchaseOrderItem {
    id: number
    purchaseOrderId: number
    productId: number
    productName: string
    quantity: number
    unitCost: number
    totalCost: number
    receivedQuantity: number
    notes?: string
  }

  interface PurchaseOrderFormData {
    orderNumber: string
    supplierId: number
    status: 'draft' | 'sent' | 'partial' | 'completed' | 'cancelled'
    expectedDeliveryDate?: Date
    items: PurchaseOrderItemFormData[]
    subtotal: number
    taxAmount: number
    discountAmount: number
    shippingAmount: number
    total: number
    notes?: string
    internalNotes?: string
  }

  interface PurchaseOrderItemFormData {
    productId: number
    productName: string
    quantity: number
    unitCost: number
    totalCost: number
    notes?: string
  }

  // Inventory Adjustment types
  interface InventoryAdjustment {
    id: number
    adjustmentNumber: string
    type: 'adjustment' | 'shrinkage'
    reason: string
    totalCostImpact: number
    totalValueImpact: number
    notes?: string
    createdBy: string
    approvedBy?: string
    status: 'draft' | 'approved' | 'cancelled'
    approvedAt?: Date
    createdAt: Date
    updatedAt: Date
    deleted: boolean
    items?: InventoryAdjustmentItem[]
  }

  interface InventoryAdjustmentItem {
    id: number
    adjustmentId: number
    batchId: number
    batch?: InventoryBatch
    productId: number
    product?: Product
    quantityChange: number
    unitCost: number
    costImpact: number
    itemReason?: string
    notes?: string
    createdAt: Date
  }

  interface InventoryAdjustmentFormData {
    adjustmentNumber: string
    type: 'adjustment' | 'shrinkage'
    reason: string
    items: InventoryAdjustmentItemFormData[]
    totalCostImpact: number
    totalValueImpact: number
    notes?: string
  }

  interface InventoryAdjustmentItemFormData {
    batchId: number
    productId: number
    productName: string
    batchNumber: string
    currentStock: number
    quantityChange: number
    unitCost: number
    costImpact: number
    itemReason?: string
    notes?: string
  }

  // Inventory Batch types (if not already defined)
  interface InventoryBatch {
    id: number
    productId: number
    product?: Product
    batchNumber: string
    currentStock: number
    unitCost: number
    expirationDate?: Date
    createdAt: Date
    updatedAt: Date
  }
}

import {
  AddStockDTO,
  AdjustStockDTO,
  ConsumeProductDTO,
  InventoryBatchDTO,
  InventoryBatchFilters,
  InventoryMovementDTO,
  InventoryMovementFilters,
} from 'main/domains/inventory/inventory-model'
import {
  NewProductDTO,
  ProductDTO,
  UpdateProductDTO,
} from 'main/domains/products/products-model'
import { PaginatedResult } from 'shared/types/pagination'
import {
  NewPresentationDTO,
  PresentationDTO,
} from 'main/domains/presentations/presentations-model'
import { PresentationsListFilters } from '../shared/types/presentations'
import { CustomersFilters } from 'main/repositories/customers-repository'
import { CashRegistersFilters } from 'main/repositories/cash-registers-repository'
import { CashSessionsFilters } from 'main/repositories/cash-sessions-repository'
import { POSFilters, POSPresentation } from 'main/repositories/pos-repository'
import {
  SalesFilters,
  CreateSaleData,
} from 'main/repositories/sales-repository'
import { ProductsListFilters } from '../main/domains/products/products-list-filters'

export {}

declare global {
  interface Window {
    api: {
      products: {
        list: (
          filters?: ProductsListFilters
        ) => Promise<PaginatedResult<ProductDTO>>
        create: (product: NewProductDTO) => Promise<void>
        update: (
          id: Product['id'],
          product: UpdateProductDTO
        ) => Promise<Product>
        remove: (id: Product['id']) => Promise<void>
        toggle: (id: Product['id']) => Promise<void>
      }
      presentations: {
        list: (
          filters: PresentationsListFilters
        ) => Promise<PaginatedResult<PresentationDTO>>
        listByProduct: (productId: Product['id']) => Promise<PresentationDTO[]>
        create: (presentation: NewPresentationDTO) => Promise<PresentationDTO>
        update: (
          id: PresentationDTO['id'],
          presentation: Partial<NewPresentationDTO>
        ) => Promise<PresentationDTO>
        toggle: (id: PresentationDTO['id']) => Promise<void>
        delete: (id: PresentationDTO['id']) => Promise<void>
      }
      categories: {
        list: () => Promise<Category[]>
        create: (category: CategoryFormData) => Promise<Category>
        update: (
          id: Category['id'],
          category: Partial<Category>
        ) => Promise<Category>
        remove: (id: Category['id']) => Promise<void>
      }
      inventory: {
        addStock: (data: AddStockDTO) => Promise<void>
        consume: (
          data: ConsumeProductDTO
        ) => Promise<{ ok: boolean; error?: string }>
        adjustStock: (data: AdjustStockDTO) => Promise<void>
        getAvailableStock: (productId: Product['id']) => Promise<number>
        listBatches: (
          filters: InventoryBatchFilters
        ) => Promise<PaginatedResult<InventoryBatchDTO>>
        listMovements: (
          filters: InventoryMovementFilters
        ) => Promise<PaginatedResult<InventoryMovementDTO>>
      }
      customers: {
        list: (filters: CustomersFilters) => Promise<any>
        getById: (id: number) => Promise<any>
        getByDocument: (document: string) => Promise<any>
        create: (customer: any) => Promise<any>
        update: (id: number, customer: any) => Promise<any>
        remove: (id: number) => Promise<void>
        updateBalance: (id: number, newBalance: number) => Promise<void>
        addToBalance: (id: number, amount: number) => Promise<void>
        subtractFromBalance: (id: number, amount: number) => Promise<void>
        getActiveForSelection: () => Promise<any[]>
        getWithOutstandingBalance: () => Promise<any[]>
        canExtendCredit: (id: number, amount: number) => Promise<boolean>
      }
      cashRegisters: {
        list: (filters: CashRegistersFilters) => Promise<any>
        getById: (id: number) => Promise<any>
        create: (cashRegister: any) => Promise<any>
        update: (id: number, cashRegister: any) => Promise<any>
        remove: (id: number) => Promise<void>
        activate: (id: number) => Promise<void>
        deactivate: (id: number) => Promise<void>
        getActiveForSelection: () => Promise<any[]>
      }
      cashSessions: {
        list: (filters: CashSessionsFilters) => Promise<any>
        getById: (id: number) => Promise<any>
        openSession: (input: any) => Promise<any>
        closeSession: (id: number, input: any) => Promise<any>
        getCurrentOpenSession: () => Promise<any>
        getOpenSessionForRegister: (cashRegisterId: number) => Promise<any>
        getSessionSummary: (id: number) => Promise<any>
        updateSessionNotes: (id: number, notes: string) => Promise<void>
        validateCanMakeSale: () => Promise<any>
        getSessionsNeedingClosure: () => Promise<any[]>
        getSessionStats: (filters: any) => Promise<any>
      }
      pos: {
        getAvailablePresentations: (
          filters: POSFilters
        ) => Promise<PaginatedResult<POSPresentation>>
        getPresentationWithBatches: (presentationId: number) => Promise<any>
        searchByCode: (code: string) => Promise<any>
        getCategories: () => Promise<any[]>
        createSale: (input: any) => Promise<any>
        calculateTotals: (items: any[], taxRate?: number) => Promise<any>
        calculateChange: (payments: any[]) => Promise<number>
        getRecentSales: (limit?: number) => Promise<any[]>
        getLowStockPresentations: (threshold?: number) => Promise<any[]>
        getExpiringPresentations: (daysFromNow?: number) => Promise<any[]>
        validateBarcode: (barcode: string) => Promise<boolean>
        quickSearch: (query: string, limit?: number) => Promise<any[]>
      }
      sales: {
        list: (filters: SalesFilters) => Promise<any>
        getById: (id: number) => Promise<any>
        create: (data: CreateSaleData) => Promise<any>
        update: (id: number, data: any) => Promise<any>
        cancel: (id: number, reason?: string) => Promise<any>
        refund: (id: number, reason?: string) => Promise<any>
        delete: (id: number) => Promise<void>
        getSalesForSession: (sessionId: number) => Promise<any>
        getDailySales: (date: Date) => Promise<any>
        getTopSellingProducts: (
          limit?: number,
          dateFrom?: Date,
          dateTo?: Date
        ) => Promise<any[]>
        getSalesSummary: (filters: any) => Promise<any>
        getRecentSales: (limit?: number) => Promise<any[]>
        calculateSaleTotals: (items: any[], taxRate?: number) => Promise<any>
        calculateChange: (payments: any[]) => Promise<number>
      }
      suppliers: {
        list: () => Promise<Supplier[]>
        create: (supplier: SupplierFormData) => Promise<Supplier>
        update: (
          id: number,
          supplier: Partial<SupplierFormData>
        ) => Promise<Supplier>
        remove: (id: number) => Promise<void>
        getById: (id: number) => Promise<Supplier>
        getActiveSuppliers: () => Promise<Supplier[]>
      }
      purchaseOrders: {
        list: () => Promise<PurchaseOrder[]>
        create: (order: PurchaseOrderFormData) => Promise<PurchaseOrder>
        update: (
          id: number,
          order: Partial<PurchaseOrderFormData>
        ) => Promise<PurchaseOrder>
        remove: (id: number) => Promise<void>
        getById: (id: number) => Promise<PurchaseOrder>
        getBySupplier: (supplierId: number) => Promise<PurchaseOrder[]>
        updateStatus: (
          id: number,
          status: PurchaseOrder['status']
        ) => Promise<void>
        generateOrderNumber: () => Promise<string>
        sendToSupplier: (id: number) => Promise<void>
        markAsCompleted: (id: number) => Promise<void>
        cancel: (id: number, reason?: string) => Promise<void>
      }
      inventoryAdjustments: {
        list: () => Promise<InventoryAdjustment[]>
        create: (
          adjustment: InventoryAdjustmentFormData
        ) => Promise<InventoryAdjustment>
        update: (
          id: number,
          adjustment: Partial<InventoryAdjustmentFormData>
        ) => Promise<InventoryAdjustment>
        remove: (id: number) => Promise<void>
        getById: (id: number) => Promise<InventoryAdjustment>
        approve: (id: number) => Promise<void>
        cancel: (id: number) => Promise<void>
        generateAdjustmentNumber: () => Promise<string>
        getAvailableBatches: (productId?: number) => Promise<InventoryBatch[]>
        getBatchInfo: (batchId: number) => Promise<InventoryBatch>
      }
    }
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>
        on: (channel: string, func: (...args: any[]) => void) => void
        removeAllListeners: (channel: string) => void
      }
    }
    images: {
      saveProductImage: (file: File) => Promise<{ filename: string }>
      deleteProductImage: (filename: string) => Promise<void>
      getProductImagePath: (filename: string) => Promise<string>
    }
  }
}
