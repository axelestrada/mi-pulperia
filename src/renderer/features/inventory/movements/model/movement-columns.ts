export type InventoryMovementColumnKey =
  | 'id'
  | 'productName'
  | 'batchCode'
  | 'type'
  | 'quantity'
  | 'unitCost'
  | 'reason'
  | 'createdAt'

export type MovementColumnDef<K extends string> = {
  name: string
  uid: K
  align?: 'start' | 'center' | 'end'
}

export const INVENTORY_MOVEMENT_COLUMNS: MovementColumnDef<InventoryMovementColumnKey>[] =
  [
    { name: 'ID', uid: 'id' },
    { name: 'MOTIVO', uid: 'reason' },
    { name: 'PRODUCTO', uid: 'productName' },
    { name: 'LOTE', uid: 'batchCode' },
    { name: 'CANTIDAD', uid: 'quantity' },
    { name: 'TIPO', uid: 'type' },
    { name: 'COSTO UNIT.', uid: 'unitCost' },
    { name: 'FECHA', uid: 'createdAt' },
  ]

