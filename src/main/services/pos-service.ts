import {
  fromUnitPrecision,
  normalizeUnitPrecision,
} from '../../shared/utils/quantity'
import type { InsertInventoryMovement } from '../db/schema/inventory-movements'
import { CreditsRepository } from '../repositories/credits-repository'
import { InventoryBatchesRepository } from '../repositories/inventory-batches-repository'
import { InventoryMovementsRepository } from '../repositories/inventory-movements-repository'
import { POSRepository } from '../repositories/pos-repository'
import {
  type CreateSaleData,
  SalesRepository,
} from '../repositories/sales-repository'
import { CashSessionsService } from './cash-sessions-service'
import { CustomersService } from './customers-service'

export interface POSSaleItem {
  presentationId: number
  quantity: number
  unitPrice: number
  discount?: number
  discountType?: 'fixed' | 'percentage'
  notes?: string
}

export interface POSPayment {
  method: 'cash' | 'credit'
  amount: number
  receivedAmount?: number
  changeAmount?: number
  referenceNumber?: string
  authorizationCode?: string
  details?: string
  notes?: string
}

export interface CreatePOSSaleInput {
  customerId?: number
  items: POSSaleItem[]
  payments: POSPayment[]
  subtotal: number
  taxAmount?: number
  discountAmount?: number
  total: number
  notes?: string
}

const roundUpToLempiraCents = (value: number) => {
  if (!Number.isFinite(value)) return 0
  return Math.ceil(Math.max(0, value) / 100) * 100
}

export const POSService = {
  async getAvailablePresentations(filters = {}) {
    return POSRepository.getAvailablePresentations(filters)
  },

  async getPresentationWithBatches(presentationId: number) {
    if (!Number.isInteger(presentationId)) {
      throw new Error('Invalid presentation id')
    }

    const presentation =
      await POSRepository.getPresentationWithBatches(presentationId)
    if (!presentation) {
      throw new Error('Presentation not found or not available')
    }

    return presentation
  },

  async searchByCode(code: string) {
    if (!code?.trim()) {
      throw new Error('Search code is required')
    }

    return POSRepository.searchByCode(code.trim())
  },

  async getCategories() {
    return POSRepository.getCategories()
  },

  async validateSaleItems(items: POSSaleItem[]) {
    if (!items || items.length === 0) {
      throw new Error('La venta debe tener al menos un producto')
    }

    const validationResults = []

    for (const item of items) {
      if (!Number.isInteger(item.presentationId)) {
        throw new Error('ID de producto no válido')
      }

      if (item.quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0')
      }
      if (!Number.isInteger(item.quantity)) {
        throw new Error('La cantidad debe viajar en enteros por unitPrecision')
      }

      if (item.unitPrice < 0) {
        throw new Error('El precio del producto no puede ser negativo')
      }

      const presentation = await POSRepository.getPresentationWithBatches(
        item.presentationId
      )
      if (!presentation) {
        throw new Error(
          `El producto con ID ${item.presentationId} no está disponible`
        )
      }

      const presentationPrecision = normalizeUnitPrecision(
        presentation.unitPrecision
      )
      const baseFactorRaw =
        presentation.factorType === 'fixed'
          ? Math.max(1, presentation.factor ?? presentationPrecision)
          : presentationPrecision
      const baseFactor =
        presentation.isBase && baseFactorRaw < presentationPrecision
          ? presentationPrecision
          : baseFactorRaw
      const requiredInventoryQuantity = Math.round(
        (item.quantity * baseFactor) / presentationPrecision
      )

      if (requiredInventoryQuantity <= 0) {
        throw new Error(
          'La cantidad convertida a inventario debe ser mayor a 0'
        )
      }

      const allocation = await POSRepository.getFEFOAllocation(
        presentation.productId,
        requiredInventoryQuantity
      )

      const displayName = presentation.isBase
        ? presentation.productName
        : `${presentation.productName} (${presentation.name})`

      if (!allocation.isFullyAllocated) {
        throw new Error(
          `No hay suficiente stock para <b>${displayName}</b>. </br>Disponible: <b>${allocation.totalAllocated}</b> </br>Requerido: <b>${requiredInventoryQuantity}</b>`
        )
      }

      validationResults.push({
        item,
        presentation,
        requiredInventoryQuantity,
        allocation,
      })
    }

    return validationResults
  },

  async validatePayments(payments: POSPayment[], total: number) {
    if (!payments || payments.length === 0) {
      throw new Error('La venta debe tener al menos un pago')
    }

    const hasCredits = payments.some(payment => payment.method === 'credit')

    const totalCashPayments = payments.filter(
      payment => payment.method === 'cash'
    )

    if (totalCashPayments.length > 1) {
      throw new Error('La venta solo puede tener un pago en efectivo')
    }

    const totalNonCashReceived = payments
      .filter(payment => payment.method !== 'cash')
      .reduce((acc, payment) => acc + payment.amount, 0)

    if (totalNonCashReceived > total) {
      throw new Error(
        'El monto total de pagos no puede ser mayor al total de la venta'
      )
    }

    const remainingAmount = total - totalNonCashReceived

    const totalCashReceived = Math.min(
      remainingAmount,
      totalCashPayments[0]?.amount || 0
    )

    const totalPaymentAmount = totalCashReceived + totalNonCashReceived

    if (totalPaymentAmount < 0) {
      throw new Error('El monto total de pagos no puede ser negativo')
    }

    if (totalPaymentAmount < total) {
      throw new Error('El monto total de pagos es menor al total de la venta')
    }

    if (totalPaymentAmount > total) {
      throw new Error('El monto total de pagos es mayor al total de la venta')
    }

    return {
      totalPaymentAmount,
      totalCashReceived,
      payments: payments
        .map(payment => {
          if (payment.method === 'cash') {
            return {
              ...payment,
              changeAmount: payment.amount - totalCashReceived,
              receivedAmount: totalCashReceived,
            }
          }

          return payment
        })
        .filter(payment => payment.amount > 0),
      hasCredits,
      isValid: true,
    }
  },

  async createSale(input: CreatePOSSaleInput) {
    const openSession = await CashSessionsService.validateCanMakeSale()

    if (input.subtotal < 0) {
      throw new Error('El subtotal no puede ser negativo')
    }

    if (input.total <= 0) {
      throw new Error('El total debe ser mayor que cero')
    }

    if (input.taxAmount && input.taxAmount < 0) {
      throw new Error('El impuesto no puede ser negativo')
    }

    if (input.discountAmount && input.discountAmount < 0) {
      throw new Error('El descuento no puede ser negativo')
    }

    const itemValidations = await this.validateSaleItems(input.items)

    const { hasCredits, payments } = await this.validatePayments(
      input.payments,
      input.total
    )

    const totalCreditAmount = payments
      .filter(payment => payment.method === 'credit')
      .reduce((acc, payment) => acc + payment.amount, 0)

    let customer: Awaited<ReturnType<typeof CustomersService.getById>> | null =
      null

    if (hasCredits && !input.customerId) {
      throw new Error('No se ha seleccionado un cliente')
    } else if (input.customerId) {
      customer = await CustomersService.getById(input.customerId)

      if (!customer) {
        throw new Error('El cliente no existe')
      }
    }

    if (totalCreditAmount > 0) {
      if (!customer) {
        throw new Error('No se ha seleccionado un cliente')
      }

      const canExtendCredit = await CustomersService.canExtendCredit(
        customer.id,
        totalCreditAmount
      )

      if (!canExtendCredit) {
        const availableCredit = Math.max(
          0,
          customer.creditLimit - customer.currentBalance
        )

        throw new Error(
          `El cliente no tiene crédito disponible suficiente. Disponible: ${availableCredit / 100}, solicitado: ${totalCreditAmount / 100}`
        )
      }
    }

    const saleNumber = await SalesRepository.generateSaleNumber()

    const saleData: CreateSaleData = {
      sale: {
        saleNumber,
        customerId: input.customerId,
        cashSessionId: Number(openSession.id),
        subtotal: input.subtotal,
        taxAmount: input.taxAmount || 0,
        discountAmount: input.discountAmount || 0,
        total: input.total,
        type: 'SALE',
        originalSaleId: undefined,
        status: 'completed',
        notes: input.notes?.trim() || undefined,
      },
      items: [],
      payments,
    }

    for (const validation of itemValidations) {
      const { item, allocation, presentation, requiredInventoryQuantity } =
        validation
      const displayQuantity = fromUnitPrecision(
        item.quantity,
        presentation.unitPrecision
      )
      const shouldRoundUp =
        normalizeUnitPrecision(presentation.unitPrecision) !== 1
      const roundedUnitPrice = shouldRoundUp
        ? roundUpToLempiraCents(item.unitPrice)
        : item.unitPrice
      const totalItemPrice = shouldRoundUp
        ? roundUpToLempiraCents(roundedUnitPrice * displayQuantity)
        : Math.round(roundedUnitPrice * displayQuantity)
      let remainingItemPrice = totalItemPrice

      // For each batch in the allocation, create a sale item
      for (let index = 0; index < allocation.allocation.length; index++) {
        const batchAllocation = allocation.allocation[index]
        const isLastBatch = index === allocation.allocation.length - 1
        const itemTotalPriceRaw = isLastBatch
          ? remainingItemPrice
          : Math.round(
              (totalItemPrice * batchAllocation.quantity) /
                requiredInventoryQuantity
            )
        const itemTotalPrice = shouldRoundUp
          ? roundUpToLempiraCents(itemTotalPriceRaw)
          : itemTotalPriceRaw

        remainingItemPrice = Math.max(0, remainingItemPrice - itemTotalPrice)

        saleData.items.push({
          presentationId: item.presentationId,
          batchId: batchAllocation.batchId,
          quantity: batchAllocation.quantity,
          unitPrice: roundedUnitPrice,
          unitCost: batchAllocation.unitCost,
          subtotal: itemTotalPrice,
          costTotal: batchAllocation.quantity * batchAllocation.unitCost,
          profit:
            itemTotalPrice -
            batchAllocation.quantity * batchAllocation.unitCost,
          totalPrice: itemTotalPrice,
          discount: item.discount || 0,
          discountType: item.discountType,
          notes: item.notes,
        })
      }
    }

    // Create the sale and associated records in a transaction
    const sale = await SalesRepository.create(saleData)

    if (totalCreditAmount > 0 && customer) {
      const creditNumber = await CreditsRepository.generateCreditNumber()

      await CreditsRepository.create({
        credit: {
          creditNumber,
          customerId: customer.id,
          saleId: sale.id,
          type: 'sale_credit',
          amount: totalCreditAmount,
          originalAmount: totalCreditAmount,
          paidAmount: 0,
          remainingAmount: totalCreditAmount,
          status: 'active',
          description: `Crédito generado por venta ${sale.saleNumber}`,
          notes: input.notes?.trim() || undefined,
          createdBy: 'POS',
        },
      })

      await CustomersService.addToBalance(customer.id, totalCreditAmount)
    }

    // Create inventory movements for each item
    for (const validation of itemValidations) {
      const { presentation, allocation } = validation

      for (const batchAllocation of allocation.allocation) {
        // Create inventory movement
        const movementData: InsertInventoryMovement = {
          productId: presentation.productId,
          batchId: batchAllocation.batchId,
          type: 'OUT',
          quantity: -batchAllocation.quantity,
          reason: 'Sale',
          referenceType: 'sale',
          referenceId: sale.id,
        }

        await InventoryMovementsRepository.create(movementData)

        // Update batch quantity
        await InventoryBatchesRepository.updateQuantity(
          batchAllocation.batchId,
          -batchAllocation.quantity
        )
      }
    }

    return {
      sale,
      saleDetails: await SalesRepository.findById(sale.id),
    }
  },

  async calculateTotals(items: POSSaleItem[], taxRate: number = 0) {
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
      const presentation = await POSRepository.getPresentationWithBatches(
        item.presentationId
      )
      const itemQuantity = presentation
        ? fromUnitPrecision(item.quantity, presentation.unitPrecision)
        : item.quantity

      let itemTotal = itemQuantity * item.unitPrice

      // Apply discount if present
      if (item.discount && item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemTotal = itemTotal * (1 - item.discount / 100)
        } else {
          itemTotal = Math.max(0, itemTotal - item.discount)
        }
      }

      subtotal += itemTotal
      totalItems += itemQuantity
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

  async calculateChange(payments: POSPayment[]) {
    const cashPayments = payments.filter(p => p.method === 'cash')

    const totalCashReceived = cashPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    )
    const totalCashAmount = cashPayments.reduce((sum, p) => sum + p.amount, 0)

    return Math.max(0, totalCashReceived - totalCashAmount)
  },

  async getRecentSales(limit: number = 10) {
    return SalesRepository.findAll({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit,
    })
  },

  // Get low stock presentations
  async getLowStockPresentations(threshold: number = 5) {
    const presentations = await POSRepository.getAvailablePresentations({
      limit: 1000,
    })

    return presentations.data.filter(
      presentation => presentation.availableQuantity <= threshold
    )
  },

  // Get presentations expiring soon
  async getExpiringPresentations(daysFromNow: number = 7) {
    const presentations = await POSRepository.getAvailablePresentations({
      limit: 1000,
    })
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow)

    const expiring = []

    for (const presentation of presentations.data) {
      const expiringBatches = presentation.batches.filter(
        batch => batch.expirationDate && batch.expirationDate <= cutoffDate
      )

      if (expiringBatches.length > 0) {
        expiring.push({
          ...presentation,
          expiringBatches,
          totalExpiringQuantity: expiringBatches.reduce(
            (sum, batch) => sum + batch.availableQuantity,
            0
          ),
        })
      }
    }

    return expiring
  },

  // Validate barcode format (basic validation)
  validateBarcode(barcode: string): boolean {
    if (!barcode || typeof barcode !== 'string') {
      return false
    }

    const trimmed = barcode.trim()

    // Basic validation: should be numeric and have reasonable length
    return /^\d{6,18}$/.test(trimmed)
  },

  // Quick search for presentations (for autocomplete)
  async quickSearch(query: string, limit: number = 10) {
    if (!query?.trim() || query.trim().length < 2) {
      return []
    }

    const presentations = await POSRepository.getAvailablePresentations({
      search: query.trim(),
      limit,
    })

    return presentations.data.map(p => ({
      id: p.id,
      name: p.name,
      productName: p.productName,
      barcode: p.barcode,
      sku: p.sku,
      salePrice: p.salePrice,
      availableQuantity: p.availableQuantity,
    }))
  },
}
