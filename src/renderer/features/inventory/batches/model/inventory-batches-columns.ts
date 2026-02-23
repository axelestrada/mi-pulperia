export type InventoryBatchColumnKey =
  | 'id'
  | 'productName'
  | 'supplierId'
  | 'expirationDate'
  | 'quantityInitial'
  | 'quantityAvailable'
  | 'unitCost'
  | 'createdAt'

export type ColumnDef<K extends string> = {
  name: string
  uid: K
  align?: 'start' | 'center' | 'end'
}

export const INVENTORY_BATCH_COLUMNS: ColumnDef<InventoryBatchColumnKey>[] = [
  { name: 'LOTE', uid: 'id' },
  { name: 'PRODUCTO', uid: 'productName' },
  { name: 'PROVEEDOR', uid: 'supplierId' },
  { name: 'DISPONIBLE', uid: 'quantityAvailable' },
  { name: 'INICIAL', uid: 'quantityInitial' },
  { name: 'COSTO UNITARIO', uid: 'unitCost' },
  { name: 'FECHA DE VENCIMIENTO', uid: 'expirationDate' },
  { name: 'FECHA DE INGRESO', uid: 'createdAt' },
]
