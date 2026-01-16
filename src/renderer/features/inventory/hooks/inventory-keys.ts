export const inventoryKeys = {
  all: ['inventory'] as const,

  stock: (productId: number) =>
    [...inventoryKeys.all, 'stock', productId] as const,

  batches: {
    all: () => [...inventoryKeys.all, 'batches'] as const,
    list: (filters?: InventoryBatchFilters) =>
      [...inventoryKeys.batches.all(), filters] as const,
  },

  movements: {
    all: () => [...inventoryKeys.all, 'movements'] as const,
    list: (filters?: InventoryMovementFilters) =>
      [...inventoryKeys.movements.all(), filters] as const,
  },
}
