import type { InsertInventoryMovement } from '../db/schema/inventory-movements'
import {
  type CreateSaleData,
  SalesRepository,
} from '../repositories/sales-repository'
import { SaleReturnsRepository } from '../repositories/sale-returns-repository'
import { InventoryBatchesRepository } from '../repositories/inventory-batches-repository'
import { InventoryMovementsRepository } from '../repositories/inventory-movements-repository'
import { CashSessionsService } from './cash-sessions-service'

export interface ProcessReturnItem {
  saleItemId: number
  quantityReturned: number
  condition: 'good' | 'damaged'
  shrinkageReason?: string
}

export interface ProcessExchangeItem {
  presentationId: number
  batchId: number
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface ResolvedExchangeLine extends ProcessExchangeItem {
  coveredQty: number
  coveredValue: number
  additionalQty: number
  additionalValue: number
}

export interface ProcessReturnData {
  saleId: number
  returnItems: ProcessReturnItem[]
  type: 'refund' | 'exchange'
  exchangeItems?: ProcessExchangeItem[]
  notes?: string
  createdBy?: string
}

const prorate = (total: number, qty: number, baseQty: number) =>
  Math.round((total * qty) / baseQty)

export const SaleReturnsService = {
  async processReturn(data: ProcessReturnData) {
    const sale = await SalesRepository.findById(data.saleId)
    if (!sale) {
      throw new Error('Venta no encontrada')
    }
    if (sale.status !== 'completed') {
      throw new Error('Solo se pueden devolver productos de ventas completadas')
    }
    if (sale.type !== 'SALE') {
      throw new Error('Solo se pueden devolver transacciones de venta (SALE)')
    }

    const saleItems = sale.items || []
    if (saleItems.length === 0) {
      throw new Error('La venta no tiene items')
    }

    const saleItemMap = new Map(saleItems.map(item => [item.id, item]))
    const alreadyReturnedMap =
      await SaleReturnsRepository.getReturnedQuantitiesForSaleItems(
        saleItems.map(item => item.id)
      )

    let totalReturnedValue = 0
    const returnItemsToInsert: Array<{
      saleItemId: number
      quantityReturned: number
      condition: 'good' | 'damaged'
      adjustmentId?: number
      notes?: string
    }> = []
    const refundSaleItems: CreateSaleData['items'] = []
    const returnedQtyByPresentation = new Map<number, number>()

    for (const ri of data.returnItems) {
      const saleItem = saleItemMap.get(ri.saleItemId)
      if (!saleItem) {
        throw new Error(
          `Item de venta ${ri.saleItemId} no pertenece a esta venta`
        )
      }
      if (ri.quantityReturned <= 0) {
        throw new Error(
          `Cantidad devuelta debe ser positiva para ${saleItem.productName}`
        )
      }

      const alreadyReturned = alreadyReturnedMap.get(ri.saleItemId) ?? 0
      const maxReturnable = saleItem.quantity - alreadyReturned

      if (maxReturnable <= 0) {
        throw new Error(
          `El item ${saleItem.productName} ya fue devuelto completamente`
        )
      }

      if (ri.quantityReturned > maxReturnable) {
        throw new Error(
          `No se puede devolver mas de ${maxReturnable} unidades de ${saleItem.productName}`
        )
      }
      if (ri.condition === 'damaged' && !ri.shrinkageReason?.trim()) {
        throw new Error(
          `Debe indicar el motivo de merma para ${saleItem.productName} (producto danado)`
        )
      }

      const proportionalTotal = prorate(
        saleItem.totalPrice,
        ri.quantityReturned,
        saleItem.quantity
      )
      const proportionalSubtotal = prorate(
        saleItem.subtotal,
        ri.quantityReturned,
        saleItem.quantity
      )
      const proportionalCostTotal = prorate(
        saleItem.costTotal,
        ri.quantityReturned,
        saleItem.quantity
      )
      const proportionalProfit = prorate(
        saleItem.profit,
        ri.quantityReturned,
        saleItem.quantity
      )

      totalReturnedValue += proportionalTotal

      returnItemsToInsert.push({
        saleItemId: ri.saleItemId,
        quantityReturned: ri.quantityReturned,
        condition: ri.condition,
        notes:
          ri.condition === 'damaged'
            ? (ri.shrinkageReason ?? '').trim()
            : undefined,
      })

      refundSaleItems.push({
        presentationId: saleItem.presentationId,
        batchId: saleItem.batchId,
        quantity: -ri.quantityReturned,
        unitPrice: saleItem.unitPrice,
        unitCost: saleItem.unitCost,
        subtotal: -proportionalSubtotal,
        costTotal: -proportionalCostTotal,
        profit: -proportionalProfit,
        totalPrice: -proportionalTotal,
        discount: 0,
        discountType: saleItem.discountType,
        notes:
          ri.condition === 'damaged'
            ? `Danado: ${(ri.shrinkageReason ?? '').trim()}`
            : 'Devolucion',
      })

      const prevQty = returnedQtyByPresentation.get(saleItem.presentationId) ?? 0
      returnedQtyByPresentation.set(
        saleItem.presentationId,
        prevQty + ri.quantityReturned
      )
    }

    let totalExchangeValue = 0
    let totalAdditionalExchangeValue = 0
    const exchangeItemsToInsert: ProcessExchangeItem[] = []
    const coveredExchangeItems: ResolvedExchangeLine[] = []
    const additionalExchangeItems: ResolvedExchangeLine[] = []
    const exchangeQtyByPresentation = new Map<number, number>()

    if (
      data.type === 'exchange' &&
      data.exchangeItems &&
      data.exchangeItems.length > 0
    ) {
      for (const ex of data.exchangeItems) {
        if (ex.quantity <= 0 || ex.unitPrice < 0 || ex.totalPrice < 0) {
          throw new Error(
            'Cantidad y precios de productos a cambio deben ser positivos'
          )
        }
        const batch = await InventoryBatchesRepository.findById(ex.batchId)
        if (!batch) {
          throw new Error('Lote no encontrado')
        }
        if (batch.quantityAvailable < ex.quantity) {
          throw new Error(
            `Stock insuficiente en lote: disponible ${batch.quantityAvailable}, solicitado ${ex.quantity}`
          )
        }

        const maxCoveredForPresentation =
          returnedQtyByPresentation.get(ex.presentationId) ?? 0

        const alreadyCoveredForPresentation =
          exchangeQtyByPresentation.get(ex.presentationId) ?? 0
        const remainingCoverForPresentation = Math.max(
          0,
          maxCoveredForPresentation - alreadyCoveredForPresentation
        )
        const coveredQty = Math.min(ex.quantity, remainingCoverForPresentation)
        const additionalQty = ex.quantity - coveredQty
        const coveredValue =
          coveredQty > 0 ? prorate(ex.totalPrice, coveredQty, ex.quantity) : 0
        const additionalValue = ex.totalPrice - coveredValue

        if (coveredQty > 0) {
          exchangeQtyByPresentation.set(
            ex.presentationId,
            alreadyCoveredForPresentation + coveredQty
          )
        }

        const resolvedLine: ResolvedExchangeLine = {
          ...ex,
          coveredQty,
          coveredValue,
          additionalQty,
          additionalValue,
          totalPrice: coveredValue + additionalValue,
        }

        totalExchangeValue += coveredValue
        totalAdditionalExchangeValue += additionalValue
        exchangeItemsToInsert.push(ex)
        if (coveredQty > 0) {
          coveredExchangeItems.push(resolvedLine)
        }
        if (additionalQty > 0) {
          additionalExchangeItems.push(resolvedLine)
        }
      }
    }

    const balanceCents = totalReturnedValue - totalExchangeValue

    let cashSessionId: number | undefined
    try {
      const openSession = await CashSessionsService.getCurrentOpenSession()
      if (openSession) {
        cashSessionId = openSession.id
      }
    } catch {
      // No hay sesion abierta; se usa la sesion de la venta original
    }
    cashSessionId = cashSessionId ?? sale.cashSessionId

    const returnNumber = await SaleReturnsRepository.generateReturnNumber()
    const refundSaleNumber = await SalesRepository.generateSaleNumber()

    const refundSale = await SalesRepository.create({
      sale: {
        saleNumber: refundSaleNumber,
        customerId: sale.customerId,
        cashSessionId: cashSessionId ?? sale.cashSessionId,
        subtotal: -totalReturnedValue,
        taxAmount: 0,
        discountAmount: 0,
        total: -totalReturnedValue,
        type: 'REFUND',
        originalSaleId: sale.id,
        status: 'completed',
        notes:
          data.notes?.trim() ||
          `Refund generado desde devolucion ${returnNumber} de venta ${sale.saleNumber}`,
      },
      items: refundSaleItems,
      payments: [
        {
          method: 'cash',
          amount: -totalReturnedValue,
          notes: `Reembolso de venta ${sale.saleNumber}`,
        },
      ],
    })

    let exchangeSaleId: number | undefined
    if (coveredExchangeItems.length > 0) {
      const exchangeSaleNumber = await SalesRepository.generateSaleNumber()
      const exchangeSaleItems: CreateSaleData['items'] = []

      for (const ex of coveredExchangeItems) {
        const batch = await InventoryBatchesRepository.findById(ex.batchId)
        if (!batch) {
          throw new Error('Lote no encontrado')
        }
        exchangeSaleItems.push({
          presentationId: ex.presentationId,
          batchId: ex.batchId,
          quantity: ex.coveredQty,
          unitPrice: ex.unitPrice,
          unitCost: batch.unitCost,
          subtotal: ex.coveredValue,
          costTotal: ex.coveredQty * batch.unitCost,
          profit: ex.coveredValue - ex.coveredQty * batch.unitCost,
          totalPrice: ex.coveredValue,
          discount: 0,
          discountType: 'fixed',
          notes: `Cambio asociado a devolucion ${returnNumber}`,
        })
      }

      const exchangeSale = await SalesRepository.create({
        sale: {
          saleNumber: exchangeSaleNumber,
          customerId: sale.customerId,
          cashSessionId: cashSessionId ?? sale.cashSessionId,
          subtotal: totalExchangeValue,
          taxAmount: 0,
          discountAmount: 0,
          total: totalExchangeValue,
          type: 'SALE',
          originalSaleId: sale.id,
          status: 'completed',
          notes: `Venta por cambio de devolucion ${returnNumber} (venta original ${sale.saleNumber})`,
        },
        items: exchangeSaleItems,
        payments: [
          {
            method: 'cash',
            amount: totalExchangeValue,
            notes: `Cambio asociado a devolucion ${returnNumber}`,
          },
        ],
      })
      exchangeSaleId = exchangeSale.id
    }

    let additionalSaleId: number | undefined
    if (additionalExchangeItems.length > 0) {
      const additionalSaleNumber = await SalesRepository.generateSaleNumber()
      const additionalSaleItems: CreateSaleData['items'] = []

      for (const ex of additionalExchangeItems) {
        const batch = await InventoryBatchesRepository.findById(ex.batchId)
        if (!batch) {
          throw new Error('Lote no encontrado')
        }
        additionalSaleItems.push({
          presentationId: ex.presentationId,
          batchId: ex.batchId,
          quantity: ex.additionalQty,
          unitPrice: ex.unitPrice,
          unitCost: batch.unitCost,
          subtotal: ex.additionalValue,
          costTotal: ex.additionalQty * batch.unitCost,
          profit: ex.additionalValue - ex.additionalQty * batch.unitCost,
          totalPrice: ex.additionalValue,
          discount: 0,
          discountType: 'fixed',
          notes: `Venta adicional por cambio ${returnNumber}`,
        })
      }

      const additionalSale = await SalesRepository.create({
        sale: {
          saleNumber: additionalSaleNumber,
          customerId: sale.customerId,
          cashSessionId: cashSessionId ?? sale.cashSessionId,
          subtotal: totalAdditionalExchangeValue,
          taxAmount: 0,
          discountAmount: 0,
          total: totalAdditionalExchangeValue,
          type: 'SALE',
          originalSaleId: sale.id,
          status: 'completed',
          notes: `Venta adicional por devolucion ${returnNumber} (venta original ${sale.saleNumber})`,
        },
        items: additionalSaleItems,
        payments: [
          {
            method: 'cash',
            amount: totalAdditionalExchangeValue,
            notes: `Productos adicionales de devolucion ${returnNumber}`,
          },
        ],
      })
      additionalSaleId = additionalSale.id
    }

    const saleReturn = await SaleReturnsRepository.create({
      return: {
        returnNumber,
        saleId: data.saleId,
        cashSessionId: cashSessionId ?? undefined,
        type: data.type,
        totalReturnedValue,
        totalExchangeValue,
        balanceCents,
        notes: data.notes?.trim() || undefined,
      },
      returnItems: returnItemsToInsert.map(item => ({
        saleItemId: item.saleItemId,
        quantityReturned: item.quantityReturned,
        condition: item.condition,
        adjustmentId: item.adjustmentId,
        notes: item.notes,
      })),
      exchangeItems:
        exchangeItemsToInsert.length > 0
          ? exchangeItemsToInsert.map(item => ({
              presentationId: item.presentationId,
              batchId: item.batchId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            }))
          : undefined,
    })

    for (const ri of data.returnItems) {
      if (ri.condition !== 'good') continue
      const saleItem = saleItemMap.get(ri.saleItemId)
      if (!saleItem) continue
      const batch = await InventoryBatchesRepository.findById(saleItem.batchId)
      if (!batch) continue
      await InventoryBatchesRepository.updateQuantity(
        saleItem.batchId,
        ri.quantityReturned
      )
      const movementData: InsertInventoryMovement = {
        productId: batch.productId,
        batchId: saleItem.batchId,
        type: 'IN',
        quantity: ri.quantityReturned,
        reason: 'Refund',
        referenceType: 'sale',
        referenceId: refundSale.id,
      }
      await InventoryMovementsRepository.create(movementData)
    }

    for (const ex of coveredExchangeItems) {
      const batch = await InventoryBatchesRepository.findById(ex.batchId)
      if (!batch) continue
      await InventoryBatchesRepository.updateQuantity(ex.batchId, -ex.coveredQty)
      const movementData: InsertInventoryMovement = {
        productId: batch.productId,
        batchId: ex.batchId,
        type: 'OUT',
        quantity: -ex.coveredQty,
        reason: 'Sale exchange',
        referenceType: 'sale',
        referenceId: exchangeSaleId,
      }
      await InventoryMovementsRepository.create(movementData)
    }

    for (const ex of additionalExchangeItems) {
      const batch = await InventoryBatchesRepository.findById(ex.batchId)
      if (!batch) continue
      await InventoryBatchesRepository.updateQuantity(ex.batchId, -ex.additionalQty)
      const movementData: InsertInventoryMovement = {
        productId: batch.productId,
        batchId: ex.batchId,
        type: 'OUT',
        quantity: -ex.additionalQty,
        reason: 'Sale additional exchange',
        referenceType: 'sale',
        referenceId: additionalSaleId,
      }
      await InventoryMovementsRepository.create(movementData)
    }

    return {
      return: saleReturn,
      returnDetails: await SaleReturnsRepository.findById(saleReturn.id),
      refundSaleId: refundSale.id,
      exchangeSaleId,
      additionalSaleId,
    }
  },

  async list(filters: Parameters<typeof SaleReturnsRepository.findAll>[0]) {
    return SaleReturnsRepository.findAll(filters)
  },

  async getById(id: number) {
    const r = await SaleReturnsRepository.findById(id)
    if (!r) {
      throw new Error('Devolucion no encontrada')
    }
    return r
  },

  async getBySaleId(saleId: number) {
    return SaleReturnsRepository.findBySaleId(saleId)
  },

  getTotalRefunded: SaleReturnsRepository.getTotalRefunded,
}
