export const EMPTY_INVENTORY_ITEM = {
  productId: null,
  supplierId: null,
  batchCode: '',
  expirationDate: null,
  quantity: null,
  unitCost: null,
}

export const INVENTORY_ENTRY_DEFAULTS = {
  supplierId: null,
  items: [EMPTY_INVENTORY_ITEM],
}
