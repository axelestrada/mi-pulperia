import { InsertInventoryBatch } from 'main/db/schema/inventory-batches'
import { InsertInventoryMovement } from '../../db/schema/inventory-movements'

export type CreateBatchDTO = Pick<
  InsertInventoryBatch,
  | 'productId'
  | 'supplierId'
  | 'batchCode'
  | 'expirationDate'
  | 'quantityInitial'
  | 'unitCost'
>

export type CreateInventoryMovementDTO = Pick<
  InsertInventoryMovement,
  | 'batchId'
  | 'productId'
  | 'type'
  | 'quantity'
  | 'reason'
  | 'referenceType'
  | 'referenceId'
>

export type ConsumeProductDTO = Pick<
  InsertInventoryMovement,
  'productId' | 'quantity' | 'reason' | 'referenceType' | 'referenceId'
>

export type AddStockDTO = Omit<CreateBatchDTO, 'quantityInitial'> &
  Pick<InsertInventoryMovement, 'referenceType' | 'referenceId'> & {
    quantity: number
  }

export type AdjustStockDTO = Pick<
  InsertInventoryMovement,
  'referenceType' | 'referenceId' | 'reason' | 'batchId' | 'productId'
> & {
  quantityDelta: number
}

export type InventoryBatchFilters = {
  productId?: number
  supplierId?: number
  batchId?: number
  batchCode?: string
  searchTerm?: string

  hasStock?: boolean
  expired?: boolean
  expiresBefore?: Date
  expiresAfter?: Date

  page?: number
  pageSize?: number
}

export type InventoryMovementFilters = {
  productId?: number
  type?: 'IN' | 'OUT' | 'ADJUST'
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export type InventoryBatchDTO = {
  id: number
  productId: number
  productName: string
  unitPrecision: number
  supplierId: number | null
  batchCode: string | null
  expirationDate: string | null
  quantityInitial: number
  quantityAvailable: number
  unitCost: number
  receivedAt: string
  createdAt: string
}

export type InventoryMovementDTO = {
  id: number
  productId: number
  productName: string
  batchCode: string | null
  type: 'IN' | 'OUT' | 'ADJUST'
  quantity: number
  unitCost: number
  reason: string
  referenceType: string | null
  referenceId: number | null
  createdAt: string
}
