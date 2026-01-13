import { InsertInventoryBatch } from 'main/db/schema/inventory-batches'
import { InsertInventoryMovement } from '../../db/schema/inventory-movements'

export type CreateBatchDTO = Pick<
  InsertInventoryBatch,
  | 'productId'
  | 'supplierId'
  | 'batchCode'
  | 'expirationDate'
  | 'quantityInitial'
  | 'cost'
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
