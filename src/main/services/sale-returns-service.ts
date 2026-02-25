import type { InsertInventoryMovement } from '../db/schema/inventory-movements'
import { SalesRepository } from '../repositories/sales-repository'
import { SaleReturnsRepository } from '../repositories/sale-returns-repository'
import { InventoryBatchesRepository } from '../repositories/inventory-batches-repository'
import { InventoryMovementsRepository } from '../repositories/inventory-movements-repository'
import { InventoryAdjustmentsRepository } from '../repositories/inventory-adjustments-repository'
import { CashSessionsService } from './cash-sessions-service'
import { InventoryAdjustmentsService } from './inventory-adjustments-service'

export interface ProcessReturnItem {
  saleItemId: number
  quantityReturned: number
  condition: 'good' | 'damaged'
  /** Motivo de merma cuando condition = 'damaged' */
  shrinkageReason?: string
}

export interface ProcessExchangeItem {
  presentationId: number
  batchId: number
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ProcessReturnData {
  saleId: number
  returnItems: ProcessReturnItem[]
  type: 'refund' | 'exchange'
  exchangeItems?: ProcessExchangeItem[]
  notes?: string
  createdBy?: string
}

export const SaleReturnsService = {
  async processReturn(data: ProcessReturnData) {
    const sale = await SalesRepository.findById(data.saleId)
    if (!sale) {
      throw new Error('Venta no encontrada')
    }
    if (sale.status !== 'completed') {
      throw new Error('Solo se pueden devolver productos de ventas completadas')
    }

    const saleItems = sale.items || []
    if (saleItems.length === 0) {
      throw new Error('La venta no tiene ítems')
    }

    const saleItemMap = new Map(saleItems.map(item => [item.id, item]))

    let totalReturnedValue = 0
    const returnItemsToInsert: Array<{
      saleItemId: number
      quantityReturned: number
      condition: 'good' | 'damaged'
      adjustmentId?: number
      notes?: string
    }> = []

    for (const ri of data.returnItems) {
      const saleItem = saleItemMap.get(ri.saleItemId)
      if (!saleItem) {
        throw new Error(
          `Ítem de venta ${ri.saleItemId} no pertenece a esta venta`
        )
      }
      if (ri.quantityReturned <= 0) {
        throw new Error(
          `Cantidad devuelta debe ser positiva para ${saleItem.productName}`
        )
      }
      if (ri.quantityReturned > saleItem.quantity) {
        throw new Error(
          `No se puede devolver más de ${saleItem.quantity} unidades de ${saleItem.productName}`
        )
      }
      if (ri.condition === 'damaged' && !ri.shrinkageReason?.trim()) {
        throw new Error(
          `Debe indicar el motivo de merma para ${saleItem.productName} (producto dañado)`
        )
      }

      const proportionalTotal = Math.round(
        (saleItem.totalPrice * ri.quantityReturned) / saleItem.quantity
      )
      totalReturnedValue += proportionalTotal

      if (ri.condition === 'damaged') {
        const batch = await InventoryBatchesRepository.findById(saleItem.batchId)
        if (!batch) {
          throw new Error('Lote no encontrado')
        }
        const unitCost = batch.unitCost
        const quantityChange = -ri.quantityReturned
        const costImpact = quantityChange * unitCost

        const adjustmentNumber =
          await InventoryAdjustmentsRepository.generateAdjustmentNumber(
            'shrinkage'
          )
        const reasonText = (ri.shrinkageReason ?? '').trim()
        const adjustment = await InventoryAdjustmentsRepository.create({
          adjustment: {
            adjustmentNumber,
            type: 'shrinkage',
            reason: reasonText,
            totalCostImpact: costImpact,
            totalValueImpact: Math.abs(costImpact),
            createdBy: data.createdBy || 'sistema',
            status: 'draft',
          },
          items: [
            {
              batchId: saleItem.batchId,
              productId: batch.productId,
              quantityChange,
              unitCost,
              costImpact,
              itemReason: reasonText,
            },
          ],
        })
        await InventoryAdjustmentsService.approve(
          adjustment.id,
          data.createdBy || 'sistema'
        )

        returnItemsToInsert.push({
          saleItemId: ri.saleItemId,
          quantityReturned: ri.quantityReturned,
          condition: 'damaged',
          adjustmentId: adjustment.id,
          notes: reasonText,
        })
      } else {
        returnItemsToInsert.push({
          saleItemId: ri.saleItemId,
          quantityReturned: ri.quantityReturned,
          condition: 'good',
        })
      }
    }

    let totalExchangeValue = 0
    const exchangeItemsToInsert: ProcessExchangeItem[] = []

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
        totalExchangeValue += ex.totalPrice
        exchangeItemsToInsert.push(ex)
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
      // No hay sesión abierta; la devolución se registra igual
    }

    const returnNumber = await SaleReturnsRepository.generateReturnNumber()

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
        reason: 'Devolución',
        referenceType: 'sale_return',
        referenceId: saleReturn.id,
      }
      await InventoryMovementsRepository.create(movementData)
    }

    for (const ex of exchangeItemsToInsert) {
      const batch = await InventoryBatchesRepository.findById(ex.batchId)
      if (!batch) continue
      await InventoryBatchesRepository.updateQuantity(ex.batchId, -ex.quantity)
      const movementData: InsertInventoryMovement = {
        productId: batch.productId,
        batchId: ex.batchId,
        type: 'OUT',
        quantity: -ex.quantity,
        reason: 'Devolución - producto a cambio',
        referenceType: 'sale_return',
        referenceId: saleReturn.id,
      }
      await InventoryMovementsRepository.create(movementData)
    }

    return {
      return: saleReturn,
      returnDetails: await SaleReturnsRepository.findById(saleReturn.id),
    }
  },

  async list(filters: Parameters<typeof SaleReturnsRepository.findAll>[0]) {
    return SaleReturnsRepository.findAll(filters)
  },

  async getById(id: number) {
    const r = await SaleReturnsRepository.findById(id)
    if (!r) {
      throw new Error('Devolución no encontrada')
    }
    return r
  },

  async getBySaleId(saleId: number) {
    return SaleReturnsRepository.findBySaleId(saleId)
  },

  getTotalRefunded: SaleReturnsRepository.getTotalRefunded,
}
